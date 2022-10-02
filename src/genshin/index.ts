import { GenshinAPI } from "./core";
import { Hoyo } from "./core/utils/Hoyo";
import { GachaCore } from "./gacha";

export namespace Genshin {
    export class API extends GenshinAPI {
        /**
         * 米游社签到
         */
        public async bbsSign() {
            return await this.fetchAPI('bbsSign', this.hoyoKit.signHeader(this.cookie), {
                act_id: this.hoyoKit.act_id,
                region: this.serverType,
                uid: this.uid
            })
        }
    }
    export class Gacha extends GachaCore {

    }
}