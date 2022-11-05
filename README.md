<div align="center" style="margin-top: 1rem;">
  <a target="_blank">
      <img width="160" src="https://github.com/Lipraty/koishi-plugin-paimon/wiki/assets/logo.svg" alt="logo">
  </a>

# koishi-plugin-paimon

[![npm](https://img.shields.io/npm/v/koishi-plugin-paimon?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-paimon)

A [koishi](https://github.com/koishijs/koishi) plugin for a certain anime game.

</div>

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

> 通过`ctx.paimon`访问

#### `paimon.login(uid, cookie?): Paimon`

- uid: 游戏uid

#### `paimon.bbsSign(onlyInfo?): Promise<SignInfo>`

- onlyInfo: 只返回当天签到信息，不执行签到

执行米游社签到

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

All game data & pictures from ©mihoyo
