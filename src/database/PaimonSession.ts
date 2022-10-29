import { User, Channel, Session } from "koishi";
import { PaimonUid } from "./interface";

export class PaimonSession<U extends User.Field, G extends Channel.Field, P extends PaimonUid.Field> extends Session<U, G> {
    paimon: PaimonUid.Observed<P>
}