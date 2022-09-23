import { Paimon, Session } from "../core";
import { basicCommand } from "../core/command";

export default class sign extends basicCommand {
    public cmd = 'sign'
    public opt = true
    public alias = '-s'
    public param = '[uid]'
    public desc = "签到，可以指定某一个绑定的UID进行签到"
    public setup(paimon: Paimon, options: object, session: Session<never, never>) {
        
    }
}