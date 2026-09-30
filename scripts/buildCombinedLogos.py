import cv2
import numpy as np
import re
import shutil

with open('public/assets/branding/mechesa-emblem.svg') as f:
    emblem_svg = f.read()
with open('public/assets/branding/mechesa-wordmark.svg') as f:
    wordmark_svg = f.read()

emblem_path = re.search(r'd="([^"]+)"', emblem_svg).group(1)
wordmark_path = re.search(r'd="([^"]+)"', wordmark_svg).group(1)

# In the ChatGPT Image (1024 x 1536),
# Emblem bounds: x = [151, 724], y = [156, 814]
# Wordmark bounds: x = [580, 1347], y = [419, 788]
# Total combined bounds:
# min_x = 151, max_x = 1347 => width = 1197
# min_y = 156, max_y = 814 => height = 659
# Offset from original image:
# For emblem: offset x = -151, offset y = -156
# For wordmark: offset x = -151, offset y = -156
# That means in the combined SVG:
# viewBox="0 0 1205 667"
# Emblem path translates by (0, 0)
# Wordmark path is placed relative to emblem!

# Let's extract the full combined vector directly from the ChatGPT Image in one single pass!
img = cv2.imread('public/assets/branding/ChatGPT Image Sep 28, 2026, 12_56_17 PM.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY)

y_idx, x_idx = np.where(thresh > 100)
min_x, max_x = x_idx.min(), x_idx.max()
min_y, max_y = y_idx.min(), y_idx.max()

pad = 6
min_x = max(0, min_x - pad)
min_y = max(0, min_y - pad)
max_x = min(img.shape[1] - 1, max_x + pad)
max_y = min(img.shape[0] - 1, max_y + pad)

cw = max_x - min_x + 1
ch = max_y - min_y + 1

crop = thresh[min_y:max_y+1, min_x:max_x+1]

scale = 2
crop_up = cv2.resize(crop, (cw * scale, ch * scale), interpolation=cv2.INTER_CUBIC)
_, crop_thresh_up = cv2.threshold(crop_up, 128, 255, cv2.THRESH_BINARY)

# Find connected components to separate emblem and wordmark paths
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(crop)

emblem_paths = []
wordmark_paths = []

# Crop up contours
contours, hierarchy = cv2.findContours(crop_thresh_up, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

for c in contours:
    area = cv2.contourArea(c) / (scale * scale)
    if area < 8:
        continue
    eps = 1.6 if area > 200 else 1.0
    approx = cv2.approxPolyDP(c, eps * scale, True)
    if len(approx) < 3:
        continue
    pts = approx.reshape(-1, 2) / scale
    cmd = "M " + " L ".join(f"{p[0]:.1f} {p[1]:.1f}" for p in pts) + " Z"
    # Classify by center of mass
    center_x = pts[:, 0].mean()
    center_y = pts[:, 1].mean()
    # Wordmark is at x > 425 and y > 240
    if (center_x > 425 and center_y > 240) or center_x > 600:
        wordmark_paths.append(cmd)
    else:
        emblem_paths.append(cmd)

full_emblem_d = " ".join(emblem_paths)
full_wordmark_d = " ".join(wordmark_paths)

# 1. meche-logo-white.svg: 100% monochrome white
svg_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {cw} {ch}" fill="#ffffff" fill-rule="evenodd" aria-label="Mech-E Student Association Logo">
  <path fill-rule="evenodd" d="{full_emblem_d} {full_wordmark_d}" />
</svg>'''

with open('public/assets/branding/meche-logo-white.svg', 'w') as f:
    f.write(svg_white)
print(f"Generated meche-logo-white.svg ({cw}x{ch})")

# 2. meche-logo-blue.svg: Emblem in brand blue, Wordmark in white
svg_blue = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {cw} {ch}" fill-rule="evenodd" aria-label="Mech-E Student Association Logo">
  <path fill="#2b7bc4" fill-rule="evenodd" d="{full_emblem_d}" />
  <path fill="#ffffff" fill-rule="evenodd" d="{full_wordmark_d}" />
</svg>'''

with open('public/assets/branding/meche-logo-blue.svg', 'w') as f:
    f.write(svg_blue)
print(f"Generated meche-logo-blue.svg ({cw}x{ch})")

# 3. Reference image copy
shutil.copy('public/assets/branding/ChatGPT Image Sep 28, 2026, 12_56_17 PM.png', 'public/assets/branding/meche-logo-reference.png')
print("Created meche-logo-reference.png")
