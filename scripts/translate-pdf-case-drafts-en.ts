import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

import {createClient} from '@sanity/client'

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

type TranslationSpec = {
  id: string
  title: string
  heading: string
  subheading: string
  metricsLine: string
  seoTitle: string
  seoDescription: string
  metricLabels: [string, string, string, string]
  challengeBody: string
  challengeBullets: [string, string, string, string]
  solutionBody: string
  solutionBullets: [string, string, string, string]
  cmsHeading: string
  cmsBody: string
  cmsBullets: [string, string, string]
  outcomeBody: string
}

const SPECS: TranslationSpec[] = [
  {
    id: 'caseStudy.webbond',
    title: 'WebBond',
    heading: 'WebBond - website for a digital agency that builds *client-acquisition websites*',
    subheading:
      'WebBond is a digital agency that helps businesses grow their online presence through websites, SEO, advertising, and branding.',
    metricsLine: '4 service lines · 1 corporate website · 5+ key sections · 1 lead-generation structure',
    seoTitle: 'WebBond - case study | Code-Site.Art',
    seoDescription: 'Corporate site for a digital agency focused on expertise presentation and lead generation.',
    metricLabels: ['service lines', 'corporate website', 'key sections', 'lead-generation structure'],
    challengeBody:
      "For a digital agency, listing services isn't enough. A potential client wants to understand the approach, evaluate the team's expertise, and see how the agency drives client growth through digital channels.",
    challengeBullets: [
      'Show expertise and a clear working approach',
      'Structure multiple service lines into one system',
      'Present business value in plain language',
      'Build a clear path from first visit to inquiry',
    ],
    solutionBody:
      'We built a corporate website focused on expertise, service clarity, and business inquiries.',
    solutionBullets: [
      'Homepage as a structured presentation of services and approach',
      'Clear service architecture: websites, SEO, advertising, branding',
      'Multiple CTAs for consultation and partnership',
      'Responsive build and CMS for independent content updates',
    ],
    cmsHeading: 'Admin panel for managing *services and content*',
    cmsBody:
      'The WebBond team can update service pages, core content, and company information independently without developer involvement.',
    cmsBullets: [
      'Edit service and solution blocks',
      'Update copy and CTA content',
      'Manage key site sections safely',
    ],
    outcomeBody:
      'WebBond received a full digital lead-generation tool: users quickly understand the agency specialization, review service lines, and move to consultation.',
  },
  {
    id: 'caseStudy.urmodels',
    title: 'URmodels',
    heading: 'URmodels - platform for *model scouting and talent presentation*',
    subheading:
      'URmodels is a boutique model agency that develops new talent and presents models for the international fashion market.',
    metricsLine: '2 audiences: models and clients · 1 online talent application · 2 directions · 1 growth structure',
    seoTitle: 'URmodels - case study | Code-Site.Art',
    seoDescription: 'Dual-flow platform for model scouting and client-facing talent presentation.',
    metricLabels: [
      'audiences: models and clients',
      'online talent application',
      'directions: You Are Model + Your Models',
      'model-base growth structure',
    ],
    challengeBody:
      "For a model agency, a portfolio-only site is not enough. You need to attract new faces while presenting active models to brands and partners in parallel.",
    challengeBullets: [
      'Build a dedicated flow for new candidates',
      'Split navigation for two different audiences',
      'Launch a practical first-stage scouting process',
      'Present the agency model base to business clients',
    ],
    solutionBody:
      'We built a platform that works both as a talent-scouting channel and as a model presentation environment for brands.',
    solutionBullets: [
      'Separate site directions: You Are Model and Your Models',
      'Online application flow for new talent',
      'Audience-aware navigation for models and clients',
      'CMS for updating agency data and activity content',
    ],
    cmsHeading: 'Admin panel for managing *models and applications*',
    cmsBody:
      'URmodels can independently update platform content, model data, and structural blocks for both audiences.',
    cmsBullets: [
      'Update profile and section content',
      'Manage application workflows',
      'Control key site structure and navigation',
    ],
    outcomeBody:
      'URmodels received a unified platform that combines scouting, model-base presentation, and partner communication in one system.',
  },
  {
    id: 'caseStudy.tatarka-franchise',
    title: 'Tatarka Franchise',
    heading: 'Tatarka Franchise - website for *restaurant franchise sales*',
    subheading:
      'A sales-focused website built to attract franchise partners and scale a restaurant network through a partner model.',
    metricsLine: '1 franchise sales structure · 5+ key blocks · 1 partner lead form · 1 scaling website',
    seoTitle: 'Tatarka Franchise - case study | Code-Site.Art',
    seoDescription: 'Franchise landing page focused on partner conversion and business-model clarity.',
    metricLabels: [
      'franchise sales structure',
      'key blocks',
      'partner inquiry form',
      'network-scaling website',
    ],
    challengeBody:
      'A potential franchisee needs more than brand visuals. They need to understand the business model, launch terms, support format, and partnership upside.',
    challengeBullets: [
      'Explain the franchise model in clear business language',
      'Structure launch terms and support details',
      'Build a path from interest to consultation',
      'Present a franchise offer, not just a restaurant showcase',
    ],
    solutionBody:
      'We built a conversion-focused landing page centered on franchise economics, partner value, and lead capture.',
    solutionBullets: [
      'Homepage flow around franchise concept and advantages',
      'Trust blocks that reduce partnership risk perception',
      'Multiple CTAs for consultation and application',
      'CMS for updating franchise content independently',
    ],
    cmsHeading: 'Admin panel for updating the *franchise offer*',
    cmsBody:
      'The team can update partnership terms, trust content, and conversion blocks without changing the sales structure.',
    cmsBullets: [
      'Edit terms and partner advantages',
      'Update conversion copy and CTA blocks',
      'Manage incoming partner leads',
    ],
    outcomeBody:
      'Tatarka Franchise got a partner-acquisition tool: the website builds trust and turns franchise interest into qualified inquiries.',
  },
  {
    id: 'caseStudy.glenn-garbo',
    title: 'Glenn Garbo',
    heading: 'Glenn Garbo - artist website with *direct product sales*',
    subheading:
      'A personal-brand platform that combines music content, updates, and e-commerce in one destination.',
    metricsLine: '1 e-commerce module · 1 CMS · 3+ content directions · 1 online-payment integration',
    seoTitle: 'Glenn Garbo - case study | Code-Site.Art',
    seoDescription: 'Artist platform combining content distribution and direct monetization.',
    metricLabels: ['e-commerce module', 'content CMS', 'directions: music, blog, shop', 'online-payment integration'],
    challengeBody:
      'A creative project needs more than a profile page. The audience should discover content and move to purchase in a single frictionless flow.',
    challengeBullets: [
      'Combine personal-brand storytelling and commerce',
      'Centralize creative content in one platform',
      'Enable a simple, reliable payment flow',
      'Support regular publishing through CMS',
    ],
    solutionBody:
      'We built a modern one-page website with an integrated shop, content blocks, and a clear transition from discovery to order.',
    solutionBullets: [
      'One-page architecture for personal-brand presentation',
      'Dedicated shop and seamless online payment',
      'News and publication section for audience updates',
      'CMS for independent content and product management',
    ],
    cmsHeading: 'Admin panel for *content and product management*',
    cmsBody:
      'The creator can update materials, product data, and conversion elements independently in one manageable interface.',
    cmsBullets: [
      'Publish new content and updates',
      'Manage products and pricing',
      'Adjust key commercial CTA flows',
    ],
    outcomeBody:
      'Glenn Garbo received a unified platform for brand growth and sales: one system for communication, content, and monetization.',
  },
  {
    id: 'caseStudy.e-fedra-beauty',
    title: 'E-Fedra Beauty',
    heading: 'E-Fedra Beauty - website for an *aesthetic medicine and cosmetology clinic*',
    subheading:
      'A service-focused website that helps clients choose procedures, check pricing, and book consultations quickly.',
    metricsLine: '3 core directions · 1 structured price list · 5+ key sections · 1 SEO blog',
    seoTitle: 'E-Fedra Beauty - case study | Code-Site.Art',
    seoDescription: 'Clinic website focused on trust, service clarity, and conversion to booking.',
    metricLabels: [
      'directions: cosmetology, aesthetics, care',
      'structured service price list',
      'key sections',
      'SEO blog',
    ],
    challengeBody:
      "For a beauty clinic, listing procedures is not enough. The user needs clarity, trust, and enough context to make a decision before booking.",
    challengeBullets: [
      'Structure a large set of services and prices',
      'Build a clear path from service view to booking',
      'Strengthen perceived expertise and trust',
      'Launch a blog for SEO and educational content',
    ],
    solutionBody:
      'We built a clinic website with service categories, detailed procedure pages, transparent pricing, and multiple booking entry points.',
    solutionBullets: [
      'Homepage as a trust-focused service framework',
      'Detailed service pages grouped by direction',
      'Dedicated pricing section',
      'SEO blog for informational traffic growth',
    ],
    cmsHeading: 'Admin panel for updating *services, pricing, and blog*',
    cmsBody:
      'The clinic team can independently update procedures, prices, and articles without technical support.',
    cmsBullets: [
      'Manage service and pricing content',
      'Publish SEO and educational materials',
      'Control booking forms and conversion blocks',
    ],
    outcomeBody:
      'E-Fedra Beauty received a practical acquisition tool: the website builds trust, structures services, and simplifies conversion to consultation.',
  },
  {
    id: 'caseStudy.co2lab',
    title: 'CO2LAB',
    heading: 'CO2LAB - website for *industrial CO2 solutions*',
    subheading:
      'A B2B corporate website that translates complex engineering processes into clear business value and partner-ready communication.',
    metricsLine: '4 activity directions · 1 B2B corporate site · 5+ key pages · 1 partner-acquisition structure',
    seoTitle: 'CO2LAB - case study | Code-Site.Art',
    seoDescription: 'B2B engineering website focused on technical clarity and partner conversion.',
    metricLabels: ['activity directions', 'B2B corporate website', 'key pages', 'partner-acquisition structure'],
    challengeBody:
      'Industrial CO2 services are difficult to present through a generic site format. The audience needs understandable use cases, technical credibility, and commercial logic.',
    challengeBullets: [
      'Explain complex solutions in clear language',
      'Unify multiple technical directions in one structure',
      'Show sector-specific application scenarios',
      'Strengthen trust for a B2B decision process',
    ],
    solutionBody:
      'We built a corporate platform that presents solutions, equipment, and production capabilities in a structured way.',
    solutionBullets: [
      'Clear architecture of core activity directions',
      'Dedicated pages for equipment and systems',
      'Industry-oriented use-case sections',
      'Lead and consultation forms for B2B inquiries',
    ],
    cmsHeading: 'Admin panel for managing *B2B engineering content*',
    cmsBody:
      'The CO2LAB team can independently update technical pages, solution descriptions, and partner-facing content.',
    cmsBullets: [
      'Update technical and service pages',
      'Edit solution and process descriptions',
      'Manage consultation and request flows',
    ],
    outcomeBody:
      'CO2LAB received a partner-acquisition platform: the site converts complex engineering topics into a clear commercial proposition.',
  },
  {
    id: 'caseStudy.clarion-solutions',
    title: 'Clarion Solutions',
    heading: 'Clarion Solutions - website for *AI automation and local SEO services*',
    subheading:
      'A corporate website that explains AI and SEO services in practical terms, includes an interactive demo, and drives business consultations.',
    metricsLine: '4 service packages · 1 interactive AI demo · 5+ service directions · 1 inquiry-generation structure',
    seoTitle: 'Clarion Solutions - case study | Code-Site.Art',
    seoDescription: 'AI automation and Local SEO website with demo-led conversion architecture.',
    metricLabels: ['service packages', 'interactive AI demo', 'directions: SEO, AI, CRM, web, media', 'lead-generation structure'],
    challengeBody:
      'For an AI agency, a service list is not enough. Business clients need real examples, practical outcomes, and a clear path to implementation.',
    challengeBullets: [
      'Explain AI automation and Local SEO clearly',
      'Show applied business scenarios',
      'Unify service directions into one system',
      'Guide users to audit and consultation actions',
    ],
    solutionBody:
      'We built a corporate site focused on service clarity, interactive automation demo, package presentation, and inquiry conversion.',
    solutionBullets: [
      'Structured service map: SEO, AI, CRM, web, media',
      'Interactive AI demo block with practical scenario',
      'Transparent package and process presentation',
      'Blog for SEO, AI, and local business growth topics',
    ],
    cmsHeading: 'Admin panel for managing *services and demo content*',
    cmsBody:
      'Clarion Solutions can independently update service pages, blog content, and key conversion sections.',
    cmsBullets: [
      'Update service packages and offers',
      'Publish and edit blog materials',
      'Manage CTA and lead-form content',
    ],
    outcomeBody:
      'Clarion Solutions received a client-acquisition platform for AI and SEO services with clearer value communication and stronger consultation flow.',
  },
  {
    id: 'caseStudy.boulevard-salon',
    title: 'Boulevard Salon',
    heading: 'Boulevard Salon - beauty salon website with *online procedure booking*',
    subheading:
      'A service-driven website that helps clients navigate categories quickly and move straight to online booking.',
    metricsLine: '10+ beauty categories · 1 online booking flow · 5+ key sections · 1 client-acquisition structure',
    seoTitle: 'Boulevard Salon - case study | Code-Site.Art',
    seoDescription: 'Beauty website focused on structured services and frictionless booking.',
    metricLabels: ['beauty service categories', 'online procedure booking', 'key sections', 'client-acquisition structure'],
    challengeBody:
      'For a beauty salon, showing a long list of procedures is not enough. The user must quickly find the right category and book without friction.',
    challengeBullets: [
      'Structure beauty services into clear categories',
      'Build intuitive navigation and booking flow',
      'Increase trust through modern presentation',
      'Reduce steps from interest to appointment',
    ],
    solutionBody:
      'We built a website focused on service categorization, booking integration, and fast transition from service discovery to reservation.',
    solutionBullets: [
      'Homepage structured around core service directions',
      'Integrated online booking system',
      'Multiple CTA points for fast appointment booking',
      'CMS for updating services and salon content',
    ],
    cmsHeading: 'Admin panel for managing *salon services*',
    cmsBody:
      'The salon team can independently update procedures, service descriptions, and conversion blocks tied to booking.',
    cmsBullets: [
      'Maintain categories and procedure descriptions',
      'Update core content sections',
      'Keep booking-oriented CTA blocks current',
    ],
    outcomeBody:
      'Boulevard Salon received a practical acquisition tool: the site turns a broad service catalog into a clear journey toward online booking.',
  },
  {
    id: 'caseStudy.aleko-course',
    title: 'Aleko Course',
    heading: 'Aleko Course - website for selling an online course on *viral content creation*',
    subheading:
      'A sales-focused landing page that presents the course through creator brand, program structure, outcomes, reviews, and pricing tiers.',
    metricsLine: '12 learning modules · 48 lessons in extended tier · 3 pricing tiers · 1 conversion-focused structure',
    seoTitle: 'Aleko Course - case study | Code-Site.Art',
    seoDescription: 'Educational-product landing page designed for creator-led conversion.',
    metricLabels: ['learning modules', 'lessons in extended tier', 'pricing tiers', 'online-product sales structure'],
    challengeBody:
      'For an online course, showing a syllabus is not enough. The user needs clear value, creator credibility, social proof, and a direct reason to buy now.',
    challengeBullets: [
      'Sell through creator trust and results',
      'Present training structure without overload',
      'Strengthen social proof with testimonials',
      'Implement multiple tiered package options',
    ],
    solutionBody:
      'We built a landing page that guides the user from creator introduction to program understanding, tier comparison, and purchase.',
    solutionBullets: [
      'Hero focused on core promise and strong CTA',
      'Program architecture with 12 modules',
      'Creator-results section and student reviews',
      'Tiered pricing blocks with clear comparison',
    ],
    cmsHeading: 'Admin panel for updating *program and pricing tiers*',
    cmsBody:
      'The team can independently update modules, offer conditions, and campaign blocks while preserving landing-page conversion logic.',
    cmsBullets: [
      'Update learning program structure',
      'Manage tiers and commercial offers',
      'Edit testimonials and CTA blocks',
    ],
    outcomeBody:
      'Aleko Course received a full educational-sales tool: the site converts audience interest into purchases and new course enrollments.',
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

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })

  for (const spec of SPECS) {
    const patch: Record<string, unknown> = {
      'title.en': spec.title,
      'region.en': 'Ukraine',
      'duration.en': '6 weeks',
      'metricsLine.en': spec.metricsLine,
      'seo.title.en': spec.seoTitle,
      'seo.description.en': spec.seoDescription,
      'hero.eyebrow.en': '/ CASE STUDY',
      'hero.heading.en': spec.heading,
      'hero.subheading.en': spec.subheading,
      'hero.metrics[_key=="hm1"].label.en': spec.metricLabels[0],
      'hero.metrics[_key=="hm2"].label.en': spec.metricLabels[1],
      'hero.metrics[_key=="hm3"].label.en': spec.metricLabels[2],
      'hero.metrics[_key=="hm4"].label.en': spec.metricLabels[3],
      'sections[_key=="sec6"].eyebrow.en': '/ CHALLENGE',
      'sections[_key=="sec6"].heading.en': 'What *was*',
      'sections[_key=="sec6"].bodyEn': [
        {
          _type: 'block',
          _key: 'ben-sec6',
          style: 'normal',
          markDefs: [],
          children: [{_type: 'span', _key: 'sen-sec6', text: spec.challengeBody, marks: []}],
        },
      ],
      'sections[_key=="sec6"].bulletList[0].en': spec.challengeBullets[0],
      'sections[_key=="sec6"].bulletList[1].en': spec.challengeBullets[1],
      'sections[_key=="sec6"].bulletList[2].en': spec.challengeBullets[2],
      'sections[_key=="sec6"].bulletList[3].en': spec.challengeBullets[3],
      'sections[_key=="sec9"].eyebrow.en': '/ SOLUTION',
      'sections[_key=="sec9"].heading.en': 'What we *did*',
      'sections[_key=="sec9"].bodyEn': [
        {
          _type: 'block',
          _key: 'ben-sec9',
          style: 'normal',
          markDefs: [],
          children: [{_type: 'span', _key: 'sen-sec9', text: spec.solutionBody, marks: []}],
        },
      ],
      'sections[_key=="sec9"].bulletList[0].en': spec.solutionBullets[0],
      'sections[_key=="sec9"].bulletList[1].en': spec.solutionBullets[1],
      'sections[_key=="sec9"].bulletList[2].en': spec.solutionBullets[2],
      'sections[_key=="sec9"].bulletList[3].en': spec.solutionBullets[3],
      'sections[_key=="fd187ec9f59b"].eyebrow.en': '/ CMS',
      'sections[_key=="fd187ec9f59b"].heading.en': spec.cmsHeading,
      'sections[_key=="fd187ec9f59b"].bodyEn': [
        {
          _type: 'block',
          _key: 'ben-cms',
          style: 'normal',
          markDefs: [],
          children: [{_type: 'span', _key: 'sen-cms', text: spec.cmsBody, marks: []}],
        },
      ],
      'sections[_key=="fd187ec9f59b"].bulletList[0].en': spec.cmsBullets[0],
      'sections[_key=="fd187ec9f59b"].bulletList[1].en': spec.cmsBullets[1],
      'sections[_key=="fd187ec9f59b"].bulletList[2].en': spec.cmsBullets[2],
      'sections[_key=="sech"].eyebrow.en': '/ OUTCOME',
      'sections[_key=="sech"].heading.en': 'Result',
      'sections[_key=="sech"].bodyEn': [
        {
          _type: 'block',
          _key: 'ben-out',
          style: 'normal',
          markDefs: [],
          children: [{_type: 'span', _key: 'sen-out', text: spec.outcomeBody, marks: []}],
        },
      ],
    }

    await client.patch(spec.id).set(patch).commit()
    console.log(`✓ ${spec.id} translated`)
  }
}

main().catch((err) => {
  console.error('✗ Translation patch failed:', err)
  process.exit(1)
})

