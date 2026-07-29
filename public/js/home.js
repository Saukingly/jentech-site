/* =====================================================
   home.js — Jentech Homepage JavaScript
   No custom cursor. Mobile-first.
   ===================================================== */

// ---- API helper ----
async function api(path) {
    const r = await fetch('/api' + path, { credentials: 'include' });
    if (!r.ok) throw new Error('API error ' + r.status);
    return r.json();
}

// ---- Toast notification ----
function toast(msg, type = 'ok') {
    let el = document.getElementById('toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        el.className = 'toast';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'toast ' + type + ' show';
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3800);
}

// ---- Format date ----
function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

// ---- Get initials from name ----
function initials(name) {
    return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* =====================================================
   NAVBAR
   ===================================================== */
function initNav() {
    const nav = document.getElementById('nav');
    const bar = document.getElementById('scrollBar');
    const tog = document.getElementById('navTog');
    const mob = document.getElementById('mobMenu');

    // Scroll: sticky + progress bar
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (nav) nav.classList.toggle('scrolled', y > 40);
        if (bar && max > 0) bar.style.width = (y / max * 100) + '%';
    }, { passive: true });

    // Mobile toggle
    if (tog && mob) {
        tog.addEventListener('click', () => {
            const open = mob.classList.toggle('open');
            tog.classList.toggle('open', open);
        });
        mob.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                mob.classList.remove('open');
                tog.classList.remove('open');
            });
        });
        document.addEventListener('click', e => {
            if (nav && !nav.contains(e.target) && !mob.contains(e.target)) {
                mob.classList.remove('open');
                tog.classList.remove('open');
            }
        });
    }

    // Smooth anchor scroll (offset for fixed nav)
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 64;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

/* =====================================================
   SCROLL REVEAL
   ===================================================== */
function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('[data-r], [data-stag]').forEach(el => obs.observe(el));
}

/* =====================================================
   ANIMATED COUNTERS (stats bar)
   ===================================================== */
function initCounters() {
    const ease = t => 1 - Math.pow(1 - t, 3);
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            let step = 0;
            const steps = 60;
            const timer = setInterval(() => {
                step++;
                el.textContent = Math.round(ease(step / steps) * target) + suffix;
                if (step >= steps) {
                    clearInterval(timer);
                    el.textContent = target + suffix;
                }
            }, 1800 / steps);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}

/* =====================================================
   SERVICES (fetched from API)
   ===================================================== */
const srvIcons = {
    'civil-structural-engineering': `<svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>`,
    'geotechnical-exploration': `<svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>`,
    'materials-soils-testing': `<svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082"/></svg>`,
    'project-management': `<svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664"/></svg>`,
    'site-investigation': `<svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>`
};
const defaultIcon = srvIcons['civil-structural-engineering'];

async function loadServices() {
    const grid = document.getElementById('srvGrid');
    if (!grid) return;
    try {
        const data = await api('/services');
        const list = data.slice(0, 6);
        if (!list.length) {
            grid.innerHTML = '<div class="empty"><h3>Services coming soon</h3></div>';
            return;
        }
        grid.innerHTML = list.map((s, i) => `
      <a href="/pages/services/${s.slug}" class="srv-card">
        <span class="srv-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="srv-icon">${srvIcons[s.slug] || defaultIcon}</div>
        <h3 class="srv-title">${s.title}</h3>
        <p class="srv-desc">${s.short_desc || ''}</p>
      </a>
    `).join('');
        document.querySelectorAll('#srvGrid .srv-card').forEach(el => el.setAttribute('data-r', ''));
        initReveal();
    } catch (err) {
        console.error('Services load error:', err);
        grid.innerHTML = '<div class="empty"><h3>Could not load services</h3><p>Please ensure the server is running.</p></div>';
    }
}

/* =====================================================
   PROJECTS (horizontal scroll, fetched from API)
   ===================================================== */
const projBgs = [
    'linear-gradient(145deg,#0d2535,#1a3a52)',
    'linear-gradient(145deg,#1a2d0d,#2e4d1a)',
    'linear-gradient(145deg,#2a1a0d,#453020)',
    'linear-gradient(145deg,#0d1a35,#1a2d52)',
    'linear-gradient(145deg,#1a0d2a,#2d1a45)',
    'linear-gradient(145deg,#0a2520,#153d35)'
];

async function loadProjects() {
    const track = document.getElementById('projTrack');
    if (!track) return;
    try {
        const data = await api('/projects');
        if (!data.length) {
            track.innerHTML = '<div class="empty" style="color:rgba(255,255,255,.5);padding:40px 20px;"><h3>Projects coming soon</h3></div>';
            return;
        }
        // Featured projects first, max 8
        const sorted = [...data.filter(p => p.featured), ...data.filter(p => !p.featured)].slice(0, 8);
        track.innerHTML = sorted.map((p, i) => `
      <a href="/pages/projects/${p.slug}" class="proj-card${i === 0 ? ' lg' : ''}">
        <div class="proj-bg" style="${p.image_url ? `background-image:url('${p.image_url}');background-size:cover;background-position:center;` : `background:${projBgs[i % projBgs.length]};`}"></div>
        <div class="proj-grid-bg"></div>
        <div class="proj-grad"></div>
        <span class="proj-arr">→</span>
        <div class="proj-info">
          <p class="proj-region">${p.location || 'Jamaica'}</p>
          <h3 class="proj-title">${p.title}</h3>
          <p class="proj-type">${p.service_type || 'Engineering'}${p.year ? ' · ' + p.year : ''}</p>
        </div>
      </a>
    `).join('');
    initProjScroll();
  } catch (err) {
    console.error('Projects load error:', err);
    track.innerHTML = '<div class="empty" style="color:rgba(255,255,255,.5);padding:40px 20px;"><h3>Could not load projects</h3></div>';
  }
}

function initProjScroll() {
  const track = document.getElementById('projTrack');
  const prev  = document.getElementById('projPrev');
  const next  = document.getElementById('projNext');
  const fill  = document.getElementById('projFill');
  if (!track) return;

  // Drag scroll
  let isDown = false, startX, sl;
  track.addEventListener('mousedown', e => {
    isDown = true; track.style.cursor = 'grabbing';
    startX = e.pageX - track.offsetLeft; sl = track.scrollLeft;
  });
  document.addEventListener('mouseup', () => {
    isDown = false;
    if (track) track.style.cursor = 'grab';
  });
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    track.scrollLeft = sl - (e.pageX - track.offsetLeft - startX) * 1.5;
  });

  // Button controls
  const scrollAmt = window.innerWidth < 600 ? 303 : 443;
  if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmt, behavior: 'smooth' }));
  if (next) next.addEventListener('click', () => track.scrollBy({ left:  scrollAmt, behavior: 'smooth' }));

  // Progress fill bar
  function updateFill() {
    if (!fill) return;
    const max = track.scrollWidth - track.clientWidth;
    fill.style.width = (max > 0 ? Math.min((track.scrollLeft / max) * 80 + 20, 100) : 20) + '%';
  }
  track.addEventListener('scroll', updateFill, { passive: true });
  updateFill();
}

/* =====================================================
   BLOG / NEWS (fetched from API)
   ===================================================== */
async function loadBlog() {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;
  try {
    const data = await api('/blog');
    const list = data.slice(0, 3);
    if (!list.length) {
      grid.innerHTML = '<div class="empty"><h3>News coming soon</h3></div>';
      return;
    }
    grid.innerHTML = list.map(p => `
      <a href="/pages/blog/${p.slug}" class="news-card">
        <div class="nc-img">
          <div class="nc-img-inner"></div>
          ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}" loading="lazy">` : ''}
        </div>
        <div class="nc-body">
          <p class="nc-cat">${p.category || 'News'}</p>
          <h3 class="nc-title">${p.title}</h3>
          <p class="nc-date">${fmtDate(p.published_at)}</p>
          ${p.excerpt ? `<p class="nc-ex">${p.excerpt}</p>` : ''}
        </div>
      </a>
    `).join('');
    document.querySelectorAll('#newsGrid .news-card').forEach(el => el.setAttribute('data-r', ''));
    initReveal();
  } catch (err) {
    console.error('Blog load error:', err);
    grid.innerHTML = '<div class="empty"><h3>Could not load news</h3></div>';
  }
}

/* =====================================================
   CONTACT FORM (sends to /api/contact → auto email)
   ===================================================== */
function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.f-submit');
    const g   = id => { const el = document.getElementById(id); return el && el.value ? el.value.trim() : ''; };

    const payload = {
      first_name: g('cFname'),
      last_name:  g('cLname'),
      email:      g('cEmail'),
      office:     g('cOffice'),
      service:    g('cService'),
      message:    g('cMessage')
    };

    // Basic validation
    if (!payload.first_name || !payload.last_name || !payload.email || !payload.message) {
      toast('Please fill in all required fields.', 'err');
      return;
    }
    if (!payload.email.includes('@')) {
      toast('Please enter a valid email address.', 'err');
      return;
    }

    const origText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        toast('Message sent! Check your email for confirmation.', 'ok');
        form.reset();
      } else {
        toast(json.error || 'Something went wrong. Please try again.', 'err');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      toast('Could not connect to server. Please try again.', 'err');
    }

    btn.textContent = origText;
    btn.disabled = false;
  });
}

/* =====================================================
   INIT — runs when DOM is ready
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCounters();
  loadServices();
  loadProjects();
  loadBlog();
  initContact();
});

// Inside your fetch() or load() function
const grid = document.getElementById('projectsGrid'); // Ensure your HTML has this ID

fetch('/api/services') // Calls your server/routes/services.js
    .then(res => res.json())
    .then(data => {
        grid.innerHTML = data.map(item => createCard(item, 'services')).join('');
    });