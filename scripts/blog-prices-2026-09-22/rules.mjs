/**
 * Rewrite rules for the 2026-09-22 blog price pass.
 *
 * Order: DOC_EXACT (whole string, one document) → EXACT (whole string, any
 * document) → SUB (substring regexes). Whole-string rules win so that a
 * sentence rewritten by hand is never touched again by a generic rule.
 *
 * What must survive untouched (see KEEP): competitor and platform prices
 * (Tilda, Wix, WordPress plugins, freelancer rates), the client budgets in the
 * SEO-vs-Ads case (€3 000 / €600), the Denmark case fee, Tatarka's $250 000,
 * "$800 and $8 000" as a description of the market's spread, and the unrelated
 * hryvnia figures in the llms.txt example.
 */

/** Old list still in the copy — drives the residue report, not the rewriting. */
export const OLD =
  /\$\s?800|\$\s?2[  ,]?500|\$\s?3[  ,]?500|\$\s?4[  ,]?500|\$\s?6[  ,]?000|\$\s?6[  ,]?500|\$\s?12[  ,]?000|\$\s?10[  ,]?000|\$\s?150\b|\$\s?190\b|\$\s?300\b|\$\s?450\b|\$\s?200\s?\/|\$\s?40\s?\/|£\s?\d|24\/7/i;

export const KEEP =
  /Tilda|Wix|WordPress|Shopify|Horoshop|Prom\b|фрілансер|фрилансер|freelanc|Google Ads|Meta Ads|реклам|грн за кг|Tatarka|250[  ,]000|7[  ,]200|\$800 і \$8[  ]000|\$800 и \$8[  ]000|\$800, і \$8|\$500, а в іншої|\$500, а у другой|\$8[  ]000|конкурент|консультацію 24\/7|консультацию 24\/7|24\/7 consultation|до \$15,000|до \$15[  ]000|to £15,000|підписки|подписки|subscription|24\/7 booking|Bookings 24\/7|Self-assessment from|£30–£80\/hr/i;

const FLAGSHIP = "kSKPKaUF67MMZcPKqwVwa6"; // «Кошторис на розробку сайту 2026»
const CLINIC = "691506aa-d76b-492c-b85d-62cc492db317"; // «Скільки коштує сайт для клініки»
const SEO_PRICE = "28710b68-e06f-436d-a207-2866e0538728"; // «Бюджет на просування сайту»
const LAWYER = "ltAug2026-sait-dlia-advokata";
const TILDA = "gvhqpxBkuTxVKsvJravgoG"; // Tilda / WordPress vs custom
const CLINIC_TURNKEY = "b0a6ca40-e2fd-45c8-a3ad-5c5748e54e5b";
const ADMIN_PANEL = "b5728991-81b4-4240-8729-8c8798481123";
const CONSTRUCTION = "c8eb4ff7-44d3-4fd4-8ac8-094ca7839722";
const HOSPITAL = "f5eb3ad4-86b9-4923-97ae-4c513ff93264";
const CMS_GLOSSARY = "glos2026-shcho-take-cms";

const COSMETICS = "ltAug2026-internet-mahazyn-kosmetyky";
const CLOTHING = "ltAug2026-internet-mahazyn-odiahu";
const AUTOPARTS = "ltAug2026-internet-mahazyn-avtozapchastyn";
const SALON = "ltAug2026-sait-dlia-salonu-krasy";

const row = (key, cells) => ({ _key: key, _type: "blogTableRow", cells });

/** Cells shared by the shop articles: the middle tier is the shop package. */
const shopCellsUk = {
  "від $2 500": "$1 500",
  "$2 500": "$1 500",
  "**від $2 500**": "**$1 500**",
  "**$2 500**": "**$1 500**",
};
const shopCellsRu = {
  "от $2 500": "$1 500",
  "$2 500": "$1 500",
  "**от $2 500**": "**$1 500**",
  "**$2 500**": "**$1 500**",
};
const shopCellsEn = {
  "from £3,500": "€3,900",
  "£3,500": "€3,900",
  "**from £3,500**": "**€3,900**",
  "**£3,500**": "**€3,900**",
};

/** Whole blocks rewritten by hand: TL;DR lists and price tables. */
export const DOC_NODES = {
  [FLAGSHIP]: {
    uk: {
      "a1-27": {
        title: "За 60 секунд",
        items: [
          "Сайт в Україні у 2026 коштує **від $600 до $4 000+**. Цифра залежить від обсягу, а не від краси дизайну.",
          "**Лендінг:** $600 (3 робочі дні)",
          "**Сайт для бізнесу:** $1 000 (7 робочих днів)",
          "**Інтернет-магазин:** $1 500 (14 робочих днів)",
          "**Галузевий пакет:** від $1 800 (14–21 робочий день)",
          "**Кастомна розробка:** від $4 000 (від 6 тижнів)",
          "У Code-Site.Art ціна і строк зафіксовані в договорі до старту робіт.",
        ],
      },
      "a1-2q": {
        headers: ["Пакет", "Ціна", "Термін", "Що входить", "Кому"],
        rows: [
          row("pk-landing", ["Лендінг", "$600", "3 робочі дні", "Сторінка-лонгрід, адаптив, форма, базове SEO", "Одна послуга, запуск, реклама"]),
          row("pk-business", ["Сайт для бізнесу", "$1 000", "7 робочих днів", "До 5 сторінок, Sanity CMS, форми, SEO-структура, аналітика", "Послуги, малий і середній бізнес"]),
          row("pk-shop", ["Інтернет-магазин", "$1 500", "14 робочих днів", "До 100 товарів, кошик, оплата, доставка, CMS", "Роздріб, перший онлайн-канал"]),
          row("pk-industry", ["Галузевий пакет", "від $1 800", "14–21 робочий день", "Пакет під нішу: медицина, юристи, фінанси, ремонт, авто, нерухомість", "Клініки, юрфірми, сервіси"]),
          row("pk-custom", ["Кастомна розробка", "від $4 000", "від 6 тижнів", "Своя архітектура, інтеграції, нестандартна логіка", "Платформи, маркетплейси, складні продукти"]),
        ],
      },
    },
    ru: {
      "a1-27": {
        title: "За 60 секунд",
        items: [
          "Сайт в Украине в 2026 стоит **от $600 до $4 000+**. Цифра зависит от объёма, а не от красоты дизайна.",
          "**Лендинг:** $600 (3 рабочих дня)",
          "**Сайт для бизнеса:** $1 000 (7 рабочих дней)",
          "**Интернет-магазин:** $1 500 (14 рабочих дней)",
          "**Отраслевой пакет:** от $1 800 (14–21 рабочий день)",
          "**Кастомная разработка:** от $4 000 (от 6 недель)",
          "В Code-Site.Art цена и срок зафиксированы в договоре до старта работ.",
        ],
      },
      "a1-2q": {
        headers: ["Пакет", "Цена", "Срок", "Что входит", "Кому"],
        rows: [
          row("pk-landing", ["Лендинг", "$600", "3 рабочих дня", "Страница-лонгрид, адаптив, форма, базовое SEO", "Одна услуга, запуск, реклама"]),
          row("pk-business", ["Сайт для бизнеса", "$1 000", "7 рабочих дней", "До 5 страниц, Sanity CMS, формы, SEO-структура, аналитика", "Услуги, малый и средний бизнес"]),
          row("pk-shop", ["Интернет-магазин", "$1 500", "14 рабочих дней", "До 100 товаров, корзина, оплата, доставка, CMS", "Розница, первый онлайн-канал"]),
          row("pk-industry", ["Отраслевой пакет", "от $1 800", "14–21 рабочий день", "Пакет под нишу: медицина, юристы, финансы, ремонт, авто, недвижимость", "Клиники, юрфирмы, сервисы"]),
          row("pk-custom", ["Кастомная разработка", "от $4 000", "от 6 недель", "Своя архитектура, интеграции, нестандартная логика", "Платформы, маркетплейсы, сложные продукты"]),
        ],
      },
    },
    en: {
      "a1-1": {
        title: "In 60 seconds",
        items: [
          "A custom website in the UK and Europe costs **€1,200 to €9,000+** in 2026. The number tracks scope, not design flair.",
          "**Landing page:** €1,200 (3 working days)",
          "**Business website:** €2,500 (7 working days)",
          "**Online store:** €3,900 (14 working days)",
          "**Industry package:** from €4,500 (14–21 working days)",
          "**Custom build:** from €9,000 (from 6 weeks)",
          "Every package covers design, build, CMS, hosting setup, launch and a year of support.",
          "At Code-Site.Art the price is fixed in the contract before work starts.",
        ],
      },
      "a1-n": {
        headers: ["Package", "Price", "Timeline", "What's included", "Best for"],
        rows: [
          row("pk-landing", ["Landing page", "€1,200", "3 working days", "One long-form page, responsive build, form, basic SEO", "Campaigns, launches, a single service"]),
          row("pk-business", ["Business website", "€2,500", "7 working days", "Up to 5 pages, Sanity CMS, forms, SEO structure, analytics", "SMBs and professional services"]),
          row("pk-shop", ["Online store", "€3,900", "14 working days", "Up to 100 products, cart, payments, delivery, CMS", "Retail moving online"]),
          row("pk-industry", ["Industry package", "from €4,500", "14–21 working days", "A niche build: healthcare, legal, finance, renovation, auto, property", "Clinics, law firms, agencies"]),
          row("pk-custom", ["Custom build", "from €9,000", "from 6 weeks", "Bespoke architecture, integrations, non-standard logic", "Platforms, marketplaces, complex products"]),
        ],
      },
    },
  },

  // A clinic site is the `industry` package ($1 800 / €4,500), not the old
  // three-tier agency ladder; a clinic group is a custom build.
  [CLINIC]: {
    uk: {
      cw000: {
        title: "За 60 секунд",
        items: [
          "Сайт клініки у 2026 коштує **від $1 800 до $4 000+**. Цифра залежить від систем, а не від дизайну.",
          "**Сайт клініки:** $1 800 — галузевий пакет: до 5 сторінок, онлайн-запис, інтеграція Helsi / Medesk, прайс (14–21 робочий день)",
          "**З блогом, SEO-сторінками і другою мовою:** близько $2 200 — пакет плюс опції з прайсу",
          "**Мережа клінік:** від $4 000 — кастомна розробка: багатофіліальність, повна CRM-інтеграція (від 6 тижнів)",
          "Лендінг-візитка без запису й каталогу — $600, але для клініки це тимчасове рішення",
          "У Code-Site.Art сума фіксується в договорі до старту робіт.",
        ],
      },
    },
    ru: {
      cw01o: {
        title: "За 60 секунд",
        items: [
          "Сайт клиники в 2026 стоит **от $1 800 до $4 000+**. Цифра зависит от систем, а не от дизайна.",
          "**Сайт клиники:** $1 800 — отраслевой пакет: до 5 страниц, онлайн-запись, интеграция Helsi / Medesk, прайс (14–21 рабочий день)",
          "**С блогом, SEO-страницами и вторым языком:** около $2 200 — пакет плюс опции из прайса",
          "**Сеть клиник:** от $4 000 — кастомная разработка: мультифилиальность, полная CRM-интеграция (от 6 недель)",
          "Лендинг-визитка без записи и каталога — $600, но для клиники это временное решение",
          "В Code-Site.Art сумма фиксируется в договоре до старта работ.",
        ],
      },
    },
    en: {
      cw03c: {
        title: "In 60 seconds",
        items: [
          "A clinic website in the UK and Europe costs **€4,500 to €9,000+** in 2026. The number tracks systems, not design.",
          "**Clinic website:** €4,500 — the industry package: up to 5 pages, online booking, a booking-system integration, price list (14–21 working days)",
          "**With a blog, SEO pages and a second language:** about €5,300 — the package plus add-ons from the price list",
          "**Multi-site group:** from €9,000 — a custom build: multi-location structure, full CRM integration (from 6 weeks)",
          "A one-page brochure site without booking — €1,200, but for a clinic it's a stopgap",
          "At Code-Site.Art the price is fixed in the contract before work starts.",
        ],
      },
    },
  },
};

export const DOC_EXACT = {
  // Shops: the middle tier here is the `shop` package ($1 500 / €3,900), not
  // the business one the generic ladder rule would pick.
  [COSMETICS]: {
    uk: {
      ...shopCellsUk,
      "Ціни: лендінг бренду — від $800, повноцінний магазин — від $2 500, платформа з підписками — від $6 000.":
        "Ціни: лендінг бренду — $600, повноцінний магазин — $1 500, платформа з підписками — від $4 000.",
    },
    ru: {
      ...shopCellsRu,
      "Цены: лендинг бренда — от $800, полноценный магазин — от $2 500, платформа с подписками — от $6 000.":
        "Цены: лендинг бренда — $600, полноценный магазин — $1 500, платформа с подписками — от $4 000.",
    },
    en: shopCellsEn,
  },

  [CLOTHING]: {
    uk: {
      ...shopCellsUk,
      "$1 000": "$1 500",
      "**$1 000**": "**$1 500**",
      "Вилка цін: лендінг-вітрина від $800, корпоративний e-commerce від $2 500, кастомна платформа з фідами постачальників від $6 000.":
        "Вилка цін: лендінг-вітрина $600, інтернет-магазин $1 500, кастомна платформа з фідами постачальників від $4 000.",
    },
    ru: {
      ...shopCellsRu,
      "$1 000": "$1 500",
      "**$1 000**": "**$1 500**",
      "Цены: витрина-лендинг от $800, полноценный магазин от $2 500, кастомная платформа с фидами поставщиков от $6 000.":
        "Цены: витрина-лендинг $600, интернет-магазин $1 500, кастомная платформа с фидами поставщиков от $4 000.",
    },
    en: shopCellsEn,
  },

  [AUTOPARTS]: {
    uk: {
      ...shopCellsUk,
      "Інтернет-магазин автозапчастин під ключ коштує від $2 500 (каталог на корпоративній платформі) до $6 000+ (кастомна платформа з VIN-підбором і фідами постачальників).":
        "Інтернет-магазин автозапчастин під ключ коштує від $1 500 (каталог на платформі магазину) до $4 000+ (кастомна платформа з VIN-підбором і фідами постачальників).",
      " у нашій студії стартує від $2 500 — це каталог на базі корпоративної платформи з ручним підбором і одним фідом. Повноцінна кастомна платформа з VIN-підбором — від $6 000. Ось як бюджет розкладається на етапи:":
        " у нашій студії стартує від $1 500 — це каталог на платформі магазину з ручним підбором і одним фідом. Повноцінна кастомна платформа з VIN-підбором — від $4 000. Ось як бюджет розкладається на етапи:",
    },
    ru: {
      ...shopCellsRu,
      "Создание интернет-магазина автозапчастей под ключ стоит от $2 500 (каталог на готовой платформе) до $6 000+ (кастомная платформа с VIN-подбором и фидами поставщиков).":
        "Создание интернет-магазина автозапчастей под ключ стоит от $1 500 (каталог на платформе магазина) до $4 000+ (кастомная платформа с VIN-подбором и фидами поставщиков).",
      " в нашей студии начинается от $2 500 — каталог на базе корпоративной платформы с ручным подбором и одним фидом. Создание интернет-магазина автозапчастей под ключ с VIN-подбором — от $6 000. Вот как смета раскладывается по этапам:":
        " в нашей студии начинается от $1 500 — каталог на платформе магазина с ручным подбором и одним фидом. Полноценная кастомная платформа с VIN-подбором — от $4 000. Вот как смета раскладывается по этапам:",
      "Цены: витрина-лендинг от $800, полноценный магазин от $2 500, кастомная платформа с фидами поставщиков от $6 000.":
        "Цены: витрина-лендинг $600, полноценный магазин $1 500, кастомная платформа с фидами поставщиков от $4 000.",
    },
    en: {
      ...shopCellsEn,
      "An auto parts online store costs from £3,500 (catalogue on a ready-made platform) to £6,000+ (custom platform with VIN lookup and supplier feeds).":
        "An auto parts online store costs from €3,900 (catalogue on the store platform) to €9,000+ (custom platform with VIN lookup and supplier feeds).",
      " at our studio starts from £3,500 — a catalogue on our corporate platform base with manual part matching and one supplier feed. A full custom auto parts platform with VIN lookup starts from £6,000. Here is how the budget breaks down by stage:":
        " at our studio starts from €3,900 — a catalogue on the store platform with manual part matching and one supplier feed. A full custom auto parts platform with VIN lookup starts from €9,000. Here is how the budget breaks down by stage:",
    },
  },

  // Beauty salon: business package plus the booking add-on; a chain is custom.
  [SALON]: {
    uk: {
      "Лендінг для майстра — від $800, сайт салону — $1 500–3 000, сайт мережі салонів — від $2 500.":
        "Лендінг для майстра — $600, сайт салону — $1 000 плюс онлайн-запис за $300, мережа салонів — кастомна розробка від $4 000.",
    },
    ru: {
      "Лендинг мастера — от $800, сайт салона — $1 500–3 000, сайт сети салонов — от $2 500.":
        "Лендинг мастера — $600, сайт салона — $1 000 плюс онлайн-запись за $300, сеть салонов — кастомная разработка от $4 000.",
    },
  },

  // Support tariffs and bold price spans: scoped to the lawyer article, since
  // "$200/міс" elsewhere is a competitor's subscription, not ours.
  [LAWYER]: {
    uk: {
      "$200/міс": "перший рік у ціні пакета",
      "від **$800**": "**$600**",
      "від **$2 500**": "**$1 800**",
    },
    ru: {
      "$200/мес": "первый год в цене пакета",
      "от **$800**": "**$600**",
      "от **$2 500**": "**$1 800**",
    },
    en: {
      "£200/month": "included for the first year",
      "from **£800**": "**€1,200**",
      "from **£3,500**": "**€4,500**",
    },
  },

  // Tilda / WordPress comparison: their prices are theirs, ours move to the
  // list. The whole table goes to euro on /en so one table is one currency.
  [TILDA]: {
    uk: {
      "від $800 / $3,500": "$600 / $1 000",
      "$3,500 одноразово": "$1 000 одноразово",
      "~$3,500": "~$1 000",
      " — пакети від $800 на сторінці цін.": " — пакети від $600 на сторінці цін.",
      "Кастом (Корпоративний сайт)": "Кастом (Сайт для бізнесу)",
      "Бізнес-тариф Tilda з add-ons виходить **$7,200 за 3 роки**. За ці гроші кастом замовляють двічі.":
        "Бізнес-тариф Tilda з add-ons виходить **$7,200 за 3 роки**. За ці гроші кастомний сайт замовляють сім разів.",
    },
    ru: {
      "от $800 / $3,500": "$600 / $1 000",
      "$3,500 единоразово": "$1 000 единоразово",
      "~$3,500": "~$1 000",
      "Кастом (Корпоративный сайт)": "Кастом (Сайт для бизнеса)",
      "Бизнес-тариф Tilda с add-ons выходит **$7,200 за 3 года**. За эти деньги кастом заказывают дважды.":
        "Бизнес-тариф Tilda с add-ons выходит **$7,200 за 3 года**. За эти деньги кастомный сайт заказывают семь раз.",
    },
    en: {
      "From £800 / £3,500": "€1,200 / €2,500",
      "£1,500–£8,000 for a custom build": "€1,800–€9,500 for a custom build",
      "Plugin renewals £300–£800/yr + maintenance": "Plugin renewals €350–€950/yr + maintenance",
      "Tied to WP; migration costs £500–£5,000": "Tied to WP; migration costs €600–€6,000",
      "£3,500 (corporate tier)": "€2,500 (business tier)",
      "£3,000–£8,000": "€3,500–€9,500",
      "Included year 1, then ~£0": "Included year 1, then ~€0",
      "£50–£200/month managed WP": "€60–€240/month managed WP",
      "£300–£800/year": "€350–€950/year",
      "£500–£1,500/month if outsourced": "€600–€1,800/month if outsourced",
      "£200–£2,000 average per incident": "€240–€2,400 average per incident",
      "~£3,500–£4,500": "~€2,500–€3,000",
      "£8,000–£25,000+": "€9,500–€30,000+",
      "Your budget is under £1,500 and a template site does the job":
        "Your budget is under €1,800 and a template site does the job",
      "Landing 1–2 wks, corporate 4–8 wks": "Landing 3 working days, business 7",
    },
  },

  // Construction: the `renovation` industry package is the top tier here.
  [CONSTRUCTION]: {
    uk: {
      "Сайт для будівельної компанії коштує **від $800 до $4,500**.":
        "Сайт для будівельної компанії коштує **від $600 до $1 800**.",
      "**Лендінг:** від $800 (1–2 тижні) — одна послуга або рекламна кампанія":
        "**Лендінг:** $600 (3 робочі дні) — одна послуга або рекламна кампанія",
      "**Повний сайт:** від $3,500 (4–8 тижнів) — портфоліо, сторінки послуг, локальне SEO":
        "**Сайт для бізнесу:** $1 000 (7 робочих днів) — портфоліо, сторінки послуг, локальне SEO",
      "**Двомовний сайт для роботи за кордоном:** від $4,000 — як наш кейс у Данії":
        "**Галузевий пакет «Будівництво»:** від $1 800 — калькулятор кошторису, дві мови, локальне SEO",
      "від $4,000": "від $1 800",
      "У будівельній ніші висока ціна угоди: один договір на ремонт чи будівництво — це тисячі доларів. Тобто сайт за $3,500 окуповується з першого-другого закритого клієнта. Мало який бізнес має таку математику.":
        "У будівельній ніші висока ціна угоди: один договір на ремонт чи будівництво — це тисячі доларів. Тобто сайт за $1 000 окуповується з першого закритого клієнта. Мало який бізнес має таку математику.",
    },
    ru: {
      "Сайт для строительной компании стоит **от $800 до $4,500**.":
        "Сайт для строительной компании стоит **от $600 до $1 800**.",
      "**Лендинг:** от $800 (1–2 недели) — одна услуга или рекламная кампания":
        "**Лендинг:** $600 (3 рабочих дня) — одна услуга или рекламная кампания",
      "**Полный сайт:** от $3,500 (4–8 недель) — портфолио, страницы услуг, локальное SEO":
        "**Сайт для бизнеса:** $1 000 (7 рабочих дней) — портфолио, страницы услуг, локальное SEO",
      "**Двуязычный сайт для работы за рубежом:** от $4,000 — как наш кейс в Дании":
        "**Отраслевой пакет «Строительство»:** от $1 800 — калькулятор сметы, два языка, локальное SEO",
      "от $4,000": "от $1 800",
      "В строительной нише высокая цена сделки: один договор на ремонт или строительство — это тысячи долларов. То есть сайт за $3,500 окупается с первого-второго закрытого клиента. Мало какой бизнес имеет такую математику.":
        "В строительной нише высокая цена сделки: один договор на ремонт или строительство — это тысячи долларов. То есть сайт за $1 000 окупается с первого закрытого клиента. Мало какой бизнес имеет такую математику.",
    },
    en: {
      "A builder's website costs **£800 to £4,500** in 2026.":
        "A builder's website costs **€1,200 to €4,500** in 2026.",
      "**Landing page:** from £800 (1–2 weeks) — one service or an ad campaign":
        "**Landing page:** €1,200 (3 working days) — one service or an ad campaign",
      "**Full website:** from £3,500 (4–8 weeks) — portfolio, service pages, local SEO":
        "**Business website:** €2,500 (7 working days) — portfolio, service pages, local SEO",
      "**Bilingual site for cross-border work:** from £4,000 — like our Danish case":
        "**Construction industry package:** from €4,500 — a quote calculator, two languages, local SEO",
      "Our case: a £4,000-scale site brought a construction firm 300+ enquiries in a year":
        "Our case: a €4,000-scale site brought a construction firm 300+ enquiries in a year",
      "from £4,000": "from €4,500",
      "Construction has a high deal value: one renovation or build contract is worth thousands. A £3,500 website pays for itself with the first or second closed client. Few industries have that maths.":
        "Construction has a high deal value: one renovation or build contract is worth thousands. A €2,500 website pays for itself with the first closed client. Few industries have that maths.",
      "The full-site price includes everything: structure and launch copy, custom design, a CMS (you update the portfolio and prices yourself), CRM integrations, local SEO, launch and a year of warranty. Compare that with £349/month template subscriptions that you never stop paying.":
        "The full-site price includes everything: structure and launch copy, custom design, a CMS (you update the portfolio and prices yourself), CRM integrations, local SEO, launch and a year of warranty. Compare that with €399/month template subscriptions that you never stop paying.",
    },
  },

  // Solo practice vs clinic vs hospital group.
  [HOSPITAL]: {
    uk: {
      "**Кабінет:** лендінг від $800 · **Клініка:** повний сайт від $3,500 · **Лікарня/мережа:** від $12,000":
        "**Кабінет:** лендінг $600 · **Клініка:** галузевий пакет $1 800 · **Лікарня/мережа:** кастом від $4 000",
      "Приватний кабінет: лендінг від $800": "Приватний кабінет: лендінг $600",
      "Клініка: повний сайт від $3,500": "Клініка: галузевий пакет $1 800",
      "Кілька лікарів, десятки послуг, два-три напрями. Тут працює система: сторінка під кожну послугу (це і SEO-точки входу), каталог лікарів із розкладами, онлайн-запис з інтеграцією в медсистему, прайс, керований з адмінки. Розширений формат від $6,500 додає блог, ДМС-інтеграцію і медичну CRM.":
        "Кілька лікарів, десятки послуг, два-три напрями. Тут працює система: сторінка під кожну послугу (це і SEO-точки входу), каталог лікарів із розкладами, онлайн-запис з інтеграцією в медсистему, прайс, керований з адмінки. Блог, ДМС-інтеграція і медична CRM додаються опціями — це ще близько $500 до пакета.",
      "Лікарня і мережа: від $12,000": "Лікарня і мережа: кастомна розробка від $4 000",
      "від $6,500": "$2 300",
      "від $12,000": "від $4 000",
    },
    ru: {
      "**Кабинет:** лендинг от $800 · **Клиника:** полный сайт от $3,500 · **Больница/сеть:** от $12,000":
        "**Кабинет:** лендинг $600 · **Клиника:** отраслевой пакет $1 800 · **Больница/сеть:** кастом от $4 000",
      "Частный кабинет: лендинг от $800": "Частный кабинет: лендинг $600",
      "Клиника: полный сайт от $3,500": "Клиника: отраслевой пакет $1 800",
      "Несколько врачей, десятки услуг, два-три направления. Здесь работает система: страница под каждую услугу (это и SEO-точки входа), каталог врачей с расписаниями, онлайн-запись с интеграцией в медсистему, прайс, управляемый из админки. Расширенный формат от $6,500 добавляет блог, ДМС-интеграцию и медицинскую CRM.":
        "Несколько врачей, десятки услуг, два-три направления. Здесь работает система: страница под каждую услугу (это и SEO-точки входа), каталог врачей с расписаниями, онлайн-запись с интеграцией в медсистему, прайс, управляемый из админки. Блог, ДМС-интеграция и медицинская CRM добавляются опциями — это ещё около $500 к пакету.",
      "Больница и сеть: от $12,000": "Больница и сеть: кастомная разработка от $4 000",
      "от $6,500": "$2 300",
      "от $12,000": "от $4 000",
    },
    en: {
      "**Solo practice:** a landing page from £800 · **Clinic:** a full site from £3,500 · **Hospital/group:** from £12,000":
        "**Solo practice:** a landing page €1,200 · **Clinic:** the industry package €4,500 · **Hospital/group:** a custom build from €9,000",
      "A solo practice: a landing page from £800": "A solo practice: a landing page €1,200",
      "A clinic: a full website from £3,500": "A clinic: the industry package €4,500",
      "Several practitioners, dozens of services, two or three arms. A system works here: a page per service (your SEO entry points), a practitioner directory with schedules, online booking integrated with your practice system, a CMS-managed price list. The extended format from £6,500 adds a blog, insurance integration and a clinic CRM.":
        "Several practitioners, dozens of services, two or three arms. A system works here: a page per service (your SEO entry points), a practitioner directory with schedules, online booking integrated with your practice system, a CMS-managed price list. A blog, insurance integration and a clinic CRM come as add-ons — about €1,000 on top of the package.",
      "A hospital or group: from £12,000": "A hospital or group: a custom build from €9,000",
      "from £6,500": "€5,500",
      "from £12,000": "from €9,000",
    },
  },

  // CMS glossary: the admin area ships with the business package upwards.
  [CMS_GLOSSARY]: {
    uk: {
      "Лендінгу CMS часто не потрібна. У проєктах від $2 500 вона входить у пакет.":
        "Лендінгу CMS часто не потрібна. У пакеті «Сайт для бізнесу» за $1 000 вона вже входить.",
      "Чесна відповідь: не завжди. Лендінгу з однією офертою CMS частіше шкодить, ніж допомагає — текст там міняють раз на квартал, а система додає ще один рухомий елемент, який треба оновлювати й адмініструвати. Лендінг від $800 ми зазвичай віддаємо без адмінки: точкові правки виходять дешевшими.":
        "Чесна відповідь: не завжди. Лендінгу з однією офертою CMS частіше шкодить, ніж допомагає — текст там міняють раз на квартал, а система додає ще один рухомий елемент, який треба оновлювати й адмініструвати. Лендінг за $600 ми зазвичай віддаємо без адмінки: точкові правки виходять дешевшими.",
      "CMS потрібна там, де контент живий: новини, блог, каталог, ціни, вакансії, кілька мов, кілька людей із доступом. У наших проєктах від $2 500 вона входить у пакет — зокрема в ":
        "CMS потрібна там, де контент живий: новини, блог, каталог, ціни, вакансії, кілька мов, кілька людей із доступом. Починаючи з пакета «Сайт для бізнесу» вона входить у ціну — зокрема в ",
      " від $2 500. Окремої статті «налаштування адмінки» в рахунку не буває.":
        " за $1 000. Окремої статті «налаштування адмінки» в рахунку не буває.",
    },
    ru: {
      "Лендингу CMS часто не нужна. В проектах от $2 500 она входит в пакет.":
        "Лендингу CMS часто не нужна. В пакете «Сайт для бизнеса» за $1 000 она уже входит.",
      "Честный ответ: не всегда. Лендингу с одной оффертой CMS чаще вредит, чем помогает — текст там меняют раз в квартал, а система добавляет ещё один движущийся элемент, который нужно обновлять и администрировать. Лендинг от $800 мы обычно отдаём без админки: точечные правки выходят дешевле.":
        "Честный ответ: не всегда. Лендингу с одной оффертой CMS чаще вредит, чем помогает — текст там меняют раз в квартал, а система добавляет ещё один движущийся элемент, который нужно обновлять и администрировать. Лендинг за $600 мы обычно отдаём без админки: точечные правки выходят дешевле.",
      "CMS нужна там, где контент живой: новости, блог, каталог, цены, вакансии, несколько языков, несколько человек с доступом. В наших проектах от $2 500 она входит в пакет — в том числе в ":
        "CMS нужна там, где контент живой: новости, блог, каталог, цены, вакансии, несколько языков, несколько человек с доступом. Начиная с пакета «Сайт для бизнеса» она входит в цену — в том числе в ",
      " от $2 500. Отдельной строки «настройка админки» в счёте не бывает.":
        " за $1 000. Отдельной строки «настройка админки» в счёте не бывает.",
    },
    en: {
      "A landing page often needs no CMS at all. On projects from £3,500 it is included.":
        "A landing page often needs no CMS at all. From the €2,500 business package upwards it is included.",
      "A blog, a small shop, a budget under £1,000": "A blog, a small shop, a budget under €1,200",
      "Honestly, not always. For a single-offer landing page a CMS usually costs more than it saves — the copy changes once a quarter, and the system adds one more moving part to keep updated. A landing page from £800 normally ships without an admin area.":
        "Honestly, not always. For a single-offer landing page a CMS usually costs more than it saves — the copy changes once a quarter, and the system adds one more moving part to keep updated. A €1,200 landing page normally ships without an admin area.",
      "You need a CMS when content is alive: news, a blog, a catalogue, prices, vacancies, several languages, several people with access. On our projects from £3,500 it is part of the package, including a corporate website from £3,500 — never a separate line item.":
        "You need a CMS when content is alive: news, a blog, a catalogue, prices, vacancies, several languages, several people with access. From the €2,500 business package upwards it is part of the price — never a separate line item.",
    },
  },

  // Turnkey clinic site: the industry package, not the business one — the
  // generic ladder rule would flatten it to $1 000 and merge the two upper
  // tiers into one number.
  [CLINIC_TURNKEY]: {
    uk: {
      "Сайт медичного центру під ключ — **4 тижні** від брифу до запуску, від **$3,500**.":
        "Сайт медичного центру під ключ — **14–21 робочий день** від брифу до запуску, **$1 800**.",
      "Базовий сайт клініки — від $3,500 за 4 тижні: до 8 сторінок, онлайн-запис, каталог лікарів, прайс. Розширений із блогом і медичною CRM — від $6,500. Мережа клінік — від $12,000. Повний кошторис постатейно ми розібрали в ":
        "Сайт клініки — $1 800 за 14–21 робочий день: до 5 сторінок, онлайн-запис, каталог лікарів, прайс. З блогом, SEO-сторінками і другою мовою — близько $2 200. Мережа клінік — кастомна розробка від $4 000. Повний кошторис постатейно ми розібрали в ",
    },
    ru: {
      "Сайт медицинского центра под ключ — **4 недели** от брифа до запуска, от **$3,500**.":
        "Сайт медицинского центра под ключ — **14–21 рабочий день** от брифа до запуска, **$1 800**.",
      "Базовый сайт клиники — от $3,500 за 4 недели: до 8 страниц, онлайн-запись, каталог врачей, прайс. Расширенный с блогом и медицинской CRM — от $6,500. Сеть клиник — от $12,000. Полную смету постатейно мы разобрали ":
        "Сайт клиники — $1 800 за 14–21 рабочий день: до 5 страниц, онлайн-запись, каталог врачей, прайс. С блогом, SEO-страницами и вторым языком — около $2 200. Сеть клиник — кастомная разработка от $4 000. Полную смету постатейно мы разобрали ",
    },
    en: {
      "A turnkey clinic website takes **4 weeks** from brief to launch, from **£3,500**.":
        "A turnkey clinic website takes **14–21 working days** from brief to launch, **€4,500**.",
      "A core clinic website is from £3,500 in 4 weeks: up to 8 pages, online booking, a practitioner directory, a price list. Extended, with a blog and clinic CRM — from £6,500. Multi-site groups — from £12,000. We broke the full quote down line by line ":
        "A clinic website is €4,500 in 14–21 working days: up to 5 pages, online booking, a practitioner directory, a price list. With a blog, SEO pages and a second language — about €5,300. Multi-site groups are a custom build from €9,000. We broke the full quote down line by line ",
    },
  },

  [ADMIN_PANEL]: {
    uk: {
      "Так працює кожен наш корпоративний сайт з адмінкою — адмінка входить у пакет від $2 500.":
        "Так працює кожен наш сайт з адмінкою — Sanity CMS входить уже в пакет «Сайт для бізнесу» за $1 000.",
    },
  },

  // SEO budget article: the market ranges stay (they describe the market),
  // our own numbers move to the current list — the audit is free and the
  // retainer floor is $400 / €800.
  [SEO_PRICE]: {
    uk: {
      $300: "безкоштовно",
      "**Глибокий SEO-аудит:** $450 — список правок із пріоритетами":
        "**SEO-аудит:** безкоштовно — список правок із пріоритетами",
      "Бюджет менше $300/міс — краще накопичити на разовий аудит і контент, ніж розмазувати":
        "Бюджет менше $400/міс — краще накопичити на контент, ніж розмазувати",
    },
    ru: {
      $300: "бесплатно",
      "**Глубокий SEO-аудит:** $450 — список правок с приоритетами":
        "**SEO-аудит:** бесплатно — список правок с приоритетами",
      "Бюджет меньше $300/мес — лучше накопить на разовый аудит и контент, чем размазывать":
        "Бюджет меньше $400/мес — лучше накопить на контент, чем размазывать",
    },
    en: {
      "£300": "free",
      "SEO for a small-business site costs **£300 to £2,000+ per month** in 2026.":
        "SEO for a small-business site costs **€350 to €2,400+ per month** in 2026.",
      "**Deep SEO audit:** £450 — a prioritised list of fixes":
        "**SEO audit:** free — a prioritised list of fixes",
      "**Base retainer:** from £300/mo — technical upkeep + steady content":
        "**Base retainer:** from €800/mo — technical upkeep + steady content",
      "**Competitive niches** (healthcare, legal, finance): £500–2,000/mo":
        "**Competitive niches** (healthcare, legal, finance): €600–2,400/mo",
      "**Content:** £200/article from a B2B copywriter":
        "**Content:** €240/article from a B2B copywriter",
      "from £300/mo": "from €800/mo",
      "£500–2,000/mo": "€600–2,400/mo",
      "£30–100/article": "€35–120/article",
      "A budget under £300/mo — better saved for the deep SEO audit and content than spread thin":
        "A budget under €800/mo — better saved for content than spread thin",
    },
  },

  [FLAGSHIP]: {
    uk: {
      "Контент. Пишете текст самі, економите студії копірайтинг ($1,500–$2,500). Пише студія, і ця робота в кошторисі. У будь-якому разі сума має бути названа, а не захована.":
        "Контент. У кожному пакеті тексти пишуться на основі вашого брифу — це вже в ціні. Потрібен текст рівня професійного копірайтера під усю структуру — це окрема опція за $300. У будь-якому разі сума має бути названа, а не захована.",
      "Детальний розбір кожного формату — на окремих сторінках: Лендінг від $800, Корпоративний сайт та Інтернет-магазин.":
        "Детальний розбір кожного формату — на окремих сторінках: Лендінг $600, Сайт для бізнесу $1 000 та Інтернет-магазин $1 500.",
      "Хостинг після першого року, коли акаунти передані вам":
        "Хостинг після першого року — $60 на рік або перенос на ваш акаунт",
    },
    ru: {
      "Контент.Пишете текст сами — экономите студии копирайтинг ($1,500–$2,500). Пишет студия — и эта работа в смете. В любом случае сумма должна быть названа, а не спрятана.":
        "Контент. В каждом пакете тексты пишутся на основе вашего брифа — это уже в цене. Нужен текст уровня профессионального копирайтера под всю структуру — это отдельная опция за $300. В любом случае сумма должна быть названа, а не спрятана.",
      "Детальный разбор каждого формата — на отдельных страницах: Лендинг от $800, Корпоративный сайт и Интернет-магазин.":
        "Детальный разбор каждого формата — на отдельных страницах: Лендинг $600, Сайт для бизнеса $1 000 и Интернет-магазин $1 500.",
      "Хостинг после первого года, когда аккаунты переданы вам":
        "Хостинг после первого года — $60 в год или перенос на ваш аккаунт",
    },
    en: {
      "Each format has its own breakdown page: Landing page from £800, Corporate website and Online store.":
        "Each format has its own breakdown page: Landing page €1,200, Business website €2,500 and Online store €3,900.",
      "Is copywriting included? This is a £200–£2,000 line on its own and should be spelled out.":
        "Is copywriting included? With us it is: every package is written from your brief, and a full professional copy pass is a €600 add-on.",
      "Hosting after year one, once the accounts are handed to you":
        "Hosting after year one — €120 a year, or move it to your own account",
    },
  },
};

/** Whole strings that repeat across documents (city pages share their copy). */
export const EXACT = {
  uk: {
    "Ціна в нас від міста не залежить: лендінг від $800, багатосторінковий сайт від $2 500.":
      "Ціна в нас від міста не залежить: лендінг $600, сайт для бізнесу $1 000.",
    "Наші ціни від міста не залежать: лендінг від $800, багатосторінковий сайт від $2 500.":
      "Наші ціни від міста не залежать: лендінг $600, сайт для бізнесу $1 000.",
    "Наші ціни від міста не залежать: лендінг від $800, багатосторінковий сайт від $2 500. Офісу у Львові в нас немає, і нижче чесно про те, що це змінює.":
      "Наші ціни від міста не залежать: лендінг $600, сайт для бізнесу $1 000. Офісу у Львові в нас немає, і нижче чесно про те, що це змінює.",
    "від $800": "$600",
    "від $2 500": "$1 000",
    "від $6 000": "від $4 000",
    "від $800 за лендінг": "$600 за лендінг",
    "від $3,500": "$1 000",
    "Аудит сайту — $150": "Аудит сайту — безкоштовно",
    "Аудит вашого сайту — $150": "Аудит вашого сайту — безкоштовно",
    "Повний SEO-аудит коштує $300 — але **20 базових перевірок** можна зробити самостійно за годину.":
      "Повний SEO-аудит у нас безкоштовний — але **20 базових перевірок** можна зробити самостійно за годину.",
    "Аудит сайту вашої клініки — $150": "Аудит сайту вашої клініки — безкоштовно",

    // Lawyers: a firm site is the `legal` industry package, a client portal
    // is a custom build, support is inside the package for the first year.
    "Візитка приватного адвоката коштує від $800 і 2–3 тижні; сайт юридичної фірми — від $2 500 і 4–8 тижнів.":
      "Візитка приватного адвоката коштує $600 і робиться за 3 робочі дні; сайт юридичної фірми — $1 800 і 14–21 робочий день.",
    "сайт-візитка приватного адвоката коштує від $800": "сайт-візитка приватного адвоката коштує $600",
    "сайт юридичної фірми з окремими сторінками практик — від $2 500":
      "сайт юридичної фірми з окремими сторінками практик — $1 800",
    "сайт-візитка приватного адвоката — від $800": "сайт-візитка приватного адвоката — $600",
    "сайт юридичної фірми під ключ — від $2 500": "сайт юридичної фірми під ключ — $1 800",
    ", кастомна платформа з особистим кабінетом клієнта — від $6 000. Далі — що саме входить у кожен варіант.":
      ", кастомна платформа з особистим кабінетом клієнта — від $4 000. Далі — що саме входить у кожен варіант.",
    " або $40/год разово. Повний розбір ціноутворення — у статті про ":
      ". Повний розбір ціноутворення — у статті про ",
    "Візитка від $800, сайт фірми від $2 500. Структура під ваші практики, тексти, кейси і SEO-база — під ключ.":
      "Візитка $600, сайт фірми $1 800. Структура під ваші практики, тексти, кейси і SEO-база — під ключ.",
  },
  ru: {
    "Цена у нас от города не зависит: лендинг от $800, многостраничный сайт от $2 500.":
      "Цена у нас от города не зависит: лендинг $600, сайт для бизнеса $1 000.",
    "Наши цены от города не зависят: лендинг от $800, многостраничный сайт от $2 500.":
      "Наши цены от города не зависят: лендинг $600, сайт для бизнеса $1 000.",
    "Наши цены от города не зависят: лендинг от $800, многостраничный сайт от $2 500. Офиса во Львове у нас нет, и ниже честно о том, что это меняет.":
      "Наши цены от города не зависят: лендинг $600, сайт для бизнеса $1 000. Офиса во Львове у нас нет, и ниже честно о том, что это меняет.",
    // RU city documents kept Ukrainian strings in their tables — fix the
    // language while the number is being corrected.
    "від $800": "$600",
    "від $2 500": "$1 000",
    "від $6 000": "от $4 000",
    "от $800": "$600",
    "от $2 500": "$1 000",
    "от $6 000": "от $4 000",
    "от $800 за лендинг": "$600 за лендинг",
    "от $3,500": "$1 000",
    "Аудит сайта — $150": "Аудит сайта — бесплатно",
    "Аудит вашего сайта — $150": "Аудит вашего сайта — бесплатно",
    "Полный SEO-аудит стоит $300 — но **20 базовых проверок** можно сделать самостоятельно за час.":
      "Полный SEO-аудит у нас бесплатный — но **20 базовых проверок** можно сделать самостоятельно за час.",
    "Аудит сайта вашей клиники — $150": "Аудит сайта вашей клиники — бесплатно",

    "Сайт-визитка юриста стоит от $800 и делается 2–3 недели; сайт юридической фирмы под ключ — от $2 500 и 4–8 недель.":
      "Сайт-визитка юриста стоит $600 и делается за 3 рабочих дня; сайт юридической фирмы под ключ — $1 800 и 14–21 рабочий день.",
    "сайт-визитка юриста стоит от $800": "сайт-визитка юриста стоит $600",
    "сайт юридической фирмы под ключ — от $2 500": "сайт юридической фирмы под ключ — $1 800",
    "сайт-визитка юриста — от $800": "сайт-визитка юриста — $600",
    ", кастомная платформа с личным кабинетом клиента — от $6 000.":
      ", кастомная платформа с личным кабинетом клиента — от $4 000.",
    " или $40/час разово. Подробный разбор ценообразования — в статье о ":
      ". Подробный разбор ценообразования — в статье о ",
    "Визитка от $800, сайт фирмы от $2 500. Структура под ваши практики, тексты, кейсы и SEO-база — под ключ.":
      "Визитка $600, сайт фирмы $1 800. Структура под ваши практики, тексты, кейсы и SEO-база — под ключ.",
  },
  en: {
    "Website audit — $150": "Website audit — free",
    "from £800": "€1,200",
    "from £3,500": "€2,500",
    "from £6,000": "from €9,000",

    "A solo attorney site starts at £800 and takes 2–3 weeks; a full law firm website starts at £3,500 and takes 4–8 weeks.":
      "A solo attorney site is €1,200 and takes 3 working days; a full law firm website is €4,500 and takes 14–21 working days.",
    "a solo attorney website starts at £800": "a solo attorney website is €1,200",
    "a law firm website with dedicated practice-area pages starts at £3,500":
      "a law firm website with dedicated practice-area pages is €4,500",
    "a law firm website starts at £3,500": "a law firm website is €4,500",
    ", and a custom platform with a client portal starts at £6,000. Here is what each option includes:":
      ", and a custom platform with a client portal starts at €9,000. Here is what each option includes:",
    "The final figure depends on the number of practice-area pages, languages, and integrations — online booking, CRM, consultation payments run £200–500 for a typical integration. Post-launch support is ":
      "The final figure depends on the number of practice-area pages, languages, and integrations — online booking, CRM or consultation payments run €600 for a typical integration. Post-launch support is ",
    " or £40/hour ad hoc. For a full breakdown of what drives the numbers, see our guide to ":
      ". For a full breakdown of what drives the numbers, see our guide to ",
    "SEO retainer from £300/month": "SEO retainer from €800/month",
    "Solo site from £800, firm website from £3,500. Structure built around your practice areas, copy, case studies and an SEO baseline — delivered turnkey.":
      "Solo site €1,200, firm website €4,500. Structure built around your practice areas, copy, case studies and an SEO baseline — delivered turnkey.",
  },
};

/** Narrow substring rules. Anchored on our own wording, never on a bare number. */
export const SUB = {
  uk: [
    // Specific sentences first: the generic "аудит за $N" rule below would
    // otherwise cut through them and leave "SEO-безкоштовний аудит".
    [/У SEO-аудит за \$450 входить/g, "У безкоштовний SEO-аудит входить"],
    [/Ми продаємо аудит за \$450/g, "Ми робимо аудит безкоштовно"],
    [/повний аудит за \$450/g, "повний аудит"],
    [/Аудит сайту — \$150\. Перед оплатою — безкоштовний 30-хвилинний дзвінок-знайомство\./g,
      "Аудит сайту безкоштовний: відповідь за 24 години. Хочете голосом — 30-хвилинний дзвінок-знайомство."],
    // Clinic quote: the industry package replaces the old three-tier ladder.
    [/Helsi, Medesk, Dental4Windows, KeyCRM — від \$200 до \$500 за кожну\./g,
      "Helsi, Medesk, Dental4Windows, KeyCRM — одна така інтеграція входить у галузевий пакет, кожна наступна коштує $300."],
    [/системи додають до кошторису \$1,500–3,000 порівняно зі звичайним корпоративним сайтом/g,
      "системи — це різниця між пакетом «Сайт для бізнесу» за $1 000 і галузевим рішенням за $1 800"],
    [/Кошторис базового сайту клініки: \$3,500 постатейно/g, "Кошторис сайту клініки: $1 800 постатейно"],
    [/лендінга за \$800/g, "лендінга за $600"],
    // Paid audits are gone (TZ v2 §2.3): the audit and the estimate are free.
    [/на аудиті сайту за \$150/g, "на безкоштовному аудиті сайту"],
    [/аудит сайту за \$150/g, "безкоштовний аудит сайту"],
    [/аудиту сайту за \$150/g, "безкоштовного аудиту сайту"],
    [/аудиті сайту за \$150/g, "безкоштовному аудиті сайту"],
    [/аудит за \$(150|300|450)/g, "безкоштовний аудит"],
    [/Аудит за \$(150|300|450)/g, "Безкоштовний аудит"],
    [/аудиту за \$(150|300|450)/g, "безкоштовного аудиту"],
    [/Разовий SEO-аудит — \$300/g, "Разовий SEO-аудит — безкоштовно"],
    [/замовте аудит сайту за \$150/g, "замовте безкоштовний аудит сайту"],
    [/У SEO-аудит за \$450 входить/g, "У безкоштовний SEO-аудит входить"],
    // Support and hourly work: the first year is inside the package price.
    [/Впровадження — \$40\/год або в межах підтримки за \$200\/міс\./g,
      "Впровадження — у межах пакета: перший рік підтримки вже в ціні."],
    // SEO retainer floor.
    [/від \$300\/міс/g, "від $400/міс"],
    [/\$300–500\/міс/g, "від $400/міс"],
    // The old ladder wherever it is still quoted as ours. KEEP already took
    // competitor sentences out of reach before these run.
    [/від \*\*\$800\*\*/g, "**$600**"],
    [/від \*\*\$2[\s ]500\*\*/g, "**$1 000**"],
    [/від \*\*\$6[\s ]000\*\*/g, "**від $4 000**"],
    [/\*\*\$800\*\*/g, "**$600**"],
    [/\*\*\$2[\s ]500\*\*/g, "**$1 000**"],
    [/\*\*\$6[\s ]000\*\*/g, "**від $4 000**"],
    [/від \$800/g, "$600"],
    [/від \$2[\s ]500/g, "$1 000"],
    [/від \$3,500/g, "$1 000"],
    [/від \$6[\s ]000/g, "від $4 000"],
    [/від \$6,500/g, "від $4 000"],
    [/від \$12,000/g, "від $4 000"],
    [/обслуговування сайту від \$200\/міс/g, "обслуговування — перший рік у ціні пакета"],
    [/\$800/g, "$600"],
    [/\$2[\s ]500/g, "$1 000"],
    [/\$3,500/g, "$1 000"],
    [/\$6[\s ]000/g, "$4 000"],
    // Terms move from agency weeks to the productized working days.
    // Support and hourly work: gone, the first year is inside the package.
    [/\$200\/міс або \$40\/год/g, "перший рік у ціні пакета"],
    [/ або \$40\/год, SEO-просування — від /g, ", SEO-просування — від "],
    [/ або \$40\/год, просування — /g, ", просування — "],
    [/ або разово від \$40\/год\./g, "."],
    [/\$200\/міс/g, "перший рік у ціні пакета"],
    [/\$40\/год/g, "в межах пакета"],
    [/\$300\/міс/g, "$400/міс"],
    [/\(1–2 тижні\)/g, "(3 робочі дні)"],
    [/\(2–3 тижні\)/g, "(3 робочі дні)"],
    [/\(4–8 тижнів\)/g, "(7 робочих днів)"],
    [/\(6–10 тижнів\)/g, "(14 робочих днів)"],
    [/\(8–16 тижнів\)/g, "(від 6 тижнів)"],
    [/і робиться 1–2 тижні/g, "і робиться за 3 робочі дні"],
    [/коштує \$600 і робиться 1–2 тижні/g, "коштує $600 і робиться за 3 робочі дні"],
  ],
  ru: [
    [/В SEO-аудит за \$450 входит/g, "В бесплатный SEO-аудит входит"],
    [/Мы продаём аудит за \$450/g, "Мы делаем аудит бесплатно"],
    [/полный аудит за \$450/g, "полный аудит"],
    [/Аудит сайта — \$150\. Перед оплатой — бесплатный 30-минутный звонок-знакомство\./g,
      "Аудит сайта бесплатный: ответ за 24 часа. Хотите голосом — 30-минутный звонок-знакомство."],
    [/— от \$200 до \$500 за каждую\./g,
      "— одна такая интеграция входит в отраслевой пакет, каждая следующая стоит $300."],
    [/системы добавляют к смете \$1,500–3,000 по сравнению с обычным корпоративным сайтом/g,
      "системы — это разница между пакетом «Сайт для бизнеса» за $1 000 и отраслевым решением за $1 800"],
    [/Смета базового сайта клиники: \$3,500 постатейно/g, "Смета сайта клиники: $1 800 постатейно"],
    [/лендинга за \$800/g, "лендинга за $600"],
    [/на аудите сайта за \$150/g, "на бесплатном аудите сайта"],
    [/аудит сайта за \$150/g, "бесплатный аудит сайта"],
    [/аудита сайта за \$150/g, "бесплатного аудита сайта"],
    [/аудите сайта за \$150/g, "бесплатном аудите сайта"],
    [/аудит за \$(150|300|450)/g, "бесплатный аудит"],
    [/Аудит за \$(150|300|450)/g, "Бесплатный аудит"],
    [/аудита за \$(150|300|450)/g, "бесплатного аудита"],
    [/Разовый SEO-аудит — \$300/g, "Разовый SEO-аудит — бесплатно"],
    [/закажите аудит сайта за \$150/g, "закажите бесплатный аудит сайта"],
    [/В SEO-аудит за \$450 входит/g, "В бесплатный SEO-аудит входит"],
    [/Внедрение — \$40\/час или в рамках поддержки за \$200\/мес\./g,
      "Внедрение — в рамках пакета: первый год поддержки уже в цене."],
    [/от \$300\/мес/g, "от $400/мес"],
    [/\$300–500\/мес/g, "от $400/мес"],
    [/от \*\*\$800\*\*/g, "**$600**"],
    [/от \*\*\$2[\s ]500\*\*/g, "**$1 000**"],
    [/от \*\*\$6[\s ]000\*\*/g, "**от $4 000**"],
    [/\*\*\$800\*\*/g, "**$600**"],
    [/\*\*\$2[\s ]500\*\*/g, "**$1 000**"],
    [/\*\*\$6[\s ]000\*\*/g, "**от $4 000**"],
    [/от \$800/g, "$600"],
    [/от \$2[\s ]500/g, "$1 000"],
    [/от \$3,500/g, "$1 000"],
    [/от \$6[\s ]000/g, "от $4 000"],
    [/от \$6,500/g, "от $4 000"],
    [/от \$12,000/g, "от $4 000"],
    [/обслуживание сайта от \$200\/мес/g, "обслуживание — первый год в цене пакета"],
    [/\$800/g, "$600"],
    [/\$2[\s ]500/g, "$1 000"],
    [/\$3,500/g, "$1 000"],
    [/\$6[\s ]000/g, "$4 000"],
    [/\$200\/мес или \$40\/час/g, "первый год в цене пакета"],
    [/ или \$40\/час, SEO-продвижение — от /g, ", SEO-продвижение — от "],
    [/ или \$40\/час, продвижение — /g, ", продвижение — "],
    [/ или разово от \$40\/час\./g, "."],
    [/\$200\/мес/g, "первый год в цене пакета"],
    [/\$40\/час/g, "в рамках пакета"],
    [/\$300\/мес/g, "$400/мес"],
    [/\(1–2 недели\)/g, "(3 рабочих дня)"],
    [/\(2–3 недели\)/g, "(3 рабочих дня)"],
    [/\(4–8 недель\)/g, "(7 рабочих дней)"],
    [/\(6–10 недель\)/g, "(14 рабочих дней)"],
    [/\(8–16 недель\)/g, "(от 6 недель)"],
    [/и делается за 1–2 недели/g, "и делается за 3 рабочих дня"],
  ],
  en: [
    [/— £200 to £500 each\./g,
      "— one such integration is included in the industry package, each extra one is €600."],
    [/add £1,500–3,000 versus a regular corporate site/g,
      "are the difference between the €2,500 business package and the €4,500 industry one"],
    [/A core clinic website quote: £3,500 line by line/g, "A clinic website quote: €4,500 line by line"],
    [/£800 landing page/g, "€1,200 landing page"],
    [/a “£500 website”/g, "a “€500 website”"],
    [/The £450 SEO audit includes/g, "The free SEO audit includes"],
    [/A £450 audit shows/g, "A free audit shows"],
    [/A £300 audit:/g, "A free audit:"],
    [/Start with a £450 audit/g, "Start with the free audit"],
    [/the £450 website audit/g, "the free website audit"],
    [/the \$150 website audit/g, "the free website audit"],
    [/a \$150 website audit/g, "a free website audit"],
    [/order the \$150 website audit/g, "book the free website audit"],
    [/audit for \$(150|300|450)/g, "free audit"],
    // Audits are free now, whatever price the copy used to quote.
    [/A full SEO audit costs £300 — but/g, "A full SEO audit is free with us — but"],
    [/A one-off SEO audit is £300:/g, "A one-off SEO audit is free:"],
    [/We sell audits for £300 — and we'll say it straight:/g, "We do audits free — and we'll say it straight:"],
    [/The full £300 audit covers/g, "The full audit covers"],
    [/A £450 audit:/g, "A free audit:"],
    [/— £450, delivered in 5 working days/g, "— free, delivered in 5 working days"],
    [/A \$150 audit of your website/g, "A free audit of your website"],
    [/with no rebuild — £150\./g, "with no rebuild — free."],
    [/from \$150/g, "free"],
    // Integrations and retainers.
    [/£200–£500/g, "€240–600"],
    [/£200–500/g, "€240–600"],
    [/£1 000–3 000/g, "€1,200–3,600"],
    [/£300–500\/mo/g, "€800/mo"],
    [/from £300\/mo/g, "from €800/mo"],
    [/£300\/mo/g, "€800/mo"],
    [/support from £200 a month or £40 an hour/g, "support included for the first year"],
    [/from £300 a month/g, "from €800 a month"],
    [/£200\/mo or £40\/hr/g, "included for the first year"],
    // Remaining pound figures in market commentary.
    [/£4,000 of surprises/g, "€4,800 of surprises"],
    [/under £1,500/g, "under €1,800"],
    [/£3 500/g, "€2,500"],
    [/the £300 template/g, "the €350 template"],
    [/from \$300 for a site-builder template to \$15,000\+/g, "from €350 for a site-builder template to €18,000+"],
    [/\(\$100–300\/year\)/g, "(€100–300/year)"],
    [/another £1,000/g, "another €1,500"],
    // The £ ladder → the euro list (owner decision 2026-09-22).
    [/\*\*from £800\*\*/g, "**€1,200**"],
    [/\*\*from £3,500\*\*/g, "**€2,500**"],
    [/\*\*from £6,000\*\*/g, "**from €9,000**"],
    [/\*\*£800\*\*/g, "**€1,200**"],
    [/\*\*£3,500\*\*/g, "**€2,500**"],
    [/\*\*£6,000\*\*/g, "**€9,000**"],
    [/from £800/g, "€1,200"],
    [/from £3,500/g, "€2,500"],
    [/from £6,000/g, "from €9,000"],
    [/£800/g, "€1,200"],
    [/£3,500/g, "€2,500"],
    [/£6,000/g, "€9,000"],
    // Services: SEO floor, support and the hourly rate.
    [/\(£200\/month or £40\/hour\)/g, "(included for the first year)"],
    [/£200\/month or £40\/hour/g, "included for the first year"],
    [/ \(or £40\/hour\)/g, ""],
    [/ or ad hoc from £40\/hour\./g, "."],
    [/ or £40\/hour/g, ""],
    [/from £40\/hour/g, "inside the package"],
    [/from £300\/month/g, "from €800/month"],
    [/£300\/month/g, "€800/month"],
    [/£1,000–3,000/g, "€1,200–3,600"],
    [/£200–£2,000 line/g, "€240–2,400 line"],
    [/£200\/month/g, "included for the first year"],
    [/£40\/hour/g, "inside the package"],
    [/£6 000/g, "€9,000"],
  ],
};
