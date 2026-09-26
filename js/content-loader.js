/* =====================================================================
 * 动态内容加载器
 * 从 con.gezhenghao.com 拉取后台管理的 项目 / 奖项 / 文章 数据并渲染。
 * 拉取失败（后台未上线、网络问题等）时静默保留 index.html 中的静态内容，
 * 不影响网站正常访问。
 * =================================================================== */
(function () {
  'use strict';

  var API_URL = 'https://con.gezhenghao.com/api/public/content';
  var TIMEOUT_MS = 10000;
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
  function slugify(title) {
    return String(title || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u4e00-\u9fa5_-]/g, '')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'untitled';
  }
  function validArticle(a) {
    return a && String(a.title || '').trim() && String(a.slug || '').trim();
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
    var list = arr(articles).map(function (a) {
      a = a || {};
      if (!validArticle(a)) return null;
      if (!a.slug) a.slug = slugify(a.title);
      return a;
    }).filter(Boolean);
    window.__cmsArticlesReady = true;
    articlesCache = list;
    window.__articlesCache = articlesCache;
    if (!list.length) {
      box.innerHTML = '<p class="no-articles">暂无文章，敬请期待...</p>';
      return;
    }
    box.innerHTML = list
      .map(function (a) {
        var href = esc(window.BlogArticles.url(a, 'cms'));
        return (
          '<article class="article-card" data-slug="' + esc(a.slug) + '">' +
          '<div class="article-header"><h3 class="article-title"><a href="' + href + '">' + esc(a.title) + '</a></h3>' +
          '<span class="article-date">' + esc(a.date) + '</span></div>' +
          (a.summary ? '<p class="article-summary">' + esc(a.summary) + '</p>' : '') +
          (arr(a.tags).length
            ? '<div class="article-tags">' + arr(a.tags).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>'
            : '') +
          '<a class="read-more" href="' + href + '">阅读全文 →</a>' +
          '</article>'
        );
      })
      .join('');
  }

  /* ---------- 拉取（超时静默回退到静态内容） ---------- */
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
  fetch(API_URL, { signal: ctrl.signal, cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      clearTimeout(timer);
      if (!data || !Array.isArray(data.articles)) throw new Error('Invalid article list');
      if (data && Array.isArray(data.projects)) renderProjects(data.projects);
      if (data && Array.isArray(data.awards)) renderAwards(data.awards);
      if (data && Array.isArray(data.articles)) renderArticles(data.articles);
    })
    .catch(function (err) {
      clearTimeout(timer);
      /* 本地可预览静态稿；正式站显示重试提示，避免复活已删除的文章。 */
      if (typeof window.__loadGithubArticlesFallback === 'function') {
        try { window.__loadGithubArticlesFallback(); } catch (e) {}
      }
      console.warn('后台 API 拉取失败:', err);
    });
})();
