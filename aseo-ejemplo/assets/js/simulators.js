/* =========================================================================
   simulators.js — Cross Point Consultores · template demo-web-pyme
   - simuladorPrecios()       → slider de % aumento + cálculos en vivo
   - simuladorContratacion()  → tabla 3 escenarios side-by-side
   ========================================================================= */

/* -----------------------------------------------------------------------
   SIMULADOR DE PRECIOS
   ----------------------------------------------------------------------- */
function simuladorPrecios() {
  return {
    spPct: 0.05,

    initSP() {
      // Heredar valor inicial desde el data root
      const root = this.$root && this.$root._x_dataStack
        ? this.$root._x_dataStack[0]
        : null;

      // Truco: leer data del scope padre
      const dataRoot = this._dataRoot();
      this.spPct = dataRoot?.simulador_precios?.valor_inicial_pct ?? 0.05;
    },

    _dataRoot() {
      // Camina el árbol Alpine para encontrar el componente raíz dashboard()
      let el = this.$el;
      while (el) {
        if (el._x_dataStack) {
          for (const stack of el._x_dataStack) {
            if (stack.data && stack.data.kpis) return stack.data;
          }
        }
        el = el.parentElement;
      }
      return null;
    },

    setPreset(v) {
      this.spPct = v;
    },

    // ---- Cálculos ----
    _serviciosAplicables() {
      const root = this._dataRoot();
      if (!root) return [];
      const ids = root.simulador_precios?.servicios_aplicables_ids || [];
      if (ids.length === 0) return root.servicios || [];
      return (root.servicios || []).filter(s => ids.includes(s.id));
    },

    _serviciosNoAplicables() {
      const root = this._dataRoot();
      if (!root) return [];
      const ids = root.simulador_precios?.servicios_aplicables_ids || [];
      return (root.servicios || []).filter(s => !ids.includes(s.id));
    },

    _calcularServicioNuevo(s) {
      // Modelo: insumos fijos + comisión proporcional al precio
      // insumos = costo_directo - (precio × comision_pct)
      const insumos = s.costo_directo - (s.precio * s.comision_pct);
      const precio_nuevo = s.precio * (1 + this.spPct);
      const costo_nuevo = insumos + (precio_nuevo * s.comision_pct);
      const margen_unit_nuevo = precio_nuevo - costo_nuevo;
      const margen_pct_nuevo = precio_nuevo > 0 ? margen_unit_nuevo / precio_nuevo : 0;
      const contribucion_nueva = margen_unit_nuevo * s.cantidad_mes;
      return { precio_nuevo, margen_unit_nuevo, margen_pct_nuevo, contribucion_nueva };
    },

    spMargenNuevo() {
      const root = this._dataRoot();
      if (!root) return 0;
      const aplica = this._serviciosAplicables();
      const no = this._serviciosNoAplicables();
      const productos = root.productos_cloe || [];

      let venta = 0, margen = 0;

      aplica.forEach(s => {
        const calc = this._calcularServicioNuevo(s);
        venta += calc.precio_nuevo * s.cantidad_mes;
        margen += calc.contribucion_nueva;
      });

      no.forEach(s => {
        venta += s.precio * s.cantidad_mes;
        margen += s.contribucion;
      });

      productos.forEach(p => {
        venta += p.precio * p.ventas_mes;
        margen += p.contribucion;
      });

      return venta > 0 ? margen / venta : 0;
    },

    _utilidadActual() {
      const root = this._dataRoot();
      if (!root) return 0;
      const utilidadKpi = (root.kpis || []).find(k => k.id === 'utilidad');
      return utilidadKpi?.valor || 0;
    },

    _ventaActual() {
      const root = this._dataRoot();
      if (!root) return 0;
      const ventaKpi = (root.kpis || []).find(k => k.id === 'venta_total');
      return ventaKpi?.valor || 0;
    },

    spDeltaUtilidad() {
      const root = this._dataRoot();
      if (!root) return 0;
      // Delta = sum(contribucion_nueva - contribucion) sobre servicios aplicables
      let delta = 0;
      this._serviciosAplicables().forEach(s => {
        const calc = this._calcularServicioNuevo(s);
        delta += calc.contribucion_nueva - s.contribucion;
      });
      return Math.round(delta);
    },

    spUtilidadNueva() {
      return this._utilidadActual() + this.spDeltaUtilidad();
    }
  };
}

/* -----------------------------------------------------------------------
   SIMULADOR DE CONTRATACIÓN
   ----------------------------------------------------------------------- */
function simuladorContratacion() {
  return {
    initSC() {
      // No hay state propio — todo viene del JSON
    },

    _dataRoot() {
      let el = this.$el;
      while (el) {
        if (el._x_dataStack) {
          for (const stack of el._x_dataStack) {
            if (stack.data && stack.data.kpis) return stack.data;
          }
        }
        el = el.parentElement;
      }
      return null;
    },

    _calcularEscenario(esc) {
      const root = this._dataRoot();
      if (!root) return null;
      const margenKpi = (root.kpis || []).find(k => k.id === 'margen_consolidado');
      const margen_actual = margenKpi?.valor || 0.5;

      const sueldo_total = esc.sueldo_bruto_uno * esc.n_personas;
      const comision_total = esc.comision_uno * esc.n_personas;
      const costo_real = (sueldo_total + comision_total) * (esc.factor_leyes_sociales || 1);
      const venta_esperada = esc.venta_esperada_uno * esc.n_personas;
      const contribucion_extra = venta_esperada * margen_actual;
      const utilidad_extra = contribucion_extra - costo_real;
      const meses_breakeven = utilidad_extra > 0
        ? costo_real / utilidad_extra
        : Number.POSITIVE_INFINITY;

      return {
        sueldo_total,
        costo_real,
        venta_esperada,
        contribucion_extra,
        utilidad_extra,
        meses_breakeven
      };
    },

    scRows() {
      const root = this._dataRoot();
      if (!root) return [];
      const escenarios = root.simulador_contratacion?.escenarios || [];
      const calcs = escenarios.map(e => this._calcularEscenario(e));

      const buildRow = (label, accessor, formato, mejorMayor = true) => {
        const values = calcs.map(c => c ? c[accessor] : null);
        const validValues = values.map((v, i) => ({ v, i })).filter(x => x.v !== null && Number.isFinite(x.v));
        const sorted = [...validValues].sort((a, b) => mejorMayor ? b.v - a.v : a.v - b.v);
        return {
          label,
          values,
          formato,
          bestIdx: sorted[0]?.i ?? -1,
          worstIdx: sorted[sorted.length - 1]?.i ?? -1
        };
      };

      return [
        buildRow('Costo real total mes', 'costo_real', 'CLP', false), // mejor = menor costo
        buildRow('Venta esperada nueva', 'venta_esperada', 'CLP', true),
        buildRow('Contribución extra', 'contribucion_extra', 'CLP', true),
        buildRow('Utilidad incremental', 'utilidad_extra', 'CLP', true),
        {
          label: 'Meses al breakeven',
          values: calcs.map(c => c?.meses_breakeven ?? null),
          formato: 'MESES',
          bestIdx: calcs.findIndex(c => c && c.meses_breakeven === Math.min(...calcs.filter(x => x && Number.isFinite(x.meses_breakeven)).map(x => x.meses_breakeven))),
          worstIdx: calcs.findIndex(c => c && (!Number.isFinite(c.meses_breakeven) || c.meses_breakeven === Math.max(...calcs.filter(x => x).map(x => x.meses_breakeven))))
        }
      ];
    },

    scRecomendacion() {
      const root = this._dataRoot();
      if (!root) return '';
      const escenarios = root.simulador_contratacion?.escenarios || [];
      const calcs = escenarios.map(e => this._calcularEscenario(e));
      // Mejor escenario: mayor utilidad_extra
      let bestIdx = 0;
      let bestUtil = calcs[0]?.utilidad_extra ?? -Infinity;
      calcs.forEach((c, i) => {
        if (c && c.utilidad_extra > bestUtil) {
          bestUtil = c.utilidad_extra;
          bestIdx = i;
        }
      });
      const best = escenarios[bestIdx];
      const calc = calcs[bestIdx];

      if (!best || !calc) return 'Faltan datos para generar recomendación.';

      if (calc.utilidad_extra <= 0) {
        return `Ningún escenario genera utilidad incremental positiva con los supuestos actuales. Antes de contratar, revisar margen consolidado o ajustar la venta mínima esperada.`;
      }

      const meses = Math.ceil(calc.meses_breakeven);
      return `El escenario "${best.label}" es el más conveniente: utilidad incremental de ${this._formatCLP(calc.utilidad_extra)}/mes y breakeven en ${meses} ${meses === 1 ? 'mes' : 'meses'}. Validar con histórico de productividad antes de firmar.`;
    },

    _formatCLP(v) {
      const root = this._dataRoot();
      const locale = root?.meta?.locale || 'es-CL';
      const moneda = root?.meta?.moneda_codigo || 'CLP';
      return new Intl.NumberFormat(locale, {
        style: 'currency', currency: moneda, maximumFractionDigits: 0
      }).format(v);
    },

    // Helper para template (la columna formato 'MESES')
    formatValue(v, fmt) {
      if (v === null || v === undefined) return '—';
      if (fmt === 'MESES') {
        if (!Number.isFinite(v)) return '∞';
        return v < 1 ? '<1 mes' : `${Math.ceil(v)} m`;
      }
      const root = this._dataRoot();
      const locale = root?.meta?.locale || 'es-CL';
      const moneda = root?.meta?.moneda_codigo || 'CLP';
      switch (fmt) {
        case 'CLP':
          return new Intl.NumberFormat(locale, {
            style: 'currency', currency: moneda, maximumFractionDigits: 0
          }).format(v);
        case 'PCT':
          return new Intl.NumberFormat(locale, {
            style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1
          }).format(v);
        default:
          return String(v);
      }
    }
  };
}

window.simuladorPrecios = simuladorPrecios;
window.simuladorContratacion = simuladorContratacion;
