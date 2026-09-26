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

### 2026-09-26 移除御膳房旧小程序码图片
- 用户澄清仅删除项目顶部旧小程序码大图，不放置任何新的访问二维码；保留项目介绍及原有“访问项目”文字链接。
- 静态首页与 CMS 动态渲染均隐藏该项目封面，不修改后台数据。此前误加网页二维码的提交 `8844aa5` 已由本次修正移除，包括二维码脚本与样式。

### 2026-09-26 个人介绍更正
- 根据用户最新说明，将首页标题、描述、“关于我”和当前学习阶段统一改为大二。
- 个人掌握的编程语言统一为 Python、C++、C；HTML 标为基础了解，移除个人熟练掌握 CSS/JavaScript 的表述。同步首页技术栈卡片与技能栏，项目条目自身的技术标签保留。
- 仅修改首页文案与本交接记录，不修改后台文章或其他项目内容。

### 2026-09-26 阅读页发布版本（已上线）
- 部署验证：首版提交 `6aebdde` 已推送 master 并部署；正式域名脚本、样式和字体内容一致，HTML 仅被 Netlify 自动整理站内链接。浏览器核验线上三篇有效 CMS 文章列表，并点击《小镇做题家》成功读取正文；顶部印章和指定结束语均已移除。首次后台连接出现超时，随后重试正常，发布收尾将列表/正文超时统一放宽为 10 秒。
- 用户已批准发布独立阅读页、宋式书斋加载动画、楷体与字号设置，以及移除顶部“葛”字印章和指定页尾文案。
- 发布前收紧数据一致性：CMS 文章每次进入都读取最新公开接口（no-store），移除 sessionStorage 正文缓存；CMS 明确不存在/删除的文章不再回退到静态旧稿，断网显示重试提示；重复 slug 显示不可读提示，避免打开错误文章。
- 正式站的文章列表以 CMS 为准，不再短暂展示或在接口失败时复活静态备用稿。本地 localhost/127.0.0.1 继续支持静态预览；线上后台 CORS 未开放本地端口，因此本地预览不等于线上文章数据。
- CMS 正文相对 `/uploads/` 图片路径解析到后台域名；已是绝对地址的上传图片维持原地址。
- 后台数据未修改：空 slug 的草稿仍不显示；后台尚未增加保存时的唯一性校验，作者应填写不重复且稳定的文章标识。此次仅发布 blog 静态站，不部署 con 后端。
- 验证：文章来源回归覆盖后台更新、删除、重复标识、断网、Markdown CRLF、非法路径与静态预览；原有桌面/手机、Markdown 表格和净化检查结果见下条记录。部署经 GitHub master → Netlify，正式网址 https://gezhenghao.com/。

### 2026-09-26 阅读页文案精简（随本次发布）
- 按用户要求删除阅读页顶部“葛”字印章，保留“纸上光阴”；删除页尾“合上这一页，让文字留一会儿。”，调整结束标记与返回链接间距。

### 2026-09-26 独立阅读页 + 柳窗书斋过渡（初版记录，发布行为见上）
- 文章标题与“阅读全文”改为原生链接，进入 `article.html?slug=后台标识` 或 `article.html?file=Markdown文件名`，首页移除阅读弹窗；链接支持复制、刷新及新标签页。
- 新增 `article.html`、`css/reader.css`、`js/reader.js`、`js/article-data.js`：淡黄纸面、楷书正文、文章目录、阅读进度、返回文集；字体可切换楷书/宋体/黑体，字号可选小/标准/大并本地保存。
- 进入阅读页时显示原创 SVG 宋式木格窗书斋：桌前翻书、窗外柳枝摆动、茶烟。已就绪时最多约 1.6 秒入场，可点“开始阅读”跳过；尊重 prefers-reduced-motion，失败展示重试及返回入口，正文不依赖动画完成。
- 文章来源：CMS 列表覆盖静态列表；点击时短暂缓存正文（60 秒），直接链接/缓存过期从 CMS 拉取；不可达时尝试同名静态文章。静态清单优先同站点 `articles/index.json`，失败才回退 GitHub。修复清单摘要未转义引号导致的无效 JSON。
- `fonts/wenkai/` 自托管霞鹜文楷屏幕阅读版，来自 lxgw-wenkai-screen-webfont 1.7.0，只含一个字重及 97 个 Unicode 子集（总约 5.1 MB，浏览器按需加载）；保留 OFL 与包授权文件。优先该字体，失败回退本机楷体/衬线。宋体和黑体使用系统字体。
- `js/vendor/` 自托管 marked 15.0.12 + DOMPurify 3.3.3（含授权），支持 Markdown 表格、列表、代码块，并净化正文 HTML 与危险链接；无构建步骤、无新增后端配置/密钥。
- 验证：4 个应用脚本语法检查；9 项文章来源检查通过；浏览器核验 1440px 桌面与 390px 手机布局无横向溢出，字体/字号刷新保留、首页点击进入、直达/刷新、缺失文章错误提示、CMS 缓存正文、表格/代码及危险内容净化。修复过渡结束时浏览器滚动锚定导致跳到页尾。
- 状态：仅改本地 D:\dev\blog；未 push / 未触发 Netlify 部署；线上 CMS 当期数据与真实手机设备未作完整端到端核验。后续发布时需完整包含 article.html、css/、js/、fonts/ 与修正后的 articles/index.json。

### 2026-09-25 文章正文支持插图（配合 con 后台上传）
- **背景**：con 后台新增了文章/项目配图上传能力（`POST /api/upload`，图片落盘 `uploads/`，返回绝对地址）。但前台 `mdToHtml` 原来不处理 `![]()` 语法，图传了也显示不出来。
- **改了什么**（仅 3 个文件，+11 行）：
  ①`js/content-loader.js`、`js/articles.js`：md 渲染补充图片语法 `![alt](url)` → `<img loading="lazy">`（**必须排在链接语法之前**，否则 `![x](y)` 会被误当链接处理）；
  ②`css/style.css`：`.article-body` 下新增 `img` 样式（`max-width:100%`、居中、圆角、细边框）。
- **怎么改的**：本地 `D:\dev\blog` 已与仓库漂移（且非 git 仓库），本次克隆 `Ge-resurme` 后**只叠加本功能所需的 3 处改动**（不夹带本地未推送的其它改动），commit `fab25eb` 后 push，Netlify 自动部署已生效。
- **验证**：线上 `gezhenghao.com` 的 `content-loader.js`/`articles.js`/`style.css` 均已包含新语法与样式。
- ⚠️ **Git 推送注意**：全局 git 配置的代理是 `127.0.0.1:7890`（离线），实际 Clash 在 **7897**；且 `github.com` 直连被墙、`clone` 需走代理。推送命令：`git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push origin master`，并设 `GIT_TERMINAL_PROMPT=0`（凭据走已缓存的 GCM）。

### 2026-09-23（同日第二条）项目经历改条目式布局
- **改了什么**：只动 `css/style.css`——`.projects-grid` 从 3 列卡片网格改为纵向条目列表（flex column + 底部分割线）；`.project-index` 编号放大到 34px 与标题同行；带图条目用 `:has(.project-image)` 做「左文右图」（图片 280px 列，1024px 收窄 220px，720px 以下回单列上图下文）；hover 从位移阴影改为标题变朱砂色；去掉卡片背景/边框/圆角
- **兼容性**：`:has()` 选择器 2023 年后浏览器全支持；旧浏览器会退化为图片在条目顶部全宽，不影响阅读
- **注意**：content-loader 动态渲染的卡片 class 相同，条目式对后台数据同样生效；HTML 结构未动

### 2026-09-23 首页微调 + 专业信息更正（本地已改，待推送）
- **改了什么**：①删除页脚「— Designed & built with ink and code.」（保留 © 行）；②删除 Hero 区打字机轮播文字（`#typewriter` 元素 + `js/main.js` 中打字机逻辑整段移除，静态描述句保留）；③删除跑马灯分隔带（`.marquee` 整块）；④专业全站从「计算机科学」更正为「化学」（meta description、title、hero 描述、关于我正文与标签、学习经历时间线）
- **注意**：本目录仍非 git 仓库，需按惯例克隆 `Ge-resurme` 叠加改动后 push 才会上线；CSS 中 `.marquee`/`.hero-tagline` 样式已无用但保留未删

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
