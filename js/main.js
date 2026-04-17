// ===== 汉堡菜单 =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// 点击移动端菜单链接后关闭
document.querySelectorAll('.mobile-link').forEach(link => {
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

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + entry.target.id) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ===== 入场动画 =====
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ===== 技能条动画 =====
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
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
}, { threshold: 0.3 });

const skillSection = document.getElementById('skills');
if (skillSection) skillObserver.observe(skillSection);

// ===== 打字机效果 =====
// 【填写】修改下面的 phrases 数组，添加你想循环显示的标签
// 建议格式："标签1 | 标签2 | 标签3" 或 "信息1 · 信息2 · 信息3"
const phrases = [
    '【填写：标签1 | 标签2 | 标签3】',
    '【填写：信息1 · 信息2 · 信息3】',
    '【填写：其他你想展示的内容】',
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterEl = document.getElementById('typewriter');

function typewriter() {
    if (!typewriterEl) return;
    const current = phrases[phraseIndex];
    if (isDeleting) {
        typewriterEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }
    let speed = isDeleting ? 30 : 60;
    if (!isDeleting && charIndex === current.length) {
        speed = 2500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 400;
    }
    setTimeout(typewriter, speed);
}
typewriter();

// ===== 卡片交错入场 =====
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
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
}, { threshold: 0.1 });

document.querySelectorAll('.projects-grid, .about-values, .skills-grid, .contact-info, .timeline').forEach(el => {
    cardObserver.observe(el);
});

// ===== 一键复制邮箱 =====
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(text).then(() => {
            const original = btn.textContent;
            btn.textContent = '✅ 已复制！';
            btn.style.background = '#16A34A';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    });
});

// ===== 联系表单提示 =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn-submit');
        btn.textContent = '功能即将上线，请通过邮箱联系 📧';
        btn.style.background = '#6366F1';
        setTimeout(() => {
            btn.textContent = '发送消息 ✉️';
            btn.style.background = '';
        }, 3000);
    });
}
