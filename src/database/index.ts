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

export interface UserData {
    uuid: string
    user: string
    active_uid: UID | null
    characet_id: number[]
    uid: Record<UID, Record<Keys<UserUID>, any>>
}

export interface UserUID {
    dsalt: string
    cookie: string | null
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
    private userData: UserData
    private userMaster: boolean = false

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
    private async createUser(user: string) {
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
    public async user(user: string, master: boolean = false) {
        const _userData = await this.createUser(user)
        const _uidList = await this.context.database.get('paimon_uid', { uuid: _userData.uuid})
        this.userData = {
            uuid: _userData.uuid,
            user: _userData.user,
            uid: this.objectify(_uidList),
            active_uid: _userData.active_uid,
            characet_id: _userData.characet_id
        }
        this.userMaster = master
        return this
    }

    //#region user datas
    public get uuid() {
        return this.userData.uuid
    }

    public get uid() {
        return this.userData.uid
    }

    // public set uid(uid) {
    //     this.userData.uid = uid
    // }

    public get activeUID() {
        return this.userData.active_uid
    }

    public set activeUID(activeUID) {
        this.userData.active_uid = activeUID
    }

    public get characterID() {
        return this.userData.characet_id
    }

    // public set characterID(characterID) {
    //     this.userData.characet_id = characterID
    // }
    //#endregion

    public parse(uuid: string, uidObject: Record<UID, Record<Keys<UserUID>, any>>): PaimonUid[] {
        return Object.keys(uidObject).map(uid => {
            return Object.assign(uidObject[uid], { uuid, uid: uid as UID })
        })
    }

    public objectify(uids: PaimonUid[]): Record<UID, Record<Keys<UserUID>, any>> {
        return Object.fromEntries(uids.map(u => {
            return [u.uid, { cookie: u.cookie, dsalt: u.dsalt }]
        }))
    }

    /**
     * 将用户数据操作同步至数据库
     * @database
     */
    public async push() {
        //更新能修改的用户数据
        await this.context.database.set('paimon_user', {
            uuid: this.userData.uuid
        }, {
            active_uid: this.userData.active_uid,
            characet_id: this.userData.characet_id
        })
        //同步uid修改
        await this.context.database.upsert('paimon_uid', this.parse(this.userData.uuid, this.userData.uid))
    }

    /**
     * 结束user数据操作周期，更新数据并清空缓存
     */
    public close() {
        this.push().then(() => { })
        this.userData = undefined
        this.userMaster = false
    }

    /**
     * 查询用户角色信息
     * - master用户能查询非绑定角色信息
     * @database
     */
    public async characters(cuid: number[] = this.userData.characet_id): Promise<PaimonCharacter[]> {
        if (!this.userMaster)
            cuid = cuid.map(id => { if (this.userData.characet_id.includes(id)) return id })
        if (cuid.length === 0) {
            return []
        } else {
            return await this.context.database.get('paimon_character', { cuid })
        }
    }

    /**
     * 查询该用户下所有数据
     * @param allCharacet 是否携带完整角色数据（由于数据过多，为减轻负担默认关闭）
     */
    public async all(allCharacet: boolean = false): Promise<UserData> {
        let d = this.userData
        if (allCharacet)
            d['characters'] = await this.characters()
        return d
    }

    private async _findUIDTable(uid: UID, tableKey: Keys<PaimonUid>) {
        if (this.userMaster) {
            //高权限直接查询uid表
            const uidT = await this.context.database.get('paimon_uid', { uid })
            return uidT[0][tableKey]
        } else {
            //用户拥有的uid组
            const userUIDArr = Object.keys(this.userData.uid)
            if (userUIDArr.includes(uid.toString()) && userUIDArr.length > 0) {
                this.push()
                return this.userData.uid[uid][tableKey]
            } else {
                throw undefined
            }
        }
    }
    /**
     * 根据uid查询对应cookie
     * @param uid 
     */
    public cookieByUID = async (uid: UID): Promise<string> => await this._findUIDTable(uid, 'cookie')
    /**
     * 获取这个uid的设备salt
     * @param uid 
     */
    public deviceSlat = async (uid: UID): Promise<string> => await this._findUIDTable(uid, 'dsalt')

    /**
     * 创建uid数据
     * @param uid 
     */
    private async createUID(uid: UID, cookie?: string) {
        console.log(this.userData)
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
     * @returns 该用户绑定的所有uid
     */
    public setUID(uid: UID) {
        //如果未绑定过，则设置默认uid
        if (Object.keys(this.userData.uid).length === 0 && !this.userData.active_uid)
            this.userData.active_uid = uid
        //将新uid加入绑定列表
        this.userData.uid[uid] = { cookie: null, dsalt: UUID.randomUUID().unsign() }
        this.push()
        return this
    }

    /**
     * 绑定cookie到用户默认uid或指定uid
     * @param cookie 
     * @param uid 指定cookie绑定到的uid
     */
    public setCookie(cookie: string, uid: UID = this.userData.active_uid) {
        this.userData.uid[uid].cookie = cookie
        this.push()
        return this
    }

    public async includesUID(uid: UID) {
        const f = await this.context.database.get('paimon_uid', { uid })
        return f.length > 0
    }

    /**
     * 移除这个uid，并返回新的uid组
     * @param uid 
     */
    public async removeUID(uid: UID) {
        if(uid === this.userData.active_uid)
            this.userData.active_uid = null
        //在数据库中移除该uid
        await this.context.database.remove('paimon_uid', { uid })
        delete this.userData.uid[uid]
        this.push()
        return this.userData.uid
    }



    public resetDSalt(uid: UID) {
        const newSalt = UUID.randomUUID().unsign()
        this.userData.uid[uid].dsalt = newSalt
        this.push()
        return newSalt
    }
}