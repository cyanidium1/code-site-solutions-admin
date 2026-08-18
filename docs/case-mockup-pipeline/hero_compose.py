"""Grontland hero composition, v3.

- Laptop: quad from edge fits (validated visually).
- Phone: glass-top line + side lines; bottom edge pushed below the laptop-deck
  overlap (the deck hides the phone's true bottom), so no old content peeks out.
- Dynamic island is drawn onto the source screenshot pre-warp (no restores).
- Bezel band + deck + notch reclaimed from the base after pasting.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

LAP_QUAD = [(592.2, 201.8), (1179.0, 226.3), (1093.2, 684.0), (506.1, 622.0)]
PH_QUAD = [(85.0, 342.6), (316.3, 336.2), (506.2, 766.1), (302.0, 858.0)]
LAP_TOP_LINE = (0.0417, 177.1)  # y = a*x + b  (notch reclaim band)


def expand_quad(quad, px):
    cx = sum(p[0] for p in quad) / 4
    cy = sum(p[1] for p in quad) / 4
    out = []
    for (x, y) in quad:
        dx, dy = x - cx, y - cy
        n = (dx * dx + dy * dy) ** 0.5
        out.append((x + dx / n * px, y + dy / n * px))
    return out


def persp_coeffs(quad, w, h):
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    A, B = [], []
    for (u, v), (X, Y) in zip(src, quad):
        A.append([X, Y, 1, 0, 0, 0, -u * X, -u * Y]); B.append(u)
        A.append([0, 0, 0, X, Y, 1, -v * X, -v * Y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float))


def rescale(c, s):
    a, b, cc, d, e, f, g, h = c
    return [a / s, b / s, cc, d / s, e / s, f, g / s, h / s]


def draw_dynamic_island(shot):
    """Draw an iPhone dynamic island onto the (1170x2532-ish) screenshot."""
    s = 4
    w, h = 380 * s, 116 * s
    tile = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=57 * s, fill=(5, 5, 7, 255))
    cx, cy = w - 55 * s, h // 2
    d.ellipse([cx - 40 * s, cy - 40 * s, cx + 40 * s, cy + 40 * s],
              fill=(13, 16, 24, 255))
    d.ellipse([cx - 18 * s, cy - 18 * s, cx + 18 * s, cy + 18 * s],
              fill=(6, 7, 10, 255))
    d.ellipse([cx + 2 * s, cy - 12 * s, cx + 12 * s, cy - 2 * s],
              fill=(58, 84, 122, 255))
    d.ellipse([cx - 12 * s, cy + 2 * s, cx - 4 * s, cy + 10 * s],
              fill=(38, 58, 88, 255))
    tile = tile.resize((380, 116), Image.LANCZOS)
    out = shot.convert("RGBA")
    out.paste(tile, (out.width // 2 - 190, 28), tile)
    return out


def paste_screen(base, shot, quad, radius, overdraw=2.5, ss=2, inset=0):
    W, H = base.size
    q = expand_quad(quad, overdraw)
    coeffs = persp_coeffs(q, shot.width, shot.height)
    warped = shot.convert("RGBA").transform(
        (W * ss, H * ss), Image.PERSPECTIVE, rescale(coeffs, ss), Image.BICUBIC)
    mask = Image.new("L", shot.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [inset, inset, shot.width - 1 - inset, shot.height - 1 - inset],
        radius=radius, fill=255)
    wmask = mask.transform(
        (W * ss, H * ss), Image.PERSPECTIVE, rescale(coeffs, ss), Image.BICUBIC)
    warped = warped.resize((W, H), Image.LANCZOS)
    wmask = wmask.resize((W, H), Image.LANCZOS)
    base.paste(warped, (0, 0), wmask)
    return wmask


def paint_glass_black(base, shot_size, quad, radius,
                      color=(10, 10, 12, 255), overdraw=5.0, ss=2):
    """Fill the whole warped glass area with bezel black. The content is then
    pasted inset, leaving a clean painted bezel ring - covers every old-content
    remnant inside the glass without color heuristics."""
    W, H = base.size
    w, h = shot_size
    q = expand_quad(quad, overdraw)
    coeffs = persp_coeffs(q, w, h)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, w - 1, h - 1], radius=radius, fill=255)
    wmask = mask.transform((W * ss, H * ss), Image.PERSPECTIVE,
                           rescale(coeffs, ss), Image.BICUBIC)
    wmask = wmask.resize((W, H), Image.LANCZOS)
    solid = Image.new("RGBA", (W, H), color)
    base.paste(solid, (0, 0), wmask)
    return wmask


def reclaim_notch(base_orig, result, area_mask):
    W, H = base_orig.size
    orig = np.asarray(base_orig.convert("RGB")).astype(int)
    lum = orig.sum(axis=2) / 3.0
    ys, xs = np.mgrid[0:H, 0:W]
    a, b = LAP_TOP_LINE
    m = (lum < 100) & (ys > a * xs + b - 4) & (ys < a * xs + b + 16)
    m &= (np.asarray(area_mask) > 40) & (xs >= 810) & (xs <= 925)
    mi = Image.fromarray((m * 255).astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(9))
    result.paste(base_orig, (0, 0), mi)


def reclaim_bezel_band(base_orig, result, quad, width=26, lum_thr=90):
    """Re-sharpen the dark bezel over the paste overdraw along quad edges.
    Chroma-aware: only neutral dark pixels count (the old screen photo is
    maroon = chromatic, and must NOT be restored)."""
    W, H = base_orig.size
    band = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(band)
    pts = [tuple(p) for p in quad] + [tuple(quad[0])]
    d.line(pts, fill=255, width=width, joint="curve")
    orig = np.asarray(base_orig.convert("RGB")).astype(int)
    chroma = orig.max(axis=2) - orig.min(axis=2)
    # neutral pixels at any luminance: bezel (dark), titanium frame highlight
    # (light) and old white content (invisible swap). The old photo is
    # chromatic and stays excluded; stray AA specks get absorbed by the grow.
    m = (np.asarray(band) > 0) & (chroma < 25)
    mi = Image.fromarray((m * 255).astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(9))
    mi = Image.fromarray(np.minimum(np.asarray(mi), np.asarray(band)))
    mi = mi.filter(ImageFilter.GaussianBlur(0.6))
    result.paste(base_orig, (0, 0), mi)


def reclaim_deck(base_orig, result, area_mask, y_min=680, lum_thr=150):
    W, H = base_orig.size
    orig = np.asarray(base_orig.convert("RGB")).astype(int)
    lum = orig.sum(axis=2) / 3.0
    ys, xs = np.mgrid[0:H, 0:W]
    m = (lum < lum_thr) & (ys >= y_min) & (np.asarray(area_mask) > 10)
    mi = Image.fromarray((m * 255).astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(17))
    mi = mi.filter(ImageFilter.GaussianBlur(0.8))
    result.paste(base_orig, (0, 0), mi)


if __name__ == "__main__":
    base = Image.open("domlivo-hero-full.png").convert("RGBA")
    base_orig = base.copy()

    desk = Image.open("../shots/desk-home.png")
    mob = draw_dynamic_island(Image.open("../shots/mob-home-tall.png"))

    lap_mask = paste_screen(base, desk, LAP_QUAD, radius=22, overdraw=1.5)
    glass_mask = paint_glass_black(base, mob.size, PH_QUAD, radius=155)
    paste_screen(base, mob, PH_QUAD, radius=130, overdraw=0.0, inset=28)

    reclaim_notch(base_orig, base, lap_mask)
    reclaim_deck(base_orig, base, glass_mask, y_min=640)

    base.save("grontland-hero.png")
    print("saved grontland-hero.png", base.size)
