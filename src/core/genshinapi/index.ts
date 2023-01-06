import { BBSApi } from './api-bbs';
import { Hoyo } from './utils/Hoyo';
import { getRegion, Region, RegionType, RegionTyper } from "./utils/Region";
export class GenshinAPI<U extends `${number}` = '10000', R extends RegionTyper = Region<U>> {
    #cookie: string
    #region: R
    #hoyoKit: Hoyo

    constructor(uid: U, cookie?: string) {
        this.#cookie = cookie
        this.#region = getRegion(uid) as R
        this.#hoyoKit = new Hoyo(uid)
    }

    get region() {
        return this.#region
    }

    get hoyo() {
        return this.#hoyoKit
    }

    async fetch<Api extends BBSApi.Keys<R>, Params extends BBSApi.Params<R, Api>>(api: Api, params: Params): Promise<any> {
        const regionURL = BBSApi.region[this.#region === RegionType.CN || this.#region === RegionType.CNB ? 'china' : 'overseas']
        const thisApi: APIStencilOption = BBSApi.stencil[api.toString()]
        let host: URL | string, body: Params, qury: string
        if (thisApi.type) {
            host = new URL(regionURL[`${thisApi.type}`])
            host.pathname = thisApi.url
        } else host = new URL(thisApi.url)
        this._apiParams = thisApi.parameters
        this._apiMethod = thisApi.method
        this._apiFetchObject = {
            baseURL: host.origin,
            url: host.pathname,
            // headers
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
