/**
 * IceLab — перевести метрики кейса с 28-дневного окна на трёхмесячное,
 * чтобы цифры совпадали с приложенными скриншотами Search Console.
 *
 * Было (28 дней):  212 переходов · 3,67 тыс. показов · CTR 5,8% · позиция 2
 * Стало (3 месяца): 267 переходов · 4,48 тыс. показов · CTR 6%   · позиция 2,1
 *
 * Позиция подписана в ЕДИНСТВЕННОМ числе — «за коммерческим запросом», а не
 * «по коммерческим запросам». Доказательство под блоком метрик — один
 * отфильтрованный запрос («купить сухой лёд Харьков», позиция 2,1). Подпись
 * должна описывать ровно то, что видно на скрине, иначе первый же человек,
 * который откроет картинку, поймает нас на расхождении.
 *
 * Usage (из корня admin-репо):
 *   node scripts/geo-cluster/patch-icelab-metrics-3m.mjs --dry-run
 *   node scripts/geo-cluster/patch-icelab-metrics-3m.mjs
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

const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: TOKEN,
  useCdn: false,
});

const METRICS_LINE = {
  _type: "localizedString",
  uk: "267 переходів із Google · CTR 6% · позиція 2,1 за комерційним запитом",
  ru: "267 переходов из Google · CTR 6% · позиция 2,1 по коммерческому запросу",
  en: "267 Google clicks · 6% CTR · position 2.1 on a commercial query",
};

const STATS = {
  "icl-m-1": {
    value: { en: "267", ru: "267", uk: "267" },
    label: {
      en: "Google clicks in 3 months",
      ru: "переходов из Google за 3 месяца",
      uk: "переходів із Google за 3 місяці",
    },
  },
  "icl-m-2": {
    value: { en: "4.48k", ru: "4,48 тыс.", uk: "4,48 тис." },
    label: {
      en: "search impressions",
      ru: "показов в поиске",
      uk: "показів у пошуку",
    },
  },
  "icl-m-3": {
    value: { en: "6%", ru: "6%", uk: "6%" },
    label: { en: "average CTR", ru: "средний CTR", uk: "середній CTR" },
  },
  "icl-m-4": {
    value: { en: "2.1", ru: "2,1", uk: "2,1" },
    label: {
      en: "Google position on a commercial query",
      ru: "позиция в Google по коммерческому запросу",
      uk: "позиція в Google за комерційним запитом",
    },
  },
};

async function main() {
  if (!TOKEN && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");
  console.log(DRY ? "DRY RUN — ничего не пишем\n" : "ЗАПИСЬ в production\n");

  const doc = await client.fetch(`*[_type == "caseStudy" && slug.current == "icelab"][0]`);
  if (!doc) throw new Error("кейс icelab не найден");

  const statsIdx = doc.sections.findIndex((s) => s._type === "statsBlock");
  if (statsIdx === -1) throw new Error("statsBlock не найден");

  console.log("metricsLine");
  console.log(`  было:  ${doc.metricsLine?.uk}`);
  console.log(`  стало: ${METRICS_LINE.uk}`);
  console.log("\nstatsBlock");

  const items = doc.sections[statsIdx].items.map((it) => {
    const next = STATS[it._key];
    if (!next) {
      console.log(`  ${it._key}: без изменений`);
      return it;
    }
    console.log(`  ${it._key}: ${it.value.uk} (${it.label.uk})`);
    console.log(`          -> ${next.value.uk} (${next.label.uk})`);
    return {
      ...it,
      value: { ...it.value, ...next.value },
      label: { ...it.label, ...next.label },
    };
  });

  if (DRY) {
    console.log("\nDry run завершён — документ не изменён.");
    return;
  }

  const backupDir = join(ROOT, "backups", "icelab-metrics-3m-2026-08-23");
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(join(backupDir, "caseStudy-icelab.json"), JSON.stringify(doc, null, 2), "utf8");
  console.log(`\nбэкап: ${backupDir}`);

  const sections = [...doc.sections];
  sections[statsIdx] = { ...sections[statsIdx], items };

  await client.patch(doc._id).set({ metricsLine: METRICS_LINE, sections }).commit();
  console.log("готово. Проверьте /portfolio/icelab — ISR обновится в течение часа.");
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
