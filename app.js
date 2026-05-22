/* Lekke Logic — site interactions */

(function () {
  // Reveal on scroll
  const reveal = () => {
    const els = document.querySelectorAll('[data-reveal]:not(.in)');
    if (!('IntersectionObserver' in window)) {
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
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
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
      el.addEventListener('click', (e) => {
        if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
          e.preventDefault();
          window.Calendly.initPopupWidget({ url: URL });
        }
      });
    });
  };

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { reveal(); counters(); calendly(); });
  } else {
    reveal();
    counters();
    calendly();
  }
})();
