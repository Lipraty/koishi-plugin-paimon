import { Argv, Context, Logger } from "koishi";
import { optModules } from "./command";
import { PaimonConfig } from "./configs";
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

const logger = new Logger('paimon')

export function apply(ctx: Context, config: Config) {
    ctx.using(['database', 'puppeteer'], () => { })
    const database = new Database(ctx).create()

    // #region command(paimon)
    ctx.command('paimon [uid:UID]', '派蒙，最好的伙伴！')
        .alias('ys', 'genshin')
        .option('list', '-l 列出已绑定的uid列表')
        .option('memo', '-m 获取每日便笺内容')
        .shortcut(/(\#?)派蒙|paimon$/, {
            options: { help: true }
        })
        .shortcut('#uid列表', {
            options: { list: true }
        })
        .action(async ({ options, session }, uid) => {
            if (!uid) {
                uid = await Database.findUIDByActive(session.uid)
                if (!uid) {
                    return '您还未绑定过uid！请私聊发送`paimon.bind --uid <uid>`以绑定'
                }
            }
            const dataListByUser = await Database.findByUser(session.uid, (data, index) => {
                return `${index + 1}. ${data.uid}${data.active ? ' (默认)' : ''}`
            })
            if (options.list) {
                return '目前已绑定uid有\n' + dataListByUser.join('\n')
            }



            return JSON.stringify({ uid, options })
        })
    // #endregion

    // #region command(paimon.bind)
    ctx.private().command('paimon.bind', '绑定账号，具体使用方法发送`paimon.bind -h`查看')
        .alias('paimon.b')
        .option('list', '-l 列出已绑定的uid列表')
        .option('uid', '-u <uid:UID> 绑定UID到Paimon')
        .option('cookie', '-c <cookie> 绑定Cookie到Paimon')
        .action(async ({ options, session }) => {
            const dataListByUser = await Database.findByUser(session.uid, (data, index) => {
                return `${index + 1}. ${data.uid}${data.active ? ' (默认)' : ''}`
            })
            if (options.list && !options.uid && !options.cookie) {
                return '目前已绑定uid有\n' + dataListByUser.join('\n')
            }

            if (!options.uid) {
                if (options.cookie) {
                    if (dataListByUser.length === 0) {
                        await session.send('您从未绑定过uid，请回复uid以绑定该cookie')
                        const uid = await session.prompt(30)
                        await database.create('paimon', {
                            user: session.uid,
                            uid,
                            cookie: options.cookie,
                            active: true
                        })

                        return '已绑定该uid，这将作为您默认uid使用。'
                    } else {
                        await database.set('paimon', {
                            active: { $eq: true }
                        }, {
                            cookie: options.cookie
                        })
                        const defUid = await Database.findUIDByActive(session.uid)

                        return `由于未指定uid，cookie已绑定到默认uid(${defUid})下。`
                    }
                }
            } else {
                if (await Database.existUID(options.uid as UID)) {
                    if (options.cookie) {
                        await database.set('paimon', {
                            uid: options.uid
                        }, {
                            cookie: options.cookie
                        })

                        return '该uid已更新cookie'
                    } else {
                        return '该uid已被绑定'
                    }
                } else {
                    await database.create('paimon', {
                        user: session.uid,
                        uid: options.uid,
                        cookie: options.cookie,
                        active: dataListByUser.length === 0
                    })

                    return `已绑定该uid${dataListByUser.length === 0
                        ? '，由于是第一次绑定，该uid将作为默认uid。'
                        : '，目前已绑定uid有\n' + dataListByUser.join('\n') + `\n${dataListByUser.length + 1}. ${options.uid}`}`
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
        .action(({ options, session }, uid) => {
            return JSON.stringify({ uid, options })
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