/**
 * T-C8 (UK terminology): «business days» → «working days» in every EN string
 * of industry pages and blog posts. The frontend copy switched in PR #59;
 * the CMS copy still said «3 business days» on five audit blocks and more.
 *
 *   node scripts/intl-uk-2026-09/working-days.mjs [--write]
 */
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");
const RE = /\bbusiness (days?)\b/g;
const Re = /\bBusiness (days?)\b/g;

const docs = await client.fetch('*[_type in ["industryPage","blogPost","caseStudy"] && !(_id in path("drafts.**"))]');
let strings = 0;
const plans = [];
for (const d of docs) {
  const set = {};
  const walk = (n, path, inEn) => {
    if (typeof n === "string") {
      if (inEn && (RE.test(n) || Re.test(n))) {
        RE.lastIndex = 0; Re.lastIndex = 0;
        set[path] = n.replace(RE, "working $1").replace(Re, "Working $1");
        strings++;
        console.log(`${d._type} ${d.slug?.current ?? d.slugs?.en?.current ?? d._id} | ${n.match(/.{0,50}business days?.{0,20}/i)?.[0]}`);
      }
      return;
    }
    if (Array.isArray(n)) return n.forEach((x, i) => walk(x, `${path}[${x?._key ? `_key=="${x._key}"` : i}]`, inEn));
    if (n && typeof n === "object")
      for (const [k, v] of Object.entries(n)) if (!k.startsWith("_")) walk(v, path ? `${path}.${k}` : k, inEn || k === "en");
  };
  walk(d, "", false);
  if (Object.keys(set).length) plans.push({ d, set });
}
console.log(`\n${plans.length} docs, ${strings} strings`);
if (!WRITE) process.exit(0);
for (const { d, set } of plans) {
  backup(`working-days-${d._id}`, d);
  await client.patch(d._id).set(set).commit();
}
console.log("written");
