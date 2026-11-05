/* Reveal the already-loaded homepage without navigating or initializing it twice. */
(function () {
  'use strict';
  const root = document.documentElement;
  const content = document.getElementById('site-content');
  if (!content) {
    // An older cached standalone welcome document may still request this file.
    location.replace('index.html?__welcome=show');
    return;
  }
  const page = document.getElementById('site-welcome');
  const pen = document.getElementById('yzpmf-ribbon');
  const active = root.classList.contains('welcome-active');
  const preview = root.dataset.welcomeMode === 'preview';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function stylesheetReady(link) {
    if (!link || link.dataset.loaded || link.sheet) return Promise.resolve();
    return new Promise(resolve => {
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', resolve, { once: true });
    });
  }

  function paint() {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  const mainStyleReady = stylesheetReady(document.querySelector('[data-site-style="main"]'));
  if (!active) {
    page.remove();
    mainStyleReady.then(() => root.classList.remove('site-booting'));
    return;
  }

  const writingReady = new Promise(resolve => {
    if (reducedMotion.matches || !pen) {
      resolve();
      return;
    }
    pen.addEventListener('animationend', event => {
      if (event.animationName === 'helloWrite') resolve();
    }, { once: true });
    reducedMotion.addEventListener('change', event => { if (event.matches) resolve(); });
    setTimeout(resolve, 2800);
  });

  // Leave as soon as the ribbon finishes. Fonts and CMS must not hold a finished hello on screen.
  const homeReady = Promise.all([mainStyleReady, writingReady]);

  homeReady.then(async () => {
    if (preview) return;
    if (document.fonts && document.fonts.status !== 'loaded') root.classList.add('welcome-font-fallback');
    root.classList.add('welcome-prepared');
    root.classList.remove('site-booting');
    await paint();
    page.classList.add('is-leaving');
    await new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 0 : 280));
    content.inert = false;
    root.classList.remove('welcome-active', 'welcome-prepared');
    root.dataset.welcomeState = 'entered';
    page.remove();
    try { sessionStorage.setItem('gzh-welcome-20261001', '1'); } catch (_) {}
  });
})();
