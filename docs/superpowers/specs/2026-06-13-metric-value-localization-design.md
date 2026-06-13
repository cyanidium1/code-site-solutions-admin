# Localize `metric.value` (stats-bar value strings) — design

**Date:** 2026-06-13
**Status:** approved (chat, 2026-06-13)

## Problem

The `metric` object type (`schemaTypes/objects/metric.ts`) backs the stats bar. It
has an **unlocalizable** `value` (plain `string`, e.g. «98», «×8», «Top-1») paired
with a **localized** `label` (`localizedString`). The split is inconsistent: a value
like «$4M raised» or «Top-1» often needs a per-locale form («$4M залучено», «1-е
місце»), but editors have nowhere to put it.

`metric` is consumed in exactly two places:

1. `statsBlock` («Статистика») — used by `caseStudy.sections[]` and
   `industryPage.sections[]`, rendered by the shared `StatsBar` component.
2. `industryPage.hero.stats[]` — rendered in the industry hero.

`outcomeBlock.benefitHero.value` and `reasonsBlock.reasons[].stat.value` are
**separate inline objects**, not the `metric` type — out of scope.

## Decision

**Make `metric.value` localizable: change its type from `string` to
`localizedString`.** This unifies the field with `label` and applies to both
consumers (shared type — chosen over forking a stats-only variant).

Existing stored `value` strings are migrated by **copying the string into all three
locales** (`uk`, `ru`, `en`), so display is unchanged until an editor differentiates
a locale. (Chosen over uk-only + fallback for explicitness.)

## Changes

### 1. CMS schema — `schemaTypes/objects/metric.ts`
- `value`: `type: 'string'` → `type: 'localizedString'`.
- Preview `prepare`: use `pickLocalizedFirst(value)` instead of the raw string.
- Update the file's doc comment (drop "unlocalizable display string" wording).

### 2. GROQ fragment — `METRIC` (mirrored in two files)
- `Sanity/queries/fragments.ts` (`METRIC`): `value,` → ``value ${LOCALIZED_STRING},``.
- `Frontend/src/lib/server/sanity-queries.ts` (`METRIC`): same change.

### 3. Frontend type — `Frontend/src/types/sanity.ts`
- `Metric.value`: `string` → `LocalizedString`.

### 4. Frontend rendering — switch raw string → `loc(...)`
- `Frontend/src/components/case-page/index.tsx` (`statsBlock` case):
  `value: m.value ?? ""` → `value: loc(m.value, locale)`.
- `Frontend/src/components/industry-page/index.tsx` (`statsBlock` case): same.
- `Frontend/src/components/industry-page/index.tsx` (hero `stats` map):
  `num: s.value ?? ""` → `num: loc(s.value, locale)`.

### 5. Data migration — `Sanity/scripts/migrate-metric-value-to-localized.ts`
Follow the existing `migrate-hero-metrics-to-stats-block.ts` pattern:
- dry-run by default, `-- --apply` to commit; idempotent; processes published +
  drafts.
- Targets: every `statsBlock.items[]` inside `caseStudy.sections` and
  `industryPage.sections`, plus every `industryPage.hero.stats[]`.
- For each metric whose `value` is a bare string `s`, rewrite to
  `{uk: s, ru: s, en: s}`. Skip metrics where `value` is already an object
  (idempotency) or absent.

## Rollout

Run the migration **before/with** the deploy. Until a doc is migrated, `loc()` on a
bare string returns `""` (the stat value renders empty) — an acceptable transient;
the migration is idempotent and safe to re-run.

## Out of scope

- Rewriting actual copy into ru/en (editorial follow-up in Studio).
- `reasonsBlock.reasons[].stat` and `outcomeBlock.benefitHero` (separate inline
  string objects, not the `metric` type).
- Backup JSON snapshots under `Sanity/backups/` (historical records, left as-is).
