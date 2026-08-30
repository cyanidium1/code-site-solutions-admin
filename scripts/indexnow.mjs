/**
 * Пинг IndexNow — Bing, Yandex, Seznam и Naver разом.
 *
 * Зачем отдельно от sitemap: Google обходит сайт когда захочет, а IndexNow
 * принимает список URL сразу и обычно ставит их в очередь в тот же день.
 * Отдельно это важно для AI-ответов: Copilot цитирует из индекса Bing, а он
 * наполняется заметно быстрее гугловского.
 *
 * Ключ лежит в репозитории фронтенда как public/<key>.txt и отдаётся по
 * https://www.code-site.art/<key>.txt — это и есть подтверждение владения
 * доменом. Менять ключ не нужно; если поменяете — обновите файл и константу.
 *
 * Запуск:
 *   node scripts/indexnow.mjs                    — все URL из всех трёх sitemap
 *   node scripts/indexnow.mjs <url> [<url> …]    — только указанные
 *   node scripts/indexnow.mjs --dry              — показать, что отправилось бы
 */
const HOST = "www.code-site.art";
const ORIGIN = `https://${HOST}`;
const KEY = "c87b731c90aba586436bc7e0763215d5";
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const SITEMAPS = ["sitemap-ua.xml", "sitemap-ru.xml", "sitemap-en.xml"];
/** Лимит IndexNow на один запрос. */
const BATCH = 10000;

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const explicit = args.filter((a) => a.startsWith("http"));

async function urlsFromSitemaps() {
  const out = [];
  for (const name of SITEMAPS) {
    const res = await fetch(`${ORIGIN}/${name}`);
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    const xml = await res.text();
    const found = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    console.log(`  ${name}: ${found.length}`);
    out.push(...found);
  }
  return [...new Set(out)];
}

// Ключ должен реально отдаваться, иначе IndexNow молча отклонит весь батч.
const keyCheck = await fetch(KEY_LOCATION);
const keyBody = keyCheck.ok ? (await keyCheck.text()).trim() : "";
if (keyBody !== KEY) {
  throw new Error(
    `ключ по ${KEY_LOCATION} не отдаётся или не совпадает (HTTP ${keyCheck.status}, тело "${keyBody.slice(0, 40)}")`,
  );
}
console.log(`ключ подтверждён: ${KEY_LOCATION}\n`);

const urls = explicit.length ? explicit : await urlsFromSitemaps();
console.log(`\nURL к отправке: ${urls.length}`);

if (DRY) {
  urls.slice(0, 20).forEach((u) => console.log("  " + u));
  if (urls.length > 20) console.log(`  … и ещё ${urls.length - 20}`);
  console.log("\n(dry run, ничего не отправлено)");
  process.exit(0);
}

for (let i = 0; i < urls.length; i += BATCH) {
  const batch = urls.slice(i, i + BATCH);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch }),
  });
  // 200 — принято, 202 — принято, ключ проверяется асинхронно. Оба нормальны.
  const body = await res.text();
  console.log(`батч ${i / BATCH + 1}: ${batch.length} URL → HTTP ${res.status} ${body || "(пустой ответ)"}`);
  if (res.status !== 200 && res.status !== 202) process.exitCode = 1;
}
