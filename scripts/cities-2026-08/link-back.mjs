/**
 * Обратные ссылки на городские статьи.
 *
 * Городские материалы ссылаются на локальный SEO-кластер, но кластер о них не
 * знал — статья без входящих ссылок с сайта живёт хуже, чем связанная.
 * Дописываем по одному городу в relatedPostSlugs трёх существующих статей,
 * выбирая город по смыслу принимающего материала:
 *
 * - «локальні сторінки чи дорвеї» → Київ: там разбор про страницы под районы;
 * - «бізнес у кількох містах» → Львів: про выбор подрядчика на насыщенном рынке;
 * - «локальне SEO Google Maps» → Вінниця: про пустую выдачу в регионе.
 *
 * Запуск: SANITY_WRITE_TOKEN=… node scripts/cities-2026-08/link-back.mjs [--dry]
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

const ADD = {
  "lokalni-storinky-chy-dorveii": "rozrobka-saitu-kyiv",
  "biznes-u-kilkokh-mistakh-storinky": "rozrobka-saitu-lviv",
  "lokalne-seo-top-3-google-maps": "rozrobka-saitu-vinnytsia",
};

for (const [host, city] of Object.entries(ADD)) {
  const doc = await client.fetch(
    '*[_type=="blogPost" && slugs.uk.current==$s][0]{_id,relatedPostSlugs}',
    { s: host },
  );
  if (!doc) throw new Error(`нет статьи ${host}`);
  const current = doc.relatedPostSlugs ?? [];
  if (current.includes(city)) {
    console.log(`  ${host}: уже есть`);
    continue;
  }
  // Держим тройку: самый старый related уступает место городу.
  const next = [...current.slice(0, 2), city];
  console.log(`  ${host}: ${JSON.stringify(current)} → ${JSON.stringify(next)}`);
  if (!DRY) await client.patch(doc._id).set({ relatedPostSlugs: next }).commit();
}

console.log(DRY ? "\n(dry run)" : "\nготово");
