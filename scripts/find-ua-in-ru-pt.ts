/**
 * Scans every localized object's `ru` ARRAY member for string leaves that
 * still contain Ukrainian-specific letters (і, ї, є, ґ) — leftovers from the
 * collectLeaves bug that skipped bare strings inside arrays.
 * Prints {docId, path, ptr, text} JSON lines.
 * Run: npx sanity exec scripts/find-ua-in-ru-pt.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
type Dict = Record<string, unknown>

const UA = /[іїєґІЇЄҐ]/
const SKIP_KEYS = new Set([
  'style', 'listItem', 'href', 'url', 'youtubeId', 'ctaHref',
  'ctaSecondaryHref', 'ctaMode', 'leadSource', 'src', 'marks', '_type', '_key',
])

const hits: Array<{docId: string; docType: string; path: string; ptr: string; text: string}> = []

function walk(v: unknown, ptr: string, push: (p: string, s: string) => void): void {
  if (Array.isArray(v)) {
    v.forEach((x, i) => {
      if (typeof x === 'string') {
        if (UA.test(x)) push(`${ptr}/${i}`, x)
      } else walk(x, `${ptr}/${i}`, push)
    })
    return
  }
  if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v as Dict)) {
      if (k.startsWith('_') || SKIP_KEYS.has(k)) continue
      if (typeof val === 'string') {
        if (UA.test(val)) push(`${ptr}/${k}`, val)
      } else walk(val, `${ptr}/${k}`, push)
    }
  }
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
    if (Array.isArray(o.ru) && o.ru.length) {
      walk(o.ru, '', (ptr, text) => hits.push({docId, docType, path, ptr, text}))
    }
    for (const [k, val] of Object.entries(o)) {
      if (!k.startsWith('_') && k !== 'uk' && k !== 'en') scan(val, docId, docType, path ? `${path}.${k}` : k)
    }
  }
}

async function main() {
  const docs = await client.fetch<Dict[]>(`*[!(_id in path("drafts.**")) && _type in ["blogPost","industryPage","caseStudy"]]`)
  for (const d of docs) scan(d, String(d._id), String(d._type), '')
  console.log(JSON.stringify(hits, null, 1))
  console.error(`TOTAL: ${hits.length}`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
