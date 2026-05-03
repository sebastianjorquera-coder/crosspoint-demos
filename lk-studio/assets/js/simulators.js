/* =====================================================================
   simulators.js — LK Studio diagnóstico financiero
   - simuladorPrecios()       → slider % aumento + cálculo en vivo
   - simuladorContratacion()  → 3 escenarios + breakeven + recomendación
   ===================================================================== */

/* Helper: walk up the Alpine data stack to find the parent dashboard()
   component (which holds .data). Used because child components don't
   inherit data automatically. */
function _lkDataRoot(el) {
  let cur = el;
  while (cur) {
    if (cur._x_dataStack && cur._x_dataStack.length) {
      for (const scope of cur._x_dataStack) {
        if (scope && scope.data && scope.data.kpis) return scope;
      }
    }
    cur = cur.parentElement || null;
  }
  return null;
}

/* ====================================================================
   Simulador 1: ¿Y si subo precios?
   ==================================================================== */
function simuladorPrecios() {
  return {
    spPct: 0.05,

    init() {
      // Tomar valor inicial del data si existe
      const root = this._dataRoot();
      const ini = root?.data?.simulador_precios?.valor_inicial_pct;
      if (typeof ini === 'number') this.spPct = ini;
    },

    _dataRoot() {
      return _lkDataRoot(this.$el);
    },

    get data() {
      return this._dataRoot()?.data || {};
    },

    formatCLP(v) {
      const root = this._dataRoot();
      return root ? root.formatCLP(v) : '$' + Math.round(v || 0).toLocaleString('es-CL');
    },

    /* Servicios aplicables (los que están en simulador_precios.servicios_aplicables_ids) */
    _serviciosAplicables() {
      const all = this.data.servicios || [];
      const ids = this.data.simulador_precios?.servicios_aplicables_ids || [];
      return all.filter(s => ids.includes(s.id));
    },

    /* Calcular un servicio con nuevo precio:
       - costo directo se desglosa en: insumos (constantes) + comision (proporcional al precio)
       - precio_nuevo = precio * (1 + spPct)
       - costo_nuevo = insumos + (precio_nuevo * comision_pct)
       - margen unitario nuevo = precio_nuevo - costo_nuevo
    */
    _calcServicioNuevo(s) {
      const insumos = s.costo_directo - (s.precio * s.comision_pct);
      const precio_nuevo = s.precio * (1 + this.spPct);
      const costo_nuevo = insumos + (precio_nuevo * s.comision_pct);
      const margen_unit_nuevo = precio_nuevo - costo_nuevo;
      const margen_pct_nuevo = precio_nuevo > 0 ? margen_unit_nuevo / precio_nuevo : 0;
      const contribucion_nueva = margen_unit_nuevo * s.cantidad_mes;
      return {
        precio_nuevo,
        costo_nuevo,
        margen_unit_nuevo,
        margen_pct_nuevo,
        contribucion_nueva,
        contribucion_actual: s.margen_unitario * s.cantidad_mes,
        delta_contribucion: contribucion_nueva - (s.margen_unitario * s.cantidad_mes)
      };
    },

    /* Margen consolidado nuevo (ponderado por cantidad y precio) */
    spMargenNuevo() {
      const aplicables = this._serviciosAplicables();
      const noAplicables = (this.data.servicios || []).filter(s => !aplicables.includes(s));

      let venta_total = 0;
      let margen_total = 0;

      // Aplicables con precio nuevo
      aplicables.forEach(s => {
        const calc = this._calcServicioNuevo(s);
        venta_total += calc.precio_nuevo * s.cantidad_mes;
        margen_total += calc.contribucion_nueva;
      });

      // No aplicables sin cambio
      noAplicables.forEach(s => {
        venta_total += s.precio * s.cantidad_mes;
        margen_total += s.margen_unitario * s.cantidad_mes;
      });

      return venta_total > 0 ? margen_total / venta_total : 0;
    },

    /* Δ utilidad por mes = suma de delta de contribución */
    spDeltaUtilidad() {
      return this._serviciosAplicables()
        .reduce((sum, s) => sum + this._calcServicioNuevo(s).delta_contribucion, 0);
    },

    /* PE nuevo: costos fijos / margen consolidado nuevo */
    spPENuevo() {
      const cf = (this.data.costos_fijos || []).reduce((s, c) => s + c.monto_mensual, 0);
      const margen = this.spMargenNuevo();
      return margen > 0 ? cf / margen : 0;
    }
  };
}
window.simuladorPrecios = simuladorPrecios;

/* ====================================================================
   Simulador 2: ¿Y si contrato a alguien?
   ==================================================================== */
function simuladorContratacion() {
  return {
    init() {},

    _dataRoot() {
      return _lkDataRoot(this.$el);
    },

    get data() {
      return this._dataRoot()?.data || {};
    },

    formatCLP(v) {
      const root = this._dataRoot();
      return root ? root.formatCLP(v) : '$' + Math.round(v || 0).toLocaleString('es-CL');
    },

    _calcEscenario(esc) {
      const sueldo_total = (esc.sueldo_bruto_uno || 0) * (esc.n_personas || 1);
      const comision_total = (esc.comision_uno || 0) * (esc.n_personas || 1);
      const factor = esc.factor_leyes_sociales || 1.25;
      const costo_real = (sueldo_total + comision_total) * factor;
      const venta_esperada = (esc.venta_esperada_uno || 0) * (esc.n_personas || 1);

      const margen_actual = this._dataRoot()?.data?.kpis?.find(k => k.id === 'margen_consolidado')?.valor || 0.6;
      const utilidad_extra = (venta_esperada * margen_actual) - costo_real;
      const meses_breakeven = utilidad_extra > 0 ? (costo_real / utilidad_extra) : 99;

      return {
        id: esc.id,
        label: esc.label,
        costo_real,
        venta_esperada,
        utilidad_extra,
        meses_breakeven
      };
    },

    scRows() {
      const escenarios = this.data.simulador_contratacion?.escenarios || [];
      return escenarios.map(e => this._calcEscenario(e));
    },

    scBestIdx() {
      const rows = this.scRows();
      if (!rows.length) return -1;
      let best = 0;
      let bestUt = rows[0].utilidad_extra;
      rows.forEach((r, i) => {
        if (r.utilidad_extra > bestUt) {
          bestUt = r.utilidad_extra;
          best = i;
        }
      });
      return best;
    },

    scRecomendacion() {
      const rows = this.scRows();
      if (!rows.length) return '';
      const best = rows[this.scBestIdx()];
      if (best.utilidad_extra <= 0) {
        return 'Ninguno de los escenarios deja utilidad incremental positiva. Antes de contratar, primero subí ocupación con los recursos actuales.';
      }
      const meses = best.meses_breakeven < 99 ? best.meses_breakeven.toFixed(1) : '—';
      return 'El escenario "' + best.label + '" es el más conveniente: utilidad incremental de ' + this.formatCLP(best.utilidad_extra) + '/mes y breakeven en ' + meses + ' meses. Validalo con histórico de productividad antes de firmar.';
    }
  };
}
window.simuladorContratacion = simuladorContratacion;
