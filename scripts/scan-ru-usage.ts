/**
 * Counts nested objects carrying a non-empty `ru` string alongside uk/en —
 * i.e. real Russian content in localizedString/localizedText fields.
 * Read-only. Run:
 *   npx sanity exec scripts/scan-ru-usage.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

function scan(v: unknown, path: string, hits: string[]): void {
  if (Array.isArray(v)) {
    v.forEach((x, i) => scan(x, `${path}[${i}]`, hits))
    return
  }
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    if (typeof o.ru === 'string' && o.ru.trim() && ('uk' in o || 'en' in o)) {
      hits.push(`${path} → "${String(o.ru).slice(0, 60)}"`)
    }
    for (const [k, val] of Object.entries(o)) {
      if (!k.startsWith('_')) scan(val, `${path}.${k}`, hits)
    }
  }
}

async function main() {
  const docs = await client.fetch<Record<string, unknown>[]>(`*[]`)
  const hits: string[] = []
  for (const d of docs) scan(d, String(d._id), hits)
  if (hits.length) console.log(hits.join('\n'))
  console.log(`Total: ${hits.length} ru value(s) across ${docs.length} document(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
