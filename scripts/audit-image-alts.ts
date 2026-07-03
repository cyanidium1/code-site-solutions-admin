/**
 * Audit: find every image object in every document and report its alt state.
 *
 * Walks all non-system documents recursively; for each object that carries an
 * image asset reference, records the document, the path, and any alt-ish
 * sibling fields (alt / altEn / alt{uk,en} / caption / alternativeText).
 *
 * Run: npx sanity exec scripts/audit-image-alts.ts --with-user-token
 */

import {getCliClient} from 'sanity/cli'
import {writeFileSync} from 'node:fs'

const client = getCliClient({apiVersion: '2024-10-01'})

type Finding = {
  docId: string
  docType: string
  path: string
  altState: string
  alt?: unknown
}

function isImageRef(v: any): boolean {
  return (
    v &&
    typeof v === 'object' &&
    v.asset &&
    typeof v.asset._ref === 'string' &&
    v.asset._ref.startsWith('image-')
  )
}

function classifyAlt(obj: any): {state: string; alt?: unknown} {
  const altKeys = Object.keys(obj).filter((k) => /^alt/i.test(k) || k === 'alternativeText')
  if (altKeys.length === 0) {
    if (typeof obj.caption === 'string' && obj.caption.trim()) {
      return {state: 'no-alt-field (has caption)', alt: obj.caption}
    }
    return {state: 'no-alt-field'}
  }
  const alt: Record<string, unknown> = {}
  for (const k of altKeys) alt[k] = obj[k]
  // localized object form: {uk, en} or {_type: 'localeString', ...}
  const primary = obj[altKeys[0]]
  if (primary && typeof primary === 'object') {
    const uk = (primary.uk ?? '').toString().trim()
    const en = (primary.en ?? '').toString().trim()
    if (uk && en) return {state: 'localized-both', alt}
    if (uk || en) return {state: `localized-partial (${uk ? 'uk only' : 'en only'})`, alt}
    return {state: 'localized-empty', alt}
  }
  // plain string alt, possibly paired with altEn/altUk shadow fields
  const plain = typeof primary === 'string' ? primary.trim() : ''
  const shadowEn = typeof obj.altEn === 'string' ? obj.altEn.trim() : ''
  const shadowUk = typeof obj.altUk === 'string' ? obj.altUk.trim() : ''
  if (altKeys.length > 1 || shadowEn || shadowUk) {
    if (plain && (shadowEn || shadowUk)) return {state: 'shadow-localized-both', alt}
    return {state: 'shadow-localized-partial', alt}
  }
  if (plain) return {state: 'plain-string', alt}
  return {state: 'empty-string', alt}
}

function walk(node: any, path: string, out: Omit<Finding, 'docId' | 'docType'>[]) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      const key = item && item._key ? `[_key=${item._key}]` : `[${i}]`
      walk(item, `${path}${key}`, out)
    })
    return
  }
  if (isImageRef(node)) {
    const {state, alt} = classifyAlt(node)
    out.push({path: path || '(root)', altState: state, alt})
    // don't recurse into asset ref itself, but crop/hotspot are irrelevant
    return
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === '_type' || k === '_key' || k === '_ref') continue
    if (isImageRef(v)) {
      // check the image object itself, then fall back to alt-ish siblings on the parent
      let {state, alt} = classifyAlt(v)
      if (state === 'no-alt-field') {
        const sib = classifyAlt({...node, [k]: undefined, caption: undefined})
        if (sib.state !== 'no-alt-field') {
          state = `parent-sibling: ${sib.state}`
          alt = sib.alt
        }
      }
      out.push({path: path ? `${path}.${k}` : k, altState: state, alt})
      continue
    }
    walk(v, path ? `${path}.${k}` : k, out)
  }
}

function main() {
  return client
    .fetch<any[]>(`*[!(_id in path("_.**")) && !(_type match "system.*") && !(_type match "sanity.*")]`)
    .then((docs) => {
      const findings: Finding[] = []
      for (const doc of docs) {
        const local: Omit<Finding, 'docId' | 'docType'>[] = []
        walk(doc, '', local)
        for (const f of local) findings.push({docId: doc._id, docType: doc._type, ...f})
      }
      const byState: Record<string, number> = {}
      for (const f of findings) byState[f.altState] = (byState[f.altState] ?? 0) + 1
      const summary = {
        documentsScanned: docs.length,
        imagesFound: findings.length,
        byState,
      }
      console.log(JSON.stringify(summary, null, 2))
      writeFileSync('scripts/audit-image-alts.out.json', JSON.stringify({summary, findings}, null, 2))
      console.log('Full findings written to scripts/audit-image-alts.out.json')
    })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
