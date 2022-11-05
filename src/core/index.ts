export * from "./genshinapi";
export * from "./gacha";

// export namespace Paimon {
//     export class API extends GenshinAPI {
//         /**
//          * 米游社签到
//          */
//         public async bbsSign(): Promise<SignInfo> {
//             let params = {
//                 act_id: this.hoyoKit.act_id,
//                 region: this.serverType,
//                 uid: this.uid
//             }
//             //执行签到
//             const doSign = await this.fetchAPI('bbsSign', this.hoyoKit.signHeader(this.cookie), params)
//             if (doSign.retcode === 0 && doSign.data?.risk_code !== 375) {
//                 //当日签到详情
//                 const checkSign = await this.fetchAPI('bbsSignInfo', this.hoyoKit.signHeader(this.cookie), params)
//                 if (checkSign.retcode === 0) {
//                     return checkSign.data
//                 }
//             } else {
//                 throw {
//                     code: doSign.data?.risk_code === 375 ? -375 :  doSign.retcode,
//                     message: doSign.data?.risk_code === 375 ? '需要验证码' : doSign.message,
//                     raw: doSign
//                 }
//             }
//         }
//         /**
//          * 获取签到奖励
//          * @param today 
//          */
//         public async getSignBonus(today: string): Promise<SignHomeAward> {
//             //获得当月奖励
//             const doBonus = await this.fetchAPI('bbsSignHome', this.hoyoKit.headers(this.cookie), {
//                 act_id: this.hoyoKit.act_id,
//                 region: this.serverType,
//                 uid: this.uid
//             })
//             if (doBonus.code === 0) {
//                 const mounthBonus: SignHome = doBonus.data
//                 const toDay = today.split('-').map(v => parseInt(v))
//                 if (mounthBonus.month === toDay[1]) {
//                     return mounthBonus.awards[toDay[2]]
//                 }
//             }
//             throw {
//                 code: doBonus.retcode,
//                 message: doBonus.message,
//                 raw: doBonus
//             }
//         }
//         /**
//          * 实时便笺
//          */
//         public async dailyNote(): Promise<DailyNote> {
//             const params = {
//                 role_id: this.uid,
//                 server: this.serverType
//             }

//             const reqData = await this.fetchAPI('dailyNote', this.hoyoKit.headers(this.cookie, params), params)
//             if (reqData.retcode !== 0 || !reqData.data) {
//                 throw {
//                     code: reqData.retcode,
//                     message: reqData.message,
//                 }
//             }

//             return reqData.data
//         }
//     }
//     export class Gacha extends GachaCore {

//     }
// }