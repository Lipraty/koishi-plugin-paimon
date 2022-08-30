import { Command, koishiConfig } from "../core";
import { basicCommand } from "../core/command";

export default class sign extends basicCommand {
    public readonly cmd = "sign"
    public alias: string = '-s'
    public param = '[uid]'
    public desc = "签到，可以指定某一个绑定的UID进行签到"
    public setup(cmdOpt: Command, message) {
        
        return
    }
}