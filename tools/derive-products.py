#!/usr/bin/env python3
"""Turn the product research into what the catalogue is built from.

Reads   research/products/<slug>/product.json and the files beside it.
Writes  media/<slug>/NN-<name>-<width>.webp   photographs, for the screen
        data/products.json                      one record per product

Run it again whenever the research changes:

    python3 tools/derive-products.py

What it decides, and why:

  * The photographs are shown as webp at a few widths, never wider than the
    file they came from, so a phone downloads a phone's worth of pixels.
    The research keeps the originals untouched; the texture downloads link
    to those, at the quality the brand published them.

  * The old site's listing photographs carry its own cut corner, a white
    triangle painted into the top right of the picture. On a page with a
    different corner it reads as a torn edge, so where that triangle is
    found the picture is cropped past it.

  * Colour. The site gave a colour to about half of its stones. For the
    rest the colour is read off the slab's own photograph: the overall hue
    of its surface and how much of it is very dark or very light, which is
    how a person names the colour of a stone, together with any colour
    word in the trade name itself (Jeriba Blue is looked for among the blue
    stones whatever its photograph does). Where the site named one, the
    site's word stands. Each record says which it is (`colour_source`).
"""

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / "research" / "products"
MEDIA = ROOT / "media"
OUT = ROOT / "data" / "products.json"

WIDTHS = (480, 800, 1200, 1600)
QUALITY = 80

# The families the site itself used, in the order a swatch row shows them.
COLOURS = ("white", "cream", "grey", "black", "green", "blue", "pink")

TYPES = {"Granite": "granite", "Quartzite": "quartzite", "Marble": "marble", "Miscellaneous": "other"}


def lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]), 200 * (f[:, 1] - f[:, 2])], 1)


def read_colour(path):
    """The colour of a slab, from the middle of its photograph."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    im = im.crop((int(w * 0.12), int(h * 0.12), int(w * 0.88), int(h * 0.88))).resize((120, 80))
    px = lab(np.asarray(im, dtype=float).reshape(-1, 3))
    lum, a, b = px[:, 0], px[:, 1], px[:, 2]
    level = float(np.median(lum))
    am, bm = float(a.mean()), float(b.mean())
    chroma = float(np.hypot(am, bm))
    hue = (np.degrees(np.arctan2(bm, am)) + 360) % 360
    dark = float((lum < 35).mean())
    light = float((lum > 75).mean())

    green_floor = 3.5 if level < 30 else 4.5
    if chroma >= green_floor and 100 <= hue < 215:
        first = "green"
    elif chroma >= 4.5 and 215 <= hue < 300:
        first = "blue"
    elif chroma >= 6 and (hue >= 330 or hue < 40) and level > 45:
        first = "pink"
    elif chroma >= 5.5 and 40 <= hue < 100:
        first = "cream"
    elif level < 38:
        first = "black"
    elif level > 74:
        first = "white"
    else:
        first = "grey"

    found = [first]
    if first != "black" and dark > 0.3:
        found.append("black")
    if first != "white" and light > 0.3:
        found.append("white")
    return found


# The colour words the trade names use, in the languages they borrow from.
NAME_COLOURS = {
    "black": "black", "nero": "black", "noir": "black", "noire": "black", "negro": "black", "jet": "black",
    "white": "white", "blanco": "white", "bianco": "white", "blanche": "white", "blanc": "white",
    "gray": "grey", "grey": "grey", "silver": "grey", "platinum": "grey",
    "green": "green", "verde": "green", "emerald": "green", "jade": "green",
    "blue": "blue", "azul": "blue", "azzurro": "blue",
    "pink": "pink", "rosa": "pink", "rose": "pink",
    "gold": "cream", "golden": "cream", "brown": "cream", "bronze": "cream", "cream": "cream",
    "beige": "cream", "copper": "cream", "ivory": "cream",
}


def name_colour(name):
    for word in name.lower().replace("-", " ").split():
        if word in NAME_COLOURS:
            return NAME_COLOURS[word]
    return None


def painted_corner(im):
    """Whether the old site's white corner is painted into the top right."""
    w, h = im.size
    rgb = im.convert("RGB")
    probe = [rgb.getpixel((w - 1 - int(w * f), int(h * f))) for f in (0.005, 0.015, 0.03)]
    inside = rgb.getpixel((w - 1 - int(w * 0.2), int(h * 0.2)))
    white = all(min(p) > 244 for p in probe)
    return white and min(inside) < 240


def white_margins(im):
    """The photograph without the white bars it was padded out to a frame with.

    Only bars of pure white running the full length of an edge are taken,
    so the surface of a white stone is never mistaken for one."""
    grey = np.asarray(im.convert("L"), dtype=np.uint8)
    solid = grey >= 250
    rows = np.where(~solid.all(axis=1))[0]
    cols = np.where(~solid.all(axis=0))[0]
    if not len(rows) or not len(cols):
        return im
    top, bottom, left, right = rows[0], rows[-1] + 1, cols[0], cols[-1] + 1
    h, w = grey.shape
    if top + (h - bottom) < h * 0.02 and left + (w - right) < w * 0.02:
        return im
    return im.crop((left, top, right, bottom))


def derive(slug, src, index, name, trim=False):
    """webp copies of one photograph; returns its record."""
    im = Image.open(src)
    im.load()
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    if im.mode == "RGBA":
        ground = Image.new("RGB", im.size, (255, 255, 255))
        ground.paste(im, mask=im.split()[3])
        im = ground
    if painted_corner(im):
        w, h = im.size
        im = im.crop((0, int(h * 0.13), int(w * 0.9), h))
    if trim:
        im = white_margins(im)
    w, h = im.size

    base = f"{index:02d}-{name}"
    out_dir = MEDIA / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    widths = [x for x in WIDTHS if x < w] + [min(w, WIDTHS[-1])]
    widths = sorted(set(widths))
    for width in widths:
        target = out_dir / f"{base}-{width}.webp"
        if not target.exists():
            copy = im if width == w else im.resize((width, round(h * width / w)), Image.LANCZOS)
            copy.save(target, "WEBP", quality=QUALITY, method=6)
    return {"base": f"media/{slug}/{base}", "widths": widths, "width": w, "height": h}


def slugify(filename):
    stem = Path(filename).stem
    stem = stem.split("-", 1)[1] if stem[:2].isdigit() and "-" in stem else stem
    return "".join(ch if ch.isalnum() else "-" for ch in stem.lower()).strip("-")[:48] or "photo"


def site_colours(product):
    value = (product.get("specs") or {}).get("en", {}).get("Colour")
    if isinstance(value, list):
        return [v.lower() for v in value if v.lower() in COLOURS]
    return []


def main():
    records = []
    for path in sorted(RESEARCH.glob("*/product.json")):
        p = json.loads(path.read_text(encoding="utf-8"))
        folder = path.parent
        slug = p["slug"]

        # What the site shows now. A stone it has renamed and moved is
        # carried on under its new name (`merged_into` says which), and one
        # neither of its two sites lists any more is no longer offered. Both
        # stay in the research as the record of what was.
        live = p.get("listed_on_live_site") or {}
        if p.get("merged_into") or (live.get("checked") and live.get("fa") is False and live.get("en") is False):
            continue

        # The slab surface first, then the listing picture only where there
        # is no slab surface, then the photographs of it in place.
        main = [i for i in p["images"] if i["kind"] == "main"]
        listing = [i for i in p["images"] if i["kind"] == "listing"]
        rest = [i for i in p["images"] if i["kind"] in ("project", "quarry")]
        chosen = (main or listing[:1]) + rest

        photos = []
        for n, img in enumerate(chosen, 1):
            record = derive(slug, folder / img["file"], n, slugify(img["file"]),
                            trim=img["kind"] in ("project", "quarry"))
            record["kind"] = img["kind"]
            record["alt"] = {"fa": img.get("alt_fa") or p["name"]["fa"], "en": img.get("alt") or p["name"]["en"]}
            photos.append(record)

        surface = None

        textures = []
        for t in p["textures"]:
            # Where the site's texture download is the product photograph
            # itself, the research keeps the file once, under images/, which is
            # not published. The copy people download goes out with the
            # photographs instead, byte for byte.
            file = f"research/products/{slug}/{t['file']}"
            if t["file"].startswith("images/"):
                source = folder / t["file"]
                copy = MEDIA / slug / f"texture-{source.name}"
                if not copy.exists() or copy.stat().st_size != source.stat().st_size:
                    copy.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(source, copy)
                file = str(copy.relative_to(ROOT))
            textures.append({
                "file": file,
                "width": t.get("width"),
                "height": t.get("height"),
                "bytes": t.get("bytes"),
                "format": t.get("format"),
            })

        colours = site_colours(p)
        source = "site"
        if not colours:
            source = "photograph"
            probe = (main[:1] or [dict(file=t["file"]) for t in p["textures"][:1]] or listing[:1])
            colours = read_colour(folder / probe[0]["file"]) if probe else []
            # A colour the trade name says is how the stone is sold, and a
            # reader looking for blue stones expects Jeriba Blue among them.
            said = name_colour(p["name"]["en"])
            if said:
                colours = [said] + [c for c in colours if c != said]
                source = "photograph and name" if probe else "name"
            elif not probe:
                source = None
        colours = colours[:3]

        en = (p.get("specs") or {}).get("en", {})
        fa = (p.get("specs") or {}).get("fa", {})
        legacy = p.get("legacy") or {}
        records.append({
            "slug": slug,
            "name": p["name"],
            "site_name": (p.get("site_names") or {}),
            "legacy_names": sorted(set((legacy.get("names_fa") or []) + (legacy.get("names_en") or []))),
            "category": p["category"],
            "type": TYPES.get(en.get("Type"), "other" if en.get("Type") else None),
            "type_label": {"fa": fa.get("نوع"), "en": en.get("Type")},
            "origin": {"fa": fa.get("کشور مبدا"), "en": en.get("Origin")},
            "specs": {"fa": fa, "en": en},
            "colours": colours,
            "colour_source": source,
            "description": p.get("description") if (p.get("description") or {}).get("fa") or (p.get("description") or {}).get("en") else None,
            "photos": photos,
            "surface": surface,
            "textures": textures,
        })

    # The band at the head of the listing: twelve stones whose texture file
    # is sharp enough to fill it, taken in turn from each colour so that no
    # two neighbours look alike. Only these get the large copies.
    by_colour = {c: [] for c in COLOURS}
    for r in records:
        t = r["textures"][0] if r["textures"] else None
        if t and (t.get("width") or 0) >= 1400 and r["colours"]:
            by_colour[r["colours"][0]].append(r)
    band = []
    while len(band) < 12 and any(by_colour.values()):
        for c in ("green", "white", "black", "cream", "blue", "grey", "pink"):
            if by_colour[c] and len(band) < 12:
                band.append(by_colour[c].pop(0))
    for n, r in enumerate(band):
        surface = derive(r["slug"], ROOT / r["textures"][0]["file"], 99, "surface")
        surface["widths"] = [w for w in surface["widths"] if w >= 1200] or surface["widths"][-1:]
        r["surface"] = dict(surface, order=n)
    for f in MEDIA.glob("*/99-surface-*.webp"):
        if not any(r["slug"] == f.parent.name for r in band) or int(f.stem.rsplit("-", 1)[1]) < 1200 and len(list(f.parent.glob("99-surface-*.webp"))) > 1:
            f.unlink()

    # media/ is this script's output and nothing else's, so a copy no record
    # points at is left over from an earlier run: a stone no longer offered,
    # or a photograph since replaced or renumbered. Left there it would go on
    # being published.
    wanted = set()
    for r in records:
        for ph in r["photos"] + ([r["surface"]] if r["surface"] else []):
            wanted.update(ROOT / f"{ph['base']}-{w}.webp" for w in ph["widths"])
        wanted.update(ROOT / t["file"] for t in r["textures"] if t["file"].startswith("media/"))
    for f in MEDIA.glob("*/*"):
        if f not in wanted:
            f.unlink()
    for d in MEDIA.iterdir():
        if d.is_dir() and not any(d.iterdir()):
            d.rmdir()

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(records, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    derived = sum(1 for r in records if r["colour_source"] == "photograph")
    print(f"{len(records)} products, {sum(len(r['photos']) for r in records)} photographs, "
          f"{sum(len(r['textures']) for r in records)} textures, colour read from the photograph for {derived}")


if __name__ == "__main__":
    main()
