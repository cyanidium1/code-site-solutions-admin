/**
 * Cleanup: unset the display-only browser-frame URL fields after the frontend
 * stopped rendering browser chrome around screenshots (July 2026):
 *   - caseBlock sections:   before.url / after.url  (industryPage + caseStudy)
 *   - outcomeBlock rows:    benefitRows[].mockUrl   (industryPage)
 * The schema fields were removed in the same change; this scrubs the orphaned
 * values so Studio shows no "Unknown field" warnings. Idempotent.
 *
 * Removed values are printed and saved to
 * backups/browser-frame-urls-<date>.json before writing.
 *
 * Dry-run:  npx sanity exec scripts/unset-browser-frame-urls.ts --with-user-token
 * Apply:    npx sanity exec scripts/unset-browser-frame-urls.ts --with-user-token -- --apply
 */
import {writeFileSync} from 'fs'

import {getCliClient} from 'sanity/cli'

const c = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type CaseHit = {_key: string; beforeUrl?: string; afterUrl?: string}
type OutcomeHit = {_key: string; rows: {_key: string; mockUrl: string}[]}
type Doc = {_id: string; _type: string; caseHits: CaseHit[]; outcomeHits: OutcomeHit[]}

async function main() {
  const docs = await c.fetch<Doc[]>(`
    *[_type in ["industryPage", "caseStudy"]]{
      _id, _type,
      "caseHits": sections[_type == "caseBlock" && (defined(before.url) || defined(after.url))]{
        _key, "beforeUrl": before.url, "afterUrl": after.url
      },
      "outcomeHits": sections[_type == "outcomeBlock" && count(benefitRows[defined(mockUrl)]) > 0]{
        _key, "rows": benefitRows[defined(mockUrl)]{_key, mockUrl}
      },
    }[count(caseHits) > 0 || count(outcomeHits) > 0]
  `)

  if (!docs.length) {
    console.log('→ Nothing to unset (already clean).')
    return
  }

  const backup: Record<string, unknown> = {}
  for (const d of docs) {
    backup[d._id] = {caseHits: d.caseHits, outcomeHits: d.outcomeHits}
    console.log(d._id)
    for (const h of d.caseHits) {
      if (h.beforeUrl) console.log(`  caseBlock ${h._key} before.url = ${h.beforeUrl}`)
      if (h.afterUrl) console.log(`  caseBlock ${h._key} after.url  = ${h.afterUrl}`)
    }
    for (const h of d.outcomeHits) {
      for (const r of h.rows) console.log(`  outcomeBlock ${h._key} row ${r._key} mockUrl = ${r.mockUrl}`)
    }
  }

  if (!APPLY) {
    console.log('\nRe-run with `-- --apply` to write.')
    return
  }

  const stamp = new Date().toISOString().slice(0, 10)
  const backupPath = `backups/browser-frame-urls-${stamp}.json`
  writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`\n✓ Backup written to ${backupPath}`)

  const tx = c.transaction()
  for (const d of docs) {
    const paths: string[] = []
    for (const h of d.caseHits) {
      if (h.beforeUrl !== undefined) paths.push(`sections[_key=="${h._key}"].before.url`)
      if (h.afterUrl !== undefined) paths.push(`sections[_key=="${h._key}"].after.url`)
    }
    for (const h of d.outcomeHits) {
      for (const r of h.rows) {
        paths.push(`sections[_key=="${h._key}"].benefitRows[_key=="${r._key}"].mockUrl`)
      }
    }
    tx.patch(d._id, (p) => p.unset(paths))
  }
  await tx.commit()
  console.log(`✓ Unset browser-frame URLs on ${docs.length} document(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
