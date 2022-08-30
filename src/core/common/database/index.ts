import { Context, Session } from "..";

declare module 'koishi' {
    interface Tabals {
        paimon: PaimonDB
    }
}

export interface PaimonDB {
    id: number
    assignee: string
    time: Date
    lastCall: Date
    interval: number
    command: string
    session: Session.Payload
}

export function extend(ctx: Context) {
    ctx.model.extend('paimon', {
        // 各字段类型
        id: 'unsigned',
        assignee: 'string',
        time: 'timestamp',
        lastCall: 'timestamp',
        interval: 'integer',
        command: 'text',
        session: 'json',
    }, {
        autoInc: true,
        
    })
}