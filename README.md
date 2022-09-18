<div align="center" style="margin-top: 1rem;">
  <a target="_blank">
      <img width="160" src="https://github.com/Lipraty/koishi-plugin-paimon/wiki/assets/logo.svg" alt="logo">
  </a>

# koishi-plugin-paimon

[![npm](https://img.shields.io/npm/v/koishi-plugin-paimon?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-paimon)

A koishi plugin for a certain anime game.

</div>



## 安装

```Shell
#npm:
npm install koishi-plugin-paimon

#or use yarn:
yarn add koishi-plugin-paimon
```

## 所需`koishi`外部插件与依赖

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

## 开发计划与进度

- [x] 命令系统
- [x] 数据库管理
- [x] 图片样式
  - [paimon-display](https://paimon-display.app.lonay.me) 项目
- [x] 基本核心
  - UID、Cookie绑定
  - 权限管理
- [ ] 抽卡系统
- [x] 米游社API
  - 旅行者札记
  - 签到
  - 用户数据（数据总览）
  - 深境螺旋
- [ ] EnkaAPI
  - 练度统计计算
- [ ] 莫纳占卜屋

## 插件配置指南

> 一般情况下，推荐使用koishi控制面板进行配置

<details>
<summary>
koishi.yml选项说明
</summary>

```Yaml
...
#paimon插件在koishi中的名字
paimon:
    #高级命令响应级别
    #对应Koishi文档中的用户级别，详阅：https://koishi.js.org/guide/database/builtin.html#用户权限
    #在本插件中，子命令被分为高级与普通两种，当调用高级命令时，需要验证用户最低权限级别方可生效
    master: 4
    #用于公共查询的米游社小饼干，可以为多个
    cookie: ["cooike"] 
    #小饼干绑定帮助文档地址，GitHub可能访问不稳定，可以替换为其他地址
    cookieDesc: "https://github.com/Lipraty/koishi-plugin-paimon/blob/main/docs/cookie.md"
    #禁止使用命令列表
    commandBan: ["command"]
    #单用户每日抽卡次数
    gachaCount: 1
    #抽卡后撤回消息（30-120s，为0时不撤回）
    gachaRevock: 0
    #米游社推送
    pushTime: "0 0 0/5 * * * ?"
    pushCount: 1
    #角色相关设置
    character: 
        #角色面板查询所用API，基于Enka实现，参考自`https://github.com/yoimiya-kokomi/miao-plugin`
        panelApi: "https://enka.network/"
        #角色额外别名文件路径，文件为json
        roles: ""
...
```

</details>



## 命令使用

插件命令统一以`paimon`开头，唯一参数为`[uid]`，随后可接额外的选项与参数。

```
paimon [uid] --options ...args
```

其中`[uid]`被视为一个可选参数，如果有该参数则会让paimon的行为限制在该uid内。

- 指定的`[uid]`只能是已绑定的uid，如果未绑定该uid，则返回非绑定uid警告。
- 部分命令会无视`[uid]`选项，如 `paimon.bind`、`paimon.gacha`等。
- 当用户权限大于等于`master`选项所设置数值时，将无视任何限制。

All game data & pictures from ©mihoyo
