/**
 * Job #36: real-estate industry page — UA typo fixes + EN realignment.
 *
 * The UA side was rewritten on 2026-07-04; several EN fields still carry the
 * previous copy (mortgage-calculator row, landings row, services features,
 * case-block lede describing Domlivo as an "agency" instead of a platform).
 * This script:
 *   1. fixes UA typos/russisms (лідов→лідів, Италии→Італії, Фома→Форма, geo-locации, Latin "I");
 *   2. rewrites stale EN fields to match the new UA meaning (en-GB, UK-market conventions kept);
 *   3. adds missing EN alt texts on the three outcome-block images.
 *
 * Dry-run:
 *   npx sanity exec scripts/fix-realestate-en-uk-job36.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/fix-realestate-en-uk-job36.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const DOC_ID = 'lOTgaDd8FU4wgJ8F4KCHLf' // industryPage "real-estate"

const S43 = 'sections[_key=="rea-sec-43"]' // outcomeBlock
const S47 = 'sections[_key=="rea-sec-47"]' // servicesBlock

const SET: Record<string, unknown> = {
  // ---------- UA fixes ----------
  'hero.tickerItems[_key=="FgFZzy882mp21voM3NhvVo"].uk': 'Іноземна нерухомість',
  'sections[_key=="rea-sec-35"].before.foot.uk':
    'Результат: 5-10 лідів/місяць, переважно місцевих, foreign-клієнти проходять повз.',
  [`${S47}.features[_key=="rea-sf-52"].title.uk`]: 'Розподіл лідів по регіональних менеджерах',
  [`${S47}.integrationsSub.uk`]:
    'Заявка з калькулятора йде до регіонального менеджера через CRM-routing. Обʼєкт з MLS-фіду — автоматичний імпорт. Календар показу — Calendly. Платіж за резервацію — Stripe. Менеджер отримує сповіщення у Telegram або Slack. Жодних втрачених лідів через email-спам.',
  'sections[_key=="rea-sec-66"].items[_key=="rea-fq-92"].question.uk':
    'Як працює geo-routing? Що бачить клієнт з Італії?',
  'sections[_key=="rea-sec-66"].items[_key=="rea-fq-77"].answer[_key=="rea-b-79"].children[_key=="rea-s-78"].text':
    'Ставки локальних банків зберігаються в Sanity і оновлюються через API центральних банків (UA: НБУ, EU: ECB, US: Fed). Калькулятор обирає ставки за геолокацією користувача або вибраним регіоном. Можна окремо налаштувати "наші ставки" якщо ви маєте партнерство з конкретними банками.',

  // ---------- image alts (outcome rows): UA typo fixes + missing EN ----------
  [`${S43}.benefitRows[_key=="rea-br-44"].image.alt.en`]: 'Domlivo catalogue page',
  [`${S43}.benefitRows[_key=="rea-br-45"].image.alt.uk`]: 'Форма контактів Domlivo',
  [`${S43}.benefitRows[_key=="rea-br-45"].image.alt.en`]: 'Domlivo contact form',
  [`${S43}.benefitRows[_key=="rea-br-46"].image.alt.uk`]: 'Форма додавання обʼєктів у Domlivo',
  [`${S43}.benefitRows[_key=="rea-br-46"].image.alt.en`]: 'Property submission form in Domlivo',

  // ---------- hero EN ----------
  'hero.heading.en': 'A property website that *presents your listings and brings in enquiries*',
  'hero.h1NumLabel.en': 'currencies\nalongside 5 languages',
  'hero.lede.en':
    'A property catalogue, filters, a map, languages, currencies, a mortgage calculator and enquiry forms, brought together in *one system* that works for the local market and for overseas buyers.',

  // ---------- case block (Domlivo) EN ----------
  'sections[_key=="rea-sec-35"].heading.en':
    'A ready-made solution for a property platform in Albania',
  'sections[_key=="rea-sec-35"].lede.en':
    'Domlivo is a platform for buying, renting and short-letting property in Albania. The brief went beyond an agency site: bring the property catalogue, search, filters, cities, property types, enquiries and a separate agent flow together in one system.',

  // ---------- outcome row: viewing enquiries (was "Mortgage calculator") ----------
  [`${S43}.benefitRows[_key=="rea-br-45"].heading.en`]: 'Viewing enquiries',
  [`${S43}.benefitRows[_key=="rea-br-45"].items[_key=="FgFZzy882mp21voM3Nhxwm"].en`]:
    'An enquiry straight from the property card',
  [`${S43}.benefitRows[_key=="rea-br-45"].items[_key=="FgFZzy882mp21voM3Nhy0Y"].en`]:
    'A matching form for budget and city',
  [`${S43}.benefitRows[_key=="rea-br-45"].items[_key=="FgFZzy882mp21voM3Nhy4K"].en`]:
    'Separate flows for buying, renting and short-lets',
  [`${S43}.benefitRows[_key=="rea-br-45"].items[_key=="FgFZzy882mp21voM3Nhy86"].en`]:
    'The contact goes straight to an agent',
  [`${S43}.benefitRows[_key=="rea-br-45"].mockTags[_key=="FgFZzy882mp21voM3NhyBs"].uk`]: 'Заявка',
  [`${S43}.benefitRows[_key=="rea-br-45"].mockTags[_key=="FgFZzy882mp21voM3NhyBs"].en`]: 'Enquiry',
  [`${S43}.benefitRows[_key=="rea-br-45"].mockTags[_key=="FgFZzy882mp21voM3NhyFe"].uk`]: 'Форма',
  [`${S43}.benefitRows[_key=="rea-br-45"].mockTags[_key=="FgFZzy882mp21voM3NhyFe"].en`]: 'Form',

  // ---------- outcome row: property submissions (was "Landings per market") ----------
  [`${S43}.benefitRows[_key=="rea-br-46"].heading.en`]: 'Adding properties to the platform',
  [`${S43}.benefitRows[_key=="rea-br-46"].items[_key=="FgFZzy882mp21voM3NhyJQ"].en`]:
    'Agents and owners can submit a property through a form',
  [`${S43}.benefitRows[_key=="rea-br-46"].items[_key=="FgFZzy882mp21voM3NhyNC"].en`]:
    'The data lands in the right structure from the start',
  [`${S43}.benefitRows[_key=="rea-br-46"].items[_key=="FgFZzy882mp21voM3NhyQy"].en`]:
    'Listings get checked, then published',
  [`${S43}.benefitRows[_key=="rea-br-46"].items[_key=="FgFZzy882mp21voM3NhyUk"].en`]:
    'The site grows as a platform, not a shop window',
  [`${S43}.benefitRows[_key=="rea-br-46"].mockTags[_key=="FgFZzy882mp21voM3NhyYW"].uk`]: 'Агенти',
  [`${S43}.benefitRows[_key=="rea-br-46"].mockTags[_key=="FgFZzy882mp21voM3NhyYW"].en`]: 'Agents',
  [`${S43}.benefitRows[_key=="rea-br-46"].mockTags[_key=="FgFZzy882mp21voM3NhycI"].uk`]: 'Форма',
  [`${S43}.benefitRows[_key=="rea-br-46"].mockTags[_key=="FgFZzy882mp21voM3NhycI"].en`]: 'Form',
  [`${S43}.benefitRows[_key=="rea-br-46"].mockTags[_key=="FgFZzy882mp21voM3Nhyg4"].uk`]: 'Публікація',
  [`${S43}.benefitRows[_key=="rea-br-46"].mockTags[_key=="FgFZzy882mp21voM3Nhyg4"].en`]: 'Publish',

  // ---------- directions (sales-model adaptation) EN ----------
  [`${S43}.directions.title.en`]: 'We adapt the site to your *sales model*',
  [`${S43}.directions.allowedItems[_key=="FgFZzy882mp21voM3Nhx5w"].en`]:
    'A multilingual site for buyers from different countries',
  [`${S43}.directions.allowedItems[_key=="FgFZzy882mp21voM3Nhx9i"].en`]:
    'Prices in several currencies',
  [`${S43}.directions.allowedItems[_key=="FgFZzy882mp21voM3NhxDU"].en`]:
    'Dedicated pages for cities, districts and property types',
  [`${S43}.directions.allowedItems[_key=="FgFZzy882mp21voM3NhxHG"].en`]:
    'CRM integration where needed',
  [`${S43}.directions.replaceItems[_key=="FgFZzy882mp21voM3NhxL2"].en`]:
    'A catalogue of flats, houses or commercial units',
  [`${S43}.directions.replaceItems[_key=="FgFZzy882mp21voM3NhxOo"].en`]:
    'Filters by price, area, type and specs',
  [`${S43}.directions.replaceItems[_key=="FgFZzy882mp21voM3NhxSa"].en`]:
    'Google Maps to show each location',
  [`${S43}.directions.replaceItems[_key=="FgFZzy882mp21voM3NhxWM"].en`]:
    'Enquiry forms for a viewing or a consultation',

  // ---------- services block EN ----------
  [`${S47}.sub.en`]:
    'A ready foundation for your niche: a property catalogue, search, filters, enquiries, languages, currencies and content you can manage yourself.',
  [`${S47}.features[_key=="rea-sf-48"].title.en`]: 'A catalogue that sells properties',
  [`${S47}.features[_key=="rea-sf-48"].items[_key=="FgFZzy882mp21voM3NhzT8"].en`]:
    'A clear structure for buying, renting and short-lets',
  [`${S47}.features[_key=="rea-sf-48"].items[_key=="FgFZzy882mp21voM3NhzWu"].en`]:
    'Cards with price, photos, floor area, city and status',
  [`${S47}.features[_key=="rea-sf-48"].items[_key=="FgFZzy882mp21voM3Nhzag"].en`]:
    'Listings read as offers, not a jumbled feed',
  [`${S47}.features[_key=="rea-sf-49"].title.en`]: 'Search without extra clicks',
  [`${S47}.features[_key=="rea-sf-49"].items[_key=="FgFZzy882mp21voM3NhziE"].en`]:
    'Filters by city, budget and property type',
  [`${S47}.features[_key=="rea-sf-49"].items[_key=="FgFZzy882mp21voM3Nhzm0"].en`]:
    'Clients find relevant options quickly',
  [`${S47}.features[_key=="rea-sf-49"].items[_key=="FgFZzy882mp21voM3Nhzpm"].en`]:
    'Fewer "what do you have within my budget?" questions',
  [`${S47}.features[_key=="rea-sf-50"].title.en`]: 'A site for local and overseas clients',
  [`${S47}.features[_key=="rea-sf-50"].items[_key=="FgFZzy882mp21voM3NhzxK"].en`]:
    'Languages and currencies for each audience',
  [`${S47}.features[_key=="rea-sf-50"].items[_key=="FgFZzy882mp21voM3Ni016"].en`]:
    'Prices overseas buyers understand at a glance',
  [`${S47}.features[_key=="rea-sf-50"].items[_key=="FgFZzy882mp21voM3Ni04s"].en`]:
    'One site you can advertise across several markets',
  [`${S47}.features[_key=="rea-sf-53"].title.en`]: 'Admin panel without a developer',
  [`${S47}.features[_key=="rea-sf-53"].items[_key=="FgFZzy882mp21voM3Ni0gc"].en`]:
    'The agency adds new properties itself',
  [`${S47}.features[_key=="rea-sf-53"].items[_key=="FgFZzy882mp21voM3Ni0kO"].en`]:
    'Prices, photos and statuses are yours to update',
  [`${S47}.features[_key=="rea-sf-53"].items[_key=="FgFZzy882mp21voM3Ni0oA"].en`]:
    'No developer needed for every small change',
}

async function main() {
  const doc = await client.getDocument(DOC_ID)
  if (!doc) throw new Error(`Document ${DOC_ID} not found`)

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — ${Object.keys(SET).length} field sets on ${DOC_ID}`)
  for (const [path, value] of Object.entries(SET)) {
    console.log(`  ${path}\n    → ${JSON.stringify(value)}`)
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
