/**
 * Переориентация страницы `/sites-for/medicine` на формулировку «клініка».
 *
 * Данные GSC за 3 месяца по этой странице (112 запросов, 2 730 показов,
 * 2 клика, средняя позиция 39,8):
 *
 *   формулировка «клініка»       — 210 показов, позиции 16,8–20,7
 *   формулировка «медичний сайт» — 347 показов, позиции 26,1–47,7
 *
 * Страница ближе всего к топ-10 по «клініка», а title и H1 у неё были под
 * «медичні сайти» — то есть под группу, которая ранжируется заметно хуже.
 * «Медичні сайти» никуда не деваются: остаются в description и в заголовках
 * второго уровня, которых на странице семнадцать.
 *
 * Русская версия отдельно: у неё 0 показов за три месяца, а H1 был
 * «Клиника, в которую записываются» — образный, без единого коммерческого
 * слова. Русские медицинские запросы (152 показа) при этом отдавались
 * украинской странице на позициях 60–78.
 *
 * Английскую не трогаем — по ней данных, оправдывающих правку, нет.
 *
 * Запуск: SANITY_WRITE_TOKEN=… node scripts/medicine-2026-08-30/retarget-headings.mjs [--dry]
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

const ID = "6tWqPRZWZzG4Lv3HK7JkzS"; // industryPage medicine

const PATCH = {
  "seo.title.uk": "Створення сайту для клініки під ключ | Code-Site.Art",
  "seo.title.ru": "Создание сайта для клиники под ключ | Code-Site.Art",
  // `*…*` — курсивная часть заголовка, так устроен hero.heading.
  "hero.heading.uk": "Створення сайту для клініки\n*стоматології, медцентри, приватні кабінети*",
  "hero.heading.ru": "Создание сайта для клиники\n*стоматологии, медцентры, частные кабинеты*",
  "seo.description.ru":
    "➤ Создание сайта для клиники под ключ ✔️ Разработка медицинских сайтов: онлайн-запись, каталог врачей, прайс ✔️ Защита данных пациентов ✔️ Запуск за 4–6 недель ➡ Бесплатный расчёт.",
};

const before = await client.fetch(
  '*[_id==$id][0]{"title":seo.title, "heading":hero.heading, "desc":seo.description}',
  { id: ID },
);
if (!before) throw new Error(`нет документа ${ID}`);

console.log("было:");
for (const l of ["uk", "ru"]) {
  console.log(`  [${l}] title:   ${before.title?.[l]}`);
  console.log(`  [${l}] heading: ${JSON.stringify(before.heading?.[l])}`);
}
console.log("\nстанет:");
for (const [k, v] of Object.entries(PATCH)) console.log(`  ${k}: ${JSON.stringify(v)}`);

if (DRY) {
  console.log("\n(dry run, ничего не записано)");
  process.exit(0);
}

await client.patch(ID).set(PATCH).commit();
console.log("\nзаписано");
