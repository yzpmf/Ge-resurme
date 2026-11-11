/* 荣誉奖项这类跨页面入口：从条目展开到详情，返回时收回去。 */
(function () {
  var KEY = 'ge-launch';
  var ANCHOR = 'ge-award-anchor';
  var style = document.createElement('style');
  style.textContent = [
    '@view-transition { navigation: auto; }',
    'html.launch-hide-foot footer,',
    'html.launch-open footer,',
    'html.launch-close footer { opacity: 0 !important; }',
    'html.launch-open::view-transition-group(root),',
    'html.launch-close::view-transition-group(root) { animation: none; }',
    'html.launch-open::view-transition-old(root),',
    'html.launch-open::view-transition-new(root),',
    'html.launch-close::view-transition-old(root),',
    'html.launch-close::view-transition-new(root) {',
    '  mix-blend-mode: normal;',
    '  overflow: clip;',
    '  height: 100%;',
    '  width: 100%;',
    '}',
    'html.launch-open::view-transition-old(root) {',
    '  z-index: 1;',
    '  animation: launch-recede 480ms cubic-bezier(0.32, 0.72, 0, 1) both;',
    '}',
    'html.launch-open::view-transition-new(root) {',
    '  z-index: 2;',
    '  transform-origin: center center;',
    '  animation: launch-grow 560ms cubic-bezier(0.32, 0.72, 0, 1) both;',
    '}',
    'html.launch-close::view-transition-new(root) {',
    '  z-index: 1;',
    '  animation: launch-unblur 480ms cubic-bezier(0.32, 0.72, 0, 1) both;',
    '}',
    'html.launch-close::view-transition-old(root) {',
    '  z-index: 2;',
    '  transform-origin: center center;',
    '  animation: launch-shrink 480ms cubic-bezier(0.32, 0.72, 0, 1) both;',
    '}',
    '@keyframes launch-grow {',
    '  from {',
    '    transform: translate3d(var(--ldx), var(--ldy), 0) scale(var(--ls));',
    '    border-radius: var(--lr);',
    '  }',
    '  to { transform: none; border-radius: 0; }',
    '}',
    '@keyframes launch-recede {',
    '  to { opacity: 0.55; }',
    '}',
    '@keyframes launch-shrink {',
    '  to {',
    '    transform: translate3d(var(--ldx), var(--ldy), 0) scale(var(--ls));',
    '    border-radius: var(--lr);',
    '  }',
    '}',
    '@keyframes launch-unblur {',
    '  from { opacity: 0.55; }',
    '  to { opacity: 1; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  function vtOn() {
    return 'onpagereveal' in window;
  }

  function reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function read() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      sessionStorage.removeItem(KEY);
      var data = JSON.parse(raw);
      if (!data || !data.t || Date.now() - data.t > 5000) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function save(data) {
    try {
      data.t = Date.now();
      sessionStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {}
  }

  function samePath(stored, href) {
    try {
      var a = new URL(stored, location.origin);
      var b = new URL(href, location.origin);
      return decodeURI(a.pathname).replace(/\/+$/, '') === decodeURI(b.pathname).replace(/\/+$/, '');
    } catch (err) {
      return false;
    }
  }

  function pose(rect, radius) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var scale = Math.max(rect.width / vw, rect.height / vh);
    scale = Math.min(Math.max(scale, 0.08), 0.86);
    var root = document.documentElement;
    root.style.setProperty('--ldx', (rect.left + rect.width / 2 - vw / 2).toFixed(2) + 'px');
    root.style.setProperty('--ldy', (rect.top + rect.height / 2 - vh / 2).toFixed(2) + 'px');
    root.style.setProperty('--ls', scale.toFixed(4));
    root.style.setProperty('--lr', ((radius || 8) / scale).toFixed(2) + 'px');
  }

  function showAwards(targetPath) {
    var awards = document.getElementById('awards');
    var home = document.getElementById('home');
    if (!awards) return null;
    if (home && home !== awards) home.classList.remove('section-visible');
    awards.classList.add('section-visible', 'skip-enter');
    var thumb = null;
    if (targetPath) {
      var items = awards.querySelectorAll('.award-item');
      for (var i = 0; i < items.length; i++) {
        if (samePath(items[i].getAttribute('href') || '', targetPath)) {
          thumb = items[i].querySelector('.award-thumb') || items[i];
          break;
        }
      }
    }
    if (!thumb) thumb = awards.querySelector('.award-thumb') || awards.querySelector('.award-item');
    if (!thumb) return null;
    var rect = thumb.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return null;
    var radius = parseFloat(getComputedStyle(thumb).borderRadius) || 6;
    return { el: thumb, rect: rect, radius: radius };
  }

  window.addEventListener('pagereveal', function (event) {
    if (!event.viewTransition) return;
    var data = read();
    if (!data || reduced()) {
      event.viewTransition.skipTransition();
      return;
    }
    if (data.mode === 'close') {
      var spot = showAwards(data.to);
      var anchor = null;
      try { anchor = JSON.parse(sessionStorage.getItem(ANCHOR) || 'null'); } catch (err) {}
      var useMeasured = spot && spot.rect.width > 2 && spot.rect.top > -20 && spot.rect.top < window.innerHeight;
      if (!useMeasured && !(anchor && anchor.w)) {
        event.viewTransition.skipTransition();
        return;
      }
      if (useMeasured) {
        spot.el.style.opacity = '0';
        pose(spot.rect, spot.radius);
        event.viewTransition.finished.finally(function () {
          spot.el.style.opacity = '';
        });
      } else {
        pose({ left: anchor.x, top: anchor.y, width: anchor.w, height: anchor.h }, anchor.radius);
      }
      document.documentElement.classList.add('launch-close');
      event.viewTransition.finished.finally(function () {
        document.documentElement.classList.remove('launch-open', 'launch-close', 'launch-hide-foot');
      });
      return;
    }
    if (!data.to || !samePath(data.to, location.href) || !data.w || !data.h) {
      event.viewTransition.skipTransition();
      return;
    }
    pose({ left: data.x, top: data.y, width: data.w, height: data.h }, data.radius);
    document.documentElement.classList.add('launch-open');
    event.viewTransition.finished.finally(function () {
      document.documentElement.classList.remove('launch-open', 'launch-close', 'launch-hide-foot');
    });
  });

  window.addEventListener('pageswap', function (event) {
    if (!event.viewTransition) return;
    var pending = false;
    try { pending = !!sessionStorage.getItem(KEY); } catch (err) {}
    if (pending) return;
    var activation = event.activation;
    var to = activation && activation.entry && activation.entry.url;
    var backToAwards = activation && (activation.navigationType === 'traverse' || (to && to.indexOf('#awards') !== -1));
    if (to && /\/awards\/[^/?#]+\.html$/i.test(location.pathname) && backToAwards) {
      document.documentElement.classList.add('launch-hide-foot');
      save({ mode: 'close', to: location.pathname });
      return;
    }
    event.viewTransition.skipTransition();
  });

  document.addEventListener('click', function (event) {
    if (!vtOn() || reduced()) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === '_blank') return;
    var url;
    try { url = new URL(link.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (link.classList.contains('award-detail-back')) {
      document.documentElement.classList.add('launch-hide-foot');
      save({ mode: 'close' });
      return;
    }
    var item = link.classList.contains('award-item') ? link : null;
    if (!item) return;
    var origin = item.querySelector('.award-thumb') || item;
    document.documentElement.classList.add('launch-hide-foot');
    var rect = origin.getBoundingClientRect();
    var radius = parseFloat(getComputedStyle(origin).borderRadius) || 8;
    try {
      sessionStorage.setItem(ANCHOR, JSON.stringify({
        x: rect.left, y: rect.top, w: rect.width, h: rect.height, radius: radius, t: Date.now()
      }));
    } catch (err) {}
    save({
      mode: 'open',
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
      radius: radius,
      to: url.pathname + url.search
    });
  }, true);
})();
