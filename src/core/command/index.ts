import { Paimon } from ".."
import { Command } from "../common"
import { modulesContext as context } from "./context"

export const modules = {
    context
}
/**
 * command基础实现
 */
declare class ICommand implements CommandOptions {
    public readonly cmd: string
    public readonly opt: boolean
    public readonly desc: string
    public readonly param: string
    public readonly level: number
    public readonly alias: string
    public readonly maxUsage: number
    public readonly shortcut: string
    public readonly private: boolean
    public readonly options: object
    public setup(paimon: Paimon, options, session, next?): string | void
}

/**
 * 提供基础command模板，并预决定返回值。
 */
export class basicCommand implements ICommand {
    public cmd: string = undefined
    public opt: boolean = false
    public desc: string = undefined
    public param: string = undefined
    public level: number = 0
    public alias: string = undefined
    public maxUsage: number = 0
    public shortcut: string = undefined
    public private: boolean = false
    public options: object
    public setup(paimon: Paimon, options, session, next?): string | void { return '该命令或选项可能未实现' }
}

/**
 * command/option装载器
 * @param paimon `Paimon`实例
 * @param koishiCmd koishi.command
 * @param command command module
 */
export function cmdBootstrap(paimon: Paimon, koishiCmd: Command, command: basicCommand) {
    if (!command.opt) {
        //install subcommand
        koishiCmd = koishiCmd.subcommand(`.${command.cmd}`, command.desc).alias(`${paimon.commandName}.${command.alias}`)
        // install subcommand's options
        if (command.options) {
            Object.keys(command.options).forEach(key => {
                koishiCmd.option(key, command.options[key])
            })
        }
    } else {
        //install option
        koishiCmd = koishiCmd.option(command.cmd, [command.alias, command.param, command.desc].join(' '))
    }
    //
    koishiCmd.action(({ options, session, next }) => {
        return JSON.stringify({ options, session })
    })
}