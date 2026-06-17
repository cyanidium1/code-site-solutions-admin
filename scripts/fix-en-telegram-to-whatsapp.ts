/**
 * EN-only Telegram → WhatsApp wording sweep across the whole dataset.
 * Walks every published document and replaces "Telegram" with "WhatsApp" in
 * English-locale string leaves only — keys named `en` (localized objects) or
 * `*En` shadow fields. Ukrainian (`uk`) / Russian (`ru`) values are untouched.
 *
 * Per product decision: case-study text is included; the Telegram contact
 * OPTIONS (contacts-page channel, calculator method dropdown) live in the
 * frontend code, not here, so they are unaffected by this script.
 *
 * Dry-run:  npx sanity exec scripts/fix-en-telegram-to-whatsapp.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-en-telegram-to-whatsapp.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const isEnKey = (k: string) => k === 'en' || /[a-z]En$/.test(k)

/** Recursively replace Telegram→WhatsApp in EN string leaves. Returns count. */
function transform(node: any): number {
  let n = 0
  if (Array.isArray(node)) {
    for (const item of node) n += transform(item)
    return n
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      const v = node[k]
      if (typeof v === 'string') {
        if (isEnKey(k) && v.includes('Telegram')) {
          node[k] = v.replace(/Telegram/g, 'WhatsApp')
          n++
        }
      } else {
        n += transform(v)
      }
    }
  }
  return n
}

const SKIP = new Set(['_id', '_type', '_rev', '_createdAt', '_updatedAt'])

async function main() {
  const docs: any[] = await client.fetch('*[!(_id in path("drafts.**"))]')
  let docCount = 0
  let leafCount = 0

  for (const doc of docs) {
    const before = JSON.stringify(doc)
    const changed = transform(doc)
    if (!changed) continue
    if (JSON.stringify(doc) === before) continue

    // Build a set of just the top-level content keys that changed.
    const orig = JSON.parse(before)
    const sets: Record<string, any> = {}
    for (const k of Object.keys(doc)) {
      if (SKIP.has(k)) continue
      if (JSON.stringify(doc[k]) !== JSON.stringify(orig[k])) sets[k] = doc[k]
    }
    if (!Object.keys(sets).length) continue

    docCount++
    leafCount += changed
    console.log(
      `${doc._type}${doc.slug?.current ? '/' + doc.slug.current : ''} (${doc._id})  fields: ${Object.keys(sets).join(', ')}  (${changed} leaf${changed > 1 ? 'es' : ''})`,
    )

    if (APPLY) {
      await client.patch(doc._id).set(sets).commit()
      console.log(`    ✓ applied`)
    }
  }

  console.log(
    `\n${APPLY ? 'Applied' : 'Would patch'} ${leafCount} EN leaf(es) across ${docCount} doc(s).`,
  )
  if (!APPLY) console.log('Re-run with -- --apply to write.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
