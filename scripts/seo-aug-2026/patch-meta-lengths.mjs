/**
 * SEO overhaul (Aug 2026) — normalize caseStudy / blogPost meta lengths.
 *
 * Acceptance bounds: title 30–65 chars, description 120–165 chars, unique
 * per URL. Current violations: 9 case titles out of range, 13 EN case
 * titles identical to the UK string, ~15 case descriptions 91–511 chars,
 * 7 blog metaTitles 66–75 chars, 2 blog metaDescriptions over 165.
 *
 * Titles/descriptions are rebuilt from doc fields with per-locale
 * templates; anything the templates can't fix is printed as MANUAL.
 * Backs up affected docs to backups/seo-aug-2026/.
 *
 * Usage (admin repo root):
 *   node scripts/seo-aug-2026/patch-meta-lengths.mjs --dry-run
 *   node scripts/seo-aug-2026/patch-meta-lengths.mjs
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

const inTitleRange = (s) => s && s.length >= 30 && s.length <= 65;
const inDescRange = (s) => s && s.length >= 120 && s.length <= 165;

/** Trim at a word boundary to <= max, no ellipsis (SERP-safe). */
function trimTo(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max + 1);
  const at = Math.max(cut.lastIndexOf(" "), cut.lastIndexOf("—"));
  return cut.slice(0, at > 40 ? at : max).trim().replace(/[,;:—-]$/, "");
}

const backupDir = join(ROOT, "backups", "seo-aug-2026");
mkdirSync(backupDir, { recursive: true });
const manual = [];

/* ── caseStudy ──────────────────────────────────────────────────────────── */

const CASE_SUFFIX = {
  uk: "кейс розробки сайту",
  en: "Website Case Study",
  ru: "кейс разработки сайта",
};
const CASE_DESC = {
  uk: (name, metrics) =>
    `${name} — кейс розробки сайту від Code-Site.Art: ${metrics ?? "кастомний дизайн, код і запуск під ключ"}. Стек, терміни і результати — у повному розборі проєкту.`,
  en: (name, metrics) =>
    `${name} — a Code-Site.Art website case study: ${metrics ?? "custom design, build and launch"}. Stack, timeline and measurable results in the full project breakdown.`,
  ru: (name, metrics) =>
    `${name} — кейс разработки сайта от Code-Site.Art: ${metrics ?? "кастомный дизайн, код и запуск под ключ"}. Стек, сроки и результаты — в полном разборе проекта.`,
};

const cases = await client.fetch(
  `*[_type=="caseStudy" && status=="published"]{_id, "slug": slug.current, title, metricsLine, seo}`,
);

let tx = client.transaction();
let patched = 0;

for (const doc of cases) {
  const set = {};
  const locales = ["uk", "en", "ru"].filter(
    (l) => l === "uk" || doc.title?.[l]?.trim(),
  );
  for (const l of locales) {
    const name = doc.title?.[l]?.trim() || doc.title?.uk?.trim() || doc.slug;
    const curT = doc.seo?.title?.[l];
    const dupT = l !== "uk" && curT && curT === doc.seo?.title?.uk;
    if (!inTitleRange(curT) || dupT) {
      let t = `${name} — ${CASE_SUFFIX[l]} | Code-Site.Art`;
      if (t.length > 65) t = `${trimTo(name, 65 - 3 - CASE_SUFFIX[l].length)} — ${CASE_SUFFIX[l]}`;
      if (t.length < 30 || t.length > 65) {
        manual.push(`caseStudy ${doc.slug} title.${l}: "${t}" (${t.length})`);
      } else {
        set[`seo.title.${l}`] = t;
      }
    }
    const curD = doc.seo?.description?.[l];
    const dupD = l !== "uk" && curD && curD === doc.seo?.description?.uk;
    if (!inDescRange(curD) || dupD) {
      const metrics = doc.metricsLine?.[l]?.trim() || undefined;
      let d = CASE_DESC[l](name, metrics);
      if (d.length > 165) d = trimTo(d, 164) + ".";
      if (!inDescRange(d)) {
        manual.push(`caseStudy ${doc.slug} description.${l}: (${d.length})`);
      } else {
        set[`seo.description.${l}`] = d;
      }
    }
  }
  if (Object.keys(set).length) {
    writeFileSync(
      join(backupDir, `caseStudy-meta-${doc.slug}.json`),
      JSON.stringify(doc, null, 2),
      "utf8",
    );
    console.log(doc.slug, "→", JSON.stringify(set, null, 1).slice(0, 400));
    tx = tx.patch(doc._id, (p) => p.set(set));
    patched++;
  }
}

/* ── blogPost ───────────────────────────────────────────────────────────── */

const BRAND = " | Code-Site.Art";

/** Hand-tuned values where the automatic trim reads awkwardly. */
const BLOG_OVERRIDES = {
  "tilda-vs-kastomnyy-sayt-2026": {
    "metaTitle.en": "Custom Website vs WordPress in 2026: What to Choose",
  },
  "skilky-koshtuye-sait-dlia-kliniky-2026": {
    "metaDescription.en":
      "➤ A UK clinic website costs £3,500–£12,000+ ✔️ Line-by-line quote: online booking, practitioner directory, price list ✔️ Where not to cut costs ➡ Breakdown.",
  },
  "yak-pratsyuye-admin-panel-saytu": {
    "metaDescription.uk":
      "Пояснюємо, як влаштована адмін-панель на Sanity: що можна редагувати без розробника, як публікувати зміни з телефона і чи можна зламати дизайн. З відео-оглядом.",
  },
};
const posts = await client.fetch(
  `*[_type=="blogPost" && status=="published"]{_id, slugs, title, metaTitle, metaDescription, lede}`,
);

for (const doc of posts) {
  const set = {};
  for (const l of ["uk", "en", "ru"]) {
    if (!doc.slugs?.[l]?.current) continue;
    const t = doc.metaTitle?.[l] ?? doc.title?.[l];
    if (t && t.length > 65) {
      let fixed = t.endsWith(BRAND) ? t.slice(0, -BRAND.length) : t;
      if (fixed.length > 65) fixed = trimTo(fixed, 65);
      if (fixed.length >= 30 && fixed.length <= 65) {
        set[`metaTitle.${l}`] = fixed;
      } else {
        manual.push(`blogPost ${doc.slugs[l].current} metaTitle.${l} (${t.length})`);
      }
    }
    const d = doc.metaDescription?.[l] ?? doc.lede?.[l];
    if (d && d.length > 165) {
      let fixed = trimTo(d, 164);
      if (!/[.!?»)]$/.test(fixed)) fixed += ".";
      if (inDescRange(fixed)) {
        set[`metaDescription.${l}`] = fixed;
      } else {
        manual.push(`blogPost ${doc.slugs[l].current} metaDescription.${l} (${d.length})`);
      }
    } else if (d && d.length < 120 && doc.metaDescription?.[l]) {
      manual.push(`blogPost ${doc.slugs[l].current} metaDescription.${l} too short (${d.length})`);
    }
  }
  Object.assign(set, BLOG_OVERRIDES[doc.slugs?.uk?.current] ?? {});
  if (Object.keys(set).length) {
    writeFileSync(
      join(backupDir, `blogPost-meta-${doc.slugs?.uk?.current ?? doc._id}.json`),
      JSON.stringify(doc, null, 2),
      "utf8",
    );
    console.log(doc.slugs?.uk?.current ?? doc._id, "→", JSON.stringify(set).slice(0, 300));
    tx = tx.patch(doc._id, (p) => p.set(set));
    patched++;
  }
}

console.log(`\n${patched} docs to patch`);
if (manual.length) {
  console.log("MANUAL follow-up needed:");
  for (const m of manual) console.log("  -", m);
}
if (DRY) {
  console.log("--dry-run: no mutations sent");
  process.exit(0);
}
const res = await tx.commit();
console.log("committed:", res.transactionId);
