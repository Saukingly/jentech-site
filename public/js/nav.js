/* =====================================================
   nav.js — Navbar, mobile menu, scroll progress,
            active section indicator
   Jentech Consultants Group
   ===================================================== */

(function() {
    'use strict';

    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navLinks');
    const progress = document.getElementById('scrollProgress');
    const heroScroll = document.querySelector('.hero-scroll');
    const dots = document.querySelectorAll('.indicator-dot');
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = document.querySelectorAll('.nav-link');

    /* ---------- Scroll: navbar state + progress bar ---------- */
    function onScroll() {
        const scrollY = window.scrollY;
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docH > 0 ? (scrollY / docH) * 100 : 0;

        // Navbar appearance
        if (navbar) navbar.classList.toggle('scrolled', scrollY > 40);

        // Fade out scroll hint as user scrolls past the hero
        if (heroScroll) {
            const fadeEnd = window.innerHeight * 0.6;
            const opacity = Math.max(0, 1 - scrollY / fadeEnd);
            heroScroll.style.opacity = String(opacity);
            heroScroll.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
        }

        // Progress bar
        if (progress) progress.style.width = pct + '%';

        // Active section (nav links + side dots)
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            const bottom = top + sec.offsetHeight;
            if (scrollY >= top && scrollY < bottom) current = sec.id;
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            link.classList.toggle('active', href === '#' + current);
        });

        dots.forEach(dot => {
            const targetId = (dot.dataset.target || '').replace('#', '');
            dot.classList.toggle('active', targetId === current);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    /* ---------- Mobile toggle ---------- */
    if (toggle && navMenu) {
        toggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('open');
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open);
        });

        // Close on link click
        navMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navMenu.classList.remove('open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on outside click
        document.addEventListener('click', e => {
            if (!navbar.contains(e.target)) {
                navMenu.classList.remove('open');
                toggle.classList.remove('open');
            }
        });
    }

    /* ---------- Side indicator dots ---------- */
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const target = document.querySelector(dot.dataset.target);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

})();