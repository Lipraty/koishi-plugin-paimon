import { Paimon, Context, koishiConfig, koishiCOnfig, Schema } from "./core";
import {} from "@koishijs/plugin-console";
import commandModules from "./modules";

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
    // const commandsContext = []
    // modules.context('./modules', false, /\.ts$/).keys().forEach(m => {
    //     commandsContext.push(import(process.platform === 'win32' ? 'file://' + m : m))
    // })
    const paimon = new Paimon(ctx, config)
    paimon.database = ctx.database
    // paimon.pptr = ctx.puppeteer
    paimon.create(commandModules)
}