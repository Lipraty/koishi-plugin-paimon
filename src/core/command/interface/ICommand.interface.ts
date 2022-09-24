import { Next, Session } from "../../common";

export interface ICommand {
    setup(option, session: Session, next: Next): string | void | Promise<string | void>
}