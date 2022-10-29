import { User, Channel, Session } from "koishi";
import { PaimonUid } from "./database";

declare module "koishi" {}

export class PaimonSession<U extends User.Field, G extends Channel.Field, P extends PaimonUid.Field> extends Session<U, G> {
    paimon: PaimonUid.Observed<P>
}