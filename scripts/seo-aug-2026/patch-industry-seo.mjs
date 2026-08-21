/**
 * SEO overhaul (Aug 2026) — industryPage uk-field patches.
 *
 * Phase 1: /sites-for/medicine title/description/H1/lede/H2s/FAQ.
 * Phase 2: keyword titles + H1s on the other seven industry pages,
 * anchored to real GSC queries. Only `uk` locale fields are touched;
 * ru/en stay as they are.
 *
 * Backs up every affected document to backups/seo-aug-2026/ before
 * patching. Run with --dry-run to preview the mutation payload.
 *
 * Usage (from the admin repo root):
 *   node scripts/seo-aug-2026/patch-industry-seo.mjs --dry-run
 *   node scripts/seo-aug-2026/patch-industry-seo.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DRY = process.argv.includes("--dry-run");

// Same env loading order as scripts/seed-*.ts (no dotenv dep).
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
if (!TOKEN) throw new Error("SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: TOKEN,
  useCdn: false,
});

const IDS = {
  medicine: "6tWqPRZWZzG4Lv3HK7JkzS",
  auto: "6tWqPRZWZzG4Lv3HK7Jkoz",
  courses: "DHIwRDN3sEoI638qoYRvTT",
  ecommerce: "DHIwRDN3sEoI638qoYRvv5",
  legal: "DHIwRDN3sEoI638qoYRwQ9",
  finance: "lOTgaDd8FU4wgJ8F4KCGuB",
  "real-estate": "lOTgaDd8FU4wgJ8F4KCHLf",
  renovation: "lOTgaDd8FU4wgJ8F4KCHn9",
};

/* ── backup ─────────────────────────────────────────────────────────────── */
const backupDir = join(ROOT, "backups", "seo-aug-2026");
mkdirSync(backupDir, { recursive: true });
const docs = await client.fetch(`*[_id in $ids]`, { ids: Object.values(IDS) });
if (docs.length !== 8) throw new Error(`expected 8 docs, got ${docs.length}`);
for (const d of docs) {
  const slug = d.slug?.current ?? d._id;
  writeFileSync(
    join(backupDir, `industryPage-${slug}.json`),
    JSON.stringify(d, null, 2),
    "utf8",
  );
}
console.log(`backed up ${docs.length} docs to backups/seo-aug-2026/`);

const bySlug = Object.fromEntries(docs.map((d) => [d.slug.current, d]));

/* ── medicine FAQ: rename cost question, reword answer, reorder ─────────── */
const medFaq = bySlug.medicine.sections.find((s) => s._type === "faqBlock");
const items = [...medFaq.items];
const costIdx = items.findIndex((i) => i._key === "faq-turnkey-price");
if (costIdx === -1) throw new Error("faq-turnkey-price not found");
const cost = structuredClone(items[costIdx]);
cost.question = { ...cost.question, uk: "Скільки коштує сайт для клініки?" };
cost.answer = {
  ...cost.answer,
  uk: [
    {
      _key: "cw09e",
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [
        {
          _key: "cw09f",
          _type: "span",
          marks: [],
          text: "Створення сайту клініки під замовлення (не з шаблону) — від $3,500 за базовий: до 8 сторінок, онлайн-запис, каталог лікарів, прайс, запуск за 4 тижні. Розширений із блогом, ДМС-інтеграцією і медичною CRM — від $6,500. Мережа клінік — від $12,000. У ціну входить все: дизайн, тексти, верстка, запуск і рік підтримки. Сума фіксується в договорі до старту.",
        },
      ],
    },
  ],
};
// Move the cost question into the SSR-visible top 5 (FAQ renders 5 before
// the client-side "show more").
items.splice(costIdx, 1);
items.splice(1, 0, cost);

/* ── patches ────────────────────────────────────────────────────────────── */
const PATCHES = [
  {
    slug: "medicine",
    set: {
      "seo.title.uk": "Створення медичних сайтів під ключ | Code-Site.Art",
      "seo.description.uk":
        "➤ Створення та розробка медичних сайтів для клінік, стоматологій і медичних центрів ✔️ Онлайн-запис ✔️ Захист даних ✔️ Lighthouse 98+ ➡ Безкоштовний прорахунок.",
      "hero.heading.uk":
        "Створення медичних сайтів\n*для клінік, стоматологій і медичних центрів*",
      "hero.lede.uk":
        "Клініка, до якої записуються: створення сайту для клініки, стоматології чи діагностичного центру — з онлайн-записом і захистом даних пацієнтів. Запуск за *4–6 тижнів*, гарантія 1 рік.",
      'sections[_key=="sec2m"].heading.uk': "Розробка медичних сайтів\n*під ключ*",
      'sections[_key=="sec27"].heading.uk':
        "Послуги створення сайтів для медицини: почніть із безкоштовного розбору вашого сайту",
      'sections[_key=="sec14"].items': items,
    },
  },
  {
    slug: "auto",
    set: {
      "seo.title.uk": "Розробка сайту автосервісу й автосалону | Code-Site.Art",
      "seo.description.uk":
        "➤ Сайти для автосалонів, автосервісів і СТО ✔️ Каталог авто ✔️ Калькулятор доставки ✔️ Онлайн-запис ➡ Безкоштовний прорахунок для автобізнесу.",
      "hero.heading.uk":
        "Створення сайту для автосервісу,\nде клієнт сам *рахує ціну*",
    },
  },
  {
    slug: "renovation",
    set: {
      "seo.title.uk":
        "Розробка сайту для будівельної компанії під ключ | Code-Site.Art",
      "seo.description.uk":
        "➤ Сайти для будівельних і ремонтних компаній ✔️ Калькулятор кошторису ✔️ Галерея «до/після» ✔️ Локальне SEO під ваше місто ➡ Безкоштовний прорахунок.",
      "hero.heading.uk":
        "Сайт для будівельної компанії,\nякий *приводить заявки*",
      "hero.lede.uk":
        "Ремонтна компанія, до якої записуються: розробка сайту для будівельної фірми чи підрядника — калькулятор ціни, галерея *«до/після»*, локальне SEO. Запуск за 4–6 тижнів, гарантія 1 рік.",
      'sections[_key=="sec16"].heading.uk':
        "Розробка сайтів на WordPress для будівельних компаній\nчи кастомний код — що вигідніше",
    },
  },
  {
    slug: "legal",
    set: {
      "seo.title.uk":
        "Створення сайту для юридичної фірми під ключ | Code-Site.Art",
      "seo.description.uk":
        "➤ Створення сайтів для юристів і адвокатів ✔️ Структура під практики ✔️ Інтеграція Google Reviews ✔️ Запуск за 4–8 тижнів ➡ Безкоштовна консультація.",
      "hero.heading.uk": "Сайт під ключ для адвоката\nі юридичної фірми",
      "hero.lede.uk":
        "Юридична фірма, до якої звертаються: розробка сайту для юриста, де структуру і контент будували навколо клієнта, а не юриста. Тексти пишемо ми, юридичну редактуру робите за 1 годину. Запуск за 4–8 тижнів — і клієнти знаходять вас через Google по *конкретних запитах*.",
    },
  },
  {
    slug: "real-estate",
    set: {
      "seo.title.uk":
        "Створення сайту нерухомості — каталог і заявки | Code-Site.Art",
      "seo.description.uk":
        "➤ Сайти для агенцій нерухомості й забудовників ✔️ Каталог обʼєктів із фільтрами і картою ✔️ Мультимовність ✔️ Фікс-ціна ➡ Безкоштовний прорахунок.",
      "hero.heading.uk":
        "Сайт для агентства нерухомості, який презентує об’єкти і приводить заявки",
    },
  },
  {
    slug: "finance",
    set: {
      "seo.title.uk":
        "Сайт для фінансової компанії та бухгалтера | Code-Site.Art",
      "seo.description.uk":
        "➤ Сайти для бухгалтерів і фінансових консультантів ✔️ Довіра з першого екрана ✔️ Захист даних клієнтів ✔️ Запуск за 4 тижні ➡ Безкоштовний прорахунок.",
      "hero.lede.uk":
        "Розробляємо сайти для бухгалтерських, фінансових і консалтингових компаній, де важливо швидко сформувати довіру, пояснити складні послуги простими словами та привести користувача до заявки. Робимо і компактний лендінг для бухгалтерських послуг — коли потрібна одна сторінка, а не портал.",
    },
  },
  {
    slug: "courses",
    set: {
      "seo.title.uk":
        "Створення сайту для онлайн-курсів під ключ | Code-Site.Art",
      "seo.description.uk":
        "➤ Сайти для онлайн-курсів і освітніх проєктів ✔️ Оплата через Stripe ✔️ Автоматична видача доступу до курсу ✔️ Фікс-ціна ➡ Безкоштовна консультація.",
      "hero.heading.uk":
        "Створення сайту для онлайн-курсів: від програми до оплати й доступу",
    },
  },
  {
    slug: "ecommerce",
    set: {
      "seo.title.uk":
        "Створення інтернет-магазину під ключ на Next.js | Code-Site.Art",
      "seo.description.uk":
        "➤ Кастомні інтернет-магазини на Next.js ✔️ Оплати Stripe ✔️ Інтеграція з CRM ✔️ Швидкий checkout без підписок платформ ➡ Безкоштовний прорахунок.",
      "hero.heading.uk":
        "Створення інтернет-магазину під ключ,\nякий *продає* щодня",
    },
  },
];

/* EN metadata only (the EN service pages stay content-frozen per the SEO
   task; titles were 66-85 chars and descriptions 166-191 — out of range). */
const EN_META = {
  medicine: {
    "seo.title.en": "Medical Website Design for Clinics & Dentists | Code-Site.Art",
    "seo.description.en":
      "➤ Custom websites for clinics, dental practices and medical centres ✔️ Online booking ✔️ Patient-data protection ➡ Free project estimate.",
  },
  renovation: {
    "seo.title.en": "Websites for Builders and Renovation Companies | Code-Site.Art",
    "seo.description.en":
      "➤ Custom websites for builders and renovation firms ✔️ Quote calculator ✔️ Before/after gallery ✔️ Local SEO ➡ Free project estimate.",
  },
  legal: {
    "seo.title.en": "Websites for Law Firms and Solicitors | Code-Site.Art",
    "seo.description.en":
      "➤ Custom websites for solicitors and law firms ✔️ Practice-area architecture ✔️ Review integration ✔️ Launch in 4–8 weeks ➡ Free consultation.",
  },
  finance: {
    "seo.title.en": "Websites for Accountants and Finance Firms | Code-Site.Art",
    "seo.description.en":
      "➤ Custom websites for accountants and financial advisers ✔️ Trust-first design ✔️ Data protection ✔️ Launch in 4 weeks ➡ Free project estimate.",
  },
  ecommerce: {
    "seo.title.en": "Custom E-commerce Development on Next.js | Code-Site.Art",
    "seo.description.en":
      "➤ Custom online stores on Next.js ✔️ Stripe payments ✔️ CRM integration ✔️ Fast checkout with no platform subscriptions ➡ Free project estimate.",
  },
  auto: {
    "seo.title.en": "Websites for Car Dealers and Garages | Code-Site.Art",
    "seo.description.en":
      "➤ Custom websites for dealerships, garages and MOT centres ✔️ Vehicle catalogue ✔️ Online booking ✔️ Mobile-first ➡ Free project estimate.",
  },
  "real-estate": {
    "seo.title.en": "Real Estate Website Development | Code-Site.Art",
    "seo.description.en":
      "➤ Custom websites for estate agencies and developers ✔️ Property catalogue with filters ✔️ Multi-language ✔️ Fixed price ➡ Free project estimate.",
  },
  courses: {
    "seo.title.en": "Websites for Online Courses and Creators | Code-Site.Art",
    "seo.description.en":
      "➤ Custom websites for online courses and education projects ✔️ Stripe payments ✔️ Automated access delivery ✔️ Fixed price ➡ Free consultation.",
  },
};
for (const p of PATCHES) {
  Object.assign(p.set, EN_META[p.slug] ?? {});
}

for (const p of PATCHES) {
  for (const key of ["seo.title.uk", "seo.title.en"]) {
    const t = p.set[key];
    if (t && (t.length < 30 || t.length > 65)) {
      throw new Error(`${key} length ${t.length} out of 30-65 for ${p.slug}: ${t}`);
    }
  }
  for (const key of ["seo.description.uk", "seo.description.en"]) {
    const d = p.set[key];
    if (d && (d.length < 120 || d.length > 165)) {
      throw new Error(`${key} length ${d.length} out of 120-165 for ${p.slug}: ${d}`);
    }
  }
}

if (DRY) {
  console.log(JSON.stringify(PATCHES, null, 2).slice(0, 3000));
  console.log("\n--dry-run: no mutations sent");
  process.exit(0);
}

let tx = client.transaction();
for (const p of PATCHES) {
  tx = tx.patch(IDS[p.slug], (patch) => patch.set(p.set));
}
const res = await tx.commit();
console.log("committed transaction:", res.transactionId);
