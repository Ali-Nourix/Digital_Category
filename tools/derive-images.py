"""
Build the catalogue's image set from the client's originals.

The print PDF places every photograph cropped to an InDesign frame, so the
images embedded in the PDF are sub-rectangles of the real thing. Those are not
what ships: for each one the matching original was found in the client's zip
and that is what is resized here; the mapping below is the record of it.

One source file becomes several widths of the same webp. Nothing is cropped:
the page decides the crop with object-fit, so the same file serves a portrait
slot on a phone and a full bleed plate on a desktop.
"""

from PIL import Image
import json, os, sys

Image.MAX_IMAGE_PIXELS = None

# The client's zip is 88 MB and lives on the `source-material` branch, not
# here. Unpack it somewhere and pass that directory as the first argument;
# the second argument is where the derived images go.
SRC = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "images")

# slug -> (source file, widths)
# PLATE  full bleed, can fill a 1920 viewport
# PANEL  a column or half of a spread
# INSET  a small figure in a grid, or a portrait
PLATE = (960, 1440, 2048)
PANEL = (640, 1024, 1536)
INSET = (400, 800)

IMAGES = {
    # --- About Us -------------------------------------------------------
    "quarry-white-cut":          ("madan 11.webp", PLATE),
    "kitchen-grey-granite":      ("0-7a.webp", PLATE),
    "kitchen-dark-veined":       ("6a0182f426f18.webp", PLATE),
    "factory-multiwire-hall":    ("factory 6.webp", PLATE),
    # the eight small figures between the two advantage columns
    "quarry-aerial-pool":        ("444.webp", INSET),
    "loader-carrying-block":     ("madan 5.webp", INSET),
    "quarry-fluted-face":        ("madan 2a.webp", INSET),
    "quarry-excavators":         ("madan 6a.webp", INSET),
    "driller-at-face":           ("IMG_0960.webp", INSET),
    "multiwire-cutting":         ("factory 4.webp", INSET),
    "slab-storage-hall":         ("factory 7.webp", INSET),
    "block-yard-crane":          ("factory 1.webp", INSET),
    "lounge-green-panel":        ("1 tif.webp", PLATE),
    "quarry-valley":             ("madan 3-b.webp", PLATE),
    "quarry-loader-wall":        ("madan 1.webp", PLATE),
    # --- Two Generations ------------------------------------------------
    "portrait-naseri-zadeh":     ("IMG_8649.webp", INSET),
    "portrait-pedram":           ("IMG_8647.webp", INSET),
    "portrait-tannaz":           ("IMG_7865.webp", INSET),
    # --- 12 mm slabs ----------------------------------------------------
    "factory-multiwire-blades":  ("factory 2.webp", PLATE),
    # --- Granite and quartzite ------------------------------------------
    "granite-slab-display":      ("1.webp", PANEL),
    "granite-bathroom-vanity":   ("IMG_2404.JPG.webp", PANEL),
    "granite-shower-wall":       ("IMG_2405.JPG.webp", PANEL),
    "quartzite-raw-blocks":      ("IMG_8819.webp", PANEL),
    "quartzite-countertop-edge": ("IMG_8821.webp", PANEL),
    "quartzite-block-display":   ("111.webp", PANEL),
    # --- Closing plates -------------------------------------------------
    "kitchen-black-white-island":  ("3.webp", PLATE),
    "kitchen-silver-vein-island":  ("6.webp", PLATE),
    "kitchen-black-terrazzo":      ("6a0179fd2365e.webp", PLATE),
    "counter-dark-green-sink":     ("Black Tempest kitchen (1).jpg.webp", PLATE),
    "powder-room-grey-stone":      ("1 (2).webp", PLATE),
}

os.makedirs(OUT, exist_ok=True)
manifest = {}
total = 0
for slug, (src, widths) in sorted(IMAGES.items()):
    path = os.path.join(SRC, src)
    im = Image.open(path).convert("RGB")
    made = []
    for w in widths:
        # Never upscale. A 496px portrait stays 496px rather than being
        # interpolated up to a width the file cannot honestly fill, and the
        # duplicate that would otherwise land at the next step up is skipped
        # so the srcset never offers two names for one picture.
        tw = min(w, im.width)
        if any(tw == prev for prev, _ in made):
            continue
        th = max(1, round(im.height * tw / im.width))
        out = os.path.join(OUT, f"{slug}-{tw}.webp")
        im.resize((tw, th), Image.LANCZOS).save(out, "WEBP", quality=74, method=6)
        made.append((tw, th))
        size = os.path.getsize(out)
        total += size
        print(f"{slug:-<32} {w:>5} -> {tw:>5}x{th:<5} {size/1024:7.1f} KB")
    manifest[slug] = {
        "source": src,
        "widths": [w for w, _ in made],
        "width": made[-1][0],
        "height": made[-1][1],
    }
    print()

with open(os.path.join(OUT, "manifest.json"), "w") as fh:
    json.dump(manifest, fh, indent=2, sort_keys=True)
    fh.write("\n")

print(f"{len(IMAGES)} images, {total/1048576:.1f} MB total")
