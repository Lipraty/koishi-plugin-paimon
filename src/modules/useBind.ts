import { Session, Next } from "../core";
import { Alias, ICommand, option, SubCommand } from "../core/command";

@SubCommand('bind', '[param]', '绑定某一个项目，具体用法可发送\'paimon.bind -h\'查看')
@Alias('b')
export default class useBind implements ICommand {
    @option('-u', '[uid:string]', '绑定UID')
    uid() { }

    @option('-c', '[cookie:string]', '绑定cookie')
    cookie() { }

    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return JSON.stringify(option)
    }
}