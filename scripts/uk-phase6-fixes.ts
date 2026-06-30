/**
 * UK localisation Phase 6 (QA) — residual misses caught by the final sweep.
 * Validate-before-write.
 *
 * Dry-run:  npx sanity exec scripts/uk-phase6-fixes.ts --with-user-token
 * Apply:    npx sanity exec scripts/uk-phase6-fixes.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const TARGETS = [
  // pricingPlan still carried HIPAA (frontend pricing was fixed in Phase 3, CMS doc was missed)
  {
    id: 'lOTgaDd8FU4wgJ8F4KCFIY',
    path: 'includes[3].en',
    expect: 'Compliance: GDPR / HIPAA-ready',
    to: 'Compliance: UK GDPR / DPA 2018-ready',
  },
  // auto: genericise Raul Avto's UA/RU language tags (consistency with how Efedra
  // was handled on the medicine page) — keep the real multilingual/trilingual fact.
  {
    slug: 'auto',
    path: 'sections[1].meta[1].text.en',
    expect: 'UA · RU · EN',
    to: 'Multilingual',
  },
  {
    slug: 'auto',
    path: 'sections[1].results[2].value.en',
    expect: 'UA+RU+EN',
    to: 'Trilingual',
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
  let ok = 0
  let bad = 0
  for (const t of TARGETS as Array<any>) {
    const doc = t.id
      ? await client.fetch('*[_id==$id][0]', {id: t.id})
      : await client.fetch('*[slug.current==$slug][0]', {slug: t.slug})
    const label = t.id || t.slug
    const cur = getAtPath(doc, t.path)
    if (cur === t.to) {
      console.log(`• already done: ${label} ${t.path}`)
      continue
    }
    if (cur !== t.expect) {
      console.log(`✗ MISMATCH ${label} ${t.path}\n   expect: ${JSON.stringify(t.expect)}\n   found:  ${JSON.stringify(cur)}`)
      bad++
      continue
    }
    console.log(`✓ ${label} ${t.path}\n   -  ${t.expect}\n   +  ${t.to}`)
    if (APPLY) await client.patch(doc._id).set({[t.path]: t.to}).commit()
    ok++
  }
  console.log(`\nPlanned: ${ok} | MISMATCH: ${bad}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
