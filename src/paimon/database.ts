import { DatabaseService, Context } from "koishi"
import * as utils from "@koishijs/utils"

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

export interface PaimonUid {
    uid: number | `${number}`
    uuid: string
    dsalt: string
    cookie: string
    freeze: boolean
}

export namespace PaimonUid {
    export type Field = keyof PaimonUid
    export const fields: Field[] = []
    export type Observed<K extends Field = Field> = utils.Observed<Pick<PaimonUid, K>, Promise<void>>
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

export class PaimonDatabase extends DatabaseService {
    constructor(app: Context) {
        super(app)
        //#region extend database
        this.extend('user', {
            uuid: 'text',
            active_uid: 'string',
            characet_id: 'list'
        })

        this.extend('paimon_uid', {
            uid: 'string',
            uuid: 'text',
            dsalt: 'text',
            cookie: 'text',
            freeze: { type: 'boolean', initial: false }
        }, {
            primary: 'uid',
            unique: ['uid']
        })

        this.extend('paimon_character', {
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
        //#endregion

    }
}