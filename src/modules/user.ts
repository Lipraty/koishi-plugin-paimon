import { Paimon, Session } from "../core";
import { basicCommand } from "../core/command";

export default class user extends basicCommand {
    public cmd = "user"
    public opt = true
    public param = '[uid]'
    public desc = "获取角色信息（展柜、数据总览等）,默认为第一次所绑定uid的信息"
    public setup(paimon: Paimon, options: object, session: Session<never, never>): void {
        
    }
}