import { Session, Next } from "../core"
import { ICommand, SubCommand } from "../core/command"

// @SubCommand('mona', undefined, '使用莫娜DSL进行圣遗物装配计算，限于服务器性能，该命令每小时允许执行1次。')
export default class useMona implements ICommand {
    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return JSON.stringify(option)
    }
}