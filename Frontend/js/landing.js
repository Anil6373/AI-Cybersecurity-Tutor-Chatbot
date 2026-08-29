/* ═══════════════════════════════════════════════════════════
   CYBER TUTOR AI — Landing Page JS
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navigate to chat with topic pre-selected ──
  // Path is relative to index.html at root → Frontend/pages/chat.html
  window.openTopic = function (topic) {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.remove('hidden');
    setTimeout(() => {
      window.location.href = `Frontend/pages/chat.html?topic=${topic}`;
    }, 500);
  };

  // Keyboard support for topic cards
  document.querySelectorAll('.topic-card[role="button"]').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ── Intersection Observer for staggered reveals ──
  // Only pause cards that start below the fold
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.topic-card, .feature-item').forEach(el => {
    const rect = el.getBoundingClientRect();
    // Only pause if element is below the current viewport
    if (rect.top > window.innerHeight) {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    }
  });

  // ── Terminal typing animation ──
  const terminalBody = document.getElementById('terminalBody');
  if (terminalBody) {
    const lines = terminalBody.querySelectorAll('.t-line');
    lines.forEach((line, i) => {
      line.style.opacity = '0';
      line.style.transform = 'translateX(-6px)';
      line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => {
        line.style.opacity = '1';
        line.style.transform = 'none';
      }, 200 + i * 180);
    });
  }

  // ── Navbar scroll effect ──
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        navbar.style.borderBottomColor = 'var(--border-muted)';
      } else {
        navbar.style.borderBottomColor = 'var(--border-subtle)';
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

});
