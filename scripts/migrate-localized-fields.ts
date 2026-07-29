/**
 * One-shot migration: En-suffix shadow fields → localized objects.
 *
 *   Dry run:  npx sanity exec scripts/migrate-localized-fields.ts --with-user-token -- --dry-run
 *   Real run: npx sanity exec scripts/migrate-localized-fields.ts --with-user-token
 *
 * ⚠️ Run ONLY after the coalesce-tolerant frontend (Frontend commit
 * "transition-tolerant localized projections") is live in production —
 * the old frontend reads titleEn/bodyEn/... directly and would lose EN
 * content the moment this unsets them.
 *
 * Take a backup first:
 *   npx sanity dataset export production backups/pre-locale-migration.tar.gz
 *
 * Idempotent: already-migrated values (objects, not strings/arrays) are
 * skipped. Handles drafts too (raw-perspective fetch returns drafts.* ids).
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const DRY = process.argv.includes('--dry-run')

type Dict = Record<string, unknown>

const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const isArr = (v: unknown): v is unknown[] => Array.isArray(v) && v.length > 0
const isMigrated = (v: unknown): boolean =>
  !!v && typeof v === 'object' && !Array.isArray(v) && ('uk' in (v as Dict) || 'en' in (v as Dict))

/** Build {uk, en} from a legacy pair; undefined when both sides are empty. */
function locPair(uk: unknown, en: unknown, arr: boolean): Dict | undefined {
  if (isMigrated(uk)) return uk as Dict // already new shape — no-op
  const ok = arr ? isArr : isStr
  const o: Dict = {}
  if (ok(uk)) o.uk = uk
  if (ok(en)) o.en = en
  return Object.keys(o).length ? o : undefined
}

const BLOG_UNSET = [
  'titleEn',
  'slugEn',
  'eyebrowEn',
  'ledeEn',
  'bodyEn',
  'faqEn',
  'faqHeadingEn',
  'metaTitleEn',
  'metaDescriptionEn',
]

function migrateBlogPost(d: Dict): {set: Dict; unset: string[]} {
  const set: Dict = {}
  const put = (k: string, v: Dict | undefined) => {
    if (v !== undefined && !isMigrated(d[k])) set[k] = v
  }
  put('title', locPair(d.title, d.titleEn, false))
  put('eyebrow', locPair(d.eyebrow, d.eyebrowEn, false))
  put('lede', locPair(d.lede, d.ledeEn, false))
  put('body', locPair(d.body, d.bodyEn, true))
  put('faqHeading', locPair(d.faqHeading, d.faqHeadingEn, false))
  put('metaTitle', locPair(d.metaTitle, d.metaTitleEn, false))
  put('metaDescription', locPair(d.metaDescription, d.metaDescriptionEn, false))

  // slugs: build the localizedSlug object; the legacy `slug` field is left
  // in place (harmless orphan) until the post-migration cleanup pass.
  if (!isMigrated(d.slugs)) {
    const slugs: Dict = {}
    const uk = (d.slug as Dict | undefined)?.current
    const en = (d.slugEn as Dict | undefined)?.current
    if (isStr(uk)) slugs.uk = {_type: 'slug', current: uk}
    if (isStr(en)) slugs.en = {_type: 'slug', current: en}
    if (Object.keys(slugs).length) set.slugs = slugs
  }

  // FAQ: pair faq[i] (UA) with faqEn[i] (EN) by index; extra items keep a
  // single locale. Skip when items are already localized objects.
  const faq = (d.faq as Dict[] | undefined) ?? []
  const faqEn = (d.faqEn as Dict[] | undefined) ?? []
  const alreadyLocalized = faq.length > 0 && isMigrated(faq[0]?.question)
  if ((faq.length || faqEn.length) && !alreadyLocalized) {
    const n = Math.max(faq.length, faqEn.length)
    const items: Dict[] = []
    for (let i = 0; i < n; i++) {
      const ua = faq[i]
      const en = faqEn[i]
      items.push({
        _type: 'blogFaqItem',
        _key: (ua?._key as string) ?? (en?._key as string) ?? `faq${i}`,
        question: locPair(ua?.question, en?.question, false) ?? {},
        answer: locPair(ua?.answer, en?.answer, false) ?? {},
      })
    }
    set.faq = items
  }

  return {set, unset: BLOG_UNSET.filter((k) => d[k] !== undefined)}
}

/** Nested blocks inside industryPage / caseStudy section arrays. */
function pairInto(o: Dict, base: string, enKey: string): Dict {
  const {[enKey]: en, ...rest} = o
  const merged = locPair(o[base], en, true)
  if (merged === undefined) {
    delete rest[base]
    return rest
  }
  return {...rest, [base]: merged}
}

const BLOCK_TRANSFORMS: Record<string, (b: Dict) => Dict> = {
  richTextBlock: (b) => pairInto(b, 'content', 'contentEn'),
  imageTextBlock: (b) => pairInto(b, 'body', 'bodyEn'),
  reasonsBlock: (b) => ({
    ...b,
    reasons: ((b.reasons as Dict[]) ?? []).map((r) => pairInto(r, 'text', 'textEn')),
  }),
  faqBlock: (b) => ({
    ...b,
    items: ((b.items as Dict[]) ?? []).map((i) => pairInto(i, 'answer', 'answerEn')),
  }),
}

/** Recursively transform any nested object whose _type has a transform. */
function walk(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(walk)
  if (v && typeof v === 'object') {
    const o = v as Dict
    const t = o._type as string | undefined
    const transformed = t && BLOCK_TRANSFORMS[t] ? BLOCK_TRANSFORMS[t](o) : o
    return Object.fromEntries(Object.entries(transformed).map(([k, val]) => [k, walk(val)]))
  }
  return v
}

async function main() {
  const posts = await client.fetch<Dict[]>(`*[_type == "blogPost"]`)
  const pages = await client.fetch<Dict[]>(`*[_type in ["industryPage", "caseStudy"]]`)
  const tx = client.transaction()
  let patched = 0

  for (const d of posts) {
    const {set, unset} = migrateBlogPost(d)
    if (Object.keys(set).length || unset.length) {
      console.log(
        `blogPost ${d._id}: set [${Object.keys(set).join(', ') || '-'}]; unset [${unset.join(', ') || '-'}]`,
      )
      tx.patch(d._id as string, (p) => p.set(set).unset(unset))
      patched++
    }
  }

  for (const d of pages) {
    const next = walk(d) as Dict
    const changed = Object.keys(d).filter(
      (k) => !k.startsWith('_') && JSON.stringify(d[k]) !== JSON.stringify(next[k]),
    )
    if (changed.length) {
      console.log(`${d._type} ${d._id}: rewriting [${changed.join(', ')}]`)
      tx.patch(d._id as string, (p) =>
        p.set(Object.fromEntries(changed.map((k) => [k, next[k]]))),
      )
      patched++
    }
  }

  if (!patched) {
    console.log('Nothing to migrate.')
    return
  }
  if (DRY) {
    console.log(`DRY RUN: would patch ${patched} document(s). No changes written.`)
    return
  }
  await tx.commit()
  console.log(`Patched ${patched} document(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
