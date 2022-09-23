# Genshin API Kit

获取《原神》服务器玩家数据的API工具箱。

## 使用

```TypeScript
import { GenshinAPI } from 'genshin/core';

/**
 * GenshinAPI实例
 * 传入第一个参数UID。当然，会在内部处理改UID所属区服与API地址等信息。
 * 第二个参数为部分API所需要携带的Cookie。
 */
const api = GenshinAPI('0000', 'cookie...');
```

### 可用函数

```TypeScript
/**
 * 请求一个API。
 * 当然，一般情况下可以使用已经封装好的API，这样也会获得更好的代码提示。
 * 下面这个例子是一个‘米游社’签到API
 */
api.fetchAPI({
    type: 'takumi',
    method: 'GET',
    url: '/event/bbs_sign_reward/sign',
    params: ['act_id', 'region', 'uid'],
    cookie: true
}, {
    act_id: this.act_id,
    region: this.stype,
    uid: this.uid
});
```

## 鸣谢

- 该API请求库Typings基于[genshin-kit/core/types](https://github.com/genshin-kit/genshin-kit-node/blob/master/packages/core/src/types)
- 部分逻辑参考自[genshin-kit](https://github.com/genshin-kit/genshin-kit-node/blob/master/packages/core/src/types)与[genshin.py](https://github.com/thesadru/genshin.py)
- DS算法参考自[genshin.py](https://github.com/thesadru/genshin.py)