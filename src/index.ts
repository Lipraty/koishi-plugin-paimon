import { Argv, Context, segment } from "koishi";
import { PaimonConfig } from "./configs";
import { Paimon } from "./core";
import { Database } from "./database";
import '@koishijs/plugin-help'

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
    const DB = new Database(ctx)
    const database = DB.create()
    // #region command(paimon)
    ctx.command('paimon [uid:UID]', '派蒙，最好的伙伴！')
        .alias('ys', 'genshin')
        .option('memo', '-m 获取每日便笺内容')
        .shortcut('#派蒙', { options: { help: true } })
        .userFields(['authority'])
        .action(async ({ options, session }, uid) => {
            const USER = await DB.user(session.uid, session.user.authority > config.master)

            if (!uid) {
                uid = USER.activeUID.toString()
                if (!uid) {
                    await session.send('您还未绑定过uid！请发送`paimon.bind 你的uid`以绑定')
                }
            }

            return JSON.stringify({ uid, options, session: session.user.authority })
        })
    // #endregion

    // #region command(paimon.bind)
    ctx.command('paimon.bind [uid:UID]', '绑定uid或对绑定的uid进行操作')
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
            const USER = await DB.user(session.uid, session.user.authority > config.master)

            if (Object.keys(USER.uid).length === 0 && !uid) {
                await session.send('你还未绑定过uid！，请回复uid以作为默认uid绑定')
                const sendUID = await session.prompt(30 * 1000) as UID
                if (sendUID) {
                    if (!/[0-9]/g.test(sendUID as string)) {
                        return `输入的内容有误，"${sendUID}"不是一个正确的uid`
                    } else {
                        await USER.setUID(sendUID as UID).push()
                        session.send(`已绑定uid(${sendUID})，并将该uid设置为默认uid`)
                        console.log(USER.uid)
                        return
                    }
                } else {
                    return '等待超时，你可以发送`paimon.bind <uid>`重新绑定uid'
                }
            }
            const formatUIDList = (uids: UID[], active: UID) => {
                return uids.map((uid, i) => {
                    if (uid === USER.activeUID)
                        return `${1}、${uid}（默认）`
                    else
                        return `${i + 2}、${uid}`
                })
            }
            if (options.list) {
                return '已绑定的uid有\n' + formatUIDList(Object.keys(USER.uid) as UID[], USER.activeUID).join('\n')
            }
            if (uid) {
                let msg = '-msg-'
                let uidList = USER.uid
                if (options = {}) {
                    //已经绑定过
                    if (USER.includesUID(uid as UID)) {
                        await USER.push()
                        return '这个uid已经被绑定过了'
                    } else {
                        msg = Object.keys(USER.uid).length === 0 ? `第一次绑定，已将uid(${uid})设置为默认uid` : `已绑定uid(${uid})！`
                    }
                    //仅绑定uid
                    uidList = USER.setUID(uid as UID).uid
                } else if (options.remove) {
                    //移除这个uid
                    if (Object.keys(USER.uid).length === 1) {
                        //只有一条
                        await session.send('当前只绑定了这一个uid，确定移除？（回复y/n）')
                        const confirm = await session.prompt(20 * 1000)
                        if (confirm) {
                            if (/^(y|Y(?es))|是$/.test(confirm)) {
                                uidList = await USER.removeUID(uid as UID)
                                return `已取消uid(${uid})的绑定`
                            } else if (/^(n|N(?o))|否$/.test(confirm)) {
                                await session.send('已取消操作')
                            } else {
                                await session.send('输入内容有误')
                            }
                        } else {
                            await session.send('等待超时，已取消操作')
                        }
                    }

                } else if (options.default) {
                    //设置这个uid为默认
                    USER.activeUID = uid as UID
                    msg = `已将默认uid更改为"${uid}"`
                } else if (options.device) {
                    //重置uid的设备信息
                    USER.resetDSalt(uid as UID)
                    await session.send(`重置uid(${uid})的设备信息完成`)
                } else if (options.cookie && session.subtype === 'private') {
                    //私聊下的绑定cookie
                    USER.setCookie(options.cookie, uid as UID)
                    await session.send(`cookie已绑定到uid(${uid})下`)
                }
                return msg + '\n目前已绑定的uid有\n' + formatUIDList(Object.keys(uidList) as UID[], USER.activeUID).join('\n')
            } else {
                uid = USER.activeUID.toString()
                if (options.cookie && session.subtype === 'private') {
                    //私聊下的绑定cookie
                    USER.setCookie(options.cookie)
                    await session.send(`cookie已绑定到默认uid(${USER.activeUID})下`)
                } else if (options.device) {
                    USER.resetDSalt(uid as UID)
                    await session.send(`重置默认uid(${uid})的设备信息完成`)
                }
            }
        })
    // #endregion

    // #region command(paimon.sign)
    ctx.command('paimon.sign [uid:UID]', '进行米游社每日签到')
        .alias('paimon.s')
        .option('forever', '-f 启动定时执行签到')
        .option('disposable', '-d 关闭定时执行并立马签到')
        .option('info', '显示签到信息')
        .userFields(['authority'])
        .shortcut('#签到')
        .action(async ({ options, session }, uid) => {
            const USER = await DB.user(session.uid, session.user.authority > config.master)
            if (!uid) {
                uid = USER.activeUID as string
                if (!uid) {
                    return '您还未绑定过uid！请发送`paimon.bind 你的uid`以绑定'
                }
            }
            const cookie = await USER.cookieByUID(uid as UID)
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
                    await session.send(`<figure nickname="name">
                        <message userId="${session.selfId}">下列为接口返回的原始信息</message>
                        <message userId="${session.selfId}">${JSON.stringify(err.raw)}</message>
                    </figure>`)
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
    ctx.command('paimon.character [uid:UID]', '获取展示卡中角色详情（练度、圣遗物）')
        .alias('paimon.c', 'paimon.juese')
        .option('list', '-l 已保存的角色练度信息')
        .option('name', '-n 只查询某个角色')
        .shortcut('#角色面板')
        .action(({ options, session }, uid) => {
            session.send(`<figure nickname="name"><message userId="${session.selfId}" nickname="原始内容">Error</message></figure>`)
            session.send(JSON.stringify({ uid, options, session: session.toJSON() }))
        })
    // #endregion
}