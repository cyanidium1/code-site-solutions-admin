/**
 * SEO overhaul (Aug 2026) — contextual internal links in blogPost body.uk.
 *
 * For each planned (post → target, anchor) pair:
 *   1. skip if the body already links that href;
 *   2. else find the anchor phrase in a plain span and wrap it in a link
 *      markDef (splitting the span);
 *   3. else append a natural closing sentence carrying the linked anchor.
 *
 * Backs up affected docs to backups/seo-aug-2026/ before patching.
 *
 * Usage (from the admin repo root):
 *   node scripts/seo-aug-2026/patch-blog-links.mjs --dry-run
 *   node scripts/seo-aug-2026/patch-blog-links.mjs
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

/**
 * The link plan. `fb` = [textBefore, textAfter] for the appended-sentence
 * fallback; the anchor itself becomes the linked text either way.
 */
const PLAN = [
  // ── the minimum set from the SEO task ──────────────────────────────────
  { slug: "seo-dlia-medychnykh-saitiv", href: "/sites-for/medicine", anchor: "створення медичних сайтів", fb: ["Технічну основу — швидкість, Schema.org, онлайн-запис — закриває ", ": сайт будується SEO-ready з першого дня."] },
  { slug: "15-pomylok-na-saitakh-klinik", href: "/sites-for/medicine", anchor: "розробка сайту для клініки", fb: ["Простіше не виправляти ці помилки, а не робити їх: ", " під ключ виключає їх на рівні архітектури."] },
  { slug: "dyzain-saitu-medychnoho-tsentru", href: "/sites-for/medicine", anchor: "веб-дизайн для медичних сайтів", fb: ["Ми проєктуємо ", " саме за цими принципами — від структури до кольору."] },
  { slug: "rozrobka-saitu-medychnoho-tsentru-pid-kliuch", href: "/pricing", anchor: "вартість розробки сайту", fb: ["Актуальна ", " з фіксованими пакетами — на сторінці цін."] },
  { slug: "rozrobka-saitu-medychnoho-tsentru-pid-kliuch", href: "/sites-for/medicine/medychnyi-tsentr", anchor: "розробка сайту для медичного центру", fb: ["Окрема сторінка послуги: ", " — структура, ціни і терміни."] },
  { slug: "shvydkist-medychnoho-saitu", href: "/sites-for/medicine", anchor: "сайт для медичної клініки", fb: ["Швидкий ", " — базова вимога наших проєктів: 0,9 с до першого екрана."] },
  { slug: "sait-dlia-likarni-vs-pryvatnyi-kabinet", href: "/sites-for/medicine", anchor: "створення сайту для клініки", fb: ["Незалежно від формату, ", " починається з того самого: запис, лікарі, довіра."] },
  { slug: "skilky-koshtuye-sait-dlia-kliniky-2026", href: "/pricing", anchor: "ціна створення сайту", fb: ["Повна ", " за фіксованими пакетами — на сторінці цін."] },
  { slug: "skilky-koshtuye-sait-dlia-kliniky-2026", href: "/sites-for/medicine", anchor: "сайт для клініки", fb: ["Що саме ми будуємо як ", " — на сторінці медичного напряму."] },
  { slug: "skilky-koshtuye-sait-dlia-kliniky-2026", href: "/sites-for/medicine/stomatolohiia", anchor: "створення сайту для стоматології", fb: ["Для стоматологій є окреме рішення: ", " з інтеграцією Dental4Windows."] },
  { slug: "prosuvannia-saitu-tsina-2026", href: "/seo", anchor: "просування сайту ціна", fb: ["Наш прайс: ", " — від $300/міс, без «гарантій топ-1»."] },
  { slug: "lokalne-seo-top-3-google-maps", href: "/seo", anchor: "просування сайту", fb: ["Локальний пошук — частина нашої послуги: ", " від $300/міс включає Google Business Profile."] },
  { slug: "seo-audyt-svoimy-rukamy", href: "/seo", anchor: "SEO-аудит сайту", fb: ["Якщо руки не доходять — замовте ", " за $300: список правок за пріоритетами за 5 днів."] },
  { slug: "vartist-rozrobky-saytu-2026", href: "/calculator", anchor: "калькулятор вартості сайту", fb: ["Швидку вилку під ваш проєкт дає ", " — 60 секунд без менеджерів."] },
  { slug: "sait-dlia-budivelnoi-kompanii-2026", href: "/sites-for/renovation", anchor: "розробка сайту для будівельної компанії", fb: ["Профільна сторінка: ", " — калькулятор кошторису, галерея «до/після», локальне SEO."] },
  { slug: "tilda-vs-kastomnyy-sayt-2026", href: "/vs-constructors", anchor: "кастомний сайт", fb: ["Детальне порівняння з конструкторами: чим ", " відрізняється на дистанції 3 років."] },
  { slug: "tilda-vs-kastomnyy-sayt-2026", href: "/pricing", anchor: "ціна розробки сайту", fb: ["Фіксована ", " — пакети від $800 на сторінці цін."] },
  { slug: "nextjs-proty-wordpress-ta-konstruktoriv", href: "/vs-wordpress", anchor: "кастомний сайт замість WordPress", fb: ["Ми зібрали окрему сторінку про ", ": міграція, швидкість, підтримка."] },
  { slug: "redyzain-bez-vtraty-seo", href: "/seo", anchor: "просування сайту", fb: ["Після редизайну позиції треба підтримувати: ", " від $300/міс — наш формат."] },
  { slug: "ai-poshuk-yak-potrapyty-u-vidpovidi", href: "/seo", anchor: "SEO-просування сайту", fb: ["AI-видимість будується на тій самій базі, що й ", " — швидкість, структура, Schema.org."] },
  // ── same pattern for the remaining articles ────────────────────────────
  { slug: "yak-pratsyuye-admin-panel-saytu", href: "/corporate-site", anchor: "корпоративний сайт з адмінкою", fb: ["Так працює кожен наш ", " — адмінка входить у пакет від $3 500."] },
  { slug: "yak-pratsyuye-admin-panel-saytu", href: "/pricing", anchor: "вартість розробки сайту", fb: ["Скільки це коштує — дивіться ", " з фіксованими пакетами."] },
  { slug: "yak-chytaty-google-search-console", href: "/seo", anchor: "просування сайту", fb: ["Якщо цифри в GSC не ростуть — можливо, час на системне ", "."] },
  { slug: "temna-chy-svitla-tema-saitu", href: "/portfolio", anchor: "кейси розробки сайтів", fb: ["Як це виглядає наживо — дивіться ", " у портфоліо."] },
  { slug: "trendy-veb-dyzainu-2026", href: "/landing", anchor: "розробка лендінгу", fb: ["Практичне застосування трендів — ", " під ключ від $800."] },
  { slug: "9-dyzain-pryiomiv-dlia-konversii", href: "/landing", anchor: "розробка лендінгу", fb: ["Усі 9 прийомів входять у нашу послугу: ", " під ключ від $800."] },
  { slug: "lokalne-seo-top-3-google-maps", href: "/sites-for/renovation", anchor: "сайт для будівельної компанії", fb: ["Для локальних ніш — як ", " — карта дає половину заявок."] },
];

let keyCounter = 0;
const nextKey = () => `seolnk${(++keyCounter).toString(36)}${Date.now().toString(36)}`;

/** Wrap the first plain-span occurrence of `anchor` in a link markDef. */
function inlineLink(body, href, anchor) {
  const needle = anchor.toLowerCase();
  for (const block of body) {
    if (block._type !== "block") continue;
    if ((block.style ?? "normal") !== "normal") continue;
    const children = block.children ?? [];
    for (let i = 0; i < children.length; i++) {
      const span = children[i];
      if (span._type !== "span" || (span.marks?.length ?? 0) > 0) continue;
      const idx = span.text.toLowerCase().indexOf(needle);
      if (idx === -1) continue;
      const linkKey = nextKey();
      block.markDefs = [
        ...(block.markDefs ?? []),
        { _key: linkKey, _type: "link", href, newTab: false },
      ];
      const before = span.text.slice(0, idx);
      const mid = span.text.slice(idx, idx + anchor.length);
      const after = span.text.slice(idx + anchor.length);
      const parts = [];
      if (before) parts.push({ ...span, _key: nextKey(), text: before });
      parts.push({ ...span, _key: nextKey(), text: mid, marks: [linkKey] });
      if (after) parts.push({ ...span, _key: nextKey(), text: after });
      children.splice(i, 1, ...parts);
      return true;
    }
  }
  return false;
}

/** Append a closing paragraph carrying the linked anchor. */
function appendLink(body, href, anchor, [pre, post]) {
  const linkKey = nextKey();
  body.push({
    _key: nextKey(),
    _type: "block",
    style: "normal",
    markDefs: [{ _key: linkKey, _type: "link", href, newTab: false }],
    children: [
      { _key: nextKey(), _type: "span", marks: [], text: pre },
      { _key: nextKey(), _type: "span", marks: [linkKey], text: anchor },
      { _key: nextKey(), _type: "span", marks: [], text: post },
    ],
  });
}

const bySlug = new Map();
for (const p of PLAN) {
  if (!bySlug.has(p.slug)) bySlug.set(p.slug, []);
  bySlug.get(p.slug).push(p);
}

const slugs = [...bySlug.keys()];
const docs = await client.fetch(
  `*[_type=="blogPost" && slugs.uk.current in $slugs]{_id, "slug": slugs.uk.current, body}`,
  { slugs },
);

const backupDir = join(ROOT, "backups", "seo-aug-2026");
mkdirSync(backupDir, { recursive: true });

let tx = client.transaction();
let patched = 0;
for (const doc of docs) {
  const body = structuredClone(doc.body?.uk ?? []);
  const existing = new Set(
    body.flatMap((b) => (b.markDefs ?? []).map((d) => d.href)),
  );
  let changed = false;
  for (const op of bySlug.get(doc.slug)) {
    if (existing.has(op.href)) {
      console.log(`${doc.slug}: ${op.href} already linked — skip`);
      continue;
    }
    const inline = inlineLink(body, op.href, op.anchor);
    if (!inline) appendLink(body, op.href, op.anchor, op.fb);
    console.log(
      `${doc.slug}: +${op.href} (${inline ? "inline phrase" : "appended sentence"})`,
    );
    existing.add(op.href);
    changed = true;
  }
  if (!changed) continue;
  writeFileSync(
    join(backupDir, `blogPost-${doc.slug}.json`),
    JSON.stringify(doc, null, 2),
    "utf8",
  );
  tx = tx.patch(doc._id, (p) => p.set({ "body.uk": body }));
  patched++;
}

console.log(`\n${patched} posts to patch`);
if (DRY) {
  console.log("--dry-run: no mutations sent");
  process.exit(0);
}
const res = await tx.commit();
console.log("committed:", res.transactionId);
