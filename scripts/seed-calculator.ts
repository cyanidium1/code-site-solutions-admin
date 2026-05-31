/**
 * Seed all calculator data: project types, options (every group), presets,
 * and the settings singleton. Mirrors the legacy constants verbatim so the
 * first CMS render matches the constants render byte-for-byte.
 *
 * Run:  npm run seed:calculator
 */
import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {createClient} from '@sanity/client'

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (process.env[k] === undefined) process.env[k] = v
  }
}
loadEnvFile('.env.local')
loadEnvFile('.env')

type L = {uk?: string; en?: string}
const bi = (uk: string, en: string): L => ({uk, en})

const PROJECT_TYPES = [
  {
    _id: 'calculatorProjectType.landing',
    _type: 'calculatorProjectType',
    projectKey: 'landing',
    label: bi('Лендінг', 'Landing page'),
    hint: bi('Найкраще для одного офера, послуги, події, MVP, або фокусованої лідогенерації.',
            'Best for one offer, service, event, MVP, or focused lead generation.'),
    basePrice: 1500,
    pages: {min: 5, max: 16, defaultValue: 7, included: 7, extraPrice: 150},
    order: 0,
  },
  {
    _id: 'calculatorProjectType.multiPage',
    _type: 'calculatorProjectType',
    projectKey: 'multiPage',
    label: bi('Багатосторінковий сайт', 'Multi-page website'),
    hint: bi('Для компаній, яким потрібні сторінки послуг, про нас, кейси, блог, SEO.',
            'Best for companies that need service pages, about page, cases, blog, SEO structure.'),
    basePrice: 3500,
    pages: {min: 3, max: 30, defaultValue: 5, included: 5, extraPrice: 220},
    order: 10,
  },
  {
    _id: 'calculatorProjectType.ecommerce',
    _type: 'calculatorProjectType',
    projectKey: 'ecommerce',
    label: bi('E-commerce', 'E-commerce'),
    hint: bi('Для каталогу товарів, кошика, чекауту, фільтрів та керування продуктами з адмінки.',
            'Best for product catalog, cart, checkout flow, product pages, filters, and admin-managed products.'),
    basePrice: 6000,
    pages: {min: 3, max: 30, defaultValue: 5, included: 5, extraPrice: 180},
    order: 20,
  },
] as const

const OPTIONS = [
  // productComplexity
  {groupKey: 'productComplexity', optionKey: 'simple', label: bi('Малий магазин (до ~50 товарів)', 'Small store (up to ~50 products)'),
   hint: bi('Базовий каталог і стандартні сторінки товарів.', 'Basic catalog and standard product pages to start sales quickly.'), price: 0, order: 0},
  {groupKey: 'productComplexity', optionKey: 'medium', label: bi('Зростаючий магазин (50-500 товарів)', 'Growing store (50-500 products)'),
   hint: bi('Фільтри, категорії, міцніша структура.', 'Filters, categories, and stronger structure for scaling campaigns.'), price: 700, order: 10},
  {groupKey: 'productComplexity', optionKey: 'advanced', label: bi('Просунутий магазин', 'Advanced store'),
   hint: bi('Складна логіка каталогу та просунутий UX.', 'Complex catalog logic, custom flows, and advanced UX for conversion growth.'), price: 1400, order: 20},
  // design
  {groupKey: 'design', optionKey: 'simple', label: bi('Просте / чисте', 'Simple / clean'),
   hint: bi('Мінімалістичний дизайн, фокус на швидкості.', 'Minimal design focused on clarity and speed.'), percent: 0, order: 0,
   previews: [
     {src: '/calculator/design/preview-1.svg', caption: bi('Чистий hero та чіткий CTA.', 'Clean hero and clear CTA-focused layout.')},
     {src: '/calculator/design/preview-2.svg', caption: bi('Легкі секції під швидкість.', 'Lightweight sections focused on speed and readability.')},
     {src: '/calculator/design/preview-3.svg', caption: bi('Прості блоки під довіру.', 'Simple blocks designed for fast launch and trust.')},
   ]},
  {groupKey: 'design', optionKey: 'custom', label: bi('Брендовий', 'Custom branded'),
   hint: bi('Брендована верстка з сильнішою візуальною ідентичністю.', 'Branded layout with stronger visual identity.'), percent: 0.2, order: 10,
   previews: [
     {src: '/calculator/design/preview-1.svg', caption: bi('Брендовий стиль з кастомним ритмом секцій.', 'Stronger branded style with custom section rhythm.')},
     {src: '/calculator/design/preview-2.svg', caption: bi('Відмінна візуальна ідентичність.', 'Distinctive visual identity across core pages.')},
     {src: '/calculator/design/preview-3.svg', caption: bi('Брендові деталі під конверсію.', 'Branded UI details tuned for conversion.')},
   ]},
  {groupKey: 'design', optionKey: 'advanced', label: bi('Преміум', 'Advanced / premium'),
   hint: bi('Складні розкладки, анімації, преміум UI.', 'Complex layouts, animations, and premium UI interactions.'), percent: 0.4, order: 20,
   previews: [
     {src: '/calculator/design/preview-1.svg', caption: bi('Преміум editorial layout.', 'Premium editorial layout with advanced storytelling.')},
     {src: '/calculator/design/preview-2.svg', caption: bi('Преміум взаємодії.', 'High-end interactions and custom content modules.')},
     {src: '/calculator/design/preview-3.svg', caption: bi('Досвід під конкурентні ринки.', 'Complex experience built for competitive markets.')},
   ]},
  // language
  {groupKey: 'language', optionKey: 'one', label: bi('Одна мова', 'One language'), percent: 0, order: 0},
  {groupKey: 'language', optionKey: 'two', label: bi('Дві мови', 'Two languages'), percent: 0.15, order: 10},
  {groupKey: 'language', optionKey: 'three', label: bi('Три мови', 'Three languages'), percent: 0.25, order: 20},
  {groupKey: 'language', optionKey: 'fourPlus', label: bi('Чотири+', 'Four+ languages'), percent: 0.35, order: 30},
  // cms upgrades
  {groupKey: 'cms', optionKey: 'sanitySetup', label: bi('Налаштування CMS', 'CMS setup'), hint: bi('Включено у всі пакети.', 'Included in all packages.'), price: 0, included: true, order: 0},
  {groupKey: 'cms', optionKey: 'mobileAdmin', label: bi('Мобільна адмінка', 'Mobile-friendly admin'), hint: bi('Включено у всі пакети.', 'Included in all packages.'), price: 0, included: true, order: 10},
  {groupKey: 'cms', optionKey: 'advancedBuilder', label: bi('Просунутий page builder', 'Advanced page builder'),
   hint: bi('Керування секціями, лендингами, SEO-сторінками без розробника.', 'Manage reusable sections, landing pages, SEO pages, and content blocks without developer changes.'), price: 1200, order: 20},
  {groupKey: 'cms', optionKey: 'blogSystem', label: bi('Блог/новини', 'Blog/news system'),
   hint: bi('Пости, категорії, SEO-поля, обкладинки.', 'Admin-managed posts, categories, SEO fields, cover images.'), price: 400, order: 30},
  {groupKey: 'cms', optionKey: 'caseSystem', label: bi('Кейси/портфоліо', 'Case studies/portfolio system'), price: 350, order: 40},
  {groupKey: 'cms', optionKey: 'teamServices', label: bi('Команда/послуги', 'Team/services dynamic sections'), price: 300, order: 50},
  // seo
  {groupKey: 'seo', optionKey: 'basicSeo', label: bi('Базове технічне SEO', 'Basic technical SEO'),
   hint: bi('Мета, заголовки, sitemap-структура.', 'Metadata, semantic headings, sitemap-ready structure included.'), price: 0, included: true, order: 0},
  {groupKey: 'seo', optionKey: 'advancedLandingSeo', label: bi('Просунута SEO-архітектура лендингів', 'Advanced SEO landing architecture'),
   hint: bi('Для масштабованих сторінок за послугами/містами/мовами.', 'For scalable pages by service, city, language, category, or niche.'), price: 1200, order: 10},
  {groupKey: 'seo', optionKey: 'blogSeoSetup', label: bi('SEO-налаштування блогу', 'Blog SEO setup'), price: 400, order: 20},
  {groupKey: 'seo', optionKey: 'programmaticSeo', label: bi('Програматичне SEO', 'Programmatic SEO structure'),
   hint: bi('Багато структурованих сторінок з CMS-даних.', 'For many structured landing pages generated from CMS data.'), price: 2500, order: 30},
  // features
  {groupKey: 'feature', optionKey: 'contactForm', label: bi('Контактна форма', 'Contact form'), price: 0, included: true, featureGroup: 'leadCapture', order: 0},
  {groupKey: 'feature', optionKey: 'leadForm', label: bi('Лід-форма з кастомними полями', 'Lead form with custom fields'),
   hint: bi('Збір кваліфікованих лідів.', 'Collect qualified leads with the right questions.'), price: 250, featureGroup: 'leadCapture', order: 10},
  {groupKey: 'feature', optionKey: 'email', label: bi('Email-сповіщення', 'Email notifications'),
   hint: bi('Нові заявки одразу в інбокс.', 'Get new enquiries sent directly to your inbox.'), price: 150, featureGroup: 'leadCapture', order: 20},
  {groupKey: 'feature', optionKey: 'telegram', label: bi('Telegram-сповіщення', 'Telegram notifications'),
   hint: bi('Заявки миттєво в Telegram.', 'Receive new leads instantly in Telegram.'), price: 150, featureGroup: 'leadCapture', order: 30},
  {groupKey: 'feature', optionKey: 'crm', label: bi('CRM-інтеграція', 'CRM integration'),
   hint: bi('Ліди автоматично у вашу воронку.', 'Push leads automatically into your sales pipeline.'), price: 500, featureGroup: 'leadCapture', order: 40},
  {groupKey: 'feature', optionKey: 'analytics', label: bi('Аналітика/події', 'Analytics/events setup'),
   hint: bi('Відстеження ключових дій.', 'Track key actions and improve conversion over time.'), price: 500, featureGroup: 'conversion', order: 0},
  {groupKey: 'feature', optionKey: 'adsTracking', label: bi('Meta Pixel / Google Ads', 'Meta Pixel / Google Ads conversion tracking'),
   hint: bi('ROI кампаній з конверсіями.', 'Measure campaign ROI with conversion events.'), price: 500, featureGroup: 'conversion', order: 10},
  {groupKey: 'feature', optionKey: 'reviews', label: bi('Відгуки/testimonials', 'Reviews/testimonials module'),
   hint: bi('Соціальний доказ.', 'Show social proof where users make decisions.'), price: 250, featureGroup: 'conversion', order: 20},
  {groupKey: 'feature', optionKey: 'faqSchema', label: bi('FAQ зі схемами', 'FAQ module with schema markup'),
   hint: bi('Заперечення + видимість у пошуку.', 'Answer objections and improve search visibility.'), price: 250, featureGroup: 'conversion', order: 30},
  {groupKey: 'feature', optionKey: 'payments', label: bi('Платежі', 'Payment integration'),
   hint: bi('Онлайн-оплати без ручного fall-up.', 'Accept payments online without manual follow-ups.'), price: 900, featureGroup: 'advancedUx', order: 0},
  {groupKey: 'feature', optionKey: 'booking', label: bi('Календар/booking', 'Booking/calendar integration'),
   hint: bi('Клієнти бронюють слоти самі.', 'Let customers pick time slots and book faster.'), price: 600, featureGroup: 'advancedUx', order: 10},
  {groupKey: 'feature', optionKey: 'accounts', label: bi('Акаунти/автентифікація', 'User accounts/auth'),
   hint: bi('Особистий кабінет.', 'Give users a personal area for repeat actions.'), price: 1200, featureGroup: 'advancedUx', order: 20},
  {groupKey: 'feature', optionKey: 'uploads', label: bi('Завантаження файлів', 'File upload forms'),
   hint: bi('Брифи, документи, медіа.', 'Allow clients to send briefs, docs, or media files.'), price: 500, featureGroup: 'advancedUx', order: 30},
  {groupKey: 'feature', optionKey: 'search', label: bi('Фільтри/пошук', 'Advanced filters/search'),
   hint: bi('Швидший пошук товарів/послуг.', 'Help visitors find products or services faster.'), price: 1000, featureGroup: 'advancedUx', order: 40},
  {groupKey: 'feature', optionKey: 'mapBasic', label: bi('Базова карта', 'Basic map'),
   hint: bi('Просте відображення локації.', 'Simple location display for office or store.'), price: 150, featureGroup: 'advancedUx', order: 50},
  {groupKey: 'feature', optionKey: 'mapInteractive', label: bi('Інтерактивна карта', 'Interactive map'),
   hint: bi('Маркери, фільтри, складніший UX.', 'Custom markers, filters, and advanced UX.'), price: 600, featureGroup: 'advancedUx', order: 60},
  {groupKey: 'feature', optionKey: 'cookie', label: bi('Cookie-банер', 'Cookie banner/basic consent'),
   hint: bi('Базові вимоги до згоди.', 'Cover basic consent requirements from launch day.'), price: 250, featureGroup: 'advancedUx', order: 70},
  // content
  {groupKey: 'content', optionKey: 'clientProvided', label: bi('Клієнт надає весь текст', 'Client provides all text'), price: 0, order: 0},
  {groupKey: 'content', optionKey: 'lightPolishing', label: bi('Легка коректура', 'Light copy polishing'), price: 300, order: 10},
  {groupKey: 'content', optionKey: 'fullCopywriting', label: bi('Повний копірайтинг ядра', 'Full copywriting for core pages'), price: 1500, order: 20},
  {groupKey: 'content', optionKey: 'seoCopywriting', label: bi('SEO-копірайтинг', 'SEO copywriting package'), price: 2000, order: 30},
  // timeline
  {groupKey: 'timeline', optionKey: 'standard', label: bi('Стандартний термін', 'Standard timeline'),
   hint: bi('Звичайний графік.', 'Regular delivery schedule.'), percent: 0, order: 0},
  {groupKey: 'timeline', optionKey: 'faster', label: bi('Швидше', 'Faster delivery'),
   hint: bi('Більше паралельних потужностей.', 'We allocate more parallel capacity to launch sooner.'), percent: 0.2, order: 10},
  {groupKey: 'timeline', optionKey: 'urgent', label: bi('Терміновий', 'Urgent launch'),
   hint: bi('Пріоритетне виконання з координацією.', 'Priority execution with increased team load and coordination.'), percent: 0.35, order: 20},
  // maintenance
  {groupKey: 'maintenance', optionKey: 'none', label: bi('Без підтримки', 'No maintenance'), monthlyPrice: 0, order: 0},
  {groupKey: 'maintenance', optionKey: 'basic', label: bi('Базова підтримка', 'Basic care'), monthlyPrice: 150, order: 10},
  {groupKey: 'maintenance', optionKey: 'growth', label: bi('Підтримка зростання', 'Growth support'), monthlyPrice: 400, order: 20},
  {groupKey: 'maintenance', optionKey: 'dedicated', label: bi('Виділений план', 'Dedicated improvement plan'), monthlyPrice: 800, order: 30},
  // seoGrowth
  {groupKey: 'seoGrowth', optionKey: 'none', label: bi('Без SEO / Growth', 'No SEO / Growth'),
   bestFor: bi('Без щомісячної SEO-підтримки.', 'No ongoing SEO or content support.'),
   includes: [bi('Без щомісячної SEO-роботи', 'No monthly SEO work')],
   monthlyPrice: 0, order: 0},
  {groupKey: 'seoGrowth', optionKey: 'basicSeo', label: bi('Базове SEO', 'Basic SEO'),
   bestFor: bi('Невеликі сайти, які починають органічне зростання.', 'Small websites starting organic visibility.'),
   includes: [
     bi('1-2 пости на місяць', '1-2 blog posts/month'),
     bi('Базовий keyword targeting', 'Basic keyword targeting'),
     bi('On-page SEO апдейти', 'On-page SEO updates'),
     bi('Щомісячний звіт', 'Monthly report'),
   ], monthlyPrice: 300, order: 10},
  {groupKey: 'seoGrowth', optionKey: 'growthSeo', label: bi('Growth SEO', 'Growth SEO'),
   bestFor: bi('Сервісний бізнес, який хоче стабільний трафік.', 'Service businesses that want consistent traffic growth.'),
   includes: [
     bi('4 пости на місяць', '4 blog posts/month'),
     bi('SEO-лендинги', 'SEO landing pages'),
     bi('Keyword research', 'Keyword research'),
     bi('Внутрішня перелінковка', 'Internal linking'),
     bi('Analytics', 'Analytics tracking'),
     bi('Щомісячні стратегічні апдейти', 'Monthly strategy updates'),
   ], badge: bi('Рекомендовано', 'Recommended'), monthlyPrice: 700, order: 20},
  {groupKey: 'seoGrowth', optionKey: 'contentEngine', label: bi('Content Engine', 'Content Engine'),
   bestFor: bi('SEO як серйозний канал acquisition.', 'Businesses that use SEO as a serious acquisition channel.'),
   includes: [
     bi('8+ статей на місяць', '8+ articles/month'),
     bi('Розширення лендингів', 'Landing page expansion'),
     bi('Програматичне SEO', 'Programmatic SEO planning'),
     bi('CRO ідеї', 'CRO ideas'),
     bi('Analytics review', 'Analytics review'),
     bi('Growth roadmap', 'Growth roadmap'),
   ], monthlyPrice: 1500, priceLabel: '$1,200-$1,500 /mo', order: 30},
] as const

const PRESETS = [
  {
    _id: 'calculatorPreset.starterLanding',
    _type: 'calculatorPreset',
    presetKey: 'starterLanding',
    title: bi('Стартовий лендінг', 'Starter Landing'),
    badge: bi('Швидкий запуск', 'Fast launch'),
    bestFor: bi('Кампанії, MVP, одиничні оферти.', 'Campaigns, MVPs, one-service offers.'),
    includes: [
      bi('Лендінг', 'Landing page'),
      bi('6-8 секцій', '6-8 sections'),
      bi('Одна мова', 'One language'),
      bi('Простий дизайн', 'Simple / clean design'),
      bi('Контактна форма', 'Contact form'),
      bi('Базове технічне SEO', 'Basic technical SEO'),
    ],
    estimatedRange: bi('$1,500 - $2,500', '$1,500 - $2,500'),
    compareAnchor: bi(
      'Порівняй: Tilda + плагіни ≈ $600/рік + конфіг. Через 3 роки дорожче — і ти не володієш кодом.',
      "Compare to: Tilda + premium plugins ≈ $600/year + ongoing config. After 3 years, costs more — and you don't own the code.",
    ),
    appliedInput: {
      projectType: 'landing', pages: 7, productComplexity: 'simple',
      designComplexity: 'simple', languages: 'one',
      cmsUpgradeIds: [], seoOptionIds: [], featureIds: [],
      contentOption: 'clientProvided', timeline: 'standard',
      maintenancePlan: 'none', seoGrowthPlan: 'none',
    },
    order: 0,
  },
  {
    _id: 'calculatorPreset.growthWebsite',
    _type: 'calculatorPreset',
    presetKey: 'growthWebsite',
    title: bi('Growth Website', 'Growth Website'),
    badge: bi('Рекомендовано', 'Recommended'),
    bestFor: bi(
      'Сервісний бізнес, якому треба довіра, SEO та ліди.',
      'Service businesses that need trust, SEO, and lead generation.',
    ),
    includes: [
      bi('Багатосторінковий', 'Multi-page website'),
      bi('5-8 сторінок', '5-8 pages'),
      bi('Дві мови', 'Two languages'),
      bi('Брендовий дизайн', 'Custom branded design'),
      bi('CMS', 'CMS'),
      bi('Базове SEO', 'Basic SEO'),
      bi('Лід-форма', 'Lead form'),
      bi('Analytics', 'Analytics/events setup'),
    ],
    estimatedRange: bi('$4,500 - $7,000', '$4,500 - $7,000'),
    compareAnchor: bi(
      'Порівняй: UA WordPress-агенція = $7,000–12,000 + $2,000+/рік підтримки.',
      'Compare to: a UA WordPress agency = $7,000–12,000 + $2,000+/year support.',
    ),
    appliedInput: {
      projectType: 'multiPage', pages: 6, productComplexity: 'simple',
      designComplexity: 'custom', languages: 'two',
      cmsUpgradeIds: [], seoOptionIds: [],
      featureIds: ['leadForm', 'analytics'],
      contentOption: 'clientProvided', timeline: 'standard',
      maintenancePlan: 'none', seoGrowthPlan: 'none',
    },
    order: 10,
  },
  {
    _id: 'calculatorPreset.ecommerceStarter',
    _type: 'calculatorPreset',
    presetKey: 'ecommerceStarter',
    title: bi('E-commerce Starter', 'E-commerce Starter'),
    badge: bi('Масштабований магазин', 'Scalable store'),
    bestFor: bi(
      'Бізнес із товарами: каталог, чекаут, структура зростання.',
      'Product businesses that need catalog, checkout, and growth structure.',
    ),
    includes: [
      bi('E-commerce', 'E-commerce'),
      bi('Структура малого/зростаючого магазину', 'Small or growing store structure'),
      bi('Сторінки товарів', 'Product pages'),
      bi('Базові фільтри/пошук', 'Basic filters/search'),
      bi('Платежі', 'Payment integration'),
      bi('Analytics', 'Analytics/events setup'),
      bi('CMS', 'CMS'),
    ],
    estimatedRange: bi('$7,000 - $10,000', '$7,000 - $10,000'),
    compareAnchor: bi(
      'Порівняй: Shopify Plus від $2,000/міс. Кастомний код — без підписки.',
      'Compare to: Shopify Plus starts at $2,000/month. Custom code — no monthly subscription.',
    ),
    appliedInput: {
      projectType: 'ecommerce', pages: 5, productComplexity: 'medium',
      designComplexity: 'custom', languages: 'one',
      cmsUpgradeIds: [], seoOptionIds: [],
      featureIds: ['search', 'payments', 'analytics'],
      contentOption: 'clientProvided', timeline: 'standard',
      maintenancePlan: 'none', seoGrowthPlan: 'none',
    },
    order: 20,
  },
]

const SETTINGS_DOC = {
  _id: 'calculatorSettings',
  _type: 'calculatorSettings',
  defaultProjectType: 'multiPage',
  roundStep: 50,
  highEstimateFactor: 1.25,
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01'
  const token = process.env.SANITY_API_TOKEN
  if (!projectId) {console.error('✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1)}
  if (!token) {console.error('✗ Missing SANITY_API_TOKEN'); process.exit(1)}

  const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})

  const docs: Array<Record<string, unknown> & {_id: string; _type: string}> = []

  for (const pt of PROJECT_TYPES) docs.push(pt as unknown as typeof docs[number])
  for (const o of OPTIONS) {
    docs.push({
      _id: `calculatorOption.${o.groupKey}.${o.optionKey}`,
      _type: 'calculatorOption',
      ...o,
    } as typeof docs[number])
  }
  for (const p of PRESETS) docs.push(p as unknown as typeof docs[number])
  docs.push(SETTINGS_DOC as typeof docs[number])

  console.log(`→ Seeding ${docs.length} calculator docs into ${projectId}/${dataset}`)
  for (const doc of docs) {
    try {
      const r = await client.createOrReplace(doc as never)
      console.log(`  ✓ ${r._id}`)
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
