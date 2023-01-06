import { RegionType } from "../utils/Region"

export namespace BBSApi {
    //地区与地址
    export const region: APIRegion = {
        china: {
            takumi: 'https://api-takumi.mihoyo.com/',
            hk4e: 'https://hk4e-api.mihoyo.com',
            record: 'https://api-takumi-record.mihoyo.com/',
        },
        overseas: {
            takumi: 'https://api-os-takumi.mihoyo.com/',
            hk4e: 'https://hk4e-api-os.hoyoverse.com',
            record: 'https://bbs-api-os.hoyolab.com',
        }
    } as const

    //API模板
    export const stencil: APIStencil = {
        bbsSign: {
            availableFor: ['china', 'overseas'],
            type: 'takumi',
            method: 'POST',
            url: '/event/bbs_sign_reward/sign',
            parameters: [['act_id', 'string'], ['region', 'string'], ['uid', 'string']],
            cookie: true
        },
        bbsSignHome: {
            availableFor: ['china', 'overseas'],
            type: 'takumi',
            method: 'GET',
            url: '/event/bbs_sign_reward/home',
            parameters: [['act_id', 'string'], ['region', 'string'], ['uid', 'string']],
            cookie: true
        },
        bbsSignInfo: {
            availableFor: ['china', 'overseas'],
            type: 'takumi',
            method: 'GET',
            url: '/event/bbs_sign_reward/info',
            parameters: [['act_id', 'string'], ['region', 'string'], ['uid', 'string']],
            cookie: true
        },
        dailyNote: {
            availableFor: ['china'],
            type: 'takumi',
            method: 'GET',
            url: '/game_record/app/genshin/api/dailyNote',
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
     * > 这个正常来说是可以推导的，编译回js时也能正常工作，但是由于约束不完全而被ts骂了
     * > 有ts佬能帮帮我吗
     */
    export type Params<R extends RegionType, A extends Keys<R>> = {
        //@ts-ignore
        [K in For<RegionTypeOf<R>>[A]['parameters'][number][0]]: TakeType<For<RegionTypeOf<R>>[A]['parameters'][number][1]>
    }
}