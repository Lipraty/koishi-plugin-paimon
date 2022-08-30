import { Command, koishiConfig } from "../core";
import { basicCommand } from "../core/command";

export default class character extends basicCommand {
    public readonly cmd = "character"
    public alias: string = '-c'
    public param = '<name>'
    public desc = "获取某个角色的数据"
    public setup(cmdOpt: Command, message) {
        
        return
    }
}