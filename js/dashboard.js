/* ========================================
   STAFF WELFARE SCHEME - DASHBOARD JS
   ======================================== */

'use strict';

/* ---- SIDEBAR TOGGLE ---- */
(function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  const closeBtn = document.querySelector('.sidebar-close');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!sidebar) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle?.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);
})();

/* ---- ACTIVE SIDEBAR LINK ---- */
(function setActiveSidebarLink() {
  const page = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && href === page) item.classList.add('active');
  });
})();

/* ---- CONTRIBUTION BAR CHART ---- */
(function initBarChart() {
  const chart = document.getElementById('contribution-chart');
  if (!chart) return;
  const data = [
    { label: 'Nov', value: 8000 },
    { label: 'Dec', value: 8000 },
    { label: 'Jan', value: 8000 },
    { label: 'Feb', value: 8000 },
    { label: 'Mar', value: 8000 },
    { label: 'Apr', value: 8000 },
  ];
  const max = Math.max(...data.map(d => d.value)) * 1.2;
  chart.innerHTML = '';
  data.forEach(d => {
    const pct = (d.value / max) * 100;
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `
      <div class="bar-fill" style="height:${pct}%" data-value="GH₵${(d.value/1000).toFixed(0)}k"></div>
      <div class="bar-label">${d.label}</div>`;
    chart.appendChild(item);
  });
})();

/* ---- NOTIFICATIONS DROPDOWN ---- */
(function initNotifications() {
  const btn = document.querySelector('.notif-btn');
  const panel = document.querySelector('.notif-panel');
  if (!btn || !panel) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', () => panel.classList.remove('open'));
})();

/* ---- DASHBOARD TABS ---- */
(function initDashTabs() {
  document.querySelectorAll('[data-dash-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.dashTab;
      document.querySelectorAll('[data-dash-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('[data-dash-panel]').forEach(p => {
        p.classList.toggle('hidden', p.dataset.dashPanel !== target);
      });
    });
  });
})();

/* ---- SIMULATE STATS ANIMATION ---- */
(function animateDashStats() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseFloat(el.dataset.target || el.textContent.replace(/[^0-9.]/g, ''));
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (!target) return;
    const duration = 1500;
    const start = performance.now();
    function step(now) {
      const pct = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      el.textContent = prefix + Math.floor(target * eased).toLocaleString() + suffix;
      if (pct < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
})();
