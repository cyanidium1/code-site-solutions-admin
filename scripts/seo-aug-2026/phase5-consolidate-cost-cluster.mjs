/**
 * SEO round 2 — Phase 5: consolidate the "website cost" cluster.
 *
 * The previous round seeded /blog/skilky-koshtuye-zrobyty-sait-2026, which
 * targets the same intent as the existing /blog/vartist-rozrobky-saytu-2026
 * — and /pricing is now optimised for that cluster too. Three assets on one
 * intent is exactly the cannibalisation this project set out to fix.
 *
 * So: DELETE the new article, and fold its target phrases into the existing
 * one (which already links /pricing and /calculator).
 *
 * Phrases folded in, once each, placed naturally:
 *   скільки коштує зробити сайт  (36) -> H2
 *   вартість розробки сайту      (37) -> opening paragraph
 *   розробка сайту ціна          (36) -> opening paragraph
 *   скільки коштує створити сайт (27) -> new FAQ question
 *   вартість створення сайту     (41) -> new FAQ answer
 *
 * A 301 for the deleted slug lives in next.config.ts.
 *
 * Usage (admin repo root):
 *   node scripts/seo-aug-2026/phase5-consolidate-cost-cluster.mjs --dry-run
 *   node scripts/seo-aug-2026/phase5-consolidate-cost-cluster.mjs
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

const DUP_ID = "seoArt2026-skilky-koshtuye-zrobyty-sait";
const KEEP_SLUG = "vartist-rozrobky-saytu-2026";

const backupDir = join(ROOT, "backups", "seo-round-2");
mkdirSync(backupDir, { recursive: true });

/* ── 1. the duplicate ────────────────────────────────────────────────── */
const dup = await client.fetch(`*[_id == $id][0]`, { id: DUP_ID });
const refs = await client.fetch(`*[references($id)]{_id}`, { id: DUP_ID });
if (dup) {
  writeFileSync(
    join(backupDir, `blogPost-DELETED-${DUP_ID}.json`),
    JSON.stringify(dup, null, 2),
    "utf8",
  );
  console.log(`duplicate found: ${dup.slugs?.uk?.current} (inbound refs: ${refs.length})`);
} else {
  console.log("duplicate already absent");
}

/* ── 2. the keeper ───────────────────────────────────────────────────── */
const keep = await client.fetch(
  `*[_type=="blogPost" && slugs.uk.current == $s][0]`,
  { s: KEEP_SLUG },
);
if (!keep) throw new Error(`${KEEP_SLUG} not found`);
writeFileSync(
  join(backupDir, `blogPost-${KEEP_SLUG}.json`),
  JSON.stringify(keep, null, 2),
  "utf8",
);

const body = structuredClone(keep.body.uk);
let k = 0;
const key = () => `p5-${(++k).toString(36)}`;

// (a) H2 "Тарифи, пакет за пакетом" -> carries "скільки коштує зробити сайт"
const h2 = body.find(
  (b) =>
    b.style === "h2" &&
    (b.children ?? []).map((c) => c.text).join("").includes("Тарифи, пакет за пакетом"),
);
if (!h2) throw new Error("target H2 not found");
const h2Before = h2.children.map((c) => c.text).join("");
h2.children = [
  { _key: key(), _type: "span", marks: [], text: "Скільки коштує зробити сайт: тарифи, пакет за пакетом" },
];
console.log(`H2: "${h2Before}" -> "${h2.children[0].text}"`);

// (b) opening paragraph after the TL;DR box, before the first H2
const idx = body.findIndex((b) => b === h2 || b.style === "h2");
const intro = {
  _key: key(),
  _type: "block",
  style: "normal",
  markDefs: [{ _key: "p5link", _type: "link", href: "/pricing", newTab: false }],
  children: [
    {
      _key: key(),
      _type: "span",
      marks: [],
      text: "Нижче — розбір по пунктах: із чого складається вартість розробки сайту, чому в однієї студії розробка сайту ціна стартує з $500, а в іншої з $3 500, і як за кошторисом зрозуміти, що саме ви купуєте. Актуальні фіксовані пакети — на сторінці ",
    },
    { _key: key(), _type: "span", marks: ["p5link"], text: "ціни створення сайту" },
    { _key: key(), _type: "span", marks: [], text: "." },
  ],
};
body.splice(Math.max(idx, 1), 0, intro);
console.log("intro paragraph inserted before the first H2");

// (c) FAQ
const faq = structuredClone(keep.faq ?? []);
const existing = new Set(faq.map((f) => (f.question?.uk ?? "").toLowerCase()));
const newFaq = [
  {
    _key: "fq-cost-create",
    _type: "blogFaqItem",
    question: { uk: "Скільки коштує створити сайт під ключ?" },
    answer: {
      uk: "Вартість створення сайту під ключ у 2026: лендинг — від $800, корпоративний сайт із CMS — від $3 500, інтернет-магазин — від $6 000. «Під ключ» означає, що в суму вже входять структура, дизайн, тексти, код, запуск і рік підтримки, а не лише верстка макета.",
    },
  },
];
for (const f of newFaq) {
  if (existing.has(f.question.uk.toLowerCase())) {
    console.log(`FAQ already present, skip: ${f.question.uk}`);
    continue;
  }
  faq.push(f);
  console.log(`FAQ added: ${f.question.uk}`);
}

/* ── verify phrase coverage ──────────────────────────────────────────── */
const blob = JSON.stringify({ body, faq }).toLowerCase();
const targets = [
  "скільки коштує зробити сайт",
  "скільки коштує створити сайт",
  "вартість створення сайту",
  "вартість розробки сайту",
  "розробка сайту ціна",
];
let ok = true;
for (const t of targets) {
  const hit = blob.includes(t);
  if (!hit) ok = false;
  console.log(`  ${hit ? "OK     " : "MISSING"} ${t}`);
}
if (!ok) throw new Error("not every target phrase landed");

if (DRY) {
  console.log("\n--dry-run: no mutations sent");
  process.exit(0);
}

let tx = client.transaction();
tx = tx.patch(keep._id, (p) => p.set({ "body.uk": body, faq }));
if (dup) tx = tx.delete(DUP_ID);
const res = await tx.commit();
console.log("\ncommitted:", res.transactionId);
