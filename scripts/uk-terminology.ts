/**
 * UK terminology sweep for EN-facing Sanity content (Phase 2).
 *
 * Grammatically-safe US/CIS -> UK vocabulary only. Delicate cases that need
 * grammatical reshaping (LLC, sole proprietor, individual entrepreneur, tax ID)
 * and single-label patches (blogCategoryOption "Auto") are handled separately
 * in uk-terminology-patches.ts, NOT here.
 *
 * Scope = same as the spelling sweep: EN paths only (segment ending "En" or a
 * ".en" leaf), skip Cyrillic, skip calculator* and blogPost.
 *
 * Dry-run:  npx sanity exec scripts/uk-terminology.ts --with-user-token
 * Apply:    npx sanity exec scripts/uk-terminology.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const CYRILLIC = /[Ѐ-ӿ]/
const SKIP_TYPES = /^calculator/i
const SKIP_DOC_TYPES = new Set(['blogPost'])

function isEnPath(path: string): boolean {
  return /(En)(\[|\.|$)/.test(path) || /\.en(\[|\.|$)/.test(path)
}

function cased(match: string, replLower: string): string {
  if (match.length > 1 && match === match.toUpperCase()) return replLower.toUpperCase()
  if (match[0] === match[0].toUpperCase()) return replLower[0].toUpperCase() + replLower.slice(1)
  return replLower
}

// [regex, replacement, literal?]  — literal=true skips case transform.
const RULES: Array<[RegExp, string, boolean?]> = [
  // legal
  [/\bLegal & Attorneys\b/g, 'Legal & Solicitors', true],
  [/\battorney offices\b/gi, "solicitors' offices"],
  [/\battorneys\b/gi, 'solicitors'],
  [/\battorney\b/gi, 'solicitor'],
  [/\bsolo lawyers\b/gi, 'sole practitioners'],
  [/\bsolo lawyer\b/gi, 'sole practitioner'],
  [/\blawyers\b/gi, 'solicitors'],
  [/\blawyer\b/gi, 'solicitor'],
  [/\bLabou?r law\b/gi, 'employment law'],
  // property
  [/\breal estate agencies\b/gi, 'estate agencies'],
  [/\breal estate agency\b/gi, 'estate agency'],
  [/\breal estate agents\b/gi, 'estate agents'],
  [/\breal estate agent\b/gi, 'estate agent'],
  [/\bReal Estate\b/g, 'Property', true],
  [/\breal estate\b/gi, 'property'],
  [/\brealtors\b/gi, 'estate agents'],
  [/\brealtor\b/gi, 'estate agent'],
  // motor
  [/\bauto industry\b/gi, 'motor industry'],
  [/\bauto dealers\b/gi, 'car dealers'],
  [/\bauto dealer\b/gi, 'car dealer'],
  [/\bauto services\b/gi, 'motor services'],
  [/\bauto service\b/gi, 'motor service'],
  [/\bauto site\b/gi, 'motor-trade site'],
  [/\bauto business\b/gi, 'motor-trade business'],
  [/\bautomobiles\b/gi, 'cars'],
  [/\bautomobile\b/gi, 'car'],
  // retail
  [/\bonline stores\b/gi, 'online shops'],
  [/\bonline store\b/gi, 'online shop'],
  [/\byour store\b/gi, 'your shop'],
  [/\bstore owners\b/gi, 'shop owners'],
  [/\bstore owner\b/gi, 'shop owner'],
  [/\bstore founder\b/gi, 'shop founder'],
  [/\bshopping carts\b/gi, 'shopping baskets'],
  [/\bshopping cart\b/gi, 'shopping basket'],
  [/\badd to cart\b/gi, 'add to basket'],
  // standalone store/cart — verified no "App Store"/platform names in EN content
  [/\bstores\b/gi, 'shops'],
  [/\bstore\b/gi, 'shop'],
  [/\bcarts\b/gi, 'baskets'],
  [/\bcart\b/gi, 'basket'],
  // delivery
  [/\bfree shipping\b/gi, 'free delivery'],
  [/\bshipping costs\b/gi, 'delivery costs'],
  [/\bshipping cost\b/gi, 'delivery cost'],
  // logistics sense only — skip "shipping in <Country>" (dev sense: projects going live)
  [/\bshipping\b(?!\s+in\s+[A-Z])/gi, 'delivery'],
  // misc vocabulary
  [/\bvacation homes\b/gi, 'holiday homes'],
  [/\bvacation home\b/gi, 'holiday home'],
  [/\bvacations\b/gi, 'holidays'],
  [/\bvacation\b/gi, 'holiday'],
  [/\bremodels\b/gi, 'refurbishments'],
  [/\bremodel\b/gi, 'refurbishment'],
  [/\bphysicians\b/gi, 'doctors'],
  [/\bphysician\b/gi, 'doctor'],
  [/\baverage check\b/gi, 'average order value'],
  [/\bHOAs\b/g, 'management companies', true],
  [/\bHOA\b/g, 'management company', true],
  [/\bZIP codes\b/gi, 'postcodes'],
  [/\bZIP code\b/gi, 'postcode'],
  [/\bcell phones\b/gi, 'mobiles'],
  [/\bcell phone\b/gi, 'mobile'],
]

function transform(input: string): string {
  let s = input
  for (const [re, repl, literal] of RULES) {
    s = s.replace(re, (m) => (literal ? repl : cased(m, repl)))
  }
  return s
}

type Hit = {path: string; before: string; after: string}

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY-RUN (no writes)'}`)
  console.log('='.repeat(78))

  const docs: any[] = await client.fetch('*[!(_id in path("_.**"))]')
  const changesByDoc = new Map<string, {type: string; slug: string; sets: Record<string, string>; hits: Hit[]}>()

  function walk(node: any, path: string, doc: any) {
    if (typeof node === 'string') {
      if (CYRILLIC.test(node) || !isEnPath(path)) return
      const after = transform(node)
      if (after === node) return
      let entry = changesByDoc.get(doc._id)
      if (!entry) {
        entry = {type: doc._type, slug: doc.slug?.current || doc._id, sets: {}, hits: []}
        changesByDoc.set(doc._id, entry)
      }
      entry.sets[path] = after
      entry.hits.push({path, before: node, after})
      return
    }
    if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`, doc))
    else if (node && typeof node === 'object')
      for (const k of Object.keys(node)) {
        if (k.startsWith('_')) continue
        walk(node[k], path ? `${path}.${k}` : k, doc)
      }
  }

  for (const d of docs) {
    if (SKIP_TYPES.test(d._type) || SKIP_DOC_TYPES.has(d._type)) continue
    walk(d, '', d)
  }

  let total = 0
  for (const [id, entry] of changesByDoc) {
    console.log(`\n[${entry.type}/${entry.slug}] — ${entry.hits.length} change(s)`)
    for (const h of entry.hits) {
      total++
      const clip = (s: string) => (s.length > 130 ? s.slice(0, 130) + '…' : s)
      console.log(`  .${h.path}`)
      console.log(`     -  ${clip(h.before)}`)
      console.log(`     +  ${clip(h.after)}`)
    }
    if (APPLY) await client.patch(id).set(entry.sets).commit()
  }

  console.log('\n' + '='.repeat(78))
  console.log(`Docs changed: ${changesByDoc.size} | strings changed: ${total}`)
  if (!APPLY) console.log('(Re-run with -- --apply to write changes.)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
