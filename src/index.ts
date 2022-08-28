import { resolve } from "path";
import { Paimon, Context, Schema } from "./core";
import {} from "@koishijs/plugin-console";
import { modules } from "./core/command";

export const name = 'paimon'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
    ctx.using(['console'], (ctx) => {
        ctx.console.addEntry({
            dev: resolve(__dirname, '../client/index.ts'),
            prod: resolve(__dirname, '../dist'),
        })
    })
    ctx.using(['database'], ()=> {})
    const paimon = new Paimon(ctx)
    // paimon.use()
    // paimon.create(modules.context('./modules', false, '*.ts'));
}