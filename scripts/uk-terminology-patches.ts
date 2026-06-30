/**
 * UK terminology — exact patches the sweep deliberately skipped (Phase 2).
 * Grammatically-reshaped legal-form line + single category label.
 * Validate-before-write: only writes when the field still holds `expect`.
 *
 * (Deeper sole-proprietor/LLC/tax-ID mentions live inside Ukrainian-market
 *  answers — MEDoc, Wise/UAH — and are left for Phase 3's wholesale rewrite.)
 *
 * Dry-run:  npx sanity exec scripts/uk-terminology-patches.ts --with-user-token
 * Apply:    npx sanity exec scripts/uk-terminology-patches.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Target = {id?: string; type?: string; slug?: string; path: string; expect: string; to: string}

const TARGETS: Target[] = [
  {id: 'a12f4725-fad7-414d-81d8-3286208a614e', path: 'name.en', expect: 'Auto', to: 'Motor'},
  {
    type: 'industryPage',
    slug: 'finance',
    path: 'sections[2].directions.replaceItems[0].en',
    expect: 'clear structure of services for individual entrepreneurs, LLC and business',
    to: 'clear structure of services for sole traders, limited companies and businesses',
  },
]

function getAtPath(obj: any, path: string): any {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`)
  console.log('='.repeat(70))
  let ok = 0
  let skip = 0
  for (const t of TARGETS) {
    const q = t.id ? '*[_id==$id][0]' : '*[_type==$type && slug.current==$slug][0]'
    const doc = await client.fetch(q, t.id ? {id: t.id} : {type: t.type, slug: t.slug})
    if (!doc) {
      console.log(`\n✗ NOT FOUND: ${t.id || t.type + '/' + t.slug}`)
      skip++
      continue
    }
    const cur = getAtPath(doc, t.path)
    if (cur === t.to) {
      console.log(`\n• already done: ${t.path}`)
      skip++
      continue
    }
    if (cur !== t.expect) {
      console.log(`\n✗ MISMATCH (skipped): ${t.path}\n    expected: ${JSON.stringify(t.expect)}\n    found:    ${JSON.stringify(cur)}`)
      skip++
      continue
    }
    console.log(`\n✓ [${doc._type}] ${t.path}\n    -  ${t.expect}\n    +  ${t.to}`)
    if (APPLY) await client.patch(doc._id).set({[t.path]: t.to}).commit()
    ok++
  }
  console.log('\n' + '='.repeat(70))
  console.log(`Planned: ${ok} | skipped: ${skip}`)
  if (!APPLY) console.log('(Re-run with -- --apply to write.)')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
