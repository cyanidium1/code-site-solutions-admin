/**
 * Localize the three shared (previously locale-neutral) price fields so EN
 * shows £ and UA keeps $.
 *
 * These fields were plain strings rendered on BOTH locales. Their schema is now
 * `localizedString`, so this migrates each existing string value to
 * `{uk: <original $>, en: <£ swap>}`. The EN slot is a symbol-only swap ($→£),
 * matching the rest of the GBP migration — numbers are NOT converted. Values
 * with no "$" (e.g. "×3.2", "98") get identical uk/en slots.
 *
 * Targets:
 *   - caseStudy.budget                                  (Studio-only display)
 *   - caseBlock results[].value   (industryPage + caseStudy sections)
 *   - calculatorSeoGrowthOptions.options[].priceLabel
 *
 * Idempotent — values already shaped as objects are skipped.
 *
 * Run AFTER the frontend + schema changes are deployed.
 *   Dry-run:  npx sanity exec scripts/localize-shared-price-fields.ts --with-user-token
 *   Apply:    npx sanity exec scripts/localize-shared-price-fields.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const toGbp = (s: string) => s.replace(/\$/g, '£')
const localize = (s: string) => ({uk: s, en: toGbp(s)})
const isPlainString = (v: unknown): v is string => typeof v === 'string'

type SetMap = Record<string, {uk: string; en: string}>

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY-RUN (no writes)'}`)
  console.log('='.repeat(78))

  const docs: any[] = await client.fetch('*[!(_id in path("_.**"))]')
  let docsChanged = 0
  let fieldsChanged = 0

  for (const doc of docs) {
    const sets: SetMap = {}

    // 1) caseStudy.budget (root display string)
    if (doc._type === 'caseStudy' && isPlainString(doc.budget)) {
      sets['budget'] = localize(doc.budget)
    }

    // 2) caseBlock results[].value — inside top-level sections[]
    if (Array.isArray(doc.sections)) {
      for (const section of doc.sections) {
        if (section?._type !== 'caseBlock' || !Array.isArray(section.results)) continue
        for (const r of section.results) {
          if (!isPlainString(r?.value)) continue
          sets[`sections[_key=="${section._key}"].results[_key=="${r._key}"].value`] = localize(
            r.value,
          )
        }
      }
    }

    // 3) calculatorSeoGrowthOptions.options[].priceLabel
    if (doc._type === 'calculatorSeoGrowthOptions' && Array.isArray(doc.options)) {
      for (const o of doc.options) {
        if (!isPlainString(o?.priceLabel)) continue
        sets[`options[_key=="${o._key}"].priceLabel`] = localize(o.priceLabel)
      }
    }

    const paths = Object.keys(sets)
    if (paths.length === 0) continue

    docsChanged++
    fieldsChanged += paths.length
    console.log(`\n[${doc._type}] ${doc._id}  — ${paths.length} field(s)`)
    for (const p of paths) {
      console.log(`  .${p}`)
      console.log(`     uk: ${sets[p].uk}`)
      console.log(`     en: ${sets[p].en}`)
    }

    if (APPLY) {
      await client.patch(doc._id).set(sets).commit()
    }
  }

  console.log('\n' + '='.repeat(78))
  console.log(`Docs changed: ${docsChanged} | fields localized: ${fieldsChanged}`)
  if (!APPLY) console.log('(Re-run with -- --apply to write changes.)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
