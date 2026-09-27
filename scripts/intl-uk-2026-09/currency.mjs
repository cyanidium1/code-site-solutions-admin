/**
 * T-C10 / D3, third pass: EN copy that swapped the client's currency or put
 * pounds next to our euros.
 *
 * - Real figures the uk/ru copy gives in dollars appeared in pounds on /en:
 *   FinLiga's «before» CPL ($32) and the Mono Pools / Efedra budgets ($5,000).
 * - Cost rows of the WordPress / Wix comparison on auto, finance, real-estate
 *   and renovation stood in £ beside our € price (the frontend swaps the
 *   «custom» cell for the industry price). Same conversion as legal and
 *   medicine (≈ ×1.17, rounded). Real estate carried running costs only
 *   (£900–2,500) against our full €5,500 build, so the row argued against us;
 *   it now carries the same agency-build estimate as the other industries.
 *
 *   node scripts/intl-uk-2026-09/currency.mjs [--write]
 */
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");

const PLAN = {
  "6tWqPRZWZzG4Lv3HK7Jkoz": { row: "e28a03413463", wp: "€7,000–11,500", wix: "€5,800–8,000" }, // auto
  lOTgaDd8FU4wgJ8F4KCHn9: { row: "89bbfed2e22b", wp: "€7,000–11,500", wix: "€5,800–8,000" }, // renovation
  lOTgaDd8FU4wgJ8F4KCGuB: { row: "fin-cr-62", wp: "€5,300–9,400", wix: "€3,500–7,000", beforeFoot: "Result: CPL $32, conversion 1.1%, ROAS underwater." }, // finance
  lOTgaDd8FU4wgJ8F4KCHLf: { row: "rea-cr-62", wp: "€7,000–11,500", wix: "€5,800–8,000" }, // real-estate
};
const BUDGETS = ["a2b52844-f284-4114-8a4d-61204b18b498", "lOTgaDd8FU4wgJ8F4K9w0O"]; // mono-pools, efedra-clinic

const jobs = [];
for (const [id, p] of Object.entries(PLAN)) {
  const doc = await client.getDocument(id);
  const cmp = doc.sections.find((s) => s._type === "comparisonBlock");
  const row = cmp.rows.find((r) => r._key === p.row);
  if (!row) throw new Error(`${doc.slug.current}: no row ${p.row}`);
  const base = `sections[_key=="${cmp._key}"].rows[_key=="${p.row}"]`;
  const set = { [`${base}.wp.en`]: p.wp, [`${base}.wix.en`]: p.wix };
  console.log(`## ${doc.slug.current} ${row.param.en}: wp ${row.wp.en} → ${p.wp}; wix ${row.wix.en} → ${p.wix}`);
  if (p.beforeFoot) {
    const cs = doc.sections.find((s) => s._type === "caseBlock");
    console.log(`   before.foot: ${cs.before.foot.en} → ${p.beforeFoot}`);
    set[`sections[_key=="${cs._key}"].before.foot.en`] = p.beforeFoot;
  }
  jobs.push({ doc, set });
}
for (const id of BUDGETS) {
  const doc = await client.getDocument(id);
  console.log(`## ${doc.slug.current} budget: ${doc.budget?.en} → ${doc.budget?.uk}`);
  if (doc.budget?.en !== doc.budget?.uk) jobs.push({ doc, set: { "budget.en": doc.budget.uk } });
}
if (!WRITE) process.exit(0);
for (const { doc, set } of jobs) {
  backup(`currency-${doc._id}`, doc);
  await client.patch(doc._id).set(set).commit();
}
console.log("written");
