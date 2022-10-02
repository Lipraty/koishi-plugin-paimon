import axios, { AxiosRequestConfig } from 'axios'
import { ChinaAPI } from "./china";
import { OverseasAPI } from "./overseas";
import { Hoyo } from './utils/Hoyo';
import { getServerType, ServerType } from "./utils/ServerType";

export class GenshinAPI {
    public cookie: string
    public uid: string
    public serverType: ServerType = ServerType.CN
    public hoyoKit: Hoyo

    constructor(uid: string, cookie?: string) {
        this.uid = uid
        this.cookie = cookie
        this.serverType = getServerType(uid)
        this.hoyoKit = new Hoyo(uid)
    }

    /**
     * 通用API请求
     * 
     * > 这个函数虽然是公开的，但是例如`act_id`、`uid`之类需要自行在`params`中额外指定一次。
     * 
     * @param api api选项
     * @param headers 请求所需的headers
     */
    public async fetchAPI(api: APIOption | string, headers: Record<string, string | number | boolean>): Promise<any>
    /**
     * 通用API请求
     * 
     * > 这个函数虽然是公开的，但是例如`act_id`、`uid`之类需要自行在`params`中额外指定一次。
     * 
     * @param api api选项
     * @param headers 请求所需的headers
     * @param params 请求参数
     */
    public async fetchAPI(api: APIOption | string, headers: Record<string, string | number | boolean>, params?: string | Record<string, string> | URLSearchParams | string[][] | BodyInit): Promise<any>
    /**
     * 通用API请求
     * 
     * > 这个函数虽然是公开的，但是例如`act_id`、`uid`之类需要自行在`params`中额外指定一次。
     * 
     * @param api api选项
     * @param headers 请求所需的headers
     * @param params 请求参数
     * @param options 额外fetch选项 
     */
    public async fetchAPI(api: APIOption | string, headers: Record<string, string | number | boolean>, params?: string | Record<string, string> | URLSearchParams | string[][] | BodyInit, options?: FetchAPIOptions): Promise<any>
    public async fetchAPI(api: APIOption | string, headers: Record<string, string | number | boolean>, params?: string | Record<string, string> | URLSearchParams | string[][] | BodyInit, options?: FetchAPIOptions): Promise<any> {
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
        if (api.type) {
            //根据Type载入host
            if (api.type === 'takumi') {
                host = APIObject.takumiURL
            } else if (api.type === 'hk4e') {
                host = APIObject.hk4eURL
            } else if (api.type === 'record') {
                host = APIObject.recordURL
            }
            if (typeof host === 'string') {
                host = new URL(host)
            }
            host.pathname = api.url
        } else {
            //如果未定义type，则将url作为host，而不是path。
            host = new URL(api.url)
        }

        let axiosInit: AxiosRequestConfig = {
            baseURL: host.origin,
            url: host.pathname,
            method: api.method,
            headers,
        }

        //根据请求类型获得正确请求参数
        if (params) {
            //修剪限制之外的param。
            if (api.params)
                params = Object.fromEntries(api.params.filter(K => params.hasOwnProperty(K)).map(key => { return [key, params[key]] }))
            if (api.method === 'GET') {
                axiosInit.params = new URLSearchParams(params as URLSearchParams).toString()
            } else {
                axiosInit.data = params as BodyInit
            }
        }

        return await axios(axiosInit)
    }
}

export { ChinaAPI, OverseasAPI }