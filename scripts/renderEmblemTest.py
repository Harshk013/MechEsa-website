import matplotlib.pyplot as plt
from matplotlib.path import Path
import matplotlib.patches as patches
import re

with open('public/assets/branding/mechesa-emblem.svg') as f:
    svg_text = f.read()

d_match = re.search(r'd="([^"]+)"', svg_text)
if d_match:
    d = d_match.group(1)
    
fig, ax = plt.subplots(figsize=(6, 8), facecolor='#0d0f11')
ax.set_facecolor('#0d0f11')

all_verts = []
all_codes = []

for sp in d.strip().split(' Z'):
    sp = sp.strip()
    if not sp: 
        continue
    tokens = sp.split()
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
        else:
            i += 1
    all_verts.append((0, 0))
    all_codes.append(Path.CLOSEPOLY)

path = Path(all_verts, all_codes)
patch = patches.PathPatch(path, facecolor='#ffffff', edgecolor='none')
ax.add_patch(patch)
ax.set_xlim(0, 430)
ax.set_ylim(660, 0)
ax.axis('off')
plt.tight_layout()
plt.savefig('public/assets/branding/emblem-vector-preview.png', facecolor='#0d0f11', dpi=150)
print('Saved emblem-vector-preview.png')
