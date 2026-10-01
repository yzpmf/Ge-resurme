/* Keep the greeting in its own page; normal internal links return directly. */
(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const SESSION_KEY = 'gzh-welcome-20261001';
  if (window.top !== window.self) {
    if (params.get('__welcome') === 'preload') {
      window.addEventListener('load', async () => {
        try { if (document.fonts) await document.fonts.ready; } catch (_) {}
        window.parent.postMessage({ type: 'gzh:home-ready' }, location.origin);
      }, { once: true });
    }
    return;
  }
  if (params.get('__welcome') === 'entered') {
    params.delete('__welcome');
    const search = params.toString();
    history.replaceState(null, '', location.pathname + (search ? '?' + search : '') + location.hash);
    return;
  }
  if (location.hash) return;
  try { if (sessionStorage.getItem(SESSION_KEY) === '1') return; } catch (_) {}
  const next = 'index.html' + location.search + location.hash;
  location.replace('welcome.html?next=' + encodeURIComponent(next));
})();
