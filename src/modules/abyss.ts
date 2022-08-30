import { Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class abyss extends basicCommand {
    public readonly cmd = "abyss"
    public param = '<type>'
    public desc = "绑定UID"
    public setup(paimon: Paimon, options: object, session) {
        
        return
    }
}