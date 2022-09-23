import { ChinaAPI } from "./china";
import { OverseasAPI } from "./overseas";
import { Hoyo } from "./utils/Hoyo";
import { getServerType, ServerType } from "./utils/ServerType";

export class GenshinAPI {
    cookie: string
    uid: string
    serverType: ServerType = ServerType.CN
    device: string

    constructor(uid: string, cookie?: string, device?: string) {
        this.uid = uid
        this.cookie = cookie
        this.device = device
        this.serverType = getServerType(uid)
    }

    /**
     * 通用API请求
     * 
     * > 这个函数虽然是公开的，但是例如`act_id`、`uid`之类需要自行在`params`中额外指定一次。
     * 
     * @param api api选项
     */
    public async fetchAPI(api: APIOption | string): Promise<Response>
    /**
     * 通用API请求
     * 
     * > 这个函数虽然是公开的，但是例如`act_id`、`uid`之类需要自行在`params`中额外指定一次。
     * 
     * @param api api选项
     * @param params 请求参数
     */
    public async fetchAPI(api: APIOption | string, params?: Record<string, any>): Promise<Response>
    /**
     * 通用API请求
     * 
     * > 这个函数虽然是公开的，但是例如`act_id`、`uid`之类需要自行在`params`中额外指定一次。
     * 
     * @param api api选项
     * @param params 请求参数
     * @param options 额外fetch选项 
     */
    public async fetchAPI(api: APIOption | string, params?: Record<string, any>, options?: FetchAPIOptions): Promise<Response>
    /**
     * 通用API请求
     * 
     * > 这个函数虽然是公开的，但是例如`act_id`、`uid`之类需要自行在`params`中额外指定一次。
     * 
     * @param api api选项
     * @param params 请求参数
     * @param options 额外fetch选项 
     * @param otherHeaders 额外的Headers
     */
    public async fetchAPI(api: APIOption | string, params?: Record<string, any>, options?: FetchAPIOptions, otherHeaders?: HeadersInit): Promise<Response>
    public async fetchAPI(api: APIOption | string, params?: Record<string, any>, options?: FetchAPIOptions, otherHeaders?: HeadersInit): Promise<Response> {
        //根据地区载入对应的API地址
        const APIObject = (this.serverType === ServerType.CN || this.serverType === ServerType.CNB) ? ChinaAPI : OverseasAPI
        //当直接指定API名称时，则根据ServerType加载特定api
        if (typeof api === 'string') {
            if (APIObject.apis[api])
                api = APIObject.apis[api]
            else
                throw new TypeError('[GenshinAPI]This API does not exist')
        }
        ///处理意外情况
        if (api.params && !params)
            throw new SyntaxError(`[GenshinAPI]This API requires a ${api.params} parameters, but not provided.`)
        if (api.cookie && !this.cookie)
            throw new SyntaxError('[GenshinAPI]This API requires a `cookie`, is provided?')
        // if (!isEqual(api.params, params.keys()))
        //     throw new TypeError('[GenshinAPI]The provided params do not match what is required.')


        let host: URL | string
        let path: string = api.url
        let body = null
        let headers: HeadersInit

        //根据Type载入host
        if (api.type === 'takumi') {
            host = APIObject.takumiURL
        } else if (api.type === 'hk4e') {
            host = APIObject.hk4eURL
        } else if (api.type === 'record') {
            host = APIObject.recordURL
        } else {
            host = new URL(api.url)
            path = undefined
        }

        //转为URL
        if (typeof host === 'string')
            host = new URL(host)

        //根据请求类型获得正确请求参数与Headers
        if (params) {
            //如果限制了params，则抛弃限制之外的param。
            if (api.params)
                params = Object.fromEntries(api.params.filter(K => params.hasOwnProperty(K)).map(key => { return [key, params[key]] }))

            if (api.method === 'GET') {
                host.search = new URLSearchParams(params).toString()
                headers = Hoyo.headers(this.serverType, this.device, this.cookie, undefined, params)
            } else {
                body = params
                headers = Hoyo.headers(this.serverType, this.device, this.cookie, params, undefined)
            }
        }

        //合并额外的Headers
        if (otherHeaders)
            headers = Object.assign(headers, otherHeaders)

        return await fetch(host, { method: api.method, body, headers, ...options })
    }
}
