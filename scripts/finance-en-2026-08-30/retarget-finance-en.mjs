/**
 * `/en/sites-for/finance` перестаёт бороться с собственным блогом.
 *
 * GSC за 3 месяца, две страницы на один запрос:
 *
 *   /en/blog/web-design-for-accountants  — 415 показов, позиция 25,3
 *   /en/sites-for/finance                — 384 показа,  позиция 74,8
 *
 * У обеих title и H1 были заточены под «web design for accountants», и Google
 * выбирал блог. При этом наборы запросов уже разошлись: блог держит голые
 * «accountant(s) web(site) design» на 20–27, а страница услуги подбирает
 * «financial services» и UK-гео — 107 показов, которых у блога нет вообще,
 * и её лучшие позиции именно там (61,8–63,6).
 *
 * Поэтому страница уходит на «financial services» и Великобританию, а запрос
 * про бухгалтеров остаётся блогу, который по нему почти дошёл до первой
 * страницы и уже четырежды ссылается сюда. Бухгалтеры со страницы не исчезают —
 * меняется главный сигнал, а не содержание.
 *
 * Запуск: SANITY_WRITE_TOKEN=… node scripts/finance-en-2026-08-30/retarget-finance-en.mjs [--dry]
 */
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

const ID = "lOTgaDd8FU4wgJ8F4KCGuB"; // industryPage finance

const PATCH = {
  "seo.title.en": "Financial Services Website Design, UK | Code-Site.Art",
  "seo.description.en":
    "➤ Website design for financial services firms across the UK ✔️ Advisers, accountancy practices and consultancies ✔️ Trust-first pages, fee calculators ✔️ Launch in 4 weeks ➡ Free estimate.",
  // `*…*` — курсивная часть заголовка.
  "hero.heading.en":
    "Financial services website design *for UK advisers, accountants and consultancies*",
  "hero.eyebrow.en": "FINANCIAL SERVICES WEBSITES",
  "hero.lede.en":
    "Website design for financial services firms in the UK — advisers, accountancy practices and consultancies — where trust has to land in seconds, regulated language leaves little room, and every page has to end in an enquiry.",
};

const before = await client.fetch(
  '*[_id==$id][0]{"t":seo.title.en,"d":seo.description.en,"h":hero.heading.en,"e":hero.eyebrow.en,"l":hero.lede.en}',
  { id: ID },
);
if (!before) throw new Error(`нет документа ${ID}`);

console.log("было:");
for (const [k, v] of Object.entries(before)) console.log(`  ${k}: ${JSON.stringify(v)}`);
console.log("\nстанет:");
for (const [k, v] of Object.entries(PATCH)) console.log(`  ${k}: ${JSON.stringify(v)}`);

if (DRY) {
  console.log("\n(dry run, ничего не записано)");
  process.exit(0);
}

await client.patch(ID).set(PATCH).commit();
console.log("\nзаписано");
