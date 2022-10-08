import { Context, Keys, Result } from "koishi"

declare module 'koishi' {
    interface Tables {
        paimon: PaimonDB
    }
}

export interface PaimonDB {
    id: number
    user: string
    uid: string
    cookie: string
    active: boolean
}

export class Database {
    private _created: boolean = false
    private context: Context
    private static context: Context

    public constructor(ctx: Context) {
        this.context = ctx
        Database.context = ctx
    }

    public create() {
        if (!this._created) {
            this.context.model.extend('paimon', {
                id: 'unsigned',
                user: 'string',
                uid: 'string',
                cookie: 'text',
                active: 'boolean'
            }, {
                autoInc: true,
                foreign: {
                    user: ['user', 'uid']
                },
                unique: ['uid', 'cookie']
            })
            this._created = true
        }
        return this.context.database
    }

    public static async findUIDByActive(user: string) {
        const data = await this.context.database.get('paimon', { active: { $eq: true } })
        return data[0]['uid']
    }

    public static async findByUID(uid: UID) {
        return await this.context.database.get('paimon', { uid: (uid as string) })
    }

    public static async findByUser<U>(user: string, formatFn?: (data: Result<PaimonDB, Keys<PaimonDB, any>, (...args: any) => any>, index: number) => U) {
        const data = await this.context.database.get('paimon', { user })
        if (formatFn) {
            return data.map(formatFn)
        } else {
            return data
        }
    }

    public static async existUID(uid: UID): Promise<boolean> {
        return (await this.context.database.get('paimon', { uid: (uid as string) })).length > 0
    }
}