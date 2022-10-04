import { Session, Context, Next, Paimon } from "../core";
import { Alias, ICommand, option, Private, SubCommand } from "../core/command";

@SubCommand('bind', '[param]', '绑定某一个项目，具体用法可发送\'paimon.bind -h\'查看')
@Private()
@Alias('b')
export default class useBind implements ICommand {
    @option('-u', '[uid:string]', '绑定UID')
    uid() { }

    @option('-c', '[cookie:string]', '绑定cookie')
    cookie() { }

    @option('-l', '', '列出已绑定的uid列表')
    list() { }

    async setup(ctx: Context, option: any, session: Session, next: Next) {
        const dataList = await Paimon.findByUser(ctx, session.uid, (data, index) => {
            return `${index + 1}. ${data.uid}${data.active ? ' (默认)' : ''}`
        })

        if (option.list && !option.uid && !option.cookie) {
            return '目前已绑定uid有\n' + dataList.join('\n')
        }

        if (!option.uid) {
            if (option.cookie) {
                if (dataList.length === 0) {
                    await session.send('您从未绑定过uid，请回复uid以绑定该cookie')
                    const uid = await session.prompt(30)
                    await ctx.database.create('paimon', {
                        user: session.uid,
                        uid,
                        cookie: option.cookie,
                        active: true
                    })

                    return '已绑定该uid，这将作为您默认uid使用。'
                } else {
                    await ctx.database.set('paimon', {
                        active: { $eq: true }
                    }, {
                        cookie: option.cookie
                    })
                    const defUids = await ctx.database.get('paimon', { active: { $eq: true } })

                    return `由于未指定uid，cookie已绑定到默认uid(${defUids[0]['uid']})下。`
                }
            }
        } else {
            if (option.cookie) {
                await ctx.database.set('paimon', {
                    uid: option.uid
                }, {
                    cookie: option.cookie
                })

                return '该uid已更新cookie'
            } else {
                if (await Paimon.exiUID(ctx, option.uid)) {
                    return '该uid已被绑定'
                } else {
                    await ctx.database.create('paimon', {
                        user: session.uid,
                        uid: option.uid,
                        cookie: option.cookie,
                        active: dataList.length === 0
                    })

                    return `已绑定该uid${dataList.length === 0
                        ? '，由于是第一次绑定，该uid将作为默认uid。'
                        : '，目前已绑定uid有\n' + dataList.join('\n') + `\n${dataList.length + 1}. ${option.uid}`}`
                }
            }
        }
    }
}