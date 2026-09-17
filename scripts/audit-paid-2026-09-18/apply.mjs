// Paid-audit rollout (owner decision 2026-09-18): no more free audits anywhere.
// Site audit $150, business audit $190, deep SEO audit $450; the only free
// thing left is a 30-minute intro call.
//
// Rewrites every published blogPost / industryPage string that sells a free
// audit or the old $300 one-off audit. Rules live in ./rewrite.mjs and were
// reviewed as a dry run before this ran. Backs up each touched document first.
//
//   node scripts/audit-paid-2026-09-18/apply.mjs          # dry run
//   node scripts/audit-paid-2026-09-18/apply.mjs --write  # patch Sanity
import { client, backup } from "../simplify-2026-09-16/lib.mjs";
import { HIT, KEEP, rewrite } from "./rewrite.mjs";

const WRITE = process.argv.includes("--write");

const docs = await client.fetch('*[_type in ["blogPost","industryPage"]]');
let changedDocs = 0;
let changedStrings = 0;

const transform = (node, docCtx) => {
  if (typeof node === "string") {
    if (!HIT.test(node) || KEEP.test(node)) return node;
    const next = rewrite(node, docCtx);
    if (next !== node) changedStrings += 1;
    return next;
  }
  if (Array.isArray(node)) return node.map((x) => transform(x, docCtx));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = k.startsWith("_") ? v : transform(v, docCtx);
    return out;
  }
  return node;
};

for (const doc of docs) {
  const docCtx = [doc.slug?.current, JSON.stringify(doc.title ?? ""), JSON.stringify(doc.metaTitle ?? "")].join(" ");
  const before = changedStrings;
  const next = transform(doc, docCtx);
  if (changedStrings === before) continue;
  changedDocs += 1;
  const fields = {};
  for (const k of Object.keys(next)) {
    if (k.startsWith("_")) continue;
    if (JSON.stringify(next[k]) !== JSON.stringify(doc[k])) fields[k] = next[k];
  }
  console.log(`${doc._type} ${doc.slug?.current ?? doc._id}: ${Object.keys(fields).join(", ")}`);
  if (!WRITE) continue;
  backup(`audit-paid-${doc._id}`, doc);
  await client.patch(doc._id).set(fields).commit();
}

console.log(`${WRITE ? "patched" : "would patch"} ${changedDocs} docs, ${changedStrings} strings`);
