interface BasicAPI {
    baseURL: URL | string
    hk4eURL: URL | string
    recordURL: URL | string

    apis: Record<string, APIOption>
}

interface APIOption {
    type: 'base' | 'hk4e' | 'record'
    module: 'POST' | 'post' | 'GET' | 'get'
    url: string
    params: Array<string>
    cookie: boolean
}