import { Command, koishiConfig, Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class useMona extends basicCommand {
    public readonly cmd = "mona"
    public desc = "使用莫娜DSL进行圣遗物装配计算，限于服务器性能，该命令每小时允许执行1次。"
    public setup(paimon: Paimon, options: object, session) {
        
        return
    }
}