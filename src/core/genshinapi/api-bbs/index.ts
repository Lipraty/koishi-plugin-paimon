import { RegionType } from "../utils/Region"

export namespace BBSApi {
    /**
     * hostBy所指API地址
     */
    export const region: APIRegion = {
        china: {
            takumi: 'https://api-takumi.mihoyo.com',
            hk4e: 'https://hk4e-api.mihoyo.com',
            record: 'https://api-takumi-record.mihoyo.com',
        },
        overseas: {
            takumi: 'https://api-os-takumi.mihoyo.com',
            hk4e: 'https://hk4e-api-os.hoyoverse.com',
            record: 'https://bbs-api-os.hoyolab.com',
        }
    } as const

    /**
     * act_id
     */
    export const actId = {
        china: 'e202009291139501',
        overseas: 'e202102251931481'
    } as const

    /**
     * 请求所用的API模板
     */
    export const stencil: APIStencil = {
        bbsSign: {
            availableFor: ['china', 'overseas'],
            hostBy: {
                china: 'takumi',
                overseas: 'hk4e'
            },
            method: 'POST',
            url: {
                china: '/event/bbs_sign_reward/sign',
                overseas: '/event/sol/sign'
            },
            parameters: [['act_id', 'string'], ['region', 'string'], ['uid', 'string']],
            cookie: true
        },
        bbsSignHome: {
            availableFor: ['china', 'overseas'],
            hostBy: {
                china: 'takumi',
                overseas: 'hk4e'
            },
            method: 'GET',
            url: {
                china: '/event/bbs_sign_reward/home',
                overseas: '/event/sol/home'
            },
            parameters: [['act_id', 'string'], ['region', 'string'], ['uid', 'string']],
            cookie: true
        },
        bbsSignInfo: {
            availableFor: ['china', 'overseas'],
            hostBy: {
                china: 'takumi',
                overseas: 'hk4e'
            },
            method: 'GET',
            url: {
                china: '/event/bbs_sign_reward/home',
                overseas: '/event/sol/info'
            },
            parameters: [['act_id', 'string'], ['region', 'string'], ['uid', 'string']],
            cookie: true
        },
        dailyNote: {
            availableFor: ['china', 'overseas'],
            hostBy: 'record',
            method: 'GET',
            url: '/game_record/app/genshin/api/dailyNote',
            parameters: [['role_id', 'string'], ['server', 'string']],
            cookie: true
        },
        abyss: {
            availableFor: ['china', 'overseas'],
            hostBy: 'record',
            method: 'GET',
            url: '/game_record/app/genshin/api/spiralAbyss',
            parameters: [['role_id', 'string'], ['schedule_type', 'number'], ['server', 'string']],
            cookie: true
        },
        character: {
            availableFor: ['china'],
            hostBy: 'record',
            method: 'POST',
            url: '/game_record/app/genshin/api/character',
            parameters: [['role_id', 'string'], ['server', 'string']],
            cookie: true
        },
        detail: {
            availableFor: ['china', 'overseas'],
            hostBy: {
                china: 'takumi',
                overseas: undefined
            },
            method: 'GET',
            url: {
                china: '/event/e20200928calculate/v1/sync/avatar/detail',
                overseas: 'https://sg-public-api.hoyolab.com/event/calculateos/sync/avatar/detail'
            },
            parameters: [['lang', 'string', true], ['uid', 'string'], ['region', 'string'], ['avatar_id', 'string']],
            cookie: true
        },
        memo: {
            availableFor: ['china', 'overseas'],
            hostBy: 'hk4e',
            method: 'GET',
            url: {
                china: '/event/ys_ledger/monthInfo',
                overseas: '/event/ysledgeros/month_info'
            },
            parameters: [['month', 'number'], ['bind_uid', 'string'], ['bind_region', 'string']],
            cookie: true
        },
        genCard: {
            availableFor: ['china'],
            hostBy: 'record',
            method: 'GET',
            url: '/game_record/app/genshin/api/character',
            parameters: [['role_id', 'string'], ['server', 'string']],
            cookie: true
        },
    } as const

    type ApiList = keyof typeof stencil
    type AvailableRegions = keyof typeof region
    type AvailableUnion<K extends ApiList> = typeof stencil[K]['availableFor'][number]
    type TakeType<N extends string> = N extends 'string' ? string : N extends 'number' ? number : N extends 'boolean' ? boolean : N extends 'object' ? object : unknown;

    export type RegionTypeOf<R extends RegionType> = R extends RegionType.CN | RegionType.CNB ? 'china' : 'overseas'
    export type For<R extends AvailableRegions> = {
        [K in ApiList as R extends AvailableUnion<K> ? K : never]: typeof stencil[K]
    }
    /**
     * 获取该地区支持的API
     */
    export type Keys<R extends RegionType> = keyof For<RegionTypeOf<R>>
    /**
     * 获取API请求参数条件
     * > 这个正常来说是可以推导的，编译回js时也能正常工作，但是由于约束不完全而被ts骂了。
     * > 有ts佬能帮帮我吗QvQ
     */
    export type Params<R extends RegionType, A extends Keys<R>> = {
        //@ts-ignore
        [K in For<RegionTypeOf<R>>[A]['parameters'][number][0]]: TakeType<For<RegionTypeOf<R>>[A]['parameters'][number][1]>
    }
}