/**
 * /en/sites-for/finance SEO block still said «usually run four to eight
 * weeks» and «a fixed price range» while the page sells the industry package
 * at a fixed €4,500 in 14–21 working days (src/constants/pricing.ts).
 *
 *   node scripts/intl-uk-2026-09/finance-term.mjs [--write]
 */
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");
const ID = "lOTgaDd8FU4wgJ8F4KCGuB";
const RULES = [
  ["usually run four to eight weeks", "run 14–21 working days"],
  ["a fixed price range and a timeline", "a fixed price and a timeline"],
];

const doc = await client.getDocument(ID);
const sec = doc.sections.find((s) => s._key === "secFinScope");
const set = {};
for (const b of sec?.content?.en ?? [])
  for (const c of b.children ?? [])
    for (const [from, to] of RULES)
      if (c.text?.includes(from)) {
        const path = `sections[_key=="secFinScope"].content.en[_key=="${b._key}"].children[_key=="${c._key}"].text`;
        set[path] = (set[path] ?? c.text).replace(from, to);
      }
for (const [k, v] of Object.entries(set)) console.log(`${k}\n  + ${v}`);
if (!Object.keys(set).length) { console.log("nothing to change"); process.exit(0); }
if (!WRITE) process.exit(0);
backup("finance-term", doc);
await client.patch(ID).set(set).commit();
console.log("written");
