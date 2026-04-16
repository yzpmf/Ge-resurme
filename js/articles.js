// 文章加载器 - 从 GitHub 获取 Markdown 文章
(function() {
  const config = {
    // GitHub raw 文件基础路径
    baseUrl: 'https://raw.githubusercontent.com/yzpmf/Ge-resurme/master/articles/',
    // 文章清单文件
    indexFile: 'index.json'
  };

  // 简单的 Markdown 转 HTML
  function mdToHtml(md) {
    return md
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体和斜体
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // 列表
      .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
      // 段落
      .replace(/\n\n/g, '</p><p>')
      // 换行
      .replace(/\n/g, '<br>');
  }

  // 解析 YAML frontmatter
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
        // 移除引号
        value = value.replace(/^["']|["']$/g, '');
        // 解析数组
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        }
        meta[key.trim()] = value;
      }
    });
    
    return { meta, content };
  }

  // 加载文章列表
  async function loadArticles() {
    const container = document.getElementById('articles-list');
    if (!container) return;
    
    container.innerHTML = '<p class="loading">正在加载文章...</p>';
    
    try {
      // 尝试加载 index.json，如果不存在则使用默认列表
      let articles = [];
      try {
        const indexRes = await fetch(config.baseUrl + config.indexFile);
        if (indexRes.ok) {
          articles = await indexRes.json();
        }
      } catch (e) {
        // 默认文章列表
        articles = [
          { file: 'hello-world.md', title: '欢迎来到我的博客', date: '2026-04-16', tags: ['随笔'], summary: '这是我的个人博客第一篇文章，记录学习和生活点滴。' }
        ];
      }
      
      if (articles.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无文章，敬请期待...</p>';
        return;
      }
      
      // 渲染文章列表
      container.innerHTML = articles.map(article => `
        <article class="article-card" data-file="${article.file}">
          <div class="article-header">
            <h3 class="article-title">${article.title}</h3>
            <span class="article-date">${article.date}</span>
          </div>
          ${article.summary ? `<p class="article-summary">${article.summary}</p>` : ''}
          ${article.tags ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
          <button class="read-more" onclick="loadArticle('${article.file}')">阅读全文 →</button>
        </article>
      `).join('');
      
    } catch (err) {
      container.innerHTML = '<p class="error">加载失败，请稍后重试</p>';
      console.error('加载文章失败:', err);
    }
  }

  // 加载单篇文章
  window.loadArticle = async function(filename) {
    const modal = document.getElementById('article-modal');
    const content = document.getElementById('article-content');
    
    modal.classList.add('active');
    content.innerHTML = '<p class="loading">加载中...</p>';
    
    try {
      const res = await fetch(config.baseUrl + filename);
      if (!res.ok) throw new Error('文章不存在');
      
      const md = await res.text();
      const { meta, content: body } = parseFrontmatter(md);
      
      content.innerHTML = `
        <div class="article-full">
          <header class="article-full-header">
            <h1>${meta.title || '无标题'}</h1>
            <div class="article-meta">
              <span>📅 ${meta.date || ''}</span>
              ${meta.tags ? `<span>🏷️ ${meta.tags.join(', ')}</span>` : ''}
            </div>
          </header>
          <div class="article-body">
            ${mdToHtml(body)}
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = '<p class="error">文章加载失败</p>';
    }
  };

  // 关闭文章弹窗
  window.closeArticle = function() {
    document.getElementById('article-modal').classList.remove('active');
  };

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadArticles);
  } else {
    loadArticles();
  }
})();
