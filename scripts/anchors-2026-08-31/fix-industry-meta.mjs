/**
 * Починка description двух отраслевых страниц. Оба случая — это сниппет,
 * который обещает не то, что есть на странице.
 *
 * 1. /sites-for/medicine (uk) обещал «Lighthouse 98+». Это ровно то
 *    заявление, которое 31.08.2026 сняли с главной как противоречащее
 *    собственным данным Clarity: перф-скор сайта 83, LCP 2,4 с. В мете
 *    медицинской страницы оно осталось и видно в выдаче.
 *
 *    Заодно UA-описание начиналось с «медичних сайтів» — это WARM-кластер
 *    (позиции 20–35). RED HOT кластер этой страницы — «створення сайту для
 *    клініки»: 208 показов на позициях 16,3–18,7. Русское описание уже
 *    построено правильно, украинское приводим к нему же, плюс МІС —
 *    сущность, которую выносит thedc.studio, стоящий в выдаче выше нас.
 *
 * 2. /sites-for/renovation во всех трёх локалях обещает «Калькулятор
 *    кошторису». Слова «кошторис» на странице нет ни разу — проверено по
 *    всем девяти секциям. Человек приходит из выдачи за калькулятором сметы
 *    и не находит его.
 *
 *    Меняем на то, что на странице действительно есть и чего нет у
 *    конкурентов: кейс NBYG с цифрами до/после (со слов владельца, 3 заявки
 *    в месяц стали 24) и блок сравнения WordPress с кастомом — последний
 *    закрывает запрос «розробка сайтів на wordpress для будівельних
 *    компаній», 28 показов на позиции 13,0, ближайший к топ-10 у этой
 *    страницы.
 *
 * Запуск: node scripts/anchors-2026-08-31/fix-industry-meta.mjs [--dry]
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

const EDITS = [
  {
    id: "6tWqPRZWZzG4Lv3HK7JkzS",
    slug: "medicine",
    set: {
      "seo.description.uk":
        "➤ Створення сайту для клініки під ключ ✔️ Онлайн-запис і інтеграція з МІС " +
        "✔️ Каталог лікарів і прайс ✔️ Захист даних пацієнтів ✔️ Запуск за 4–6 тижнів " +
        "➡ Безкоштовний прорахунок.",
    },
    mustNotContain: "Lighthouse",
  },
  {
    id: "lOTgaDd8FU4wgJ8F4KCHn9",
    slug: "renovation",
    set: {
      "seo.description.uk":
        "➤ Сайти для будівельних і ремонтних компаній ✔️ Кейс: було 3 заявки на місяць — " +
        "стало 24 ✔️ Галерея «до/після» ✔️ WordPress чи кастомний код — чесне порівняння " +
        "➡ Безкоштовний прорахунок.",
      "seo.description.ru":
        "➤ Сайты для строительных и ремонтных компаний ✔️ Кейс: было 3 заявки в месяц — " +
        "стало 24 ✔️ Галерея «до/после» ✔️ WordPress или кастомный код — честное сравнение " +
        "➡ Бесплатный расчёт.",
      "seo.description.en":
        "➤ Custom websites for builders and renovation firms ✔️ Case: 3 enquiries a month " +
        "became 24 ✔️ Before/after gallery ✔️ WordPress vs custom code, compared honestly " +
        "➡ Free project estimate.",
    },
    mustNotContain: "кошторис",
  },
];

async function run() {
  for (const e of EDITS) {
    const before = await client.fetch('*[_id == $id][0]{"d": seo.description}', { id: e.id });
    if (!before) {
      console.error(`  ✗ ${e.slug}: документ не найден`);
      continue;
    }
    console.log(`\n=== ${e.slug}`);
    for (const [path, value] of Object.entries(e.set)) {
      const loc = path.split(".").pop();
      console.log(`  [${loc}] было:  ${before.d?.[loc] ?? "—"}`);
      console.log(`  [${loc}] стало: ${value}`);
      if (value.includes(e.mustNotContain)) {
        throw new Error(`новый текст всё ещё содержит «${e.mustNotContain}»`);
      }
    }
    if (DRY) continue;
    await client.patch(e.id).set(e.set).commit();
    console.log("  ✓ записано");
  }
}

console.log(DRY ? "СУХОЙ ПРОГОН" : "ЗАПИСЬ В SANITY");
run().then(
  () => console.log("\nготово"),
  (err) => {
    console.error("ОШИБКА", err.message);
    process.exit(1);
  },
);
