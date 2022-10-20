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

    /**
     * 根据用户查询默认uid
     * @param user 用户：`session.uid`
     */
    public static async findActiveUIDByUser(user: string) {
        try {
            const data = await this.context.database.get('paimon', { active: { $eq: true } })
            return data[0]['uid']
        } catch (error) {
            return undefined
        }

    }

    /**
     * 获取这个uid的所有信息
     * @param uid 
     */
    public static async findByUID(uid: UID) {
        return await this.context.database.get('paimon', { uid: (uid as string) })
    }

    /**
     * 根据用户查询所有信息
     * @param user 用户：`session.uid`
     * @param formatFn 预处理程序
     */
    public static async findByUser<U>(user: string, formatFn?: (data: Result<PaimonDB, Keys<PaimonDB, any>, (...args: any) => any>, index: number) => U) {
        const data = await this.context.database.get('paimon', { user })
        if (formatFn) {
            return data.map(formatFn)
        } else {
            return data
        }
    }

    /**
     * 根据uid查询所绑定的cookie
     * @param uid 
     */
    public static async findCookieByUID(uid: UID) {
        return (await this.context.database.get('paimon', { uid: (uid as string) }))[0]['cookie'] ?? undefined
    }

    /**
     * 将这个uid设置为默认uid
     * @param user 用户：`session.uid`
     * @param uid 
     */
    public static async setActive(user: string, uid: UID) {
        const userData = await this.context.database.get('paimon', { user, uid: (uid as string) })
        if(userData.length === 0){
            throw undefined
        }
        
    }

    /**
     * 验证该uid是否存在
     * @param uid 
     */
    public static async existUID(uid: UID): Promise<boolean> {
        return (await this.context.database.get('paimon', { uid: (uid as string) })).length > 0
    }
}