/* Article bookcase: two oak shelves per page. Desktop hover turns a book to its cover; touch pops it out. */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const TONES = ['#e9d9a7', '#e5d29d', '#ecdcae', '#e2cf98', '#e7d6a2'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  function hash(str) {
    let h = 2166136261;
    for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function metrics(width) {
    const wide = width >= 640;
    const hover = fine.matches;
    const side = wide ? 22 : 12;
    const H = Math.round(wide ? clamp(width * 0.2, 188, 230) : clamp(width * 0.44, 128, 168));
    const ws = Math.round(H * (wide ? 0.25 : 0.22));
    const d = Math.round(H * 0.7);
    const gap = Math.max(4, Math.round(H * 0.032));
    const pitch = ws + gap;
    const spread = Math.round((d - ws) / 2 + gap * 1.5);
    const edge = hover ? spread + 10 : 14;
    const inner = width - side * 2;
    const perRow = Math.max(1, Math.floor((inner - edge * 2 + gap) / pitch));
    const pad = Math.floor((inner - perRow * pitch + gap) / 2);
    return {
      wide, hover, side, H, ws, d, gap, pitch, spread, pad, inner, perRow,
      clear: Math.round(H * 0.14), board: wide ? 16 : 11, crown: wide ? 26 : 16,
    };
  }

  function coverUrl(item) {
    const raw = String(item.cover || (item.title === '小镇做题家' ? 'images/articles/huaiyuan-yizhong.jpg' : ''));
    return /^(https?:\/\/|images\/)/i.test(raw) ? raw : '';
  }

  function bookHTML(item, index, slot) {
    const h = hash(item.title + '|' + item.date);
    const hr = (0.86 + (h % 1000) / 1000 * 0.14).toFixed(3);
    const lean = (-3.2 + ((h >>> 10) % 100) / 100 * 1.4).toFixed(2);
    const tone = TONES[(h >>> 17) % TONES.length];
    const year = String(item.date || '').slice(0, 4);
    const date = String(item.date || '').replace(/-/g, '.');
    const cover = coverUrl(item);
    return (
      '<a class="book' + (cover ? ' has-cover' : '') + '" href="' + esc(item.href) + '" data-index="' + index + '" style="--i:' + slot + ';--hr:' + hr + ';--lean:' + lean + 'deg;--tone:' + tone + '"' +
      ' aria-label="' + esc(item.title + (item.date ? '，' + item.date : '')) + '">' +
      '<span class="book-tilt"><span class="book-body">' +
      '<span class="book-face book-spine" aria-hidden="true"><span class="spine-band"></span>' +
      '<span class="spine-title">' + esc(item.title) + '</span><span class="spine-seal"></span>' +
      (year ? '<span class="spine-year">' + esc(year) + '</span>' : '') + '<span class="spine-band"></span></span>' +
      '<span class="book-face book-cover" aria-hidden="true">' +
      (date ? '<span class="cover-date">' + esc(date) + '</span>' : '<span></span>') +
      (cover ? '<img class="cover-photo" src="' + esc(cover) + '" alt="" draggable="false">' : '') +
      '<span class="cover-title">' + esc(item.title) + '</span><span class="cover-rule"></span>' +
      '<span class="cover-more">阅读全文 →</span></span>' +
      '<span class="book-face book-edge" aria-hidden="true"></span>' +
      '<span class="book-face book-back" aria-hidden="true"></span>' +
      '</span></span></a>'
    );
  }

  const S = {
    box: null, items: [], m: null, perPage: 0, pages: 0, page: 0,
    pos: 0, vel: 0, span: 1, pageEls: [], raf: 0, last: 0, moving: false,
    open: null, closeTimer: 0, tilts: new Map(), pointerType: 'mouse',
    drag: null, suppressClick: false, pop: null, bound: false, observer: null,
    returnTo: null, returnTimer: 0, focusIndex: -1, landing: false, deferred: null,
    launchLayers: null, launchBook: null,
  };

  function setVars(m) {
    const st = S.box.style;
    [['--H', m.H], ['--ws', m.ws], ['--depth', m.d], ['--gap', m.gap], ['--pitch', m.pitch], ['--spread', m.spread],
      ['--pad', m.pad], ['--side', m.side], ['--clear', m.clear], ['--board', m.board], ['--crown', m.crown]]
      .forEach(([k, v]) => st.setProperty(k, v + 'px'));
    S.span = Math.max(S.box.clientWidth + 48, (innerWidth + S.box.clientWidth) / 2 + 32);
  }

  /* Siblings are painted in DOM order, so books nearer the vanishing point must sit on top. */
  function stackBooks() {
    const m = S.m;
    const center = (m.inner / 2 - m.pad - m.ws / 2) / m.pitch;
    S.box.querySelectorAll('.shelf-books').forEach(row => {
      row.querySelectorAll('.book').forEach((b, i) => { b.style.zIndex = String(100 - Math.round(Math.abs(i - center))); });
    });
  }

  function build() {
    const width = S.box.clientWidth;
    if (!width) { S.m = null; return; }
    const firstIndex = S.page * (S.perPage || 1);
    const m = metrics(width);
    S.m = m;
    S.perPage = m.perRow * 2;
    S.pages = Math.max(1, Math.ceil(S.items.length / S.perPage));
    const focus = S.returnTo && S.focusIndex >= 0 ? S.focusIndex : firstIndex;
    S.page = clamp(Math.floor(focus / S.perPage), 0, S.pages - 1);
    closeBook(true);
    setVars(m);

    let html = '<div class="case-viewport">';
    for (let p = 0; p < S.pages; p++) {
      html += '<div class="case-page" role="group" aria-label="第 ' + (p + 1) + ' 架"><div class="case-frame"><div class="case-inner">';
      for (let r = 0; r < 2; r++) {
        const start = p * S.perPage + r * m.perRow;
        const books = S.items.slice(start, start + m.perRow).map((item, k) => bookHTML(item, start + k, k)).join('');
        html += '<div class="shelf-row"><div class="shelf-books">' + books + '</div><div class="shelf-board"></div></div>';
      }
      html += '</div></div></div>';
    }
    html += '</div>';
    if (S.pages > 1) {
      html += '<div class="shelf-pager" role="navigation" aria-label="切换书架">' +
        '<button type="button" class="pager-step" data-step="-1" aria-label="上一架"><span class="pager-arrow">←</span><span class="pager-word">上一架</span></button>' +
        '<div class="pager-track"><div class="pager-nums"></div><span class="pager-lamp" aria-hidden="true"></span></div>' +
        '<button type="button" class="pager-step" data-step="1" aria-label="下一架"><span class="pager-word">下一架</span><span class="pager-arrow">→</span></button>' +
        '</div>';
    }
    S.box.innerHTML = html;
    S.pageEls = [...S.box.querySelectorAll('.case-page')].map((el, i) => ({ el, page: i, slot: i }));
    stackBooks();
    S.pos = S.page; S.vel = 0; S.moving = false;
    place(true);
    renderPager(true);
    if (S.returnTo) tryLand();
  }

  function relayout() {
    if (!S.box || !S.items.length) return;
    const width = S.box.clientWidth;
    if (!width) return;
    const m = metrics(width);
    if (!S.m || m.perRow !== S.m.perRow || m.hover !== S.m.hover || m.wide !== S.m.wide) { build(); return; }
    S.m = m;
    setVars(m);
    stackBooks();
    place(!S.moving);
  }

  /* ---------- page strip ---------- */
  function place(settled) {
    for (const pg of S.pageEls) {
      const off = pg.slot - S.pos;
      const shown = settled ? pg.page === S.page : Math.abs(off) < 0.999;
      pg.el.style.visibility = shown ? 'visible' : 'hidden';
      pg.el.toggleAttribute('inert', pg.page !== S.page);
      pg.el.setAttribute('aria-hidden', String(pg.page !== S.page));
      if (!shown) continue;
      const a = Math.min(1, Math.abs(off));
      pg.el.style.transform = settled ? '' : 'translate3d(' + (off * S.span).toFixed(1) + 'px,0,0) scale(' + (1 - 0.045 * a).toFixed(4) + ')';
    }
  }

  function nearestPage() {
    let best = S.pageEls[S.page], dist = Infinity;
    for (const pg of S.pageEls) {
      const d = Math.abs(pg.slot - S.pos);
      if (Number.isFinite(pg.slot) && d < dist) { dist = d; best = pg; }
    }
    return best;
  }

  /* Pages more than one step away borrow the neighbouring slot, so only two bookcases ever pass by. */
  function goTo(p, keepVel) {
    if (!S.pageEls.length) return;
    p = clamp(p, 0, S.pages - 1);
    closeBook(true);
    const from = nearestPage();
    const offset = S.pos - from.slot;
    S.pageEls.forEach(pg => { pg.slot = pg.page; });
    const dir = Math.sign(p - from.page);
    if (Math.abs(p - from.page) > 1) {
      S.pageEls[p - dir].slot = Infinity;
      from.slot = p - dir;
    }
    S.pos = from.slot + offset;
    if (!keepVel) S.vel = 0;
    S.page = p;
    renderPager(false);
    if (reduce.matches) { S.pos = p; S.vel = 0; S.moving = false; S.pageEls.forEach(pg => { pg.slot = pg.page; }); place(true); return; }
    S.moving = true;
    kick();
  }

  function stepSpring(dt) {
    if (!S.moving) return false;
    if (S.drag && S.drag.active) return true;
    const target = S.page;
    const steps = Math.ceil(dt / (1 / 120));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const acc = 72 * (target - S.pos) - 15.5 * S.vel;
      S.vel += acc * h;
      S.pos += S.vel * h;
    }
    if (Math.abs(target - S.pos) < 0.0004 && Math.abs(S.vel) < 0.004) {
      S.pos = target; S.vel = 0; S.moving = false;
      S.pageEls.forEach(pg => { pg.slot = pg.page; });
      place(true);
      return false;
    }
    place(false);
    return true;
  }

  /* ---------- pager ---------- */
  function pageWindow() {
    const n = S.pages, c = S.page;
    if (n <= 7) return Array.from({ length: n }, (_, i) => i);
    const set = new Set([0, n - 1, c - 1, c, c + 1].filter(i => i >= 0 && i < n));
    if (c <= 2) [1, 2, 3].forEach(i => set.add(i));
    if (c >= n - 3) [n - 4, n - 3, n - 2].forEach(i => set.add(i));
    const list = [...set].sort((a, b) => a - b), out = [];
    list.forEach((i, k) => { if (k && i - list[k - 1] > 1) out.push(-1); out.push(i); });
    return out;
  }

  function renderPager(instant) {
    const nav = S.box.querySelector('.shelf-pager');
    if (!nav) return;
    const nums = nav.querySelector('.pager-nums');
    nums.innerHTML = pageWindow().map(i => i < 0
      ? '<span class="pager-gap" aria-hidden="true">…</span>'
      : '<button type="button" class="pager-num" data-page="' + i + '"' + (i === S.page ? ' aria-current="true"' : '') +
        ' aria-label="第 ' + (i + 1) + ' 架">' + String(i + 1).padStart(2, '0') + '</button>').join('');
    nav.querySelector('[data-step="-1"]').disabled = S.page === 0;
    nav.querySelector('[data-step="1"]').disabled = S.page === S.pages - 1;
    const cur = nums.querySelector('[aria-current="true"]');
    const lamp = nav.querySelector('.pager-lamp');
    if (!cur || !lamp) return;
    if (instant) lamp.style.transition = 'none';
    lamp.style.width = cur.offsetWidth * 0.56 + 'px';
    lamp.style.transform = 'translateX(' + (cur.offsetLeft + cur.offsetWidth * 0.22) + 'px)';
    lamp.style.opacity = '1';
    if (instant) { void lamp.offsetWidth; lamp.style.transition = ''; }
  }

  /* ---------- desktop: hover turns the book ---------- */
  function rowBooks(row) { return [...row.querySelectorAll('.book')]; }

  function openBook(row, k) {
    if (S.open && S.open.row === row && S.open.index === k) return;
    if (S.open && S.open.row !== row) closeBook(false);
    rowBooks(row).forEach((b, i) => {
      b.style.setProperty('--shift', i < k ? -1 : i > k ? 1 : 0);
      b.classList.toggle('is-open', i === k);
    });
    const el = rowBooks(row)[k];
    S.open = { row, index: k, el, rx: 0, ry: 0 };
    if (!S.tilts.has(el)) S.tilts.set(el, { x: 0, y: 0 });
    kick();
  }

  function closeBook(now) {
    clearTimeout(S.closeTimer);
    if (!S.open) return;
    rowBooks(S.open.row).forEach(b => { b.style.setProperty('--shift', 0); b.classList.remove('is-open'); });
    S.open = null;
    if (now) {
      S.tilts.forEach((_, el) => { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
      S.tilts.clear();
    } else kick();
  }

  function scheduleClose() {
    if (!S.open || S.closeTimer || S.landing) return;
    S.closeTimer = setTimeout(() => { S.closeTimer = 0; closeBook(false); }, 110);
  }
  function cancelClose() { clearTimeout(S.closeTimer); S.closeTimer = 0; }

  function hoverAt(e) {
    if (e.pointerType !== 'mouse' || !S.m || !S.m.hover || S.moving || S.landing) return;
    const row = e.target.closest && e.target.closest('.shelf-books');
    if (!row) { scheduleClose(); return; }
    const m = S.m, books = rowBooks(row);
    const x = e.clientX - row.getBoundingClientRect().left - m.pad;
    const open = S.open && S.open.row === row ? S.open.index : -1;
    let k;
    if (open >= 0) {
      const c = open * m.pitch + m.ws / 2;
      if (Math.abs(x - c) <= m.d / 2 + m.gap) k = open;
      else if (x < c) k = Math.min(open - 1, Math.floor((x + m.spread) / m.pitch));
      else k = Math.max(open + 1, Math.floor((x - m.spread) / m.pitch));
    } else k = Math.floor(x / m.pitch);
    if (k < 0 || k >= books.length) { scheduleClose(); return; }
    cancelClose();
    openBook(row, k);
    const r = books[k].getBoundingClientRect();
    S.open.ry = clamp((e.clientX - (r.left + r.width / 2)) / (m.d * 0.55), -1, 1) * 11;
    S.open.rx = -clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1) * 7;
  }

  function stepTilt(dt) {
    if (reduce.matches) return false;
    const f = 1 - Math.exp(-dt * 8);
    let live = false;
    S.tilts.forEach((t, el) => {
      const on = S.open && S.open.el === el;
      const tx = on ? S.open.rx : 0, ty = on ? S.open.ry : 0;
      t.x += (tx - t.x) * f; t.y += (ty - t.y) * f;
      if (!on && Math.abs(t.x) < 0.02 && Math.abs(t.y) < 0.02) {
        el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); S.tilts.delete(el); return;
      }
      el.style.setProperty('--rx', t.x.toFixed(3) + 'deg');
      el.style.setProperty('--ry', t.y.toFixed(3) + 'deg');
      live = true;
    });
    return live || !!S.open;
  }

  function frame(now) {
    const dt = Math.min(1 / 30, (now - S.last) / 1000 || 1 / 60);
    S.last = now;
    const a = stepSpring(dt);
    const b = stepTilt(dt);
    S.raf = a || b ? requestAnimationFrame(frame) : 0;
  }
  function kick() {
    if (S.raf) return;
    S.last = performance.now();
    S.raf = requestAnimationFrame(frame);
  }

  /* ---------- touch: swipe between bookcases ---------- */
  function dragStart(e) {
    if (e.pointerType === 'mouse' || S.pages < 2 || !e.target.closest('.case-viewport')) return;
    S.drag = { x: e.clientX, y: e.clientY, id: e.pointerId, active: false, pos0: 0, samples: [] };
  }
  function dragMove(e) {
    const g = S.drag;
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { S.drag = null; return; }
      if (Math.abs(dx) < 10) return;
      g.active = true;
      closeBook(true);
      const from = nearestPage(), offset = S.pos - from.slot;
      S.pageEls.forEach(pg => { pg.slot = pg.page; });
      S.pos = from.page + offset; S.vel = 0; S.page = from.page;
      g.pos0 = S.pos; g.x = e.clientX; S.moving = true;
      try { S.box.setPointerCapture(e.pointerId); } catch (_) {}
      kick();
    }
    let raw = g.pos0 - (e.clientX - g.x) / S.span;
    const last = S.pages - 1;
    if (raw < 0) raw *= 0.35; else if (raw > last) raw = last + (raw - last) * 0.35;
    raw = clamp(raw, g.pos0 - 1, g.pos0 + 1);
    S.pos = raw;
    g.samples.push({ t: e.timeStamp, p: raw });
    if (g.samples.length > 6) g.samples.shift();
    place(false);
  }
  function dragEnd(e) {
    const g = S.drag;
    if (!g || e.pointerId !== g.id) return;
    S.drag = null;
    if (!g.active) return;
    S.suppressClick = true;
    setTimeout(() => { S.suppressClick = false; }, 0);
    const a = g.samples[0], b = g.samples[g.samples.length - 1];
    const v = a && b && b.t > a.t ? (b.p - a.p) / ((b.t - a.t) / 1000) : 0;
    const base = Math.round(g.pos0);
    const target = clamp(Math.round(S.pos + v * 0.22), base - 1, base + 1);
    S.vel = v;
    goTo(target, true);
  }

  /* ---------- touch: tap pops the book out ---------- */
  function popLayer() {
    if (S.pop) return S.pop;
    const layer = document.createElement('div');
    layer.className = 'book-pop';
    layer.hidden = true;
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.innerHTML = '<div class="book-pop-scrim"></div><div class="book-pop-stage"></div>' +
      '<div class="book-pop-foot"><span class="book-pop-hint">轻触封面阅读全文</span>' +
      '<button type="button" class="book-pop-close">放回书架</button></div>';
    document.body.appendChild(layer);
    layer.querySelector('.book-pop-scrim').addEventListener('click', closePop);
    layer.querySelector('.book-pop-close').addEventListener('click', closePop);
    layer.querySelector('.book-pop-stage').addEventListener('click', e => {
      const book = e.target.closest('.book');
      if (book) activate(e, book);
    });
    S.pop = { layer, source: null, anims: [] };
    return S.pop;
  }

  function openPop(book, instant) {
    const item = S.items[+book.dataset.index];
    if (!item || !S.m) return;
    const pop = popLayer();
    if (pop.source) return;
    const m = S.m;
    const hr = parseFloat(book.style.getPropertyValue('--hr')) || 1;
    const scale = Math.min(innerHeight * 0.6 / (m.H * hr), innerWidth * 0.78 / m.d);
    const layer = pop.layer;
    [['--H', m.H], ['--ws', m.ws], ['--depth', m.d]].forEach(([k, v]) => layer.style.setProperty(k, v * scale + 'px'));
    layer.setAttribute('aria-label', item.title);
    const stage = layer.querySelector('.book-pop-stage');
    stage.innerHTML = bookHTML(item, +book.dataset.index, 0);
    const clone = stage.firstChild;
    layer.hidden = false;
    pop.source = book;

    const from = book.getBoundingClientRect(), to = clone.getBoundingClientRect();
    const lean = book.style.getPropertyValue('--lean') || '0deg';
    const start = 'translate(' + (from.left + from.width / 2 - (to.left + to.width / 2)).toFixed(1) + 'px,' +
      (from.top + from.height / 2 - (to.top + to.height / 2)).toFixed(1) + 'px) scale(' + (from.height / to.height).toFixed(4) + ') rotate(' + lean + ')';
    book.style.visibility = 'hidden';
    document.documentElement.classList.add('book-pop-open');
    const dur = reduce.matches ? 1 : 720;
    pop.anims = [
      clone.animate([{ transform: start }, { transform: 'none' }], { duration: dur, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }),
      layer.querySelector('.book-pop-scrim').animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur * 0.7, easing: 'ease-out', fill: 'both' }),
      layer.querySelector('.book-pop-foot').animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: dur * 0.6, delay: dur * 0.45, easing: 'ease-out', fill: 'both' }),
    ];
    if (instant) {
      pop.anims.forEach(a => a.finish());
      clone.classList.add('is-instant', 'is-open');
      void clone.offsetWidth;
      clone.classList.remove('is-instant');
    } else {
      requestAnimationFrame(() => clone.classList.add('is-open'));
    }
    clone.focus({ preventScroll: true });
  }

  function closePop() {
    const pop = S.pop;
    if (!pop || !pop.source || pop.closing) return;
    pop.closing = true;
    const clone = pop.layer.querySelector('.book');
    if (clone) clone.classList.remove('is-open');
    const [book] = pop.anims;
    pop.anims.forEach(a => { a.playbackRate = reduce.matches ? 1 : 1.15; a.reverse(); });
    const done = () => {
      pop.layer.hidden = true;
      pop.layer.querySelector('.book-pop-stage').innerHTML = '';
      pop.source.style.visibility = '';
      pop.source.focus({ preventScroll: true });
      pop.source = null; pop.closing = false; pop.anims = [];
      document.documentElement.classList.remove('book-pop-open');
    };
    if (book) book.finished.then(done, done); else done();
  }

  /* ---------- opening: the cover itself grows, then softens into the reading page ---------- */
  function markLaunch() {
    try { sessionStorage.setItem('ge-book-launch', String(Date.now())); } catch (_) {}
  }

  function coverPlate(book, rect) {
    const plate = book.querySelector('.book-cover').cloneNode(true);
    const host = book.closest('.bookcase, .book-pop') || document.querySelector('.bookcase');
    if (host) {
      const from = getComputedStyle(host);
      ['--paper-grain', '--grain-h', '--grain-v'].forEach(name => {
        const value = from.getPropertyValue(name);
        if (value) plate.style.setProperty(name, value);
      });
    }
    plate.classList.add('book-launch-plate');
    plate.style.setProperty('--tone', book.style.getPropertyValue('--tone') || '#e7d6a2');
    plate.style.setProperty('--depth', rect.width.toFixed(2) + 'px');
    plate.style.setProperty('--shade', '0');
    plate.style.width = rect.width.toFixed(2) + 'px';
    plate.style.height = rect.height.toFixed(2) + 'px';
    return plate;
  }

  function fillCard(card, book, rect) {
    const stage = document.createElement('div');
    stage.className = 'book-launch-stage';
    const fit = document.createElement('div');
    fit.className = 'book-launch-fit';
    fit.style.width = rect.width.toFixed(2) + 'px';
    fit.style.height = rect.height.toFixed(2) + 'px';
    const plate = coverPlate(book, rect);
    fit.appendChild(plate);
    stage.appendChild(fit);
    const wash = document.createElement('div');
    wash.className = 'book-launch-wash';
    card.replaceChildren(stage, wash);
    return { stage, fit, plate, wash };
  }

  /* Blur sits on the stage, after the cover has been scaled, so it stays a screen-sized softness. */
  function playCover(card, stage, fit, wash, rect, closing) {
    const vw = innerWidth, vh = innerHeight;
    const scale = Math.min(vw / rect.width, vh / rect.height);
    const dur = 900;
    const ease = 'cubic-bezier(.45,.05,.15,1)';
    const frames = [
      card.animate([
        { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px', borderRadius: '4px' },
        { left: '0px', top: '0px', width: vw + 'px', height: vh + 'px', borderRadius: '0px' },
      ], { duration: dur, easing: ease, fill: 'forwards' }),
      fit.animate([
        { transform: 'translate(-50%, -50%) scale(1)' },
        { transform: 'translate(-50%, -50%) scale(' + scale.toFixed(3) + ')' },
      ], { duration: dur, easing: ease, fill: 'forwards' }),
      stage.animate([
        { filter: 'blur(0px)' },
        { filter: 'blur(0px)', offset: 0.42 },
        { filter: 'blur(16px)' },
      ], { duration: dur, easing: 'linear', fill: 'forwards' }),
      wash.animate([
        { opacity: 0 },
        { opacity: 0, offset: 0.55 },
        { opacity: 1, offset: 0.92 },
        { opacity: 1 },
      ], { duration: dur, easing: 'linear', fill: 'forwards' }),
    ];
    if (closing) frames.forEach(anim => { anim.pause(); anim.currentTime = dur; anim.playbackRate = -1; anim.play(); });
    return dur;
  }

  function launch(book) {
    if (S.launching) return;
    const href = book.href;
    const rect = book.querySelector('.book-cover').getBoundingClientRect();
    if (reduce.matches || typeof Element.prototype.animate !== 'function' || rect.width < 2) {
      markLaunch();
      location.href = href;
      return;
    }
    S.launching = true;
    const dim = document.createElement('div');
    dim.className = 'book-launch-dim';
    const card = document.createElement('div');
    card.className = 'book-launch';
    card.style.backgroundColor = book.style.getPropertyValue('--tone') || '#e7d6a2';
    const { stage, fit, wash } = fillCard(card, book, rect);
    document.body.append(dim, card);
    const dur = playCover(card, stage, fit, wash, rect, false);
    dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur * 0.8, easing: 'ease-out', fill: 'forwards' });
    S.launchLayers = [dim, card];
    S.launchBook = S.pop && S.pop.source && S.pop.layer.contains(book) ? S.pop.source : book;
    setTimeout(() => { markLaunch(); location.href = href; }, dur - 70);
  }

  function clearLaunch() {
    (S.launchLayers || []).forEach(el => el.remove());
    S.launchLayers = null;
    S.launchBook = null;
    S.launching = false;
  }

  /* ---------- returning: the page folds back into its book, then the book closes ---------- */
  function endReturn() {
    clearTimeout(S.returnTimer);
    S.returnTo = null;
    document.documentElement.classList.remove('book-returning');
  }

  function tryLand() {
    if (!S.m) return;
    const book = S.focusIndex >= 0 && S.box.querySelector('.book[data-index="' + S.focusIndex + '"]');
    clearTimeout(S.returnTimer);
    S.returnTo = null;
    if (!book || reduce.matches || typeof Element.prototype.animate !== 'function') { endReturn(); return; }
    land(book, null);
  }

  function land(book, layers) {
    S.landing = true;
    const section = book.closest('section');
    if (section) { section.classList.add('skip-enter'); section.style.animation = 'none'; }
    let target, close;
    if (S.m.hover) {
      const row = book.closest('.shelf-books');
      row.classList.add('is-instant');
      openBook(row, rowBooks(row).indexOf(book));
      void row.offsetWidth;
      row.classList.remove('is-instant');
      target = book;
      close = () => closeBook(false);
    } else {
      if (!(S.pop && S.pop.source === book)) openPop(book, true);
      target = S.pop.layer.querySelector('.book');
      close = closePop;
    }

    let [dim, card] = layers || [];
    if (!card) {
      dim = document.createElement('div');
      dim.className = 'book-launch-dim';
      card = document.createElement('div');
      card.className = 'book-launch';
      document.body.append(dim, card);
    }
    card.style.backgroundColor = book.style.getPropertyValue('--tone') || '#e7d6a2';
    [dim, card].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    const r = target.querySelector('.book-cover').getBoundingClientRect();
    const parts = fillCard(card, book, r);
    const dur = playCover(card, parts.stage, parts.fit, parts.wash, r, true);
    dim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: 'ease-in', fill: 'forwards' });
    document.documentElement.classList.remove('book-returning');

    parts.fit.getAnimations()[0].finished.then(() => {
      dim.remove(); card.remove();
      S.launchLayers = null; S.launchBook = null; S.launching = false;
      setTimeout(() => {
        S.landing = false;
        close();
        if (S.deferred) {
          const [box, items] = S.deferred;
          S.deferred = null;
          setTimeout(() => render(box, items), 950);
        }
      }, 220);
    }, () => {});
  }

  function activate(e, book) {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    launch(book);
  }

  /* ---------- wiring ---------- */
  function bind() {
    if (S.bound) return;
    S.bound = true;
    const box = S.box;
    box.addEventListener('pointerdown', e => { S.pointerType = e.pointerType; dragStart(e); });
    box.addEventListener('pointermove', e => { if (S.drag) dragMove(e); else hoverAt(e); });
    box.addEventListener('pointerup', dragEnd);
    box.addEventListener('pointercancel', dragEnd);
    box.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') scheduleClose(); });
    box.addEventListener('click', e => {
      const step = e.target.closest('.pager-step');
      if (step) { goTo(S.page + +step.dataset.step); return; }
      const num = e.target.closest('.pager-num');
      if (num) { goTo(+num.dataset.page); return; }
      const book = e.target.closest('.book');
      if (!book) return;
      if (S.suppressClick) { e.preventDefault(); return; }
      if (S.pointerType !== 'mouse' && e.detail !== 0) { e.preventDefault(); openPop(book); return; }
      activate(e, book);
    });
    box.addEventListener('focusin', e => {
      const book = e.target.closest('.book');
      if (!book || !S.m || !S.m.hover || !book.matches(':focus-visible')) return;
      const row = book.closest('.shelf-books');
      cancelClose();
      openBook(row, rowBooks(row).indexOf(book));
    });
    box.addEventListener('focusout', e => { if (e.target.closest('.book')) scheduleClose(); });
    box.addEventListener('keydown', e => {
      if (!e.target.closest('.shelf-pager')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(S.page - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(S.page + 1); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
    addEventListener('pageshow', e => {
      if (!e.persisted) return;
      try { sessionStorage.removeItem('ge-book-return'); } catch (_) {}
      const book = S.launchBook;
      if (S.launchLayers && book && book.isConnected && !reduce.matches) { land(book, S.launchLayers); return; }
      clearLaunch();
      if (S.pop && S.pop.source) closePop();
    });
    S.observer = new ResizeObserver(relayout);
    S.observer.observe(box);
    addEventListener('resize', () => { if (S.m) setVars(S.m); });
    fine.addEventListener('change', relayout);
  }

  function render(box, items) {
    if (S.landing) { S.deferred = [box, items]; return; }
    if (S.pop && S.pop.source) closePop();
    S.box = box;
    S.items = items;
    S.page = 0; S.perPage = 0;
    S.focusIndex = S.returnTo ? items.findIndex(it => {
      try { return new URL(it.href, location.href).search === S.returnTo.search; } catch (_) { return false; }
    }) : -1;
    box.classList.add('bookcase');
    bind();
    build();
  }

  try {
    const data = JSON.parse(sessionStorage.getItem('ge-book-return') || 'null');
    sessionStorage.removeItem('ge-book-return');
    if (data && Date.now() - data.t < 8000) {
      S.returnTo = data;
      S.returnTimer = setTimeout(endReturn, 3500);
    }
  } catch (_) {}

  window.BlogShelf = { render };
})();
