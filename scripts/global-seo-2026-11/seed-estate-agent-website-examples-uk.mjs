/**
 * EN-only blog post: "Estate agent website examples (UK): 12 real sites
 * reviewed". SERP check 06.11.2026: the commercial query is owned by vendor
 * service pages; no editorial gallery of real UK agent sites with verified
 * observations exists. Every observation below was made on the named
 * agency's live pages on 06.11.2026 (dossier: frontend docs/global-seo/research/).
 * Claims about things NOT found are worded against the served HTML, because
 * many agency pages render listings/widgets client-side.
 *
 * Usage: node seed-estate-agent-website-examples-uk.mjs [--dry-run]
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
const key = () => `ex${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

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
const NOW = "2026-11-06T17:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("12 UK estate agency websites, reviewed — the short version", [
    "We walked through 12 live UK estate agency websites on 6 November 2026 — Savills and Knight Frank down to a single-office Bristol lettings specialist — and recorded only what the pages show.",
    "Every “instant” valuation tool we tested asks for your contact details before showing a figure. Not one shows the estimate first.",
    "The best listing page in the set belongs to a local independent, not a national brand: 32 photos, floorplan, EPC rating, council tax band, tenure and a virtual tour on the agent's own domain.",
    "The phone number is missing from the first screen at most national brands; the smaller the agency, the more visible the phone.",
    "Review numbers contradict themselves at two major brands — different counts on different pages of the same site. Fee pages are almost universally undated.",
  ]),
  p("Search “best estate agent websites UK” and you get proptech vendors marketing their own platforms. Nobody seems to have opened real UK agency websites and written down what's actually on them. So we did: 12 live sites on 6 November 2026 — two prime nationals, a London chain, an online hybrid, a premium franchise network, a lettings-led franchise, three regional independents, two local family firms and a city lettings specialist."),
  p("A note on method: many agency sites render listings and widgets with JavaScript, so where we say something is missing, we mean missing from the served page HTML — and we checked inner pages, not just homepages. What a site puts in its HTML is also what search engines reliably see, so the distinction matters twice."),

  h2("The ones worth learning from"),

  h3("Petty Son & Prestwich (Wanstead, est. 1908) — the best listing page in the set"),
  p("A two-office East London independent outclasses every national brand where it counts most: the property page. A £1m listing carries **32 photos, a floorplan, the EPC rating (E39) with the certificate image, council tax band, tenure and an MP4 virtual tour** — plus material-information sections for utilities, rights and flood risk. The footer does compliance properly: ARLA, NAEA, safeagent and The Property Ombudsman logos with links to the Propertymark rules, a complaints PDF and the Client Money Protection certificate. The gap: many material-information values still read “Ask Agent”, and the landlord fees page links two different fee schedule PDFs without saying which is current."),

  h3("Ashtons (York) — how to publish fees"),
  p("The only fees page in the set that gets everything right at once: figures with VAT shown both ways (“13% plus VAT of the monthly rental income”, “£500 plus VAT (£600)”), the Client Money Protection scheme **named** with a certificate linked, and the complaints procedure attached. The homepage carries branch-level phone numbers, a real property search, and TPO/ARLA/NAEA logos. Blemishes exist — one listing shows “EPC TBC”, and two different out-of-hours maintenance numbers appear in two pop-ups — but as a template for lettings fee transparency, this is the page to copy."),

  h3("Knight Frank and Fine & Country — content with dates on it"),
  p("Knight Frank's insights were dated the very day we fetched them — 6 November 2026 — with landlord and tenant fee schedules published as dated PDFs (June 2026). Fine & Country backs its premium positioning with **13 dated market reports, 11 of them regional** (September–October 2026). That cadence is the moat: a seller deciding who understands their market can see the evidence refreshed monthly. Both, however, hide the phone from the first screen, and neither names a redress scheme in page text."),

  h3("Foxtons — the search-first homepage, with a schema problem"),
  p("The only big brand whose first screen has a real search box — buy/rent, map, travel-time, schools, stations — next to a valuation CTA and monthly market reports whose text lives in the HTML, not behind scripts. But the trust data disagrees with itself: the homepage schema declares a 4.5 rating from **8,756** reviews while the valuation page claims **15,000+** Google reviews, the phone number exists only in the structured data, and the tenant fees page names no redress scheme. Strong skeleton, careless bookkeeping."),

  h3("Henry Adams (West Sussex) — reviews done properly"),
  p("“2,176 five-star reviews on Feefo and counting” — a named platform, a real count, a Platinum Trusted Service award five years running, and a TPO logo that actually links to tpos.co.uk. That one line does more work than a wall of anonymous praise. The rest of the site is conservative (no instant valuation, branch-picker appointment booking), which for a 16-branch regional firm is a defensible choice honestly presented."),

  h2("All 12 at a glance"),
  table(
    ["Agency", "Type", "Strongest element", "Weakest element"],
    [
      ["Petty Son & Prestwich", "Local independent, E. London", "Listing pages: EPC, council tax, tenure, virtual tour", "Two conflicting landlord fee PDFs; “Ask Agent” fields"],
      ["Ashtons", "Local independent, York", "Fees with VAT both ways; CMP named + certificate", "“EPC TBC” listing; two emergency numbers"],
      ["Knight Frank", "National prime", "Insights dated same-day; dated fee PDFs", "No phone on first screen; no redress named in text"],
      ["Fine & Country", "Premium franchise", "13 dated market reports, 11 regional", "Valuation result gated behind contact details; undated blog"],
      ["Foxtons", "London chain", "Real search box; monthly reports in HTML", "8,756 vs 15,000 review counts; phone only in schema"],
      ["Henry Adams", "Regional, 16 branches", "Feefo 2,176 five-star + linked TPO logo", "No phone on homepage; no fees page found"],
      ["Savills", "National prime", "Lettings fees with figures, stated inc-VAT", "One regional fee line contradicts the inc-VAT rule; no year in footer"],
      ["Webbers", "Regional, South West", "Header phone; real search; instant valuation offered", "“95.2% from 1,900 reviews” names no platform; no redress named"],
      ["Bradley Hall", "Regional, North East", "RICS + PRS logos; tabbed resi/commercial/auction search", "Google 4.6 with no count; listing lacks tenure and council tax"],
      ["Purplebricks", "Online hybrid", "Fee calculator on the first screen (£999 fixed)", "116k vs 136k review counts; only one price band published"],
      ["Martin & Co", "Lettings-led franchise", "Dated guides; instant valuation offered", "Broken “Every 0 minutes” counters; landlord fees pushed to branch pages"],
      ["Gough Quarters", "Lettings specialist, Bristol", "Fees with figures, VAT-inclusive, on one page", "Header tel: link has a wrong digit; redress logos unnamed in text"],
    ]
  ),

  h2("What the strong ones share"),
  num("**Complete listing data on their own domain** — floorplan, EPC rating, tenure, council tax. The portals mandate this data; the agents who mirror it on their own site keep the visitor (and the search engine) there."),
  num("**Fees with figures, VAT stated, scheme named.** Ashtons and Gough Quarters publish real numbers; Knight Frank dates its PDFs. Lettings fee transparency is a legal requirement — the strong sites treat it as a selling point instead of a buried PDF."),
  num("**A named review platform with a count.** Feefo 2,176 beats “rated excellent” every time."),
  num("**Dated market content, refreshed monthly** — the single clearest differentiator between the premium brands and everyone else."),
  num("**A real search box on the first screen** — Foxtons, Fine & Country, Ashtons, Webbers, Bradley Hall. If you hold stock, show it."),
  num("**Visible phones at the small firms.** Webbers, Ashtons, Gough Quarters and Petty's all put numbers in the header or office blocks — the brands that most need the call make it easiest."),

  h2("What most get wrong"),
  li("**The valuation funnel takes before it gives.** Every instant-valuation tool we tested — across three different agencies — demands name, email and phone before revealing the estimate; the prime brands only offer a request-a-visit form. Compare the best UK trades sites, where the calculator shows the figure first and converts better for it. The first agency in a local market to show the number before the form wins the lead."),
  li("**Redress exists as an unnamed logo.** TPO or PRS should be a sentence with a link, not a mystery badge whose meaning lives in an image filename. Several fee pages name no redress scheme at all, and membership logos often link to association homepages rather than the agent's verifiable entry."),
  li("**Review arithmetic that doesn't add up.** Two different counts on two pages of the same site, a percentage with no platform, self-hosted reviews with no dates. Trust data is the one place a mismatch costs you twice."),
  li("**Undated fee pages.** Almost universal in the set. Fees change; an undated fee page makes every number on it deniable — and disputable."),
  li("**Listings hidden behind JavaScript.** Several search pages serve empty HTML and paint results client-side. The stock is the product; served-markup listings are both crawlable and resilient."),
  li("**Small breakage with outsized cost:** a telephone link with a wrong digit, “Every 0 minutes” counters, two conflicting emergency numbers, missing footer years. On a site asking to be trusted with a house sale, these read as carelessness."),

  h2("The checklist, if yours is next"),
  num("First screen: search box over your own stock, a visible phone, and a valuation CTA that states what happens next."),
  num("If the valuation is “instant”, show the estimate before asking who they are — collect contact details to refine, not to reveal."),
  num("Listing pages carry photos, floorplan, EPC rating, tenure, council tax and the material information — on your domain, in the HTML."),
  num("Fees: figures, VAT treatment, a date, and the redress scheme and CMP provider named in words with verifiable links."),
  num("One review platform, linked, with the live score and count — and the same number on every page."),
  num("Market content with dates, even if it's one local report a quarter."),
  p("What a site like this costs — including why this niche prices as monthly subscriptions and when that's the right buy — is in [our estate agent website cost breakdown](/en/blog/estate-agent-website-cost-uk-2026); how we build for the sector is on [the estate agent website page](/en/sites-for/real-estate)."),

  cta(
    "Building an estate agency website that holds its own stock?",
    "We build custom property platforms — listing pages, search, maps, multilingual SEO — that you own outright. From €5,500, no monthly platform fee.",
    "See the estate agent package",
    "/en/sites-for/real-estate"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "What makes a good estate agent website?",
    a: "From our November 2026 review of 12 UK agency sites: a property search over the agent's own stock on the first screen, a visible phone number, listing pages carrying EPC, tenure, council tax and floorplans on the agent's own domain, fee pages with real figures and a named redress scheme, reviews with a platform and count, and dated market content.",
  },
  {
    q: "Should an estate agent website have an instant valuation tool?",
    a: "It's the niche's standard lead magnet — but every tool we tested in November 2026 gates the estimate behind name, email and phone, and the prime brands offer only a request-a-visit form. The stronger pattern, proven in other trades, is showing the estimate first and collecting contact details to refine it. An agency that does this locally differentiates immediately.",
  },
  {
    q: "What must a UK letting agent publish on fees?",
    a: "Letting agents are required to publish their fees, and the strongest pages in our review go further: figures with the VAT treatment shown, the Client Money Protection provider named with a certificate linked, the redress scheme (The Property Ombudsman or PRS) named in text, and a date on the page. Most sites we checked publish undated fees, and several name no redress scheme at all.",
  },
  {
    q: "How were these examples chosen and checked?",
    a: "We reviewed 12 live UK estate agency websites on 6 November 2026 — national prime brands, a London chain, an online hybrid, franchise networks, regional independents and local specialists. Every observation was read from the named agency's live pages that day; where a page renders content with JavaScript, we say the item was absent from the served HTML rather than claiming it doesn't exist.",
  },
];

const DOC = {
  _id: "glseo2026-estate-agent-website-examples-uk",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 11,
  slugs: { en: { _type: "slug", current: "estate-agent-website-examples-uk" } },
  title: en("Estate Agent Website Examples: 12 Real UK Sites Reviewed (2026)"),
  metaTitle: en("Estate Agent Website Examples UK: 12 Sites Reviewed (2026)"),
  metaDescription: en("12 live UK estate agency websites reviewed in November 2026 — what Knight Frank, Foxtons and the best independents get right, the valuation-funnel mistake everyone makes, and a checklist."),
  eyebrow: en("Research · 11 min read"),
  lede: en("We opened 12 UK estate agency websites — prime nationals to a single-office lettings specialist — and recorded what the pages actually show: valuation funnels, listing data, fees, reviews and redress. Here's what separates the credible ones."),
  category: { _type: "reference", _ref: "10c16de9-82a6-4d3e-a5ac-0ae99056d446" },
  author: AUTHOR,
  tags: ["real-estate", "examples", "UK", "research"],
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
