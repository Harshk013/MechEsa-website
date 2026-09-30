import cv2
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.path import Path
import matplotlib.patches as patches
import re

# 1. Navbar Mockup: 68px high, monochrome white logo
h, w = 68, 380
navbar_img = np.full((h, w, 3), (17, 15, 13), dtype=np.uint8)
cv2.line(navbar_img, (w-1, 0), (w-1, h), (40, 36, 32), 1)

# Render emblem and wordmark from SVG
with open('public/assets/branding/mechesa-emblem.svg') as f:
    e_svg = f.read()
with open('public/assets/branding/mechesa-wordmark.svg') as f:
    w_svg = f.read()

e_d = re.search(r'd="([^"]+)"', e_svg).group(1)
w_d = re.search(r'd="([^"]+)"', w_svg).group(1)

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8), facecolor='#0d0f11', gridspec_kw={'height_ratios': [1, 3]})

# --- Subplot 1: Navbar Logo ---
ax1.set_facecolor('#0d0f11')
ax1.set_title("1. Navbar Brand Lockup — 100% Monochrome White (No Blue, No Orange)", color='#ffffff', fontsize=12, pad=12)

# Plot emblem at x=20, y=14, h=38
eh = 38.0
ew = eh * (586.0 / 671.0)
ey = 15.0
ex = 25.0

def add_path_to_ax(ax, d_str, x_off, y_off, scale_x, scale_y, color='#ffffff'):
    for sp in d_str.strip().split(' Z'):
        sp = sp.strip()
        if not sp: continue
        tokens = sp.split()
        verts = []
        codes = []
        i = 0
        while i < len(tokens):
            if tokens[i] == 'M':
                verts.append((float(tokens[i+1])*scale_x + x_off, float(tokens[i+2])*scale_y + y_off))
                codes.append(Path.MOVETO)
                i += 3
            elif tokens[i] == 'L':
                verts.append((float(tokens[i+1])*scale_x + x_off, float(tokens[i+2])*scale_y + y_off))
                codes.append(Path.LINETO)
                i += 3
            else:
                i += 1
        if verts:
            verts.append((0, 0))
            codes.append(Path.CLOSEPOLY)
            p = Path(verts, codes)
            patch = patches.PathPatch(p, facecolor=color, edgecolor='none')
            ax.add_patch(patch)

# Add white emblem
add_path_to_ax(ax1, e_d, ex, ey, ew/586.0, eh/671.0, color='#ffffff')

# Add white wordmark at x = ex + ew + 12
wh = 28.0
ww = wh * (639.5 / 312.5)
wx = ex + ew + 12.0
wy = ey + (eh - wh) / 2.0
add_path_to_ax(ax1, w_d, wx, wy, ww/639.5, wh/312.5, color='#ffffff')

# Divider and IIT INDORE text
ax1.plot([wx + ww + 10, wx + ww + 10], [wy + 4, wy + wh - 4], color='#3a444a', lw=1)
ax1.text(wx + ww + 18, wy + wh/2.0 + 3, 'IIT INDORE', color='#cdd6db', fontsize=9, fontfamily='monospace', fontweight='bold', va='center')

ax1.set_xlim(0, 360)
ax1.set_ylim(68, 0)
ax1.axis('off')
rect = patches.Rectangle((10, 5), 340, 58, linewidth=1, edgecolor='#232d34', facecolor='none')
ax1.add_patch(rect)

# --- Subplot 2: Hero Enlarged Wordmark ---
ax2.set_facecolor('#101417')
ax2.set_title("2. Hero Centerpiece — Enlarged Mech-E SVG (No Top/Bottom Taglines)", color='#ffffff', fontsize=12, pad=12)

# Draw machine frame border
frame_rect = patches.Rectangle((30, 20), 440, 260, linewidth=1, edgecolor='#203340', facecolor='#12181d')
ax2.add_patch(frame_rect)

# Add enlarged white wordmark
hero_wh = 150.0
hero_ww = hero_wh * (639.5 / 312.5)
hero_wx = 30 + (440 - hero_ww) / 2.0
hero_wy = 20 + (260 - hero_wh) / 2.0

add_path_to_ax(ax2, w_d, hero_wx, hero_wy, hero_ww/639.5, hero_wh/312.5, color='#ffffff')

ax2.set_xlim(0, 500)
ax2.set_ylim(300, 0)
ax2.axis('off')

plt.tight_layout()
plt.savefig('public/assets/branding/final-precision-patch-preview.png', facecolor='#0d0f11', dpi=150)
print('Saved final-precision-patch-preview.png')
