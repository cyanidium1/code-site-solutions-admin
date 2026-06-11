/**
 * Unify case-study stats on `statsBlock` (sections) — kill `hero.metrics`.
 *
 * Design: docs/superpowers/specs/2026-06-11-case-stats-unification-design.md
 *
 * Per caseStudy doc (published AND drafts):
 *   1. `hero.metrics` present, no `statsBlock` in sections →
 *      insert a `statsBlock` as the FIRST section with the copied metric
 *      items, then unset `hero.metrics`.
 *   2. `hero.metrics` present alongside an existing `statsBlock` →
 *      just unset `hero.metrics` (known cases: aleko-course duplicates the
 *      block 1:1, nbyg-kobenhavn holds a single empty junk item).
 *   3. `statsBlock` exists but is not the first section → move it to the
 *      front (affects aleko-course only as of 2026-06-11).
 *
 * Empty metric items (no value and no label) are dropped during the copy.
 * Idempotent: re-running after `--apply` reports 0 changes.
 *
 * Dry-run:
 *   npx sanity exec scripts/migrate-hero-metrics-to-stats-block.ts --with-user-token
 *
 * Apply:
 *   npx sanity exec scripts/migrate-hero-metrics-to-stats-block.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type LocalizedStringValue = Record<string, string | undefined>

type MetricItem = {
  _key?: string
  _type?: string
  value?: string
  label?: LocalizedStringValue
}

type Section = {
  _key: string
  _type: string
  items?: MetricItem[]
}

type CaseDoc = {
  _id: string
  slug?: string
  heroMetrics?: MetricItem[]
  sections?: Section[]
}

function newKey(): string {
  return Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 6)
}

function hasContent(m: MetricItem): boolean {
  const value = (m.value ?? '').trim()
  const label = Object.values(m.label ?? {}).some((v) => (v ?? '').trim().length > 0)
  return value.length > 0 || label
}

async function main() {
  console.log(APPLY ? '── APPLY ──' : '── DRY RUN ── (pass `-- --apply` to commit)')

  const docs = await client.fetch<CaseDoc[]>(
    `*[_type == "caseStudy" && (count(hero.metrics) > 0 || count(sections[_type == "statsBlock"]) > 0)]{
      _id,
      "slug": slug.current,
      "heroMetrics": hero.metrics,
      sections
    }`,
  )
  console.log(`caseStudy docs to inspect: ${docs.length}\n`)

  let changed = 0
  for (const doc of docs) {
    const tag = `${doc._id} (${doc.slug ?? '?'})`
    const sections = doc.sections ?? []
    const statsIdx = sections.findIndex((s) => s._type === 'statsBlock')
    const heroMetrics = (doc.heroMetrics ?? []).filter(hasContent)
    const hasHeroField = (doc.heroMetrics ?? []).length > 0

    if (statsIdx === -1 && heroMetrics.length > 0) {
      // case 1: build a statsBlock from hero.metrics, put it first
      const block = {
        _type: 'statsBlock',
        _key: newKey(),
        items: heroMetrics.map((m) => ({
          _type: 'metric',
          _key: newKey(),
          ...(m.value != null ? {value: m.value} : {}),
          ...(m.label != null ? {label: m.label} : {}),
        })),
      }
      changed++
      console.log(`  ${tag}: + statsBlock[0] (${block.items.length} items) · − hero.metrics`)
      if (APPLY) {
        await client
          .patch(doc._id)
          .setIfMissing({sections: []})
          .insert('before', 'sections[0]', [block])
          .commit()
        await client.patch(doc._id).unset(['hero.metrics']).commit()
      }
      continue
    }

    if (hasHeroField) {
      // case 2: statsBlock already covers the page (or hero.metrics is junk)
      changed++
      console.log(`  ${tag}: − hero.metrics (statsBlock already present)`)
      if (APPLY) await client.patch(doc._id).unset(['hero.metrics']).commit()
    }

    if (statsIdx > 0) {
      // case 3: move the existing statsBlock to the front
      const block = sections[statsIdx]
      const moved = {...block, _key: newKey()}
      changed++
      console.log(`  ${tag}: statsBlock sections[${statsIdx}] → sections[0]`)
      if (APPLY) {
        await client.patch(doc._id).insert('before', 'sections[0]', [moved]).commit()
        await client.patch(doc._id).unset([`sections[_key=="${block._key}"]`]).commit()
      }
    }
  }

  console.log(`\n${changed} change(s) ${APPLY ? 'applied' : 'would be applied'}.`)
  if (APPLY) {
    const leftovers = await client.fetch<number>(
      `count(*[_type == "caseStudy" && count(hero.metrics) > 0])`,
    )
    console.log(`verify: docs still holding hero.metrics = ${leftovers} (expected 0)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
