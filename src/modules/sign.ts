import { Paimon, Session } from "../core";
import { basicCommand } from "../core/command";

export default class sign extends basicCommand {
    public readonly cmd = "sign"
    public alias: string = '-s'
    public desc = "签到，可以指定某一个绑定的UID进行签到"
    public setup(paimon: Paimon, options: object, session: Session<never, never>) {
        return '签到尚未实现'
    }
}