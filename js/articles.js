/* Load local articles immediately; the CMS may replace the list when ready. */
(function () {
  'use strict';
  const { esc, url, staticList } = window.BlogArticles;
  async function loadArticles() {
    const container = document.getElementById('articles-list');
    if (!container || window.__cmsArticlesReady) return;
    // Production follows the CMS exclusively; an outage must not revive deleted static drafts.
    if (!window.BlogArticles.isLocalPreview) {
      container.innerHTML = '<p class="error">文章目录暂时无法读取，请稍后刷新重试。</p>';
      return;
    }
    try {
      const { list } = await staticList();
      if (window.__cmsArticlesReady) return;
      container.innerHTML = list.length ? list.map(article => `
        <article class="article-card">
          <div class="article-header">
            <h3 class="article-title"><a href="${esc(url(article, 'static'))}">${esc(article.title)}</a></h3>
            <span class="article-date">${esc(article.date)}</span>
          </div>
          ${article.summary ? `<p class="article-summary">${esc(article.summary)}</p>` : ''}
          <div class="article-tags">${(Array.isArray(article.tags) ? article.tags : []).map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}</div>
          <a class="read-more" href="${esc(url(article, 'static'))}">阅读全文 →</a>
        </article>`).join('') : '<p class="no-articles">暂无文章，敬请期待...</p>';
    } catch (_) {
      if (!window.__cmsArticlesReady) container.innerHTML = '<p class="error">文章目录暂时无法读取，请刷新重试。</p>';
    }
  }
  window.__loadGithubArticlesFallback = loadArticles;
  if (window.BlogArticles.isLocalPreview) loadArticles();
})();
