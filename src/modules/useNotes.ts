import { Paimon } from "../core";
import { basicCommand } from "../core/command";

export default class useNotes extends basicCommand {
    public readonly cmd = "notes"
    public param = '[type]'
    public desc = "获得旅行者札记记录"
    public setup(paimon: Paimon, options: object, session) {
        
        return
    }
}