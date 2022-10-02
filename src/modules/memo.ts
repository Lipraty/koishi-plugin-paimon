import { Session, Next } from "koishi";
import { Alias, CmdOption, ICommand } from "../core/command";

@CmdOption('memo', undefined, '获取实时便笺内容（树脂、洞天宝钱、每日委托、周本、质量参变仪、探索派遣）')
@Alias('m')
export default class memo implements ICommand {
    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return 'memo:' + JSON.stringify(option)
    }
}