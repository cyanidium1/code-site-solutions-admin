/**
 * Backfill schema.org Review fields onto existing testimonials.
 *
 * For every testimonial-shaped record:
 *   - rating  ← 5 (these are all curated, featured testimonials)
 *   - reviewDate ← best available: existing field → parent case.date →
 *                  case.year-01-01 → doc/parent _createdAt
 *   - reviewHeadline is left untouched (editor populates if desired)
 *
 * Quote-block specific: every existing `quoteBlock` entry is set to
 * `isReview = true`. The frontend has always rendered quoteBlock through
 * the same testimonial component as testimonialBlock, so existing entries
 * are all reviews in practice. The schema `initialValue: true` covers new
 * blocks; this script covers the legacy ones.
 *
 * Idempotent: re-running it after `--apply` should report 0 updates.
 *
 * Targets:
 *   1. Standalone `testimonial` docs
 *   2. caseStudy.sections[] entries with _type=testimonialBlock
 *   3. caseStudy.sections[] entries with _type=quoteBlock (sets isReview=true too)
 *   4. industryPage.sections[] entries with _type=servicesBlock
 *      (patches the .testimonial sub-object when it has a quote)
 *
 * Dry-run:
 *   npx sanity exec scripts/backfill-review-fields.ts --with-user-token
 *
 * Apply:
 *   npx sanity exec scripts/backfill-review-fields.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type StandaloneTestimonial = {
  _id: string
  _createdAt: string
  rating?: number
  reviewDate?: string
}

type ReviewableBlock = {
  _key: string
  _type: string
  quote?: unknown
  authorName?: string
  isReview?: boolean
  rating?: number
  reviewDate?: string
  testimonial?: {
    quote?: unknown
    rating?: number
    reviewDate?: string
  }
}

type SectionedDoc = {
  _id: string
  _createdAt: string
  date?: string
  year?: number
  sections?: ReviewableBlock[]
}

function isoFromCreated(ts: string): string {
  return ts.slice(0, 10)
}

function defaultDateForCase(parent: SectionedDoc): string {
  if (parent.date) return parent.date
  if (parent.year) return `${parent.year}-01-01`
  return isoFromCreated(parent._createdAt)
}

async function backfillTestimonials() {
  const docs = await client.fetch<StandaloneTestimonial[]>(
    `*[_type == "testimonial" && (!defined(rating) || !defined(reviewDate))]
       { _id, _createdAt, rating, reviewDate }`,
  )
  console.log(`\ntestimonial docs: ${docs.length} need patching`)
  let touched = 0
  for (const d of docs) {
    const set: Record<string, unknown> = {}
    if (d.rating == null) set.rating = 5
    if (!d.reviewDate) set.reviewDate = isoFromCreated(d._createdAt)
    if (Object.keys(set).length === 0) continue
    touched++
    console.log(`  ${d._id} ← ${JSON.stringify(set)}`)
    if (APPLY) await client.patch(d._id).set(set).commit()
  }
  console.log(`testimonial docs: ${touched} ${APPLY ? 'patched' : 'would patch'}`)
}

async function backfillCaseStudies() {
  const docs = await client.fetch<SectionedDoc[]>(
    `*[_type == "caseStudy" && defined(sections)]
       { _id, _createdAt, date, year, sections }`,
  )
  let touchedDocs = 0
  let touchedBlocks = 0
  for (const d of docs) {
    const fallbackDate = defaultDateForCase(d)
    let docTouched = false
    for (const s of d.sections ?? []) {
      const isTestimonialBlock = s._type === 'testimonialBlock'
      const isQuoteBlock = s._type === 'quoteBlock'
      if (!isTestimonialBlock && !isQuoteBlock) continue

      const set: Record<string, unknown> = {}
      const path = `sections[_key=="${s._key}"]`
      if (isQuoteBlock && s.isReview !== true) set[`${path}.isReview`] = true
      if (s.rating == null) set[`${path}.rating`] = 5
      if (!s.reviewDate) set[`${path}.reviewDate`] = fallbackDate

      if (Object.keys(set).length === 0) continue
      touchedBlocks++
      docTouched = true
      console.log(`  caseStudy ${d._id} · ${s._type}[${s._key}] ← ${JSON.stringify(set)}`)
      if (APPLY) await client.patch(d._id).set(set).commit()
    }
    if (docTouched) touchedDocs++
  }
  console.log(
    `caseStudy: ${touchedBlocks} block(s) across ${touchedDocs} doc(s) ${APPLY ? 'patched' : 'would patch'}`,
  )
}

async function backfillIndustryPages() {
  const docs = await client.fetch<SectionedDoc[]>(
    `*[_type == "industryPage" && defined(sections)]
       { _id, _createdAt, sections }`,
  )
  let touched = 0
  for (const d of docs) {
    const fallbackDate = isoFromCreated(d._createdAt)
    for (const s of d.sections ?? []) {
      if (s._type !== 'servicesBlock') continue
      const t = s.testimonial
      if (!t || !t.quote) continue // skip servicesBlocks with no testimonial

      const set: Record<string, unknown> = {}
      const path = `sections[_key=="${s._key}"].testimonial`
      if (t.rating == null) set[`${path}.rating`] = 5
      if (!t.reviewDate) set[`${path}.reviewDate`] = fallbackDate

      if (Object.keys(set).length === 0) continue
      touched++
      console.log(`  industryPage ${d._id} · servicesBlock[${s._key}].testimonial ← ${JSON.stringify(set)}`)
      if (APPLY) await client.patch(d._id).set(set).commit()
    }
  }
  console.log(`industryPage: ${touched} testimonial(s) ${APPLY ? 'patched' : 'would patch'}`)
}

async function main() {
  console.log(APPLY ? '── APPLY ──' : '── DRY RUN ── (pass `-- --apply` to commit)')
  await backfillTestimonials()
  await backfillCaseStudies()
  await backfillIndustryPages()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
