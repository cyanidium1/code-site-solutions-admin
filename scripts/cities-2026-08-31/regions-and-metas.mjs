/**
 * Городские страницы, август 2026 — две правки в CMS.
 *
 * 1. РЕГИОНЫ КЕЙСОВ.
 *    У шести кейсов поле `region` пустое, ещё у двух стоит общее «Україна».
 *    Гео-план (`GEO-CLUSTER-PLAN.md`) отмечал это как прямую потерю: на кейс
 *    нельзя сослаться как на городской пример. Города подтверждены владельцем:
 *      Львов   — co2lab (icelab уже «Київ і Львів»)
 *      Одесса  — e-fedra-beauty (efedra-clinic уже «Одеса»)
 *      Киев    — glimmer, kondor-device, le-muse-nature, raul-avto,
 *                urmodels, tatarka-franchise
 *    Это не косметика: `region` — единственное место, где город кейса живёт
 *    структурно, и городские страницы опираются на него как на доказательство
 *    «мы здесь работали».
 *
 * 2. РАЗВОД СТАТЕЙ И НОВЫХ СТРАНИЦ.
 *    Городские статьи от 31.08 целятся metaTitle прямо в коммерческий запрос
 *    («Розробка сайтів Дніпро: ціни від $800»). Ровно туда же целятся новые
 *    страницы /rozrobka-saitiv-dnipro и /rozrobka-saitiv-odesa. Две страницы
 *    на один запрос — это каннибализация, и Google выберет не ту.
 *
 *    Разводим по интенту: страница забирает коммерческий запрос («заказать»),
 *    статья уходит в информационный («сколько стоит», «как выбрать»). H1 статей
 *    не трогаем — они и так информационные («попит, ціни і сезонність»),
 *    проблема была только в metaTitle.
 *
 *    Харьков не трогаем: городской страницы под него нет и не будет, пока нет
 *    ни одного харьковского кейса.
 *
 * Запуск: node scripts/cities-2026-08-31/regions-and-metas.mjs [--dry]
 */
import "dotenv/config";
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", useCdn: false, token,
});

const REGIONS = {
  lviv:  { uk: "Львів, Україна",  ru: "Львов, Украина",  en: "Lviv, Ukraine" },
  odesa: { uk: "Одеса, Україна",  ru: "Одесса, Украина", en: "Odesa, Ukraine" },
  kyiv:  { uk: "Київ, Україна",   ru: "Киев, Украина",   en: "Kyiv, Ukraine" },
};

const CASE_CITY = {
  "co2lab": "lviv",
  "e-fedra-beauty": "odesa",
  "glimmer": "kyiv",
  "kondor-device": "kyiv",
  "le-muse-nature": "kyiv",
  "raul-avto": "kyiv",
  "urmodels": "kyiv",
  "tatarka-franchise": "kyiv",
};

/** metaTitle статей → информационный интент, чтобы не спорить со страницами. */
const ARTICLE_METAS = {
  "city2026-rozrobka-saitu-dnipro": {
    uk: "Скільки коштує сайт у Дніпрі: розбір ринку 2026",
    ru: "Сколько стоит сайт в Днепре: разбор рынка 2026",
  },
  "city2026-rozrobka-saitu-odesa": {
    uk: "Як обрати підрядника для сайту в Одесі: чек-лист",
    ru: "Как выбрать подрядчика для сайта в Одессе: чек-лист",
  },
};

const run = async () => {
  const slugs = Object.keys(CASE_CITY);
  const cases = await client.fetch(
    '*[_type=="caseStudy" && slug.current in $slugs]{_id,"slug":slug.current,region}',
    { slugs },
  );

  let tx = client.transaction();
  let n = 0;

  for (const c of cases) {
    const city = CASE_CITY[c.slug];
    const next = { _type: "localizedString", ...REGIONS[city] };
    const before = c.region?.uk ?? "—";
    if (before === next.uk) { console.log(`  = ${c.slug}: уже «${before}»`); continue; }
    console.log(`  → ${c.slug}: «${before}» → «${next.uk}»`);
    tx = tx.patch(c._id, (p) => p.set({ region: next }));
    n++;
  }

  const missing = slugs.filter((s) => !cases.some((c) => c.slug === s));
  if (missing.length) console.log(`  ! кейсы не найдены: ${missing.join(", ")}`);

  for (const [id, meta] of Object.entries(ARTICLE_METAS)) {
    const doc = await client.fetch("*[_id==$id][0]{_id,metaTitle}", { id });
    if (!doc) { console.log(`  ! статья не найдена: ${id}`); continue; }
    console.log(`  → ${id}\n      uk: «${doc.metaTitle?.uk}»\n       →  «${meta.uk}»`);
    tx = tx.patch(id, (p) =>
      p.set({ "metaTitle.uk": meta.uk, "metaTitle.ru": meta.ru }),
    );
    n++;
  }

  if (DRY) { console.log(`\nDRY: изменений было бы ${n}`); return; }
  if (!n) { console.log("\nнечего менять"); return; }
  await tx.commit();
  console.log(`\nготово: ${n} документов обновлено`);
};

run().catch((e) => { console.error(e); process.exit(1); });
