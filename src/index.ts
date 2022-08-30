import { Paimon, Context, koishiConfig, koishiCOnfig, Schema } from "./core";
import { modules } from "./core/command";
import {} from "@koishijs/plugin-console";

export const name = 'paimon'

export interface Config extends koishiConfig {
    test: string
}
export const Config: Schema<Config> = Schema.intersect([koishiCOnfig,Schema.object({
    test: Schema.string().default('Test').hidden()
})])

export function apply(ctx: Context, config: Config) {
    // ctx.using(['console'], (ctx) => {
    //     ctx.console.addEntry({
    //         dev: resolve(__dirname, '../client/index.ts'),
    //         prod: resolve(__dirname, '../dist'),
    //     })
    // })
    ctx.using(['database', 'puppeteer'], ()=> {})
    const commandsContext = []
    modules.context('./modules', false, /\.ts$/).keys().forEach(m => {
        commandsContext.push(require(m))
    })
    const paimon = new Paimon(ctx, config)
    paimon.database = ctx.database
    // paimon.pptr = ctx.puppeteer
    paimon.create(commandsContext)
}