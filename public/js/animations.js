/* =====================================================
   animations.js — Scroll reveals, animated counters,
                   parallax, page loader, custom cursor
   Jentech Consultants Group
   ===================================================== */

(function() {
    'use strict';

    /* ---------- Page loader ---------- */
    const loader = document.getElementById('pageLoader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('done'), 900);
        });
    }

    /* ---------- Custom cursor ---------- */
    const cursor = document.getElementById('cursor');
    const cursorRing = document.getElementById('cursorRing');
    let mouseX = -100,
        mouseY = -100;
    let ringX = -100,
        ringY = -100;
    let rafId;

    if (cursor && cursorRing && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function ringLoop() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            rafId = requestAnimationFrame(ringLoop);
        }
        ringLoop();

        // Hover detection
        document.querySelectorAll('a, button, [data-hover]').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorRing.style.opacity = '0.6';
        });
    }

    /* ---------- Intersection Observer: reveal ---------- */
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal], [data-stagger], .companies-grid, .services-grid, .team-grid, .news-grid, .about-section').forEach(el => {
        revealObs.observe(el);
    });

    /* ---------- Animated counters ---------- */
    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const steps = 60;
        let current = 0;
        const increment = target / steps;
        let step = 0;

        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

        const timer = setInterval(() => {
            step++;
            const progress = easeOut(step / steps);
            current = Math.round(progress * target);
            el.textContent = current + suffix;
            if (step >= steps) {
                clearInterval(timer);
                el.textContent = target + suffix;
                el.classList.add('counted');
            }
        }, duration / steps);
    }

    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

    /* ---------- Parallax hero ---------- */
    const hero = document.querySelector('.hero');
    const heroGrid = document.querySelector('.hero-grid');

    if (hero && heroGrid && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight * 1.2) {
                heroGrid.style.transform = `translateY(${scrollY * 0.25}px)`;
            }
        }, { passive: true });
    }

    /* ---------- Blueprint SVG draw (about section) ---------- */
    const bpObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.blueprint-path').forEach((path, i) => {
                    setTimeout(() => {
                        path.style.strokeDashoffset = '0';
                    }, i * 200);
                });
                bpObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.about-img-main').forEach(el => bpObs.observe(el));

})();