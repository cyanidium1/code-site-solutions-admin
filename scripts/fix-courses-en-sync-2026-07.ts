/**
 * Job #86 (2026-07-20): full courses industryPage EN sync to Ukrainian (en-GB).
 *
 * Also fixes corrupted caseBlock.before.items[0..3].uk (they duplicated after-copy).
 * Skips comparison/FAQ (already aligned in job #85).
 *
 * Dry-run:
 *   npx sanity exec scripts/fix-courses-en-sync-2026-07.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/fix-courses-en-sync-2026-07.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const DOC_ID = 'DHIwRDN3sEoI638qoYRvTT'
const R = 'sections[_key=="cou-sec-7"]'
const CASE = 'sections[_key=="cou-sec-35"]'
const OUT = 'sections[_key=="cou-sec-43"]'
const SVC = 'sections[_key=="cou-sec-47"]'
const AUD = 'sections[_key=="cou-sec-97"]'

function pt(keyBase: string, parts: Array<{text: string; em?: boolean}>) {
  return [
    {
      _type: 'block' as const,
      _key: `${keyBase}b`,
      style: 'normal' as const,
      markDefs: [] as [],
      children: parts.map((p, i) => ({
        _type: 'span' as const,
        _key: `${keyBase}s${i}`,
        text: p.text,
        marks: p.em ? (['em'] as string[]) : ([] as string[]),
      })),
    },
  ]
}

const SET: Record<string, unknown> = {
  // ---------- title / SEO ----------
  'title.en': 'Websites for online courses and bloggers',
  'seo.title.en': 'ᐈ Websites for online courses and learning platforms | Code-Site.Art',
  'seo.description.en':
    '➤ Custom websites for online courses, coaching and education projects ✔️ Stripe payment integration ✔️ Course access control ✔️ Mobile-first ✔️ Fixed price ➡ Book a free strategy call.',

  // ---------- hero ----------
  'hero.eyebrow.en': 'WEBSITES FOR COURSES AND LANDINGS',
  'hero.heading.en': 'A COURSE SITE — FROM PRESENTING THE PROGRAMME TO PAYMENT AND ACCESS',
  'hero.lede.en':
    'We build landings for online courses, experts and education products. We shape the offer, structure and user path, connect payment and automatic access delivery — so you can sell the course without handling every enquiry by hand.',
  'hero.features[_key=="FgFZzy882mp21voM3Njlly"].en':
    'Selling structure | From audience pain to choosing a tier',
  'hero.features[_key=="FgFZzy882mp21voM3Njlpk"].en':
    'Online payment | WayForPay · Stripe · LiqPay',
  'hero.features[_key=="FgFZzy882mp21voM3NjltW"].en':
    'Automation | Access via a Telegram bot',
  'hero.features[_key=="FgFZzy882mp21voM3NjlxI"].en':
    'Analytics | Tracking enquiries, payments and ad traffic',
  'hero.ctaPrimary.en': 'Discuss my project',
  'hero.ctaSecondary.en': 'See course case studies',
  'hero.stats[_key=="cou-st-1"].value.en': '12',
  'hero.stats[_key=="cou-st-1"].label.en': 'modules\nin the programme',
  'hero.stats[_key=="cou-st-2"].value.en': '48',
  'hero.stats[_key=="cou-st-2"].label.en': 'video\nlessons',
  'hero.stats[_key=="cou-st-3"].value.en': '3',
  'hero.stats[_key=="cou-st-3"].label.en': 'tiers with\nonline payment',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3Njl2g"].en': 'Online courses',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3Njl6S"].en': 'Info products',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjlAE"].en': 'Bloggers',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjlE0"].en': 'Coaches',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjlHm"].en': 'Psychologists',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjlLY"].en': 'Fitness trainers',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjlPK"].en': 'Mentorship programmes',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjlT6"].en': 'Masterclasses',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjlWs"].en': 'Webinars',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3Njlae"].en': 'Workshops',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjleQ"].en': 'Leadership programmes',
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NjliC"].en': 'Subscription models',

  // ---------- reasons ----------
  [`${R}.eyebrow.en`]: 'DIAGNOSIS · 3 REASONS',
  [`${R}.heading.en`]: '3 reasons your course landing\n*doesn’t sell*',
  [`${R}.metaRows[_key=="FgFZzy882mp21voM3Njf4o"].en`]:
    'review of 40+ course landings · 2024–25',
  [`${R}.footText.en`]: 'We fix *all three* in 4–8 weeks.',
  [`${R}.footCtaLabel.en`]: 'Check my landing',
  [`${R}.footCta.label.en`]: 'Check my landing',
  [`${R}.reasons[_key=="cou-r-8"].stat.label.en`]:
    'of cold traffic leaves a landing without the right structure',
  [`${R}.reasons[_key=="cou-r-8"].textEn`]: pt('cou-r8en', [
    {
      text: 'Cold ad traffic arrives for the first time — and you jump straight to "buy the course for $497." No problem, no promised result, no check that they\'re the right audience. ',
    },
    {text: '92% leave the page within 8 seconds', em: true},
    {text: '. A landing should sell, not present.'},
  ]),
  [`${R}.reasons[_key=="cou-r-17"].stat.label.en`]:
    'higher conversion on landings with concrete student cases',
  [`${R}.reasons[_key=="cou-r-17"].textEn`]: pt('cou-r17en', [
    {
      text: 'The landing has a teacher photo in the studio, Instagram stories, a promise to "change your life in 30 days." No case studies: which student, what they got, in what time. ',
    },
    {text: 'Without specific results, it\'s just words', em: true},
    {text: '. Conversion 0.3–0.8%.'},
  ]),
  [`${R}.reasons[_key=="cou-r-26"].stat.label.en`]:
    'of buyers drop off at checkout when registration is forced',
  [`${R}.reasons[_key=="cou-r-26"].textEn`]: pt('cou-r26en', [
    {
      text: 'The buyer is ready, hits "buy" — then has to register in Teachable, confirm email, set a password, and only then enter a card. ',
    },
    {text: 'Half drop off', em: true},
    {
      text: '. Checkout should be one step: enter card → pay → get access.',
    },
  ]),

  // ---------- case: fix corrupted UK before items 0–3, then EN to match UK ----------
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3Njf8a"].uk`]:
    'Лендинг — шаблон Teachable, як у тисяч інших курсів',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfCM"].uk`]:
    'Чекаут у 4 кроки через акаунт Teachable + підтвердження email',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfG8"].uk`]:
    'Жодних A/B-тестів — платний трафік йшов на один варіант лендингу',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfJu"].uk`]:
    'Конверсія холодного трафіку 0,7%, дорогі заявки',

  [`${CASE}.eyebrow.en`]: 'REAL CASE',
  [`${CASE}.heading.en`]: 'A LANDING FOR A BLOGGER COURSE WITH AN AUDIENCE OF *1.3M+*',
  [`${CASE}.lede.en`]:
    'Aleko Sokurashvili came to us to build a landing for selling his author course on viral content. We needed to present his expertise, show the programme clearly, split the offer into tiers and automate the path from choosing a course to getting access.',
  [`${CASE}.ctaText.en`]: 'Want **the same kind of result**? See how we do it.',
  [`${CASE}.meta[_key=="cou-cm-36"].strong.en`]: '2 language versions',
  [`${CASE}.meta[_key=="cou-cm-36"].text.en`]: 'Ukrainian and Russian',
  [`${CASE}.meta[_key=="cou-cm-37"].strong.en`]: '12 modules',
  [`${CASE}.meta[_key=="cou-cm-37"].text.en`]: 'a structured course programme',
  [`${CASE}.meta[_key=="cou-cm-38"].strong.en`]: '3 tiers · WayForPay',
  [`${CASE}.meta[_key=="cou-cm-38"].text.en`]: 'separate checkout for each package',
  [`${CASE}.before.tagline.en`]: "A site that doesn't sell",
  [`${CASE}.before.heading.en`]: '× Standard Teachable landing with no custom work',
  [`${CASE}.before.foot.en`]:
    "Result: CPL $24, ROAS wouldn't go positive on cold traffic.",
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3Njf8a"].en`]:
    'Landing — a Teachable template like thousands of other courses',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfCM"].en`]:
    '4-step checkout via a Teachable account + email confirmation',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfG8"].en`]:
    'No A/B tests — paid traffic ran on one landing variant',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfJu"].en`]:
    'Cold-traffic conversion 0.7%, expensive leads',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfNg"].en`]:
    'Email funnel via Mailchimp, but without clear segmentation',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfRS"].en`]:
    'Lighthouse Performance 51 (the Teachable template is heavy)',
  [`${CASE}.before.items[_key=="FgFZzy882mp21voM3NjfVE"].en`]:
    'No UTM tracking to see which ads convert',
  [`${CASE}.after.tagline.en`]: 'A site that brings in clients',
  [`${CASE}.after.heading.en`]:
    '✓ Custom landing + 1-step checkout + Teachable integration',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3NjfZ0"].en`]:
    'Custom design with a clear personal-brand presentation',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3Njfcm"].en`]:
    'Responsive build for phones, tablets and desktops',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3NjfgY"].en`]:
    'Two language versions of the site — Ukrainian and Russian',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3NjfkK"].en`]:
    'Option to watch a free lesson before buying the course',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3Njfo6"].en`]:
    'Three tiers with different content and a clear comparison',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3Njfrs"].en`]:
    'Online payment for each tier via WayForPay',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3Njfve"].en`]:
    'Automatic personal access via a Telegram bot',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3NjfzQ"].en`]:
    'Blocks on the author, learning outcomes, audience and benefits',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3Njg3C"].en`]:
    'Blocks on the author, learning outcomes, audience and benefits',
  [`${CASE}.after.items[_key=="FgFZzy882mp21voM3Njg6y"].en`]:
    'Student reviews and FAQ to handle objections before purchase',
  [`${CASE}.results[_key=="a17ab523fd10"].label.en`]: 'lead-cost improvement',
  [`${CASE}.results[_key=="aa981a7793a0"].label.en`]: 'cold traffic',
  [`${CASE}.results[_key=="ea0ab0876282"].label.en`]: 'Performance',
  [`${CASE}.results[_key=="b9f9da39c545"].label.en`]: 'checkout',
  [`${CASE}.results[_key=="b9f9da39c545"].value.en`]: 'Fast',

  // ---------- outcome ----------
  [`${OUT}.directions.title.en`]:
    'WE BUILD SITES FOR SEPARATE COURSES AND EDUCATION BRANDS',
  [`${OUT}.directions.lede.en`]:
    'To launch one course, a strong landing with payment and automatic learning access is enough. An education brand needs a product catalogue, a member area and straightforward content management. We build both formats.',
  [`${OUT}.directions.replaceLabel.en`]: 'EXPERT / BLOGGER / COURSE AUTHOR',
  [`${OUT}.directions.replaceItems[_key=="FgFZzy882mp21voM3NjgPq"].en`]:
    'A landing for one or several education products',
  [`${OUT}.directions.replaceItems[_key=="FgFZzy882mp21voM3NjgTc"].en`]:
    'Presenting the author, programme, results and tiers',
  [`${OUT}.directions.replaceItems[_key=="FgFZzy882mp21voM3NjgXO"].en`]:
    'Online payment and analytics connected',
  [`${OUT}.directions.replaceItems[_key=="FgFZzy882mp21voM3NjgbA"].en`]:
    'Automatic access via a Telegram bot or learning platform',
  [`${OUT}.directions.allowedLabel.en`]: 'ONLINE SCHOOL / EDUCATION BRAND',
  [`${OUT}.directions.allowedItems[_key=="FgFZzy882mp21voM3NjgAk"].en`]:
    'A course catalogue with categories and filters',
  [`${OUT}.directions.allowedItems[_key=="FgFZzy882mp21voM3NjgEW"].en`]:
    'Separate pages for each education product',
  [`${OUT}.directions.allowedItems[_key=="FgFZzy882mp21voM3NjgII"].en`]:
    'A member area, subscriptions and different access levels',
  [`${OUT}.directions.allowedItems[_key=="FgFZzy882mp21voM3NjgM4"].en`]:
    'An admin panel for courses, payments and users',

  [`${OUT}.benefitRows[_key=="cou-br-44"].heading.en`]: 'A THOUGHT-THROUGH LANDING STRUCTURE',
  [`${OUT}.benefitRows[_key=="cou-br-44"].items[_key=="FgFZzy882mp21voM3Njgew"].en`]:
    'A clear offer on the first screen: who the course is for and what result it delivers',
  [`${OUT}.benefitRows[_key=="cou-br-44"].items[_key=="FgFZzy882mp21voM3Njgii"].en`]:
    'Audience problems and how the training helps solve them',
  [`${OUT}.benefitRows[_key=="cou-br-44"].items[_key=="FgFZzy882mp21voM3NjgmU"].en`]:
    'Course programme, author info, benefits and reviews',
  [`${OUT}.benefitRows[_key=="cou-br-44"].items[_key=="FgFZzy882mp21voM3NjgqG"].en`]:
    'Tiers, answers to objections and a clear path to purchase',

  [`${OUT}.benefitRows[_key=="cou-br-45"].heading.en`]:
    'ONLINE PAYMENT AND AUTOMATIC COURSE ACCESS',
  [`${OUT}.benefitRows[_key=="cou-br-45"].items[_key=="FgFZzy882mp21voM3NjhCu"].en`]:
    'A separate checkout for each tier',
  [`${OUT}.benefitRows[_key=="cou-br-45"].items[_key=="FgFZzy882mp21voM3NjhGg"].en`]:
    'WayForPay, LiqPay, Stripe or another payment system',
  [`${OUT}.benefitRows[_key=="cou-br-45"].items[_key=="FgFZzy882mp21voM3NjhKS"].en`]:
    'After payment the buyer gets course access automatically',
  [`${OUT}.benefitRows[_key=="cou-br-45"].items[_key=="FgFZzy882mp21voM3NjhOE"].en`]:
    'Purchase data is stored, and the team gets a notification',

  [`${OUT}.benefitRows[_key=="cou-br-46"].heading.en`]: 'ANALYTICS AND LANDING IMPROVEMENT',
  [`${OUT}.benefitRows[_key=="cou-br-46"].items[_key=="FgFZzy882mp21voM3NjhS0"].en`]:
    'Google Analytics, Meta Pixel and UTM tags connected',
  [`${OUT}.benefitRows[_key=="cou-br-46"].items[_key=="FgFZzy882mp21voM3NjhVm"].en`]:
    'We track traffic sources, clicks, enquiries and payments',
  [`${OUT}.benefitRows[_key=="cou-br-46"].items[_key=="FgFZzy882mp21voM3NjhZY"].en`]:
    'We compare different headlines, offers and calls to action',
  [`${OUT}.benefitRows[_key=="cou-br-46"].items[_key=="FgFZzy882mp21voM3NjhdK"].en`]:
    'We help see where people leave the site and what to improve',

  // ---------- services ----------
  [`${SVC}.heading.en`]: 'WHAT WE CAN BUILD *FOR YOUR COURSE*',
  [`${SVC}.sub.en`]:
    'In one build we combine everything needed to launch and sell a course: structure, design, payment, automatic access, integrations and analytics.',
  [`${SVC}.features[_key=="cou-sf-48"].title.en`]: 'STRUCTURE AND OFFER',
  [`${SVC}.features[_key=="cou-sf-48"].items[_key=="FgFZzy882mp21voM3Njhoe"].en`]:
    'We analyse the product, audience and competitors',
  [`${SVC}.features[_key=="cou-sf-48"].items[_key=="FgFZzy882mp21voM3NjhsQ"].en`]:
    'We frame a clear course value proposition',
  [`${SVC}.features[_key=="cou-sf-48"].items[_key=="FgFZzy882mp21voM3NjhwC"].en`]:
    'We build a logical path to purchase',
  [`${SVC}.features[_key=="cou-sf-48"].items[_key=="FgFZzy882mp21voM3Njhzy"].en`]:
    'We handle objections with reviews and FAQ',
  [`${SVC}.features[_key=="cou-sf-49"].title.en`]: 'CUSTOM DESIGN',
  [`${SVC}.features[_key=="cou-sf-49"].items[_key=="FgFZzy882mp21voM3Nji3k"].en`]:
    'A look that fits a personal or education brand',
  [`${SVC}.features[_key=="cou-sf-49"].items[_key=="FgFZzy882mp21voM3Nji7W"].en`]:
    'Motion used to highlight what matters',
  [`${SVC}.features[_key=="cou-sf-49"].items[_key=="FgFZzy882mp21voM3NjiBI"].en`]:
    'Adapted for phones, tablets and desktops',
  [`${SVC}.features[_key=="cou-sf-49"].items[_key=="FgFZzy882mp21voM3NjiF4"].en`]:
    'Programme, tiers and outcomes presented clearly',
  [`${SVC}.features[_key=="cou-sf-50"].title.en`]: 'PAYMENT AND ACCESS',
  [`${SVC}.features[_key=="cou-sf-50"].items[_key=="FgFZzy882mp21voM3NjiIq"].en`]:
    'Separate payment for each tier',
  [`${SVC}.features[_key=="cou-sf-50"].items[_key=="FgFZzy882mp21voM3NjiMc"].en`]:
    'WayForPay, LiqPay, Stripe or another system',
  [`${SVC}.features[_key=="cou-sf-50"].items[_key=="FgFZzy882mp21voM3NjiQO"].en`]:
    'Successful purchases confirmed automatically',
  [`${SVC}.features[_key=="cou-sf-50"].items[_key=="FgFZzy882mp21voM3NjiUA"].en`]:
    'Access via a Telegram bot or learning platform',
  [`${SVC}.features[_key=="cou-sf-51"].title.en`]: 'INTEGRATIONS AND AUTOMATION',
  [`${SVC}.features[_key=="cou-sf-51"].items[_key=="FgFZzy882mp21voM3NjiXw"].en`]:
    'Telegram bots and email tools connected',
  [`${SVC}.features[_key=="cou-sf-51"].items[_key=="FgFZzy882mp21voM3Njibi"].en`]:
    'Site wired to CRM and learning platforms',
  [`${SVC}.features[_key=="cou-sf-51"].items[_key=="FgFZzy882mp21voM3NjifU"].en`]:
    'Enquiry and payment data sent where you need it',
  [`${SVC}.features[_key=="cou-sf-51"].items[_key=="FgFZzy882mp21voM3NjijG"].en`]:
    'Automatic alerts for the team',
  [`${SVC}.features[_key=="cou-sf-52"].title.en`]: 'A CLEAR ADMIN PANEL',
  [`${SVC}.features[_key=="cou-sf-52"].items[_key=="FgFZzy882mp21voM3Njin2"].en`]:
    'Edit texts, images and prices',
  [`${SVC}.features[_key=="cou-sf-52"].items[_key=="FgFZzy882mp21voM3Njiqo"].en`]:
    'Manage the course programme and tiers',
  [`${SVC}.features[_key=="cou-sf-52"].items[_key=="FgFZzy882mp21voM3Njiua"].en`]:
    'Update content without a developer',
  [`${SVC}.features[_key=="cou-sf-52"].items[_key=="FgFZzy882mp21voM3NjiyM"].en`]:
    'Keep enquiries and purchase data',
  [`${SVC}.features[_key=="cou-sf-53"].title.en`]: 'SALES ANALYTICS',
  [`${SVC}.features[_key=="cou-sf-53"].items[_key=="FgFZzy882mp21voM3Njj28"].en`]:
    'Google Analytics and Meta Pixel connected',
  [`${SVC}.features[_key=="cou-sf-53"].items[_key=="FgFZzy882mp21voM3Njj5u"].en`]:
    'Tracking enquiries, payments and clicks',
  [`${SVC}.features[_key=="cou-sf-53"].items[_key=="FgFZzy882mp21voM3Njj9g"].en`]:
    'Seeing which traffic sources work',
  [`${SVC}.features[_key=="cou-sf-53"].items[_key=="FgFZzy882mp21voM3NjjDS"].en`]:
    'Finding stages where people leave the site',
  [`${SVC}.integrationsHeading.en`]: 'WE CONNECT THE SITE TO THE SERVICES YOU NEED',
  [`${SVC}.integrationsSub.en`]:
    'We connect payment, a learning platform, a Telegram bot, email tools and analytics. After purchase the system records the payment, grants course access and passes the needed data to your team.',
  [`${SVC}.integrations[_key=="FgFZzy882mp21voM3Njja6"].en`]: 'LiqPay',
  [`${SVC}.integrations[_key=="FgFZzy882mp21voM3Njjds"].en`]: 'WayForPay',
  [`${SVC}.integrations[_key=="35366f002c36"].en`]: 'Telegram',
  [`${SVC}.integrations[_key=="bc84c2fc4112"].en`]: 'Brevo',
  [`${SVC}.integrations[_key=="2a5fbb16afe0"].en`]: 'Mailchimp',
  [`${SVC}.integrations[_key=="57482b1a2185"].en`]: 'Google Analytics',
  [`${SVC}.testimonialEyebrow.en`]: 'CLIENT TESTIMONIAL',
  [`${SVC}.testimonial.quote.en`]:
    'We ordered a landing — we got a machine for generating enquiries. CPL dropped 5×, ad spend turned profitable on day 5. Before that we fought this for 2 years on a standard Teachable template.',
  [`${SVC}.testimonial.authorRole.en`]:
    'Million-follower blogger, founder of Aleko Course',

  // ---------- audit ----------
  [`${AUD}.heading.en`]: 'Free audit of your course landing',
  [`${AUD}.sub.en`]:
    'Leave a link to your current landing. Within 3 working days — a detailed PDF report.',
  [`${AUD}.disclaim.en`]:
    'No obligation. Useful even if you decide to work with another vendor.',
  [`${AUD}.submitLabel.en`]: 'Get my free audit',
  [`${AUD}.inputs.namePlaceholder.en`]: 'Your name',
  [`${AUD}.inputs.contactPlaceholder.en`]: 'Email or Telegram',
  [`${AUD}.inputs.phonePlaceholder.en`]: 'Phone (optional)',
  [`${AUD}.inputs.urlPlaceholder.en`]: 'Link to your site',
  [`${AUD}.list[_key=="FgFZzy882mp21voM3Njkjo"].en`]:
    'Landing structure analysis: does it sell to cold traffic',
  [`${AUD}.list[_key=="FgFZzy882mp21voM3Njkna"].en`]:
    'Checkout analysis: 10–15 client drop-off points',
  [`${AUD}.list[_key=="FgFZzy882mp21voM3NjkrM"].en`]:
    'SEO audit + load speed (Core Web Vitals)',
  [`${AUD}.list[_key=="FgFZzy882mp21voM3Njkv8"].en`]:
    'Teachable / Thinkific integration analysis',
  [`${AUD}.list[_key=="FgFZzy882mp21voM3Njkyu"].en`]:
    'Prioritised improvement plan + rough budget',
}

async function main() {
  const doc = await client.getDocument(DOC_ID)
  if (!doc) throw new Error(`Document ${DOC_ID} not found`)

  console.log(
    `${APPLY ? 'APPLY' : 'DRY-RUN'} — ${Object.keys(SET).length} field sets on ${DOC_ID}`,
  )
  for (const [path, value] of Object.entries(SET)) {
    const preview = JSON.stringify(value)
    console.log(
      `  ${path}\n    → ${preview.length > 160 ? preview.slice(0, 160) + '…' : preview}`,
    )
  }

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with -- --apply to write.')
    return
  }

  const res = await client.patch(DOC_ID).set(SET).commit()
  console.log(`\nPatched ${res._id} (rev ${res._rev})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
