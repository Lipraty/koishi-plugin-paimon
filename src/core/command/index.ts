import { Paimon } from ".."
import { Argv, Command, Context, DatabaseService, Session } from "../common"
import { modulesContext as context } from "./context"

export const modules = {
    context
}

export declare class ICommand implements CommandOptions {
    public readonly cmd: string
    public readonly desc: string
    public readonly param: string
    public readonly level: number
    public readonly alias: string
    public setup(paimon: Paimon, options: any, session: any): string | void
}

export class basicCommand implements ICommand {
    public readonly cmd: string = undefined
    public readonly opt: string = undefined
    public readonly desc: string = undefined
    public readonly alias: string = undefined
    public readonly param: string = undefined
    public readonly level: 0 | 1 = 0
    public readonly option: Argv.OptionConfig = undefined
    public setup(paimon: Paimon, options: object, session: Session): void { }
}

export function cmdBootstrap(paimon: Paimon, koishiCmd: Command, command: basicCommand, option: boolean = false) {
    // koishiCmd.subcommand('.testxxx [opt:string] test').alias('.tx')
    //install option
    koishiCmd = koishiCmd.option(command.cmd, [command.alias, command.param, command.desc].join(' '))
    //
    koishiCmd.action(({ options, session }) => {
        return JSON.stringify({options, session})
    })
}