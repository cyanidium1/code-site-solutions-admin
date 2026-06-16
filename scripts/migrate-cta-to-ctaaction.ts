/**
 * Phase 4 / Slice 2 — migrate label-only CTAs to the shared `ctaAction` shape.
 *
 * For every industryPage section:
 *   caseBlock:       ctaLabel        -> cta.label
 *   reasonsBlock:    footCtaLabel    -> footCta.label
 *   comparisonBlock: tableCtaPrimary -> primaryCta.label
 *                    tableCtaGhost   -> ghostCta.label
 *
 * Only the LABEL is moved; hrefs stay computed in the frontend (the new
 * ctaAction.href is an optional editor override). Old fields are LEFT IN PLACE
 * for backward-compatible reads — a separate cleanup pass can unset them once
 * the new shape is verified in production. Idempotent: skips a CTA whose target
 * object already exists.
 *
 * Dry-run:  npx sanity exec scripts/migrate-cta-to-ctaaction.ts --with-user-token
 * Apply:    npx sanity exec scripts/migrate-cta-to-ctaaction.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Localized = Record<string, string> | undefined
type Section = {
  _key: string
  _type: string
  ctaLabel?: Localized
  footCtaLabel?: Localized
  tableCtaPrimary?: Localized
  tableCtaGhost?: Localized
  cta?: unknown
  footCta?: unknown
  primaryCta?: unknown
  ghostCta?: unknown
}
type Doc = {_id: string; slug?: string; sections?: Section[]}

/** label-source field -> target ctaAction field, per block type */
const RULES: Record<string, Array<{from: keyof Section; to: keyof Section}>> = {
  caseBlock: [{from: 'ctaLabel', to: 'cta'}],
  reasonsBlock: [{from: 'footCtaLabel', to: 'footCta'}],
  comparisonBlock: [
    {from: 'tableCtaPrimary', to: 'primaryCta'},
    {from: 'tableCtaGhost', to: 'ghostCta'},
  ],
}

function hasText(v: Localized): boolean {
  return Boolean(v && Object.values(v).some((s) => typeof s === 'string' && s.trim() !== ''))
}

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY-RUN (no writes)'}`)
  console.log('-'.repeat(72))

  const docs = await client.fetch<Doc[]>(
    `*[_type == "industryPage"]{
      _id,
      "slug": slug.current,
      sections[]{
        _key, _type,
        ctaLabel, footCtaLabel, tableCtaPrimary, tableCtaGhost,
        cta, footCta, primaryCta, ghostCta
      }
    }`,
  )

  let planned = 0
  let docsTouched = 0

  for (const doc of docs) {
    const patchSet: Record<string, unknown> = {}
    for (const section of doc.sections ?? []) {
      const rules = RULES[section._type]
      if (!rules) continue
      for (const {from, to} of rules) {
        const label = section[from] as Localized
        const alreadyMigrated = section[to] != null
        if (!hasText(label) || alreadyMigrated) continue
        patchSet[`sections[_key=="${section._key}"].${to}`] = {label, type: 'custom'}
        planned++
        console.log(`  ${doc.slug ?? doc._id}  ${section._type}.${String(from)} -> ${String(to)}`)
      }
    }
    if (Object.keys(patchSet).length === 0) continue
    docsTouched++
    if (APPLY) {
      await client.patch(doc._id).set(patchSet).commit()
    }
  }

  console.log('-'.repeat(72))
  console.log(`Done. CTAs migrated=${planned} across ${docsTouched} doc(s).`)
  if (!APPLY) console.log('(Re-run with -- --apply to write changes.)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
