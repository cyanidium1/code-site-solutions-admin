/**
 * Проверка внутренних ссылок во всём контенте Sanity.
 *
 * Написан после того, как в блоге нашлось 16 мёртвых ссылок, которые не ловил
 * ни один существующий тест. Две ловушки, на которых легко обжечься:
 *
 * 1. Ссылки лежат не только в `markDefs.href`. У CTA-блоков это `ctaHref`,
 *    `ctaPrimaryHref`, `ctaSecondaryHref`, `buttonHref`. Проверка только
 *    markDefs даёт ложное «всё чисто».
 * 2. Слаги постов лежат в поле `slugs` (по локалям), а у кейсов — в `slug`.
 *    Перепутать их — значит получить сотню ложных срабатываний.
 *
 * Список локализованных корней читается из фронтенда
 * (`src/constants/i18n-routes.ts`), чтобы проверка не устаревала каждый раз,
 * когда там появляется новый маршрут.
 *
 * Запуск: node scripts/check-internal-links.mjs
 * Выход 1, если есть битые ссылки.
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(HERE, "..", "..", "code-site-solutions");
const I18N_ROUTES = join(FRONTEND, "src", "constants", "i18n-routes.ts");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  perspective: "published",
});

/** Разобрать LOCALIZED_ROOTS из исходника фронтенда. */
function readLocalizedRoots() {
  const src = readFileSync(I18N_ROUTES, "utf8");
  const block = src.slice(
    src.indexOf("export const LOCALIZED_ROOTS"),
    src.indexOf("export function localizePath"),
  );
  const roots = {};
  for (const m of block.matchAll(/(\w+):\s*new Set\(\[([\s\S]*?)\]\)/g)) {
    roots[m[1]] = new Set([...m[2].matchAll(/"(\/[^"]*)"/g)].map((x) => x[1]));
  }
  if (!roots.ru || !roots.en) throw new Error("не разобрал LOCALIZED_ROOTS");
  return roots;
}

/** Собрать все строковые поля, чьё имя содержит href. */
function collectHrefs(node, out = []) {
  if (Array.isArray(node)) {
    for (const n of node) collectHrefs(n, out);
    return out;
  }
  if (!node || typeof node !== "object") return out;
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === "string" && /href/i.test(k) && v.startsWith("/")) out.push([k, v]);
    else collectHrefs(v, out);
  }
  return out;
}

const ROOTS = readLocalizedRoots();

const posts = await client.fetch(
  '*[_type=="blogPost" && status=="published"]{slugs}',
);
const caseSlugs = new Set(
  await client.fetch(
    '*[_type=="caseStudy" && status=="published" && defined(slug.current)].slug.current',
  ),
);
const industrySlugs = new Set(
  await client.fetch('*[_type=="industryPage" && status=="published"].slug.current'),
);

const blogSlugs = { uk: new Set(), ru: new Set(), en: new Set() };
for (const p of posts) {
  for (const l of ["uk", "ru", "en"]) {
    const s = p.slugs?.[l]?.current;
    if (s) blogSlugs[l].add(s);
  }
}

const docs = await client.fetch(
  '*[_type in ["blogPost","caseStudy","industryPage"] && status=="published"]',
);

let checked = 0;
let broken = 0;

for (const doc of docs) {
  for (const [field, href] of collectHrefs(doc)) {
    checked++;
    const prefix = href.match(/^\/(ru|en)(?=\/|$)/)?.[1] ?? null;
    const path = (prefix ? href.slice(prefix.length + 1) || "/" : href).replace(/[#?].*$/, "");

    let ok = true;
    let m;
    if ((m = path.match(/^\/blog\/([a-z0-9-]+)$/))) {
      ok = blogSlugs[prefix ?? "uk"].has(m[1]);
    } else if ((m = path.match(/^\/portfolio\/([a-z0-9-]+)$/))) {
      ok = caseSlugs.has(m[1]);
    } else if ((m = path.match(/^\/sites-for\/([a-z0-9-]+)$/))) {
      ok = industrySlugs.has(m[1]);
    } else if (prefix) {
      // Локаль-префиксный корень существует, только если он есть в LOCALIZED_ROOTS.
      ok = ROOTS[prefix].has(path);
    }

    if (!ok) {
      console.log(`  БИТАЯ  ${href}  [${field}]  в ${doc._type} ${doc._id}`);
      broken++;
    }
  }
}

console.log(
  `\nпроверено ${docs.length} документов, ${checked} внутренних ссылок, битых: ${broken}`,
);
process.exit(broken ? 1 : 0);
