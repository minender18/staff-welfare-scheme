/* ========================================
   STAFF WELFARE SCHEME - FORMS JS
   ======================================== */

'use strict';

/* ---- VALIDATION HELPERS ---- */
const Validate = {
  required: v => v.trim() !== '',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: v => /^[\+]?[\d\s\-\(\)]{7,15}$/.test(v.trim()),
  minLength: (v, n) => v.trim().length >= n,
  maxLength: (v, n) => v.trim().length <= n,
  nin: v => /^\d{11}$/.test(v.replace(/\s/g, '')),
  fileType: (file, types) => types.includes(file.type),
  fileSize: (file, maxMB) => file.size <= maxMB * 1024 * 1024,
};

function showError(input, msg) {
  const group = input.closest('.form-group');
  if (!group) return;
  input.classList.add('error');
  input.classList.remove('success');
  let err = group.querySelector('.form-error');
  if (!err) { err = document.createElement('div'); err.className = 'form-error'; group.appendChild(err); }
  err.textContent = msg;
  err.classList.add('visible');
}

function showSuccess(input) {
  const group = input.closest('.form-group');
  if (!group) return;
  input.classList.remove('error');
  input.classList.add('success');
  const err = group.querySelector('.form-error');
  if (err) { err.textContent = ''; err.classList.remove('visible'); }
}

function clearValidation(input) {
  input.classList.remove('error', 'success');
  const group = input.closest('.form-group');
  if (group) {
    const err = group.querySelector('.form-error');
    if (err) { err.textContent = ''; err.classList.remove('visible'); }
  }
}

function validateField(input) {
  const val = input.value;
  const type = input.type;
  const required = input.hasAttribute('required') || input.dataset.required === 'true';

  if (required && !Validate.required(val)) {
    showError(input, input.dataset.errorRequired || 'This field is required.');
    return false;
  }
  if (val && type === 'email' && !Validate.email(val)) {
    showError(input, 'Please enter a valid email address.');
    return false;
  }
  if (val && input.dataset.type === 'phone' && !Validate.phone(val)) {
    showError(input, 'Please enter a valid phone number.');
    return false;
  }
  if (val && input.dataset.type === 'nin' && !Validate.nin(val)) {
    showError(input, 'NIN must be 11 digits.');
    return false;
  }
  if (val && input.dataset.minLength && !Validate.minLength(val, parseInt(input.dataset.minLength))) {
    showError(input, `Minimum ${input.dataset.minLength} characters required.`);
    return false;
  }
  if (required || val) showSuccess(input);
  return true;
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('input[required], select[required], textarea[required], input[data-required], select[data-required]').forEach(input => {
    if (!validateField(input)) valid = false;
  });
  return valid;
}

// Attach blur validation to all form controls
document.addEventListener('focusout', e => {
  const t = e.target;
  if (t.matches('input, select, textarea') && t.closest('form')) {
    validateField(t);
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches('input, select, textarea') && t.classList.contains('error')) {
    validateField(t);
  }
});

/* ---- MULTI-STEP FORM WIZARD ---- */
(function initWizard() {
  const form = document.getElementById('membership-form');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 4;

  function getStep(n) { return form.querySelector(`[data-step="${n}"]`); }
  function getIndicator(n) { return document.querySelector(`.step-indicator[data-step-num="${n}"]`); }

  function updateIndicators(step) {
    for (let i = 1; i <= totalSteps; i++) {
      const ind = getIndicator(i);
      if (!ind) continue;
      ind.classList.remove('active', 'completed');
      if (i < step) ind.classList.add('completed');
      else if (i === step) ind.classList.add('active');
      const circle = ind.querySelector('.step-circle');
      if (circle) {
        if (i < step) circle.innerHTML = '<i class="fa-solid fa-check" style="font-size:0.75rem"></i>';
        else circle.textContent = i;
      }
    }
  }

  function showStep(step) {
    for (let i = 1; i <= totalSteps; i++) {
      const s = getStep(i);
      if (s) s.classList.toggle('active', i === step);
    }
    updateIndicators(step);
    currentStep = step;
    window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    updateProgressBar(step);
  }

  function updateProgressBar(step) {
    const bar = document.getElementById('form-progress-bar');
    if (bar) bar.style.width = `${((step - 1) / (totalSteps - 1)) * 100}%`;
  }

  function validateCurrentStep() {
    const stepEl = getStep(currentStep);
    if (!stepEl) return true;
    let valid = true;
    stepEl.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
      if (!validateField(input)) valid = false;
    });
    // Checkbox required
    stepEl.querySelectorAll('input[type=checkbox][required]').forEach(cb => {
      if (!cb.checked) {
        showError(cb, 'You must check this box to proceed.');
        valid = false;
      } else showSuccess(cb);
    });
    return valid;
  }

  // Next buttons
  form.querySelectorAll('[data-next-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep === 3) {
        // No validation for contribution step's checkboxes before going to review
        generateReview();
      }
      if (validateCurrentStep()) {
        if (currentStep === 3) generateReview();
        if (currentStep < totalSteps) showStep(currentStep + 1);
      } else {
        if (window.SWS) SWS.toast.show('Please fix the errors', 'Fill in all required fields before proceeding.', 'error');
      }
    });
  });

  // Prev buttons
  form.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) showStep(currentStep - 1);
    });
  });

  // Generate review
  function generateReview() {
    const review = document.getElementById('form-review');
    if (!review) return;
    const data = {};
    form.querySelectorAll('input:not([type=file]):not([type=checkbox]), select, textarea').forEach(input => {
      if (input.name && input.value) data[input.name] = input.value;
    });
    const fields = {
      'Full Name': data.fullName || data.full_name || '—',
      'Date of Birth': data.dob || '—',
      'Gender': data.gender || '—',
      'Nationality': data.nationality || '—',
      'Phone': data.phone || '—',
      'Email': data.email || '—',
      'Employee ID': data.employeeId || data.employee_id || '—',
      'Department': data.department || '—',
      'Job Title': data.jobTitle || data.job_title || '—',
      'Employment Type': data.employmentType || data.employment_type || '—',
      'Date of Employment': data.employmentDate || data.employment_date || '—',
      'Contribution Level': data.contributionLevel || data.contribution_level || '—',
      'Bank Name': data.bankName || data.bank_name || '—',
      'Account Name': data.accountName || data.account_name || '—',
    };
    let html = '<div class="review-grid">';
    Object.entries(fields).forEach(([k, v]) => {
      html += `<div class="review-item"><dt>${k}</dt><dd>${v}</dd></div>`;
    });
    html += '</div>';
    review.innerHTML = html;
  }

  // Submit
  const submitBtn = document.getElementById('form-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Submitting...';
      setTimeout(() => {
        const ref = 'SWS-2026-' + Math.floor(10000 + Math.random() * 90000);
        const successEl = document.getElementById('form-success');
        const formEl = document.getElementById('form-card');
        if (successEl) {
          successEl.classList.remove('hidden');
          const refEl = successEl.querySelector('.success-ref');
          if (refEl) refEl.textContent = ref;
        }
        if (formEl) formEl.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);
    });
  }

  showStep(1);
})();

/* ---- CONTACT FORM ---- */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) {
      SWS.toast.show('Please fix the errors', 'Fill in all required fields.', 'error');
      return;
    }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner spinner-sm"></span> Sending...';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = 'Send Message';
      form.reset();
      form.querySelectorAll('.form-control').forEach(clearValidation);
      document.getElementById('contact-success')?.classList.remove('hidden');
      SWS.toast.show('Message Sent!', 'We will respond within 2 working days.', 'success');
    }, 1800);
  });
})();

/* ---- LOGIN FORM ---- */
(function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  // Password toggle
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', () => {
      const inputId = btn.dataset.togglePassword;
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner spinner-sm"></span> Logging in...';
    setTimeout(() => {
      // Simulate login - redirect to dashboard
      window.location.href = 'dashboard.html';
    }, 1500);
  });

  // Forgot password
  const forgotLink = document.getElementById('forgot-password-link');
  const forgotModal = document.getElementById('forgot-password-modal');
  if (forgotLink && forgotModal) {
    forgotLink.addEventListener('click', e => {
      e.preventDefault();
      SWS.modal.open('forgot-password-modal');
    });
  }
  const forgotForm = document.getElementById('forgot-password-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', e => {
      e.preventDefault();
      const emailInput = forgotForm.querySelector('input[type=email]');
      if (!validateField(emailInput)) return;
      const btn = forgotForm.querySelector('[type=submit]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner spinner-sm"></span> Sending...';
      setTimeout(() => {
        SWS.modal.close('forgot-password-modal');
        SWS.toast.show('Reset Link Sent', 'Check your email for password reset instructions.', 'success');
        btn.disabled = false;
        btn.textContent = 'Send Reset Link';
        forgotForm.reset();
      }, 1500);
    });
  }
})();

/* ---- FILE UPLOAD ---- */
(function initFileUploads() {
  document.querySelectorAll('.file-upload-area').forEach(area => {
    const input = area.querySelector('input[type=file]');
    const preview = area.nextElementSibling;

    area.addEventListener('click', () => input?.click());
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', e => {
      e.preventDefault();
      area.classList.remove('dragover');
      if (input && e.dataTransfer.files[0]) {
        handleFile(input, e.dataTransfer.files[0], area);
      }
    });

    input?.addEventListener('change', () => {
      if (input.files[0]) handleFile(input, input.files[0], area);
    });

    function handleFile(input, file, area) {
      const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowed.includes(file.type)) {
        SWS.toast.show('Invalid File', 'Please upload a JPG, PNG, or PDF file.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        SWS.toast.show('File Too Large', 'Maximum file size is 5MB.', 'error');
        return;
      }
      const previewEl = area.parentElement.querySelector('.file-preview');
      if (previewEl) {
        previewEl.innerHTML = `<i class="fa-solid fa-file text-primary"></i><span>${file.name}</span><span style="font-size:0.75rem;color:var(--text-light)">${(file.size/1024).toFixed(0)} KB</span><button type="button" class="remove-file" title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
        previewEl.classList.remove('hidden');
        previewEl.querySelector('.remove-file').addEventListener('click', () => {
          input.value = '';
          previewEl.classList.add('hidden');
        });
      }
    }
  });
})();
