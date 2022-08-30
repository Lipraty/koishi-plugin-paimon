import { Paimon, Session } from "../core";
import { basicCommand } from "../core/command";

export default class reset extends basicCommand {
    public readonly cmd = "reset"
    public param = '[opt]'
    public desc = "重置一个项目"
    public setup(paimon: Paimon, options: object, session: Session<never, never>) {
        return
    }
}