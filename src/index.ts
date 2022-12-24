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

type PaimonExclude = 'constructor' | 'render' | 'caller' | 'pptrLoaded' | 'login' | 'config' | 'ctx'
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

    /**
     * 创建原始GenshinAPI
     * @param uid 
     * @param cookie 
     */
    static create(uid: UID, cookie?: string): GenshinAPI {
        return new GenshinAPI(`${uid}`, cookie)
    }

    /**
     * 登入信息
     * @param uid 
     * @param cookie 
     */
    login(uid: UID, cookie?: string) {
        this.api = new GenshinAPI(`${uid}`, cookie)
        this._uid = uid
        this._cookie = cookie
        return this
    }

    private async apiFetch() {

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
     * @param api 要导入的api函数
     * @param elementType 决定返回元素的类型，默认为`buffer`
     */
    render<K extends Exclude<keyof Paimon, PaimonExclude>, E extends ImageElementType>(api: K, elementType?: E): ImageCurring<this[K], E>
    /**
     * 导入某个api，并将结果渲染为图片
     * @param api 要导入的api函数
     * @param x 图片宽度，默认350px
     * @param y 图片高度，默认800px
     * @param elementType 决定返回元素的类型，默认为`buffer`
     */
    render<K extends Exclude<keyof Paimon, PaimonExclude>, E extends ImageElementType>(api: K, x?: number, y?: number, elementType?: E): ImageCurring<this[K], E>
    render<K extends Exclude<keyof Paimon, PaimonExclude>, E extends ImageElementType>(api: K, xOrElement?: number | E, y: number = 800, elementType?: E): ImageCurring<this[K], E> {
        return async (...args: Parameters<this[K]>): Promise<any> => {
            const x = typeof xOrElement === 'number' ? xOrElement : 350
            const url = new URL(this.config.render)
            if (typeof xOrElement !== 'number')
                elementType = xOrElement
            try {
                const data = await (this[api].apply(this, args) as ReturnType<this[K]>)
                if (!data) throw new Error('the api is not retrun')

                url.pathname = api + '?data=' + Buffer.from(JSON.stringify(data)).toString('base64')
            } catch (error) {
                if (error?.code !== 0) {
                    this.logger.debug('HTTP Error:', error)
                } else {
                    this.logger.debug('Fail api.', error)
                }
                throw new Error(error)
            }
            //create pptr page
            const page = await this.ctx.puppeteer.page()
            page.on('load', () => this.pptrLoaded = true)
            //shorcut page
            try {
                await page.setViewport({ width: x, height: y })
                this.logger.info('[api screenshot] navigating api to ' + api)
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
                throw new Error(`Failed rendering ${api}'s image.`)
            }
            //codeing buffer
            const imageBuffer = await page.screenshot({ fullPage: true })
            //    ^?
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