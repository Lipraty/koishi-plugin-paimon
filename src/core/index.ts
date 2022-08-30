import { basicCommand, cmdBootstrap, ICommand } from "./command";
import { Command, Context, DatabaseService, koishiConfig, Logger } from "./common";
export * from './common'

export class Paimon {
    private ctx: Context
    private cfg: koishiConfig
    private _database: DatabaseService
    private _pptr
    private static _srv: Record<string, any>
    private logger = new Logger('paimom')
    private startDate: number

    constructor(ctx: Context, config: koishiConfig) {
        this.startDate = performance.now()
        //注册Context到Paimon
        this.ctx = ctx
        //注册Config到Paimon
        this.cfg = config
        //注册`paomon`数据库模型

        //注册数据库ORM到Paimon
        this._database = ctx.database
    }
    /**
     * 基于Koishi的数据库能力
     */
    public get database(): DatabaseService { return this._database }
    public set database(V: DatabaseService) { this._database = V }
    /**
     * 
     */
    public get pptr() { return this._pptr }
    public set pptr(V) { this._pptr = V }
    /**
     * 创建Paimon监听对象
     */
    public create(commandModules: Array<basicCommand>) {
        const koishiCmd = this.ctx.command('paimon [uid:number]', '派蒙小助手，具体用法可发送paimon -h查看').alias('genshin', 'ys').example('paimon --uid 0000 绑定UID')
        if (commandModules) {
            let N = commandModules.length
            //注册所有可用的命令
            commandModules.forEach(command => {
                try {
                    cmdBootstrap(this, koishiCmd, command)
                } catch (error) {
                    this.logger.error(error)
                    N--
                }
            })
            this.logger.info('started! installed', N, 'commands, takes', (performance.now() - this.startDate), 'ms')
        } else {
            this.logger.error('install modules fail.')
        }
    }

    public use(service: any) {
        //注入service到Paimon实例
        Object.defineProperties(Paimon.prototype, service)
    }
}