import { Next, Session } from "../core";
import { Alias, CmdOption, ICommand } from "../core/command";

@CmdOption('user', '[uid]', '获取角色信息（展柜、数据总览等）,默认为第一次所绑定uid的信息')
@CmdOption('character', '<name>', '获取某个角色的数据')
@Alias('r')
@CmdOption('memo', undefined, '获取实时便笺内容（树脂、洞天宝钱、每日委托、周本、质量参变仪、探索派遣）')
@Alias('m')
@CmdOption('sign', '[uid]', '执行米游社签到')
@Alias('s')
export default class paimon implements ICommand {
    setup(option: any, session: Session<never, never>, next: Next): string | void | Promise<string | void> {
        return 'option:' + JSON.stringify(option)
    }
}