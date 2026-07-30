/**
 * Translation-volume scan for adding a locale. Counts, per document type:
 *  - localized scalar objects (uk non-empty string) missing the target locale
 *  - localized Portable Text arrays (uk) missing the target locale, with
 *    extracted plain-text character volume
 * Read-only. Run:
 *   npx sanity exec scripts/scan-translation-volume.ts --with-user-token -- --target=ru
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const TARGET = (process.argv.find((a) => a.startsWith('--target='))?.split('=')[1] ?? 'ru') as string

type Dict = Record<string, unknown>
type Stat = {scalars: number; scalarChars: number; ptArrays: number; ptChars: number}

const byType: Record<string, Stat> = {}

function stat(type: string): Stat {
  return (byType[type] ??= {scalars: 0, scalarChars: 0, ptArrays: 0, ptChars: 0})
}

function ptText(blocks: unknown[]): string {
  let out = ''
  for (const b of blocks) {
    const ch = (b as Dict)?.children
    if (Array.isArray(ch)) for (const s of ch) out += String((s as Dict)?.text ?? '')
  }
  return out
}

function scan(v: unknown, type: string): void {
  if (Array.isArray(v)) {
    v.forEach((x) => scan(x, type))
    return
  }
  if (v && typeof v === 'object') {
    const o = v as Dict
    const uk = o.uk
    if (typeof uk === 'string' && uk.trim() && !(typeof o[TARGET] === 'string' && (o[TARGET] as string).trim())) {
      const s = stat(type)
      s.scalars++
      s.scalarChars += uk.trim().length
    }
    if (Array.isArray(uk) && uk.length && !(Array.isArray(o[TARGET]) && (o[TARGET] as unknown[]).length)) {
      const s = stat(type)
      s.ptArrays++
      s.ptChars += ptText(uk).length
    }
    for (const [k, val] of Object.entries(o)) if (!k.startsWith('_')) scan(val, type)
  }
}

async function main() {
  const docs = await client.fetch<Dict[]>(`*[!(_id in path("drafts.**"))]`)
  for (const d of docs) scan(d, String(d._type))
  let ts = 0
  let tc = 0
  let tp = 0
  let tpc = 0
  console.log(`Missing "${TARGET}" where uk exists (published docs only):`)
  for (const [type, s] of Object.entries(byType).sort((a, b) => b[1].scalarChars + b[1].ptChars - (a[1].scalarChars + a[1].ptChars))) {
    console.log(
      `  ${type}: ${s.scalars} scalar fields (${s.scalarChars} chars), ${s.ptArrays} rich-text bodies (${s.ptChars} chars)`,
    )
    ts += s.scalars
    tc += s.scalarChars
    tp += s.ptArrays
    tpc += s.ptChars
  }
  console.log(`TOTAL: ${ts} scalar fields (${tc} chars) + ${tp} rich-text bodies (${tpc} chars) across ${docs.length} docs`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
