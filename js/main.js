// ===== 汉堡菜单 =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

// 点击移动端菜单链接后关闭
document.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
  });
});

// ===== 导航栏滚动效果 =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== 板块切换（一次只显示一个板块，点导航按钮切换）=====
const root = document.documentElement;
const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motionOk) root.classList.add('motion');

const panels = Array.from(document.querySelectorAll('#site-content section[id]'));
const navLinks = document.querySelectorAll('.nav-links a');
const navInner = document.querySelector('.nav-inner');
const RISE = [
  '.hero-greeting',
  '.hero-content h1',
  '.hero-desc',
  '.hero-btns',
  '.hero-card',
  '.section-sub',
  '.about-text',
  '.value-card',
  '.project-card',
  '.award-item',
  '.timeline-item',
  '.skill',
  '.bookcase',
  '.contact-form',
  '.contact-card',
].join(',');

function wrapTitles() {
  document.querySelectorAll('.section-title').forEach((heading) => {
    if (heading.querySelector('.title-mask')) return;
    const index = heading.querySelector('.section-index');
    const mask = document.createElement('span');
    mask.className = 'title-mask';
    const rise = document.createElement('span');
    rise.className = 'title-rise';
    [...heading.childNodes].filter((node) => node !== index).forEach((node) => rise.appendChild(node));
    mask.appendChild(rise);
    heading.appendChild(mask);
  });
}

function armRise(scope) {
  const sections = scope && scope.matches && scope.matches('section[id]')
    ? [scope]
    : Array.from((scope || document).querySelectorAll('#site-content section[id]'));
  sections.forEach((section) => {
    section.querySelectorAll(RISE).forEach((el, i) => {
      el.classList.add('rise');
      el.style.setProperty('--d', `${60 + i * 52}ms`);
    });
  });
}

wrapTitles();
armRise(document);
window.__refreshMotion = () => armRise(document);

function syncNav(target) {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + target.id);
  });
}

let lamp = null;
let lampLink = null;
if (navInner && navLinks.length) {
  lamp = document.createElement('span');
  lamp.className = 'nav-lamp';
  lamp.setAttribute('aria-hidden', 'true');
  navInner.appendChild(lamp);
}

function placeLamp(link) {
  if (!lamp || !navInner) return;
  const el = link || lampLink || document.querySelector('.nav-links a.active') || navLinks[0];
  if (!el || getComputedStyle(document.querySelector('.nav-links')).display === 'none') {
    lamp.classList.remove('is-on');
    return;
  }
  const host = navInner.getBoundingClientRect();
  const box = el.getBoundingClientRect();
  lamp.style.width = `${box.width}px`;
  lamp.style.transform = `translate3d(${box.left - host.left}px, 0, 0)`;
  lamp.classList.add('is-on');
}

navLinks.forEach((link) => {
  link.addEventListener('pointerenter', () => {
    lampLink = link;
    placeLamp(link);
  });
});
const navList = document.querySelector('.nav-links');
if (navList) {
  navList.addEventListener('pointerleave', () => {
    lampLink = null;
    placeLamp();
  });
}
window.addEventListener('resize', () => placeLamp());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeLamp());
const mainStyle = document.querySelector('[data-site-style="main"]');
if (mainStyle && !mainStyle.dataset.loaded) {
  mainStyle.addEventListener('load', () => placeLamp(), { once: true });
}

const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
const progressBar = document.createElement('span');
progress.appendChild(progressBar);
document.body.appendChild(progress);

let progressTick = false;
function updateProgress() {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
  progressBar.style.transform = `scaleX(${ratio})`;
  progressTick = false;
}
window.addEventListener('scroll', () => {
  if (progressTick) return;
  progressTick = true;
  requestAnimationFrame(updateProgress);
}, { passive: true });

let panelsReady = false;
let activeLaunch = null;
let launchToken = 0;

function navOrigin(id) {
  const desktop = document.querySelector('.nav-links a[href="#' + id + '"]');
  if (desktop && desktop.getClientRects().length) return desktop;
  const mobile = document.querySelector('#mobileMenu a[href="#' + id + '"]');
  if (mobile && mobile.getClientRects().length) return mobile;
  return desktop || document.querySelector('.logo');
}

function writeHistory(target, push) {
  const hash = '#' + target.id;
  if (location.hash === hash) return;
  history[push ? 'pushState' : 'replaceState'](null, '', hash);
}

function scrollTopNow() {
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previous;
}

function applyPanel(target, fromLaunch) {
  panels.forEach((panel) => {
    const on = panel === target;
    panel.classList.toggle('section-visible', on);
    if (!on) panel.classList.remove('skip-enter');
  });
  if (fromLaunch) target.classList.add('skip-enter');
  syncNav(target);
  scrollTopNow();
  placeLamp();
  updateProgress();
}

function revealInstant(target, current, push) {
  if (current && current !== target) {
    const sign = panels.indexOf(target) >= panels.indexOf(current) ? 1 : -1;
    target.style.setProperty('--enter', sign * 18 + 'px');
  }
  applyPanel(target, false);
  writeHistory(target, push);
}

function poseFor(rect, inBar, originRadius) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const navBox = navbar.getBoundingClientRect();
  let scale = Math.max(rect.width / vw, rect.height / vh);
  scale = Math.min(Math.max(scale, 0.078), 0.72);
  let cx = rect.left + rect.width / 2;
  let cy = rect.top + rect.height / 2;
  if (inBar) cy = navBox.bottom + (vh * scale) / 2 + 8;
  return {
    scale,
    dx: cx - vw / 2,
    dy: cy - vh / 2,
    radius: originRadius > 0 ? originRadius : 12,
  };
}

function launchFrames(pose, kind) {
  const from = {
    transform: 'translate3d(' + pose.dx.toFixed(2) + 'px, ' + pose.dy.toFixed(2) + 'px, 0) scale(' + pose.scale.toFixed(4) + ')',
    borderRadius: (Math.max(pose.radius, 8) / pose.scale).toFixed(2) + 'px',
  };
  const to = {
    transform: 'translate3d(0, 0, 0) scale(1)',
    borderRadius: '0px',
  };
  return kind === 'close' ? [to, from] : [from, to];
}

function usableRect(el) {
  if (!el || !el.getClientRects().length) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  return rect;
}

function runLaunch({ current, target, origin, push, kind }) {
  const token = ++launchToken;
  const shield = document.createElement('div');
  shield.className = 'launch-shield';
  const sheet = document.createElement('div');
  sheet.className = 'launch-sheet';
  const moving = kind === 'close' ? current : target;
  const behind = kind === 'close' ? target : current;
  const marker = document.createComment('launch');

  moving.parentNode.insertBefore(marker, moving);
  moving.classList.add('skip-enter');
  if (origin) origin.dataset.launching = '1';
  root.classList.toggle('launch-cover', !!(origin && origin.closest('.mobile-menu')));
  root.classList.add('is-launching');

  let shieldAnim = null;
  let iconFade = null;
  let anim = null;
  let backup = 0;
  let settled = false;

  function cleanup() {
    if (settled) return;
    settled = true;
    clearTimeout(backup);
    if (anim) anim.cancel();
    if (shieldAnim) shieldAnim.cancel();
    if (iconFade) iconFade.cancel();
    if (origin) {
      origin.style.opacity = '';
      delete origin.dataset.launching;
    }
    moving.style.marginTop = '';
    moving.style.opacity = '';
    if (marker.parentNode) marker.parentNode.insertBefore(moving, marker);
    marker.remove();
    sheet.remove();
    shield.remove();
    root.classList.remove('is-launching', 'launch-cover');
    if (activeLaunch && activeLaunch.token === token) activeLaunch = null;
    applyPanel(target, true);
  }

  activeLaunch = { token, finishNow: cleanup };
  writeHistory(target, push);
  syncNav(target);
  placeLamp();

  const duration = kind === 'close' ? 480 : 560;
  const easing = 'cubic-bezier(0.32, 0.72, 0, 1)';

  function cornerOf(el) {
    if (!el) return 12;
    const radius = parseFloat(getComputedStyle(el).borderRadius);
    return radius > 0 ? radius : 12;
  }

  function matchPaper() {
    const bg = getComputedStyle(moving).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') sheet.style.backgroundColor = bg;
  }

  if (kind === 'close') {
    const scrolled = window.scrollY;
    sheet.style.transform = 'translate3d(0, 0, 0) scale(1)';
    if (scrolled) moving.style.marginTop = -scrolled + 'px';
    sheet.append(moving);
    document.body.append(shield, sheet);
    matchPaper();
    behind.classList.add('skip-enter', 'section-visible');
    scrollTopNow();
    if (origin && origin.classList.contains('tilt')) origin.style.transform = '';
    const rectSource = usableRect(origin) ? origin : navOrigin(current.id);
    const rect = usableRect(rectSource) || new DOMRect(window.innerWidth / 2 - 44, window.innerHeight / 2 - 44, 88, 88);
    const pose = poseFor(rect, !!(rectSource && rectSource.closest && rectSource.closest('.nav-links')), cornerOf(rectSource));
    const frames = launchFrames(pose, 'close');
    sheet.style.transform = frames[0].transform;
    sheet.style.borderRadius = frames[0].borderRadius;
    shield.style.opacity = '1';
    if (rectSource && !rectSource.closest('nav')) {
      rectSource.style.opacity = '0';
      iconFade = rectSource.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 160, delay: 300, easing: 'ease', fill: 'forwards' }
      );
    }
    shieldAnim = shield.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration, easing, fill: 'forwards' }
    );
    anim = sheet.animate(frames, { duration, easing, fill: 'forwards' });
  } else {
    if (origin && origin.classList.contains('tilt')) origin.style.transform = '';
    const rectSource = usableRect(origin) ? origin : navOrigin(target.id);
    const rect = usableRect(rectSource) || new DOMRect(window.innerWidth / 2 - 44, window.innerHeight / 2 - 44, 88, 88);
    const pose = poseFor(rect, !!(rectSource && rectSource.closest && rectSource.closest('.nav-links')), cornerOf(rectSource));
    const frames = launchFrames(pose, 'open');
    sheet.style.transform = frames[0].transform;
    sheet.style.borderRadius = frames[0].borderRadius;
    sheet.append(moving);
    document.body.append(shield, sheet);
    moving.classList.add('section-visible');
    matchPaper();
    void sheet.offsetWidth;
    if (rectSource && rectSource.closest && !rectSource.closest('nav')) {
      iconFade = rectSource.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 160, easing: 'ease', fill: 'forwards' }
      );
    }
    shieldAnim = shield.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 280, easing, fill: 'forwards' }
    );
    anim = sheet.animate(frames, { duration, easing, fill: 'forwards' });
  }

  backup = setTimeout(cleanup, duration + 480);
  anim.finished.then(cleanup).catch(() => {});
}

function showPanel(id, push, origin) {
  const target = panels.find((p) => p.id === id) || panels[0];
  if (activeLaunch) activeLaunch.finishNow();
  const current = panels.find((p) => p.classList.contains('section-visible'));
  if (!current || current === target) {
    if (current !== target) revealInstant(target, current, push);
    else {
      syncNav(target);
      writeHistory(target, push);
      placeLamp();
      updateProgress();
    }
    panelsReady = true;
    return;
  }
  if (!panelsReady || !motionOk || typeof HTMLElement.prototype.animate !== 'function') {
    revealInstant(target, current, push);
    panelsReady = true;
    return;
  }
  const icon = target.id === 'home'
    ? document.querySelector('.hero-card[href="#' + current.id + '"]')
    : null;
  runLaunch({
    current,
    target,
    origin: target.id === 'home' ? (icon || origin || navOrigin(current.id)) : (origin || navOrigin(target.id)),
    push,
    kind: target.id === 'home' ? 'close' : 'open',
  });
  panelsReady = true;
}

// 站内 #xxx 锚点一律走切换（导航、移动端菜单、首页方块等）
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const id = link.getAttribute('href').slice(1);
  if (!panels.some((p) => p.id === id)) return;
  e.preventDefault();
  showPanel(id, true, link);
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('active');
});

window.addEventListener('popstate', () => {
  showPanel(location.hash.slice(1) || 'home', false);
});

showPanel(location.hash.slice(1) || 'home', false);

function beginMotion() {
  if (!motionOk || root.classList.contains('motion-go')) return;
  root.classList.add('motion-go');
  placeLamp();
}

function whenReveal() {
  const welcome = document.getElementById('site-welcome');
  if (root.classList.contains('welcome-active')) {
    return new Promise((resolve) => {
      const done = () => {
        if (!welcome || welcome.classList.contains('is-leaving') || !root.classList.contains('welcome-active')) {
          observer.disconnect();
          resolve();
        }
      };
      const observer = new MutationObserver(done);
      observer.observe(root, { attributes: true, subtree: true, attributeFilter: ['class'] });
      done();
    });
  }
  if (!root.classList.contains('site-booting')) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!root.classList.contains('site-booting')) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  });
}

if (root.classList.contains('welcome-active')) beginMotion();
else whenReveal().then(beginMotion);
setTimeout(beginMotion, 3600);

function bindTilt() {
  if (!motionOk || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.hero-card').forEach((card) => {
    card.classList.add('tilt');
    let rx = 0;
    let ry = 0;
    let tx = 0;
    let ty = 0;
    let lift = 0;
    let liftTo = 0;
    let raf = 0;
    let last = 0;
    let hovering = false;
    const frame = (now) => {
      if (card.dataset.launching === '1') {
        raf = 0;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;
      const amount = 1 - Math.exp(-12 * dt);
      rx += (tx - rx) * amount;
      ry += (ty - ry) * amount;
      lift += (liftTo - lift) * amount;
      card.style.transform = `perspective(760px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(${lift.toFixed(2)}px)`;
      const settled = Math.abs(rx - tx) < 0.04 && Math.abs(ry - ty) < 0.04 && Math.abs(lift - liftTo) < 0.04;
      if (!settled) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
        if (!hovering) card.style.transform = '';
      }
    };
    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      ty = px * 6;
      tx = py * -5;
      liftTo = -4;
      hovering = true;
      kick();
    });
    card.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
      liftTo = 0;
      hovering = false;
      kick();
    });
  });
}
bindTilt();

// ===== 技能条动画 =====
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
          const targetWidth = bar.getAttribute('data-width') + '%';
          setTimeout(() => {
            bar.style.width = targetWidth;
          }, i * 120);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

const skillSection = document.getElementById('skills');
if (skillSection) skillObserver.observe(skillSection);

// ===== 一键复制邮箱 =====
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const text = btn.getAttribute('data-copy');
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = '已复制';
      btn.style.borderColor = '#c93a22';
      btn.style.color = '#c93a22';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2000);
    });
  });
});
