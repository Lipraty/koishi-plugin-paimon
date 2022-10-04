import { Context, Next, Session } from "../../common";

export interface ICommand {
    setup(ctx: Context, option, session: Session, next: Next): string | void | Promise<string | void>
}