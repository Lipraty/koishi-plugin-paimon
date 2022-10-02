import { Session, Next } from "../core"
import { ICommand, SubCommand } from "../core/command"

@SubCommand('notes', '[type]', '旅行者札记记录')
export default class useNotes implements ICommand {
    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return JSON.stringify(option)
    }
}