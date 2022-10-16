import { Schema } from "koishi"

declare module 'koishi' {
    namespace Context {
        interface Config extends PaimonConfig {

        }
    }
}

interface characterOptions {
    panelApi: any
    roles: string
}

export interface PaimonConfig {
    master: number
    render: string
    cookies: string[]
    cookieDesc: string
    pushTime: string
    pushCount: number
    character: characterOptions
    taskPoolTimer: number
}

export const PaimonConfig: Schema<PaimonConfig> = Schema.object({
    master: Schema.number().min(0).max(3).default(3).description('高级命令响应级别'),
    render: Schema.string().default('https://paimon-display.app.lonay.me').description('图片渲染所用地址，可以自行部署到本地获得最快速度'),
    cookies: Schema.array(String).default([]).description('用于公共查询的米游社小饼干，可以为多个'),
    cookieDesc: Schema.string().description('小饼干绑定帮助文档地址，GitHub可能访问不稳定，可以替换为其他地址').default("https://github.com/Lipraty/koishi-plugin-paimon/wiki/Bind-Cookie"),
    pushTime: Schema.string().default("0 0 0/5 * * * ?").description('米游社资讯推送时间'),
    pushCount: Schema.number().min(1).max(10).default(1).description('米游社推送条目数量'),
    character: Schema.object({
        panelApi: Schema.union(['Enka', 'Enka-CNproxy', 'Enka-KRproxy']).default('Enka').description('选择面板请求API'),
        roles: Schema.string().default("").description('角色额外别名文件路径，文件为json')
    }),
    taskPoolTimer: Schema.number().min(0).max(300).default(60).description('任务池执行间隔时间，以保证轮询接口时不会因间隔太短而被米哈游拦截')
})