/**
 * /en/sites-for/finance — перенацеливание под реальный английский кластер.
 *
 * Страница даёт 380 показов на позиции 74.8 — худший результат среди
 * топ-страниц по показам. При этом собственная статья
 * /en/blog/web-design-for-accountants (993 слова) стоит на 25.5, а её
 * запросы — на 19–28:
 *
 *   accountants website design      21 показ, поз. 19.0
 *   accountancy website design      14 показов, поз. 19.4
 *   accountant website design       37 показов, поз. 20.5
 *   accountants web design          27 показов, поз. 23.8
 *   accountant web design           32 показа, поз. 24.9
 *   web design for accountants      50 показов, поз. 28.2
 *   website design for accountants  11 показов, поз. 31.5
 *   accounting web design           29 показов, поз. 32.4
 *   web design accountants          96 показов, поз. 74.0  ← держит страница
 *   financial services website design 33 показа, поз. 75.9
 *   finance website design uk       17 показов, поз. 61.6
 *
 * Причина разрыва простая: рынок ищет «web design» и «website design», а
 * тайтл страницы — «Websites for Accountants and Finance Firms», где этих
 * словосочетаний нет вообще. У статьи в тайтле точное вхождение — она и
 * выигрывает. Формы «website design» нет ни на странице, ни в статье,
 * хотя на ней висят три запроса на 19–20 позициях.
 *
 * Правки только для локали en:
 *   1. seo.title + hero.heading + hero.lede — вводим «web design» и
 *      «website design», попутно чиним кальку с украинского: «provides
 *      applications» — это дословно «дає заявки», по-английски бессмыслица.
 *   2. richTextBlock со scope-секцией, закрывающей «accountancy website
 *      design», «financial services website design» и британский рынок.
 *
 * uk/ru не трогаем: там оригинал, и он читается нормально.
 *
 * Usage: node scripts/finance-seo-2026-08/retarget-en-finance.mjs --dry-run
 *        node scripts/finance-seo-2026-08/retarget-en-finance.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");
for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined)
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!token && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

let seq = 0;
const key = () => `fsc${(seq++).toString(36)}${Math.abs(seq * 7919).toString(36)}`;
const block = (text, style = "normal") => ({
  _key: key(),
  _type: "block",
  style,
  markDefs: [],
  children: [{ _key: key(), _type: "span", text, marks: [] }],
});
const h2 = (t) => block(t, "h2");
const h3 = (t) => block(t, "h3");

/* ─── EN hero + meta ──────────────────────────────────────────────────────── */

// 58 chars, leads with the phrasing the market actually searches.
const TITLE = "Web Design for Accountants & Finance Firms | Code-Site.Art";

const DESCRIPTION =
  "➤ Website design for accountants, bookkeepers and financial advisers ✔️ Trust-first pages ✔️ Fee calculators ✔️ Launch in 4 weeks ➡ Free project estimate.";

// The old heading ended "explains services and provides applications" — a
// literal rendering of "дає заявки", which reads as software applications
// in English.
const HEADING =
  "Web design for accountants that *explains the service and brings in enquiries*";

const LEDE =
  "Website design for accountancy practices, financial advisers and consulting firms — where trust has to land in seconds, complex services need plain words, and every page has to end in an enquiry.";

/* ─── EN scope section ────────────────────────────────────────────────────── */

const EN = [
  h2("What accountancy website design covers"),
  block(
    "Financial services website design is judged on one thing before anything else: whether the visitor believes you will handle their money carefully. Below is the full scope of the build, and what each part is actually for.",
  ),
  h3("Design that earns trust before it is read"),
  block(
    "Accountant website design has a narrow brief: look established, current and regulated. That means real photographs of the team rather than stock, visible credentials — ICAEW, ACCA, AAT or your equivalent — company number and registered office in the footer, and fee information that does not hide behind a contact form. Every screen is drawn for your practice; we do not adapt a template.",
  ),
  h3("Pages that explain a service nobody enjoys buying"),
  block(
    "Most accountancy websites list services as nouns: bookkeeping, VAT, payroll, self assessment. That tells a prospect nothing about whether you are right for them. We build a page per service that answers who it suits, what happens month to month, what it costs and what you need from the client to start.",
  ),
  h3("A fee calculator instead of a contact form"),
  block(
    "The strongest converting element on an accountancy site is a calculator that turns turnover, company type and headcount into a monthly fee range. It qualifies the enquiry before it reaches you and filters out the sole traders looking for the cheapest possible quote.",
  ),
  h3("Ordering website design for a financial services firm"),
  block(
    "You need nothing prepared — no brief, no copy, no photography. One call covers your services, the client types you want more of, and how enquiries reach you today. You get a fixed price range and a timeline back. Finance website design projects usually run four to eight weeks, and existing sites can be migrated without losing rankings.",
  ),
];

const SECTION = { _key: "secFinScope", _type: "richTextBlock", content: { en: EN } };

async function run() {
  const doc = await client.fetch(
    '*[_type=="industryPage" && slug.current=="finance"][0]{_id, "keys": sections[]._key, "types": sections[]._type, "t": seo.title.en, "h": hero.heading.en}',
  );
  if (!doc) throw new Error("finance industryPage not found");

  console.log("doc:", doc._id);
  console.log("sections:", doc.types.join(" > "));
  console.log("\ntitle   было:", doc.t);
  console.log("title  стало:", TITLE, `(${TITLE.length} симв.)`);
  console.log("\nH1      было:", doc.h);
  console.log("H1     стало:", HEADING);

  const set = {
    "seo.title.en": TITLE,
    "seo.description.en": DESCRIPTION,
    "hero.heading.en": HEADING,
    "hero.lede.en": LEDE,
  };

  const hasSection = doc.keys.includes(SECTION._key);
  const faqIdx = doc.types.indexOf("faqBlock");
  const at = faqIdx === -1 ? doc.types.length : faqIdx;
  console.log(
    hasSection
      ? "\nsection: уже есть, пропускаю"
      : `\nsection: вставляю richTextBlock на позицию ${at} (перед faqBlock)`,
  );

  if (DRY) {
    console.log("\n[dry-run] ничего не записано");
    return;
  }

  let p = client.patch(doc._id).set(set);
  if (!hasSection) p = p.insert("before", `sections[${at}]`, [SECTION]);
  await p.commit();
  console.log("\nзаписано");
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
