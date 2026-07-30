/**
 * Exports a translation workbook: every localized field with non-empty `uk`
 * and empty <target> becomes a row {docId, docType, path, kind, uk, <target>: ""}.
 * Portable-text values are flattened to plain text (blank line between
 * blocks) — the same format `plainTextToPtBlocks` parses back on import.
 *
 * Read-only. Run:
 *   npx sanity exec scripts/export-translation-workbook.ts --with-user-token -- --target=ru
 *
 * Output: backups/<target>-workbook-<date>/<docType>.json + summary.md
 * Translate the empty fields, then apply with import-translation-workbook.ts.
 */
import {mkdirSync, writeFileSync} from 'fs'
import {join} from 'path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const TARGET = (process.argv.find((a) => a.startsWith('--target='))?.split('=')[1] ?? 'ru') as string

type Dict = Record<string, unknown>
type Row = {docId: string; docType: string; path: string; kind: 'string' | 'text' | 'pt'; uk: string; [k: string]: string}

const rows: Row[] = []

function ptText(blocks: unknown[]): string {
  const out: string[] = []
  for (const b of blocks) {
    const blk = b as Dict
    if (blk?._type !== 'block') continue
    const ch = blk.children
    let line = ''
    if (Array.isArray(ch)) for (const s of ch) line += String((s as Dict)?.text ?? '')
    if (line.trim()) out.push(line)
  }
  return out.join('\n\n')
}

function scan(v: unknown, docId: string, docType: string, path: string): void {
  if (Array.isArray(v)) {
    v.forEach((x, i) => {
      const key = (x as Dict)?._key
      scan(x, docId, docType, `${path}[${key ? `_key=="${key}"` : i}]`)
    })
    return
  }
  if (v && typeof v === 'object') {
    const o = v as Dict
    const uk = o.uk
    const tgt = o[TARGET]
    if (typeof uk === 'string' && uk.trim() && !(typeof tgt === 'string' && tgt.trim())) {
      rows.push({docId, docType, path, kind: uk.includes('\n') ? 'text' : 'string', uk, [TARGET]: ''})
    }
    if (Array.isArray(uk) && uk.length && !(Array.isArray(tgt) && tgt.length)) {
      const txt = ptText(uk)
      if (txt) rows.push({docId, docType, path, kind: 'pt', uk: txt, [TARGET]: ''})
    }
    for (const [k, val] of Object.entries(o)) {
      if (!k.startsWith('_')) scan(val, docId, docType, path ? `${path}.${k}` : k)
    }
  }
}

async function main() {
  const docs = await client.fetch<Dict[]>(`*[!(_id in path("drafts.**"))]`)
  for (const d of docs) scan(d, String(d._id), String(d._type), '')

  const date = new Date().toISOString().slice(0, 10)
  const dir = join('backups', `${TARGET}-workbook-${date}`)
  mkdirSync(dir, {recursive: true})

  const byType = new Map<string, Row[]>()
  for (const r of rows) {
    if (!byType.has(r.docType)) byType.set(r.docType, [])
    byType.get(r.docType)!.push(r)
  }

  const summary: string[] = [`# ${TARGET.toUpperCase()} translation workbook — ${date}`, '']
  let total = 0
  let chars = 0
  for (const [type, list] of [...byType.entries()].sort((a, b) => b[1].length - a[1].length)) {
    writeFileSync(join(dir, `${type}.json`), JSON.stringify(list, null, 2))
    const c = list.reduce((n, r) => n + r.uk.length, 0)
    summary.push(`- **${type}**: ${list.length} fields, ${c} chars`)
    total += list.length
    chars += c
  }
  summary.push('', `**Total: ${total} fields, ${chars} chars.**`, '', `Fill the empty "${TARGET}" values, then run:`, '', '```', `npx sanity exec scripts/import-translation-workbook.ts --with-user-token -- --dir=${dir} --dry-run`, '```')
  writeFileSync(join(dir, 'summary.md'), summary.join('\n'))
  console.log(`Wrote ${total} rows (${chars} chars) across ${byType.size} files to ${dir}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
