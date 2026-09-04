# 个人博客 gezhenghao.com — 项目交接文档

> 总纲见 `D:\dev\docs\HANDOVER.md`。**每次开发后必须更新本文件。**
> 更详细的开发文档：本目录 `开发文档.md`（含完整目录结构、进度、邮箱配置）

## 一句话
个人品牌展示站 + 简历站，天蓝×淡黄配色，纯静态，Netlify 托管。

## 技术形态
- 纯静态：`index.html` + `css/` + `js/` + `articles/`(Markdown) + `images/` + `project/`(子项目页)
- 联系表单后端：`server/contact-server.js`（Node + nodemailer）
- 托管：GitHub + Netlify 静态自动部署

## 联系表单三方案（`js/contact.js` 顶部 `CONFIG.mode` 切换）
1. 邮箱直链（mailto）
2. 学校邮箱收信
3. 服务器发信（nodemailer + QQ 邮箱授权码）

> ⚠️ 原 Outlook 发信方案（`gzh.zh@outlook.com`）已废弃：微软关闭了该邮箱的 SMTP 密码认证（535 5.7.139），改用 QQ 邮箱 `gzh.zh@qq.com` + 授权码。

## 密钥
- SMTP 授权码存 `server/.env`（已 gitignore，只提交 `.env.example`）；服务器副本在 `/opt/env/blog-contact.env`

## Git
`https://github.com/yzpmf/Ge-resurme.git`（默认分支 master）

## 上云
只需把 `server/contact-server.js` 后端上云（见 `D:\dev\docs\CLOUD.md`），静态部分继续用 Netlify。

## 最近改动

### 2026-09-04 纸墨×朱砂整站改版 + 荣誉奖项板块 + con 后台接入（已推送上线）
- **改了什么**：①全站视觉改版为「纸墨×朱砂 · 编辑杂志风」（Noto Serif SC + Space Grotesk + JetBrains Mono，去 emoji）；②新增「荣誉奖项」板块（`awards/cimc-2026.html` 详情页 + 证书图 `images/awards/cimc-2026.png`）；③新增 `js/content-loader.js`：项目/奖项/文章从 con.gezhenghao.com 后台动态拉取，失败回退静态内容；④合并时把仓库侧的 LifeOS 卡片补回新版首页（P.01），本地旧目录的落后问题通过这次合并且以仓库为准解决
- **怎么改的**：在 `D:\tmp\Ge-resurme` 克隆（28a71f5）上叠加 `D:\dev\blog` 的改版文件后 push；⚠️ `D:\dev\blog` 仍不是 git 仓库，本次已把它的改动全部并入仓库，后续应以克隆为准
- **后台**：con.gezhenghao.com（内容管理后台）已上线，可在线管理项目/奖项/文章，改动即改即生效（content-loader 拉取）

### 2026-08-23 御膳房卡片改版 + 旧页迁址跳转（已推送上线）
- **改了什么**：①首页项目卡片 1 更新为网页版形态（2026.08 · AI 网页应用，链接 → `http://8.218.193.250/`）；②`project/yvshanfang/index.html` 旧静态页（**内含已泄露且失效的 api.airforce Key**）替换为迁址跳转页
- **怎么改的**：⚠️ 本地 `D:\dev\blog` **不是 git 仓库且落后于仓库**（缺 LifeOS 卡片等），本次是临时克隆 `Ge-resurme` 到 `D:\tmp\Ge-resurme` 精准修改后 push（commit e33f489）。**以后以 GitHub 仓库为准**，建议尽快把本地目录与仓库对齐
- **Netlify 自动部署**已验证生效

### 2026-08-22 联系表单后端已部署上云（服务器端全链路跑通）
- **改了什么**：`/opt/apps/blog-contact/` 部署 contact-server.js + package.json；PM2 进程名 `blog-contact`，监听 3001；配置在 `/opt/env/blog-contact.env`
- **验证结果**：服务器本机 `POST /api/contact` 返回 `{"ok":true}`，QQ SMTP 真实发信成功（收件 `2298209797@qq.com`）
- **发信账号**：`gzh.zh@qq.com`（授权码在 .env，16位；Outlook 方案已废弃）
- **还没做**：①前端 `js/contact.js` 还是 `mode:'netlify'`，等 Nginx+HTTPS（或安全组直开）拿到公网地址后切 `mode:'server'` + 填 serverEndpoint；②`pm2 save`/开机自启如未做需补；③阿里云安全组未开 3001，公网暂时访问不到（这是故意的，等 Nginx 挡前面）

### 2026-09-02 安全加固：留言限流 + 邮件头注入防护
- **改了什么**：`server/contact-server.js` ①加 IP 限流（每 IP 10 分钟 5 条，超出 429；经 nginx 时取 XFF 最后一段即真实来源，本机回环直连豁免）；②name 进邮件主题前剥除 CRLF（防 SMTP 头注入）
- **部署**：已 scp 至 `/opt/apps/blog-contact/` 并 `pm2 restart`，健康检查通过；服务器上旧版备份 `contact-server.js.bak-20260902`
- **验证**：服务器模拟公网 IP（XFF: 203.0.113.7）连打 7 次 → 前 5 次 200（发了 5 封测试邮件到邮箱，可忽略）、第 6 次起 429
- **注意**：blog 前端接上后，nginx 反代配置必须带 `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`，限流才能按真实 IP 计

### 2026-09-02 依赖与进程权限加固
- Nodemailer 从 6.x 升级到 9.1.1，修复 addressparser 递归 DoS；本地和服务器 `npm audit --omit=dev` 均为 0 漏洞。
- 进程从 root PM2 迁到 systemd `blog-contact`（用户 `svc-blog`），启用只读系统目录、禁止提权等隔离；环境文件为 root:svc-blog 640。
- 本机 `server/.env` 已移除继承的 Users/Authenticated Users 权限，仅当前用户、SYSTEM、Administrators 可访问。
