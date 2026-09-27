/**
 * Blog fields the 2026-09-22 price pass never reached.
 *
 * scripts/blog-prices-2026-09-22/apply.mjs walked `title, excerpt, seo, body`,
 * but blogPost keeps its card text, snippet and FAQ in `lede`,
 * `metaDescription`, `metaTitle` and `faq`. Those still quote the August list
 * (£800 / £3,500 / £12,000, «£300–500/mo», «2–3 weeks», «4–8 weeks») while the
 * body shows the productized list — and the FAQ also feeds FAQPage JSON-LD.
 *
 * Same rules as that pass (rules.mjs: DOC_EXACT → EXACT → KEEP → SUB), with
 * FIELD_EXACT below applied first: where the generic ladder would be wrong
 * (a clinic or law-firm site is the €4,500 industry package, not the €2,500
 * business one) or where a term needs the working-day wording.
 *
 *   node scripts/intl-uk-2026-09/blog-fields.mjs              # dry run → blog-fields.diff.txt
 *   node scripts/intl-uk-2026-09/blog-fields.mjs --write
 *   node scripts/intl-uk-2026-09/blog-fields.mjs --only=<_id>
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { client, backup, HERE } from "../simplify-2026-09-16/lib.mjs";
import { EXACT, DOC_EXACT, SUB, OLD, KEEP } from "../blog-prices-2026-09-22/rules.mjs";
import { FIELD_EXACT, FIELD_EXACT_ALL, FIELD_SUB, FIELD_POST } from "./blog-fields-rules.mjs";

const WRITE = process.argv.includes("--write");
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);
// uk/ru need their own ladder review (the generic rules break «від $X до $Y»);
// this pass runs en unless --locales= says otherwise.
const LOCALES = ((process.argv.find((a) => a.startsWith("--locales=")) || "--locales=en").slice(10)).split(",");
const FIELDS = ["lede", "metaDescription", "metaTitle"];

const diffs = [];
const residue = [];

function rewrite(text, locale, docId) {
  const own = FIELD_EXACT[docId]?.[locale];
  if (own && Object.prototype.hasOwnProperty.call(own, text)) return own[text];
  const docMap = DOC_EXACT[docId]?.[locale];
  if (docMap && Object.prototype.hasOwnProperty.call(docMap, text)) return docMap[text];
  const all = FIELD_EXACT_ALL[locale];
  if (all && Object.prototype.hasOwnProperty.call(all, text)) return all[text];
  const globalMap = EXACT[locale];
  if (globalMap && Object.prototype.hasOwnProperty.call(globalMap, text)) return globalMap[text];
  let s = text;
  for (const [re, to] of FIELD_SUB[locale] ?? []) s = s.replace(re, to);
  if (!KEEP.test(s)) for (const [re, to] of SUB[locale] ?? []) s = s.replace(re, to);
  for (const [re, to] of FIELD_POST[locale] ?? []) s = s.replace(re, to);
  return s;
}

/** A localized value { uk, ru, en } of plain strings. */
function localized(value, docId, where) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const out = { ...value };
  for (const loc of LOCALES) {
    const v = value[loc];
    if (typeof v !== "string") continue;
    const next = rewrite(v, loc, docId);
    if (next !== v) diffs.push({ docId, where, loc, from: v, to: next });
    if (OLD.test(next) && !KEEP.test(next)) residue.push({ docId, where, loc, s: next });
    out[loc] = next;
  }
  return out;
}

const docs = await client.fetch(
  '*[_type == "blogPost" && status == "published"]{_id, "slug": coalesce(slugs.en.current, slugs.uk.current), lede, metaDescription, metaTitle, faq}',
);

const patches = [];
for (const doc of docs) {
  if (ONLY && doc._id !== ONLY && doc.slug !== ONLY) continue;
  const set = {};
  for (const f of FIELDS) {
    const next = localized(doc[f], doc._id, `${doc.slug} · ${f}`);
    if (JSON.stringify(next) !== JSON.stringify(doc[f])) set[f] = next;
  }
  if (Array.isArray(doc.faq)) {
    const next = doc.faq.map((item, i) => ({
      ...item,
      question: localized(item.question, doc._id, `${doc.slug} · faq[${i}].q`),
      answer: localized(item.answer, doc._id, `${doc.slug} · faq[${i}].a`),
    }));
    if (JSON.stringify(next) !== JSON.stringify(doc.faq)) set.faq = next;
  }
  if (Object.keys(set).length) patches.push({ doc, set });
}

const lines = [];
for (const d of diffs) lines.push(`\n[${d.loc}] ${d.where}\n- ${d.from}\n+ ${d.to}`);
lines.push(`\n\nRESIDUE (${residue.length}):`);
for (const r of residue) lines.push(`[${r.loc}] ${r.where} | ${r.s}`);
writeFileSync(join(HERE, "..", "intl-uk-2026-09", "blog-fields.diff.txt"), lines.join("\n"));

const byLoc = Object.fromEntries(LOCALES.map((l) => [l, diffs.filter((d) => d.loc === l).length]));
console.log(`${patches.length} docs, strings changed: ${JSON.stringify(byLoc)}, residue: ${residue.length}`);
console.log("diff → scripts/intl-uk-2026-09/blog-fields.diff.txt");

if (!WRITE) process.exit(0);
for (const { doc, set } of patches) {
  const full = await client.getDocument(doc._id);
  backup(`blog-fields-${doc._id}`, full);
  await client.patch(doc._id).set(set).commit();
}
console.log(`WROTE ${patches.length} docs`);
