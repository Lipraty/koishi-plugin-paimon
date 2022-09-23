import { Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class useAbyss extends basicCommand {
    public readonly cmd = "abyss"
    public param = '<type>'
    public desc = "深境螺旋"
    public setup(paimon: Paimon, options: object, session) {
        
        return
    }
}