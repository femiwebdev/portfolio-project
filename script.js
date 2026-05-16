// Modern portfolio interactions

// ============================================================================
// DOM & Config
// ============================================================================

const DOM = {
  year: () => document.getElementById('year'),
  modal: () => document.getElementById('projModal'),
  modalTitle: () => document.getElementById('modalTitle'),
  modalDesc: () => document.getElementById('modalDesc'),
  modalLink: () => document.getElementById('modalLink'),
  closeModalBtn: () => document.getElementById('closeModal'),
  contactForm: () => document.getElementById('contactForm'),
  formStatus: () => document.getElementById('formStatus'),
  projects: () => document.querySelectorAll('.project'),
};

const CONFIG = {
  REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

// ============================================================================
// Year
// ============================================================================

function initYear() {
  const el = DOM.year();
  if (el) el.textContent = new Date().getFullYear();
}

// ============================================================================
// Smooth Scroll Navigation
// ============================================================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', handleSmoothScroll);
  });
}

function handleSmoothScroll(e) {
  const href = this.getAttribute('href');
  if (!href || href === '#') return;

  const target = document.querySelector(href);
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({
    behavior: CONFIG.REDUCED_MOTION ? 'auto' : 'smooth',
    block: 'start',
  });

  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
}

// ============================================================================
// Modal / Project Details
// ============================================================================

class Modal {
  constructor() {
    this.modal = DOM.modal();
    this.lastFocused = null;
    this.focusHandler = null;
  }

  open(data) {
    if (!this.modal) return;

    this.lastFocused = document.activeElement;
    DOM.modalTitle().textContent = data.title || 'Project';
    DOM.modalDesc().textContent = data.desc || '';

    const link = DOM.modalLink();
    if (data.url) {
      link.href = data.url;
      link.hidden = false;
    } else {
      link.hidden = true;
    }

    this.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    this.trapFocus();
    DOM.closeModalBtn()?.focus();
  }

  close() {
    if (!this.modal) return;
    this.modal.hidden = true;
    document.body.style.overflow = '';
    this.releaseFocus();
    this.lastFocused?.focus();
  }

  trapFocus() {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    this.focusHandler = (e) => {
      if (e.key !== 'Tab') return;

      const focusables = [
        ...this.modal.querySelectorAll(selectors.join(',')),
      ].filter((el) => el.offsetParent !== null);

      if (!focusables.length) return;

      const [first, last] = [focusables[0], focusables[focusables.length - 1]];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', this.focusHandler);
  }

  releaseFocus() {
    if (this.focusHandler) {
      window.removeEventListener('keydown', this.focusHandler);
      this.focusHandler = null;
    }
  }
}

function initModal() {
  const modal = new Modal();

  DOM.projects().forEach((card) => {
    const handleOpen = () => {
      try {
        const data = JSON.parse(card.getAttribute('data-proj') || '{}');
        modal.open(data);
      } catch (err) {
        console.warn('Invalid project data:', err);
        modal.open({});
      }
    };

    card.addEventListener('click', handleOpen);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    });
  });

  DOM.closeModalBtn()?.addEventListener('click', () => modal.close());
  modal.modal?.addEventListener('click', (e) => {
    if (e.target === modal.modal) modal.close();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.modal && !modal.modal.hidden) {
      modal.close();
    }
  });
}

// ============================================================================
// Contact Form
// ============================================================================

function initContactForm() {
  const form = DOM.contactForm();
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const result = validateForm(form);
    if (!result.valid) {
      setFormStatus(result.message, 'error');
      return;
    }

    setFormStatus('Message sent successfully!', 'success');
    form.reset();

    setTimeout(() => {
      setFormStatus('', 'default');
    }, 4000);
  });
}

function validateForm(form) {
  const name = form.name?.value.trim();
  const email = form.email?.value.trim();
  const message = form.message?.value.trim();

  if (!name || !email || !message) {
    return { valid: false, message: 'Please fill all fields.' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { valid: false, message: 'Please enter a valid email.' };
  }

  return { valid: true };
}

function setFormStatus(message, type = 'default') {
  const status = DOM.formStatus();
  if (!status) return;
  status.textContent = message;
  status.dataset.type = type;
}

// ============================================================================
// Scroll Reveal
// ============================================================================

function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.panel, .hero').forEach((el) => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.panel, .hero').forEach((el) => {
    observer.observe(el);
  });
}

// ============================================================================
// Initialization
// ============================================================================

function init() {
  initYear();
  initSmoothScroll();
  initModal();
  initContactForm();
  initScrollReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
