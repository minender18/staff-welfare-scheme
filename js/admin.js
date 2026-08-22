/* ========================================
   RMU Staff Welfare Fund - ADMIN JS
   ======================================== */

'use strict';

/* ---- SIDEBAR ---- */
(function initAdminSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  const closeBtn = document.querySelector('.sidebar-close');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!sidebar) return;
  const open = () => { sidebar.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { sidebar.classList.remove('open'); overlay?.classList.remove('open'); document.body.style.overflow = ''; };
  toggle?.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
})();

/* ---- APPROVE / REJECT ACTIONS ---- */
(function initActionBtns() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.action-btn-approve');
    if (btn) {
      if (!confirm('Approve this application? This action will notify the applicant.')) return;
      const row = btn.closest('tr');
      const statusCell = row?.querySelector('.badge');
      if (statusCell) {
        statusCell.className = 'badge badge-success';
        statusCell.innerHTML = '<i class="fa-solid fa-circle-check"></i> Approved';
      }
      btn.closest('.action-btns').innerHTML = '<span style="font-size:0.8125rem;color:var(--success);font-weight:600"><i class="fa-solid fa-check"></i> Approved</span>';
      if (window.RSWF) RSWF.toast.show('Application Approved', 'The applicant has been notified.', 'success');
    }
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.action-btn-reject');
    if (btn) {
      if (!confirm('Reject this application? Please ensure you have reviewed it.')) return;
      const row = btn.closest('tr');
      const statusCell = row?.querySelector('.badge');
      if (statusCell) {
        statusCell.className = 'badge badge-error';
        statusCell.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Rejected';
      }
      btn.closest('.action-btns').innerHTML = '<span style="font-size:0.8125rem;color:var(--error);font-weight:600"><i class="fa-solid fa-xmark"></i> Rejected</span>';
      if (window.RSWF) RSWF.toast.show('Application Rejected', 'The applicant has been notified.', 'warning');
    }
  });
})();

/* ---- TABLE SEARCH ---- */
(function initTableSearch() {
  document.querySelectorAll('[data-table-search]').forEach(input => {
    const tableId = input.dataset.tableSearch;
    const table = document.getElementById(tableId);
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });
})();

/* ---- PAGINATION ---- */
(function initPagination() {
  document.querySelectorAll('.pagination').forEach(pag => {
    pag.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        pag.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Simulate page change
        if (window.RSWF) RSWF.toast.show('Page ' + btn.dataset.page, 'Loading records...', 'info');
      });
    });
  });
})();

/* ---- EXPORT CSV (simulated) ---- */
function exportCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = table.querySelectorAll('tr');
  const csv = Array.from(rows).map(row =>
    Array.from(row.querySelectorAll('th, td'))
      .map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`)
      .join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'export.csv';
  a.click();
  URL.revokeObjectURL(url);
  if (window.RSWF) RSWF.toast.show('Export Complete', `${filename} has been downloaded.`, 'success');
}

document.querySelectorAll('[data-export-csv]').forEach(btn => {
  btn.addEventListener('click', () => exportCSV(btn.dataset.exportCsv, btn.dataset.exportFilename || 'data.csv'));
});

/* ---- ADMIN NAV ACTIVE STATE ---- */
(function setAdminActive() {
  const page = location.pathname.split('/').pop() || 'admin.html';
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && href === page) item.classList.add('active');
  });
})();

/* ---- ADMIN STATS ANIMATION ---- */
(function animateAdminStats() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseFloat(el.dataset.target || '0');
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (!target) return;
    const dur = 1500, start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.floor(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})();
