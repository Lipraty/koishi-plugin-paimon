enum serverType {
    CN = 'china',
    CHM = 'hokongmacao',
    EU = 'europe',
    AS = 'asia',
    US = 'unitedstates'
}

export class HoyoAPI {
    private cookie: string
    private uid: string
    private server: string = 'cn'

    constructor(uid: string, cookie?: string) {
        this.uid = uid
        this.cookie = cookie

    }

    private getServerType(): serverType {
        const UT = this.uid.slice(0, 1)
        switch (UT) {
            case '1' || '2' || '5':
                return serverType.CN
            case '6':
                return serverType.US
            case '7':
                return serverType.EU
            case '8':
                return serverType.AS
            case '9':
                return serverType.CHM
            default:
                return undefined
        }
    }
}
