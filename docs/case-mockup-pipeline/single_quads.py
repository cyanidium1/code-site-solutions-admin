"""Detect screen quads in the single-device kondor bases (transparent bg)."""
import json
import numpy as np
from PIL import Image, ImageDraw


def load(f):
    im = np.asarray(Image.open(f).convert("RGB")).astype(int)
    return im.sum(axis=2) / 3.0


def first_bright(vals, BRIGHT=170, RUN=8):
    run = 0
    for i, v in enumerate(vals):
        run = run + 1 if v > BRIGHT else 0
        if run >= RUN:
            return i - RUN + 1
    return None


def scan(lum, fixed_range, scan_range, axis, pre_thr=120):
    out = []
    sr = list(scan_range)
    for f in fixed_range:
        vals = [lum[f, s] if axis == "x" else lum[s, f] for s in sr]
        idx = first_bright(vals)
        if idx is None or idx < 2:
            continue
        pre = vals[max(0, idx - 6):idx]
        if not pre or min(pre) > pre_thr:
            continue
        out.append((sr[idx], f) if axis == "x" else (f, sr[idx]))
    return out


def ts(p, mode, min_d=40, trim=0.15):
    p = sorted(p, key=lambda q: q[0] if mode == "y_of_x" else q[1])
    k = int(len(p) * trim)
    if len(p) > 2 * k + 6:
        p = p[k:len(p) - k]
    p = np.array(p, float)
    xs, ys = (p[:, 0], p[:, 1]) if mode == "y_of_x" else (p[:, 1], p[:, 0])
    slopes = [(ys[j] - ys[i]) / (xs[j] - xs[i])
              for i in range(len(p)) for j in range(i + 1, len(p))
              if abs(xs[j] - xs[i]) > min_d]
    return float(np.median(slopes)), float(np.median(ys - np.median(slopes) * xs))


def ix(ea, eb, sa, sb):
    y = (sa * eb + sb) / (1 - ea * sa)
    return ea * y + eb, y


def detect(name, lum, top_args, bot_args, left_args, right_args, notch_x=None,
           pre=120):
    tp = scan(lum, *top_args, pre_thr=pre)
    if notch_x:
        tp = [p for p in tp if not (notch_x[0] <= p[0] <= notch_x[1])]
    bp = scan(lum, *bot_args, pre_thr=pre)
    lp = scan(lum, *left_args, pre_thr=pre)
    rp = scan(lum, *right_args, pre_thr=pre)
    t = ts(tp, "y_of_x")
    b = ts(bp, "y_of_x")
    l = ts(lp, "x_of_y")
    r = ts(rp, "x_of_y")
    quad = [ix(l[0], l[1], t[0], t[1]), ix(r[0], r[1], t[0], t[1]),
            ix(r[0], r[1], b[0], b[1]), ix(l[0], l[1], b[0], b[1])]
    print(name, "n:", len(tp), len(bp), len(lp), len(rp))
    print(name, "quad", [(round(x, 1), round(y, 1)) for x, y in quad])
    import math
    print(name, "aspect", round(math.dist(quad[0], quad[3]) / math.dist(quad[0], quad[1]), 3))
    return quad, t, (tp, bp, lp, rp)


ph = load("base-ph-kondor.png")
lap = load("base-lap-kondor.png")

ph_quad, ph_top, ph_pts = detect(
    "phone", ph,
    (range(80, 380, 3), range(10, 160), "y"),
    (range(380, 660, 2), range(920, 680, -1), "y"),
    (range(150, 780, 4), range(0, 320), "x"),
    (range(150, 650, 4), range(733, 360, -1), "x"),
    notch_x=(160, 300),
    pre=255,
)
lap_quad, lap_top, lap_pts = detect(
    "laptop", lap,
    (range(500, 1230, 6), range(0, 140), "y"),
    (range(430, 1110, 6), range(780, 480, -1), "y"),
    (range(100, 550, 4), range(300, 600), "x"),
    (range(100, 600, 4), range(1287, 1000, -1), "x"),
    notch_x=(780, 930),
)

json.dump({"ph_quad": ph_quad, "lap_quad": lap_quad,
           "ph_top": ph_top, "lap_top": lap_top},
          open("single_quads.json", "w"))

for f, quad, pts in [("base-ph-kondor.png", ph_quad, ph_pts),
                     ("base-lap-kondor.png", lap_quad, lap_pts)]:
    dbg = Image.open(f).convert("RGB")
    d = ImageDraw.Draw(dbg)
    d.line([tuple(p) for p in quad + [quad[0]]], fill=(0, 255, 0), width=2)
    for grp, col in zip(pts, [(255, 0, 0), (255, 255, 0), (0, 255, 255), (255, 0, 255)]):
        for (x, y) in grp:
            d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=col)
    dbg.save("dbg-" + f)
print("done")
