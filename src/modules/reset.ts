import { Paimon, Session } from "../core";
import { basicCommand } from "../core/command";

export default class useReset extends basicCommand {
    public readonly cmd = "reset"
    public desc = "重置一个项目"
    public param = '[uid]'
    public options = {
        'cookie': '-c [cookie:string] 重置该uid所绑定的cookie。更推荐直接使用paimon.bind [uid] -c [cookie]来重置'
    }
    public setup(paimon: Paimon, options: object, session: Session<never, never>) {
        return
    }
}