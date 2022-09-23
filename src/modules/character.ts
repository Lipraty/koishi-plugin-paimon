import { Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class character extends basicCommand {
    public cmd = "character"
    public opt = true
    public alias: string = '-r'
    public param = '<name>'
    public desc = "获取某个角色的数据"
    public setup(paimon: Paimon, options: object, session) {
        
        return
    }
}