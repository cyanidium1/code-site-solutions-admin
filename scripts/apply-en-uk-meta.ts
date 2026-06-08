/**
 * Apply localized SEO meta to industry pages + the nbyg-kobenhavn case study.
 *
 * Ukrainian copy is written to the `.uk` slot and English UK-market copy to the
 * `.en` slot of `seo.title` / `seo.description`, so each route shows its own
 * language. The Ukrainian variants are localized for the UA market (prices in $,
 * UK-specific terms — SRA, Rightmove/Zoopla, MOT — reframed generically).
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
  titleUk: string
  descriptionUk: string
  titleEn: string
  descriptionEn: string
}

const ENTRIES: Entry[] = [
  // ── Industry pages ──────────────────────────────────────────────────────
  {
    type: 'industryPage',
    slug: 'medicine',
    titleUk: 'ᐈ Створення сайтів для медичних клінік | Сайти для клінік | Code-Site.Art',
    descriptionUk:
      '➤ Кастомні сайти для приватних клінік, стоматологій і медичних центрів ✔️ Онлайн-запис на прийом ✔️ Захист персональних даних ✔️ Mobile-first ✔️ Lighthouse 98+ ➡ Отримайте безкоштовний прорахунок для вашої клініки.',
    titleEn: 'ᐈ Medical Clinic Website Design UK | Healthcare Websites | Code-Site.Art',
    descriptionEn:
      '➤ Custom websites for private clinics, dental practices & GP surgeries ✔️ Online appointment booking ✔️ GDPR compliant ✔️ Mobile-first ✔️ Lighthouse 98+ ➡ Get a free estimate for your clinic.',
  },
  {
    type: 'industryPage',
    slug: 'legal',
    titleUk: 'ᐈ Створення сайтів для юристів і адвокатів | Юридичні сайти | Code-Site.Art',
    descriptionUk:
      '➤ Кастомні сайти для юридичних фірм і адвокатів ✔️ Орієнтація на залучення клієнтів ✔️ Інтеграція з Google Reviews ✔️ Дизайн із юридичною специфікою ✔️ Швидкі та mobile-first ➡ Замовте безкоштовну стратегічну консультацію.',
    titleEn: 'ᐈ Law Firm Website Design UK | Solicitor Websites | Code-Site.Art',
    descriptionEn:
      '➤ Bespoke websites for UK law firms & solicitors ✔️ Lead generation focused ✔️ Google Reviews integration ✔️ SRA compliant design ✔️ Fast & mobile-first ➡ Book a free strategy call.',
  },
  {
    type: 'industryPage',
    slug: 'renovation',
    titleUk: 'ᐈ Створення сайтів для будівельних компаній | Сайти для будівельників | Code-Site.Art',
    descriptionUk:
      '➤ Кастомні сайти для будівельників, підрядників і ремонтних компаній ✔️ Онлайн-калькулятор кошторису ✔️ Галерея проєктів ✔️ Фікс-ціна від $1 000 ➡ Отримайте безкоштовний прорахунок сьогодні.',
    titleEn: 'ᐈ Construction Company Website Design UK | Builder Websites | Code-Site.Art',
    descriptionEn:
      '➤ Custom websites for UK builders, contractors & renovation companies ✔️ Online quote calculator ✔️ Project gallery ✔️ Fixed price from £1,000 ➡ Get a free estimate today.',
  },
  {
    type: 'industryPage',
    slug: 'finance',
    titleUk: 'ᐈ Створення сайтів для бухгалтерів і фінансових консультантів | Code-Site.Art',
    descriptionUk:
      '➤ Кастомні сайти для бухгалтерів, фінансових консультантів і кредитних брокерів ✔️ Інтеграція клієнтського порталу ✔️ Захист персональних даних ✔️ Фікс-ціна ✔️ Запуск за 4 тижні ➡ Отримайте безкоштовний прорахунок.',
    titleEn: 'ᐈ Accountant & Financial Advisor Website Design UK | Code-Site.Art',
    descriptionEn:
      '➤ Custom websites for UK accountants, IFAs & mortgage brokers ✔️ Client portal integration ✔️ GDPR compliant ✔️ Fixed price ✔️ Launched in 4 weeks ➡ Get a free quote.',
  },
  {
    type: 'industryPage',
    slug: 'ecommerce',
    titleUk:
      'ᐈ Розробка кастомних інтернет-магазинів | Власний e-commerce | Code-Site.Art',
    descriptionUk:
      '➤ Кастомні інтернет-магазини на Next.js — без прив’язки до Shopify ✔️ Оплати через Stripe ✔️ Інтеграція з CRM ✔️ Headless-архітектура ✔️ Швидкий checkout ➡ Отримайте безкоштовний прорахунок.',
    titleEn:
      'ᐈ Custom Ecommerce Website Development UK | Bespoke Online Store | Code-Site.Art',
    descriptionEn:
      '➤ Bespoke ecommerce websites built on Next.js — no Shopify lock-in ✔️ Stripe payments ✔️ CRM integration ✔️ Headless architecture ✔️ Fast checkout ➡ Get a free estimate.',
  },
  {
    type: 'industryPage',
    slug: 'auto',
    titleUk: 'ᐈ Створення сайтів для автосалонів і автосервісів | Code-Site.Art',
    descriptionUk:
      '➤ Кастомні сайти для автосалонів, автосервісів і СТО ✔️ Система каталогу авто ✔️ Онлайн-запис ✔️ Mobile-first ✔️ Фікс-ціна ➡ Отримайте безкоштовний прорахунок для вашого автобізнесу.',
    titleEn: 'ᐈ Car Dealership & Automotive Website Design UK | Code-Site.Art',
    descriptionEn:
      '➤ Custom websites for UK car dealers, garages & MOT centres ✔️ Vehicle inventory system ✔️ Online booking ✔️ Mobile-first ✔️ Fixed price ➡ Get a free estimate for your automotive business.',
  },
  {
    type: 'industryPage',
    slug: 'real-estate',
    titleUk: 'ᐈ Створення сайтів для агенцій нерухомості | Сайти нерухомості | Code-Site.Art',
    descriptionUk:
      '➤ Кастомні сайти для агенцій нерухомості та забудовників ✔️ Інтеграція з порталами нерухомості ✔️ Каталог об’єктів ✔️ Підтримка кількох мов ✔️ Фікс-ціна ➡ Отримайте безкоштовний прорахунок сьогодні.',
    titleEn: 'ᐈ Estate Agent & Property Website Design UK | Code-Site.Art',
    descriptionEn:
      '➤ Custom websites for UK estate agents & property developers ✔️ Rightmove & Zoopla feeds ✔️ Property listings ✔️ Multilingual support ✔️ Fixed price ➡ Get a free quote today.',
  },
  {
    type: 'industryPage',
    slug: 'courses',
    titleUk: 'ᐈ Створення сайтів для онлайн-курсів і навчальних платформ | Code-Site.Art',
    descriptionUk:
      '➤ Кастомні сайти для онлайн-курсів, коучингу та освітніх проєктів ✔️ Інтеграція оплат через Stripe ✔️ Контроль доступу до курсів ✔️ Mobile-first ✔️ Фікс-ціна ➡ Замовте безкоштовну стратегічну консультацію.',
    titleEn: 'ᐈ Online Course & eLearning Website Design UK | Code-Site.Art',
    descriptionEn:
      '➤ Custom websites for online courses, coaching & eLearning businesses ✔️ Stripe payment integration ✔️ Course access control ✔️ Mobile-first ✔️ Fixed price ➡ Book a free strategy call.',
  },
  // ── Case study ──────────────────────────────────────────────────────────
  {
    type: 'caseStudy',
    slug: 'nbyg-kobenhavn',
    titleUk: 'ᐈ Кейс: сайт будівельної компанії NBYG (Борнгольм) | Code-Site.Art',
    descriptionUk:
      '➤ Професійний сайт для данської ремонтно-будівельної компанії ✔️ Дві мови EN/DA ✔️ Галерея проєктів ✔️ Орієнтація на залучення клієнтів ➡ Дивіться повний кейс.',
    titleEn: 'ᐈ NBYG Bornholm Construction Website Case Study | Code-Site.Art',
    descriptionEn:
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
      current.ukTitle === e.titleUk &&
      current.enTitle === e.titleEn &&
      current.ukDesc === e.descriptionUk &&
      current.enDesc === e.descriptionEn
    if (noop) {
      console.log(`SKIP     ${e.type}:${e.slug}  (already up to date)`)
      unchanged++
      continue
    }

    console.log(`UPDATE   ${e.type}:${e.slug}  (_id=${doc._id})`)
    console.log(`  title.uk: "${current.ukTitle}" -> "${e.titleUk}"`)
    console.log(`  title.en: "${current.enTitle}" -> "${e.titleEn}"`)
    console.log(`  desc.uk : "${current.ukDesc.slice(0, 60)}…" -> "${e.descriptionUk.slice(0, 60)}…"`)
    console.log(`  desc.en : "${current.enDesc.slice(0, 60)}…" -> "${e.descriptionEn.slice(0, 60)}…"`)

    if (APPLY) {
      await client
        .patch(doc._id)
        .set({
          'seo.title.uk': e.titleUk,
          'seo.title.en': e.titleEn,
          'seo.description.uk': e.descriptionUk,
          'seo.description.en': e.descriptionEn,
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
