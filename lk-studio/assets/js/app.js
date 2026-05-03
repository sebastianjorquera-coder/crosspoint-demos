/* =========================================================================
   app.js — Cross Point Consultores · template demo-web-pyme
   Componente Alpine raíz: dashboard()
   - Carga data/cliente.json
   - Define helpers (formatValue, semaforoXxx, trendArrow, etc.)
   - Inicializa Chart.js charts
   ========================================================================= */

function dashboard() {
  return {
    // ====== Estado ======
    data: {},
    loaded: false,
    loadError: false,
    tab: 'servicios',

    // ====== Init ======
    async init() {
      try {
        const res = await fetch('./data/cliente.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.data = await res.json();
        this.loaded = true;

        // Validaciones suaves
        this.validarDatos();

        // Esperar a que el DOM termine de renderizar Alpine y AOS
        this.$nextTick(() => {
          // Inicializar charts después que el DOM esté pintado
          setTimeout(() => {
            this.initCharts();
            // Refrescar AOS para detectar elementos x-show
            if (window.AOS) window.AOS.refresh();
          }, 100);
        });
      } catch (err) {
        console.error('Error cargando cliente.json:', err);
        this.loadError = true;
      }
    },

    validarDatos() {
      const issues = [];
      if (!this.data.kpis || this.data.kpis.length !== 4) {
        issues.push('kpis debe tener exactamente 4 items');
      }
      if (!this.data.recomendaciones || this.data.recomendaciones.length < 3) {
        issues.push('recomendaciones debe tener 3-5 items');
      }
      if (this.data.simulador_contratacion?.escenarios?.length !== 3) {
        issues.push('simulador_contratacion.escenarios debe tener 3 items');
      }
      if (issues.length > 0 && location.hostname === 'localhost') {
        console.warn('Validación schema:', issues);
      }
    },

    // ====== Tabs ======
    setTab(t) {
      this.tab = t;
      this.$nextTick(() => {
        if (t === 'servicios') this.renderServiciosChart();
        if (t === 'productos') this.renderProductosChart();
        if (t === 'consolidado') this.renderConsolidadoChart();
      });
    },

    // ====== Helpers de formato ======
    formatValue(v, fmt) {
      if (v === null || v === undefined || Number.isNaN(v)) return '—';
      const locale = this.data.meta?.locale || 'es-CL';
      const moneda = this.data.meta?.moneda_codigo || 'CLP';

      switch (fmt) {
        case 'CLP':
          return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: moneda,
            maximumFractionDigits: 0,
            minimumFractionDigits: 0
          }).format(v);
        case 'PCT':
          return new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          }).format(v);
        case 'INT':
          return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(v);
        default:
          return String(v);
      }
    },

    // ====== Helpers de color/semáforo ======
    getColorByKey(key) {
      if (!key) return this.data.branding?.color_primario || '#028090';
      const map = {
        primario: this.data.branding?.color_primario,
        primario_dark: this.data.branding?.color_primario_dark,
        secundario: this.data.branding?.color_secundario,
        verde: this.data.branding?.color_verde,
        amarillo: this.data.branding?.color_amarillo,
        rojo: this.data.branding?.color_rojo,
        ok: this.data.branding?.color_verde,
        warn: this.data.branding?.color_amarillo,
        risk: this.data.branding?.color_rojo
      };
      return map[key] || this.data.branding?.color_primario || '#028090';
    },

    semaforoBgClass(estado) {
      return {
        verde: 'bg-cp-ok/10 text-cp-ok',
        amarillo: 'bg-cp-warn/10 text-cp-warn',
        rojo: 'bg-cp-risk/10 text-cp-risk'
      }[estado] || 'bg-cp-light text-cp-mid';
    },

    semaforoDotClass(estado) {
      return {
        verde: 'bg-cp-ok',
        amarillo: 'bg-cp-warn',
        rojo: 'bg-cp-risk'
      }[estado] || 'bg-cp-mid';
    },

    semaforoBorderClass(estado) {
      return {
        verde: 'border-cp-ok/40 bg-cp-ok/5',
        amarillo: 'border-cp-warn/40 bg-cp-warn/5',
        rojo: 'border-cp-risk/40 bg-cp-risk/5'
      }[estado] || 'border-cp-light';
    },

    semaforoTextClass(estado) {
      return {
        verde: 'text-cp-ok',
        amarillo: 'text-cp-warn',
        rojo: 'text-cp-risk'
      }[estado] || 'text-cp-dark';
    },

    // ====== Trend ======
    trendArrow(t) {
      return { up: '▲', down: '▼', flat: '→' }[t] || '·';
    },

    trendColorClass(t) {
      return {
        up: 'text-cp-ok',
        down: 'text-cp-risk',
        flat: 'text-cp-mid'
      }[t] || 'text-cp-mid';
    },

    // ====== Productos helpers ======
    topProductos() {
      return [...(this.data.productos_cloe || [])]
        .sort((a, b) => (b.ventas_mes || 0) - (a.ventas_mes || 0))
        .slice(0, 3);
    },

    productosLentos() {
      return (this.data.productos_cloe || [])
        .filter(p => p.estado === 'rojo' || p.estado === 'amarillo')
        .slice(0, 3);
    },

    // ====== Personas helpers ======
    productividadColor(pct) {
      if (pct === null || pct === undefined) return 'text-cp-mid';
      if (pct >= 0.40) return 'text-cp-ok';
      if (pct >= 0.30) return 'text-cp-warn';
      return 'text-cp-risk';
    },

    // ====== Recomendaciones ======
    prioridadBgClass(p) {
      return {
        P1: 'bg-cp-risk',
        P2: 'bg-cp-warn',
        P3: 'bg-cp-teal'
      }[p] || 'bg-cp-mid';
    },

    supuestoBadgeClass(tipo) {
      return {
        'PENDIENTE': 'bg-cp-warn/20 text-cp-warn',
        'SUPUESTO': 'bg-cp-teal/20 text-cp-teal',
        'RIESGO': 'bg-cp-risk/20 text-cp-risk',
        'CRÍTICO': 'bg-cp-risk text-white'
      }[tipo] || 'bg-cp-light text-cp-mid';
    },

    // ====== Charts ======
    initCharts() {
      this.renderGauge();
      this.renderServiciosChart();
    },

    renderGauge() {
      const el = document.getElementById('gaugeChart');
      if (!el || !this.data.estado_general) return;
      const pct = this.data.estado_general.pe_pct_alcanzado || 0;
      const semaforo = this.data.estado_general.semaforo;
      const color = {
        verde: this.data.branding?.color_verde,
        amarillo: this.data.branding?.color_amarillo,
        rojo: this.data.branding?.color_rojo
      }[semaforo] || this.data.branding?.color_primario;

      // Destruir si ya existe
      if (el._chart) el._chart.destroy();

      el._chart = new Chart(el, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [pct, Math.max(0, 1 - pct)],
            backgroundColor: [color, '#E5E7EB'],
            borderWidth: 0,
            cutout: '75%',
            circumference: 270,
            rotation: 225
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1200, easing: 'easeOutCubic' },
          plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
      });
    },

    renderServiciosChart() {
      const el = document.getElementById('serviciosChart');
      if (!el || !this.data.servicios) return;
      const top = [...this.data.servicios]
        .sort((a, b) => (b.contribucion || 0) - (a.contribucion || 0))
        .slice(0, 10);
      if (el._chart) el._chart.destroy();
      el._chart = new Chart(el, {
        type: 'bar',
        data: {
          labels: top.map(s => s.nombre),
          datasets: [{
            label: 'Contribución mensual',
            data: top.map(s => s.contribucion),
            backgroundColor: top.map(s => this.getColorByKey(s.estado === 'verde' ? 'ok' : s.estado === 'amarillo' ? 'warn' : 'risk')),
            borderRadius: 6,
            barPercentage: 0.8
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800, easing: 'easeOutCubic' },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => this.formatValue(ctx.parsed.x, 'CLP')
              }
            }
          },
          scales: {
            x: {
              ticks: {
                callback: (v) => this.formatValue(v, 'CLP')
              },
              grid: { color: '#F3F4F6' }
            },
            y: { grid: { display: false } }
          }
        }
      });
    },

    renderProductosChart() {
      const el = document.getElementById('productosChart');
      if (!el || !this.data.productos_cloe) return;
      const sorted = [...this.data.productos_cloe]
        .sort((a, b) => (b.contribucion || 0) - (a.contribucion || 0));
      if (el._chart) el._chart.destroy();
      el._chart = new Chart(el, {
        type: 'bar',
        data: {
          labels: sorted.map(p => p.nombre),
          datasets: [{
            label: 'Contribución mensual',
            data: sorted.map(p => p.contribucion),
            backgroundColor: sorted.map(p => this.getColorByKey(p.estado === 'verde' ? 'ok' : p.estado === 'amarillo' ? 'warn' : 'risk')),
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => this.formatValue(ctx.parsed.x, 'CLP') } }
          },
          scales: {
            x: { ticks: { callback: (v) => this.formatValue(v, 'CLP') }, grid: { color: '#F3F4F6' } },
            y: { grid: { display: false } }
          }
        }
      });
    },

    renderConsolidadoChart() {
      const el = document.getElementById('consolidadoChart');
      if (!el) return;
      const totalServ = (this.data.servicios || []).reduce((s, x) => s + (x.contribucion || 0), 0);
      const totalProd = (this.data.productos_cloe || []).reduce((s, x) => s + (x.contribucion || 0), 0);
      if (el._chart) el._chart.destroy();
      el._chart = new Chart(el, {
        type: 'doughnut',
        data: {
          labels: ['Servicios del salón', 'Productos CLOE'],
          datasets: [{
            data: [totalServ, totalProd],
            backgroundColor: [this.data.branding?.color_primario, this.data.branding?.color_secundario],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 13 }, padding: 14 } },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = totalServ + totalProd;
                  const pct = total > 0 ? (ctx.parsed / total) : 0;
                  return `${ctx.label}: ${this.formatValue(ctx.parsed, 'CLP')} (${this.formatValue(pct, 'PCT')})`;
                }
              }
            }
          }
        }
      });
    }
  };
}

// Exponer global para Alpine
window.dashboard = dashboard;
