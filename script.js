// =====================================================
// EASY PILLS - Clean Minimalist Interactions
// With Lenis Smooth Scrolling
// =====================================================

// Initialize Lucide Icons
lucide.createIcons();

// =====================================================
// LENIS SMOOTH SCROLL
// =====================================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

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
    
    // Update direction
    html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', currentLang);
    
    // Update button text
    if (langText) {
        langText.textContent = currentLang === 'ar' ? 'English' : 'العربية';
    }
    
    // Update all translatable elements
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) {
            el.textContent = text;
        }
    });
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
preloaderLineAfter.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#1a1a1a;transform:translateX(-100%)';
if (preloaderLine) preloaderLine.appendChild(preloaderLineAfter);

const preloaderTl = gsap.timeline({
    onComplete: () => {
        if (preloader) {
            preloader.style.display = 'none';
        }
        lenis.start();
        initPageAnimations();
    }
});

// Stop scroll during preloader
lenis.stop();

preloaderTl
    .to(preloaderTexts, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
    })
    .to(preloaderLineAfter, {
        x: 0,
        duration: 0.8,
        ease: 'power2.inOut'
    }, '-=0.3')
    .to(preloaderTexts, {
        y: '-100%',
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power3.in'
    }, '+=0.2')
    .to(preloader, {
        yPercent: -100,
        duration: 0.6,
        ease: 'power3.inOut'
    }, '-=0.2');

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
        // Cursor follows immediately
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        // Follower has lag
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
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

// Scroll effect on nav
ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
        if (self.direction === 1) {
            nav.classList.add('is-scrolled');
        } else if (self.scroll() < 80) {
            nav.classList.remove('is-scrolled');
        }
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
            lenis.scrollTo(target, {
                offset: -100,
                duration: 1.5
            });
        }, 300);
    });
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = anchor.getAttribute('href');
        if (target !== '#') {
            lenis.scrollTo(target, {
                offset: -100,
                duration: 1.5
            });
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
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
}

// =====================================================
// PAGE ANIMATIONS
// =====================================================
function initPageAnimations() {
    // Hero animations
    const heroTl = gsap.timeline({ delay: 0.2 });
    
    heroTl
        .to('.hero-badge', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        })
        .to('.hero-word', {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.08,
            ease: 'power3.out'
        }, '-=0.4')
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')
        .to('.hero-scroll', {
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.3');

    // Section headers
    gsap.utils.toArray('.section-number').forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out'
        });
    });

    gsap.utils.toArray('.section-label').forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.1,
            ease: 'power3.out'
        });
    });

    gsap.utils.toArray('.section-title-large').forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    });

    gsap.utils.toArray('.section-description').forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.1,
            ease: 'power3.out'
        });
    });

    // Mission titles and text
    gsap.utils.toArray('.mission-title').forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    });

    gsap.utils.toArray('.mission-text').forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.1,
            ease: 'power3.out'
        });
    });

    // Stat cards
    gsap.utils.toArray('.stat-card').forEach((el, i) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power3.out'
        });
    });

    // Feature list items
    gsap.utils.toArray('.feature-list-item').forEach((el, i) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: i * 0.08,
            ease: 'power3.out'
        });
    });

    // Tech cards stagger
    ScrollTrigger.batch('.tech-card', {
        onEnter: (batch) => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: 'power3.out'
            });
        },
        onLeaveBack: (batch) => {
            gsap.to(batch, {
                opacity: 0,
                y: 30,
                stagger: 0.05,
                duration: 0.4
            });
        },
        start: 'top 85%'
    });

    // Process steps
    ScrollTrigger.batch('.process-step', {
        onEnter: (batch) => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out'
            });
        },
        onLeaveBack: (batch) => {
            gsap.to(batch, {
                opacity: 0,
                y: 30,
                stagger: 0.05,
                duration: 0.4
            });
        },
        start: 'top 85%'
    });

    // Stack items
    ScrollTrigger.batch('.stack-item', {
        onEnter: (batch) => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power3.out'
            });
        },
        onLeaveBack: (batch) => {
            gsap.to(batch, {
                opacity: 0,
                y: 30,
                stagger: 0.05,
                duration: 0.4
            });
        },
        start: 'top 85%'
    });

    // Progress items
    ScrollTrigger.batch('.progress-item', {
        onEnter: (batch) => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power3.out'
            });
        },
        onLeaveBack: (batch) => {
            gsap.to(batch, {
                opacity: 0,
                y: 30,
                stagger: 0.05,
                duration: 0.4
            });
        },
        start: 'top 85%'
    });

    // Team cards
    ScrollTrigger.batch('.team-card', {
        onEnter: (batch) => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                scale: 1,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power3.out'
            });
        },
        onLeaveBack: (batch) => {
            gsap.to(batch, {
                opacity: 0,
                y: 30,
                scale: 0.95,
                stagger: 0.05,
                duration: 0.4
            });
        },
        start: 'top 85%'
    });

    // Counter animation
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-counter'));
        
        gsap.to(counter, {
            scrollTrigger: {
                trigger: counter,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            innerText: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function() {
                counter.innerText = Math.round(counter.innerText);
            }
        });
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
