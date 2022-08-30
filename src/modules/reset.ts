import { Command, koishiConfig } from "../core";
import { basicCommand } from "../core/command";

export default class reset extends basicCommand {
    public readonly cmd = "reset"
    public param = '[opt]'
    public desc = "重置一个项目"
    public setup(cmdOpt: Command, message) {
        
        return
    }
}