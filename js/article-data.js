/* Shared article sources and safe links for the list and the reading page. */
(function () {
  'use strict';
  const API = 'https://con.gezhenghao.com/api/public/content';
  const RAW = 'https://raw.githubusercontent.com/yzpmf/Ge-resurme/master/articles/';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  async function request(url, type = 'json') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await response[type]();
    } finally { clearTimeout(timeout); }
  }
  function url(article, source) {
    return 'article.html?' + new URLSearchParams(source === 'cms' ? { slug: article.slug } : { file: article.file });
  }
  const isLocalPreview = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(location.href).hostname);
  async function staticList() {
    for (const base of ['articles/', RAW]) {
      try {
        const list = await request(base + 'index.json');
        if (Array.isArray(list)) return { base, list: list.filter(a => a && typeof a.file === 'string' && a.title) };
      } catch (_) { /* Try the next article source. */ }
    }
    throw new Error('文章目录暂时无法读取');
  }
  function frontmatter(markdown) {
    const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
    if (!match) return { meta: {}, body: normalized };
    const meta = {};
    match[1].split('\n').forEach(line => {
      const part = line.match(/^(title|date|summary|tags):\s*(.*)$/);
      if (!part) return;
      const value = part[2].trim();
      meta[part[1]] = value.startsWith('[') && value.endsWith(']')
        ? value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        : value.replace(/^["']|["']$/g, '');
    });
    return { meta, body: match[2].trim() };
  }
  async function read(params) {
    const slug = params.get('slug');
    const file = params.get('file');
    if (!slug && !file) throw new Error('请选择一篇文章，再来这里慢慢读。');
    if (slug) {
      let data;
      try {
        data = await request(API);
      } catch (_) { throw new Error('暂时无法连接文章服务，请稍后重试。'); }
      if (!Array.isArray(data.articles)) throw new Error('文章目录暂时无法读取，请稍后重试。');
      const matches = data.articles.filter(a => a && a.slug === slug && String(a.title || '').trim());
      if (!matches.length) throw new Error('这篇文章尚未发布或已被移除。');
      if (matches.length > 1) throw new Error('这篇文章暂时无法打开，请作者检查文章标识。');
      return { ...matches[0], base: location.href, uploadsBase: new URL('/', API).href };
    }
    const source = await staticList();
    const entry = source.list.find(a => file ? a.file === file : a.slug === slug || a.file.replace(/\.md$/i, '') === slug);
    if (!entry) throw new Error('暂时找不到这篇文章，它可能已被移动或尚未发布。');
    if (!/^[^?#\\]+\.md$/i.test(entry.file) || entry.file.split('/').some(p => p === '..' || p === '.')) throw new Error('文章路径无效');
    const path = entry.file.split('/').map(encodeURIComponent).join('/');
    const articleUrl = new URL(source.base + path, location.href);
    const parsed = frontmatter(await request(articleUrl.href, 'text'));
    return { ...entry, ...parsed.meta, body: parsed.body, base: articleUrl.href };
  }
  window.BlogArticles = { esc, url, isLocalPreview, staticList, read };
})();
