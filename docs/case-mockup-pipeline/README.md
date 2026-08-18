# Case mockup pipeline — swap screens in existing device mockups

How the Grønt Land DK case hero/cover (job #163, 2026-08-18) were composed
**without Figma**: take an existing case mockup PNG from the Sanity CDN as the
base, replace the laptop + phone screen content with fresh Playwright
screenshots via perspective warp (PIL), keep everything else (device frames,
purple glow / brand background, shadows).

## Steps

1. **Base**: download an existing case hero (`1199x1133`, purple glow, RGBA)
   and/or cover (`~2884x2058`, flat brand-color bg) at full res from
   `cdn.sanity.io/images/4lk0x7o9/production/<asset>.png`. Domlivo's pair was
   used for Grontland (laptop right + phone front-left pose).
2. **Screenshots**: Playwright (`chromium`, `deviceScaleFactor 2`) at
   1440×900 for the laptop; 390×920 `@3x` iPhone UA for the phone.
   `waitUntil: "domcontentloaded"` — **never** `networkidle` (hangs on some
   sites); scroll through the page first to trigger lazy images.
3. **Quad detection** (`find_quads.py`): scanline luminance transitions
   (dark bezel → bright content, run-of-8 > 165) per edge, Theil–Sen line
   fit, intersect lines → 4 corners. Watch for: corner-rounding zones
   polluting fits (trim ends), the MacBook notch (exclude its x-span), the
   dynamic island, occlusions (laptop deck hides the phone's bottom — push
   the bottom edge under the occluder and let reclaim handle it).
4. **Compose** (`hero_compose.py` / `cover_compose.py`):
   - `paint_glass_black` — fill the whole warped phone-glass quad with bezel
     black first, then paste content **inset 28 src px** → a clean painted
     bezel ring, covering all old-content remnants geometrically (color
     heuristics for remnants do NOT work — old photo shadows are as dark as
     the bezel).
   - `paste_screen` — PIL `Image.transform(PERSPECTIVE)` at 2× supersample,
     rounded-corner mask in source space (laptop r≈22, phone r≈130–155).
   - Dynamic island is **drawn onto the source screenshot** pre-warp
     (`draw_dynamic_island`) — restoring the base island leaves ghosts.
   - `reclaim_notch` — copy back dark base pixels in the notch x-span.
   - `reclaim_deck` / `reclaim_laptop_body` — restore the occluder over the
     pasted phone (erode 9 / dilate 17 kills old text strokes but keeps the
     solid dark blob).
   - Cover only: `recolor_bg` hue-shifts the flat bg + shadow in HSV
     (domlivo emerald H≈114/255 → Grontland leaf `#7ab547` H≈65/255).
5. **Verify at 4× zoom** on every corner/edge before uploading — remnant
   slivers of old content are invisible at 1× but obvious in crops.

The scripts here are the final Grontland versions — quads/paths are
hardcoded for that run; re-run detection for a new base or pose. Python
deps: Pillow + numpy (both present globally).

Base-image quads used (domlivo bases):

- hero laptop: `(592,202) (1179,226) (1093,684) (506,622)`
- hero phone glass: `(85,343) (316,336) (506,766) (302,858)`
- cover laptop: `(1357,244) (2603,293) (2421,1267) (1173,1137)`
- cover phone glass: `(293,558) (767,510) (1229,1561) (741,1620)`

## Single-device block mockups (job #165)

The CHALLENGE / OUTCOME (`centered-horizontal`) blocks use **one device per
slot on a transparent background**: portrait phone (~734x922) in `image`
(left), laptop (~1288x1162) in `image2` (right) — see kondor-device / nbyg /
mono-pools. `single_quads.py` + `single_mockups.py` build these from the
kondor-device base images (transparent bg, baked shadow).

Extra gotchas found here:
- This phone base has a MIDTONE bezel/frame edge (~lum 135), so the
  dark-before-content scan guard must be disabled (transparent bg makes it
  safe anyway).
- The old content's orange CTA sits at mid-luminance — the bottom edge scan
  stops at the white/orange boundary, not the glass edge. The glass bottom
  was refit with a CHROMA scan (chroma>60 = orange band) instead.
- Phone source screenshots are cropped to the TRUE screen aspect (19.5:9 =
  width x 2.167) from the top; the homography handles the apparent
  foreshortening (quad aspect ~2.76 is expected, don't match it).

Kondor base quads (`single_quads.json`):
- phone glass: `(44,47) (363,17) (716,820) (396,877)`
- laptop content: `(501,31) (1257,61) (1146,642) (389,562)`
