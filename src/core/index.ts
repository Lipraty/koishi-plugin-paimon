import { UUID } from "../utils/UUID.util";
import { basicCommand, cmdBootstrap, ICommand } from "./command";
import { Command, Context, DatabaseService, koishiCOnfig, koishiConfig, Logger, PaimonDB, PaimonDBExtend, Schema } from "./common";
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
    private ctx: Context
    private cfg: koishiConfig
    private _db: DatabaseService
    private logger = new Logger('paimom')
    private startDate: number
    /**
     * 
     * @param context 
     * @param config 
     */
    constructor(context: Context, config: koishiConfig) {
        this.startDate = performance.now()
        this.ctx = context
        this.cfg = config
        //注册`paomon`数据库模型
        context.model.extend('paimon', PaimonDBExtend.fields, PaimonDBExtend.option)
        this._db = context.database

        if(!config.cookieKey){
            const CKKey = UUID.randomUUID().unsign()
            Object.assign(Context.Config.Advanced.dict, {
                cookieKey: Schema.string().default(CKKey)
            })
            this.logger.info('config.cookieKey is undefined. set key:', CKKey)
        }else{
            this.logger.info('config.cookieKey setted!. the key:', config.cookieKey)
        }
    }

    private createBasicCommand(){
        return this.ctx.command('paimon', '派蒙小助手，具体用法可发送paimon -h查看').alias('genshin', 'ys')
    }

    public get database(): DatabaseService { return this._db }

    public get context(): Context { return this.ctx }

    public get config() { return this.cfg }

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
    public create(commandModules: Array<any>) {
        //Use koishi command
        const koishiCmd = this.createBasicCommand()
        //Use subcommand
        if (commandModules) {
            let N = commandModules.length
            commandModules.forEach((command: { new(): basicCommand }) => {
                try {
                    if (new command().cmd) {
                        cmdBootstrap(this, koishiCmd, new command)
                    } else {
                        N--
                    }
                } catch (error) {
                    N--
                }
            })
            this.logger.info('started! installed', N, 'subcommands and options, takes', (performance.now() - this.startDate), 'ms')
        } else {
            this.logger.error('install modules fail.')
        }
    }

    public use(service: PropertyDescriptorMap & ThisType<any>) {
        //注入service到Paimon实例
        Object.defineProperties(Paimon.prototype, service)
    }
}