/**
 * Seed script — uploads the 3 `pricingPlan` documents into Sanity.
 * Names/prices/weeks/includes come from the homepage tiers; excludes are
 * adapted from the pricing page to fit the 3-plan taxonomy.
 *
 * Idempotent: each doc uses `createOrReplace` with a fixed `_id`.
 *
 * Required env (loaded from .env.local / .env automatically):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET   (defaults to "production")
 *   - SANITY_API_TOKEN             (write-access token)
 *
 * Run:  npm run seed:pricing-plans
 */

import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

import {createClient} from '@sanity/client'

/* env loader */
function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename)
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

type L = {uk?: string; en?: string}
function bi(uk: string, en: string): L {
  return {uk, en}
}

type PlanDoc = {
  _id: string
  _type: 'pricingPlan'
  planKey: string
  name: L
  priceFrom: number
  currency: string
  weeks: L
  includesHeading: L
  includes: L[]
  excludesHeading: L
  excludes: L[]
  ctaLabel: L
  ctaHref?: string
  ctaGhost: boolean
  discountLine?: L
  isPopular: boolean
  popularLabel?: L
  order: number
}

const PLANS: PlanDoc[] = [
  {
    _id: 'pricingPlan.landing',
    _type: 'pricingPlan',
    planKey: 'landing',
    name: bi('Лендінг', 'Landing'),
    priceFrom: 800,
    currency: 'USD',
    weeks: bi('1-2 тижні', '1–2 weeks'),
    includesHeading: bi('Що входить', 'Includes'),
    includes: [
      bi('Адаптивна верстка', 'Responsive build'),
      bi('SEO-структура', 'SEO-first structure'),
      bi('Інтеграція форм', 'Form integrations'),
      bi('Гарантія 1 рік', '1-year warranty'),
    ],
    excludesHeading: bi('Не входить', "Doesn't include"),
    excludes: [
      bi('Багатомовність', 'Multilingual support'),
      bi('CMS для самостійного редагування', 'CMS for self-editing'),
      bi('Блог', 'Blog'),
      bi('Складні інтеграції', 'Complex integrations'),
    ],
    ctaLabel: bi('Обрати Лендінг', 'Choose Landing'),
    ctaGhost: false,
    isPopular: false,
    order: 0,
  },
  {
    _id: 'pricingPlan.corporate',
    _type: 'pricingPlan',
    planKey: 'corporate',
    name: bi('Корпоративний сайт', 'Corporate Website'),
    priceFrom: 3500,
    currency: 'USD',
    weeks: bi('4-8 тижнів', '4–8 weeks'),
    includesHeading: bi('Все з Лендінгу +', 'Everything in Landing, plus'),
    includes: [
      bi('CMS, блог', 'CMS, blog'),
      bi('5+ інтеграцій', '5+ integrations'),
      bi('Локальне SEO', 'Local SEO'),
      bi('Compliance: МОЗ / RODO / HIPAA-aware', 'Compliance: GDPR / HIPAA-ready'),
      bi('Багатомовність', 'Multilingual (2+ languages)'),
    ],
    excludesHeading: bi('Не входить', "Doesn't include"),
    excludes: [
      bi('Виділена команда (5–7 осіб)', 'Dedicated team (5–7 people)'),
      bi('24/7 SLA', '24/7 SLA'),
      bi('Складна SaaS-архітектура', 'Complex SaaS architecture'),
      bi('Кастомні інтеграції', 'Custom integrations'),
    ],
    ctaLabel: bi('Обрати Корпоративний', 'Choose Corporate'),
    ctaGhost: false,
    isPopular: true,
    popularLabel: bi('★ НАЙПОПУЛЯРНІШЕ', '★ MOST POPULAR'),
    order: 10,
  },
  {
    _id: 'pricingPlan.custom',
    _type: 'pricingPlan',
    planKey: 'custom',
    name: bi('Кастомна платформа', 'Custom Platform'),
    priceFrom: 6000,
    currency: 'USD',
    weeks: bi('8-16 тижнів', '8–16 weeks'),
    includesHeading: bi('Все з Корпоративного +', 'Everything in Corporate, plus'),
    includes: [
      bi('Архітектурна сесія', 'Architectural session'),
      bi('Dedicated team', 'Dedicated team'),
      bi('SLA + 24/7 support', 'SLA + 24/7 support'),
      bi('Custom integrations', 'Custom integrations'),
    ],
    excludesHeading: bi('Не входить', "Doesn't include"),
    excludes: [
      bi('Створення фото/відео контенту', 'Photo/video content creation'),
      bi('Брендинг з нуля (лого, брендбук)', 'Branding from scratch (logo, brand book)'),
      bi('Юридичний консалтинг', 'Legal consulting'),
    ],
    ctaLabel: bi("Зв'язатися", 'Talk to us'),
    ctaGhost: true,
    isPopular: false,
    order: 20,
  },
]

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId) {
    console.error('✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
    process.exit(1)
  }
  if (!token) {
    console.error('✗ Missing SANITY_API_TOKEN')
    process.exit(1)
  }

  const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})

  console.log(`→ Seeding ${PLANS.length} pricingPlan doc(s) into ${projectId}/${dataset}`)
  for (const doc of PLANS) {
    try {
      const result = await client.createOrReplace(doc)
      console.log(`  ✓ ${result._id} (popular=${doc.isPopular})`)
    } catch (err) {
      console.error(`  ✗ ${doc._id} failed:`, err)
      process.exitCode = 1
    }
  }
}

main().catch((err) => {
  console.error('✗ Fatal:', err)
  process.exit(1)
})
