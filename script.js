// script.js - enhanced interactions

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth scroll (respects reduced motion)
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start'
      });
      target.focus?.({ preventScroll: true });
    }
  });
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const THEME_KEY = 'pref-theme';

function applyTheme(mode) {
  root.dataset.theme = mode;
  themeToggle.setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
  themeToggle.textContent = mode === 'light' ? 'Dark' : 'Light';
}

const saved = localStorage.getItem(THEME_KEY);
applyTheme(saved || 'dark');

themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

// Modal logic
const modal = document.getElementById('projModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalLink = document.getElementById('modalLink');
const closeModalBtn = document.getElementById('closeModal');
let lastFocused;

function openModal(data) {
  lastFocused = document.activeElement;
  modalTitle.textContent = data.title || 'Project';
  modalDesc.textContent = data.desc || '';
  if (data.url) {
    modalLink.href = data.url;
    modalLink.hidden = false;
  } else {
    modalLink.hidden = true;
  }
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
  closeModalBtn.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  releaseFocus();
  lastFocused?.focus();
}

document.querySelectorAll('.project').forEach(p => {
  p.addEventListener('click', () => {
    try {
      const data = JSON.parse(p.getAttribute('data-proj') || '{}');
      openModal(data);
    } catch {
      openModal({});
    }
  });
});

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// Focus trap
let focusHandler;
function trapFocus(container) {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  focusHandler = e => {
    if (e.key !== 'Tab') return;
    const focusables = [...container.querySelectorAll(selectors.join(','))].filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };
  window.addEventListener('keydown', focusHandler);
}

function releaseFocus() {
  if (focusHandler) window.removeEventListener('keydown', focusHandler);
}

// Contact form simulation
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form?.addEventListener('submit', e => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    status.textContent = 'Please fill all fields.';
    status.style.color = 'var(--error, #c00)';
    return;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    status.textContent = 'Please enter a valid email.';
    status.style.color = 'var(--error, #c00)';
    return;
  }
  status.style.color = 'inherit';
  status.textContent = 'Message sent (simulation).';
  form.reset();
});

// Reveal on scroll
const revealTargets = document.querySelectorAll('.panel, .hero');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('visible');
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => io.observe(el));
} else {
  // Fallback
  revealTargets.forEach(el => el.classList.add('visible'));
}
