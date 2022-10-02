import { createHash } from "node:crypto"
import { DeviceInfo } from "./device"
import { Random } from "./Random"
import { getServerType, ServerType } from "./ServerType"
import { UUID } from "./UUID"

type HoyoConfig = {
    actID: string
    clientType: number
    appver: string
    header: string
    salt: string
}

const config: Record<'cn' | 'os', HoyoConfig> = {
    cn: {
        actID: 'e202009291139501',
        clientType: 5,
        appver: '2.37.1',
        header: 'miHoYoBBS',
        salt: 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs'
    },
    os: {
        actID: '',
        clientType: 5,
        appver: '2.9.0',
        header: 'miHoYoBBSOversea',
        salt: 'n0KjuIrKgLHh08LWSCYP0WXlVXaYvV64'
    }
}

export class Hoyo {
    private srvType: 'cn' | 'os'
    private device: DeviceInformation
    private conf: HoyoConfig

    constructor(uid: string) {
        let serverType = getServerType(uid)
        if (serverType === ServerType.CN || serverType === ServerType.CNB) {
            this.srvType = 'cn'
            this.conf = config.cn
        } else {
            this.srvType = 'os'
            this.conf = config.os
        }

        //基于UID创建Device信息
        this.device = new DeviceInfo(uid).createDevice()
    }

    get act_id() {
        return this.conf.actID
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
        let temp: string[] = ['salt=' + this.conf.salt];
        //将object拆分为键值对array
        Object.keys(value).forEach(key => {
            temp.push(`${key}=${value[key]}`)
        })
        //序列化并md5哈希
        return createHash('md5').update(temp.join('&')).digest('hex')
    }
    //# miHoyoDS END

    public headers(cookie: string, query?: Record<string, any>, body?: Record<string, any>): Record<string, string | number | boolean> {
        return {
            'x-rpc-app_version': this.conf.appver,
            'x-rpc-client_type': this.conf.clientType.toString(),
            'cookie': cookie,
            'User-Agent': [Random.randUA(this.device.Display), `${this.conf.header}/${this.conf.appver}`].join(' '),
            'Referer': this.srvType === 'cn' ? `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${this.act_id}&utm_source=bbs&utm_medium=mys&utm_campaign=icon` : `https://webstatic-sea.hoyolab.com`,
            'DS': this.newDS(query, body)
        }
    }

    public signHeader(cookie: string): Record<string, string | number | boolean> {
        let headers = this.headers(cookie)

        headers['DS'] = this.oldDS()

        return Object.assign(headers, {
            'x-rpc-device_id': UUID.randomUUID(),
            'x-rpc-platform': 'android',
            'x-rpc-device_model': this.device.Model,
            'x-rpc-device_name': this.device.Display,
            'x-rpc-channel': 'miyousheluodi',
            'x-rpc-sys_version': '6.0.1',
            'X-Requested-With': this.srvType === 'cn' ? 'com.mihoyo.hyperion' : 'com.mihoyo.hoyolab'
        })
    }
}