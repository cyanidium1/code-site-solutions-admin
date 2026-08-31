/**
 * Загрузка обложки блог-поста в Sanity.
 *
 * Картинки генерим в ChatGPT (см. _PROMPTS.md), скачиваем в Downloads и
 * прогоняем через этот скрипт. Он сжимает файл и кладёт в поле `cover`
 * (тип imageWithLocalizedAlt) с alt на трёх языках.
 *
 * Почему сжимаем: ChatGPT отдаёт PNG на 1.5–2 МБ. Sanity CDN всё равно
 * пережмёт на выдаче, но хранить и отдавать исходник такого веса незачем —
 * WebP 1600px укладывается примерно в 150 КБ без видимой разницы.
 *
 * sharp живёт в node_modules фронтенда (его тянет Next), отдельной установки
 * в этом репозитории нет — резолвим оттуда.
 *
 * Запуск:
 *   SANITY_WRITE_TOKEN=… node scripts/covers-2026-08/upload-cover.mjs \
 *     --file "C:/Users/User/Downloads/ChatGPT Image ….png" \
 *     --post <uk-slug> \
 *     --alt-uk "…" --alt-ru "…" --alt-en "…" [--dry]
 */
import "dotenv/config";
import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(HERE, "..", "..", "..", "code-site-solutions");
const require = createRequire(join(FRONTEND, "package.json"));
const sharp = require("sharp");

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}
const DRY = process.argv.includes("--dry");

const file = arg("file");
const postSlug = arg("post");
const altUk = arg("alt-uk");
const altRu = arg("alt-ru");
const altEn = arg("alt-en");

if (!file || !postSlug || !altUk || !altRu || !altEn) {
  throw new Error("нужны --file --post --alt-uk --alt-ru --alt-en");
}

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

const raw = await readFile(file);

// Проверка пропорций — не педантизм. Скачивание из редактора картинок ChatGPT
// один раз отдало совершенно другой файл (1230x1278 вместо 1672x941), и он
// молча уехал в CMS как обложка. Обложка обязана быть широкой.
const meta = await sharp(raw).metadata();
const ratio = meta.width / meta.height;
if (ratio < 1.5 || ratio > 2.1) {
  throw new Error(
    `${meta.width}x${meta.height} (соотношение ${ratio.toFixed(2)}) — не похоже на обложку 16:9. ` +
      `Скорее всего скачался не тот файл. Проверьте и перекачайте.`,
  );
}

const optimised = await sharp(raw)
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toBuffer();

const kb = (n) => `${Math.round(n / 1024)} КБ`;
console.log(`${file}\n  ${kb(raw.length)} → ${kb(optimised.length)} webp`);

// Ищем по uk-слагу, а если его нет — по en. Две статьи в блоге существуют
// только на английском (web-design-for-accountants, websites-for-solicitors),
// и по uk они не находятся вовсе.
const post = await client.fetch(
  `*[_type=="blogPost" && (slugs.uk.current==$s || slugs.en.current==$s)][0]{
     _id, "hasCover": defined(cover.image.asset)
   }`,
  { s: postSlug },
);
if (!post) throw new Error(`нет поста со слагом ${postSlug} (ни uk, ни en)`);
if (post.hasCover) console.log("  внимание: у поста уже есть обложка, будет заменена");

if (DRY) {
  console.log("  (dry run, ничего не загружено)");
  process.exit(0);
}

const asset = await client.assets.upload("image", optimised, {
  filename: `cover-${postSlug}.webp`,
  contentType: "image/webp",
});
console.log(`  asset ${asset._id}`);

await client
  .patch(post._id)
  .set({
    cover: {
      _type: "imageWithLocalizedAlt",
      image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      alt: { _type: "localizedString", uk: altUk, ru: altRu, en: altEn },
    },
  })
  .commit();

console.log(`  обложка проставлена посту ${post._id}`);
