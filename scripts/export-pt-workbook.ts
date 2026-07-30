/**
 * Structure-preserving Portable Text translation export. For every localized
 * object whose `uk` member is a non-empty ARRAY and whose <target> member is
 * empty, emits an entry {docId, docType, path, leaves: [{ptr, uk, ru: ""}]}
 * where each leaf is one translatable string inside the PT structure
 * (span texts, alts, captions, table cells, tldr items, CTA labels…).
 * Apply with apply-pt-workbook.ts — it deep-copies the uk array, swaps the
 * translated leaves in place, and writes <path>.<target>, so headings,
 * lists, marks, links, and custom blocks survive intact.
 *
 * Run:
 *   npx sanity exec scripts/export-pt-workbook.ts --with-user-token -- --target=ru [--type=blogPost]
 * Output: backups/<target>-pt-workbook-<date>/<docType>.json
 */
import {mkdirSync, writeFileSync} from 'fs'
import {join} from 'path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const args = process.argv
const TARGET = (args.find((a) => a.startsWith('--target='))?.split('=')[1] ?? 'ru') as string
const ONLY = args.find((a) => a.startsWith('--type='))?.split('=')[1]

type Dict = Record<string, unknown>
type Leaf = {ptr: string; uk: string; [k: string]: string}
type Entry = {docId: string; docType: string; path: string; leaves: Leaf[]}

/** Keys whose string values are NOT translatable content. */
const SKIP_KEYS = new Set([
  'style', 'listItem', 'href', 'url', 'youtubeId', 'ctaHref',
  'ctaSecondaryHref', 'ctaMode', 'leadSource', 'src', 'marks',
])

function collectLeaves(v: unknown, ptr: string, out: Leaf[]): void {
  if (Array.isArray(v)) {
    // Bare strings inside arrays (tldr items, table headers/cells) are
    // translatable leaves too — missing them leaves source-language text
    // inside the copied target array.
    v.forEach((x, i) => {
      if (typeof x === 'string') {
        if (x.trim()) out.push({ptr: `${ptr}/${i}`, uk: x, [TARGET]: ''})
      } else collectLeaves(x, `${ptr}/${i}`, out)
    })
    return
  }
  if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v as Dict)) {
      if (k.startsWith('_') || SKIP_KEYS.has(k)) continue
      if (typeof val === 'string') {
        if (val.trim()) out.push({ptr: `${ptr}/${k}`, uk: val, [TARGET]: ''})
      } else {
        collectLeaves(val, `${ptr}/${k}`, out)
      }
    }
  }
}

const entries: Entry[] = []

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
    if (Array.isArray(uk) && uk.length && !(Array.isArray(tgt) && tgt.length)) {
      const leaves: Leaf[] = []
      collectLeaves(uk, '', leaves)
      if (leaves.length) entries.push({docId, docType, path, leaves})
    }
    for (const [k, val] of Object.entries(o)) {
      if (!k.startsWith('_')) scan(val, docId, docType, path ? `${path}.${k}` : k)
    }
  }
}

async function main() {
  const filter = ONLY ? ` && _type == "${ONLY}"` : ''
  const docs = await client.fetch<Dict[]>(`*[!(_id in path("drafts.**"))${filter}]`)
  for (const d of docs) scan(d, String(d._id), String(d._type), '')

  const date = new Date().toISOString().slice(0, 10)
  const dir = join('backups', `${TARGET}-pt-workbook-${date}`)
  mkdirSync(dir, {recursive: true})

  const byType = new Map<string, Entry[]>()
  for (const e of entries) {
    if (!byType.has(e.docType)) byType.set(e.docType, [])
    byType.get(e.docType)!.push(e)
  }
  let total = 0
  let chars = 0
  for (const [type, list] of byType) {
    writeFileSync(join(dir, `${type}.json`), JSON.stringify(list, null, 2))
    const leaves = list.reduce((n, e) => n + e.leaves.length, 0)
    const c = list.reduce((n, e) => n + e.leaves.reduce((m, l) => m + l.uk.length, 0), 0)
    console.log(`${type}: ${list.length} bodies, ${leaves} leaves, ${c} chars`)
    total += leaves
    chars += c
  }
  console.log(`TOTAL: ${total} leaves (${chars} chars) -> ${dir}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
