import { Context, DatabaseService } from "koishi"

export class PaimonDatabase extends DatabaseService {
    constructor(app: Context) {
        super(app)
        //#region extend database
        this.extend('user', {
            uuid: 'text',
            active_uid: 'string',
            characet_id: 'list'
        })

        this.extend('paimon_uid', {
            uid: 'string',
            uuid: 'text',
            dsalt: 'text',
            cookie: 'text',
            freeze: { type: 'boolean', initial: false }
        }, {
            primary: 'uid',
            unique: ['uid']
        })

        this.extend('paimon_character', {
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
        
    }
}