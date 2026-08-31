/**
 * Английский блог называет цены студии в долларах. Английский прайс — в фунтах.
 *
 * `src/constants/pricing-tiers.ts` фиксирует правило прямым текстом: «the EN
 * market is priced for the UK in GBP and stays at £3,500», а
 * `src/content/en/pricing-prose.ts` перечисляет весь британский прайс —
 * £800 / £3,500 / £6,000, аудит £300, SEO £300/мес, поддержка £200/мес, £40/час.
 *
 * В блоге при этом 26 английских статей с долларовыми суммами и ни одного
 * фунта в двадцати пяти из них. Британец читает «from $800, 2–3 weeks»,
 * переходит на /en/pricing и видит «£800» — другая валюта и, по курсу, цифра
 * процентов на двадцать ниже той, которую ему назовут. Для кластера, где сидит
 * весь коммерческий спрос Великобритании (456 показов вокруг
 * /en/blog/web-design-for-accountants, ноль кликов), это прямой удар по
 * сравнению смет: человек именно сметы и сравнивает.
 *
 * Правка сознательно узкая. Меняем только те суммы, которые ЯВЛЯЮТСЯ
 * собственным прайсом студии и один в один совпадают с британским
 * прайс-листом. Всё остальное — цены доменов, хостинга, чужих плагинов,
 * цифры из внешних исследований — остаётся в долларах, потому что это не наш
 * прайс и подставлять туда фунт было бы выдумкой.
 *
 * Отдельным правилом идёт $2,500: это украинская цена корпоративного пакета,
 * протёкшая в английский текст. Британский эквивалент — £3,500, то есть здесь
 * меняется не только валюта, но и сама цифра, и общей заменой это делать
 * нельзя. Такие случаи выписываются в конце прогона отдельным списком.
 *
 * Запуск: node scripts/quickwin-2026-08-31/en-currency.mjs [--dry]
 */
import "dotenv/config";
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

/**
 * Суммы, которые есть в британском прайсе один в один. Ключ — то, что стоит
 * после «$» в тексте; варианты написания перечислены явно, потому что в
 * статьях встречается и «3,500», и «3 500».
 */
const OWN_PRICES = [
  "800", "3,500", "3 500", "6,000", "6 000", "300", "200", "40",
  // границы нашей же вилки за сложную интеграцию: «$1,000–3,000»
  "1,000", "1 000", "3,000", "3 000",
];

/**
 * Ловим «$800», «$3,500», «$ 3 500», в том числе с запятой следом
 * («from $3,500, a platform…»), но не «$3,500,000» и не «$8000».
 */
const PRICE_RE = new RegExp(
  `\\$\\s?(${OWN_PRICES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?!\\d|,\\d|\\.\\d)`,
  "g",
);

/**
 * $2,500 — украинская цена корпоративного пакета, протёкшая в английский
 * текст. Британский эквивалент по прайсу — £3,500: меняется не только валюта,
 * но и сама цифра, поэтому отдельным правилом, а не общей заменой.
 */
const MANUAL_RE = /\$\s?2[,. ]?500(?!\d|,\d|\.\d)/g;
const MANUAL_TO = "£3,500";

function convert(text) {
  return text.replace(MANUAL_RE, MANUAL_TO).replace(PRICE_RE, (_m, amount) => `£${amount}`);
}

/** Пробегает Portable Text и меняет текст только в span'ах. */
function walk(node, fn) {
  if (Array.isArray(node)) return node.map((n) => walk(n, fn));
  if (!node || typeof node !== "object") return node;
  const out = Array.isArray(node) ? [] : { ...node };
  for (const [k, v] of Object.entries(node)) {
    if (k === "text" && typeof v === "string") out[k] = fn(v);
    else if (typeof v === "string") out[k] = k === "_key" || k === "_type" || k === "href" ? v : fn(v);
    else out[k] = walk(v, fn);
  }
  return out;
}

async function run() {
  const docs = await client.fetch(
    '*[_type == "blogPost" && defined(body.en)]{_id, "en": slugs.en.current, "body": body.en}',
  );

  let touched = 0;
  let replacements = 0;
  const manual = [];

  for (const d of docs) {
    const before = JSON.stringify(d.body);
    const hits = before.match(PRICE_RE) || [];
    const man = before.match(MANUAL_RE) || [];
    if (man.length) manual.push(`${d.en}: ${[...new Set(man)].join(", ")} → ${MANUAL_TO}`);
    if (!hits.length && !man.length) continue;

    const next = walk(d.body, convert);
    touched++;
    replacements += hits.length;
    console.log(`  ${String(hits.length).padStart(2)} замен | ${d.en}`);
    console.log(`         ${[...new Set(hits)].join("  ")} → ${[...new Set(hits)].map((h) => h.replace("$", "£")).join("  ")}`);

    if (!DRY) await client.patch(d._id).set({ "body.en": next }).commit();
  }

  console.log(`\nстатей исправлено: ${touched}, замен: ${replacements}`);
  if (manual.length) {
    console.log("\nукраинская цена в английском тексте, заменена на британский тариф:");
    manual.forEach((m) => console.log("  " + m));
  }
}

console.log(DRY ? "СУХОЙ ПРОГОН\n" : "ЗАПИСЬ В SANITY\n");
run().then(
  () => console.log("\nготово"),
  (e) => {
    console.error("ОШИБКА", e.message);
    process.exit(1);
  },
);
