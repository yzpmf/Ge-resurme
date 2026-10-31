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

### 2026-10-31 联系邮箱更新
- 首页联系邮箱由 `yzpmf@swjtu.edu.cn` 改为 `yzpmf@my.swjtu.edu.cn`，同步更新显示文字、`mailto:` 链接和复制按钮数据。
- 本地源码的联系区已无知乎入口，本次保持移除状态；GitHub 与微信公众号联系方式不变。
- 本次仅提交联系区与交接记录，未夹带本地其他改版；推送 `master` 后由 Netlify 自动部署，无新增依赖、密钥或配置。

### 2026-10-11 hello 开场重绘为圆滑彩色飘带（苹果发布会风格）
- 应用户偏好重绘开场 hello 图形：原笔刷描边字形改为 Pacifico 圆润花体（字形路径一次性提取后内嵌 SVG，**无字体文件依赖**）；主笔换苹果发布会式彩色渐变（橙 `#FF7A2F` → 粉 `#FF3D6E` → 紫 `#A64DFF` → 蓝 `#4D7DFF` → 天蓝 `#3DB6FF`），新增上下两条细飘带流线（暖橙粉 / 蓝紫）。
- 书写动画机制不变：仍为 `helloWrite` 遮罩描边沿字形推进（`#yzpmf-ribbon` 元素与动画名契约不动，`welcome.js` 零改动）；飘带用新 `helloFlow` 动画延迟 700ms / 1000ms 流入；`prefers-reduced-motion` 下全部静止直出。
- 样式按规范同步两份：`index.html` 内联 welcome-critical 与 `css/welcome.css`（`.hello-word` / `.hello-stream` / 遮罩描边 70px / `helloFlow` 关键帧 / 减少动效清单）。
- 验证：本地 `?__welcome=preview` 截图核对成品；字形提取路径与真实字体渲染同位叠加校验一致；旧巨型描边字形路径与 `hello-ink` 样式已移除。push `master` 由 Netlify 发布。

### 2026-10-11 开场放行提速 + G 标主笔提亮（与墨影分层）
- 应用户反馈"底与主笔颜色像、分不开"：G 标主笔渐变整体提亮（`#C93A22 → #A32D1A` 改为 `#D9502E → #C43A21`），与墨色立体层 `#1C1917` 拉开明度对比（实测亮度差约 88/255，32px 下两层清晰可分）；favicon-32 同步重绘。
- 开场卡顿、放行慢的优化（`js/welcome.js`）：
  - 揭示加封顶：主页层最迟 3.2s 放行（减少动效偏好 1.2s）；此前需等字体（最长 8s）+ CMS（最长 10s）齐备才淡出，最坏可达 10s+。
  - 字体判定与 CMS 解耦、2.4s 内未就绪即锁定系统回退字体，杜绝主页可见后迟到换字引起的排版跳动。
  - `.welcome` 增加 `will-change: opacity`，淡出走合成层更顺（`index.html` 内联 welcome-critical 与 `css/welcome.css` 同步更新）。
- 验证：本地计时截图 3s 已揭示主页；`node --check js/welcome.js` 通过；favicon 亮度分离度实测达标。push `master` 由 Netlify 发布。

### 2026-10-11 G 标志调整：hello 页顶部换 G 标、笔画加粗
- hello 欢迎页左上「葛」朱砂印章替换为 G 个人标志（`images/logo-g.svg`）；`index.html` 内联 welcome-critical 与 `css/welcome.css` 的 `.welcome-seal` 样式同步更新（按规范两处一起改）。
- 按反馈加粗标志笔画（stroke 17 → 20），墨色立体层错位拉开（22 → 26），小尺寸下字形与"底"更清晰；favicon 32/16 同步按加粗切重绘。
- 验证：本地 hello 预览与导航截图核对（含像素检查）；push `master` 由 Netlify 发布。

### 2026-10-11 新增 G 个人标志，接入导航与 favicon
- 定稿个人标志（第二版：意式斜体单笔画 G + 向后复制立体），配色对齐站点纸墨 × 朱砂体系：主笔朱砂渐变 `#C93A22 → #A32D1A`，立体层墨色 `#1C1917`。
- 导航栏「朱砂印章」Logo 位替换为 G 标志（`images/logo-g.svg`，矢量透明底）；`css/style.css` 的 `.logo` 改为承载图片。
- 全站三页（`index.html` / `article.html` / `welcome.html`）补齐 favicon：`images/favicon-32.png`（标签页，带墨色立体层）+ `images/favicon-16.png`（16px 单色简化版）+ SVG 图标声明。
- 验证：本地浏览器核对导航 Logo 与标签页图标渲染；push `master` 后由 Netlify 自动发布。

### 2026-10-01 hello 期间完成主页加载，原地显示
- 修复前一版预加载后仍跳转、重复执行主页脚本的问题。首页现在以独立全屏欢迎画面遮住正在加载的真实主页；hello 结束且页面准备完成后淡出遮罩，直接显示同一份 DOM，不使用 iframe，不进行第二次导航。
- 欢迎样式内联，主页样式/字体并行下载，业务脚本按原顺序 defer。等待样式、脚本初始化、CMS 内容（或原有超时回退）及字体完成，再预绘制两帧并淡出。保留加粗书写、无进入按钮、同标签页展示一次、锚点直达与减少动态效果支持。
- 保留滚动条空间，避免退出开场时主页宽度变化。字体等待有 8 秒上限，超时时本次页面使用固定的系统字体，避免进入后迟到的字体再改变排版。CMS 继续使用原有 10 秒超时，不改变线上内容规则。
- `welcome.html` 保留为兼容入口，在动画开始前转到首页；`index.html?__welcome=show` 可重播，`__welcome=preview` 可停留检查画面；内部参数会从地址栏清除。正常访问主页无额外导航。无 JavaScript 时直接展示静态主页，控制器加载失败时也解除遮罩。
- `css/welcome.css` 的完整内容同步内联在 `index.html` 的 `welcome-critical` 中，修改欢迎样式时应同时更新。欢迎控制器与内容加载器使用 hello-preload-20261001 版本参数。
- 验证：本地故意延迟内容请求，动画结束后仍显示欢迎画面；释放请求后原地进入，前后 document 标识一致、无 iframe 或重复首页请求。桌面和 390px 手机画面检查通过，手机进入后菜单展开、项目锚点可用；源目录额外静态项目卡片完整保留。



### 2026-10-01 独立 hello 欢迎页
- hello 移至单独的全屏 `welcome.html`，主页移除原来的 hello 区域和三秒滚动锁定，直接展示个人介绍。重新描绘连续曲线，并按用户反馈加厚笔触；保留纸墨、朱砂和轻微纸面格纹。
- 按用户最新要求，欢迎页没有“进入网站”等按钮。约 2.45 秒书写结束后淡出并自动进入主页，播放期间通过同源隐藏框架预加载主页及其字体；后台慢请求不会把访客留在开场页。
- 同一标签页内开场展示一次，返回文集等带锚点的链接直接到目标板块。存储不可用时采用一次 URL 标记避免循环；减少动态效果时直接进入；欢迎页脚本关闭时三秒后自动转到静态主页。
- 新增 `css/welcome.css`、`js/welcome.js`、`js/site-entry.js`，首页入口脚本与 main.js 带 hello-entry-20261001 版本参数。只叠加开场相关修改，保留其它静态项目卡片和 CMS 数据。
- 验证：实际浏览器核验桌面及 390px 手机欢迎页，无横向溢出、无进入按钮；首次访问自动到主页，刷新不重复开场。脚本语法、入口跳转边界及差异检查通过。发布沿用 GitHub master → Netlify。


### 2026-09-29 新增项目：奶蛙跳一跳（P.03）
- 个人博客项目经历新增「奶蛙跳一跳」项目卡片（链接：https://naiwa.gezhenghao.com/），状态标注为「已上线」。
- 同步更新动态 CMS 内容源（`con.gezhenghao.com` 的 `/opt/apps/con-admin/data/content.json`），线上正式站 `https://gezhenghao.com/` 即时动态拉取展示。
- 本地 `D:\dev\blog\index.html` 同步插入静态回退卡片，原有后续项目顺延编号为 P.04、P.05。

### 2026-09-26 移除御膳房旧小程序码图片
- 按用户澄清，仅删除“掌上御膳房”项目顶部旧图片，不添加新的访问二维码；保留项目介绍和原有“访问项目”文字链接。动态后台项目数据中的该图片也不再渲染。

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
