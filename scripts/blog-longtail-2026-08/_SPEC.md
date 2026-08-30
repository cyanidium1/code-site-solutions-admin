# Спека: низкочастотные блог-посты, август 2026

Каждый seed-скрипт в этой папке создаёт ОДИН blogPost на 3 языках (uk+ru+en) в Sanity
(project 4lk0x7o9, dataset production). Формат документа и helpers — строго по шаблону ниже
(источник: scripts/geo-cluster/seed-geo-cluster.mjs + типы фронтенда src/types/sanity.ts).

## Запуск

```bash
node scripts/blog-longtail-2026-08/seed-<slug>.mjs --dry-run   # пишет JSON в scripts/blog-longtail-2026-08/out/
node scripts/blog-longtail-2026-08/seed-<slug>.mjs             # createOrReplace в Sanity
```

## Шаблон скрипта (копировать 1:1, менять только контент)

```js
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const DRY = process.argv.includes("--dry-run");

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false,
});

let keySeq = 0;
const key = () => `lt${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

/** Абзац; поддерживает **жирный** и [текст](/href). */
function p(text, style = "normal") {
  const children = []; const markDefs = [];
  const re = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0; let m;
  while ((m = re.exec(text))) {
    if (m.index > last) children.push({ _key: key(), _type: "span", text: text.slice(last, m.index), marks: [] });
    if (m[1]) children.push({ _key: key(), _type: "span", text: m[1].slice(2, -2), marks: ["strong"] });
    else {
      const label = m[2].slice(1, m[2].indexOf("]"));
      const href = m[2].slice(m[2].indexOf("(") + 1, -1);
      const dk = key();
      markDefs.push({ _key: dk, _type: "link", href });
      children.push({ _key: key(), _type: "span", text: label, marks: [dk] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push({ _key: key(), _type: "span", text: text.slice(last), marks: [] });
  return { _key: key(), _type: "block", style, markDefs, children };
}
const h2 = (t) => p(t, "h2");
const h3 = (t) => p(t, "h3");
const li = (t) => ({ ...p(t), listItem: "bullet", level: 1 });
const num = (t) => ({ ...p(t), listItem: "number", level: 1 });
const tldr = (title, items) => ({ _key: key(), _type: "tldrBox", title, items });
/** Таблица: headers 2–6 колонок, у каждой row.cells ровно столько же ячеек. **жирный** поддерживается. */
const table = (headers, rows) => ({
  _key: key(), _type: "blogTable", headers,
  rows: rows.map((cells) => ({ _key: key(), _type: "blogTableRow", cells })),
});
/** CTA: пишем ОБА набора ключей (heading/sub/ctaLabel/ctaHref — текущий фронт; title/text/buttonLabel/buttonHref — легаси). */
const cta = (heading, sub, label, href) => ({
  _key: key(), _type: "ctaCallout",
  heading, sub, ctaLabel: label, ctaHref: href,
  title: heading, text: sub, buttonLabel: label, buttonHref: href,
});

const AUTHOR = {
  name: "Кристина Бондаренко", role: "SEO Specialist",
  bio: "SEO-спеціалістка Code-Site.Art. Веде пошукові кампанії клієнтів студії — від локального SEO клінік до e-commerce.",
  photoUrl: "/team/kristina.jpg",
};
const NOW = "2026-08-26T12:00:00.000Z";

const doc = {
  _id: "ltAug2026-<uk-slug>",            // БЕЗ ТОЧЕК в _id (dot rule!)
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 8,                  // реальная оценка
  category: { _type: "reference", _ref: "<CATEGORY_ID>" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "<uk-slug>" },
    ru: { _type: "slug", current: "<ru-slug>" },
    en: { _type: "slug", current: "<en-slug>" },
  },
  title:           { _type: "localizedString", uk: "…", ru: "…", en: "…" },
  metaTitle:       { _type: "localizedString", uk: "…", ru: "…", en: "…" },   // ≤60 символов
  metaDescription: { _type: "localizedString", uk: "…", ru: "…", en: "…" },   // 120–160, стиль: «➤ … ✔️ … ➡ …»
  eyebrow:         { _type: "localizedString", uk: "…", ru: "…", en: "…" },
  lede:            { _type: "localizedString", uk: "…", ru: "…", en: "…" },
  tags: ["…", "…"],
  relatedPostSlugs: ["<uk-slug-1>", "<uk-slug-2>", "<uk-slug-3>"],            // max 3, только UK-слаги из списка ниже
  body: { uk: [...], ru: [...], en: [...] },
  faq: [
    { _key: key(), _type: "faqItem",
      question: { _type: "localizedString", uk: "…", ru: "…", en: "…" },
      answer:   { _type: "localizedText",   uk: "…", ru: "…", en: "…" } },
  ],
};

async function run() {
  const outDir = join(HERE, "out");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, doc._id + ".json"), JSON.stringify(doc, null, 2));
  if (DRY) { console.log("[dry-run] wrote out/" + doc._id + ".json"); return; }
  const res = await client.createOrReplace(doc);
  console.log("created", res._id);
}
run().catch((e) => { console.error(e.message); process.exit(1); });
```

## Обязательные требования к контенту

1. **Три языка, три полноценных body.** uk — основной; ru — живая адаптация (не калька), со своими ключами; en — адаптация для международного читателя (цены в $, британско-нейтральный тон, студия из Украины — это фича: «European quality, sensible rates»).
2. **Ссылки локале-зависимые:** в body.uk пути без префикса (`/pricing`), в body.ru — `/ru/...`, в body.en — `/en/...`. Это касается ВСЕХ внутренних ссылок и ctaHref.
3. **Структура body (каждая локаль):** tldrBox(4–6 пунктов) → вступление 2–3 абзаца (первый прямо отвечает на запрос — под сниппет/AI Overview) → 5–8 секций h2 (внутри h3/списки) → минимум **2 таблицы** (вилка цен по реальным ценам студии + сравнение вариантов) → cta() после 2–3-й секции → секция с примерами/кейсами (ссылки на /portfolio/<slug>) → финальный cta() → без отдельной FAQ-секции в body (FAQ идёт полем faq).
4. **Объём:** 1400–2200 слов на локаль. Не вода: конкретика, цифры, чеклисты.
5. **Реальные цены студии** (единственный источник цифр «от»): лендінг від **$800**, корпоративний сайт від **$2 500** (uk/ru; на en-локалі £3,500 — див. TIER_AMOUNT_OVERRIDES), кастомна платформа від **$6 000**, підтримка **$200/міс або $40/год**, SEO від **$300/міс**, типова інтеграція **$200–500**, складні інтеграції **$1 000–3 000**. Вилки «по рынку» можно давать шире, но пакеты студии — эти.
6. **Перелинковка (3–6 внутренних ссылок в каждой локали, естественно в тексте):** услуги `/landing`, `/corporate-site`, `/online-store`, `/seo`, `/pricing`, `/calculator`, `/process`, `/support`; ниши `/sites-for/{auto,medicine,courses,ecommerce,legal,finance,real-estate,renovation}`; сравнения `/vs-constructors`, `/vs-wordpress`, `/vs-freelancers`; кейсы `/portfolio/<slug>`; блог `/blog/<uk-slug>` (в ru/en — соответствующий локальный слаг из списка ниже, если у поста он есть; если нет ru/en-версии — ссылаться только в uk).
7. **Мета:** metaTitle с целевым ключом в начале; metaDescription в стиле существующих («➤ … ✔️ … ✔️ … ➡ …»).
8. **FAQ:** 4–5 вопросов, из реальных PAA/вопросных ключей темы, ответы 2–4 предложения.
9. **Не каннибализировать** существующие посты (список ниже) — тема статьи должна бить в СВОЙ запрос.
10. `_id` — `ltAug2026-<uk-slug>` (без точек). `key()` из шаблона для всех _key.

## Категории

- medicine: `46501974-af48-4456-9e60-02157b4aa031`
- finance: `3dda2459-8805-4c53-ae6f-88ea595e2c0f`
- platforms: `65de7a1a-bfde-4e47-ab70-7e0ecf161f0a`
- legal: `28b8d6fe-07b6-4ee6-8f40-87bf838df79b`

## Кейсы для ссылок (/portfolio/<slug>)

beauty: `boulevard-salon`, `e-fedra-beauty`, `glimmer` · медицина: `efedra-clinic` · авто: `raul-avto`, `right-cars` · стройка/ремонт: `solide-renovation`, `nbyg-kobenhavn`, `mono-pools`, `domlivo` · курсы/образование: `aleko-course` · еда/франшиза: `tatarka-franchise`, `bravo` · персональный бренд: `oleksandr-sitnikov`, `glenn-garbo` · e-commerce/прочее: `icelab`, `kondor-device`, `le-muse-nature`, `grontland`, `rich-tour`, `urmodels`, `co2lab`.

## Существующие посты (для relatedPostSlugs и перелинковки; НЕ каннибализировать)

UK-слаги (ru/en-слаги в скобках, если есть):
- `vartist-rozrobky-saytu-2026` (ru `skolko-stoit-sayt-2026`, en `custom-website-cost-uk-2026`) — цена сайта
- `shcho-vkhodyt-u-vartist-rozrobky-saitu` — что входит в стоимость
- `prosuvannia-saitu-tsina-2026` (ru `prodvizhenie-sayta-cena-2026`, en `seo-pricing-uk-2026`) — цена SEO
- `sait-dlia-budivelnoi-kompanii-2026` (ru `sayt-dlya-stroitelnoy-kompanii-2026`, en `builders-website-cost-uk-2026`) — сайт для стройки
- `skilky-koshtuye-sait-dlia-kliniky-2026` (ru `skolko-stoit-sayt-dlya-kliniki-2026`, en `clinic-website-cost-uk-2026`)
- `seo-dlia-medychnykh-saitiv` (ru `seo-dlya-medicinskih-saytov`, en `medical-website-seo-guide`)
- `rozrobka-saitu-medychnoho-tsentru-pid-kliuch` (ru `razrabotka-sayta-medicinskogo-centra-pod-klyuch`, en `clinic-website-development-process`)
- `dyzain-saitu-medychnoho-tsentru` (ru `dizayn-sayta-medicinskogo-centra`, en `medical-website-design-trust`)
- `15-pomylok-na-saitakh-klinik` (ru `15-oshibok-na-saytah-klinik`, en `15-clinic-website-mistakes`)
- `sait-dlia-likarni-vs-pryvatnyi-kabinet` (ru `sayt-dlya-bolnicy-vs-chastnyy-kabinet`, en `hospital-vs-private-practice-website`)
- `shvydkist-medychnoho-saitu` (ru `skorost-medicinskogo-sayta`, en `medical-website-speed`)
- `lokalne-seo-top-3-google-maps` (ru `lokalnoe-seo-top-3-google-maps`, en `local-seo-google-maps-top-3`)
- `geo-seo-dlia-ukrainskoho-biznesu` — гео-SEO пиллар (uk only)
- `biznes-u-kilkokh-mistakh-storinky`, `lokalni-storinky-chy-dorveii`, `ukrainskyi-biznes-za-kordonom` (uk only)
- `tilda-vs-kastomnyy-sayt-2026` (ru `tilda-vs-kastomnyy-sayt-2026`, en `custom-website-vs-wordpress-2026`)
- `nextjs-proty-wordpress-ta-konstruktoriv` (ru `nextjs-protiv-wordpress-i-konstruktorov`, en `nextjs-vs-wordpress-for-business-2026`)
- `yak-pratsyuye-admin-panel-saytu` (ru `kak-rabotaet-admin-panel-sayta`, en `how-website-admin-panel-works`)
- `yak-chytaty-google-search-console` (ru `kak-chitat-google-search-console`, en `google-search-console-for-business-owners`)
- `seo-audyt-svoimy-rukamy` (ru `seo-audit-svoimi-rukami`, en `diy-seo-audit-20-checks`)
- `ai-poshuk-yak-potrapyty-u-vidpovidi` (ru `ai-poisk-kak-popast-v-otvety`, en `ai-search-how-to-get-cited`)
- `9-dyzain-pryiomiv-dlia-konversii` (ru `9-dizayn-priyomov-dlya-konversii`, en `9-design-moves-that-lift-conversion`)
- `redyzain-bez-vtraty-seo` (ru `redizayn-bez-poteri-seo`, en `redesign-without-losing-seo`)
- `temna-chy-svitla-tema-saitu` (ru `tyomnaya-ili-svetlaya-tema-sayta`, en `dark-vs-light-website-theme`)
- `trendy-veb-dyzainu-2026` (ru `trendy-veb-dizayna-2026`, en `web-design-trends-2026-to-ignore`)
- EN-only: `web-design-for-accountants`, `websites-for-solicitors`

Ссылка на пост в body: uk `/blog/<uk-slug>`, ru `/ru/blog/<ru-slug>`, en `/en/blog/<en-slug>`.

## Посты волны 1 (опубликованы 27.08.2026 — линковать и использовать в relatedPostSlugs)

Формат: uk-слаг (ru-слаг · en-слаг):
- `internet-mahazyn-avtozapchastyn` (`internet-magazin-avtozapchastey` · `auto-parts-online-store`) — магазин автозапчастей
- `sait-dlia-avtoservisu` (`sayt-dlya-avtoservisa` · `auto-repair-shop-website`) — автосервис/СТО
- `sait-dlia-restoranu-kafe-dostavky` (`sayt-dlya-restorana-i-dostavki-edy` · `restaurant-website-with-delivery`) — ресторан/кафе/доставка
- `sait-dlia-ahentsii-nerukhomosti` (`sayt-agentstva-nedvizhimosti` · `real-estate-agency-website`) — агентство недвижимости
- `sait-dlia-hotelyu-z-bronyuvannyam` (`sayt-otelya-s-bronirovaniem` · `hotel-website-with-booking`) — отель с бронированием
- `sait-dlia-advokata` (`sayt-dlya-advokata` · `attorney-website-essentials`) — адвокат/юрфирма
- `sait-dlia-salonu-krasy` (`sayt-dlya-salona-krasoty` · `beauty-salon-website`) — салон красоты
- `sait-dlia-fotohrafa` (`sayt-dlya-fotografa` · `photographer-portfolio-website`) — фотограф
- `sait-dlia-shkoly` (`sayt-dlya-shkoly` · `school-website-guide`) — школа
- `sait-dlia-psykholoha` (`sayt-dlya-psihologa` · `therapist-website-guide`) — психолог
