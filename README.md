<div align="center" style="margin-top: 1rem;">
  <a target="_blank">
      <img width="160" src="https://github.com/Lipraty/koishi-plugin-paimon/wiki/assets/logo.svg" alt="logo">
  </a>

# koishi-plugin-paimon

[![npm](https://img.shields.io/npm/v/koishi-plugin-paimon?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-paimon)

A [koishi](https://github.com/koishijs/koishi) plugin for a certain anime game.

</div>

## 快速使用

由于paimon只是koishi中的插件，如果您需要一个完整的机器人，可以根据下列步骤快速搭建
> 可以参考Koishi官方制作的[novelai插件安装视频教程](https://www.bilibili.com/video/BV1Cm4y1A7X7/?t=35.1)来安装paimon插件

### 1. 下载并运行Koishi
- 1.1 在Windows/macOS上运行：
  - [点击下载Koishi桌面版](https://github.com/koishijs/koishi-desktop/releases/latest)
  - 启动Koishi桌面版，将会在浏览器看到一个控制面板
  - 点击控制面板中的「浏览插件」
- 1.2 在Android上运行：
  - [点击下载Koishi手机版](https://github.com/koishijs/koishi-android/releases/latest)
  - 打开Koishi手机版，点击「管理koishi」后点击「启动koishi」
  - 等待koishi启动完成后，返回到主界面，点击「启动Console」进入管理界面
  - 点击控制面板中的「浏览插件」
- 1.3 搜索`paimon`并点击添加，等待依赖更新完成

### 2. 启用paimon插件

- 在左侧菜单栏中找到「 <img width="12" src="https://github.com/Lipraty/koishi-plugin-paimon/wiki/assets/koishi.plugin.svg" alt="plugin"> 插件配置」，点击「待添加」，在插件选择下拉框中找到`paimon`
- 正常来说，paimon的默认配置已经足够使用，点击右上角「 <img width="12" src="https://github.com/Lipraty/koishi-plugin-paimon/wiki/assets/koishi.startplugin.svg" alt="startplugin"> 启用插件」便可

这样，您可以在Koishi沙盒中测试使用paimon了。如果需要进一步使用QQ，可继续下列步骤：

### 3. 在Koishi中登录QQ

- 准备一个QQ账号
- 在左侧菜单栏中找到「 <img width="12" src="https://github.com/Lipraty/koishi-plugin-paimon/wiki/assets/koishi.plugin.svg" alt="plugin"> 插件配置」，点击进入
- 选择“adapter-pnebot”，完成下列配置：
  - 在`selfId`填写QQ号
  - 在`password`中填写QQ账号密码
  - 在`protocol`中选择“ws-reverse”
  - 将`gocqhttp.enable`选项打开
- 点击右上角「 <img width="12" src="https://github.com/Lipraty/koishi-plugin-paimon/wiki/assets/koishi.startplugin.svg" alt="startplugin"> 启用插件」
  
现在，你可以在QQ中使用paimon了，和机器人账号发送`paimon`或`#派蒙`获取详细用法吧！

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

## 开发计划与进度

- [x] 数据库管理
- [x] 图片样式
  - [x] [paimon-display](https://paimon-display.app.lonay.me) 项目
- [x] 基本
  - [x] UID、Cookie绑定
  - [x] 基于uid的随机device生成
  - [ ] 权限管理
- [x] 米游社API
  - [x] 旅行者札记
  - [x] 签到
  - [ ] 用户数据（数据总览）
  - [ ] 深境螺旋
- [ ] 角色数据
  - [ ] 通过EnkaAPI获取
  - [ ] 等级、武器、圣遗物、命座等数据管理
  - [ ] 练度统计计算（可莉特调）
- [ ] 模拟抽卡

## 命令使用

插件命令以`paimon`开头，唯一参数为`[uid]`，随后可接额外的选项与参数。

```Shell
paimon [uid] --options [option arg]
```

> 具体用法可以发送`paimon -h`查看

其中`[uid]`被视为一个可选参数，如果有该参数则会让paimon的行为限制在该uid内。

- 指定的`[uid]`只能是已绑定的uid，如果未绑定该uid，则返回非绑定uid警告。
- 当用户权限大于等于`master`选项所设置数值时，将无视限制。

插件有一个子命令`paimon.bind`，该命令用于绑定用户cookie等敏感信息，因而仅在私聊下才会生效。

All game data & pictures from ©mihoyo
