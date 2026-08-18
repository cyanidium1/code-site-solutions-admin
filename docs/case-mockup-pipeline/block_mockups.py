"""Batch: 4 cover-style mockups (leaf-green bg, laptop+phone) for the
Grontland case challenge/outcome blocks. Same base + quads as the cover."""
from PIL import Image

from hero_compose import paste_screen, paint_glass_black, draw_dynamic_island
from cover_compose import (LAP_QUAD, PH_QUAD, recolor_bg, reclaim_notch,
                           reclaim_laptop_body)

JOBS = [
    ('desk-private.png', 'mob-private-tall.png', 'grontland-mock-private.png'),
    ('desk-entreprenorer.png', 'mob-b2b-tall.png', 'grontland-mock-b2b.png'),
    ('desk-project-detail.png', 'mob-projekter-tall.png', 'grontland-mock-projects.png'),
    ('desk-om-os.png', 'mob-omos-tall.png', 'grontland-mock-omos.png'),
]

for desk_file, mob_file, out_file in JOBS:
    base_orig = Image.open('domlivo-cover-full.png').convert('RGBA')
    base = recolor_bg(base_orig)
    base_orig_recolored = base.copy()

    desk = Image.open('../shots/' + desk_file)
    mob = draw_dynamic_island(Image.open('../shots/' + mob_file))

    glass_mask = paint_glass_black(base, mob.size, PH_QUAD, radius=155,
                                   overdraw=6.0)
    paste_screen(base, mob, PH_QUAD, radius=130, overdraw=0.0, inset=28)
    lap_mask = paste_screen(base, desk, LAP_QUAD, radius=40, overdraw=3.0)

    reclaim_notch(base_orig_recolored, base, lap_mask)
    reclaim_laptop_body(base_orig_recolored, base, glass_mask)

    base.convert('RGB').save(out_file)
    print('saved', out_file)
