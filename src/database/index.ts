import { Context, Keys } from "koishi"
import { UUID } from "../utils/UUID.util"

declare module 'koishi' {
    interface Tables {
        paimon_user: PaimonUser,
        paimon_uid: PaimonUid,
        paimon_character: PaimonCharacter
    }
}

export interface PaimonUser {
    uuid: string
    user: string
    uid: UID[]
    active_uid: UID
    characet_id: number[]
}

interface PaimonUserAll {
    uuid: string
    user: string
    uid: PaimonUid[]
    active_uid: UID
    characet_id: number[] | PaimonCharacter[]
}

export interface PaimonUid {
    uid: UID
    dsalt: string
    cookie: string
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
    private static userData: PaimonUser
    private static userMaster: boolean = false

    public constructor(ctx: Context) {
        this.context = ctx
        Database.context = ctx
    }

    public create() {
        if (!this._created) {

            this.context.model.extend('paimon_user', {
                uuid: 'string',
                user: 'string',
                uid: 'list',
                active_uid: 'string',
                characet_id: 'list'
            }, {
                primary: 'uuid',
                foreign: {
                    uid: ['paimon_uid', 'uid'],
                    characet_id: ['paimon_character', 'cuid']
                },
                unique: ['uuid', 'user']
            })

            this.context.model.extend('paimon_uid', {
                uid: 'string',
                dsalt: 'text',
                cookie: 'text',
            }, {
                primary: 'uid',
                foreign: {},
                unique: ['uid', 'dsalt', 'cookie']
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
     * 根据`session.uid`创建用户，如果存在则会直接返回
     * @param user 用户(`session.uid`)
     * @database
     */
    public static async createUser(user: string) {
        //基于无符号UUIDv5进行生成，以保证每一个用户的唯一性
        const uuid = UUID.snameUUIDFromBytes(user).unsign()
        const findByUser = await this.context.database.get('paimon_user', uuid)
        if (findByUser.length === 0) {
            return await this.context.database.create('paimon_user', {
                uuid,
                user,
                uid: [],
                characet_id: []
            })
        } else {
            return findByUser[0]
        }
    }

    /**
     * 建立用户数据库操作
     * @param user 用户(`session.uid`)
     * @param master 高级权限
     */
    public static user(user: string, master: boolean = false) {
        //先创建用户
        this.createUser(user).then(usr => {
            //缓存用户数据
            this.userData = usr
        })
        //更新用户权限情况
        this.userMaster = master
        return this
    }

    public static get uuid(){
        return this.userData.uuid
    }

    public static get uid(){
        return this.userData.uid
    }

    public static get activeUID(){
        return this.userData.active_uid
    }

    public static get characterID(){
        return this.userData.characet_id
    }

    /**
     * 将用户数据操作同步至数据库
     * - 这个操作不会更新变量缓存
     * @database
     */
    public static async push() {
        //以UUID为基准进行更新
        await this.context.database.upsert('paimon_user', [this.userData], 'uuid')
    }

    /**
     * 结束user数据操作周期，更新数据并清空缓存
     */
    public static close() {
        this.push().then(() => { })
        this.userData = undefined
        this.userMaster = false
    }

    /**
     * 查询该用户下所有uid
     * - master用户拥有所有uid
     * @database
     */
    public static async findUID(): Promise<UID[]> {
        if (this.userMaster) {
            const uidT = await this.context.database.get('paimon_uid', {})
            //format
            return uidT.map(val => {
                return val.uid
            })
        } else {
            return this.userData.uid
        }
    }

    /**
     * 查询该用户下完整uid信息
     * - master用户拥有所有uid信息
     * @database
     */
    public static async fullUID(): Promise<PaimonUid[]> {
        return await this.context.database.get('paimon_uid',
            this.userMaster ? {} : { uid: this.uid }
        )
    }

    /**
     * 查询用户角色信息
     * - master用户拥有所有角色信息
     * @database
     */
    public static async characet(cuid?: number[]): Promise<PaimonCharacter[]> {
        if (cuid) {
            //未指定，将用户绑定的所有角色ID加上
            cuid = this.userData.characet_id
            //master返回全部，非master返回绑定的
            return await this.context.database.get('paimon_character', this.userMaster ? {} : { cuid })
        } else {
            //非master用户修剪至已绑定的
            if (!this.userMaster)
                cuid = cuid.map(id => { if (this.userData.characet_id.includes(id)) return id })
            return await this.context.database.get('paimon_character', { cuid })
        }
    }

    /**
     * 查询该用户下所有数据
     * @param allCharacet 是否携带完整角色数据（由于数据过多，为减轻负担默认关闭）
     */
    public static async all(allCharacet: boolean = false): Promise<PaimonUserAll> {
        return {
            uuid: this.userData.uuid,
            user: this.userData.user,
            uid: await this.fullUID(),
            active_uid: this.userData.active_uid,
            characet_id: allCharacet ? await this.characet() : this.userData.characet_id
        }
    }

    private static async _findUIDTable(uid: UID, tableKey: Keys<PaimonUid>) {
        const uidT: PaimonUid[] = await this.context.database.get('paimon_uid', { uid })
        if (this.uid.includes(uid) && uidT.length > 0) {
            return uidT[0][tableKey]
        } else {
            throw undefined
        }
    }
    /**
     * 根据uid查询对应cookie
     * @param uid 
     */
    public static cookieByUID = async (uid: UID): Promise<string> => this._findUIDTable(uid, 'cookie') as Promise<string>
    /**
     * 获取这个uid的设备salt
     * @param uid 
     */
    public static deviceSlat = async (uid: UID): Promise<string> => this._findUIDTable(uid, 'dsalt') as Promise<string>

    /**
     * 设置默认uid
     * @param uid 
     */
    public static setActive(uid: UID) {
        this.userData.active_uid = uid
    }

    /**
     * 创建uid数据
     * @param uid 
     */
    private static async createUID(uid: UID, cookie?: string) {
        const uidT = await this.context.database.get('paimon_uid', { uid })
        if (uidT.length === 0) {
            const dsalt = UUID.randomUUID().unsign()
            return await this.context.database.create('paimon_uid', { uid, cookie, dsalt })
        } else {
            return uidT[0]
        }
    }

    /**
     * 绑定这个uid
     * @param uid 
     * @returns {Promise<UID[]>} 该用户绑定的所有uid
     */
    public static async setUID(uid: UID): Promise<UID[]> {
        await this.createUID(uid)
        //如果未绑定过，则设置为默认uid
        if (this.userData.uid.length === 0)
            this.setActive(uid)
        //将uid加入绑定列表
        this.userData.uid.push(uid)
        return this.userData.uid
    }

    /**
     * 绑定cookie到用户默认uid或指定uid
     * @param cookie 
     * @param uid 指定cookie绑定到的uid
     */
    public static async setCookie(cookie: string, uid: UID = this.userData.active_uid) {
        if (!this.userData.uid.includes(uid) && !this.userMaster) {
            throw 'forbidden'
        }
        return await this.context.database.set('paimon_uid', { uid }, { cookie })
    }

    public static async resetDSalt(uid: UID) {
        return this.context.database.set('paimon_uid', { uid }, { dsalt: UUID.randomUUID().unsign() })
    }
}