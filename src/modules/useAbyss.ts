import { Session, Next } from "../core";
import { ICommand, option, SubCommand } from "../core/command";

@SubCommand('abyss', '[type]', '深境螺旋相关信息')
export default class useAbyss implements ICommand {
    @option('-o', '[type]', '上期深境螺旋数据')
    old() { }

    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return 'abyss:'+JSON.stringify(option)
    }
}