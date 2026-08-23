/**
 * IceLab — довести текст кейса до того же трёхмесячного окна, что и метрики.
 *
 * После patch-icelab-metrics-3m.mjs блок метрик показывает 267 / 4,48 тыс. / 6%,
 * а подзаголовок героя и абзац «icl-outcome» всё ещё говорили «за 28 днів —
 * 212 переходів, 3,67 тис. показів». На одной странице две пары цифр про один
 * и тот же сайт: читатель видит противоречие, а не рост.
 *
 * Меняются только числа и период. Формулировки, структура и смысл абзацев
 * сохранены дословно — это текст владельца, а не мой.
 *
 * Позиция везде переведена в единственное число («за комерційним запитом»),
 * потому что приложенный скриншот Search Console показывает один
 * отфильтрованный запрос.
 *
 * Usage (из корня admin-репо):
 *   node scripts/geo-cluster/patch-icelab-copy-3m.mjs --dry-run
 *   node scripts/geo-cluster/patch-icelab-copy-3m.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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

const HERO = {
  uk: "IceLab — український виробник сухого льоду з власними потужностями у Києві та Львові. Ми створили інтернет-магазин, який працює з роздрібними та оптовими клієнтами й залучає аудиторію з Google: за три місяці — 267 переходів, 4,48 тис. показів і позиція 2,1 за комерційним запитом.",
  ru: "IceLab — украинский производитель сухого льда с собственными мощностями в Киеве и Львове. Мы создали интернет-магазин, который работает с розничными и оптовыми клиентами и привлекает аудиторию из Google: за три месяца — 267 переходов, 4,48 тыс. показов и позиция 2,1 по коммерческому запросу.",
  en: "IceLab is a Ukrainian dry ice manufacturer with its own facilities in Kyiv and Lviv. We built an online store that serves both retail and wholesale customers and attracts new audience from Google: 267 clicks, 4.48k impressions in three months and position 2.1 for a commercial query.",
};

const OUTCOME = {
  uk: "IceLab отримав не просто презентаційний сайт, а повноцінну систему онлайн-продажів і залучення клієнтів із пошуку. За три місяці сайт отримав 4,48 тис. показів і 267 переходів із Google, позицію 2,1 за комерційним запитом та CTR 6%. Цей результат став наслідком правильної структури: окремих сторінок під категорії, товари, міста, B2B-напрям і конкретні потреби покупців.",
  ru: "IceLab получил не просто презентационный сайт, а полноценную систему онлайн-продаж и привлечения клиентов из поиска. За три месяца сайт получил 4,48 тыс. показов и 267 переходов из Google, позицию 2,1 по коммерческому запросу и CTR 6%. Этот результат стал следствием правильной структуры: отдельных страниц под категории, товары, города, B2B-направление и конкретные потребности покупателей.",
  en: "IceLab got a full online sales and search acquisition system, not just a showcase site. In three months it earned 4.48k impressions and 267 clicks from Google, position 2.1 for a commercial query and a 6% CTR. The result comes from the right structure: dedicated pages for categories, products, cities, the B2B funnel and specific buyer needs.",
};

const OUTCOME_KEY = "icl-outcome";

/**
 * SEO-описания несли те же 28-дневные цифры. Меняются только числа и период.
 * Утверждение «10 локальних SEO-сторінок» НЕ трогаем: в sitemap icelab.com.ua
 * видно 8 городских страниц, но это счёт владельца о собственной работе, и
 * молча править его я не буду — вынесено отдельным вопросом.
 */
const SEO_DESC = {
  uk: "IceLab — інтернет-магазин сухого льоду: каталог із замовленням, B2B-розділ, 10 локальних SEO-сторінок і позиція 2,1 в Google за комерційним запитом.",
  ru: "IceLab — интернет-магазин сухого льда: каталог с заказом, B2B-раздел, 10 локальных SEO-страниц и позиция 2,1 в Google по коммерческому запросу.",
  en: "IceLab — a Code-Site.Art case study: a dry ice store at position 2.1 on a commercial query, 267 Google clicks and 6% CTR in three months.",
};

async function main() {
  if (!TOKEN && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");
  console.log(DRY ? "DRY RUN — ничего не пишем\n" : "ЗАПИСЬ в production\n");

  const doc = await client.fetch(`*[_type == "caseStudy" && slug.current == "icelab"][0]`);
  if (!doc) throw new Error("кейс icelab не найден");

  const idx = doc.sections.findIndex((s) => s._key === OUTCOME_KEY);
  if (idx === -1) throw new Error(`секция ${OUTCOME_KEY} не найдена`);

  for (const l of ["uk", "ru", "en"]) {
    console.log(`hero.${l}`);
    console.log(`  было:  ...${doc.hero.subheading[l].slice(-95)}`);
    console.log(`  стало: ...${HERO[l].slice(-95)}`);
  }
  console.log();
  for (const l of ["uk", "ru", "en"]) {
    const cur = doc.sections[idx].body[l].map((b) => b.children.map((c) => c.text).join("")).join(" ");
    console.log(`${OUTCOME_KEY}.${l}`);
    console.log(`  было:  ${cur.slice(0, 100)}...`);
    console.log(`  стало: ${OUTCOME[l].slice(0, 100)}...`);
  }

  // Проверяем, что абзац ровно один — иначе замена текста потеряла бы структуру.
  for (const l of ["uk", "ru", "en"]) {
    const blocks = doc.sections[idx].body[l];
    if (blocks.length !== 1 || blocks[0].children.length !== 1) {
      throw new Error(
        `${OUTCOME_KEY}.${l}: ожидался один блок с одним span, получено ` +
          `${blocks.length} блоков — правку надо делать вручную, чтобы не потерять разметку`,
      );
    }
  }

  if (DRY) {
    console.log("\nDry run завершён — документ не изменён.");
    return;
  }

  const backupDir = join(ROOT, "backups", "icelab-copy-3m-2026-08-23");
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(join(backupDir, "caseStudy-icelab.json"), JSON.stringify(doc, null, 2), "utf8");
  console.log(`\nбэкап: ${backupDir}`);

  const sections = [...doc.sections];
  const body = { ...sections[idx].body };
  for (const l of ["uk", "ru", "en"]) {
    const blocks = body[l];
    body[l] = [
      {
        ...blocks[0],
        children: [{ ...blocks[0].children[0], text: OUTCOME[l] }],
      },
    ];
  }
  sections[idx] = { ...sections[idx], body };

  await client
    .patch(doc._id)
    .set({
      "hero.subheading": { ...doc.hero.subheading, ...HERO },
      "seo.description": { ...doc.seo.description, ...SEO_DESC },
      sections,
    })
    .commit();

  console.log("готово. Проверьте /portfolio/icelab после ревалидации.");
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
