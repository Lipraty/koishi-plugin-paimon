import { Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class useBind extends basicCommand {
    public cmd = 'bind'
    public param = '[param]'
    public alias = 'b'
    public desc = '绑定某一个项目'
    public options = {
        uid: '-u [uid:string] 绑定UID',
        cookie: '-c [cookie:string] 绑定cookie'
    }
    public setup(paimon: Paimon, session) {
        //...
    }
}