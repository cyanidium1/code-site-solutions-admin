/**
 * Delivery terms in the blog, uk / ru / en, brought to the package list in
 * src/constants/pricing.ts (frontend): landing 3 working days, business
 * website 7, shop 14, industry 14–21, custom from 6 weeks. Add-ons carry no
 * days of their own, so a site with a booking engine is still «from 7».
 *
 * The August copy still quotes agency weeks («4–8 weeks», «6–10 тижнів»).
 * Each clause (or table row) is matched to a package — by the price next to
 * it, else by the words in it, else by the post's own subject — and its week
 * range becomes that package's term. Market and SEO timelines, client
 * anecdotes and process stages are not ours and stay (see KEEP).
 *
 * Three price cells the 2026-09-22 pass left are fixed here too: a store row
 * at the business price (→ shop package) and the $1,500–3,000 salon row.
 *
 *   node scripts/intl-uk-2026-09/terms.mjs            # dry run → terms.diff.txt
 *   node scripts/intl-uk-2026-09/terms.mjs --write
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { client, backup, HERE } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");
const LOCALES = ["uk", "ru", "en"];

const TERM = {
  L: { en: "3 working days", uk: "3 робочі дні", ru: "3 рабочих дня" },
  B: { en: "from 7 working days", uk: "від 7 робочих днів", ru: "от 7 рабочих дней" },
  S: { en: "from 14 working days", uk: "від 14 робочих днів", ru: "от 14 рабочих дней" },
  I: { en: "14–21 working days", uk: "14–21 робочий день", ru: "14–21 рабочий день" },
  C: { en: "from 6 weeks", uk: "від 6 тижнів", ru: "от 6 недель" },
};
const PRICE = {
  L: /€1,200|\$600\b/,
  B: /€2,500|\$1[  ]000\b(?!–)/,
  S: /€3,900|\$1[  ]500\b(?!–)/,
  I: /€4,500|\$1[  ]800\b/,
  C: /€9,000|\$4[  ]000\b/,
};
const WORDS = [
  ["C", /platform|portal|custom|channel manager|subscription|платформ|портал|кастом|підписк|подписк/i],
  ["S", /\bstore\b|e-?commerce|online ordering|basket|delivery site|магазин|кошик|корзин|онлайн-замовлен|онлайн-заказ|сайт доставки/i],
  ["I", /clinic|medical|healthcare|dental|law firm|solicitor|attorney|клінік|клиник|медичн|медицин|медцентр|стоматолог|юрфірм|юрфирм|юридичн|юридическ|адвокат/i],
  ["L", /landing|one-pager|one-page|brochure|lookbook|лендінг|лендинг|візитк|визитк|вітрин|витрин|односторінк|одностраничн/i],
  ["B", /corporate|multi-page|catalogue|catalog|school|booking engine|table bookings|salon|chain|agency|site with|website|корпоратив|багатосторінков|многостраничн|каталог|школ|бронюванн|бронирован|салон|мереж|сет[ьи]|агенц|агентств|сайт|site/i],
];
/** Posts whose week ranges are SEO / market / legal timelines, not our builds. */
const SKIP_POSTS = new Set([
  "local-seo-google-maps-top-3", "what-is-seo", "redesign-without-losing-seo",
  "sra-transparency-rules-law-firm-websites", "web-design-for-accountants", "websites-for-solicitors",
  "geo-seo-dlia-ukrainskoho-biznesu", "biznes-u-kilkokh-mistakh-storinky",
  // Already on the list (landing / clinic / extended / group), see blog-fields-rules.mjs.
  "hospital-vs-private-practice-website",
]);
/** Posts where only the card text (lede / meta) is ours; the body walks through weeks 1–4 on purpose. */
const FIELDS_ONLY = new Set(["clinic-website-development-process"]);
/** Not ours: anecdotes, market figures, process stages, competitors. */
const KEEP = /first 2–3 weeks|перші 2–3 тижні|первые 2–3 недели|shaves|скоротить|скорочує|сократит|сокращает|made to order|під замовлення|под заказ|three weeks in|year-end|purchase in 6 weeks|boutique studio|бутиков|бутік|WordPress theme|шаблон WordPress|WordPress-шаблон|WordPress-тема|Discovery|prototype|Design and build|Complex integrations|прототип|Складні інтеграції|Сложные интеграции|Дизайн і верстка|Дизайн и верстка|Дизайн и вёрстка|Ombudsman|омбудсмен|відповідно \[|соответственно \[|respectively \[|За 8 тижнів ми|За 8 недель мы|In 8 weeks we|За \d+ тижн|За \d+ недел|\bIn (?:\d+|six|eight) weeks,? we|тижнів навколо|недель вокруг|weeks around|Конкретика по тому сайту|Конкретика по тому сайту|three sources|три джерела|три источника|Friendly \(/i;

const UNIT = String.raw`(?:weeks?|тижн(?:ів|ень|і|я)|недел(?:ями|ь|и|я|ю))`;
const RANGE = new RegExp(
  String.raw`(?:(?:from|від|от)\s+)?(\d+(?:\s*[–-]\s*\d+)?\+?|one to two|two to three|four to eight)\s+${UNIT}(?:\s+total|\s+загалом|\s+всего)?`,
  "gi",
);
const CANONICAL = /^(from 6 weeks|від 6 тижнів|от 6 недель)$/i;

function priceCat(text) {
  for (const [cat, re] of Object.entries(PRICE)) if (re.test(text)) return cat;
  return null;
}
function wordCat(text) {
  for (const [cat, re] of WORDS) if (re.test(text)) return cat;
  return null;
}
const POST_DEFAULT = {
  "auto-parts-online-store": "S", "cosmetics-store-website": "S", "clothing-store-website": "S",
  "what-is-a-landing-page": "L", "clinic-website-cost-uk-2026": "I", "clinic-website-development-process": "I",
};

/**
 * Per-post decisions where a clause names no package (or names two): the
 * range → package or a literal term, optionally only when the clause matches
 * a pattern. Ranges are written with an en dash, as in the copy.
 */
const FROM3 = { en: "from 3 working days", uk: "від 3 робочих днів", ru: "от 3 рабочих дней" };
// «Timelines run from 2–3 weeks to 2–3 months» — the span starts at a landing page.
const SPAN = /Timelines run|Терміни —|Сроки —|Строки —|Строк —|Срок —|Терміни від|Сроки от/i;
// «…a landing page in 1–2 weeks and a corporate site in 3–6 weeks»: the second half.
const CORP = /corporate site in|корпоративний сайт за|корпоративный сайт за/i;
const OVERRIDE = {
  "accounting-firm-website": { "2–3": "L", "4–8": "B", "2": FROM3 },
  "attorney-website-essentials": { "2–3": "L", "4–8": "I" },
  "photographer-portfolio-website": { "2–3": "L" },
  "restaurant-website-with-delivery": { "6–10": "S", "2–3": [[SPAN, FROM3]] },
  "hotel-website-with-booking": { "4–7": "B" },
  // Its own table sells the online store as a custom build from €9,000.
  "furniture-company-website": { "2–3": [[SPAN, FROM3]], "8–12": "C" },
  "auto-repair-shop-website": { "3–6": [[CORP, "B"]] },
};
function override(where, m, ctx = "") {
  const slug = where.split(" · ")[0];
  const range = m.match(/\d+(?:\s*[–-]\s*\d+)?/)?.[0].replace(/\s*[–-]\s*/, "–");
  const o = OVERRIDE[slug]?.[range];
  if (!Array.isArray(o)) return o ?? null;
  return o.find(([re]) => re.test(ctx))?.[1] ?? null;
}
const termFor = (o, locale) => (typeof o === "string" ? TERM[o][locale] : o[locale]);

const diffs = [];
const unclassified = [];
const decisions = [];
const note = (locale, where, m, term, ctx) => {
  decisions.push(`[${locale}] ${where} | ${m} → ${term} | …${ctx.trim().slice(-90)}`);
  return term;
};

/** Replace week ranges in `text`; each clause resolves its own package. */
/** «за від 7», «за от 7», «in from 7» — the preposition before a «from» term. */
const tidy = (s) => s.replace(/(?<=^|\s)за (від|от) (?=\d)/g, "$1 ").replace(/\bin from (?=\d)/g, "from ");

function rewrite(text, locale, fallback, where) {
  if (KEEP.test(text)) return text;
  return tidy(rewriteClauses(text, locale, fallback, where));
}

function rewriteClauses(text, locale, fallback, where) {
  // Clause = between sentence ends, semicolons, commas, ✔️ and ➡ marks.
  return text.replace(/[^.;,✔➡]+/g, (clause) =>
    clause.replace(RANGE, (m) => {
      if (CANONICAL.test(m.trim())) return m;
      const o = override(where, m, clause);
      if (o) return note(locale, where, m, termFor(o, locale), clause);
      const cat = priceCat(clause) ?? wordCat(clause) ?? fallback;
      if (!cat) {
        unclassified.push(`[${locale}] ${where} | ${m} | ${clause.trim()}`);
        return m;
      }
      return note(locale, where, m, TERM[cat][locale], clause);
    }),
  );
}

/** Store rows sold at the business price; the salon row still in dollars. */
function fixRowPrice(cells, locale) {
  const row = cells.join(" | ");
  if (/e-commerce|online ordering|інтернет-магазин|интернет-магазин|онлайн-замовлен|онлайн-заказ/i.test(row))
    return cells.map((c) => (c === "€2,500" ? "€3,900" : /^\$1[  ]000$/.test(c) ? "$1 500" : c));
  // Only the salon row: elsewhere (auto parts) the range is a competitor's budget.
  if (/salon|салон/i.test(row) && /\$1,500–3,000|\$1[  ]500–3[  ]000/.test(row))
    return cells.map((c) => (/\$1,500–3,000|\$1[  ]500–3[  ]000/.test(c) ? (locale === "en" ? "€2,500" : "$1 000") : c));
  return cells;
}

function rewriteTable(block, locale, where, fallback) {
  const header = block.rows?.[0]?.cells ?? [];
  const rows = block.rows.map((r) => {
    if (!r.cells) return r;
    const fixed = fixRowPrice(r.cells, locale);
    const rowText = fixed.join(" | ");
    if (KEEP.test(rowText)) return { ...r, cells: fixed };
    const cells = fixed.map((c, i) => {
      // Timeline rows without a price: take the price from the column header.
      const cat = priceCat(rowText) ?? priceCat(header[i] ?? "") ?? wordCat(fixed[0] ?? "") ?? (i > 0 ? wordCat(header[i] ?? "") : null) ?? wordCat(rowText) ?? fallback;
      let out = c.replace(RANGE, (m) => {
        if (CANONICAL.test(m.trim())) return m;
        const o = override(where, m, rowText);
        if (o) return note(locale, where, m, termFor(o, locale), rowText);
        if (!cat) { unclassified.push(`[${locale}] ${where} row | ${m} | ${rowText}`); return m; }
        return note(locale, where, m, TERM[cat][locale], rowText);
      });
      // «7–14 days» for the landing column (therapist table).
      if (cat === "L") out = out.replace(/^7–14 (days|днів|дней)$/, TERM.L[locale]);
      return out;
    });
    return { ...r, cells };
  });
  return { ...block, rows };
}

function textOf(n) {
  if (typeof n === "string") return n;
  if (Array.isArray(n)) return n.map(textOf).join(" ");
  if (n && typeof n === "object") return Object.entries(n).filter(([k]) => !k.startsWith("_")).map(([, v]) => textOf(v)).join(" ");
  return "";
}

function walkBody(node, locale, where, fallback) {
  if (Array.isArray(node)) return node.map((x) => walkBody(x, locale, where, fallback));
  if (node && typeof node === "object") {
    if (Array.isArray(node.rows)) return rewriteTable(node, locale, where, fallback);
    // A card or stat (title + value): its own words decide before the post default.
    const ctx = textOf(node);
    if (!Array.isArray(node.children)) fallback = priceCat(ctx) ?? wordCat(ctx) ?? fallback;
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("_") || k === "marks" || k === "style" || k === "href" || k === "listItem") out[k] = v;
      else if (typeof v === "string") out[k] = rewrite(v, locale, fallback, where);
      else out[k] = walkBody(v, locale, where, fallback);
    }
    return out;
  }
  return node;
}

function collect(before, after, where, locale) {
  const a = [], b = [];
  const flat = (n, out) => {
    if (typeof n === "string") out.push(n);
    else if (Array.isArray(n)) n.forEach((x) => flat(x, out));
    else if (n && typeof n === "object") for (const [k, v] of Object.entries(n)) if (!k.startsWith("_")) flat(v, out);
  };
  flat(before, a); flat(after, b);
  a.forEach((s, i) => { if (b[i] !== s) diffs.push({ where, locale, from: s, to: b[i] }); });
}

const docs = await client.fetch(
  '*[_type=="blogPost" && status=="published"]{_id, "slug": coalesce(slugs.en.current, slugs.uk.current), body, faq, lede, metaDescription, metaTitle}',
);
const patches = [];
for (const d of docs) {
  if (SKIP_POSTS.has(d.slug)) continue;
  const fallback = POST_DEFAULT[d.slug] ?? null;
  const set = {};
  const fieldsOnly = FIELDS_ONLY.has(d.slug);
  for (const loc of LOCALES) {
    if (!fieldsOnly && Array.isArray(d.body?.[loc])) {
      const next = walkBody(d.body[loc], loc, `${d.slug} · body`, fallback);
      if (JSON.stringify(next) !== JSON.stringify(d.body[loc])) { set[`body.${loc}`] = next; collect(d.body[loc], next, `${d.slug} · body`, loc); }
    }
    for (const f of ["lede", "metaDescription", "metaTitle"]) {
      const v = d[f]?.[loc];
      if (typeof v !== "string") continue;
      const next = rewrite(v, loc, fallback ?? wordCat(v), `${d.slug} · ${f}`);
      if (next !== v) { set[`${f}.${loc}`] = next; diffs.push({ where: `${d.slug} · ${f}`, locale: loc, from: v, to: next }); }
    }
  }
  if (!fieldsOnly && Array.isArray(d.faq)) {
    const faq = d.faq.map((it, i) => {
      const answer = { ...it.answer };
      for (const loc of LOCALES) {
        const v = it.answer?.[loc];
        if (typeof v !== "string") continue;
        const next = rewrite(v, loc, fallback, `${d.slug} · faq[${i}]`);
        if (next !== v) { answer[loc] = next; diffs.push({ where: `${d.slug} · faq[${i}]`, locale: loc, from: v, to: next }); }
      }
      return { ...it, answer };
    });
    if (JSON.stringify(faq) !== JSON.stringify(d.faq)) set.faq = faq;
  }
  if (Object.keys(set).length) patches.push({ d, set });
}

const lines = diffs.map((x) => `\n[${x.locale}] ${x.where}\n- ${x.from}\n+ ${x.to}`);
lines.push(`\n\nUNCLASSIFIED (${unclassified.length}):`, ...unclassified);
lines.push(`\n\nDECISIONS (${decisions.length}):`, ...decisions);
writeFileSync(join(HERE, "..", "intl-uk-2026-09", "terms.diff.txt"), lines.join("\n"));
const byLoc = Object.fromEntries(LOCALES.map((l) => [l, diffs.filter((x) => x.locale === l).length]));
console.log(`${patches.length} posts, strings: ${JSON.stringify(byLoc)}, unclassified: ${unclassified.length} → terms.diff.txt`);
if (!WRITE) process.exit(0);
for (const { d, set } of patches) {
  backup(`terms-${d._id}`, await client.getDocument(d._id));
  await client.patch(d._id).set(set).commit();
}
console.log(`WROTE ${patches.length} posts`);
