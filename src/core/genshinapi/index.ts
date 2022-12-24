import { Hoyo } from './utils/Hoyo';
import { getRegion, Region, RegionType, RegionTyper } from "./utils/Region";
export class GenshinAPI<U extends `${number}`, R extends RegionTyper = Region<U>> {
    private _cookie: string
    private _region: R
    private _hoyoKit: Hoyo
    private _apiParams: string[]
    private _apiMethod: "POST" | "post" | "GET" | "get"
    private _apiFetchObject: APIFetchObject

    constructor(uid: U, cookie?: string) {
        this._cookie = cookie
        this._region = getRegion(uid) as R
        this._hoyoKit = new Hoyo(uid)
    }

    public get region() {
        return this._region
    }

    public get hoyo() {
        return this._hoyoKit
    }

    public fetch<Api extends keyof RegionAPI<R>, Params extends Record<RegionAPI<R>[Api]['params'][number],any>>(api: Api, params: Params) {
        const thisApi = ((this._region === RegionType.CN || this._region === RegionType.CNB) ? ChinaAPI : OverseasAPI)['apis'][api.toString()]
        let host: URL | string, body: any, qury: any
        if (thisApi.type) {
            host = new URL(thisApi[`${thisApi.type}URL`])
            host.pathname = thisApi.url
        } else host = new URL(thisApi.url)
        this._apiParams = thisApi.params
        this._apiMethod = thisApi.method
        this._apiFetchObject = {
            baseURL: host.origin,
            url: host.pathname,
            headers
        }
        return this
    }

    // public async fetch(params: string | Record<string, string | number | boolean> | URLSearchParams | string[][] | BodyInit, options?: FetchAPIOptions) {
    //     //根据请求类型获得正确请求参数
    //     if (params) {
    //         //修剪限制之外的param
    //         if (this._apiParams)
    //             params = Object.fromEntries(this._apiParams.filter(K => params.hasOwnProperty(K)).map(key => { return [key, params[key]] }))
    //         //根据请求类型填装数据
    //         if (this._apiMethod.toUpperCase() === 'GET') {
    //             this._apiFetchObject['url'] += '?' + new URLSearchParams(params as URLSearchParams).toString()
    //             this._apiFetchObject['headers'] ??= this._hoyoKit.headers(this._cookie)
    //         } else {
    //             this._apiFetchObject['data'] = params as BodyInit
    //             this._apiFetchObject['headers'] ??= this._hoyoKit.headers(this._cookie, undefined, params as Record<string, string | number | boolean>)
    //         }
    //     }
    //     return (await axios(this._apiFetchObject)).data as any
    // }
}

export { ChinaAPI, OverseasAPI }