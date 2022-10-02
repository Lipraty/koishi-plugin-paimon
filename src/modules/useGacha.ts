import { Session, Next } from "../core";
import { ICommand, SubCommand } from "../core/command";

@SubCommand('gacha', '[opt]', '模拟抽卡（不能保证与游戏真实概率具有关联性，仅供娱乐）')
export default class useGacha implements ICommand {
    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return JSON.stringify(option)
    }
}