/* =====================================================================
   animations.js — LK Studio diagnóstico financiero
   - Init AOS (Animate On Scroll)
   - Smooth scroll en anchors
   - FAB WhatsApp visibility init
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar AOS
  if (window.AOS) {
    window.AOS.init({
      duration: 600,
      offset: 80,
      easing: 'ease-out-cubic',
      once: true,
      disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }

  // Lucide icons: render inicial del DOM estático (los iconos dentro de x-for se
  // re-renderean desde app.js init() después del $nextTick de Alpine).
  if (window.lucide) window.lucide.createIcons();

  // Smooth scroll para anchors internos
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // FAB inicia oculto (lo hará visible bindScroll() en app.js al pasar 220px)
  const fab = document.getElementById('fab-wsp');
  if (fab) {
    fab.style.transition = 'opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)';
    fab.style.opacity = '0';
    fab.style.pointerEvents = 'none';
    fab.style.transform = 'scale(0.7)';
  }
});

// Último resort: refresh AOS y Lucide cuando window.load completa
window.addEventListener('load', () => {
  if (window.AOS) window.AOS.refresh();
  if (window.lucide) window.lucide.createIcons();
});
