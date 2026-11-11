/* Load local articles immediately; the CMS may replace the list when ready. */
(function () {
  'use strict';
  const { url, staticList } = window.BlogArticles;
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
      if (list.length) {
        window.BlogShelf.render(container, list.map(article => ({ title: article.title, date: article.date, href: url(article, 'static'), cover: article.cover || '' })));
      } else {
        container.innerHTML = '<p class="no-articles">暂无文章，敬请期待...</p>';
      }
      if (typeof window.__refreshMotion === 'function') window.__refreshMotion();
    } catch (_) {
      if (!window.__cmsArticlesReady) container.innerHTML = '<p class="error">文章目录暂时无法读取，请刷新重试。</p>';
    }
  }
  window.__loadGithubArticlesFallback = loadArticles;
  if (window.BlogArticles.isLocalPreview) loadArticles();
})();
