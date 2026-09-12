"""
Generates visual benchmark image pairs for the Closed-Loop CV Verification System.
Produces authentic baseline, hazard, deficient repair, and verified repair visual assets.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def create_road_base():
    """Create asphalt road background with texture."""
    img = Image.new("RGB", (256, 256), color=(50, 50, 55))
    draw = ImageDraw.Draw(img)
    # Add subtle asphalt texture noise
    import random
    random.seed(42)
    for _ in range(3000):
        x = random.randint(0, 255)
        y = random.randint(0, 255)
        shade = random.randint(40, 65)
        draw.point((x, y), fill=(shade, shade, shade))
    return img

def generate_fixtures():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. Safe Baseline Road (Clean surface with bright thermoplastic lane markings)
    img_base = create_road_base()
    draw_base = ImageDraw.Draw(img_base)
    # Yellow center double lines
    draw_base.line([(124, 0), (124, 256)], fill=(255, 204, 0), width=3)
    draw_base.line([(132, 0), (132, 256)], fill=(255, 204, 0), width=3)
    # White edge line
    draw_base.line([(20, 0), (20, 256)], fill=(240, 240, 240), width=4)
    draw_base.line([(236, 0), (236, 256)], fill=(240, 240, 240), width=4)
    img_base.save(os.path.join(OUTPUT_DIR, "baseline_safe_road.jpg"), "JPEG")

    # 2. Hazard: Severe Pothole Cluster
    img_hazard = img_base.copy()
    draw_haz = ImageDraw.Draw(img_hazard)
    # Draw large dark crater pothole with jagged edges
    draw_haz.ellipse([140, 80, 210, 160], fill=(20, 18, 18), outline=(10, 8, 8), width=3)
    draw_haz.ellipse([60, 150, 110, 200], fill=(22, 20, 20), outline=(12, 10, 10), width=2)
    # Cracks
    draw_haz.line([(135, 75), (105, 50)], fill=(25, 25, 25), width=2)
    draw_haz.line([(212, 155), (240, 190)], fill=(25, 25, 25), width=2)
    img_hazard.save(os.path.join(OUTPUT_DIR, "hazard_severe_potholes.jpg"), "JPEG")

    # 3. Deficient Repair: Cosmetic Dirt/Gravel Patch (Rejected by Siamese Network)
    img_deficient = img_base.copy()
    draw_def = ImageDraw.Draw(img_deficient)
    # Sloppy uneven mud/gravel patch
    draw_def.ellipse([135, 75, 215, 165], fill=(95, 75, 55), outline=(110, 85, 60), width=3)
    draw_def.ellipse([55, 145, 115, 205], fill=(90, 70, 50), outline=(105, 80, 55), width=2)
    img_deficient.save(os.path.join(OUTPUT_DIR, "rejected_cosmetic_patch.jpg"), "JPEG")

    # 4. Verified Repair: Hot-Mix Asphalt Resurfacing (Verified by Siamese Network)
    img_verified = img_base.copy()
    draw_ver = ImageDraw.Draw(img_verified)
    # Smooth newly rolled dark patch matching baseline asphalt
    draw_ver.rectangle([130, 70, 220, 170], fill=(48, 48, 52))
    draw_ver.rectangle([50, 140, 120, 210], fill=(48, 48, 52))
    # Redraw crisp thermoplastic line over patch
    draw_ver.line([(132, 70), (132, 170)], fill=(255, 204, 0), width=3)
    img_verified.save(os.path.join(OUTPUT_DIR, "verified_resurfaced_road.jpg"), "JPEG")

    print(f"Generated 4 CV benchmark images in {OUTPUT_DIR}")

if __name__ == "__main__":
    generate_fixtures()
