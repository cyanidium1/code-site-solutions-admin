# CLAUDE.md — code-site-solutions-admin

Sanity Studio v5 for Code-Site.Art (`projectId: 4lk0x7o9`, `dataset: production`). Schema, GROQ, and maintenance scripts live here; the Next.js site (`code-site-solutions`) consumes **published** content from the **public CDN API without a read token**.

## Commands

```bash
npm install
npm run dev          # Studio dev server
npm run build
npx sanity documents query '<GROQ>' --dataset production
npx sanity exec scripts/<name>.ts --with-user-token
npm run seed:calculator-v2   # only remaining content seed
```

## Sanity document IDs (critical)

**Full doc:** [`docs/sanity-document-ids.md`](docs/sanity-document-ids.md)  
**Frontend mirror:** `../code-site-solutions/docs/sanity-document-ids.md`  
**Cursor rule:** `.cursor/rules/sanity-document-ids.mdc`

### The issue

Any root document `_id` containing a **dot** (`.`) is **auth-only** on a public dataset. The marketing site **cannot** load it without a server read token — regardless of schema `status: "published"` or seed `createOrReplace`.

Examples that **break the live site**: `caseStudy.co2lab`, `industryPage.medicine`, `blogPost.*`, `pricingPlan.*`, `countryOption.UA`, `budgetBucketOption.3-7k`, `testimonial.*`.

| `_id` pattern | Public CDN |
|---------------|------------|
| `{type}.{slug}` | Hidden |
| Studio UUID | Visible after Publish |
| `{type}-{slug}` (hyphen) | Visible after Publish |

Studio **cannot rename** `_id`. Fix: **+ New** (UUID) → copy content → update references → delete dotted doc.

### June 2026 state

Production was migrated to UUIDs. Maps in `backups/reupload-*-2026-06-04/manifest.json`. Legacy `seed:*` scripts that used dotted or stale fixed IDs were **removed** — do not recreate them.

If dotted IDs reappear:

```bash
npm run reupload:dotted-case-studies -- --apply
npm run reupload:dotted-options-testimonials -- --apply
npm run reupload:dotted-content-pages -- --apply
```

Verify:

```bash
npx sanity documents query '*[_type in ["caseStudy","industryPage","blogPost","pricingPlan","countryOption","budgetBucketOption","testimonial"] && _id match "*.*" && !(_id match "_.*")]{_id,_type}'
```

### New content / scripts

- Default: Studio **+ New** (UUID) or GROQ by `slug.current`.
- Never seed `caseStudy.{slug}` / `industryPage.{slug}` again.
- `translations/*.json` → `_meta.docId` must match the **live** `_id` (UUID), not historical dotted ids.

## Related repos

| Repo | Role |
|------|------|
| `code-site-solutions` | Next.js frontend — `src/lib/server/sanity-queries.ts` mirrors `queries/*` here |
