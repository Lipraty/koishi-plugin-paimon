import { Paimon } from ".."
import { Argv, Command, Context, DatabaseService } from "../common"
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
    public setup(cmdx: any, config: any): string | void
}

export class basicCommand implements ICommand {
    public readonly cmd: string = undefined
    public readonly desc: string = undefined
    public readonly alias: string = undefined
    public readonly param: string = undefined
    public readonly level: 0 | 1 = 0
    public readonly option: Argv.OptionConfig = undefined
    public database: DatabaseService = undefined
    public setup(cmdx: any, config: any): string | void { }
}

export function cmdBootstrap(paimon: Paimon, koishiCmd: Command, command: basicCommand) {
    //install option
    if(command.alias){
        koishiCmd = koishiCmd.option(command.cmd, [command.alias, command.param, command.desc].join(' '))
    }else{
        koishiCmd = koishiCmd.option(command.cmd, command.desc)
    }
    //
    koishiCmd.action(({ options }) => {
        return JSON.stringify(options)
    })
}