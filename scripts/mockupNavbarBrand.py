import cv2
import numpy as np

# Create a canvas of navbar height 68px, width 320px, dark background #0d0f11
h, w = 68, 360
canvas = np.full((h, w, 3), (17, 15, 13), dtype=np.uint8) # BGR for #0d0f11

# Border right
cv2.line(canvas, (w-1, 0), (w-1, h), (40, 36, 32), 1)

# Option A: Emblem (36px high) + Wordmark (30px high)
emblem = cv2.imread('public/assets/branding/mechesa-emblem-transparent.png', cv2.IMREAD_UNCHANGED)
wordmark = cv2.imread('public/assets/branding/clean-wordmark-preview.png', cv2.IMREAD_UNCHANGED)

# Resize emblem to height 38
eh, ew = 38, int(38 * (429 / 657))
emb_resized = cv2.resize(emblem, (ew, eh), interpolation=cv2.INTER_AREA)

# Resize wordmark to height 30
wh, ww = 30, int(30 * (639.5 / 312.5))
wm_resized = cv2.resize(wordmark, (ww, wh), interpolation=cv2.INTER_AREA)

# Composite Option 1
x_start = 18
y_emb = (h - eh) // 2
for c in range(3):
    alpha = emb_resized[:, :, 3] / 255.0
    canvas[y_emb:y_emb+eh, x_start:x_start+ew, c] = (
        alpha * emb_resized[:, :, c] + (1 - alpha) * canvas[y_emb:y_emb+eh, x_start:x_start+ew, c]
    )

x_wm = x_start + ew + 12
y_wm = (h - wh) // 2
for c in range(3):
    alpha = (wm_resized[:, :, 0] > 20).astype(float)
    canvas[y_wm:y_wm+wh, x_wm:x_wm+ww, c] = (
        alpha * 240 + (1 - alpha) * canvas[y_wm:y_wm+wh, x_wm:x_wm+ww, c]
    )

# Subtitle line: IIT INDORE
# Text with cv2
cv2.putText(canvas, "IIT INDORE", (x_wm + ww + 14, y_wm + 19), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (140, 160, 175), 1, cv2.LINE_AA)
cv2.line(canvas, (x_wm + ww + 8, y_wm + 5), (x_wm + ww + 8, y_wm + 25), (60, 55, 50), 1)

cv2.imwrite('public/assets/branding/navbar-brand-mockup.png', canvas)
print('Saved navbar-brand-mockup.png')
