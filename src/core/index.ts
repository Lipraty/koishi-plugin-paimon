import { Context } from "./common";
export * from './common'

interface CommandOptions {
    alias: string | "" | undefined
    level: 0 | 1
    params?: string[]
    enter?: string
}

export class Paimon {
    private _ctx: Context
    constructor(ctx: Context) {
        this._ctx = ctx
    }
    /**
     * 创建Paimon监听对象
     * @param modules 加载的模块包
     */
    public create(modules: Array<string>) {

    }

    /**
     * 注册命令至koishi中
     */
    private async install(cmd: string, action: Promise<any>, options: CommandOptions) {
        //command format
        if(options.enter)
            cmd += ` <${options.enter}>`
        else
            if(options.params)
                cmd += ' '
                options.params.forEach((param) => {
                    cmd += `[${param}]`
                })
        //use command
        this._ctx
            .command('--' + cmd)
            .alias(options.alias)
            .action(await action)
    }
}