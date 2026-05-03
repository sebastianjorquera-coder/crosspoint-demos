/* =====================================================================
   app.js — LK Studio diagnóstico financiero
   Componente Alpine raíz: dashboard()
   - Lee data inline desde <script id="cliente-data" type="application/json">
   - Helpers de formato (CLP es-CL, %)
   - Helpers de ranking (top/bottom servicios)
   - Inicializa gauge Chart.js
   ===================================================================== */

function dashboard() {
  return {
    // Estado
    data: {},
    loaded: false,
    loadError: false,
    stickyVisible: false,
    gaugeChart: null,

    // ----- Init -----
    init() {
      try {
        const node = document.getElementById('cliente-data');
        if (!node) {
          throw new Error('No se encontró <script id="cliente-data">');
        }
        const raw = node.textContent.trim();
        this.data = JSON.parse(raw);
        this.loaded = true;
      } catch (err) {
        console.error('[LK demo] error parseando data inline:', err);
        this.loadError = true;
        return;
      }

      // Inicializar charts cuando Alpine termine de renderizar
      this.$nextTick(() => {
        setTimeout(() => {
          this.renderGauge();
        }, 60);
      });

      // Sticky header on scroll
      this.bindScroll();

      // Refresh AOS después de pintar
      this.$nextTick(() => {
        if (window.AOS) window.AOS.refresh();
      });
    },

    // ----- Sticky header visibility -----
    bindScroll() {
      const heroEl = document.getElementById('hero');
      const fab = document.getElementById('fab-wsp');

      const handler = () => {
        const y = window.scrollY || window.pageYOffset;
        // Threshold: pasada del hero (con floor 400px por si offsetHeight aún es 0)
        const heroHeight = heroEl ? heroEl.offsetHeight : 600;
        const threshold = Math.max(heroHeight - 80, 400);
        this.stickyVisible = y > threshold;

        // FAB WSP: ocultar en hero, mostrar después
        if (fab) {
          const showFab = y > 220;
          fab.style.opacity = showFab ? '1' : '0';
          fab.style.pointerEvents = showFab ? 'auto' : 'none';
          fab.style.transform = showFab ? 'scale(1)' : 'scale(0.7)';
        }
      };

      window.addEventListener('scroll', handler, { passive: true });

      // Disparo inicial diferido para que el layout esté listo
      requestAnimationFrame(() => {
        requestAnimationFrame(handler);
      });
    },

    // ----- Helpers de formato -----
    formatCLP(v) {
      if (v == null || isNaN(v)) return '$—';
      return '$' + Math.round(v).toLocaleString('es-CL').replace(/,/g, '.');
    },

    formatPCT(v, decimals = 1) {
      if (v == null || isNaN(v)) return '—';
      return (v * 100).toFixed(decimals).replace('.', ',') + '%';
    },

    formatValue(v, fmt) {
      if (fmt === 'CLP') return this.formatCLP(v);
      if (fmt === 'PCT') return this.formatPCT(v, 1);
      if (fmt === 'INT') return Math.round(v).toString();
      return String(v);
    },

    // ----- Servicios ranking -----
    topServicios() {
      const list = (this.data.servicios || []).slice();
      list.sort((a, b) => b.contribucion - a.contribucion);
      return list.slice(0, 3);
    },

    bottomServicios() {
      const list = (this.data.servicios || []).slice();
      list.sort((a, b) => a.contribucion - b.contribucion);
      return list.slice(0, 3);
    },

    // ----- Gauge Chart.js -----
    renderGauge() {
      if (!window.Chart) {
        console.warn('Chart.js no cargado');
        return;
      }
      const canvas = document.getElementById('gauge-pe');
      if (!canvas) return;

      const pct = this.data.estado_general?.pe_pct_alcanzado || 0;
      const champagne = '#C8A96E';
      const champagneDark = '#A6884F';
      const trackColor = 'rgba(14, 14, 16, 0.06)';

      // Color según pct
      let color = champagne;
      if (pct >= 1) color = '#3D7C5A'; // verde
      else if (pct >= 0.7) color = champagne;
      else if (pct >= 0.4) color = '#D4A028';
      else color = '#C0392B';

      const ctx = canvas.getContext('2d');
      this.gaugeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [pct, Math.max(0, 1 - pct)],
            backgroundColor: [color, trackColor],
            borderWidth: 0,
            cutout: '78%',
            circumference: 270,
            rotation: 225
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          animation: {
            animateRotate: true,
            animateScale: false,
            duration: 1400,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          }
        }
      });
    }
  };
}

/* Expose globally para Alpine */
window.dashboard = dashboard;
