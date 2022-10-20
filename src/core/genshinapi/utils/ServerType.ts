export enum ServerType {
    CN = 'cn_gf01',
    CNB = 'cn_qd01',
    CHT = 'os_cht',
    EU = 'os_euro',
    AS = 'os_asia',
    US = 'os_usa'
}

export const getServerType = (uid: string): ServerType => {
    const UT = parseInt(uid[0])
    switch (UT) {
        case 1:
            return ServerType.CN
        case 2: 
            return ServerType.CN
        case 5:
            return ServerType.CNB
        case 6:
            return ServerType.US
        case 7:
            return ServerType.EU
        case 8:
            return ServerType.AS
        case 9:
            return ServerType.CHT
        default:
            return undefined
    }
}