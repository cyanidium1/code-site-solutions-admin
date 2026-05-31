/**
 * Shared types and helpers for the industry-page seeder.
 * Split out to avoid a circular import between the runner and the data module.
 */

export type Loc = {uk: string; en: string}

export const L = (uk: string, en: string): Loc => ({uk, en})

export type DeviceTag = {kind?: 'default' | 'good'; primary: Loc; mini?: string}
export type Metric = {value: string; label: Loc}
export type Stat = {value: string; label: Loc; source?: Loc}
export type Reason = {
  number: string
  tag: Loc
  title: Loc
  uk: string
  en: string
  stat?: Stat
}
export type CaseMeta = {strong: Loc; text: Loc}
export type CaseResult = {value: string; label: Loc; tag: Loc}
export type CaseSide = {
  num: string
  url: string
  heading: Loc
  bullets: Loc[]
  foot: Loc
}
export type AudienceCard = {title: Loc; bullets: Loc[]}
export type BenefitRow = {
  feature: string
  heading: Loc
  bullets: Loc[]
  mockType: 'pages' | 'booking' | 'admin'
  mockUrl?: string
  mockTags?: Loc[]
}
export type ServiceFeature = {title: Loc; bullets: Loc[]}
export type ComparisonRow = {param: Loc; wp: Loc; wix: Loc; custom: Loc}
export type FaqItem = {q: Loc; a: {uk: string; en: string}}

export type Industry = {
  slug: string
  order: number
  title: Loc
  seo: {title: Loc; description: Loc}
  hero: {
    eyebrow: Loc
    heading: Loc
    h1Num: string
    h1NumLabel: Loc
    lede: Loc
    features: Loc[]
    ctaPrimary: Loc
    ctaSecondary: Loc
    stats: Metric[]
    tickerItems: Loc[]
    deviceTags: DeviceTag[]
  }
  reasons: {
    eyebrow: Loc
    heading: Loc
    metaRow: Loc
    reasons: Reason[]
    footText: Loc
    footCtaLabel: Loc
  }
  case: {
    eyebrow: Loc
    eyebrowEm: Loc
    heading: Loc
    lede: Loc
    meta: CaseMeta[]
    before: CaseSide
    after: CaseSide
    results: CaseResult[]
  }
  outcome: {
    recapText: Loc
    directionsTitle: Loc
    directionsLede: Loc
    audienceCards: [AudienceCard, AudienceCard]
    benefitsHeading: Loc
    benefitRows: BenefitRow[]
  }
  testimonial: {quote: Loc; authorName: string; authorInitials: string; authorRole: Loc}
  services: {
    heading: Loc
    sub: Loc
    features: ServiceFeature[]
    integrationsHeading: Loc
    integrationsSub: Loc
    integrations: string[]
    bottomCallouts: Loc[]
  }
  comparison: {
    heading: Loc
    columns?: {param: Loc; wp: Loc; wix: Loc; custom: Loc}
    rows: ComparisonRow[]
    pricingHeading: Loc
    bottomCta: Loc
  }
  faq: {heading: Loc; items: FaqItem[]}
  audit: {
    heading: Loc
    sub: Loc
    deliverables: Loc[]
    submit: Loc
    disclaim: Loc
  }
}
