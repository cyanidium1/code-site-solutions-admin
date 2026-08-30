/**
 * `/support` живёт только на украинском, `/vs-*` — на uk и en. В блоге же
 * авторы дописывали префикс локали механически, и получались /ru/support,
 * /en/support, /ru/vs-wordpress, /ru/vs-constructors — все 404.
 *
 * Снимаем префикс: читатель попадает на существующую украинскую страницу.
 * Ровно так же ведёт себя шапка сайта — resolveRootHref() в
 * src/constants/i18n-routes.ts отдаёт голый UA-путь, когда локализованного
 * двойника нет. Когда появятся /ru/support и остальные, эти ссылки надо
 * будет вернуть обратно.
 *
 * Запуск: SANITY_WRITE_TOKEN=… node scripts/glossary-2026-08/fix-locale-prefixed-links.mjs [--dry]
 */
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

const REHREF = {
  "/ru/support": "/support",
  "/en/support": "/support",
  "/ru/vs-wordpress": "/vs-wordpress",
  "/ru/vs-constructors": "/vs-constructors",
};

const posts = await client.fetch(
  '*[_type=="blogPost" && status=="published"]{_id,body,faq}',
);

let docs = 0;
let links = 0;

for (const post of posts) {
  const patch = {};
  for (const field of ["body", "faq"]) {
    if (!post[field]) continue;
    const next = structuredClone(post[field]);
    let touched = false;
    // markDefs сидят на разной глубине в body (по локалям) и в faq — проще
    // обойти дерево целиком, чем гадать про форму каждого поля.
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== "object") return;
      // Ссылки лежат не только в markDefs.href — у CTA-блоков это ctaHref,
      // ctaPrimaryHref, ctaSecondaryHref, buttonHref. Ловим любое поле,
      // в имени которого есть href.
      for (const [key, value] of Object.entries(node)) {
        if (typeof value === "string" && /href/i.test(key) && REHREF[value]) {
          node[key] = REHREF[value];
          touched = true;
          links++;
        } else {
          walk(value);
        }
      }
    };
    walk(next);
    if (touched) patch[field] = next;
  }
  if (!Object.keys(patch).length) continue;
  docs++;
  console.log(`  ${post._id}: ${Object.keys(patch).join(", ")}`);
  if (!DRY) await client.patch(post._id).set(patch).commit();
}

console.log(`\nстатей: ${docs}, ссылок: ${links}${DRY ? " (dry run)" : ""}`);
