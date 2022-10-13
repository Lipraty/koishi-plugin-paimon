import { Argv, Context, Logger } from "koishi";
import { optModules } from "./command";
import { Bind } from "./command/bind.subcmd";
import { PaimonConfig } from "./configs";
import { Paimon } from "./core";
import { Database } from "./database";

declare module 'koishi' {
    namespace Argv {
        interface Domain {
            UID: string
        }
    }
}

Argv.createDomain('UID', source => {
    if (isNaN(parseInt(source))) throw new Error('这不是一个正确的UID')
    return source
})

export const name = 'paimon'

export interface Config extends PaimonConfig { }
export const Config = PaimonConfig

export const using = ['database', 'puppeteer']

const logger = new Logger('paimon')

export function apply(ctx: Context, config: Config) {
    const database = new Database(ctx).create()

    // #region command(paimon)
    ctx.command('paimon [uid:UID]', '派蒙，最好的伙伴！')
        .alias('ys', 'genshin')
        .option('memo', '-m 获取每日便笺内容')
        .shortcut(/(\#?)派蒙|paimon$/, {
            options: { help: true }
        })
        .action(async ({ options, session }, uid) => {
            if (!uid) {
                uid = await Database.findUIDByActive(session.uid)
                if (!uid) {
                    return '您还未绑定过uid！请私聊发送`paimon.bind --uid <uid>`以绑定'
                }
            }



            return JSON.stringify({ uid, options, session: session.toJSON() })
        })
    // #endregion

    // #region command(paimon.bind)
    ctx.command('paimon.bind', '绑定账号，具体使用方法发送`paimon.bind -h`查看')
        .alias('paimon.b')
        .option('list', '-l 列出已绑定的uid列表')
        .option('uid', '-u <uid:UID> 绑定UID到Paimon', { hidden: session => !(session.subtype === 'private') })
        .option('cookie', '-c <cookie> 绑定Cookie到Paimon', { hidden: session => !(session.subtype === 'private') })
        .shortcut('#uid列表', { options: { list: true } })
        .action(async ({ options, session }) => {
            const _bind = new Bind(session.uid, database)

            if (options.list) {
                return await _bind.findBindList()
            }

            if (session.subtype === 'private') {
                if (!options.uid && options.cookie) {
                    const userData = await Database.findByUser(session.uid)
                    if (userData.length === 0) {
                        await session.send('您从未绑定过uid，请回复uid以绑定该cookie')
                        const uid = await session.prompt(30000)
                        if (uid) {
                            await database.create('paimon', {
                                user: session.uid,
                                uid,
                                cookie: options.cookie,
                                active: true
                            })
                            return '已绑定该uid，将作为您默认uid使用'
                        } else {
                            return '等待超时，您可以先发送`paimon.bind --uid <uid>`来绑定uid'
                        }
                    }
                }
                await session.send(await _bind.bindToUser((options.uid as UID), options.cookie))
            }
        })
    // #endregion

    // #region command(paimon.sign)
    ctx.command('paimon.sign [uid:UID]', '进行米游社每日签到')
        .alias('paimon.s')
        .option('forever', '-f 启动定时执行签到')
        .option('disposable', '-d 关闭定时执行并立马签到')
        .option('info', '显示签到信息')
        .action(async ({ options, session }, uid) => {
            if (!uid) {
                uid = await Database.findUIDByActive(session.uid)
                if (!uid) {
                    return '您还未绑定过uid！请私聊发送`paimon.bind --uid 你的uid`以绑定'
                }
            }

            const cookie = await Database.findCookieByUID(uid as UID)
            if (!cookie) {
                return '您的uid还未绑定过cookie！请私聊发送`paimon.bind --uid ' + uid + ' --cookie 你的cookie`以绑定'
            }

            try {
                const api = await new Paimon.API(uid, cookie).bbsSign()
                return JSON.stringify({ uid, api })
            } catch (error) {
                return '请求时遇到一个错误：' + await error.toString()
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
            return JSON.stringify({ uid, options }) 
        })
    // #endregion
}