// 技能条动画（滚动到视口时触发）
const skillBars = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.className.replace('skill-fill ', '');
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

skillBars.forEach((bar) => {
  bar.style.width = '0';
  skillObserver.observe(bar);
});

// 导航栏滚动效果
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.boxShadow = '0 2px 30px rgba(0,0,0,0.2)';
  } else {
    nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
  }
});

// 打字机效果
const phrases = ['一名大一学生', '化学学科学习中', '正在学习前端开发'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterEl = document.querySelector('.hero-content p');

function typewriter() {
  const current = phrases[phraseIndex];
  if (isDeleting) {
    typewriterEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriterEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 40 : 80;

  if (!isDeleting && charIndex === current.length) {
    speed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    speed = 400;
  }

  setTimeout(typewriter, speed);
}

if (typewriterEl) typewriter();

// 入场动画
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('#about, #projects, #contact').forEach((section) => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  fadeObserver.observe(section);
});
