/**
 * EN Telegram → WhatsApp in EN-SHADOW PORTABLE-TEXT fields (and any nested
 * strings under them): bodyEn, answerEn, textEn, etc. The string-leaf sweep
 * (fix-en-telegram-to-whatsapp.ts) only handled `en`/`*En` string leaves; this
 * one walks the whole subtree under any `*En` key (portable blocks, CTA labels,
 * span text) and replaces "Telegram" with "WhatsApp". UA fields untouched.
 *
 * Dry-run:  npx sanity exec scripts/fix-en-telegram-portable.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-en-telegram-portable.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const isEnKey = (k: string) => k === 'en' || /[a-z]En$/.test(k)
// Never touch structural/URL strings.
const SKIP_STR_KEYS = new Set(['_key', '_type', '_ref', 'style', 'href', 'language', 'lang', 'listItem'])

/** Replace Telegram→WhatsApp in every string under `node`, in place. */
function replaceDeep(node: any, key: string | null): number {
  let n = 0
  if (typeof node === 'string') return 0 // handled by caller (needs parent key + ref)
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      if (typeof node[i] === 'string') {
        if (node[i].includes('Telegram')) {
          node[i] = node[i].replace(/Telegram/g, 'WhatsApp')
          n++
        }
      } else n += replaceDeep(node[i], null)
    }
    return n
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      const v = node[k]
      if (typeof v === 'string') {
        if (!SKIP_STR_KEYS.has(k) && v.includes('Telegram')) {
          node[k] = v.replace(/Telegram/g, 'WhatsApp')
          n++
        }
      } else n += replaceDeep(v, k)
    }
  }
  return n
}

/** Walk doc; whenever an EN key is hit, replace Telegram in its whole subtree. */
function transform(node: any): number {
  let n = 0
  if (Array.isArray(node)) {
    for (const item of node) n += transform(item)
    return n
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      const v = node[k]
      if (isEnKey(k)) {
        if (typeof v === 'string') {
          if (v.includes('Telegram')) {
            node[k] = v.replace(/Telegram/g, 'WhatsApp')
            n++
          }
        } else {
          n += replaceDeep(v, k)
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
    if (!changed || JSON.stringify(doc) === before) continue
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
      `${doc._type}${doc.slug?.current ? '/' + doc.slug.current : ''} (${doc._id})  fields: ${Object.keys(sets).join(', ')}  (${changed})`,
    )
    if (APPLY) {
      await client.patch(doc._id).set(sets).commit()
      console.log('    ✓ applied')
    }
  }
  console.log(`\n${APPLY ? 'Applied' : 'Would patch'} ${leafCount} EN string(s) across ${docCount} doc(s).`)
  if (!APPLY) console.log('Re-run with -- --apply to write.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
