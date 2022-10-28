import { Argv, Context } from "koishi";
import { PaimonConfig } from "./configs";
import { Paimon } from "./core";
import { Database, UserData, UserUID } from "./database";
import { UUID } from "./utils/UUID.util";
import '@koishijs/plugin-help';

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

//#region plugin-paimon: config
export const name = 'paimon'
export interface Config extends PaimonConfig { }
export const Config = PaimonConfig
export const using = ['database', 'puppeteer']
//#endregion

export function apply(ctx: Context, config: Config) {
    const logger = ctx.logger(name)
    const DB = new Database(ctx)
    const database = DB.create()

    const vertifyUID = (uid: UID | string) => /[0-9]/g.test(uid.toString())
    const vertifyConfirm = (confirm: string) => /^[Yy]([EeSs]{2}?)|\u662f$/.test(confirm)
    const formatUIDList = (uids: UID[], active: UID) =>
        [`1、${active}（默认）`]
            .concat(
                uids.map(uid => { if (uid !== active) return uid })
                    .map((uid, i) => { if (uid) return `${i + 2}、${uid}` })
            )
    const uuid = (userId: string) => UUID.snameUUIDFromBytes('koishi:' + userId).unsign()
    const createUID = (cookie?: string, freeze: boolean = false): UserUID => {
        return { dsalt: UUID.randomUUID().unsign(), cookie, freeze }
    }
    const beforeInit = async (session) => {
        userData = await DB.user(session.user.id)
        userMaster = session.user.authority > config.master
        userFirst = Object.keys(userData.uid).length === 0
    }
    const firstBind = async (session) => {
        if (userFirst) {
            await session.send('你还未绑定过uid！，请回复uid以作为默认uid绑定')
            const sendUID = await session.prompt(20 * 1000) as UID
            if (sendUID && !vertifyUID(sendUID)) {
                return `输入的内容有误，"${sendUID}"不是一个正确的uid`
            } else if (!sendUID) {
                return '等待超时，你可以发送`paimon.bind 你的uid`来绑定uid'
            }
            return session.execute(`paimon.bind ${sendUID}`)
        }
    }

    let userData: UserData
    let userMaster: boolean = false
    let userFirst: boolean = true

    const userIncludesUID = (uid: UID | string) => Object.keys(userData.uid).includes(uid.toString())
    const pushToDB = async (userId: string) => {
        logger.info('end cycle, sync user modifications to the database')
        //update user table
        await database.set('user', { uuid: uuid(userId) }, { active_uid: userData.active_uid.toString(), characet_id: userData.characet_id })
        //update uid table
        await database.upsert('paimon_uid', Database.parse(uuid(userId), userData.uid))
        //clear data
        userData = undefined
        userMaster = false
        userFirst = true
    }
    // #region command(paimon)
    const cmd = ctx.command(`${name} [uid:UID]`, '派蒙，最好的伙伴！').alias('ys', 'genshin')
        .shortcut('#派蒙', { options: { help: true } })
        .userFields(['authority', 'id'])
        .before(async ({ options, session }) => {
            await beforeInit(session)
            if (Object.keys(options).length > 0)
                await firstBind(session)
        })
        .option('memo', '-m 获取每日便笺内容')
        .action(async ({ options, session }, uid) => {
            uid ??= userData.active_uid.toString()
            if (!uid) {
                return '你还未绑定过uid！请发送`paimon.bind 你的uid`以绑定'
            }
        })
    // #endregion

    // #region command(paimon.bind)
    cmd.subcommand('.bind [uid:UID]', '绑定uid或对绑定的uid进行操作')
        .alias(`${name}.b`)
        .shortcut('#uid列表', { options: { list: true } })
        .userFields(['authority', 'id'])
        .before(async ({ options, session }) => {
            await beforeInit(session)
            if (Object.keys(options).length > 0)
                await firstBind(session)
        })
        .action(async ({ options, session, next }, uid) => {
            userData = await DB.user(session.user.id)
            userMaster = session.user.authority > config.master
            userFirst = Object.keys(userData.uid).length === 0

            console.log('.bind:', userData)
            if (uid && await Database.includeUID(uid as UID) && Object.keys(options).length === 0) {
                return '这个uid已经被绑定过了'
            } else if (uid && Object.keys(options).length === 0) {
                userData.uid[uid] = createUID()
                userData.active_uid = uid as UID
                await session.send(`已绑定uid(${uid})`)
            } else if (uid && !userIncludesUID(uid) && !userMaster) {
                return '这不是你的uid，请检查'
            }
            return next()
        })
        .option('list', '-l 列出已绑定的uid列表')
        .action(async ({ options, next }) => {
            if (options.list && !userFirst) {
                return '已绑定的uid有\n' + formatUIDList(Object.keys(userData.uid) as UID[], userData.active_uid).join('\n')
            } else {
                return next()
            }
        })
        .option('user', '-u <user> @某个用户以共享这个uid')
        .action(async ({ options, session, next }, uid) => {
            return next()
        })
        .option('remove', '-r 移除这个uid')
        .action(async ({ options, session, next }, uid) => {
            if (options.remove === true) {
                if (!uid) {
                    await session.send('你未指定uid，请回复下列uid之一以取消绑定\n' + formatUIDList(Object.keys(userData.uid) as UID[], userData.active_uid).join('\n'))
                    const sendUID = await session.prompt(30 * 1000)
                    if (sendUID && !vertifyUID(sendUID)) {
                        return '这不是一个正确的uid'
                    }
                    uid = sendUID
                }
                if (userIncludesUID(uid)) {
                    const ownUid = Object.keys(userData.uid).length === 1
                    let confirm = false
                    if (ownUid) {
                        await session.send('当前只绑定了这一个uid，确定移除？（请回复y/n）')
                        confirm = true
                    } else if (uid === userData.active_uid) {
                        await session.send('这是一个默认uid，确定移除？（请回复y/n）')
                        confirm = true
                    }
                    if (confirm) {
                        const sendConfirm = await session.prompt(10 * 1000)
                        if (sendConfirm && sendConfirm === 'y') {
                            delete userData.uid[uid]
                            await database.remove('paimon_uid', { uid: uid as UID })
                            if (ownUid) {
                                userData.active_uid = null
                                await session.send('已取消绑定，如果需要使用派蒙，请先发送`paimon.bind <uid>来绑定uid`')
                            } else {
                                userData.active_uid = Object.keys(userData.uid)[0] as UID
                                await session.send(`已取消绑定，默认uid更新为${userData.active_uid}`)
                            }
                        } else if (sendConfirm && sendConfirm === 'n') {
                            return '已取消操作'
                        } else {
                            return '等待超时'
                        }
                    }
                } else {
                    await session.send('这不是你绑定的uid，无法执行移除操作')
                }
            }
            return next()
        })
        .option('default', '-d 将该uid设置为默认uid')
        .action(async ({ options, session, next }, uid) => {
            if (options.default === true && uid && userIncludesUID(uid)) {
                userData.active_uid = uid as UID
                await session.send('已设置默认uid: ' + userData.active_uid)
            }
            return next()
        })
        .option('device', '重置该uid的设备以尝试解除验证码风控')
        .action(async ({ options, session, next }, uid) => {
            uid ??= userData.active_uid.toString()
            if (options.device === true) {
                userData.uid[uid].dsalt = UUID.randomUUID().unsign()
                await session.send(`重置${uid ? 'uid' : '默认uid'}(${uid})的设备信息完成`)
            }
            return next()
        })
        .option('cookie', '-c <cookie> 绑定Cookie到Paimon', { hidden: session => !(session.subtype === 'private') })
        .action(async ({ options, session, next }, uid) => {
            if (options.cookie && session.subtype === 'private') {
                uid ??= userData.active_uid.toString()
                userData.uid[uid].cookie = options.cookie
                await session.send(`cookie已绑定到uid(${uid})下`)
            }
            return next()
        })
        .action(async ({ session }) => {
            //End of cycle, push user modifications to database
            return await pushToDB(session.user.id)
        })
    // #endregion

    // #region command(paimon.sign)
    cmd.subcommand('.sign [uid:UID]', '进行米游社每日签到')
        .alias(`${name}.s`)
        .shortcut('#签到')
        .userFields(['authority', 'id'])
        .before(async ({ options, session }) => {
            await beforeInit(session)
            if (Object.keys(options).length > 0)
                await firstBind(session)
        })
        .option('auto', '-a 开启定时执行签到')
        .option('unauto', '-u 关闭定时执行签到')
        .action(async ({ options, session, next }, uid) => {
            uid ??= userData.active_uid.toString()
            if (options.auto && options.unauto) {
                await session.send('请正确选择是否启用自动签到')
            } else if (options.auto) {
                await session.send(`已将"#${uid}签到"加入自动任务`)
            } else if (options.unauto) {
                await session.send(`自动任务"#${uid}签到"已移除`)
            }
            return next()
        })
        .action(async ({ options, session }, uid) => {
            uid ??= userData.active_uid.toString()
            const cookie = userData.uid[uid].cookie
            if (!cookie) {
                return '您的uid还未绑定过cookie！请私聊发送`paimon.bind ' + uid + ' --cookie 你的cookie`以绑定'
            }

            try {
                const api = new Paimon.API(uid, cookie)
                const sign: SignInfo = await api.bbsSign()
                if (sign.is_sign) {
                    const bonus: SignHomeAward = await api.getSignBonus(sign.today)
                    await session.send(`签到成功\n签到奖励：${bonus.name}*${bonus.cnt}\n漏签${sign.sign_cnt_missed}天`)
                } else {

                }
                // return JSON.stringify({ uid, api })
            } catch (error) {
                logger.info(error)
                const err = await error as FetchError
                if (err.message === 'OK') {
                    await session.send('签到可能成功，但是无法获取奖励信息')
                    await session.send(`<figure nickname="name"><message userId="${session.selfId}">下列为接口返回的原始信息</message><message userId="${session.selfId}">${JSON.stringify(err.raw)}</message></figure>`)
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
    // #endregion

    // #region command(paimon.sign)
    cmd.subcommand('.character [uid:UID]', '获取展示卡中角色详情（练度、圣遗物）')
        .alias(`${name}.c`, `${name}.juese`)
        .shortcut('#角色面板')
        .before(async ({ options, session }) => {
            await beforeInit(session)
            if (Object.keys(options).length > 0)
                await firstBind(session)
        })
        .option('list', '-l 已保存的角色练度信息')
        .action(async ({ options, session, next }, uid) => {

        })
        .option('name', '-n 只查询某个角色')
        .action(async ({ options, session, next }, uid) => {

        })
    // #endregion
}