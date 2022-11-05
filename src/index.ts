import { Argv, Context, observe, Service, Session, segment, Command } from "koishi"
import '@koishijs/plugin-help'
import { PaimonConfig, PaimonDatabase, PaimonUid } from "./paimon"
import { UUID } from "./utils/UUID.util"
import { objectify, uidStringifyMap, vertifyUid } from "./utils/Uid.util"
import { GenshinAPI } from "./core/genshinapi"

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

class Paimon extends Service {
    private uids: PaimonUid[]
    private master: boolean = false
    private genshinAPI: GenshinAPI
    private _database: PaimonDatabase

    constructor(ctx: Context, public config: Paimon.Config) {
        super(ctx, 'paimon', true)
        const db = this._database = new PaimonDatabase(ctx)
        const logger = ctx.logger('paimon')

        //#region install commands
        this.command('paimon', '派蒙！最好的伙伴！')
            .alias('genshin', 'ys', 'gs', 'o')
            .userFields(['active_uid', 'authority', 'id'])
            .option('memo', '-m 获取每日便笺内容')
            .option('sign', '-s 进行米游社每日签到')
            .option('list', '-l 列出已绑定的uid列表')
            .before(async ({ options, session }, uid) => {
                if (!Object.$isEmpty(options)) return await this.before(uid, session)
            })
            .action(async ({ options, session }, uid) => {
                uid ??= session.user.active_uid
                if (options.memo) {
                    return segment.image(await this.useImage('memo'))
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
            .action(async ({ options, session }, uid) => {
                const uuid = db.createUUID(session.user.id)
                let uidList: PaimonUid[] = await db.getUid(uuid)
                let __flag_frist: boolean = false

                if (uid && uidList.findIndex(u => u.uid === uid as UID) < 0 && !this.incudeUid(uid as UID)) {
                    return '这不是你的uid'
                } else if (uidList.length === 0) {
                    await session.send(uid ? '这个uid还没有绑定过，回复句号以绑定这个uid' : '你还没有绑定过uid，回复uid以绑定第一个uid')
                    const promptMsg = await session.prompt(10 * 1000)
                    if (promptMsg === '.' || promptMsg === '。') {
                        options.bind = true
                    } else if (vertifyUid(promptMsg)) {
                        __flag_frist = options.bind = true
                        uid = session.user.active_uid = promptMsg
                    } else {
                        return '等待超时。'
                    }
                } else {
                    uid ??= session.user.active_uid
                }

                if (options.list) {
                    return '当前已绑定的uid有\n' + uidStringifyMap(session.user.active_uid as UID, uidList, (u, i) => {
                        return `${i}. ${u}${i === 0 ? '（默认）' : ''}`
                    }).join('\n')
                }

                let sendMsg = ''
                let uidTemp: PaimonUid = options.bind ? {
                    uuid,
                    uid,
                    cookie: undefined,
                    dsalt: UUID.randomUUID().unsign(),
                    freeze: false
                } : Object.assign({ uid, uuid }, objectify(this.uids)[uid])

                if (options.bind) {
                    sendMsg = `已绑定uid(${uid})` + options.cookie ? '和Cookie' : '' + __flag_frist ? '，由于是第一次绑定，该uid已被自动设置为默认uid' : '' + '。'
                } else if (options.remove) {
                    if (uid === session.user.active_uid) {
                        await session.send(uidList.length === 1 ? '只绑定了这一个uid' : '这是一个默认uid' + '，确定移除？（回复句号以确认移除）')
                        const dot = await session.prompt(10 * 1000)
                        if (dot === '.' || dot === '。') {
                            session.user.active_uid = uidList.length === 1 ? undefined : uidList.find(u => u.uid !== uid).uid.toString()
                        } else {
                            return '等待超时。'
                        }
                    }
                    const _i = uidList.findIndex(u => u.uid === uid)
                    //delete array
                    uidList.splice(_i, 1)
                    sendMsg = `已移除uid(${uid})。`
                } else if (options.device) {
                    uidTemp['dsalt'] = UUID.randomUUID().unsign()
                    sendMsg = `已重置uid(${uid})的虚拟设备信息。`
                } else if (options.default) {
                    if (uid === session.user.active_uid) {
                        return '已经是默认uid了。'
                    }
                    session.user.active_uid = uid
                    sendMsg = '已设置默认uid为' + uid
                }

                if (options.cookie && session.subtype === 'private') {
                    let ck: string
                    if (typeof options.cookie === 'string') {
                        ck = options.cookie
                    } else {
                        sendMsg = '想为该uid绑定Cookie？请回复Cookie以绑定'
                        ck = await session.prompt(30 * 1000)
                        if (!ck)
                            return '等待超时，已取消操作。'
                    }
                    uidTemp['cookie'] = ck
                    if (!options.bind) sendMsg = `已绑定Cookie到uid(${uid})。`
                }

                await session.send(sendMsg)
                uidList.push(uidTemp)
                __flag_frist = false
            })
            .use(this.useLast)

        this.command('paimon.sign', '进行米游社每日签到', true)
            .alias('paimon.s')
            .userFields(['active_uid'])
            // .option('autosession', '-- [param]', { hidden: true })
            .action(async ({ session }, uid) => {
                uid ??= session.user.active_uid
                const cookie = this.uids[uid as UID].cookie
                if (!cookie) {
                    return '您的uid还未绑定过cookie！请私聊发送`paimon.bind ' + uid + ' --cookie 你的cookie`以绑定'
                }

                try {
                    const sign: SignInfo = await this.bbsSign(uid as UID, cookie)
                    if (sign.is_sign) {
                        const award: SignHomeAward = await this.bbsSignAward(uid as UID, sign)
                        await session.send(`签到成功\n签到奖励：${award.name}*${award.cnt}\n漏签${sign.sign_cnt_missed}天`)
                    }
                } catch (error) {
                    const err = await error as FetchError
                    if (err.message === 'OK') {
                        await session.send('签到可能成功，但是无法获取奖励信息')
                        await session.send(`<figure><message userId="${session.selfId}">下列为接口返回的原始信息</message><message userId="${session.selfId}">${JSON.stringify(err.raw)}</message></figure>`)
                    } else if (err.code === -100) {
                        await session.send('绑定的Cookie已失效!请私聊发送`paimon.bind ' + uid + ' --cookie 你的cookie`以重新绑定')
                    } else if (err.code === -5003) {
                        await session.send('你已经签到过了')
                    } else if (err.code === -375) {
                        await session.send('签到未成功，需要验证码，可以发送 "paimon.bind --device" 重置设备信息后再试')
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
            .use(this.useLast)

        this.command('paimon.abyss', '获取深境螺旋信息', true)
            .action(async () => { })

        ctx.command('paimon.today', '获取当天材料信息')
            .action(async () => { })

        ctx.command('paimon.search', '查询(角色、武器、圣遗物等)的资料信息')
            .action(async () => { })

        //#endregion

    }

    //#region paimon service
    $(uid: UID) {
        this.genshinAPI = new GenshinAPI(uid.toString())
        return this
    }

    /**
     * 执行米游社每日签到
     * @param uid 游戏uid
     * @param onlyInfo 只获取当天信息，不进行签到
     */
    async bbsSign(uid: UID, cookie: string, onlyInfo: boolean = false): Promise<SignInfo> {
        const params = { act_id: this.genshinAPI.hoyoKit.act_id, region: this.genshinAPI.serverType, uid: uid as string }
        if (!onlyInfo) {
            const doSign = await this.genshinAPI.fetchAPI('bbsSign', this.genshinAPI.hoyoKit.signHeader(cookie), params)
            if (doSign.retcode !== 0 || doSign.data?.risk_code === 375) {
                throw {
                    code: doSign.data?.risk_code === 375 ? -375 : doSign.retcode,
                    message: doSign.data?.risk_code === 375 ? '需要验证码' : doSign.message,
                    raw: doSign
                }
            }
        }
        const checkSign = await this.genshinAPI.fetchAPI('bbsSignInfo', this.genshinAPI.hoyoKit.signHeader(cookie), params)
        if (checkSign.retcode === 0) {
            return checkSign.data
        } else {
            throw {
                code: checkSign.data?.risk_code === 375 ? -375 : checkSign.retcode,
                message: checkSign.data?.risk_code === 375 ? '需要验证码' : checkSign.message,
                raw: checkSign
            }
        }
    }

    /**
     * 得到当天具体奖励
     * @param uid 
     * @param info 
     */
    async bbsSignAward(uid: UID, info: SignInfo): Promise<SignHomeAward> {
        return
    }

    async memo(uid: UID) {

    }

    async abyss(uid: UID) {

    }

    /**
     * 导入某个api，并将结果渲染为图片
     * @param def 
     * @param x 图片宽度
     * @param y 图片高度
     */
    async useImage<K extends keyof Paimon>(def: K, x?: number, y?: number): Promise<string | Buffer | ArrayBuffer> {
        const api = this[def]
        const desktopURL = this.config.render
        return
    }
    //#endregion

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

    private async before(uid, session: Session) {
        const user = await session.observeUser(['active_uid', 'authority', 'characet_id', 'id', 'uuid'])
        const uuid = this._database.createUUID(user.id)
        const uidList: PaimonUid[] = await this.ctx.database.get('paimon_uid', { uuid })

        if (uid && uidList.findIndex(u => u.uid === uid as UID) < 0 && !this.incudeUid(uid as UID)) {
            return '这不是你的uid'
        } else if (uidList.length === 0) {
            await session.send(uid ? '这个uid还没有绑定过，回复句号以绑定这个uid' : '你还没有绑定过uid，回复uid以绑定第一个uid')
            const promptMsg = await session.prompt(10 * 1000)
            if (promptMsg === '.' || promptMsg === '。') {
                return session.execute(`paimon.uid ${uid} --bind`)
            } else if (vertifyUid(promptMsg)) {
                return session.execute(`paimon.uid ${promptMsg} --bind`)
            } else {
                return '等待超时。'
            }
        }

        this.master = user.authority >= this.config.master
        this.uids = uidList
    }

    private useLast(cmd: Command) {
        return cmd.action(async ({ next }) => {
            await this.ctx.database.upsert('paimon_uid', this.uids, 'uid')
            return await next()
        })
    }
}

namespace Paimon {
    export interface Config extends PaimonConfig { }
    export const Config = PaimonConfig
    export const using = ['database', 'puppeteer']
}

export default Paimon