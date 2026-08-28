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
  _id: "ltAug2026-sait-dlia-fotohrafa",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-fotohrafa" },
    ru: { _type: "slug", current: "sayt-dlya-fotografa" },
    en: { _type: "slug", current: "photographer-portfolio-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для фотографа: портфоліо, яке продає зйомки",
    ru: "Сайт для фотографа: портфолио, которое продаёт съёмки",
    en: "Photographer Portfolio Website That Sells Bookings",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для фотографа: портфоліо, яке продає зйомки",
    ru: "Сайт-визитка фотографа: структура, цены, примеры",
    en: "Photographer Portfolio Website: Design & Cost 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для фотографа від $800: структура, ціни, приклади. ✔️ Швидкі галереї ✔️ Клієнтські кабінети ➡ Розрахуйте вартість у калькуляторі.",
    ru: "➤ Создание сайта для фотографа от $800. ✔️ Структура и цены ✔️ Быстрые галереи и клиентские кабинеты ➡ Примеры работ и калькулятор цены.",
    en: "➤ Photographer portfolio website from $800. ✔️ Structure, pricing, fast galleries ✔️ Client areas ➡ Real examples + instant cost calculator.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Платформи та портфоліо",
    ru: "Платформы и портфолио",
    en: "Platforms & Portfolios",
  },
  lede: {
    _type: "localizedString",
    uk: "Instagram показує ваші фото підписникам, а сайт — парам, які прямо зараз гуглять фотографа у своєму місті. Розбираємо структуру, ціни та технічні деталі портфоліо, яке перетворює перегляди на бронювання.",
    ru: "Instagram показывает ваши фото подписчикам, а сайт — парам, которые прямо сейчас гуглят фотографа в своём городе. Разбираем структуру, цены и технические детали портфолио, которое превращает просмотры в бронирования.",
    en: "Instagram shows your photos to followers; a website shows them to couples who are googling a photographer right now. Here is the structure, pricing and tech behind a portfolio that turns views into bookings.",
  },
  tags: ["сайт для фотографа", "портфоліо", "photographer website", "фотограф"],
  relatedPostSlugs: ["temna-chy-svitla-tema-saitu", "9-dyzain-pryiomiv-dlia-konversii", "vartist-rozrobky-saytu-2026"],
  body: {
    uk: [
      tldr("Коротко", [
        "Instagram і Behance — вітрини на чужих правилах: вони не ранжуються за запитом «весільний фотограф + місто» і можуть зникнути разом з акаунтом.",
        "Мінімальна структура, яка продає: жанрові галереї, пакети з цінами, відгуки пар, сторінка «Про мене» і форма бронювання.",
        "Лендінг-портфоліо у студії — від $800 і 2–3 тижні; сайт із клієнтськими галереями та кабінетами — від $3 500.",
        "Важкі фото не мають гальмувати сайт: WebP/AVIF, лінива загрузка і CDN тримають галерею на 100+ знімків швидкою.",
        "Темна тема додає кольорам глибини, світла — чесніша до скінтонів; вибір залежить від жанру, а не від моди.",
      ]),
      p("Сайт для фотографа — це портфоліо на власному домені, побудоване як воронка: жанрові галереї показують рівень, пакети з цінами знімають зайві питання, відгуки пар додають довіри, а форма бронювання закриває угоду. Такий лендінг-портфоліо коштує **від $800** і запускається за 2–3 тижні — далі він працює як цілодобовий менеджер з продажу зйомок."),
      p("Парадокс ринку: у більшості фотографів є Instagram з тисячами підписників і нуль клієнтів з Google. А тим часом пари, які реально готові платити, шукають не в стрічці — вони вводять у пошук «весільний фотограф Київ» або «сімейна фотосесія Львів ціна» і обирають з тих, хто там є."),
      p("У цій статті — як зробити сайт для фотографа, який потрапляє в цю видачу: структура, дві таблиці з цінами, технічні вимоги до галерей і реальні приклади з нашого портфоліо."),

      h2("Чому Instagram і Behance не замінюють власний сайт"),
      p("Соцмережі та портфоліо-платформи — чудові вітрини, але в них є системні обмеження, які не обійти жодним контент-планом:"),
      li("**Нуль пошукового трафіку.** Профіль в Instagram не ранжується в Google за запитом «весільний фотограф Одеса». Сторінка вашого сайту — ранжується, і це безкоштовні заявки роками."),
      li("**Алгоритм вирішує за вас.** Охоплення постів падає, стрічка показує ваші роботи 3–7% підписників. Сайт показує їх 100% відвідувачів — у тому порядку, який ви задали."),
      li("**Акаунт можна втратити.** Блокування, злам, зміна правил платформи — і 10 років портфоліо зникають за ніч. Домен і сайт належать вам."),
      li("**Behance дивляться дизайнери, а не наречені.** Це професійна тусовка для колег і арт-директорів. Клієнт з весільним бюджетом туди просто не заходить."),
      p("Це не означає «видаліть Instagram». Схема, яка працює: соцмережі прогрівають і ведуть на сайт, сайт ловить пошуковий трафік і конвертує обидва потоки в заявки. Профіль — канал, сайт — актив."),

      h2("Структура, яка продає зйомки, а не просто показує фото"),
      p("Головна помилка портфоліо-сайтів — «стіна фотографій» без логіки. Відвідувач гортає 200 знімків упереміш, не розуміє, скільки коштує зйомка, і йде. Продає не кількість фото, а маршрут від першого враження до заявки."),
      h3("Жанрові галереї замість загальної купи"),
      p("Окремі сторінки під кожен жанр — весілля, сімейні, портрети, комерційна зйомка — це водночас і зручність для клієнта, і окремі SEO-сторінки під окремі запити. На кожній — 15–25 найсильніших робіт: краще менше, але без прохідних кадрів."),
      h3("Пакети та ціни"),
      p("Вилка цін на сайті фільтрує нецільові звернення і економить вам години листування. Три пакети з описом, що входить (години зйомки, кількість оброблених фото, строки віддачі), плюс примітка «індивідуальні умови — обговорюємо» закривають 90% питань."),
      h3("Відгуки пар і соціальний доказ"),
      p("Відгук із фотографією пари та посиланням на повну галерею зйомки працює сильніше за будь-який текст про себе. Додайте цифри: років у професії, знятих весіль, міст і країн. Про інші прийоми, які піднімають конверсію, ми писали в статті про [9 дизайн-прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),
      table(
        ["Розділ", "Навіщо він"],
        [
          ["Жанрові галереї", "Показують рівень і ловлять SEO-запити «фотограф + жанр + місто»"],
          ["Пакети та ціни", "Фільтрують нецільових, знімають страх «мабуть, дорого»"],
          ["Відгуки пар", "Соціальний доказ: реальні люди, реальні зйомки"],
          ["Про фотографа", "Особистий контакт: пари обирають людину, а не картинки"],
          ["Форма бронювання", "Дата, локація, жанр — заявка за 30 секунд, без листування"],
        ]
      ),

      cta(
        "Хочете портфоліо, яке продає?",
        "Розрахуйте вартість сайту для фотографа за 2 хвилини — без дзвінків і листування.",
        "Розрахувати вартість",
        "/calculator"
      ),

      h2("Скільки коштує сайт для фотографа у 2026"),
      p("Є три шляхи: конструктор, готовий шаблон і кастомна розробка. Різниця — не тільки в цифрі на старті, а в тому, що буде з сайтом через рік."),
      table(
        ["Варіант", "Ціна", "Строк запуску", "SEO-потенціал"],
        [
          ["Конструктор (Wix, Squarespace, Tilda)", "$10–30/міс назавжди", "1–3 дні", "Слабкий: повільні галереї, обмежена технічна оптимізація"],
          ["Шаблон (WordPress-тема)", "$60–100 + робота", "1–2 тижні", "Середній: залежить від теми і плагінів, часто гальмує на фото"],
          ["Кастомний лендінг-портфоліо", "**від $800**", "2–3 тижні", "Високий: швидкі галереї, чиста структура під запити"],
          ["Кастомний сайт із клієнтськими кабінетами", "**від $3 500**", "4–8 тижнів", "Високий + автоматизація віддачі фото клієнтам"],
        ]
      ),
      p("Для більшості фотографів оптимальний старт — [лендінг-портфоліо](/landing) від $800: галереї, пакети, відгуки, форма бронювання. Клієнтські кабінети мають сенс, коли у вас потік зйомок і віддача фото через Google Drive уже забирає години на тиждень."),
      p("Подальші витрати теж прозорі: підтримка — **$200/міс або $40/год**, типова інтеграція (онлайн-оплата передоплати, CRM, календар бронювань) — **$200–500**. Повний розклад пакетів є на сторінці [цін](/pricing), а з чого взагалі складається бюджет сайту — у статті про [вартість розробки сайту у 2026](/blog/vartist-rozrobky-saytu-2026)."),

      h2("Швидкість: як показувати важкі фото без гальм"),
      p("Фотопортфоліо — найважчий тип сайту за вагою сторінки: одна галерея легко тягне на 50–100 МБ оригіналів. Якщо віддавати їх «як є», мобільний відвідувач піде на 5-й секунді білого екрана — а Google понизить сайт за повільний LCP."),
      p("Що ми робимо в кожному проєкті для фотографів:"),
      num("**WebP/AVIF замість JPEG.** Сучасні формати легші на 60–80% без видимої втрати якості — галерея на 40 фото важить як 8 «джипегів»."),
      num("**Адаптивні розміри.** Телефон отримує версію 800px, ретина-монітор — 2400px. Ніхто не завантажує 6000px оригінал заради прев'ю."),
      num("**Лінива загрузка.** Браузер тягне тільки фото у видимій зоні; решта галереї підвантажується під час скролу."),
      num("**CDN.** Знімки віддаються з сервера, найближчого до відвідувача, — галерея відкривається швидко і з Києва, і з Варшави."),
      p("Результат: сторінка з сотнею знімків відкривається за 1–2 секунди. Це не «опція для перфекціоністів» — швидкість напряму впливає і на позиції в Google, і на те, догорне пара галерею до кінця чи ні."),

      h2("Темна чи світла тема для фотопортфоліо"),
      p("Темний фон робить кольори глибшими і виглядає «преміально» — тому його люблять весільні та fashion-фотографи. Але у нього є ціна: на темному тлі око гірше зчитує тіні на скінтонах, а текст дрібним кеглем втомлює."),
      p("Світла тема — нейтральна галерейна стіна: чесно показує кольори, не сперечається зі знімками, краще читається. Для сімейної та дитячої зйомки вона майже завжди виграє. Компроміс — світлі сторінки з текстом і темний режим перегляду галерей. Докладний розбір аргументів — у статті [темна чи світла тема сайту](/blog/temna-chy-svitla-tema-saitu)."),

      h2("Захист фото і клієнтські галереї"),
      p("Два питання, які ставить кожен фотограф: «як захистити знімки від крадіжки» і «як зручно віддавати фото клієнтам». Чесна відповідь на перше: абсолютного захисту немає — скріншот не заборонити. Але бар'єри працюють:"),
      li("Публікація у веб-роздільності 1600–2400px — для друку чи реклами такі файли непридатні;"),
      li("Делікатний водяний знак на комерційних жанрах;"),
      li("Заборона правого кліка і перетягування — зупиняє «випадкових» копіювальників;"),
      li("Метадані авторства (IPTC) у кожному файлі — аргумент у суперечці про авторство."),
      p("Клієнтські галереї — сильніший хід: закритий розділ, куди пара заходить за паролем, обирає фото для обробки, завантажує готові знімки і бачить, скільки діє посилання. Це рівень сервісу, який запам'ятовують і рекомендують. Такий функціонал входить у сайт **від $3 500** з клієнтськими кабінетами."),

      h2("SEO: як пари знаходять фотографа в Google"),
      p("Запити фотографського ринку майже завжди локальні: «весільний фотограф Київ», «фотосесія вагітності Дніпро ціна», «дитячий фотограф Львів». Це означає, що конкуруєте ви не з усією країною, а з десятком колег у своєму місті — і структурований сайт легко їх обходить."),
      p("База, з якої варто почати: окрема сторінка під кожен жанр із містом у заголовку, alt-тексти до фото («весільна зйомка в Софії Київській», а не «IMG_4821»), профіль Google Business із посиланням на сайт і відгуками. Якщо хочете системного росту — [SEO-супровід](/seo) від **$300/міс** закриває семантику, тексти й технічку без вашої участі."),

      h2("Приклади: портфоліо, які ми вже зробили"),
      p("Подивіться, як ці принципи виглядають у живих проєктах студії:"),
      li("[Urmodels](/portfolio/urmodels) — сайт модельної агенції: великі галереї, швидка фільтрація, знімки грузяться миттєво навіть на мобільному."),
      li("[Glenn Garbo](/portfolio/glenn-garbo) — персональний бренд, побудований навколо візуального контенту: мінімум тексту, максимум присутності."),
      li("[Олександр Сітніков](/portfolio/oleksandr-sitnikov) — особистий сайт, де портфоліо працює на впізнаваність і прямі звернення."),
      p("Кожен із цих проєктів починався з того самого питання, що стоїть зараз перед вами: «чи потрібен мені сайт, якщо є соцмережі?» Відповідь у цифрах заявок, які приходять з пошуку щомісяця."),

      cta(
        "Готові запустити своє портфоліо?",
        "Лендінг-портфоліо від $800 за 2–3 тижні: галереї, пакети, форма бронювання. Порахуйте свій варіант у калькуляторі.",
        "Обговорити проєкт",
        "/calculator"
      ),
    ],
    ru: [
      tldr("Коротко", [
        "Instagram и Behance — витрины на чужих правилах: они не ранжируются по запросу «свадебный фотограф + город» и могут исчезнуть вместе с аккаунтом.",
        "Минимальная продающая структура: жанровые галереи, пакеты с ценами, отзывы пар, страница «Обо мне» и форма бронирования.",
        "Сайт-визитка фотографа в студии — от $800 и 2–3 недели; сайт с клиентскими галереями и кабинетами — от $3 500.",
        "Тяжёлые фото не должны тормозить сайт: WebP/AVIF, ленивая загрузка и CDN держат галерею на 100+ снимков быстрой.",
        "Тёмная тема добавляет цветам глубины, светлая честнее к оттенкам кожи; выбор зависит от жанра, а не от моды.",
      ]),
      p("Создание сайта для фотографа — это не «страничка с фотками», а воронка на собственном домене: жанровые галереи показывают уровень, пакеты с ценами снимают лишние вопросы, отзывы пар добавляют доверия, а форма бронирования закрывает сделку. Такой сайт-визитка фотографа стоит **от $800** и запускается за 2–3 недели — дальше он работает как круглосуточный менеджер по продаже съёмок."),
      p("Парадокс рынка: у большинства фотографов есть Instagram с тысячами подписчиков и ноль клиентов из Google. При этом пары, готовые платить, ищут не в ленте — они вводят в поиск «свадебный фотограф + город» или «семейная фотосессия цена» и выбирают из тех, кто там есть."),
      p("В этой статье — как сделать сайт, который попадает в эту выдачу: структура, две таблицы с ценами, технические требования к галереям и живые примеры из нашего портфолио."),

      h2("Почему Instagram и Behance не заменяют собственный сайт"),
      p("Соцсети и портфолио-платформы — отличные витрины, но у них есть системные ограничения, которые не обойти никаким контент-планом:"),
      li("**Ноль поискового трафика.** Профиль в Instagram не ранжируется в Google по запросу «свадебный фотограф» с городом. Страница вашего сайта — ранжируется, и это бесплатные заявки годами."),
      li("**Алгоритм решает за вас.** Охваты падают, лента показывает работы 3–7% подписчиков. Сайт показывает их 100% посетителей — в том порядке, который задали вы."),
      li("**Аккаунт можно потерять.** Блокировка, взлом, смена правил платформы — и 10 лет портфолио исчезают за ночь. Домен и сайт принадлежат вам."),
      li("**Behance смотрят дизайнеры, а не невесты.** Это профессиональная тусовка для коллег и арт-директоров. Клиент со свадебным бюджетом туда просто не заходит."),
      p("Это не значит «удалите Instagram». Рабочая схема: соцсети прогревают и ведут на сайт, сайт ловит поисковый трафик и конвертирует оба потока в заявки. Профиль — канал, сайт — актив."),

      h2("Структура, которая продаёт съёмки, а не просто показывает фото"),
      p("Главная ошибка портфолио-сайтов — «стена фотографий» без логики. Посетитель листает 200 снимков вперемешку, не понимает, сколько стоит съёмка, и уходит. Продаёт не количество фото, а маршрут от первого впечатления до заявки."),
      h3("Жанровые галереи вместо общей кучи"),
      p("Отдельные страницы под каждый жанр — свадьбы, семейные, портреты, коммерческая съёмка — это одновременно удобство для клиента и отдельные SEO-страницы под отдельные запросы. На каждой — 15–25 сильнейших работ: лучше меньше, но без проходных кадров."),
      h3("Пакеты и цены"),
      p("Вилка цен на сайте фильтрует нецелевые обращения и экономит вам часы переписки. Три пакета с описанием, что входит (часы съёмки, количество обработанных фото, сроки отдачи), плюс примечание «индивидуальные условия — обсуждаем» закрывают 90% вопросов."),
      h3("Отзывы пар и социальное доказательство"),
      p("Отзыв с фотографией пары и ссылкой на полную галерею съёмки работает сильнее любого текста о себе. Добавьте цифры: лет в профессии, снятых свадеб, городов и стран. Об остальных приёмах, поднимающих конверсию, мы писали в статье про [9 дизайн-приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),
      table(
        ["Раздел", "Зачем он нужен"],
        [
          ["Жанровые галереи", "Показывают уровень и ловят SEO-запросы «фотограф + жанр + город»"],
          ["Пакеты и цены", "Фильтруют нецелевых, снимают страх «наверное, дорого»"],
          ["Отзывы пар", "Социальное доказательство: реальные люди, реальные съёмки"],
          ["О фотографе", "Личный контакт: пары выбирают человека, а не картинки"],
          ["Форма бронирования", "Дата, локация, жанр — заявка за 30 секунд, без переписки"],
        ]
      ),

      cta(
        "Хотите портфолио, которое продаёт?",
        "Рассчитайте стоимость сайта для фотографа за 2 минуты — без звонков и переписки.",
        "Рассчитать стоимость",
        "/ru/calculator"
      ),

      h2("Сколько стоит сайт для фотографа в 2026"),
      p("Есть три пути: конструктор, готовый шаблон и кастомная разработка. Разница — не только в цифре на старте, а в том, что будет с сайтом через год."),
      table(
        ["Вариант", "Цена", "Срок запуска", "SEO-потенциал"],
        [
          ["Конструктор (Wix, Squarespace, Tilda)", "$10–30/мес навсегда", "1–3 дня", "Слабый: медленные галереи, ограниченная техническая оптимизация"],
          ["Шаблон (WordPress-тема)", "$60–100 + работа", "1–2 недели", "Средний: зависит от темы и плагинов, часто тормозит на фото"],
          ["Кастомный лендинг-портфолио", "**от $800**", "2–3 недели", "Высокий: быстрые галереи, чистая структура под запросы"],
          ["Кастомный сайт с клиентскими кабинетами", "**от $3 500**", "4–8 недель", "Высокий + автоматизация отдачи фото клиентам"],
        ]
      ),
      p("Для большинства фотографов оптимальный старт — [лендинг-портфолио](/ru/landing) от $800: галереи, пакеты, отзывы, форма бронирования. Клиентские кабинеты имеют смысл, когда у вас поток съёмок и отдача фото через Google Drive уже съедает часы в неделю."),
      p("Дальнейшие расходы тоже прозрачны: поддержка — **$200/мес или $40/час**, типовая интеграция (онлайн-оплата предоплаты, CRM, календарь бронирований) — **$200–500**. Полная раскладка пакетов — на странице [цен](/ru/pricing), а из чего вообще складывается бюджет сайта — в статье [сколько стоит сайт в 2026](/ru/blog/skolko-stoit-sayt-2026)."),

      h2("Скорость: как показывать тяжёлые фото без тормозов"),
      p("Фотопортфолио — самый тяжёлый тип сайта по весу страницы: одна галерея легко тянет на 50–100 МБ оригиналов. Если отдавать их «как есть», мобильный посетитель уйдёт на 5-й секунде белого экрана, а Google понизит сайт за медленный LCP."),
      p("Что мы делаем в каждом проекте для фотографов:"),
      num("**WebP/AVIF вместо JPEG.** Современные форматы легче на 60–80% без видимой потери качества — галерея на 40 фото весит как 8 «джипегов»."),
      num("**Адаптивные размеры.** Телефон получает версию 800px, ретина-монитор — 2400px. Никто не качает 6000px оригинал ради превью."),
      num("**Ленивая загрузка.** Браузер тянет только фото в видимой зоне; остальная галерея подгружается по мере скролла."),
      num("**CDN.** Снимки отдаются с сервера, ближайшего к посетителю, — галерея открывается быстро и из Киева, и из Варшавы."),
      p("Результат: страница с сотней снимков открывается за 1–2 секунды. Это не «опция для перфекционистов» — скорость напрямую влияет и на позиции в Google, и на то, долистает пара галерею до конца или нет."),

      h2("Тёмная или светлая тема для фотопортфолио"),
      p("Тёмный фон делает цвета глубже и выглядит «премиально» — поэтому его любят свадебные и fashion-фотографы. Но у него есть цена: на тёмном фоне глаз хуже считывает тени на оттенках кожи, а мелкий текст утомляет."),
      p("Светлая тема — нейтральная галерейная стена: честно показывает цвета, не спорит со снимками, лучше читается. Для семейной и детской съёмки она почти всегда выигрывает. Компромисс — светлые страницы с текстом и тёмный режим просмотра галерей. Подробный разбор аргументов — в статье [тёмная или светлая тема сайта](/ru/blog/tyomnaya-ili-svetlaya-tema-sayta)."),

      h2("Защита фото и клиентские галереи"),
      p("Два вопроса, которые задаёт каждый фотограф: «как защитить снимки от кражи» и «как удобно отдавать фото клиентам». Честный ответ на первый: абсолютной защиты нет — скриншот не запретить. Но барьеры работают:"),
      li("Публикация в веб-разрешении 1600–2400px — для печати или рекламы такие файлы непригодны;"),
      li("Деликатный водяной знак на коммерческих жанрах;"),
      li("Запрет правого клика и перетаскивания — останавливает «случайных» копировальщиков;"),
      li("Метаданные авторства (IPTC) в каждом файле — аргумент в споре об авторстве."),
      p("Клиентские галереи — ход посильнее: закрытый раздел, куда пара заходит по паролю, выбирает фото на обработку, скачивает готовые снимки и видит срок действия ссылки. Это уровень сервиса, который запоминают и рекомендуют. Такой функционал входит в сайт **от $3 500** с клиентскими кабинетами."),

      h2("SEO: как пары находят фотографа в Google"),
      p("Запросы фотографического рынка почти всегда локальны: «свадебный фотограф + город», «фотосессия беременности цена», «детский фотограф». Это значит, что конкурируете вы не со всей страной, а с десятком коллег в своём городе — и структурированный сайт легко их обходит."),
      p("База, с которой стоит начать: отдельная страница под каждый жанр с городом в заголовке, alt-тексты к фото («свадебная съёмка в ботаническом саду», а не «IMG_4821»), профиль Google Business со ссылкой на сайт и отзывами. Если нужен системный рост — [SEO-сопровождение](/ru/seo) от **$300/мес** закрывает семантику, тексты и техничку без вашего участия."),

      h2("Примеры: портфолио, которые мы уже сделали"),
      p("Посмотрите, как эти принципы выглядят в живых проектах студии:"),
      li("[Urmodels](/ru/portfolio/urmodels) — сайт модельного агентства: большие галереи, быстрая фильтрация, снимки грузятся мгновенно даже на мобильном."),
      li("[Glenn Garbo](/ru/portfolio/glenn-garbo) — персональный бренд, построенный вокруг визуального контента: минимум текста, максимум присутствия."),
      li("[Александр Ситников](/ru/portfolio/oleksandr-sitnikov) — личный сайт, где портфолио работает на узнаваемость и прямые обращения."),
      p("Каждый из этих проектов начинался с того же вопроса, который стоит сейчас перед вами: «зачем мне сайт, если есть соцсети?» Ответ — в цифрах заявок, которые ежемесячно приходят из поиска."),

      cta(
        "Готовы запустить своё портфолио?",
        "Сайт-визитка фотографа от $800 за 2–3 недели: галереи, пакеты, форма бронирования. Посчитайте свой вариант в калькуляторе.",
        "Обсудить проект",
        "/ru/calculator"
      ),
    ],
    en: [
      tldr("Key takeaways", [
        "Instagram and Behance are shop windows you don't own: they never rank for “wedding photographer + your city”, and an account can vanish overnight.",
        "The minimum structure that sells: genre galleries, packages with prices, testimonials from couples, an about page and a booking form.",
        "A custom portfolio landing page starts at $800 and launches in 2–3 weeks; a site with private client galleries starts at $3,500.",
        "Heavy photos must not slow the site down: WebP/AVIF, lazy loading and a CDN keep a 100-image gallery fast.",
        "Dark themes add depth to colours; light themes are more honest with skin tones — pick by genre, not by fashion.",
      ]),
      p("A photographer portfolio website is a portfolio on your own domain built as a funnel: genre galleries prove your level, packages with prices answer the awkward money question, testimonials from couples build trust, and a booking form closes the deal. A custom portfolio landing page starts at **$800** and launches in 2–3 weeks — from then on it works as a sales manager that never sleeps."),
      p("Here is the paradox of the market: most photographers have an Instagram with thousands of followers and zero clients from Google. Meanwhile the couples who are actually ready to pay don't scroll feeds — they search “wedding photographer + city” or “family photoshoot prices” and choose from whoever shows up."),
      p("This guide covers photography website design that gets you into those results: the structure, two pricing tables, the tech that keeps heavy galleries fast, and real examples from our studio's portfolio."),

      h2("Why Instagram and Behance don't replace your own website"),
      p("Social networks and portfolio platforms are great shop windows, but they come with structural limits no content plan can fix:"),
      li("**Zero search traffic.** An Instagram profile doesn't rank on Google for “wedding photographer Manchester”. A page on your own site does — and that means free enquiries for years."),
      li("**The algorithm decides for you.** Organic reach keeps shrinking; the feed shows your work to 3–7% of followers. Your website shows it to 100% of visitors, in the order you chose."),
      li("**Accounts get lost.** A ban, a hack, a policy change — and ten years of portfolio disappear overnight. Your domain and website belong to you."),
      li("**Behance is browsed by designers, not brides.** It's a professional community for peers and art directors. A client with a wedding budget simply never goes there."),
      p("This isn't “delete your Instagram”. The scheme that works: social media warms people up and sends them to the site; the site catches search traffic and converts both streams into bookings. The profile is a channel; the website is an asset."),

      h2("A structure that sells shoots, not just shows photos"),
      p("The classic portfolio mistake is a “wall of photographs” with no logic. A visitor scrolls through 200 mixed images, can't work out what a shoot costs, and leaves. What sells is not the number of photos but the route from first impression to enquiry."),
      h3("Genre galleries instead of one big pile"),
      p("Separate pages per genre — weddings, family, portraits, commercial — are both easier for the client and separate SEO pages for separate queries. Each holds your 15–25 strongest images: fewer is better, no filler frames."),
      h3("Packages and prices"),
      p("A price range on the site filters out mismatched enquiries and saves you hours of back-and-forth. Three packages listing what's included — hours of coverage, number of edited photos, delivery time — plus a “custom terms available” note answer 90% of questions before they're asked."),
      h3("Testimonials from couples"),
      p("A testimonial with the couple's photo and a link to their full gallery beats any “about me” copy. Add numbers: years in the craft, weddings shot, cities and countries covered. For more conversion patterns, see our post on [9 design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),
      table(
        ["Section", "Why it earns its place"],
        [
          ["Genre galleries", "Prove your level and catch “photographer + genre + city” searches"],
          ["Packages & prices", "Filter mismatched leads, remove the “probably too expensive” fear"],
          ["Couples' testimonials", "Social proof: real people, real shoots"],
          ["About the photographer", "Personal connection: couples choose a person, not pictures"],
          ["Booking form", "Date, location, genre — an enquiry in 30 seconds, no email ping-pong"],
        ]
      ),

      cta(
        "Want a portfolio that sells?",
        "Get a price for your photographer website in 2 minutes — no calls, no email chains.",
        "Calculate the cost",
        "/en/calculator"
      ),

      h2("What a photographer website costs in 2026"),
      p("There are three routes: a website builder, a ready-made template, or custom development. The difference isn't just the launch price — it's what your site can do a year from now."),
      table(
        ["Option", "Price", "Time to launch", "SEO potential"],
        [
          ["Builder (Wix, Squarespace, Format)", "$10–30/month forever", "1–3 days", "Weak: slow galleries, limited technical optimisation"],
          ["Template (WordPress theme)", "$60–100 + setup work", "1–2 weeks", "Medium: depends on theme and plugins, often chokes on photos"],
          ["Custom portfolio landing page", "**from $800**", "2–3 weeks", "High: fast galleries, clean structure built around search queries"],
          ["Custom site with client galleries", "**from $3,500**", "4–8 weeks", "High + automated photo delivery to clients"],
        ]
      ),
      p("For most photographers the sensible starting point is a [custom landing page](/en/landing) from $800: galleries, packages, testimonials, booking form. Client galleries pay off once you have a steady flow of shoots and delivering photos via Google Drive is already eating hours every week."),
      p("Running costs stay transparent too: support is **$200/month or $40/hour**, and a typical integration (deposit payments, CRM, booking calendar) runs **$200–500**. The full package breakdown is on our [pricing page](/en/pricing), and the anatomy of a website budget is covered in [what a custom website costs in 2026](/en/blog/custom-website-cost-uk-2026). We're a Ukrainian studio working with international clients — European quality at sensible rates."),

      h2("Speed: showing heavy photos without the lag"),
      p("A photo portfolio is the heaviest type of website there is: one gallery can easily hold 50–100 MB of originals. Serve them as-is and a mobile visitor leaves at second five of a white screen — while Google demotes the site for a slow LCP."),
      p("What we do on every photographer project:"),
      num("**WebP/AVIF instead of JPEG.** Modern formats are 60–80% lighter with no visible quality loss — a 40-photo gallery weighs as much as 8 old JPEGs."),
      num("**Responsive sizes.** A phone gets an 800px version, a retina display gets 2400px. Nobody downloads a 6000px original for a thumbnail."),
      num("**Lazy loading.** The browser only fetches photos in the viewport; the rest of the gallery loads as the visitor scrolls."),
      num("**A CDN.** Images are served from the node closest to the visitor — the gallery opens fast from London and from Lisbon alike."),
      p("The result: a page with a hundred images opens in 1–2 seconds. That's not perfectionism — speed directly affects both your Google rankings and whether a couple scrolls your gallery to the end."),

      h2("Dark or light theme for a photography site"),
      p("A dark background makes colours look deeper and reads as “premium” — which is why wedding and fashion photographers love it. It has a cost, though: on dark backgrounds the eye reads shadow detail in skin tones worse, and small light-on-dark text tires quickly."),
      p("A light theme is the neutral gallery wall: it shows colours honestly, never argues with the photographs, and reads better. For family and children's photography it almost always wins. A good compromise: light content pages with a dark gallery viewing mode. We unpack the full argument in [dark vs light website theme](/en/blog/dark-vs-light-website-theme)."),

      h2("Photo protection and client galleries"),
      p("Every photographer asks two questions: “how do I protect my images from theft?” and “how do I deliver photos to clients without the mess?” The honest answer to the first: there is no absolute protection — you can't ban screenshots. But barriers work:"),
      li("Publish at web resolution (1600–2400px) — useless for print or advertising;"),
      li("A subtle watermark on commercial genres;"),
      li("Disabled right-click and drag — stops the casual copiers;"),
      li("IPTC authorship metadata in every file — your argument in any ownership dispute."),
      p("Client galleries are the stronger move: a password-protected area where a couple picks photos for editing, downloads the finished set and sees how long the link stays live. That's the level of service people remember and recommend. It ships with our **from $3,500** tier with client accounts."),

      h2("SEO: how couples find a photographer on Google"),
      p("Photography searches are almost always local: “wedding photographer + city”, “maternity photoshoot prices”, “family photographer near me”. Which means you're not competing with the whole country — just a dozen colleagues in your city, and a well-structured site overtakes them quickly."),
      p("Start with the basics: a separate page per genre with the city in the heading, descriptive alt text (“wedding ceremony at the botanic garden”, not “IMG_4821”), and a Google Business profile linking to the site. For systematic growth, our [SEO service](/en/seo) from **$300/month** covers keyword research, content and technical fixes without taking your time."),

      h2("Examples: portfolios we've already built"),
      p("See how these principles look in live studio projects:"),
      li("[Urmodels](/en/portfolio/urmodels) — a model agency website: large galleries, fast filtering, images load instantly even on mobile."),
      li("[Glenn Garbo](/en/portfolio/glenn-garbo) — a personal brand built around visual content: minimal text, maximum presence."),
      li("[Oleksandr Sitnikov](/en/portfolio/oleksandr-sitnikov) — a personal site where the portfolio drives recognition and direct enquiries."),
      p("Each of these projects started with the same question you're asking now: “do I need a website if I have social media?” The answer shows up in the monthly count of enquiries arriving from search."),

      cta(
        "Ready to launch your portfolio?",
        "A custom portfolio landing page from $800 in 2–3 weeks: galleries, packages, booking form. Price your version in the calculator.",
        "Discuss the project",
        "/en/calculator"
      ),
    ],
  },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для фотографа?",
        ru: "Сколько стоит сайт для фотографа?",
        en: "How much does a photographer website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг-портфоліо з жанровими галереями, пакетами і формою бронювання — від $800, запуск за 2–3 тижні. Сайт із клієнтськими кабінетами і закритими галереями — від $3 500. Конструктори дешевші на старті ($10–30/міс), але програють у швидкості галерей і SEO.",
        ru: "Сайт-визитка фотографа с жанровыми галереями, пакетами и формой бронирования — от $800, запуск за 2–3 недели. Сайт с клиентскими кабинетами и закрытыми галереями — от $3 500. Конструкторы дешевле на старте ($10–30/мес), но проигрывают в скорости галерей и SEO.",
        en: "A portfolio landing page with genre galleries, packages and a booking form starts at $800 and launches in 2–3 weeks. A site with private client galleries starts at $3,500. Builders are cheaper upfront ($10–30/month) but lose on gallery speed and SEO.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна фотографу обійтися Instagram без сайту?",
        ru: "Можно ли фотографу обойтись Instagram без сайта?",
        en: "Can a photographer get by with just Instagram?",
      },
      answer: {
        _type: "localizedText",
        uk: "Як вітрина для підписників — так, як джерело нових клієнтів із пошуку — ні. Instagram не ранжується в Google за запитом «весільний фотограф + місто», охоплення залежать від алгоритму, а акаунт можна втратити. Робоча зв'язка: соцмережі ведуть на сайт, сайт конвертує в заявки.",
        ru: "Как витрина для подписчиков — да, как источник новых клиентов из поиска — нет. Instagram не ранжируется в Google по запросу «свадебный фотограф + город», охваты зависят от алгоритма, а аккаунт можно потерять. Рабочая связка: соцсети ведут на сайт, сайт конвертирует в заявки.",
        en: "As a shop window for followers — yes; as a source of new clients from search — no. Instagram doesn't rank on Google for “wedding photographer + city”, reach depends on the algorithm, and accounts get lost. The working combo: social media leads to the site, the site converts into bookings.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки фото ставити в портфоліо на сайті?",
        ru: "Сколько фото ставить в портфолио на сайте?",
        en: "How many photos should a portfolio website have?",
      },
      answer: {
        _type: "localizedText",
        uk: "15–25 найсильніших робіт на жанр. Портфоліо оцінюють за найслабшим кадром, а не за найкращим: один прохідний знімок тягне вниз усе враження. Краще п'ять жанрів по 20 фото, ніж одна галерея на 300.",
        ru: "15–25 сильнейших работ на жанр. Портфолио оценивают по слабейшему кадру, а не по лучшему: один проходной снимок тянет вниз всё впечатление. Лучше пять жанров по 20 фото, чем одна галерея на 300.",
        en: "15–25 of your strongest images per genre. A portfolio is judged by its weakest frame, not its best: one filler shot drags down the whole impression. Five genres of 20 photos each beat one gallery of 300.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як зробити сайт швидким, якщо на ньому сотні фото?",
        ru: "Как сделать сайт быстрым, если на нём сотни фото?",
        en: "How do you keep a site fast with hundreds of photos?",
      },
      answer: {
        _type: "localizedText",
        uk: "Чотири технології: формати WebP/AVIF (легші за JPEG на 60–80%), адаптивні розміри під екран відвідувача, лінива загрузка фото поза видимою зоною і CDN. У сумі сторінка із сотнею знімків відкривається за 1–2 секунди навіть на мобільному.",
        ru: "Четыре технологии: форматы WebP/AVIF (легче JPEG на 60–80%), адаптивные размеры под экран посетителя, ленивая загрузка фото вне видимой зоны и CDN. В сумме страница с сотней снимков открывается за 1–2 секунды даже на мобильном.",
        en: "Four technologies: WebP/AVIF formats (60–80% lighter than JPEG), responsive sizes matched to the visitor's screen, lazy loading for off-screen photos, and a CDN. Together they open a hundred-image page in 1–2 seconds even on mobile.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібно вказувати ціни на сайті фотографа?",
        ru: "Нужно ли указывать цены на сайте фотографа?",
        en: "Should a photographer publish prices on the website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, хоча б вилку «від». Без цін половина відвідувачів іде, вирішивши, що «мабуть, дорого», а друга половина пише нецільові запити. Пакети з описом, що входить, фільтрують аудиторію і економлять години листування.",
        ru: "Да, хотя бы вилку «от». Без цен половина посетителей уходит, решив, что «наверное, дорого», а вторая половина пишет нецелевые запросы. Пакеты с описанием, что входит, фильтруют аудиторию и экономят часы переписки.",
        en: "Yes — at least a “from” range. Without prices, half your visitors leave assuming it's too expensive, and the other half send mismatched enquiries. Packages listing what's included filter the audience and save hours of email.",
      },
    },
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
