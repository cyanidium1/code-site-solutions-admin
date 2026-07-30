/**
 * Imports a filled translation workbook produced by
 * export-translation-workbook.ts. Only rows whose target value is non-empty
 * are applied; rows whose target field already has a value are skipped
 * unless --overwrite.
 *
 *   Dry run:  npx sanity exec scripts/import-translation-workbook.ts --with-user-token -- --dir=backups/ru-workbook-YYYY-MM-DD --dry-run
 *   Real run: npx sanity exec scripts/import-translation-workbook.ts --with-user-token -- --dir=...
 *   Filters:  --type=industryPage (one docType file only)
 *
 * `kind: "pt"` rows are converted back to Portable Text via the same
 * paragraph rules as the Studio paste modal (blank line = new block).
 */
import {readdirSync, readFileSync} from 'fs'
import {join, basename} from 'path'
import {getCliClient} from 'sanity/cli'
import {plainTextToPortableTextBlocks} from '../lib/localizedPaste/plainTextToPtBlocks'

const client = getCliClient({apiVersion: '2025-01-01'})
const args = process.argv
const DIR = args.find((a) => a.startsWith('--dir='))?.split('=')[1]
const ONLY = args.find((a) => a.startsWith('--type='))?.split('=')[1]
const DRY = args.includes('--dry-run')
const OVERWRITE = args.includes('--overwrite')

type Row = {docId: string; docType: string; path: string; kind: 'string' | 'text' | 'pt'; uk: string; [k: string]: string}

async function main() {
  if (!DIR) {
    console.error('Pass --dir=backups/<target>-workbook-<date>')
    process.exit(1)
  }
  const files = readdirSync(DIR).filter((f) => f.endsWith('.json'))
  const rows: Row[] = []
  let target = 'ru'
  for (const f of files) {
    if (ONLY && basename(f, '.json') !== ONLY) continue
    const list = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Row[]
    for (const r of list) {
      const extra = Object.keys(r).find((k) => !['docId', 'docType', 'path', 'kind', 'uk'].includes(k))
      if (extra) target = extra
      rows.push(r)
    }
  }

  const byDoc = new Map<string, Row[]>()
  for (const r of rows) {
    const val = (r[target] ?? '').trim()
    if (!val) continue
    if (!byDoc.has(r.docId)) byDoc.set(r.docId, [])
    byDoc.get(r.docId)!.push(r)
  }

  const tx = client.transaction()
  let patched = 0
  let fields = 0
  for (const [docId, list] of byDoc) {
    const set: Record<string, unknown> = {}
    for (const r of list) {
      const attr = `${r.path}.${target}`
      if (!OVERWRITE) {
        // Existence check happens server-side via setIfMissing semantics:
        // we use set() but skip rows the export marked as already-filled
        // (the export only emits empty-target rows, so plain set is safe
        // unless the doc changed since export — use --overwrite to force).
      }
      set[attr] =
        r.kind === 'pt' ? plainTextToPortableTextBlocks(r[target]) : r[target].trim()
      fields++
    }
    console.log(`${docId}: ${list.length} field(s)`)
    tx.patch(docId, (p) => (OVERWRITE ? p.set(set) : p.setIfMissing(set)))
    patched++
  }

  if (!patched) {
    console.log('No filled rows to import.')
    return
  }
  if (DRY) {
    console.log(`DRY RUN: would set ${fields} field(s) on ${patched} document(s).`)
    return
  }
  await tx.commit()
  console.log(`Set ${fields} field(s) on ${patched} document(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
