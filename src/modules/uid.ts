import { Command, koishiConfig } from "../core";
import { basicCommand } from "../core/command";

export default class uid extends basicCommand {
    public readonly cmd = "uid"
    public param = '<uid>'
    public desc = "绑定UID"
    public setup(cmdOpt: Command, message) {
        
        return
    }
}