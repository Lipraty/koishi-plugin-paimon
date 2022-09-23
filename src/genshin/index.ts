import { GenshinAPI } from "./core";
import { Hoyo } from "./core/utils/Hoyo";
import { GachaCore } from "./gacha";

export namespace Genshin {
    export class API extends GenshinAPI {
        /**
         * 米游社签到
         */
        public async bbsSign(paramOptions?: Record<string, string>) {
            return await this.fetchAPI('bbsSign', {
                act_id: Hoyo.act_id,
                region: this.serverType,
                uid: this.uid
            }, paramOptions)
        }
    }
    export class Gacha extends GachaCore {

    }
}