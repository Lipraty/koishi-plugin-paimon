import { Context, Argv } from "koishi"
import * as utils from "@koishijs/utils"
import { UUID } from "../utils/UUID.util"

declare module 'koishi' {
    interface Tables {
        paimon_uid: PaimonUid,
        paimon_character: PaimonCharacter
    }
    interface User {
        uuid: string
        active_uid: string
        characet_id: number[]
    }
}

export interface PaimonUid {
    uid: number | `${number}`
    uuid: string
    dsalt: string
    cookie: string
    freeze: boolean
}

export namespace PaimonUid {
    export type Field = keyof PaimonUid
    export const fields: Field[] = []
    export type Observed<K extends Field = Field> = utils.Observed<Pick<PaimonUid, K>, Promise<void>>
}

export interface PaimonCharacter {
    cuid: number
    id: number
    icon?: string
    image?: string
    name: string
    element: string
    fetter: number
    level: number
    rarity: number
    actived_constellation_num: number
    weapon?: Weapon
    reliquaries?: Reliquaries[]
    constellations?: Constellations[]
}

export namespace PaimonCharacter {
    export type Field = keyof PaimonCharacter
    export const fields: Field[] = []
    export type Observed<K extends Field = Field> = utils.Observed<Pick<PaimonCharacter, K>, Promise<void>>
}

export class PaimonDatabase {
    private context: Context
    constructor(app: Context) {
        //#region extend database
        app.model.extend('user', {
            uuid: 'text(31)',
            active_uid: 'string(12)',
            characet_id: 'list'
        })

        app.model.extend('paimon_uid', {
            uid: 'string(12)',
            uuid: 'text(31)',
            dsalt: 'text(30)',
            cookie: 'text',
            freeze: { type: 'boolean', initial: false }
        }, {
            primary: 'uid',
            unique: ['uid']
        })

        app.model.extend('paimon_character', {
            cuid: 'unsigned',
            id: 'integer',
            icon: 'text',
            image: 'text',
            name: 'string',
            element: 'text',
            fetter: 'integer',
            level: 'integer',
            rarity: 'integer',
            actived_constellation_num: 'integer',
            weapon: 'json',
            reliquaries: 'json',
            constellations: 'json'
        }, {
            primary: 'cuid',
            autoInc: true,
            unique: ['cuid']
        })
        //#endregion
        app.before('command/execute', async (argv: Argv) => {
            //Try create `uuid` when starting `before-paimon` lifecycle
            const user = await argv.session.observeUser(['uuid', 'id'])
            user.uuid ??= this.createUUID(user.id.toString())
            user.$update()
        }, true)

        this.context = app
    }

    db() {
        return this.context.database
    }

    createUUID(userId: string): string {
        const uuid = UUID.snameUUIDFromBytes('koishi:' + userId).unsign()
        this.context.database.set('user', { id: parseInt(userId) }, { uuid })
        return uuid
    }

    async createUid(uid: UID, cookie?: string) {
        const dsalt = UUID.randomUUID().unsign()
        return await this.context.database.create('paimon_uid', { uid, cookie, dsalt, freeze: false })
    }

    async getUid(uuid: string): Promise<PaimonUid[]> {
        return await this.context.database.get('paimon_uid', { uuid })
    }

    async setUid(uid: UID, cookie?: string, dsalt?: string, freeze: boolean = false): Promise<void> {
        await this.context.database.set('paimon_uid', { uid }, { cookie, dsalt, freeze })
    }
}