import { Context, Keys } from "koishi"
import { UUID } from "../utils/UUID.util"

declare module 'koishi' {
    interface Tables {
        paimon_uid: PaimonUid,
        paimon_character: PaimonCharacter
    }
    interface User {
        uuid: string
        active_uid: string
        characet_id: number[]
    }
}

export interface UserData {
    uuid: string
    active_uid: UID | null
    characet_id: number[]
    uid: {
        [K in UID]: UserUID
    }
}

export interface UserUID {
    dsalt: string
    cookie: string | null
    freeze: boolean
}

export interface PaimonUid {
    uid: UID
    uuid: string
    dsalt: string
    cookie: string
    freeze: boolean //并不是冻结了，准确来说是撞到验证码了，标记为冻结而略过请求。
}

export interface PaimonCharacter {
    cuid: number
    id: number
    icon?: string
    image?: string
    name: string
    element: string
    fetter: number
    level: number
    rarity: number
    actived_constellation_num: number
    weapon?: Weapon
    reliquaries?: Reliquaries[]
    constellations?: Constellations[]
}

export class Database {
    private _created: boolean = false
    private context: Context
    private static context: Context
    private userData: UserData
    private userMaster: boolean = false

    public constructor(ctx: Context) {
        this.context = ctx
        Database.context = ctx
    }

    public create() {
        if (!this._created) {
            this.context.model.extend('user', {
                uuid: 'text',
                active_uid: 'string',
                characet_id: 'list'
            })

            this.context.model.extend('paimon_uid', {
                uid: 'string',
                uuid: 'text',
                dsalt: 'text',
                cookie: 'text',
                freeze: { type: 'boolean', initial: false }
            }, {
                primary: 'uid',
                unique: ['uid']
            })

            this.context.model.extend('paimon_character', {
                cuid: 'unsigned',
                id: 'integer',
                icon: 'text',
                image: 'text',
                name: 'string',
                element: 'text',
                fetter: 'integer',
                level: 'integer',
                rarity: 'integer',
                actived_constellation_num: 'integer',
                weapon: 'json',
                reliquaries: 'json',
                constellations: 'json'
            }, {
                primary: 'cuid',
                autoInc: true,
                unique: ['cuid']
            })

            this._created = true
        }
        return this.context.database
    }

    /**
     * 根据`session.user.id`创建用户，如果存在则会直接返回
     * @param user 用户(`session.uid`)
     * @database
     */
    private async createUser(userId: string) {
        //基于无符号UUIDv5进行生成，以保证每一个用户的唯一性
        const uuid = UUID.snameUUIDFromBytes('koishi:' + userId).unsign()
        console.log(uuid)
        const findByUser = await this.context.database.get('user', uuid)
        if (findByUser.length === 0) {
            await this.context.database.upsert('user', [{ id: userId, uuid }], 'id')
            return (await this.context.database.get('user', userId))[0]
        } else {
            return findByUser[0]
        }
    }

    /**
     * 建立用户数据库操作
     * @param user 用户(`session.uid`)
     * @param master 高级权限
     */
    public async user(userId: string, master: boolean = false): Promise<UserData> {
        const UserTable = await this.createUser(userId)
        const uids = await this.context.database.get('paimon_uid', { uuid: UserTable.uuid })
        return {
            uuid: UserTable.uuid,
            uid: Database.objectify(uids),
            active_uid: UserTable.active_uid as UID,
            characet_id: UserTable.characet_id
        }
    }

    public static parse(uuid: string, uidObject: Record<UID, Record<Keys<UserUID>, any>>): PaimonUid[] {
        return Object.keys(uidObject).map(uid => {
            return Object.assign(uidObject[uid], { uuid, uid: uid as UID })
        })
    }

    public static objectify(uids: PaimonUid[]): Record<UID, Record<Keys<UserUID>, any>> {
        return Object.fromEntries(uids.map(u => {
            return [u.uid, { cookie: u.cookie, dsalt: u.dsalt, freeze: u.freeze }]
        }))
    }

    public static async includeUID(uid: UID) {
        const u = await this.context.database.get('paimon_uid', { uid })
        return u.length > 0
    }
}