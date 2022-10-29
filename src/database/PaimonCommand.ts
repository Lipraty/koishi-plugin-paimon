import { Channel, Command, Context, FieldCollector, User } from "koishi"
import { PaimonUid } from "./interface"

export class PaimonCommand<U extends User.Field = never, G extends Channel.Field = never, P extends PaimonUid.Field = never, A extends any[] = any[], O extends {} = {}> extends Command<U, G, A, O> {
    constructor(name: string, decl: string, ctx: Context) {
        super(name, decl, ctx)
    }
    uidFields<T extends PaimonUid.Field>(fields: FieldCollector<'paimon_uid', A>): PaimonCommand<U, G, T | P, A, O> {
        return this
    }
}