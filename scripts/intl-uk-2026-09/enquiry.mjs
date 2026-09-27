/**
 * T-C8 (UK terminology): «application» in the sense of a sales lead reads
 * as a visa or job application to a UK buyer; the word is «enquiry». Only
 * the lead sense changes — talent applications, vehicle-finance
 * applications, immigration applications and «Application Programming
 * Interface» stay as they are.
 *
 *   node scripts/intl-uk-2026-09/enquiry.mjs [--write]
 */
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");
const S = (k) => `sections[_key=="${k}"]`;

const PLAN = {
  "6tWqPRZWZzG4Lv3HK7Jkoz": {
    // auto
    'hero.stats[_key=="aut-st-1"].label.en': "we work for enquiries with a high average order value",
    'hero.stats[_key=="aut-st-2"].label.en': "the manager handles the enquiry with the calculation already done",
    [`${S("aut-sec-43")}.directions.allowedItems[_key=="6HNMNruJZobcPr5iKFBQDL"].en`]: "Enquiry forms without the back-and-forth",
    [`${S("aut-sec-43")}.directions.replaceItems[_key=="6HNMNruJZobcPr5iKFBQJR"].en`]: "Enquiries for a car search or a consultation",
  },
  lOTgaDd8FU4wgJ8F4KCGuB: {
    // finance
    'hero.features[_key=="v5FOIhYlayfgccE88t5A7I"].en': "Consultation form | Enquiries from the site",
    'hero.stats[_key=="fin-st-2"].label.en': "services, cases, figures, FAQ and enquiry form",
    [`${S("fin-sec-7")}.reasons[_key=="fin-r-26"].text.en[_key=="fin-b-34"].children[_key=="fin-s-31"].text`]:
      "The client has read about accounting support, looked at the services, but doesn’t understand what to do next: book a consultation, get a quote, or write directly. If the website doesn’t have clear buttons, forms and a simple path to an enquiry, a warm client will simply leave.",
    [`${S("fin-sec-7")}.reasons[_key=="fin-r-26"].title.en`]: "THERE IS NO CLEAR PATH TO AN ENQUIRY",
    [`${S("fin-sec-43")}.directions.lede.en`]:
      "It’s hard to sell financial services with a pretty picture. The client needs to quickly understand what you do, how much it might cost, why they can trust you, and how to get in touch.",
    [`${S("fin-sec-43")}.directions.replaceItems[_key=="v5FOIhYlayfgccE88t54X8"].en`]: "consultation request form",
  },
  lOTgaDd8FU4wgJ8F4KCHn9: {
    // renovation
    // NBYG København: 300+ enquiries a year (the case on this page).
    'hero.stats[_key=="st1"].label.en': "enquiries a month\nfor NBYG København",
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
const docs = [];
for (const [id, set] of Object.entries(PLAN)) {
  const doc = await client.getDocument(id);
  console.log(`\n## ${doc.slug.current}`);
  for (const [k, v] of Object.entries(set)) {
    const before = get(doc, k);
    if (typeof before !== "string") { missing++; console.log(`  ✗ ${k}`); continue; }
    console.log(`  - ${before}\n  + ${v}`);
  }
  if (id === "lOTgaDd8FU4wgJ8F4KCHn9") console.log(`  (stat value: ${get(doc, 'hero.stats[_key=="st1"].value.en') ?? get(doc, 'hero.stats[_key=="st1"].value')})`);
  docs.push({ doc, set });
}
if (missing) { console.error(`${missing} missing — nothing written`); process.exit(1); }
if (!WRITE) process.exit(0);
for (const { doc, set } of docs) {
  backup(`enquiry-${doc._id}`, doc);
  await client.patch(doc._id).set(set).commit();
}
console.log("\nwritten");
