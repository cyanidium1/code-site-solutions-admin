/**
 * Fixes the collectLeaves gap: bare strings inside arrays (tldr items,
 * table headers/cells) were copied from uk into <path>.ru untranslated.
 *
 *   Dump mode (default): lists {docId, path, ptr, uk} for every bare-string
 *   leaf of each localized uk array that also has a ru member.
 *   Apply mode: --apply --map=<file.json> where map is
 *   [{docId, path, ptr, ru}] — sets those leaves inside <path>.ru.
 *
 * Run: npx sanity exec scripts/fix-ru-pt-bare-strings.ts --with-user-token -- [--apply --map=...]
 */
import {readFileSync} from 'fs'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
type Dict = Record<string, unknown>
const APPLY = process.argv.includes('--apply')
const MAP = process.argv.find((a) => a.startsWith('--map='))?.split('=')[1]

function collectBare(v: unknown, ptr: string, out: Array<{ptr: string; uk: string}>): void {
  if (Array.isArray(v)) {
    v.forEach((x, i) => {
      if (typeof x === 'string') {
        if (x.trim()) out.push({ptr: `${ptr}/${i}`, uk: x})
      } else collectBare(x, `${ptr}/${i}`, out)
    })
    return
  }
  if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v as Dict)) {
      if (k.startsWith('_')) continue
      if (typeof val !== 'string') collectBare(val, `${ptr}/${k}`, out)
    }
  }
}

const found: Array<{docId: string; docType: string; path: string; ptr: string; uk: string}> = []

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
    if (Array.isArray(o.uk) && Array.isArray(o.ru) && o.ru.length) {
      const leaves: Array<{ptr: string; uk: string}> = []
      collectBare(o.uk, '', leaves)
      for (const l of leaves) found.push({docId, docType, path, ptr: l.ptr, uk: l.uk})
    }
    for (const [k, val] of Object.entries(o)) {
      if (!k.startsWith('_') && !['uk', 'ru', 'en'].includes(k)) scan(val, docId, docType, path ? `${path}.${k}` : k)
    }
  }
}

function getAtPath(root: unknown, path: string): unknown {
  let cur: unknown = root
  const parts = path.match(/[^.[\]]+|\[[^\]]*\]/g) ?? []
  for (const p of parts) {
    if (cur == null) return undefined
    if (p.startsWith('[')) {
      const inner = p.slice(1, -1)
      const m = inner.match(/^_key=="(.+)"$/)
      if (!Array.isArray(cur)) return undefined
      cur = m ? cur.find((x) => (x as Dict)?._key === m[1]) : cur[Number(inner)]
    } else cur = (cur as Dict)[p]
  }
  return cur
}

function setAtPtr(root: unknown, ptr: string, value: string): boolean {
  const parts = ptr.split('/').filter(Boolean)
  let cur: unknown = root
  for (let i = 0; i < parts.length - 1; i++) {
    cur = Array.isArray(cur) ? cur[Number(parts[i])] : (cur as Dict)?.[parts[i]]
    if (cur == null) return false
  }
  const last = parts[parts.length - 1]
  if (Array.isArray(cur)) cur[Number(last)] = value
  else return false
  return true
}

async function main() {
  if (!APPLY) {
    const docs = await client.fetch<Dict[]>(`*[!(_id in path("drafts.**")) && _type in ["blogPost","industryPage","caseStudy"]]`)
    for (const d of docs) scan(d, String(d._id), String(d._type), '')
    console.log(JSON.stringify(found, null, 1))
    console.error(`TOTAL bare leaves: ${found.length}`)
    return
  }
  if (!MAP) throw new Error('--apply requires --map=<file>')
  const map = JSON.parse(readFileSync(MAP, 'utf8')) as Array<{docId: string; path: string; ptr: string; ru: string}>
  const byDoc = new Map<string, typeof map>()
  for (const m of map) {
    if (!byDoc.has(m.docId)) byDoc.set(m.docId, [])
    byDoc.get(m.docId)!.push(m)
  }
  const tx = client.transaction()
  let n = 0
  for (const [docId, list] of byDoc) {
    const doc = await client.fetch<Dict | null>(`*[_id == $id][0]`, {id: docId})
    if (!doc) throw new Error(`doc not found: ${docId}`)
    const byPath = new Map<string, typeof list>()
    for (const m of list) {
      if (!byPath.has(m.path)) byPath.set(m.path, [])
      byPath.get(m.path)!.push(m)
    }
    const set: Dict = {}
    for (const [path, items] of byPath) {
      const holder = getAtPath(doc, path) as Dict | undefined
      const ru = holder?.ru
      if (!Array.isArray(ru)) throw new Error(`ru array missing at ${docId} ${path}`)
      const copy = JSON.parse(JSON.stringify(ru))
      for (const m of items) {
        if (!setAtPtr(copy, m.ptr, m.ru)) throw new Error(`bad ptr ${m.ptr} at ${docId} ${path}`)
        n++
      }
      set[`${path}.ru`] = copy
    }
    console.log(`${docId}: ${list.length} leaf(ves)`)
    tx.patch(docId, (p) => p.set(set))
  }
  await tx.commit()
  console.log(`Fixed ${n} bare-string leaves.`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
