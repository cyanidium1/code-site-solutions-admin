/**
 * Скриншоты нашей админки в статью «CMS — що це і навіщо вона сайту».
 *
 * Статья объясняет, что такое CMS, но показать её было нечем — а у нас есть
 * два готовых снимка Sanity Studio, которые уже стоят на /vs-constructors и
 * /about. В статье они уместнее всего: читатель приходит с вопросом «что это
 * вообще такое» и получает ответ картинкой, а не абзацем.
 *
 * Оба файла лежат в public/ фронтенда, но `blogImage` требует ассет Sanity,
 * поэтому загружаем их туда один раз и вставляем блоками во все три локали.
 *
 * Запуск: SANITY_WRITE_TOKEN=… node scripts/blog-cta-2026-08-30/add-sanity-screens.mjs [--dry]
 */
import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, "..", "..", "..", "code-site-solutions", "public", "sanity-studio");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

const POST_ID = "glos2026-shcho-take-cms";

const SHOTS = [
  {
    file: "admin-desktop.png",
    alt: {
      uk: "Адмін-панель Sanity Studio на десктопі: список матеріалів і форма редагування",
      ru: "Админ-панель Sanity Studio на десктопе: список материалов и форма редактирования",
      en: "Sanity Studio admin on desktop: content list and the editing form",
    },
    caption: {
      uk: "Так виглядає CMS, у якій ми ведемо цей блог: Sanity Studio. Ліворуч — типи контенту, праворуч — поля конкретного матеріалу.",
      ru: "Так выглядит CMS, в которой мы ведём этот блог: Sanity Studio. Слева — типы контента, справа — поля конкретного материала.",
      en: "This is the CMS this blog runs on — Sanity Studio. Content types on the left, the fields of one entry on the right.",
    },
  },
  {
    file: "admin-mobile.png",
    alt: {
      uk: "Та сама адмін-панель на телефоні: правки контенту з мобільного",
      ru: "Та же админ-панель на телефоне: правки контента с мобильного",
      en: "The same admin on a phone: editing content from mobile",
    },
    caption: {
      uk: "Та сама панель на телефоні — правку тексту чи ціни можна внести з дороги, без розробника.",
      ru: "Та же панель на телефоне — правку текста или цены можно внести из дороги, без разработчика.",
      en: "The same panel on a phone — a text or price change can be made on the move, without a developer.",
    },
  },
];

const post = await client.getDocument(POST_ID);
if (!post) throw new Error(`нет поста ${POST_ID}`);

const already = JSON.stringify(post.body).includes("blogImage");
if (already) {
  console.log("в статье уже есть blogImage — выходим, чтобы не задвоить");
  process.exit(0);
}

const assets = [];
for (const shot of SHOTS) {
  const buf = await readFile(join(PUBLIC, shot.file));
  if (DRY) {
    console.log(`  ${shot.file}: ${Math.round(buf.length / 1024)} КБ (dry run, не загружаю)`);
    assets.push({ _id: `dry-${shot.file}` });
    continue;
  }
  const asset = await client.assets.upload("image", buf, {
    filename: `sanity-studio-${shot.file}`,
    contentType: "image/png",
  });
  console.log(`  ${shot.file} → ${asset._id}`);
  assets.push(asset);
}

let seq = 0;
const key = () => `cms${(seq++).toString(36)}${Date.now().toString(36).slice(-4)}`;

const body = structuredClone(post.body);

for (const [locale, blocks] of Object.entries(body)) {
  if (!Array.isArray(blocks)) continue;
  // Ставим после первого h2 — читатель уже получил определение и готов
  // увидеть, как это выглядит, до того как пойдут подробности.
  const at = blocks.findIndex((b) => b.style === "h2");
  const insertAt = at === -1 ? 1 : at + 2;

  // У blogImage ассет лежит прямо в `asset`, а не внутри `image` — так его
  // достаёт BLOG_BODY_LOCALIZED в sanity-queries.ts.
  const images = SHOTS.map((shot, i) => ({
    _key: key(),
    _type: "blogImage",
    asset: { _type: "reference", _ref: assets[i]._id },
    alt: shot.alt[locale] ?? shot.alt.uk,
    caption: shot.caption[locale] ?? shot.caption.uk,
  }));

  blocks.splice(insertAt, 0, ...images);
  console.log(`  [${locale}] вставлено после блока ${insertAt}`);
}

if (DRY) {
  console.log("\n(dry run, документ не изменён)");
  process.exit(0);
}

await client.patch(POST_ID).set({ body }).commit();
console.log("\nзаписано");
