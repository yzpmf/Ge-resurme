/* =====================================================================
 * 动态内容加载器
 * 从 con.gezhenghao.com 拉取后台管理的 项目 / 奖项 / 文章 数据并渲染。
 * 拉取失败（后台未上线、网络问题等）时静默保留 index.html 中的静态内容，
 * 不影响网站正常访问。
 * =================================================================== */
(function () {
  'use strict';

  var API_URL = 'https://con.gezhenghao.com/api/public/content';
  var TIMEOUT_MS = 4000;
  var articlesCache = [];

  /* ---------- 安全工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function safeUrl(u) {
    u = String(u || '');
    if (/^(https?:\/\/|\.?\/|#|[a-z0-9一-龥_-]+\/)/i.test(u)) return u;
    return '#';
  }
  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  /* ---------- 项目 ---------- */
  function renderProjects(projects) {
    var grid = document.querySelector('.projects-grid');
    if (!grid || !projects.length) return;
    grid.innerHTML = projects
      .map(function (p) {
        var statusClass = p.status === '进行中' ? 'status-doing' : 'status-done';
        return (
          '<div class="project-card">' +
          (p.image
            ? '<div class="project-image"><img src="' + esc(safeUrl(p.image)) + '" alt="' + esc(p.title) + '" loading="lazy" /></div>'
            : '') +
          '<div class="project-header"><h3><span class="project-index">' + esc(p.index) + '</span>' + esc(p.title) + '</h3>' +
          '<span class="project-status ' + statusClass + '">' + esc(p.status) + '</span></div>' +
          '<p>' + esc(p.desc) + '</p>' +
          '<div class="project-tags">' +
          arr(p.tags).map(function (t) { return '<span class="tech-tag">' + esc(t) + '</span>'; }).join('') +
          '</div>' +
          '<ul class="project-points">' +
          arr(p.points).map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join('') +
          '</ul>' +
          (p.link
            ? '<a href="' + esc(safeUrl(p.link)) + '" target="_blank" class="project-link">' + esc(p.linkText || '查看项目 →') + '</a>'
            : '') +
          '</div>'
        );
      })
      .join('');
  }

  /* ---------- 奖项 ---------- */
  function renderAwards(awards) {
    var grid = document.querySelector('.awards-grid');
    if (!grid || !awards.length) return;
    grid.innerHTML = awards
      .map(function (a) {
        return (
          '<a class="award-item" href="' + esc(safeUrl(a.detailUrl)) + '">' +
          '<div class="award-item-main"><span class="award-item-index">' + esc(a.index) + '</span>' +
          '<h3>' + esc(a.title) + '</h3><p>' + esc(a.sub) + '</p></div>' +
          '<span class="project-status award-level">' + esc(a.level) + '</span>' +
          '<span class="award-item-arrow">→</span></a>'
        );
      })
      .join('');
  }

  /* ---------- 文章 ---------- */
  function renderArticles(articles) {
    var box = document.getElementById('articles-list');
    if (!box) return;
    articlesCache = articles;
    if (!articles.length) {
      box.innerHTML = '<p class="no-articles">暂无文章，敬请期待...</p>';
      return;
    }
    box.innerHTML = articles
      .map(function (a) {
        return (
          '<article class="article-card">' +
          '<div class="article-header"><h3 class="article-title">' + esc(a.title) + '</h3>' +
          '<span class="article-date">' + esc(a.date) + '</span></div>' +
          (a.summary ? '<p class="article-summary">' + esc(a.summary) + '</p>' : '') +
          (arr(a.tags).length
            ? '<div class="article-tags">' + arr(a.tags).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>'
            : '') +
          '<button class="read-more" onclick="loadArticle(\'' + esc(a.slug) + '\')">阅读全文 →</button>' +
          '</article>'
        );
      })
      .join('');
  }

  /* 简单的 Markdown 转 HTML（与 articles.js 保持一致） */
  function mdToHtml(md) {
    return String(md || '')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  /* 覆盖 articles.js 的阅读器：优先读后台数据 */
  window.loadArticle = function (slug) {
    var modal = document.getElementById('article-modal');
    var content = document.getElementById('article-content');
    var a = null;
    for (var i = 0; i < articlesCache.length; i++) {
      if (articlesCache[i].slug === slug) { a = articlesCache[i]; break; }
    }
    if (!a) return;
    modal.classList.add('active');
    content.innerHTML =
      '<div class="article-full">' +
      '<header class="article-full-header"><h1>' + esc(a.title) + '</h1>' +
      '<div class="article-meta"><span>' + esc(a.date) + '</span>' +
      (arr(a.tags).length ? '<span>' + arr(a.tags).map(esc).join(', ') + '</span>' : '') +
      '</div></header>' +
      '<div class="article-body">' + mdToHtml(a.body) + '</div></div>';
  };

  /* ---------- 拉取（超时静默回退到静态内容） ---------- */
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
  fetch(API_URL, { signal: ctrl.signal })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      clearTimeout(timer);
      if (data && Array.isArray(data.projects)) renderProjects(data.projects);
      if (data && Array.isArray(data.awards)) renderAwards(data.awards);
      if (data && Array.isArray(data.articles)) renderArticles(data.articles);
    })
    .catch(function () {
      clearTimeout(timer);
      /* 后台不可达：保留静态内容与 GitHub 文章源 */
    });
})();
