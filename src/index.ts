import { Argv, Context, Logger } from "koishi";
import { optModules } from "./command";
import { Bind } from "./command/bind.subcmd";
import { PaimonConfig } from "./configs";
import { Paimon } from "./core";
import { Database } from "./database";
import '@koishijs/plugin-help'
import { Hoyo } from "./core/genshinapi/utils/Hoyo";

declare module 'koishi' {
    namespace Argv {
        interface Domain {
            UID: string
        }
    }
}

Argv.createDomain('UID', source => {
    if (isNaN(parseInt(source))) throw new Error(`"${source}"不是一个正确的uid`)
    return source
})

//#region plugin-paimon: config
export const name = 'paimon'
export interface Config extends PaimonConfig { }
export const Config = PaimonConfig
export const using = ['database', 'puppeteer']
//#endregion

export function apply(ctx: Context, config: Config) {
    const logger = ctx.logger('paimon')
    const database = new Database(ctx).create()
    const User = Database.user

    // #region command(paimon)
    ctx.command('paimon [uid:UID]', '派蒙，最好的伙伴！')
        .alias('ys', 'genshin')
        .option('memo', '-m 获取每日便笺内容')
        .shortcut('#派蒙', { options: { help: true } })
        .userFields(['authority'])
        .action(async ({ options, session }, uid) => {
            const USER = await User(session.uid)

            if (!uid) {
                uid = USER.activeUID.toString()
                if (!uid) {
                    await session.send('您还未绑定过uid！请私聊发送`paimon.bind 你的uid`以绑定')
                }
            }

            return JSON.stringify({ uid, options, session: session.user.authority })
        })
    // #endregion

    // #region command(paimon.bind)
    ctx.command('paimon.bind [uid:UID]', '绑定uid')
        .alias('paimon.b')
        .option('list', '-l 列出已绑定的uid列表')
        .option('user', '-u <user> 指定共享该uid的用户，格式为: "@xxx,@yyy"')
        .option('remove', '-r 移除这个uid')
        .option('default', '-d 将该uid设置为默认uid')
        .option('device', '重置该uid的设备以尝试解除验证码风控')
        .option('cookie', '-c <cookie> 绑定Cookie到Paimon', { hidden: session => !(session.subtype === 'private') })
        .userFields(['authority'])
        .shortcut('#uid列表', { options: { list: true } })
        .action(async ({ options, session }, uid) => {
            const USER = Database.user(session.uid, session.user.authority > config.master)
            const bindCookie = async (cookie: string, uid?: UID) => {
                if (USER.uid.length === 0 && !uid) {
                    await session.send('你还未绑定过uid！，请回复uid以绑定该cookie')
                    uid = await session.prompt(30 * 1000) as UID
                    if (uid) {
                        USER.setUID(uid as UID)
                    } else {
                        return '等待超时，你可以先发送`paimon.bind <uid>`来绑定uid'
                    }
                }
                USER.setCookie(cookie, uid)
                return `已绑定cookie到uid(${uid})上`
            }
            const formatUIDList = (uids: UID[], active: UID) => {
                return uids.map((uid, i) => {
                    if (uid === USER.activeUID)
                        return `${1}、${uid}`
                    else
                        return `${i + 2}、${uid}`
                })
            }
            const userUIDArray: UID[] = Object.keys(USER.uidObject()) as UID[]
            if (options.list) {
                return '目前已绑定的uid有\n' + formatUIDList(userUIDArray, USER.activeUID).join('\n')
            }
            if (uid) {
                let msg = ''
                let uidList = USER.uid
                if (!options) {
                    //已经绑定过
                    if (userUIDArray.includes(uid as UID)) {
                        await session.send('你已经绑定过这个uid了')
                    }
                    //仅绑定uid
                    uidList = await USER.setUID(uid as UID)
                    msg = userUIDArray.length === 0 ? `第一次绑定，已将uid(${uid})设置为默认uid` : `已绑定uid(${uid})！`
                } else if (options.remove) {
                    //移除这个uid
                    uidList = await USER.removeUID(uid as UID)
                    msg = `已取消uid(${uid})的绑定，`
                } else if (options.default) {
                    //设置这个uid为默认
                    USER.activeUID = uid as UID
                    msg = `已将默认uid更改为"${uid}"`
                } else if (options.device) {
                    //重置uid的设备信息
                    const dsalt = await USER.resetDSalt(uid as UID)
                    await session.send(`重置uid(${uid})的设备信息完成`)
                } else if (options.cookie && session.subtype === 'private') {
                    //私聊下的绑定cookie
                    return bindCookie(options.cookie, uid as UID)
                }
                return msg + '\n目前已绑定的uid有\n' + formatUIDList(Object.keys(uidList) as UID[], USER.activeUID).join('\n')
            } else {
                uid = USER.activeUID.toString()
                if (options.cookie && session.subtype === 'private') {
                    //私聊下的绑定cookie
                    return bindCookie(options.cookie)
                } else if (options.device) {
                    const dsalt = await USER.resetDSalt(uid as UID)
                    await session.send(`重置默认uid(${uid})的设备信息完成`)
                }
            }
            //结束USER操作，更新到数据库
            USER.close()
        })
    // #endregion

    // #region command(paimon.sign)
    ctx.command('paimon.sign [uid:UID]', '进行米游社每日签到')
        .alias('paimon.s')
        .option('forever', '-f 启动定时执行签到')
        .option('disposable', '-d 关闭定时执行并立马签到')
        .option('info', '显示签到信息')
        .userFields(['authority'])
        .action(async ({ options, session }, uid) => {
            const USER = Database.user(session.uid, session.user.authority > config.master)
            if (!uid) {
                uid = USER.activeUID as string
                if (!uid) {
                    await session.send('您还未绑定过uid！请私聊发送`paimon.bind --uid 你的uid`以绑定')
                    USER.close()
                    return
                }
            }
            const cookie = await USER.cookieByUID(uid as UID)
            if (!cookie) {
                await session.send('您的uid还未绑定过cookie！请私聊发送`paimon.bind ' + uid + ' --cookie 你的cookie`以绑定')
                USER.close()
                    return
            }

            try {
                const api = new Paimon.API(uid, cookie)
                const sign: SignInfo = await api.bbsSign()
                if (sign.is_sign) {
                    const bonus: SignHomeAward = await api.getSignBonus(sign.today)
                    await session.send(`签到成功\n签到奖励：${bonus.name}*${bonus.cnt}\n漏签${sign.sign_cnt_missed}天`)
                }
                // return JSON.stringify({ uid, api })
            } catch (error) {
                logger.info(error)
                const err = await error as FetchError
                if(err.message === 'OK'){
                    await session.send('签到可能成功，但是无法获取奖励信息，下列是接口返回的原始信息：\n' + JSON.stringify(err.raw))
                }else if (err.code === -100) {
                    await session.send('绑定的Cookie已失效!请私聊发送`paimon.bind ' + uid + ' --cookie 你的cookie`以重新绑定')
                } else {
                    logger.warn('fetch error:', err.raw)
                    await session.send('签到失败：' + err.message)
                }
            }
            //结束user操作
            USER.close()
        })
    // #endregion

    // #region command(paimon.sign)
    ctx.command('paimon.character [uid:UID]', '获取展示卡中角色详情（练度、圣遗物）')
        .alias('paimon.c', 'paimon.juese')
        .option('list', '-l 已保存的角色练度信息')
        .option('name', '-n 只查询某个角色')
        .shortcut('#角色面板')
        .action(({ options, session }, uid) => {
            session.send(JSON.stringify({ uid, options }))
        })
    // #endregion
}