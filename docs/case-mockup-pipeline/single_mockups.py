"""Single-device mockups (kondor bases, transparent bg) for the Grontland
challenge/outcome blocks: phone (left slot) + laptop (right slot)."""
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from hero_compose import (paste_screen, paint_glass_black, draw_dynamic_island,
                      rescale, persp_coeffs)

Q = json.load(open("single_quads.json"))
PH_QUAD = Q["ph_quad"]
LAP_QUAD = Q["lap_quad"]
LAP_TOP = Q["lap_top"]          # (a, b): y = a*x + b
NOTCH_X = (780, 930)

JOBS = [
    ('phone', 'mob-private-tall.png', 'grontland-single-ph-private.png'),
    ('laptop', 'desk-entreprenorer.png', 'grontland-single-lap-b2b.png'),
    ('phone', 'mob-projekter-tall.png', 'grontland-single-ph-projects.png'),
    ('laptop', 'desk-project-detail.png', 'grontland-single-lap-project.png'),
]


def reclaim_notch(base_orig, result, area_mask):
    W, H = base_orig.size
    orig = np.asarray(base_orig.convert("RGB")).astype(int)
    lum = orig.sum(axis=2) / 3.0
    ys, xs = np.mgrid[0:H, 0:W]
    a, b = LAP_TOP
    m = (lum < 100) & (ys > a * xs + b - 6) & (ys < a * xs + b + 26)
    m &= (np.asarray(area_mask) > 40) & (xs >= NOTCH_X[0]) & (xs <= NOTCH_X[1])
    mi = Image.fromarray((m * 255).astype(np.uint8))
    mi = mi.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(9))
    result.paste(base_orig, (0, 0), mi)


for kind, shot_file, out_file in JOBS:
    shot = Image.open('../shots/' + shot_file)
    if kind == 'phone':
        # crop to the true iPhone screen aspect (19.5:9) from the top
        target_h = round(shot.width * 2.167)
        shot = shot.crop((0, 0, shot.width, min(target_h, shot.height)))
        shot = draw_dynamic_island(shot)
        base = Image.open('base-ph-kondor.png').convert('RGBA')
        paint_glass_black(base, shot.size, PH_QUAD, radius=110, overdraw=6.0)
        paste_screen(base, shot, PH_QUAD, radius=130, overdraw=0.0, inset=26)
    else:
        base = Image.open('base-lap-kondor.png').convert('RGBA')
        base_orig = base.copy()
        lap_mask = paste_screen(base, shot, LAP_QUAD, radius=40, overdraw=1.5)
        reclaim_notch(base_orig, base, lap_mask)
    base.save(out_file)
    print('saved', out_file, base.size)
