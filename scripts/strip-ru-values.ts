/**
 * Strips junk `ru` values from localized objects (any object carrying a
 * `ru` key alongside uk/en). The 2026-07 scan showed the ru slots hold
 * copy-pasted Ukrainian text, not Russian translations — they'll be
 * re-authored properly if/when a ru locale ships.
 *
 *   Dry run:  npx sanity exec scripts/strip-ru-values.ts --with-user-token -- --dry-run
 *   Real run: npx sanity exec scripts/strip-ru-values.ts --with-user-token
 *
 * Schema `ru` fields are intentionally kept; only document data changes.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const DRY = process.argv.includes('--dry-run')

type Dict = Record<string, unknown>

let removed = 0

/** Deep-copy with `ru` keys dropped from localized-looking objects. */
function strip(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(strip)
  if (v && typeof v === 'object') {
    const o = v as Dict
    const out: Dict = {}
    for (const [k, val] of Object.entries(o)) {
      if (k === 'ru' && ('uk' in o || 'en' in o)) {
        removed++
        continue
      }
      out[k] = strip(val)
    }
    return out
  }
  return v
}

async function main() {
  const docs = await client.fetch<Dict[]>(`*[]`)
  const tx = client.transaction()
  let patched = 0

  for (const d of docs) {
    const before = removed
    const next = strip(d) as Dict
    if (removed === before) continue
    const changed = Object.keys(d).filter(
      (k) => !k.startsWith('_') && JSON.stringify(d[k]) !== JSON.stringify(next[k]),
    )
    if (!changed.length) continue
    console.log(`${d._type} ${d._id}: stripping ru in [${changed.join(', ')}]`)
    tx.patch(d._id as string, (p) =>
      p.set(Object.fromEntries(changed.map((k) => [k, next[k]]))),
    )
    patched++
  }

  console.log(`${removed} ru key(s) across ${patched} document(s) of ${docs.length}.`)
  if (!patched) return
  if (DRY) {
    console.log('DRY RUN: no changes written.')
    return
  }
  await tx.commit()
  console.log('Committed.')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
