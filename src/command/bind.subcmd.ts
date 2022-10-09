import { DatabaseService } from "koishi";
import { Database } from "../database";

export class Bind {
    private user: string
    private db: DatabaseService

    constructor(user: string, database: DatabaseService) {
        this.user = user
        this.db = database
    }

    private async dataByUser(): Promise<any[]> {
        return await Database.findByUser(this.user, (data, index) => {
            return `${index + 1}. ${data.uid}${data.active ? ' (默认)' : ''}`
        })
    }

    public async findBindList() {
        const data = await this.dataByUser()
        if (data.length > 0)
            return '目前已绑定uid有\n' + data.join('\n')
        else
            return '您还未绑定过uid！请私聊发送`paimon.bind --uid <uid>`以绑定'
    }

    public async bindToUser(uid: UID, cookie: string) {
        const data = await this.dataByUser()
        if (uid) {
            if (await Database.existUID(uid as UID)) {
                if (cookie) {
                    await this.db.set('paimon', { uid: (uid as string) }, { cookie })
                    return '该uid已更新cookie'
                }
                return '该uid已被绑定'
            } else {
                await this.db.create('paimon', {
                    user: this.user,
                    uid: (uid as string),
                    cookie,
                    active: data.length === 0
                })
                return `已绑定该uid${data.length === 0
                    ? '，由于是第一次绑定，该uid将作为默认uid。'
                    : '，目前已绑定uid有\n' + data.join('\n') + `\n${data.length + 1}. ${uid as string}`}`
            }
        } else {
            if (cookie) {
                await this.db.set('paimon', { active: { $eq: true } }, { cookie })
                const defUID = await Database.findUIDByActive(this.user)
                return `由于未指定uid，cookie已绑定到默认uid(${defUID})下。`
            }
        }
    }
}