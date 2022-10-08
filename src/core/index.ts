import { Service } from "koishi";
import { GenshinAPI } from "./genshinapi";
import { GachaCore } from "./gacha";

declare module 'koishi' {
    interface Context {
        paimon?: Paimon.API
    }
}

export namespace Paimon {
    export class API extends GenshinAPI {
        /**
         * 米游社签到
         */
        public async bbsSign(): Promise<SignInfo> {
            const reqData = await this.fetchAPI('bbsSign', this.hoyoKit.signHeader(this.cookie), {
                act_id: this.hoyoKit.act_id,
                region: this.serverType,
                uid: this.uid
            })
            if (reqData.retcode !== 0 || !reqData.data) {
                throw {
                    code: reqData.retcode,
                    message: reqData.message,
                }
            }

            return reqData.data
        }
        /**
         * 实时便笺
         */
        public async dailyNote(): Promise<DailyNote> {
            const params = {
                role_id: this.uid,
                server: this.serverType
            }

            const reqData = await this.fetchAPI('dailyNote', this.hoyoKit.headers(this.cookie, params), params)
            if (reqData.retcode !== 0 || !reqData.data) {
                throw {
                    code: reqData.retcode,
                    message: reqData.message,
                }
            }

            return reqData.data
        }
    }
    export class Gacha extends GachaCore {

    }
}