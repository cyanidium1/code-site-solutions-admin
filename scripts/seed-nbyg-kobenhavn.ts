/**
 * Seed script — uploads the NBYG København case-study content into Sanity
 * as a single `caseStudy` document (UA + EN). Mirrors the hardcoded page at
 * `src/app/portfolio/nbyg-kobenhavn/page.tsx` (UA) and
 * `src/app/en/portfolio/nbyg-kobenhavn/page.tsx` (EN) 1:1.
 *
 * Idempotent: uses `createOrReplace` with a fixed `_id`, so re-running this
 * script overwrites the existing document instead of creating duplicates.
 *
 * Required env (loaded from .env.local automatically):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET (defaults to "production")
 *   - SANITY_API_TOKEN          (write-access token)
 *
 * Run:
 *   npm run seed:nbyg-kobenhavn
 *
 * NOTE: image fields (problem screenshot, solution screenshot, outcome video,
 * media gallery) are intentionally left empty — founder hasn't supplied
 * assets yet. Same TODO posture as the hardcoded page.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@sanity/client";

/* ──────────────────────────── env loader ──────────────────────────────── */

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

/* ──────────────────────────── helpers ─────────────────────────────────── */

type LocaleString = { uk?: string; en?: string };

function bi(uk: string, en: string): LocaleString {
  return { uk, en };
}
function uk(text: string): LocaleString {
  return { uk: text };
}

let keyCounter = 0;
function k(prefix = "k"): string {
  keyCounter += 1;
  return `${prefix}${keyCounter.toString(36)}`;
}

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type PortableBlock = {
  _type: "block";
  _key: string;
  style: "normal";
  markDefs: never[];
  children: Span[];
};

/** Build a richTextSimple value from a single plain paragraph. */
function richPara(text: string): PortableBlock[] {
  return [
    {
      _type: "block",
      _key: k("b"),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: k("s"), text, marks: [] }],
    },
  ];
}

/** Build a richTextSimple value from multiple paragraphs. */
function richParas(texts: string[]): PortableBlock[] {
  return texts.map((text) => ({
    _type: "block",
    _key: k("b"),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: k("s"), text, marks: [] }],
  }));
}

/* ──────────────────────────── content ─────────────────────────────────── */

const DOC_ID = "caseStudy.nbyg-kobenhavn";

/* hero — eyebrow / heading / subheading / metrics
 * `*x*` in heading → frontend renders <em>x</em> via formatLine helper
 * (same convention as seed-medicine.ts hero). */
const HERO = {
  eyebrow: bi("/ CASE STUDY", "/ CASE STUDY"),
  heading: bi(
    "NBYG København — будівнича компанія в *Копенгагені і на Борнгольмі*",
    "NBYG København — construction company in *Copenhagen and Bornholm*",
  ),
  subheading: bi(
    "Будівнича компанія з двома локаціями в Данії. Перенесли з застарілого WordPress на Next.js + Sanity з мобільним редагуванням, локальним SEO для двох міст і кастомною адмінкою для самостійного створення сторінок послуг.",
    "Construction company with two locations in Denmark. Migrated from a legacy WordPress site to Next.js + Sanity with mobile editing, local SEO for two cities, and a custom admin where the owner creates new service pages himself.",
  ),
  // Hero metrics intentionally omitted — quick-stats live as a separate
  // statsBlock section (mirrors the hardcoded layout exactly).
  metrics: [],
};

/* sections[0] — quick-stats bar (4 metrics) */
const STATS_SECTION = {
  _type: "statsBlock" as const,
  _key: k("sec"),
  // No eyebrow / heading on this block — matches hardcoded `<StatsBar items=…/>`
  // which renders metrics only.
  items: [
    {
      _key: k("m"),
      value: "×8",
      label: bi("більше заявок на місяць", "MORE INQUIRIES PER MONTH"),
    },
    {
      _key: k("m"),
      value: "0.8s",
      label: bi("LCP (було 4.5s)", "LCP (WAS 4.5s)"),
    },
    {
      _key: k("m"),
      value: "98",
      label: bi("Lighthouse performance", "LIGHTHOUSE PERFORMANCE"),
    },
    {
      _key: k("m"),
      value: "Top-1",
      label: bi("Google по local запитам", "GOOGLE LOCAL SEARCH"),
    },
  ],
};

/* sections[1] — / 02 PROBLEM (side-with-list, image right, cross bullets) */
const PROBLEM_SECTION = {
  _type: "imageTextBlock" as const,
  _key: k("sec"),
  variant: "side-with-list",
  imageVariant: "imageRight",
  bulletIcon: "cross",
  eyebrow: bi("/ 02 PROBLEM", "/ 02 PROBLEM"),
  // `*x*` → <em>x</em> via formatLine convention
  heading: bi("Що *було*", "What was *wrong*"),
  body: richPara(
    "Клієнт мав застарілий сайт на WordPress 2018 року з 5 платними плагінами. Сайт не ранжувався в локальному пошуку Копенгагена і Борнгольма, мав слабкий мобільний UX і отримував лише 3 заявки на місяць — недостатньо для завантаження команди в обидвох локаціях.",
  ),
  bodyEn: richPara(
    "The client had a legacy WordPress site from 2018 with 5 paid plugins. The site didn't rank in local search for Copenhagen or Bornholm, had a weak mobile UX, and pulled only 3 inquiries a month — not enough to keep the teams in both locations busy.",
  ),
  bulletList: [
    bi(
      "Сайт завантажувався 4.5 секунди на мобільному",
      "Site loaded in 4.5 seconds on mobile",
    ),
    bi(
      "Сторінка 2 в локальному пошуку за «byggefirma København» — невидимий для більшості клієнтів",
      "Page 2 in local search for “byggefirma København” — invisible to most prospects",
    ),
    bi(
      "Тільки 3 заявки на місяць — Google Ads не окупались",
      "Only 3 inquiries per month — Google Ads weren’t paying back",
    ),
    bi(
      "5 платних плагінів з річними підписками (€600/рік) + €60/міс хостинг",
      "5 paid plugins with yearly subscriptions (€600/year combined) + €60/mo hosting",
    ),
    bi(
      "Власник не міг сам редагувати — Elementor конфліктував з темою",
      "Owner couldn’t edit himself — Elementor fought the theme",
    ),
    bi(
      "Без schema.org — Google не показував rich-snippets",
      "No schema.org — Google didn’t show rich snippets",
    ),
    bi(
      "Не було розділення на дві локації (Копенгаген vs Борнгольм)",
      "No proper split between the two locations (Copenhagen vs Bornholm)",
    ),
    bi("Адмінка на телефоні була нечитабельна", "Admin on mobile was unusable"),
  ],
  // image left empty — TODO: add real WordPress screenshot when founder
  // supplies it.
};

/* sections[2] — / 03 SOLUTION (side-with-list, image left, check bullets) */
const SOLUTION_SECTION = {
  _type: "imageTextBlock" as const,
  _key: k("sec"),
  variant: "side-with-list",
  imageVariant: "imageLeft",
  bulletIcon: "check",
  eyebrow: bi("/ 03 SOLUTION", "/ 03 SOLUTION"),
  heading: bi("Що ми *зробили*", "What we *did*"),
  body: richPara(
    "Розробили з нуля custom-coded сайт на Next.js + Sanity CMS. Архітектура з двома гео-таргетованими лендингами (Копенгаген і Борнгольм), глибока структура послуг із підсторінками, інтегрований Telegram для миттєвих заявок, повний schema.org під LocalBusiness.",
  ),
  bodyEn: richPara(
    "We rebuilt the site from scratch as a custom-coded Next.js + Sanity CMS project. The architecture has two geo-targeted landings (Copenhagen and Bornholm), a deep service structure with sub-pages, integrated Telegram for instant lead notifications, and full schema.org for LocalBusiness.",
  ),
  bulletList: [
    bi(
      "Custom code на Next.js — нуль плагінів, нуль підписок",
      "Custom code on Next.js — zero plugins, zero subscriptions",
    ),
    bi(
      "Sanity CMS з drag-and-drop блоками для самостійного редагування",
      "Sanity CMS with drag-and-drop blocks for self-editing",
    ),
    bi(
      "Адмінка повноцінна з телефона — створення нових сторінок послуг за 5 хвилин",
      "Full admin from a phone — owner creates new service pages in 5 minutes",
    ),
    bi(
      "Підсторінки під кожну послугу (Дахи → Шифер / Метал / Ремонт) — власник додає сам",
      "Sub-pages per service (Roofing → Shingle / Metal / Repair) — owner adds them himself",
    ),
    bi(
      "Гео-таргетовані лендинги для Копенгагена і Борнгольма окремо",
      "Geo-targeted landings for Copenhagen and Bornholm separately",
    ),
    bi(
      "Schema.org/LocalBusiness з годинами, послугами, зонами обслуговування",
      "Schema.org/LocalBusiness with hours, services, service areas",
    ),
    bi(
      "Tap-to-call на мобільному + інтегрована форма онлайн-бронювання",
      "Tap-to-call on mobile + integrated online booking form",
    ),
    bi(
      "301-редіректи з усіх старих URL — 0 SEO-падінь",
      "301 redirects from every old URL — zero SEO drops",
    ),
    bi(
      "Vercel hosting + Cloudflare CDN — €0/міс на цьому трафіку",
      "Vercel hosting + Cloudflare CDN — €0/mo at this traffic",
    ),
    bi(
      "DA primary, EN ready — англомовна версія активується одним кліком",
      "DA primary, EN ready — English version activates with one click",
    ),
  ],
  // image left empty — TODO: add real new-site / admin screenshot.
};

/* sections[3] — / 04 OUTCOME (centered) */
const OUTCOME_SECTION = {
  _type: "imageTextBlock" as const,
  _key: k("sec"),
  variant: "centered",
  eyebrow: bi("/ 04 OUTCOME", "/ 04 OUTCOME"),
  heading: bi(
    "Результат через *60 днів після запуску*",
    "Results after *60 days post-launch*",
  ),
  body: richParas([
    "Через 60 днів після запуску — нова версія сайту приносить ×8 заявок на місяць (24 проти 3). Органічний трафік виріс у 6 разів. Сайт займає №1 у локальному пошуку Google за «byggefirma København» і «byggefirma Bornholm». LCP — 0.8 секунди проти 4.5 секунди на старій версії.",
    "Загальний ROI сайту окупився за 2 місяці тільки через додаткові заявки. Власник самостійно створив 4 нові сторінки послуг за перший місяць — без розробника, без звертання до нас.",
  ]),
  bodyEn: richParas([
    "Sixty days after launch, the new site is bringing 8× more inquiries per month (24 vs. 3). Organic traffic is up 6×. The site ranks #1 in Google local search for “byggefirma København” and “byggefirma Bornholm.” LCP is 0.8 seconds versus 4.5 seconds on the old site.",
    "Total site ROI paid back in 2 months just from the new inquiries. The owner has independently created 4 new service pages in the first month — no developer involved, no calls to us.",
  ]),
  // image left empty — TODO: add YouTube walkthrough video when founder
  // records it (hardcoded page would embed via OutcomeYoutubeEmbed).
};

/* sections[4] — testimonial pull-quote (Søren Hansen) */
const QUOTE_SECTION = {
  _type: "quoteBlock" as const,
  _key: k("sec"),
  quote: bi(
    "Будівництво на Борнгольмі — щільна ніша. Боялись втратити навіть ту мізерну видачу, що мали. Через 30 днів після переходу трафік не впав, через 60 — стали №1. З 3 заявок на місяць вийшли на 24 в перший же місяць. Тепер я роблю нові сторінки послуг сам — з телефона.",
    "Construction on Bornholm is a tight niche. We were nervous about losing even the small Google traction we had. Thirty days after the move, traffic held. Sixty days in, we were #1 locally. From 3 inquiries a month to 24 in our first month live. Now I add new service pages myself — from my phone.",
  ),
  authorName: "Søren Hansen",
  authorRole: bi("Owner, NBYG København Aps", "Owner, NBYG København Aps"),
};

/* ────────────────────────── runner ────────────────────────────────────── */

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
    process.exit(1);
  }
  if (!token) {
    console.error("✗ Missing SANITY_API_TOKEN");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  console.log(
    `→ Seeding ${DOC_ID} into ${projectId}/${dataset} (${apiVersion})`,
  );

  const DOC = {
    _id: DOC_ID,
    _type: "caseStudy",
    status: "published",
    order: 0,
    featured: true,
    slug: { _type: "slug", current: "nbyg-kobenhavn" },

    title: bi("NBYG København", "NBYG København"),
    client: "NBYG København Aps",
    region: bi("Копенгаген + Борнгольм, Данія", "Copenhagen + Bornholm, Denmark"),
    year: 2024,
    duration: bi("6 тижнів", "6 weeks"),
    stack: ["Next.js", "Sanity", "Vercel"],
    metricsLine: bi(
      "×8 заявок · LCP 0.8s · Top-1 local",
      "×8 inquiries · LCP 0.8s · Top-1 local",
    ),
    // industry reference + budget intentionally omitted (no construction
    // industryPage in repo, and budget is a marketer estimate).

    seo: {
      title: bi(
        "NBYG København — кейс міграції з WordPress на Next.js, ×8 заявок | Code-Site.Art",
        "NBYG København — WordPress migration to Next.js, 8× inquiries | Code-Site.Art",
      ),
      description: bi(
        "Будівнича компанія в Данії: міграція з WordPress за 6 тижнів, ×8 заявок на місяць, Top-1 в локальному пошуку, 0 SEO-падінь.",
        "Danish construction company: migrated off WordPress in 6 weeks, 8× monthly inquiries, #1 in local search, zero SEO drops.",
      ),
    },

    hero: HERO,

    // Section order matches hardcoded page exactly:
    // Stats → Problem → Solution → Outcome → Testimonial.
    // (Media gallery + RELATED auto-block are NOT modeled here — gallery
    // pending assets, related cases is a frontend concern.)
    sections: [
      STATS_SECTION,
      PROBLEM_SECTION,
      SOLUTION_SECTION,
      OUTCOME_SECTION,
      QUOTE_SECTION,
    ],
  };

  const result = await client.createOrReplace(DOC);

  console.log(`✓ Document ${result._id} written (rev ${result._rev})`);
  console.log(`  Sections: ${DOC.sections.map((s) => s._type).join(", ")}`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
