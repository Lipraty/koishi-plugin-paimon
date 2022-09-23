import { Command, koishiConfig, Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class memo extends basicCommand {
    public readonly cmd = "memo"
    public alias: string = '-m'
    public desc = "获取实时便笺内容（树脂、洞天宝钱、每日委托、周本、质量参变仪、探索派遣）"
    public setup(paimon: Paimon, options: object, session) {
        
        return
    }
}