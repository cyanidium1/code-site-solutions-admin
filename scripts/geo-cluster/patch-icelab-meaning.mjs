/**
 * IceLab — переписать блок «Що це означає для бізнесу» (icl-meaning) под цифры,
 * которые теперь видно на приложенных скриншотах Search Console.
 *
 * Было: «позиція 2 за комерційними запитами… CTR 5,8%» — цифры 28-дневного окна
 * и множественное число там, где доказательство одно.
 *
 * Стало: контраст внутри одного отчёта — средняя позиция по домену 8,2 и CTR 6%
 * против позиции 2,1 и CTR 26,8% по коммерческому запросу. Это и есть смысл
 * результата: домен молодой и в среднем на второй странице, но там, где есть
 * намерение купить, сайт стоит вторым.
 *
 * Сюда же вынесена просьба владельца про «умножить на 5-10»: не множителем, а
 * перечислением восьми городов из sitemap icelab.com.ua и двух языковых версий.
 * Читатель умножает сам, и вывод остаётся его собственным.
 *
 * Usage (из корня admin-репо):
 *   node scripts/geo-cluster/patch-icelab-meaning.mjs --dry-run
 *   node scripts/geo-cluster/patch-icelab-meaning.mjs
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

const KEY = "icl-meaning";

const TEXT = {
  uk: [
    "Середня позиція по сайту — 8,2, і для домену, який стартував з нуля, це очікувано: більшість запитів поки що на другій сторінці. Але там, де є прямий намір купити, картина інша. За комерційним запитом «купить сухой лёд Харьков» сайт стоїть на позиції 2,1 з CTR 26,8% — у 4,5 раза вище за середні 6% по домену. Людина, яка цілеспрямовано шукає сухий лід у своєму місті, бачить IceLab одразу і переходить.",
    "Один такий запит — це одне місто й одна мова. Міських сторінок вісім: Київ, Львів, Дніпро, Одеса, Харків, Запоріжжя, Вінниця й Полтава, і кожна має українську та російську версії. Google став для компанії окремим каналом залучення клієнтів, а не джерелом випадкової відвідуваності.",
  ],
  ru: [
    "Средняя позиция по сайту — 8,2, и для домена, стартовавшего с нуля, это ожидаемо: большинство запросов пока на второй странице. Но там, где есть прямое намерение купить, картина другая. По коммерческому запросу «купить сухой лёд Харьков» сайт стоит на позиции 2,1 с CTR 26,8% — в 4,5 раза выше средних 6% по домену. Человек, который целенаправленно ищет сухой лёд в своём городе, видит IceLab сразу и переходит.",
    "Один такой запрос — это один город и один язык. Городских страниц восемь: Киев, Львов, Днепр, Одесса, Харьков, Запорожье, Винница и Полтава, и у каждой есть украинская и русская версии. Google стал для компании отдельным каналом привлечения клиентов, а не источником случайной посещаемости.",
  ],
  en: [
    "The site-wide average position is 8.2, which is what a domain starting from zero looks like: most queries still sit on page two. Where buying intent is explicit, the picture changes. On the commercial query “buy dry ice Kharkiv” the site holds position 2.1 with a 26.8% CTR — 4.5× the 6% site average. Someone deliberately searching for dry ice in their city sees IceLab first and clicks.",
    "That is one query, one city, one language. There are eight city pages — Kyiv, Lviv, Dnipro, Odesa, Kharkiv, Zaporizhzhia, Vinnytsia and Poltava — each in a Ukrainian and a Russian version. Google became a standalone client-acquisition channel, not a source of accidental traffic.",
  ],
};

async function main() {
  if (!TOKEN && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");
  console.log(DRY ? "DRY RUN — ничего не пишем\n" : "ЗАПИСЬ в production\n");

  const doc = await client.fetch(`*[_type == "caseStudy" && slug.current == "icelab"][0]`);
  if (!doc) throw new Error("кейс icelab не найден");
  const idx = doc.sections.findIndex((s) => s._key === KEY);
  if (idx === -1) throw new Error(`секция ${KEY} не найдена`);

  const src = doc.sections[idx];
  for (const l of ["uk", "ru", "en"]) {
    const was = src.body[l].map((b) => b.children.map((c) => c.text).join("")).join(" ");
    console.log(`${KEY}.${l}`);
    console.log(`  было  (${was.length} симв., ${src.body[l].length} абз.): ${was.slice(0, 90)}...`);
    const now = TEXT[l].join(" ");
    console.log(`  стало (${now.length} симв., ${TEXT[l].length} абз.): ${now.slice(0, 90)}...`);
  }

  if (DRY) {
    console.log("\nDry run завершён — документ не изменён.");
    return;
  }

  const backupDir = join(ROOT, "backups", "icelab-meaning-2026-08-23");
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(join(backupDir, "caseStudy-icelab.json"), JSON.stringify(doc, null, 2), "utf8");
  console.log(`\nбэкап: ${backupDir}`);

  const body = { ...src.body };
  for (const l of ["uk", "ru", "en"]) {
    const template = src.body[l][0];
    body[l] = TEXT[l].map((text, i) => ({
      ...template,
      _key: `${KEY}-${l}-p${i + 1}`,
      children: [
        {
          ...template.children[0],
          _key: `${KEY}-${l}-s${i + 1}`,
          text,
        },
      ],
      markDefs: [],
    }));
  }

  const sections = [...doc.sections];
  sections[idx] = { ...src, body };
  await client.patch(doc._id).set({ sections }).commit();
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
