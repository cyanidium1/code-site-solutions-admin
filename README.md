# Code-Site.Art — Sanity Studio (admin)

Sanity Content Studio for the Code-Site.Art marketing site.

| | |
|---|---|
| **Project** | `4lk0x7o9` |
| **Dataset** | `production` |
| **Frontend** | `code-site-solutions` (Next.js, public CDN, no read token) |

## Commands

```bash
npm install
npm run dev          # Studio at http://localhost:3333
npm run build
npx sanity documents query '<GROQ>' --dataset production
npx sanity exec scripts/<name>.ts --with-user-token
```

Calculator seed (safe fixed IDs, no dots):

```bash
npm run seed:calculator-v2
```

## Document IDs and the public website

**Read this before creating or seeding content.**

Any Sanity document `_id` that contains a **dot** (`.`) is treated as a **draft / auth-only** document on a public dataset. The Next.js site queries the **public CDN API without a read token**, so those documents are **invisible** on the live site — even when the schema field `status` is `"published"`.

| Example `_id` | Public marketing site |
|---------------|------------------------|
| `caseStudy.co2lab` | Hidden |
| `industryPage.medicine` | Hidden |
| `blogPost.foo` | Hidden |
| `countryOption.UA` | Hidden |
| Studio UUID (`lOTgaDd8FU4wgJ8F4K9w0O`) | Visible after Publish |
| Hyphen id (`caseStudy-co2lab`) | Visible after Publish |

`createOrReplace` with `status: "published"` does **not** bypass this rule. Only the **root** `_id` matters.

Studio cannot rename `_id`. To fix a dotted document: create a **new** root document (prefer Studio **+ New** → auto UUID), copy content, update references, delete the old dotted doc.

Full write-up: [`docs/sanity-document-ids.md`](docs/sanity-document-ids.md) (and `code-site-solutions/docs/sanity-document-ids.md` on the frontend repo).

### June 2026 migration

Legacy seeds used `{type}.{slug}` IDs. Production was migrated to **auto UUIDs**; backups and ID maps live under `backups/reupload-*-2026-06-04/`.

One-off repair scripts (already run; keep for reference or if dotted IDs reappear):

```bash
npm run reupload:dotted-case-studies -- --apply
npm run reupload:dotted-options-testimonials -- --apply
npm run reupload:dotted-content-pages -- --apply
```

Dry-run: omit `--apply`.

### Verify no dotted user content

```bash
npx sanity documents query '*[_type in ["caseStudy","industryPage","blogPost","pricingPlan","countryOption","budgetBucketOption","testimonial"] && _id match "*.*" && !(_id match "_.*")]{_id,_type}'
```

Target: **empty** `[]`.

### Creating new content

- Prefer **Studio + New** (UUID) or query by `slug.current` in scripts — do not reintroduce `caseStudy.{slug}` / `industryPage.{slug}`.
- Legacy `npm run seed:*` scripts that used dotted IDs were **removed**; they would recreate auth-only or duplicate documents.

## Repo layout

| Path | Purpose |
|------|---------|
| `schemaTypes/` | Document and object schemas |
| `queries/` | GROQ fragments (mirrored in frontend) |
| `scripts/` | Maintenance (`translate-from-json.ts`, `reupload-dotted-*.ts`, calculator seed) |
| `translations/` | UK→EN JSON maps; `_meta.docId` must match the live Sanity `_id` |
| `backups/` | JSON exports from migrations |

## AI / editor notes

See [`CLAUDE.md`](CLAUDE.md) and [`.cursor/rules/sanity-document-ids.mdc`](.cursor/rules/sanity-document-ids.mdc).
