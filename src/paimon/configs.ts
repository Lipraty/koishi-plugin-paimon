import { Schema, Time } from "koishi"

export interface PaimonBasicConfig {
    render: string
    renderTimeout: number
    cookies: string[]
    character: characterOptions
    taskPoolTimer: number
    useCommand: boolean
}

export interface PaimonCommandConfig {
    master: number
    cookieDesc: string
    pushTime: string
    pushCount: number
}

interface characterOptions {
    panelApi: any
    roles: string
}

export const PaimonBasicConfig: Schema<PaimonBasicConfig> = Schema.object({
    render: Schema.string().default('https://paimon-display.app.lonay.me').description('图片渲染所用地址，可以自行部署到本地获得最快速度'),
    renderTimeout: Schema.natural().role('ms').default(Time.second * 5).description('渲染图片最长时间。'),
    cookies: Schema.array(String).default([]).description('用于公共查询的米游社小饼干，可以为多个'),
    character: Schema.object({
        panelApi: Schema.union(['Enka', 'Enka-CNproxy', 'Enka-KRproxy']).default('Enka').description('选择面板请求API'),
        roles: Schema.string().default("").description('角色额外别名文件路径，文件为json')
    }),
    taskPoolTimer: Schema.number().min(0).max(300).default(60).description('任务池执行间隔时间，以保证轮询接口时不会因间隔太短而被米哈游拦截'),
    useCommand: Schema.boolean().default(true).description('是否启用命令，如果关闭则Paimon将仅作为服务运行'),
}).description('基本设置')

export const PaimonCommandConfig: Schema<PaimonCommandConfig> = Schema.object({
    master: Schema.number().min(0).max(3).default(3).description('高级命令响应级别'),
    cookieDesc: Schema.string().description('小饼干绑定帮助文档地址，GitHub可能访问不稳定，可以替换为其他地址').default("https://github.com/Lipraty/koishi-plugin-paimon/wiki/Bind-Cookie"),
    pushTime: Schema.string().default("0 0 0/5 * * * ?").description('米游社资讯推送时间'),
    pushCount: Schema.number().min(1).max(10).default(1).description('米游社推送条目数量'),
}).description('命令设置')