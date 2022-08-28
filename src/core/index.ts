import { Command, Context } from "./common";
export * from './common'

export class Paimon {
    private _ctx: Context
    private _cmd: Command

    constructor(ctx: Context) {
        this._ctx = ctx
        this._cmd = this._ctx.command('ys <cmd> [...args]')
    }

    /**
     * 创建Paimon监听对象
     * @param modules 加载的模块包
     */
    public create(commandModules: Array<CommandOptions>) {
        this._cmd.action((_, cmd, [...args]: string[]) => {
            let command = commandModules.find(co => cmd === co.cmd || cmd === co.alias)
            if (command) {
                command.action(command.params ? args.map(arg => { if (command.params.includes(arg)) return arg; }) : args)
            }
        })
    }
}