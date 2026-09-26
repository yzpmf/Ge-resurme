(function () {
  'use strict';
  const root = document.documentElement;
  const arrival = document.getElementById('reading-arrival');
  const reader = document.getElementById('reader');
  const enter = document.getElementById('enter-reading');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const started = performance.now();
  let opened = false;

  // A blocked storage API must never prevent reading.
  [['font', ['kai', 'song', 'sans']], ['size', ['small', 'normal', 'large']]].forEach(([name, choices]) => {
    const select = document.getElementById(name + '-choice');
    try {
      const value = localStorage.getItem('blog:reader:' + name);
      if (choices.includes(value)) root.dataset[name] = value;
    } catch (_) { /* Keep the default. */ }
    select.value = root.dataset[name];
    select.addEventListener('change', () => {
      root.dataset[name] = select.value;
      try { localStorage.setItem('blog:reader:' + name, select.value); } catch (_) { /* Optional preference. */ }
      requestAnimationFrame(updateProgress);
    });
  });
  document.addEventListener('click', event => {
    const settings = document.querySelector('.reading-settings');
    if (!settings.contains(event.target)) settings.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelector('.reading-settings').open = false;
  });

  function updateProgress() {
    if (reader.hidden) return;
    const height = document.documentElement.scrollHeight - innerHeight;
    const fraction = height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 1;
    document.getElementById('progress').style.transform = 'scaleX(' + fraction + ')';
  }
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);

  function openReading() {
    if (opened) return;
    opened = true;
    arrival.classList.add('is-leaving');
    setTimeout(() => {
      arrival.hidden = true;
      reader.hidden = false;
      // Changing the loading scene's height must not anchor the viewport to the footer.
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Stop background animations when the arrival scene is no longer visible.
      arrival.querySelectorAll('*').forEach(el => { el.style.animationPlayState = 'paused'; });
      updateProgress();
      reader.focus({ preventScroll: true });
      const target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }, reducedMotion.matches ? 0 : 350);
  }
  enter.addEventListener('click', openReading);
  document.getElementById('retry-reading').addEventListener('click', () => location.reload());

  function render(article) {
    if (!window.marked || !window.DOMPurify) throw new Error('阅读组件加载失败，请刷新后再试。');
    const title = String(article.title || '无题');
    document.title = title + ' · 葛政豪的文集';
    document.getElementById('article-title').textContent = title;
    document.querySelector('meta[name="description"]').content = String(article.summary || title).slice(0, 180);
    const body = document.getElementById('article-body');
    // Markdown is untrusted content, including locally cached CMS data.
    body.innerHTML = DOMPurify.sanitize(marked.parse(String(article.body || '').replace(/\r\n?/g, '\n'), { gfm: true, breaks: false }), {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea', 'iframe', 'object', 'embed', 'video', 'audio'],
      FORBID_ATTR: ['style', 'id', 'name', 'srcset', 'autofocus'],
      ALLOW_DATA_ATTR: false
    });
    // Most existing Markdown files repeat their title on the first line.
    const first = body.firstElementChild;
    if (first && first.tagName === 'H1' && first.textContent.trim() === title.trim()) first.remove();
    if (!body.textContent.trim() && !body.querySelector('img')) body.textContent = '这篇文章还在整理中，稍后再来读读吧。';
    body.querySelectorAll('a[href],img[src]').forEach(el => {
      const attr = el.tagName === 'IMG' ? 'src' : 'href';
      const raw = el.getAttribute(attr);
      if (attr === 'href' && raw.startsWith('#')) return;
      try {
        const base = article.uploadsBase && /^\/?uploads\//.test(raw) ? article.uploadsBase : article.base;
        const resolved = new URL(raw, base);
        const allowed = attr === 'src' ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:'];
        if (!allowed.includes(resolved.protocol)) { el.removeAttribute(attr); return; }
        el.setAttribute(attr, resolved.href);
        if (el.tagName === 'IMG') { el.loading = 'lazy'; el.addEventListener('load', updateProgress); }
        else if (resolved.origin !== location.origin) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
      } catch (_) { el.removeAttribute(attr); }
    });
    body.querySelectorAll('table').forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-scroll';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', '文章表格，可横向滚动');
      table.before(wrapper);
      wrapper.append(table);
    });
    const count = body.textContent.replace(/\s/g, '').length;
    const meta = [article.date, ...(Array.isArray(article.tags) ? article.tags : []), '约 ' + Math.max(1, Math.ceil(count / 350)) + ' 分钟'];
    document.getElementById('article-meta').replaceChildren(...meta.filter(Boolean).map(value => {
      const span = document.createElement('span');
      span.textContent = value;
      return span;
    }));
    const toc = document.getElementById('toc');
    const headings = [...body.querySelectorAll('h2,h3')];
    headings.forEach((heading, index) => {
      heading.id = 'section-' + (index + 1);
      const link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent;
      if (heading.tagName === 'H3') link.className = 'subheading';
      toc.append(link);
    });
    document.querySelector('.contents').hidden = !headings.length;
    if (!headings.length) reader.classList.add('without-contents');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) toc.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
        });
      }, { rootMargin: '-5% 0px -65% 0px' });
      headings.forEach(h => observer.observe(h));
    }
  }

  window.BlogArticles.read(new URLSearchParams(location.search)).then(article => {
    render(article);
    document.getElementById('arrival-status').textContent = '书已翻开，请慢慢读。';
    enter.hidden = false;
    // Brief arrival, never an artificial long loading screen; ready content is skippable.
    setTimeout(openReading, reducedMotion.matches ? 0 : Math.max(0, 1600 - (performance.now() - started)));
  }).catch(error => {
    arrival.hidden = true;
    document.getElementById('reader-error').hidden = false;
    document.getElementById('error-message').textContent = error.name === 'AbortError' ? '等了片刻仍未取到正文，请检查网络后重试。' : error.message;
    document.title = '文章暂未加载 · 葛政豪';
  });
})();
