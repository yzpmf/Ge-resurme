# 葛正浩 - 个人网站

用 HTML + CSS + JS 搭建，部署在 Netlify 上。

## 📁 项目结构

```
web/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── main.js         # 交互脚本
└── images/            # 图片文件夹（可添加）
```

## 🚀 部署到 Netlify

### 方法一：拖拽上传（最快）
1. 打开 https://app.netlify.com/drop
2. 把 `web` 文件夹拖进去
3. 完成！获得一个 xxx.netlify.app 网址

### 方法二：连接 GitHub（推荐，自动更新）
1. 把 `web` 文件夹内容推送到 GitHub 仓库
2. 登录 Netlify → Add new site → Import from GitHub
3. 选择仓库 → Deploy
4. 以后每次 git push 会自动部署

## 🌐 绑定域名（gezhenghao.com）

1. Netlify → Site settings → Domain management → Add custom domain
2. 输入 `gezhenghao.com`
3. 在域名服务商添加 DNS 记录：
   - 类型：A，记录值：75.2.60.5
   - 或类型：CNAME，记录值：xxx.netlify.app
4. Netlify 自动申请 SSL 证书（HTTPS）

## 🛠 本地开发

直接用浏览器打开 `index.html` 即可预览。

如需热更新：
```bash
cd web
npx serve .
```

## ✏️ 修改内容

- **个人信息**：编辑 `index.html` 中的姓名、介绍、项目内容
- **样式**：编辑 `css/style.css`
- **邮箱**：搜索 `2298209797@qq.com` 替换为你的邮箱
