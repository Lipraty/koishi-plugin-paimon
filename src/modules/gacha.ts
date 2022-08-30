import { Command, koishiConfig } from "../core";
import { basicCommand } from "../core/command";

export default class gacha extends basicCommand {
    public readonly cmd = "gacha"
    public param = '[opt]'
    public desc = "模拟抽卡（不能保证与游戏真实概率具有关联性，仅供娱乐）"
    public setup(cmdOpt: Command, message) {
        
        return
    }
}