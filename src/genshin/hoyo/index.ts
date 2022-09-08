import { Random } from "../../utils/Random.util";
import { UUID } from "../../utils/UUID.util";
import { ChinaAPI } from "./china"
import { HoyoDS } from "./DS";
import { OverseasAPI } from "./overseas"

export enum ServerType {
    CN = 'cn_gf01',
    CNB = 'cn_qd01',
    CHT = 'os_cht',
    EU = 'os_euro',
    AS = 'os_asia',
    US = 'os_usa'
}

/**
 * Modified from 'RequestInit'
 */
interface FetchAPIOptions {
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    credentials?: RequestCredentials;
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /** A boolean to set request's keepalive. */
    keepalive?: boolean;
    /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
    mode?: RequestMode;
    /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
    redirect?: RequestRedirect;
    /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
    referrer?: string;
    /** A referrer policy to set request's referrerPolicy. */
    referrerPolicy?: ReferrerPolicy;
    /** An AbortSignal to set request's signal. */
    signal?: AbortSignal | null;
    /** Can only be null. Used to disassociate request from any Window. */
    window?: null;
}

export class HoyoAPI {
    private cookie: string
    private uid: string
    private stype: ServerType = ServerType.CN
    private act_id: string = 'e202009291139501'
    private Takumi: string | URL
    private Hk4e: string | URL
    private Record: string | URL
    private API: Record<string, APIOption>

    constructor(uid: string, cookie?: string) {
        this.uid = uid
        this.cookie = cookie

        this.stype = this.getServerType()

        if (this.stype === ServerType.CN || this.stype === ServerType.CNB) {
            this.Takumi = ChinaAPI.takumiURL
            this.Hk4e = ChinaAPI.hk4eURL
            this.Record = ChinaAPI.recordURL
            this.API = ChinaAPI.apis
        } else {
            this.Takumi = OverseasAPI.takumiURL
            this.Hk4e = OverseasAPI.hk4eURL
            this.Record = OverseasAPI.recordURL
            this.API = OverseasAPI.apis
        }
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

    private device(): string {
        return
    }

    private createHeaders(ck: boolean, query?: Record<string, any>, param?: Record<string, any>): HeadersInit {
        if (ck)
            return {
                'x-rpc-app_version': HoyoDS.appVersion,
                'x-rpc-client_type': HoyoDS.clientType,
                'x-rpc-device_id': UUID.randomUUID().unsign(),
                'User-Agent': Random.randUA(HoyoDS.appVersion, this.device()),
                'X-Requested-With': 'com.mihoyo.hyperion',
                'x-rpc-platform': 'android',
                'x-rpc-device_model': this.device(),
                'x-rpc-device_name': this.device(),
                'x-rpc-channel': 'miyousheluodi',
                'x-rpc-sys_version': '6.0.1',
                'Referer': Random.randRef(this.act_id),
                'DS': new HoyoDS(this.stype).getSign(),
                'cookie': this.cookie
            }
        else
            return {
                'x-rpc-app_version': HoyoDS.appVersion,
                'x-rpc-client_type': HoyoDS.clientType,
                'User-Agent': Random.randUA(HoyoDS.appVersion, this.device()),
                'DS': new HoyoDS(this.stype).get2Android(query, param)
            }
    }

    /**
     * 通用API请求
     * @param api api选项
     * @param params 请求参数
     * @param options 额外fetch选项 
     * @param otherHeaders 额外的Headers
     */
    private async fetchAPI(api: APIOption): Promise<Response>
    private async fetchAPI(api: APIOption, params?: Record<string, any>): Promise<Response>
    private async fetchAPI(api: APIOption, params?: Record<string, any>, options?: FetchAPIOptions): Promise<Response>
    private async fetchAPI(api: APIOption, params?: Record<string, any>, options?: FetchAPIOptions, otherHeaders?: HeadersInit): Promise<Response> {
        ///处理意外情况
        if (api.params && !params)
            throw new SyntaxError(`[HoyoAPI]The API requires: ${api.params} parameters, but not provided.`)

        let host: URL | string
        let path: string = api.url
        let body = null
        let headers: HeadersInit

        //根据Type载入host
        if (api.type === 'takumi') {
            host = this.Takumi
        } else if (api.type === 'hk4e') {
            host = this.Hk4e
        } else if (api.type === 'record') {
            host = this.Record
        } else {
            host = new URL(api.url)
            path = undefined
        }

        //转为URL
        if (typeof host === 'string')
            host = new URL(host)

        //根据请求类型获得正确请求参数与Headers
        if (params) {
            if (api.method === 'GET') {
                host.search = new URLSearchParams(params).toString()
                headers = this.createHeaders(api.cookie, undefined, params)
            } else {
                body = params
                headers = this.createHeaders(api.cookie, params, undefined)
            }
        }

        //额外Headers
        if (otherHeaders)
            headers = Object.assign(headers, otherHeaders)

        return await fetch(host, { method: api.method, body, headers, ...options })
    }

    /**
     * 米游社签到
     */
    public async bbsSign(paramOptions: Record<string, string>) {
        return await this.fetchAPI(this.API.sign, {
            act_id: this.act_id,
            region: this.stype,
            uid: this.uid
        })
    }
}
