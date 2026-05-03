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
      duration: 700,
      offset: 80,
      easing: 'ease-out-cubic',
      once: true,
      disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }

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

  // FAB inicia oculto (lo hará visible bindScroll() en app.js al pasar 200px)
  const fab = document.getElementById('fab-wsp');
  if (fab) {
    fab.style.transition = 'opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)';
    fab.style.opacity = '0';
    fab.style.pointerEvents = 'none';
    fab.style.transform = 'scale(0.7)';
  }
});

// Refresh AOS cuando window.load completa (asegura que las animaciones cuenten con el layout final)
window.addEventListener('load', () => {
  if (window.AOS) window.AOS.refresh();
});
