import { Session, Context, Next } from "../core"
import { ICommand, SubCommand } from "../core/command"
import { Genshin } from "../genshin"

@SubCommand('notes', '[type]', '旅行者札记记录')
export default class useNotes implements ICommand {
    setup(ctx: Context, option: any, session: Session<never, never>, next: Next) {
        // const api = new Genshin.API()
        return JSON.stringify(option) + '/note data: '
    }
}