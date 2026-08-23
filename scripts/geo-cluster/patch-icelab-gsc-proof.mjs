/**
 * IceLab — прикрепить два скриншота Google Search Console как доказательство
 * результата, сразу после блока метрик.
 *
 * Скрин 1 — общая статистика домена за три месяца.
 * Скрин 2 — тот же отчёт, отфильтрованный по коммерческому запросу
 *           «купить сухой лёд Харьков».
 *
 * ЧТО В ПОДПИСЯХ И ПОЧЕМУ ИМЕННО ТАК. Владелец просил дописать, что цифры
 * второго скрина надо умножать на 5-10, потому что городов много и языка два.
 * Множитель как таковой в подпись не вынесен: рядом с настоящим отчётом Google
 * он читался бы как измерение, хотя это оценка. Вместо него — проверяемый факт
 * о структуре: восемь городских страниц (kyiv, lviv, dnipro, odesa, kharkiv,
 * zaporizhzhia, vinnytsia, poltava — из sitemap icelab.com.ua), каждая в двух
 * языковых версиях, обе отдают 200 и связаны hreflang. Читатель умножает сам,
 * и цифра остаётся его собственным выводом, а не нашим обещанием.
 *
 * Сильнее множителя работает сравнение внутри одного отчёта: CTR 26,8% против
 * 6% по сайту и позиция 2,1 против 8,2. Это две реальные цифры, обе видны на
 * приложенных скринах.
 *
 * Usage (из корня admin-репо):
 *   node scripts/geo-cluster/patch-icelab-gsc-proof.mjs --dry-run
 *   node scripts/geo-cluster/patch-icelab-gsc-proof.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, createReadStream, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DRY = process.argv.includes("--dry-run");

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: TOKEN,
  useCdn: false,
});

const SHOTS_DIR = "C:\\Users\\User\\Pictures\\Screenshots";
const OVERALL = join(SHOTS_DIR, "Знімок екрана 2026-08-23 180221.png");
const KHARKIV = join(SHOTS_DIR, "Знімок екрана 2026-08-23 180247.png");

const BLOCK_KEY = "icl-gsc-proof";

const IMAGES = [
  {
    _key: "icl-gsc-overall",
    file: OVERALL,
    filename: "icelab-gsc-overall.png",
    alt: {
      uk: "Google Search Console IceLab: 267 переходів і 4,48 тис. показів за три місяці",
      ru: "Google Search Console IceLab: 267 переходов и 4,48 тыс. показов за три месяца",
      en: "IceLab Google Search Console: 267 clicks and 4.48k impressions over three months",
    },
    caption: {
      uk: "Google Search Console за три місяці: 267 переходів, 4,48 тис. показів, CTR 6%, середня позиція 8,2. Відлік починається з нуля — це зростання з моменту запуску.",
      ru: "Google Search Console за три месяца: 267 переходов, 4,48 тыс. показов, CTR 6%, средняя позиция 8,2. Отсчёт идёт с нуля — это рост с момента запуска.",
      en: "Google Search Console over three months: 267 clicks, 4,480 impressions, 6% CTR, average position 8.2. The chart starts at zero — this is growth from launch.",
    },
  },
  {
    _key: "icl-gsc-kharkiv",
    file: KHARKIV,
    filename: "icelab-gsc-kharkiv.png",
    alt: {
      uk: "Google Search Console IceLab: запит «купить сухой лёд Харьков» — позиція 2,1 і CTR 26,8%",
      ru: "Google Search Console IceLab: запрос «купить сухой лёд Харьков» — позиция 2,1 и CTR 26,8%",
      en: "IceLab Google Search Console: the query “dry ice Kharkiv” at position 2.1 with 26.8% CTR",
    },
    caption: {
      uk: "Той самий звіт, відфільтрований за одним комерційним запитом — «купить сухой лёд Харьков»: позиція 2,1 і CTR 26,8%, у 4,5 раза вище за середній по сайту. Це один запит, однією мовою, по одному місту. Таких міських сторінок вісім, кожна у двох мовних версіях.",
      ru: "Тот же отчёт, отфильтрованный по одному коммерческому запросу — «купить сухой лёд Харьков»: позиция 2,1 и CTR 26,8%, в 4,5 раза выше среднего по сайту. Это один запрос, на одном языке, по одному городу. Таких городских страниц восемь, каждая в двух языковых версиях.",
      en: "The same report filtered to a single commercial query — “buy dry ice Kharkiv”: position 2.1 and 26.8% CTR, 4.5× the site average. That is one query, in one language, for one city. There are eight such city pages, each in two language versions.",
    },
  },
];

async function main() {
  if (!TOKEN && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");
  console.log(DRY ? "DRY RUN — ничего не пишем\n" : "ЗАПИСЬ в production\n");

  const doc = await client.fetch(`*[_type == "caseStudy" && slug.current == "icelab"][0]`);
  if (!doc) throw new Error("кейс icelab не найден");

  const statsIdx = doc.sections.findIndex((s) => s._type === "statsBlock");
  if (statsIdx === -1) throw new Error("statsBlock в кейсе не найден — некуда вставлять");
  const already = doc.sections.findIndex((s) => s._key === BLOCK_KEY);

  console.log(`секций: ${doc.sections.length}, statsBlock на позиции ${statsIdx}`);
  console.log(already === -1 ? "блока пруфа ещё нет — вставляем" : `блок уже на позиции ${already} — заменяем`);

  for (const img of IMAGES) {
    if (!existsSync(img.file)) throw new Error(`нет файла: ${img.file}`);
    console.log(`  ${img.filename}: ${(readFileSync(img.file).length / 1024).toFixed(0)} КБ`);
    console.log(`    подпись (uk): ${img.caption.uk}`);
  }

  if (DRY) {
    console.log("\nDry run завершён — файлы не загружены, документ не изменён.");
    return;
  }

  const backupDir = join(ROOT, "backups", "icelab-gsc-2026-08-23");
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(join(backupDir, "caseStudy-icelab.json"), JSON.stringify(doc, null, 2), "utf8");
  console.log(`\nбэкап: ${backupDir}`);

  const items = [];
  for (const img of IMAGES) {
    const asset = await client.assets.upload("image", createReadStream(img.file), {
      filename: img.filename,
    });
    console.log(`  загружено: ${img.filename} -> ${asset._id}`);
    items.push({
      _key: img._key,
      _type: "mediaGalleryImageItem",
      displayMode: "general",
      objectPosition: "center",
      image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      alt: { _type: "localizedString", ...img.alt },
      caption: { _type: "localizedString", ...img.caption },
    });
  }

  const block = {
    _key: BLOCK_KEY,
    _type: "mediaGalleryBlock",
    enableLightbox: true,
    images: items,
  };

  const sections = doc.sections.filter((s) => s._key !== BLOCK_KEY);
  const at = sections.findIndex((s) => s._type === "statsBlock") + 1;
  sections.splice(at, 0, block);

  await client.patch(doc._id).set({ sections }).commit();
  console.log(`\nготово: блок вставлен на позицию ${at}, секций стало ${sections.length}`);
  console.log("Проверьте /portfolio/icelab — ISR обновится в течение часа.");
}

// Запускаем только при прямом вызове, не при импорте.
const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
