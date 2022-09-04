<div align="center" style="margin-top: 1rem;">
  <a target="_blank">
      <img width="160" src="./docs/assets/logo.svg" alt="logo">
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

## 所需koishi插件依赖

- `database`：用于存储用户数据
- `koishi-plugin-puppeteer`：用于图片生成
- `@koishijs/plugin-rate-limit`：用于指令速率限制

## 开发计划与进度

- [x] 命令系统
- [x] 数据库管理
- [ ] 图片样式
- [x] 基本核心
  - UID、Cookie绑定
  - 权限管理
- [ ] 抽卡系统
- [ ] 米游社API
  - 旅行者札记
  - 签到
  - 用户数据（数据总览）
  - 深境螺旋
- [ ] EnkaAPI
  - 练度统计计算
- [ ] 莫纳占卜屋

## 插件配置指南

一般情况下，推荐使用koishi控制面板进行配置

### 编辑 koishi.yml

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

## 命令列表

可以在聊天框输入如下命令触发

```
paimon [uid] --options
```

其中`[uid]`被视为一个可选项，如果加入该选项则会让paimon的行为限制在该uid内。

- 指定的`[uid]`只能是已绑定的uid，如果未绑定该uid，则返回非绑定uid警告。
- 部分命令会无视`[uid]`选项，如 `--uid`、`--gacha`等。
- 用户权限在`master`所设置的之上时，将无视绑定限制。

#### 普通命令列表

| 选项      | 别名 | 参数             | 需要Cookie | 说明                                                                                                |
| ----------- | ---- | ---------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| --help      | -h   |                  | ❎          | 列出所有的命令（以列出的为准）                                                                      |
| --uid       |      | [uid]            | ❎          | 绑定该UID至发送者                                                                                   |
| --cookie    | -ck  | [cookie]         | ❎          | 绑定Cookie至发送者 <br/>`⚠️请妥善保管您的cookie，不要将cookie交给任何人，如不信任本插件，请不要使用` |
| --          |      |                  | ❎          | 获取用户数据信息（角色展柜、数据总览等）                                                            |
| --character | -c   | [character name] | ❎          | 获取某个角色的数据                                                                                  |
| --memo      | -m   |                  | ✅          | 获取实时便笺 <br/>可展示内容有：`树脂`、`洞天宝钱`、`每日委托`、`周本`、`质量参变仪`、`探索派遣`    |
| --notes     | -n   | pri/mora         | ✅          | 旅行者札记记录 <br/>为空：获取默认数据；`pri`：获取原石明细；`mora`：获取摩拉明细                   |
| --sign      | -s   | auto:[boolean]   | ✅          | 米游社签到 <br/>当设置aotu:true时，将加入自动签到队列                                               |
| --reset     |      | [command]        | ❎          | 重置某个项目 <br/>目前支持 `--reset --uid [uid]`与`--reset --cookie [cookie]`，为空时则删除         |
| --gacha     |      | ten              | ❎          | 进行抽卡 <br/>为空：单抽`ten`：十连                                                                 |
| --abyss     | -a   | old/teams:[api]  | ✅          | 深境螺旋 <br/>为空：获取当期战绩；`old`：上期战绩；`teams`：获取推荐配队（`api`为出场统计API来源）  |

#### 高级命令列表

| 选项 | 别名 | 参数 | 需要Cookie | 说明 |
| ------ | ---- | ---- | ---------- | ---- |

---

All game data & pictures from ©mihoyo
