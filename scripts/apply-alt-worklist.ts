/**
 * Applies proposed alts from scripts/alt-worklist.json. Skips entries with
 * empty proposals or proposals identical to current. Dry-run by default.
 *
 * Run: npx sanity exec scripts/apply-alt-worklist.ts --with-user-token             (dry-run)
 *      npx sanity exec scripts/apply-alt-worklist.ts --with-user-token -- --commit
 */
import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'

const client = getCliClient({apiVersion: '2024-10-01'})
const COMMIT = process.argv.includes('--commit')

function main() {
  const wl = JSON.parse(readFileSync('scripts/alt-worklist.json', 'utf8'))
  const byDoc = new Map<string, {path: string; uk: string; en: string}[]>()
  for (const e of wl.entries) {
    const uk = (e.proposed?.uk ?? '').trim() || (e.current?.uk ?? '')
    const en = (e.proposed?.en ?? '').trim() || (e.current?.en ?? '')
    if (!uk && !en) continue
    if (uk === (e.current?.uk ?? '') && en === (e.current?.en ?? '')) continue
    if (!byDoc.has(e.docId)) byDoc.set(e.docId, [])
    byDoc.get(e.docId)!.push({path: e.patchPath, uk, en})
  }
  let chain: Promise<unknown> = Promise.resolve()
  let total = 0
  for (const [docId, items] of byDoc) {
    total += items.length
    chain = chain.then(async () => {
      let patch = client.patch(docId)
      for (const it of items) {
        patch = patch.setIfMissing({[it.path]: {_type: 'localizedString'}})
        const sets: Record<string, string> = {}
        if (it.uk) sets[`${it.path}.uk`] = it.uk
        if (it.en) sets[`${it.path}.en`] = it.en
        patch = patch.set(sets)
      }
      console.log(docId, `${items.length} alt(s)`)
      if (COMMIT) await patch.commit()
    })
  }
  return chain.then(() =>
    console.log(`${total} alts across ${byDoc.size} docs — ${COMMIT ? 'APPLIED' : 'dry-run, re-run with -- --commit'}`),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
