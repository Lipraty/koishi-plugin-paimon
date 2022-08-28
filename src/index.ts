import { Paimon, Context } from "./core";
import { modules } from "./core/command";

export const using = ['database'] as const

export function apply(ctx: Context) {
    const paimon = new Paimon(ctx)
    // paimon.use()
    paimon.create(modules.context('./modules', false, '*.ts'));
}