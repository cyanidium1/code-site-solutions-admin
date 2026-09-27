/**
 * T-C4 of the intl SEO plan: /en/blog/web-design-for-accountants stops
 * competing with /en/sites-for/finance for «web design for accountants» and
 * takes the cost question instead. UK demand for the whole accountants
 * cluster is ~70 searches a month (Ahrefs, 27.09), so one service page wins
 * the head query and the post answers «how much». The URL stays; the first
 * paragraph already links the service page with the query as the anchor.
 * Decision gate: if the service page still trails the post for «web design
 * for accountants» by 08.11.2026, 301 the post into the service page.
 *
 *   node scripts/intl-uk-2026-09/accountants-cost.mjs [--write]
 */
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");
const ID = "seoArt2026-web-design-for-accountants";

const doc = await client.getDocument(ID);
const faqIdx = doc.faq.findIndex((f) => f.question?.en === "How much does web design for accountants cost in the UK?");
const set = {
  "title.en": "How much does an accountant website cost in the UK?",
  "metaTitle.en": "How Much Does an Accountant Website Cost in the UK?",
  "lede.en":
    "An accountancy website costs €1,200 for a one-page site and €2,500 for a firm site with a page per service, fixed in the contract. Here is what that money should buy — trust signals, a page per service, fee transparency — and the checklist to hold any agency against.",
  "metaDescription.en":
    "➤ What an accountant website costs in the UK ✔️ €1,200 one-pager, €2,500 firm site, fixed prices ✔️ What the money buys: trust signals, a page per service, fee transparency ➡ What to ask before you sign.",
};
if (faqIdx >= 0) set[`faq[_key=="${doc.faq[faqIdx]._key}"].question.en`] = "How much does an accountant website cost in the UK?";

for (const [k, v] of Object.entries(set)) console.log(`${k}\n  - ${JSON.stringify(k.split(".").reduce((o, p) => o?.[p], doc) ?? "(faq)")}\n  + ${v}`);
if (!WRITE) process.exit(0);
backup("accountants-cost", doc);
await client.patch(ID).set(set).commit();
console.log("written");
