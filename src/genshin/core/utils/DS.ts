import { createHash } from 'node:crypto';
import { ServerType } from "./ServerType";
import { Random } from "./Random";

export class HoyoDS {
    private _st: 'cn' | 'os'
    private _slat: string = 'YVEIkzDFNHLeKXLxzqCA9TzxCpWwbIbk'
    public static readonly appVersion: string = '2.36.1'
    public static readonly clientType: string = '5'

    constructor(serverType: ServerType) {
        if (serverType === ServerType.CN || serverType === ServerType.CNB) {
            this._st = 'cn'
        } else {
            this._st = 'os'
        }
    }

    /**
     * 新版本DS计算方法
     */
    private new(body?: Record<string, any>, params?: Record<string, any>): string {
        let t: string = Math.round(new Date().getTime() / 1000).toString()
        let r: string = Random.randint(100001, 200000).toString()
        let b: string = body ? JSON.stringify(body) : ''
        let q: string = params ? encodeURI(JSON.stringify(params)) : ''
        let c: string = this.hash({ t, r, b, q })
        return `${t},${r},${c}`
    }

    /**
     * 旧版本DS计算方法
     */
    private old(): string {
        let t: string = Math.round(new Date().getTime() / 1000).toString()
        let r: string = Random.sample('abcdefghijklmnopqrstuvwxyz0123456789'.split(''), 6).join('')
        let c: string = this.hash({ t, r })
        return `${t},${r},${c}`
    }

    private hash(value: Record<string, any>): string {
        //默认加入salt
        let temp: string[] = ['salt=' + this._slat];
        //将object拆分为键值对array
        Object.keys(value).forEach(key => {
            temp.push(`${key}=${value[key]}`)
        })
        //序列化并md5哈希
        return createHash('md5').update(temp.join('&')).digest('hex')
    }

    /**
     * 获取安卓米游社DS
     */
    public get2Android(body?: Record<string, any>, params?: Record<string, any>): string {
        if (this._st === 'cn') {
            this._slat = 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs'
            return this.new(body, params)
        } else {
            this._slat = 'YVEIkzDFNHLeKXLxzqCA9TzxCpWwbIbk'
            return this.old()
        }
    }

    /**
     * 获取iOS米游社DS
     * 
     */
    public get2iOS(body?: Record<string, any>, params?: Record<string, any>): string {
        if (this._st === 'cn') {
            this._slat = 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs'
            return this.new(body, params)
        } else {
            this._slat = 'n0KjuIrKgLHh08LWSCYP0WXlVXaYvV64'
            return this.old()
        }
    }

    /**
     * 签到用DS
     */
    public getSign(): string {
        this._slat = 'YVEIkzDFNHLeKXLxzqCA9TzxCpWwbIbk'
        return this.old()
    }
}