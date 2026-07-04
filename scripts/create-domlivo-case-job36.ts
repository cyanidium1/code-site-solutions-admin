/**
 * Job #36: create the Domlivo case study (bilingual UK/EN) and link it as a
 * related case on the real-estate industry page.
 *
 * Facts sourced from Example/Domlivo + Example/Domlivo_CMS code:
 *   5 locales (en/uk/ru/sq/it), EUR-base prices with auto-converted display
 *   currencies, 4 cities / 9 districts with dedicated pages, 5 property types,
 *   11 catalogue filter parameters, interactive map with price markers,
 *   favourites, agent registration + "My properties" view, 6-status lifecycle,
 *   Telegram enquiry alerts, Schema.org + breadcrumbs + 7 XML sitemaps.
 * Deliberately NOT claimed (absent from the code): mortgage calculator,
 * Google Maps, heatmap, 360 tours, CRM integrations.
 *
 * Images are reused from the real-estate industry page (same assets).
 * No "before" section — the site was built from scratch.
 *
 * Dry-run:
 *   npx sanity exec scripts/create-domlivo-case-job36.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/create-domlivo-case-job36.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const INDUSTRY_REAL_ESTATE = 'lOTgaDd8FU4wgJ8F4KCHLf'
const COUNTRY_EU = 'DHIwRDN3sEoI638qoYQ17L'

// Assets already uploaded for the industry page
const IMG_MOCKUP = 'image-deef46e201af5ffdc1a4cffe07cb11c6117afe8d-1199x1133-png'
const IMG_HOME = 'image-80669cabb4c31b9e510113e62bfd99bd561b5c40-2884x2058-png'
const IMG_CATALOG = 'image-af04939410f8b113ddffe04b61cc075d790a0fcb-2884x2058-png'
const IMG_CONTACT = 'image-03d83b16f3d7c6aa9d23774a6bec756adf430157-2884x2058-png'
const IMG_SUBMIT = 'image-41fce61b7ee02342825a9b7cef2c6518345efb69-2880x2058-png'

const img = (ref: string, altUk: string, altEn: string) => ({
  _type: 'imageWithLocalizedAlt',
  alt: {_type: 'localizedString', uk: altUk, en: altEn},
  image: {_type: 'image', asset: {_ref: ref, _type: 'reference'}},
})

const block = (key: string, text: string) => [
  {
    _key: `dml-b-${key}`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `dml-s-${key}`, _type: 'span', marks: [], text}],
  },
]

const li = (key: string, uk: string, en: string) => ({_key: `dml-li-${key}`, uk, en})

const doc = {
  _type: 'caseStudy',
  title: {uk: 'Domlivo', en: 'Domlivo'},
  slug: {_type: 'slug', current: 'domlivo'},
  status: 'published',
  client: 'Domlivo',
  industry: {_ref: INDUSTRY_REAL_ESTATE, _type: 'reference'},
  country: {_ref: COUNTRY_EU, _type: 'reference'},
  region: {uk: 'Албанія', en: 'Albania'},
  year: 2024,
  stack: ['Next.js', 'Sanity', 'Tailwind CSS', 'MapLibre GL'],
  metricsLine: {
    uk: '5 мов · 4 міста · 5 типів нерухомості · 11 параметрів фільтрів',
    en: '5 languages · 4 cities · 5 property types · 11 filter parameters',
  },
  featured: false,
  order: 21,
  coverImage: img(
    IMG_HOME,
    'Сайт Domlivo з багатомовним інтерфейсом, цінами в євро і пошуком обʼєктів на ноутбуці і телефоні',
    'Domlivo site with a multilingual interface, prices in euros and property search on laptop and phone',
  ),
  hero: {
    eyebrow: {uk: '/ CASE STUDY', en: '/ CASE STUDY'},
    heading: {
      uk: 'Domlivo — платформа нерухомості в Албанії для *купівлі, оренди та короткострокової оренди*',
      en: 'Domlivo - a property platform for Albania covering *buying, renting and short-lets*',
    },
    subheading: {
      uk: 'Domlivo — платформа для пошуку нерухомості в Албанії: каталог обʼєктів, пошук з фільтрами, сторінки міст і районів, заявки та окремий сценарій для агентів.',
      en: 'Domlivo is a property search platform for Albania: a listings catalogue, filtered search, city and district pages, enquiries and a separate flow for agents.',
    },
    heroImage: img(
      IMG_MOCKUP,
      'Сайт нерухомості Domlivo на ноутбуці і телефоні з обʼєктами в Албанії і фільтрами пошуку',
      'Domlivo property website on laptop and phone with listings in Albania and search filters',
    ),
  },
  sections: [
    {
      _key: 'dml-stats',
      _type: 'statsBlock',
      items: [
        {
          _key: 'dml-m-1',
          _type: 'metric',
          value: {uk: '5', en: '5'},
          label: {uk: 'мов інтерфейсу', en: 'interface languages'},
        },
        {
          _key: 'dml-m-2',
          _type: 'metric',
          value: {uk: '4', en: '4'},
          label: {uk: 'міста з власними сторінками', en: 'cities with dedicated pages'},
        },
        {
          _key: 'dml-m-3',
          _type: 'metric',
          value: {uk: '5', en: '5'},
          label: {uk: 'типів нерухомості', en: 'property types'},
        },
        {
          _key: 'dml-m-4',
          _type: 'metric',
          value: {uk: '11', en: '11'},
          label: {uk: 'параметрів фільтрів у каталозі', en: 'filter parameters in the catalogue'},
        },
      ],
    },
    {
      _key: 'dml-challenge',
      _type: 'imageTextBlock',
      variant: 'centered',
      centeredLayout: 'horizontal',
      imageVariant: 'imageRight',
      eyebrow: {uk: '/ CHALLENGE', en: '/ CHALLENGE'},
      heading: {uk: 'З чим прийшов *клієнт*', en: 'What *the client* came with'},
      body: block(
        'ch',
        'Ринок нерухомості Албанії продає покупцям з різних країн, але більшість сайтів агентств — вітрини на одній мові без нормального пошуку. Клієнту потрібна була платформа: каталог для купівлі, оренди й короткострокової оренди, робочий пошук і сценарій, за яким агенти самі додають обʼєкти.',
      ),
      bodyEn: block(
        'ch-en',
        "Albania's property market sells to buyers from across Europe, yet most agency sites are single-language shop windows with no real search. The client needed a platform: a catalogue covering buying, renting and short-lets, search that works, and a flow where agents add properties themselves.",
      ),
      bulletIcon: 'dot',
      bulletList: [
        li(
          'ch-1',
          'Обʼєднати купівлю, оренду та short-term в одному каталозі',
          'Bring buying, renting and short-lets into one catalogue',
        ),
        li(
          'ch-2',
          'Дати покупцям з різних країн мови та валюти',
          'Give overseas buyers their own languages and currencies',
        ),
        li(
          'ch-3',
          'Побудувати SEO-структуру: міста, райони, типи обʼєктів',
          'Build an SEO structure of cities, districts and property types',
        ),
        li(
          'ch-4',
          'Передбачити окремий сценарій для агентів і агентств',
          'Plan a separate flow for agents and agencies',
        ),
      ],
      image: img(IMG_CATALOG, 'Сторінка каталогу Domlivo з фільтрами', 'Domlivo catalogue page with filters'),
      image2: img(IMG_CONTACT, 'Форма контактів Domlivo', 'Domlivo contact form'),
    },
    {
      _key: 'dml-solution',
      _type: 'imageTextBlock',
      variant: 'side-with-list',
      imageVariant: 'imageLeft',
      eyebrow: {uk: '/ SOLUTION', en: '/ SOLUTION'},
      heading: {uk: 'Що ми *зробили*', en: 'What we *did*'},
      body: block(
        'sol',
        'Розробили платформу на Next.js і Sanity: каталог з фільтрами й сортуванням, інтерактивна карта, 5 мов інтерфейсу, ціни з автоматичним перерахунком валют і SEO-сторінки для кожного міста, району й типу нерухомості.',
      ),
      bodyEn: block(
        'sol-en',
        "We built the platform on Next.js and Sanity: a filtered, sortable catalogue, an interactive map, five interface languages, prices that convert to the visitor's currency automatically, and an SEO page for every city, district and property type.",
      ),
      bulletIcon: 'check',
      bulletList: [
        li(
          'sol-1',
          'Каталог: купівля, оренда та short-term з 11 параметрами фільтрів',
          'One catalogue for sale, rent and short-lets with 11 filter parameters',
        ),
        li(
          'sol-2',
          'Інтерактивна карта з ціною на кожному маркері',
          'An interactive map with the price on each marker',
        ),
        li(
          'sol-3',
          'Окремі сторінки для 4 міст і 9 районів',
          'Dedicated pages for 4 cities and 9 districts',
        ),
        li(
          'sol-4',
          'Schema.org, хлібні крихти та 7 XML-сайтмапів',
          'Schema.org markup, breadcrumbs and 7 XML sitemaps',
        ),
      ],
      image: img(
        IMG_HOME,
        'Головна сторінка Domlivo з багатомовним інтерфейсом і пошуком обʼєктів',
        'Domlivo homepage with a multilingual interface and property search',
      ),
    },
    {
      _key: 'dml-agents',
      _type: 'imageTextBlock',
      variant: 'side-with-list',
      imageVariant: 'imageRight',
      eyebrow: {uk: '/ AGENTS + CMS', en: '/ AGENTS + CMS'},
      heading: {
        uk: 'Агенти додають обʼєкти *без розробника*',
        en: 'Agents add properties *with no developer involved*',
      },
      body: block(
        'ag',
        'Агент або агентство реєструється через форму, отримує власний кабінет у Sanity й додає обʼєкти самостійно: до 30 фото на обʼєкт, статуси від чернетки до проданого, промо-рівні Premium і Top. Заявки з сайту приходять просто в Telegram.',
      ),
      bodyEn: block(
        'ag-en',
        'An agent or agency registers through a form, gets their own view in Sanity and adds properties themselves: up to 30 photos per listing, statuses from draft to sold, and Premium or Top promotion slots. Site enquiries arrive straight in Telegram.',
      ),
      bulletIcon: 'check',
      bulletList: [
        li(
          'ag-1',
          'Реєстрація агентів і агентств через форму',
          'Agent and agency registration through a form',
        ),
        li('ag-2', 'Кабінет «Мої обʼєкти» для кожного агента', "A 'My properties' view for every agent"),
        li('ag-3', 'Життєвий цикл обʼєкта: 6 статусів', 'A six-status property lifecycle'),
        li('ag-4', 'Сповіщення про заявки в Telegram', 'Enquiry alerts in Telegram'),
      ],
      image: img(IMG_SUBMIT, 'Форма додавання обʼєктів у Domlivo', 'Property submission form in Domlivo'),
    },
    {
      _key: 'dml-gallery',
      _type: 'mediaGalleryBlock',
      enableLightbox: true,
      images: [
        {
          _key: 'dml-g-1',
          _type: 'mediaGalleryImageItem',
          displayMode: 'general',
          objectPosition: 'center',
          alt: {
            _type: 'localizedString',
            uk: 'Головна сторінка Domlivo з пошуком обʼєктів на ноутбуці',
            en: 'Domlivo homepage with property search on a laptop',
          },
          image: {_type: 'image', asset: {_ref: IMG_HOME, _type: 'reference'}},
        },
        {
          _key: 'dml-g-2',
          _type: 'mediaGalleryImageItem',
          displayMode: 'general',
          objectPosition: 'center',
          alt: {
            _type: 'localizedString',
            uk: 'Каталог Domlivo з фільтрами і картками обʼєктів',
            en: 'Domlivo catalogue with filters and property cards',
          },
          image: {_type: 'image', asset: {_ref: IMG_CATALOG, _type: 'reference'}},
        },
        {
          _key: 'dml-g-3',
          _type: 'mediaGalleryImageItem',
          displayMode: 'general',
          objectPosition: 'center',
          alt: {
            _type: 'localizedString',
            uk: 'Форма контактів Domlivo на ноутбуці',
            en: 'Domlivo contact form on a laptop',
          },
          image: {_type: 'image', asset: {_ref: IMG_CONTACT, _type: 'reference'}},
        },
        {
          _key: 'dml-g-4',
          _type: 'mediaGalleryImageItem',
          displayMode: 'general',
          objectPosition: 'center',
          alt: {
            _type: 'localizedString',
            uk: 'Форма додавання обʼєктів у Domlivo',
            en: 'Property submission form in Domlivo',
          },
          image: {_type: 'image', asset: {_ref: IMG_SUBMIT, _type: 'reference'}},
        },
      ],
    },
    {
      _key: 'dml-outcome',
      _type: 'imageTextBlock',
      variant: 'centered',
      centeredLayout: 'horizontal',
      eyebrow: {uk: '/ OUTCOME', en: '/ OUTCOME'},
      heading: {uk: 'Результат', en: 'Result'},
      body: block(
        'out',
        'Domlivo отримав платформу, яка росте без розробника: агенти самі наповнюють каталог, покупці з різних країн бачать ціни у своїй валюті, а кожне місто й тип нерухомості має власну SEO-сторінку. Це наш референс для сайтів нерухомості.',
      ),
      bodyEn: block(
        'out-en',
        "Domlivo got a platform that grows without a developer: agents fill the catalogue themselves, buyers from different countries see prices in their own currency, and every city and property type has its own SEO page. It's now our reference build for property websites.",
      ),
      image: img(
        IMG_MOCKUP,
        'Сайт Domlivo на ноутбуці і телефоні',
        'Domlivo website on laptop and phone',
      ),
      image2: img(
        IMG_CATALOG,
        'Каталог обʼєктів Domlivo на ноутбуці',
        'Domlivo property catalogue on a laptop',
      ),
    },
  ],
  seo: {
    title: {
      uk: 'Domlivo — кейс | Code-Site.Art',
      en: 'ᐈ Domlivo — Property Platform Website Case Study | Code-Site.Art',
    },
    description: {
      uk: 'Domlivo — платформа для купівлі, оренди та короткострокової оренди нерухомості в Албанії: каталог, фільтри, карта, 5 мов і сценарій для агентів.',
      en: '➤ Property platform for Albania ✔️ Buy, rent & short-let catalogue ✔️ 5 languages with currency switching ✔️ Agent submission flow ➡ See the full case study.',
    },
  },
}

async function main() {
  const existing = await client.fetch(
    '*[_type == "caseStudy" && slug.current == "domlivo"][0]{_id}',
  )
  if (existing?._id) {
    console.log(`Case with slug "domlivo" already exists: ${existing._id} — aborting.`)
    return
  }

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — create caseStudy "domlivo"`)
  console.log(
    JSON.stringify(
      {title: doc.title, slug: doc.slug, sections: doc.sections.map((s) => s._type)},
      null,
      2,
    ),
  )

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with -- --apply to write.')
    return
  }

  const created = await client.create(doc as never)
  console.log(`Created ${created._id}`)

  const patched = await client
    .patch(INDUSTRY_REAL_ESTATE)
    .setIfMissing({relatedCases: []})
    .set({relatedCases: [{_key: 'dml-rel-1', _ref: created._id, _type: 'reference'}]})
    .commit()
  console.log(`Linked as relatedCases on ${patched._id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
