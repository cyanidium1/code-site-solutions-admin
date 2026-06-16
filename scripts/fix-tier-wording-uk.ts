/**
 * Replace the awkward UK transliteration "тир" (a phonetic spelling of
 * English "tier" that actually means "shooting range") with the natural
 * "пакет" across all CMS string fields, declension-aware.
 *
 * Scans every document, deep-walks string leaves (skipping system/slug/url
 * fields), and rewrites standalone "тир" word-forms. False positives like
 * "квартир", "Чотири", "тираж", "тире" are excluded by Cyrillic word
 * boundaries.
 *
 * Dry-run (prints every before → after, writes nothing):
 *   npx sanity exec scripts/fix-tier-wording-uk.ts --with-user-token
 *
 * Apply:
 *   npx sanity exec scripts/fix-tier-wording-uk.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

/** Keys whose string values must never be transformed. */
const SKIP_KEYS = new Set([
  '_id',
  '_type',
  '_ref',
  '_key',
  '_rev',
  'current', // slug.current
  'url',
  'href',
  'slug',
  'language',
  'lang',
])

/** Declension map: matched core (lowercased) → replacement core. */
const FORMS: Record<string, string> = {
  тирами: 'пакетами',
  тирів: 'пакетів',
  тиром: 'пакетом',
  тири: 'пакети',
  тиру: 'пакета', // genitive ("ціну сусіднього тиру" → "пакета")
  тирі: 'пакеті', // locative ("у Pro Plus тирі" → "пакеті")
  тира: 'пакета',
  тир: 'пакет',
}

const CYR = "А-Яа-яІіЇїЄєҐґ’'ʼ"
// Longest endings first so "тирами"/"тирів" win over "тир".
const RE = new RegExp(
  `(^|[^${CYR}])(Тир|тир)(ами|ів|ом|и|і|у|а)?(?![${CYR}])`,
  'g',
)

function matchCase(replacement: string, sample: string): string {
  if (sample[0] === sample[0]?.toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function transformString(input: string): string {
  return input.replace(RE, (_full, pre: string, head: string, tail = '') => {
    const core = (head + tail).toLowerCase()
    const replacement = FORMS[core]
    if (!replacement) return _full // unknown form — leave untouched
    return pre + matchCase(replacement, head)
  })
}

let changeCount = 0

function walk(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    if (key && SKIP_KEYS.has(key)) return value
    const next = transformString(value)
    if (next !== value) {
      changeCount++
      console.log(`    • [${key ?? '?'}]`)
      console.log(`      - ${value}`)
      console.log(`      + ${next}`)
    }
    return next
  }
  if (Array.isArray(value)) return value.map((v) => walk(v))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = walk(v, k)
    }
    return out
  }
  return value
}

async function main() {
  console.log(APPLY ? '→ APPLY mode' : '→ DRY-RUN (pass -- --apply to commit)\n')

  const docs = await client.fetch<Array<Record<string, unknown>>>(
    `*[!(_id in path("drafts.**"))]`,
  )
  console.log(`Scanning ${docs.length} published document(s)\n`)

  let patched = 0
  for (const doc of docs) {
    changeCount = 0
    const before = changeCount
    const rewritten = walk(doc) as Record<string, unknown>
    if (changeCount === before) continue

    console.log(`  ${doc._id} (${doc._type})`)
    patched++

    if (APPLY) {
      await client.createOrReplace(rewritten)
      console.log(`    ✓ patched`)
    }
  }

  console.log(
    `\n→ ${patched} document(s) ${APPLY ? 'patched' : 'would change'}.`,
  )
  if (!APPLY && patched > 0) console.log('Re-run with -- --apply to commit.')
}

main().catch((err) => {
  console.error('✗ Failed:', err)
  process.exit(1)
})
