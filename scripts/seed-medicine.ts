/**
 * Seed script — uploads the legacy `/sites-for/medicine` page content into
 * Sanity as a single `industryPage` document.
 *
 * Idempotent: uses `createOrReplace` with a fixed `_id`, so re-running this
 * script overwrites the existing document instead of creating duplicates.
 *
 * Required env (loaded from .env.local automatically):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET (defaults to "production")
 *   - SANITY_API_TOKEN          (write-access token)
 *
 * Run:
 *   npm run seed:medicine
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@sanity/client";

/* ──────────────────────────── env loader ──────────────────────────────── */

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

/* ──────────────────────────── content helpers ─────────────────────────── */

type LocaleString = { uk?: string; ru?: string; en?: string };

function uk(text: string): LocaleString {
  return { uk: text };
}

type Span = { _type: "span"; _key: string; text: string; marks: string[] };

type PortableBlock = {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "h4" | "blockquote";
  markDefs: never[];
  children: Span[];
};

let keyCounter = 0;
function key(prefix = "k"): string {
  keyCounter += 1;
  return `${prefix}${keyCounter.toString(36)}`;
}

/**
 * Build a single Portable Text block from alternating plain/em segments.
 * `parts` is a flat list where every other entry is rendered with the `em`
 * mark — same shape as the legacy `RichText` segments in `src/lib/rich-text.tsx`.
 */
function block(
  parts: Array<string | { em: string }>,
  style: PortableBlock["style"] = "normal",
): PortableBlock {
  return {
    _type: "block",
    _key: key("b"),
    style,
    markDefs: [],
    children: parts.map<Span>((p) =>
      typeof p === "string"
        ? { _type: "span", _key: key("s"), text: p, marks: [] }
        : { _type: "span", _key: key("s"), text: p.em, marks: ["em"] },
    ),
  };
}

function imageRef(assetId: string) {
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: assetId },
  };
}

/**
 * `imageWithLocalizedAlt` wrapper — matches the admin schema in
 * `code-site-solutions-admin/schemaTypes/objects/imageWithLocalizedAlt.ts`
 * (`{ image, alt }`). The frontend GROQ flattens this back into a plain
 * `SanityImage` (`{ asset, hotspot, crop, alt }`).
 */
function imageWithAlt(assetId: string, altUk = "") {
  return {
    image: imageRef(assetId),
    alt: { uk: altUk },
  };
}

/* ────────────────────────── content (HERO) ────────────────────────────── */

function buildHero(deviceMockupId: string) {
  return {
    eyebrow: uk("САЙТИ ДЛЯ МЕДИЧНОЇ ГАЛУЗІ / від $3 500"),
    // formatLine markup: `\n` → <br/>, `*x*` → <em>x</em>
    heading: uk("Клініка, до якої\n*записуються*"),
    h1Num: "50+",
    h1NumLabel: uk("пацієнтів\nна місяць"),
    lede: uk(
      "Ви отримуєте сайт клініки що починає приймати онлайн-записи з першого дня. Без вашої участі більше ніж *5 годин*: ми пишемо тексти, ставимо інтеграції з Helsi/Medesk, налаштовуємо локальне SEO. Запуск за 4–6 тижнів.",
    ),
    features: [
      uk("Онлайн-запис | за 2 кліки"),
      uk("Локальне SEO | під район"),
      uk("Інтеграція CRM | Bitrix · AmoCRM"),
      uk("Юр. коректно | за вимогами МОЗ"),
    ],
    ctaPrimary: uk("Обговорити мій проєкт"),
    ctaSecondary: uk("Подивитися кейси клінік"),
    stats: [
      { _key: key("st"), value: "47", label: uk("клінік\nзапущено") },
      { _key: key("st"), value: "4.9/5", label: uk("середня\nоцінка") },
      { _key: key("st"), value: "×3.2", label: uk("більше\nзаписів") },
    ],
    tickerItems: [
      uk("Стоматології"),
      uk("Багатопрофільні клініки"),
      uk("Діагностичні центри"),
      uk("Косметологія"),
      uk("Реабілітація"),
      uk("Лабораторії"),
    ],
    deviceTags: [
      { _key: key("dt"), kind: "default", primary: uk("Онлайн-запис") },
      {
        _key: key("dt"),
        kind: "default",
        primary: uk("Адаптив"),
        mini: "100/100",
      },
      {
        _key: key("dt"),
        kind: "good",
        primary: uk("Lighthouse"),
        mini: "98",
      },
    ],
    deviceMockup: imageWithAlt(deviceMockupId, "Сайт клініки на ноутбуці та телефоні"),
  };
}

/* ────────────────────────── reasonsBlock ──────────────────────────────── */

const REASONS_BLOCK = {
  _type: "reasonsBlock" as const,
  _key: key("sec"),
  eyebrow: uk("ДІАГНОСТИКА"),
  eyebrowNum: uk("/ 03 ПУНКТИ"),
  heading: uk("3 причини, чому пацієнти\n*не записуються* з вашого сайту"),
  metaRows: [
    uk("аналіз 47 клінік · 2024–25"),
    uk("розділ 02 / 06"),
  ],
  reasons: [
    {
      _key: key("r"),
      number: "01",
      tag: uk("UX · CONVERSION"),
      title: uk("Немає *онлайн-запису*"),
      text: [
        block([
          "Пацієнт мусить телефонувати в робочий час. ",
          { em: "60% записів" },
          " втрачається ввечері і у вихідні. Молода аудиторія взагалі не телефонує — вона пише в Instagram конкурентам, у яких ",
          { em: "онлайн-запис працює" },
          ".",
        ]),
      ],
      stat: {
        value: "60%",
        label: uk("дзвінків поза робочим часом залишаються без відповіді"),
        source: uk("GLOBAL DATA · 2024"),
      },
    },
    {
      _key: key("r"),
      number: "02",
      tag: uk("TRUST · CONTENT"),
      title: uk("Немає *цін* і *фото лікарів*"),
      text: [
        block([
          "Пацієнт не розуміє, до кого потрапить і скільки заплатить. Закриває ваш сайт, йде на сайт клініки, де це є. У ",
          { em: "2026 році" },
          " непрозорість — це ",
          { em: "втрачені пацієнти" },
          ".",
        ]),
      ],
      stat: {
        value: "×2.4",
        label: uk("вища конверсія у клінік з прозорим прайсом і командою"),
        source: uk("BENCHMARK · 2025"),
      },
    },
    {
      _key: key("r"),
      number: "03",
      tag: uk("SEO · LOCAL"),
      title: uk("Вас не видно в *Google*"),
      text: [
        block([
          "Конкуренти у вашому районі вищі в пошуку за запитом «",
          { em: "стоматолог + район" },
          "» або «",
          { em: "клініка + місто" },
          "». ",
          { em: "80% пацієнтів" },
          " не йдуть далі першої сторінки результатів.",
        ]),
      ],
      stat: {
        value: "80%",
        label: uk("кліків забирають перші 5 результатів локального пошуку"),
        source: uk("GOOGLE · 2025"),
      },
    },
  ],
  footText: uk("Виправляємо *всі три* на запуску — без вашої участі."),
  footCtaLabel: uk("Перевірити мій сайт"),
};

/* ────────────────────────── caseBlock ─────────────────────────────────── */

function buildCaseBlock(beforeId: string, afterId: string) {
  return {
    _type: "caseBlock" as const,
    _key: key("sec"),
    eyebrow: uk("РЕАЛЬНИЙ КЕЙС"),
    eyebrowEm: uk("КЛІНІКА «ЕФЕДРА», ОДЕСА"),
    heading: uk("До / Після на прикладі\n*реального* клієнта"),
    lede: uk(
      "До нас звернулася клініка *«Ефедра»* з Одеси — із застарілим сайтом, який не приносив заявок. Завдання було не просте: переробити структуру, дизайн і логіку під *два напрямки* бізнесу клініки — стоматологію і студію краси.",
    ),
    meta: [
      { _key: key("m"), strong: uk("4 тижні"), text: uk("від брифу до релізу") },
      { _key: key("m"), strong: uk("2 напрямки"), text: uk("стоматологія + естетика") },
      { _key: key("m"), strong: uk("UA + RU"), text: uk("локалізація під SEO") },
    ],
    before: {
      num: "EFEDRA · v1 · 2022",
      image: imageWithAlt(beforeId, "Старий сайт клініки Ефедра"),
      url: "efedraclinic.com.ua",
      alt: uk("Старий сайт клініки Ефедра"),
      tagline: uk("Сайт, що не продає"),
      items: [
        uk("заплутана структура сайту, користувачі не розуміли куди натискати"),
        uk("застарілий дизайн, який не викликав *довіри*"),
        uk("низька швидкість завантаження"),
        uk("некоректна мультимовність (російська/українська)"),
        uk(
          "незручна адмінка — будь-які зміни через розробника *за гроші*",
        ),
        uk("сайт періодично падав"),
        uk("не було нормальної системи запису/бронювання"),
      ],
      foot: uk(
        "**Примітка:** російську мову залишено як основну для SEO, оскільки в Одесі значна частина пошукових запитів все ще російською мовою.",
      ),
    },
    after: {
      num: "EFEDRA · v2 · 2025",
      image: imageWithAlt(afterId, "Новий сайт клініки Ефедра"),
      url: "efedra.com.ua",
      alt: uk("Новий сайт клініки Ефедра"),
      tagline: uk("Сайт, що приводить пацієнтів"),
      items: [
        uk("зрозуміла структура сайту *під користувача*"),
        uk("сучасний дизайн, що підвищує довіру"),
        uk("швидке завантаження *<1.5 c*"),
        uk("коректна мультимовність (RU/UA)"),
        uk("зручна адмінка *без розробника*"),
        uk("стабільна робота без падінь"),
        uk("онлайн-запис та форми заявок"),
      ],
      foot: uk(
        "**Бонус:** два розділи (стоматологія і естетика) під одним брендом — без втрати фокусу і з окремими лід-формами під кожен напрямок.",
      ),
    },
    results: [
      { _key: key("res"), value: "×3.2", label: uk("більше заявок з сайту"), tag: uk("CONVERSION") },
      { _key: key("res"), value: "<1.5c", label: uk("час завантаження сторінки"), tag: uk("PERFORMANCE") },
      { _key: key("res"), value: "98", label: uk("Lighthouse · Performance"), tag: uk("CORE WEB VITALS") },
      { _key: key("res"), value: "×4", label: uk("органічного трафіку Google"), tag: uk("SEO · 6 МІС.") },
    ],
    ctaText: uk("Хочете **такий самий результат**? Подивіться, як ми це робимо."),
    ctaLabel: uk("Подивитися кейси клінік"),
  };
}

/* ────────────────────────── outcomeBlock ──────────────────────────────── */

const OUTCOME_BLOCK = {
  _type: "outcomeBlock" as const,
  _key: key("sec"),
  recap: {
    eyebrow: uk("РЕЗУЛЬТАТ ЧЕРЕЗ 6 МІСЯЦІВ"),
    text: uk(
      "За **6 місяців** після запуску клініка *«Ефедра»* отримала вимірний приріст заявок з Google і повний контроль над контентом сайту. Це типовий результат переробки сайту клініки — перетворення з «візитки без заявок» на *інструмент*, який реально приводить пацієнтів.",
    ),
  },
  directions: {
    eyebrow: uk("SOLUTION · ARCHITECTURE"),
    title: uk("Як ми вирішили задачу\nз *двома напрямками*"),
    lede: uk(
      "У клієнта було два напрямки: *стоматологія* і *студія краси*. Ми не стали робити два окремі сайти — це здешевило б проєкт, але роздробило б SEO і вдвічі підвищило б вартість підтримки.",
    ),
    replaceLabel: uk("Замість цього"),
    replaceItems: [
      uk("одна головна сторінка для клініки *в цілому*"),
      uk("дві окремі підголовні: стоматологія і студія краси"),
      uk("послуги, лікарі і контент розділені *за напрямками*"),
    ],
    allowedLabel: uk("Це дозволило"),
    allowedItems: [
      uk("не дробити *SEO* між двома доменами"),
      uk("не втрачати трафік на *301-редиректах*"),
      uk("чітко розділити напрямки *для пацієнта*"),
    ],
  },
  benefitsHeading: uk("Що ви отримаєте\nна прикладі *реального* проєкту"),
  benefitsSub: uk(
    "Не просто «*красивий сайт*». Інструменти, що реально впливають на потік пацієнтів — структура під SEO, онлайн-запис, керована редактором адмінка.",
  ),
  benefitHero: {
    value: "×3,4",
    lede: uk("зростання потоку заявок після редизайну"),
    source: uk("— за словами власниці клініки «Ефедра»"),
    bullets: [
      uk("зручний дизайн без перевантаження"),
      uk("працює на будь-яких пристроях і браузерах"),
    ],
  },
  benefitRows: [
    {
      _key: key("br"),
      feature: "FEATURE · 01 / 03",
      heading: uk("Зрозуміла структура під *реальні послуги*"),
      mockType: "pages",
      mockUrl: "efedra.com.ua/послуги",
      mockTags: [uk("Стомат."), uk("Естетика"), uk("Інше")],
      items: [
        uk("розділення на *стоматологію* і *студію краси*"),
        uk("окремі сторінки під **кожну послугу**"),
        uk("логічна навігація без перевантаження"),
        uk("швидкий доступ до запису"),
      ],
    },
    {
      _key: key("br"),
      feature: "FEATURE · 02 / 03",
      heading: uk("Система запису, яка *реально* працює"),
      mockType: "booking",
      mockUrl: "efedra.com.ua/запис",
      items: [
        uk("запис у **2 кліки**"),
        uk("вибір послуги і спеціаліста"),
        uk("форми заявок і зворотного звʼязку"),
        uk("інтеграція з *CRM* / сповіщення"),
      ],
    },
    {
      _key: key("br"),
      feature: "FEATURE · 03 / 03",
      heading: uk("Ви керуєте сайтом *самі*"),
      mockType: "admin",
      mockUrl: "admin.efedra.com.ua",
      items: [
        uk("зміна *цін* з телефона"),
        uk("додавання послуг і лікарів"),
        uk("публікація акцій і новин"),
        uk("без **постійної оплати** розробнику"),
      ],
    },
  ],
};

/* ────────────────────────── servicesBlock ─────────────────────────────── */

const FEATURE_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
];

function buildServicesBlock(featureAssetIds: string[]) {
  const ids = featureAssetIds;
  return {
    _type: "servicesBlock" as const,
    _key: key("sec"),
    testimonialEyebrow: uk("ВІДГУК КЛІЄНТА"),
    testimonial: {
      quote: uk(
        "Після запуску сайту ми почали отримувати в *3–4 рази* більше заявок. Особливо виріс потік з Google. І найголовніше — ми тепер *самі* можемо змінювати все на сайті без розробників.",
      ),
      authorName: "Анна П.",
      authorInitials: "АП",
      authorRole: uk("Засновниця клініки в Одесі"),
    },
    heading: uk("Що ми робимо для\n*медичних* клінік"),
    sub: uk(
      "Не «*ще один шаблонний медичний сайт*». Кожен проєкт — під конкретну клініку, її спеціалізацію і регуляторні вимоги.",
    ),
    features: [
      {
        _key: key("f"),
        title: uk("Онлайн-запис 24/7"),
        image: ids[0] ? imageWithAlt(ids[0], "Онлайн-запис 24/7") : undefined,
        items: [
          uk("Запис у *2 кліки*. SMS-підтвердження пацієнту, Telegram-сповіщення лікарю"),
          uk("Інтеграція з *Dental4Windows*, Medesk, MedAI, Helsi, KeyCRM"),
          uk("Автоматичні нагадування за день до прийому"),
        ],
      },
      {
        _key: key("f"),
        title: uk("Каталог лікарів"),
        image: ids[1] ? imageWithAlt(ids[1], "Каталог лікарів") : undefined,
        items: [
          uk("Фото, регалії, освіта, спеціалізація, реальні відгуки пацієнтів"),
          uk("Розклад кожного лікаря в реальному часі"),
          uk("Запис безпосередньо до обраного спеціаліста"),
        ],
      },
      {
        _key: key("f"),
        title: uk("Прозорий прайс"),
        image: ids[2] ? imageWithAlt(ids[2], "Прозорий прайс") : undefined,
        items: [
          uk("Структурований прайс-лист, маркетолог оновлює ціни *за 2 хвилини*"),
          uk("Юридично коректне оформлення (стоп-таблиця для пацієнтів)"),
          uk("Можливість приховати окремі позиції від індексації"),
        ],
      },
      {
        _key: key("f"),
        title: uk("Каталог послуг"),
        image: ids[3] ? imageWithAlt(ids[3], "Каталог послуг") : undefined,
        items: [
          uk("Детальний опис процедур з фото *«до/після»* (з дозволу пацієнтів)"),
          uk("Повʼязані послуги і пакетні пропозиції"),
          uk("Відеоматеріали від лікарів"),
        ],
      },
      {
        _key: key("f"),
        title: uk("Інтеграція зі страховими"),
        image: ids[4] ? imageWithAlt(ids[4], "Інтеграція зі страховими") : undefined,
        items: [
          uk("Список *ДМС-програм* з онлайн-розрахунком покриття"),
          uk("Інтеграція з *Helsi* для держстраховок (НСЗУ)"),
          uk("Запис із зазначенням страховки"),
        ],
      },
      {
        _key: key("f"),
        title: uk("Локальне SEO та аналітика"),
        image: ids[5] ? imageWithAlt(ids[5], "Локальне SEO та аналітика") : undefined,
        items: [
          uk("*Schema.org* розмітка MedicalOrganization, оптимізація під «стоматолог + район»"),
          uk("Налаштування Google Business Profile, карта проїзду з парковкою"),
          uk("Аналітика трафіку і воронки від перегляду до запису"),
        ],
      },
    ],
    integrationsHeading: uk("Підключаємо всі\n*профільні* системи"),
    integrationsSub: uk(
      "Заявка з сайту потрапляє одразу у вашу *CRM*. Адміністратор бачить запис у момент кліку. Лікар отримує сповіщення в Telegram. Пацієнт — SMS-підтвердження. Жодних втрачених лідів через листи у спамі або дзвінки в неробочий час.",
    ),
    integrations: [
      uk("Dental4Windows"),
      uk("Medesk"),
      uk("MedAI"),
      uk("Helsi"),
      uk("KeyCRM"),
      uk("AmoCRM"),
      uk("Bitrix24"),
      uk("Telegram"),
    ],
  };
}

/* ────────────────────────── comparisonBlock ───────────────────────────── */

const COMPARISON_BLOCK = {
  _type: "comparisonBlock" as const,
  _key: key("sec"),
  heading: uk(
    "Чим кодовий сайт\nкращий за шаблонну\nмедицину на WordPress або Wix",
  ),
  columns: {
    param: uk("Параметр"),
    wp: uk("Шаблон WP"),
    wix: uk("Wix"),
    custom: uk("Кодовий сайт"),
  },
  rows: [
    { _key: key("row"), param: uk("Швидкість завантаження"), wp: uk("5–8 сек"), wix: uk("3–6 сек"), custom: uk("0,8–1,5 сек") },
    { _key: key("row"), param: uk("Онлайн-запис"), wp: uk("плагін (баги)"), wix: uk("через Apps"), custom: uk("кастомна") },
    { _key: key("row"), param: uk("Інтеграція з мед. CRM"), wp: uk("обмежена"), wix: uk("немає (Zapier)"), custom: uk("будь-яка") },
    { _key: key("row"), param: uk("Локальне SEO"), wp: uk("плагін Yoast"), wix: uk("базове"), custom: uk("закладено") },
    { _key: key("row"), param: uk("Безпека даних пацієнтів"), wp: uk("низька"), wix: uk("середня"), custom: uk("висока (GDPR)") },
    { _key: key("row"), param: uk("Юр. коректність МОЗ"), wp: uk("залежить від теми"), wix: uk("обмежено"), custom: uk("перевіряємо юристом") },
    { _key: key("row"), param: uk("TCO за 3 роки"), wp: uk("$4–6k"), wix: uk("$3,5–5k"), custom: uk("$5–7k") },
  ],
  tableCtaPrimary: uk("Детальне порівняння конструкторів"),
  tableCtaGhost: uk("Порівняння з WordPress"),
  contact: {
    heading: uk("Обговорити проєкт"),
    sub: uk(
      "Розкажіть коротко про вашу клініку — відповімо в Telegram протягом 1–2 годин у робочий час.",
    ),
    namePlaceholder: uk("Як до вас звертатися"),
    channelPlaceholder: uk("Telegram, телефон або email"),
    briefPlaceholder: uk("Яка клініка, який сайт потрібен, що зараз не працює"),
    submitLabel: uk("Надіслати — відповімо за 1–2 години"),
    foot: uk("Або одразу пишіть у Telegram — @fedirdev"),
  },
  pricingHeading: uk("Скільки коштує сайт для клініки"),
  tiers: [
    {
      _key: key("tier"),
      title: uk("Базовий сайт\nклініки"),
      price: uk("$3 500"),
      weeks: uk("4 тижні"),
      includesHeading: uk("Що входить"),
      includes: [
        uk("До 8 сторінок"),
        uk("Онлайн-запис"),
        uk("Каталог лікарів і послуг"),
        uk("Прозорий прайс"),
        uk("Відгуки пацієнтів"),
        uk("Базове *SEO*"),
        uk("Мобільна адаптація"),
      ],
      excludesHeading: uk("Не входить"),
      excludes: [
        uk("Створення контенту (тексти послуг, описи лікарів)"),
        uk("Професійна фотозйомка"),
        uk("ДМС-інтеграція"),
        uk("Блог"),
      ],
      ctaLabel: uk("Замовити базовий"),
    },
    {
      _key: key("tier"),
      isPopular: true,
      popularLabel: uk("Популярно"),
      title: uk("Розширений"),
      price: uk("$6 500"),
      weeks: uk("6 тижнів"),
      includesHeading: uk("Все з базового +"),
      includes: [
        uk("Блог і SEO-сторінки"),
        uk("*ДМС-інтеграція*"),
        uk("Фото-кейси до/після"),
        uk("Історія відвідувань і нагадування"),
        uk("Онлайн-консультація"),
        uk("Інтеграція з медичною *CRM*"),
      ],
      excludesHeading: uk("Не входить"),
      excludes: [
        uk("Фотозйомка (можемо організувати окремо)"),
        uk("Контент для блогу (можемо запропонувати копірайтера)"),
        uk("Багатомовність"),
      ],
      ctaLabel: uk("Замовити розширений"),
    },
    {
      _key: key("tier"),
      title: uk("Преміум / мережа\nклінік"),
      price: uk("$12 000"),
      weeks: uk("8–10 тижнів"),
      includesHeading: uk("Все з розширеного +"),
      includes: [
        uk("Багатофіліальна структура"),
        uk("Повна *CRM*-інтеграція"),
        uk("Багатомовність"),
        uk("Кастомні модулі під вашу спеціалізацію"),
        uk("Підтримка по *SLA*"),
      ],
      excludesHeading: uk("Не входить"),
      excludes: [
        uk("Створення фото/відео контенту"),
        uk("Юридичний консалтинг (тільки технічна юр-коректність)"),
      ],
      ctaLabel: uk("Обговорити мережу"),
      ctaGhost: true,
    },
  ],
};

/* ────────────────────────── faqBlock ──────────────────────────────────── */

const FAQ_BLOCK = {
  _type: "faqBlock" as const,
  _key: key("sec"),
  heading: uk("Часті питання"),
  items: [
    {
      _key: key("faq"),
      question: uk("Скільки часу займає запуск сайту клініки?"),
      answer: [
        block([
          "Базовий сайт — ",
          { em: "4 тижні" },
          ", розширений — 6 тижнів, преміум для мережі — 8–10 тижнів. Дедлайни фіксуємо у договорі. Кожен тиждень — звіт зі скріншотами та проміжним результатом.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Що робити зі старим сайтом?"),
      answer: [
        block([
          "Старий сайт працює до запуску нового — без втрати трафіку. Налаштовуємо ",
          { em: "301-редиректи" },
          " зі старих URL на нові, переносимо мета-теги і Schema-розмітку, передаємо домен. Просідання в Google зазвичай немає.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Хто наповнюватиме сайт контентом?"),
      answer: [
        block([
          "Можемо повністю — у нас є копірайтер з медичним досвідом і фотограф (за окрему вартість). Або ви даєте тексти і фото, ми верстаємо. Або гібридно — ви даєте опис послуг, ми переписуємо під ",
          { em: "SEO" },
          " і вимоги МОЗ.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Які інтеграції з медичними CRM можливі?"),
      answer: [
        block([
          "Працювали з ",
          { em: "Dental4Windows" },
          ", Medesk, MedAI, Helsi (НСЗУ), KeyCRM, AmoCRM, Bitrix24. Якщо у вас інша CRM — підключаємо через API або Webhook. Запис із сайту падає у CRM миттєво, лікар отримує сповіщення в Telegram.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Як захищені дані пацієнтів?"),
      answer: [
        block([
          "Відповідність ",
          { em: "GDPR" },
          " і вимогам МОЗ України: шифрування даних на льоту (HTTPS) і у спокої, IP-обмеження для адмінки, журнал доступів, регулярні бекапи. Сервери — у ЄС. Договір з вами включає DPA.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Чи можна розмістити відгуки пацієнтів?"),
      answer: [
        block([
          "Так, але ",
          { em: "з письмовою згодою пацієнта" },
          " та без розкриття діагнозу. Підготуємо шаблон згоди разом з юристом. Альтернатива — інтеграція з Google Reviews або Doc.ua, де відгуки модерує платформа.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Чи можна за законом розміщувати ціни на медичні послуги?"),
      answer: [
        block([
          "Так — і з 2024 це навіть обовʼязково для приватних клінік (постанова КМУ). Ми робимо прайс структурований, з позначкою «",
          { em: "орієнтовна вартість" },
          "» і застереженням, що остаточна ціна визначається після консультації. Юрист перевіряє формулювання.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Чи можна запустити рекламу медичних послуг у Google і Facebook?"),
      answer: [
        block([
          "Можна, але з обмеженнями: не можна обіцяти «гарантоване зцілення», використовувати фото «до/після» в обʼявах, рекламувати рецептурні препарати. Ми готуємо посадкові сторінки, які проходять модерацію Google Ads з першого разу. Налаштування реклами — окремо, але рекомендуємо перевірених підрядників.",
        ]),
      ],
    },
  ],
};

/* ────────────────────────── auditBlock ────────────────────────────────── */

const AUDIT_BLOCK = {
  _type: "auditBlock" as const,
  _key: key("sec"),
  heading: uk("Отримайте безкоштовний розбір сайту вашої клініки"),
  sub: uk(
    "Залиште посилання на ваш поточний сайт. Протягом *24 годин* надішлемо розбір.",
  ),
  list: [
    uk("Список з *7–12 помилок*, через які клініка втрачає пацієнтів"),
    uk("Технічний звіт зі швидкості та *SEO* (PageSpeed + Schema)"),
    uk("План покращень з пріоритетами"),
    uk("Орієнтовну вартість переробки або нового сайту"),
    uk("2–3 кейси клінік з нашого портфоліо"),
  ],
  foot: uk(
    "Жодних зобов'язань. Корисно, навіть якщо вирішите працювати з іншим підрядником.",
  ),
  inputs: {
    namePlaceholder: uk("Як до вас звертатися"),
    contactPlaceholder: uk("Імейл або нік у Telegram"),
    phonePlaceholder: uk("+380 (__) ___-__-__"),
    urlPlaceholder: uk("https://..."),
  },
  submitLabel: uk("Отримати розбір за 24 години"),
  disclaim: uk(
    "Не надсилаємо нічого, окрім розбору і одного листа з прикладами наших робіт. Без спаму.",
  ),
};

/* ────────────────────────── runner ────────────────────────────────────── */

type SanityClient = ReturnType<typeof createClient>;

async function uploadRemoteImage(
  client: SanityClient,
  url: string,
  label: string,
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetch ${url} → ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const asset = await client.assets.upload("image", buf, {
    filename: `${label}.${ext}`,
    contentType,
  });
  return asset._id;
}

async function uploadLocalImage(
  client: SanityClient,
  relPath: string,
  label: string,
): Promise<string> {
  const path = join(process.cwd(), "public", relPath);
  if (!existsSync(path)) {
    throw new Error(`Local image not found: ${path}`);
  }
  const buf = readFileSync(path);
  const ext = relPath.toLowerCase().endsWith(".png") ? "png" : "jpg";
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  const asset = await client.assets.upload("image", buf, {
    filename: `${label}.${ext}`,
    contentType,
  });
  return asset._id;
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
    process.exit(1);
  }
  if (!token) {
    console.error("✗ Missing SANITY_API_TOKEN");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  console.log(
    `→ Seeding industryPage.medicine into ${projectId}/${dataset} (${apiVersion})`,
  );

  console.log(`→ Uploading hero device mockup + case before/after…`);
  const [deviceMockupId, caseBeforeId, caseAfterId] = await Promise.all([
    uploadLocalImage(client, "raw-design/assets/mockup.png", "medicine-hero-mockup"),
    uploadLocalImage(client, "raw-design/assets/case-before.png", "medicine-case-before"),
    uploadLocalImage(client, "raw-design/assets/case-after.png", "medicine-case-after"),
  ]);
  console.log(`  · mockup: ${deviceMockupId}`);
  console.log(`  · case before: ${caseBeforeId}`);
  console.log(`  · case after: ${caseAfterId}`);

  console.log(`→ Uploading ${FEATURE_IMAGE_URLS.length} service feature images…`);
  const featureAssetIds = await Promise.all(
    FEATURE_IMAGE_URLS.map((url, i) =>
      uploadRemoteImage(client, url, `medicine-feature-${i + 1}`).then((id) => {
        console.log(`  · feature ${i + 1}: ${id}`);
        return id;
      }),
    ),
  );

  const HERO = buildHero(deviceMockupId);
  const CASE_BLOCK = buildCaseBlock(caseBeforeId, caseAfterId);
  const SERVICES_BLOCK = buildServicesBlock(featureAssetIds);

  const DOC = {
    _id: "industryPage.medicine",
    _type: "industryPage",
    status: "published",
    order: 1,
    slug: { _type: "slug", current: "medicine" },
    title: uk("Сайти для медичних клінік"),
    seo: {
      title: uk("Сайти для медичних клінік — Code-Site.Art"),
      description: uk(
        "Сайти для приватних клінік, стоматологій і діагностичних центрів. Online-запис, інтеграції з МІС, локальне SEO. Кейс: клініка «Ефедра» Одеса.",
      ),
    },
    hero: HERO,
    // Order matches the legacy /sites-for/medicine page exactly:
    // Reasons → Case → Outcome → Services → Comparison → FAQ → Audit
    sections: [
      REASONS_BLOCK,
      CASE_BLOCK,
      OUTCOME_BLOCK,
      SERVICES_BLOCK,
      COMPARISON_BLOCK,
      FAQ_BLOCK,
      AUDIT_BLOCK,
    ],
  };

  const result = await client.createOrReplace(DOC);

  console.log(`✓ Document ${result._id} written (rev ${result._rev})`);
  console.log(
    `  Sections: ${DOC.sections.map((s) => s._type).join(", ")}`,
  );
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
