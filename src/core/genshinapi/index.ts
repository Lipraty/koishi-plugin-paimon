import axios, { AxiosRequestConfig } from 'axios'
import { ChinaAPI } from "./china";
import { OverseasAPI } from "./overseas";
import { Hoyo } from './utils/Hoyo';
import { getServerType, ServerType } from "./utils/ServerType";

export class GenshinAPI {
    private _cookie: string
    private _region: ServerType = ServerType.CN
    private _hoyoKit: Hoyo
    private _apiParams: string[]
    private _apiMethod: "POST" | "post" | "GET" | "get"
    private _apiFetchObject: APIFetchObject

    constructor(uid: string, cookie?: string) {
        this._cookie = cookie
        this._region = getServerType(uid)
        this._hoyoKit = new Hoyo(uid)
    }

    public get region() {
        return this._region
    }

    public get hoyo() {
        return this._hoyoKit
    }

    public useAPI<A extends keyof APIList>(api: APIOption | A, headers?: Record<string, string | number | boolean>) {
        const apiRegion = (this._region === ServerType.CN || this._region === ServerType.CNB) ? ChinaAPI : OverseasAPI
        if (typeof api === 'string') {
            if (api === 'bbsSign' || api === 'bbsSignInfo') {
                headers = this._hoyoKit.signHeader(this._cookie)
            }
            if (apiRegion.apis[api])
                api = apiRegion.apis[api]
            else
                throw new TypeError('[GenshinAPI]This API does not exist')
        }
        let host: URL | string, body: any, qury: any
        if (api.type) {
            host = new URL(apiRegion[`${api.type}URL`])
            host.pathname = api.url
        } else host = new URL(api.url)
        this._apiParams = api.params
        this._apiMethod = api.method
        this._apiFetchObject = {
            baseURL: host.origin,
            url: host.pathname,
            headers
        }
        return this
    }

    public async fetch(params: string | Record<string, string | number | boolean> | URLSearchParams | string[][] | BodyInit, options?: FetchAPIOptions) {
        //根据请求类型获得正确请求参数
        if (params) {
            //修剪限制之外的param
            if (this._apiParams)
                params = Object.fromEntries(this._apiParams.filter(K => params.hasOwnProperty(K)).map(key => { return [key, params[key]] }))
            //根据请求类型填装数据
            if (this._apiMethod.toUpperCase() === 'GET') {
                this._apiFetchObject['url'] += '?' + new URLSearchParams(params as URLSearchParams).toString()
                this._apiFetchObject['headers'] ??= this._hoyoKit.headers(this._cookie)
            } else {
                this._apiFetchObject['data'] = params as BodyInit
                this._apiFetchObject['headers'] ??= this._hoyoKit.headers(this._cookie, undefined, params as Record<string, string | number | boolean>)
            }
        }
        return (await axios(this._apiFetchObject)).data as any
    }
}

export { ChinaAPI, OverseasAPI }