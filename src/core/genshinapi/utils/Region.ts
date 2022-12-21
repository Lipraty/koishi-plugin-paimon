export enum RegionType {
    CN = 'cn_gf01',
    CNB = 'cn_qd01',
    CHT = 'os_cht',
    EU = 'os_euro',
    AS = 'os_asia',
    US = 'os_usa'
}

export const getRegion = (uid: string): RegionType => {
    const UT = parseInt(uid[0])
    switch (UT) {
        case 1:
            return RegionType.CN
        case 2:
            return RegionType.CN
        case 5:
            return RegionType.CNB
        case 6:
            return RegionType.US
        case 7:
            return RegionType.EU
        case 8:
            return RegionType.AS
        case 9:
            return RegionType.CHT
    }
}

export type RegionTyper = RegionType.CN | RegionType.CNB | RegionType.US | RegionType.EU | RegionType.AS | RegionType.CHT

export type Region<
    U extends `${number}`
> =
    U extends `${infer C}${infer R}`
    ? C extends '1' | '2'
    ? RegionType.CN
    : C extends '5'
    ? RegionType.CNB
    : C extends '6'
    ? RegionType.US
    : C extends '7'
    ? RegionType.EU
    : C extends '8'
    ? RegionType.AS
    : C extends '9'
    ? RegionType.CHT
    : never
    : never