import { Paimon, Context, koishiConfig, koishiCOnfig, Schema, Logger } from "./core";
import modules from "./modules";
// import {} from "@koishijs/plugin-console";

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
    new Logger('paimon').debug('create')
    paimon.create(modules)
}