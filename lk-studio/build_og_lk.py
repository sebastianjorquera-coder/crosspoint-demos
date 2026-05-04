"""
Genera og-lk-studio.png (1200x630) — preview WhatsApp/LinkedIn/email del demo LK Studio.
v3.6 · paleta sobria consultoría seria · copy ejecutivo.
"""
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as patches

# ---- Configuración ----
W, H = 1200, 630
DPI = 100
FIG_W, FIG_H = W / DPI, H / DPI

# Paleta v3.6 sobria
NOIR = "#0E0E10"
CHAMPAGNE = "#C8A96E"
CHAMPAGNE_DARK = "#A6884F"
CHAMPAGNE_LIGHT = "#E2CDA0"
IVORY = "#FBF8F3"
PAPER = "#FFFFFF"
GRAY_500 = "#6B6B72"
GRAY_300 = "#B8B8BE"

OUT = Path(__file__).parent / "assets" / "img" / "og-lk-studio.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

# ---- Figura principal ----
fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI)
fig.patch.set_facecolor(IVORY)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, W)
ax.set_ylim(0, H)
ax.axis("off")
ax.set_facecolor(IVORY)

# Banner DEMO superior plano (champagne dark, no gradiente)
banner_h = 36
banner = patches.Rectangle((0, H - banner_h), W, banner_h, facecolor=CHAMPAGNE_DARK, zorder=2)
ax.add_patch(banner)
ax.text(
    W / 2, H - banner_h / 2,
    "D E M O   ·   C I F R A S   I L U S T R A T I V A S   ·   T U   D I A G N Ó S T I C O   R E A L   U S A   T U S   N Ú M E R O S",
    ha="center", va="center",
    fontsize=8.5, color=NOIR,
    fontweight="bold",
    family="DejaVu Sans",
    zorder=3,
)

# Eyebrow técnico sobre el wordmark
ax.text(
    W / 2, H * 0.82,
    "P E R Í O D O :   M A Y O   2 0 2 6   ·   D I A G N Ó S T I C O   F I N A N C I E R O",
    ha="center", va="center",
    fontsize=10, color=GRAY_500,
    fontweight="bold",
    family="DejaVu Sans",
    zorder=5,
)

# Wordmark "LK Studio" — ANCLA decorativa Cormorant italic (única en hero)
ax.text(
    W / 2, H * 0.71,
    "LK Studio",
    ha="center", va="center",
    fontsize=64, color=NOIR,
    fontstyle="italic",
    family="Georgia",
    fontweight="medium",
    zorder=5,
)

# Línea divisoria champagne (delgada)
ax.plot([W / 2 - 50, W / 2 + 50], [H * 0.625, H * 0.625], color=CHAMPAGNE, lw=1, zorder=5)

# Sublínea wordmark
ax.text(
    W / 2, H * 0.595,
    "ESTUDIO DE BELLEZA  ·  MAIPÚ",
    ha="center", va="center",
    fontsize=11, color=GRAY_500,
    family="DejaVu Sans",
    fontweight="medium",
    zorder=5,
)

# Headline cuantificado v3.7 (Manrope-ish bold)
ax.text(
    W / 2, H * 0.46,
    "Identifica hasta +$575K mensuales",
    ha="center", va="center",
    fontsize=38, color=NOIR,
    family="DejaVu Sans",
    fontweight="bold",
    zorder=5,
)
ax.text(
    W / 2, H * 0.36,
    "de rentabilidad oculta",
    ha="center", va="center",
    fontsize=28, color=NOIR,
    family="DejaVu Sans",
    fontweight="medium",
    zorder=5,
)

# Subhead descriptivo: plazo y propuesta de valor
ax.text(
    W / 2, H * 0.27,
    "Diagnóstico ejecutivo en 14 días  ·  Plan de acción priorizado  ·  Sin inversión inicial",
    ha="center", va="center",
    fontsize=13, color=GRAY_500,
    family="DejaVu Sans",
    fontweight="medium",
    zorder=5,
)

# Línea divisoria inferior
ax.plot([W / 2 - 30, W / 2 + 30], [H * 0.18, H * 0.18], color=CHAMPAGNE, lw=1, zorder=5)

# Footer powered-by
ax.text(
    W / 2, H * 0.13,
    "ANÁLISIS DESARROLLADO POR",
    ha="center", va="center",
    fontsize=8.5, color=GRAY_500,
    family="DejaVu Sans",
    fontweight="bold",
    zorder=5,
)
# Cross Point en italic Georgia (ancla decorativa secundaria)
ax.text(
    W / 2, H * 0.085,
    "Cross Point Consultores",
    ha="center", va="center",
    fontsize=17, color=NOIR,
    fontstyle="italic",
    family="Georgia",
    zorder=5,
)
ax.text(
    W / 2, H * 0.045,
    "Asesoría Comercial y Financiera para Pymes",
    ha="center", va="center",
    fontsize=10, color=GRAY_500,
    family="DejaVu Sans",
    zorder=5,
)

# Guardar
fig.savefig(OUT, dpi=DPI, bbox_inches=None, facecolor=IVORY)
plt.close(fig)

print(f"OK -> {OUT} ({OUT.stat().st_size} bytes)")
