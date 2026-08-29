/* ═══════════════════════════════════════════════════════════
   CYBER TUTOR AI — Theme Manager
   Runs immediately to prevent FOUC (Flash of Unstyled Content)
   ═══════════════════════════════════════════════════════════ */

(function () {
  const STORAGE_KEY = 'cyber-tutor-theme';
  const html = document.documentElement;

  // Apply saved theme before first paint to prevent flash
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  html.setAttribute('data-theme', saved);

  // ── Toast utility (global) ──
  window.showToast = function (msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show' + (type === 'error' ? ' error' : '');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      toast.className = 'toast';
    }, 3000);
  };

  // ── Toggle function (global) ──
  window.toggleTheme = function () {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);

    // Update icon(s) on page
    document.querySelectorAll('.theme-icon').forEach(icon => {
      icon.textContent = next === 'dark' ? '☽' : '☀';
    });

    showToast(next === 'dark' ? '🌙 Dark mode' : '☀ Light mode');
  };

  // ── Bind toggle buttons after DOM ready ──
  document.addEventListener('DOMContentLoaded', () => {
    const btns = document.querySelectorAll('[id="themeToggle"], .theme-toggle');
    btns.forEach(btn => btn.addEventListener('click', window.toggleTheme));

    // Set correct icon on load
    document.querySelectorAll('.theme-icon').forEach(icon => {
      icon.textContent = saved === 'dark' ? '☽' : '☀';
    });
  });
})();
