/* =====================================================================
 * 留言表单处理 —— 两套方案共用，靠下面 CONFIG.mode 一键切换
 *
 *   mode: 'netlify'  →  静态托管方案。表单通过 AJAX 提交给 Netlify Forms，
 *                       由 Netlify 后台收集并(配置后)转发到你的邮箱。
 *                       无需后端，部署在 Netlify 上即可用。
 *
 *   mode: 'server'   →  服务器方案。表单以 JSON POST 到你自己的后端
 *                       (server/contact-server.js)，由后端用 SMTP 发邮件。
 *                       适合自建服务器 / 不想依赖 Netlify 的场景。
 *
 * 切换方法：改 mode；用 server 时把 serverEndpoint 填成你后端的公网地址。
 * 详见仓库根目录 开发文档.md。
 * =================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    mode: 'netlify', // 'netlify' | 'server'
    serverEndpoint: 'https://your-server.example.com/api/contact' // 仅 server 模式用
  };

  var form = document.getElementById('contactForm');
  if (!form) return;

  var statusEl = document.getElementById('cf-status');
  var btn = form.querySelector('.form-submit');

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status' + (type ? ' ' + type : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // 蜜罐被填 → 判定为机器人，假装成功，不真正发送
    var hp = form.querySelector('[name="bot-field"]');
    if (hp && hp.value) {
      setStatus('已发送，谢谢！', 'ok');
      form.reset();
      return;
    }

    // 注意：表单自身 name="contact"，会遮蔽 form.name，故统一用 form.elements[...]
    var data = {
      name: form.elements['name'].value.trim(),
      email: form.elements['email'].value.trim(),
      message: form.elements['message'].value.trim()
    };
    if (!data.name || !data.email || !data.message) {
      setStatus('请把称呼、邮箱和留言都填一下~', 'err');
      return;
    }

    btn.disabled = true;
    setStatus('发送中……', '');

    var request;
    if (CONFIG.mode === 'server') {
      request = fetch(CONFIG.serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      // Netlify Forms：以 application/x-www-form-urlencoded 提交到当前站点根路径
      var body = new URLSearchParams();
      body.append('form-name', 'contact');
      body.append('name', data.name);
      body.append('email', data.email);
      body.append('message', data.message);
      request = fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
    }

    request
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        setStatus('留言已发送，感谢！我会尽快回复~', 'ok');
      })
      .catch(function (err) {
        setStatus('发送失败（' + err.message + '）。也可以直接邮件联系我。', 'err');
      })
      .then(function () {
        btn.disabled = false;
      });
  });
})();
