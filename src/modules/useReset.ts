import { Session, Next } from "koishi";
import { SubCommand, ICommand, option } from "../core/command";

@SubCommand('reset', '[uid]', '重置一个项目')
export default class useReset implements ICommand {
    @option('-c', '[cookie:string]', '重置该uid所绑定的cookie。更推荐直接使用paimon.bind [uid] -c [cookie]来重置')
    cookie() { }

    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return JSON.stringify(option)
    }
}