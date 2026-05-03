# SCHEMA — `data/cliente.json`

Documento de referencia para crear o editar el JSON que alimenta el demo web. Cada cliente tiene su propio `cliente.json`. La estructura es estable: el `index.html` espera estos campos exactos.

> **Regla de oro:** si una sección no aplica a un cliente, dejar el array vacío `[]` o el objeto con campos a `null`. Nunca omitir la clave — el JS de carga falla silenciosamente.

---

## 1. `meta` (objeto, obligatorio)

Identidad del cliente y del consultor.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `cliente_nombre` | string | ✓ | Nombre comercial visible en el demo. Ej: `"LK Studio"` |
| `cliente_slug` | string | ✓ | kebab-case sin espacios. Debe coincidir con la carpeta. Ej: `"lk-studio"` |
| `cliente_rubro` | string | ✓ | Frase corta. Ej: `"Salón de belleza + retail CLOE"` |
| `fecha_corte` | string ISO | ✓ | Fecha del análisis. Formato `"YYYY-MM-DD"` |
| `mes_corte_label` | string | ✓ | Texto humano. Ej: `"mayo 2026"` |
| `es_demo` | boolean | ✓ | `true` muestra banner DEMO permanente |
| `moneda_simbolo` | string | ✓ | Ej: `"$"` |
| `moneda_codigo` | string | ✓ | Ej: `"CLP"` |
| `locale` | string | ✓ | Para formateo de números. Ej: `"es-CL"` |
| `consultor_nombre` | string | ✓ | Cross Point Consultores |
| `consultor_lema` | string | ✓ | "Asesoría Comercial y Financiera para Pymes" |
| `consultor_whatsapp` | string | ✓ | Formato `+56 9 7883 7430` |
| `consultor_email` | string | ✓ | `contacto@safepoint-ehs.com` |
| `consultor_web` | string | ✓ | `safepoint-ehs.cl` |

---

## 2. `branding` (objeto, obligatorio)

Paleta y tipografía. Por defecto Cross Point Consultores. Se puede ajustar si el cliente exige co-branding (raro).

| Campo | Tipo | Default |
|---|---|---|
| `color_primario` | hex string | `#028090` (teal CP) |
| `color_primario_dark` | hex string | `#015d68` |
| `color_secundario` | hex string | `#C9A84C` (gold CP) |
| `color_secundario_light` | hex string | `#F0E4BA` |
| `color_neutro_dark` | hex string | `#1F2937` |
| `color_neutro_mid` | hex string | `#6B7280` |
| `color_neutro_light` | hex string | `#F3F4F6` |
| `color_verde` | hex string | `#16A34A` (semáforo OK) |
| `color_amarillo` | hex string | `#EAB308` (semáforo alerta) |
| `color_rojo` | hex string | `#DC2626` (semáforo crítico) |
| `tipografia_titulares` | string | `"Plus Jakarta Sans"` |
| `tipografia_cuerpo` | string | `"Inter"` |

---

## 3. `hero` (objeto, obligatorio)

Sección 1 del demo. Cover full-viewport.

| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | string | Nombre del cliente, grande |
| `subtitulo` | string | Ej: `"Estado del negocio · mayo 2026"` |
| `kpi_principal_label` | string | Ej: `"Venta total del mes"` |
| `kpi_principal_valor` | number | Valor numérico crudo |
| `kpi_principal_formato` | enum | `"CLP"` \| `"PCT"` \| `"INT"` |
| `cta_scroll_label` | string | Texto del CTA "↓ ..." |

---

## 4. `kpis` (array de 4 objetos, obligatorio)

Sección 2 del demo. Grid 2x2 mobile, 4x1 desktop.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Identificador único, kebab-case |
| `label` | string | Etiqueta superior de la card |
| `valor` | number | Valor crudo |
| `formato` | enum | `"CLP"` \| `"PCT"` \| `"INT"` |
| `meta` | number\|null | Para calcular delta. `null` si no aplica |
| `trend` | enum | `"up"` \| `"down"` \| `"flat"` (controla flecha ▲▼→) |
| `trend_texto` | string | Texto del subtítulo. Ej: `"+12% vs meta"` |
| `color_borde` | enum | Mapea a `branding.*`: `"primario"` \| `"secundario"` \| `"primario_dark"` \| `"verde"` \| `"amarillo"` \| `"rojo"` |

---

## 5. `estado_general` (objeto, obligatorio)

Bloque "semáforo + mensaje" debajo de los KPIs.

| Campo | Tipo | Notas |
|---|---|---|
| `semaforo` | enum | `"verde"` \| `"amarillo"` \| `"rojo"` |
| `titulo` | string | Ej: `"Negocio sano"` |
| `mensaje` | string | 1 frase que explica el estado |
| `pe_pct_alcanzado` | number 0-1 | Para el gauge donut. Ej: `0.87` = 87% |
| `dias_para_pe` | int | Día del mes donde se cubre el PE |
| `dias_total_mes` | int | Días del mes (típicamente 30) |

---

## 6. `servicios` (array, obligatorio si rubro tiene servicios)

Sección 3 (tab Servicios). Bar chart horizontal + tabla.

Cada item:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | kebab-case |
| `nombre` | string | Visible |
| `precio` | number | CLP |
| `cantidad_mes` | int | Cantidad realizada en el mes |
| `costo_directo` | number | Insumos + comisión por unidad |
| `comision_pct` | number 0-1 | % comisión profesional |
| `margen_unitario` | number | `precio - costo_directo - precio*comision_pct` |
| `margen_pct` | number 0-1 | `margen_unitario / precio` |
| `contribucion` | number | `margen_unitario * cantidad_mes` |
| `estado` | enum | `"verde"` (≥50%) \| `"amarillo"` (40-49%) \| `"rojo"` (<40%) |
| `accion` | string | Recomendación corta para esa línea |

---

## 7. `productos_cloe` (array, opcional según cliente)

Sección 3 (tab Productos). Si el cliente no vende productos, dejar `[]`.

Cada item:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | kebab-case |
| `nombre` | string | Visible |
| `precio` | number | CLP venta |
| `costo` | number | CLP compra |
| `ventas_mes` | int | Unidades vendidas |
| `stock` | int | Unidades disponibles |
| `margen_pct` | number 0-1 | `(precio-costo)/precio` |
| `contribucion` | number | `(precio-costo) * ventas_mes` |
| `estado` | enum | `"verde"` \| `"amarillo"` \| `"rojo"` |
| `accion` | string | Recomendación corta |

---

## 8. `personas` (array, obligatorio)

Sección 4. Cards por persona del equipo.

Cada item:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | kebab-case |
| `rol` | string | Ej: `"Estilista 1"` (sin nombre real) |
| `modalidad` | enum | 7 valores: `"Contrato indefinido"` \| `"Plazo fijo"` \| `"Part-time"` \| `"Honorarios mensual fijo"` \| `"Honorarios variable por servicio"` \| `"Familiar sin contrato"` \| `"Otro"` |
| `sueldo_bruto` | number | 0 si no aplica |
| `honorario_fijo` | number | 0 si no aplica |
| `comision_pct` | number 0-1 | 0 si no aplica |
| `horas_semana` | int | |
| `antiguedad_anios` | int | |
| `costo_real_mensual` | number | Calculado: contrato → bruto×1.25; honorarios fijo → monto; etc. |
| `ventas_generadas` | number | CLP del mes |
| `productividad_pct` | number 0-1 \| null | `costo_real / ventas_generadas`. `null` si no genera ventas (ej: recepción) |
| `bandera_legal` | string \| null | Texto si hay alerta legal. Ej: boleta variable con horario fijo |

---

## 9. `personas_resumen` (objeto, obligatorio)

Resumen agregado debajo de las cards.

| Campo | Tipo | Notas |
|---|---|---|
| `total_costo_mensual` | number | Suma de `personas[].costo_real_mensual` |
| `peso_remuneraciones_pct` | number 0-1 | `total_costo / venta_total` |
| `semaforo_peso` | enum | `"verde"` (<35%) \| `"amarillo"` (35-45%) \| `"rojo"` (>45%) |
| `mensaje_peso` | string | Frase contextualizada |

---

## 10. `costos_fijos` (array, obligatorio)

Sección de costos. Pie chart + tabla.

Cada item:

| Campo | Tipo |
|---|---|
| `concepto` | string |
| `monto_mensual` | number |
| `frecuencia` | enum (`"mensual"`/`"trimestral"`/`"anual"`) |
| `pct_sobre_ventas` | number 0-1 |

---

## 11. `alertas` (array, máximo 5)

Top 3 alertas visibles en la sección de estado general.

Cada item:

| Campo | Tipo |
|---|---|
| `titulo` | string |
| `detalle` | string (1 frase) |
| `severidad` | enum (`"alta"`/`"media"`/`"baja"`) |

---

## 12. `oportunidades` (array, máximo 5)

Espejo de alertas pero positivo.

Cada item:

| Campo | Tipo |
|---|---|
| `titulo` | string |
| `detalle` | string |
| `impacto_estimado` | number (CLP/mes) |

---

## 13. `simulador_precios` (objeto, obligatorio)

Sección 5a. Configura el rango del slider y los presets.

| Campo | Tipo | Notas |
|---|---|---|
| `habilitado` | boolean | Si `false`, no se renderiza |
| `rango_min_pct` | number | Ej: `-0.10` para -10% |
| `rango_max_pct` | number | Ej: `0.20` para +20% |
| `step_pct` | number | Granularidad. Ej: `0.01` |
| `valor_inicial_pct` | number | Posición inicial slider |
| `presets` | array | `[{label, valor_pct}]` |
| `supuesto_elasticidad` | string | Texto SUPUESTO visible |
| `servicios_aplicables_ids` | string[] | IDs de servicios donde aplica el cambio |

---

## 14. `simulador_contratacion` (objeto, obligatorio)

Sección 5b. 3 escenarios side-by-side.

| Campo | Tipo |
|---|---|
| `habilitado` | boolean |
| `escenarios` | array de 3 |
| `supuesto_factor` | string |

Cada escenario:

| Campo | Tipo |
|---|---|
| `id` | enum (`"conservador"`/`"base"`/`"optimista"`) |
| `label` | string |
| `n_personas` | int |
| `sueldo_bruto_uno` | number |
| `comision_uno` | number |
| `venta_esperada_uno` | number |
| `factor_leyes_sociales` | number (típicamente 1.25 si contrato) |

---

## 15. `recomendaciones` (array, 3-5 items)

Sección 6. Top recomendaciones priorizadas.

Cada item:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | Orden visible (1-5) |
| `titulo` | string | Acción concreta |
| `impacto` | enum | `"Alto"` \| `"Medio"` \| `"Bajo"` |
| `esfuerzo` | enum | `"Alto"` \| `"Medio"` \| `"Bajo"` |
| `prioridad` | enum | `"P1"` \| `"P2"` \| `"P3"` |
| `delta_utilidad_mensual` | number | CLP estimado |
| `accion` | string | Detalle 1-2 frases |

---

## 16. `supuestos` (array)

Bloque al final con marcas explícitas.

Cada item:

| Campo | Tipo | Notas |
|---|---|---|
| `tipo` | enum | `"PENDIENTE"` \| `"SUPUESTO"` \| `"RIESGO"` \| `"CRÍTICO"` |
| `texto` | string | Frase explicativa |

---

## 17. `footer` (objeto, obligatorio)

Pie de página institucional.

| Campo | Tipo |
|---|---|
| `linea_1` | string |
| `linea_2` | string |
| `linea_3` | string |

---

## Validaciones automáticas (en `app.js`)

Al cargar el JSON, el JS valida:
- `kpis` tiene exactamente 4 items.
- `recomendaciones` tiene 3-5 items.
- `simulador_contratacion.escenarios` tiene 3 items con IDs `conservador`/`base`/`optimista`.
- Sumas básicas: `Σ servicios.contribucion + Σ productos_cloe.contribucion ≈ venta_total - costos_directos`.

Si la validación falla, el JS muestra un banner rojo en dev mode (`localhost`) y carga datos de fallback en prod.

---

*Schema v1 · 2026-05-03 · Cross Point Consultores · template `demo-web-pyme`*
