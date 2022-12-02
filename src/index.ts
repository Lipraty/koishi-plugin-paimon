import { Context, Logger, Schema, Service, h, segment } from "koishi"
import '@koishijs/plugin-help'
import { PaimonBasicConfig, PaimonCommandConfig } from "./paimon"
import { GenshinAPI } from "./core"
import PaimonCommand from "./paimon/command"
import { } from "koishi-plugin-puppeteer"

declare module 'koishi' {
    interface Context {
        paimon: Paimon
    }
}

type PaimonExclude = 'useImage' | 'caller' | 'pptrLoaded' | 'login' | 'config' | 'ctx'
type ImageElementType = 'base64' | 'buffer' | 'element'
type EleTypeFloat<E> = E extends 'base64' ? string : E extends 'buffer' ? Buffer : E extends 'element' ? h : E
type ImageCurring<P extends (...args: any) => any, E extends ImageElementType> = (...args: Parameters<P>) => Promise<EleTypeFloat<E>>

class Paimon extends Service {
    public static using = ['database', 'puppeteer']
    private api: GenshinAPI
    private _uid: UID
    private _cookie: string
    private logger: Logger
    private pptrLoaded: boolean = false

    constructor(public ctx: Context, public config: Paimon.Config) {
        super(ctx, 'paimon', true)
        this.logger = ctx.logger('paimon')
        ctx.plugin(PaimonCommand)
    }

    static create(uid: UID, cookie?: string): GenshinAPI {
        return new GenshinAPI(uid, cookie)
    }

    login(uid: UID, cookie?: string) {
        this.api = new GenshinAPI(uid.toString(), cookie)
        this._uid = uid
        this._cookie = cookie
        return this
    }

    /**
     * 执行米游社每日签到
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
     * @param def 要导入的api函数
     * @param elementType 决定返回元素的类型，默认为`buffer`
     */
    useImage<K extends Exclude<keyof Paimon, PaimonExclude>, E extends ImageElementType>(def: K, elementType?: E): ImageCurring<this[K], E>
    /**
     * 导入某个api，并将结果渲染为图片
     * @param def 要导入的api函数
     * @param x 图片宽度，默认350px
     * @param y 图片高度，默认800px
     * @param elementType 决定返回元素的类型，默认为`buffer`
     */
    useImage<K extends Exclude<keyof Paimon, PaimonExclude>, E extends ImageElementType>(def: K, x?: number, y?: number, elementType?: E): ImageCurring<this[K], E>
    useImage<K extends Exclude<keyof Paimon, PaimonExclude>, E extends ImageElementType>(def: K, xOrElement?: number | E, y: number = 800, elementType?: E): ImageCurring<this[K], E> {
        return async (...args: Parameters<this[K]>): Promise<any> => {
            const x = typeof xOrElement === 'number' ? xOrElement : 350
            if (typeof xOrElement !== 'number')
                elementType = xOrElement
            const _request = this[def].apply(this, args) as ReturnType<this[K]>
            const data = await _request
            if (!data) {
                throw new Error('the api is not retrun')
            }
            //create pptr page
            const page = await this.ctx.puppeteer.page()
            page.on('load', () => this.pptrLoaded = true)
            //
            try {
                const url = new URL(this.config.render)
                url.pathname = def + '?buf=' + Buffer.from(JSON.stringify(data)).toString('base64')
                await page.setViewport({ width: x, height: y })
                this.logger.info('[api screenshot] navigating api to ' + def)
                await new Promise<void>((res, rej) => {
                    page.goto(url.href, {
                        waitUntil: 'networkidle0',
                        timeout: this.config.renderTimeout,
                    }).then(() => {
                        return this.pptrLoaded ? res() : rej(new Error('[api screenshot] navigation timeout'))
                    })
                })
            } catch (error) {
                page.close()
                this.logger.debug(error)
                throw new Error(`Failed rendering ${def}'s image.`)
            }
            const imageBuffer = await page.screenshot({ fullPage: true })
            switch (elementType) {
                case 'base64':
                    return imageBuffer.toString('base64')
                case 'buffer':
                    return imageBuffer
                case 'element':
                    return segment.image(imageBuffer)
            }
        }
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