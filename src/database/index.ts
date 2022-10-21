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
    active_uid: UID
    characet_id: number[]
}

interface PaimonUserAll {
    uuid: string
    user: string
    uid: PaimonUserUID[]
    active_uid?: UID
    characet_id: number[]
}

interface PaimonUserUID {
    uid: UID
    dsalt?: string
    cookie?: string
}

export interface PaimonUid {
    uid: UID
    uuid: string
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
    private static userData: PaimonUserAll
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
                active_uid: 'string',
                characet_id: 'list'
            }, {
                primary: 'uuid',
                foreign: {
                    characet_id: ['paimon_character', 'cuid']
                },
                unique: ['uuid', 'user']
            })

            this.context.model.extend('paimon_uid', {
                uid: 'string',
                uuid: 'text',
                dsalt: 'text',
                cookie: 'text',
            }, {
                primary: 'uid',
                foreign: {
                    uuid: ['paimon_user', 'uuid']
                },
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
            //获取该用户绑定的uid
            this.context.database.get('paimon_uid', { uuid: usr.uuid }).then((uid: PaimonUid[]) => {
                this.userData = {
                    uuid: usr.uuid,
                    user: usr.user,
                    uid: uid.map(V => ({ uid: V.uid, cookie: V.cookie, dsalt: V.dsalt })),
                    active_uid: usr.active_uid,
                    characet_id: usr.characet_id
                }
            })
        })

        //更新用户权限情况
        this.userMaster = master
        return this
    }

    //#region user datas
    public static get uuid() {
        return this.userData.uuid
    }

    public static get uid() {
        return this.userData.uid
    }

    // public static set uid(uid) {
    //     this.userData.uid = uid
    // }

    public static get activeUID() {
        return this.userData.active_uid
    }

    public static set activeUID(activeUID) {
        this.userData.active_uid = activeUID
    }

    public static get characterID() {
        return this.userData.characet_id
    }

    // public static set characterID(characterID) {
    //     this.userData.characet_id = characterID
    // }
    //#endregion

    /**
     * 将用户数据操作同步至数据库
     * - 这个操作不会更新变量缓存
     * @database
     */
    public static async push() {
        //更新能修改的用户数据
        await this.context.database.upsert('paimon_user', [{
            active_uid: this.userData.active_uid,
            characet_id: this.userData.characet_id
        }], 'uuid')
        //同步uid
        await this.context.database.upsert('paimon_uid',
            //将uuid合并至用户uid表
            this.userData.uid.map(uid => Object.assign(uid, { uuid: this.userData.uuid })),
            'uuid')
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
     * 查询用户角色信息
     * - master用户拥有所有角色信息
     * @database
     */
    public static async characters(cuid?: number[]): Promise<PaimonCharacter[]> {
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
        let d = this.userData
        if (allCharacet)
            d['characters'] = await this.characters()
        return d
    }

    public static uidObject(): Record<UID, PaimonUserUID> {
        return Object.fromEntries(this.userData.uid.map(uidObj => {
            return [uidObj.uid, uidObj]
        }))
    }

    private static async _findUIDTable(uid: UID, tableKey: Keys<PaimonUid>) {
        if (this.userMaster) {
            //高权限直接查询uid表
            const uidT = await this.context.database.get('paimon_uid', { uid })
            return uidT[0][tableKey]
        } else {
            //用户拥有的uid组
            const userUIDArr = this.userData.uid.map(V => V.uid)
            if (userUIDArr.includes(uid) && userUIDArr.length > 0) {
                return this.uidObject()[uid][tableKey]
            } else {
                throw undefined
            }
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
     * 创建uid数据
     * @param uid 
     */
    private static async createUID(uid: UID, cookie?: string) {
        const uidT = await this.context.database.get('paimon_uid', { uid })
        //只有该uid不存在时创建
        if (uidT.length === 0) {
            const dsalt = UUID.randomUUID().unsign()
            return await this.context.database.create('paimon_uid', { uuid: this.userData.uuid, uid, cookie, dsalt })
        } else {
            return uidT[0]
        }
    }

    /**
     * 绑定一个uid
     * @param uid 
     * @returns {Promise<PaimonUserUID[]>} 该用户绑定的所有uid
     */
    public static async setUID(uid: UID): Promise<PaimonUserUID[]> {
        //如果未绑定过，则设置为默认uid
        if (this.userData.uid.length === 0)
            this.userData.active_uid = uid
        //创建uid数据
        await this.createUID(uid)
        //将uid加入绑定列表
        this.userData.uid.push({ uid })
        return this.userData.uid
    }

    /**
     * 移除这个uid，并返回新的uid组
     * @param uid 
     */
    public static async removeUID(uid: UID) {
        //在数据库中移除该uid
        await this.context.database.remove('paimon_uid', { uid })
        //设置为新的uid表数据
        this.userData.uid = await this.context.database.get('paimon_uid', { uuid: this.userData.uuid })
        return this.userData.uid
    }

    /**
     * 绑定cookie到用户默认uid或指定uid
     * @param cookie 
     * @param uid 指定cookie绑定到的uid
     */
    public static async setCookie(cookie: string, uid: UID = this.userData.active_uid) {
        if (!Object.keys(this.uidObject()).includes(uid as string) && !this.userMaster) {
            throw undefined
        }
        return await this.context.database.set('paimon_uid', { uid }, { cookie })
    }

    public static async resetDSalt(uid: UID) {
        return this.context.database.set('paimon_uid', { uid }, { dsalt: UUID.randomUUID().unsign() })
    }
}