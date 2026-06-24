(function() {
  const config = {
    baseUrl: 'https://raw.githubusercontent.com/yzpmf/Ge-resurme/master/articles/',
    indexFile: 'index.json'
  };

  function mdToHtml(md) {
    return md
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

  function parseFrontmatter(md) {
    const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, content: md };
    const yaml = match[1];
    const content = match[2].trim();
    const meta = {};
    yaml.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        let value = valueParts.join(':').trim();
        value = value.replace(/^["']|["']$/g, '');
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        }
        meta[key.trim()] = value;
      }
    });
    return { meta, content };
  }

  async function loadArticles() {
    const container = document.getElementById('articles-list');
    if (!container) return;
    try {
      let articles = null;
      try {
        const indexRes = await fetch(config.baseUrl + config.indexFile);
        if (indexRes.ok) {
          articles = await indexRes.json();
        }
      } catch (e) {}
      if (!Array.isArray(articles)) {
        articles = [
          { file: 'hello-world.md', title: '欢迎来到我的博客', date: '2026-04-16', tags: ['随笔'], summary: '这是我的个人博客第一篇文章，记录学习和生活点滴。' }
        ];
      }
      if (articles.length === 0) {
        container.innerHTML = '<p class="no-articles">\u6682\u65e0\u6587\u7ae0\uff0c\u656c\u8bf7\u671f\u5f85...</p>';
        return;
      }
      container.innerHTML = articles.map(article => `
        <article class="article-card" data-file="${article.file}">
          <div class="article-header">
            <h3 class="article-title">${article.title}</h3>
            <span class="article-date">${article.date}</span>
          </div>
          ${article.summary ? `<p class="article-summary">${article.summary}</p>` : ''}
          ${article.tags ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
          <button class="read-more" onclick="loadArticle('${article.file}')">\u9605\u8bfb\u5168\u6587 \u2192</button>
        </article>
      `).join('');
    } catch (err) {
      container.innerHTML = '<p class="error">\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5</p>';
      console.error('加载文章失败:', err);
    }
  }

  window.loadArticle = async function(filename) {
    const modal = document.getElementById('article-modal');
    const content = document.getElementById('article-content');
    modal.classList.add('active');
    content.innerHTML = '<p class="loading">\u52a0\u8f7d\u4e2d...</p>';
    try {
      const res = await fetch(config.baseUrl + filename);
      if (!res.ok) throw new Error('文章不存在');
      const md = await res.text();
      const { meta, content: body } = parseFrontmatter(md);
      content.innerHTML = `
        <div class="article-full">
          <header class="article-full-header">
            <h1>${meta.title || '\u65e0\u6807\u9898'}</h1>
            <div class="article-meta">
              <span>\u{1F4C5} ${meta.date || ''}</span>
              ${meta.tags ? `<span>\u{1F3F7}\ufe0f ${meta.tags.join(', ')}</span>` : ''}
            </div>
          </header>
          <div class="article-body">
            ${mdToHtml(body)}
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = '<p class="error">\u6587\u7ae0\u52a0\u8f7d\u5931\u8d25</p>';
    }
  };

  window.closeArticle = function() {
    document.getElementById('article-modal').classList.remove('active');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadArticles);
  } else {
    loadArticles();
  }
})();
