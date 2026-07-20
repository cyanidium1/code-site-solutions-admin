/**
 * Job #85 (2026-07-20): courses industry page — comparison table, plan tiers,
 * FAQ (12), matching en-GB, and image alts for existing assets.
 *
 * Dry-run:
 *   npx sanity exec scripts/fix-courses-copy-2026-07.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/fix-courses-copy-2026-07.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const DOC_ID = 'DHIwRDN3sEoI638qoYRvTT'
const CMP = 'sections[_key=="cou-sec-54"]'
const FAQ = 'sections[_key=="cou-sec-66"]'
const CASE = 'sections[_key=="cou-sec-35"]'
const OUT = 'sections[_key=="cou-sec-43"]'

function ls(uk: string, en: string) {
  return {_type: 'localizedString' as const, uk, en}
}

function lt(uk: string, en: string) {
  return {_type: 'localizedText' as const, uk, en}
}

function pt(keyBase: string, text: string) {
  return [
    {
      _type: 'block' as const,
      _key: `${keyBase}b`,
      style: 'normal' as const,
      markDefs: [] as [],
      children: [{_type: 'span' as const, _key: `${keyBase}s`, text, marks: [] as []}],
    },
  ]
}

function faqItem(
  n: string,
  qUk: string,
  qEn: string,
  aUk: string,
  aEn: string,
) {
  return {
    _type: 'faqEntry' as const,
    _key: `cou-fq-${n}`,
    question: ls(qUk, qEn),
    answer: pt(`cou-faq${n}uk`, aUk),
    answerEn: pt(`cou-faq${n}en`, aEn),
  }
}

function row(
  key: string,
  param: [string, string],
  wix: [string, string],
  wp: [string, string],
  custom: [string, string],
) {
  // Schema keys: wp / wix / custom — FE order param → wp → wix → custom.
  // Image order Wix | WordPress | Custom → store Wix in wp, WordPress in wix.
  return {
    _type: 'comparisonRow' as const,
    _key: key,
    param: ls(param[0], param[1]),
    wp: ls(wix[0], wix[1]),
    wix: ls(wp[0], wp[1]),
    custom: ls(custom[0], custom[1]),
  }
}

function include(key: string, uk: string, en: string) {
  return {_key: key, ...ls(uk, en)}
}

const ROWS = [
  row(
    'cou-cr-55',
    ['Розробка лендингу', 'Landing page build'],
    ['$500–1 200', '$500–1,200'],
    ['$600–1 500', '$600–1,500'],
    ['від $800', 'from $800'],
  ),
  row(
    'cou-cr-56',
    ['Платформа / хостинг', 'Platform / hosting'],
    ['$29–39/міс', '$29–39/mo'],
    ['$17,50–25/міс', '$17.50–25/mo'],
    ['безкоштовно', 'free'],
  ),
  row(
    'cou-cr-57',
    ['Платформа за 3 роки', 'Platform over 3 years'],
    ['$1 044–1 404', '$1,044–1,404'],
    ['$630–900', '$630–900'],
    ['$0', '$0'],
  ),
  row(
    'cou-cr-58',
    ['Платні доповнення', 'Paid add-ons'],
    ['Застосунки оплачуються окремо', 'Apps billed separately'],
    ['Плагіни оплачуються окремо', 'Plugins billed separately'],
    ['За потреби', 'As needed'],
  ),
  row(
    'cou-cr-59',
    ['Загальна сума за 3 роки', 'Total over 3 years'],
    ['$1 544–2 604 + застосунки', '$1,544–2,604 + apps'],
    ['$1 230–2 400 + плагіни', '$1,230–2,400 + plugins'],
    ['від $800', 'from $800'],
  ),
]

const CTA = ls('Обговорити проєкт', 'Discuss the project')
const INCLUDES_H = ls('Що входить', "What's included")

const TIERS = [
  {
    _type: 'comparisonTier' as const,
    _key: 'cou-tier-63',
    title: ls('ЛЕНДИНГ', 'Landing'),
    price: ls('$800', '$800'),
    weeks: ls('3–4 тижні', '3–4 weeks'),
    isPopular: false,
    popularLabel: null,
    includesHeading: INCLUDES_H,
    includes: [
      include(
        'FgFZzy882mp21voM3Njk0W',
        'Аналіз продукту й структура до 8 блоків',
        'Product analysis and a structure of up to 8 blocks',
      ),
      include(
        'FgFZzy882mp21voM3Njk4I',
        'Індивідуальний дизайн та адаптивна версія',
        'Custom design and a responsive build',
      ),
      include(
        'FgFZzy882mp21voM3Njk84',
        'Одна мовна версія сайту',
        'One language version of the site',
      ),
      include(
        'FgFZzy882mp21voM3NjkBq',
        'Форма заявки або підключення онлайн-оплати',
        'Enquiry form or online payment hooked up',
      ),
    ],
    excludes: [],
    excludesHeading: null,
    ctaLabel: CTA,
    ctaGhost: false,
  },
  {
    _type: 'comparisonTier' as const,
    _key: 'cou-tier-64',
    title: ls('ЛЕНДИНГ + АВТОМАТИЗАЦІЯ', 'Landing + automation'),
    price: ls('$1 500', '$1,500'),
    weeks: ls('4–6 тижнів', '4–6 weeks'),
    isPopular: true,
    popularLabel: ls('Популярний', 'Popular'),
    includesHeading: INCLUDES_H,
    includes: [
      include(
        'FgFZzy882mp21voM3NjkFc',
        'Розширена структура для презентації та продажу курсу',
        'Expanded structure for presenting and selling the course',
      ),
      include(
        'FgFZzy882mp21voM3NjkJO',
        'Дві мовні версії та декілька тарифів',
        'Two language versions and several pricing tiers',
      ),
      include(
        'FgFZzy882mp21voM3NjkNA',
        'Онлайн-оплата через WayForPay, LiqPay або Stripe',
        'Online payments via WayForPay, LiqPay or Stripe',
      ),
      include(
        'FgFZzy882mp21voM3NjkQw',
        'Автоматичний доступ через Telegram-бота або навчальну платформу',
        'Automatic access via a Telegram bot or learning platform',
      ),
    ],
    excludes: [],
    excludesHeading: null,
    ctaLabel: CTA,
    ctaGhost: false,
  },
  {
    _type: 'comparisonTier' as const,
    _key: 'cou-tier-65',
    title: ls('ОНЛАЙН-ШКОЛА', 'Online school'),
    price: ls('$3 000', '$3,000'),
    weeks: ls('від 6 тижнів', 'from 6 weeks'),
    isPopular: false,
    popularLabel: null,
    includesHeading: INCLUDES_H,
    includes: [
      include(
        'FgFZzy882mp21voM3NjkUi',
        'Каталог і окремі сторінки для декількох курсів',
        'A catalogue and separate pages for several courses',
      ),
      include(
        'FgFZzy882mp21voM3NjkYU',
        'Особистий кабінет та різні рівні доступу',
        'A member area with different access levels',
      ),
      include(
        'FgFZzy882mp21voM3NjkcG',
        'Адмінпанель для керування курсами й користувачами',
        'An admin panel for courses and users',
      ),
      include(
        'FgFZzy882mp21voM3Njkg2',
        'Складні інтеграції, оплати та автоматизація',
        'Deeper integrations, payments and automation',
      ),
    ],
    excludes: [],
    excludesHeading: null,
    ctaLabel: CTA,
    ctaGhost: false,
  },
]

const FAQ_ITEMS = [
  faqItem(
    '01',
    'Скільки коштує розробка лендингу для курсу?',
    'How much does a course landing cost?',
    'Вартість базового лендингу починається від $800. Лендинг з онлайн-оплатою, декількома тарифами та автоматичним доступом до навчання — від $1 500. Точну суму визначаємо після обговорення структури та необхідних інтеграцій.',
    'A basic landing starts from $800. With online payments, several tiers and automatic course access, from $1,500. The exact figure follows a talk through structure and integrations.',
  ),
  faqItem(
    '02',
    'Скільки часу займає розробка?',
    'How long does the build take?',
    'Базовий лендинг розробляємо в середньому за 3–4 тижні. Проєкт з оплатою, Telegram-ботом, декількома мовами або навчальною платформою займає від 4–6 тижнів.',
    'A basic landing usually takes 3–4 weeks. With payments, a Telegram bot, several languages or a learning platform, plan on 4–6 weeks or more.',
  ),
  faqItem(
    '03',
    'Чи потрібно мені готувати технічне завдання?',
    'Do I need a written brief?',
    'Ні. Достатньо розповісти про курс, аудиторію та бажаний результат. Ми самостійно сформуємо структуру, перелік функцій і план реалізації.',
    "No. Tell us about the course, the audience and the result you want. We'll shape the structure, feature list and delivery plan from there.",
  ),
  faqItem(
    '04',
    'Що потрібно надати для початку роботи?',
    'What do you need from me to start?',
    'Інформацію про курс, програму, тарифи, викладача, цільову аудиторію, фотографії та наявні матеріали бренду. Якщо готових текстів немає, допоможемо сформувати структуру й підготувати контент.',
    "Details on the course, syllabus, tiers, tutor, audience, photos and any brand assets you already have. If there's no copy yet, we help shape the structure and draft content.",
  ),
  faqItem(
    '05',
    'Чи можна підключити онлайн-оплату?',
    'Can you connect online payments?',
    'Так. Інтегруємо WayForPay, LiqPay, Stripe або іншу доступну платіжну систему. Для кожного тарифу можна створити окрему оплату.',
    'Yes. We integrate WayForPay, LiqPay, Stripe or another payment provider that fits. Each tier can have its own checkout.',
  ),
  faqItem(
    '06',
    'Як користувач отримає курс після оплати?',
    'How does the buyer get the course after paying?',
    'Після успішної оплати система може автоматично надати доступ через Telegram-бота, особистий кабінет або навчальну платформу. Вам не доведеться перевіряти кожну покупку вручну.',
    "After a successful payment the system can grant access automatically via a Telegram bot, member area or learning platform. You don't have to check every purchase by hand.",
  ),
  faqItem(
    '07',
    'Чи можна підключити сайт до моєї навчальної платформи?',
    'Can you connect the site to my learning platform?',
    'Так. Можемо інтегрувати лендинг із Teachable, Thinkific, Kajabi, Podia або іншою платформою, якщо вона підтримує необхідний спосіб підключення.',
    'Yes. We can wire the landing into Teachable, Thinkific, Kajabi, Podia or another platform that supports the connection you need.',
  ),
  faqItem(
    '08',
    'Чи зможу я самостійно змінювати інформацію на сайті?',
    'Can I edit the site myself later?',
    'Так. За потреби підключимо адмінпанель, через яку можна редагувати тексти, зображення, програму курсу, тарифи та ціни без допомоги розробника.',
    'Yes. Where needed we add an admin panel so you can change copy, images, the syllabus, tiers and prices without a developer.',
  ),
  faqItem(
    '09',
    'Чи потрібно окремо оплачувати хостинг?',
    'Do I pay for hosting separately?',
    'Ні. Для розроблених нами лендингів хостинг безкоштовний. Окремо оплачується лише домен та сторонні сервіси, якщо вони використовуються в проєкті.',
    'No. Hosting for the landings we build is included. You only pay the domain and any third-party services used on the project.',
  ),
  faqItem(
    '10',
    'Чи можна перенести наявний лендинг із Wix або WordPress?',
    'Can you migrate an existing Wix or WordPress landing?',
    'Так. Ми можемо зберегти потрібний контент, повністю оновити структуру й дизайн та перенести сайт на кастомну кодову розробку.',
    'Yes. We can keep the content that still works, rebuild the structure and design, and move the site onto a custom coded stack.',
  ),
  faqItem(
    '11',
    'Чи надаєте ви підтримку після запуску?',
    'Do you support the site after launch?',
    'Так. Після запуску надаємо гарантійну підтримку технічної частини сайту. Подальше розширення функціоналу або створення нових сторінок можна замовити окремо.',
    'Yes. After launch we cover warranty support for the technical side. Extra features or new pages are scoped separately.',
  ),
  faqItem(
    '12',
    'Чи можна додати нові курси або функції пізніше?',
    'Can we add courses or features later?',
    'Так. Кодову систему можна розширювати: додавати нові курси, тарифи, мовні версії, платіжні системи, особистий кабінет та інші функції.',
    'Yes. The coded setup can grow: new courses, tiers, languages, payment providers, a member area and other features.',
  ),
]

const SET: Record<string, unknown> = {
  [`${CMP}.heading`]: lt(
    'Wix, WordPress чи кастом — *що вигідніше* за 3 роки',
    'Wix, WordPress or custom — *which costs less* over 3 years',
  ),
  [`${CMP}.columns`]: {
    param: ls('Параметр', 'Parameter'),
    wp: ls('Wix', 'Wix'),
    wix: ls('WordPress', 'WordPress'),
    custom: ls('Кастомна розробка', 'Custom development'),
  },
  [`${CMP}.rows`]: ROWS,
  [`${CMP}.pricingHeading`]: lt(
    'Скільки коштує лендинг для курсу',
    'What a course landing costs',
  ),
  [`${CMP}.tiers`]: TIERS,
  [`${FAQ}.heading`]: lt(
    'Часті питання про розробку\nлендингу для курсу',
    'FAQ: building a\ncourse landing',
  ),
  [`${FAQ}.items`]: FAQ_ITEMS,

  // Image alts (looked at assets before writing)
  'hero.deviceMockup.alt': ls(
    'Сайт курсу Aleko Sokurashvili «Секрети вірусних відео» на ноутбуці і телефоні',
    "Aleko Sokurashvili's viral-video course landing on laptop and phone",
  ),
  [`${CASE}.after.image.alt`]: ls(
    'Головна сторінка курсу Aleko з офером −50% на ноутбуці',
    'Aleko course homepage with a −50% offer on a laptop',
  ),
  [`${OUT}.benefitRows[_key=="cou-br-44"].image.alt`]: ls(
    'Блок «Цей курс для вас» з болями аудиторії на ноутбуці',
    "Aleko landing 'this course is for you' audience checklist on a laptop",
  ),
  [`${OUT}.benefitRows[_key=="cou-br-45"].image.alt`]: ls(
    'Три тарифи курсу Aleko на ноутбуці і телефоні',
    'Aleko course pricing tiers on laptop and phone',
  ),
  [`${OUT}.benefitRows[_key=="cou-br-46"].image.alt`]: ls(
    'Блок «Чому я?» з фото Aleko Sokurashvili на ноутбуці',
    "Aleko 'why me' instructor bio section on a laptop",
  ),
}

async function main() {
  const doc = await client.getDocument(DOC_ID)
  if (!doc) throw new Error(`Document ${DOC_ID} not found`)

  console.log(
    `${APPLY ? 'APPLY' : 'DRY-RUN'} — ${Object.keys(SET).length} field sets on ${DOC_ID} (courses)`,
  )
  for (const [path, value] of Object.entries(SET)) {
    const preview = JSON.stringify(value)
    console.log(`  ${path}\n    → ${preview.length > 180 ? preview.slice(0, 180) + '…' : preview}`)
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
