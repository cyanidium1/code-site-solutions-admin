/**
 * Symbol-only currency swap: replace "$" with "£" in EN-facing strings.
 *
 * Finishes the GBP migration started in the frontend commit
 * "feat(i18n): show GBP (£) prices on EN routes". Yesterday the structured EN
 * price fields were swapped; this covers the leftover USD that still appears in
 * EN prose / informational text (blog bodyEn/faqEn, industryPage *En + .en
 * slots, calculator compareAnchor.en, etc.).
 *
 * NUMBERS ARE NOT CONVERTED — this is a symbol swap only, matching yesterday's
 * approach. Ukrainian (.uk / body / faq / Cyrillic) content keeps "$".
 *
 * Locale-NEUTRAL fields (no per-locale variant — render on BOTH UA and EN) are
 * NOT touched and are listed separately for a manual decision:
 *   - caseStudy.budget            (e.g. "$5,000")
 *   - caseBlock results[].value   (e.g. "$7.50", "$25k+")
 *   - calculatorSeoGrowthOptions.priceLabel
 *
 * Dry-run:  npx sanity exec scripts/swap-en-dollar-to-pound.ts --with-user-token
 * Apply:    npx sanity exec scripts/swap-en-dollar-to-pound.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const CYRILLIC = /[Ѐ-ӿ]/

// EN-facing slot: a path segment ending in "En" (bodyEn, faqEn, titleEn, altEn,
// textEn, answerEn) or a ".en" leaf (foot.en, lede.en, label.en, items[].en,
// compareAnchor.en …).
function isEnPath(path: string): boolean {
  return /(En)(\[|\.|$)/.test(path) || /\.en(\[|\.|$)/.test(path)
}

// Locale-neutral display fields — shared across UA + EN, so out of scope for an
// "EN only" swap. Flagged, never auto-changed.
function isNeutralField(path: string): boolean {
  if (/(^|\.)budget$/.test(path)) return true
  if (/results\[\d+\]\.value$/.test(path)) return true
  if (/(^|\.)priceLabel$/.test(path)) return true
  return false
}

type Hit = {id: string; type: string; path: string; val: string}

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY-RUN (no writes)'}`)
  console.log('='.repeat(78))

  const docs: any[] = await client.fetch('*[!(_id in path("_.**"))]')

  const changesByDoc = new Map<string, {type: string; sets: Record<string, string>; hits: Hit[]}>()
  const neutral: Hit[] = []
  const skippedUk: Hit[] = []

  function walk(node: any, path: string, doc: any) {
    if (typeof node === 'string') {
      if (!node.includes('$')) return
      const hit: Hit = {id: doc._id, type: doc._type, path, val: node}
      if (CYRILLIC.test(node) || /\.uk(\[|\.|$)/.test(path)) {
        skippedUk.push(hit)
        return
      }
      if (isNeutralField(path)) {
        neutral.push(hit)
        return
      }
      if (!isEnPath(path)) {
        // Unknown / not clearly EN — leave it, surface as neutral for review.
        neutral.push(hit)
        return
      }
      const next = node.replace(/\$/g, '£')
      let entry = changesByDoc.get(doc._id)
      if (!entry) {
        entry = {type: doc._type, sets: {}, hits: []}
        changesByDoc.set(doc._id, entry)
      }
      entry.sets[path] = next
      entry.hits.push(hit)
      return
    }
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`, doc))
    } else if (node && typeof node === 'object') {
      for (const k of Object.keys(node)) {
        if (k.startsWith('_')) continue
        walk(node[k], path ? `${path}.${k}` : k, doc)
      }
    }
  }

  for (const d of docs) walk(d, '', d)

  // ── Report planned EN swaps ────────────────────────────────────────────────
  let totalSwaps = 0
  for (const [id, entry] of changesByDoc) {
    console.log(`\n[${entry.type}] ${id}  — ${entry.hits.length} change(s)`)
    for (const h of entry.hits) {
      totalSwaps++
      const before = h.val.length > 100 ? h.val.slice(0, 100) + '…' : h.val
      console.log(`  .${h.path}`)
      console.log(`     $→£: ${before}`)
    }
    if (APPLY) {
      await client.patch(id).set(entry.sets).commit()
    }
  }

  // ── Report neutral / unclassified (NOT changed) ────────────────────────────
  console.log('\n' + '='.repeat(78))
  console.log(`LOCALE-NEUTRAL / UNCLASSIFIED — left untouched (review manually): ${neutral.length}`)
  for (const h of neutral) {
    console.log(`  [${h.type}] ${h.id} .${h.path} = ${h.val}`)
  }

  console.log('\n' + '='.repeat(78))
  console.log(
    `EN docs changed: ${changesByDoc.size} | EN strings swapped: ${totalSwaps} | ` +
      `neutral skipped: ${neutral.length} | UA skipped: ${skippedUk.length}`,
  )
  if (!APPLY) console.log('(Re-run with -- --apply to write changes.)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
