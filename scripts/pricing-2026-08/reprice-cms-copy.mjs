/**
 * Дочистка цены корпоративного/многостраничного тарифа в CMS-копии: 3 500 → 2 500
 * на украинской и русской локалях. Английская (£3,500) не трогается.
 *
 * Первый заход правил только код фронтенда и два числовых поля в Sanity
 * (pricingPlan.priceFrom, calculatorConfig multiPage). Но цена ещё зашита
 * текстом в копии: карточки тарифов на отраслевых страницах и 18 статей
 * августовской волны, где $3 500 упоминается как цена пакета.
 *
 * Правило замены: любое «3 500» (обычный пробел, NBSP или узкий пробел)
 * в не-английских полях. Разделитель сохраняется как был.
 *
 * ИСКЛЮЧЕНИЕ: одна фраза про разброс цен на рынке («в однієї студії ціна
 * стартує з $500, а в іншої з $3 500») говорит о чужих ценах, а не о нашей —
 * её не трогаем.
 *
 * Usage: node scripts/pricing-2026-08/reprice-cms-copy.mjs --dry-run
 *        node scripts/pricing-2026-08/reprice-cms-copy.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");
for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined)
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!token && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

/** 3 + optional space-ish char + 500. Capturing group keeps the separator. */
const RE = /3([\s   ]?)500/g;

/** Market-spread sentence about *other* studios' prices — not our tier. */
const SKIP = /стартує з \$500|начинается с \$500|стартует с \$500/;

const isEnKey = (k) => k === "en" || /En$/.test(k);

let changed = 0;
const samples = [];

/** Returns a rewritten clone, or the original node when nothing changed. */
function rewrite(node, path) {
  if (node == null) return node;
  if (typeof node === "string") {
    if (!RE.test(node)) {
      RE.lastIndex = 0;
      return node;
    }
    RE.lastIndex = 0;
    if (SKIP.test(node)) {
      samples.push(`  SKIP (рынок) ${path}`);
      return node;
    }
    const out = node.replace(RE, (_m, sep) => `2${sep}500`);
    changed++;
    if (samples.length < 14) {
      const i = out.search(/2[\s   ]?500/);
      samples.push(
        `  ${path}\n     → …${out.slice(Math.max(0, i - 50), i + 40).replace(/\s+/g, " ")}…`,
      );
    }
    return out;
  }
  if (Array.isArray(node)) return node.map((v, i) => rewrite(v, `${path}[${i}]`));
  if (typeof node === "object") {
    const out = {};
    for (const k of Object.keys(node)) {
      out[k] =
        isEnKey(k) || k.startsWith("_")
          ? node[k]
          : rewrite(node[k], path ? `${path}.${k}` : k);
    }
    return out;
  }
  return node;
}

async function run() {
  const docs = await client.fetch('*[!(_type match "system.*")]');
  console.log("документов:", docs.length);

  const patches = [];
  for (const d of docs) {
    const before = changed;
    const next = rewrite(d, "");
    if (changed === before) continue;
    // Only the fields that actually differ, top level is enough for patch.set
    const set = {};
    for (const k of Object.keys(next)) {
      if (k.startsWith("_")) continue;
      if (JSON.stringify(next[k]) !== JSON.stringify(d[k])) set[k] = next[k];
    }
    if (Object.keys(set).length) patches.push({ id: d._id, type: d._type, set });
  }

  console.log("замен:", changed, "| документов к правке:", patches.length);
  console.log("\nпримеры:");
  samples.forEach((s) => console.log(s));
  console.log("\nдокументы:");
  patches.forEach((p) => console.log(`  ${p.type}  ${p.id}  [${Object.keys(p.set).join(", ")}]`));

  if (DRY) {
    console.log("\n[dry-run] ничего не записано");
    return;
  }
  let tx = client.transaction();
  for (const p of patches) tx = tx.patch(p.id, (x) => x.set(p.set));
  await tx.commit();
  console.log("\nзаписано:", patches.length, "документов");
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
