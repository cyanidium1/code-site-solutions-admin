/**
 * Seed script — uploads the `/sites-for/renovation` page content into
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
 *   npm run seed:renovation
 *
 * Notes:
 * - Images are intentionally omitted (hero device mockup, case before/after,
 *   service feature backgrounds). The dynamic `[slug]` route falls back to
 *   undefined / empty bg gracefully. Add real assets later by adding image
 *   upload calls in `main()` and threading the asset ids through builder
 *   functions, mirroring `seed-medicine.ts`.
 * - Service feature ORDER matches `MEDICINE_FEATURE_ICONS` index mapping in
 *   `src/components/blocks/services/index.tsx` (Calendar, People, Price,
 *   Gear, Shield, Pin) so each renovation feature gets a sensible icon.
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

/* ────────────────────────── content (HERO) ────────────────────────────── */

const HERO = {
  eyebrow: uk("САЙТИ ДЛЯ РЕМОНТНИХ І БУДІВЕЛЬНИХ КОМПАНІЙ / від $3 500"),
  // formatLine markup: `\n` → <br/>, `*x*` → <em>x</em>
  heading: uk("Ремонтна компанія, до якої\n*записуються*"),
  h1Num: "30+",
  h1NumLabel: uk("клієнтів\nна місяць"),
  lede: uk(
    "Ви отримуєте сайт ремонтної компанії з працюючим калькулятором ціни і галереєю *«до/після»*. Без вашої участі більше ніж *5 годин*: контент пишемо ми, фото додасте з телефону потім. Запуск за 4–6 тижнів — і клієнти починають записуватися самі.",
  ),
  features: [
    uk("Калькулятор ціни | за 60 секунд"),
    uk("Галерея «до/після» | реальні об'єкти"),
    uk("Локальне SEO | під район і місто"),
    uk("CRM-інтеграція | Bitrix24 · AmoCRM"),
  ],
  ctaPrimary: uk("Обговорити мій проєкт"),
  ctaSecondary: uk("Подивитись кейси"),
  stats: [
    { _key: key("st"), value: "47", label: uk("будівельних\nсайтів") },
    { _key: key("st"), value: "4.8/5", label: uk("середня\nоцінка") },
    { _key: key("st"), value: "×2.4", label: uk("більше\nзаявок") },
  ],
  tickerItems: [
    uk("Косметичний ремонт"),
    uk("Капітальний ремонт"),
    uk("Дизайнерський ремонт"),
    uk("Реставрація"),
    uk("Покрівельні роботи"),
    uk("Фасадні роботи"),
    uk("Сантехнічні роботи"),
    uk("Електромонтаж"),
    uk("Комерційний ремонт"),
    uk("Ремонт офісів"),
    uk("Заміська нерухомість"),
    uk("Ремонт ванної кімнати"),
  ],
  deviceTags: [
    { _key: key("dt"), kind: "default", primary: uk("Калькулятор") },
    {
      _key: key("dt"),
      kind: "default",
      primary: uk("До / Після"),
      mini: "drag",
    },
    {
      _key: key("dt"),
      kind: "good",
      primary: uk("Local SEO"),
      mini: "top-1",
    },
  ],
  // deviceMockup intentionally omitted — page falls back gracefully.
};

/* ────────────────────────── reasonsBlock ──────────────────────────────── */

const REASONS_BLOCK = {
  _type: "reasonsBlock" as const,
  _key: key("sec"),
  eyebrow: uk("ДІАГНОСТИКА"),
  eyebrowNum: uk("/ 03 ПРИЧИНИ"),
  heading: uk(
    "3 причини, чому клієнти\n*не записуються* через ваш сайт",
  ),
  metaRows: [
    uk("аналіз 47 будівельних сайтів · 2024–25"),
    uk("розділ 02 / 06"),
  ],
  reasons: [
    {
      _key: key("r"),
      number: "01",
      tag: uk("TRANSPARENCY"),
      title: uk("Немає прозорого *прайсу* і калькулятора"),
      text: [
        block([
          "Клієнт не може зрозуміти, чи влізе ремонт у його бюджет — тому йде до конкурента, який показує ",
          { em: "ціну/м²" },
          ". 70% потенційних клієнтів зливаються на етапі «зателефонуйте дізнатися ціну».",
        ]),
      ],
      stat: {
        value: "70%",
        label: uk("клієнтів зливаються на «зателефонуйте дізнатися ціну»"),
        source: uk("BENCHMARK · 2025"),
      },
    },
    {
      _key: key("r"),
      number: "02",
      tag: uk("TRUST"),
      title: uk("Шаблонні фото і відсутність *кейсів «до/після»*"),
      text: [
        block([
          "Сторінка послуг з картинками з фотобанку. Жодного реального обʼєкта з адресою. Клієнт думає: «А ви взагалі робите ремонти, чи лише ",
          { em: "посередник" },
          "?». Без живих кейсів немає довіри.",
        ]),
      ],
      stat: {
        value: "0",
        label: uk("реальних обʼєктів у портфоліо більшості сайтів"),
        source: uk("AUDIT · 47 SITES"),
      },
    },
    {
      _key: key("r"),
      number: "03",
      tag: uk("VISIBILITY"),
      title: uk("Сайт не виходить у Google по *«ремонт + район»*"),
      text: [
        block([
          "Загальна сторінка про «всі види ремонту», без розбивки по районах і типах. Конкуренти з лендами «",
          { em: "ремонт квартир Печерськ" },
          "» забирають весь локальний трафік.",
        ]),
      ],
      stat: {
        value: "top-50",
        label: uk("позиція більшості будівельних сайтів у локальному пошуку"),
        source: uk("GOOGLE · 2025"),
      },
    },
  ],
  footText: uk(
    "Це 3 найпоширеніші. На ваш конкретний сайт — *5–7*. Безкоштовний аудит покаже свої.",
  ),
  footCtaLabel: uk("Перевірити мій сайт"),
};

/* ────────────────────────── caseBlock ─────────────────────────────────── */

const CASE_BLOCK = {
  _type: "caseBlock" as const,
  _key: key("sec"),
  eyebrow: uk("РЕАЛЬНИЙ КЕЙС"),
  eyebrowEm: uk("NBYG · КОПЕНГАГЕН, ДАНІЯ"),
  heading: uk("До / Після на прикладі\n*реального* клієнта"),
  lede: uk(
    "Будівельна компанія *NBYG* з Копенгагена звернулася з типовою проблемою: сайт-візитка на старій CMS, який не приносить заявок і не індексується по локальним запитам. Завдання — переробити структуру під послуги, додати калькулятор і вийти в топ Google по «*nyt tag København*».",
  ),
  meta: [
    { _key: key("m"), strong: uk("6 тижнів"), text: uk("від брифу до релізу") },
    {
      _key: key("m"),
      strong: uk("Покрівля + фасад"),
      text: uk("два пріоритетні напрямки"),
    },
    { _key: key("m"), strong: uk("DA + EN"), text: uk("локалізація під SEO") },
  ],
  before: {
    num: "NBYG · v1 · 2022",
    // image intentionally omitted
    url: "старий сайт",
    alt: uk("Старий сайт NBYG"),
    tagline: uk("Сайт-візитка без посадочних"),
    items: [
      uk("Загальний сайт без окремих лендингів *під послуги*"),
      uk("Не ранжувався в Google по «*nyt tag København*»"),
      uk("Не було калькулятора *ціни даху*"),
      uk("Замовлення тільки через дзвінок або email"),
      uk("Адмінка через старий CMS — будь-яка зміна = *розробник*"),
      uk("Жодного локального SEO під район"),
    ],
    foot: uk("**Результат:** заявки 3–5 на місяць, з тих що дзвонять."),
  },
  after: {
    num: "NBYG · v2 · 2024",
    // image intentionally omitted
    url: "nbygkbenhavn.dk/byggeydelser/tag",
    alt: uk("Новий сайт NBYG"),
    tagline: uk("Лендинг під послугу «новий дах»"),
    items: [
      uk("Окремі лендинги під *кожну* послугу (новий дах, фасад, утеплення)"),
      uk("Online-калькулятор з *4 типами* дахів і ціною/м²"),
      uk("Локальне SEO: *топ-1* у Google по «nyt tag København»"),
      uk("Онлайн-форма безкоштовного огляду + Calendly"),
      uk("Sanity CMS для самостійних правок *без розробника*"),
      uk("Schema.org LocalBusiness + Google Business Profile"),
    ],
    foot: uk("**Результат:** заявки 24+ на місяць, ×6 органічного трафіку."),
  },
  results: [
    {
      _key: key("res"),
      value: "×6",
      label: uk("органічного трафіку Google"),
      tag: uk("SEO · 6 МІС."),
    },
    {
      _key: key("res"),
      value: "0.8c",
      label: uk("LCP головної сторінки"),
      tag: uk("PERFORMANCE"),
    },
    {
      _key: key("res"),
      value: "Top-1",
      label: uk("по «nyt tag København»"),
      tag: uk("LOCAL SEO"),
    },
    {
      _key: key("res"),
      value: "×4.8",
      label: uk("більше заявок з сайту"),
      tag: uk("CONVERSION"),
    },
  ],
  ctaText: uk("Хочете **такий самий результат**? Подивіться, як ми це робимо."),
  ctaLabel: uk("Подивитися всі кейси"),
};

/* ────────────────────────── outcomeBlock ──────────────────────────────── */

const OUTCOME_BLOCK = {
  _type: "outcomeBlock" as const,
  _key: key("sec"),
  recap: {
    eyebrow: uk("СУТЬ"),
    text: uk(
      "Ваш сайт має *продавати ремонти*, поки ви на обʼєкті.",
    ),
  },
  directions: {
    eyebrow: uk("ДВА ТИПИ ЗАМОВНИКІВ"),
    title: uk("Працюємо з компаніями\n*будь-якого розміру*"),
    lede: uk(
      "Підхід відрізняється для соло-майстра і компанії з кількома послугами. Тарифи нижче — під обидва сценарії.",
    ),
    replaceLabel: uk("Соло-майстер · 1 спеціалізація"),
    replaceItems: [
      uk("Покрівельник, плиточник, електрик або штукатур"),
      uk("1 послуга, локальне SEO, прості заявки з форми"),
      uk("*Базовий* пакет — від $3 500"),
    ],
    allowedLabel: uk("Ремонтна компанія · 3-7 послуг"),
    allowedItems: [
      uk("Косметичний, капітальний, дизайнерський + супутні"),
      uk("Окремий лендинг під *кожен тип* ремонту"),
      uk("*Розширений* пакет — від $6 500"),
    ],
  },
  benefitsHeading: uk("Що ви отримаєте\nвід *нового* сайту"),
  benefitsSub: uk(
    "Не «красивий сайт». Конкретні штуки, що *приносять заявки* і економлять ваш час на телефоні.",
  ),
  benefitHero: {
    value: "×2,4",
    lede: uk(
      "Більше заявок, *менше дзвінків* з питанням «скільки коштує?»",
    ),
    source: uk("— середній результат за 6 місяців після запуску"),
    bullets: [
      uk("Ціна на сайті *відсіює* «не мою» аудиторію"),
      uk("Готові кейси переконують *без вашої участі*"),
    ],
  },
  benefitRows: [
    {
      _key: key("br"),
      feature: "LEADS 24/7",
      heading: uk(
        "Заявки приходять *у вихідні* і вечорами",
      ),
      // mockType valid values: "pages" | "booking" | "admin"
      mockType: "booking",
      mockUrl: "ваш-сайт.ua/калькулятор",
      items: [
        uk("Клієнт залишає номер о *22:00* — ви передзвонюєте зранку"),
        uk("Не втрачаєте людей, які пишуть, коли ви на обʼєкті"),
        uk(
          "SMS / Telegram / WhatsApp — *кожна заявка фіксується* в CRM",
        ),
      ],
    },
    {
      _key: key("br"),
      feature: "PRICE",
      heading: uk(
        "Прайс на сайті = *менше дзвінків* з питанням «скільки»",
      ),
      mockType: "pages",
      mockUrl: "ваш-сайт.ua/прайс",
      mockTags: [uk("Тип ремонту"), uk("Метраж"), uk("Район")],
      items: [
        uk(
          "Клієнт *сам* розраховує орієнтовну ціну в калькуляторі",
        ),
        uk(
          "Хто не вписується в бюджет — *відсіюється сам*, не висить на телефоні",
        ),
        uk(
          "Хто вписується — приходить уже готовий *обговорювати деталі*",
        ),
      ],
    },
    {
      _key: key("br"),
      feature: "CASES",
      heading: uk(
        "Реальні кейси замість *шаблонних* фото з фотобанку",
      ),
      mockType: "admin",
      mockUrl: "admin.ваш-сайт.ua/кейси",
      items: [
        uk(
          "Адреса, метраж, бюджет, термін — *конкретно* по кожному обʼєкту",
        ),
        uk("Фото «до/після» переконують краще за будь-які тексти"),
        uk(
          "Додаєте новий кейс з *телефону прямо з обʼєкта* (без розробника)",
        ),
      ],
    },
  ],
};

/* ────────────────────────── servicesBlock ─────────────────────────────── */

/**
 * Feature ORDER intentionally matches MEDICINE_FEATURE_ICONS index in
 * src/components/blocks/services/index.tsx:
 *   0 → IcCalendar  → Онлайн-запис на замір  (booking)
 *   1 → IcDoctors   → Галерея «до/після»     (people viewing — weakest fit)
 *   2 → IcPrice     → Калькулятор ціни        (price-table icon, perfect fit)
 *   3 → IcServices  → Проста адмінка          (gear/settings icon)
 *   4 → IcShield    → Окремі лендинги         (weak fit, but ok)
 *   5 → IcPin       → Локальне SEO + Maps     (location pin, perfect)
 */
const SERVICES_BLOCK = {
  _type: "servicesBlock" as const,
  _key: key("sec"),
  // testimonial intentionally omitted — add later when we have a real quote
  heading: uk("Що отримуєте з сайтом\n*від нас*"),
  sub: uk(
    "Не tech-демо. Конкретні штуки, які *приводять клієнтів* і економлять ваш час.",
  ),
  features: [
    {
      _key: key("f"),
      title: uk("Онлайн-запис на безкоштовний замір"),
      items: [
        uk("Клієнт бачить *вільні слоти* майстра і обирає сам"),
        uk("SMS-нагадування за 24 години і за 1 годину"),
        uk("Геолокація вибудовує *оптимальний маршрут* на день"),
        uk("Замовник не дзвонить «Чи на 14:00 ще вільно?»"),
      ],
    },
    {
      _key: key("f"),
      title: uk("Галерея «до/після» з адресами"),
      items: [
        uk(
          "Кожен обʼєкт — *окрема сторінка* з фото, метражем, бюджетом",
        ),
        uk("Фільтр за типом і стилем (косметичний / лофт / класика)"),
        uk(
          "Кейси індексуються в Google — *додатковий трафік*",
        ),
        uk("Адмінка щоб додавати з телефону прямо з обʼєкта"),
      ],
    },
    {
      _key: key("f"),
      title: uk("Калькулятор ціни ремонту"),
      items: [
        uk("Клієнт обирає *тип ремонту, метраж, район*"),
        uk("Бачить вилку «від — до» з привʼязкою до району"),
        uk("Залишає email — приходить детальний прайс у *PDF*"),
        uk("Ви отримуєте лід уже з *відомим бюджетом*"),
      ],
    },
    {
      _key: key("f"),
      title: uk("Проста адмінка (без розробника)"),
      items: [
        uk(
          "Додаєте новий кейс — заходите з *телефону*, заливаєте 5 фото",
        ),
        uk("Міняєте ціни в калькуляторі — без техпідтримки"),
        uk("Публікуєте статтю в блог — як в *Instagram*"),
        uk("Не платите за *кожну зміну*"),
      ],
    },
    {
      _key: key("f"),
      title: uk("Окремі лендинги під типи ремонту"),
      items: [
        uk(
          "Косметичний / капітальний / дизайнерський — *окремі сторінки*",
        ),
        uk(
          "Кожна ловить свій трафік: «ремонт квартири дешево» ≠ «дизайн інтерʼєру»",
        ),
        uk(
          "Конкуренти зазвичай мають *одну загальну* сторінку — ви виграєте по точності",
        ),
      ],
    },
    {
      _key: key("f"),
      title: uk("Локальне SEO + Google Maps"),
      items: [
        uk(
          "Сайт виходить у Google по «*ремонт + район*» (Поділ, Печерськ і т.д.)",
        ),
        uk("Карта з вашими обʼєктами + Google Business Profile"),
        uk(
          "Через 3-6 місяців — стабільний *органічний трафік без реклами*",
        ),
      ],
    },
  ],
  integrationsHeading: uk("Підключаємо всі\n*профільні* системи"),
  integrationsSub: uk(
    "Заявка з калькулятора або форми попадає одразу у вашу *CRM*. Прораб отримує сповіщення в Telegram. Клієнт — SMS-підтвердження візиту замірника. Жодних втрачених лідів через листи у спамі.",
  ),
  integrations: [
    uk("Bitrix24"),
    uk("AmoCRM"),
    uk("KeyCRM"),
    uk("Calendly"),
    uk("Google Maps"),
    uk("Google Business Profile"),
    uk("Planoplan"),
    uk("SweetHome3D"),
    uk("WayForPay"),
    uk("LiqPay"),
    uk("Telegram"),
  ],
};

/* ────────────────────────── comparisonBlock ───────────────────────────── */

const COMPARISON_BLOCK = {
  _type: "comparisonBlock" as const,
  _key: key("sec"),
  heading: uk(
    "Чим кодовий сайт\nкращий за шаблонну\nремонтну компанію на WordPress або Wix",
  ),
  columns: {
    param: uk("Параметр"),
    wp: uk("Шаблон WP"),
    wix: uk("Wix"),
    custom: uk("Кодовий сайт"),
  },
  rows: [
    {
      _key: key("row"),
      param: uk("Калькулятор ціни"),
      wp: uk("плагін (баги)"),
      wix: uk("через Apps"),
      custom: uk("кастомний"),
    },
    {
      _key: key("row"),
      param: uk("Галерея «до/після»"),
      wp: uk("статичні фото"),
      wix: uk("базова галерея"),
      custom: uk("з фільтрами"),
    },
    {
      _key: key("row"),
      param: uk("Локальне SEO"),
      wp: uk("плагін Yoast"),
      wix: uk("базове"),
      custom: uk("закладено"),
    },
    {
      _key: key("row"),
      param: uk("Інтеграція з CRM"),
      wp: uk("обмежена"),
      wix: uk("через Zapier"),
      custom: uk("будь-яка"),
    },
    {
      _key: key("row"),
      param: uk("Окремі лендинги під послуги"),
      wp: uk("одна сторінка"),
      wix: uk("одна сторінка"),
      custom: uk("під кожен тип"),
    },
    {
      _key: key("row"),
      param: uk("Швидкість завантаження"),
      wp: uk("3–5 сек"),
      wix: uk("2–4 сек"),
      custom: uk("< 1 сек"),
    },
    {
      _key: key("row"),
      param: uk("Власність на код"),
      wp: uk("vendor lock"),
      wix: uk("vendor lock"),
      custom: uk("ваш GitHub"),
    },
    {
      _key: key("row"),
      param: uk("Гарантія"),
      wp: uk("немає"),
      wix: uk("немає"),
      custom: uk("1 рік + неустойка 30%"),
    },
  ],
  tableCtaPrimary: uk("Детальне порівняння конструкторів"),
  tableCtaGhost: uk("Порівняння з WordPress"),
  contact: {
    heading: uk("Обговорити проєкт"),
    sub: uk(
      "Розкажіть коротко про вашу компанію — відповімо в Telegram протягом 1–2 годин у робочий час.",
    ),
    namePlaceholder: uk("Як до вас звертатися"),
    channelPlaceholder: uk("Telegram, телефон або email"),
    briefPlaceholder: uk(
      "Яка ремонтна компанія, який сайт потрібен, що зараз не працює",
    ),
    submitLabel: uk("Надіслати — відповімо за 1–2 години"),
    foot: uk("Або одразу пишіть у Telegram — *@fedirdev*"),
  },
  pricingHeading: uk("Скільки коштує сайт ремонтної компанії"),
  tiers: [
    {
      _key: key("tier"),
      title: uk("Базовий\nдля *соло-майстра*"),
      price: uk("$3 500"),
      weeks: uk("4 тижні"),
      includesHeading: uk("Що входить"),
      includes: [
        uk(
          "**Для:** покрівельника, плиточника, електрика, штукатура",
        ),
        uk("До 8 сторінок з адаптивом"),
        uk("Калькулятор для *1 типу* послуги"),
        uk("Галерея обʼєктів з фільтрами"),
        uk("Форма замовлення замірів"),
        uk("Інтеграція з *Telegram / WhatsApp*"),
        uk("Локальне SEO + Google Business Profile"),
        uk("Гарантія 1 рік"),
        uk("Перші *3 кейси* наповнюємо ми"),
      ],
      excludesHeading: uk("Не входить"),
      excludes: [
        uk("Кілька типів послуг (треба Розширений)"),
        uk("Блог"),
        uk("Багатомовність"),
      ],
      ctaLabel: uk("Замовити базовий"),
    },
    {
      _key: key("tier"),
      isPopular: true,
      popularLabel: uk("Найпопулярніший"),
      title: uk("Розширений\nдля *компанії*"),
      price: uk("$6 500"),
      weeks: uk("6 тижнів"),
      includesHeading: uk("Що входить"),
      includes: [
        uk(
          "**Для:** компанії з 3-7 послугами (косметичний, капітальний, дизайнерський)",
        ),
        uk("До 30 сторінок"),
        uk("Калькулятори вартості (*2-3 типи*)"),
        uk("Галерея «до/після» з 2-col порівнянням"),
        uk("*Окремі лендинги* під типи ремонту"),
        uk("Адмінка для *самостійних* змін"),
        uk("Інтеграція з 1-2 CRM (Bitrix24 / AmoCRM / KeyCRM)"),
        uk("Онлайн-замір (Calendly або кастомний)"),
        uk("Блог з SEO-статтями (*3 стартові* пишемо ми)"),
        uk("5+ окремих сторінок під *райони/міста*"),
        uk("Гарантія 1 рік + *неустойка 30%* за зрив"),
      ],
      excludesHeading: uk("Не входить"),
      excludes: [
        uk("Багатомовність (тільки в Преміум)"),
        uk("Кастомні модулі під забудовника"),
      ],
      ctaLabel: uk("Замовити розширений"),
    },
    {
      _key: key("tier"),
      title: uk("Преміум\nдля *забудовника ЖК*"),
      price: uk("$12 000"),
      weeks: uk("8-10 тижнів"),
      includesHeading: uk("Що входить"),
      includes: [
        uk(
          "**Для:** забудовника ЖК або мережі ремонтних компаній (3+ філій)",
        ),
        uk("Все з Розширеного"),
        uk("*Шахматка квартир* / каталог обʼєктів ЖК"),
        uk("Інтеграція з *1С* або обліковою системою"),
        uk("Багатомовність (UA + RU + EN, або інші мови)"),
        uk(
          "*Multi-tenant* для філій (кожна філія своя сторінка)",
        ),
        uk(
          "Складні платіжні воронки (резерв квартири, передоплата, milestone)",
        ),
        uk("*SLA* з гарантованим часом реакції"),
      ],
      excludesHeading: uk("Не входить"),
      excludes: [
        uk("Створення фото/відео-контенту"),
        uk("Юридичний супровід угод"),
      ],
      ctaLabel: uk("Обговорити преміум"),
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
      question: uk("За скільки заявок цей сайт окупиться?"),
      answer: [
        block([
          "Залежить від вашої маржі і середнього чека. Якщо чистий прибуток з 1 ремонту = ",
          { em: "$500-1 000" },
          ", сайт у $6 500 окупиться за ",
          { em: "6-12 нових клієнтів" },
          ". Зазвичай це 3-6 місяців стабільного органічного трафіку. Окупність нижче за рекламу — 1 ремонт ≈ $2-3 потрачених на Google Ads.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk(
        "Я вже один раз втратив гроші на сайт — як зрозуміти, що цей запрацює?",
      ),
      answer: [
        block([
          "Покажемо ",
          { em: "живі кейси" },
          " наших клієнтів з реальними цифрами «було/стало». Робимо договір з ",
          { em: "фіксованою ціною" },
          " і неустойкою 30% за зрив термінів. На етапі дизайну — 2 повні раунди правок. Якщо після другого раунду фундаментально не подобається — повертаємо ",
          { em: "70% передоплати" },
          " без скандалів.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Скільки часу від мене потрібно?"),
      answer: [
        block([
          "На брифі (30 хв Zoom) — потрібен ваш час. Далі: 1 раунд правок дизайну (1-2 години переглянути макети), затвердження кейсів і прайсу (2-3 години зібрати), фінальна перевірка перед запуском (1 година). Разом — ",
          { em: "5-8 годин" },
          " за весь проект. Контент на старті пишемо ми.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk(
        "Я не маю гарних фото з обʼєктів — це проблема?",
      ),
      answer: [
        block([
          { em: "Не проблема" },
          ". Поясніть ваш обʼєкт — ми порадимо як знімати на телефон (5 порад на брифі). Якщо взагалі немає фото — використовуємо абстрактні placeholders на старті, ви замінюєте по мірі надходження фото з нових обʼєктів. Адмінка дозволяє додавати ",
          { em: "швидко з телефону" },
          ".",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Чи можу я редагувати сайт сам після запуску?"),
      answer: [
        block([
          "Так. Адмінка проста — ",
          { em: "як публікація в Instagram" },
          ". Додавання кейсу, зміна ціни в калькуляторі, нова стаття в блог — все самостійно. Без розробника, без щомісячної підтримки. Якщо щось технічне — пишете нам, реагуємо за ",
          { em: "4 робочі години" },
          ".",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Що буде якщо сайт зламається після запуску?"),
      answer: [
        block([
          { em: "1 рік" },
          " — гарантія. Виправлення будь-яких багів безкоштовно за ",
          { em: "4 робочі години" },
          " в робочий час. Оновлення залежностей, security-перевірки — теж включені. Якщо хочете нову велику фічу через півроку — окремий quote, але дрібні правки і консультації — у межах гарантії.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("А якщо я хочу більше правок ніж 2 раунди?"),
      answer: [
        block([
          "Кожен додатковий раунд правок дизайну — погодинна ставка ",
          { em: "$40/год" },
          ". Зазвичай 3-й раунд = $160-320. Прозоро, без сюрпризів. На етапі розробки правки контенту/текстів безкоштовно, поки в межах ±20% обсягу.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk(
        "Хто пише тексти? Я не вмію формулювати про свій бізнес.",
      ),
      answer: [
        block([
          "На старті — ",
          { em: "ми" },
          ". Підбираємо 3 стартові кейси і 3 SEO-статті за вашу нішу і регіон. Ви даєте відповіді на 10-15 питань про бізнес — ми перетворюємо це в рідер сайту. Далі додаєте контент самі через адмінку (приклади, як писати, ми залишаємо в документації).",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Робите тільки сайт чи також брендинг?"),
      answer: [
        block([
          { em: "Робимо сайт" },
          ". Якщо у вас немає логотипа і фірмового стилю — порадимо 3-х перевірених брендингових партнерів (від $1 500 за brand book). Можемо зробити простий логотип-знак як частина пакета (за ",
          { em: "$500" },
          " додатково), але повний брендинг — окрема студія.",
        ]),
      ],
    },
    {
      _key: key("faq"),
      question: uk("Як ми будемо комунікувати протягом проекту?"),
      answer: [
        block([
          { em: "Telegram-чат" },
          " — щоденно, відповідаємо за 30 хв в робочий час. Раз на тиждень — screencast 3-5 хвилин з прогресом. GitHub-комміти видно щодня. Staging-URL для перегляду в реальному часі. Якщо вас немає тиждень — ",
          { em: "пауза проекту" },
          ", дедлайн зсувається.",
        ]),
      ],
    },
  ],
};

/* ────────────────────────── auditBlock ────────────────────────────────── */

const AUDIT_BLOCK = {
  _type: "auditBlock" as const,
  _key: key("sec"),
  heading: uk(
    "Безкоштовний аудит сайту вашої ремонтної компанії",
  ),
  sub: uk(
    "Залиште посилання на ваш поточний сайт. Протягом *3 робочих днів* надішлемо звіт у PDF.",
  ),
  list: [
    uk("*SEO-аудит*: топ-50 ключових запитів вашого регіону"),
    uk("*CRO-перевірка*: 12 точок втрати конверсії"),
    uk("*Технічний аудит*: швидкість, mobile, schema.org"),
    uk("План покращень з пріоритетами"),
    uk("Орієнтовну вартість переробки або нового сайту"),
  ],
  foot: uk(
    "Без зобовʼязань. Не навʼязуємо послуги. Корисно, навіть якщо вирішите працювати з іншим підрядником.",
  ),
  inputs: {
    namePlaceholder: uk("Як до вас звертатися"),
    contactPlaceholder: uk("Email для звіту"),
    phonePlaceholder: uk("+380 (__) ___-__-__"),
    urlPlaceholder: uk("https://..."),
  },
  submitLabel: uk("Отримати безкоштовний аудит"),
  disclaim: uk(
    "Не надсилаємо нічого, окрім звіту і одного листа з прикладами наших робіт. Без спаму.",
  ),
};

/* ────────────────────────── runner ────────────────────────────────────── */

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
    `→ Seeding industryPage.renovation into ${projectId}/${dataset} (${apiVersion})`,
  );

  const DOC = {
    _id: "industryPage.renovation",
    _type: "industryPage",
    status: "published",
    order: 2,
    slug: { _type: "slug", current: "renovation" },
    title: uk("Сайти для ремонтних і будівельних компаній"),
    seo: {
      title: uk(
        "Сайти для ремонтних і будівельних компаній — Code-Site.Art",
      ),
      description: uk(
        "Кастомні сайти для ремонтних і будівельних компаній: калькулятор ціни, галерея «до/після», локальне SEO. Запуск 4–6 тижнів, гарантія 1 рік.",
      ),
    },
    hero: HERO,
    // Order matches the medicine pattern:
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
  console.log(`  Sections: ${DOC.sections.map((s) => s._type).join(", ")}`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
