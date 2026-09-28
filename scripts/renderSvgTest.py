import matplotlib.pyplot as plt
from matplotlib.path import Path
import matplotlib.patches as patches
import re
import cv2

with open('public/assets/branding/mechesa-wordmark.svg') as f:
    svg_text = f.read()

d_match = re.search(r'd="([^"]+)"', svg_text)
if d_match:
    d = d_match.group(1)
    
fig, ax = plt.subplots(figsize=(10, 5), facecolor='#0d0f11')
ax.set_facecolor('#0d0f11')

# Parse subpaths
subpaths = d.strip().split(' Z')
for sp in subpaths:
    sp = sp.strip()
    if not sp: 
        continue
    tokens = sp.split()
    verts = []
    codes = []
    i = 0
    while i < len(tokens):
        if tokens[i] == 'M':
            verts.append((float(tokens[i+1]), float(tokens[i+2])))
            codes.append(Path.MOVETO)
            i += 3
        elif tokens[i] == 'L':
            verts.append((float(tokens[i+1]), float(tokens[i+2])))
            codes.append(Path.LINETO)
            i += 3
        else:
            i += 1
    if verts:
        verts.append((0, 0))
        codes.append(Path.CLOSEPOLY)
        path = Path(verts, codes)
        patch = patches.PathPatch(path, facecolor='#f2f5f7', edgecolor='none')
        ax.add_patch(patch)

ax.set_xlim(0, 640)
ax.set_ylim(315, -5) # Invert y for SVG coords
ax.axis('off')
plt.tight_layout()
plt.savefig('public/assets/branding/wordmark-render-test.png', facecolor='#0d0f11', dpi=150)
print('Saved wordmark-render-test.png')
