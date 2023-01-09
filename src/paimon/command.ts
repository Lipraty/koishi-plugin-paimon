import { Argv, Command, Context, h, Session } from "koishi"
import Paimon from ".."
import { uidStringifyMap } from "../utils/Uid.util"
import { UUID } from "../utils/UUID.util"
import { isEmpty } from "../utils/Object.util"
import { PaimonDatabase, PaimonUid, PaimonUidObject } from "./database"

declare module 'koishi' {
    namespace Argv {
        interface Domain {
            UID: string
        }
    }
}

Argv.createDomain('UID', source => {
    if (/[0-9]/g.test(source))
        return source
    else
        throw new Error(`"${source}"不是一个正确的uid`)
})

let __uidTemp: PaimonUid[] = []

export default class PaimonCommand {
    public static using = ['database', 'paimon']
    private database: PaimonDatabase
    private uids: PaimonUid[]
    private master: boolean = false
    constructor(private ctx: Context, private config: Paimon.Config) {
        const db = this.database = new PaimonDatabase(ctx)
        const logger = ctx.logger('paimon')
        this.command('paimon', '派蒙！最好的伙伴！')
            .alias('genshin', 'ys', 'gs', 'o')
            .userFields(['active_uid', 'authority', 'id'])
            .option('memo', '-m 获取每日便笺内容')
            .option('sign', '-s 进行米游社每日签到')
            .option('list', '-l 列出已绑定的uid列表')
            .before(async ({ options, session }, uid) => {
                if (!isEmpty(options)) return await this.before(uid, session)
            })
            .action(async ({ options, session }, uid) => {
                uid ??= session.user.active_uid
                if (options.memo) {
                    return h.image(await ctx.paimon.render('memo', 'buffer')(), 'image/png')
                }

                if (options.sign) {
                    return await session.execute('paimon.sign')
                }

                if (options.list) {
                    return await session.execute('paimon.uid --list')
                }
            })

        this.command('paimon.uid', '进行uid相关操作')
            .userFields(['active_uid', 'id', 'uuid'])
            .option('list', '-l 列出已绑定的uid')
            .option('bind', '-b 绑定这个uid')
            .option('cookie', '-c [cookie] 为这个uid绑定一个cookie', { hidden: session => session.subtype !== 'private' })
            .option('default', '-d 设置这个uid为默认uid')
            .option('remove', '-r 移除这个uid（如果使用"-ru @user"则视为移除这个共享用户）')
            .option('user', '-u [user:user] @用户以共享该uid', { hidden: true })
            .option('device', '重置该uid的虚拟设备信息以尝试解除验证码风控')
            .action(async ({ options, session, next }, uid) => {
                const uuid = db.createUUID(session.user.id.toString())
                __uidTemp = await db.getUid(uuid)
                let __flagNoneUid: boolean = __uidTemp.length <= 0

                if (uid && (await this.incudeUid(uid as UID)) && __uidTemp.findIndex(u => u.uid === uid as UID) < 0) {
                    return '这个 uid 已经被其他人绑定过了'
                } else if (__flagNoneUid && !options.bind) {
                    await session.send(uid ? '这个 uid 还没有被绑定过，回复句号以绑定这个 uid' : '你还没有绑定过 uid ，请先回复一个 uid 进行绑定')
                    if (uid) {
                        const waitingDot = this.vertifyPropmt(await session.prompt(10 * 1000), ['.', '。'])
                        if (waitingDot === 1) {
                            return '请回复句号'
                        } else if (waitingDot === 0) {
                            return '等待超时。'
                        }
                    } else {
                        const waitingUid = this.vertifyPropmt(await session.prompt(10 * 1000), [], uid => PaimonUid.vertify(uid))
                        if (waitingUid === 1) {
                            return '这不是一个正确的 uid'
                        } else if (waitingUid === 0) {
                            return '等待超时。'
                        }
                        uid = waitingUid
                    }
                    options.bind = true
                } else if (!uid && options.bind) {
                    await session.send('未指定要绑定的 uid ，请回复一个 uid 以绑定')
                    const waitingUid = this.vertifyPropmt(await session.prompt(10 * 1000), [], uid => PaimonUid.vertify(uid))
                    if (waitingUid === 1) {
                        return '这不是一个正确的 uid'
                    } else if (waitingUid === 0) {
                        return '等待超时。'
                    }
                    uid = waitingUid
                } else {
                    uid ??= session.user.active_uid
                }

                if (options.list) {
                    return '当前已绑定的 uid 有\n' + uidStringifyMap(session.user.active_uid as UID, __uidTemp, (u, i) => {
                        return `${i + 1}. ${u}${i === 0 ? '（默认）' : ''}`
                    }).join('\n')
                }

                let sendMsg = '-'
                // let uidTemp: PaimonUid = options.bind ? {
                //     uuid,
                //     uid,
                //     cookie: undefined,
                //     dsalt: UUID.randomUUID().unsign(),
                //     freeze: false
                // } : Object.assign({ uid, uuid }, objectify(uidList)[uid])
                let _objUidTemp: PaimonUidObject = PaimonUid.objectify(__uidTemp)

                if (options.bind) {
                    if (__flagNoneUid) {
                        session.user.active_uid = uid
                        //第一次绑定，创建一个PaimonUid对象
                        _objUidTemp[uid] = {
                            uuid,
                            dsalt: UUID.randomUUID().unsign(),
                            cookie: options.cookie,
                            freeze: false
                        }
                    }
                    sendMsg = `已绑定 uid(${uid})${options.cookie ? '和 cookie' : ''}${__flagNoneUid ? '，由于是第一次绑定，该 uid 已被自动设置为默认 uid' : ''}。`
                } else if (options.remove) {
                    if (uid === session.user.active_uid) {
                        await session.send(__uidTemp.length === 1 ? '只绑定了这一个 uid' : '这是一个默认 uid' + '，确定移除？（回复句号以确认移除）')
                        const dot = await session.prompt(10 * 1000)
                        if (dot === '.' || dot === '。') {
                            session.user.active_uid = __uidTemp.length === 1 ? undefined : __uidTemp.find(u => u.uid !== uid).uid.toString()
                        } else {
                            return '等待超时。'
                        }
                    }
                    delete _objUidTemp[uid]
                    sendMsg = `已移除 uid(${uid})`
                } else if (options.device) {
                    _objUidTemp[uid].dsalt = UUID.randomUUID().unsign()
                    sendMsg = `已重置 uid(${uid}) 的虚拟设备信息。`
                } else if (options.default) {
                    if (uid === session.user.active_uid) {
                        return '已经是默认 uid 了。'
                    }
                    session.user.active_uid = uid
                    sendMsg = '已设置默认 uid 为' + uid
                }

                if (options.cookie && session.subtype === 'private') {
                    let ck: string
                    if (typeof options.cookie === 'string') {
                        ck = options.cookie
                    } else {
                        sendMsg = '想为该 uid 绑定 cookie ？请回复你的 cookie 以绑定'
                        ck = await session.prompt(30 * 1000)
                        if (!ck)
                            return '等待超时，已取消操作。'
                    }
                    _objUidTemp[uid].cookie = ck
                    if (!options.bind) sendMsg = `已绑定cookie到uid(${uid})。`
                } else if (options.cookie && session.subtype !== 'private') {
                    return '您应该私聊发送 cookie ，您的 cookie 可能已经泄露 \n请立即访问 https://www.miyoushe.com 或 https://user.mihoyo.com 退出登录来刷新 cookie'
                }

                await session.send(sendMsg)
                //将object变更更新到Array
                __uidTemp = PaimonUid.parse(_objUidTemp)
                __flagNoneUid = false
                return await next()
            })
            .use(this.useLast(this.ctx))

        this.command('paimon.sign', '进行米游社每日签到', true)
            .alias('paimon.s')
            .userFields(['active_uid'])
            // .option('autosession', '-- [param]', { hidden: true })
            .action(async ({ session }, uid) => {
                uid ??= session.user.active_uid
                const cookie = PaimonUid.objectify(this.uids)[uid as UID].cookie
                if (!cookie) {
                    return '您的 uid 还未绑定过 cookie ！请私聊发送 `paimon.bind ' + uid + ' --cookie 你的cookie`以绑定'
                }

                const api = ctx.paimon.login(uid as UID, cookie)

                try {
                    const sign: SignInfo = await api.bbsSign()
                    if (sign.is_sign) {
                        const award: SignHomeAward = await api.bbsSignAward(sign)
                        await session.send(`签到成功\n签到奖励：${award.name}*${award.cnt}\n漏签${sign.sign_cnt_missed}天`)
                    }
                } catch (error) {
                    const err = await error as FetchError
                    if (err.message === 'OK') {
                        await session.send('签到可能成功，但是无法获取奖励信息')
                        await session.send(`<figure><message userId="${session.selfId}">下列为接口返回的原始信息</message><message userId="${session.selfId}">${JSON.stringify(err.raw)}</message></figure>`)
                    } else if (err.code === -100) {
                        await session.send('绑定的 cookie 已失效!请私聊发送`paimon.uid ' + uid + ' --cookie \'你的cookie\'`以重新绑定')
                    } else if (err.code === -5003) {
                        await session.send('你已经签到过了')
                    } else if (err.code === -375) {
                        await session.send('签到未成功，需要验证码，可以发送 "paimon.uid --device" 重置设备信息后再试')
                    } else {
                        logger.warn('fetch error:', err.raw)
                        await session.send('签到失败：' + err.message)
                    }
                }
            })

        this.command('paimon.character', '获取角色展柜', true)
            .alias('paimon.c')
            .option('update', '-u 更新展柜')
            .option('name', '-- [name: string] 获取某个角色的详细信息')
            .action(async () => { })
            .use(this.useLast(this.ctx))

        this.command('paimon.abyss', '获取深境螺旋信息', true)
            .action(async () => { })

        ctx.command('paimon.today', '获取当天材料信息')
            .action(async () => { })

        ctx.command('paimon.search', '查询(角色、武器、圣遗物等)的资料信息')
            .action(async () => { })
    }

    private command(name: string, desc: string, before = false) {
        if (before)
            return this.ctx.command(`${name} [uid:UID]`, desc).before(async ({ session }, uid) => await this.before(uid, session))
        else
            return this.ctx.command(`${name} [uid:UID]`, desc)
    }

    private async incudeUid(uid: UID) {
        const _t = await this.ctx.database.get('paimon_uid', { uid })
        return _t.length > 0
    }

    /**
     * 
     * @param propmt 
     * @param bindings 
     * @param handleFn 
     * @returns 1: invalid propmt | 0: timeout
     */
    private vertifyPropmt(propmt: string | undefined, bindings: string[], handleFn?: (propmt: string) => boolean) {
        if (propmt) {
            return (bindings.length === 0 && !handleFn) || (bindings.length > 0 && !bindings.includes(propmt)) || (handleFn && !handleFn(propmt)) ? 1 : propmt
        } else {
            return 0
        }
    }

    private async before(uid, session: Session) {
        const user = await session.observeUser(['active_uid', 'authority', 'characet_id', 'id', 'uuid'])
        const uuid = user.uuid ?? (user.uuid = this.database.createUUID(user.id.toString()))

        this.master = user.authority >= this.config.master
        this.uids = await this.ctx.database.get('paimon_uid', { uuid })

        if (uid && this.uids.findIndex(u => u.uid === uid as UID) < 0 && !this.incudeUid(uid as UID)) {
            return '这不是你的 uid'
        } else if (this.uids.length === 0) {
            await session.send(uid ? '这个 uid 还没有绑定过，回复句号以绑定这个 uid' : '你还没有绑定过 uid ，回复 uid 以绑定第一个 uid')
            const promptMsg = await session.prompt(10 * 1000)
            if (promptMsg === '.' || promptMsg === '。') {
                return session.execute(`paimon.uid ${uid} --bind`)
            } else if (PaimonUid.vertify(promptMsg)) {
                return session.execute(`paimon.uid ${promptMsg} --bind`)
            } else {
                return '这不是句号或 uid ，或等待超时'
            }
        }


    }

    private useLast(ctx: Context) {
        const _db = ctx.database
        return (cmd: Command) => cmd.action(async ({ next }) => {
            await next()
            console.log('last: update database.')
            __uidTemp = []
            return await _db.upsert('paimon_uid', __uidTemp)
        })
    }
}