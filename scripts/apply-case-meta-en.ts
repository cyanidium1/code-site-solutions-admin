/**
 * Apply English (UK-market) SEO meta to the 21 portfolio case studies.
 *
 * Source: "meta-tags .xlsx" → sheet "Мета Кейсы". Values applied verbatim.
 * Writes ONLY the .en slot of seo.title / seo.description; uk/ru are left intact.
 * Idempotent — re-running with --apply after success reports 0 changes.
 *
 * Dry-run:
 *   npx sanity exec scripts/apply-case-meta-en.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/apply-case-meta-en.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Entry = {slug: string; titleEn: string; descriptionEn: string}

const ENTRIES: Entry[] = [
  {
    slug: "aleko-course",
    titleEn:
      "ᐈ Aleko Course — Educational Landing Page Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Creator-led educational product ✔️ Conversion-focused structure ✔️ Landing page design ✔️ Course sales funnel ➡ See the full case study.",
  },
  {
    slug: "boulevard-salon",
    titleEn:
      "ᐈ Boulevard Salon — Beauty Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Website for a beauty salon ✔️ Structured service catalogue ✔️ Online booking integration ✔️ Clean UX design ➡ See the full case study.",
  },
  {
    slug: "bravo",
    titleEn:
      "ᐈ Bravo — Food Delivery Website & Menu Design Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Grill-food delivery brand in Brovary ✔️ Conversion-driven marketing structure ✔️ Menu design system ✔️ Short path to ordering ➡ See the full case study.",
  },
  {
    slug: "clarion-solutions",
    titleEn:
      "ᐈ Clarion Solutions — AI Automation & Local SEO Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ AI automation services website ✔️ Demo-led conversion architecture ✔️ Local SEO optimised ✔️ B2B lead generation ➡ See the full case study.",
  },
  {
    slug: "co2lab",
    titleEn:
      "ᐈ CO2LAB — B2B Engineering Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Technical B2B engineering website ✔️ Complex service explanation ✔️ Partner conversion focus ✔️ Clean technical UX ➡ See the full case study.",
  },
  {
    slug: "e-fedra-beauty",
    titleEn:
      "ᐈ E-Fedra Beauty — Aesthetic Clinic Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Beauty clinic website ✔️ Trust-building structure ✔️ Service clarity ✔️ Conversion to booking ➡ See the full case study.",
  },
  {
    slug: "efedra-clinic",
    titleEn:
      "ᐈ Efedra Clinic — Dental & Aesthetic Studio Website Redesign | Code-Site.Art",
    descriptionEn:
      "➤ Clinic redesign in Odesa ✔️ Next.js + Sanity CMS ✔️ 3.2× more inquiries ✔️ LCP 0.8s · Top-3 Google ➡ See the full case study.",
  },
  {
    slug: "glenn-garbo",
    titleEn:
      "ᐈ Glenn Garbo — Artist Platform Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Personal artist platform ✔️ Content distribution ✔️ Direct monetisation ✔️ Fan engagement system ➡ See the full case study.",
  },
  {
    slug: "glimmer",
    titleEn:
      "ᐈ Glimmer — E-Commerce Site for a Ukrainian Publisher Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Book e-commerce platform ✔️ Aesthetic fiction catalogue ✔️ Pre-orders & deal blocks ✔️ Investment recouped in ~1 week ➡ See the full case study.",
  },
  {
    slug: "kondor-device",
    titleEn:
      "ᐈ Kondor Device — Gaming Peripherals E-Commerce Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Ukrainian gaming brand website ✔️ Full e-commerce: catalog, cart, checkout ✔️ Short path to purchase ✔️ Keyboards, mice & accessories ➡ See the full case study.",
  },
  {
    slug: "le-muse-nature",
    titleEn:
      "ᐈ Le'Muse Nature — Dermatocosmetic Brand E-Commerce Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Premium Ukrainian cosmetics brand ✔️ Science-led trust structure ✔️ Product education + conversion ✔️ Free consultation flow ➡ See the full case study.",
  },
  {
    slug: "mono-pools",
    titleEn:
      "ᐈ Mono Pools — Composite Pool Manufacturer Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Pool manufacturer website ✔️ Top-1/Top-2 Google results ✔️ Rankings in ~2 months ✔️ Custom Next.js · 0 paid plugins ➡ See the full case study.",
  },
  {
    slug: "nbyg-kobenhavn",
    titleEn:
      "ᐈ NBYG Bornholm — Construction Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Professional website for a Danish renovation & construction company ✔️ Multilingual EN/DA ✔️ Project gallery ✔️ Lead generation focused ➡ See the full case study.",
  },
  {
    slug: "oleksandr-sitnikov",
    titleEn:
      "ᐈ Oleksandr Sytnykov — Legal Expert & Courses Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Personal brand for a former judge ✔️ Courses & legal services ✔️ Bilingual UA/EN ✔️ Sanity CMS + SEO ➡ See the full case study.",
  },
  {
    slug: "raul-avto",
    titleEn:
      "ᐈ Raul Avto — Car Import & Delivery Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ US car delivery service ✔️ Import & customs support ✔️ Trust-building structure ✔️ Clear CTA conversion ➡ See the full case study.",
  },
  {
    slug: "rich-tour",
    titleEn:
      "ᐈ Rich Tour — Travel Agency Website with Agent Portal & CRM | Code-Site.Art",
    descriptionEn:
      "➤ Complex travel service website ✔️ Cost calculator ✔️ Agent portal & CRM ✔️ SEO-driven content structure ➡ See the full case study.",
  },
  {
    slug: "right-cars",
    titleEn:
      "ᐈ Right Cars — Custom Vehicle Dealer Platform Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Used-car dealer in South Africa ✔️ Vehicle search & reservation ✔️ Finance, auctions & test drives ✔️ Large inventory management ➡ See the full case study.",
  },
  {
    slug: "solide-renovation",
    titleEn:
      "ᐈ Solide Renovation — Luxury Renovation Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ High-ticket renovation firm on the French Riviera ✔️ Portfolio & trust structure ✔️ Renovation cost calculator ✔️ Client acquisition focused ➡ See the full case study.",
  },
  {
    slug: "tatarka-franchise",
    titleEn:
      "ᐈ Tatarka Franchise — Franchise Landing Page Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Franchise offer landing page ✔️ Partner conversion architecture ✔️ Business model clarity ✔️ Lead generation focused ➡ See the full case study.",
  },
  {
    slug: "urmodels",
    titleEn:
      "ᐈ URmodels — Model Agency Website Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Talent agency platform ✔️ Model scouting flow ✔️ Client-facing presentation ✔️ Dual-audience UX ➡ See the full case study.",
  },
  {
    slug: "webbond",
    titleEn:
      "ᐈ WebBond — Model Scouting Platform Case Study | Code-Site.Art",
    descriptionEn:
      "➤ Dual-flow talent platform ✔️ Model scouting system ✔️ Client portfolio presentation ✔️ B2B & B2C conversion ➡ See the full case study.",
  },
]

type DocRef = {_id: string; seoTitle?: {en?: string}; seoDesc?: {en?: string}}

async function findDoc(slug: string): Promise<DocRef | null> {
  return client.fetch<DocRef | null>(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      _id,
      "seoTitle": seo.title,
      "seoDesc": seo.description
    }`,
    {slug},
  )
}

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY-RUN (no writes)'}`)
  console.log('-'.repeat(72))

  let touched = 0
  let missing = 0
  let unchanged = 0

  for (const e of ENTRIES) {
    const doc = await findDoc(e.slug)
    if (!doc) {
      console.log(`MISSING  caseStudy:${e.slug}  (no document found by slug)`)
      missing++
      continue
    }

    const curTitle = doc.seoTitle?.en ?? ''
    const curDesc = doc.seoDesc?.en ?? ''
    if (curTitle === e.titleEn && curDesc === e.descriptionEn) {
      console.log(`SKIP     caseStudy:${e.slug}  (already up to date)`)
      unchanged++
      continue
    }

    console.log(`UPDATE   caseStudy:${e.slug}  (_id=${doc._id})`)
    console.log(`  title.en: "${curTitle}" -> "${e.titleEn}"`)
    console.log(`  desc.en : "${curDesc.slice(0, 70)}…" -> "${e.descriptionEn.slice(0, 70)}…"`)

    if (APPLY) {
      await client
        .patch(doc._id)
        .set({'seo.title.en': e.titleEn, 'seo.description.en': e.descriptionEn})
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
