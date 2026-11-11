# 花生起始页 · Peanut

基于原版 [BrowserMainPage](https://openpeanut.github.io/BrowserMainPage/) 的浅色重写版。保留原有十个网站的完整链接，使用纯 HTML、CSS 与 JavaScript 模块，无运行时依赖、无构建步骤。

## 本地使用

需要 Node.js 20 或更新版本，无需安装依赖：

```sh
npm start
```

打开 http://127.0.0.1:4173 。由于使用原生 ES Modules，请通过 HTTP 服务访问，不要直接双击 HTML。可用 `PORT=8080 npm start` 修改端口。

## 功能

- 浅色流光背景、卡片跟随鼠标的高光、三种浅色主题。
- 本地时间、日期、分时问候、自定义昵称。
- Google / 必应 / 百度切换；输入网址可直接访问；`/` 聚焦搜索。
- 保留原版百度实时搜索推荐，附带本地历史与网站匹配；方向键选择、Enter 打开、Escape 收起。推荐统一来自百度，选中后使用当前搜索引擎搜索。
- 输入停止 180ms 后请求联想，兼容中文输入法；取消过期请求，4 秒超时，服务异常时仍可正常搜索。
- 添加、编辑、删除快捷网站，偏好保存在 localStorage。
- 新标签页开关、专注模式、动画开关；尊重系统的减少动态效果设置。
- 移动端布局、键盘操作和原生无障碍对话框。

## 源码

- `index.html`：页面结构及表单。
- `src/styles.css`：视觉、响应式与动态效果。
- `src/data.js`：默认链接、搜索引擎和内置 SVG 图标。
- `src/model.js`：URL 校验、搜索 URL、存储恢复。
- `src/app.js`：DOM 交互与状态管理。
- `src/suggestions.js`：百度 JSONP 联想、请求取消与推荐面板交互。
- `server.mjs`：仅供本地预览的静态服务器，绑定 localhost。

`npm test` 验证 URL 安全、搜索参数与损坏存储恢复。

## GitHub Pages

将 `index.html`、`favicon.svg` 与 `src/` 部署到 Pages 即可，所有资源都使用相对路径，兼容 `/BrowserMainPage/` 子目录。本仓库 Pages 从 `master` 分支的根目录发布。

数据绑定当前浏览器与站点地址；换设备、端口或域名不会自动同步。快捷网站的登录和访问权限由目标网站管理。

实时联想沿用原版百度接口，输入的关键词会发送给百度；昵称、快捷网站和本地搜索历史不会随联想请求上传。接口不可用时自动保留本地匹配和直接搜索。
