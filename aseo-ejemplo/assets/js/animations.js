/* =========================================================================
   animations.js — Cross Point Consultores · template demo-web-pyme
   - Inicializa AOS (animaciones al hacer scroll)
   - Cuenta-up suave para KPIs hero
   - Comportamiento de scroll suave entre secciones
   ========================================================================= */

(function () {
  'use strict';

  // ---- AOS init ----
  document.addEventListener('DOMContentLoaded', function () {
    if (window.AOS) {
      AOS.init({
        duration: 600,
        easing: 'ease-out-cubic',
        once: true,           // anima solo la primera vez (no en scroll up)
        offset: 60,           // dispara 60px antes de ser visible
        delay: 0,
        anchorPlacement: 'top-bottom',
        disable: function () {
          // Desactivar en mobile chico para performance
          return window.innerWidth < 380;
        }
      });
    }

    // Refresh AOS cuando todo terminó de cargar (Alpine pintó)
    window.addEventListener('load', function () {
      setTimeout(() => { if (window.AOS) AOS.refresh(); }, 400);
    });
  });

  // ---- Count-up para el KPI hero (post Alpine render) ----
  // Funciona buscando el elemento con [data-countup] una vez Alpine pintó.
  // El template lo dispara solo si quieres efecto explícito; por defecto el
  // valor aparece directo (más confiable y se siente igual de premium).
  function countUp(el, target, duration = 1400, formatter = null) {
    const start = 0;
    const startTs = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTs) / duration);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = start + (target - start) * eased;
      el.textContent = formatter ? formatter(value) : Math.round(value);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  window.cpCountUp = countUp;

  // ---- Smooth scroll para anchors (polyfill ligero) ----
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---- Bandera de carga lista (para CSS opcional) ----
  document.addEventListener('alpine:initialized', function () {
    document.body.setAttribute('data-loaded', 'true');
  });
})();
