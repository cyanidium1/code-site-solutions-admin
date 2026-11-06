/**
 * EN-only blog post: "How much does an estate agent website cost in the UK
 * (2026)". Completes the estate-agent cluster around
 * /en/sites-for/real-estate. Every figure was read from the named source's
 * live page on 06.11.2026 (research dossier: frontend docs/global-seo/research/).
 *
 * Usage: node seed-estate-agent-website-cost-uk.mjs [--dry-run]
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
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false,
});

let keySeq = 0;
const key = () => `ea${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

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
const h3 = (t) => p(t, "h3");
const li = (t) => ({ ...p(t), listItem: "bullet", level: 1 });
const tldr = (title, items) => ({ _key: key(), _type: "tldrBox", title, items });
const table = (headers, rows) => ({
  _key: key(), _type: "blogTable", headers,
  rows: rows.map((cells) => ({ _key: key(), _type: "blogTableRow", cells })),
});
const cta = (heading, sub, label, href) => ({
  _key: key(), _type: "ctaCallout",
  heading, sub, ctaLabel: label, ctaHref: href,
  title: heading, text: sub, buttonLabel: label, buttonHref: href,
});

const AUTHOR = {
  name: "Fedir Alpatov", role: "Founder & Tech Lead",
  bio: "Founder of Code-Site.Art. I do the tech-lead work and write about real figures from 50+ projects.",
  photoUrl: "/team/fedir-avatar.jpg",
};
const NOW = "2026-11-06T16:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("Estate agent website cost in the UK — the short version", [
    "This niche prices differently from the rest of web design: most specialist vendors sell a monthly subscription (£88–£259/month published), not a one-off build.",
    "Published one-off options run from a £199/year WordPress plugin to £1,250–£2,000 + VAT templates, with one premium specialist stating a £1,600–£30,000 range.",
    "The subscription usually bundles hosting, SSL and maintenance — but CRM feed changes, instant valuation tools (£60 + VAT/month at one vendor) and portal exports are often extras.",
    "The real decision isn't the price band — it's subscription platform vs owned website: stop paying a platform and the site is gone.",
    "Most prices are quoted ex-VAT where VAT is mentioned at all; several major vendors publish no prices whatsoever.",
  ]),
  p("Ask what a law firm or builder's website costs and you'll hear one-off project prices. Ask about an estate agency website and the answers come as monthly fees — because this niche is dominated by specialist platform vendors who host your site, feed it from your CRM and charge by the month. That changes both the maths and the risks, so this breakdown treats the two models separately."),
  p("Everything below was read from the named company's live pages on 6 November 2026. Where a vendor publishes no price — and several of the biggest names don't — we say so instead of guessing."),

  h2("What the specialist vendors publish, November 2026"),
  table(
    ["Vendor", "Published price", "Model", "VAT"],
    [
      ["Property Hive (WordPress plugin)", "£0 core / £199–£299 per year (1 site)", "DIY licence; hosting and portal subscriptions extra", "excl. taxes"],
      ["LOS Digital", "£88 or £166/month, no setup fee", "Rolling monthly subscription; design, hosting, CRM feed, maintenance", "not stated"],
      ["EstateApps", "£99–£159/month (up to £259)", "Subscription + unpriced build fee; 1–3 support hours/month included", "excl. VAT"],
      ["AgentPro", "from £99 / £175 / £225 per month", "Subscription tiers (CMS → bespoke design)", "not stated"],
      ["Homeflow", "from £159/month; build fee unpriced", "Platform subscription; 50% startup discounts published", "not stated"],
      ["Spectre website builder", "from £159/month, no setup fee", "Subscription; listings sync from Street CRM", "not stated"],
      ["PropertyWebBuilder", "£1,500 build + £99/month care", "One-off build plus managed hosting", "not stated"],
      ["The Property Jungle", "templates from £1,250 / £2,000", "One-off template build", "+ VAT"],
      ["PropertyStream", "range stated as £1,600–£30,000", "One-off or staged; valuation tool £60/month extra", "+ VAT on add-ons"],
    ]
  ),
  p("Also worth knowing: Property Webmasters, Technicweb (now part of Zoopla), Expert Agent, Starberry and Reapit publish no website prices at all — Expert Agent says only “a small upfront payment and a low monthly subscription”. When half the market hides its numbers, the published half above is your negotiating anchor."),

  h2("The two models, honestly compared"),
  h3("Subscription platform: £88–£259/month, live fast"),
  p("What you're really buying is the plumbing: the live feed from your CRM (Alto, Reapit, Jupix, Street and the rest), hosting, SSL and maintenance bundled, and a site that launches in days — one vendor quotes “usually under 10 days”. For an agency whose stock already flows CRM → Rightmove/Zoopla, this is genuinely efficient, and we'd be the wrong people to pretend otherwise."),
  p("The costs that don't make the headline figure: support capped in hours (one vendor includes 1–3 hours a month, use-it-or-lose-it, then £60/hour), CRM switches quoted separately, instant valuation tools as paid add-ons, and the compounding arithmetic — £159/month is £5,724 over three years, and at the end of it you own nothing. Cancel, and the website ceases to exist."),
  h3("Owned website: £1,250–£30,000 once, yours permanently"),
  p("One-off builds run from £1,250–£2,000 + VAT for niche templates through £1,500 + £99/month hybrids to a specialist's stated £1,600–£30,000 range, with builds “typically two to four months” at the premium end. What the one-off price buys is independence: the design is yours, the code is yours, and no monthly invoice decides whether your website stays online. What it doesn't automatically buy is the CRM plumbing — feed integrations are typically quoted separately, so ask for that line item before comparing totals."),

  h2("What actually moves the price, per the vendors themselves"),
  li("**CRM integration** — one specialist calls it “the single most important technical requirement”. Per-branch pricing is common in the niche and mostly unpublished."),
  li("**Portal feeds** — bundled by some, a third-party subscription at others (the WordPress route prices feed add-ons at £49–£99/year)."),
  li("**Instant valuation tools** — the classic lead magnet is a separate product: £60 + VAT/month at one vendor, a separate ValPal subscription at another."),
  li("**Template vs tailored design**, number of pages, area guides and SEO scope."),
  li("**The support model** — capped hours vs “unlimited maintenance”; extra time at £50–£150/hour across sources."),

  h2("The VAT line, again"),
  p("Same story as the rest of UK web design: where VAT is mentioned at all, prices are quoted excluding it (The Property Jungle, EstateApps, Property Hive); most subscription vendors don't mention it. Add 20% to your comparison sheet unless a page says otherwise. Non-UK suppliers invoicing a VAT-registered agency fall under the reverse charge instead — no VAT is added to the invoice."),

  h2("Where we sit in this market"),
  p(`We're not a portal-feed platform, and if your whole operation runs CRM-to-portals and you want a brochure site wired into that pipeline next week, a subscription vendor above is the pragmatic buy. We build the other thing: [custom-coded estate agency websites](/en/sites-for/real-estate) from **€5,500** that you own outright — your design, your code, your property pages built for search rather than rented from a template pool. Our reference project is [Domlivo](/en/portfolio/domlivo), a property marketplace we built and run: listing pages, search, maps, multilingual SEO. First year of hosting and support is in the price, there's no monthly platform fee after that, and we invoice from Ukraine so VAT-registered UK agencies account for it under the reverse charge. Full numbers are on [the pricing page](/en/pricing); [the calculator](/en/calculator) prices your own scope in two minutes.`),
  cta(
    "Weighing a platform subscription against owning your site?",
    "Tell us your CRM and what the current site does — we'll say honestly which side of this trade-off your agency is on, within a day.",
    "Ask us directly",
    "/en/contacts"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "How much does an estate agent website cost in the UK?",
    a: "Published prices in November 2026: specialist platform subscriptions run £88–£259 per month (hosting and maintenance bundled, setup often free), one-off niche templates cost £1,250–£2,000 plus VAT, and one premium specialist states a £1,600–£30,000 range for full builds. Several major vendors publish no prices and quote per project.",
  },
  {
    q: "Why are estate agency websites priced as monthly subscriptions?",
    a: "Because the specialist vendors bundle the property plumbing: a live feed from your CRM, hosting, SSL and maintenance in one monthly fee. It gets an agency live in days. The trade-off is ownership — stop paying and the site is gone, and £159 a month is £5,724 over three years with nothing owned at the end.",
  },
  {
    q: "What do the subscriptions leave out?",
    a: "Commonly: instant valuation tools (one vendor prices its tool at £60 plus VAT per month, another requires a separate ValPal subscription), CRM or feed changes (quoted separately), support beyond a monthly cap of 1–3 hours (then around £60 per hour), and domain registration at some vendors.",
  },
  {
    q: "Do I need Rightmove integration on my own website?",
    a: "Your portal listings come from your CRM, not your website — several vendors note the CRM already sends stock to Rightmove and Zoopla. What your own site needs is a feed FROM the CRM so your listings appear on your domain too. If you buy a one-off build, ask for the feed integration as a separate line item before comparing quotes.",
  },
  {
    q: "Do these prices include VAT?",
    a: "Mostly not. Where VAT is mentioned at all in the November 2026 price lists, figures exclude it; many vendors don't mention it. Add 20% when comparing, unless the supplier is outside the UK — then a VAT-registered agency accounts for it under the reverse charge.",
  },
];

const DOC = {
  _id: "glseo2026-estate-agent-website-cost-uk",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 9,
  slugs: { en: { _type: "slug", current: "estate-agent-website-cost-uk-2026" } },
  title: en("How Much Does an Estate Agent Website Cost in the UK? Published Prices, Checked (2026)"),
  metaTitle: en("Estate Agent Website Cost UK 2026: Published Prices Compared"),
  metaDescription: en("What UK vendors actually charge for estate agency websites: subscriptions from £88/month, templates from £1,250, bespoke to £30,000 — plus the add-ons and VAT lines, checked November 2026."),
  eyebrow: en("Pricing research · 9 min read"),
  lede: en("Estate agency websites are priced differently from the rest of web design — mostly as monthly platform subscriptions. We checked every published UK price on 6 November 2026 and compared the two models honestly."),
  category: { _type: "reference", _ref: "10c16de9-82a6-4d3e-a5ac-0ae99056d446" },
  author: AUTHOR,
  tags: ["real-estate", "pricing", "UK", "research"],
  relatedPostSlugs: ["sait-dlia-ahentsii-nerukhomosti", "vartist-rozrobky-saytu-2026"],
  body: { en: BODY_EN },
  faq: FAQ.map((f) => ({
    _key: key(), _type: "faqItem",
    question: en(f.q), answer: enText(f.a),
  })),
};

async function run() {
  if (DRY) {
    const out = join(HERE, "out");
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, `${DOC._id}.json`), JSON.stringify(DOC, null, 2));
    console.log(`dry-run: wrote out/${DOC._id}.json (${BODY_EN.length} blocks)`);
    return;
  }
  const res = await client.createOrReplace(DOC);
  console.log(`created/replaced ${res._id} (${BODY_EN.length} blocks)`);
}
run().catch((e) => { console.error(e); process.exit(1); });
