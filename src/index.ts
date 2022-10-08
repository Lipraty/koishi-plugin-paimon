import { Context, Logger } from "koishi";
import { optModules } from "./command";
import { PaimonConfig } from "./configs";
import { Database } from "./database";

export const name = 'paimon'

export interface Config extends PaimonConfig { }
export const Config = PaimonConfig

const logger = new Logger('paimon')

export function apply(ctx: Context, config: Config) {
    ctx.using(['database', 'puppeteer'], () => { })
    const database = new Database(ctx).create()

    // #region command(paimon)
    ctx.command('paimon [uid]', '派蒙，最好的伙伴！发送`paimon -h`获得应急食品的食用方法')
        .alias('ys', 'genshin')
        .option('user', '-u')
        .option('memo', '-m 获取每日便笺内容')
        .action(async ({ options, session }, uid) => {
            if (!uid) {
                uid = await Database.findUIDByActive(session.uid)
                if (!uid) {
                    return '您还未绑定过uid！请发送`paimon.bind --uid <uid>`以绑定'
                }
            }
            return JSON.stringify({ options, uid })
        })
    // #endregion

    // #region command(paimon.bind)
    ctx.private().command('paimon.bind', '绑定账号，具体使用方法发送`paimon.bind -h`查看')
        .alias('paimon.b')
        .option('list', '-l 列出已绑定的uid列表')
        .option('uid', '-u <uid:UID> 绑定UID到Paimon', {
            type: (source) => {
                if (isNaN(parseInt(source))) throw new Error('请输入正确的uid')
                return source
            }
        })
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
}