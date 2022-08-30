import { Command, koishiConfig } from "../core";
import { basicCommand } from "../core/command";

export default class abyss extends basicCommand {
    public readonly cmd = "abyss"
    public alias: string = '-ab'
    public param = '<type>'
    public desc = "绑定UID"
    public setup(cmdOpt: Command, message) {
        
        return
    }
}