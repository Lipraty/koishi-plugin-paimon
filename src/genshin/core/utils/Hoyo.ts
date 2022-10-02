import { createHash } from "node:crypto"
import { Random } from "./Random"
import { ServerType } from "./ServerType"
import { UUID } from "./UUID"

type ClientType = 1 | 2 | 3 | 4 | 5

const config = {
    act_id: 'e202009291139501',
    saltCN: 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs',
    saltOS: 'n0KjuIrKgLHh08LWSCYP0WXlVXaYvV64',
    appverCN: '2.37.1',
    appverOS: '2.9.0',
    headerCN: 'miHoYoBBS',
    headerOS: 'miHoYoBBSOversea'
}

export class Hoyo {
    public readonly act_id = config.act_id
    private salt: string = 'YVEIkzDFNHLeKXLxzqCA9TzxCpWwbIbk'
    private appVersion: string
    private clientType: ClientType
    private st: 'cn' | 'os'
    private _UAEnd: string
    private device: string

    public static readonly act_id: string = config.act_id

    constructor(serverType: ServerType, device?: string)
    constructor(serverType: ServerType, client?: ClientType)
    constructor(serverType: ServerType, deviceORclient?: string | ClientType) {
        if (serverType === ServerType.CN || serverType === ServerType.CNB) {
            this.st = 'cn'
            this.salt = config.saltCN
            this.appVersion = config.appverCN
            this.clientType = 5
            this._UAEnd = `miHoYoBBS/${this.appVersion}`
        } else {
            this.st = 'os'
            this.salt = config.saltOS
            this.appVersion = config.appverOS
            this.clientType = 2
            this._UAEnd = `miHoYoBBSOversea/${this.appVersion}`
        }

        if (typeof deviceORclient === 'string') {
            this.device = deviceORclient
        } else {
            this.device = this.createDevice()
            this.clientType = deviceORclient
        }
    }

    //# miHoyoDS
    /**
     * 获取新版ds内容
     * @param body 
     * @param params 
     * @returns 
     */
    public newDS(body?: Record<string, any>, params?: Record<string, any>): string {
        let t: string = Math.round(new Date().getTime() / 1000).toString()
        let r: string = Random.randint(100001, 200000).toString()
        let b: string = body ? JSON.stringify(body) : ''
        let q: string = params ? encodeURI(JSON.stringify(params)) : ''
        let c: string = this.hash({ t, r, b, q })
        return `${t},${r},${c}`
    }

    /**
     * 旧版本ds内容，主要用于签到
     */
    public oldDS(): string {
        let t: string = Math.round(new Date().getTime() / 1000).toString()
        let r: string = Random.sample('abcdefghijklmnopqrstuvwxyz0123456789'.split(''), 6).join('')
        let c: string = this.hash({ t, r })
        return `${t},${r},${c}`
    }

    private hash(value: Record<string, any>): string {
        //默认加入salt
        let temp: string[] = ['salt=' + this.salt];
        //将object拆分为键值对array
        Object.keys(value).forEach(key => {
            temp.push(`${key}=${value[key]}`)
        })
        //序列化并md5哈希
        return createHash('md5').update(temp.join('&')).digest('hex')
    }
    //# miHoyoDS END

    public createDevice() {
        return `Paimon/${Random.randstr(12)}`
    }

    public headers(cookie: string, query?: Record<string, any>, body?: Record<string, any>): Record<string, string | number | boolean> {
        return {
            'x-rpc-app_version': this.appVersion,
            'x-rpc-client_type': this.clientType.toString(),
            'cookie': cookie,
            'User-Agent': [Random.randUA(this.device), this._UAEnd].join(' '),
            'Referer': this.st === 'cn' ? `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${this.act_id}&utm_source=bbs&utm_medium=mys&utm_campaign=icon` : `https://webstatic-sea.hoyolab.com`,
            'DS': this.newDS(query, body)
        }
    }

    public signHeader(cookie: string): Record<string, string | number | boolean> {
        this.salt = 'YVEIkzDFNHLeKXLxzqCA9TzxCpWwbIbk'
        let headers = this.headers(cookie)

        headers['DS'] = this.oldDS()

        return Object.assign(headers, {
            'x-rpc-device_id': UUID.randomUUID(),
            'x-rpc-platform': 'android',
            'x-rpc-device_model': `MI ${this.device}`,
            'x-rpc-device_name': `MI ${this.device}`,
            'x-rpc-channel': 'miyousheluodi',
            'x-rpc-sys_version': '6.0.1',
            'X-Requested-With': this.st === 'cn' ? 'com.mihoyo.hyperion' : 'com.mihoyo.hoyolab'
        })
    }
}