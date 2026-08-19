/**
 * Job #167: create the IceLab case study (UK/EN/RU) from the client-approved
 * text draft, and link it as a related case on the ecommerce industry page.
 *
 * Facts verified against the live site (icelab.com.ua sitemap + headers):
 *   Next.js on Vercel, uk+ru locales, 5 catalog categories, 19 product
 *   cards, 10 city SEO pages (Kyiv, Lviv, Dnipro, Odesa, Kharkiv,
 *   Zaporizhzhia, Kryvyi Rih, Vinnytsia, Ivano-Frankivsk, Poltava), 7 blog
 *   articles, B2B page (/opt), production/about/FAQ/applications pages,
 *   cart + ordering. GSC metrics (28-day window) supplied by the client:
 *   212 clicks, 3.67k impressions, 5.8% CTR, avg position 8.3.
 *
 * Images: composed hero/cover/single-device mockups + 9 desktop screenshots,
 * uploaded from the session scratchpad (override via GRONTLAND_SHOTS_DIR-style
 * env var ICELAB_SHOTS_DIR).
 *
 * Dry-run:
 *   npx sanity exec scripts/create-icelab-case.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/create-icelab-case.ts --with-user-token -- --apply
 */

import {createReadStream, existsSync} from 'node:fs'
import {join} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const INDUSTRY_ECOMMERCE = 'DHIwRDN3sEoI638qoYRvv5'
const COUNTRY_UA = '6tWqPRZWZzG4Lv3HK7JDxa'
const BUDGET_3_7K = 'lOTgaDd8FU4wgJ8F4KAXLu'

const SCRATCH =
  process.env.ICELAB_SHOTS_DIR ??
  'C:/Users/kulak/AppData/Local/Temp/claude/C--GitHub23-code-site-workspace/01ca57ff-5e65-4f80-b528-ccb559671066/scratchpad'

const IMAGES: Record<string, [string, string]> = {
  hero: [join(SCRATCH, 'ref/icelab-hero.png'), 'icelab-hero-mockup.png'],
  cover: [join(SCRATCH, 'ref/icelab-cover.png'), 'icelab-cover-mockup.png'],
  phOpt: [join(SCRATCH, 'ref/icelab-single-ph-opt.png'), 'icelab-b2b-phone.png'],
  lapUses: [join(SCRATCH, 'ref/icelab-single-lap-uses.png'), 'icelab-applications-laptop.png'],
  phKyiv: [join(SCRATCH, 'ref/icelab-single-ph-kyiv.png'), 'icelab-kyiv-phone.png'],
  lapProd: [join(SCRATCH, 'ref/icelab-single-lap-production.png'), 'icelab-production-laptop.png'],
  home: [join(SCRATCH, 'ice/desk-home.png'), 'icelab-home-desktop.png'],
  blog: [join(SCRATCH, 'ice/desk-blog.png'), 'icelab-blog-desktop.png'],
  product: [join(SCRATCH, 'ice/desk-product.png'), 'icelab-product-card.png'],
  opt: [join(SCRATCH, 'ice/desk-opt.png'), 'icelab-b2b-desktop.png'],
  cityKyiv: [join(SCRATCH, 'ice/desk-city-kyiv.png'), 'icelab-kyiv-page.png'],
  category: [join(SCRATCH, 'ice/desk-category.png'), 'icelab-category-dry-ice.png'],
  faq: [join(SCRATCH, 'ice/desk-faq.png'), 'icelab-faq.png'],
  payment: [join(SCRATCH, 'ice/desk-payment.png'), 'icelab-payment-delivery.png'],
  about: [join(SCRATCH, 'ice/desk-about.png'), 'icelab-about.png'],
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
    _key: `icl-b-${key}-${lang}`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `icl-s-${key}-${lang}`, _type: 'span', marks: [], text}],
  },
]

const body = (key: string, uk: string, en: string, ru: string) => ({
  uk: block(key, 'uk', uk),
  en: block(key, 'en', en),
  ru: block(key, 'ru', ru),
})

const li = (key: string, uk: string, en: string, ru: string) => ({
  _key: `icl-li-${key}`,
  uk,
  en,
  ru,
})

const metric = (key: string, value: Loc, label: Loc) => ({
  _key: `icl-m-${key}`,
  _type: 'metric',
  value: {uk: value.uk, en: value.en, ru: value.ru},
  label: {uk: label.uk, en: label.en, ru: label.ru},
})

function buildDoc(a: Record<string, string>) {
  return {
    _type: 'caseStudy',
    title: {uk: 'IceLab', en: 'IceLab', ru: 'IceLab'},
    slug: {_type: 'slug', current: 'icelab'},
    status: 'published',
    client: 'IceLab',
    industry: {_ref: INDUSTRY_ECOMMERCE, _type: 'reference'},
    country: {_ref: COUNTRY_UA, _type: 'reference'},
    region: ls('Київ і Львів, Україна', 'Kyiv and Lviv, Ukraine', 'Киев и Львов, Украина'),
    year: 2026,
    stack: ['Next.js', 'Vercel'],
    metricsLine: ls(
      '212 переходів із Google · CTR 5,8% · позиція 8,3',
      '212 Google clicks · 5.8% CTR · position 8.3',
      '212 переходов из Google · CTR 5,8% · позиция 8,3',
    ),
    featured: false,
    order: 10,
    coverImage: img(a.cover, {
      uk: 'IceLab — інтернет-магазин сухого льоду на ноутбуці і телефоні',
      en: 'IceLab - dry ice online store on laptop and phone',
      ru: 'IceLab — интернет-магазин сухого льда на ноутбуке и телефоне',
    }),
    hero: {
      eyebrow: ls('/ CASE STUDY', '/ CASE STUDY', '/ CASE STUDY'),
      heading: ls(
        'IceLab — інтернет-магазин сухого льоду із *середньою позицією 8,3* у Google',
        'IceLab - a dry ice online store with an *average Google position of 8.3*',
        'IceLab — интернет-магазин сухого льда со *средней позицией 8,3* в Google',
      ),
      subheading: ls(
        'IceLab — український виробник сухого льоду з власними потужностями у Києві та Львові. Ми створили інтернет-магазин, який працює з роздрібними та оптовими клієнтами й залучає аудиторію з Google: за 28 днів — 212 переходів, 3,67 тис. показів і середня позиція 8,3.',
        'IceLab is a Ukrainian dry ice manufacturer with its own facilities in Kyiv and Lviv. We built an online store that serves both retail and wholesale customers and attracts new audience from Google: 212 clicks, 3.67k impressions and an average position of 8.3 in 28 days.',
        'IceLab — украинский производитель сухого льда с собственными мощностями в Киеве и Львове. Мы создали интернет-магазин, который работает с розничными и оптовыми клиентами и привлекает аудиторию из Google: за 28 дней — 212 переходов, 3,67 тыс. показов и средняя позиция 8,3.',
      ),
      link: {_type: 'ctaAction', href: 'https://icelab.com.ua', type: 'custom'},
      heroImage: img(a.hero, {
        uk: 'Сайт IceLab на ноутбуці і телефоні з головною сторінкою про сухий лід',
        en: 'IceLab website shown on laptop and phone with the dry ice homepage',
        ru: 'Сайт IceLab на ноутбуке и телефоне с главной страницей о сухом льде',
      }),
    },
    sections: [
      {
        _key: 'icl-stats',
        _type: 'statsBlock',
        items: [
          metric(
            '1',
            {uk: '212', en: '212', ru: '212'},
            {
              uk: 'переходів із Google за 28 днів',
              en: 'Google clicks in 28 days',
              ru: 'переходов из Google за 28 дней',
            },
          ),
          metric(
            '2',
            {uk: '3,67 тис.', en: '3.67k', ru: '3,67 тыс.'},
            {
              uk: 'показів у пошуку',
              en: 'search impressions',
              ru: 'показов в поиске',
            },
          ),
          metric(
            '3',
            {uk: '5,8%', en: '5.8%', ru: '5,8%'},
            {uk: 'середній CTR', en: 'average CTR', ru: 'средний CTR'},
          ),
          metric(
            '4',
            {uk: '8,3', en: '8.3', ru: '8,3'},
            {
              uk: 'середня позиція в Google',
              en: 'average Google position',
              ru: 'средняя позиция в Google',
            },
          ),
        ],
      },
      {
        _key: 'icl-meaning',
        _type: 'imageTextBlock',
        variant: 'centered',
        eyebrow: ls('/ IMPACT', '/ IMPACT', '/ IMPACT'),
        heading: ls(
          'Що це означає *для бізнесу*',
          'What this means *for the business*',
          'Что это значит *для бизнеса*',
        ),
        body: body(
          'mn',
          'Середня позиція 8,3 означає, що сторінки IceLab у середньому вже на першій сторінці Google: компанію бачать люди, які цілеспрямовано шукають сухий лід, термобокси, оптові поставки та доставку у своєму місті. CTR 5,8% показує, що користувачі бачать релевантну відповідь на свій запит і переходять на сайт. Google став для компанії окремим каналом залучення клієнтів, а не джерелом випадкової відвідуваності.',
          'An average position of 8.3 means IceLab pages already sit on the first page of Google: the company is seen by people deliberately searching for dry ice, thermoboxes, wholesale supply and delivery in their city. A 5.8% CTR shows users see a relevant answer to their query and click through. Google became a standalone client-acquisition channel, not a source of accidental traffic.',
          'Средняя позиция 8,3 означает, что страницы IceLab в среднем уже на первой странице Google: компанию видят люди, которые целенаправленно ищут сухой лёд, термобоксы, оптовые поставки и доставку в своём городе. CTR 5,8% показывает, что пользователи видят релевантный ответ на свой запрос и переходят на сайт. Google стал для компании отдельным каналом привлечения клиентов, а не источником случайной посещаемости.',
        ),
      },
      {
        _key: 'icl-seo-structure',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageRight',
        eyebrow: ls('/ SEO', '/ SEO', '/ SEO'),
        heading: ls(
          'Як сайт отримує *трафік із Google*',
          'How the site gets *traffic from Google*',
          'Как сайт получает *трафик из Google*',
        ),
        body: body(
          'seo',
          'Ми заклали SEO не окремою послугою після завершення розробки, а безпосередньо у структуру сайту. Замість однієї загальної сторінки — система посадкових сторінок під різні групи запитів: кожна закриває конкретну потребу користувача й веде його до товару, консультації або оформлення замовлення.',
          'We built SEO directly into the site structure rather than as a separate service after development. Instead of one generic page - a system of landing pages for different query groups: each one answers a specific user need and leads to a product, a consultation or an order.',
          'Мы заложили SEO не отдельной услугой после завершения разработки, а непосредственно в структуру сайта. Вместо одной общей страницы — система посадочных страниц под разные группы запросов: каждая закрывает конкретную потребность пользователя и ведёт его к товару, консультации или оформлению заказа.',
        ),
        bulletIcon: 'check',
        bulletList: [
          li(
            'seo-1',
            'Категорії сухого та харчового льоду',
            'Dry ice and food-grade ice categories',
            'Категории сухого и пищевого льда',
          ),
          li(
            'seo-2',
            'Термобокси та готові бокси з льодом',
            'Thermoboxes and ready-made ice boxes',
            'Термобоксы и готовые боксы со льдом',
          ),
          li(
            'seo-3',
            'Обладнання для очищення сухим льодом',
            'Dry ice blasting equipment',
            'Оборудование для очистки сухим льдом',
          ),
          li(
            'seo-4',
            'Окремий напрям для оптових і B2B-клієнтів',
            'A dedicated funnel for wholesale and B2B clients',
            'Отдельное направление для оптовых и B2B-клиентов',
          ),
          li(
            'seo-5',
            'Сторінки про виробництво, доставку та застосування',
            'Production, delivery and application pages',
            'Страницы о производстве, доставке и применении',
          ),
          li(
            'seo-6',
            'FAQ та інформаційні статті у блозі',
            'FAQ and informational blog articles',
            'FAQ и информационные статьи в блоге',
          ),
          li(
            'seo-7',
            'Локальні сторінки під 10 міст України',
            'Local pages for 10 Ukrainian cities',
            'Локальные страницы под 10 городов Украины',
          ),
        ],
        image: img(a.blog, {
          uk: 'Блог IceLab з інформаційними статтями про сухий лід',
          en: 'IceLab blog with informational dry ice articles',
          ru: 'Блог IceLab с информационными статьями о сухом льде',
        }),
      },
      {
        _key: 'icl-challenge',
        _type: 'imageTextBlock',
        variant: 'centered',
        centeredLayout: 'horizontal',
        eyebrow: ls('/ CHALLENGE', '/ CHALLENGE', '/ CHALLENGE'),
        heading: ls('Завдання *проєкту*', 'The project *challenge*', 'Задачи *проекта*'),
        body: body(
          'ch',
          'Сухий лід використовують для різних задач: охолодження продуктів, логістики, медицини, ресторанної сфери, спецефектів і промислового очищення. Приватний покупець, ресторан, лабораторія та велике виробництво мають різні потреби й обсяги замовлення. Потрібно було, щоб кожен користувач швидко знайшов потрібний формат продукції, зрозумів різницю між гранулами, побачив актуальну ціну та зміг перейти до замовлення — а сайт показував виробничі потужності компанії та був зручним на телефоні.',
          'Dry ice serves very different jobs: food cooling, logistics, medicine, restaurants, special effects and industrial cleaning. A private buyer, a restaurant, a lab and a large production facility have different needs and order volumes. Every user had to quickly find the right product format, understand the difference between granules, see the current price and proceed to an order - while the site showcased the company\u2019s production capacity and stayed comfortable on a phone.',
          'Сухой лёд используют для разных задач: охлаждение продуктов, логистика, медицина, ресторанная сфера, спецэффекты и промышленная очистка. Частный покупатель, ресторан, лаборатория и крупное производство имеют разные потребности и объёмы заказа. Нужно было, чтобы каждый пользователь быстро нашёл нужный формат продукции, понял разницу между гранулами, увидел актуальную цену и смог перейти к заказу — а сайт показывал производственные мощности компании и был удобным на телефоне.',
        ),
        bulletIcon: 'dot',
        bulletList: [
          li(
            'ch-1',
            'Розділити роздрібний та оптовий напрями',
            'Separate the retail and wholesale funnels',
            'Разделить розничное и оптовое направления',
          ),
          li(
            'ch-2',
            'Зрозуміло подати складний і незвичний продукт',
            'Present a complex, unusual product clearly',
            'Понятно подать сложный и необычный продукт',
          ),
          li(
            'ch-3',
            'Показати розміри гранул, фасування та ціни',
            'Show granule sizes, packaging and prices',
            'Показать размеры гранул, фасовку и цены',
          ),
          li(
            'ch-4',
            'Створити каталог із простим шляхом до замовлення',
            'Build a catalogue with a simple path to ordering',
            'Создать каталог с простым путём к заказу',
          ),
          li(
            'ch-5',
            'Пояснити зберігання, використання та доставку',
            'Explain storage, usage and delivery',
            'Объяснить хранение, использование и доставку',
          ),
          li(
            'ch-6',
            'Підготувати сайт до локального SEO-просування',
            'Prepare the site for local SEO promotion',
            'Подготовить сайт к локальному SEO-продвижению',
          ),
        ],
        image: img(a.phOpt, {
          uk: 'Сторінка оптових замовлень IceLab на телефоні',
          en: 'IceLab wholesale page on a phone',
          ru: 'Страница оптовых заказов IceLab на телефоне',
        }),
        image2: img(a.lapUses, {
          uk: 'Сторінка застосування сухого льоду IceLab на ноутбуці',
          en: 'IceLab dry ice applications page on a laptop',
          ru: 'Страница применения сухого льда IceLab на ноутбуке',
        }),
      },
      {
        _key: 'icl-solution',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageLeft',
        eyebrow: ls('/ SOLUTION', '/ SOLUTION', '/ SOLUTION'),
        heading: ls('Що ми *зробили*', 'What we *did*', 'Что мы *сделали*'),
        body: body(
          'sol',
          'Ми створили інтернет-магазин, який поєднує продаж продукції, презентацію виробництва та SEO-просування. На головній сторінці користувач одразу бачить основну пропозицію IceLab, доступні формати льоду, стартову вартість і два сценарії дії: швидке замовлення або перехід до каталогу.',
          'We built an online store that combines product sales, a production showcase and SEO. On the homepage the user immediately sees the core IceLab offer, available ice formats, the starting price and two scenarios: a quick order or a jump into the catalogue.',
          'Мы создали интернет-магазин, который объединяет продажу продукции, презентацию производства и SEO-продвижение. На главной странице пользователь сразу видит основное предложение IceLab, доступные форматы льда, стартовую стоимость и два сценария действия: быстрый заказ или переход в каталог.',
        ),
        bulletIcon: 'check',
        bulletList: [
          li(
            'sol-1',
            'Індивідуальний дизайн і маркетингова структура',
            'Custom design and marketing structure',
            'Индивидуальный дизайн и маркетинговая структура',
          ),
          li(
            'sol-2',
            'Каталог: 5 категорій і 19 карток товарів',
            'Catalogue: 5 categories and 19 product cards',
            'Каталог: 5 категорий и 19 карточек товаров',
          ),
          li(
            'sol-3',
            'Кошик, оформлення замовлення та швидка форма звернення',
            'Cart, checkout and a quick enquiry form',
            'Корзина, оформление заказа и быстрая форма обращения',
          ),
          li(
            'sol-4',
            'Окремий розділ для оптових і B2B-клієнтів',
            'A dedicated wholesale / B2B section',
            'Отдельный раздел для оптовых и B2B-клиентов',
          ),
          li(
            'sol-5',
            'Сторінки про компанію та власне виробництво',
            'About and own-production pages',
            'Страницы о компании и собственном производстве',
          ),
          li(
            'sol-6',
            'FAQ, блог і сторінки застосування сухого льоду',
            'FAQ, blog and dry ice application pages',
            'FAQ, блог и страницы применения сухого льда',
          ),
          li(
            'sol-7',
            'Окремі SEO-сторінки під міста України',
            'Dedicated SEO pages for Ukrainian cities',
            'Отдельные SEO-страницы под города Украины',
          ),
          li(
            'sol-8',
            'Адаптація всіх сторінок під мобільні пристрої',
            'All pages adapted for mobile devices',
            'Адаптация всех страниц под мобильные устройства',
          ),
        ],
        image: img(a.home, {
          uk: 'Головна сторінка IceLab з форматами сухого льоду і швидким замовленням',
          en: 'IceLab homepage with dry ice formats and quick ordering',
          ru: 'Главная страница IceLab с форматами сухого льда и быстрым заказом',
        }),
      },
      {
        _key: 'icl-catalog',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageRight',
        eyebrow: ls('/ CATALOG', '/ CATALOG', '/ CATALOG'),
        heading: ls(
          'Каталог і шлях *до замовлення*',
          'The catalogue and the *path to ordering*',
          'Каталог и путь *к заказу*',
        ),
        body: body(
          'cat',
          'Ми не перевантажували користувача технічною інформацією на першому екрані: сайт спочатку допомагає обрати потрібний напрям, а потім показує конкретні товари, фасування та характеристики. У картках одразу видно наявність, розмір гранули, вагу, вартість і кнопку кошика — не потрібно писати менеджеру, щоб дізнатися базові умови замовлення.',
          'We did not overload the first screen with technical details: the site first helps choose the right direction, then shows specific products, packaging and specs. Cards immediately show availability, granule size, weight, price and an add-to-cart button - no need to message a manager just to learn the basic terms.',
          'Мы не перегружали пользователя технической информацией на первом экране: сайт сначала помогает выбрать нужное направление, а затем показывает конкретные товары, фасовку и характеристики. В карточках сразу видны наличие, размер гранулы, вес, стоимость и кнопка корзины — не нужно писать менеджеру, чтобы узнать базовые условия заказа.',
        ),
        bulletIcon: 'dot',
        bulletList: [
          li('cat-1', 'Сухий лід — гранули 3, 16 і 19 мм', 'Dry ice - 3, 16 and 19 mm granules', 'Сухой лёд — гранулы 3, 16 и 19 мм'),
          li('cat-2', 'Харчовий лід', 'Food-grade ice', 'Пищевой лёд'),
          li('cat-3', 'Термобокси', 'Thermoboxes', 'Термобоксы'),
          li('cat-4', 'Готові бокси із сухим льодом', 'Ready-made dry ice boxes', 'Готовые боксы с сухим льдом'),
          li(
            'cat-5',
            'Обладнання для очищення сухим льодом',
            'Dry ice blasting equipment',
            'Оборудование для очистки сухим льдом',
          ),
        ],
        image: img(a.product, {
          uk: 'Картка товару IceLab з розміром гранули, вагою, ціною і кошиком',
          en: 'IceLab product card with granule size, weight, price and cart button',
          ru: 'Карточка товара IceLab с размером гранулы, весом, ценой и корзиной',
        }),
      },
      {
        _key: 'icl-b2b',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageLeft',
        eyebrow: ls('/ B2B', '/ B2B', '/ B2B'),
        heading: ls(
          'Окреме рішення *для B2B*',
          'A separate solution *for B2B*',
          'Отдельное решение *для B2B*',
        ),
        body: body(
          'b2b',
          'Для оптових клієнтів ми створили окрему посадкову сторінку з цінами залежно від обсягу, умовами регулярних поставок, логістикою та перевагами роботи напряму з виробником. Це дозволило не змішувати великі регулярні поставки зі звичайними роздрібними замовленнями та сформувати окрему воронку для дорожчих B2B-звернень.',
          'For wholesale clients we created a dedicated landing page with volume-based pricing, regular supply terms, logistics and the advantages of working directly with the manufacturer. Large recurring supplies no longer mix with ordinary retail orders, forming a separate funnel for higher-value B2B enquiries.',
          'Для оптовых клиентов мы создали отдельную посадочную страницу с ценами в зависимости от объёма, условиями регулярных поставок, логистикой и преимуществами работы напрямую с производителем. Это позволило не смешивать крупные регулярные поставки с обычными розничными заказами и сформировать отдельную воронку для более дорогих B2B-обращений.',
        ),
        bulletIcon: 'check',
        bulletList: [
          li(
            'b2b-1',
            'Ціни залежно від обсягу та умови регулярних поставок',
            'Volume-based pricing and regular supply terms',
            'Цены в зависимости от объёма и условия регулярных поставок',
          ),
          li(
            'b2b-2',
            'Логістика й робота напряму з виробником',
            'Logistics and working directly with the manufacturer',
            'Логистика и работа напрямую с производителем',
          ),
          li(
            'b2b-3',
            'Під HoReCa, кейтеринг, виробництва, лабораторії та фарму',
            'For HoReCa, catering, production, labs and pharma',
            'Под HoReCa, кейтеринг, производства, лаборатории и фарму',
          ),
          li(
            'b2b-4',
            'Окрема воронка для івент-агенцій і промислових підприємств',
            'A separate funnel for event agencies and industrial companies',
            'Отдельная воронка для ивент-агентств и промышленных предприятий',
          ),
        ],
        image: img(a.opt, {
          uk: 'B2B-сторінка IceLab з оптовими цінами залежно від обсягу',
          en: 'IceLab B2B page with volume-based wholesale pricing',
          ru: 'B2B-страница IceLab с оптовыми ценами в зависимости от объёма',
        }),
      },
      {
        _key: 'icl-design',
        _type: 'imageTextBlock',
        variant: 'centered',
        eyebrow: ls('/ DESIGN', '/ DESIGN', '/ DESIGN'),
        heading: ls('Візуальна *концепція*', 'The visual *concept*', 'Визуальная *концепция*'),
        body: body(
          'des',
          'Дизайн побудований навколо властивостей самого продукту: холоду, льоду, пари та технологічного виробництва. Світлий перший екран створює відчуття морозного повітря, глибокі сині блоки додають контрасту, а великі акцентні заголовки, градієнти, фотографії сухого льоду та напівпрозорі картки формують упізнаваний стиль IceLab. Візуал передає характер продукту, але залишає ціни, характеристики та кнопки замовлення головними елементами сторінки.',
          'The design is built around the product itself: cold, ice, vapour and industrial production. The light first screen feels like frosty air, deep blue blocks add contrast, and large accent headings, gradients, dry ice photography and translucent cards form the recognizable IceLab style. The visuals carry the character of the product while keeping prices, specs and order buttons the primary elements of every page.',
          'Дизайн построен вокруг свойств самого продукта: холода, льда, пара и технологичного производства. Светлый первый экран создаёт ощущение морозного воздуха, глубокие синие блоки добавляют контраста, а крупные акцентные заголовки, градиенты, фотографии сухого льда и полупрозрачные карточки формируют узнаваемый стиль IceLab. Визуал передаёт характер продукта, но оставляет цены, характеристики и кнопки заказа главными элементами страницы.',
        ),
      },
      {
        _key: 'icl-gallery',
        _type: 'mediaGalleryBlock',
        enableLightbox: true,
        images: [
          {
            _key: 'icl-g-1',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.category, _type: 'reference'}},
            alt: ls(
              'Категорія «Сухий лід» у каталозі IceLab',
              'Dry ice category in the IceLab catalogue',
              'Категория «Сухой лёд» в каталоге IceLab',
            ),
            caption: ls('Каталог', 'Catalogue', 'Каталог'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'icl-g-2',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.faq, _type: 'reference'}},
            alt: ls(
              'FAQ IceLab з відповідями на запитання про сухий лід',
              'IceLab FAQ answering common dry ice questions',
              'FAQ IceLab с ответами на вопросы о сухом льде',
            ),
            caption: ls('FAQ', 'FAQ', 'FAQ'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'icl-g-3',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.payment, _type: 'reference'}},
            alt: ls(
              'Сторінка доставки та оплати IceLab',
              'IceLab delivery and payment page',
              'Страница доставки и оплаты IceLab',
            ),
            caption: ls('Доставка та оплата', 'Delivery and payment', 'Доставка и оплата'),
            displayMode: 'general',
            objectPosition: 'center',
          },
          {
            _key: 'icl-g-4',
            _type: 'mediaGalleryImageItem',
            image: {_type: 'image', asset: {_ref: a.about, _type: 'reference'}},
            alt: ls(
              'Сторінка про компанію IceLab',
              'IceLab about page',
              'Страница о компании IceLab',
            ),
            caption: ls('Про компанію', 'About', 'О компании'),
            displayMode: 'general',
            objectPosition: 'center',
          },
        ],
      },
      {
        _key: 'icl-local-seo',
        _type: 'imageTextBlock',
        variant: 'side-with-list',
        imageVariant: 'imageRight',
        eyebrow: ls('/ LOCAL SEO', '/ LOCAL SEO', '/ LOCAL SEO'),
        heading: ls(
          'Локальне *SEO-просування*',
          'Local *SEO promotion*',
          'Локальное *SEO-продвижение*',
        ),
        body: body(
          'loc',
          'Окремою частиною роботи стала структура під пошук сухого льоду в різних містах України. На кожній локальній сторінці користувач отримує інформацію про доставку, самовивіз, актуальні ціни та варіанти використання сухого льоду у своєму регіоні. Це допомагає Google показувати не одну загальну сторінку компанії, а максимально релевантну сторінку під конкретний локальний запит.',
          'A separate part of the work was the structure for dry ice searches across Ukrainian cities. Each local page gives the user delivery and pickup information, current prices and dry ice use cases for their region. This lets Google surface the most relevant page for a specific local query instead of one generic company page.',
          'Отдельной частью работы стала структура под поиск сухого льда в разных городах Украины. На каждой локальной странице пользователь получает информацию о доставке, самовывозе, актуальных ценах и вариантах использования сухого льда в своём регионе. Это помогает Google показывать не одну общую страницу компании, а максимально релевантную страницу под конкретный локальный запрос.',
        ),
        bulletIcon: 'dot',
        bulletList: [
          li(
            'loc-1',
            'Київ, Львів, Дніпро, Одеса, Харків',
            'Kyiv, Lviv, Dnipro, Odesa, Kharkiv',
            'Киев, Львов, Днепр, Одесса, Харьков',
          ),
          li(
            'loc-2',
            'Запоріжжя, Кривий Ріг, Вінниця, Івано-Франківськ, Полтава',
            'Zaporizhzhia, Kryvyi Rih, Vinnytsia, Ivano-Frankivsk, Poltava',
            'Запорожье, Кривой Рог, Винница, Ивано-Франковск, Полтава',
          ),
          li(
            'loc-3',
            'Доставка, самовивіз і ціни для кожного міста',
            'Delivery, pickup and prices for each city',
            'Доставка, самовывоз и цены для каждого города',
          ),
          li(
            'loc-4',
            'Релевантна сторінка під конкретний локальний запит',
            'A relevant page for each specific local query',
            'Релевантная страница под конкретный локальный запрос',
          ),
        ],
        image: img(a.cityKyiv, {
          uk: 'Локальна SEO-сторінка «Сухий лід у Києві» на сайті IceLab',
          en: 'IceLab local SEO page for dry ice in Kyiv',
          ru: 'Локальная SEO-страница «Сухой лёд в Киеве» на сайте IceLab',
        }),
      },
      {
        _key: 'icl-outcome',
        _type: 'imageTextBlock',
        variant: 'centered',
        centeredLayout: 'horizontal',
        eyebrow: ls('/ OUTCOME', '/ OUTCOME', '/ OUTCOME'),
        heading: ls(
          'Результат *для клієнта*',
          'The result *for the client*',
          'Результат *для клиента*',
        ),
        body: body(
          'out',
          'IceLab отримав не просто презентаційний сайт, а повноцінну систему онлайн-продажів і залучення клієнтів із пошуку. За 28 днів сайт отримав 3,67 тис. показів і 212 переходів із Google, середню позицію 8,3 та CTR 5,8%. Цей результат став наслідком правильної структури: окремих сторінок під категорії, товари, міста, B2B-напрям і конкретні потреби покупців.',
          'IceLab got a full online sales and search acquisition system, not just a showcase site. In 28 days it earned 3.67k impressions and 212 clicks from Google, an average position of 8.3 and a 5.8% CTR. The result comes from the right structure: dedicated pages for categories, products, cities, the B2B funnel and specific buyer needs.',
          'IceLab получил не просто презентационный сайт, а полноценную систему онлайн-продаж и привлечения клиентов из поиска. За 28 дней сайт получил 3,67 тыс. показов и 212 переходов из Google, среднюю позицию 8,3 и CTR 5,8%. Этот результат стал следствием правильной структуры: отдельных страниц под категории, товары, города, B2B-направление и конкретные потребности покупателей.',
        ),
        bulletIcon: 'check',
        bulletList: [
          li(
            'out-1',
            'Презентує компанію як виробника, а не посередника',
            'Presents the company as a manufacturer, not a reseller',
            'Презентует компанию как производителя, а не посредника',
          ),
          li(
            'out-2',
            'Дозволяє оформити роздрібне замовлення онлайн',
            'Lets customers place retail orders online',
            'Позволяет оформить розничный заказ онлайн',
          ),
          li(
            'out-3',
            'Збирає окремі звернення від оптових клієнтів',
            'Collects separate enquiries from wholesale clients',
            'Собирает отдельные обращения от оптовых клиентов',
          ),
          li(
            'out-4',
            'Просувається за категорійними й локальними запитами',
            'Ranks for category and local search queries',
            'Продвигается по категорийным и локальным запросам',
          ),
          li(
            'out-5',
            'Відповідає на запитання ще до звернення до менеджера',
            'Answers questions before a manager is even contacted',
            'Отвечает на вопросы ещё до обращения к менеджеру',
          ),
          li(
            'out-6',
            'Працює як довгостроковий канал залучення клієнтів',
            'Works as a long-term client acquisition channel',
            'Работает как долгосрочный канал привлечения клиентов',
          ),
        ],
        image: img(a.phKyiv, {
          uk: 'Локальна сторінка сухого льоду в Києві на телефоні',
          en: 'IceLab Kyiv dry ice page on a phone',
          ru: 'Локальная страница сухого льда в Киеве на телефоне',
        }),
        image2: img(a.lapProd, {
          uk: 'Сторінка виробництва сухого льоду IceLab на ноутбуці',
          en: 'IceLab dry ice production page on a laptop',
          ru: 'Страница производства сухого льда IceLab на ноутбуке',
        }),
      },
    ],
    seo: {
      title: {
        uk: 'IceLab — кейс | Code-Site.Art',
        en: 'ᐈ IceLab — Dry Ice Online Store Case Study | Code-Site.Art',
        ru: 'IceLab — кейс | Code-Site.Art',
      },
      description: {
        uk: 'IceLab — інтернет-магазин сухого льоду: каталог із замовленням, B2B-розділ, 10 локальних SEO-сторінок і середня позиція 8,3 у Google за 28 днів.',
        en: '➤ Dry ice e-commerce site for a Ukrainian manufacturer ✔️ Catalogue with ordering ✔️ B2B funnel ✔️ Local SEO pages for 10 cities ✔️ Google position 8.3 in 28 days ➡ See the full case study.',
        ru: 'IceLab — интернет-магазин сухого льда: каталог с заказом, B2B-раздел, 10 локальных SEO-страниц и средняя позиция 8,3 в Google за 28 дней.',
      },
    },
  }
}

async function main() {
  const existing = await client.fetch(
    '*[_type == "caseStudy" && slug.current == "icelab"][0]{_id}',
  )
  if (existing?._id) {
    console.log(`Case with slug "icelab" already exists: ${existing._id} — aborting.`)
    return
  }

  for (const [slot, [path]] of Object.entries(IMAGES)) {
    if (!existsSync(path)) throw new Error(`Missing image for ${slot}: ${path}`)
  }

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — create caseStudy "icelab"`)
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

  const patched = await client
    .patch(INDUSTRY_ECOMMERCE)
    .setIfMissing({relatedCases: []})
    .append('relatedCases', [{_key: 'icl-rel-1', _ref: created._id, _type: 'reference'}])
    .commit()
  console.log(`Linked as relatedCases on ${patched._id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
