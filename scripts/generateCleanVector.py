import cv2
import numpy as np
import os
import matplotlib.pyplot as plt
from matplotlib.path import Path
import matplotlib.patches as patches

# 1. Load screenshot
img = cv2.imread('public/assets/branding/Screenshot 2026-09-28 125938.png', cv2.IMREAD_GRAYSCALE)
h, w = img.shape
scale = 2
img_up = cv2.resize(img, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
_, thresh = cv2.threshold(img_up, 128, 255, cv2.THRESH_BINARY)

# Find contours with tree hierarchy
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

y_idx, x_idx = np.where(thresh > 128)
min_x, max_x = np.min(x_idx), np.max(x_idx)
min_y, max_y = np.min(y_idx), np.max(y_idx)

pad = 4 * scale
min_x = max(0, min_x - pad)
min_y = max(0, min_y - pad)
max_x = min(w * scale - 1, max_x + pad)
max_y = min(h * scale - 1, max_y + pad)

vb_w = round((max_x - min_x + 1) / scale, 1)
vb_h = round((max_y - min_y + 1) / scale, 1)

path_cmds = []

# Group outer contours and inner holes
for i, c in enumerate(contours):
    # Epsilon based on contour size: smaller letters need slightly tighter eps to preserve small holes
    area = cv2.contourArea(c) / (scale * scale)
    if area < 5:
        continue
    eps = 1.6 if area > 200 else 1.0
    approx = cv2.approxPolyDP(c, eps * scale, True)
    if len(approx) < 3:
        continue
    pts = (approx.reshape(-1, 2) - [min_x, min_y]) / scale
    cmd = "M " + " L ".join(f"{p[0]:.2f} {p[1]:.2f}" for p in pts) + " Z"
    path_cmds.append(cmd)

full_path = " ".join(path_cmds)

svg_clean = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb_w} {vb_h}" fill="currentColor" fill-rule="evenodd">
  <path fill-rule="evenodd" d="{full_path}" />
</svg>'''

with open("public/assets/branding/mechesa-wordmark.svg", "w") as f:
    f.write(svg_clean)

print(f"Generated clean mechesa-wordmark.svg with {len(path_cmds)} contours, viewBox 0 0 {vb_w} {vb_h}")

# Render to check with matplotlib
fig, ax = plt.subplots(figsize=(12, 6), facecolor='#0d0f11')
ax.set_facecolor('#0d0f11')

all_verts = []
all_codes = []

for cmd in path_cmds:
    tokens = cmd.strip().split()
    i = 0
    while i < len(tokens):
        if tokens[i] == 'M':
            all_verts.append((float(tokens[i+1]), float(tokens[i+2])))
            all_codes.append(Path.MOVETO)
            i += 3
        elif tokens[i] == 'L':
            all_verts.append((float(tokens[i+1]), float(tokens[i+2])))
            all_codes.append(Path.LINETO)
            i += 3
        elif tokens[i] == 'Z':
            all_verts.append((0, 0))
            all_codes.append(Path.CLOSEPOLY)
            i += 1
        else:
            i += 1

path = Path(all_verts, all_codes)
patch = patches.PathPatch(path, facecolor='#f2f5f7', edgecolor='none')
ax.add_patch(patch)

ax.set_xlim(0, vb_w)
ax.set_ylim(vb_h, 0)
ax.axis('off')
plt.tight_layout()
plt.savefig('public/assets/branding/clean-wordmark-preview.png', facecolor='#0d0f11', dpi=180)
print("Saved clean-wordmark-preview.png")
