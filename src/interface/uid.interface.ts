type StrOnlyNum = `${number}` | number
type UID = StrOnlyNum
type CID = StrOnlyNum
type WID = StrOnlyNum
type simpTuple = [number, number]

enum ArtiType {
    FLOWER = 'flower',
    PLUME = 'plume',
    SANDS = 'sands',
    GOBLET = 'goblet',
    CIRCLET = 'circlet'
}

enum StatsType {

}

interface UserData {
    uuid: string
    activeUid: UID
    uids: Record<UID, UserUidData>
    characters?: string[] | Record<CID, UserCharacter>
    
}

interface UserUidData {
    cookie: string
    dsalt: string
    freeze: boolean
}

interface UserCharacter {
    gamename: string
    level: number
    weapon: UserWeapon
    artifacts: Record<ArtiType, UserArtifact>
    computer: BaseStats
}

/**
 * 用于计算的初始数据类型
 */
interface BaseStats<T extends simpTuple = [0, 0]> {
    /**[[number, percentage], result] */
    maxHP: [T, number]
    /**[[number, percentage], result] */
    atk: [T, number]
    /**[[number, percentage], result] */
    def: [T, number]
    /**Fullname: Elemental mastery */
    mastery: number
    /**[CRIT Rate, CRIT DMG] */
    crit: T
    /**
     * [Healing bonus, Incoming healing bonus]
     */
    healings: T
    /**Fullnam: energy recharge */
    energy: number
    /** Sequence:   Pyro, Hydro, Dendro, Electro, Anemo, Cryo, Geo, Physical
     * - [DMG, RES][]
     */
    elementals: [T, T, T, T, T, T, T, T]
}

interface BaseArifacts {

}

interface UserWeapon {
    wid: WID
    level: number
}

interface UserArtifact {
    artiname: string
    level: number
    mainStat: {
        mainId: string
        value: string
    }
}