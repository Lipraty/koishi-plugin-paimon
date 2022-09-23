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
    ctx.using(['database', 'puppeteer'], ()=> {})
    const paimon = new Paimon(ctx, config)
    paimon.create(commandModules)
}