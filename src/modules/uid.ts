import { Command, koishiConfig, Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class uid extends basicCommand {
    public readonly cmd = "uid"
    public param = '<uid:string>'
    public desc = "绑定UID"
    public setup(paimon: Paimon, options: object, session) {
        // paimon.database.get()
        return JSON.stringify(options)
    }
}