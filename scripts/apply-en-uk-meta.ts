/**
 * Apply EN-language SEO meta to industry pages + the nbyg-kobenhavn case study.
 *
 * The same English UK-market meta is written to BOTH `.uk` and `.en` slots of
 * `seo.title` / `seo.description` so it shows on both the (uk) and (en) routes.
 * (Per the team brief — Ukrainian copy will be re-introduced later.)
 *
 * Idempotent — re-running with --apply after a successful run reports 0 changes.
 *
 * Dry-run:
 *   npx sanity exec scripts/apply-en-uk-meta.ts --with-user-token
 *
 * Apply:
 *   npx sanity exec scripts/apply-en-uk-meta.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Entry = {
  type: 'industryPage' | 'caseStudy'
  slug: string
  title: string
  description: string
}

const ENTRIES: Entry[] = [
  // ── Industry pages ──────────────────────────────────────────────────────
  {
    type: 'industryPage',
    slug: 'medicine',
    title: 'ᐈ Medical Clinic Website Design UK | Healthcare Websites | Code-Site.Art',
    description:
      '➤ Custom websites for private clinics, dental practices & GP surgeries ✔️ Online appointment booking ✔️ GDPR compliant ✔️ Mobile-first ✔️ Lighthouse 98+ ➡ Get a free estimate for your clinic.',
  },
  {
    type: 'industryPage',
    slug: 'legal',
    title: 'ᐈ Law Firm Website Design UK | Solicitor Websites | Code-Site.Art',
    description:
      '➤ Bespoke websites for UK law firms & solicitors ✔️ Lead generation focused ✔️ Google Reviews integration ✔️ SRA compliant design ✔️ Fast & mobile-first ➡ Book a free strategy call.',
  },
  {
    type: 'industryPage',
    slug: 'renovation',
    title: 'ᐈ Construction Company Website Design UK | Builder Websites | Code-Site.Art',
    description:
      '➤ Custom websites for UK builders, contractors & renovation companies ✔️ Online quote calculator ✔️ Project gallery ✔️ Fixed price from £1,000 ➡ Get a free estimate today.',
  },
  {
    type: 'industryPage',
    slug: 'finance',
    title: 'ᐈ Accountant & Financial Advisor Website Design UK | Code-Site.Art',
    description:
      '➤ Custom websites for UK accountants, IFAs & mortgage brokers ✔️ Client portal integration ✔️ GDPR compliant ✔️ Fixed price ✔️ Launched in 4 weeks ➡ Get a free quote.',
  },
  {
    type: 'industryPage',
    slug: 'ecommerce',
    title:
      'ᐈ Custom Ecommerce Website Development UK | Bespoke Online Store | Code-Site.Art',
    description:
      '➤ Bespoke ecommerce websites built on Next.js — no Shopify lock-in ✔️ Stripe payments ✔️ CRM integration ✔️ Headless architecture ✔️ Fast checkout ➡ Get a free estimate.',
  },
  {
    type: 'industryPage',
    slug: 'auto',
    title: 'ᐈ Car Dealership & Automotive Website Design UK | Code-Site.Art',
    description:
      '➤ Custom websites for UK car dealers, garages & MOT centres ✔️ Vehicle inventory system ✔️ Online booking ✔️ Mobile-first ✔️ Fixed price ➡ Get a free estimate for your automotive business.',
  },
  {
    type: 'industryPage',
    slug: 'real-estate',
    title: 'ᐈ Estate Agent & Property Website Design UK | Code-Site.Art',
    description:
      '➤ Custom websites for UK estate agents & property developers ✔️ Rightmove & Zoopla feeds ✔️ Property listings ✔️ Multilingual support ✔️ Fixed price ➡ Get a free quote today.',
  },
  {
    type: 'industryPage',
    slug: 'courses',
    title: 'ᐈ Online Course & eLearning Website Design UK | Code-Site.Art',
    description:
      '➤ Custom websites for online courses, coaching & eLearning businesses ✔️ Stripe payment integration ✔️ Course access control ✔️ Mobile-first ✔️ Fixed price ➡ Book a free strategy call.',
  },
  // ── Case study ──────────────────────────────────────────────────────────
  {
    type: 'caseStudy',
    slug: 'nbyg-kobenhavn',
    title: 'ᐈ NBYG Bornholm Construction Website Case Study | Code-Site.Art',
    description:
      '➤ Professional website for a Danish renovation & construction company ✔️ Multilingual EN/DA ✔️ Project gallery ✔️ Lead generation focused ➡ See the full case study.',
  },
]

type DocRef = {_id: string; seoTitle?: {uk?: string; en?: string}; seoDesc?: {uk?: string; en?: string}}

async function findDoc(type: string, slug: string): Promise<DocRef | null> {
  return client.fetch<DocRef | null>(
    `*[_type == $type && slug.current == $slug][0]{
      _id,
      "seoTitle": seo.title,
      "seoDesc": seo.description
    }`,
    {type, slug},
  )
}

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY-RUN (no writes)'}`)
  console.log('-'.repeat(72))

  let touched = 0
  let missing = 0
  let unchanged = 0

  for (const e of ENTRIES) {
    const doc = await findDoc(e.type, e.slug)
    if (!doc) {
      console.log(`MISSING  ${e.type}:${e.slug}  (no document found by slug)`)
      missing++
      continue
    }

    const current = {
      ukTitle: doc.seoTitle?.uk ?? '',
      enTitle: doc.seoTitle?.en ?? '',
      ukDesc: doc.seoDesc?.uk ?? '',
      enDesc: doc.seoDesc?.en ?? '',
    }
    const noop =
      current.ukTitle === e.title &&
      current.enTitle === e.title &&
      current.ukDesc === e.description &&
      current.enDesc === e.description
    if (noop) {
      console.log(`SKIP     ${e.type}:${e.slug}  (already up to date)`)
      unchanged++
      continue
    }

    console.log(`UPDATE   ${e.type}:${e.slug}  (_id=${doc._id})`)
    console.log(`  title.uk: "${current.ukTitle}" -> "${e.title}"`)
    console.log(`  title.en: "${current.enTitle}" -> "${e.title}"`)
    console.log(`  desc.uk : "${current.ukDesc.slice(0, 60)}…" -> "${e.description.slice(0, 60)}…"`)
    console.log(`  desc.en : "${current.enDesc.slice(0, 60)}…" -> "${e.description.slice(0, 60)}…"`)

    if (APPLY) {
      await client
        .patch(doc._id)
        .set({
          'seo.title.uk': e.title,
          'seo.title.en': e.title,
          'seo.description.uk': e.description,
          'seo.description.en': e.description,
        })
        .commit()
    }
    touched++
  }

  console.log('-'.repeat(72))
  console.log(`Done. updated=${touched}  unchanged=${unchanged}  missing=${missing}`)
  if (!APPLY) console.log('(Re-run with -- --apply to write changes.)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
