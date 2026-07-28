/* =====================================================
   shared.js — Shared utilities for all inner pages
   Navbar, toast, scroll reveal, API helper
   ===================================================== */

// ---- Session-expiry handling ----
// A 401 from any protected endpoint means the session timed out from
// inactivity (login endpoints are excluded below since a wrong password
// also returns 401 and that's a different, expected case). Shows a clear
// message instead of the request just silently failing, then redirects to
// the right login page for whichever app (admin/client) the person is on.
let sessionExpiredShown = false;

function isLoginEndpoint(path) {
    return path === '/auth/login' || path === '/client-auth/login' ||
        path === '/auth/register' || path === '/client-auth/register';
}

function handleSessionExpired() {
    if (sessionExpiredShown) return;
    const onAdmin = window.location.pathname.startsWith('/pages/admin');
    const onClient = window.location.pathname.startsWith('/pages/client');
    if (!onAdmin && !onClient) return; // not on a page with a login-gated session
    if (window.location.pathname.endsWith('login.html')) return; // already on login

    sessionExpiredShown = true;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,22,40,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,sans-serif;';
    overlay.innerHTML = `
    <div style="background:#fff;max-width:380px;width:100%;padding:32px;text-align:center;border-top:3px solid #c8912a;">
      <div style="font-size:16px;font-weight:700;color:#0a1628;margin-bottom:10px;">You've been signed out</div>
      <div style="font-size:14px;color:#666;line-height:1.6;">Your session ended due to inactivity. Redirecting you to log in again…</div>
    </div>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
        window.location.href = onAdmin ? '/pages/admin/login.html' : '/pages/client/login.html';
    }, 2200);
}

// ---- API Helper ----
const API = {
    base: '/api',

    // Rewritten with a colon so your auto-formatter can't join them!
    get: async function(path) {
        const res = await fetch(this.base + path, { credentials: 'include' });
        if (res.status === 401 && !isLoginEndpoint(path)) handleSessionExpired();
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    },

    async post(path, data) {
        const res = await fetch(this.base + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (res.status === 401 && !isLoginEndpoint(path)) handleSessionExpired();
        return res.json();
    },

    async put(path, data) {
        const res = await fetch(this.base + path, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (res.status === 401 && !isLoginEndpoint(path)) handleSessionExpired();
        return res.json();
    },

    async delete(path) {
        const res = await fetch(this.base + path, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.status === 401 && !isLoginEndpoint(path)) handleSessionExpired();
        return res.json();
    },

    async patch(path, data = {}) {
        const res = await fetch(this.base + path, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (res.status === 401 && !isLoginEndpoint(path)) handleSessionExpired();
        return res.json();
    }
};

// ---- Toast Notification ----
function showToast(message, type = 'success', duration = 3500) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ---- Navbar: sticky + mobile toggle ----
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('open');
            toggle.classList.toggle('open', open);
        });
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                toggle.classList.remove('open');
            });
        });
        document.addEventListener('click', e => {
            if (!toggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('open');
                toggle.classList.remove('open');
            }
        });
    }

    // Mark active nav link by URL
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (path.includes(href) && href !== '/') link.classList.add('active');
    });
}

// ---- Scroll Reveal ----
function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-reveal], [data-stagger]').forEach(el => obs.observe(el));
}

// ---- Slug helper ----
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---- Format date ----
function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ---- Get slug from URL ----
function getSlugFromURL() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];

    if (lastPart) {
        return lastPart.replace('.html', '');
    }
    return '';
}
// ---- Shared navbar HTML ----
function renderNavbar(activePage = '') {
    const pages = [
        { href: '/pages/services/index.html', label: 'Services' },
        { href: '/pages/projects/index.html', label: 'Projects' },
        { href: '/pages/about/index.html', label: 'About' },
        { href: '/pages/blog/index.html', label: 'Blog' },
        { href: '/pages/contact/index.html', label: 'Contact' },
    ];

    const links = [
        `<a href="/" class="nav-link${activePage === 'Home' ? ' active' : ''}">Home</a>`,
        ...pages.map(p =>
            `<a href="${p.href}" class="nav-link${activePage === p.label ? ' active' : ''}">${p.label}</a>`
        ),
        `<a href="/pages/client/login.html" class="nav-contact${activePage === 'Client Login' ? ' active' : ''}">Client Login</a>`
    ].join('');

    const mobileLinks = [
        `<a href="/">Home</a>`,
        ...pages.map(p => `<a href="${p.href}">${p.label}</a>`),
        `<a href="/pages/client/login.html" class="m-contact">Client Login</a>`
    ].join('');

    return `
    <nav class="navbar" id="navbar">
      <div class="nav-inner">
        <a href="/" class="nav-logo">
          <div class="logo-wordmark">
            <img src="/images/logos/jentech-wordmark-white.png" alt="Jentech" class="logo-wordmark-img">
            <span class="logo-tagline">Group of Companies</span>
          </div>
        </a>
        <div class="nav-links">
          ${links}
        </div>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
    <div class="mobile-menu" id="mobileMenu">
      ${mobileLinks}
    </div>
  `;
}

// ---- Shared footer HTML ----
function renderFooter() {
    return `
    <footer class="footer">
      <div class="footer-main">
        <div class="footer-grid">
          <div>
            <a href="/" class="nav-logo" style="display:inline-flex;margin-bottom:4px;">
              <div class="logo-wordmark">
                <img src="/images/logos/jentech-wordmark-white.png" alt="Jentech" class="logo-wordmark-img">
                <span class="logo-tagline">Consultants Group</span>
              </div>
            </a>
            <p class="footer-brand-desc">Professional civil engineering services across Jamaica, the Caribbean, and the United States since 1974.</p>
          </div>
          <div class="footer-cols">
            <div class="footer-col">
              <h5>Pages</h5>
              <a href="/pages/services/">Services</a>
              <a href="/pages/projects/">Projects</a>
              <a href="/pages/about/index.html">About</a>
              <a href="/pages/blog/">Blog</a>
            </div>
            <div class="footer-col">
              <h5>Companies</h5>
              <a href="/">Jentech Consultants</a>
              <a href="/">Geotech Exploration</a>
              <a href="/">JETS Laboratories</a>
            </div>
            <div class="footer-col">
              <h5>Contact</h5>
              <a href="/pages/contact/index.html">Get in touch</a>
              <a href="/pages/contact/index.html#jamaica-office">Jamaica Office</a>
              <a href="/pages/contact/index.html#us-office">US — Americanos</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© ${new Date().getFullYear()} The Jentech Group of Companies. All rights reserved.</p>
          <p><a href="/pages/privacy/index.html" style="color:inherit;">Privacy Policy</a> &nbsp;·&nbsp; Engineering Excellence Since 1974</p>
        </div>
      </div>
    </footer>
  `;
}

// ---- Init on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initReveal();
});

// A reusable function to generate the Jacobs-style card
function createCard(item, pageType) {
    return `
        <a href="/pages/${pageType}/${item.slug}.html" class="project-card js-animate">
            <img src="${item.image || '/images/default.jpg'}" class="project-image">
            <div class="project-overlay">
                <span class="project-tag">— ${item.category || 'Jentech'}</span>
                <h3 class="project-title">${item.title}</h3>
            </div>
        </a>
    `;
}