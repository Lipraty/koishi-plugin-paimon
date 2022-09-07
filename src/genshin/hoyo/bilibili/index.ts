import { ChinaAPI } from "../china";

/**
 * B服与官服区别仅在于请求时携带的server/region中
 * 其他区服则使用另外的API URLs
 */
export const BiliAPI: BasicAPI = {
    takumiURL: ChinaAPI.takumiURL,
    hk4eURL: ChinaAPI.hk4eURL,
    recordURL: ChinaAPI.recordURL,
    apis: ChinaAPI.apis
}