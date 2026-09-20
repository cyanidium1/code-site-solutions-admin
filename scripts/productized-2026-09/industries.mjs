/**
 * TZ v2 §3.6 — industry pages (/sites-for/*): прибрати з industryPage старі
 * ціни, строки й платний аудит, які суперечать єдиному прайсу.
 *
 * Що робить фронтенд сам (з конфігу src/constants/pricing.ts) і тому тут НЕ
 * чіпається: H1, meta title/description, JSON-LD Offer, картки цін (Sanity
 * comparisonBlock.tiers більше не рендеряться), рядок цін у таблиці
 * порівняння. Ці поля в CMS лишаються як є.
 *
 * Що правимо тут — тексти, які фронтенд рендерить як є:
 *   - hero.lede і reasons.footText: «4–6 тижнів / 6–10 недель / 4-8 weeks»
 *     → строк пакета «Галузеве рішення» (14–21 робочий день);
 *   - finance hero.stats: «4–8 тижнів — приріст конверсії» → строк до запуску;
 *   - auditBlock.heading і renovation footText: «аудит за $150» → безкоштовний;
 *   - «24/7» (заборонене слово, TZ §6) → «цілодобово»;
 *   - FAQ-відповіді зі старими цінами/строками/тарифами (Pro, Премиум,
 *     $2 500, $3,500, $500-1,500, $300/міс, $450 …) → числа з конфігу.
 *
 * Числа нижче дзеркалять src/constants/pricing.ts станом на 2026-09-20
 * (uk/ru — USD, en — EUR, окремий ринок). Змінився прайс — оновіть P.
 *
 * ecommerce і courses не чіпаємо: їх 301-ять на /online-store і /landing.
 *
 * Запуск:
 *   node scripts/productized-2026-09/industries.mjs          // dry-run
 *   node scripts/productized-2026-09/industries.mjs --apply  // запис
 * Перед записом повні документи зберігаються в backups/productized-2026-09/.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient } from "@sanity/client";

const APPLY = process.argv.includes("--apply");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && APPLY) throw new Error("потрібен SANITY_WRITE_TOKEN для --apply");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  perspective: "published",
  token,
});

/* ── Прайс (дзеркало src/constants/pricing.ts) ─────────────────────── */
const NB = " "; // formatPrice групує uk/ru розряди нерозривним пробілом
const usd = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB)}`;
const eur = (n) => `€${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
const PRICE = {
  uk: { medicine: usd(1800), legal: usd(1800), finance: usd(1800), renovation: usd(1800), auto: usd(2000), "real-estate": usd(2200) },
  en: { medicine: eur(4500), legal: eur(4500), finance: eur(4500), renovation: eur(4500), auto: eur(5000), "real-estate": eur(5500) },
};
PRICE.ru = PRICE.uk;
const TERM = { uk: "14–21 робочий день", ru: "14–21 рабочий день", en: "14–21 working days" };
const P = {
  customUk: `від ${usd(4000)}`,
  customRu: `от ${usd(4000)}`,
  customEn: `from ${eur(9000)}`,
  crm: { uk: `+${usd(300)}`, en: `+${eur(600)}` },
  booking: { uk: `+${usd(300)}`, en: `+${eur(600)}` },
  lang: { uk: `+${usd(200)}`, en: `+${eur(400)}` },
  copy: { uk: `+${usd(300)}`, en: `+${eur(600)}` },
  seoFrom: { uk: `від ${usd(400)}/міс`, ru: `от ${usd(400)}/мес`, en: `from ${eur(800)}/mo` },
};

/* ── Правки ─────────────────────────────────────────────────────────── */
const TERM_RE = /(\d+)\s?[–-]\s?(\d+)\s(тижнів|тижні|недель|недели|weeks)/;
const toTerm = (l) => (s) => s.replace(TERM_RE, TERM[l]);
const NO_247 = { uk: "цілодобово", ru: "круглосуточно", en: "around the clock" };
const no247 = (l) => (s) => s.replace("24/7", NO_247[l]);
const freeAuditHeading = (l) => (s) => {
  if (l === "en") return s.replace("A $150 audit", "A free audit");
  if (s.includes("за $150")) return s.replace("з аудиту сайту за $150", "з безкоштовного аудиту сайту");
  const free = l === "uk" ? "Безкоштовний аудит" : "Бесплатный аудит";
  return s.replace(/ — \$150$/, "").replace(/^Аудит/, free);
};
const ALL = ["uk", "ru", "en"];

/** Текстові поля: [slug, шлях без локалі, локалі, transform(locale) → fn(string)]. */
const STRING_EDITS = [
  // hero.lede — строк
  ...["medicine", "renovation", "legal", "auto", "finance", "real-estate"].map((s) => [s, "hero.lede", ALL, toTerm]),
  // reasons footText — «виправляємо всі три за N–M тижнів»
  ["auto", 'sections[_key=="aut-sec-7"].footText', ALL, toTerm],
  ["legal", 'sections[_key=="leg-sec-7"].footText', ALL, toTerm],
  ["finance", 'sections[_key=="fin-sec-7"].footText', ALL, toTerm],
  ["real-estate", 'sections[_key=="rea-sec-7"].footText', ALL, toTerm],
  // finance hero stat: «4–8 тижнів / приріст конверсії»
  ["finance", 'hero.stats[_key=="fin-st-3"].value', ALL, (l) => () => TERM[l]],
  ["finance", 'hero.stats[_key=="fin-st-3"].label', ALL, (l) => () => ({ uk: "до запуску", ru: "до запуска", en: "to launch" })[l]],
  // платний аудит → безкоштовний
  ["auto", 'sections[_key=="aut-sec-97"].heading', ALL, freeAuditHeading],
  ["medicine", 'sections[_key=="sec27"].heading', ALL, freeAuditHeading],
  ["legal", 'sections[_key=="leg-sec-97"].heading', ALL, freeAuditHeading],
  ["finance", 'sections[_key=="fin-sec-97"].heading', ALL, freeAuditHeading],
  ["real-estate", 'sections[_key=="rea-sec-97"].heading', ALL, freeAuditHeading],
  ["renovation", 'sections[_key=="sec31"].heading', ALL, freeAuditHeading],
  ["renovation", 'sections[_key=="sec7"].footText', ALL, (l) => (s) =>
    s
      .replace("Аудит сайту за $150", "Безкоштовний аудит сайту")
      .replace("Аудит сайта за $150", "Бесплатный аудит сайта")
      .replace("The $150 website audit", "A free website audit")],
  // 24/7
  ["medicine", 'sections[_key=="sec2m"].features[_key=="f2n"].title', ALL, no247],
  ["medicine", 'sections[_key=="sec2m"].features[_key=="f2n"].image.alt', ALL, no247],
  ["auto", 'sections[_key=="aut-sec-47"].sub', ALL, no247],
];

const pr = (slug, l) => PRICE[l][slug];

/** FAQ-відповіді: [slug, faqBlock _key, item _key, {uk, ru, en}] — повний новий текст. */
const FAQ_EDITS = [
  ["medicine", "sec14", "faq15", {
    uk: `Сайт клініки — ${TERM.uk} від брифу до запуску. Мережа клінік або центр із ДМС-інтеграцією — окремий проєкт, від 6 тижнів. Строк фіксуємо в договорі: зрив із нашої вини — неустойка 5% за кожен робочий день, до 30%. Щотижня — звіт зі скріншотами та проміжним результатом.`,
    ru: `Сайт клиники — ${TERM.ru} от брифа до запуска. Сеть клиник или центр с ДМС-интеграцией — отдельный проект, от 6 недель. Срок фиксируем в договоре: срыв по нашей вине — неустойка 5% за каждый рабочий день, до 30%. Каждую неделю — отчёт со скриншотами и промежуточным результатом.`,
    en: `A clinic website takes ${TERM.en} from brief to launch. A multi-site group or an insurance integration is a separate project, from 6 weeks. The deadline is in the contract: if we miss it through our fault, we pay 5% per working day, up to 30%. Every week you get a report with screenshots and the latest build.`,
  }],
  ["medicine", "sec14", "faq-turnkey-price", {
    uk: `Сайт для клініки під ключ — ${pr("medicine", "uk")}, фікс-ціна в договорі, запуск за ${TERM.uk}. Входить усе з пакета «Сайт для бізнесу» (до 5 сторінок, Sanity CMS, форми із заявками в Telegram, SEO-структура, аналітика, хостинг і SSL на рік, гарантія рік), плюс онлайн-запис з інтеграцією Helsi / Medesk і вимоги МОЗ та GDPR. Додаткові сторінки, друга мова, блог — фіксовані додатки, їх видно в калькуляторі. Мережа клінік — окремий проєкт, ${P.customUk}.`,
    ru: `Сайт для клиники под ключ — ${pr("medicine", "ru")}, фикс-цена в договоре, запуск за ${TERM.ru}. Входит всё из пакета «Сайт для бизнеса» (до 5 страниц, Sanity CMS, формы с заявками в Telegram, SEO-структура, аналитика, хостинг и SSL на год, гарантия год), плюс онлайн-запись с интеграцией Helsi / Medesk и требования МОЗ и GDPR. Дополнительные страницы, второй язык, блог — фиксированные дополнения, они есть в калькуляторе. Сеть клиник — отдельный проект, ${P.customRu}.`,
    en: `A clinic website costs ${pr("medicine", "en")}, fixed in the contract, live in ${TERM.en}. It includes everything in the Business website package (up to 5 pages, Sanity CMS, forms with instant alerts, SEO-ready structure, analytics, hosting and SSL for a year, one-year warranty), plus online booking and GDPR compliance. Extra pages, languages and a blog are fixed-price add-ons shown in the calculator. Multi-site groups are a separate project, ${P.customEn}.`,
  }],
  ["medicine", "sec14", "faq-medical-seo", {
    uk: `Так, у два кроки. Сам сайт будується SEO-ready: структура під «послуга + район», швидкість 90+, Schema.org MedicalOrganization, Google Business Profile і локальне SEO входять у ціну розробки, а рік технічної підтримки — у кожен пакет. Окрема SEO-кампанія після запуску (контент, посилання, робота з позиціями) — ${P.seoFrom.uk}; аудит наявного сайту клініки — безкоштовно.`,
    ru: `Да, в два шага. Сам сайт строится SEO-ready: структура под «услуга + район», скорость 90+, Schema.org MedicalOrganization, Google Business Profile и локальное SEO входят в цену разработки, а год технической поддержки — в каждый пакет. Отдельная SEO-кампания после запуска (контент, ссылки, работа с позициями) — ${P.seoFrom.ru}; аудит существующего сайта клиники — бесплатно.`,
    en: `Yes, in two steps. The site itself is built SEO-ready: a "service + area" structure, 90+ speed scores, MedicalOrganization schema, Google Business Profile and local SEO are part of the development price, with a year of technical support in every package. A separate SEO retainer after launch (content, links, rankings work) is ${P.seoFrom.en}; an audit of your current clinic site is free.`,
  }],
  ["auto", "aut-sec-66", "aut-fq-67", {
    uk: `Калькулятор із PDF-інвойсом — це галузевий модуль пакета для авто-бізнесу: ${pr("auto", "uk")} за ${TERM.uk}, разом з інтеграцією Copart. Окремо калькулятор не продаємо. Складніша логіка (кабінет дилера, складський облік) — окремий проєкт, ${P.customUk}.`,
    ru: `Калькулятор с PDF-инвойсом — это отраслевой модуль пакета для авто-бизнеса: ${pr("auto", "ru")} за ${TERM.ru}, вместе с интеграцией Copart. Отдельно калькулятор не продаём. Более сложная логика (кабинет дилера, складской учёт) — отдельный проект, ${P.customRu}.`,
    en: `A calculator with PDF invoices is the industry module of the automotive package: ${pr("auto", "en")} in ${TERM.en}, together with auction feeds. We don't sell the calculator on its own. Heavier logic (dealer accounts, stock management) is a separate project, ${P.customEn}.`,
  }],
  ["legal", "leg-sec-66", "leg-fq-77", {
    uk: `Базові структури і SEO-тексти пишемо ми — це входить у ціну. Юридичну редактуру робите ви: годину часу за весь проєкт. Якщо потрібен професійний копірайтинг з редактором та інтерв'ю — фіксований додаток ${P.copy.uk}.`,
    ru: `Базовые структуры и SEO-тексты пишем мы — это входит в цену. Юридическую редактуру делаете вы: час времени за весь проект. Если нужен профессиональный копирайтинг с редактором и интервью — фиксированное дополнение ${P.copy.uk}.`,
    en: `Base structure and SEO copy — we write it, and it's in the price. Legal review is on you: about 1 hour for the whole project. If you want professional copywriting with an editor and an interview, it's a fixed ${P.copy.en} add-on.`,
  }],
  ["legal", "leg-sec-66", "leg-fq-82", {
    uk: `Clio (міжнародний стандарт), MyCase (для адвокатських бюро), KeyCRM, AmoCRM, Bitrix24 (для УА-фірм). Інтеграція з CRM — фіксований додаток ${P.crm.uk}. Якщо у вас своя система з API — оцінимо в прорахунку і зафіксуємо ціну в договорі.`,
    ru: `Clio (международный стандарт), MyCase (для адвокатских бюро), KeyCRM, AmoCRM, Bitrix24 (для УА-фирм). Интеграция с CRM — фиксированное дополнение ${P.crm.uk}. Если у вас своя система с API — оценим в расчёте и зафиксируем цену в договоре.`,
    en: `Clio (international standard), LEAP and Actionstep (for UK firms), HubSpot, Pipedrive. A CRM integration is a fixed ${P.crm.en} add-on. If you run your own system with an API, we price it in the quote and fix it in the contract.`,
  }],
  ["legal", "leg-sec-66", "faq-solicitors", {
    uk: `Так — це наш основний формат: приватні адвокати, бюро на 2–10 юристів, нішеві практики. Сайт будується під довіру і заявки: сторінки під кожну практику, кейси, відгуки, форма конфіденційного звернення. ${pr("legal", "uk")} за ${TERM.uk}, з інтеграцією Diia.Sign.`,
    ru: `Да — это наш основной формат: частные адвокаты, бюро на 2–10 юристов, нишевые практики. Сайт строится под доверие и заявки: страницы под каждую практику, кейсы, отзывы, форма конфиденциального обращения. ${pr("legal", "ru")} за ${TERM.ru}, с интеграцией Diia.Sign.`,
    en: `Yes — that's our core format: sole practitioners, firms of 2–10 solicitors, niche practices. The site is built for trust and enquiries: a page per practice area, cases, reviews, a confidential enquiry form, SRA-aware copy. ${pr("legal", "en")}, live in ${TERM.en}.`,
  }],
  ["finance", "fin-sec-66", "fin-fq-72", {
    uk: `MEDoc, 1С/BAS, ifin (для українських клієнтів). Xero, QuickBooks, FreshBooks (для міжнародних). Інтеграція з MEDoc / BAS входить у галузеве рішення для бухгалтерів — ${pr("finance", "uk")} за ${TERM.uk}. Якщо у вас своя система — підключаємо, ціну фіксуємо в договорі.`,
    ru: `MEDoc, 1С/BAS, ifin (для украинских клиентов). Xero, QuickBooks, FreshBooks (для международных). Интеграция с MEDoc / BAS входит в отраслевое решение для бухгалтеров — ${pr("finance", "ru")} за ${TERM.ru}. Если у вас своя система — подключаем, цену фиксируем в договоре.`,
    en: `Xero, Sage, QuickBooks, FreeAgent, plus HMRC Making Tax Digital. An accounting-software integration is part of the finance package — ${pr("finance", "en")} in ${TERM.en}. If you use a different system, we connect it and fix the price in the contract.`,
  }],
  ["real-estate", "rea-sec-66", "rea-fq-67", {
    en: `Yes. It’s our property reference template. Customisation for your market (languages, currencies, regional specifics, property types, local CRMs) fits the estate-agent package — ${pr("real-estate", "en")} in ${TERM.en}. Complex work (new integrations, unique business logic) is a Custom project, ${P.customEn}.`,
  }],
  ["real-estate", "rea-sec-66", "rea-fq-72", {
    en: `Depends on the portal. In the UK, listings flow through Rightmove and Zoopla feeds, connected via their official accounts. OnTheMarket adds a third route. Each feed is priced in your quote and fixed in the contract. If you've no feed in place, you add properties manually via Sanity (5 min per property).`,
  }],
  ["renovation", "sec1i", "faq1j", {
    uk: `Сайт будівельної компанії — ${TERM.uk} від брифу до запуску. Складні проєкти з кабінетом клієнта чи ERP — від 6 тижнів. Строки фіксуються в договорі. Не встигаємо з нашої вини — неустойка 5% за кожен робочий день, до 30%.`,
    ru: `Сайт строительной компании — ${TERM.ru} от брифа до запуска. Сложные проекты с кабинетом клиента или ERP — от 6 недель. Сроки фиксируются в договоре. Не успеваем по нашей вине — неустойка 5% за каждый рабочий день, до 30%.`,
    en: `A contractor website takes ${TERM.en} from brief to launch. Complex builds with a client portal or ERP take from 6 weeks. Deadlines are written into the contract. If we miss them through our fault, we pay 5% per working day, up to 30%.`,
  }],
  ["renovation", "sec1i", "faq27", {
    uk: `Інтеграція з CRM (KeyCRM, HubSpot, Bitrix24) — ${P.crm.uk}. Онлайн-запис на замір / календар — ${P.booking.uk}. Калькулятор кошторису вже входить у пакет. Особистий кабінет клієнта чи ERP — окремий проєкт, ${P.customUk}; ціну даємо після технічного аудиту.`,
    ru: `Интеграция с CRM (KeyCRM, HubSpot, Bitrix24) — ${P.crm.uk}. Онлайн-запись на замер / календарь — ${P.booking.uk}. Калькулятор сметы уже входит в пакет. Личный кабинет клиента или ERP — отдельный проект, ${P.customRu}; цену даём после технического аудита.`,
    en: `CRM integration (HubSpot / Pipedrive / Salesforce): ${P.crm.en}. Online booking for site visits / a calendar: ${P.booking.en}. The quote calculator is already in the package. A client portal or ERP integration is a separate project, ${P.customEn}, priced after a technical audit.`,
  }],
  ["renovation", "sec1i", "faq2w", {
    uk: `Так. Кожна додаткова мова — фіксований додаток ${P.lang.uk}. Тексти адаптуємо за змістом, а не дослівно. Працюємо з реальними кейсами в Україні, Франції, Данії.`,
    ru: `Да. Каждый дополнительный язык — фиксированное дополнение ${P.lang.uk}. Тексты адаптируем по смыслу, а не дословно. Работаем с реальными кейсами в Украине, Франции, Дании.`,
    en: `Yes. Each additional language is a fixed ${P.lang.en} add-on. Copy is adapted for meaning, not translated word for word. We have real client projects shipping across the UK and Europe.`,
  }],
];

/* ── Виконання ──────────────────────────────────────────────────────── */
const SLUGS = ["medicine", "renovation", "legal", "finance", "auto", "real-estate"];
const docs = await client.fetch(
  `*[_type == "industryPage" && slug.current in $slugs && !(_id in path("drafts.**"))]`,
  { slugs: SLUGS },
);
const bySlug = Object.fromEntries(docs.map((d) => [d.slug.current, d]));
for (const s of SLUGS) if (!bySlug[s]) throw new Error(`немає опублікованого industryPage ${s}`);

/** Мінімальний резолвер шляхів виду a.b[_key=="x"].c */
function get(obj, path) {
  let cur = obj;
  for (const part of path.match(/[^.[\]]+|\[_key=="[^"]+"\]/g)) {
    if (cur == null) return undefined;
    const m = part.match(/^\[_key=="([^"]+)"\]$/);
    cur = m ? (Array.isArray(cur) ? cur.find((x) => x?._key === m[1]) : undefined) : cur[part];
  }
  return cur;
}

const plain = (blocks) =>
  (blocks ?? []).map((b) => (b.children ?? []).map((c) => c.text).join("")).join("\n\n");
const block = (text) => [
  {
    _type: "block",
    _key: randomUUID().replace(/-/g, "").slice(0, 12),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: randomUUID().replace(/-/g, "").slice(0, 12), text, marks: [] }],
  },
];

/** slug → { set: {path: value}, log: [] } */
const plan = Object.fromEntries(SLUGS.map((s) => [s, { set: {}, log: [] }]));

for (const [slug, base, locales, mk] of STRING_EDITS) {
  for (const l of locales) {
    const path = `${base}.${l}`;
    const cur = get(bySlug[slug], path);
    if (typeof cur !== "string") {
      plan[slug].log.push(`  ! ${path}: немає рядка — пропуск`);
      continue;
    }
    const next = mk(l)(cur);
    if (next === cur) continue;
    plan[slug].set[path] = next;
    plan[slug].log.push(`  ${path}\n    - ${cur}\n    + ${next}`);
  }
}

for (const [slug, sec, item, texts] of FAQ_EDITS) {
  for (const [l, text] of Object.entries(texts)) {
    const path = `sections[_key=="${sec}"].items[_key=="${item}"].answer.${l}`;
    const cur = get(bySlug[slug], path);
    if (!Array.isArray(cur)) {
      plan[slug].log.push(`  ! ${path}: немає відповіді — пропуск`);
      continue;
    }
    if (plain(cur) === text) continue;
    if (cur.some((b) => (b.markDefs ?? []).length)) {
      plan[slug].log.push(`  ! ${path}: мала посилання/marks — буде замінено простим текстом`);
    }
    plan[slug].set[path] = block(text);
    plan[slug].log.push(`  ${path} (FAQ)\n    - ${plain(cur)}\n    + ${text}`);
  }
}

let total = 0;
for (const s of SLUGS) {
  const n = Object.keys(plan[s].set).length;
  total += n;
  console.log(`\n== ${s} (${bySlug[s]._id}): ${n} змін`);
  for (const line of plan[s].log) console.log(line);
}
console.log(`\nУсього полів: ${total}`);

if (!APPLY) {
  console.log("\nDry-run. Запис: додайте --apply");
  process.exit(0);
}
if (!total) process.exit(0);

const here = dirname(fileURLToPath(import.meta.url));
const backupDir = join(here, "..", "..", "backups", "productized-2026-09");
mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = join(backupDir, `industries-${stamp}.json`);
writeFileSync(backupFile, JSON.stringify(docs, null, 2));
console.log(`\nБекап: ${backupFile}`);

const tx = client.transaction();
for (const s of SLUGS) {
  if (Object.keys(plan[s].set).length) tx.patch(bySlug[s]._id, (p) => p.set(plan[s].set));
}
const res = await tx.commit();
console.log(`Записано: транзакція ${res.transactionId}`);
