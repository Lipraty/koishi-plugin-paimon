import { Schema } from ".."
import { UUID } from "../../../utils/UUID.util"

interface characterOptions {
    panelApi: any
    roles: string
}

export interface koishiConfig {
    master: number
    cookies: string[]
    cookieDesc: string
    cookieKey: string
    commandBans: string[]
    gachaCount: number
    gachaRevock: number
    pushTime: string
    pushCount: number
    character: characterOptions
}

export const koishiCOnfig: Schema<koishiConfig> = Schema.object({
    master: Schema.number().min(0).max(3).default(3).description('高级命令响应级别'),
    cookies: Schema.array(String).default([]).description('用于公共查询的米游社小饼干，可以为多个'),
    cookieKey: Schema.string().description('应该为这些小饼干整一个带锁的盒子，默认随机生成，可以自行更改'),
    cookieDesc: Schema.string().description('小饼干绑定帮助文档地址，GitHub可能访问不稳定，可以替换为其他地址').default("https://github.com/Lipraty/koishi-plugin-paimon/wiki/Bind-Cookie"),
    commandBans: Schema.array(String).default(["gacha"]).description('不应该使用这些命令'),
    gachaCount: Schema.number().min(1).max(5).default(1).description('单用户每日抽卡次数'),
    gachaRevock: Schema.number().min(30).max(120).default(null).description('抽卡后撤回消息（30-120s，默认值时不撤回）'),
    pushTime: Schema.string().default("0 0 0/5 * * * ?").description('米游社资讯推送时间'),
    pushCount: Schema.number().min(1).max(10).default(1).description('米游社推送条目数量'),
    character: Schema.object({
        panelApi: Schema.union(['Enka', 'Enka-CNproxy', 'Enka-KRproxy']).default('Enka').description('选择面板请求API'),
        roles: Schema.string().default("").description('角色额外别名文件路径，文件为json')
    })
})