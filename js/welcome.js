/* A real entry page: warm the homepage and its fonts before navigating there. */
(function () {
  'use strict';
  const SESSION_KEY = 'gzh-welcome-20261001';
  const params = new URLSearchParams(location.search);
  const preview = params.get('preview') === '1';
  const page = document.querySelector('.welcome');
  const status = document.getElementById('welcome-status-text');
  const pen = document.getElementById('yzpmf-ribbon');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let target;
  try {
    target = new URL(params.get('next') || 'index.html', location.href);
    if (target.origin !== location.origin || !/(?:\/index\.html|\/)$/.test(target.pathname)) throw new Error('Invalid entry target');
  } catch (_) {
    target = new URL('index.html', location.href);
  }
  target.searchParams.delete('__welcome');
  let ready = false;
  let writingDone = reducedMotion.matches;
  let leaving = false;
  const frame = document.createElement('iframe');
  frame.className = 'site-preload';
  frame.title = '网站页面预加载';
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('inert', '');
  document.body.appendChild(frame);

  function enterSite() {
    if (leaving) return;
    leaving = true;
    const destination = new URL(target.href);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (_) {
      destination.searchParams.set('__welcome', 'entered');
    }
    page.classList.add('is-leaving');
    setTimeout(() => location.replace(destination.href), reducedMotion.matches ? 0 : 320);
  }

  function enterWhenReady() {
    if (writingDone && !preview) enterSite();
  }

  function startPreload() {
    ready = false;
    page.dataset.state = 'loading';
    status.textContent = '正在准备网站…';
    const source = new URL(target.href);
    source.searchParams.set('__welcome', 'preload');
    frame.src = source.href;
  }

  frame.addEventListener('load', () => {
    if (!ready && !leaving) status.textContent = '正在准备页面与字体…';
  });
  frame.addEventListener('error', () => {
    if (ready || leaving) return;
    status.textContent = '即将进入网站…';
    page.dataset.state = 'error';
  });
  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'gzh:home-ready') return;
    ready = true;
    page.dataset.state = 'ready';
    status.textContent = '首屏已准备好';
    enterWhenReady();
  });

  pen.addEventListener('animationend', (event) => {
    if (event.animationName !== 'helloWrite') return;
    writingDone = true;
    enterWhenReady();
  });
  // The animation may already have finished if the controller loaded slowly.
  if (getComputedStyle(pen).strokeDashoffset === '0px') writingDone = true;
  setTimeout(() => { writingDone = true; enterWhenReady(); }, 2600);
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    writingDone = true;
    enterWhenReady();
  });
  startPreload();
  enterWhenReady();
})();
