/* =====================================================
   interactions.js — Horizontal project scroll,
                    form handling, hover effects
   Jentech Consultants Group
   ===================================================== */

(function() {
    'use strict';

    /* ---------- Horizontal project drag scroll ---------- */
    const track = document.getElementById('projectsTrack');
    const prevBtn = document.getElementById('projectsPrev');
    const nextBtn = document.getElementById('projectsNext');
    const fillBar = document.getElementById('scrollFill');

    if (track) {
        let isDragging = false;
        let startX, scrollLeft;

        track.addEventListener('mousedown', e => {
            isDragging = true;
            track.style.cursor = 'grabbing';
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (track) track.style.cursor = 'grab';
        });
        track.addEventListener('mousemove', e => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        });
        track.addEventListener('mouseleave', () => {
            isDragging = false;
            track.style.cursor = 'grab';
        });

        // Update fill bar on scroll
        function updateFill() {
            if (!fillBar) return;
            const max = track.scrollWidth - track.clientWidth;
            const pct = max > 0 ? (track.scrollLeft / max) * 75 + 25 : 25;
            fillBar.style.width = Math.min(pct, 100) + '%';
        }
        track.addEventListener('scroll', updateFill, { passive: true });
        updateFill();

        // Button controls
        const cardWidth = 403; // 400px + 3px gap
        if (prevBtn) prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
    }

    /* ---------- Contact form ---------- */
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            const btn = form.querySelector('.form-submit');
            const orig = btn.innerHTML;

            // Simple field validation
            let valid = true;
            form.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#e25a5a';
                    valid = false;
                    field.addEventListener('input', () => {
                        field.style.borderColor = '';
                    }, { once: true });
                }
            });
            if (!valid) return;

            // Simulate send
            btn.innerHTML = '<span>Sending…</span>';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Message sent';
                btn.style.background = '#2a7a4a';
                form.reset();
                setTimeout(() => {
                    btn.innerHTML = orig;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3500);
            }, 1200);
        });
    }

    /* ---------- Office panel parallax tilt ---------- */
    document.querySelectorAll('.office-panel').forEach(panel => {
        panel.addEventListener('mousemove', e => {
            const rect = panel.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
            panel.style.transform = `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg)`;
        });
        panel.addEventListener('mouseleave', () => {
            panel.style.transform = '';
        });
    });

    /* ---------- Smooth anchor links (offset for fixed nav) ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const id = anchor.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
                const top = target.getBoundingClientRect().top + window.scrollY - navH;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ---------- Form focus effects ---------- */
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        const group = input.closest('.form-group');
        if (!group) return;
        input.addEventListener('focus', () => group.classList.add('focused'));
        input.addEventListener('blur', () => group.classList.remove('focused'));
    });

})();