/**
 * Job #168: create the «Янголи Хвостиків» (Angels of Tails, angelsua.org)
 * case study (UK/EN/RU).
 *
 * Facts verified against the local repos (yangoly-hvostikiv-site +
 * yangoly-admin) and the live site:
 *   Next.js 16 + Sanity (next-sanity), next-intl uk/en, static-first pages
 *   invalidated by a signed Sanity webhook (no TTL), editor preview mode,
 *   Playwright/Vitest tests + bundle budget checks, Vercel hosting.
 *   Donations: WayForPay one-time + monthly guardianship (recurring managed
 *   by WayForPay, guardianship amount = keeping_price from Sanity verified
 *   server-side; card/Google Pay/Apple Pay), Monobank jars for quick
 *   one-time help and collections. Event registration writes rows to
 *   Google Sheets. 29 pet profiles (tails), 23 monthly financial reports
 *   (since Sep 2024), charity events, partnership, volunteering, blog.
 *   Built from 2025-03 and actively maintained.
 *
 * Dry-run:
 *   npx sanity exec scripts/create-yangoly-case.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/create-yangoly-case.ts --with-user-token -- --apply
 */

import {createReadStream, existsSync} from 'node:fs'
import {join} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const COUNTRY_UA = '6tWqPRZWZzG4Lv3HK7JDxa'
const BUDGET_3_7K = 'lOTgaDd8FU4wgJ8F4KAXLu'

const SCRATCH =
  process.env.YANGOLY_SHOTS_DIR ??
  'C:/Users/kulak/AppData/Local/Temp/claude/C--GitHub23-code-site-workspace/01ca57ff-5e65-4f80-b528-ccb559671066/scratchpad'

const IMAGES: Record<string, [string, string]> = {
  hero: [join(SCRATCH, 'ref/angels-hero.png'), 'yangoly-hero-mockup.png'],
  cover: [join(SCRATCH, 'ref/angels-cover.png'), 'yangoly-cover-mockup.png'],
  phTail: [join(SCRATCH, 'ref/angels-single-ph-tail.png'), 'yangoly-tail-phone.png'],
  lapReporting: [join(SCRATCH, 'ref/angels-single-lap-reporting.png'), 'yangoly-reporting-laptop.png'],
  phEvents: [join(SCRATCH, 'ref/angels-single-ph-events.png'), 'yangoly-events-phone.png'],
  lapPartnership: [join(SCRATCH, 'ref/angels-single-lap-partnership.png'), 'yangoly-partnership-laptop.png'],
  home: [join(SCRATCH, 'ang/desk-home.png'), 'yangoly-home-desktop.png'],
  tailDetail: [join(SCRATCH, 'ang/desk-tail-detail.png'), 'yangoly-tail-profile.png'],
  reportDetail: [join(SCRATCH, 'ang/desk-report-detail.png'), 'yangoly-report-detail.png'],
  blog: [join(SCRATCH, 'ang/desk-blog.png'), 'yangoly-blog.png'],
  volunteering: [join(SCRATCH, 'ang/desk-volunteering.png'), 'yangoly-volunteering.png'],
  events: [join(SCRATCH, 'ang/desk-events.png'), 'yangoly-events.png'],
}

type Loc = {uk: string; en: string; ru: string}

const ls = (uk: string, en: string, ru: string) => ({
  _type: 'localizedString',
  uk,
  en,
  ru,
})

const img = (ref: string, alt: Loc) => ({
  _type: 'imageWithLocalizedAlt',
  alt: {_type: 'localizedString', ...alt},
  image: {_type: 'image', asset: {_ref: ref, _type: 'reference'}},
})

const block = (key: string, lang: string, text: string) => [
  {
    _key: `yng-b-${key}-${lang}`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `yng-s-${key}-${lang}`, _type: 'span', marks: [], text}],
  },
]

const body = (key: string, uk: string, en: string, ru: string) => ({
  uk: block(key, 'uk', uk),
  en: block(key, 'en', en),
  ru: block(key, 'ru', ru),
})

const li = (key: string, uk: string, en: string, ru: string) => ({
  _key: `yng-li-${key}`,
  uk,
  en,
  ru,
})

const metric = (key: string, value: Loc, label: Loc) => ({
  _key: `yng-m-${key}`,
  _type: 'metric',
  value: {uk: value.uk, en: value.en, ru: value.ru},
  label: {uk: label.uk, en: label.en, ru: label.ru},
})

function buildDoc(a: Record<string, string>) {
  return {
    _type: 'caseStudy',
    title: {uk: 'Янголи Хвостиків', en: 'Angels of Tails', ru: 'Янголи Хвостиків'},
    slug: {_type: 'slug', current: 'yangoly-hvostykiv'},
    status: 'published',
    client: 'БФ «Янголи Хвостиків»',
    country: {_ref: COUNTRY_UA, _type: 'reference'},
    region: ls('Україна', 'Ukraine', 'Украина'),
    year: 2025,
    stack: ['Next.js', 'Sanity', 'WayForPay', 'Vercel'],
    metricsLine: ls(
      '29 анкет хвостиків · 23 звіти · опікунство через WayForPay',
      '29 pet profiles · 23 reports · WayForPay guardianship',
      '29 анкет хвостиков · 23 отчёта · опекунство через WayForPay',
    ),
    featured: false,
    order: 11,
    coverImage: img(a.cover, {
      uk: 'Янголи Хвостиків — сайт благодійного фонду з каталогом тварин на ноутбуці і телефоні',
      en: 'Angels of Tails - charity foundation site with the pet catalogue on laptop and phone',
      ru: 'Янголи Хвостиків — сайт благотворительного фонда с каталогом животных на ноутбуке и телефоне',
    }),
    hero: {
      eyebrow: ls('/ CASE STUDY', '/ CASE STUDY', '/ CASE STUDY'),
      heading: ls(
        'Янголи Хвостиків — сайт благодійного фонду з *онлайн-опікунством* тварин',
        'Angels of Tails - a charity foundation website with *online pet guardianship*',
        'Янголи Хвостиків — сайт благотворительного фонда с *онлайн-опекунством* животных',
      ),
      subheading: ls(
        'Янголи Хвостиків — фонд допомоги безпритульним тваринам. Ми створили двомовний сайт з анкетами хвостиків, щомісячною фінансовою звітністю та донатами онлайн: разова допомога, банки Monobank і регулярне опікунство через WayForPay.',
        'Angels of Tails is a foundation helping homeless animals. We built a bilingual site with pet profiles, monthly financial reports and online donations: one-time help, Monobank jars and recurring guardianship via WayForPay.',
        'Янголи Хвостиків — фонд помощи бездомным животным. Мы создали двуязычный сайт с анкетами хвостиков, ежемесячной финансовой отчётностью и донатами онлайн: разовая помощь, банки Monobank и регулярное опекунство через WayForPay.',
      ),
      link: {_type: 'ctaAction', href: 'https://angelsua.org/uk', type: 'custom'},
      heroImage: img(a.hero, {
        uk: 'Сайт Янголи Хвостиків на ноутбуці і телефоні з формою донату на головній',
        en: 'Angels of Tails website on laptop and phone with the donation panel on the homepage',
        ru: 'Сайт Янголи Хвостиків на ноутбуке и телефоне с формой доната на главной',
      }),
    },
    sections: [
      {
        _key: 'yng-stats',
        _type: 'statsBlock',
        items: [
          metric(
            '1',
            {uk: '29', en: '29', ru: '29'},
            {
              uk: 'анкет хвостиків у каталозі',
              en: 'pet profiles in the catalogue',
              ru: 'анкет хвостиков в каталоге',
            },
          ),
          metric(
            '2',
            {uk: '23', en: '23', ru: '23'},
            {
              uk: 'публічні місячні звіти',
              en: 'public monthly reports',
              ru: 'публичных месячных отчёта',
            },
          ),
          metric(
            '3',
            {uk: '3', en: '3', ru: '3'},
            {
              uk: 'способи допомогти онлайн',
              en: 'ways to help online',
              ru: 'способа помочь онлайн',
            },
          ),
          metric(
            '4',
            {uk: '2', en: '2', ru: '2'},
            {
              uk: 'мови: українська й англійська',
              en: 'languages: Ukrainian and English',
              ru: 'языка: украинский и английский',
            },
          ),
        ],
      },
      {
        _key: 'yng-challenge',
        _type: 'imageTextBlock',
        variant: 'centered',
        centeredLayout: 'horizontal',
        eyebrow: ls('/ CHALLENGE', '/ CHALLENGE', '/ CHALLENGE'),
        heading: ls('Завдання *проєкту*', 'The project *challenge*', 'Задачи *проекта*'),
        body: body(
          'ch',
          'Фонду потрібна була не сайт-візитка, а робочий інструмент: показувати тварин, які шукають дім, збирати допомогу без ручної обробки платежів і будувати довіру через прозорість. Окрема вимога — щоб команда фонду вела контент самостійно, без розробника.',
          'The foundation needed a working tool, not a brochure site: show animals looking for a home, collect help without manual payment processing and build trust through transparency. A separate requirement - the team had to run the content themselves, without a developer.',
          'Фонду нужен был не сайт-визитка, а рабочий инструмент: показывать животных, которые ищут дом, собирать помощь без ручной обработки платежей и строить доверие через прозрачность. Отдельное требование — чтобы команда фонда вела контент самостоятельно, без разработчика.',
        ),
        bulletIcon: 'dot',
        bulletList: [
          li(
            'ch-1',
            'Анкети тварин з фільтрами за статусом',
            'Pet profiles with status filters',
            'Анкеты животных с фильтрами по статусу',
          ),
          li(
            'ch-2',
            'Донати без ручної обробки: разові та щомісячні',
            'Donations without manual processing: one-time and monthly',
            'Донаты без ручной обработки: разовые и ежемесячные',
          ),
          li(
            'ch-3',
            'Опікунство над конкретним хвостиком',
            'Guardianship of a specific pet',
            'Опекунство над конкретным хвостиком',
          ),
          li(
            'ch-4',
            'Прозорість: публічні фінансові звіти щомісяця',
            'Transparency: public monthly financial reports',
            'Прозрачность: публичные финансовые отчёты ежемесячно',
          ),
          li(
            'ch-5',
            'Дві мови: українська та англійська',
            'Two languages: Ukrainian and English',
            'Два языка: украинский и английский',
          ),
          li(
            'ch-6',
            'Контент редагує команда фонду без розробника',
            'Content edited by the foundation team without a developer',
            'Контент редактирует команда фонда без разработчика',
          ),
        ],
        image: img(a.phTail, {
          uk: 'Анкета кошеняти Шелдона на телефоні з кнопками допомоги',
          en: 'Kitten Sheldon\u2019s profile on a phone with help buttons',
          ru: 'Анкета котёнка Шелдона на телефоне с кнопками помощи',
        }),
        image2: img(a.lapReporting, {
          uk: 'Розділ фінансової звітності Янголи Хвостиків на ноутбуці',
          en: 'Angels of Tails financial reporting section on a laptop',
          ru: 'Раздел финансовой отчётности Янголи Хвостиків на ноутбуке',
        }),
      },
      {
        _key: 'yng-solution',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageLeft',
        eyebrow: ls('/ SOLUTION', '/ SOLUTION', '/ SOLUTION'),
        heading: ls('Що ми *зробили*', 'What we *did*', 'Что мы *сделали*'),
        body: body(
          'sol',
          'Розробили сайт на Next.js із Sanity CMS: головна з формою донату, каталог хвостиків з фільтрами й окремими анкетами, розділ фінансової звітності, благодійні події з онлайн-реєстрацією, сторінки волонтерства й партнерства та блог. Сторінки генеруються статично на етапі збірки та миттєво оновлюються вебхуком із CMS — сайт швидкий і не залежить від бази даних під навантаженням.',
          'We built the site on Next.js with Sanity CMS: a homepage with the donation panel, a pet catalogue with filters and individual profiles, a financial reporting section, charity events with online registration, volunteering and partnership pages and a blog. Pages are generated statically at build time and instantly refreshed by a CMS webhook - the site is fast and independent of a database under load.',
          'Разработали сайт на Next.js с Sanity CMS: главная с формой доната, каталог хвостиков с фильтрами и отдельными анкетами, раздел финансовой отчётности, благотворительные события с онлайн-регистрацией, страницы волонтёрства и партнёрства и блог. Страницы генерируются статически на этапе сборки и мгновенно обновляются вебхуком из CMS — сайт быстрый и не зависит от базы данных под нагрузкой.',
        ),
        bulletIcon: 'check',
        bulletList: [
          li(
            'sol-1',
            'Каталог хвостиків: анкети, фото, статуси й фільтри',
            'Pet catalogue: profiles, photos, statuses and filters',
            'Каталог хвостиков: анкеты, фото, статусы и фильтры',
          ),
          li(
            'sol-2',
            'Щомісячні фінансові звіти у відкритому доступі',
            'Monthly financial reports in open access',
            'Ежемесячные финансовые отчёты в открытом доступе',
          ),
          li(
            'sol-3',
            'Події з онлайн-реєстрацією — заявки в Google Sheets',
            'Events with online registration - entries go to Google Sheets',
            'События с онлайн-регистрацией — заявки в Google Sheets',
          ),
          li(
            'sol-4',
            'Сторінки волонтерства та партнерства',
            'Volunteering and partnership pages',
            'Страницы волонтёрства и партнёрства',
          ),
          li(
            'sol-5',
            'Двомовність: українська та англійська версії',
            'Bilingual: Ukrainian and English versions',
            'Двуязычность: украинская и английская версии',
          ),
          li(
            'sol-6',
            'Sanity CMS з режимом попереднього перегляду',
            'Sanity CMS with an editor preview mode',
            'Sanity CMS с режимом предпросмотра',
          ),
          li(
            'sol-7',
            'Static-first: миттєві сторінки, оновлення вебхуком',
            'Static-first: instant pages, webhook-driven updates',
            'Static-first: мгновенные страницы, обновление вебхуком',
          ),
          li(
            'sol-8',
            'Автотести Playwright і Vitest, контроль розміру бандла',
            'Playwright and Vitest tests, bundle size budgets',
            'Автотесты Playwright и Vitest, контроль размера бандла',
          ),
        ],
        image: img(a.home, {
          uk: 'Головна сторінка Янголи Хвостиків з формою донату і сумами допомоги',
          en: 'Angels of Tails homepage with the donation panel and preset amounts',
          ru: 'Главная страница Янголи Хвостиків с формой доната и суммами помощи',
        }),
      },
      {
        _key: 'yng-donations',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageRight',
        eyebrow: ls('/ DONATIONS', '/ DONATIONS', '/ DONATIONS'),
        heading: ls(
          'Опікунство і донати *онлайн*',
          'Guardianship and donations *online*',
          'Опекунство и донаты *онлайн*',
        ),
        body: body(
          'don',
          'Кожна анкета пропонує три дії: взяти в родину, разова допомога або стати опікуном. Опікунство — щомісячний платіж через WayForPay: суму утримання конкретного хвостика сайт перевіряє на сервері за даними CMS, а розклад списань веде платіжна система — фонд не торкається карткових даних. Швидка разова допомога та збори працюють через банки Monobank.',
          'Every profile offers three actions: adopt, one-time help or become a guardian. Guardianship is a monthly WayForPay payment: the site verifies the pet\u2019s keeping cost server-side against the CMS, and the payment system owns the charge schedule - the foundation never touches card data. Quick one-time help and collections run through Monobank jars.',
          'Каждая анкета предлагает три действия: взять в семью, разовая помощь или стать опекуном. Опекунство — ежемесячный платёж через WayForPay: сумму содержания конкретного хвостика сайт проверяет на сервере по данным CMS, а расписание списаний ведёт платёжная система — фонд не касается карточных данных. Быстрая разовая помощь и сборы работают через банки Monobank.',
        ),
        bulletIcon: 'check',
        bulletList: [
          li(
            'don-1',
            'Щомісячне опікунство через WayForPay (recurring)',
            'Monthly guardianship via WayForPay (recurring)',
            'Ежемесячное опекунство через WayForPay (recurring)',
          ),
          li(
            'don-2',
            'Сума утримання перевіряється на сервері за даними CMS',
            'Keeping cost verified server-side against the CMS',
            'Сумма содержания проверяется на сервере по данным CMS',
          ),
          li(
            'don-3',
            'Разова допомога та збори — банки Monobank',
            'One-time help and collections - Monobank jars',
            'Разовая помощь и сборы — банки Monobank',
          ),
          li(
            'don-4',
            'Оплата карткою, Google Pay та Apple Pay',
            'Card, Google Pay and Apple Pay payments',
            'Оплата картой, Google Pay и Apple Pay',
          ),
        ],
        image: img(a.tailDetail, {
          uk: 'Анкета хвостика з кнопками «Взяти в родину», «Разова допомога» і «Стати опікуном»',
          en: 'Pet profile with adopt, one-time help and become-a-guardian buttons',
          ru: 'Анкета хвостика с кнопками «Взять в семью», «Разовая помощь» и «Стать опекуном»',
        }),
      },
      {
        _key: 'yng-gallery',
        _type: 'mediaGalleryBlock',
        enableLightbox: true,
        images: [
          {
            _key: 'yng-g-1',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.reportDetail, _type: 'reference'}},
            alt: ls(
              'Місячний фінансовий звіт фонду Янголи Хвостиків',
              'Angels of Tails monthly financial report page',
              'Месячный финансовый отчёт фонда Янголи Хвостиків',
            ),
            caption: ls('Місячний звіт', 'Monthly report', 'Месячный отчёт'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'yng-g-2',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.events, _type: 'reference'}},
            alt: ls(
              'Сторінка благодійних заходів з фотографіями подій',
              'Charity events page with event photos',
              'Страница благотворительных мероприятий с фотографиями событий',
            ),
            caption: ls('Благодійні заходи', 'Charity events', 'Благотворительные мероприятия'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'yng-g-3',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.volunteering, _type: 'reference'}},
            alt: ls(
              'Сторінка волонтерства фонду Янголи Хвостиків',
              'Angels of Tails volunteering page',
              'Страница волонтёрства фонда Янголи Хвостиків',
            ),
            caption: ls('Волонтерство', 'Volunteering', 'Волонтёрство'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'yng-g-4',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.blog, _type: 'reference'}},
            alt: ls(
              'Блог фонду Янголи Хвостиків',
              'Angels of Tails foundation blog',
              'Блог фонда Янголи Хвостиків',
            ),
            caption: ls('Блог', 'Blog', 'Блог'),
            displayMode: 'general',
            objectPosition: 'center',
          },
        ],
      },
      {
        _key: 'yng-outcome',
        _type: 'imageTextBlock',
        variant: 'centered',
        centeredLayout: 'horizontal',
        eyebrow: ls('/ OUTCOME', '/ OUTCOME', '/ OUTCOME'),
        heading: ls('Результат', 'Result', 'Результат'),
        body: body(
          'out',
          'Фонд отримав сайт, який працює одночасно як каталог тварин, платформа донатів і публічний звіт. Анкети приводять людей до конкретних хвостиків, опікунство дає регулярні щомісячні надходження без ручної обробки, а відкрита звітність будує довіру. Контент — анкети, звіти, події й блог — команда веде самостійно в Sanity.',
          'The foundation got a site that works as a pet catalogue, a donation platform and a public report at once. Profiles lead people to specific pets, guardianship brings recurring monthly income without manual processing, and open reporting builds trust. The team runs all content - profiles, reports, events and the blog - in Sanity on their own.',
          'Фонд получил сайт, который работает одновременно как каталог животных, платформа донатов и публичный отчёт. Анкеты приводят людей к конкретным хвостикам, опекунство даёт регулярные ежемесячные поступления без ручной обработки, а открытая отчётность строит доверие. Контент — анкеты, отчёты, события и блог — команда ведёт самостоятельно в Sanity.',
        ),
        image: img(a.phEvents, {
          uk: 'Сторінка благодійних заходів Янголи Хвостиків на телефоні',
          en: 'Angels of Tails charity events page on a phone',
          ru: 'Страница благотворительных мероприятий Янголи Хвостиків на телефоне',
        }),
        image2: img(a.lapPartnership, {
          uk: 'Сторінка партнерства Янголи Хвостиків на ноутбуці',
          en: 'Angels of Tails partnership page on a laptop',
          ru: 'Страница партнёрства Янголи Хвостиків на ноутбуке',
        }),
      },
    ],
    seo: {
      title: {
        uk: 'Янголи Хвостиків — кейс | Code-Site.Art',
        en: 'ᐈ Angels of Tails — Charity Foundation Website Case Study | Code-Site.Art',
        ru: 'Янголи Хвостиків — кейс | Code-Site.Art',
      },
      description: {
        uk: 'Сайт благодійного фонду Янголи Хвостиків: анкети тварин, онлайн-опікунство через WayForPay, банки Monobank, місячна фінансова звітність і дві мови.',
        en: '➤ Charity foundation website ✔️ Pet adoption profiles ✔️ Recurring guardianship via WayForPay ✔️ Monobank jars ✔️ Monthly financial reports ✔️ Ukrainian + English ➡ See the full case study.',
        ru: 'Сайт благотворительного фонда Янголи Хвостиків: анкеты животных, онлайн-опекунство через WayForPay, банки Monobank, месячная финансовая отчётность и два языка.',
      },
    },
  }
}

async function main() {
  const existing = await client.fetch(
    '*[_type == "caseStudy" && slug.current == "yangoly-hvostykiv"][0]{_id}',
  )
  if (existing?._id) {
    console.log(`Case already exists: ${existing._id} — aborting.`)
    return
  }

  for (const [slot, [path]] of Object.entries(IMAGES)) {
    if (!existsSync(path)) throw new Error(`Missing image for ${slot}: ${path}`)
  }

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — create caseStudy "yangoly-hvostykiv"`)
  console.log(`Images: ${Object.keys(IMAGES).length} to upload`)

  if (!APPLY) {
    const doc = buildDoc(
      Object.fromEntries(Object.keys(IMAGES).map((k) => [k, `<${k}-asset>`])),
    )
    console.log(
      JSON.stringify(
        {title: doc.title, slug: doc.slug, sections: doc.sections.map((s) => s._type)},
        null,
        2,
      ),
    )
    console.log('\nDry-run only. Re-run with -- --apply to write.')
    return
  }

  const assets: Record<string, string> = {}
  for (const [slot, [path, filename]] of Object.entries(IMAGES)) {
    const uploaded = await client.assets.upload('image', createReadStream(path), {filename})
    assets[slot] = uploaded._id
    console.log(`Uploaded ${slot}: ${uploaded._id}`)
  }

  const created = await client.create(buildDoc(assets) as never)
  console.log(`Created ${created._id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
