import cv2
import numpy as np
import os

print("=== EXTRACTING BRANDING ASSETS FROM OFFICIAL REFERENCE ===")

# 1. Process Wordmark from Screenshot
wordmark_src = "public/assets/branding/Screenshot 2026-09-28 125938.png"
if os.path.exists(wordmark_src):
    img = cv2.imread(wordmark_src, cv2.IMREAD_GRAYSCALE)
    h, w = img.shape
    scale = 2
    img_up = cv2.resize(img, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
    _, thresh = cv2.threshold(img_up, 128, 255, cv2.THRESH_BINARY)
    
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_L1)
    
    y_idx, x_idx = np.where(thresh > 128)
    min_x, max_x = np.min(x_idx), np.max(x_idx)
    min_y, max_y = np.min(y_idx), np.max(y_idx)
    
    # Add a 2px padding for clean rendering
    pad = 2 * scale
    min_x = max(0, min_x - pad)
    min_y = max(0, min_y - pad)
    max_x = min(w * scale - 1, max_x + pad)
    max_y = min(h * scale - 1, max_y + pad)
    
    vb_w = round((max_x - min_x + 1) / scale, 1)
    vb_h = round((max_y - min_y + 1) / scale, 1)
    
    path_cmds = []
    for c in contours:
        epsilon = 0.5
        approx = cv2.approxPolyDP(c, epsilon, True)
        if len(approx) < 3:
            continue
        pts = (approx.reshape(-1, 2) - [min_x, min_y]) / scale
        cmd = "M " + " L ".join(f"{p[0]:.2f} {p[1]:.2f}" for p in pts) + " Z"
        path_cmds.append(cmd)
        
    full_path = " ".join(path_cmds)
    
    svg_wordmark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb_w} {vb_h}" fill="currentColor" fill-rule="evenodd">
  <path d="{full_path}" />
</svg>'''
    
    with open("public/assets/branding/mechesa-wordmark.svg", "w") as f:
        f.write(svg_wordmark)
    print(f"Generated mechesa-wordmark.svg (viewBox='0 0 {vb_w} {vb_h}', {len(contours)} contours)")

# 2. Process Full Logo & Emblem from ChatGPT Image
full_src = "public/assets/branding/ChatGPT Image Sep 28, 2026, 12_56_17 PM.png"
if os.path.exists(full_src):
    full_img = cv2.imread(full_src)
    gray = cv2.cvtColor(full_img, cv2.COLOR_BGR2GRAY)
    _, thresh_full = cv2.threshold(gray, 110, 255, cv2.THRESH_BINARY)
    
    # Create transparent PNG of the full mark
    b, g, r = cv2.split(full_img)
    # Alpha channel based on luminance
    alpha = thresh_full.copy()
    # Smooth edges slightly
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    bgra = cv2.merge([b, g, r, alpha])
    
    # Find bounding box of all content
    y_idx, x_idx = np.where(thresh_full > 100)
    min_x, max_x = np.min(x_idx), np.max(x_idx)
    min_y, max_y = np.min(y_idx), np.max(y_idx)
    
    pad = 4
    min_x = max(0, min_x - pad)
    min_y = max(0, min_y - pad)
    max_x = min(full_img.shape[1] - 1, max_x + pad)
    max_y = min(full_img.shape[0] - 1, max_y + pad)
    
    cropped_full = bgra[min_y:max_y+1, min_x:max_x+1]
    cv2.imwrite("public/assets/branding/mechesa-logo-transparent.png", cropped_full)
    print(f"Generated mechesa-logo-transparent.png ({cropped_full.shape[1]}x{cropped_full.shape[0]})")
    
    # Isolate Emblem (left region up to where the M starts at x ~ 580)
    # In full_img coordinates, let's find the split between emblem and wordmark
    emblem_thresh = thresh_full.copy()
    emblem_thresh[:, 572:] = 0 # zero out wordmark
    
    ey_idx, ex_idx = np.where(emblem_thresh > 100)
    emin_x, emax_x = np.min(ex_idx), np.max(ex_idx)
    emin_y, emax_y = np.min(ey_idx), np.max(ey_idx)
    
    emin_x = max(0, emin_x - pad)
    emin_y = max(0, emin_y - pad)
    emax_x = min(full_img.shape[1] - 1, emax_x + pad)
    emax_y = min(full_img.shape[0] - 1, emax_y + pad)
    
    cropped_emblem = bgra[emin_y:emax_y+1, emin_x:emax_x+1]
    cv2.imwrite("public/assets/branding/mechesa-emblem-transparent.png", cropped_emblem)
    print(f"Generated mechesa-emblem-transparent.png ({cropped_emblem.shape[1]}x{cropped_emblem.shape[0]})")
    
    # Vectorize Emblem into SVG
    emblem_crop_thresh = emblem_thresh[emin_y:emax_y+1, emin_x:emax_x+1]
    e_contours, _ = cv2.findContours(emblem_crop_thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_L1)
    
    e_paths = []
    for c in e_contours:
        approx = cv2.approxPolyDP(c, 0.6, True)
        if len(approx) < 3:
            continue
        pts = approx.reshape(-1, 2)
        cmd = "M " + " L ".join(f"{p[0]:.1f} {p[1]:.1f}" for p in pts) + " Z"
        e_paths.append(cmd)
        
    e_full_path = " ".join(e_paths)
    evb_w = cropped_emblem.shape[1]
    evb_h = cropped_emblem.shape[0]
    
    svg_emblem = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {evb_w} {evb_h}" fill="currentColor" fill-rule="evenodd">
  <path d="{e_full_path}" />
</svg>'''
    with open("public/assets/branding/mechesa-emblem.svg", "w") as f:
        f.write(svg_emblem)
    print(f"Generated mechesa-emblem.svg (viewBox='0 0 {evb_w} {evb_h}')")

print("=== ALL ASSETS GENERATED SUCCESSFULLY ===")
