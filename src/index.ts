import { Context, Schema, Service } from "koishi"
import '@koishijs/plugin-help'
import { PaimonBasicConfig, PaimonCommandConfig } from "./paimon"
import { GenshinAPI } from "./core"
import { PaimonCommand } from "./paimon/command"
import puppeteer from "koishi-plugin-puppeteer"

declare module 'koishi' {
    interface Context {
        paimon: Paimon
    }
}

class Paimon extends Service {
    private api: GenshinAPI
    private _uid: UID
    private _cookie: string
    private pptr: puppeteer

    constructor(ctx: Context, public config: Paimon.Config) {
        super(ctx, 'paimon', true)
        ctx.using(['database', 'puppeteer'], () => {
            if (config.useCommand) {
                this.pptr = ctx.puppeteer
                new PaimonCommand(ctx, config)
            }
        })
    }

    login(uid: UID, cookie?: string) {
        this.api = new GenshinAPI(uid.toString(), cookie)
        this._uid = uid
        this._cookie = cookie
        return this
    }

    /**
     * 执行米游社每日签到
     * @param uid 游戏uid
     * @param onlyInfo 只获取当天信息，不进行签到
     */
    async bbsSign(onlyInfo: boolean = false): Promise<SignInfo> {
        const params = { act_id: this.api.hoyo.act_id, region: this.api.region, uid: this._uid as string }
        if (!onlyInfo) {
            const doSign = await this.api.useAPI('bbsSign').fetch(params)
            if (doSign.retcode !== 0 || doSign.data?.risk_code === 375) {
                throw {
                    code: doSign.data?.risk_code === 375 ? -375 : doSign.retcode,
                    message: doSign.data?.risk_code === 375 ? '需要验证码' : doSign.message,
                    raw: doSign
                }
            }
        }
        const checkSign = await this.api.useAPI('bbsSignInfo').fetch(params)
        if (checkSign.retcode === 0) {
            return checkSign.data
        } else {
            throw {
                code: checkSign.data?.risk_code === 375 ? -375 : checkSign.retcode,
                message: checkSign.data?.risk_code === 375 ? '需要验证码' : checkSign.message,
                raw: checkSign
            }
        }
    }

    /**
     * 得到当天具体奖励
     * @param uid 
     * @param info 
     */
    async bbsSignAward(info: SignInfo): Promise<SignHomeAward> {
        return
    }

    async memo() {

    }

    async abyss() {

    }

    /**
     * 导入某个api，并将结果渲染为图片
     * @param def 
     * @param x 图片宽度
     * @param y 图片高度
     */
    async useImage<K extends keyof Paimon>(def: K, x?: number, y?: number): Promise<string | Buffer | ArrayBuffer> {
        const api = this[def]
        const desktopURL = this.config.render
        return
    }
}

namespace Paimon {
    export type Config = PaimonBasicConfig & PaimonCommandConfig
    export const Config = Schema.intersect([
        PaimonBasicConfig,
        Schema.union([
            PaimonCommandConfig
        ])
    ])
}

export default Paimon