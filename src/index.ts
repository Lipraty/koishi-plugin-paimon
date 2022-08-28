import { Paimon, Context } from "./core";

export const using = ['database'] as const

export function apply(ctx: Context){
    
    new Paimon(ctx).create([]);
}