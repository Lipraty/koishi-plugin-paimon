import { PaimonCommand } from "./command/";
import { Context, DatabaseService, Keys, koishiConfig, Logger, PaimonDB, PaimonDBExtend, Result } from "./common";
export * from './common'
declare module 'koishi' {
    interface Tables {
        paimon: PaimonDB
    }

    namespace Context {
        interface Config extends koishiConfig {

        }
    }
}

export class Paimon {
    private __startTime: number
    public context: Context
    public config: koishiConfig
    public database: DatabaseService
    public readonly logger = new Logger('paimom')
    /**
     * 
     * @param context 
     * @param config 
     */
    constructor(context: Context, config: koishiConfig) {
        this.__startTime = performance.now()
        this.context = context
        this.config = config
        //注册`paomon`数据库模型
        context.model.extend('paimon', PaimonDBExtend.fields, PaimonDBExtend.option)
        this.database = context.database

        // if(!config.cookieKey){
        //     const CKKey = UUID.randomUUID().unsign()
        //     Object.assign(Context.Config.Advanced.dict, {
        //         cookieKey: Schema.string().default(CKKey)
        //     })
        //     this.logger.info('config.cookieKey is undefined. set key:', CKKey)
        // }else{
        //     this.logger.info('config.cookieKey setted!. the key:', config.cookieKey)
        // }
    }

    /**
     * Load webpages with Puppeteer and render to images
     * @param url webpage url. `no local support`
     * @param option 
     */
    public screenWebToImage(url: string | URL, option: ScreenWebToImageOptions) {

    }

    /**
     * 创建Paimon命令对象
     */
    public create(methods: any[]) {
        this.logger.info('running create...')
        const paimonCmd = new PaimonCommand()
        paimonCmd.bootstrap(this.context, methods)
    }

    /**
     * 根据UID查询数据库数据
     * @param ctx
     * @param uid 
     */
    public static async findByUID(ctx: Context, uid: string) {
        return await ctx.database.get('paimon', { uid })
    }

    /**
     * 根据session.uid查询数据库数据
     * @param ctx 
     * @param user 
     * @param formatFn 
     */
    public static async findByUser<U>(ctx: Context, user: string, formatFn?: (data: Result<PaimonDB, Keys<PaimonDB, any>, (...args: any) => any>, index: number) => U) {
        const dataList = await ctx.database.get('paimon', { user })
        if (formatFn) {
            return dataList.map(formatFn)
        } else {
            return dataList
        }
    }

    /**
     * 验证UID是否存在
     * @param ctx 
     * @param uid 
     */
    public static async exiUID(ctx: Context, uid: string) {
        return (await ctx.database.get('paimon', { uid })).length > 0
    }
}