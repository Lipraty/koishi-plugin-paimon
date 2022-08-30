import { Command, koishiConfig } from "../core";
import { basicCommand } from "../core/command";

export default class user extends basicCommand {
    public readonly cmd = "user"
    public alias: string = '-u'
    public desc = "获取角色信息（展柜、数据总览等）"
    public setup(cmdOpt: Command, message) {
        
        return
    }
}