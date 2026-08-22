/**
 * SEO round 2 — RU metadata for the eight industryPage documents.
 *
 * Round 1 patched `seo.title.uk` / `seo.description.uk` (and later `.en`),
 * but never `.ru`, so /ru/sites-for/* still served the original strings:
 * titles 72–82 chars and descriptions 176–231, all outside the 30–65 /
 * 120–165 acceptance bounds.
 *
 * This is metadata only — no RU page structure, copy or routing is touched,
 * per the round-2 guardrail on the RU tree.
 *
 * Usage (admin repo root):
 *   node scripts/seo-aug-2026/patch-industry-seo-ru.mjs --dry-run
 *   node scripts/seo-aug-2026/patch-industry-seo-ru.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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

/** slug -> { title.ru (30–65), description.ru (120–165) } */
const RU_META = {
  medicine: {
    title: "Создание медицинских сайтов под ключ | Code-Site.Art",
    description:
      "➤ Сайты для клиник, стоматологий и медицинских центров ✔️ Онлайн-запись ✔️ Защита данных пациентов ✔️ Запуск за 4–6 недель ➡ Бесплатный расчёт.",
  },
  renovation: {
    title: "Разработка сайта для строительной компании | Code-Site.Art",
    description:
      "➤ Сайты для строительных и ремонтных компаний ✔️ Калькулятор сметы ✔️ Галерея «до/после» ✔️ Локальное SEO по вашему городу ➡ Бесплатный расчёт.",
  },
  legal: {
    title: "Создание сайта для юридической фирмы | Code-Site.Art",
    description:
      "➤ Сайты для юристов и адвокатов ✔️ Структура под практики ✔️ Интеграция Google Reviews ✔️ Запуск за 4–8 недель ➡ Бесплатная консультация.",
  },
  finance: {
    title: "Сайт для финансовой компании и бухгалтера | Code-Site.Art",
    description:
      "➤ Сайты для бухгалтеров и финансовых консультантов ✔️ Доверие с первого экрана ✔️ Защита данных клиентов ✔️ Запуск за 4 недели ➡ Бесплатный расчёт.",
  },
  ecommerce: {
    title: "Создание интернет-магазина под ключ | Code-Site.Art",
    description:
      "➤ Кастомные интернет-магазины на Next.js ✔️ Оплата Stripe ✔️ Интеграция с CRM ✔️ Быстрый checkout без подписок платформ ➡ Бесплатный расчёт.",
  },
  auto: {
    title: "Разработка сайта автосервиса и автосалона | Code-Site.Art",
    description:
      "➤ Сайты для автосалонов, автосервисов и СТО ✔️ Каталог авто ✔️ Калькулятор доставки ✔️ Онлайн-запись ➡ Бесплатный расчёт для автобизнеса.",
  },
  "real-estate": {
    title: "Создание сайта недвижимости — каталог и заявки | Code-Site.Art",
    description:
      "➤ Сайты для агентств недвижимости и застройщиков ✔️ Каталог объектов с фильтрами и картой ✔️ Мультиязычность ✔️ Фикс-цена ➡ Бесплатный расчёт.",
  },
  courses: {
    title: "Создание сайта для онлайн-курсов под ключ | Code-Site.Art",
    description:
      "➤ Сайты для онлайн-курсов и образовательных проектов ✔️ Оплата через Stripe ✔️ Автоматическая выдача доступа ✔️ Фикс-цена ➡ Консультация бесплатно.",
  },
};

for (const [slug, m] of Object.entries(RU_META)) {
  if (m.title.length < 30 || m.title.length > 65)
    throw new Error(`title.ru ${m.title.length} out of 30-65 for ${slug}`);
  if (m.description.length < 120 || m.description.length > 165)
    throw new Error(`description.ru ${m.description.length} out of 120-165 for ${slug}`);
}

const docs = await client.fetch(
  `*[_type=="industryPage" && slug.current in $slugs]{_id, "slug": slug.current, seo}`,
  { slugs: Object.keys(RU_META) },
);
if (docs.length !== 8) throw new Error(`expected 8 industryPage docs, got ${docs.length}`);

const backupDir = join(ROOT, "backups", "seo-round-2");
mkdirSync(backupDir, { recursive: true });

let tx = client.transaction();
for (const d of docs) {
  const m = RU_META[d.slug];
  writeFileSync(
    join(backupDir, `industryPage-ru-${d.slug}.json`),
    JSON.stringify(d, null, 2),
    "utf8",
  );
  console.log(
    `${d.slug.padEnd(13)} title.ru ${String(d.seo?.title?.ru?.length ?? 0).padStart(3)} -> ${m.title.length}, description.ru ${String(d.seo?.description?.ru?.length ?? 0).padStart(3)} -> ${m.description.length}`,
  );
  tx = tx.patch(d._id, (p) =>
    p.set({ "seo.title.ru": m.title, "seo.description.ru": m.description }),
  );
}

if (DRY) {
  console.log("\n--dry-run: no mutations sent");
  process.exit(0);
}
const res = await tx.commit();
console.log("\ncommitted:", res.transactionId);
