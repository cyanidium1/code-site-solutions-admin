"""Angels of Tails case mockups: hero + cover + 4 single-device blocks."""
import json
import numpy as np
from PIL import Image, ImageFilter

import hero_compose as hero_mod
from hero_compose import paste_screen, paint_glass_black, draw_dynamic_island
from cover_compose import (LAP_QUAD as COV_LAP, PH_QUAD as COV_PH,
                           reclaim_notch as cov_notch,
                           reclaim_laptop_body as cov_body)

ANG = '../ang/'


def recolor_bg_sage(img):
    """Domlivo emerald -> Angels sage green (~#4C7B67 family)."""
    hsv = np.asarray(img.convert("HSV")).astype(int)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = (H >= 95) & (H <= 135) & (S > 45)
    H = np.where(m, (H - 5) % 256, H)
    S = np.where(m, S * 0.40, S)
    V = np.where(m, np.minimum(V * 0.70, 255), V)
    out = np.stack([H, S, V], axis=-1).astype(np.uint8)
    return Image.merge("HSV", [Image.fromarray(out[..., i]) for i in range(3)]).convert("RGBA")


# hero
base = Image.open('domlivo-hero-full.png').convert('RGBA')
base_orig = base.copy()
desk = Image.open(ANG + 'desk-home.png')
mob = draw_dynamic_island(Image.open(ANG + 'mob-home.png'))
HERO_PH = [(85.0, 342.6), (316.3, 336.2), (506.2, 766.1), (302.0, 858.0)]
HERO_LAP = [(592.2, 201.8), (1179.0, 226.3), (1093.2, 684.0), (506.1, 622.0)]
lap_mask = paste_screen(base, desk, HERO_LAP, radius=22, overdraw=1.5)
glass = paint_glass_black(base, mob.size, HERO_PH, radius=155, overdraw=5.0)
paste_screen(base, mob, HERO_PH, radius=130, overdraw=0.0, inset=28)
hero_mod.reclaim_notch(base_orig, base, lap_mask)
hero_mod.reclaim_deck(base_orig, base, glass, y_min=640)
base.save('angels-hero.png')
print('saved angels-hero.png')

# cover
base_orig = Image.open('domlivo-cover-full.png').convert('RGBA')
base = recolor_bg_sage(base_orig)
base_rc = base.copy()
desk = Image.open(ANG + 'desk-tails.png')
mob = draw_dynamic_island(Image.open(ANG + 'mob-tails.png'))
gm = paint_glass_black(base, mob.size, COV_PH, radius=155, overdraw=6.0)
paste_screen(base, mob, COV_PH, radius=130, overdraw=0.0, inset=28)
lm = paste_screen(base, desk, COV_LAP, radius=40, overdraw=3.0)
cov_notch(base_rc, base, lm)
cov_body(base_rc, base, gm)
base.convert('RGB').save('angels-cover.png')
print('saved angels-cover.png')

# singles
Q = json.load(open('single_quads.json'))
S_PH, S_LAP, S_TOP = Q['ph_quad'], Q['lap_quad'], Q['lap_top']


def single_notch(bo, res, am):
    W, H = bo.size
    orig = np.asarray(bo.convert('RGB')).astype(int)
    lum = orig.sum(axis=2) / 3.0
    ys, xs = np.mgrid[0:H, 0:W]
    a, b = S_TOP
    m = (lum < 100) & (ys > a * xs + b - 6) & (ys < a * xs + b + 26)
    m &= (np.asarray(am) > 40) & (xs >= 780) & (xs <= 930)
    mi = Image.fromarray((m * 255).astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(9))
    res.paste(bo, (0, 0), mi)


for kind, f, out in [
    ('phone', 'mob-tail-detail.png', 'angels-single-ph-tail.png'),
    ('laptop', 'desk-reporting.png', 'angels-single-lap-reporting.png'),
    ('phone', 'mob-events.png', 'angels-single-ph-events.png'),
    ('laptop', 'desk-partnership.png', 'angels-single-lap-partnership.png'),
]:
    shot = Image.open(ANG + f)
    if kind == 'phone':
        th = round(shot.width * 2.167)
        shot = shot.crop((0, 0, shot.width, min(th, shot.height)))
        shot = draw_dynamic_island(shot)
        b2 = Image.open('base-ph-kondor.png').convert('RGBA')
        paint_glass_black(b2, shot.size, S_PH, radius=110, overdraw=6.0)
        paste_screen(b2, shot, S_PH, radius=130, overdraw=0.0, inset=26)
    else:
        b2 = Image.open('base-lap-kondor.png').convert('RGBA')
        b2o = b2.copy()
        lm2 = paste_screen(b2, shot, S_LAP, radius=40, overdraw=1.5)
        single_notch(b2o, b2, lm2)
    b2.save(out)
    print('saved', out)
