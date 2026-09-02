/**
 * Приводить calculatorConfig у відповідність до тарифної картки.
 *
 * Проблема, яку це закриває. Картка «Корпоративний сайт — $2 500»
 * (frontend: src/content/{uk,ru,en}/homepage.ts) обіцяє всередині ціни
 * «CMS, блог», «5+ інтеграцій» і «Багатомовність». Калькулятор за те саме
 * брав окремо: блог 400 + кейси 350 + SEO блогу 400, друга мова +15%,
 * сповіщення і аналітика ще 1 950. Один і той самий бриф виходив
 * $2 500 на картці і $4 200 у калькуляторі — розрив 68%, а на EN
 * £3 500 проти £5 350.
 *
 * Рішення власника від 01.09.2026: опустити калькулятор до картки.
 * Усе, що картка обіцяє, коштує 0; платним лишається те, чого картка
 * ніколи не обіцяла (оплата, CRM) і важче — кабінет, фільтри, бронювання,
 * завантаження файлів — рахується в брифі.
 *
 * Прод читає ці ціни звідси, а не з констант фронтенду, тому без цього
 * скрипта правки в репозиторії на сайт не потраплять.
 *
 * Запуск:
 *   node scripts/calculator-2026-09-01/align-with-tier-card.mjs          // dry-run
 *   node scripts/calculator-2026-09-01/align-with-tier-card.mjs --apply  // запис
 *
 * Бекап документа пишеться в backups/ перед кожним записом.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const APPLY = process.argv.includes("--apply");
const token =
  process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && APPLY) throw new Error("нужен SANITY_WRITE_TOKEN для --apply");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

const DOC_ID = "calculatorConfig";

/** percent -> нове значення. Дві мови входять у тариф. */
const LANGUAGES = { two: 0, three: 0.1, fourPlus: 0.2 };

/** optionKey, що стають included: price 0. */
const FREE = {
  cmsUpgrades: ["blogSystem", "caseSystem", "teamServices"],
  seoOptions: ["blogSeoSetup"],
  features: [
    "leadForm",
    "email",
    "telegram",
    "analytics",
    "adsTracking",
    "mapBasic",
    "cookie",
  ],
};

const changes = [];

const freeUp = (field) => (item) => {
  if (!FREE[field].includes(item.optionKey)) return item;
  if (item.price === 0 && item.included === true) return item;
  changes.push({
    field,
    key: item.optionKey,
    from: `${item.price} / included=${item.included ?? false}`,
    to: "0 / included=true",
  });
  return { ...item, price: 0, included: true };
};

const relanguage = (item) => {
  const next = LANGUAGES[item.optionKey];
  if (next === undefined || item.percent === next) return item;
  changes.push({
    field: "languages",
    key: item.optionKey,
    from: `${Math.round(item.percent * 100)}%`,
    to: `${Math.round(next * 100)}%`,
  });
  return { ...item, percent: next };
};

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`документа ${DOC_ID} немає в production`);

const patched = {
  languages: (doc.languages ?? []).map(relanguage),
  cmsUpgrades: (doc.cmsUpgrades ?? []).map(freeUp("cmsUpgrades")),
  seoOptions: (doc.seoOptions ?? []).map(freeUp("seoOptions")),
  features: (doc.features ?? []).map(freeUp("features")),
};

if (!changes.length) {
  console.log("Змін немає — документ уже відповідає тарифній картці.");
  process.exit(0);
}

console.log(`${DOC_ID}: ${changes.length} змін\n`);
for (const c of changes) {
  console.log(
    `  ${c.field.padEnd(12)} ${c.key.padEnd(16)} ${c.from.padEnd(24)} -> ${c.to}`,
  );
}

const stillPaid = [
  ...patched.cmsUpgrades,
  ...patched.seoOptions,
  ...patched.features,
].filter((o) => o.price > 0);
console.log(
  `\nЛишається платним: ${stillPaid.map((o) => `${o.optionKey} ${o.price}`).join(", ")}`,
);

if (!APPLY) {
  console.log("\nDRY-RUN. Нічого не записано. Для запису — прапорець --apply.");
  process.exit(0);
}

const dir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "backups",
  "calculator-2026-09-01",
);
mkdirSync(dir, { recursive: true });
const backup = join(dir, `${DOC_ID}.before.json`);
writeFileSync(backup, JSON.stringify(doc, null, 2), "utf8");
console.log(`\nБекап: ${backup}`);

await client.patch(DOC_ID).set(patched).commit();
console.log("Записано.");
