/**
 * RU coverage audit. Walks EVERY published document and reports:
 *  1. missing  — localized objects where uk is non-empty but ru is absent/empty
 *  2. uaLeft   — ru string values that still contain UA-specific letters (і ї є ґ)
 *  3. uaLeftPt — string leaves inside ru arrays with UA-specific letters
 * Run: npx sanity exec scripts/audit-ru-coverage.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
type Dict = Record<string, unknown>
const UA = /[іїєґІЇЄҐ]/
const SKIP_KEYS = new Set(['style', 'listItem', 'href', 'url', 'youtubeId', 'ctaHref',
  'ctaSecondaryHref', 'ctaMode', 'leadSource', 'src', 'marks'])

const missing: string[] = []
const uaLeft: string[] = []
const uaLeftPt: string[] = []

function walkRu(v: unknown, ptr: string, out: (p: string, s: string) => void): void {
  if (Array.isArray(v)) {
    v.forEach((x, i) => {
      if (typeof x === 'string') { if (UA.test(x)) out(`${ptr}/${i}`, x) }
      else walkRu(x, `${ptr}/${i}`, out)
    })
    return
  }
  if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v as Dict)) {
      if (k.startsWith('_') || SKIP_KEYS.has(k)) continue
      if (typeof val === 'string') { if (UA.test(val)) out(`${ptr}/${k}`, val) }
      else walkRu(val, `${ptr}/${k}`, out)
    }
  }
}

function scan(v: unknown, id: string, type: string, path: string): void {
  if (Array.isArray(v)) {
    v.forEach((x, i) => {
      const key = (x as Dict)?._key
      scan(x, id, type, `${path}[${key ? `_key=="${key}"` : i}]`)
    })
    return
  }
  if (v && typeof v === 'object') {
    const o = v as Dict
    const hasUkStr = typeof o.uk === 'string' && (o.uk as string).trim()
    const hasUkArr = Array.isArray(o.uk) && (o.uk as unknown[]).length
    if (hasUkStr || hasUkArr) {
      const ru = o.ru
      const ruOk = hasUkStr
        ? typeof ru === 'string' && ru.trim()
        : Array.isArray(ru) && ru.length
      // slug objects: uk is {current}, handled below as nested object
      if (!ruOk) missing.push(`${type} ${id} ${path} (uk ${hasUkStr ? 'string' : 'array'})`)
      else if (hasUkStr && UA.test(ru as string)) uaLeft.push(`${type} ${id} ${path}: ${(ru as string).slice(0, 60)}`)
      else if (hasUkArr) walkRu(ru, '', (p, s) => uaLeftPt.push(`${type} ${id} ${path}${p}: ${s.slice(0, 60)}`))
    }
    for (const [k, val] of Object.entries(o)) {
      if (!k.startsWith('_') && !['uk', 'ru', 'en'].includes(k)) scan(val, id, type, path ? `${path}.${k}` : k)
    }
  }
}

async function main() {
  const docs = await client.fetch<Dict[]>(`*[!(_id in path("drafts.**")) && !(_type match "system.*") && !(_type match "sanity.*")]`)
  const types = new Map<string, number>()
  for (const d of docs) {
    const t = String(d._type)
    types.set(t, (types.get(t) ?? 0) + 1)
    scan(d, String(d._id), t, '')
  }
  console.log('--- doc types scanned ---')
  for (const [t, n] of [...types].sort()) console.log(`  ${t}: ${n}`)
  console.log(`\n--- MISSING ru (${missing.length}) ---`)
  missing.forEach((m) => console.log('  ' + m))
  console.log(`\n--- UA letters in ru strings (${uaLeft.length}) ---`)
  uaLeft.forEach((m) => console.log('  ' + m))
  console.log(`\n--- UA letters in ru arrays (${uaLeftPt.length}) ---`)
  uaLeftPt.forEach((m) => console.log('  ' + m))
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
