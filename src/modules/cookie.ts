import { Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class cookie extends basicCommand {
    public readonly cmd = "cookie"
    public alias: string = '-c'
    public param = '<cookie>'
    public desc = "绑定Cookie。（请不要在群聊中使用该选项，并不会在群聊中响应该选项，且会造成cookie泄露）"
    public setup(paimon: Paimon, options: object, session) {
        
        return
    }
}