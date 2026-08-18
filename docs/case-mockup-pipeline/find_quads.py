"""Detect the laptop / phone screen-content quads in the domlivo hero mockup.

Content = bright (white-ish site UI) area; bezel = near-black frame around it.
For each edge we scan perpendicular lines, record the first sustained
dark->bright crossing, then least-squares-fit a line with outlier rejection
and intersect neighbouring edges to get the quad corners.
"""
import numpy as np
from PIL import Image

im = np.asarray(Image.open("domlivo-hero-full.png").convert("RGB")).astype(int)
H, W, _ = im.shape
lum = im.sum(axis=2) / 3.0

BRIGHT = 165
DARK = 95
RUN = 8


def first_bright(vals):
    """Index of the first run of RUN consecutive bright pixels, or None."""
    run = 0
    for i, v in enumerate(vals):
        run = run + 1 if v > BRIGHT else 0
        if run >= RUN:
            return i - RUN + 1
    return None


def scan_edge(fixed_range, scan_range, axis, reverse=False):
    """For each `fixed` line, scan along `scan_range` (axis: 'x' = scanning x
    varies, fixed is y; 'y' = scanning y varies, fixed is x).
    Returns list of (x, y) edge points where content begins."""
    pts = []
    sr = list(scan_range)
    if reverse:
        sr = sr[::-1]
    for f in fixed_range:
        vals = [lum[f, s] if axis == "x" else lum[s, f] for s in sr]
        # require we start from non-bright (bezel/bg) before content
        idx = first_bright(vals)
        if idx is None or idx == 0:
            continue
        # crossing position: halfway between last dark and first bright
        s_at = sr[idx]
        pts.append((s_at, f) if axis == "x" else (f, s_at))
    return pts


def fit_line(pts):
    """Fit x = a*y + b or y = a*x + b choosing the better-conditioned form.
    Returns ('x_of_y'|'y_of_x', a, b). Two rounds of outlier rejection."""
    p = np.array(pts, dtype=float)
    dx = p[:, 0].max() - p[:, 0].min()
    dy = p[:, 1].max() - p[:, 1].min()
    mode = "x_of_y" if dy >= dx else "y_of_x"
    for _ in range(3):
        if mode == "x_of_y":
            A = np.vstack([p[:, 1], np.ones(len(p))]).T
            sol, *_ = np.linalg.lstsq(A, p[:, 0], rcond=None)
            resid = np.abs(p[:, 0] - (A @ sol))
        else:
            A = np.vstack([p[:, 0], np.ones(len(p))]).T
            sol, *_ = np.linalg.lstsq(A, p[:, 1], rcond=None)
            resid = np.abs(p[:, 1] - (A @ sol))
        keep = resid < max(1.5, np.percentile(resid, 70))
        if keep.sum() < 8:
            break
        p = p[keep]
    return mode, sol[0], sol[1], len(p)


def intersect(l1, l2):
    m1, a1, b1, _ = l1
    m2, a2, b2, _ = l2
    if m1 == "x_of_y" and m2 == "x_of_y":
        y = (b2 - b1) / (a1 - a2)
        return a1 * y + b1, y
    if m1 == "y_of_x" and m2 == "y_of_x":
        x = (b2 - b1) / (a1 - a2)
        return x, a1 * x + b1
    if m1 == "y_of_x":
        m1, a1, b1, m2, a2, b2 = m2, a2, b2, m1, a1, b1
    # m1: x = a1 y + b1 ; m2: y = a2 x + b2
    y = (a2 * b1 + b2) / (1 - a1 * a2)
    return a1 * y + b1, y


# ---------------- laptop ----------------
lap_top = fit_line(scan_edge(range(640, 1130, 6), range(150, 400), "y"))          # scan down
lap_bottom = fit_line(scan_edge(range(560, 1060, 6), range(760, 500, -1), "y"))   # scan up
lap_left = fit_line(scan_edge(range(260, 600, 4), range(430, 700), "x"))          # scan right
lap_right = fit_line(scan_edge(range(280, 630, 4), range(1198, 950, -1), "x"))    # scan left

# ---------------- phone ----------------
ph_top = fit_line(scan_edge(range(140, 300, 3), range(300, 450), "y"))            # scan down
ph_bottom = fit_line(scan_edge(range(255, 395, 3), range(880, 600, -1), "y"))     # scan up
ph_left = fit_line(scan_edge(range(400, 700, 4), range(60, 260, 1), "x"))         # scan right
ph_right = fit_line(scan_edge(range(380, 640, 4), range(470, 280, -1), "x"))      # scan left

for name, l in [("lap_top", lap_top), ("lap_bottom", lap_bottom), ("lap_left", lap_left),
                ("lap_right", lap_right), ("ph_top", ph_top), ("ph_bottom", ph_bottom),
                ("ph_left", ph_left), ("ph_right", ph_right)]:
    print(name, l)

lap = dict(
    TL=intersect(lap_top, lap_left),
    TR=intersect(lap_top, lap_right),
    BR=intersect(lap_bottom, lap_right),
    BL=intersect(lap_bottom, lap_left),
)
ph = dict(
    TL=intersect(ph_top, ph_left),
    TR=intersect(ph_top, ph_right),
    BR=intersect(ph_bottom, ph_right),
    BL=intersect(ph_bottom, ph_left),
)
print("LAPTOP", {k: (round(v[0], 1), round(v[1], 1)) for k, v in lap.items()})
print("PHONE", {k: (round(v[0], 1), round(v[1], 1)) for k, v in ph.items()})

# debug render
from PIL import ImageDraw
dbg = Image.open("domlivo-hero-full.png").convert("RGB")
d = ImageDraw.Draw(dbg)
for quad, col in [(lap, (255, 40, 40)), (ph, (40, 255, 60))]:
    seq = [quad["TL"], quad["TR"], quad["BR"], quad["BL"], quad["TL"]]
    d.line([tuple(map(float, p)) for p in seq], fill=col, width=2)
dbg.save("quad-debug.png")
print("saved quad-debug.png")
