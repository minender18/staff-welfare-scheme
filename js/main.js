/* ========================================
   STAFF WELFARE SCHEME - MAIN JS
   ======================================== */

'use strict';

/* ---- HAMBURGER / MOBILE NAV ---- */
(function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  const overlay   = document.querySelector('.nav-overlay');
  if (!hamburger) return;

  function openNav() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeNav() : openNav();
  });
  overlay.addEventListener('click', closeNav);
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', closeNav));
})();

/* ---- STICKY NAV SHADOW ---- */
(function initStickyNav() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
})();

/* ---- ACTIVE NAV LINK ---- */
(function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- ANIMATED COUNTER ---- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const duration = 2000;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = (target * eased).toFixed(decimals);
    el.textContent = prefix + (decimals === 0 ? Math.floor(value).toLocaleString() : parseFloat(value).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---- INTERSECTION OBSERVER (reveal + counters) ---- */
(function initObservers() {
  // Reveal animations
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    revealEls.forEach(el => revealObs.observe(el));
  }

  // Counter animations
  const counterEls = document.querySelectorAll('[data-counter]');
  if (counterEls.length) {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => counterObs.observe(el));
  }
})();

/* ---- ACCORDION ---- */
(function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const isOpen = header.classList.contains('open');

      // Close others in same group
      const group = item.closest('[data-accordion-group]');
      if (group) {
        group.querySelectorAll('.accordion-header.open').forEach(h => {
          if (h !== header) {
            h.classList.remove('open');
            h.closest('.accordion-item').classList.remove('open');
            h.closest('.accordion-item').querySelector('.accordion-body').classList.remove('open');
          }
        });
      }

      if (isOpen) {
        header.classList.remove('open');
        item.classList.remove('open');
        body.classList.remove('open');
      } else {
        header.classList.add('open');
        item.classList.add('open');
        body.classList.add('open');
      }
    });
  });
})();

/* ---- TOAST SYSTEM ---- */
window.SWS = window.SWS || {};
SWS.toast = (function() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  function show(title, message, type = 'info', duration = 4000) {
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>`;
    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => remove(toast));
    setTimeout(() => remove(toast), duration);
    return toast;
  }

  function remove(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 300);
  }

  return { show };
})();

/* ---- MODAL SYSTEM ---- */
SWS.modal = (function() {
  function open(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function close(id) {
    const m = id ? document.getElementById(id) : document.querySelector('.modal-overlay.open');
    if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  }

  document.addEventListener('click', e => {
    if (e.target.matches('[data-modal-open]')) open(e.target.dataset.modalOpen);
    if (e.target.matches('[data-modal-close]') || e.target.matches('.modal-overlay')) close();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  return { open, close };
})();

/* ---- TABS ---- */
(function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach(tabsEl => {
    const btns = tabsEl.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('[data-tab-panel]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        panels.forEach(p => {
          p.classList.toggle('hidden', p.dataset.tabPanel !== target);
        });
        // Filter cards by category (cards carry data-category directly)
        const cards = document.querySelectorAll('[data-category]');
        if (cards.length) {
          cards.forEach(c => {
            const show = target === 'all' || c.dataset.category === target;
            c.classList.toggle('hidden', !show);
          });
          // Also hide section headers for FAQ categories
          document.querySelectorAll('[data-category]').forEach(c => {
            if (c.tagName === 'H3') c.classList.toggle('hidden', target !== 'all' && c.dataset.category !== target);
          });
        }
      });
    });
  });
})();

/* ---- FAQ SEARCH ---- */
(function initFaqSearch() {
  const searchInput = document.getElementById('faq-search');
  if (!searchInput) return;
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.accordion-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.classList.toggle('hidden', q && !text.includes(q));
    });
    // Show no results message
    const noResults = document.getElementById('faq-no-results');
    if (noResults) {
      const visibleCount = document.querySelectorAll('.accordion-item:not(.hidden)').length;
      noResults.classList.toggle('hidden', visibleCount > 0);
    }
  });
})();

/* ---- DOCUMENT SEARCH ---- */
(function initDocSearch() {
  const searchInput = document.getElementById('doc-search');
  if (!searchInput) return;
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.doc-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.classList.toggle('hidden', q && !text.includes(q));
    });
  });
})();

/* ---- TESTIMONIAL CAROUSEL ---- */
(function initTestimonialCarousel() {
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.testimonial-card');
  if (slides.length <= 1) return;
  let current = 0;

  function goTo(index) {
    slides.forEach((s, i) => {
      s.style.display = i === index ? 'block' : 'none';
    });
    current = index;
  }

  // Auto-play on mobile (hidden behind CSS at desktop)
  const auto = setInterval(() => goTo((current + 1) % slides.length), 5000);

  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  if (prev) prev.addEventListener('click', () => { clearInterval(auto); goTo((current - 1 + slides.length) % slides.length); });
  if (next) next.addEventListener('click', () => { clearInterval(auto); goTo((current + 1) % slides.length); });
})();

/* ---- SCROLL TO TOP ---- */
(function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
