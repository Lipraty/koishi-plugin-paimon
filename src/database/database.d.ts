import * as utils from "@koishijs/utils"

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