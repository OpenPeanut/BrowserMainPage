# 花生起始页 · Peanut

基于原版 [BrowserMainPage](https://openpeanut.github.io/BrowserMainPage/) 的浅色重写版。使用原生 HTML、CSS 与 JavaScript，Vite 负责开发预览与发布打包，无运行时框架依赖。

## 本地使用

需要 Node.js 22.12 或更新版本（CI 使用 Node.js 24）：

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4173 。`npm start` 同样可启动开发服务；端口被占用时可用 `npm run dev -- --port 5173`。

构建与验证发布版本：

```sh
npm test
npm run build
npm run preview
```

发布预览地址为 http://127.0.0.1:4174 。`dist/` 自动生成并被 Git 忽略，无需手动维护。

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

```text
src/                    页面、样式与 JavaScript 源码
  assets/               图标等源素材
  index.html            页面入口
  app.js                页面交互
  data.js               默认网站与图标
  model.js              URL 校验与存储
  suggestions.js        实时搜索推荐
  styles.css            样式与动效
tests/                  自动测试
.github/workflows/      构建与 Pages 部署
vite.config.js          构建配置
package.json            依赖与命令
package-lock.json       锁定依赖版本
```

`npm test` 验证 URL 安全、搜索参数与损坏存储恢复。

## GitHub Pages

仓库只提交源码、测试与构建配置。推送到 `master` 后，GitHub Actions 自动执行 `npm ci`、测试和构建，把生成的 `dist/` 上传为 Pages 部署产物并发布；不把构建产物提交回仓库，也不需要 `gh-pages` 分支。

Pages 的发布来源设为 **GitHub Actions**。Vite 使用相对资源路径，兼容 `/BrowserMainPage/` 子目录。线上地址仍是 https://openpeanut.github.io/BrowserMainPage/ 。

数据绑定当前浏览器与站点地址；换设备、端口或域名不会自动同步。快捷网站的登录和访问权限由目标网站管理。

实时联想沿用原版百度接口，输入的关键词会发送给百度；昵称、快捷网站和本地搜索历史不会随联想请求上传。接口不可用时自动保留本地匹配和直接搜索。
