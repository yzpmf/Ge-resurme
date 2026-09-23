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

// ===== 导航栏高亮当前区域 =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach((s) => sectionObserver.observe(s));

// ===== 入场动画 =====
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach((el) => fadeObserver.observe(el));

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

// ===== 卡片交错入场 =====
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll(
          '.project-card, .hero-card, .value-card, .timeline-item, .skill-category, .contact-item-card'
        );
        cards.forEach((card, i) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 80);
        });
        cardObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document
  .querySelectorAll('.projects-grid, .about-values, .skills-grid, .contact-info, .timeline')
  .forEach((el) => {
    cardObserver.observe(el);
  });

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

// ===== 飘带动画 + 滚动锁定 =====
(function () {
  var ribbonPath = document.getElementById('yzpmf-ribbon');
  var ribbonSubtitle = document.querySelector('.ribbon-subtitle');
  var scrollHint = document.querySelector('.hero-scroll-hint');
  if (!ribbonPath) return;

  var pathLength = ribbonPath.getTotalLength();
  ribbonPath.style.strokeDasharray = pathLength;
  ribbonPath.style.strokeDashoffset = pathLength;

  // 动画参数：3秒自动播放完飘带
  var animationDuration = 3000; // 毫秒
  var startTime = Date.now();
  var lastTextProgress = -1;

  // 插入进度条
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-unlock-hint';
  progressBar.innerHTML = '<div class="scroll-unlock-progress" id="unlockProgress"></div>';
  document.body.appendChild(progressBar);
  var progressFill = document.getElementById('unlockProgress');

  // 锁定页面滚动
  document.body.classList.add('scroll-locked');

  function animate() {
    var now = Date.now();
    var elapsed = now - startTime;
    // 基于时间计算进度（0-1）
    var progress = Math.min(elapsed / animationDuration, 1);

    // 更新进度条
    if (progressFill) progressFill.style.width = progress * 100 + '%';

    // 飘带绘制
    ribbonPath.style.strokeDashoffset = pathLength - pathLength * progress;

    // 文字显现：progress 0~50% 对应 textProgress 0~1
    var textProgress = Math.min(progress * 2, 1);

    if (ribbonSubtitle) {
      if (textProgress >= 1) {
        ribbonSubtitle.classList.add('is-visible');
      } else if (textProgress !== lastTextProgress) {
        void ribbonSubtitle.offsetWidth;
        ribbonSubtitle.style.opacity = textProgress;
        ribbonSubtitle.style.clipPath = 'inset(0 ' + (100 - textProgress * 100) + '% 0 0)';
        ribbonSubtitle.style.transform =
          'translate(' + -30 * (1 - textProgress) + 'px, ' + 20 * (1 - textProgress) + 'px)';
        lastTextProgress = textProgress;
      }
    }

    // 滚动提示淡出
    if (scrollHint) scrollHint.style.opacity = Math.max(0, 0.7 - progress * 0.7);

    // 如果动画未完成，继续
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // 动画完成，解锁滚动
      unlockScroll();
    }
  }

  function unlockScroll() {
    document.body.classList.remove('scroll-locked');
    if (progressBar) {
      progressBar.style.opacity = '0';
      setTimeout(function () {
        if (progressBar.parentNode) progressBar.remove();
      }, 300);
    }
    if (scrollHint) scrollHint.style.opacity = 0;
  }

  // 启动动画
  animate();
})();
