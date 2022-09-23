export const ChinaAPI: BasicAPI = {
    takumiURL: new URL('https://api-takumi.mihoyo.com/'),
    hk4eURL: new URL('https://hk4e-api.mihoyo.com'),
    recordURL: new URL('https://api-takumi-record.mihoyo.com/'),
    apis: {
        bbsSign: {
            type: 'takumi',
            method: 'POST',
            url: '/event/bbs_sign_reward/sign',
            params: ['act_id', 'region', 'uid'],
            cookie: true
        },
        bbsSignHome: {
            type: 'takumi',
            method: 'GET',
            url: '/event/bbs_sign_reward/home',
            params: ['act_id', 'region', 'uid'],
            cookie: true
        },
        bbsSignInfo: {
            type: 'takumi',
            method: 'GET',
            url: '/event/bbs_sign_reward/info',
            params: ['act_id', 'region', 'uid'],
            cookie: true
        },
        
    }
}