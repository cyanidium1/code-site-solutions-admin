/**
 * EN-only blogPost: "IDX websites — and why agents outside the US don't
 * need one". Plan item A3 (DOMLIVO-ENGINE-SEO-2026-11-07.md): intercepts
 * the US IDX query family (idx website 400/KD 36; real estate idx website
 * 200/KD 0; idx website builder 100/KD 34 — Ahrefs 07.11.2026) with the
 * international answer nobody in that SERP gives. No invented numbers;
 * Domlivo facts from the case brief only.
 * Usage: node seed-idx-website-do-you-need.mjs [--dry-run]
 */
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const DRY = process.argv.includes("--dry-run");
function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(join(ROOT, ".env.local")); loadEnvFile(join(ROOT, ".env"));
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("token missing");
const client = createClient({ projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false });

let keySeq = 0;
const key = () => `ix${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;
function p(text, style = "normal") {
  const children = []; const markDefs = [];
  const re = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0; let m;
  while ((m = re.exec(text))) {
    if (m.index > last) children.push({ _key: key(), _type: "span", text: text.slice(last, m.index), marks: [] });
    if (m[1]) children.push({ _key: key(), _type: "span", text: m[1].slice(2, -2), marks: ["strong"] });
    else {
      const label = m[2].slice(1, m[2].indexOf("]"));
      const href = m[2].slice(m[2].indexOf("(") + 1, -1);
      const dk = key();
      markDefs.push({ _key: dk, _type: "link", href });
      children.push({ _key: key(), _type: "span", text: label, marks: [dk] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push({ _key: key(), _type: "span", text: text.slice(last), marks: [] });
  return { _key: key(), _type: "block", style, markDefs, children };
}
const h2 = (t) => p(t, "h2");
const li = (t) => ({ ...p(t), listItem: "bullet", level: 1 });
const tldr = (title, items) => ({ _key: key(), _type: "tldrBox", title, items });
const table = (headers, rows) => ({
  _key: key(), _type: "blogTable", headers,
  rows: rows.map((cells) => ({ _key: key(), _type: "blogTableRow", cells })),
});
const cta = (heading, sub, label, href) => ({
  _key: key(), _type: "ctaCallout", heading, sub, ctaLabel: label, ctaHref: href,
  title: heading, text: sub, buttonLabel: label, buttonHref: href,
});
const AUTHOR = {
  name: "Fedir Alpatov", role: "Founder & Tech Lead",
  bio: "Founder of Code-Site.Art. I do the tech-lead work and write about real figures from 50+ projects.",
  photoUrl: "/team/fedir-avatar.jpg",
};
const NOW = "2026-11-09T11:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("IDX — the short version", [
    "IDX (Internet Data Exchange) is the US-Canadian arrangement that lets a broker display other brokers' MLS listings on their own website, under MLS rules, via an approved data feed.",
    "It only exists where an MLS exists. If your market has no Multiple Listing Service — which is most of Europe, the Gulf, the Balkans and the Caucasus — there is nothing to connect an IDX feed to.",
    "Agents outside MLS markets don't have an IDX problem; they have a catalogue problem: their own stock needs listing pages built for search, in the buyer's languages.",
    "Buying an “IDX website” subscription outside the US buys you US plumbing you can't use, usually with a monthly fee attached.",
    "What works instead is boringly concrete: your own indexable catalogue, feeds from your CRM to the portals, and listing pages good enough to rank — the architecture our own platform runs on.",
  ]),
  p("If you've been told your agency needs an “IDX website”, the advice almost certainly travelled further than it should have. IDX is real, useful — and profoundly American. This article explains what it actually is, who genuinely needs it, and what agents everywhere else should build instead. (We build property platforms for non-MLS markets and run [our own](/en/portfolio/domlivo), so we have a horse in this race — the facts below stand on their own.)"),

  h2("What IDX actually is"),
  p("In the US and Canada, brokers co-operate through the **MLS — Multiple Listing Service** — regional databases where brokers share their listings with each other under reciprocity rules. **IDX, Internet Data Exchange**, is the policy-plus-technology layer that lets a member broker display *other* brokers' MLS listings on their own public website: an approved feed from the MLS, display rules about attribution and refresh times, and vendor software that renders the search. That's why a small Texas brokerage's site can offer “search every home for sale in Austin” — the inventory is the whole MLS's, not theirs."),
  p("Everything about IDX presumes the MLS: membership, rules, the feed itself. The vendors in this niche — the names you meet when you search “IDX website” — sell US brokers that plumbing as a subscription."),

  h2("Why there's no IDX outside MLS markets"),
  p("Most of the world's residential markets never built an MLS. In Europe, the Gulf, the Balkans, the Caucasus and most of Asia, listings live with the agency that holds the mandate (often non-exclusively), and buyers aggregate their view through portals — Rightmove and Zoopla in the UK, Idealista in Spain, Immobiliare in Italy, Bayut in the UAE, and their local equivalents. There is no shared broker database behind those portals to syndicate FROM; portals take feeds directly from agencies and developers. **No MLS → nothing for IDX to exchange.**"),
  p("So when an agent in Tbilisi, Sofia, Dubai or Durrës is sold an “IDX-enabled” website, one of two things is happening: the vendor means plain portal-style search over the agency's own stock (fine, but that's not IDX — don't pay IDX prices for it), or the product genuinely is US plumbing that will sit unconnected."),

  h2("Do YOU need IDX? The honest decision table"),
  table(
    ["Your situation", "Verdict"],
    [
      ["US or Canadian broker/agent, MLS member, wants whole-market search on their site", "Yes — that's exactly what IDX is for; buy from an IDX vendor"],
      ["US agent whose leads come from Zillow/referrals and who needs a profile site", "Maybe not even then — IDX subscriptions earn their fee when search is your lead engine"],
      ["Agent or agency in Europe / Gulf / Balkans / Caucasus / most of Asia", "No — there's no MLS to feed from; you need your own catalogue done properly"],
      ["Developer selling own projects, anywhere", "No — your inventory is your own by definition"],
      ["Portal/marketplace builder aggregating many agencies", "You need feed ingestion and moderation — an import pipeline, not IDX"],
    ]
  ),

  h2("What international agents need instead"),
  li("**Your own catalogue as the asset.** Every listing its own fast, indexable page with schema markup; every city-and-type combination a catalogue page. In a non-MLS market your stock is exclusive-ish by nature — that's an SEO advantage US brokers don't have, because nobody else's site carries your listings."),
  li("**Feeds pointing the other way:** from your CRM or admin out to the portals your buyers use, and importers IN from whatever your partners ship (feeds, spreadsheets, even social pages)."),
  li("**Languages, if your buyers are foreign:** real per-language URLs with hand-written translations, not a widget — in investment markets, the buyer who pays most usually googles in German, Polish or English, not in the local language."),
  li("**Measurement wired in:** every enquiry recorded with its source, or you'll never know which channel works. (Ours told us 28% of leads come from ChatGPT — see [the measured playbook](/en/blog/real-estate-leads-from-chatgpt).)"),
  p("That architecture is not hypothetical — it's what [Domlivo](/en/portfolio/domlivo), our own platform, runs on: ~5,900 unique visitors a month, all organic, in a market with no MLS and eight buyer languages. The design decisions are documented with screenshots in [the walkthrough](/en/blog/real-estate-website-design)."),

  cta(
    "In a non-MLS market and need the catalogue done right?",
    "That's our estate agent website design & development service — engine template from €1,500, custom from €2,500, the full Domlivo-level platform from €3,900, all one-off. No MLS required, no subscription attached.",
    "See the service and prices",
    "/en/sites-for/real-estate"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "What is an IDX website?",
    a: "A website that displays Multiple Listing Service (MLS) listings — including other brokers' — via an approved IDX feed, under MLS display rules. It's the standard way US and Canadian brokers offer whole-market search on their own sites, sold by IDX vendors as a subscription. It presumes MLS membership and only functions where an MLS exists.",
  },
  {
    q: "Do I need IDX for a real estate website outside the US?",
    a: "No. IDX syndicates listings from an MLS, and most markets — Europe, the Gulf, the Balkans, the Caucasus, most of Asia — have no MLS. What an international agency needs is its own catalogue built for search (a fast page per listing, schema, city/type catalogue pages), feeds out to the local portals, and languages for foreign buyers.",
  },
  {
    q: "A vendor offered me an “IDX-enabled” site in a non-MLS country. What am I buying?",
    a: "One of two things: ordinary search over your own stock marketed with an American term (fine, but don't pay IDX prices for it), or genuine US plumbing that will never connect to anything in your market. Ask one question — “which MLS does the feed come from?” — and the answer settles it.",
  },
  {
    q: "What's the advantage of NOT having an MLS?",
    a: "Exclusivity in search. In MLS markets, hundreds of broker sites display the same inventory, so Google has thousands of near-duplicate listing pages to choose from. In a non-MLS market your mandates live on your site alone — a properly built listing page has a real chance to rank, which is exactly how our own platform grew to ~5,900 monthly visitors without advertising.",
  },
];

const DOC = {
  _id: "glseo2026-idx-website-do-you-need",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW, readingTimeMinutes: 7,
  slugs: { en: { _type: "slug", current: "idx-website-do-you-need-one" } },
  title: en("IDX Websites Explained — and Why Agents Outside the US Don't Need One"),
  metaTitle: en("IDX Website: What It Is & Who Actually Needs One (2026)"),
  metaDescription: en("IDX lets US brokers show MLS listings on their own sites. Outside MLS markets there's nothing to connect it to — here's what international agents and agencies should build instead."),
  eyebrow: en("Guide · 7 min read"),
  lede: en("IDX is real, useful — and profoundly American. What it actually is, who genuinely needs it, and what agents in Europe, the Gulf and other non-MLS markets should build instead."),
  category: { _type: "reference", _ref: "10c16de9-82a6-4d3e-a5ac-0ae99056d446" },
  author: AUTHOR,
  tags: ["real-estate", "IDX", "guide"],
  relatedPostSlugs: ["sait-dlia-ahentsii-nerukhomosti", "vartist-rozrobky-saytu-2026"],
  body: { en: BODY_EN },
  faq: FAQ.map((f) => ({ _key: key(), _type: "faqItem", question: en(f.q), answer: enText(f.a) })),
};

async function run() {
  if (DRY) {
    const out = join(HERE, "out"); mkdirSync(out, { recursive: true });
    writeFileSync(join(out, `${DOC._id}.json`), JSON.stringify(DOC, null, 2));
    console.log(`dry-run: ${BODY_EN.length} blocks`); return;
  }
  const res = await client.createOrReplace(DOC);
  console.log(`created/replaced ${res._id} (${BODY_EN.length} blocks)`);
}
run().catch((e) => { console.error(e); process.exit(1); });
