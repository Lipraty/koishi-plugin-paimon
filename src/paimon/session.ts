import { User, Channel, Session, Context, observe } from "koishi";
import { Bot } from "@satorijs/satori"
import { PaimonUid } from "./database";
import { extend } from "../utils/Misc.util";

declare module "koishi" {
    interface Session {
        $uids: PaimonUid.Observed<PaimonUid.Field>
        getUid<K extends PaimonUid.Field = never>(uuis?: string, fields?: K[]): Promise<PaimonUid>
        observeUid<T extends PaimonUid.Field = never>(fields?: Iterable<T>): Promise<PaimonUid.Observed<T>>
        collect<T extends "user" | "channel" | "paimon_uid" | "paimon_character">(key: T, argv: Argv<never, never, any[], {}>, fields?: Set<keyof Tables[T]>): Set<keyof Tables[T]>
    }
}

extend(Session.prototype as Session, {

    async observeUid(fields = []) {

        return this.$uids
    },

    async getUid(uuid, fields) {
        return {
            uuid,
            uid: '1',
            cookie: '',
            dsalt: '',
            freeze: false
        }
    }
})