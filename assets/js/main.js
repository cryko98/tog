/* ============================================================
   MOG TOAD ($TOG) — main.js
   ------------------------------------------------------------
   EDIT ONLY THIS BLOCK when the links go live. Everything on the
   page (nav, hero, footer, finale) reads from here automatically.
   ============================================================ */
const CONFIG = {
  CA:        'GJ5LjVgKmxMPy55rN1e1RcWT7nNYg3CnZccmFKXopump',
  X_URL:     'https://x.com/togonsol',
  BUY_URL:   'https://pump.fun/coin/GJ5LjVgKmxMPy55rN1e1RcWT7nNYg3CnZccmFKXopump',
  // DexScreener resolves the mint address itself, so this link starts working
  // on its own as soon as the coin is live and the first trade is indexed.
  CHART_URL: 'https://dexscreener.com/solana/GJ5LjVgKmxMPy55rN1e1RcWT7nNYg3CnZccmFKXopump',
  TELEGRAM:  ''                               // optional, unused unless you add a link
};
/* ========================================================== */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* Observe with a safety net: if the browser never delivers an intersection
     (backgrounded tab on load, throttled rAF, no IO support) everything is
     finished off manually so nothing is left invisible or stuck at zero. */
  function watch(items, onEnter, opts = {}, bailMs = 3000) {
    if (!items.length) return;
    let any = false;
    const finish = () => items.forEach(el => { if (!el.dataset.done) onEnter(el, true); });
    if (!('IntersectionObserver' in window) || REDUCED) { finish(); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        any = true;
        io.unobserve(en.target);
        onEnter(en.target, false);
      });
    }, opts);
    items.forEach(el => io.observe(el));
    setTimeout(() => { if (!any) finish(); }, bailMs);
  }

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastT;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 2200);
  };

  /* ---------- wire CONFIG into the DOM ---------- */
  function applyConfig() {
    $$('[data-ca], #caVal').forEach(el => { el.textContent = CONFIG.CA; });

    const link = (sel, url, soonMsg) => $$(sel).forEach(a => {
      if (url) {
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.classList.remove('is-soon');
      } else if (a.getAttribute('href') === '#' || a.hasAttribute('data-social')) {
        a.classList.add('is-soon');
        a.addEventListener('click', e => { e.preventDefault(); toast(soonMsg); });
      }
    });

    link('[data-social="x"]', CONFIG.X_URL,     'X ACCOUNT DROPPING SOON');
    link('[data-chart]',      CONFIG.CHART_URL, 'CHART GOES LIVE AT LAUNCH');

    // "Buy" buttons fall back to the how-to-buy section instead of a dead link.
    $$('[data-buy]').forEach(a => {
      if (CONFIG.BUY_URL) { a.href = CONFIG.BUY_URL; a.target = '_blank'; a.rel = 'noopener'; }
      else if (a.getAttribute('href') === '#') a.href = '#buy';
    });
  }

  /* ---------- preloader ---------- */
  function preloader() {
    const el = $('#preloader'), bar = $('#preBar'), pct = $('#prePct'), txt = $('#preText');
    if (!el) return;
    const lines = ['DRAINING THE SWAMP', 'POLISHING THE VISOR', 'COUNTING THE TEARS', 'MOGGING THE CAT'];
    let p = 0, done = false, i = 0;
    const tick = setInterval(() => {
      p = Math.min(p + Math.random() * 16 + 5, done ? 100 : 92);
      bar.style.width = p + '%';
      pct.textContent = Math.round(p) + '%';
      txt.textContent = lines[Math.min(i++ >> 1, lines.length - 1)];
      if (p >= 100) {
        clearInterval(tick);
        el.classList.add('is-gone');
        document.body.classList.remove('is-locked');
        setTimeout(() => el.remove(), 800);
      }
    }, 130);
    const finish = () => { done = true; };
    if (document.readyState === 'complete') setTimeout(finish, 260);
    else window.addEventListener('load', () => setTimeout(finish, 260));
    setTimeout(finish, 4200); // hard stop so a slow font never traps anyone
  }
  document.body.classList.add('is-locked');

  /* ============================================================
     LOW-POLY MESH  —  the faceted look of the logo, animated.
     Jittered point grid -> two triangles per cell -> shaded by
     depth, a slow wave, and how close the cursor is.
     ============================================================ */
  function mesh(canvas, opts = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const CELL = opts.cell || 108;
    const AMP  = opts.amp || 20;
    const PAL  = opts.palette || [
      [18, 38, 224], [10, 18, 110], [46, 125, 20], [126, 222, 47], [6, 10, 60]
    ];
    let W = 0, H = 0, cols = 0, rows = 0, pts = [], tris = [], dpr = 1, raf = 0, t = 0;
    const mouse = { x: -9999, y: -9999 };

    function build() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      W = Math.max(r.width, 1); H = Math.max(r.height, 1);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(W / CELL) + 2;
      rows = Math.ceil(H / CELL) + 2;
      pts = [];
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          pts.push({
            bx: (x - 1) * CELL + (Math.random() - .5) * CELL * .62,
            by: (y - 1) * CELL + (Math.random() - .5) * CELL * .62,
            ph: Math.random() * Math.PI * 2,
            sp: .5 + Math.random() * .8,
            x: 0, y: 0
          });
        }
      }
      const at = (x, y) => y * (cols + 1) + x;
      tris = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const a = at(x, y), b = at(x + 1, y), c = at(x, y + 1), d = at(x + 1, y + 1);
          for (const tri of [[a, b, c], [b, d, c]]) {
            const depth = (x / cols) * .55 + (y / rows) * .45;
            const col = PAL[(Math.random() * PAL.length) | 0];
            tris.push({
              i: tri,
              r: col[0], g: col[1], b: col[2],
              depth,
              seed: Math.random() * Math.PI * 2
            });
          }
        }
      }
    }

    function frame() {
      t += .006;
      ctx.clearRect(0, 0, W, H);

      for (const p of pts) {
        let x = p.bx + Math.cos(t * p.sp + p.ph) * AMP;
        let y = p.by + Math.sin(t * p.sp * 1.3 + p.ph) * AMP;
        const dx = x - mouse.x, dy = y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 62500) {                       // 250px radius of influence
          const f = (1 - Math.sqrt(d2) / 250) * 46;
          const a = Math.atan2(dy, dx);
          x += Math.cos(a) * f; y += Math.sin(a) * f;
        }
        p.x = x; p.y = y;
      }

      for (const tr of tris) {
        const [i0, i1, i2] = tr.i;
        const p0 = pts[i0], p1 = pts[i1], p2 = pts[i2];
        const pulse = .5 + .5 * Math.sin(t * 1.6 + tr.seed);
        const a = (.10 + tr.depth * .22 + pulse * .13) * (opts.alpha || 1);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.closePath();
        ctx.fillStyle = `rgba(${tr.r},${tr.g},${tr.b},${a.toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(126,222,47,${(.020 + pulse * .035).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf) { raf = requestAnimationFrame(frame); } }
    function stop()  { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    build();
    if (REDUCED) { // draw one static frame and leave it alone
      frame(); stop();
    } else {
      new IntersectionObserver(es => es[0].isIntersecting ? start() : stop(), { threshold: 0 }).observe(canvas);
      window.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      }, { passive: true });
      window.addEventListener('mouseout', () => { mouse.x = mouse.y = -9999; });
    }

    // ResizeObserver rather than window.resize: the canvas is sized by its
    // container, which can change without the window ever resizing.
    let rt;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => { build(); if (REDUCED) frame(); }, 200);
    };
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(canvas);
    else window.addEventListener('resize', onResize);
  }

  /* ---------- custom cursor ---------- */
  function cursor() {
    const el = $('#cursor');
    if (!el || REDUCED || window.matchMedia('(pointer:coarse)').matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    window.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY; el.classList.add('on');
    }, { passive: true });
    const loop = () => {
      x += (tx - x) * .22; y += (ty - y) * .22;
      el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    const hot = 'a,button,summary,.ca,input[type="range"],.card,.lore__item,.tl__item';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hot)) el.classList.add('hot');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hot)) el.classList.remove('hot');
    });
  }

  /* ---------- nav / drawer / scroll rail ---------- */
  function chrome() {
    const nav = $('#nav'), bar = $('#scrollBar'), burger = $('#burger'), drawer = $('#drawer');

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-stuck', y > 40);
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const setDrawer = (open) => {
      burger.classList.toggle('on', open);
      drawer.classList.toggle('on', open);
      drawer.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    };
    burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('on')));
    $$('#drawer a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });
  }

  /* ---------- reveal on scroll ---------- */
  function reveals() {
    watch($$('.reveal'), (el, bailed) => {
      el.dataset.done = '1';
      if (!bailed) {
        const sibs = [...(el.parentElement?.children || [])].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 90 + 'ms';
      }
      el.classList.add('in');
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  }

  /* ---------- text scramble on the hero ---------- */
  function scramble() {
    const NBSP = '\u00A0';
    const CH = '▚▞▓▒░#@%&$*+=—';
    $$('[data-scramble]').forEach((el, idx) => {
      const final = el.dataset.scramble;
      if (REDUCED) { el.textContent = final; return; }
      let f = 0;
      const total = 26 + idx * 8;
      const run = () => {
        f++;
        let out = '';
        for (let i = 0; i < final.length; i++) {
          const start = i * 5 + idx * 6;
          out += f > start + 8 ? final[i]
               : f > start ? CH[(Math.random() * CH.length) | 0]
               : NBSP; // keeps the line box open — no layout shift mid-scramble
        }
        el.textContent = out;
        if (f < total) requestAnimationFrame(run); else { el.textContent = final; clearTimeout(bail); }
      };
      // rAF is paused in background tabs — make sure the word always lands.
      const bail = setTimeout(() => { f = total; el.textContent = final; }, 3400 + idx * 130);
      setTimeout(run, 900 + idx * 130);
    });
  }

  /* ---------- count-up numbers ---------- */
  function counters() {
    const fmt = n => n.toLocaleString('en-US');
    const items = $$('[data-count]');
    items.forEach(el => { if (+el.dataset.count === 0) el.textContent = '0' + (el.dataset.suffix || ''); });

    watch(items, (el, bailed) => {
      el.dataset.done = '1';
      const target = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (REDUCED || bailed || target === 0) { el.textContent = fmt(target) + suffix; return; }
      const dur = 1600, t0 = performance.now();
      let guard = setTimeout(() => { el.textContent = fmt(target) + suffix; }, dur + 1200);
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 4)))) + suffix;
        if (p < 1) requestAnimationFrame(step); else clearTimeout(guard);
      };
      requestAnimationFrame(step);
    }, { threshold: .4 });
  }

  /* ---------- copy the contract address ---------- */
  function copyCA() {
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.CA);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = CONFIG.CA; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch {}
        ta.remove();
      }
      toast('CONTRACT COPIED ✓');
    };
    const box = $('#caBox');
    if (box) {
      box.addEventListener('click', copy);
      box.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); }
      });
    }
    $$('[data-copy-ca]').forEach(b => b.addEventListener('click', copy));
  }

  /* ---------- hero toad: 3D tilt + parallax ---------- */
  function tilt() {
    const art = $('#heroArt'), toad = $('#heroToad');
    if (!art || !toad || REDUCED || window.matchMedia('(pointer:coarse)').matches) return;
    let rx = 0, ry = 0, tX = 0, tY = 0;
    art.addEventListener('mousemove', e => {
      const r = art.getBoundingClientRect();
      tY = ((e.clientX - r.left) / r.width - .5) * 26;
      tX = -((e.clientY - r.top) / r.height - .5) * 26;
    });
    art.addEventListener('mouseleave', () => { tX = 0; tY = 0; });
    const loop = () => {
      rx += (tX - rx) * .09; ry += (tY - ry) * .09;
      toad.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- card spotlight ---------- */
  function spotlight() {
    $$('.card').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---------- the mog meter ---------- */
  const VERDICTS = [
    [0,   'Beyond outmogged. The toad would not even look up.'],
    [15,  'Structurally unmoggable — in the wrong direction.'],
    [30,  'Some potential. Mostly potential energy.'],
    [45,  'Comfortably mid. The toad has already forgotten you.'],
    [60,  'Respectable. You could mog a room of three people.'],
    [72,  'Certified swamp-adjacent. The visor glints in your direction.'],
    [84,  'Dangerous levels of unbothered. Bystanders are shrinking.'],
    [93,  'You are mogging things that are not even present.'],
    [99,  'Only the toad sits here. Kindly step down.']
  ];
  function mogMeter() {
    const input = $('#meterInput'), fill = $('#meterFill'), val = $('#meterVal'), verdict = $('#meterVerdict');
    if (!input) return;
    const paint = () => {
      const v = +input.value;
      fill.style.width = v + '%';
      val.textContent = v;
      let text = VERDICTS[0][1];
      for (const [min, t] of VERDICTS) if (v >= min) text = t;
      if (verdict.textContent !== text) {
        verdict.style.opacity = '0';
        setTimeout(() => { verdict.textContent = text; verdict.style.opacity = '1'; }, 120);
      }
    };
    verdict.style.transition = 'opacity .2s';
    input.addEventListener('input', paint);
    paint();
  }

  /* ---------- PRESS TO MOG ---------- */
  function mogButton() {
    const btn = $('#mogBtn'), out = $('#mogCount');
    if (!btn) return;
    let n = +(localStorage.getItem('tog_mogs') || 0);
    out.textContent = n.toLocaleString('en-US');
    const COLORS = ['#ff2d95', '#ff7a18', '#ffe600', '#7ede2f', '#22e0ee', '#4b6bff'];

    btn.addEventListener('click', () => {
      n++;
      out.textContent = n.toLocaleString('en-US');
      try { localStorage.setItem('tog_mogs', n); } catch {}

      if (n === 25)  toast('25 MOGS — THE CAT IS UNEASY');
      if (n === 100) toast('100 MOGS — CERTIFIED SWAMP ROYALTY');
      if (n % 250 === 0 && n > 0) toast(n + ' MOGS. TOUCH SOME GRASS. GREEN GRASS.');

      if (REDUCED) return;
      document.body.classList.remove('mogging');
      void document.body.offsetWidth;
      document.body.classList.add('mogging');
      setTimeout(() => document.body.classList.remove('mogging'), 340);

      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < 22; i++) {
        const s = document.createElement('span');
        s.className = 'spark';
        s.style.background = COLORS[(Math.random() * COLORS.length) | 0];
        s.style.left = cx + 'px';
        s.style.top = cy + 'px';
        document.body.appendChild(s);
        const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 190;
        s.animate([
          { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
          { transform: `translate(${Math.cos(a) * d - 50}%,${Math.sin(a) * d + 220}%) scale(0) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 }
        ], { duration: 700 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' })
         .onfinish = () => s.remove();
        setTimeout(() => s.remove(), 1600); // belt and braces if WAAPI never fires
      }
    });
  }

  /* ---------- lightbox ---------- */
  function lightbox() {
    const lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap'), num = $('#lbNum');
    if (!lb) return;

    // Every meme on the page carries data-lb="<n>"; the caption comes from
    // whatever label sits next to it so the two can never drift apart.
    const sources = $$('[data-lb]');
    const seen = new Map();
    sources.forEach(el => {
      const n = el.dataset.lb;
      if (seen.has(n)) return;
      const holder = el.closest('.tile');
      const label = holder?.querySelector('span')?.textContent
                 || el.getAttribute('alt')
                 || 'MOG TOAD';
      const alt = (el.tagName === 'IMG' ? el : el.querySelector('img'))?.alt || label;
      seen.set(n, { n, label, alt });
    });
    const list = [...seen.values()].sort((a, b) => +a.n - +b.n);
    if (!list.length) return;

    let idx = 0, lastFocus = null;
    const pad = n => String(n).padStart(2, '0');

    const show = (i) => {
      idx = (i + list.length) % list.length;
      const it = list[idx];
      img.src = `/assets/img/memes/mog-${pad(it.n)}.jpg`;
      img.alt = it.alt;
      cap.textContent = it.label;
      num.textContent = `${idx + 1} / ${list.length}`;
      // warm the neighbours so arrowing through feels instant
      [idx + 1, idx - 1].forEach(j => {
        const nb = list[(j + list.length) % list.length];
        new Image().src = `/assets/img/memes/mog-${pad(nb.n)}.jpg`;
      });
    };

    const open = (n) => {
      const i = list.findIndex(it => it.n === String(n));
      lastFocus = document.activeElement;
      show(i < 0 ? 0 : i);
      lb.classList.add('on');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      $('#lbClose').focus();
    };
    const close = () => {
      lb.classList.remove('on');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      lastFocus?.focus();
    };

    document.addEventListener('click', e => {
      const t = e.target.closest('[data-lb]');
      if (!t) return;
      e.preventDefault();
      open(t.dataset.lb);
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => show(idx - 1));
    $('#lbNext').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); }); // backdrop only
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });

    // swipe on touch
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 55) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  /* ---------- meme wall: duplicate each row so the loop is seamless ---------- */
  function memeWall() {
    $$('.wall__track').forEach(track => {
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('[data-lb]').forEach(el => el.setAttribute('tabindex', '-1'));
      [...clone.children].forEach(c => track.appendChild(c));
    });
  }

  /* ---------- easter egg: click the toad five times ---------- */
  function eggs() {
    const toad = $('#heroToad');
    if (!toad) return;
    let hits = 0, timer;
    toad.style.cursor = 'pointer';
    toad.addEventListener('click', () => {
      hits++;
      clearTimeout(timer);
      timer = setTimeout(() => { hits = 0; }, 1400);
      if (hits >= 5) {
        hits = 0;
        document.documentElement.classList.toggle('rave');
        toast(document.documentElement.classList.contains('rave') ? 'FULL VISOR MODE' : 'BACK TO THE SWAMP');
      }
    });
  }

  /* ---------- anchors ---------- */
  function anchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 74, behavior: REDUCED ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- boot ---------- */
  applyConfig();
  preloader();
  chrome();
  reveals();
  scramble();
  counters();
  copyCA();
  tilt();
  spotlight();
  mogMeter();
  mogButton();
  memeWall();
  lightbox();
  eggs();
  anchors();
  cursor();
  mesh($('#mesh'),  { cell: 112, amp: 22, alpha: 1 });
  mesh($('#mesh2'), { cell: 140, amp: 16, alpha: .8 });
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
