/* Lekke Logic — site interactions (v2). See DESIGN.md for the motion rules.
   Works without GSAP; when window.gsap is present the hero lock-up and curtain use it. */

(function () {
  const doc = document.documentElement;
  doc.classList.remove('no-js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;

  // Skip link: first stop in the tab order, targets <main> (or the first section).
  const skipLink = () => {
    if (document.querySelector('.skip-link')) return;
    const target = document.querySelector('main') || document.querySelector('.nav ~ section, .nav ~ article');
    if (!target) return;
    if (!target.id) target.id = 'main';
    target.setAttribute('tabindex', '-1');
    const a = document.createElement('a');
    a.className = 'skip-link';
    a.href = '#' + target.id;
    a.textContent = 'Skip to content';
    document.body.prepend(a);
  };

  // Brand link: its name comes from the visible wordmark; the monogram is decorative.
  const brand = () => {
    document.querySelectorAll('a.brand').forEach((a) => {
      a.removeAttribute('aria-label');
      const m = a.querySelector('.brand-mark');
      if (m) m.setAttribute('aria-hidden', 'true');
    });
  };

  // Mark the current page in the nav with aria-current.
  const currentPage = () => {
    const here = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
    document.querySelectorAll('.nav-links a, .menu-sheet a').forEach((a) => {
      const href = (a.getAttribute('href') || '').split('#')[0].replace(/^\//, '').replace(/\.html$/, '');
      const match = href === here || (here === 'index' && href === '') || (a.classList.contains('current'));
      if (match) a.setAttribute('aria-current', 'page');
    });
  };

  // Mobile menu: a full-screen sheet built from the existing nav links.
  const mobileMenu = () => {
    const nav = document.querySelector('.nav');
    const links = nav && nav.querySelector('.nav-links');
    if (!links) return;
    const inner = nav.querySelector('.nav-inner');
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'menu-sheet');
    btn.innerHTML = '<span class="bars" aria-hidden="true"></span><span class="menu-label">Menu</span>';
    inner.appendChild(btn);

    const sheet = document.createElement('div');
    sheet.className = 'menu-sheet';
    sheet.id = 'menu-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Site menu');
    const items = [...links.querySelectorAll('a')].map((a) =>
      `<li><a href="${a.getAttribute('href')}">${a.textContent.trim()}</a></li>`).join('');
    sheet.innerHTML = `<nav aria-label="Mobile"><ol>${items}<li><a href="/contact.html">Contact</a></li></ol></nav>
      <div class="menu-foot"><a class="btn btn-accent" href="/contact.html">Book a call</a>
      <a class="mail" href="mailto:hello@lekkelogic.co.za">hello@lekkelogic.co.za</a></div>`;
    document.body.appendChild(sheet);

    const label = btn.querySelector('.menu-label');
    const setOpen = (open) => {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Close' : 'Menu';
      sheet.toggleAttribute('inert', !open);
      if (open) sheet.querySelector('a').focus();
    };
    sheet.setAttribute('inert', '');
    btn.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open')));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setOpen(false); btn.focus(); }
    });
    // Keep keyboard focus inside the open sheet (button + sheet links).
    sheet.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = [...sheet.querySelectorAll('a')];
      if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); btn.focus(); }
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  };

  // Reveal on scroll
  const reveal = () => {
    const els = document.querySelectorAll('[data-reveal]:not(.in)');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  };

  // Animated counters
  const counters = () => {
    const nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;
    const fmt = (n, suffix, prefix) => `${prefix || ''}${Math.round(n).toLocaleString()}${suffix || ''}`;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        if (reduce) { el.textContent = fmt(target, suffix, prefix); io.unobserve(el); return; }
        const dur = parseInt(el.dataset.duration || '1400', 10);
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased, suffix, prefix);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    nodes.forEach((n) => io.observe(n));
  };

  // Calendly — open the scheduling popup from any "Book a call" button.
  // Falls back to the link's href (contact.html) if Calendly hasn't loaded.
  const calendly = () => {
    const URL = 'https://calendly.com/nqobile-lekkelogic/30min';
    const isBookCall = (el) => {
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      return /^book a (call|[a-z]+ call)$/.test(txt);
    };
    document.querySelectorAll('a, button').forEach((el) => {
      if (!isBookCall(el)) return;
      el.setAttribute('aria-haspopup', 'dialog');
      el.dataset.noCurtain = '';
      el.addEventListener('click', (e) => {
        if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
          e.preventDefault();
          document.body.classList.remove('menu-open');
          window.Calendly.initPopupWidget({ url: URL });
        }
      });
    });
  };

  // Shrinking sticky header, driven by a sentinel instead of a scroll listener.
  const stickyHeader = () => {
    const nav = document.querySelector('.nav');
    if (!nav || !('IntersectionObserver' in window)) return;
    const s = document.createElement('div');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;';
    document.body.prepend(s);
    new IntersectionObserver(([e]) => nav.classList.toggle('nav-shrunk', !e.isIntersecting)).observe(s);
  };

  // Page transition: ink + orange panels close on exit, open on arrival.
  const curtain = () => {
    if (reduce || !gsap) return;
    const c = document.createElement('div');
    c.className = 'curtain';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<i></i><i></i>';
    document.body.appendChild(c);
    const panes = c.querySelectorAll('i');
    let arrived = false;
    try { arrived = sessionStorage.getItem('ll-curtain') === '1'; sessionStorage.removeItem('ll-curtain'); } catch (e) {}
    if (arrived) {
      gsap.set(panes, { scaleY: 1, transformOrigin: (i) => (i ? 'bottom' : 'top') });
      gsap.to(panes, { scaleY: 0, duration: 0.7, ease: 'power4.inOut', stagger: 0.06, delay: 0.05 });
    }
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if ('noCurtain' in a.dataset || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.protocol.indexOf('http') !== 0) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      try { sessionStorage.setItem('ll-curtain', '1'); } catch (err) {}
      gsap.set(panes, { transformOrigin: (i) => (i ? 'top' : 'bottom') });
      gsap.to(panes, { scaleY: 1, duration: 0.55, ease: 'power4.inOut', stagger: 0.06, onComplete: () => { location.href = url.href; } });
    });
    // Restore from bfcache with the curtain open.
    window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(panes, { scaleY: 0 }); });
  };

  // Hero lock-up: the team L and the machine L slide in on grid lines and lock.
  // One driver (pointer + time) moves both pieces in grid steps; idle drift while in view.
  const lockup = () => {
    const stage = document.querySelector('[data-lockup]');
    if (!stage) return;
    const team = stage.querySelector('.lk-team');
    const machine = stage.querySelector('.lk-machine');
    if (reduce || !gsap) { stage.classList.add('is-locked'); return; }

    // The pieces are SVG groups in a 12-unit viewBox, so one grid step is 1 user unit.
    const step = () => 1;
    gsap.set(team, { x: () => -step() * 4, opacity: 0 });
    gsap.set(machine, { y: () => -step() * 4, opacity: 0 });
    const tl = gsap.timeline({ delay: 0.25, onComplete: () => { stage.classList.add('is-locked'); idle(); } });
    tl.to(team, { x: 0, opacity: 1, duration: 0.9, ease: 'expo.out' })
      .to(machine, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, '-=0.6');

    // Pointer nudges the machine L by up to half a grid step, quantised so it "snaps".
    const qx = gsap.quickTo(machine, 'x', { duration: 0.45, ease: 'power3.out' });
    const qy = gsap.quickTo(machine, 'y', { duration: 0.45, ease: 'power3.out' });
    let drift = null;
    const idle = () => {
      drift = gsap.timeline({ repeat: -1, repeatDelay: 2.4, paused: true })
        .to(machine, { x: () => step() * 0.5, duration: 0.5, ease: 'power4.out' })
        .to(machine, { x: 0, duration: 0.5, ease: 'power4.out', delay: 1.2 });
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? drift.play() : drift.pause()));
      io.observe(stage);
      stage.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        drift.pause();
        const r = stage.getBoundingClientRect();
        const s = step() / 2;
        const nx = Math.round(((e.clientX - r.left) / r.width - 0.5) * 2) * s;
        const ny = Math.round(((e.clientY - r.top) / r.height - 0.5) * 2) * s;
        qx(nx); qy(ny);
      });
      stage.addEventListener('pointerleave', () => { qx(0); qy(0); drift.restart(true); });
    };
  };

  // Services index: on fine pointers the row's art follows the hovered row.
  const serviceIndex = () => {
    const list = document.querySelector('[data-svc-index]');
    if (!list) return;
    const frame = list.querySelector('.si-frame');
    const img = frame && frame.querySelector('img');
    if (!frame || !img) return;
    const show = (row) => {
      const src = row.dataset.art;
      if (!src) return;
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
      const lr = list.getBoundingClientRect();
      const rr = row.getBoundingClientRect();
      const y = rr.top - lr.top + rr.height / 2 - frame.offsetHeight / 2;
      frame.style.translate = `0 ${Math.round(Math.max(0, Math.min(y, lr.height - frame.offsetHeight)))}px`;
      list.classList.add('si-active');
    };
    list.querySelectorAll('.si-row').forEach((row) => {
      row.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(row); });
      row.addEventListener('focus', () => show(row));
    });
    list.addEventListener('pointerleave', () => list.classList.remove('si-active'));
    list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) list.classList.remove('si-active'); });
  };


  // Story: the chapter crossing the middle of the viewport drives the pinned frame and ticks.
  const story = () => {
    const root = document.querySelector('[data-story]');
    if (!root || !('IntersectionObserver' in window)) { if (root) root.classList.add('is-static'); return; }
    const imgs = root.querySelectorAll('.story-frame img');
    const ticks = root.querySelectorAll('.story-ticks li');
    const chapters = root.querySelectorAll('.chapter');
    let current = '1';
    const set = (ch) => {
      if (ch === current) return;
      imgs.forEach((im) => {
        im.classList.remove('was-on');
        if (im.dataset.ch === current) im.classList.add('was-on');
        im.classList.toggle('is-on', im.dataset.ch === ch);
      });
      ticks.forEach((t, i) => t.classList.toggle('is-on', String(i + 1) <= ch));
      chapters.forEach((c) => c.classList.toggle('is-on', c.dataset.ch === ch));
      current = ch;
    };
    chapters[0].classList.add('is-on');
    // Preload the other frames once the section is near so the wipe never shows a blank.
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      imgs.forEach((im) => { im.loading = 'eager'; });
      o.disconnect();
    }, { rootMargin: '600px 0px' }).observe(root);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) set(e.target.dataset.ch); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    chapters.forEach((c) => io.observe(c));
  };

  const init = () => {
    skipLink();
    brand();
    mobileMenu();
    currentPage();
    reveal();
    counters();
    calendly();
    stickyHeader();
    curtain();
    lockup();
    serviceIndex();
    story();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
