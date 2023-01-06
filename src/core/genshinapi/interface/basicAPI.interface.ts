/**
 * 基本API请求列表。
 */
type APIStencil = {
    readonly [K in string]: APIStencilOption
}

type APIRegion = {
    readonly [K in string]: APIRegionOption
}

interface APIStencilOption {
    readonly availableFor: readonly ('china' | 'overseas')[]
    readonly type: APIType
    readonly method: APIRequestMethod
    readonly url: string
    readonly parameters: readonly (readonly [string, string])[]
    readonly cookie: boolean
}

interface APIRegionOption {
    readonly takumi: string
    readonly hk4e: string
    readonly record: string
}

type APIRequestMethod = 'GET' | 'get' | 'POST' | 'post' | 'PUT' | 'put'
type APIType = keyof APIRegionOption

interface APIList {
    bbsSign: APIOption
    bbsSignHome: APIOption
    bbsSignInfo: APIOption
    dailyNote: APIOption
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
    params?: readonly string[]
    /**这个API是否需要cookie */
    cookie?: boolean
}