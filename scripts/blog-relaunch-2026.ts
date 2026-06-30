/**
 * Blog relaunch 2026 — create 3 new bilingual blog posts (EN per TZ + full UA rewrite).
 * Replaces the 3 existing posts (cost / tilda / contract). Deletion is a SEPARATE script
 * (blog-delete-old-2026.ts) run only after these are live + redirects in place.
 *
 * Dry-run:  npx sanity exec scripts/blog-relaunch-2026.ts --with-user-token
 * Apply:    npx sanity exec scripts/blog-relaunch-2026.ts --with-user-token -- --apply
 *
 * Source content: docs/blog-drafts/article-{1,2,3}-*.md in the workspace.
 * Block shapes verified against schemaTypes/objects/blogBody.ts + blocks/{tldrBox,blogTable,ctaCallout}.
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const CAT_FINANCE = '3dda2459-8805-4c53-ae6f-88ea595e2c0f'
const CAT_PLATFORMS = '65de7a1a-bfde-4e47-ab70-7e0ecf161f0a'
const PUB = '2026-06-30T09:00:00.000Z'
const AUTHOR = {
  name: 'Fedir Alpatov',
  role: 'Founder & Tech Lead',
  bio: 'Засновник Code-Site.Art. Веду техлід-роботу і пишу про реальні цифри з 47 проєктів.',
  photoUrl: '/team/fedir.jpg',
}

/* ── portable-text builders ──────────────────────────────────────────────── */
type Part = string | {text: string; bold?: boolean; href?: string}

function builders(prefix: string) {
  let n = 0
  const key = () => `${prefix}-${(++n).toString(36)}`
  const norm = (parts: Part[] | string): Part[] => (typeof parts === 'string' ? [parts] : parts)

  function rich(style: string, parts: Part[] | string, listItem?: 'bullet' | 'number') {
    const markDefs: any[] = []
    const children = norm(parts).map((pt) => {
      if (typeof pt === 'string') return {_type: 'span', _key: key(), text: pt, marks: []}
      const marks: string[] = []
      if (pt.bold) marks.push('strong')
      if (pt.href) {
        const lk = key()
        markDefs.push({_key: lk, _type: 'link', href: pt.href, newTab: false})
        marks.push(lk)
      }
      return {_type: 'span', _key: key(), text: pt.text, marks}
    })
    const block: any = {_type: 'block', _key: key(), style, markDefs, children}
    if (listItem) {
      block.listItem = listItem
      block.level = 1
    }
    return block
  }

  return {
    p: (parts: Part[] | string) => rich('normal', parts),
    h2: (text: string) => rich('h2', text),
    bullet: (parts: Part[] | string) => rich('normal', parts, 'bullet'),
    num: (parts: Part[] | string) => rich('normal', parts, 'number'),
    tldr: (title: string, items: string[]) => ({_type: 'tldrBox', _key: key(), title, items}),
    table: (headers: string[], rows: string[][]) => ({
      _type: 'blogTable',
      _key: key(),
      headers,
      rows: rows.map((cells) => ({_type: 'blogTableRow', _key: key(), cells})),
    }),
    cta: (c: Record<string, string>) => ({_type: 'ctaCallout', _key: key(), ...c}),
  }
}

/* ── Article 1 — cost ────────────────────────────────────────────────────── */
const a1 = builders('a1')
const en1 = [
  a1.tldr('In 60 seconds', [
    'A custom website in the UK costs **£800 to £14,000+** in 2026 — the number tracks scope.',
    '**Landing page:** from £800 (1–2 weeks)',
    '**Corporate website:** from £3,500 (4–8 weeks)',
    '**Custom platform:** from £6,000 (8–16 weeks)',
    'Every quote should cover design, build, CMS, hosting setup, launch and a year of support.',
    'At Code-Site.Art the price is fixed in the contract before work starts.',
  ]),
  a1.h2('What affects the price of a custom website?'),
  a1.p('A business owner types "how much does a custom website cost" into Google and gets two hundred studios quoting prices that vary by a factor of thirty. The reason is dull: most agencies were never taught to break a price into line items, so they hand over one big number and ask for a brief. Five things actually move that number.'),
  a1.p([{text: 'Scope — pages and how many are bespoke. ', bold: true}, {text: 'Five plain pages and five pages with calculators, filtered listings or a booking flow are not the same job. Each unique template adds design and build time, so a site with many similar pages costs far less per page than one with many one-off layouts.'}]),
  a1.p([{text: 'Integrations. ', bold: true}, {text: 'A contact form is close to free. A booking system that writes to your calendar, a CRM hand-off, Stripe payments or a second language each add real hours of build and testing. This is where most surprise costs hide on other studios’ quotes.'}]),
  a1.p([{text: 'Content. ', bold: true}, {text: 'If you supply the copy, you save the studio’s copywriting time. If the studio writes it, that work goes into the quote. Either way the cost should be stated, not buried.'}]),
  a1.p([{text: 'Speed. ', bold: true}, {text: 'A compressed timeline means reordering other work and sometimes adding a second developer, and that carries a premium. A normal timeline does not.'}]),
  a1.p([{text: 'Who you hire. ', bold: true}, {text: 'A boutique studio carries less overhead than a large agency, so the same corporate site can cost meaningfully less without cutting quality. Design complexity, by contrast, moves the price by a fraction, not a multiple — engineering and integrations take the bulk of the budget.'}]),
  a1.h2('UK website pricing breakdown, tier by tier'),
  a1.table(['Tier', 'Price', 'Timeline', 'What’s included', 'Best for'], [
    ['Landing page', 'from £800', '1–2 weeks', 'Design, responsive build, form, SEO structure', 'Campaigns, launches, a single service'],
    ['Corporate website', 'from £3,500', '4–8 weeks', 'CMS, blog, 5+ integrations, multilingual, GDPR', 'SMBs, professional services, healthcare'],
    ['Custom platform', 'from £6,000', '8–16 weeks', 'Architecture session, dedicated team, SLA, custom integrations', 'SaaS, marketplaces, complex products'],
  ]),
  a1.p([{text: 'Every tier ships with the same foundation, whatever the price: copywriting, UI design in Figma, a hand-built front end on Next.js, a Sanity CMS you can edit from your phone, domain and hosting setup, launch, and a full year of support. The full list is on our '}, {text: 'pricing page', href: '/en/pricing'}, {text: '. You are not paying for a stripped-down version at the bottom and the "real" thing at the top. You are paying for scope.'}]),
  a1.h2('Fixed price vs hourly rate — what UK businesses should know'),
  a1.p('Most of the budget pain owners describe comes from hourly contracts, where the scope is loose and the invoice keeps climbing. You approve a design, the build starts, and three weeks in the estimate has quietly doubled because "the integration took longer than expected." You carry that risk, not the studio.'),
  a1.p('A fixed price flips it. The scope is locked in the contract, the number does not move unless you ask for something new in writing, and the warranty is part of the deal. You can plan cashflow around it.'),
  a1.p([{text: 'At Code-Site.Art every project is fixed price, agreed before a line of code is written. Across '}, {text: '47 projects in four countries', href: '/en/portfolio'}, {text: ' we have not missed the price range on a single one. That is not talent; it is having seen 47 similar projects and knowing what each part actually costs.'}]),
  a1.h2('What a UK web design agency does not include in the price'),
  a1.p('An honest quote is as clear about what is out as what is in. These usually sit outside a website build, and any studio worth hiring will tell you so up front:'),
  a1.bullet('Product photography and video'),
  a1.bullet('Branding from scratch — logo and brand book'),
  a1.bullet('Google Ads and Meta Ads campaigns'),
  a1.bullet('SEO campaigns after the warranty year'),
  a1.bullet('Hosting after year one, once the accounts are handed to you'),
  a1.p('None of these are hidden costs when they are stated. They become hidden costs when a studio quotes low, wins the job, then bills them as "extras" later.'),
  a1.h2('How to compare quotes from UK web studios — 5 things to check'),
  a1.p('Before you sign anything, ask every studio the same five questions — this doubles as a quick contract check:'),
  a1.num([{text: 'Is the price fixed or hourly? ', bold: true}, {text: '"Roughly" or "depends" is not a quote; it is marketing.'}]),
  a1.num([{text: 'Is copywriting included? ', bold: true}, {text: 'This is a £200–£2,000 line on its own and should be spelled out.'}]),
  a1.num([{text: 'What is the warranty period? ', bold: true}, {text: 'Around four in five studios include no support year. Confirm it.'}]),
  a1.num([{text: 'Do you get the GitHub repo and every account? ', bold: true}, {text: 'If not, you are renting your own website.'}]),
  a1.num([{text: 'What happens if the deadline slips? ', bold: true}, {text: 'With no penalty clause, a deadline is a hope, not a commitment.'}]),
  a1.cta({
    eyebrow: 'Get a number',
    heading: 'Not sure which tier fits your project?',
    sub: 'Use the online calculator for an instant estimate, or book a free 30-minute call and we’ll scope it together. Fixed price, no surprises.',
    ctaLabel: 'Try the calculator',
    ctaHref: '/en/calculator',
    ctaSecondaryLabel: 'Get a free estimate',
    ctaSecondaryHref: '/en/contacts',
  }),
]
const faqEn1 = [
  ['How much does a landing page cost in the UK?', 'From £800 at Code-Site.Art. That covers responsive design, SEO structure, form integration and a one-year warranty.'],
  ['Is a bespoke website cheaper than WordPress?', 'Up front, often similar. Over three years, custom usually wins: no plugin renewals, no maintenance retainer, no security clean-ups. We break the numbers down in our custom vs WordPress comparison.'],
  ['Do UK web studios charge VAT?', 'If they are VAT-registered, yes — add 20% to the quoted price. Some studios, especially those based outside the UK, may not charge UK VAT at all.'],
  ['How long does a corporate website take to build?', 'Usually four to eight weeks at a boutique studio. Larger agencies often take three to six months for the same scope.'],
  ['Can I get a website for £500 in the UK?', 'Yes, but it will be a Wix or Squarespace template with the limits that brings. A custom-coded site starts at £800 for a landing page.'],
]
const uk1 = [
  a1.tldr('За 60 секунд', [
    'Сайт в Україні у 2026 коштує **від $1,000 до $14,000+** — цифра залежить від обсягу.',
    '**Лендинг:** від $1,000 (1–2 тижні)',
    '**Сайт під галузь (Industry Pro):** від $3,500 (4–10 тижнів)',
    '**Інтернет-магазин:** $5,000–$10,000 (6–10 тижнів)',
    '**Кастомний продукт:** від $14,000 (8–16 тижнів)',
    'У Code-Site.Art сума фіксується в договорі до старту робіт.',
  ]),
  a1.h2('4 фактори, які формують ціну'),
  a1.p('Власник бізнесу пише в Google «скільки коштує сайт» і отримує 200 студій із цінами, що різняться в 30 разів. Причина нудна: більшість підрядників не вміють розкласти ціну на статті, тож дають одну цифру і просять ТЗ. Насправді ціну формують чотири речі.'),
  a1.p([{text: 'Обсяг — сторінки і скільки з них кастомні. ', bold: true}, {text: '5 простих сторінок і 5 сторінок із калькуляторами чи бронюванням — різна робота. Кожен унікальний шаблон додає години, тож сайт із багатьох схожих сторінок коштує дешевше за сторінку, ніж сайт із багатьма унікальними макетами.'}]),
  a1.p([{text: 'Інтеграції. ', bold: true}, {text: 'Форма зворотного зв’язку майже безкоштовна. Бронювання з синхронізацією календаря, передача в CRM, оплата Stripe чи LiqPay, друга мова — кожна додає реальні години розробки й тестування. Саме тут у кошторисах інших студій ховаються сюрпризи.'}]),
  a1.p([{text: 'Контент. ', bold: true}, {text: 'Пишете текст самі — економите студії копірайтинг ($1,500–$2,500). Пише студія — ця робота в кошторисі. У будь-якому разі сума має бути названа, а не захована.'}]),
  a1.p([{text: 'Хто ви наймаєте. ', bold: true}, {text: 'Бутикова студія має менше накладних, ніж велика агенція, тож той самий сайт під галузь коштує відчутно менше без втрати якості. Складність дизайну, навпаки, змінює ціну на 0–40%, а не в рази — основну частину забирають інженерія та інтеграції.'}]),
  a1.h2('Тарифи, пакет за пакетом'),
  a1.table(['Пакет', 'Ціна', 'Термін', 'Що входить', 'Кому'], [
    ['Лендинг', 'від $1,000', '1–2 тижні', 'Дизайн, адаптив, форма, SEO-структура', 'Кампанії, запуски, одна послуга'],
    ['Сайт під галузь', 'від $3,500', '4–10 тижнів', 'CMS, блог, 2–3 інтеграції, дві мови, compliance', 'МСБ, послуги, медицина'],
    ['Кастомний продукт', 'від $14,000', '8–16 тижнів', 'Архітектурна сесія, окрема команда, SLA, кастомні інтеграції', 'SaaS, маркетплейси, складні продукти'],
  ]),
  a1.p([{text: 'Кожен пакет має однаковий фундамент, незалежно від ціни: копірайтинг, дизайн у Figma, фронтенд на Next.js, Sanity CMS із редагуванням навіть із телефона, налаштування домену й хостингу, реліз і рік підтримки. Повний перелік — на сторінці '}, {text: 'цін', href: '/pricing'}, {text: '. Ви не платите за «урізану» версію внизу і «справжню» вгорі. Ви платите за обсяг.'}]),
  a1.h2('Фіксована ціна vs погодинна'),
  a1.p('Майже весь біль із бюджетом, який описують власники, походить від погодинних договорів: обсяг розмитий, рахунок росте. Ви затвердили дизайн, почалась розробка, а через три тижні оцінка тихо подвоїлась, бо «інтеграція виявилась складнішою». Ризик несете ви, а не студія.'),
  a1.p('Фіксована ціна перевертає це. Обсяг зафіксований у договорі, цифра не рухається, поки ви самі не попросите щось нове письмово, а гарантія — частина угоди. Під неї можна планувати кеш.'),
  a1.p([{text: 'У Code-Site.Art кожен проєкт — фіксована ціна, узгоджена до першого рядка коду. За '}, {text: '47 проєктів у 4 країнах', href: '/portfolio'}, {text: ' ми не промахнулись із вилкою ціни в жодному. Це не геніальність — це 47 схожих проєктів за плечима і розуміння, скільки реально йде на що.'}]),
  a1.h2('Що НЕ входить у ціну сайту'),
  a1.p('Чесний кошторис так само ясно каже, що поза межами, як і те, що всередині. Зазвичай поза вартістю сайту лишається:'),
  a1.bullet('Предметна фотографія і відео'),
  a1.bullet('Брендинг з нуля — логотип і брендбук'),
  a1.bullet('Рекламні кампанії Google Ads / Meta Ads'),
  a1.bullet('SEO-просування після гарантійного року'),
  a1.bullet('Хостинг після першого року, коли акаунти передані вам'),
  a1.p('Це не приховані витрати, коли вони названі. Прихованими вони стають, коли студія дає низьку ціну, виграє проєкт, а потім виставляє їх «допами».'),
  a1.h2('Як перевірити, що кошторис чесний — 5 запитань'),
  a1.p('Перед підписанням постав будь-якій студії ті самі п’ять запитань (це й коротка перевірка договору):'),
  a1.num([{text: 'Сума фіксована чи погодинна? ', bold: true}, {text: '«Приблизно» або «залежить» — це не кошторис, це маркетинг.'}]),
  a1.num([{text: 'Чи входить рік підтримки? ', bold: true}, {text: 'У ~80% студій — ні. Уточни.'}]),
  a1.num([{text: 'Чи розписана робота по статтях? ', bold: true}, {text: 'Якщо бачиш лише «розробка $X» — половина роботи може зникнути по дорозі.'}]),
  a1.num([{text: 'Ти отримуєш GitHub-репозиторій і всі акаунти? ', bold: true}, {text: 'Якщо ні — ти орендуєш власний сайт.'}]),
  a1.num([{text: 'Що буде, якщо зірвуть термін? ', bold: true}, {text: 'Без неустойки термін — це орієнтир, а не зобов’язання.'}]),
  a1.cta({
    eyebrow: 'Калькулятор',
    heading: 'Хочете цифру під ваш проєкт?',
    sub: 'Калькулятор за 60 секунд: тип сайту, сторінки, мови, інтеграції — і ви бачите вилку з розбивкою. Без email і розмови з sales.',
    ctaLabel: 'Розрахувати ціну',
    ctaHref: '/calculator',
    ctaSecondaryLabel: 'Записатись на дзвінок',
    ctaSecondaryHref: '/contacts',
  }),
]
const faqUk1 = [
  ['Скільки коштує сайт для малого бізнесу?', 'Реальна вилка — від $1,000 за лендинг до $14,000+ за кастомний продукт. Більшість МСБ потрапляє в пакет Industry Pro $3,500 (сайт із CMS, інтеграціями і compliance).'],
  ['Чому одна студія каже $500, а інша $5,000 за «такий самий» сайт?', '«Такий самий» зазвичай не такий. Різниця — у кількості сторінок, інтеграцій, компетенції команди, гарантіях і в тому, чи входить рік підтримки. Підозріло низька ціна — половина роботи зазвичай не входить.'],
  ['Скільки коштує лендинг у 2026?', '$1,000–$2,500. Дешевше — це шаблон на конструкторі з усіма мінусами. Дорожче — це вже багатосторінковий сайт.'],
  ['Скільки коштує інтернет-магазин?', '$5,000–$10,000 для каталогу до 200 SKU з оплатою і доставкою. Мультивендор чи B2B-портал — це пакет від $14,000.'],
  ['Чи входить хостинг у вартість?', 'Налаштовуємо на вашому акаунті Vercel або Cloudflare. Перший рік фактично безкоштовний, далі $20–$50/міс залежно від трафіку.'],
]

/* ── Article 2 — vs platform ─────────────────────────────────────────────── */
const a2 = builders('a2')
const en2 = [
  a2.tldr('In 60 seconds', [
    'For most UK SMBs with 5–15 pages, a **custom-coded website** beats WordPress on speed, SEO and long-term value.',
    '**WordPress wins** if you publish 10+ articles a month, need daily self-editing, or run a large catalogue.',
    '**Custom wins** if speed matters (Lighthouse 95+), you want no lock-in, you need integrations, or SEO matters from day one.',
    'The number that decides it is **3-year total cost of ownership**, not the upfront build.',
  ]),
  a2.h2('What is a custom-coded website?'),
  a2.p('A custom website is built from scratch — no theme, no page builder. We write the front end in Next.js and run the content through Sanity, so every line of code exists because your site needs it, not because a template shipped with it. Nothing loads that you didn’t ask for.'),
  a2.p([{text: 'That control is what produces the speed. '}, {text: 'Efedra Clinic', href: '/en/portfolio/efedra-clinic'}, {text: ', one of our builds, holds a Lighthouse score of 98 and a largest-contentful-paint of 0.8 seconds. You don’t reach those numbers by bolting a caching plugin onto a theme; you reach them by not shipping the bloat in the first place.'}]),
  a2.h2('What is WordPress?'),
  a2.p('WordPress is a PHP content management system that powers roughly 43% of the web. You pick a theme, add plugins for the features you need, and edit through a dashboard most people already recognise. That ecosystem is its strength: there is a plugin for almost anything, and developers are easy to find.'),
  a2.p('The cost of that flexibility is weight and upkeep. Every plugin is more code to load, another thing to update, and another possible security hole. None of that makes WordPress bad. It makes it a particular set of trade-offs.'),
  a2.h2('Side-by-side comparison'),
  a2.table(['Factor', 'Custom (Next.js)', 'WordPress'], [
    ['Page speed', 'Lighthouse 95–98 typical', 'Lighthouse 50–70 with plugins'],
    ['SEO built-in', 'Structured data, clean code from day one', 'Via plugins (Yoast, RankMath), added later'],
    ['Security', 'Minimal attack surface, no plugin holes', 'Frequent plugin exploits, update dependency'],
    ['Upfront cost', 'From £800 / £3,500', '£1,500–£8,000 for a custom build'],
    ['Year 2–3 cost', 'Hosting only, on your account', 'Plugin renewals £300–£800/yr + maintenance'],
    ['Editing', 'Sanity — edit from your phone', 'WP dashboard, strong for content-heavy sites'],
    ['Scalability', 'Scales to SaaS, marketplace, multilingual', 'Slows under heavy traffic, plugin conflicts'],
    ['Lock-in', 'None — you own the GitHub repo', 'Tied to WP; migration costs £500–£5,000'],
    ['Time to launch', 'Landing 1–2 wks, corporate 4–8 wks', 'Basic 2–4 wks, custom 2–6 months'],
  ]),
  a2.h2('3-year total cost — the part no one shows you'),
  a2.p('The build price is the part everyone compares. It’s also the smaller half of the bill.'),
  a2.table(['Cost item', 'Custom (Code-Site.Art)', 'WordPress (agency build)'], [
    ['Build', '£3,500 (corporate tier)', '£3,000–£8,000'],
    ['Hosting / year', 'Included year 1, then ~£0', '£50–£200/month managed WP'],
    ['Plugin licences', 'None', '£300–£800/year'],
    ['Maintenance', 'Not needed', '£500–£1,500/month if outsourced'],
    ['Security incidents', 'Rare', '£200–£2,000 average per incident'],
    ['3-year total', '~£3,500–£4,500', '£8,000–£25,000+'],
  ]),
  a2.p('These ranges come from published UK agency pricing and our own client data. Of 14 clients who came to us with a WordPress site to rebuild, 12 had spent more on WordPress over the previous two to three years than a new custom site would have cost them outright. The monthly figures are small enough to ignore one at a time, which is exactly why they add up.'),
  a2.h2('When WordPress is the right choice'),
  a2.p('There are clear cases where WordPress is the sensible pick, and it would be dishonest to pretend otherwise:'),
  a2.bullet('You publish ten or more articles a month and need non-technical editors in the dashboard daily'),
  a2.bullet('You run a large catalogue — 500+ products on WooCommerce'),
  a2.bullet('Your team needs to self-edit constantly without a developer'),
  a2.bullet('Your budget is under £1,500 and a template site does the job'),
  a2.h2('When a custom website is the better choice'),
  a2.bullet('Speed is a competitive edge — clinics, law firms and property all live or die on local SEO'),
  a2.bullet('You need integrations: booking systems, a CRM, payments, more than one language'),
  a2.bullet('You want to own the code outright, with the GitHub repo and no platform dependency'),
  a2.bullet('SEO matters from day one, on clean architecture with no plugin bloat'),
  a2.bullet('You want a fixed price and no surprise invoice in year two or three'),
  a2.h2('Real example — Efedra Clinic'),
  a2.p([{text: 'Efedra, a clinic in Odesa, moved off a slow platform onto a custom Next.js build. Largest-contentful-paint dropped from 3.2 seconds to 0.8. Within six months they had 3.2× more enquiries and four times the organic traffic from Google, and they reached the top three results for their main keyword inside three months. The full project ran to $4,525 including a Helsi booking integration and a second language. See the '}, {text: 'full case study', href: '/en/portfolio/efedra-clinic'}, {text: '.'}]),
  a2.cta({
    eyebrow: 'Get a number',
    heading: 'Want to see what a custom build would cost your business?',
    sub: 'Try the calculator for an instant estimate, browse the portfolio, or book a free call — fixed price, no surprises.',
    ctaLabel: 'Try the calculator',
    ctaHref: '/en/calculator',
    ctaSecondaryLabel: 'Get a free estimate',
    ctaSecondaryHref: '/en/contacts',
  }),
]
const faqEn2 = [
  ['Is a custom website better for SEO than WordPress?', 'Usually, yes — clean code, faster load times and structured data built in from day one. WordPress can rank well, but it needs extra plugins and developer time to get there.'],
  ['Can I switch from WordPress to a custom website?', 'Yes. We handle WordPress migrations with full 301 redirect mapping and a Search Console hand-off, so your SEO history carries over. From £500.'],
  ['Do custom websites work with Google Analytics?', 'Yes. Every project includes Google Analytics 4 and Search Console setup as standard.'],
  ['Is Sanity CMS easy to use without coding?', 'Yes. Sanity has a clean dashboard — you can edit text, swap images and update content from your phone, no code needed.'],
  ['What happens if my developer leaves and I have a custom site?', 'You own the full GitHub repository, so any Next.js developer can pick it up. There’s no lock-in to our studio.'],
]
const uk2 = [
  a2.tldr('За 60 секунд', [
    'Для більшості українського МСБ із сайтом на 5–15 сторінок **кастомний сайт** кращий за конструктор: швидкість, SEO, довгострокова вартість.',
    '**Конструктор виправданий** для тесту гіпотез і промо на 1–3 місяці.',
    '**Кастом виграє**, коли швидкість — це конверсія (Lighthouse 95+), потрібні інтеграції, важливий SEO, і ви хочете володіти кодом.',
    'Бізнес-тариф Tilda з add-ons виходить **$7,200 за 3 роки** — за ці гроші кастом замовляють двічі.',
  ]),
  a2.h2('Як ми отримали цифру $7,200'),
  a2.p('Це не теоретичний розрахунок із сайту Tilda. Це сума, яку реально платили клієнти, що прийшли до нас із Tilda. Ми порахували 12 кошторисів компаній із 50–300 заявками на місяць, які користувались Tilda 2–3 роки. Стандартний бізнес-набір — не «Personal за $10», а Business + Pro + add-ons: домен, форми з валідацією, інтеграції через Zapier, платні блоки з Market, і технічний консультант, бо щось завжди ламається. Середнє по 12 кошторисах — $180–$220/міс. Беремо середину $200, множимо на 36 місяців: $7,200.'),
  a2.h2('Що ви отримуєте за $7,200'),
  a2.p('Шаблонний сайт з обмеженою кастомізацією, який вантажиться 2–4 секунди на мобільному (кастом — 0.6–1.5), залежить від платформи, має обмежений контроль над SEO і не дає «свого коду». Експорт Tilda — це статичний HTML без бекенду форм: форми перестають надсилатись, динаміка не переноситься. З 12 наших мігрантів жоден не зміг ефективно скористатись експортом; усі робили сайт із нуля.'),
  a2.h2('Порівняння, поруч'),
  a2.table(['Фактор', 'Кастом (Next.js)', 'Конструктор (Tilda/Wix)'], [
    ['Швидкість', 'Lighthouse 95–98', 'Lighthouse 50–70, 2–4с на мобільному'],
    ['SEO', 'Schema і чистий код з дня 1', 'Базовий, без SSR і програмних landing'],
    ['Інтеграції', 'Будь-які через API', 'Обмежені, часто лише через Zapier'],
    ['Вартість старту', 'від $1,000 / $3,500', '$0–$50 на старті'],
    ['Рік 2–3', 'Тільки хостинг, на вашому акаунті', '$50–$200/міс підписки'],
    ['Власність', 'GitHub-репозиторій ваш', 'Оренда, коду немає'],
    ['Експорт', 'Не потрібен — він і так ваш', 'HTML без бекенду = пастка'],
    ['Швидкість запуску', 'Лендинг 1–2 тиж, сайт 4–10 тиж', 'Дні, але стеля низька'],
  ]),
  a2.h2('Реальна вартість за 3 роки'),
  a2.table(['Платформа', 'Тариф для бізнесу', 'За 36 міс', 'Експорт коду'], [
    ['Tilda Business + Pro', '$50/міс', '$1,800', 'HTML без бекенду'],
    ['Tilda Agency + add-ons', '$200/міс', '$7,200', 'HTML без бекенду'],
    ['Wix Business', '$32/міс', '$1,152', 'Не дає експорту'],
    ['Webflow Business', '$39/міс', '$1,404', 'HTML+CSS, без CMS'],
    ['Кастом (Industry Pro)', '$3,500 одноразово', '~$3,500', 'Репозиторій ваш'],
  ]),
  a2.p('Усі конструктори — оренда, не власність. Додайте сюди 30–50 годин на рік вашого часу на підтримку (форма не надсилається, SEO впав після апдейту, пошук підрядника «який знає Tilda») — за ставкою $50–$150/год це ще $1,500–$7,500 на рік.'),
  a2.h2('Коли конструктор — правильний вибір'),
  a2.p('Чесно, є випадки, де Tilda — розумний вибір:'),
  a2.bullet('Перевірка попиту на новий продукт на 1–3 місяці'),
  a2.bullet('Промо-сторінка під одну рекламну кампанію, яка потім викидається'),
  a2.bullet('Особиста сторінка або портфоліо фотографа чи дизайнера'),
  a2.bullet('Бюджет, за якого кодовий сайт зараз не на часі'),
  a2.h2('Коли кастом — кращий вибір'),
  a2.bullet('Швидкість — це конкурентна перевага (клініки, юр-фірми, нерухомість, локальний SEO)'),
  a2.bullet('Потрібні інтеграції: бронювання, CRM, оплата, дві мови'),
  a2.bullet('Ви хочете володіти кодом — репозиторій, без прив’язки до платформи'),
  a2.bullet('SEO важливий з першого дня, без плагінного баласту'),
  a2.bullet('Ви хочете фіксовану ціну без сюрпризів у 2–3 рік'),
  a2.h2('Реальний приклад — клініка «Ефедра», Одеса'),
  a2.p([{text: 'Ефедра перейшла з повільної платформи на кастом Next.js. LCP впав з 3.2 до 0.8 секунди. За 6 місяців — у 3.2 раза більше заявок і вчетверо більше органічного трафіку з Google, топ-3 за основним запитом за 3 місяці. Проєкт коштував $4,525 разом з інтеграцією Helsi і другою мовою. Дивіться '}, {text: 'кейс повністю', href: '/portfolio/efedra-clinic'}, {text: '.'}]),
  a2.cta({
    eyebrow: 'Калькулятор',
    heading: 'Подумуєте про переїзд із конструктора?',
    sub: 'Скажемо чесно, чи воно вам треба. Якщо бізнесу ще ОК на Tilda — так і скажемо. Якщо пора — порахуємо міграцію без втрати SEO.',
    ctaLabel: 'Розрахувати міграцію',
    ctaHref: '/calculator',
    ctaSecondaryLabel: 'Обговорити переїзд',
    ctaSecondaryHref: '/contacts',
  }),
]
const faqUk2 = [
  ['Скільки коштує Tilda для бізнесу?', 'Реальний кошторис із add-ons — $50–$200/міс. За 3 роки це $1,800–$7,200, не рахуючи годин власника на підтримку.'],
  ['Чи можна експортувати сайт із Tilda?', 'Експорт HTML є, але без бекенду форм і динаміки. Використати його як «свій сайт» на практиці неможливо — все одно робиться з нуля.'],
  ['Чи правда, що Tilda гірша для SEO?', 'Tilda дає базовий SEO (meta, sitemap, schema), але не дає server-side рендерингу, програмних landing і кастомної schema.org. Для серйозного SEO це стеля.'],
  ['Скільки займає міграція з Tilda на Next.js?', '4–6 тижнів для типового бізнес-сайту. 301-редиректи зберігають SEO-історію, Search Console передаємо разом із клієнтом. Від $500.'],
  ['Може, ви просто упереджені проти Tilda?', '12 наших клієнтів пройшли цей шлях. Якщо хтось повернеться на Tilda — напишемо про це окрему статтю. Поки ніхто не повернувся.'],
]

/* ── Article 3 — Next.js vs WordPress ────────────────────────────────────── */
const a3 = builders('a3')
const en3 = [
  a3.tldr('In 60 seconds', [
    '**Next.js** is stronger for performance, SEO and scalability. **WordPress** is stronger for large-scale content and self-editing teams.',
    'Next.js with Sanity lands Lighthouse **95–98**; WordPress with standard plugins sits at **50–70**.',
    'For most UK SMBs with 5–20 pages that care about rankings and leads, Next.js is the better 2026 choice.',
    'For large publishing sites, daily non-technical edits, or 500+ product shops, WordPress still holds up.',
  ]),
  a3.h2('What is Next.js?'),
  a3.p('Next.js is a React framework built by Vercel. It renders pages on the server, regenerates them on a schedule, and can serve most of a site as static files from an edge network close to the visitor. Nike, TikTok and Notion run on it. It isn’t a CMS by itself — it’s the rendering layer. We pair it with Sanity, which handles the content side, so editors get a dashboard and the site keeps its speed.'),
  a3.h2('Performance comparison — real numbers'),
  a3.p('These are the metrics Google actually weighs for ranking. The Next.js column reflects our own builds; the WordPress columns reflect widely-reported market ranges.'),
  a3.table(['Metric', 'Next.js (our builds)', 'WordPress (standard)', 'WordPress (optimised)'], [
    ['Lighthouse', '95–98', '35–55', '60–75'],
    ['LCP', '0.6–1.2s', '3–6s', '1.8–3s'],
    ['INP', '< 100ms', '200–400ms', '150–250ms'],
    ['CLS', '< 0.01', '0.05–0.2', '0.02–0.08'],
    ['Time to first byte', '< 200ms (Vercel edge)', '400–800ms', '200–400ms'],
    ['Plugin dependencies', '0', '15–40', '10–20'],
  ]),
  a3.p([{text: 'Our '}, {text: 'Efedra Clinic build', href: '/en/portfolio/efedra-clinic'}, {text: ' holds an LCP of 0.8 seconds and a Lighthouse score of 98 — figures that come from not loading code the page doesn’t need, rather than from a caching plugin patching over a heavy theme.'}]),
  a3.h2('SEO — which stack helps you rank?'),
  a3.p('Server-side rendering is the quiet advantage. With Next.js, Googlebot receives full HTML on the first request, so there’s no wait for JavaScript to paint the content. Structured data sits in the templates, no plugin required.'),
  a3.p('WordPress can rank well, and Yoast or RankMath do help. They also add page weight, and the default category and tag archives can spawn duplicate-content problems if no one prunes them. The gap shows in practice: after moving from a slow platform to Next.js, Efedra reached the top three on Google for its primary keyword within three months.'),
  a3.h2('Developer experience and cost'),
  a3.p('For a technical reader weighing the hire, the trade-offs are concrete.'),
  a3.table(['Factor', 'Next.js', 'WordPress'], [
    ['Language', 'TypeScript / JavaScript (React)', 'PHP + JavaScript'],
    ['Developer pool (UK)', 'Smaller, specialist', 'Large, commoditised'],
    ['Hourly rate (UK)', '£60–£120/hr', '£30–£80/hr'],
    ['Update complexity', 'npm packages, predictable', 'Plugin conflicts, a common cause of breakage'],
    ['Hosting', 'Vercel — edge network, auto-scale', 'Managed WP hosting required'],
    ['Security patches', 'Framework-level, rare', 'Weekly plugin and core updates'],
  ]),
  a3.p('A Next.js developer costs more per hour. The codebase is also cleaner to hand over, so you spend fewer of those hours chasing a plugin conflict that broke a page after an update.'),
  a3.h2('Content editing — WordPress wins here'),
  a3.p('This is the honest counterpoint. If your site’s main job is publishing — a newsroom, a high-volume blog, a team of non-technical editors filing daily — the WordPress dashboard is hard to beat. It’s familiar, and the editing workflow is built for that pace. Sanity is good, and most clients edit from it happily, but it’s a different model. If you need ten or more posts a week from staff who don’t touch code, WordPress makes sense.'),
  a3.h2('When to choose Next.js'),
  a3.bullet('Performance is a priority — Core Web Vitals are a ranking factor, and local SEO rewards speed'),
  a3.bullet('You need custom integrations: booking, CRM, payments, more than one language'),
  a3.bullet('Your site is five to twenty-five pages and doesn’t need daily multi-author publishing'),
  a3.bullet('You want a fixed price and full code ownership, with the GitHub repo'),
  a3.bullet('You’re building a SaaS or product site that has to scale'),
  a3.h2('When to stick with WordPress'),
  a3.bullet('You publish twenty or more articles a month with a non-technical editorial team'),
  a3.bullet('You run WooCommerce for 200+ products with complex inventory'),
  a3.bullet('You already have a large WordPress site and the migration ROI is unclear'),
  a3.bullet('Your budget is under £1,500 and a template approach is acceptable'),
  a3.cta({
    eyebrow: 'See it in action',
    heading: 'Want to see Next.js performance for yourself?',
    sub: 'Browse the portfolio or book a free call — we’ll tell you honestly whether Next.js or WordPress fits your project.',
    ctaLabel: 'See the portfolio',
    ctaHref: '/en/portfolio',
    ctaSecondaryLabel: 'Book a free call',
    ctaSecondaryHref: '/en/contacts',
  }),
]
const faqEn3 = [
  ['Can Next.js sites be updated without a developer?', 'Yes, with Sanity CMS. Text, images and blog posts can be edited from a browser or phone, no code needed for standard updates.'],
  ['Does Next.js work for e-commerce?', 'Yes — we build e-commerce on Next.js with Stripe. For very large catalogues (500+ products), WooCommerce or Shopify can be more practical.'],
  ['Is Next.js harder to find developers for?', 'Slightly. The pool is smaller than WordPress, but the codebase is cleaner and any React developer can pick it up.'],
  ['Can I migrate my WordPress site to Next.js?', 'Yes. We handle migrations with full 301 redirect mapping and a Search Console hand-off, so SEO history is preserved. From £500.'],
  ['Is Next.js good for local SEO?', 'Yes. Server-side rendering means Google sees full HTML immediately, and with LocalBusiness schema it performs strongly for local searches.'],
]
const uk3 = [
  a3.tldr('За 60 секунд', [
    '**Next.js** сильніший для швидкості, SEO і масштабування. **WordPress** — для контент-важких сайтів. **Конструктори** — для тесту гіпотез і промо.',
    'Next.js із Sanity тримає Lighthouse **95–98**; WordPress — **50–70**; конструктор — 50–70 і 2–4с на мобільному.',
    'Для більшості українського МСБ на 5–20 сторінок, кому важливі позиції в Google і заявки, Next.js — кращий вибір.',
    'Питання не в тому, що новіше, а чи має сайт ранжуватись і конвертувати, чи публікувати великий обсяг контенту.',
  ]),
  a3.h2('Що таке Next.js?'),
  a3.p('Next.js — це React-фреймворк від Vercel. Він рендерить сторінки на сервері, оновлює їх за розкладом і віддає більшу частину сайту як статику з edge-мережі поруч із відвідувачем. На ньому працюють Nike, TikTok, Notion. Сам по собі це не CMS, а шар рендерингу. Ми поєднуємо його з Sanity, який відповідає за контент: редактор отримує зручну панель, а сайт зберігає швидкість.'),
  a3.h2('Порівняння швидкості — реальні цифри'),
  a3.p('Колонка Next.js — наші проєкти; WordPress і конструктор — типові ринкові діапазони.'),
  a3.table(['Метрика', 'Next.js (наші)', 'WordPress', 'Конструктор (Tilda/Wix)'], [
    ['Lighthouse', '95–98', '35–55', '50–70'],
    ['LCP', '0.6–1.2с', '3–6с', '2–4с'],
    ['INP', '< 100мс', '200–400мс', '150–300мс'],
    ['CLS', '< 0.01', '0.05–0.2', '0.05–0.15'],
    ['Плагіни/залежності', '0', '15–40', 'платформенні, без контролю'],
  ]),
  a3.p([{text: 'Наш проєкт '}, {text: '«Ефедра»', href: '/portfolio/efedra-clinic'}, {text: ' тримає LCP 0.8с і Lighthouse 98 — не завдяки кеш-плагіну, а тому що сторінка не вантажить зайвого.'}]),
  a3.h2('SEO — який стек допомагає ранжуватись'),
  a3.p('Server-side рендеринг — тиха перевага. З Next.js Googlebot отримує повний HTML одразу, без очікування JS. Schema лежить у шаблонах, без плагіна. WordPress може ранжуватись (Yoast, RankMath допомагають), але додає вагу, а архіви категорій і тегів плодять дублікати, якщо їх не чистити. Конструктор дає лише базовий контроль над SEO — без SSR і програмних landing. На практиці: після переходу на Next.js «Ефедра» вийшла в топ-3 Google за основним запитом за 3 місяці.'),
  a3.h2('Розробка і вартість'),
  a3.p('Для технічного читача компроміси конкретні. Розробник Next.js коштує за годину дорожче за WP-розробника, а конструктор «розробника» майже не вимагає — поки вам не треба вийти за межі шаблону, і тоді ви впираєтесь у стелю платформи. Кодова база Next.js чистіша при передачі: будь-який React-розробник підхопить проєкт, бо немає клубка плагінів, який ламається після оновлення.'),
  a3.table(['Фактор', 'Next.js', 'WordPress', 'Конструктор'], [
    ['Мова', 'TypeScript / React', 'PHP + JS', 'немає (візуальний редактор)'],
    ['Оновлення', 'npm, передбачувано', 'конфлікти плагінів', 'платформа сама'],
    ['Хостинг', 'Vercel, edge, авто-скейл', 'керований WP-хостинг', 'у підписці'],
    ['Власність коду', 'репозиторій ваш', 'ваш, але WP-екосистема', 'коду немає'],
    ['Стеля можливостей', 'висока', 'середня', 'низька'],
  ]),
  a3.h2('Редагування контенту — тут виграє WordPress'),
  a3.p('Чесний контраргумент. Якщо головна робота сайту — публікувати (новинний сайт, блог на великому обсязі, команда нетехнічних редакторів щодня), панель WordPress важко перевершити. Sanity хороший, і більшість клієнтів редагують у ньому без проблем, але це інша парадигма. Треба 10+ статей на тиждень від людей, що не торкаються коду — WordPress має сенс.'),
  a3.h2('Коли обрати Next.js'),
  a3.bullet('Швидкість — пріоритет: Core Web Vitals впливають на ранжування, локальний SEO любить швидкість'),
  a3.bullet('Потрібні інтеграції: бронювання, CRM, оплата, кілька мов'),
  a3.bullet('Сайт на 5–25 сторінок без щоденної багатоавторської публікації'),
  a3.bullet('Ви хочете фіксовану ціну і повне володіння кодом'),
  a3.bullet('Ви будуєте SaaS чи продуктовий сайт, який масштабуватиметься'),
  a3.h2('Коли лишитись на WordPress чи конструкторі'),
  a3.bullet('Ви публікуєте 20+ статей на місяць нетехнічною редакцією → WordPress'),
  a3.bullet('WooCommerce на 200+ товарів зі складною логістикою → WordPress'),
  a3.bullet('Тест гіпотези чи промо на 1–3 місяці → конструктор'),
  a3.bullet('Бюджет до $1,000 і шаблон влаштовує → конструктор'),
  a3.cta({
    eyebrow: 'Подивитись наживо',
    heading: 'Хочете побачити швидкість Next.js на ділі?',
    sub: 'Перегляньте портфоліо або запишіться на дзвінок — чесно скажемо, що вам підходить: Next.js, WordPress чи конструктор.',
    ctaLabel: 'Дивитись портфоліо',
    ctaHref: '/portfolio',
    ctaSecondaryLabel: 'Записатись на дзвінок',
    ctaSecondaryHref: '/contacts',
  }),
]
const faqUk3 = [
  ['Чи можна оновлювати сайт на Next.js без розробника?', 'Так, із Sanity CMS. Текст, зображення і статті редагуються з браузера або телефона, без коду для звичайних правок.'],
  ['Чи підходить Next.js для інтернет-магазину?', 'Так — будуємо e-commerce на Next.js зі Stripe. Для дуже великих каталогів (500+ товарів) WooCommerce або Shopify бувають практичніші.'],
  ['Чи складніше знайти розробника під Next.js?', 'Трохи. Пул менший за WordPress, але код чистіший, і його підхопить будь-який React-розробник.'],
  ['Чи можна мігрувати з WordPress або Tilda на Next.js?', 'Так. Робимо міграцію з 301-редиректами і передачею Search Console, SEO-історія зберігається. Від $500.'],
  ['Чи добрий Next.js для локального SEO?', 'Так. SSR означає, що Google бачить повний HTML одразу, а з LocalBusiness schema сайт показує сильні результати в локальному пошуку.'],
]

/* ── doc assembly ────────────────────────────────────────────────────────── */
const faq = (rows: string[][]) => rows.map(([question, answer], i) => ({_type: 'blogFaqItem', _key: `fq-${i}`, question, answer}))
const faqE = (rows: string[][]) => rows.map(([question, answer], i) => ({_type: 'blogFaqItemEn', _key: `fqe-${i}`, question, answer}))

const docs = [
  {
    _type: 'blogPost',
    status: 'published',
    category: {_type: 'reference', _ref: CAT_FINANCE},
    author: AUTHOR,
    publishedAt: PUB,
    updatedAt: PUB,
    readingTimeMinutes: 7,
    tags: ['pricing', 'UK', 'custom website'],
    title: 'Скільки коштує сайт у 2026: розбір реальних кошторисів',
    slug: {_type: 'slug', current: 'vartist-rozrobky-saytu-2026'},
    titleEn: 'How Much Does a Custom Website Cost in the UK in 2026?',
    slugEn: {_type: 'slug', current: 'custom-website-cost-uk-2026'},
    eyebrow: 'Ціни · 7 хв читання',
    eyebrowEn: 'Pricing · 7 min read',
    lede: 'Сайт у 2026 коштує від $1,000 до $14,000+. Ось що стоїть за кожною цифрою і як відрізнити чесний кошторис від розмитого.',
    ledeEn: 'A custom website in the UK runs from £800 to £14,000+. Here’s what sits behind each number, and how to tell an honest quote from a vague one.',
    coverImage: {
      src: '/blog/cover-skilky-koshtuye.webp',
      alt: 'Графік цін: Landing $1,000 / Industry Pro $3,500 / Pro Plus $7,500 / Custom $14,000+',
      altEn: 'Pricing chart: Landing £800 / Corporate £3,500 / Custom platform £6,000+',
    },
    body: uk1,
    bodyEn: en1,
    faq: faq(faqUk1),
    faqEn: faqE(faqEn1),
    metaTitle: 'Скільки коштує сайт у 2026: розбір реальних кошторисів | Code-Site.Art',
    metaTitleEn: 'How Much Does a Custom Website Cost in the UK in 2026? | Code-Site.Art',
    metaDescription: 'Чесний прайс: лендинг від $1,000, сайт під галузь від $3,500, кастомний продукт від $14,000. Що формує ціну, фікс vs погодинна, і реальні цифри з 47 проєктів.',
    metaDescriptionEn: 'Full UK pricing guide: landing page from £800, corporate website from £3,500, custom platform from £6,000. What affects the price, fixed vs hourly, and real quotes from a UK web studio.',
    relatedPostSlugs: ['tilda-vs-kastomnyy-sayt-2026', 'nextjs-proty-wordpress-ta-konstruktoriv'],
  },
  {
    _type: 'blogPost',
    status: 'published',
    category: {_type: 'reference', _ref: CAT_PLATFORMS},
    author: AUTHOR,
    publishedAt: PUB,
    updatedAt: PUB,
    readingTimeMinutes: 8,
    tags: ['WordPress', 'Tilda', 'comparison', 'custom website'],
    title: 'Tilda vs кастомний сайт у 2026: що обрати бізнесу',
    slug: {_type: 'slug', current: 'tilda-vs-kastomnyy-sayt-2026'},
    titleEn: 'Custom Website vs WordPress in 2026: Which Is Right for Your Business?',
    slugEn: {_type: 'slug', current: 'custom-website-vs-wordpress-2026'},
    eyebrow: 'Порівняння · 8 хв читання',
    eyebrowEn: 'Comparison · 8 min read',
    lede: 'Конструктор виглядає дешевшим, поки не додаси 36 місяців підписки і ціну переїзду. Ось чесне порівняння, аж до вартості за 3 роки.',
    ledeEn: 'WordPress runs 43% of the web, but it isn’t the right call for every UK business. Here’s the honest comparison, down to three-year cost.',
    coverImage: {
      src: '/blog/cover-tilda-7200.webp',
      alt: 'Графік кумулятивних витрат: Tilda дорожчає до $7,200 за 36 місяців проти разової покупки custom-коду $3,500',
      altEn: 'Cumulative cost chart: a hosted platform climbs to thousands over 36 months versus a one-off custom build',
    },
    body: uk2,
    bodyEn: en2,
    faq: faq(faqUk2),
    faqEn: faqE(faqEn2),
    metaTitle: 'Tilda vs кастомний сайт у 2026: що обрати бізнесу | Code-Site.Art',
    metaTitleEn: 'Custom Website vs WordPress in 2026: Which Is Right for Your Business? | Code-Site.Art',
    metaDescription: 'Чесне порівняння конструктора (Tilda, Wix, Webflow) і кастомного сайту: швидкість, SEO, lock-in і реальна вартість за 3 роки. Дані з 12 міграцій.',
    metaDescriptionEn: 'Honest comparison of custom-coded websites vs WordPress for UK businesses: speed, SEO, cost, flexibility and 3-year total cost, with real data from 47 projects.',
    relatedPostSlugs: ['vartist-rozrobky-saytu-2026', 'nextjs-proty-wordpress-ta-konstruktoriv'],
  },
  {
    _type: 'blogPost',
    status: 'published',
    category: {_type: 'reference', _ref: CAT_PLATFORMS},
    author: AUTHOR,
    publishedAt: PUB,
    updatedAt: PUB,
    readingTimeMinutes: 7,
    tags: ['Next.js', 'WordPress', 'technical', 'performance'],
    title: 'Next.js проти WordPress і конструкторів у 2026',
    slug: {_type: 'slug', current: 'nextjs-proty-wordpress-ta-konstruktoriv'},
    titleEn: 'Next.js vs WordPress for Business Websites in 2026',
    slugEn: {_type: 'slug', current: 'nextjs-vs-wordpress-for-business-2026'},
    eyebrow: 'Технічне · 7 хв читання',
    eyebrowEn: 'Technical · 7 min read',
    lede: 'Пряме технічне порівняння Next.js, WordPress і конструкторів для бізнес-сайту — швидкість, SEO, вартість і коли який стек доречний.',
    ledeEn: 'A straight technical read on Next.js vs WordPress for a business site — performance, SEO, cost and when each stack is the right call.',
    body: uk3,
    bodyEn: en3,
    faq: faq(faqUk3),
    faqEn: faqE(faqEn3),
    metaTitle: 'Next.js проти WordPress і конструкторів у 2026 | Code-Site.Art',
    metaTitleEn: 'Next.js vs WordPress for Business Websites in 2026 | Code-Site.Art',
    metaDescription: 'Технічне порівняння: Next.js, WordPress і конструктори (Tilda/Wix) для бізнес-сайту. Швидкість, SEO, вартість і коли який стек обрати.',
    metaDescriptionEn: 'Technical comparison: Next.js vs WordPress for UK business websites. Performance benchmarks, SEO, cost and scalability, and when to choose each stack.',
    relatedPostSlugs: ['vartist-rozrobky-saytu-2026', 'tilda-vs-kastomnyy-sayt-2026'],
  },
]

/* ── run ─────────────────────────────────────────────────────────────────── */
async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (creating docs)' : 'DRY-RUN (no writes)'}`)
  console.log('='.repeat(78))
  for (const d of docs) {
    const countBlocks = (b: any[]) => ({
      blocks: b.filter((x) => x._type === 'block').length,
      tables: b.filter((x) => x._type === 'blogTable').length,
      tldr: b.filter((x) => x._type === 'tldrBox').length,
      cta: b.filter((x) => x._type === 'ctaCallout').length,
    })
    console.log(`\n• ${d.slugEn.current}  /  ${d.slug.current}`)
    console.log(`  titleEn: ${d.titleEn}`)
    console.log(`  bodyEn:`, countBlocks(d.bodyEn), '| faqEn:', d.faqEn.length)
    console.log(`  body  :`, countBlocks(d.body), '| faq  :', d.faq.length)
    console.log(`  cover : ${d.coverImage ? d.coverImage.src : '(none)'} | cat: ${d.category._ref} | pub: ${d.publishedAt}`)
    if (APPLY) {
      const res = await client.create(d)
      console.log(`  → created _id: ${res._id}`)
    }
  }
  console.log('\n' + '='.repeat(78))
  console.log(`${docs.length} docs ${APPLY ? 'created' : 'previewed'}.`)
  if (!APPLY) console.log('(Re-run with -- --apply to write.)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
