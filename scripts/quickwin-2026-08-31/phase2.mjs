/**
 * Вторая волна quick-win правок по данным GSC за 3 месяца.
 *
 * ── Кластер «просування / розкрутка сайту ціна» ─────────────────────────────
 * 585 показов, ноль кликов, позиции 47–70. Google отдаёт их /calculator,
 * хотя статья `prosuvannia-saitu-tsina-2026` стоит по своим запросам 16,5.
 * Сервисная /seo с идеальным title «Просування сайту: ціна від $300/міс» и
 * реальными ценами на странице имеет 4 показа на 63-й позиции — при 27
 * входящих ссылках. То есть дело не в объёме ссылок: ни один анкор из этих
 * 27 не содержит слова «ціна» или «вартість», а запрос ценовой.
 *
 * Разводим две страницы по интенту: /seo забирает найм (правка в коде),
 * статья забирает цену. В title статьи добавляем «розкрутка» — синоним,
 * который сам по себе стоит 237 показов («розкрутка сайту ціни» 141,
 * «розкрутка сайту ціна» 60, «розкрутка сайт ціна» 36) и в заголовке
 * отсутствовал полностью.
 *
 * ── Кластер бухгалтеров (Великобритания) ────────────────────────────────────
 * `/en/blog/web-design-for-accountants`: 415 показов, позиция 25,3, НОЛЬ
 * кликов. Вокруг него 456 показов чисто коммерческого спроса, и ближайшие
 * к первой странице запросы — не те, под которые написан заголовок:
 *
 *   accountant website design    43 показа, позиция 20,4
 *   accountants website design   28 показов, позиция 21,7
 *   accountancy website design   21 показ,  позиция 22,7
 *   web design for accountants   66 показов, позиция 26,7  ← только это в title
 *
 * Порядок слов здесь решает: три группы, стоящие ближе всех к топ-10, идут
 * через «website design», а заголовок построен на «web design for».
 *
 * Плюс две дыры на самой странице. Первая: цены есть только в FAQ внизу, а
 * запрос коммерческий — человек ищет подрядчика и сравнивает сметы. Вторая:
 * одна входящая внутренняя ссылка на всю страницу.
 *
 * И заодно правим «Speed under 1 second» — это ровно тот класс заявлений,
 * который на этой неделе снимали с главной: у самого сайта LCP 2,4 с.
 *
 * Запуск: node scripts/quickwin-2026-08-31/phase2.mjs [--dry]
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

let seq = 0;
const key = () => `p2${(seq++).toString(36)}${Date.now().toString(36).slice(-3)}`;

function para(parts, style = "normal", listItem) {
  const markDefs = [];
  const children = parts.map((part) => {
    if (typeof part === "string") return { _key: key(), _type: "span", marks: [], text: part };
    const [text, href] = part;
    const mk = key();
    markDefs.push({ _key: mk, _type: "link", href, newTab: false });
    return { _key: key(), _type: "span", marks: [mk], text };
  });
  const b = { _key: key(), _type: "block", style, children, markDefs };
  if (listItem) b.listItem = listItem;
  return b;
}
const h2 = (t) => para([t], "h2");
const li = (parts) => para(parts, "normal", "bullet");

/* ── 1. META ──────────────────────────────────────────────────────────────── */

const META = [
  {
    id: "28710b68-e06f-436d-a207-2866e0538728",
    name: "prosuvannia-saitu-tsina-2026",
    set: {
      "metaTitle.uk": "Просування сайту: ціна від $300/міс і скільки коштує розкрутка",
      "metaDescription.uk":
        "➤ Вартість просування сайту у 2026: від $300/міс для сайтів послуг, від $500/міс " +
        "для магазинів ✔️ Разовий аудит $300 ✔️ З чого складається ціна розкрутки " +
        "➡ Без «гарантій топ-1».",
    },
  },
  {
    id: "seoArt2026-web-design-for-accountants",
    name: "web-design-for-accountants",
    set: {
      "metaTitle.en": "Accountant Website Design: What It Costs and What It Needs",
      "metaDescription.en":
        "➤ Web design for accountants and accountancy firms in the UK ✔️ Fixed prices from " +
        "£800, no quote-on-a-call ✔️ Trust signals, a page per service, fee transparency " +
        "➡ What to ask before you sign.",
    },
  },
];

/* ── 2. ТЕЛО СТАТЬИ ПРО БУХГАЛТЕРОВ ───────────────────────────────────────── */

const ACCOUNTANTS_ID = "seoArt2026-web-design-for-accountants";

/** Замена завышенного требования по скорости на то, что можно проверить. */
const SPEED_OLD = "Speed under 1 second.";
const SPEED_NEW =
  "Speed that clears Google's bar. Under 2.5 seconds to the largest element on a phone is the line Google calls good.";

/** Блок с ценами — вставляется перед «What to ask a web designer before you sign». */
const PRICE_ANCHOR = "What to ask a web designer before you sign";
const priceBlocks = () => [
  h2("What accountant website design costs"),
  para([
    "Most agencies in this niche quote on a call, which is exactly what makes two quotes " +
      "impossible to compare. Ours is fixed in the contract before work starts, and it is " +
      "the same figure published on our ",
    ["website development pricing page", "/en/pricing"],
    ".",
  ]),
  li([
    "A one-page site for a sole practitioner — from £800, one to two weeks. Profile, " +
      "specialisms, starting fees and a booking step.",
  ]),
  li([
    "A multi-page firm site — from £3,500, four to eight weeks. A page per service and a " +
      "page per specialism, which is the structure that actually ranks.",
  ]),
  li([
    "A platform with integrations or a bespoke client area — from £6,000.",
  ]),
  li([
    "From year two: support from £200 a month or £40 an hour, and a search campaign, if " +
      "you want one, from £300 a month.",
  ]),
  li(["An audit of the site you already have, with no rebuild — £300."]),
  para([
    "If a quote you are comparing does not say what year two costs, it is not comparable " +
      "with one that does. That is the single question that separates a £3,500 site from a " +
      "£3,500 site plus £4,000 of surprises.",
  ]),
];

async function run() {
  for (const m of META) {
    const before = await client.fetch('*[_id == $id][0]{metaTitle, metaDescription}', { id: m.id });
    if (!before) {
      console.error(`  ✗ ${m.name}: не найден`);
      continue;
    }
    console.log(`\n=== ${m.name}`);
    for (const [path, value] of Object.entries(m.set)) {
      const [field, loc] = path.split(".");
      console.log(`  ${field}.${loc}`);
      console.log(`    было:  ${before[field]?.[loc] ?? "—"}`);
      console.log(`    стало: ${value}`);
      if (field === "metaTitle" && value.length > 70) {
        throw new Error(`title ${value.length} символов — длинновато`);
      }
    }
    if (!DRY) {
      await client.patch(m.id).set(m.set).commit();
      console.log("  ✓ записано");
    }
  }

  console.log("\n=== тело web-design-for-accountants");
  const doc = await client.fetch('*[_id == $id][0]{"body": body.en}', { id: ACCOUNTANTS_ID });
  const body = [...(doc.body || [])];

  // 2a. заявление про скорость
  const si = body.findIndex(
    (b) =>
      b._type === "block" &&
      (b.children || []).map((c) => c.text).join("").startsWith(SPEED_OLD),
  );
  if (si < 0) {
    console.error("  ✗ блок про скорость не найден");
  } else {
    const full = (body[si].children || []).map((c) => c.text).join("");
    body[si] = { ...body[si], children: [
      { _key: key(), _type: "span", marks: [], text: full.replace(SPEED_OLD, SPEED_NEW) },
    ], markDefs: [] };
    console.log(`  [${si}] «${SPEED_OLD}» → «${SPEED_NEW.slice(0, 45)}…»`);
  }

  // 2b. блок с ценами
  const ai = body.findIndex(
    (b) =>
      b._type === "block" &&
      b.style === "h2" &&
      (b.children || []).map((c) => c.text).join("").includes(PRICE_ANCHOR),
  );
  if (ai < 0) {
    console.error("  ✗ якорь для блока цен не найден");
  } else if (body.some((b) => (b.children || []).map((c) => c.text).join("").includes("What accountant website design costs"))) {
    console.log("  блок цен уже есть — пропускаю");
  } else {
    const add = priceBlocks();
    body.splice(ai, 0, ...add);
    console.log(`  блок цен вставлен перед [${ai}] «${PRICE_ANCHOR}» (+${add.length} блоков)`);
  }

  console.log(`  тело: ${(doc.body || []).length} → ${body.length}`);
  if (!DRY) {
    await client.patch(ACCOUNTANTS_ID).set({ "body.en": body }).commit();
    console.log("  ✓ записано");
  }
}

console.log(DRY ? "СУХОЙ ПРОГОН" : "ЗАПИСЬ В SANITY");
run().then(
  () => console.log("\nготово"),
  (e) => {
    console.error("ОШИБКА", e.message);
    process.exit(1);
  },
);
