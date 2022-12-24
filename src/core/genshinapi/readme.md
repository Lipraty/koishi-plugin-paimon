# Genshin API Kit

获取《原神》服务器玩家数据的API工具箱。

## 使用

```TypeScript
import { GenshinAPI } from 'koishi-plugin-paimon/core';

/**
 * GenshinAPI实例
 * 传入第一个参数UID。当然，会在内部处理改UID所属区服与API地址等信息。
 * 第二个参数为部分API所需要携带的Cookie。
 * 第三个参数为虚拟设备信息Device所用生成序列，可以为一个固定随机字符以
 * 保证唯一性，且可以更新以生成新的Device。
 */
const api = GenshinAPI('0000', 'cookie...', 'jsh823hAhs0');

/**
 * 请求一个API。
 */
api.fetch('bbsSign', {
        act_id: api.hoyo.act_id,
        region: api.region,
        uid: uid
    })
/**
 * 如果请求一个列表中不存在的api，或者就单纯进行一次http请求，你可以
 * 这样
 */
api.useAPI({
    type: 'takumi',
    method: 'POST',
    url: '/event/unexpected/api',
    params:['act_id', 'param1'],
    cookie: false
}).fetch({
    act_id: api.hoyo.act_id,
    param1: 'a param'
});
```

## 鸣谢

- 该API请求库Typings基于[genshin-kit/core/types](https://github.com/genshin-kit/genshin-kit-node/blob/master/packages/core/src/types)
- 部分逻辑参考自[genshin-kit](https://github.com/genshin-kit/genshin-kit-node/blob/master/packages/core/src/types)与[genshin.py](https://github.com/thesadru/genshin.py)
- DS算法参考自[genshin.py](https://github.com/thesadru/genshin.py)