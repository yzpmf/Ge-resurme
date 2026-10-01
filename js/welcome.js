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
  const status = document.getElementById('welcome-status-text');
  const pen = document.getElementById('yzpmf-ribbon');
  const active = root.classList.contains('welcome-active');
  const preview = root.dataset.welcomeMode === 'preview';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const domReady = document.readyState === 'loading' || document.readyState === 'interactive'
    ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
    : Promise.resolve();

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

  const contentReady = domReady.then(() => window.__siteContentReady);
  const fontStyleReady = stylesheetReady(document.querySelector('[data-site-style="fonts"]'));
  // Check fonts after the content renders, including glyphs introduced by the CMS.
  const fontsReady = Promise.all([mainStyleReady, contentReady]).then(() => Promise.race([
    fontStyleReady.then(async () => {
      content.getBoundingClientRect();
      if (document.fonts) await document.fonts.ready;
      return true;
    }),
    new Promise(resolve => setTimeout(() => resolve(false), 8000))
  ])).then(loaded => {
    // Keep unavailable fonts from swapping in after the homepage is visible.
    if (!loaded) root.classList.add('welcome-font-fallback');
  });

  const writingReady = new Promise(resolve => {
    if (reducedMotion.matches || getComputedStyle(pen).strokeDashoffset === '0px') {
      resolve();
      return;
    }
    pen.addEventListener('animationend', event => {
      if (event.animationName === 'helloWrite') resolve();
    }, { once: true });
    reducedMotion.addEventListener('change', event => { if (event.matches) resolve(); });
    // Fallback only for a missing animation event; it never bypasses page readiness.
    setTimeout(resolve, 2600);
  });

  const homeReady = Promise.all([
    mainStyleReady,
    fontsReady,
    contentReady
  ]);

  homeReady.then(() => {
    page.dataset.state = 'ready';
    status.textContent = '首屏已准备好';
  });

  Promise.all([writingReady, homeReady]).then(async () => {
    if (preview) return;
    // Paint the initialized DOM below the opaque cover before fading it away.
    root.classList.add('welcome-prepared');
    root.classList.remove('site-booting');
    await paint();
    page.classList.add('is-leaving');
    await new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 0 : 340));
    content.inert = false;
    root.classList.remove('welcome-active', 'welcome-prepared');
    root.dataset.welcomeState = 'entered';
    page.remove();
    try { sessionStorage.setItem('gzh-welcome-20261001', '1'); } catch (_) {}
  });
})();
