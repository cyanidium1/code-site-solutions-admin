/**
 * TZ v2 §6: прибрати емодзі-символи (➤ ✔️ ᐈ ➡) з title/description і excerpt
 * у CMS. Чисто механічна заміна: символ → видаляється, «✔️» між тезами стає
 * «·», подвійні пробіли схлопуються. Тексти статей не чіпає.
 *
 *   node scripts/productized-2026-09/strip-meta-emoji.mjs          // dry-run
 *   node scripts/productized-2026-09/strip-meta-emoji.mjs --apply  // запис
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const APPLY = process.argv.includes("--apply");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && APPLY) throw new Error("нужен SANITY_WRITE_TOKEN для --apply");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

const clean = (s) =>
  s
    .replace(/ᐈ\s*/g, "")
    .replace(/➤\s*/g, "")
    .replace(/\s*✔️?\s*/g, " · ")
    .replace(/\s*➡\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s·]+|[\s·]+$/g, "")
    .trim();

const HAS = /[➤➡]|✔️?|ᐈ/;
const FIELDS = ["title", "description"];

const docs = await client.fetch(
  `*[_type in ["blogPost","caseStudy","industryPage"]]{_id,_type,"s":slug.current,seo,excerpt}`,
);

const tx = client.transaction();
let patched = 0;
const backup = [];

for (const d of docs) {
  const set = {};
  for (const f of FIELDS) {
    const val = d.seo?.[f];
    if (!val || typeof val !== "object") continue;
    for (const [loc, text] of Object.entries(val)) {
      if (typeof text === "string" && HAS.test(text)) set[`seo.${f}.${loc}`] = clean(text);
    }
  }
  if (d.excerpt && typeof d.excerpt === "object") {
    for (const [loc, text] of Object.entries(d.excerpt)) {
      if (typeof text === "string" && HAS.test(text)) set[`excerpt.${loc}`] = clean(text);
    }
  }
  if (!Object.keys(set).length) continue;
  patched++;
  backup.push({ _id: d._id, seo: d.seo, excerpt: d.excerpt });
  console.log(`${d._type} ${d.s ?? d._id}: ${Object.keys(set).join(", ")}`);
  tx.patch(d._id, (p) => p.set(set));
}

console.log(`docs with emoji: ${patched}`);
if (!APPLY) {
  console.log("dry-run — додайте --apply");
  process.exit(0);
}
const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "backups", "productized-2026-09");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, `meta-emoji-${Date.now()}.json`), JSON.stringify(backup, null, 2));
const res = await tx.commit();
console.log("done:", res.results.length, "mutations");
