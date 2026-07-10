import os
import glob
from PIL import Image
import numpy as np

def get_signature(img_path):
    with Image.open(img_path) as img:
        img = img.convert('L').resize((32, 32), Image.Resampling.LANCZOS)
        return np.array(img, dtype=np.float32)

high_res_dir = r"c:\yazilim_projeler\zPompaj_DHES\docs\pdhes_site_gorselleri_webp"
public_dir = r"c:\yazilim_projeler\zPompaj_DHES\app\public\pdhes-nedir"

# Find all high res images
high_res_images = glob.glob(os.path.join(high_res_dir, "**", "*.webp"), recursive=True)
print(f"Found {len(high_res_images)} high-res images")

# Precompute signatures
hr_sigs = []
for hr in high_res_images:
    try:
        hr_sigs.append((hr, get_signature(hr)))
    except Exception as e:
        print(f"Error loading {hr}: {e}")

# Process public images
for i in range(1, 21):
    pub_img = os.path.join(public_dir, f"img-{i}.webp")
    if not os.path.exists(pub_img):
        continue
    
    pub_sig = get_signature(pub_img)
    
    best_match = None
    best_error = float('inf')
    
    for hr, hr_sig in hr_sigs:
        error = np.mean(np.abs(pub_sig - hr_sig))
        if error < best_error:
            best_error = error
            best_match = hr
            
    print(f"img-{i}.webp matched with {os.path.basename(best_match)} (Error: {best_error:.2f})")
    
    # Crop and replace
    with Image.open(best_match) as img:
        # NotebookLM watermark is at the bottom. Let's crop bottom 50 pixels.
        width, height = img.size
        # Crop box: (left, upper, right, lower)
        cropped = img.crop((0, 0, width, height - 52))
        cropped.save(pub_img, "WEBP", quality=90)

print("Done replacing images!")
