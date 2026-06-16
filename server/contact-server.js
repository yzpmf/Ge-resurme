/* =====================================================================
 * 联系表单后端（服务器方案）
 *   接收前端 POST /api/contact 的 JSON 留言 → 通过 SMTP 发到你的邮箱。
 *   只依赖一个 npm 包：nodemailer。其余用 Node 内置 http 模块。
 *
 * 运行：
 *   1) cd server && npm install
 *   2) cp .env.example .env  并填好 SMTP 信息
 *   3) npm start                （= node --env-file=.env contact-server.js，需 Node ≥ 20.6）
 *      若 Node 较旧，改用： SMTP_HOST=... SMTP_USER=... node contact-server.js
 *
 * 前端：把 js/contact.js 的 mode 改为 'server'，serverEndpoint 填本服务公网地址
 *       （如 https://api.gezhenghao.com/api/contact）。
 * =================================================================== */
'use strict';

const http = require('http');
const nodemailer = require('nodemailer');

const PORT = Number(process.env.PORT || 3001);
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*'; // 生产建议设为 https://gezhenghao.com

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                       // 如 smtp.qq.com / smtp.163.com
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || 'true') === 'true', // 465=true, 587=false
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } // pass 一般是“授权码”
});

function json(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});         // CORS 预检
  if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok: true });
  if (req.method !== 'POST' || req.url !== '/api/contact') return json(res, 404, { error: 'not found' });

  let raw = '';
  req.on('data', (c) => {
    raw += c;
    if (raw.length > 100000) req.destroy(); // 防超大请求
  });
  req.on('end', async () => {
    try {
      const payload = JSON.parse(raw || '{}');
      const name = (payload.name || '').toString().trim();
      const email = (payload.email || '').toString().trim();
      const message = (payload.message || '').toString().trim();

      if (payload['bot-field']) return json(res, 200, { ok: true }); // 蜜罐
      if (!name || !email || !message) return json(res, 400, { error: '缺少必填字段' });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(res, 400, { error: '邮箱格式不正确' });

      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: process.env.MAIL_TO || process.env.SMTP_USER,
        replyTo: email,                                  // 直接“回复”即可回给访客
        subject: `【网站留言】来自 ${name}`,
        text: `姓名：${name}\n邮箱：${email}\n时间：${new Date().toLocaleString('zh-CN')}\n\n${message}`
      });

      json(res, 200, { ok: true });
    } catch (e) {
      console.error('[contact] 处理失败：', e.message);
      json(res, 500, { error: '服务器处理失败' });
    }
  });
});

server.listen(PORT, () => console.log(`contact-server 已启动，监听 :${PORT}`));
