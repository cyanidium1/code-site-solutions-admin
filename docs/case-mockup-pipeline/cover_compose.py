"""Grontland cover composition (base: domlivo cover 2884x2058).

Order: recolor bg emerald->leaf, paint phone glass, paste phone content
(galleri, island drawn), paste laptop content (projekter), reclaim notch,
reclaim laptop body over the phone's occluded bottom-right.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from hero_compose import (expand_quad, persp_coeffs, rescale, paste_screen,
                      paint_glass_black, draw_dynamic_island)

LAP_QUAD = [(1357, 244), (2603, 293), (2421, 1267), (1173, 1137)]
PH_QUAD = [(293.0, 558.0), (766.8, 510.1), (1229.1, 1561.3), (741.0, 1619.9)]
LAP_TOP_LINE = (0.0393, 190.9)   # y = a*x + b
NOTCH_X = (1800, 2060)


def recolor_bg(img):
    """Shift the emerald background/shadow to Grontland leaf green."""
    hsv = np.asarray(img.convert("HSV")).astype(int)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = (H >= 95) & (H <= 135) & (S > 45)
    H = np.where(m, (H - 49) % 256, H)
    S = np.where(m, S * 0.61, S)
    V = np.where(m, np.minimum(V * 0.933, 255), V)
    out = np.stack([H, S, V], axis=-1).astype(np.uint8)
    return Image.merge("HSV", [Image.fromarray(out[..., i]) for i in range(3)]).convert("RGBA")


def reclaim_notch(base_orig, result, area_mask):
    W, H = base_orig.size
    orig = np.asarray(base_orig.convert("RGB")).astype(int)
    lum = orig.sum(axis=2) / 3.0
    ys, xs = np.mgrid[0:H, 0:W]
    a, b = LAP_TOP_LINE
    m = (lum < 100) & (ys > a * xs + b - 8) & (ys < a * xs + b + 40)
    m &= (np.asarray(area_mask) > 40) & (xs >= NOTCH_X[0]) & (xs <= NOTCH_X[1])
    mi = Image.fromarray((m * 255).astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(13))
    result.paste(base_orig, (0, 0), mi)


def reclaim_laptop_body(base_orig, result, glass_mask):
    """The laptop (in front) occludes the phone's bottom-right. Restore dark
    laptop pixels inside the phone glass area."""
    W, H = base_orig.size
    orig = np.asarray(base_orig.convert("RGB")).astype(int)
    lum = orig.sum(axis=2) / 3.0
    ys, xs = np.mgrid[0:H, 0:W]
    m = (lum < 150) & (np.asarray(glass_mask) > 10) & ((ys > 1300) | (xs > 1080))
    mi = Image.fromarray((m * 255).astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(15))
    mi = mi.filter(ImageFilter.GaussianBlur(1.0))
    result.paste(base_orig, (0, 0), mi)


if __name__ == "__main__":
    base_orig = Image.open("domlivo-cover-full.png").convert("RGBA")
    base = recolor_bg(base_orig)
    base_orig_recolored = base.copy()

    desk = Image.open("../shots/desk-projekter.png")
    mob = draw_dynamic_island(Image.open("../shots/mob-galleri-tall.png"))

    glass_mask = paint_glass_black(base, mob.size, PH_QUAD, radius=155,
                                   overdraw=6.0)
    paste_screen(base, mob, PH_QUAD, radius=130, overdraw=0.0, inset=28)
    lap_mask = paste_screen(base, desk, LAP_QUAD, radius=40, overdraw=3.0)

    reclaim_notch(base_orig_recolored, base, lap_mask)
    reclaim_laptop_body(base_orig_recolored, base, glass_mask)

    base = base.convert("RGB")
    base.save("grontland-cover.png")
    print("saved grontland-cover.png", base.size)
