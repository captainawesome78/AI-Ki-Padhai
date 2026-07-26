document.addEventListener('DOMContentLoaded', () => {
    // Initialize Mark as Complete buttons
    const buttons = document.querySelectorAll('.mark-complete');

    buttons.forEach(btn => {
        const topicId = btn.getAttribute('data-id');
        const statusText = btn.querySelector('.status-text');

        // Check saved state
        if (localStorage.getItem(topicId) === 'completed') {
            markAsCompleted(btn, statusText);
        }

        btn.addEventListener('click', () => {
            if (localStorage.getItem(topicId) === 'completed') {
                // Toggle off
                localStorage.removeItem(topicId);
                markAsIncomplete(btn, statusText);
            } else {
                // Toggle on
                localStorage.setItem(topicId, 'completed');
                markAsCompleted(btn, statusText);
                confettiEffect(btn);
            }
        });
    });
});

function markAsCompleted(btn, textSpan) {
    btn.style.background = 'var(--secondary)';
    btn.style.borderColor = 'var(--secondary)';
    btn.style.color = 'white';
    textSpan.textContent = 'Completed ✓';
}

function markAsIncomplete(btn, textSpan) {
    btn.style.background = 'transparent';
    btn.style.borderColor = 'var(--primary)';
    btn.style.color = 'var(--primary)';
    textSpan.textContent = 'Mark Complete';
}

function confettiEffect(element) {
    // Simple visual feedback animation
    element.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
}

/* ============================================================
   SCROLL ANIMATIONS
   Only acts on elements that opt in (.reveal / .scroll-progress /
   [data-count]). Pages without those classes are unaffected.
   Fails safe: if IntersectionObserver is missing or the user
   prefers reduced motion, everything is simply shown.
   ============================================================ */
(function () {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var supported = 'IntersectionObserver' in window;

    document.addEventListener('DOMContentLoaded', function () {
        var revealables = document.querySelectorAll('.reveal');

        // If we can't animate safely, reveal everything and stop.
        if (reduced || !supported) {
            document.documentElement.classList.remove('js-anim');
            for (var i = 0; i < revealables.length; i++) revealables[i].classList.add('in');
            runCounters(document.querySelectorAll('[data-count]'));
            return;
        }

        // ---- Reveal on scroll ----
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('in');
                if (e.target.hasAttribute('data-count')) runCounters([e.target]);
                var nested = e.target.querySelectorAll ? e.target.querySelectorAll('[data-count]') : [];
                if (nested.length) runCounters(nested);
                io.unobserve(e.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        for (var j = 0; j < revealables.length; j++) io.observe(revealables[j]);

        // Safety net: anything still hidden after 3s gets shown
        setTimeout(function () {
            var stuck = document.querySelectorAll('.reveal:not(.in)');
            for (var k = 0; k < stuck.length; k++) {
                var r = stuck[k].getBoundingClientRect();
                if (r.top < window.innerHeight) stuck[k].classList.add('in');
            }
        }, 3000);

        // ---- Scroll progress bar + header state ----
        var bar = document.querySelector('.scroll-progress');
        var head = document.querySelector('header');
        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                var st = window.pageYOffset || document.documentElement.scrollTop;
                if (bar) {
                    var h = document.documentElement.scrollHeight - window.innerHeight;
                    bar.style.width = (h > 0 ? Math.min(100, (st / h) * 100) : 0) + '%';
                }
                if (head) head.classList.toggle('scrolled', st > 10);
                ticking = false;
            });
        }
        if (bar || head) {
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
    });

    // ---- Animated number count-up ----
    function runCounters(nodes) {
        Array.prototype.forEach.call(nodes, function (el) {
            if (el.dataset.counted) return;
            el.dataset.counted = '1';
            var target = parseFloat(el.getAttribute('data-count')) || 0;
            var suffix = el.getAttribute('data-suffix') || '';
            if (reduced || !supported) { el.textContent = target + suffix; return; }
            var dur = 1100, t0 = null;
            function tick(ts) {
                if (!t0) t0 = ts;
                var p = Math.min((ts - t0) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }
})();

/* ============================================================
   HERO: mobile menu, sticky bar, particle canvas
   All guarded by element existence, so other pages ignore this.
   ============================================================ */
(function () {
    document.addEventListener('DOMContentLoaded', function () {

        /* ---- Mobile menu toggle ---- */
        var toggle = document.getElementById('navToggle');
        var menu = document.getElementById('mobileMenu');
        var iMenu = document.getElementById('iconMenu');
        var iClose = document.getElementById('iconClose');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                var open = menu.classList.toggle('open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (iMenu) iMenu.style.display = open ? 'none' : '';
                if (iClose) iClose.style.display = open ? '' : 'none';
            });
            // close when a link is tapped
            menu.addEventListener('click', function (e) {
                if (e.target.closest('a')) {
                    menu.classList.remove('open');
                    toggle.setAttribute('aria-expanded', 'false');
                    if (iMenu) iMenu.style.display = '';
                    if (iClose) iClose.style.display = 'none';
                }
            });
        }

        /* ---- Sticky bar appears once hero is scrolled past ---- */
        var bar = document.getElementById('stickyBar');
        var hero = document.querySelector('.hero-screen');
        if (bar && hero) {
            var tick = false;
            var onScroll = function () {
                if (tick) return;
                tick = true;
                window.requestAnimationFrame(function () {
                    var past = (window.pageYOffset || document.documentElement.scrollTop) > (hero.offsetHeight - 80);
                    bar.classList.toggle('show', past);
                    tick = false;
                });
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

        /* ---- Particle network canvas ---- */
        var cv = document.getElementById('heroCanvas');
        if (!cv || !cv.getContext) return;
        var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var ctx = cv.getContext('2d');
        var parts = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), raf = null;

        function size() {
            w = cv.offsetWidth; h = cv.offsetHeight;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // particle count scales with area, capped for low-end devices
            var target = Math.max(18, Math.min(60, Math.round((w * h) / 26000)));
            parts = [];
            for (var i = 0; i < target; i++) {
                parts.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.22,
                    vy: (Math.random() - 0.5) * 0.22,
                    r: 1 + Math.random() * 1.7
                });
            }
        }

        function frame() {
            ctx.clearRect(0, 0, w, h);
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                for (var j = i + 1; j < parts.length; j++) {
                    var q = parts[j], dx = p.x - q.x, dy = p.y - q.y;
                    var d2 = dx * dx + dy * dy;
                    if (d2 < 16900) {                      // 130px
                        ctx.strokeStyle = 'rgba(255,255,255,' + (0.13 * (1 - d2 / 16900)) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                    }
                }
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.284); ctx.fill();
            }
            raf = requestAnimationFrame(frame);
        }

        function start() { if (!raf) raf = requestAnimationFrame(frame); }
        function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

        size();
        if (reduced) {
            frame(); stop();                                // draw one static frame only
        } else {
            start();
            // pause when tab hidden or hero scrolled out — saves battery
            document.addEventListener('visibilitychange', function () {
                document.hidden ? stop() : start();
            });
            if ('IntersectionObserver' in window && hero) {
                new IntersectionObserver(function (es) {
                    es[0].isIntersecting ? start() : stop();
                }, { threshold: 0 }).observe(hero);
            }
        }

        var rt;
        window.addEventListener('resize', function () {
            clearTimeout(rt);
            rt = setTimeout(function () { size(); if (reduced) frame(); }, 200);
        });
    });
})();
