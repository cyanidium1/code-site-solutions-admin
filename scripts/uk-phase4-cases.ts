/**
 * UK localisation Phase 4 — re-narrate machine-translated case studies.
 *
 * Reads patch files (patches-<slug>.json: [{path, expect, to}]) and applies
 * them to caseStudy docs with validate-before-write. Dry-run by default.
 *
 * Dry-run:  npx sanity exec scripts/uk-phase4-cases.ts --with-user-token
 * Apply:    npx sanity exec scripts/uk-phase4-cases.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'
import * as fs from 'fs'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const DIR =
  fs.existsSync(__dirname + '/uk-phase4-patches')
    ? __dirname + '/uk-phase4-patches'
    : 'C:/Users/kulak/AppData/Local/Temp/claude/C--GitHub23-code-site-workspace/8de58134-5bfd-4f76-882c-82eb3077e213/scratchpad/en-dumps'
const SLUGS = ['raul-avto', 'nbyg-kobenhavn', 'tatarka-franchise']

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
  console.log('='.repeat(78))
  let gOk = 0
  let gDone = 0
  let gBad = 0
  for (const slug of SLUGS) {
    const patches: Array<{path: string; expect: string; to: string}> = JSON.parse(
      fs.readFileSync(`${DIR}/patches-${slug}.json`, 'utf8'),
    )
    const doc = await client.fetch('*[_type=="caseStudy" && slug.current==$slug][0]{...}', {slug})
    if (!doc) {
      console.log(`\n✗ NOT FOUND: ${slug}`)
      continue
    }
    const sets: Record<string, string> = {}
    let ok = 0
    let done = 0
    const bad: string[] = []
    for (const p of patches) {
      const cur = getAtPath(doc, p.path)
      if (cur === p.to) {
        done++
        continue
      }
      if (cur !== p.expect) {
        bad.push(`    ✗ ${p.path}\n        expect: ${(JSON.stringify(p.expect) || 'undefined').slice(0, 150)}\n        found:  ${(JSON.stringify(cur) || 'undefined').slice(0, 150)}`)
        continue
      }
      sets[p.path] = p.to
      ok++
    }
    console.log(`\n[${slug}] patches:${patches.length}  apply:${ok}  done:${done}  MISMATCH:${bad.length}`)
    if (bad.length) console.log(bad.join('\n'))
    if (APPLY && ok > 0) {
      await client.patch(doc._id).set(sets).commit()
      console.log(`  → wrote ${ok} fields`)
    }
    gOk += ok
    gDone += done
    gBad += bad.length
  }
  console.log('\n' + '='.repeat(78))
  console.log(`TOTAL  apply:${gOk}  already-done:${gDone}  MISMATCH:${gBad}`)
  if (gBad) console.log('⚠ Review mismatches before applying.')
  if (!APPLY) console.log('(Re-run with -- --apply to write.)')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
