/**
 * Кейс IceLab: замена цифр на проверенные и пересборка трёх смысловых секций.
 *
 * Что было на живом кейсе: «267 переходів із Google · CTR 6% · позиція 2,1».
 * Рабочий документ `icelab-prod/docs/SEO-CASE-ICELAB.md` в разделе 10 при этом
 * прямо предупреждал, что выгрузки Search Console нет и на позиции ссылаться
 * нельзя. Проверил 31.08.2026 — ресурс в GSC есть, и цифры не только
 * подтвердились, но и выросли.
 *
 * GSC, sc-domain:icelab.com.ua, 16.07–28.08.2026 (весь срок работ):
 *   329 кликов · 5 410 показов · CTR 6,1 % · средняя позиция 8,3 · 239 запросов
 *   «сухой лед купить харьков» — позиция 2,0, CTR 31,2 %, 20 кликов
 *   «сухой лед купить днепр»   — позиция 1,4, 10 кликов
 *   «сухой лед купить»         — позиция 4,3 при 122 показах
 *   «криобластинг»             — позиция 7,6 при 50 показах
 * Старое «2,1» было верным: это позиция по Харькову, она просто сместилась.
 *
 * Microsoft Clarity `xnw4p46kh9`, последние 30 дней:
 *   1 156 сессий. Сегмент «Submit form ИЛИ Outbound click ИЛИ Contact us» —
 *   63 сессии, то есть 5,4 %. Документ считал 56+29+8=93 и получал 8 %, но
 *   Clarity отдаёт именно СЕССИИ, и складывать их нельзя: кто написал в
 *   Telegram и потом отправил форму, попадал в сумму дважды.
 *
 *   Настоящие 8 % оказались в разбивке по каналам, и они сильнее:
 *     органика      495 сессий → 41 обращение → 8,3 %
 *     платный поиск 530 сессий →  3 обращения → 0,57 %
 *   Разница в 14,6 раза. Оговорка: это классификация каналов самой Clarity,
 *   не UTM и не GA4, и три конверсии у рекламы — статистически тонко.
 *
 *   Сегмент обратившихся ведёт себя иначе: 4,16 страницы против 2,50, скролл
 *   80,45 % против 49,91 %, быстрые возвраты 7,94 % против 21,54 %.
 *
 * Запуск: node scripts/icelab-2026-08-31/case-numbers.mjs [--dry]
 */
import "dotenv/config";
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

let seq = 0;
const key = () => `icl${(seq++).toString(36)}`;

/** Локализованный абзац-массив для body у imageTextBlock. */
const loc = (uk, ru, en) => ({
  // у существующих body нет своего _type — не добавляем, чтобы не разойтись со схемой
  uk: [para(uk)],
  ru: [para(ru)],
  en: [para(en)],
});
const para = (text) => ({
  _key: key(),
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: key(), _type: "span", marks: [], text }],
});

const str = (uk, ru, en) => ({ _type: "localizedString", uk, ru, en });

/* ─── 1. Шапка ────────────────────────────────────────────────────────────── */

const METRICS_LINE = str(
  "8,3% конверсія органіки · позиція 1,4 у місті без складу · 329 переходів із Google · CTR 6,1%",
  "8,3% конверсия органики · позиция 1,4 в городе без склада · 329 переходов из Google · CTR 6,1%",
  "8.3% organic conversion · position 1.4 in a city with no warehouse · 329 Google clicks · 6.1% CTR",
);

const HEADLINE_STATS = [
  {
    value: str("8,3%", "8,3%", "8.3%"),
    label: str(
      "звернень із органічного пошуку",
      "обращений из органического поиска",
      "of organic sessions end in an enquiry",
    ),
  },
  {
    value: str("×14", "×14", "×14"),
    label: str(
      "конверсія органіки проти платної реклами",
      "конверсия органики против платной рекламы",
      "organic converts better than paid search",
    ),
  },
  {
    value: str("1,4", "1,4", "1.4"),
    label: str(
      "позиція в Google у місті, де немає складу",
      "позиция в Google в городе, где нет склада",
      "Google position in a city with no warehouse",
    ),
  },
  {
    value: str("329", "329", "329"),
    label: str(
      "переходів із Google за шість тижнів",
      "переходов из Google за шесть недель",
      "Google clicks in six weeks",
    ),
  },
];

/* ─── 2. Тексты секций ────────────────────────────────────────────────────── */

const BODIES = {
  "Як сайт отримує": loc(
    "Search Console за 16.07–28.08.2026: 329 переходів, 5 410 показів, CTR 6,1% і середня позиція 8,3 по 239 запитах. " +
      "Найцікавіше в розкладці по запитах. «Сухой лед купить харьков» — позиція 2,0 при CTR 31,2%: кожен третій, хто " +
      "бачить сайт у видачі, на нього заходить. «Сухой лед купить днепр» — позиція 1,4. Складу в жодному з цих міст " +
      "немає: там працює тільки текст сторінки, локальний FAQ і розмітка Service. За загальним «сухой лед купить» " +
      "сайт стоїть на 4,3 при 122 показах, за «криобластинг» — на 7,6.",
    "Search Console за 16.07–28.08.2026: 329 переходов, 5 410 показов, CTR 6,1% и средняя позиция 8,3 по 239 запросам. " +
      "Самое интересное — в разбивке по запросам. «Сухой лед купить харьков» — позиция 2,0 при CTR 31,2%: каждый третий, " +
      "кто видит сайт в выдаче, на него заходит. «Сухой лед купить днепр» — позиция 1,4. Склада ни в одном из этих " +
      "городов нет: там работает только текст страницы, локальный FAQ и разметка Service. По общему «сухой лед купить» " +
      "сайт стоит на 4,3 при 122 показах, по «криобластинг» — на 7,6.",
    "Search Console, 16.07–28.08.2026: 329 clicks, 5,410 impressions, 6.1% CTR and an average position of 8.3 across " +
      "239 queries. The query breakdown is where it gets interesting. \"Dry ice buy Kharkiv\" sits at position 2.0 with " +
      "a 31.2% CTR — one in three people who see the site in results opens it. \"Dry ice buy Dnipro\" is at 1.4. There " +
      "is no warehouse in either city: all that works there is the page copy, a local FAQ and Service markup.",
  ),

  "Локальне": loc(
    "Десять міських сторінок замість однієї сторінки «Доставка». Кожне місто — свій сценарій, а не переставлені слова: " +
      "Кривий Ріг про промислове очищення і гранулу 3 мм, Вінниця про харчову логістику і HoReCa, Івано-Франківськ про " +
      "готелі й весілля Прикарпаття. Правило було жорстке — мінімум 60% унікального тексту, свої три питання в " +
      "локальному FAQ, різний кут H1, не більше чотирьох-шести нових міст за реліз. Результат: 128 входів із пошуку за " +
      "30 днів, це 42% усіх входів повз головну сторінку. Харків дав 46 входів проти 25 у Києва — при тому, що склад " +
      "саме в Києві.",
    "Десять городских страниц вместо одной страницы «Доставка». Каждый город — свой сценарий, а не переставленные слова: " +
      "Кривой Рог про промышленную очистку и гранулу 3 мм, Винница про пищевую логистику и HoReCa, Ивано-Франковск про " +
      "отели и свадьбы Прикарпатья. Правило было жёсткое — минимум 60% уникального текста, свои три вопроса в локальном " +
      "FAQ, разный угол H1, не больше четырёх-шести новых городов за релиз. Результат: 128 входов из поиска за 30 дней, " +
      "это 42% всех входов мимо главной страницы. Харьков дал 46 входов против 25 у Киева — при том, что склад именно " +
      "в Киеве.",
    "Ten city pages instead of one \"Delivery\" page. Each city gets its own scenario rather than reshuffled words: " +
      "Kryvyi Rih covers industrial cleaning and 3 mm pellets, Vinnytsia food logistics and HoReCa, Ivano-Frankivsk the " +
      "hotels and weddings of the Carpathian foothills. The rule was strict: at least 60% unique copy, three of its own " +
      "questions in a local FAQ, a different H1 angle, no more than four to six new cities per release. The result: 128 " +
      "search entries in 30 days, 42% of everything that lands anywhere but the home page.",
  ),

  "Результат": loc(
    "Головна цифра не в трафіку, а в тому, що з ним відбувається. За 30 днів 63 сесії з 1 156 закінчилися зверненням — " +
      "повідомленням у месенджер, дзвінком або формою. Це 5,4%. Але в розбивці по каналах видно головне: органіка дала " +
      "41 звернення з 495 сесій — 8,3%, а платний пошук три звернення з 530 сесій — 0,57%. Тобто трафік, який ми " +
      "побудували, конвертує в чотирнадцять разів краще за той, який клієнт купує. Люди з органіки й поводяться інакше: " +
      "4,16 сторінки за візит проти 2,50 у середньому по сайту, глибина скролу 80% проти 50%, швидкі повернення 7,9% " +
      "проти 21,5%. Це не випадковий трафік — це люди, які шукали саме те, що ми описали на сторінці.",
    "Главная цифра не в трафике, а в том, что с ним происходит. За 30 дней 63 сессии из 1 156 закончились обращением — " +
      "сообщением в мессенджер, звонком или формой. Это 5,4%. Но в разбивке по каналам видно главное: органика дала " +
      "41 обращение из 495 сессий — 8,3%, а платный поиск три обращения из 530 сессий — 0,57%. То есть трафик, который " +
      "мы построили, конвертирует в четырнадцать раз лучше того, который клиент покупает. Люди из органики и ведут себя " +
      "иначе: 4,16 страницы за визит против 2,50 в среднем по сайту, глубина скролла 80% против 50%, быстрые возвраты " +
      "7,9% против 21,5%. Это не случайный трафик — это люди, которые искали именно то, что мы описали на странице.",
    "The headline number is not the traffic but what happens to it. Over 30 days, 63 of 1,156 sessions ended in an " +
      "enquiry — a messenger message, a call or a form. That is 5.4%. The channel split is where it matters: organic " +
      "produced 41 enquiries from 495 sessions, or 8.3%, while paid search produced three from 530, or 0.57%. The " +
      "traffic we built converts fourteen times better than the traffic the client buys. Organic visitors also behave " +
      "differently: 4.16 pages a visit against 2.50 site-wide, 80% scroll depth against 50%, 7.9% quick backs against 21.5%.",
  ),
};

async function run() {
  const doc = await client.fetch('*[_id == $id][0]{sections}', { id: ID });
  const sections = [...(doc.sections || [])];

  // 1. statsBlock
  const si = sections.findIndex((s) => s._type === "statsBlock");
  if (si < 0) throw new Error("statsBlock не найден");
  const oldStats = (sections[si].items || []).map((i) => `${i.value?.uk} ${i.label?.uk}`);
  sections[si] = {
    ...sections[si],
    items: HEADLINE_STATS.map((s) => ({ _key: key(), _type: "metric", ...s })),
  };
  console.log("statsBlock:");
  oldStats.forEach((s) => console.log("  было:  " + s));
  HEADLINE_STATS.forEach((s) => console.log("  стало: " + s.value.uk + " " + s.label.uk));

  // 2. тексты секций
  for (const [needle, body] of Object.entries(BODIES)) {
    const i = sections.findIndex(
      (s) => s._type === "imageTextBlock" && String(s.heading?.uk || "").includes(needle),
    );
    if (i < 0) {
      console.error(`  ✗ секция «${needle}» не найдена`);
      continue;
    }
    sections[i] = { ...sections[i], body };
    console.log(`\nсекция [${i}] «${sections[i].heading.uk}» — текст заменён`);
  }

  console.log(`\nmetricsLine стало: ${METRICS_LINE.uk}`);
  if (DRY) return;
  await client.patch(ID).set({ sections, metricsLine: METRICS_LINE }).commit();
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
