# Demo web — aseo-ejemplo

Demo interactivo del análisis comercial-financiero. Carpeta autosuficiente:
HTML + CSS + JS + JSON embebido. Sin build step, sin servidor.

## Cómo abrir localmente

```bash
cd clients/aseo-ejemplo/deliverables/web
python -m http.server 8000
```

Abrir: http://localhost:8000

## Cómo editar las cifras

1. Editar `data/cliente.json` (fuente de verdad)
2. Re-ejecutar el script para sincronizar al HTML:
   ```bash
   python templates/demo-web-pyme/tools/crear-cliente.py aseo-ejemplo
   ```
   *(no sobreescribe cliente.json, solo actualiza el inline del HTML)*

Documentación de campos: `data/SCHEMA.md`

## Cómo deployar a GitHub Pages (repo crosspoint-demos)

```bash
cp -rv clients/aseo-ejemplo/deliverables/web/ /tmp/crosspoint-demos/aseo-ejemplo/
cd /tmp/crosspoint-demos
git add aseo-ejemplo/
git commit -m "aseo-ejemplo: demo v3.7"
git push origin main
```

URL: https://sebastianjorquera-coder.github.io/crosspoint-demos/aseo-ejemplo/

## Estructura

```
web/
├── index.html           ← HTML con JSON inline embebido
├── assets/
│   ├── css/theme.css
│   ├── js/{app,simulators,animations}.js
│   └── img/{logo-cp.svg, og-image.png}
├── data/
│   ├── cliente.json     ← editar aquí
│   └── SCHEMA.md        ← referencia de campos
└── README.md
```

---

*Cross Point Consultores · Asesoría Comercial y Financiera para Pymes*
