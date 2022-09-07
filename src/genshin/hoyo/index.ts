export enum ServerType {
    CN = 'cn_gf01',
    CNB = 'cn_qd01',
    CHT = 'os_cht',
    EU = 'os_euro',
    AS = 'os_asia',
    US = 'os_usa'
}

export class HoyoAPI {
    private cookie: string
    private uid: string
    private stype: ServerType = ServerType.CN

    constructor(uid: string, cookie?: string) {
        this.uid = uid
        this.cookie = cookie

    }

    /**
     * 获取该UID所处服务器区域。
     * @returns 
     */
    private getServerType(): ServerType {
        const UT = parseInt(this.uid[0]) 
        switch (UT) {
            case 1 || 2:
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

    private async fetchAPI(apiName: string, url: string | URL, params: Record<string, any>){

    }

    /**
     * 米游社签到
     */
    public async sign(paramOptions: Record<string, string>){
        
    }

    public signSync(){

    }
}
