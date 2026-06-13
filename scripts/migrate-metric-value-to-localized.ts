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
