// =====================================================
// EASY PILLS - Caleb Raney Style Smooth Scroll
// With Lenis + GSAP + ScrollTrigger
// =====================================================

// Initialize Lucide Icons
lucide.createIcons();

// =====================================================
// LENIS SMOOTH SCROLL - Like Caleb Raney
// =====================================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
});

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip);

// =====================================================
// SMOOTH SCROLL TO ANCHOR
// =====================================================
function smoothScrollTo(target, duration = 1.5) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const offset = 100;
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    
    lenis.scrollTo(targetPosition, {
        duration: duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
}

// =====================================================
// PARALLAX EFFECTS - Caleb Raney Style
// =====================================================
function initParallax() {
    // Background circles parallax
    gsap.utils.toArray('.bg-circle').forEach((circle, i) => {
        const speed = (i + 1) * 0.1;
        gsap.to(circle, {
            yPercent: -20 * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            }
        });
    });

    // Hero circles parallax
    gsap.utils.toArray('.hero-circle').forEach((circle, i) => {
        const speed = (i + 1) * 0.15;
        gsap.to(circle, {
            yPercent: 30 * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });
    });
}

// =====================================================
// LANGUAGE TOGGLE
// =====================================================
let currentLang = 'en';
const langToggle = document.getElementById('lang-toggle');
const langText = document.getElementById('lang-text');
const mobileLangToggle = document.getElementById('mobile-lang-toggle');
const html = document.documentElement;

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    
    html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', currentLang);
    
    if (langText) {
        langText.textContent = currentLang === 'ar' ? 'English' : 'العربية';
    }
    
    // Update all elements with data-en and data-ar attributes
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) {
            // Check if the element has HTML structure we need to preserve
            if (el.classList.contains('mission-title') || el.classList.contains('section-title-large')) {
                // Preserve italic span formatting
                const italicMatch = text.match(/^(.+?)\s+(\S+)$/);
                if (italicMatch && el.querySelector('.italic')) {
                    // Keep the structure with italic span
                    const parts = el.innerHTML.split(/<span class="italic">/);
                    if (parts.length > 1) {
                        const closingPart = parts[1].split('</span>');
                        el.innerHTML = `${text.split(' ').slice(0, -1).join(' ')} <span class="italic">${text.split(' ').slice(-1)[0]}</span>`;
                    } else {
                        el.textContent = text;
                    }
                } else {
                    el.textContent = text;
                }
            } else {
                el.textContent = text;
            }
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-placeholder-en][data-placeholder-ar]').forEach(el => {
        const placeholder = el.getAttribute(`data-placeholder-${currentLang}`);
        if (placeholder) {
            el.placeholder = placeholder;
        }
    });
    
    // Force update hero title for Arabic
    if (currentLang === 'ar') {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = `
                <span class="hero-title-line">
                    <span class="hero-word" data-text="Easy Pills">إيزي بيلز</span>
                    <span class="hero-word italic" data-text="هو">هو</span>
                </span>
                <span class="hero-title-line">
                    <span class="hero-word italic" data-text="نظام">نظام</span>
                    <span class="hero-word" data-text="ذكي">ذكي</span>
                </span>
                <span class="hero-title-line">
                    <span class="hero-word" data-text="للالتزام بالأدوية">للالتزام بالأدوية</span>
                </span>
            `;
            // Re-animate hero words
            gsap.to('.hero-word', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out'
            });
        }
    } else {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = `
                <span class="hero-title-line">
                    <span class="hero-word" data-text="Easy Pills">Easy Pills</span>
                    <span class="hero-word italic" data-text="is a">is a</span>
                </span>
                <span class="hero-title-line">
                    <span class="hero-word italic" data-text="smart">smart</span>
                    <span class="hero-word" data-text="medication">medication</span>
                </span>
                <span class="hero-title-line">
                    <span class="hero-word" data-text="adherence system">adherence system</span>
                </span>
            `;
            // Re-animate hero words
            gsap.to('.hero-word', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out'
            });
        }
    }
}

if (langToggle) {
    langToggle.addEventListener('click', toggleLanguage);
}

if (mobileLangToggle) {
    mobileLangToggle.addEventListener('click', toggleLanguage);
}

// =====================================================
// PRELOADER ANIMATION
// =====================================================
const preloader = document.getElementById('preloader');
const preloaderTexts = document.querySelectorAll('.preloader-text');
const preloaderLine = document.querySelector('.preloader-line');
const preloaderLineAfter = document.createElement('div');
preloaderLineAfter.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:var(--color-accent);transform:translateX(-100%)';
if (preloaderLine) preloaderLine.appendChild(preloaderLineAfter);

const preloaderTl = gsap.timeline({
    onComplete: () => {
        if (preloader) {
            preloader.style.display = 'none';
        }
        initPageAnimations();
        initTeamBarsAnimation();
        initParallax();
    }
});

preloaderTl
    .to(preloaderTexts, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    })
    .to(preloaderLineAfter, {
        x: 0,
        duration: 1,
        ease: 'power2.inOut'
    }, '-=0.4')
    .to(preloaderTexts, {
        y: '-100%',
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.in'
    }, '+=0.3')
    .to(preloader, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut'
    }, '-=0.3');

// =====================================================
// CUSTOM CURSOR
// =====================================================
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');

if (cursor && cursorFollower && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverElements = document.querySelectorAll('a, button, [data-magnetic]');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollower.classList.add('is-hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorFollower.classList.remove('is-hovering');
        });
    });
}

// =====================================================
// NAVIGATION
// =====================================================
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
let isMenuOpen = false;
let lastScrollY = 0;

// Scroll effect on nav
ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
        const currentScrollY = self.scroll();
        
        if (self.direction === 1 && currentScrollY > 200) {
            nav.classList.add('is-hidden');
        } else {
            nav.classList.remove('is-hidden');
        }
        
        if (currentScrollY > 80) {
            nav.classList.add('is-scrolled');
        } else {
            nav.classList.remove('is-scrolled');
        }
        
        lastScrollY = currentScrollY;
    }
});

// Mobile menu toggle
if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        navToggle.classList.toggle('is-active', isMenuOpen);
        mobileMenu.classList.toggle('is-open', isMenuOpen);
        
        if (isMenuOpen) {
            lenis.stop();
        } else {
            lenis.start();
        }
    });
}

// Close menu on link click
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        
        isMenuOpen = false;
        if (navToggle) navToggle.classList.remove('is-active');
        if (mobileMenu) mobileMenu.classList.remove('is-open');
        lenis.start();
        
        setTimeout(() => {
            smoothScrollTo(target, 1.5);
        }, 300);
    });
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = anchor.getAttribute('href');
        if (target !== '#') {
            smoothScrollTo(target, 1.5);
        }
    });
});

// =====================================================
// MAGNETIC EFFECT
// =====================================================
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
}

// =====================================================
// REVEAL ANIMATIONS - Caleb Raney Style
// =====================================================
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    revealElements.forEach((el, i) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(el, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    delay: i % 3 * 0.1,
                    ease: 'power3.out'
                });
                el.classList.add('is-visible');
            }
        });
    });
}

// =====================================================
// TEAM BARS ANIMATION
// =====================================================
function initTeamBarsAnimation() {
    const teamBars = document.querySelectorAll('.team-bar');
    
    if (teamBars.length > 0) {
        ScrollTrigger.create({
            trigger: '.team-bars-container',
            start: 'top 75%',
            once: true,
            onEnter: () => {
                teamBars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.classList.add('is-visible');
                    }, index * 200);
                });
            }
        });
    }
}

// =====================================================
// PAGE ANIMATIONS
// =====================================================
function initPageAnimations() {
    // Hero animations
    const heroTl = gsap.timeline({ delay: 0.3 });
    
    heroTl
        .to('.hero-badge', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        })
        .to('.hero-word', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power3.out'
        }, '-=0.6')
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.6')
        .to('.hero-scroll', {
            opacity: 1,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.4');

    // Initialize reveal animations
    initRevealAnimations();
}

// =====================================================
// TECH CARD MODAL
// =====================================================
const techCards = document.querySelectorAll('[data-tech-card]');
const techModalOverlay = document.getElementById('tech-modal-overlay');
const techModal = document.getElementById('tech-modal');
const techModalClose = document.getElementById('tech-modal-close');
const techModalIcon = document.getElementById('tech-modal-icon');
const techModalTitle = document.getElementById('tech-modal-title');
const techModalText = document.getElementById('tech-modal-text');
const techModalDetail = document.getElementById('tech-modal-detail');

let activeCard = null;

function openTechModal(card) {
    activeCard = card;
    lenis.stop();
    
    const icon = card.querySelector('.tech-card-icon').innerHTML;
    const title = card.querySelector('.tech-card-title').textContent;
    const text = card.querySelector('.tech-card-text').textContent;
    const detail = card.querySelector('.tech-card-detail');
    const detailText = detail ? detail.textContent : '';
    
    techModalIcon.innerHTML = icon;
    techModalTitle.textContent = title;
    techModalText.textContent = text;
    techModalDetail.textContent = detailText;
    
    const cardRect = card.getBoundingClientRect();
    
    gsap.set(techModal, {
        top: cardRect.top,
        left: cardRect.left,
        width: cardRect.width,
        height: cardRect.height,
        borderRadius: '20px',
        opacity: 0
    });
    
    techModalOverlay.classList.add('is-open');
    
    gsap.to(techModal, {
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -50,
        width: 'min(600px, 90vw)',
        height: 'auto',
        borderRadius: '28px',
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out'
    });
    
    gsap.fromTo('.tech-modal-content', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' }
    );
    
    gsap.to(card, {
        scale: 0.95,
        opacity: 0.5,
        duration: 0.4,
        ease: 'power2.out'
    });
}

function closeTechModal() {
    if (!activeCard) return;
    
    const cardRect = activeCard.getBoundingClientRect();
    
    gsap.to('.tech-modal-content', {
        opacity: 0,
        y: -10,
        duration: 0.25,
        ease: 'power2.in'
    });
    
    gsap.to(techModal, {
        top: cardRect.top,
        left: cardRect.left,
        xPercent: 0,
        yPercent: 0,
        width: cardRect.width,
        height: cardRect.height,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.inOut',
        onComplete: () => {
            techModalOverlay.classList.remove('is-open');
            gsap.set(techModal, { clearProps: 'all' });
            lenis.start();
        }
    });
    
    gsap.to(activeCard, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
    });
    
    activeCard = null;
}

techCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openTechModal(card));
});

if (techModalClose) {
    techModalClose.addEventListener('click', closeTechModal);
}

if (techModalOverlay) {
    techModalOverlay.addEventListener('click', (e) => {
        if (e.target === techModalOverlay) {
            closeTechModal();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && techModalOverlay.classList.contains('is-open')) {
        closeTechModal();
    }
});

// =====================================================
// HOVER EFFECTS FOR CARDS
// =====================================================
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    techCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    });
}

// =====================================================
// CONTACT FORM HANDLING
// =====================================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Message Sent! ✓</span>';
        btn.style.background = 'var(--color-success)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            contactForm.reset();
        }, 3000);
    });
}

// =====================================================
// REFRESH SCROLL TRIGGER ON RESIZE
// =====================================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});
