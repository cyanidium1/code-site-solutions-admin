/**
 * IceLab case study — restate the search result as "position 2 for
 * commercial queries" instead of "average position 8.3".
 *
 * Requested by the site owner: 8.3 was the average across every query the
 * site is seen for (including informational long-tail), which understates
 * the commercial outcome. The figure that matters to a buyer is the rank
 * on commercial queries, which is 2.
 *
 * Every occurrence is REWRITTEN rather than number-swapped: several
 * sentences explained what "average 8.3" meant ("pages already sit on the
 * first page"), and that reasoning does not survive a digit change.
 *
 * Usage (admin repo root):
 *   node scripts/seo-aug-2026/patch-icelab-position.mjs --dry-run
 *   node scripts/seo-aug-2026/patch-icelab-position.mjs
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

/** Exact string replacements, applied wherever they occur in the document. */
const REPLACEMENTS = [
  // hero heading
  [
    "IceLab - a dry ice online store with an *average Google position of 8.3*",
    "IceLab - a dry ice online store ranking *2nd for commercial queries*",
  ],
  [
    "IceLab — интернет-магазин сухого льда со *средней позицией 8,3* в Google",
    "IceLab — интернет-магазин сухого льда с *позицией 2* по коммерческим запросам",
  ],
  [
    "IceLab — інтернет-магазин сухого льоду із *середньою позицією 8,3* у Google",
    "IceLab — інтернет-магазин сухого льоду з *позицією 2* за комерційними запитами",
  ],
  // hero lede
  [
    "attracts new audience from Google: 212 clicks, 3.67k impressions and an average position of 8.3 in 28 days.",
    "attracts new audience from Google: 212 clicks, 3.67k impressions in 28 days and position 2 for commercial queries.",
  ],
  [
    "привлекает аудиторию из Google: за 28 дней — 212 переходов, 3,67 тыс. показов и средняя позиция 8,3.",
    "привлекает аудиторию из Google: за 28 дней — 212 переходов, 3,67 тыс. показов и позиция 2 по коммерческим запросам.",
  ],
  [
    "залучає аудиторію з Google: за 28 днів — 212 переходів, 3,67 тис. показів і середня позиція 8,3.",
    "залучає аудиторію з Google: за 28 днів — 212 переходів, 3,67 тис. показів і позиція 2 за комерційними запитами.",
  ],
  // metricsLine (portfolio cards)
  ["212 Google clicks · 5.8% CTR · position 8.3", "212 Google clicks · 5.8% CTR · position 2 on commercial queries"],
  ["212 переходов из Google · CTR 5,8% · позиция 8,3", "212 переходов из Google · CTR 5,8% · позиция 2 по коммерческим запросам"],
  ["212 переходів із Google · CTR 5,8% · позиція 8,3", "212 переходів із Google · CTR 5,8% · позиція 2 за комерційними запитами"],
  // stats block: value + label
  ["average Google position", "Google position, commercial queries"],
  ["средняя позиция в Google", "позиция в Google по коммерческим запросам"],
  ["середня позиція в Google", "позиція в Google за комерційними запитами"],
  // analysis paragraph — the reasoning is rewritten, not just the number
  [
    "An average position of 8.3 means IceLab pages already sit on the first page of Google: the company is seen by people deliberately searching for dry ice, thermoboxes, wholesale supply and delivery in their city.",
    "Position 2 on commercial queries means IceLab sits at the top of the first page exactly where buying intent is: people deliberately searching for dry ice, thermoboxes, wholesale supply and delivery in their city.",
  ],
  [
    "Средняя позиция 8,3 означает, что страницы IceLab в среднем уже на первой странице Google: компанию видят люди, которые целенаправленно ищут сухой лёд, термобоксы, оптовые поставки и доставку в своём городе.",
    "Позиция 2 по коммерческим запросам означает, что IceLab стоит в самом верху первой страницы Google там, где есть намерение купить: компанию видят люди, которые целенаправленно ищут сухой лёд, термобоксы, оптовые поставки и доставку в своём городе.",
  ],
  [
    "Середня позиція 8,3 означає, що сторінки IceLab у середньому вже на першій сторінці Google: компанію бачать люди, які цілеспрямовано шукають сухий лід, термобокси, оптові поставки та доставку у своєму місті.",
    "Позиція 2 за комерційними запитами означає, що IceLab стоїть у самому верху першої сторінки Google там, де є намір купити: компанію бачать люди, які цілеспрямовано шукають сухий лід, термобокси, оптові поставки та доставку у своєму місті.",
  ],
  // outcome paragraph
  [
    "In 28 days it earned 3.67k impressions and 212 clicks from Google, an average position of 8.3 and a 5.8% CTR.",
    "In 28 days it earned 3.67k impressions and 212 clicks from Google, position 2 for commercial queries and a 5.8% CTR.",
  ],
  [
    "За 28 дней сайт получил 3,67 тыс. показов и 212 переходов из Google, среднюю позицию 8,3 и CTR 5,8%.",
    "За 28 дней сайт получил 3,67 тыс. показов и 212 переходов из Google, позицию 2 по коммерческим запросам и CTR 5,8%.",
  ],
  [
    "За 28 днів сайт отримав 3,67 тис. показів і 212 переходів із Google, середню позицію 8,3 та CTR 5,8%.",
    "За 28 днів сайт отримав 3,67 тис. показів і 212 переходів із Google, позицію 2 за комерційними запитами та CTR 5,8%.",
  ],
  // seo descriptions (kept inside 120-165 chars)
  [
    "IceLab — a Code-Site.Art website case study: 212 Google clicks · 5.8% CTR · position 8.3. Stack, timeline and measurable results in the full project breakdown.",
    "IceLab — a Code-Site.Art case study: a dry ice store at position 2 for commercial queries, 212 Google clicks and 5.8% CTR in 28 days. Full breakdown inside.",
  ],
  [
    "IceLab — интернет-магазин сухого льда: каталог с заказом, B2B-раздел, 10 локальных SEO-страниц и средняя позиция 8,3 в Google за 28 дней.",
    "IceLab — интернет-магазин сухого льда: каталог с заказом, B2B-раздел, 10 локальных SEO-страниц и позиция 2 в Google по коммерческим запросам.",
  ],
  [
    "IceLab — інтернет-магазин сухого льоду: каталог із замовленням, B2B-розділ, 10 локальних SEO-сторінок і середня позиція 8,3 у Google за 28 днів.",
    "IceLab — інтернет-магазин сухого льоду: каталог із замовленням, B2B-розділ, 10 локальних SEO-сторінок і позиція 2 в Google за комерційними запитами.",
  ],
  // the bare stat value
  ["8.3", "2"],
  ["8,3", "2"],
];

const doc = await client.fetch(`*[_type=="caseStudy" && slug.current=="icelab"][0]`);
if (!doc) throw new Error("icelab case study not found");

const backupDir = join(ROOT, "backups", "seo-round-2");
mkdirSync(backupDir, { recursive: true });
writeFileSync(
  join(backupDir, "caseStudy-icelab-position.json"),
  JSON.stringify(doc, null, 2),
  "utf8",
);

// Longest patterns first: several short rules (the metricsLine, the bare
// stat value) are substrings of longer ones (the SEO descriptions), and a
// short rule firing first would prevent the long one from ever matching.
const ORDERED = [...REPLACEMENTS].sort((a, b) => b[0].length - a[0].length);

const counts = new Map();
function walk(node) {
  if (typeof node === "string") {
    let out = node;
    for (const [from, to] of ORDERED) {
      if (out.includes(from)) {
        out = out.split(from).join(to);
        counts.set(from, (counts.get(from) ?? 0) + 1);
      }
    }
    return out;
  }
  if (Array.isArray(node)) return node.map(walk);
  if (node && typeof node === "object") {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v)]));
  }
  return node;
}

const next = walk(doc);
for (const [from, n] of counts) console.log(`  ${n}x  ${from.slice(0, 70)}`);

const leftover = JSON.stringify(next).match(/8[.,]3/g);
if (leftover) throw new Error(`still ${leftover.length} references to 8.3 — check REPLACEMENTS`);

// Descriptions must stay inside the acceptance bounds.
for (const l of ["uk", "ru", "en"]) {
  const d = next.seo?.description?.[l];
  if (d && (d.length < 120 || d.length > 165)) {
    throw new Error(`seo.description.${l} is ${d.length} chars, out of 120-165`);
  }
}

delete next._rev;
if (DRY) {
  console.log("\nhero:", next.hero?.heading?.uk);
  console.log("metricsLine.uk:", next.metricsLine?.uk);
  console.log("--dry-run: no mutations sent");
  process.exit(0);
}
const res = await client.createOrReplace(next);
console.log("\ncommitted:", res._id);
