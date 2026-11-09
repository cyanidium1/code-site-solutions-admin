/**
 * Кейс Domlivo: карточка в портфолио продаёт результатом, а не перечнем фич
 * (Федир, голосом 10.11.2026). Было «5 мов · 4 міста · 5 типів нерухомості ·
 * 11 параметрів фільтрів» — цифры устарели (языков уже 8) и ничего не говорят
 * о результате. Становится «6 300 відвідувань за 30 днів · 77 заявок за
 * жовтень · 8 мов». Источники цифр: domlivo-workspace/knowledge/
 * analytics-data/domlivo-checkups/2026-11-06.md (Clarity 6 319 сессий за
 * 30 дней, боты отсечены; 6 319 → «6 300», округление вниз) и
 * domlivo-weekly/2026-11-09.md (77 заявок за октябрь, включая клики в
 * WhatsApp/Telegram — поэтому «заявок», не «продаж»).
 * Заодно обновляется seo.description кейса — там те же «5 мов і валюти».
 *
 * Usage: node scripts/domlivo-card-2026-11/update-card-results.mjs --dry-run
 *        node scripts/domlivo-card-2026-11/update-card-results.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const DRY = process.argv.includes("--dry-run");

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const metricsLine = {
  uk: "6 300 відвідувань за 30 днів · 77 заявок за жовтень · 8 мов",
  ru: "6 300 посещений за 30 дней · 77 заявок за октябрь · 8 языков",
  en: "6,300 visits in 30 days · 77 enquiries in October · 8 languages",
};

const seoDescription = {
  _type: "localizedString",
  uk: "Платформа нерухомості Domlivo: 6 300 відвідувань за 30 днів без реклами, 77 заявок за жовтень, 8 мов, каталог з картою і AI-пошук. Кейс Code-Site.Art.",
  ru: "Платформа недвижимости Domlivo: 6 300 посещений за 30 дней без рекламы, 77 заявок за октябрь, 8 языков, каталог с картой и AI-поиск. Кейс Code-Site.Art.",
  en: "Domlivo property platform: 6,300 visits in 30 days with zero ads, 77 enquiries in October, 8 languages, a catalogue with map and AI search. A Code-Site.Art case study.",
};

const doc = await client.fetch('*[_type=="caseStudy" && slug.current=="domlivo"][0]{_id,metricsLine,seo}');
if (!doc?._id) {
  console.error("caseStudy domlivo not found");
  process.exit(1);
}

const backupDir = join(HERE, "backups");
mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
writeFileSync(join(backupDir, `caseStudy-domlivo-${stamp}.json`), JSON.stringify(doc, null, 2));
console.log("was metricsLine:", JSON.stringify(doc.metricsLine, null, 1));
console.log("new metricsLine:", JSON.stringify(metricsLine, null, 1));

if (DRY) {
  console.log("[dry-run] no writes");
  process.exit(0);
}

await client
  .patch(doc._id)
  .set({ metricsLine, "seo.description": seoDescription })
  .commit();
console.log("patched", doc._id);
