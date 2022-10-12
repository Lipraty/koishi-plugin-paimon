import { Logger, Service } from "koishi";
import { GenshinAPI } from "./genshinapi";
import { GachaCore } from "./gacha";

declare module 'koishi' {
    interface Context {
        paimon?: Paimon.API
    }
}

const logger = new Logger('paimonAPI')

export namespace Paimon {
    export class API extends GenshinAPI {
        /**
         * 米游社签到
         */
        public async bbsSign(): Promise<SignInfo> {
            logger.info('[GenshinAPI-bbsSign]run sign')
            const doSign = await this.fetchAPI('bbsSignInfo', this.hoyoKit.signHeader(this.cookie), {
                act_id: this.hoyoKit.act_id,
                region: this.serverType,
                uid: this.uid
            })
            if (doSign.retcode === 0 && doSign.data.data.success === 0) {
                return doSign.data
            } else {
                if (doSign.data.risk_code === 375) {
                    throw {
                        code: 375,
                        message: '需要验证码'
                    }
                }
                throw {
                    code: doSign.retcode,
                    message: doSign.message,
                }
            }
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