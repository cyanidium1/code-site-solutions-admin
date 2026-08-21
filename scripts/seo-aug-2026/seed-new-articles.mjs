/**
 * SEO overhaul (Aug 2026) — Phase 6: four new blog posts.
 *
 *   UA: skilky-koshtuye-zrobyty-sait-2026   (ціна по пунктах)
 *   UA: shcho-vkhodyt-u-vartist-rozrobky-saitu
 *   EN: web-design-for-accountants          (→ /en/sites-for/finance)
 *   EN: websites-for-solicitors             (→ /en/sites-for/legal)
 *
 * Documents follow the LIVE blogPost shape (localized slugs/title/lede/
 * metaTitle/metaDescription/body, blogFaqItem[] faq, flat author).
 * Deterministic _ids (no dots!) make the script idempotent via
 * createOrReplace.
 *
 * Usage (from the admin repo root):
 *   node scripts/seo-aug-2026/seed-new-articles.mjs --dry-run
 *   node scripts/seo-aug-2026/seed-new-articles.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DRY = process.argv.includes("--dry-run");

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));
loadEnvFile(join(ROOT, "..", "code-site-solutions", ".env.local"));

const TOKEN = process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: TOKEN,
  useCdn: false,
});

/* ── portable-text builders ─────────────────────────────────────────────── */
let k = 0;
const key = () => `s6-${(++k).toString(36)}`;

/** Paragraph / heading from segments: strings or {t, href}. */
function block(style, segments) {
  const markDefs = [];
  const children = [];
  for (const seg of segments) {
    if (typeof seg === "string") {
      children.push({ _key: key(), _type: "span", marks: [], text: seg });
    } else {
      const linkKey = key();
      markDefs.push({ _key: linkKey, _type: "link", href: seg.href, newTab: false });
      children.push({ _key: key(), _type: "span", marks: [linkKey], text: seg.t });
    }
  }
  return { _key: key(), _type: "block", style, markDefs, children };
}
const p = (...segments) => block("normal", segments);
const h2 = (text) => block("h2", [text]);
const h3 = (text) => block("h3", [text]);
const li = (...segments) => ({
  ...block("normal", segments),
  listItem: "bullet",
  level: 1,
});

const faqItem = (lang, q, a) => ({
  _key: key(),
  _type: "blogFaqItem",
  question: { [lang]: q },
  answer: { [lang]: a },
});

const AUTHOR = {
  name: "Fedir Alpatov",
  role: "Founder, Code-Site.Art",
};

/* ── resolve category refs by slug ──────────────────────────────────────── */
const cats = await client.fetch(
  `*[_type=="blogCategoryOption"]{_id, "slug": slug.current}`,
);
const catRef = (slug) => {
  const c = cats.find((x) => x.slug === slug);
  if (!c) throw new Error(`category ${slug} not found`);
  return { _type: "reference", _ref: c._id };
};

const NOW = new Date().toISOString();

/* ════════════════════════════════════════════════════════════════════════
   Article A (UA): Скільки коштує зробити сайт у 2026
   ════════════════════════════════════════════════════════════════════════ */
const articleA = {
  _id: "seoArt2026-skilky-koshtuye-zrobyty-sait",
  _type: "blogPost",
  status: "published",
  slugs: { uk: { _type: "slug", current: "skilky-koshtuye-zrobyty-sait-2026" } },
  title: { uk: "Скільки коштує зробити сайт у 2026: розбір ціни по пунктах" },
  metaTitle: { uk: "Скільки коштує зробити сайт у 2026 — розбір по пунктах" },
  metaDescription: {
    uk: "➤ Скільки коштує зробити сайт у 2026: лендінг від $800, корпоративний від $3 500 ✔️ З чого складається ціна по пунктах ✔️ Де можна зекономити, а де — ні.",
  },
  eyebrow: { uk: "/ ЦІНИ" },
  lede: {
    uk: "«Скільки коштує створити сайт?» — питання, на яке більшість студій відповідає «під запит». Ми відповідаємо цифрами: розкладаємо вартість розробки сайту на конкретні пункти й показуємо, з чого складається кожен долар.",
  },
  category: catRef("platforms"),
  tags: ["ціни", "розробка сайту", "бюджет"],
  author: AUTHOR,
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 7,
  relatedPostSlugs: ["vartist-rozrobky-saytu-2026", "tilda-vs-kastomnyy-sayt-2026"],
  body: {
    uk: [
      p(
        "Коротка відповідь: у 2026 році зробити сайт у професійної студії коштує від $800 за лендінг, від $3 500 за корпоративний сайт із CMS і від $6 000 за кастомну платформу. Довга відповідь цікавіша — бо ціна складається не з «дизайну» і «програмування», а з десятка конкретних робіт, кожну з яких можна порахувати.",
      ),
      h2("З чого складається ціна сайту: сім пунктів"),
      p(
        "Розкладемо корпоративний сайт за $3 500 на складові — так видно, за що ви платите насправді.",
      ),
      li("Аналітика і структура (10–15% бюджету). Бриф, аналіз конкурентів, карта сторінок, шлях користувача. Найдешевший пункт, який найдорожче пропускати: помилка в структурі коштує редизайну через рік."),
      li("Копірайтинг (10%). Тексти головної, послуг, «про нас». Написані під пошукові запити, а не «ласкаво просимо на наш сайт»."),
      li("Дизайн (20–25%). Кастомний макет під ваш бренд: головна + внутрішні шаблони, мобільна версія, UI-кіт."),
      li("Верстка і код (30–35%). Найбільший пункт: адаптивна верстка, анімації, форми, швидкість завантаження до 1 секунди."),
      li("CMS і адмінка (10%). Щоб ви самі міняли тексти, ціни і фото — без дзвінка розробнику."),
      li("Інтеграції (5–15%). CRM, аналітика, онлайн-оплата, месенджери. Кожна інтеграція — $200–500."),
      li("Запуск і налаштування (5%). Домен, хостинг, SSL, Search Console, редиректи зі старого сайту."),
      h2("Скільки коштує зробити сайт: три типові бюджети"),
      h3("Лендінг — від $800"),
      p(
        "Одна сторінка під одну дію: заявка, дзвінок, запис. Строк — 1–2 тижні. Підходить для послуги, події, перевірки ніші. Не підходить, коли послуг багато і кожна шукається окремо в Google.",
      ),
      h3("Корпоративний сайт — від $3 500"),
      p(
        "5–10 сторінок: послуги, кейси, блог, контакти. CMS, базове SEO, інтеграції. Строк — 4–6 тижнів. Робоча конячка малого і середнього бізнесу.",
      ),
      h3("Кастомна платформа — від $6 000"),
      p(
        "Каталог, особисті кабінети, складні інтеграції, нестандартна логіка. Строк — від 8 тижнів. Тут ціна залежить від обсягу, тому чесна відповідь — вилка після брифу.",
      ),
      h2("Де можна зекономити — а де не варто"),
      li("Можна: свій контент. Якщо у вас є готові тексти і фото — мінус 10–15% бюджету."),
      li("Можна: свій дизайнер або brand book. Готовий фірмовий стиль скорочує етап дизайну."),
      li("Можна: запуск в один етап. MVP зараз, розширення потім — платите частинами."),
      li("Не варто: шаблон замість структури. Заощаджені $500 обертаються сайтом, який не знаходять у пошуку."),
      li("Не варто: хостинг «за $1». Повільний сервер з'їдає позиції в Google і конверсію."),
      li("Не варто: сайт без адмінки. Кожна зміна тексту через розробника — це $40/год назавжди."),
      h2("Як порахувати свій бюджет за 60 секунд"),
      p(
        "Найшвидший спосіб дізнатися вилку під ваш проєкт — ",
        { t: "калькулятор вартості сайту", href: "/calculator" },
        ": обираєте тип сайту, сторінки й інтеграції — бачите ціну одразу, без дзвінка менеджера. Повний прайс із фіксованими пакетами — на сторінці ",
        { t: "ціни створення сайту", href: "/pricing" },
        ". А що буде з сайтом після запуску — окрема тема: ",
        { t: "обслуговування сайту", href: "/support" },
        " перший рік уже входить у ціну розробки.",
      ),
    ],
  },
  faq: [
    faqItem(
      "uk",
      "Скільки коштує зробити сайт самостійно на конструкторі?",
      "Tilda чи Wix — $200–400 на рік за тариф плюс ваш час. Для перевірки ідеї — нормально. Для бізнесу, який живе з пошукового трафіку, конструктор упирається в стелю: швидкість, SEO-структура і інтеграції обмежені платформою.",
    ),
    faqItem(
      "uk",
      "Чому ціни на сайти так відрізняються — від $300 до $30 000?",
      "Бо «сайт» — це різні продукти. $300 — шаблон із заміненим логотипом. $3 500 — кастомний сайт під ваш бізнес зі структурою під пошукові запити. $30 000 — платформа з унікальною логікою. Порівнювати треба не цифри, а списки робіт за ними.",
    ),
    faqItem(
      "uk",
      "Скільки часу займає зробити сайт?",
      "Лендінг — 1–2 тижні, корпоративний сайт — 4–6 тижнів, платформа — від 8 тижнів. Половина строку — це контент і погодження, тому готові тексти помітно прискорюють запуск.",
    ),
    faqItem(
      "uk",
      "Ціна фіксована чи може вирости в процесі?",
      "У нас — фіксована в договорі до старту. Зміна обсягу в межах ±20% не змінює ціну; більше — окрема угода до, а не рахунок після.",
    ),
  ],
};

/* ════════════════════════════════════════════════════════════════════════
   Article B (UA): Що входить у вартість розробки сайту
   ════════════════════════════════════════════════════════════════════════ */
const articleB = {
  _id: "seoArt2026-shcho-vkhodyt-u-vartist",
  _type: "blogPost",
  status: "published",
  slugs: {
    uk: { _type: "slug", current: "shcho-vkhodyt-u-vartist-rozrobky-saitu" },
  },
  title: { uk: "Що входить у вартість розробки сайту: повний список" },
  metaTitle: { uk: "Що входить у вартість розробки сайту — повний список" },
  metaDescription: {
    uk: "➤ Що входить у вартість розробки сайту: дизайн, код, CMS, хостинг, SEO-структура, рік підтримки ✔️ Прайс на створення сайту по пунктах ✔️ Що оплачується окремо.",
  },
  eyebrow: { uk: "/ ЦІНИ" },
  lede: {
    uk: "Рахунок «розробка сайту — $3 500» нічого не пояснює. Розбираємо прайс на створення сайту по пунктах: що ви отримуєте в базовій ціні, що студії часто продають окремо і як читати комерційну пропозицію, щоб порівнювати однакове з однаковим.",
  },
  category: catRef("platforms"),
  tags: ["ціни", "розробка сайту", "договір"],
  author: AUTHOR,
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 6,
  relatedPostSlugs: ["vartist-rozrobky-saytu-2026", "yak-pratsyuye-admin-panel-saytu"],
  body: {
    uk: [
      p(
        "Дві пропозиції «корпоративний сайт» можуть відрізнятися вдвічі за ціною і втричі за складом. Єдиний спосіб порівняти їх чесно — розгорнути кожну в список робіт. Ось повний перелік того, що взагалі буває у вартості сайту, і позначки, що з цього входить у наші пакети за замовчуванням.",
      ),
      h2("База: без цього сайт не працює"),
      li("Структура і прототип: карта сторінок, логіка переходів, місця під заявки."),
      li("Дизайн-макет: кастомний, під ваш бренд, з мобільною версією."),
      li("Верстка і код: адаптивність, швидкість до 1 с, кросбраузерність."),
      li("CMS-адмінка: редагуєте тексти, фото і ціни самостійно."),
      li("Форми і заявки: відправка в пошту, Telegram або CRM."),
      li("Домен, хостинг, SSL: технічний запуск під ключ."),
      h2("SEO-структура: те, що забувають спитати"),
      p(
        "Найдорожча відмінність дешевого сайту від робочого — невидима: title і description кожної сторінки, правильні заголовки H1–H3, sitemap, robots, Schema.org-розмітка, швидкість у зеленій зоні PageSpeed. Якщо цього немає в переліку — сайт доведеться «доробляти під SEO» за окремі гроші. У наших пакетах це база: аналіз ",
        { t: "вартості просування сайту", href: "/seo" },
        " окремо від розробки має сенс лише для кампанії після запуску.",
      ),
      h2("Контент: хто пише тексти"),
      p(
        "Стартовий копірайтинг (головна, послуги, «про нас») у нас входить у ціну — ви лише вичитуєте. Окремо оплачується обʼємний контент: статті блогу, описи 50 товарів, тексти 20 сторінок послуг. Ринкова ціна — від $30 за статтю.",
      ),
      h2("Що майже завжди оплачується окремо"),
      li("Брендинг з нуля: логотип і фірмовий стиль — окремий проєкт."),
      li("Фото- і відеозйомка: рекомендуємо підрядників, не робимо самі."),
      li("Реклама: налаштування Google Ads чи Meta — окрема послуга."),
      li("SEO-кампанія: системне просування після запуску — від $300/міс."),
      li("Нестандартні інтеграції: 1С, BAS, кастомні API — оцінюються після аудиту."),
      h2("Підтримка після запуску"),
      p(
        "Уточнюйте, що буде через рік: скільки коштує продовження хостингу, хто оновлює систему, скільки коштує година правок. У нас перший рік гарантії і підтримки входить у ціну кожного пакета, далі — ",
        { t: "обслуговування сайту від $200/міс", href: "/support" },
        " або погодинні роботи. Повний склад пакетів із цінами — на сторінці ",
        { t: "вартість розробки сайту", href: "/pricing" },
        ".",
      ),
    ],
  },
  faq: [
    faqItem(
      "uk",
      "Що входить у вартість розробки сайту за замовчуванням?",
      "У професійної студії: структура, кастомний дизайн, верстка, CMS, стартові тексти, технічний запуск (домен, хостинг, SSL) і базова SEO-структура. Все інше — контент понад стартовий, брендинг, реклама — має бути явно позначено як окремі послуги.",
    ),
    faqItem(
      "uk",
      "Як зрозуміти, що прайс на створення сайту чесний?",
      "Попросіть розгорнути суму в список робіт із годинами або відсотками. Чесний підрядник розкладе ціну по пунктах за 10 хвилин. «Комплексна розробка — договірна» без деталей — привід піти до наступного.",
    ),
    faqItem(
      "uk",
      "Чи входить SEO у вартість сайту?",
      "SEO-структура (мета-теги, швидкість, розмітка) — має входити. SEO-кампанія (контент, посилання, робота з позиціями щомісяця) — це окрема послуга з окремим бюджетом, зазвичай від $300/міс.",
    ),
    faqItem(
      "uk",
      "Скільки коштує підтримка сайту після запуску?",
      "Ринкова вилка — $100–500/міс залежно від обсягу. У нас перший рік входить у ціну розробки, далі пакет від $200/міс або разові роботи за $40/год.",
    ),
  ],
};

/* ════════════════════════════════════════════════════════════════════════
   Article C (EN): Web design for accountants
   ════════════════════════════════════════════════════════════════════════ */
const articleC = {
  _id: "seoArt2026-web-design-for-accountants",
  _type: "blogPost",
  status: "published",
  slugs: { en: { _type: "slug", current: "web-design-for-accountants" } },
  title: {
    en: "Web design for accountants: what an accountancy firm's site actually needs",
  },
  metaTitle: { en: "Web Design for Accountants: What Your Firm Needs" },
  metaDescription: {
    en: "➤ Web design for accountants and accountancy firms in the UK ✔️ Trust signals, service pages, fee transparency ✔️ What to ask a web designer ➡ Checklist.",
  },
  eyebrow: { en: "/ FINANCE" },
  lede: {
    en: "Most accountancy websites are digital business cards: a stock-photo handshake, four bullet points, a contact form nobody fills in. Here is what web design for accountants should actually deliver — and the checklist to hold any agency against.",
  },
  category: catRef("finance"),
  tags: ["finance", "web design", "accountants"],
  author: AUTHOR,
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 7,
  relatedPostSlugs: [
    "vartist-rozrobky-saytu-2026",
    "nextjs-proty-wordpress-ta-konstruktoriv",
  ],
  body: {
    en: [
      p(
        "An accountant's website has one job: make a business owner comfortable enough to hand over their numbers. That is a trust problem, not a decoration problem — and it changes what good web design for accountants looks like.",
      ),
      h2("The trust stack: what visitors check before they call"),
      li("Real people. Photos of the actual partners, names, qualifications (ACCA, ACA, AAT), not stock imagery. Firms are chosen by face and credential."),
      li("Specialisms spelled out. \"Accounting for contractors\", \"e-commerce VAT\", \"medical practices\" — each niche you serve deserves its own page, because that is exactly how people search."),
      li("Fee transparency. You do not need a full price list; you need honest starting points. \"Self-assessment from £150\" filters out mismatched clients and reassures the rest."),
      li("Proof: client logos, review widgets wired to Google, case notes with numbers (\"cut year-end close from 6 weeks to 2\")."),
      li("Compliance details in the footer: registration numbers, professional-body membership, professional indemnity insurance. Small print that closes deals."),
      h2("Structure that ranks: one service, one page"),
      p(
        "The single biggest SEO mistake accountancy sites make is one \"Services\" page listing ten services in ten sentences. Google ranks pages, not paragraphs. Bookkeeping, payroll, VAT returns, year-end accounts, tax planning — each needs its own page with its own title tag, its own FAQ, its own call to action. That is how a five-person firm outranks a national chain for \"payroll services + town\".",
      ),
      h2("The mechanics that make it work"),
      li("Speed under 1 second. Business owners check sites between meetings, on phones. Every extra second of load time costs enquiries."),
      li("A booking step that isn't \"call us\": a Calendly-style discovery-call slot or a short qualifying form. Accountants lose evening enquiries to voicemail."),
      li("Client portal links where they belong — in the header, not buried in a menu."),
      li("Schema.org AccountingService markup, so Google shows ratings and services directly in results."),
      h2("What to ask a web designer before you sign"),
      p(
        "Ask to see the page structure before the design. Ask what happens to your Google rankings during migration. Ask who writes the copy and whether title tags are included, and what the site costs to run in year two. If the answers are vague, the quote is not comparable with one that includes them. Our own answers live on the ",
        { t: "websites for finance and accountancy firms", href: "/en/sites-for/finance" },
        " page — structure, integrations and timelines — and the numbers are on the ",
        { t: "website development pricing", href: "/en/pricing" },
        " page, fixed before we start.",
      ),
    ],
  },
  faq: [
    faqItem(
      "en",
      "How much does web design for accountants cost in the UK?",
      "A credible bracket for a custom accountancy-firm site is £3,500–£6,500: service-per-page structure, copywriting, a review widget, booking integration and a year of support. Template rebuilds are cheaper but usually inherit the one-page-services problem that keeps firms invisible in search.",
    ),
    faqItem(
      "en",
      "What pages should an accountancy website have?",
      "Home, one page per service (bookkeeping, payroll, VAT, year-end, tax planning), one page per niche you specialise in, team with credentials, fees, reviews, and a contact page with a discovery-call booking. Typically 10–15 pages for a small firm.",
    ),
    faqItem(
      "en",
      "Should accountants show prices on their website?",
      "Show starting points, not a full tariff. \"From £X\" pricing filters out mismatched leads, builds trust, and gives Google a price signal for rich results — three wins for one line of copy.",
    ),
    faqItem(
      "en",
      "Do accountants need a client portal on the site?",
      "You need a clear, prominent link to whichever portal you already use (Xero, QuickBooks, Karbon, a document exchange). Building a custom portal only pays off for larger practices with bespoke workflows.",
    ),
  ],
};

/* ════════════════════════════════════════════════════════════════════════
   Article D (EN): Websites for solicitors
   ════════════════════════════════════════════════════════════════════════ */
const articleD = {
  _id: "seoArt2026-websites-for-solicitors",
  _type: "blogPost",
  status: "published",
  slugs: { en: { _type: "slug", current: "websites-for-solicitors" } },
  title: { en: "Websites for solicitors: a practical guide" },
  metaTitle: { en: "Websites for Solicitors: A Practical Guide for UK Firms" },
  metaDescription: {
    en: "➤ Websites for solicitors and law firms: practice-area pages, SRA compliance, enquiry flows that convert ✔️ What a solicitor's website must include ➡ Guide.",
  },
  eyebrow: { en: "/ LEGAL" },
  lede: {
    en: "A solicitor's website is read by people in trouble: a dispute, a divorce, a house purchase going sideways. They are stressed, comparing three firms in one evening, and deciding who to trust with it. This guide covers what websites for solicitors must do — practically, not theoretically.",
  },
  category: catRef("legal"),
  tags: ["legal", "web design", "solicitors"],
  author: AUTHOR,
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 7,
  relatedPostSlugs: [
    "vartist-rozrobky-saytu-2026",
    "yak-pratsyuye-admin-panel-saytu",
  ],
  body: {
    en: [
      p(
        "Legal services are bought on trust and found through search. That makes a law firm's website both a credentials file and a search asset — and most firm sites fail at one or the other: beautiful brochures nobody finds, or keyword-stuffed pages nobody believes.",
      ),
      h2("Practice areas: the architecture decision that matters most"),
      p(
        "\"Website for attorney\" searches are rarely generic — people search for \"conveyancing solicitor + town\", \"unfair dismissal solicitor\", \"divorce solicitor fees\". Every practice area needs its own page, and busy areas deserve sub-pages: conveyancing splits into purchase, sale and remortgage; employment law splits by employee and employer side. One page per problem someone actually types into Google.",
      ),
      h2("Trust signals specific to law"),
      li("SRA number and regulatory statement, visible without scrolling to the footer on key pages."),
      li("Solicitor profiles with photos, specialisms, year of qualification and notable matters — clients hire a person, then a firm."),
      li("Fee transparency where the SRA requires it (conveyancing, probate, employment tribunals, motoring offences) — published, structured, findable."),
      li("Reviews that name the practice area: \"handled our purchase in 6 weeks\" outsells five anonymous stars."),
      li("Clear complaint and Legal Ombudsman information — its presence signals professionalism."),
      h2("The enquiry flow: minutes matter"),
      p(
        "Legal enquiries are urgent and comparative: the same person contacts two or three firms and often instructs whoever answers first. The site's job is to shorten that loop — a short enquiry form that asks the matter type and urgency, a visible phone number with real answering hours, and an auto-acknowledgement that says when a named person will call back. Firms that respond inside an hour win matters from firms with better rankings.",
      ),
      h2("Content that earns rankings"),
      p(
        "A solicitor's blog is not news about the firm's charity run. It answers the questions clients ask in the first meeting: \"What does a section 21 notice mean?\", \"How long does probate take?\", \"What counts as constructive dismissal?\". Each answer page feeds the practice-area page above it with internal links — the structure Google reads as expertise. Our approach to structure, compliance blocks and enquiry flows is on the ",
        { t: "websites for law firms", href: "/en/sites-for/legal" },
        " page, and the ",
        { t: "website development pricing", href: "/en/pricing" },
        " page shows what each tier includes — fixed in the contract before work starts.",
      ),
    ],
  },
  faq: [
    faqItem(
      "en",
      "How much does a website for a solicitors' firm cost?",
      "A realistic bracket for a custom law-firm site is £3,500–£6,500: practice-area architecture, SRA-compliant fee pages, solicitor profiles, review integration and a year of support. Multi-office firms with bespoke calculators or client portals sit above that.",
    ),
    faqItem(
      "en",
      "What must a solicitor's website include for SRA compliance?",
      "The SRA transparency rules require published prices and service descriptions for specific areas (conveyancing, probate, motoring offences, employment tribunals, immigration), the firm's SRA number, the digital badge, and complaints information including the Legal Ombudsman. Build these as structured pages, not PDFs.",
    ),
    faqItem(
      "en",
      "Do practice-area pages really outperform one services page?",
      "Yes — search is problem-specific. A page targeting \"conveyancing solicitor Leeds\" can rank and convert; a generic services list ranks for nothing. It is the highest-leverage structural change a firm site can make.",
    ),
    faqItem(
      "en",
      "Should a law firm publish fees online?",
      "Where the SRA requires it, you have no choice. Elsewhere, publish starting points: clients under stress strongly prefer firms that name numbers, and fee pages rank for high-intent \"solicitor fees\" searches.",
    ),
  ],
};

/* ── run ────────────────────────────────────────────────────────────────── */
const ARTICLES = [articleA, articleB, articleC, articleD];

for (const a of ARTICLES) {
  const t = a.metaTitle.uk ?? a.metaTitle.en;
  const d = a.metaDescription.uk ?? a.metaDescription.en;
  if (t.length > 60) throw new Error(`metaTitle > 60 (${t.length}): ${t}`);
  if (d.length < 140 || d.length > 160) {
    throw new Error(`metaDescription length ${d.length} out of 140-160: ${d}`);
  }
}

if (DRY) {
  for (const a of ARTICLES) {
    const lang = a.body.uk ? "uk" : "en";
    const words = a.body[lang]
      .flatMap((b) => b.children?.map((c) => c.text) ?? [])
      .join(" ")
      .split(/\s+/).length;
    console.log(
      `${a._id}: ${lang}, ~${words} body words, ${a.faq.length} FAQ, meta ${(a.metaTitle.uk ?? a.metaTitle.en).length}/${(a.metaDescription.uk ?? a.metaDescription.en).length}`,
    );
  }
  console.log("--dry-run: no mutations sent");
  process.exit(0);
}

let tx = client.transaction();
for (const a of ARTICLES) tx = tx.createOrReplace(a);
const res = await tx.commit();
console.log("committed:", res.transactionId);
