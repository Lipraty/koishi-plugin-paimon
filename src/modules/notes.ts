import { Command, koishiConfig } from "../core";
import { basicCommand } from "../core/command";

export default class notes extends basicCommand {
    public readonly cmd = "notes"
    public param = '[type]'
    public desc = "获得旅行者札记记录"
    public setup(cmdOpt: Command, message) {
        
        return
    }
}