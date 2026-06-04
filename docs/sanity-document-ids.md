# Sanity document IDs (admin)

The marketing site (`code-site-solutions`) loads content from the **public CDN API without a read token**. Document visibility is governed by `_id` shape, not only by the custom `status` field in the schema.

See also **`code-site-solutions/docs/sanity-document-ids.md`** for frontend queries and editor workflow.

## The dot rule

Sanity treats any root document whose `_id` contains a **`.`** as **auth-only** on public datasets.

```ts
// BAD — invisible on the public API (portfolio, industries, blog, pricing, filters)
_id: 'caseStudy.co2lab'
_id: 'industryPage.medicine'
_id: 'blogPost.my-slug'
_id: 'pricingPlan.landing'
_id: 'countryOption.UA'
_id: 'budgetBucketOption.3-7k'
_id: 'testimonial.nbyg-kobenhavn'

// GOOD
// Omit _id → Studio assigns a UUID (preferred for new content)
_id: 'lOTgaDd8FU4wgJ8F4K9w0O'

// GOOD — hyphen instead of dot (OK for scripts; UUID is still preferred)
_id: 'caseStudy-co2lab'
```

| Misconception | Fact |
|---------------|------|
| `status: "published"` in schema or seed JSON | Does **not** make dotted IDs public |
| `createOrReplace` from a script | Same rule — dot in `_id` still auth-only |
| Renaming in Studio | **Not supported** — create new doc + delete old |
| Duplicating a dotted doc in Studio | May keep `_system.base.id` on the old id; use **+ New** + delete old |

List subtitle «Опубліковано» reflects the schema `status` field, not CDN visibility.

## Affected types (this project)

All of these were migrated off dotted IDs in **June 2026**:

- `caseStudy.*` (13) → UUID
- `countryOption.*`, `budgetBucketOption.*`, `testimonial.*` → UUID
- `industryPage.*` (8), `blogPost.*` (3), `pricingPlan.*` (3) → UUID

ID maps: `backups/reupload-case-studies-2026-06-04/manifest.json`, `backups/reupload-options-testimonials-2026-06-04/manifest.json`, `backups/reupload-content-pages-2026-06-04/manifest.json`.

## Repair scripts (if dotted IDs return)

Run with CLI login (`--with-user-token`). Back up first; dry-run without `--apply`.

```bash
npm run reupload:dotted-case-studies -- --apply
npm run reupload:dotted-options-testimonials -- --apply
npm run reupload:dotted-content-pages -- --apply
```

Each script: export JSON → create new docs (UUID) → patch referrers → delete old dotted docs.

## Verify

```bash
npx sanity documents query '*[_type in ["caseStudy","industryPage","blogPost","pricingPlan","countryOption","budgetBucketOption","testimonial"] && _id match "*.*" && !(_id match "_.*")]{_id,_type}'
```

Expect `[]`.

Case studies only:

```bash
npx sanity documents query 'count(*[_type=="caseStudy" && _id match "caseStudy.*"])'
```

Expect `0`.

Public count (from frontend repo, no token):

```bash
node --input-type=commonjs -e "
const {createClient}=require('@sanity/client');
createClient({projectId:'4lk0x7o9',dataset:'production',apiVersion:'2024-10-01',useCdn:false,perspective:'published'})
  .fetch('count(*[_type==\"caseStudy\"])').then(console.log);
"
```

Studio count and public count should match after migration.

## Scripts and translations

**Removed** (June 2026): legacy seeds and one-shots that used `{type}.{slug}` or stale fixed IDs (`seed-industries`, `seed-medicine`, `seed-renovation`, `seed-blog-posts`, `seed-pricing-plans`, `seed-portfolio-options`, `seed-homepage-testimonials`, `seed-efedra-clinic`, `seed-nbyg-kobenhavn`, `migrate-dotted-document-ids`, `patch-industry-heroes`, `translate-medicine-en`, `upload-finance-images`, `backfill-case-filters`).

**Still valid:**

- `scripts/seed-calculator-v2.ts` — calculator singletons (`calculatorProjectTypes`, …) without dots in `_id`
- `scripts/translate-from-json.ts` — pass the **current** Sanity `_id` (see `translations/*` `_meta.docId`)
- `scripts/reupload-dotted-*.ts` — migration only

When adding `translations/<name>.json`, set `_meta.docId` to the live document `_id` (usually a UUID after migration), not a historical `caseStudy.slug` or `industryPage.slug`.

## Querying in scripts

Prefer slug lookup over hard-coded `_id`:

```ts
const doc = await client.fetch(
  `*[_type == "caseStudy" && slug.current == $slug][0]`,
  {slug: 'efedra-clinic'},
)
```
