/**
 * 基本API请求列表。
 */
interface BasicAPI {
    takumiURL: URL | string
    hk4eURL: URL | string
    recordURL: URL | string
    apis: Record<string, APIOption>
}
/**
 * API请求对象选项
 */
interface APIOption {
    /**API Host类型，如果为undefined，应该提供完整URL。*/
    type: 'takumi' | 'hk4e' | 'record' | undefined
    /**请求API URL不存在PUT、DELETE等具有数据库写入动作的情况 */
    method: 'POST' | 'post' | 'GET' | 'get'
    /**如果type为undefined，应该提供完整URL。*/
    url: string
    /**限制请求参数（GET:Query|POST:Body）*/
    params?: Array<string>
    /**这个API是否需要cookie */
    cookie?: boolean
}