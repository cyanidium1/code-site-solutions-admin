/**
 * Blog price pass (2026-09-22): bring every published blogPost in line with
 * the productized price list (TZ v2, 2026-09-20).
 *
 * Rules live in ./rules.mjs — exact strings first (global, then per document),
 * then narrow substring rules. Nothing is rewritten by a blind number regex:
 * competitor prices, client budgets and case-study figures must survive.
 *
 *   node scripts/blog-prices-2026-09-22/apply.mjs            # dry run + residue
 *   node scripts/blog-prices-2026-09-22/apply.mjs --residue  # only what is left
 *   node scripts/blog-prices-2026-09-22/apply.mjs --write    # patch Sanity
 */
import { client, backup } from "../simplify-2026-09-16/lib.mjs";
import { EXACT, DOC_EXACT, DOC_NODES, SUB, OLD, KEEP } from "./rules.mjs";

const WRITE = process.argv.includes("--write");
const RESIDUE_ONLY = process.argv.includes("--residue");
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);

const LOCALES = ["uk", "ru", "en"];

let changedStrings = 0;
const residue = [];
const diffs = [];
const DIFF = process.argv.includes("--diff");

function rewrite(text, locale, docId) {
  const docMap = DOC_EXACT[docId]?.[locale];
  if (docMap && Object.prototype.hasOwnProperty.call(docMap, text)) return docMap[text];
  const globalMap = EXACT[locale];
  if (globalMap && Object.prototype.hasOwnProperty.call(globalMap, text)) return globalMap[text];
  // Generic substring rules never touch a sentence that quotes somebody
  // else's price (a platform subscription, a competitor's build, a client's
  // ad budget). Those are only ever rewritten by an explicit rule above.
  if (KEEP.test(text)) return text;
  let s = text;
  for (const [re, to] of SUB[locale] ?? []) s = s.replace(re, to);
  return s;
}

/** Walk one locale subtree; only plain strings are rewritten. */
function walk(node, locale, docId) {
  if (typeof node === "string") {
    const next = rewrite(node, locale, docId);
    if (next !== node) {
      changedStrings += 1;
      diffs.push({ locale, from: node, to: next });
    }
    return next;
  }
  if (Array.isArray(node)) return node.map((x) => walk(x, locale, docId));
  if (node && typeof node === "object") {
    // A whole block rewritten by hand (a TL;DR list, a price table): the
    // replacement keeps the original _key and _type so the document keeps
    // its shape and its position in the body.
    const replacement = node._key && DOC_NODES[docId]?.[locale]?.[node._key];
    if (replacement) {
      changedStrings += 1;
      return { ...replacement, _key: node._key, _type: node._type };
    }
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = k.startsWith("_") ? v : walk(v, locale, docId);
    return out;
  }
  return node;
}

/** Localized field = { uk, ru, en }; anything else is left alone. */
function walkField(value, docId) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const out = { ...value };
  let touched = false;
  for (const loc of LOCALES) {
    if (!(loc in value)) continue;
    const next = walk(value[loc], loc, docId);
    if (JSON.stringify(next) !== JSON.stringify(value[loc])) touched = true;
    out[loc] = next;
  }
  return touched ? out : value;
}

function collectStrings(node, out = []) {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((x) => collectStrings(x, out));
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) if (!k.startsWith("_")) collectStrings(v, out);
  return out;
}

const docs = await client.fetch(
  '*[_type == "blogPost" && status == "published"]{_id, status, "slug": slugs.uk.current, title, excerpt, seo, body}',
);

let changedDocs = 0;
for (const doc of docs) {
  if (ONLY && doc.slug !== ONLY && doc._id !== ONLY) continue;
  const before = changedStrings;
  const fields = {};
  for (const key of ["title", "excerpt", "seo", "body"]) {
    if (!doc[key]) continue;
    const next = walkField(doc[key], doc._id);
    if (JSON.stringify(next) !== JSON.stringify(doc[key])) fields[key] = next;
  }

  // What still quotes the old list after the rules ran.
  for (const loc of LOCALES) {
    for (const key of ["title", "excerpt", "seo", "body"]) {
      const value = fields[key]?.[loc] ?? doc[key]?.[loc];
      if (value === undefined) continue;
      for (const s of collectStrings(value))
        if (OLD.test(s) && !KEEP.test(s)) residue.push({ slug: doc.slug, loc, s });
    }
  }

  if (!Object.keys(fields).length) continue;
  changedDocs += 1;
  if (!RESIDUE_ONLY)
    console.log(`\n${doc.slug ?? doc._id}: ${changedStrings - before} strings (${Object.keys(fields).join(", ")})`);
  if (!WRITE) continue;
  backup(`blog-prices-${doc._id}`, doc);
  await client.patch(doc._id).set(fields).commit();
}

if (DIFF) {
  const seen = new Set();
  for (const d of diffs) {
    const k = `${d.locale}|${d.from}`;
    if (seen.has(k)) continue;
    seen.add(k);
    console.log(`\n- [${d.locale}] ${d.from.replace(/\s+/g, " ")}\n+ [${d.locale}] ${d.to.replace(/\s+/g, " ")}`);
  }
}

console.log(`\n${WRITE ? "WROTE" : "DRY RUN"}: ${changedDocs} docs, ${changedStrings} strings`);
console.log(`RESIDUE (old prices still there): ${residue.length} strings`);
if (RESIDUE_ONLY || process.argv.includes("--show-residue")) {
  const seen = new Set();
  for (const r of residue) {
    const k = `${r.loc}|${r.s}`;
    if (seen.has(k)) continue;
    seen.add(k);
    console.log(`\n[${r.loc}] ${r.slug}\n  ${r.s.replace(/\s+/g, " ")}`);
  }
}
