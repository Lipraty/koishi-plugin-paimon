export const ChinaAPI: BasicAPI = {
    takumiURL: new URL('https://api-takumi.mihoyo.com/'),
    hk4eURL: new URL('https://hk4e-api.mihoyo.com'),
    recordURL: new URL('https://api-takumi-record.mihoyo.com/'),
    apis: {
        sign: {
            type: 'takumi',
            module: 'POST',
            url: '/event/bbs_sign_reward/sign',
            params: ['act_id', 'region', 'uid'],
            cookie: true
        },
        
    }
}