import { Field } from ".."

export interface PaimonDB {
    id: number
    assignee: string
    time: Date
    lastCall: Date
    interval: number
    command: string

}

export class PaimonDBExtend {
    public static fields: Field.MapField<PaimonDB> = {
        id: 'unsigned',
        assignee: 'string',
        time: 'timestamp',
        lastCall: 'timestamp',
        interval: 'integer',
        command: 'text'
    }
    public static option = {
        autoInc: true
    }
}