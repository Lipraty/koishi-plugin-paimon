import { Context, Next, Session } from "../core";
import { Alias, CmdOption, ICommand } from "../core/command";

@CmdOption('sign', '[uid]', '执行米游社签到')
@Alias('s')
export default class sign implements ICommand {
    setup(ctx: Context, option: any, session: Session<never, never>, next: Next): string {
        return JSON.stringify(option)
    }
}