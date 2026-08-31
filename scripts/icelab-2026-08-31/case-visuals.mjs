/**
 * Замена скриншотов Search Console в кейсе IceLab на перерисованную графику
 * с актуальными числами + починка оставшегося устаревшего текста.
 *
 * Почему перерисовка, а не скриншот: владелец выбрал этот вариант. Плюс
 * практическая причина — скриншоты в кейсе показывали замер трёхмесячной
 * давности (267 переходов, 4,48 тыс. показов, позиция 2,1 и CTR 26,8%), а
 * текст вокруг них уже обновлён на проверенные 31.08.2026 цифры. Держать на
 * одной странице 267 и 329 нельзя, а подпись под скриншотом обязана
 * описывать то, что на скриншоте действительно есть, — поэтому картинки заменяются
 * целиком, а не переподписываются.
 *
 * Устаревшие числа нашлись ещё в трёх местах, которые первый проход не
 * тронул: hero.subheading, seo.description и тело секции «Що це означає для
 * бізнесу» (там стояла средняя позиция 8,2 вместо 8,3).
 *
 * Источники: Search Console `sc-domain:icelab.com.ua` 16.07–28.08.2026,
 * Microsoft Clarity `xnw4p46kh9` за последние 30 дней.
 *
 * Запуск: node scripts/icelab-2026-08-31/case-visuals.mjs [--dry]
 */
import "dotenv/config";
import { createReadStream, existsSync } from "node:fs";
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

const ID = "teYo5SgUrFJ21nkOqz75NQ";
const DIR =
  "C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-GitHub-code-site-solutions/" +
  "c9a1e6fd-b39d-454f-a8c3-da101ae25cdd/scratchpad";

const VISUALS = [
  {
    file: `${DIR}/gsc.png`,
    filename: "icelab-search-console-2026-08.png",
    alt: {
      uk: "Google Search Console IceLab: 329 переходів, 5 410 показів і позиція 1,4 за комерційним запитом",
      ru: "Google Search Console IceLab: 329 переходов, 5 410 показов и позиция 1,4 по коммерческому запросу",
      en: "IceLab in Google Search Console: 329 clicks, 5,410 impressions and position 1.4 on a commercial query",
    },
    caption: {
      uk: "Search Console за 16.07–28.08.2026: 329 переходів, 5 410 показів, CTR 6,1%, середня позиція 8,3 по 239 запитах. Харків і Дніпро — міста, де складу немає взагалі.",
      ru: "Search Console за 16.07–28.08.2026: 329 переходов, 5 410 показов, CTR 6,1%, средняя позиция 8,3 по 239 запросам. Харьков и Днепр — города, где склада нет вообще.",
      en: "Search Console, 16.07–28.08.2026: 329 clicks, 5,410 impressions, 6.1% CTR, average position 8.3 across 239 queries. Kharkiv and Dnipro have no warehouse at all.",
    },
  },
  {
    file: `${DIR}/conv.png`,
    filename: "icelab-conversion-by-channel-2026-08.png",
    alt: {
      uk: "Конверсія по каналах: органіка 8,3% проти 0,57% у платної реклами",
      ru: "Конверсия по каналам: органика 8,3% против 0,57% у платной рекламы",
      en: "Conversion by channel: organic 8.3% against 0.57% for paid search",
    },
    caption: {
      uk: "Clarity за 30 днів: із 63 сесій зі зверненням 41 прийшла з органіки. Реклама привела більше трафіку (530 проти 495) і дала в 14 разів менше звернень.",
      ru: "Clarity за 30 дней: из 63 сессий с обращением 41 пришла из органики. Реклама привела больше трафика (530 против 495) и дала в 14 раз меньше обращений.",
      en: "Clarity, 30 days: of 63 sessions ending in an enquiry, 41 came from organic. Paid brought more traffic (530 against 495) and fourteen times fewer enquiries.",
    },
  },
];

const HERO_SUB = {
  uk:
    "IceLab — український виробник сухого льоду з власними потужностями у Києві та Львові. Ми створили " +
    "інтернет-магазин, який працює з роздрібними та оптовими клієнтами й забирає аудиторію з Google: за шість " +
    "тижнів — 329 переходів і 5 410 показів при CTR 6,1%. Головне не в трафіку: органіка конвертує у звернення " +
    "в чотирнадцять разів краще за платну рекламу.",
  ru:
    "IceLab — украинский производитель сухого льда с собственными мощностями в Киеве и Львове. Мы создали " +
    "интернет-магазин, который работает с розничными и оптовыми клиентами и забирает аудиторию из Google: за шесть " +
    "недель — 329 переходов и 5 410 показов при CTR 6,1%. Главное не в трафике: органика конвертирует в обращения " +
    "в четырнадцать раз лучше платной рекламы.",
  en:
    "IceLab is a Ukrainian dry ice manufacturer with its own facilities in Kyiv and Lviv. We built an online store " +
    "serving both retail and wholesale customers that takes its audience from Google: 329 clicks and 5,410 " +
    "impressions in six weeks at a 6.1% CTR. The traffic is not the point — organic converts into enquiries " +
    "fourteen times better than paid search.",
};

const SEO_DESC = {
  uk:
    "➤ Інтернет-магазин сухого льоду під ключ ✔️ Позиція 1,4 в Google у місті, де немає складу ✔️ 329 переходів " +
    "і CTR 6,1% ✔️ Органіка конвертує у 8,3% звернень проти 0,57% у реклами ➡ Кейс із цифрами.",
  ru:
    "➤ Интернет-магазин сухого льда под ключ ✔️ Позиция 1,4 в Google в городе, где нет склада ✔️ 329 переходов " +
    "и CTR 6,1% ✔️ Органика конвертирует в 8,3% обращений против 0,57% у рекламы ➡ Кейс с цифрами.",
  en:
    "➤ Dry ice online store built from scratch ✔️ Position 1.4 in Google in a city with no warehouse ✔️ 329 clicks " +
    "at 6.1% CTR ✔️ Organic converts at 8.3% against 0.57% for paid ➡ Full case study.",
};

const MEANS_BODY = {
  uk:
    "Середня позиція по сайту — 8,3, і для домену, який стартував з нуля, це очікувано: більшість із 239 запитів " +
    "поки що на другій сторінці. Але там, де є прямий намір купити, картина інша. За запитом «сухой лед купить " +
    "харьков» сайт стоїть на позиції 2,0 і збирає 31,2% кліків — заходить кожен третій, хто побачив його у видачі. " +
    "За «сухой лед купить днепр» — позиція 1,4. Складу в жодному з цих міст немає: працює тільки сторінка.",
  ru:
    "Средняя позиция по сайту — 8,3, и для домена, стартовавшего с нуля, это ожидаемо: большинство из 239 запросов " +
    "пока на второй странице. Но там, где есть прямое намерение купить, картина другая. По запросу «сухой лед купить " +
    "харьков» сайт стоит на позиции 2,0 и собирает 31,2% кликов — заходит каждый третий, кто увидел его в выдаче. " +
    "По «сухой лед купить днепр» — позиция 1,4. Склада ни в одном из этих городов нет: работает только страница.",
  en:
    "The site-wide average position is 8.3, which is what a domain starting from zero looks like: most of the 239 " +
    "queries still sit on page two. Where buying intent is explicit, the picture changes. On \"dry ice buy Kharkiv\" " +
    "the site holds position 2.0 and takes 31.2% of the clicks — one in three people who see it. On \"dry ice buy " +
    "Dnipro\" it is at 1.4. Neither city has a warehouse: all that works there is the page.",
};

let seq = 0;
const key = () => `vz${(seq++).toString(36)}`;
const block = (text) => ({
  _key: key(),
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: key(), _type: "span", marks: [], text }],
});

async function run() {
  for (const v of VISUALS) {
    if (!existsSync(v.file)) throw new Error(`нет файла ${v.file}`);
  }

  const doc = await client.fetch('*[_id == $id][0]{sections}', { id: ID });
  const sections = [...(doc.sections || [])];

  const gi = sections.findIndex((s) => s._type === "mediaGalleryBlock" && (s.images || []).length >= 2);
  if (gi < 0) throw new Error("галерея со скриншотами не найдена");
  const images = [...sections[gi].images];

  for (let i = 0; i < VISUALS.length; i++) {
    const v = VISUALS[i];
    let ref = "(dry)";
    if (!DRY) {
      const asset = await client.assets.upload("image", createReadStream(v.file), {
        filename: v.filename,
      });
      ref = asset._id;
    }
    console.log(`  [${i}] ${v.filename}`);
    console.log(`      было:  ${images[i].image?.asset?._ref}`);
    console.log(`      стало: ${ref}`);
    console.log(`      подпись: ${v.caption.uk.slice(0, 90)}…`);
    if (DRY) continue;
    images[i] = {
      ...images[i],
      image: { ...(images[i].image || { _type: "image" }), asset: { _type: "reference", _ref: ref } },
      alt: { ...(images[i].alt || {}), ...v.alt },
      caption: { ...(images[i].caption || {}), ...v.caption },
    };
  }
  sections[gi] = { ...sections[gi], images };

  const mi = sections.findIndex(
    (s) => s._type === "imageTextBlock" && String(s.heading?.uk || "").includes("Що це означає"),
  );
  if (mi < 0) {
    console.error("  ✗ секция «Що це означає для бізнесу» не найдена");
  } else {
    sections[mi] = {
      ...sections[mi],
      body: { uk: [block(MEANS_BODY.uk)], ru: [block(MEANS_BODY.ru)], en: [block(MEANS_BODY.en)] },
    };
    console.log(`\n  секция [${mi}] «${sections[mi].heading.uk}» — текст обновлён (позиция 8,2 → 8,3)`);
  }

  console.log(`\n  hero.subheading и seo.description — переписаны на 329 / 6,1% / 8,3%`);

  if (DRY) return;
  await client
    .patch(ID)
    .set({
      sections,
      "hero.subheading": HERO_SUB,
      "seo.description": SEO_DESC,
    })
    .commit();
  console.log("\n✓ записано");
}

console.log(DRY ? "СУХОЙ ПРОГОН\n" : "ЗАПИСЬ В SANITY\n");
run().then(
  () => console.log("готово"),
  (e) => {
    console.error("ОШИБКА", e.message);
    process.exit(1);
  },
);
