"""IceLab case mockups: hero + cover + 4 single-device blocks.

Reuses the pipeline modules; cover bg recolored emerald -> IceLab ice blue.
"""
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import hero_compose as hero_mod
from hero_compose import (paste_screen, paint_glass_black, draw_dynamic_island,
                      expand_quad, persp_coeffs, rescale)
from cover_compose import (LAP_QUAD as COV_LAP, PH_QUAD as COV_PH,
                           reclaim_notch as cov_notch,
                           reclaim_laptop_body as cov_body)

ICE = '../ice/'


def recolor_bg_ice(img):
    """Domlivo emerald (H~114/255) -> IceLab ice blue (~#1456A5)."""
    hsv = np.asarray(img.convert("HSV")).astype(int)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = (H >= 95) & (H <= 135) & (S > 45)
    H = np.where(m, (H + 35) % 256, H)
    S = np.where(m, S * 0.88, S)
    V = np.where(m, np.minimum(V * 0.85, 255), V)
    out = np.stack([H, S, V], axis=-1).astype(np.uint8)
    return Image.merge("HSV", [Image.fromarray(out[..., i]) for i in range(3)]).convert("RGBA")


# ---------- hero (domlivo hero base) ----------
base = Image.open('domlivo-hero-full.png').convert('RGBA')
base_orig = base.copy()
desk = Image.open(ICE + 'desk-home.png')
mob = draw_dynamic_island(Image.open(ICE + 'mob-home.png'))

HERO_PH_QUAD = [(85.0, 342.6), (316.3, 336.2), (506.2, 766.1), (302.0, 858.0)]
HERO_LAP_QUAD = [(592.2, 201.8), (1179.0, 226.3), (1093.2, 684.0), (506.1, 622.0)]

lap_mask = paste_screen(base, desk, HERO_LAP_QUAD, radius=22, overdraw=1.5)
glass_mask = paint_glass_black(base, mob.size, HERO_PH_QUAD, radius=155, overdraw=5.0)
paste_screen(base, mob, HERO_PH_QUAD, radius=130, overdraw=0.0, inset=28)
hero_mod.reclaim_notch(base_orig, base, lap_mask)
hero_mod.reclaim_deck(base_orig, base, glass_mask, y_min=640)
base.save('icelab-hero.png')
print('saved icelab-hero.png', base.size)

# ---------- cover (domlivo cover base, blue bg) ----------
base_orig = Image.open('domlivo-cover-full.png').convert('RGBA')
base = recolor_bg_ice(base_orig)
base_recolored = base.copy()
desk = Image.open(ICE + 'desk-catalog.png')
mob = draw_dynamic_island(Image.open(ICE + 'mob-catalog.png'))

gm = paint_glass_black(base, mob.size, COV_PH, radius=155, overdraw=6.0)
paste_screen(base, mob, COV_PH, radius=130, overdraw=0.0, inset=28)
lm = paste_screen(base, desk, COV_LAP, radius=40, overdraw=3.0)
cov_notch(base_recolored, base, lm)
cov_body(base_recolored, base, gm)
base.convert('RGB').save('icelab-cover.png')
print('saved icelab-cover.png', base.size)

# ---------- singles (kondor bases) ----------
Q = json.load(open('single_quads.json'))
S_PH, S_LAP, S_LAP_TOP = Q['ph_quad'], Q['lap_quad'], Q['lap_top']
NOTCH_X = (780, 930)


def single_notch(base_orig, result, area_mask):
    W, H = base_orig.size
    orig = np.asarray(base_orig.convert('RGB')).astype(int)
    lum = orig.sum(axis=2) / 3.0
    ys, xs = np.mgrid[0:H, 0:W]
    a, b = S_LAP_TOP
    m = (lum < 100) & (ys > a * xs + b - 6) & (ys < a * xs + b + 26)
    m &= (np.asarray(area_mask) > 40) & (xs >= NOTCH_X[0]) & (xs <= NOTCH_X[1])
    mi = Image.fromarray((m * 255).astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(9))
    result.paste(base_orig, (0, 0), mi)


SINGLES = [
    ('phone', 'mob-opt.png', 'icelab-single-ph-opt.png'),
    ('laptop', 'desk-zastosuvannia.png', 'icelab-single-lap-uses.png'),
    ('phone', 'mob-city-kyiv.png', 'icelab-single-ph-kyiv.png'),
    ('laptop', 'desk-production.png', 'icelab-single-lap-production.png'),
]
for kind, f, out in SINGLES:
    shot = Image.open(ICE + f)
    if kind == 'phone':
        target_h = round(shot.width * 2.167)
        shot = shot.crop((0, 0, shot.width, min(target_h, shot.height)))
        shot = draw_dynamic_island(shot)
        b2 = Image.open('base-ph-kondor.png').convert('RGBA')
        paint_glass_black(b2, shot.size, S_PH, radius=110, overdraw=6.0)
        paste_screen(b2, shot, S_PH, radius=130, overdraw=0.0, inset=26)
    else:
        b2 = Image.open('base-lap-kondor.png').convert('RGBA')
        b2_orig = b2.copy()
        lm2 = paste_screen(b2, shot, S_LAP, radius=40, overdraw=1.5)
        single_notch(b2_orig, b2, lm2)
    b2.save(out)
    print('saved', out, b2.size)
