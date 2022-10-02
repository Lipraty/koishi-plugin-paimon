import { Session, Next } from "../core"
import { CmdOption, ICommand } from "../core/command"

@CmdOption('user', '[uid]', '获取角色信息（展柜、数据总览等）,默认为第一次所绑定uid的信息')
export default class user implements ICommand {
    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return JSON.stringify(option)
    }
}