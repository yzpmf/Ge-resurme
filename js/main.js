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
  '.article-card',
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

function showPanel(id, push) {
  const target = panels.find((p) => p.id === id) || panels[0];
  const current = panels.find((p) => p.classList.contains('section-visible'));
  if (current === target) {
    syncNav(target);
    placeLamp();
    updateProgress();
    return;
  }
  const from = current ? panels.indexOf(current) : 0;
  const sign = panels.indexOf(target) >= from ? 1 : -1;
  target.style.setProperty('--enter', `${sign * 18}px`);
  panels.forEach((panel) => panel.classList.toggle('section-visible', panel === target));
  syncNav(target);
  const hash = '#' + target.id;
  if (location.hash !== hash) {
    history[push ? 'pushState' : 'replaceState'](null, '', hash);
  }
  window.scrollTo(0, 0);
  placeLamp();
  updateProgress();
}

// 站内 #xxx 锚点一律走切换（导航、移动端菜单、hero 按钮等）
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  if (!panels.some((p) => p.id === id)) return;
  e.preventDefault();
  showPanel(id, true);
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('active');
});

window.addEventListener('popstate', () => {
  showPanel(location.hash.slice(1) || 'home', false);
});

showPanel(location.hash.slice(1) || 'home', false);

function beginMotion() {
  if (!motionOk || root.classList.contains('motion-go')) return;
  const current = panels.find((panel) => panel.classList.contains('section-visible'));
  if (current) {
    current.classList.remove('section-visible');
    void current.offsetWidth;
    current.classList.add('section-visible');
  }
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

whenReveal().then(beginMotion);
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
