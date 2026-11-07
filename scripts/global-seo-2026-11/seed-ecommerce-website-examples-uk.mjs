/**
 * EN-only blog post: "E-commerce website examples: 12 real UK online shops
 * reviewed". Completes the ecommerce cluster with
 * ecommerce-website-cost-uk-2026 around /en/online-store.
 * SERP check 07.11.2026: ranking listicles are giant-heavy (Amazon/ASOS),
 * dated 2023-24, or agency advertorials — no evidence-based review of real
 * independent UK shops. Every observation from the named shop's live pages
 * on 07.11.2026 (dossier: frontend docs/global-seo/research/). JS-dependent
 * absences are worded as provisional.
 *
 * Usage: node seed-ecommerce-website-examples-uk.mjs [--dry-run]
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
const key = () => `es${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

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
const num = (t) => ({ ...p(t), listItem: "number", level: 1 });
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
const NOW = "2026-11-07T12:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("12 UK online shops, reviewed — the short version", [
    "We walked through 12 live UK independent online shops on 7 November 2026 — DTC food brands, outdoor clothing, leather goods, homeware, a B2B packaging supplier — and recorded what the pages actually show, down to the raw HTML.",
    "The best product pages read like a knowledgeable shop assistant: Finisterre shows the fit model's height and size, in-store stock, 964 reviews with an AI summary, and names the factory.",
    "The sector's signature failure is the self-contradicting policy: we documented seven shops whose own pages disagree with themselves — two return windows, two free-delivery thresholds, two next-day prices.",
    "Only 1 of 12 shops shows its company number in the footer; none shows a VAT number. Every shop shouts its free-delivery threshold; almost none says what delivery costs below it until you dig.",
    "Page weight is a choice: most homepages carry 77–106 script tags and megabyte HTML, while Hiut Denim proves the same platform runs on 18 scripts.",
  ]),
  p("Search “best ecommerce websites UK” and you get lists of Amazon, ASOS and Argos — dated 2023, useless to anyone building a shop with a marketing budget smaller than a retail park. So we reviewed the sites that are actually comparable: 12 independent UK online shops, from a Welsh jeans maker to a Derby packaging wholesaler, reading both the rendered pages and the raw HTML on 7 November 2026."),
  p("Method note: several shops render reviews, sizes and footers with JavaScript, so where we say something is missing we mean missing from what we could verify — and we flag the one case where that distinction bit us."),

  h2("The ones worth learning from"),

  h3("Finisterre — the product page as a shop assistant"),
  p("The Cornish outdoor brand's £250 jacket page answers every question a buyer would ask a human: the fit model's height and the size he's wearing, a “find your size” tool, **stock in nearby stores**, 4.9 from 964 Okendo reviews with an AI-generated summary, delivery and return costs by country inline, technical specs down to hydrostatic head and grams — and the name of the factory in China that made it. That last detail is the one most brands hide; here it reads as confidence."),

  h3("Cambridge Satchel — dimensions that sell"),
  p("A £195 bag page with external, internal, pocket and strap-drop measurements in centimetres and inches — and then the detail that converts: a “**what fits inside**” list (sunglasses, phone, keys). Yotpo reviews with search and filters (4.8 from 291), personalisation, in-store availability. The lesson: for physical goods, precision about size does what adjectives can't."),

  h3("Seasalt Cornwall — reviews with fit data, and the only honest footer"),
  p("Product reviews carry the buyer's height and per-review fit verdicts (“Size: just right / Length: too short”) — review data a shopper can calibrate against herself. And Seasalt is the **only shop of the twelve whose footer shows its company number and registered address**. That's a legal nicety most DTC brands skip; on a site asking for £69 before you've touched the fabric, it's also a conversion asset."),

  h3("Oliver Bonas — the delivery matrix done right"),
  p("Every service priced, every cut-off stated, furniture and collection options included — and the page says “Last updated 26/08/2026”. Across four niches of research we've found dated policy pages to be nearly extinct; this is one of the few. (The same site's review counts disagree across three pages — 566,151 vs 566,620 vs a pagination total — which shows how hard consistency is even for the disciplined.)"),

  h3("Davpack — B2B patterns the DTC world should steal"),
  p("A packaging wholesaler whose search has a **“Box Size” tab** — customers search by dimensions, so the site lets them. Product tables show internal and external measurements, Royal Mail format compatibility and five quantity-break price tiers. At 75KB of homepage HTML it's also the leanest site in the set. The blemish: “free delivery over £100” and “free over £150” on the same homepage."),

  h3("Pip & Nut — proof at the point of decision"),
  p("1,793 Bazaarvoice reviews with the full star distribution visible (1,264 five-star, 35 one-star — showing the bad ones is what makes the good ones believable), bundle pricing and the free-delivery threshold repeated right at the add-to-cart button. Decision information lives where the decision happens."),

  h2("All 12 at a glance"),
  table(
    ["Shop", "Category / platform", "Strongest element", "Weakest element"],
    [
      ["Finisterre", "Outdoor clothing · Shopify", "Fit data, store stock, 964 reviews, named factory", "415 homepage images, only a quarter lazy-loaded"],
      ["Cambridge Satchel", "Leather goods · Shopify", "Dimensions + “what fits inside”; Yotpo 4.8/291", "£9.95 vs £12.95 next-day on the same site"],
      ["Seasalt", "Fashion · Magento", "Fit-data reviews; only footer with a company number", "“120,000 reviews” claim carries no score"],
      ["Oliver Bonas", "Fashion & home · Magento", "Dated, complete delivery matrix", "Three different review counts; free-vs-paid returns contradiction"],
      ["Pip & Nut", "Food DTC · Shopify", "1,793 reviews with star distribution; bundle at add-to-cart", "No company details in the footer at all"],
      ["Davpack", "B2B packaging · custom", "Search by box size; quantity-break tables; 75KB homepage", "Two free-delivery thresholds on one homepage"],
      ["Hiut Denim", "Fashion · Shopify", "18 scripts, 90-day returns, free repairs for life", "No UK delivery cost stated anywhere; identical alt text on all 13 photos"],
      ["Grind", "Coffee DTC · Shopify", "Copy with personality; subscription economics upfront", "“Delivery & Refunds” page contains no refund terms"],
      ["Cox & Cox", "Home & furniture · Magento", "Phone + WhatsApp; comparison table of 15 products", "“40,000+ five star reviews” as plain unlinked text; 8–10 vs 6–12 week conflict"],
      ["Ellis Brigham", "Outdoor retail · headless Nuxt", "In-store availability across 12 stores; spec tabs", "Portfolio invisible without JavaScript; duplicate product cards in listings"],
      ["Bramley", "Beauty DTC · Shopify", "Points, reviews on cards, dated journal", "7-day vs 14-day return windows across two pages; policy dated 2023"],
      ["teapigs", "Tea · THG platform", "Subscribe & Save flexibility (1–16 weeks)", "Flagship product shows zero reviews; 3–5 vs 2–3 day delivery conflict"],
    ]
  ),

  h2("What the strong ones share"),
  num("**Product pages that answer buyer questions in order:** size/fit with real reference points, stock and delivery certainty, reviews with volume and distribution, and the cost of changing your mind — before the add-to-cart, not in a policy PDF."),
  num("**Reviews from a named widget with score AND count** (Okendo 4.9/964, Yotpo 4.8/291, Bazaarvoice 4.6/1,793) — and visible negative reviews, which make the positives credible."),
  num("**The free-delivery threshold repeated at the point of decision**, not only in the top bar."),
  num("**Physical-world honesty:** named factories, fibre certificates, fit models, in-store stock. The internet's oldest conversion problem — “will it be like the photo?” — is solved with specifics, not lifestyle photography."),
  num("**Leanness as discipline:** the two fastest sites in the set (Hiut, Davpack) are the two with the fewest third-party scripts. Same platforms, different choices."),

  h2("What most get wrong"),
  li("**Policies that contradict themselves — the sector's signature failure.** Seven of twelve shops disagree with their own pages: two return windows and three contact emails at one brand, two free-delivery thresholds on a single homepage at another, two next-day prices, a delivery page with two different timescales, a refunds page without refund terms. Nobody reads these pages until they're annoyed — exactly the moment contradictions cost the most."),
  li("**The invisible company.** One of twelve shops shows a company number; zero show VAT numbers; most DTC brands offer no phone and no address — just an email and a parcel of trust. UK distance-selling buyers notice, and so do payment disputes."),
  li("**The threshold trick.** Every shop advertises “free delivery over £X” in the top bar; almost none says what delivery costs under £X without a trip to the policy page — and one brand never states its UK delivery cost at all."),
  li("**Unlinked review claims.** “40,000+ five-star reviews” as plain text, “120,000 reviews” with no score, “10,000+ Excellent” with no number. A linked widget with score and count costs nothing and is the difference between proof and decoration."),
  li("**Script bloat as default.** 77–106 script tags and megabyte HTML pages are the norm — popups, trackers, personalisation engines stacked on a theme. The lean exceptions prove it's a choice, and Core Web Vitals pay for it either way."),
  li("**JavaScript-only content.** One retailer's entire catalogue and footer render client-side; another platform ships a 6.5KB empty shell. Whatever can't be read without JavaScript is invisible to some crawlers, slow for everyone, and fragile."),

  h2("The checklist, if yours is next"),
  num("Product pages carry size/fit with a reference human, stock status, delivery cost and the returns deal — at the decision point."),
  num("One review widget, named, linked, with score, count and the negative reviews showing."),
  num("Delivery costs below the free threshold stated wherever the threshold is advertised."),
  num("One version of every policy: returns window, delivery price, contact email. Audit them against each other quarterly — and date the page."),
  num("Company number, registered address and a phone or live chat in the footer. You're asking strangers for card details."),
  num("A script budget. Every app and tracker earns its place or goes."),
  p("What a build like this costs — platform subscriptions, setup packages and custom builds, with every published UK price checked — is in [our e-commerce cost breakdown](/en/blog/ecommerce-website-cost-uk-2026); how we build online shops is on [the online shop page](/en/online-store)."),

  cta(
    "Building an online shop that converts like the good ones?",
    "Custom-coded shops from €3,900 — your design around your catalogue, product pages built for search, no theme bloat, and the code is yours. First year of hosting and support included.",
    "See the online shop package",
    "/en/online-store"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "What makes a good e-commerce website?",
    a: "From our November 2026 review of 12 UK shops: product pages that answer fit, stock, delivery cost and returns at the point of decision; reviews from a named widget with score, count and visible negatives; delivery costs stated below the free threshold, not just the threshold; consistent policies; company details in the footer; and a disciplined script budget — the fastest sites in our set were the ones with the fewest third-party scripts.",
  },
  {
    q: "What should an e-commerce product page include?",
    a: "The strongest UK product pages we reviewed show size and fit against a real reference (model height and size worn), live stock including in-store availability, the delivery threshold and cost at the add-to-cart button, reviews with full star distribution, precise dimensions with a “what fits inside” style answer for physical goods, and material or technical specs — one even names its factory.",
  },
  {
    q: "What are the most common mistakes on UK online shops?",
    a: "Self-contradicting policies top the list — seven of the twelve shops we reviewed disagree with their own pages on return windows, delivery prices or thresholds. Then: no company number or phone anywhere (one of twelve shows a company number), free-delivery thresholds advertised without the sub-threshold cost, unlinked review claims without scores, and homepages carrying 77–106 script tags.",
  },
  {
    q: "How were these examples chosen and checked?",
    a: "We reviewed 12 independent UK online shops on 7 November 2026 — DTC brands and SME retailers across food, fashion, outdoor, home, beauty and B2B supplies — reading both rendered pages and raw HTML, including each shop's delivery and returns pages. Every observation comes from the named shop's live pages that day; where content renders only with JavaScript, we say so rather than claiming absence.",
  },
];

const DOC = {
  _id: "glseo2026-ecommerce-website-examples-uk",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 11,
  slugs: { en: { _type: "slug", current: "ecommerce-website-examples-uk" } },
  title: en("E-commerce Website Examples: 12 Real UK Online Shops Reviewed (2026)"),
  metaTitle: en("Ecommerce Website Examples UK: 12 Shops Reviewed (2026)"),
  metaDescription: en("12 live UK independent online shops reviewed in November 2026 — the product pages worth copying, the self-contradicting policies everyone ships, and a checklist for your own store."),
  eyebrow: en("Research · 11 min read"),
  lede: en("We reviewed 12 real UK independent online shops — down to the raw HTML — and recorded what the pages actually show: product pages, policies, reviews, scripts. Here's what separates the shops that convert."),
  category: { _type: "reference", _ref: "17bbbe63-1af4-4006-abe5-f0fbdf97efd1" },
  author: AUTHOR,
  tags: ["ecommerce", "examples", "UK", "research"],
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
