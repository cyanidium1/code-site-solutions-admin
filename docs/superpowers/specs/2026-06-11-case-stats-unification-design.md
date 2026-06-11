# Case-study stats bar unification — design

**Date:** 2026-06-11
**Status:** approved (chat, 2026-06-11)

## Problem

Case studies had two competing homes for the stats bar:

1. `hero.metrics` («Показники» in the Hero group of `caseStudy`) — **never rendered**
   by the frontend. `CasePageHero` does not accept metrics; the data was fetched by
   GROQ and silently dropped. 10 published cases relied on it and showed no stats.
2. `statsBlock` («Статистика») in `sections[]` — rendered via the shared `StatsBar`
   component. 11 published cases used it (10 as the first section, visually a hero
   stats bar; aleko-course had it last).

Overlap: aleko-course duplicated identical data in both places; nbyg-kobenhavn had
one empty junk `hero.metrics` item.

## Decision

**Unify on `statsBlock` in `sections[]`. Delete `hero.metrics` entirely.**

Reasons: it is the only variant the frontend renders (no layout work), the same block
is reused by industry pages, first-section placement already reads as a hero stats
bar (the `heroImage` field description even says «над stats-bar»), and a section
block is more flexible (optional eyebrow/heading, repositionable).

Content decision: migrate the 10 invisible `hero.metrics` datasets **as-is** into a
first-position `statsBlock` (editors polish weak copy later in Studio).

## Changes

1. **Data migration** — `scripts/migrate-hero-metrics-to-stats-block.ts`
   (dry-run by default, `-- --apply` to commit):
   - cases with `hero.metrics` and no `statsBlock` → insert a `statsBlock` as the
     first section with the copied metric items, then unset `hero.metrics`;
   - cases with both → unset `hero.metrics` (data was duplicate/junk);
   - any `statsBlock` not in first position → moved to first (affects aleko-course).
   - drafts are processed alongside published docs; idempotent.
2. **Schema** — remove the `metrics` field from `caseStudy.hero`.
3. **GROQ** — remove `metrics[]` from the hero projections in
   `queries/caseStudy.ts`, `queries/fragments.ts` (listing projection), and the
   frontend mirror `src/lib/server/sanity-queries.ts`.
4. **Types** — remove `hero.metrics` from `CaseStudyRef` and `CaseStudyDoc` in
   frontend `src/types/sanity.ts`.

## Out of scope

- Rewriting weak metric copy (editorial follow-up in Studio).
- `metric` object type stays — used by `statsBlock`, `outcomeBlock`, industry pages.
