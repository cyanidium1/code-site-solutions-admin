/**
 * Замена шаблонных «примеров работ» на реальные кейсы в пяти нишевых статьях.
 *
 * Аудит 31.08.2026, раздел 5: двадцать статей «сайт для X» написаны по одному
 * шаблону — проблема → таблица → опоры → «чого не робимо» → FAQ. По отдельности
 * каждая хороша, подряд читаются как один текст. Главный риск выглядеть как
 * generic AI content.
 *
 * Проверка по Sanity показала, где именно шаблон виден: из 17 нишевых статей
 * СКРИНШОТ есть ровно в одной — `sait-dlia-budivelnoi-kompanii-2026`, с кейсом
 * NBYG. И это единственная статья, которая читается как написанная студией,
 * а не про студию: там названный клиент, до/после (3 заявки в месяц → 24),
 * 302 000 показов в Google и картинка живого сайта.
 *
 * Остальные шестнадцать заканчиваются блоком «Приклади: …» из двух-трёх
 * абзацев без единой цифры и без единого изображения. Отсюда и правка: не
 * переписывать статьи целиком (они ранжируются), а достроить в пяти из них
 * то, чего шаблон дать не может — имя клиента, что построено, сколько заняло,
 * реальные числа кейса и скриншот.
 *
 * Пять выбраны как «худший разрыв при наличии реального кейса»:
 *
 *   salonu-krasy   три расплывчатых буллета  → Boulevard Salon (Horsens, DK)
 *   turahentstva   кейс есть, цифр нет       → Rich Tour
 *   shkoly         блока кейса нет вообще    → Aleko Course
 *   avtoservisu    два абзаца ни о чём       → Right Cars + Raul Avto
 *   restoranu      два абзаца ни о чём       → Bravo + Tatarka
 *
 * Ничего не выдумано: каждая цифра взята из statsBlock / metricsLine / duration
 * самого кейса в Sanity. Где реального результата в кейсе нет (Boulevard, Rich
 * Tour, Bravo), пишем факты сборки, а не сочинённый рост конверсии. Где кейс не
 * из той ниши (Aleko — курс, не школа; Right Cars — дилер, не СТО) — это сказано
 * прямо в тексте: «чесно: сайту СТО в портфоліо немає». Признанный сосед
 * убедительнее выданного за своего.
 *
 * Запуск: node scripts/niche-cases-2026-08-31/real-cases.mjs [--dry]
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

/* ---------- построители Portable Text ---------- */

let seq = 0;
const key = () => `rc${(seq++).toString(36)}${Date.now().toString(36).slice(-3)}`;

/** Абзац из кусков: строка = обычный текст, [текст, href] = ссылка. */
function para(parts, style = "normal", listItem) {
  const markDefs = [];
  const children = parts.map((part) => {
    if (typeof part === "string") {
      return { _key: key(), _type: "span", marks: [], text: part };
    }
    const [text, href] = part;
    const mk = key();
    markDefs.push({ _key: mk, _type: "link", href, newTab: false });
    return { _key: key(), _type: "span", marks: [mk], text };
  });
  const block = { _key: key(), _type: "block", style, children, markDefs };
  if (listItem) block.listItem = listItem;
  return block;
}

const h2 = (text) => para([text], "h2");

const img = (ref, alt, caption) => ({
  _key: key(),
  _type: "blogImage",
  alt,
  asset: { _ref: ref, _type: "reference" },
  caption,
});

/* ---------- ассеты обложек кейсов (реальные скриншоты сайтов) ---------- */

const COVER = {
  boulevard: "image-08393794681e8b5eaccfce8b2548b9c41f888fcd-3164x2472-png",
  richTour: "image-fc7191662a4d17562cc23650db85dc86e8c4cd9b-3000x2250-png",
  aleko: "image-8d2aa5ab1be7ebc8c0618947c5dd2eb729de9c33-3164x2472-png",
  rightCars: "image-c221864be372ed226a9c88a1923d20f7a9f17762-3000x2250-png",
  bravo: "image-35c0589d9f44540710aa0c9fcbcc91d36d89eebd-3000x2250-png",
};

/* ---------- правки ---------- */

/**
 * Каждая правка описывает, ЧТО ищем в теле и чем заменяем.
 *   find    — текст, по которому находим начало заменяемого куска (H2 или абзац)
 *   through — сколько блоков от найденного заменяем (включая сам)
 *   blocks  — что ставим вместо
 * Если `find` не найден или `through` упирается в конец — правка падает, а не
 * калечит документ.
 */
const EDITS = [
  {
    id: "ltAug2026-sait-dlia-salonu-krasy",
    slug: "sait-dlia-salonu-krasy",
    find: "Приклади: б'юті-сайти, які ми зробили",
    through: 6, // H2 + вводный абзац + 3 буллета + закрывающий абзац
    blocks: () => [
      h2("Кейс: Boulevard Salon — салон краси в данському Горсенсі"),
      para([
        "Boulevard Salon працює в Горсенсі. Сайт зібрали за 6 тижнів навколо одного питання: як довести клієнтку від «яка процедура мені потрібна» до броні. Чотирнадцять напрямків послуг розвели в окремі сторінки під пошукові запити міста, зробили чотири сценарії запису під різних майстрів, зібрали понад сотню фото результатів і залишили рівно три точки конверсії — запис, подарунковий сертифікат і курс. Живий сайт і повний розбір — ",
        ["у кейсі Boulevard Salon", "/portfolio/boulevard-salon"],
        ".",
      ]),
      img(
        COVER.boulevard,
        "Сайт салону краси Boulevard Salon — головна сторінка з напрямками послуг і записом",
        "Boulevard Salon: 14 напрямків послуг, і кожен — окрема сторінка під пошук",
      ),
      para([
        "Ще два б'юті-проєкти студії: ",
        ["E-Fedra Beauty", "/portfolio/e-fedra-beauty"],
        " — б'юті-напрям бренду з власною візуальною мовою, і ",
        ["Glimmer", "/portfolio/glimmer"],
        ", де головним було не загубити відвідувачку між галереєю і кнопкою запису.",
      ]),
    ],
  },

  {
    id: "ltAug2026-sait-turahentstva",
    slug: "sait-dlia-turahentstva",
    find: "Приклад із нашого портфоліо — Rich Tour",
    through: 1, // только вводный абзац кейса; «Що ми зробили і чому» с буллетами остаётся
    blocks: () => [
      para([
        "Rich Tour продає автобусні, морські, екскурсійні, SMART-тури і корпоративні поїздки. Це не сайт-візитка: за 6 тижнів ми зібрали платформу одразу на дві аудиторії — клієнтів і агентів. У агентів свій особистий кабінет, заявки йдуть в CRM, а три напрями продажів розведені так, щоб не змішуватись у видачі. Повний розбір — ",
        ["у кейсі Rich Tour", "/portfolio/rich-tour"],
        ". Нижче — рішення з цього проєкту, які ми переносимо в будь-який сайт агентства.",
      ]),
      img(
        COVER.richTour,
        "Сайт туристичної агенції Rich Tour — каталог турів і напрямки на головній",
        "Rich Tour: каталог турів, кабінет агентів і CRM в одній системі",
      ),
    ],
  },

  {
    id: "ltAug2026-sait-dlia-shkoly",
    slug: "sait-dlia-shkoly",
    find: "Призначте відповідального за новини",
    through: 1,
    blocks: (orig) => [
      orig[0], // последний пункт плана остаётся на месте
      h2("Кейс: Aleko Course — освітній проєкт, а не школа"),
      para([
        "Чесно: сайту школи в нашому портфоліо немає — є освітній проєкт, і механіка в нього та сама, що в приватної школи чи онлайн-курсів. Aleko Course продає курс автора з аудиторією 1,3 млн. За 6 тижнів ми зібрали сторінку, яка веде людину через бренд автора, програму з 48 відеоуроків, відгуки і три тарифи з онлайн-оплатою. Переходів до оплати після запуску стало у 2,4 раза більше. Розбір — ",
        ["у кейсі Aleko Course", "/portfolio/aleko-course"],
        ".",
      ]),
      img(
        COVER.aleko,
        "Сайт освітнього проєкту Aleko Course — програма курсу, відгуки і тарифи",
        "Aleko Course: програма, відгуки і тарифи на одній сторінці — переходів до оплати ×2,4",
      ),
      para([
        "Державній школі ця логіка потрібна навпаки: там задача не продати, а зняти питання — статут, ліцензія, структура, новини, контакти. Але вимога одна на обидва випадки: батько має знайти потрібне за два кліки, а не за десять.",
      ]),
    ],
  },

  {
    id: "ltAug2026-sait-dlia-avtoservisu",
    slug: "sait-dlia-avtoservisu",
    find: "Кейси: сайти для автобізнесу, які вже працюють",
    through: 4, // H2 + два абзаца про кейсы + абзац про кастомный код
    blocks: (orig) => [
      h2("Кейси: сайти для автобізнесу, які вже працюють"),
      para([
        "Одразу чесно: сайту СТО в портфоліо немає. Є два проєкти із суміжного автобізнесу, де та сама механіка «знайшов → порівняв → залишив заявку» відпрацьована на більшому обсязі, ніж потрібно сервісу.",
      ]),
      para([
        ["Right Cars", "/portfolio/right-cars"],
        " — автодилер у Йоганнесбурзі. Каталог на 1000+ авто, понад двадцять фільтрів пошуку, окремий розділ аукціону і особистий кабінет користувача. Якщо ваш сервіс колись захоче продавати авто або вести каталог запчастин — виглядає це приблизно так.",
      ]),
      img(
        COVER.rightCars,
        "Платформа автодилера Right Cars — каталог автомобілів з фільтрами пошуку",
        "Right Cars: 1000+ авто, 20+ фільтрів, аукціон і кабінет — усе на кастомному коді",
      ),
      para([
        ["Raul Avto", "/portfolio/raul-avto"],
        " — доставка авто зі США під ключ. Складну послугу з розмитненням пояснили простою мовою, додали калькулятор вартості, три мови і п'ять точок входу в заявку. Для СТО тут цінне саме останнє: калькулятор знімає половину дзвінків «а скільки це буде коштувати».",
      ]),
      orig[3], // «Обидва проєкти зроблені на кастомному коді…» — остаётся как было
    ],
  },

  {
    id: "ltAug2026-sait-dlia-restoranu",
    slug: "sait-dlia-restoranu-kafe-dostavky",
    find: "Приклади: Tatarka і Bravo",
    through: 3, // H2 + абзац Tatarka + абзац Bravo
    blocks: () => [
      h2("Кейси: Bravo і Tatarka"),
      para([
        ["Bravo", "/portfolio/bravo"],
        " — доставка страв на мангалі у Броварах. За 6 тижнів зробили сайт і дизайн меню як одну систему: п'ять розділів (меню, доставка, про бренд, блог, контакти) і три комерційні акценти — акції, переваги, кнопка замовлення. Меню тут не PDF-файл, а частина сайту, тому змінити ціну позиції — це хвилина, а не дзвінок розробнику.",
      ]),
      img(
        COVER.bravo,
        "Сайт служби доставки їжі Bravo — меню, категорії страв і замовлення",
        "Bravo: сайт і меню зроблені як одна система, а не сайт плюс PDF",
      ),
      para([
        ["Tatarka", "/portfolio/tatarka-franchise"],
        " — франшиза мережі ресторанів кримської кухні. Тут сайт продає не страву, а бізнес-модель: меню й атмосфера показують продукт, окремий блок — цифри для партнера, і одна форма під заявки франчайзі. П'ять точок переходу до цієї форми на весь лендінг.",
      ]),
    ],
  },
];

/* ---------- применение ---------- */

async function run() {
  for (const edit of EDITS) {
    const doc = await client.fetch('*[_id == $id][0]{_id, "body": body.uk}', { id: edit.id });
    if (!doc) {
      console.error(`  ✗ ${edit.slug}: документ ${edit.id} не найден`);
      continue;
    }

    const body = doc.body || [];
    const at = body.findIndex((b) =>
      (b.children || []).map((c) => c.text).join("").includes(edit.find),
    );
    if (at < 0) {
      console.error(`  ✗ ${edit.slug}: не найден якорь «${edit.find}»`);
      continue;
    }
    if (at + edit.through > body.length) {
      console.error(`  ✗ ${edit.slug}: through=${edit.through} выходит за конец тела`);
      continue;
    }

    const removed = body.slice(at, at + edit.through);
    const inserted = edit.blocks(removed);
    const next = [...body.slice(0, at), ...inserted, ...body.slice(at + edit.through)];

    const imgs = inserted.filter((b) => b._type === "blogImage").length;
    console.log(
      `  ${edit.slug}: блок ${at}, −${removed.length} +${inserted.length} (${imgs} скриншот), ` +
        `тело ${body.length} → ${next.length}`,
    );

    if (DRY) continue;
    await client.patch(edit.id).set({ "body.uk": next }).commit();
    console.log(`    ✓ записано`);
  }
}

console.log(DRY ? "СУХОЙ ПРОГОН\n" : "ЗАПИСЬ В SANITY\n");
run().then(
  () => console.log("\nготово"),
  (e) => {
    console.error("ОШИБКА", e.message);
    process.exit(1);
  },
);
