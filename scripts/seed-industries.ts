/**
 * Seed script — Sprint 3 industry pages.
 * Idempotent: createOrReplace on `industryPage.<slug>`.
 * Preserves image asset refs from existing docs (medicine + renovation) on re-runs.
 *
 * Source of truth: docs/industries/*.md (frontend repo).
 *
 * Run:
 *   npx tsx scripts/seed-industries.ts
 */

import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

import {createClient, type SanityClient} from '@sanity/client'

import {
  L,
  type AudienceCard,
  type BenefitRow,
  type CaseMeta,
  type CaseResult,
  type CaseSide,
  type ComparisonRow,
  type DeviceTag,
  type FaqItem,
  type Industry,
  type Loc,
  type Metric,
  type Reason,
  type ServiceFeature,
  type Stat,
} from './seed-industries-lib'

/* ─── env loader ─────────────────────────────────────────────────────────── */

function loadEnvFile(path: string) {
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

loadEnvFile(join(process.cwd(), '.env.local'))
loadEnvFile(join(process.cwd(), '.env'))
loadEnvFile(join(process.cwd(), '..', 'code-site-solutions', '.env.local'))

const PROJECT_ID = '4lk0x7o9'
const DATASET = 'production'
const TOKEN = process.env.SANITY_API_TOKEN

if (!TOKEN) {
  console.error('✘ Missing SANITY_API_TOKEN. Put it in .env.local.')
  process.exit(1)
}

/* ─── types & helpers ────────────────────────────────────────────────────── */

type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type Block = {
  _type: 'block'
  _key: string
  style: 'normal'
  children: Span[]
  markDefs: []
}

class KeyGen {
  private n = 0
  constructor(private prefix: string) {}
  next(tag: string): string {
    this.n += 1
    return `${this.prefix}-${tag}-${this.n}`
  }
}

/**
 * Convert a plain string (with optional `*emphasis*` markers) to a
 * single-paragraph portable-text array suitable for `richTextSimple`.
 */
function pt(kg: KeyGen, text: string): Block[] {
  const parts = text.split(/\*([^*]+)\*/)
  const children: Span[] = []
  parts.forEach((segment, idx) => {
    if (!segment) return
    children.push({
      _type: 'span',
      _key: kg.next('s'),
      text: segment,
      marks: idx % 2 === 1 ? ['em'] : [],
    })
  })
  return [
    {
      _type: 'block',
      _key: kg.next('b'),
      style: 'normal',
      children,
      markDefs: [],
    },
  ]
}

/** Portable text with both locales */
function loca(kg: KeyGen, uk: string, en: string) {
  return {uk: pt(kg, uk), en: pt(kg, en)} as const
}

/* ─── builders ───────────────────────────────────────────────────────────── */

function buildHero(kg: KeyGen, h: Industry['hero'], preservedDeviceMockup?: unknown) {
  return {
    eyebrow: h.eyebrow,
    heading: h.heading,
    h1Num: h.h1Num,
    h1NumLabel: h.h1NumLabel,
    lede: h.lede,
    features: h.features,
    ctaPrimary: h.ctaPrimary,
    ctaSecondary: h.ctaSecondary,
    stats: h.stats.map((m) => ({_key: kg.next('st'), value: m.value, label: m.label})),
    tickerItems: h.tickerItems,
    deviceTags: h.deviceTags.map((dt) => ({
      _key: kg.next('dt'),
      ...(dt.kind ? {kind: dt.kind} : {kind: 'default'}),
      primary: dt.primary,
      ...(dt.mini ? {mini: dt.mini} : {}),
    })),
    ...(preservedDeviceMockup ? {deviceMockup: preservedDeviceMockup} : {}),
  }
}

function buildReasonsBlock(kg: KeyGen, r: Industry['reasons']) {
  return {
    _key: kg.next('sec'),
    _type: 'reasonsBlock',
    eyebrow: r.eyebrow,
    heading: r.heading,
    metaRows: [r.metaRow],
    reasons: r.reasons.map((item) => ({
      _key: kg.next('r'),
      number: item.number,
      tag: item.tag,
      title: item.title,
      text: pt(kg, item.uk),
      textEn: pt(kg, item.en),
      ...(item.stat
        ? {
            stat: {
              value: item.stat.value,
              label: item.stat.label,
              ...(item.stat.source ? {source: item.stat.source} : {}),
            },
          }
        : {}),
    })),
    footText: r.footText,
    footCtaLabel: r.footCtaLabel,
  }
}

function buildCaseBlock(kg: KeyGen, c: Industry['case'], preserved: {beforeImage?: unknown; afterImage?: unknown}) {
  const side = (s: CaseSide, image: unknown) => ({
    num: s.num,
    url: s.url,
    heading: s.heading,
    items: s.bullets,
    foot: s.foot,
    ...(image ? {image} : {}),
  })
  return {
    _key: kg.next('sec'),
    _type: 'caseBlock',
    eyebrow: c.eyebrow,
    eyebrowEm: c.eyebrowEm,
    heading: c.heading,
    lede: c.lede,
    meta: c.meta.map((m) => ({_key: kg.next('cm'), strong: m.strong, text: m.text})),
    before: side(c.before, preserved.beforeImage),
    after: side(c.after, preserved.afterImage),
    results: c.results.map((r) => ({
      _key: kg.next('rs'),
      value: r.value,
      label: r.label,
      tag: r.tag,
    })),
  }
}

function buildOutcomeBlock(kg: KeyGen, o: Industry['outcome']) {
  const [card1, card2] = o.audienceCards
  return {
    _key: kg.next('sec'),
    _type: 'outcomeBlock',
    recap: {text: o.recapText},
    directions: {
      title: o.directionsTitle,
      lede: o.directionsLede,
      replaceLabel: L(card1.title.uk, card1.title.en),
      replaceItems: card1.bullets,
      allowedLabel: L(card2.title.uk, card2.title.en),
      allowedItems: card2.bullets,
    },
    benefitsHeading: o.benefitsHeading,
    benefitRows: o.benefitRows.map((row, idx) => ({
      _key: kg.next('br'),
      feature: row.feature || `FEATURE · 0${idx + 1} / 0${o.benefitRows.length}`,
      heading: row.heading,
      items: row.bullets,
      mockType: row.mockType,
      ...(row.mockUrl ? {mockUrl: row.mockUrl} : {}),
      ...(row.mockTags ? {mockTags: row.mockTags} : {}),
    })),
  }
}

function buildServicesBlock(
  kg: KeyGen,
  s: Industry['services'],
  t: Industry['testimonial'],
  preserved: {featureImages?: unknown[]; authorAvatar?: unknown} = {},
) {
  return {
    _key: kg.next('sec'),
    _type: 'servicesBlock',
    testimonialEyebrow: L('ВІДГУК КЛІЄНТА', 'CLIENT TESTIMONIAL'),
    testimonial: {
      quote: t.quote,
      authorName: t.authorName,
      authorInitials: t.authorInitials,
      authorRole: t.authorRole,
      ...(preserved.authorAvatar ? {authorAvatar: preserved.authorAvatar} : {}),
    },
    heading: s.heading,
    sub: s.sub,
    features: s.features.map((f, i) => {
      const preservedImage = preserved.featureImages?.[i]
      return {
        _key: kg.next('sf'),
        title: f.title,
        items: f.bullets,
        ...(preservedImage ? {image: preservedImage} : {}),
      }
    }),
    integrationsHeading: s.integrationsHeading,
    integrationsSub: s.integrationsSub,
    integrations: s.integrations.map((name) =>
      L(name, name),
    ),
  }
}

function buildComparisonBlock(kg: KeyGen, c: Industry['comparison']) {
  return {
    _key: kg.next('sec'),
    _type: 'comparisonBlock',
    heading: c.heading,
    ...(c.columns
      ? {
          columns: {
            param: c.columns.param,
            wp: c.columns.wp,
            wix: c.columns.wix,
            custom: c.columns.custom,
          },
        }
      : {}),
    rows: c.rows.map((r) => ({
      _key: kg.next('cr'),
      param: r.param,
      wp: r.wp,
      wix: r.wix,
      custom: r.custom,
    })),
    tableCtaPrimary: L(
      'Детальне порівняння конструкторів →',
      'Detailed page builder comparison →',
    ),
    tableCtaGhost: L('Порівняння з WordPress →', 'WordPress comparison →'),
    contact: {
      heading: L('Обговорити проєкт', 'Discuss your project'),
      sub: L(
        'Розкажіть коротко про ваш проєкт — відповімо в Telegram протягом 1–2 годин у робочий час.',
        'Tell us briefly about your project — we’ll reply on Telegram within 1–2 hours during business hours.',
      ),
      namePlaceholder: L('Як до вас звертатися', 'Your name'),
      channelPlaceholder: L(
        'Telegram, телефон або email',
        'Telegram, phone, or email',
      ),
      briefPlaceholder: L(
        'Який сайт потрібен, які цілі',
        'What kind of site you need, what your goals are',
      ),
      submitLabel: L(
        'Надіслати — відповімо за 1–2 години',
        'Send — we’ll reply within 1–2 hours',
      ),
      foot: L(
        'Або одразу пишіть у Telegram — @fedirdev',
        'Or message us on Telegram — @fedirdev',
      ),
    },
    pricingHeading: c.pricingHeading,
    tiers: [
      {
        _key: kg.next('tier'),
        title: L('Industry Pro', 'Industry Pro'),
        price: L('$3 500', '$3,500'),
        weeks: L('4–6 тижнів', '4-6 weeks'),
        isPopular: false,
        includesHeading: L('Що входить', 'Included'),
        includes: [
          L('Готова структура під вашу галузь', 'Industry-ready structure'),
          L('UA + EN білінгвал', 'UA + EN bilingual'),
          L('Базові інтеграції (CRM + платежі)', 'Base integrations (CRM + payments)'),
          L('Sanity CMS для самостійних правок', 'Sanity CMS for self-serve edits'),
        ],
        ctaLabel: L('Деталі — на /pricing', 'Details — on /en/pricing'),
        ctaGhost: false,
      },
      {
        _key: kg.next('tier'),
        title: L('Pro Plus', 'Pro Plus'),
        price: L('$7 500', '$7,500'),
        weeks: L('6–10 тижнів', '6-10 weeks'),
        isPopular: true,
        popularLabel: L('Популярний', 'Popular'),
        includesHeading: L('Що входить', 'Included'),
        includes: [
          L('Все з Industry Pro', 'Everything in Industry Pro'),
          L('Складні інтеграції (3–5 систем)', 'Deep integrations (3-5 systems)'),
          L('Multi-language / multi-currency', 'Multi-language / multi-currency'),
          L('Окремі лендинги під ринок / послугу', 'Dedicated landings per market / service'),
        ],
        ctaLabel: L('Деталі — на /pricing', 'Details — on /en/pricing'),
        ctaGhost: false,
      },
      {
        _key: kg.next('tier'),
        title: L('Custom', 'Custom'),
        price: L('від $14 000', 'from $14,000'),
        weeks: L('10+ тижнів', '10+ weeks'),
        isPopular: false,
        includesHeading: L('Що входить', 'Included'),
        includes: [
          L('Все з Pro Plus', 'Everything in Pro Plus'),
          L('Унікальна бізнес-логіка', 'Custom business logic'),
          L('Власна платформа / SaaS', 'Custom platform / SaaS'),
          L('Програмні landing pages (100+)', 'Programmatic landings (100+)'),
        ],
        ctaLabel: L('Деталі — на /pricing', 'Details — on /en/pricing'),
        ctaGhost: true,
      },
    ],
  }
}

function buildFaqBlock(kg: KeyGen, f: Industry['faq']) {
  return {
    _key: kg.next('sec'),
    _type: 'faqBlock',
    heading: f.heading,
    items: f.items.map((it) => ({
      _key: kg.next('fq'),
      question: it.q,
      answer: pt(kg, it.a.uk),
      answerEn: pt(kg, it.a.en),
    })),
  }
}

function buildAuditBlock(kg: KeyGen, a: Industry['audit']) {
  return {
    _key: kg.next('sec'),
    _type: 'auditBlock',
    heading: a.heading,
    sub: a.sub,
    list: a.deliverables,
    inputs: {
      namePlaceholder: L('Ваше імʼя', 'Your name'),
      contactPlaceholder: L('Email або Telegram', 'Email or Telegram'),
      phonePlaceholder: L('Телефон (опціонально)', 'Phone (optional)'),
      urlPlaceholder: L('Посилання на ваш сайт', 'Link to your site'),
    },
    submitLabel: a.submit,
    disclaim: a.disclaim,
  }
}

/* ─── doc builder ────────────────────────────────────────────────────────── */

function buildDoc(
  ind: Industry,
  preserved: {
    deviceMockup?: unknown
    beforeImage?: unknown
    afterImage?: unknown
    featureImages?: unknown[]
    authorAvatar?: unknown
  } = {},
) {
  const kg = new KeyGen(ind.slug.slice(0, 3))
  return {
    _id: `industryPage.${ind.slug}`,
    _type: 'industryPage',
    slug: {_type: 'slug', current: ind.slug},
    status: 'published',
    order: ind.order,
    title: ind.title,
    seo: {title: ind.seo.title, description: ind.seo.description},
    hero: buildHero(kg, ind.hero, preserved.deviceMockup),
    sections: [
      buildReasonsBlock(kg, ind.reasons),
      buildCaseBlock(kg, ind.case, {
        beforeImage: preserved.beforeImage,
        afterImage: preserved.afterImage,
      }),
      buildOutcomeBlock(kg, ind.outcome),
      buildServicesBlock(kg, ind.services, ind.testimonial, {
        featureImages: preserved.featureImages,
        authorAvatar: preserved.authorAvatar,
      }),
      buildComparisonBlock(kg, ind.comparison),
      buildFaqBlock(kg, ind.faq),
      buildAuditBlock(kg, ind.audit),
    ],
  }
}

/* ─── data — 8 industries ────────────────────────────────────────────────── */

import {INDUSTRIES} from './seed-industries-data'

/* ─── runner ─────────────────────────────────────────────────────────────── */

async function preservedAssets(client: SanityClient, slug: string) {
  const doc = (await client.getDocument(`industryPage.${slug}`)) as
    | {
        hero?: {deviceMockup?: unknown}
        sections?: Array<{
          _type?: string
          before?: {image?: unknown}
          after?: {image?: unknown}
          features?: Array<{image?: unknown}>
          testimonial?: {authorAvatar?: unknown}
        }>
      }
    | undefined
  if (!doc) return {}
  const caseSec = doc.sections?.find((s) => s._type === 'caseBlock')
  const servicesSec = doc.sections?.find((s) => s._type === 'servicesBlock')
  return {
    deviceMockup: doc.hero?.deviceMockup,
    beforeImage: caseSec?.before?.image,
    afterImage: caseSec?.after?.image,
    featureImages: servicesSec?.features?.map((f) => f.image),
    authorAvatar: servicesSec?.testimonial?.authorAvatar,
  }
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-10-01',
    token: TOKEN,
    useCdn: false,
  })

  console.log(`Seeding ${INDUSTRIES.length} industry pages…`)

  for (const ind of INDUSTRIES) {
    const preserved = await preservedAssets(client, ind.slug)
    const doc = buildDoc(ind, preserved)
    const result = await client.createOrReplace(doc)
    const reusedAssets = Object.entries(preserved)
      .filter(([, v]) => {
        if (Array.isArray(v)) return v.some(Boolean)
        return Boolean(v)
      })
      .map(([k]) => k)
      .join(', ')
    console.log(
      `✓ ${ind.slug}  _rev=${result._rev}${reusedAssets ? `  (preserved: ${reusedAssets})` : ''}`,
    )
  }

  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
