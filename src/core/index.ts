import { PaimonCommand } from "./command/";
import { Context, DatabaseService, koishiConfig, Logger, PaimonDB, PaimonDBExtend } from "./common";
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
}