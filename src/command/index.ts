import { Argv } from "koishi";

declare module 'koishi' {
    namespace Argv {
        interface Domain {
            UID: string
        }
    }
}

Argv.createDomain('UID', source => {
    if (isNaN(parseInt(source))) throw new Error('这不是一个正确的UID')
    return source
})