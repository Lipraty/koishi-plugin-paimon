import { Field, Model } from ".."

export interface PaimonDB {
    id: number
    user: string
    uid: string
    cookie: string
    active: boolean
}

export class PaimonDBExtend {
    public static fields: Field.MapField<PaimonDB> = {
        id: 'unsigned',
        user: 'string',
        uid: 'string',
        cookie: 'text',
        active: 'boolean'
    }
    public static option: Model.Config<PaimonDB> = {
        autoInc: true,
        foreign: {
            user: ['user', 'uid']
        },
        unique: ['uid', 'cookie']
    }
}
