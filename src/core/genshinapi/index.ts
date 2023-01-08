import axios from 'axios';
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

    async fetch<Api extends BBSApi.Keys<R>, Params extends BBSApi.Params<R, Api>>(api: Api, params: Params, sign: boolean = false): Promise<any> {
        const region = this.#region === RegionType.CN || this.#region === RegionType.CNB ? 'china' : 'overseas'
        const regionURL = BBSApi.region[region]
        const thisApi: APIStencilOption = BBSApi.stencil[api.toString()]
        let host: URL, body: BodyInit, qury: string
        if (thisApi.hostBy) {
            host = new URL(regionURL[`${typeof thisApi.hostBy === 'string' ? thisApi.hostBy : thisApi.hostBy[region]}`])
            host.pathname = typeof thisApi.url === 'string' ? thisApi.url : thisApi.url[region]
        } else {
            host = new URL(typeof thisApi.url === 'string' ? thisApi.url : thisApi.url[region])
        }
        if (thisApi.method === 'GET') {
            qury = new URLSearchParams(params as unknown as URLSearchParams).toString()
        } else {
            body = params as unknown as BodyInit
        }
        return (await axios({
            url: host.href,
            data: body ?? undefined,
            headers: sign ? this.#hoyoKit.signHeader(this.#cookie) : this.#hoyoKit.headers(this.#cookie, qury ? params : undefined, body ? params : undefined)
        })).data as any
    }
}
