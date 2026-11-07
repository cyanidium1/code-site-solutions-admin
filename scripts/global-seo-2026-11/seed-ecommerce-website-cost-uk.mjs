/**
 * EN-only blog post: "How much does an e-commerce website cost in the UK
 * (2026)". Targets the ecommerce cluster around /en/online-store —
 * "ecommerce website design/development" is the one big UK query family
 * without Ahrefs' Local flag (intl audit §5.2: 2,400 + 1,400/mo, KD 12).
 * Every figure read from the named source's live page on 07.11.2026
 * (dossier: frontend docs/global-seo/research/).
 *
 * Usage: node seed-ecommerce-website-cost-uk.mjs [--dry-run]
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
const key = () => `ec${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

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
const NOW = "2026-11-07T10:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("E-commerce website cost in the UK — the short version", [
    "“An e-commerce website” is three different purchases: a platform subscription (Shopify from £19/month), a setup/template build on that platform (£250–£2,200 published), or a custom build (£4,000–£22,000+ published).",
    "Published UK agency prices run from a £250 Shopify setup with 5 products to bespoke Shopify projects “from £22,000 + VAT”.",
    "Product count is the hidden multiplier: agencies price tiers by products loaded, and extras cost £5 each at one agency, up to £70/hour at another.",
    "Payment processing is the cost nobody budgets: 1.3–2.1% + 20–25p per transaction — and Shopify adds up to 2% extra if you use a third-party gateway.",
    "Most agency prices are ex-VAT; most platform pages don't mention VAT at all. Add 20% to your comparison sheet unless the page says otherwise.",
  ]),
  p("Ask what an online shop costs and the answers range from £19 a month to £22,000 — because “e-commerce website” covers three different products that only share a cart. This breakdown separates them, using only prices that UK vendors actually publish; we read every page cited here on 7 November 2026."),

  h2("Layer 1: the platform subscription"),
  table(
    ["Platform", "Published UK price", "Store transaction fee", "Source note"],
    [
      ["Shopify", "Basic £19/mo (annual) or £25 monthly; Grow £49/£65; Advanced £259/£344; Plus from £1,800/mo", "0% with Shopify Payments; +2%/1%/0.6% by plan with a third-party gateway", "shopify.com/uk/pricing, 07.11.2026"],
      ["Squarespace", "Basic £12/mo (annual) to Advanced £79/mo", "2% on Basic, 0% from Core; digital goods 7%/5%/1%", "GBP via startups.co.uk, updated 26.10.2026 — Squarespace geo-serves its own pricing page"],
      ["Wix", "Core £16/mo (annual); Business £25; Business Elite £119", "—", "GBP via startups.co.uk, dated 07.2025 — treat as indicative; Wix's own page shows USD “for reference only”"],
      ["BigCommerce", "publishes USD only, even on .co.uk: Core $29–$39/mo, Growth $79–$105, Scale $299–$399", "0% embedded; 2%/1%/0.6% open-provider fee", "bigcommerce.co.uk, 07.11.2026; prices stated tax-exclusive"],
    ]
  ),
  p("Two honest footnotes. Shopify's own UK pricing page doesn't state its VAT treatment (a third-party guide verified in October 2026 reports VAT-registered merchants aren't charged it, others get 20% added — confirm on your own invoice). And both Wix and Squarespace geo-serve their pricing pages, so their official GBP figures are effectively unpublishable — a small irony for platforms selling transparency."),

  h2("Layer 2: what UK agencies charge to build the shop"),
  table(
    ["Agency", "Published price", "What it is", "VAT"],
    [
      ["The Marketing Eye", "£250 / £450 / £999 one-off", "Shopify setup: 5 / 15 / 50 products loaded, payment and checkout configured; 5 days–3 weeks", "not stated"],
      ["Visibility Group", "from £999 / £1,499 / £2,199", "WooCommerce: 20/50/100 products, 12 months hosting + SSL, PayPal (2nd gateway from mid tier)", "+ VAT"],
      ["Blue Whale Media", "£995 / £1,500; top tier POA", "WordPress builds, 50/100 products, then £5 per extra product", "+ VAT"],
      ["ProfileTree", "from £4,000; bespoke WooCommerce £5,000–£15,000", "Full custom builds; the higher band covers several hundred product lines", "ex-VAT stated"],
      ["ALT Agency", "from £12,000; bespoke platform from £20,000", "Custom product/category design, two payment gateways included", "+ VAT"],
      ["Limely", "bespoke Shopify from £22,000", "Migrations, headless and B2B builds; 3–6 months discovery to launch", "+ VAT"],
    ]
  ),
  p("Market guides from London agencies bracket the same reality: “most spend £1,000 to over £15,000” (RVS Media), “£8,000–£30,000+” for e-commerce (Lilo). The spread isn't noise — it's the three products again: platform setup, template build, custom build."),

  h2("What actually moves the quote"),
  li("**Product count** — the clearest published driver. Tiers are priced by products loaded (5 to 100), and overruns are billed per product (£5 each) or per hour (up to £70). If your catalogue is 800 SKUs, say so in the first email; it changes the band."),
  li("**Payment gateways** — entry packages configure PayPal; a second gateway (Stripe, Worldpay) appears a tier up; “usually two included” only from the £12k custom band."),
  li("**Integrations** — email marketing, Google Shopping feeds, stock/ERP sync each move you up a tier."),
  li("**Platform choice** — the same catalogue costs £5,000–£7,000 on Shopify/WooCommerce but “£10,000 or upwards” on Magento/Adobe Commerce, per RVS's own guide."),
  li("**Custom vs template design** — the £12k+ band is where product and category pages are designed for your catalogue instead of themed around it."),

  h2("The ongoing costs, per the sources"),
  table(
    ["Cost", "Published figures", "Source"],
    [
      ["Card processing (platform)", "Shopify Payments 2% + 25p (Basic) to 1.3% + 25p (Plus); Wix Payments 2.1% + 20p; BigCommerce from 2.89% + $0.29", "official pricing pages, 07.11.2026"],
      ["Card processing (Stripe UK)", "1.5% + 20p standard UK cards; 2.5% + 20p EEA; 3.15% + 20p international; +2% currency conversion", "stripe.com/gb/pricing"],
      ["Third-party gateway penalty", "Shopify adds 2%/1%/0.6%/0.2% by plan on top of your gateway's own fees", "shopify.com/uk/pricing"],
      ["Managed hosting (WooCommerce route)", "£15–£60/mo (ProfileTree); £20–£100/mo (Lilo)", "agency guides, 2026"],
      ["Plugins/apps", "£100–£300/yr (ProfileTree); “£9.99 to £499.99 per year” (ALT)", "agency guides"],
      ["Maintenance", "£50–£300/mo across guides; ALT bills from £90 + VAT/hour", "agency guides"],
    ]
  ),
  p("Processing is the one everyone underestimates: at 2% + 25p, a shop turning over £10,000 a month pays roughly **£2,700 a year in card fees** before hosting, apps or a single design change. The platform subscription is the small line on that invoice."),

  h2("The VAT line, as usual"),
  p("Of the agency price lists we checked, four state +VAT explicitly and one states ex-VAT with the 20% consequence spelled out; the platforms mostly don't mention VAT at all, and BigCommerce prices exclude all taxes by its own note. The pattern across every niche we've researched holds: **assume ex-VAT unless the page says otherwise.** A non-UK supplier invoicing a VAT-registered business falls under the reverse charge instead — no VAT added to the invoice."),

  h2("Where we sit in this market"),
  p(`If you want a stock Shopify theme live next week, the £250–£999 setup packages above are the pragmatic buy, and we'd say so to your face. We build the other thing: [custom-coded online shops](/en/online-store) from **€3,900** — your design around your catalogue, product pages built for search, no theme licence, no platform subscription, and the code is yours. First year of hosting and support is in the price; we invoice from Ukraine, so VAT-registered UK businesses account for it under the reverse charge. The full breakdown is on [the pricing page](/en/pricing), and [the calculator](/en/calculator) gives a figure for your own catalogue in two minutes.`),
  cta(
    "Comparing a platform subscription against owning your shop?",
    "Tell us your catalogue size and what you sell — we'll say honestly which of the three products above you actually need, within a day.",
    "Ask us directly",
    "/en/contacts"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "How much does an e-commerce website cost in the UK?",
    a: "It depends which of three products you're buying, per prices published in November 2026: a platform subscription runs £12–£344 per month (Shopify Plus from £1,800); a setup or template build on a platform costs £250–£2,200; a custom build runs £4,000–£15,000, with premium bespoke Shopify projects published at £22,000+ VAT.",
  },
  {
    q: "What's cheaper long-term — Shopify or a custom shop?",
    a: "Shopify is cheaper to start and carries the platform's maintenance; the costs that grow with you are the subscription, apps and processing (2% + 25p on Basic, plus up to 2% extra for third-party gateways). A custom build costs more upfront but has no subscription or theme licence and standard card processing only. The crossover depends on turnover and how much the theme limits you — run both numbers over three years.",
  },
  {
    q: "Why do agencies price online shops by the number of products?",
    a: "Because loading and structuring the catalogue is the labour. Published UK tiers run 5 to 100 products, with overruns billed at £5 per product at one agency or up to £70 per hour at another. Several hundred product lines push a build into the £5,000–£15,000 band in published guides.",
  },
  {
    q: "What ongoing costs should an online shop budget for?",
    a: "Card processing first — 1.3–2.1% + 20–25p per transaction at the platforms, 1.5% + 20p standard at Stripe UK, and roughly £2,700 a year at £10k monthly turnover. Then hosting (£15–£100/month published for WooCommerce routes), apps and plugins (£100–£500/year), and maintenance (£50–£300/month across UK guides).",
  },
  {
    q: "Do these prices include VAT?",
    a: "Mostly not. Four of the six agency price lists we checked state +VAT, one spells out ex-VAT with 20% added for non-registered buyers, and the platforms largely don't mention VAT. Add 20% when comparing — unless the supplier is outside the UK, in which case a VAT-registered business accounts for it under the reverse charge.",
  },
];

const DOC = {
  _id: "glseo2026-ecommerce-website-cost-uk",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 9,
  slugs: { en: { _type: "slug", current: "ecommerce-website-cost-uk-2026" } },
  title: en("How Much Does an E-commerce Website Cost in the UK? Published Prices, Checked (2026)"),
  metaTitle: en("Ecommerce Website Cost UK 2026: Published Prices Compared"),
  metaDescription: en("What an online shop really costs in the UK: platform subscriptions from £12/mo, setup packages from £250, custom builds to £22,000+ — plus processing fees and VAT, checked November 2026."),
  eyebrow: en("Pricing research · 9 min read"),
  lede: en("“E-commerce website” covers three different purchases that only share a cart. We separated them using the prices UK platforms and agencies actually publish — every page checked on 7 November 2026."),
  category: { _type: "reference", _ref: "17bbbe63-1af4-4006-abe5-f0fbdf97efd1" },
  author: AUTHOR,
  tags: ["ecommerce", "pricing", "UK", "research"],
  relatedPostSlugs: ["vartist-rozrobky-saytu-2026", "internet-mahazyn-avtozapchastyn"],
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
