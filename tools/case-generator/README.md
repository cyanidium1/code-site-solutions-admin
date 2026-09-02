# Case generator — section screenshots → Sanity

Dev-only tooling to fill **draft case studies that are missing images**, then publish them.
It captures *cropped per-section* screenshots (hero, services, catalog, advantages, CTA,
contact) — never giant full-page strips — and uploads them to the `caseStudy` documents in
Sanity (project `4lk0x7o9`, dataset `production`).

## Pieces

| File | Role |
|------|------|
| `config/sites.json` | slug → URL → section CSS selectors. `slug` **must** equal `caseStudy.slug.current`. |
| `crawl.mjs` | Playwright crawler. Cropped section screenshots, desktop + mobile, cookie-banner dismissal, lazy-load scroll pass. Output is gitignored. |
| `../../scripts/upload-case-images.ts` | Uploads screenshots, sets `coverImage` + a `mediaGalleryBlock`, dedupes by content hash, reuses shared admin assets, and (with `--publish`) flips `status` to `published`. |

## One-time setup

```bash
cd tools/case-generator
npm install
npx playwright install chromium
```

Set a write token (root of the Sanity repo, gitignored):

```bash
# .env.local
SANITY_API_TOKEN=sk...   # Editor/Deploy token from sanity.io/manage
```

## Workflow

1. **Confirm selectors.** Selectors in `sites.json` are best-effort guesses. Verify per site:
   ```bash
   npm run case:inspect -- --site urmodels      # prints candidate landmarks
   ```
   Edit `config/sites.json` so each section points at the right block.

2. **Capture.**
   ```bash
   npm run case:crawl -- --site urmodels        # one site
   npm run case:crawl                           # all sites
   ```
   Images land in `output/<slug>/sections/<section>-<desktop|mobile>.png`.

3. **Review images by eye** before uploading: no cookie popup, no loading skeleton, no
   cut-off text, mobile and desktop both look clean. Delete or re-shoot any bad ones.

4. **Dry-run the upload** (changes nothing, shows the plan):
   ```bash
   cd ../..                                      # back to repo root
   npx tsx scripts/upload-case-images.ts --dry-run
   ```

5. **Upload, keep as draft** (sets cover + gallery, no publish):
   ```bash
   npx tsx scripts/upload-case-images.ts --slug urmodels
   ```

6. **Publish** once images look right on the frontend:
   ```bash
   npx tsx scripts/upload-case-images.ts --slug urmodels --publish
   ```
   Publish only succeeds when `coverImage` is set and `seo.title.uk` + `seo.description.uk`
   exist (the schema's own publish rule). Otherwise it stays draft and tells you why.

## Behaviour notes

- **Cover** = `hero-desktop` if present, else the first section by priority.
- **Gallery** = remaining sections, desktop before mobile, classified into
  `desktopScreenshot` / `mobileScreenshot` / `adminPanel` display modes.
- **Admin screenshots** (`admin*`, `cms*`, `sanity*`, `dashboard*`) are **not** re-uploaded
  per case — the first existing asset with that filename in the dataset is reused.
- **Re-runs are safe.** Sanity dedupes uploads by content hash; an existing gallery block
  on a doc is refreshed in place rather than duplicated.
- Texts, SEO, and page structure are **never** touched — only `coverImage`, the gallery
  block, and (opt-in) `status`.

---

## Claude Code prompt (run locally)

Paste this into Claude Code from the Sanity repo root, where the token and unrestricted
network are available:

```text
Goal: fill every DRAFT caseStudy that has no coverImage with clean section screenshots,
then publish the ones that are ready. Do not change case texts, SEO, or page structure.

Context:
- Sanity studio repo (this repo). Project 4lk0x7o9, dataset production.
- Screenshot tool: tools/case-generator (Playwright). Uploader: scripts/upload-case-images.ts.
- A SANITY_API_TOKEN with write access is in .env.local.

Steps:
1. Install + browsers:  (cd tools/case-generator && npm install && npx playwright install chromium)
2. List the draft cases needing images:
   npx tsx scripts/upload-case-images.ts --dry-run
   For each draft, confirm there is a matching entry in tools/case-generator/config/sites.json
   whose `slug` equals the case's slug.current. Add missing sites.
3. For each site, verify section selectors:
   (cd tools/case-generator && npm run case:inspect -- --site <slug>)
   Fix selectors in config/sites.json until hero/services/catalog/advantages/cta/contact resolve.
4. Capture:  (cd tools/case-generator && npm run case:crawl -- --site <slug>)
5. Open output/<slug>/sections/*.png and check each: no cookie banner, no skeleton/loading
   state, no devtools, no cut-off text, mobile + desktop both clean, no empty filler areas,
   no giant vertical strips. Re-shoot or delete bad images.
6. Upload as draft:  npx tsx scripts/upload-case-images.ts --slug <slug>
7. Verify on the frontend: cover renders, gallery is non-empty, images match the case text,
   no broken links.
8. Publish:  npx tsx scripts/upload-case-images.ts --slug <slug> --publish
9. After all sites: report per case — name, project URL, # images added, # reused (admin),
   # created via Playwright, and any manual follow-ups.

Rules:
- 5–10 images per case. Cropped sections only, never full-page strips.
- Reuse the existing admin asset across cases; never duplicate it.
- If publish is blocked because SEO uk fields are empty, leave the case as draft and flag it.
- Do not edit case texts, SEO copy, or section structure.
- If a selector genuinely can't isolate a block, only then extend crawl.mjs — keep changes
  inside tools/case-generator, never touch production frontend code.
```
