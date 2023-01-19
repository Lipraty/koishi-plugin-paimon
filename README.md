# koishi-plugin-paimon

[![npm](https://img.shields.io/npm/v/koishi-plugin-paimon?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-paimon)

> 这是一个已经停止更新的插件，所有功能将转移至 Koishi 官方插件： [koishi-plugin-genshin](https://github.com/koishijs/koishi-plugin-genshin)。敬请期待适用于 Koishi v4 的 Genshin 插件吧！

## 安装

```Shell
#npm:
npm install koishi-plugin-paimon

#or use yarn:
yarn add koishi-plugin-paimon
```

### 所需`koishi`外部插件与依赖

- `database`：用于存储用户数据
- `koishi-plugin-puppeteer`：用于图片生成
- `@koishijs/plugin-rate-limit`：用于指令速率限制

如果未安装上述依赖，可以使用以下方法进行安装：

> koishi database能对接多种平台，请选择符合自身的数据库平台；名称为`@koishijs/plugin-database-[platform]`，下列示例以sqlite为例。

```Shell
#npm:
npm install koishi-plugin-puppeteer @koishijs/plugin-database-sqlite @koishijs/plugin-rate-limit

#or use yarn:
yarn add koishi-plugin-puppeteer @koishijs/plugin-database-sqlite @koishijs/plugin-rate-limit
```

## Paimon 服务

通过`ctx.paimon`访问

#### `paimon.login(uid, cookie?, dsalt?): Paimon`

在使用其他api前应当先进行login，传入必要的参数以保证符合预期执行

| Params  | Description            |
| ------- | ---------------------- |
| uid     | 游戏uid                |
| cookie? | 米游社Cookie           |
| dsalt?  | 虚拟设备信息所用的Salt |

#### `paimon.render(def, elementType?)(...args): Promise<string | Buffer | h>`

请求后续所列出的某个API，并渲染为图片返回

> 这是一个柯里化的函数，第二个`(...args)`则是下列函数可能需要的参数。并根据elementType返回一个流动的`Promise<T>`\
> 例如：`paimon.render('bbsSign', 'base64')(true)`。

| Params       | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| def          | 需要请求的API，即下列所列出的函数名                                                    |
| elementType? | 返回类型，默认为buffer（`base64` -> `string`，`buffer` -> `Buffer`, `element` -> `h`） |


#### `paimon.bbsSign(onlyInfo?): Promise<SignInfo>`

执行米游社签到

| Params    | Description                    |
| --------- | ------------------------------ |
| onlyInfo? | 不执行签到行为，只返回签到数据 |

#### `paimon.memo(): Promise<MemoInfo>`

查询米游社 每日便笺 内容

#### `paimon.abyss(period?, level?): Promise<AbyssInfo>`

查询米游社 深境螺旋 内容

| Params  | Description              |
| ------- | ------------------------ |
| period? | 选择回顾上期或本期的战报 |
| level?  | 单独限制该层信息         |

#### `paimon.gachaImport(gachaDataJson): Promise<void | boolan>`

导入原神抽卡记录进行分析

| Params        | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| gachaDataJson | 以`gachaData-[uid]-[time].json`文件名的原神祈愿记录（genshin-gacha-export） |

#### `paimon.note(month?): Promise<NoteData>`

查询米游社旅行者札记

## Paimon 命令

插件命令以`paimon`开头，部分命令拥有参数`[uid]`，随后可接额外的选项与参数。

> 使用命令需要在插件设置中将 `useCommand` 设置为`true`。

```Shell
paimon[.subcommand] [uid] --option [option arg]
```

> 具体用法可以发送`paimon -h`查看

其中`[uid]`被视为一个可选参数，如果有该参数则会让paimon的行为限制在该uid内。

- 指定的`[uid]`只能是已绑定的uid，如果未绑定该uid，则返回非绑定uid警告。
- 当用户权限大于等于`master`选项所设置数值时，将无视限制。

当然，为了方便使用，插件支持以快捷方式触发命令，发送`paimon`或`#帮助`即可获得一个支持的命令列表图片。就像Yunzai-bot一样。

All game data & pictures from ©mihoyo