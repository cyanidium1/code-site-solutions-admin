/**
 * Applies a filled PT translation workbook produced by export-pt-workbook.ts.
 * For each entry, deep-copies the `uk` array at <path>, replaces every
 * translated leaf (by JSON pointer inside that array), and sets
 * <path>.<target> — structure, marks, links, and custom blocks preserved.
 * Entries with any unfilled leaf are skipped (all-or-nothing per body).
 *
 *   Dry run:  npx sanity exec scripts/apply-pt-workbook.ts --with-user-token -- --dir=backups/ru-pt-workbook-YYYY-MM-DD --dry-run
 *   Filters:  --type=blogPost
 * setIfMissing semantics: existing <target> arrays are never overwritten.
 */
import {readdirSync, readFileSync} from 'fs'
import {join, basename} from 'path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const args = process.argv
const DIR = args.find((a) => a.startsWith('--dir='))?.split('=')[1]
const ONLY = args.find((a) => a.startsWith('--type='))?.split('=')[1]
const DRY = args.includes('--dry-run')

type Dict = Record<string, unknown>
type Leaf = {ptr: string; uk: string; [k: string]: string}
type Entry = {docId: string; docType: string; path: string; leaves: Leaf[]}

/** Resolve a GROQ-ish path (a.b[_key=="x"].c) against a JS object. */
function getAtPath(root: unknown, path: string): unknown {
  let cur: unknown = root
  const parts = path.match(/[^.[\]]+|\[[^\]]*\]/g) ?? []
  for (const p of parts) {
    if (cur == null) return undefined
    if (p.startsWith('[')) {
      const inner = p.slice(1, -1)
      const keyMatch = inner.match(/^_key=="(.+)"$/)
      if (!Array.isArray(cur)) return undefined
      cur = keyMatch
        ? cur.find((x) => (x as Dict)?._key === keyMatch[1])
        : cur[Number(inner)]
    } else {
      cur = (cur as Dict)[p]
    }
  }
  return cur
}

/** Set a value at a JSON pointer (/0/children/1/text) inside a structure. */
function setAtPtr(root: unknown, ptr: string, value: string): boolean {
  const parts = ptr.split('/').filter(Boolean)
  let cur: unknown = root
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    cur = Array.isArray(cur) ? cur[Number(p)] : (cur as Dict)?.[p]
    if (cur == null) return false
  }
  const last = parts[parts.length - 1]
  if (Array.isArray(cur)) cur[Number(last)] = value
  else if (cur && typeof cur === 'object') (cur as Dict)[last] = value
  else return false
  return true
}

async function main() {
  if (!DIR) {
    console.error('Pass --dir=backups/<target>-pt-workbook-<date>')
    process.exit(1)
  }
  const files = readdirSync(DIR).filter((f) => f.endsWith('.json'))
  let target = 'ru'
  const entries: Entry[] = []
  for (const f of files) {
    if (ONLY && basename(f, '.json') !== ONLY) continue
    const list = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Entry[]
    for (const e of list) {
      const extra = Object.keys(e.leaves[0] ?? {}).find((k) => !['ptr', 'uk'].includes(k))
      if (extra) target = extra
      entries.push(e)
    }
  }

  const byDoc = new Map<string, Entry[]>()
  for (const e of entries) {
    const filled = e.leaves.every((l) => (l[target] ?? '').trim())
    if (!filled) {
      if (e.leaves.some((l) => (l[target] ?? '').trim())) {
        console.warn(`SKIP ${e.docId} ${e.path}: partially filled (${e.leaves.filter((l) => !(l[target] ?? '').trim()).length} empty)`)
      }
      continue
    }
    if (!byDoc.has(e.docId)) byDoc.set(e.docId, [])
    byDoc.get(e.docId)!.push(e)
  }

  const tx = client.transaction()
  let bodies = 0
  let patchedDocs = 0
  for (const [docId, list] of byDoc) {
    const doc = await client.fetch<Dict | null>(`*[_id == $id][0]`, {id: docId})
    if (!doc) {
      console.warn(`SKIP ${docId}: not found`)
      continue
    }
    const set: Dict = {}
    for (const e of list) {
      const holder = getAtPath(doc, e.path) as Dict | undefined
      const uk = holder?.uk
      if (!Array.isArray(uk)) {
        console.warn(`SKIP ${docId} ${e.path}: uk array not found`)
        continue
      }
      const copy = JSON.parse(JSON.stringify(uk))
      let ok = true
      for (const l of e.leaves) {
        if (!setAtPtr(copy, l.ptr, l[target].trim())) {
          console.warn(`SKIP ${docId} ${e.path}: bad ptr ${l.ptr}`)
          ok = false
          break
        }
      }
      if (!ok) continue
      set[`${e.path}.${target}`] = copy
      bodies++
    }
    if (!Object.keys(set).length) continue
    console.log(`${docId}: ${Object.keys(set).length} localized bod(y/ies)`)
    tx.patch(docId, (p) => p.setIfMissing(set))
    patchedDocs++
  }

  if (!patchedDocs) {
    console.log('Nothing fully translated to apply.')
    return
  }
  if (DRY) {
    console.log(`DRY RUN: would set ${bodies} bod(y/ies) on ${patchedDocs} document(s).`)
    return
  }
  await tx.commit()
  console.log(`Set ${bodies} bod(y/ies) on ${patchedDocs} document(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
