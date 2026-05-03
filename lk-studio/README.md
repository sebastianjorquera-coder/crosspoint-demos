# Demo web — lk-studio

Demo interactivo del análisis comercial-financiero. Carpeta autosuficiente:
HTML + CSS + JS + JSON con cifras. Sin build step.

## Cómo abrir localmente

```bash
cd clients/lk-studio/deliverables/web
python -m http.server 8000
```

Y abrí: http://localhost:8000

> Abrir con doble click NO funciona (el navegador bloquea fetch a archivos locales).

## Cómo editar las cifras

Editar `data/cliente.json`. Toda cifra, color secundario, recomendación, etc.
viene de ese archivo. Documentación completa en `data/SCHEMA.md`.

## Cómo regenerar el og-image (preview de WhatsApp/email)

```bash
python ../../../templates/demo-web-pyme/tools/build_og_image.py \
    data/cliente.json \
    assets/img/og-image.png
```

## Cómo deployar a GitHub Pages

1. Crear repo en GitHub (privado o público según datos).
2. Push de toda la carpeta `web/`.
3. Settings → Pages → branch `main` / folder `/`.
4. Esperar 2-3 min.
5. URL: `https://<usuario>.github.io/<repo>/`

## Estructura

```
web/
├── index.html
├── assets/
│   ├── css/theme.css
│   ├── js/{app,simulators,animations}.js
│   └── img/{logo-cp.svg, og-image.png}
├── data/
│   ├── cliente.json     ← editar aquí
│   └── SCHEMA.md        ← referencia
└── README.md
```

---

*Cross Point Consultores · Asesoría Comercial y Financiera para Pymes*
