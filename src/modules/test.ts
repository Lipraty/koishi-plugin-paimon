import { Paimon, Session } from "../core";
import { basicCommand } from "../core/command";

export default class useTest extends basicCommand{
    public cmd: string = 'test'
    setup(paimom: Paimon, options, session: Session, next){
        paimom.screenWebToImage('https://paimon-display.app.lonay.me/', {})
    }
}