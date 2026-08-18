/**
 * Job #163: create the Grønt Land DK case study (UK/EN/RU) and link it as a
 * related case on the renovation industry page.
 *
 * Facts sourced from the grotland-workspace code + live grontland.dk + its
 * Sanity dataset (s5oo4i9a):
 *   Danish-language site (deliberately single-locale after client feedback),
 *   22 pages in the sitemap: home, services index + 8 service pages, private
 *   and contractor (B2B) landings, project catalogue + 6 project case pages,
 *   gallery (7 categories), about, contacts. Quote form sends enquiries with
 *   up to 5 photos straight to the company's Telegram chat (honeypot, no
 *   captcha). Sanity CMS: page singletons + services/projects/gallery
 *   collections, edited without a developer. JSON-LD (LocalBusiness /
 *   Service / FAQ / breadcrumbs), sitemap + hreflang, AVIF/WebP images,
 *   React Compiler. Stack: Next.js 16, Sanity, Tailwind CSS 4, Telegram Bot
 *   API. Deliberately NOT claimed: multilingual UI (stripped), public
 *   prices (removed at client request), booking/CRM (absent).
 *
 * Images: composed hero/cover mockups + 10 desktop screenshots of the live
 * site, uploaded from SHOTS_DIR (session scratchpad; override via env).
 *
 * Dry-run:
 *   npx sanity exec scripts/create-grontland-case.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/create-grontland-case.ts --with-user-token -- --apply
 */

import {createReadStream, existsSync} from 'node:fs'
import {join} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const INDUSTRY_RENOVATION = 'lOTgaDd8FU4wgJ8F4KCHn9'
const COUNTRY_DK = 'DHIwRDN3sEoI638qoYQ0tX'
const BUDGET_3_7K = 'lOTgaDd8FU4wgJ8F4KAXLu'

const SCRATCH =
  process.env.GRONTLAND_SHOTS_DIR ??
  'C:/Users/kulak/AppData/Local/Temp/claude/C--GitHub23-code-site-workspace/01ca57ff-5e65-4f80-b528-ccb559671066/scratchpad'

/** slot -> [file, upload filename] */
const IMAGES: Record<string, [string, string]> = {
  hero: [join(SCRATCH, 'ref/grontland-hero.png'), 'grontland-hero-mockup.png'],
  cover: [join(SCRATCH, 'ref/grontland-cover.png'), 'grontland-cover-mockup.png'],
  home: [join(SCRATCH, 'shots/desk-home.png'), 'grontland-home-desktop.png'],
  private: [join(SCRATCH, 'shots/desk-private.png'), 'grontland-private-landing.png'],
  b2b: [join(SCRATCH, 'shots/desk-entreprenorer.png'), 'grontland-contractors-landing.png'],
  kontakt: [join(SCRATCH, 'shots/desk-kontakt.png'), 'grontland-contact-form.png'],
  ydelser: [join(SCRATCH, 'shots/desk-ydelser.png'), 'grontland-services-index.png'],
  service: [join(SCRATCH, 'shots/desk-service-belaeg.png'), 'grontland-paving-service.png'],
  projekter: [join(SCRATCH, 'shots/desk-projekter.png'), 'grontland-projects.png'],
  galleri: [join(SCRATCH, 'shots/desk-galleri.png'), 'grontland-gallery.png'],
  project: [join(SCRATCH, 'shots/desk-project-detail.png'), 'grontland-project-detail.png'],
  omos: [join(SCRATCH, 'shots/desk-om-os.png'), 'grontland-about-team.png'],
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
    _key: `grl-b-${key}-${lang}`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `grl-s-${key}-${lang}`, _type: 'span', marks: [], text}],
  },
]

const body = (key: string, uk: string, en: string, ru: string) => ({
  uk: block(key, 'uk', uk),
  en: block(key, 'en', en),
  ru: block(key, 'ru', ru),
})

const li = (key: string, uk: string, en: string, ru: string) => ({
  _key: `grl-li-${key}`,
  uk,
  en,
  ru,
})

const metric = (key: string, value: Loc, label: Loc) => ({
  _key: `grl-m-${key}`,
  _type: 'metric',
  value: {uk: value.uk, en: value.en, ru: value.ru},
  label: {uk: label.uk, en: label.en, ru: label.ru},
})

function buildDoc(a: Record<string, string>) {
  return {
    _type: 'caseStudy',
    title: {uk: 'Grønt Land DK', en: 'Grønt Land DK', ru: 'Grønt Land DK'},
    slug: {_type: 'slug', current: 'grontland'},
    status: 'published',
    client: 'Grønt Land DK',
    industry: {_ref: INDUSTRY_RENOVATION, _type: 'reference'},
    country: {_ref: COUNTRY_DK, _type: 'reference'},
    region: ls('Копенгаген, Данія', 'Copenhagen, Denmark', 'Копенгаген, Дания'),
    year: 2026,
    stack: ['Next.js', 'Sanity', 'Tailwind CSS', 'Telegram Bot API'],
    metricsLine: ls(
      '8 послуг · 6 проєктів · заявки з фото в Telegram',
      '8 services · 6 projects · photo enquiries to Telegram',
      '8 услуг · 6 проектов · заявки с фото в Telegram',
    ),
    featured: false,
    order: 9,
    coverImage: img(a.cover, {
      uk: 'Grønt Land DK — сайт для ремонтно-будівельної компанії в Копенгагені на ноутбуці і телефоні',
      en: 'Grønt Land DK - site for a Copenhagen renovation company on laptop and phone',
      ru: 'Grønt Land DK — сайт для ремонтно-строительной компании в Копенгагене на ноутбуке и телефоне',
    }),
    hero: {
      eyebrow: ls('/ CASE STUDY', '/ CASE STUDY', '/ CASE STUDY'),
      heading: ls(
        'Grønt Land DK — сайт для *ремонтно-будівельної компанії* в Копенгагені',
        'Grønt Land DK - a website for a *renovation and construction company* in Copenhagen',
        'Grønt Land DK — сайт для *ремонтно-строительной компании* в Копенгагене',
      ),
      subheading: ls(
        'Grønt Land DK — данська компанія з ремонту, благоустрою і будівництва. Сайт данською мовою: 8 послуг, реальні проєкти, галерея робіт і заявки з фото просто в Telegram.',
        'Grønt Land DK is a Danish renovation, landscaping and construction company. A Danish-language site: 8 services, real projects, a work gallery and photo enquiries straight to Telegram.',
        'Grønt Land DK — датская компания по ремонту, благоустройству и строительству. Сайт на датском языке: 8 услуг, реальные проекты, галерея работ и заявки с фото прямо в Telegram.',
      ),
      link: {_type: 'ctaAction', href: 'https://grontland.dk', type: 'custom'},
      heroImage: img(a.hero, {
        uk: 'Сайт Grønt Land DK на ноутбуці і телефоні з данською головною сторінкою',
        en: 'Grønt Land DK website shown on laptop and phone with the Danish homepage',
        ru: 'Сайт Grønt Land DK на ноутбуке и телефоне с датской главной страницей',
      }),
    },
    sections: [
      {
        _key: 'grl-stats',
        _type: 'statsBlock',
        items: [
          metric(
            '1',
            {uk: '8', en: '8', ru: '8'},
            {
              uk: 'послуг зі своїми сторінками',
              en: 'services with dedicated pages',
              ru: 'услуг со своими страницами',
            },
          ),
          metric(
            '2',
            {uk: '6', en: '6', ru: '6'},
            {
              uk: 'проєктів у каталозі робіт',
              en: 'projects in the work catalogue',
              ru: 'проектов в каталоге работ',
            },
          ),
          metric(
            '3',
            {uk: '7', en: '7', ru: '7'},
            {
              uk: 'категорій у галереї',
              en: 'gallery categories',
              ru: 'категорий в галерее',
            },
          ),
          metric(
            '4',
            {uk: '22', en: '22', ru: '22'},
            {
              uk: 'сторінки в sitemap',
              en: 'pages in the sitemap',
              ru: 'страницы в sitemap',
            },
          ),
        ],
      },
      {
        _key: 'grl-challenge',
        _type: 'imageTextBlock',
        variant: 'centered',
        centeredLayout: 'horizontal',
        imageVariant: 'imageRight',
        eyebrow: ls('/ CHALLENGE', '/ CHALLENGE', '/ CHALLENGE'),
        heading: ls('З чим прийшов *клієнт*', 'What *the client* came with', 'С чем пришёл *клиент*'),
        body: body(
          'ch',
          'Grønt Land DK працює в Копенгагені з двома різними аудиторіями: приватні власники житла замовляють ремонт і благоустрій, а підрядники беруть компанію на субпідряд на великих обʼєктах. Потрібен був сайт данською, який говорить з обома — і доводить досвід реальними роботами, а не обіцянками.',
          'Grønt Land DK works in Copenhagen with two very different audiences: private homeowners order renovation and landscaping, while contractors hire the company as a subcontractor on large sites. They needed a Danish-language site that speaks to both - and proves experience with real work, not promises.',
          'Grønt Land DK работает в Копенгагене с двумя разными аудиториями: частные владельцы жилья заказывают ремонт и благоустройство, а подрядчики берут компанию на субподряд на крупных объектах. Нужен был сайт на датском, который говорит с обеими — и доказывает опыт реальными работами, а не обещаниями.',
        ),
        bulletIcon: 'dot',
        bulletList: [
          li(
            'ch-1',
            'Дві аудиторії: приватні клієнти та підрядники (B2B)',
            'Two audiences: private homeowners and contractors (B2B)',
            'Две аудитории: частные клиенты и подрядчики (B2B)',
          ),
          li(
            'ch-2',
            '8 напрямів послуг — кожен зі своєю сторінкою',
            '8 service lines - each with its own page',
            '8 направлений услуг — каждое со своей страницей',
          ),
          li(
            'ch-3',
            'Показати реальні роботи: проєкти з фото і галерея',
            'Show real work: photo project pages and a gallery',
            'Показать реальные работы: проекты с фото и галерея',
          ),
          li(
            'ch-4',
            'Данська мова і локальне SEO під Копенгаген',
            'Danish language and local SEO for Copenhagen',
            'Датский язык и локальное SEO под Копенгаген',
          ),
        ],
        image: img(a.private, {
          uk: 'Лендінг Grønt Land DK для приватних клієнтів',
          en: 'Grønt Land DK landing page for private homeowners',
          ru: 'Лендинг Grønt Land DK для частных клиентов',
        }),
        image2: img(a.b2b, {
          uk: 'Лендінг Grønt Land DK для підрядників і забудовників',
          en: 'Grønt Land DK landing page for contractors and developers',
          ru: 'Лендинг Grønt Land DK для подрядчиков и застройщиков',
        }),
      },
      {
        _key: 'grl-solution',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageLeft',
        eyebrow: ls('/ SOLUTION', '/ SOLUTION', '/ SOLUTION'),
        heading: ls('Що ми *зробили*', 'What we *did*', 'Что мы *сделали*'),
        body: body(
          'sol',
          'Розробили сайт на Next.js із Sanity CMS: 22 сторінки — головна, 8 сторінок послуг, окремі лендінги для приватних клієнтів і підрядників, каталог проєктів, галерея за 7 категоріями, про нас і контакти. Данською мовою, зі Schema.org-розміткою для локального пошуку.',
          'We built the site on Next.js with Sanity CMS: 22 pages - the homepage, 8 service pages, separate landings for private clients and contractors, a project catalogue, a 7-category gallery, about and contacts. In Danish, with Schema.org markup for local search.',
          'Разработали сайт на Next.js с Sanity CMS: 22 страницы — главная, 8 страниц услуг, отдельные лендинги для частных клиентов и подрядчиков, каталог проектов, галерея по 7 категориям, о нас и контакты. На датском языке, со Schema.org-разметкой для локального поиска.',
        ),
        bulletIcon: 'check',
        bulletList: [
          li(
            'sol-1',
            'Окремі лендінги для приватних клієнтів і для підрядників',
            'Separate landing pages for homeowners and for contractors',
            'Отдельные лендинги для частных клиентов и для подрядчиков',
          ),
          li(
            'sol-2',
            '8 сторінок послуг + каталог проєктів і галерея робіт',
            '8 service pages + a project catalogue and work gallery',
            '8 страниц услуг + каталог проектов и галерея работ',
          ),
          li(
            'sol-3',
            'Schema.org: LocalBusiness, Service, FAQ, хлібні крихти',
            'Schema.org: LocalBusiness, Service, FAQ, breadcrumbs',
            'Schema.org: LocalBusiness, Service, FAQ, хлебные крошки',
          ),
          li(
            'sol-4',
            'AVIF/WebP-зображення і швидке завантаження',
            'AVIF/WebP images and fast loading',
            'AVIF/WebP-изображения и быстрая загрузка',
          ),
        ],
        image: img(a.home, {
          uk: 'Головна сторінка сайту Grønt Land DK з послугами і проєктами',
          en: 'Grønt Land DK homepage with services and projects',
          ru: 'Главная страница сайта Grønt Land DK с услугами и проектами',
        }),
      },
      {
        _key: 'grl-telegram',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageRight',
        eyebrow: ls('/ LEADS + CMS', '/ LEADS + CMS', '/ LEADS + CMS'),
        heading: ls(
          'Заявки з фото — *одразу в Telegram*',
          'Photo enquiries go *straight to Telegram*',
          'Заявки с фото — *сразу в Telegram*',
        ),
        body: body(
          'tg',
          'До заявки клієнт прикріплює до 5 фото свого обʼєкта — бот надсилає їх у Telegram-чат компанії разом із контактами й типом робіт. Замість captcha — невидимий honeypot. Контент — послуги, проєкти, галерею й тексти — команда редагує в Sanity CMS без розробника.',
          'A customer attaches up to 5 photos of their property to the enquiry - the bot delivers them to the company Telegram chat together with contact details and the job type. Instead of a captcha - an invisible honeypot. Content - services, projects, gallery and copy - the team edits in Sanity CMS without a developer.',
          'К заявке клиент прикрепляет до 5 фото своего объекта — бот отправляет их в Telegram-чат компании вместе с контактами и типом работ. Вместо captcha — невидимый honeypot. Контент — услуги, проекты, галерею и тексты — команда редактирует в Sanity CMS без разработчика.',
        ),
        bulletIcon: 'check',
        bulletList: [
          li(
            'tg-1',
            'Форма заявки з фото обʼєкта (до 5 знімків)',
            'Enquiry form with property photos (up to 5)',
            'Форма заявки с фото объекта (до 5 снимков)',
          ),
          li(
            'tg-2',
            'Заявки миттєво приходять у Telegram-чат компанії',
            'Enquiries land instantly in the company Telegram chat',
            'Заявки мгновенно приходят в Telegram-чат компании',
          ),
          li(
            'tg-3',
            'Sanity CMS: контент редагується без розробника',
            'Sanity CMS: content is edited without a developer',
            'Sanity CMS: контент редактируется без разработчика',
          ),
          li(
            'tg-4',
            'Захист від спаму без captcha (honeypot)',
            'Spam protection without a captcha (honeypot)',
            'Защита от спама без captcha (honeypot)',
          ),
        ],
        image: img(a.kontakt, {
          uk: 'Сторінка контактів Grønt Land DK з формою заявки з фото',
          en: 'Grønt Land DK contact page with the photo enquiry form',
          ru: 'Страница контактов Grønt Land DK с формой заявки с фото',
        }),
      },
      {
        _key: 'grl-gallery',
        _type: 'mediaGalleryBlock',
        enableLightbox: true,
        images: [
          {
            _key: 'grl-g-1',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.ydelser, _type: 'reference'}},
            alt: ls(
              'Каталог із 8 послуг на сайті Grønt Land DK',
              'Catalogue of 8 services on the Grønt Land DK site',
              'Каталог из 8 услуг на сайте Grønt Land DK',
            ),
            caption: ls('Послуги', 'Services', 'Услуги'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'grl-g-2',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.service, _type: 'reference'}},
            alt: ls(
              'Сторінка послуги укладання бруківки на сайті Grønt Land DK',
              'Paving service page on the Grønt Land DK site',
              'Страница услуги мощения на сайте Grønt Land DK',
            ),
            caption: ls('Сторінка послуги', 'Service page', 'Страница услуги'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'grl-g-3',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.projekter, _type: 'reference'}},
            alt: ls(
              'Каталог проєктів Grønt Land DK з фільтром приватні / B2B',
              'Grønt Land DK project catalogue with a private / B2B filter',
              'Каталог проектов Grønt Land DK с фильтром частные / B2B',
            ),
            caption: ls('Проєкти', 'Projects', 'Проекты'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'grl-g-4',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.galleri, _type: 'reference'}},
            alt: ls(
              'Галерея виконаних робіт Grønt Land DK за 7 категоріями',
              'Grønt Land DK gallery of completed work in 7 categories',
              'Галерея выполненных работ Grønt Land DK по 7 категориям',
            ),
            caption: ls('Галерея робіт', 'Work gallery', 'Галерея работ'),
            displayMode: 'general',
            objectPosition: 'center',
          },
        ],
      },
      {
        _key: 'grl-outcome',
        _type: 'imageTextBlock',
        variant: 'centered',
        centeredLayout: 'horizontal',
        eyebrow: ls('/ OUTCOME', '/ OUTCOME', '/ OUTCOME'),
        heading: ls('Результат', 'Result', 'Результат'),
        body: body(
          'out',
          'Grønt Land DK отримав сайт-каталог робіт і генератор заявок: підрядники бачать B2B-досвід компанії, приватні клієнти — реальні проєкти від двору до тотальної реновації вілли, а кожна заявка з фото одразу потрапляє в Telegram. Контент команда веде самостійно через Sanity CMS.',
          'Grønt Land DK got a work-catalogue site and an enquiry generator: contractors see the company B2B track record, homeowners see real projects from a backyard to a full villa renovation, and every photo enquiry lands straight in Telegram. The team runs the content themselves in Sanity CMS.',
          'Grønt Land DK получил сайт-каталог работ и генератор заявок: подрядчики видят B2B-опыт компании, частные клиенты — реальные проекты от двора до тотальной реновации виллы, а каждая заявка с фото сразу попадает в Telegram. Контент команда ведёт самостоятельно через Sanity CMS.',
        ),
        image: img(a.project, {
          uk: 'Сторінка проєкту тотальної реновації вілли на сайті Grønt Land DK',
          en: 'Villa renovation project page on the Grønt Land DK site',
          ru: 'Страница проекта тотальной реновации виллы на сайте Grønt Land DK',
        }),
        image2: img(a.omos, {
          uk: 'Сторінка про команду Grønt Land DK',
          en: 'Grønt Land DK team page',
          ru: 'Страница о команде Grønt Land DK',
        }),
      },
    ],
    seo: {
      title: {
        uk: 'Grønt Land DK — кейс | Code-Site.Art',
        en: 'ᐈ Grønt Land DK — Renovation Company Website Case Study | Code-Site.Art',
        ru: 'Grønt Land DK — кейс | Code-Site.Art',
      },
      description: {
        uk: 'Grønt Land DK — сайт для ремонтно-будівельної компанії в Копенгагені: 8 послуг, 6 проєктів, галерея робіт, данське SEO і заявки з фото в Telegram.',
        en: '➤ Website for a Copenhagen renovation company ✔️ 8 service pages ✔️ Project portfolio and work gallery ✔️ Photo enquiries straight to Telegram ➡ See the full case study.',
        ru: 'Grønt Land DK — сайт для ремонтно-строительной компании в Копенгагене: 8 услуг, 6 проектов, галерея работ, датское SEO и заявки с фото в Telegram.',
      },
    },
  }
}

async function main() {
  const existing = await client.fetch(
    '*[_type == "caseStudy" && slug.current == "grontland"][0]{_id}',
  )
  if (existing?._id) {
    console.log(`Case with slug "grontland" already exists: ${existing._id} — aborting.`)
    return
  }

  for (const [slot, [path]] of Object.entries(IMAGES)) {
    if (!existsSync(path)) throw new Error(`Missing image for ${slot}: ${path}`)
  }

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — create caseStudy "grontland"`)
  console.log(`Images: ${Object.keys(IMAGES).length} to upload from ${SCRATCH}`)

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

  const patched = await client
    .patch(INDUSTRY_RENOVATION)
    .setIfMissing({relatedCases: []})
    .append('relatedCases', [{_key: 'grl-rel-1', _ref: created._id, _type: 'reference'}])
    .commit()
  console.log(`Linked as relatedCases on ${patched._id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
