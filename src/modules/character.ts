import { Next, Session } from "../core";
import { Alias, CmdOption, ICommand } from "../core/command";

@CmdOption('character', '<name>', '获取某个角色的数据')
@Alias('r')
export default class character implements ICommand {
    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return JSON.stringify(option)
    }
}