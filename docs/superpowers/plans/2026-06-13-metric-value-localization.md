# Localize `metric.value` (stats-bar) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shared `metric.value` field localizable (`localizedString`) so the stats bar's value strings can vary per locale, matching the already-localized `label`.

**Architecture:** Change the shared `metric` object type in the Sanity Studio, mirror the change in the GROQ `METRIC` fragment (two copies), update the frontend `Metric` type, switch the three render callsites from raw string to `loc(...)`, and migrate existing stored string values into the `{uk,ru,en}` shape with a one-shot idempotent script.

**Tech Stack:** Sanity Studio (schema in TypeScript, GROQ), Next.js + TypeScript frontend, `sanity exec` migration scripts.

**Spec:** `Sanity/docs/superpowers/specs/2026-06-13-metric-value-localization-design.md`

---

## File Structure

Files touched (no new files except the migration script):

- `Sanity/schemaTypes/objects/metric.ts` — change `value` field type + preview + comment.
- `Sanity/queries/fragments.ts` — `METRIC` GROQ fragment.
- `Frontend/src/lib/server/sanity-queries.ts` — mirrored `METRIC` GROQ fragment.
- `Frontend/src/types/sanity.ts` — `Metric.value` type.
- `Frontend/src/components/case-page/index.tsx` — statsBlock render callsite.
- `Frontend/src/components/industry-page/index.tsx` — statsBlock + hero stats callsites.
- `Sanity/scripts/migrate-metric-value-to-localized.ts` — NEW migration (create).
- `Sanity/package.json` — add migration npm script.

The two repos are independent git repos (`Sanity/` and `Frontend/`); commit in each repo separately.

---

## Task 1: Sanity schema — localize `metric.value`

**Files:**
- Modify: `Sanity/schemaTypes/objects/metric.ts`

- [ ] **Step 1: Change the `value` field type and preview**

Replace the whole file body with:

```typescript
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

/**
 * Простий показник: локалізоване дисплей-значення (зазвичай число чи символьний
 * рядок, наприклад «98», «30+», «$4M raised») плюс локалізована підпис-мітка.
 * Обидва поля локалізовані — значення можна перекладати, коли воно містить слова
 * (напр. «Top-1» → «1-е місце», «$4M raised» → «$4M залучено»).
 */
export const metric = defineType({
  name: 'metric',
  title: 'Показник',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Значення (display string)',
      type: 'localizedString',
    }),
    defineField({
      name: 'label',
      title: 'Підпис',
      type: 'localizedString',
    }),
  ],
  preview: {
    select: {value: 'value', label: 'label'},
    prepare({value, label}) {
      const v = pickLocalizedFirst(value)
      const l = pickLocalizedFirst(label)
      return {
        title: [v, l].filter(Boolean).join(' · ') || 'Показник',
        subtitle: 'metric',
      }
    },
  },
})
```

- [ ] **Step 2: Verify the schema compiles**

Run (from `Sanity/`): `npm run build`
Expected: build completes with no schema errors. (This compiles the Studio; an invalid
field type would fail here.)

- [ ] **Step 3: Commit**

```bash
cd Sanity
git add schemaTypes/objects/metric.ts
git commit -m "feat(schema): make metric.value localizable"
```

---

## Task 2: GROQ — project `value` as a localized object (both fragment copies)

**Files:**
- Modify: `Sanity/queries/fragments.ts` (the `METRIC` fragment)
- Modify: `Frontend/src/lib/server/sanity-queries.ts` (the mirrored `METRIC` fragment)

- [ ] **Step 1: Update `Sanity/queries/fragments.ts`**

Find:

```typescript
export const METRIC = /* groq */ `{
  value,
  label ${LOCALIZED_STRING}
}`
```

Replace with:

```typescript
export const METRIC = /* groq */ `{
  value ${LOCALIZED_STRING},
  label ${LOCALIZED_STRING}
}`
```

- [ ] **Step 2: Update `Frontend/src/lib/server/sanity-queries.ts`**

Find (around line 41):

```typescript
const METRIC = /* groq */ `{
  value,
  label ${LOCALIZED_STRING}
}`
```

Replace with:

```typescript
const METRIC = /* groq */ `{
  value ${LOCALIZED_STRING},
  label ${LOCALIZED_STRING}
}`
```

- [ ] **Step 3: Commit (both repos)**

```bash
cd Sanity
git add queries/fragments.ts
git commit -m "feat(groq): project metric.value as localizedString"
cd ../Frontend
git add src/lib/server/sanity-queries.ts
git commit -m "feat(groq): project metric.value as localizedString"
```

(The Frontend commit will be combined naturally with Task 3/4 work if you prefer to
defer it — but committing the GROQ change here keeps the diff focused.)

---

## Task 3: Frontend type + render callsites

This task changes the `Metric.value` type (which makes `tsc` fail at the three
callsites), then fixes the callsites so it passes again. Do them together so the
Frontend repo is never left in a broken-typecheck state at a commit boundary.

**Files:**
- Modify: `Frontend/src/types/sanity.ts:63-67` (`Metric` type)
- Modify: `Frontend/src/components/case-page/index.tsx` (statsBlock case, ~line 447)
- Modify: `Frontend/src/components/industry-page/index.tsx` (statsBlock case ~line 328; hero stats ~line 690)

- [ ] **Step 1: Change the `Metric.value` type**

In `Frontend/src/types/sanity.ts`, find:

```typescript
export type Metric = {
  _key?: string;
  value?: string;
  label?: LocalizedString;
};
```

Replace with:

```typescript
export type Metric = {
  _key?: string;
  value?: LocalizedString;
  label?: LocalizedString;
};
```

- [ ] **Step 2: Run typecheck to confirm it now fails at the callsites (red)**

Run (from `Frontend/`): `npm run typecheck`
Expected: FAIL. Errors at:
- `src/components/case-page/index.tsx` — `value: m.value ?? ""` (LocalizedString not
  assignable to `React.ReactNode`).
- `src/components/industry-page/index.tsx` — same statsBlock line, and
  `num: s.value ?? ""` (LocalizedString not assignable to `string`).

This confirms we found every callsite that consumes `metric.value`.

- [ ] **Step 3: Fix the case-page statsBlock callsite**

In `Frontend/src/components/case-page/index.tsx`, find the `statsBlock` case:

```tsx
    case "statsBlock":
      return (
        <StatsBar
          items={
            section.items?.map((m) => ({
              value: m.value ?? "",
              label: loc(m.label, locale),
            })) ?? []
          }
        />
      );
```

Replace the `value:` line so it reads:

```tsx
              value: loc(m.value, locale),
```

(`loc` is already imported and used in this file.)

- [ ] **Step 4: Fix the industry-page statsBlock callsite**

In `Frontend/src/components/industry-page/index.tsx`, find the `statsBlock` case:

```tsx
    case "statsBlock":
      return (
        <StatsBar
          items={
            section.items?.map((m) => ({
              value: m.value ?? "",
              label: loc(m.label, locale),
            })) ?? []
          }
        />
      );
```

Replace the `value:` line so it reads:

```tsx
              value: loc(m.value, locale),
```

- [ ] **Step 5: Fix the industry-page hero stats callsite**

In `Frontend/src/components/industry-page/index.tsx`, find the hero `stats` mapping:

```tsx
        stats={
          hero?.stats?.length
            ? hero.stats.map((s) => ({
                num: s.value ?? "",
                lbl: formatLine(loc(s.label, locale)),
              }))
            : undefined
        }
```

Replace the `num:` line so it reads:

```tsx
                num: loc(s.value, locale),
```

- [ ] **Step 6: Run typecheck to confirm it passes (green)**

Run (from `Frontend/`): `npm run typecheck`
Expected: PASS, no errors.

- [ ] **Step 7: Run lint**

Run (from `Frontend/`): `npm run lint`
Expected: no new lint errors in the three edited files.

- [ ] **Step 8: Commit**

```bash
cd Frontend
git add src/types/sanity.ts src/components/case-page/index.tsx src/components/industry-page/index.tsx
git commit -m "feat: render localized metric.value via loc()"
```

---

## Task 4: Migration script — wrap existing string values

**Files:**
- Create: `Sanity/scripts/migrate-metric-value-to-localized.ts`
- Modify: `Sanity/package.json` (add npm script)

- [ ] **Step 1: Create the migration script**

Create `Sanity/scripts/migrate-metric-value-to-localized.ts` with exactly:

```typescript
/**
 * Localize `metric.value` (stats bar) — wrap bare-string values into
 * {uk, ru, en} (the localizedString shape), copying the existing string into
 * all three locales.
 *
 * Design: docs/superpowers/specs/2026-06-13-metric-value-localization-design.md
 *
 * Targets (published AND drafts):
 *   - caseStudy.sections[_type=="statsBlock"].items[]
 *   - industryPage.sections[_type=="statsBlock"].items[]
 *   - industryPage.hero.stats[]
 *
 * Only metrics whose `value` is a string are rewritten. Metrics with an object
 * `value` (already migrated) or no `value` are skipped — idempotent.
 *
 * Dry-run:
 *   npx sanity exec scripts/migrate-metric-value-to-localized.ts --with-user-token
 *
 * Apply:
 *   npx sanity exec scripts/migrate-metric-value-to-localized.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Metric = {_key?: string; value?: unknown}
type Section = {_key?: string; _type?: string; items?: Metric[]}
type Doc = {
  _id: string
  _type: string
  slug?: string
  sections?: Section[]
  heroStats?: Metric[]
}

type Patch = {path: string; value: string}

function localized(s: string) {
  return {uk: s, ru: s, en: s}
}

// Collect the key-based patch paths for every string `value` in a doc.
function collectPatches(doc: Doc): Patch[] {
  const patches: Patch[] = []

  for (const section of doc.sections ?? []) {
    if (section._type !== 'statsBlock') continue
    for (const m of section.items ?? []) {
      if (typeof m.value === 'string' && section._key && m._key) {
        patches.push({
          path: `sections[_key=="${section._key}"].items[_key=="${m._key}"].value`,
          value: m.value,
        })
      }
    }
  }

  for (const m of doc.heroStats ?? []) {
    if (typeof m.value === 'string' && m._key) {
      patches.push({path: `hero.stats[_key=="${m._key}"].value`, value: m.value})
    }
  }

  return patches
}

async function main() {
  console.log(APPLY ? '── APPLY ──' : '── DRY RUN ── (pass `-- --apply` to commit)')

  const docs = await client.fetch<Doc[]>(
    `*[(_type == "caseStudy" || _type == "industryPage") &&
       (count(sections[_type == "statsBlock"]) > 0 || count(hero.stats) > 0)]{
      _id,
      _type,
      "slug": slug.current,
      sections[]{_key, _type, items[]{_key, value}},
      "heroStats": hero.stats[]{_key, value}
    }`,
  )
  console.log(`docs to inspect: ${docs.length}\n`)

  let changed = 0
  for (const doc of docs) {
    const patches = collectPatches(doc)
    if (patches.length === 0) continue

    const tag = `${doc._id} (${doc._type}/${doc.slug ?? '?'})`
    console.log(`  ${tag}: ${patches.length} value(s) → localizedString`)
    changed += patches.length

    if (APPLY) {
      let p = client.patch(doc._id)
      for (const {path, value} of patches) {
        p = p.set({[path]: localized(value)})
      }
      await p.commit()
    }
  }

  console.log(`\n${changed} value(s) ${APPLY ? 'migrated' : 'would be migrated'}.`)

  if (APPLY) {
    // Re-fetch and recount string values via the same JS logic (expected 0).
    const after = await client.fetch<Doc[]>(
      `*[(_type == "caseStudy" || _type == "industryPage") &&
         (count(sections[_type == "statsBlock"]) > 0 || count(hero.stats) > 0)]{
        _id, _type, "slug": slug.current,
        sections[]{_key, _type, items[]{_key, value}},
        "heroStats": hero.stats[]{_key, value}
      }`,
    )
    const leftovers = after.reduce((n, d) => n + collectPatches(d).length, 0)
    console.log(`verify: string metric.value left = ${leftovers} (expected 0)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

> Note: the post-apply verify re-fetches and recounts via the same `collectPatches`
> logic, so it reports the exact number of string values still present (expected 0).
> The idempotency check is also re-runnable: a second dry run reports
> `0 value(s) would be migrated`.

- [ ] **Step 2: Add the npm script**

In `Sanity/package.json`, inside `"scripts"`, add:

```json
    "migrate:metric-value-localized": "sanity exec scripts/migrate-metric-value-to-localized.ts --with-user-token"
```

- [ ] **Step 3: Run the dry run**

Run (from `Sanity/`): `npm run migrate:metric-value-localized`
Expected: `── DRY RUN ──`, a non-zero `docs to inspect`, one line per doc listing how
many values would be migrated, and a final `N value(s) would be migrated.` with N > 0
(there are existing case studies + industry pages with string metric values).

- [ ] **Step 4: Verify idempotency design (no apply yet)**

Confirm the dry-run output lists only documents that currently have **string** values.
Since nothing has been applied, the count should equal the total number of stored
string `value` fields. Do NOT run `--apply` as part of plan execution — applying to the
live dataset is a deploy/rollout step (see spec "Rollout"), performed deliberately by
the operator.

- [ ] **Step 5: Commit**

```bash
cd Sanity
git add scripts/migrate-metric-value-to-localized.ts package.json
git commit -m "feat(migrate): localize existing metric.value strings"
```

---

## Rollout (operator step — not part of code execution)

Per the spec, run the migration with `--apply` **before/with** the deploy:

```bash
cd Sanity
npm run migrate:metric-value-localized -- --apply
```

Then re-run the dry run and confirm `0 value(s) would be migrated.` (idempotent).
Until a doc is migrated, `loc()` on a bare string returns `""` (value renders empty) —
an acceptable transient.

---

## Final verification checklist

- [ ] `Sanity/`: `npm run build` passes (schema compiles).
- [ ] `Frontend/`: `npm run typecheck` passes.
- [ ] `Frontend/`: `npm run lint` passes.
- [ ] `Sanity/`: migration dry run reports the expected non-zero count.
- [ ] Spec coverage: schema (Task 1), GROQ ×2 (Task 2), type + 3 callsites (Task 3),
      migration copying to uk/ru/en (Task 4) — all present.
