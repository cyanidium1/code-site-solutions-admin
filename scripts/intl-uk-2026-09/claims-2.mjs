/**
 * D3, second pass (2026-09-27):
 * - FinLiga case on /en/sites-for/finance showed CPL «£7.50 (was £32)»; the
 *   client's figures are in dollars, as the uk/ru copy says ($7.50, was $32).
 *   Swapping the currency made a real number untrue.
 * - /en/sites-for/auto hero «×2 faster» has no source; the Raul Avto case on
 *   the same page does show the PDF quote generated on the site in 60 seconds.
 *
 *   node scripts/intl-uk-2026-09/claims-2.mjs [--write]
 */
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");
const S = (k) => `sections[_key=="${k}"]`;

const PLAN = {
  lOTgaDd8FU4wgJ8F4KCGuB: {
    finance: true,
    set: {
      [`${S("fin-sec-35")}.results[_key=="fin-rs-41"].value.en`]: "$7.50",
      [`${S("fin-sec-35")}.results[_key=="fin-rs-41"].label.en`]: "CPL (was $32)",
      [`${S("fin-sec-35")}.after.foot.en`]: "Result: CPL $7.50 (×4.2 improvement), conversion 4.6%, ROAS turned positive in month two.",
    },
  },
  "6tWqPRZWZzG4Lv3HK7Jkoz": {
    set: {
      'hero.stats[_key=="aut-st-2"].value.en': "60 s",
      'hero.stats[_key=="aut-st-2"].label.en': "to a PDF quote generated on the site",
    },
  },
};

const get = (doc, path) => {
  let n = doc;
  for (const m of path.matchAll(/([A-Za-z0-9_]+)|\[_key=="([^"]+)"\]/g)) {
    if (n == null) return undefined;
    n = m[1] !== undefined ? n[m[1]] : Array.isArray(n) ? n.find((x) => x?._key === m[2]) : undefined;
  }
  return n;
};

let missing = 0;
const jobs = [];
for (const [id, { set }] of Object.entries(PLAN)) {
  const doc = await client.getDocument(id);
  // The case block key differs per page; resolve it instead of trusting the literal.
  const caseKey = doc.sections.find((s) => s._type === "caseBlock")?._key;
  const fixed = Object.fromEntries(Object.entries(set).map(([k, v]) => [k.replace(/sections\[_key=="fin-sec-35"\]/, `sections[_key=="${caseKey}"]`), v]));
  console.log(`\n## ${doc.slug.current}`);
  for (const [k, v] of Object.entries(fixed)) {
    const before = get(doc, k);
    if (typeof before !== "string") { missing++; console.log(`  ✗ ${k}`); continue; }
    console.log(`  - ${before}\n  + ${v}`);
  }
  jobs.push({ doc, set: fixed });
}
if (missing) { console.error(`${missing} missing — nothing written`); process.exit(1); }
if (!WRITE) process.exit(0);
for (const { doc, set } of jobs) {
  backup(`claims-2-${doc._id}`, doc);
  await client.patch(doc._id).set(set).commit();
}
console.log("\nwritten");
