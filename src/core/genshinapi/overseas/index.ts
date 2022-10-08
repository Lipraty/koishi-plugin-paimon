export const OverseasAPI: BasicAPI = {
    takumiURL: new URL('https://api-os-takumi.mihoyo.com/'),
    hk4eURL: new URL('https://hk4e-api-os.hoyoverse.com'),
    recordURL: new URL('https://bbs-api-os.hoyolab.com'),
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
        dailyNote: {
            type: 'takumi',
            method: 'GET',
            url: '/game_record/app/genshin/api/dailyNote',
            params: ['role_id', 'server'],
            cookie: true
        },
    }
}