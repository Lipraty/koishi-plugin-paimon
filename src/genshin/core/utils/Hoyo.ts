import { HoyoDS } from "./DS"
import { Random } from "./Random"
import { ServerType } from "./ServerType"

export class Hoyo {
    public static readonly act_id = 'e202009291139501'

    public static headers(serverType: ServerType, device: string, cookie?: string, query?: Record<string, any>, param?: Record<string, any>): HeadersInit {
        const _device = device || `Paimon/${Random.randstr(12)}`
        if (cookie)
            return {
                'x-rpc-app_version': HoyoDS.appVersion,
                'x-rpc-client_type': HoyoDS.clientType,
                'x-rpc-device_id': device,
                'User-Agent': Random.randUA(HoyoDS.appVersion, _device),
                'X-Requested-With': 'com.mihoyo.hyperion',
                'x-rpc-platform': 'android',
                'x-rpc-device_model': `MI ${_device}`,
                'x-rpc-device_name': _device,
                'x-rpc-channel': 'miyousheluodi',
                'x-rpc-sys_version': '6.0.1',
                'Referer': Random.randRef(Hoyo.act_id),
                'DS': new HoyoDS(serverType).getSign(),
                'cookie': cookie
            }
        else
            return {
                'x-rpc-app_version': HoyoDS.appVersion,
                'x-rpc-client_type': HoyoDS.clientType,
                'User-Agent': Random.randUA(HoyoDS.appVersion, _device),
                'DS': new HoyoDS(serverType).get2Android(query, param)
            }
    }
}