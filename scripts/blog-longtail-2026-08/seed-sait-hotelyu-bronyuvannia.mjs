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

// ---------------------------------------------------------------------------
// UK BODY
// ---------------------------------------------------------------------------
const bodyUk = [
  tldr("Коротко: сайт готелю з бронюванням", [
    "Сайт-візитка готелю — від $800, сайт з модулем бронювання — від $3 500, платформа з channel manager — від $6 000",
    "Booking.com і Airbnb забирають 15–20% з кожної броні; пряма бронь через власний сайт — 0% комісії",
    "Обов'язковий мінімум модуля: календар зайнятості, онлайн-оплата, автоматичні підтвердження на email",
    "Channel manager синхронізує власний сайт з Booking, Airbnb та Expedia — овербукінг зникає",
    "Багатомовність і локальне SEO приводять іноземних гостей напряму, повз агрегатори",
  ]),
  p("**Сайт для готелю з онлайн-бронюванням коштує від $3 500 і зазвичай окупається за перший сезон:** кожна пряма бронь економить 15–20% комісії, яку ви віддали б Booking.com чи Airbnb. Для готелю на 15 номерів із середнім чеком $70 за ніч це $700–1 200 заощаджених грошей на місяць уже при 60–80 бронюваннях — тобто сайт повертає вкладене за 4–6 місяців активного сезону."),
  p("У цій статті розберемо, з чого складається розробка сайту для готелів: скільки коштують три рівні рішень, як влаштований модуль бронювання, навіщо потрібен channel manager, і що зробити, щоб іноземні гості знаходили вас у Google, а не на сторінці агрегатора. Усі ціни — реальні вилки нашої студії, без «від 100 грн» з реклами."),

  h2("Скільки коштує сайт для готелю у 2026 році"),
  p("Ціна залежить не від кількості сторінок, а від глибини автоматизації: сайт-візитка лише показує номери, сайт з бронюванням продає їх сам, а платформа з channel manager ще й синхронізує продажі з агрегаторами. Ось три робочі конфігурації:"),
  table(
    ["Рівень", "Що всередині", "Ціна", "Термін"],
    [
      ["**Сайт-візитка готелю**", "Сторінки номерів, фотогалерея, ціни, карта, форма заявки і кнопка дзвінка", "від $800", "2–3 тижні"],
      ["**Сайт з онлайн-бронюванням**", "Модуль бронювання, календар зайнятості, онлайн-оплата, багатомовність, admin-панель", "від $3 500", "4–7 тижнів"],
      ["**Платформа з channel manager**", "Все з попереднього + синхронізація з Booking/Airbnb, динамічні ціни, база гостей, аналітика", "від $6 000", "8–12 тижнів"],
    ],
  ),
  p("Сайт-візитка — це стартовий варіант для міні-готелю чи садиби на 3–5 номерів, де бронями керує адміністратор у телефоні: по суті це [лендінг](/landing) з гарною галереєю. Готелю від 10 номерів уже потрібен повноцінний [корпоративний сайт](/corporate-site) з модулем бронювання — інакше адміністратор стає вузьким місцем, а нічні заявки згорають до ранку."),
  p("На фінальну ціну впливають інтеграції: платіжний шлюз чи Google Calendar — це типова інтеграція за $200–500, а двостороння синхронізація з PMS-системою готелю або кастомний channel manager — складна, $1 000–3 000. Детальний розбір, з чого складається ціна, є в статті про [вартість розробки сайту у 2026 році](/blog/vartist-rozrobky-saytu-2026), а швидку оцінку саме вашої конфігурації дає [калькулятор](/calculator)."),

  h2("Booking бере 15–20% з кожної броні. Порахуймо"),
  p("Комісія Booking.com для незалежних готелів України — 15%, з програмами видимості — до 18–20%. Airbnb бере близько 14–16% сумарно з господаря і гостя. Це не разовий платіж за залучення гостя: агрегатор бере відсоток і з другого, і з десятого приїзду того самого клієнта, бо контакти гостя вам не належать."),
  table(
    ["Критерій", "Booking.com / Airbnb", "Власний сайт"],
    [
      ["Комісія з броні", "15–20%", "0% (лише еквайринг 1,5–3%)"],
      ["База гостей", "Належить платформі, email прихований", "Ваша: email, телефон, історія проживань"],
      ["Повторні бронювання", "Знову через агрегатор — знову комісія", "Напряму, з промокодом на повернення"],
      ["Ціни та правила скасування", "Обмежені правилами платформи", "Повністю контролюєте ви"],
      ["Ризик блокування", "Акаунт можуть заморозити без пояснень", "Сайт і домен ваші назавжди"],
    ],
  ),
  p("Важливо: ми не радимо видаляти акаунти на агрегаторах. Робоча стратегія — **ребаланс**: Booking залишається рекламним каналом для перших заїздів, а власний сайт збирає повторні броні, корпоративних клієнтів і всіх, хто прийшов з Google Maps чи Instagram. Готелі, з якими ми працюємо, за рік доводять частку прямих бронювань до 35–50% — це тисячі доларів комісій, що залишаються в бізнесі."),

  h2("Модуль бронювання: що має бути всередині"),
  p("«Сайт готелю з бронюванням» — це не кнопка «Забронювати», яка відкриває форму листа. Це система, що сама тримає календар, приймає оплату і підтверджує бронь без участі адміністратора. Мінімальний робочий набір:"),
  h3("Календар зайнятості номерів"),
  p("Гість бачить лише реально вільні дати по кожній категорії номерів, з цінами на конкретні ночі. Адміністратор у admin-панелі закриває дати вручну (ремонт, бронь по телефону) — і вони миттєво зникають з продажу на сайті."),
  h3("Онлайн-оплата або гарантія карткою"),
  p("Передоплата 20–30% через платіжний шлюз відсікає «мертві» броні, які так болять у сезон. Підключення шлюзу — типова інтеграція в межах $200–500. Для преміум-сегмента працює і м'якший сценарій: гарантія карткою без списання."),
  h3("Автоматичні листи та нагадування"),
  p("Підтвердження броні одразу, нагадування за 3 дні до заїзду, лист після виїзду з проханням про відгук і промокодом на наступний приїзд. Саме цей ланцюжок перетворює разового гостя з Booking на прямого постійного клієнта."),
  p("Що ще варто закласти на старті:"),
  li("Вибір тарифу: зі сніданком / без, зі скасуванням / невозвратний — різниця в ціні мотивує передоплату"),
  li("Промокоди та сезонні ціни: вихідні, свята, «гарячі» дати керуються з admin-панелі"),
  li("Апселли на кроці оплати: трансфер, пізній виїзд, сауна, романтичний пакет"),
  li("Мобільний сценарій: понад 65% бронювань готелів починаються зі смартфона"),
  cta(
    "Порахуємо ваш модуль бронювання?",
    "Розкажіть про готель — кількість номерів, сезонність, канали продажів. За день пришлемо конфігурацію сайту з точною ціною і термінами.",
    "Отримати розрахунок",
    "/calculator",
  ),

  h2("Channel manager: один календар для всіх майданчиків"),
  p("Поки готель продається і на сайті, і на Booking, і на Airbnb, головний страх — овербукінг: два гостя на один номер в одну ніч. Channel manager вирішує це: єдиний календар зайнятості автоматично оновлює доступність на всіх майданчиках, щойно хтось бронює будь-де."),
  p("Для готелів до 10–15 номерів зазвичай вигідніше підключити готовий сервіс (HotelFriend, Bnovo, WuBook — $30–100/міс) і інтегрувати сайт з ним. Для більших об'єктів або мереж має сенс кастомна логіка на власній платформі — це рівень «від $6 000» з нашої таблиці, зате без щомісячної абонплати за кожен номер і з правилами ціноутворення під ваш бізнес: динамічні ціни на вихідні, знижки на «діри» між бронями, окремі тарифи для корпоративних клієнтів."),

  h2("Фото, відео та швидкість: що насправді продає номер"),
  p("Гість не може «помацати» номер — він купує фотографію. Тому галерея вирішує більше, ніж будь-який текст: 8–12 професійних фото на категорію номера, кадри сніданку, тераси, виду з вікна. Відеотур на 30–60 секунд піднімає конверсію сторінки номера, але лише якщо не вбиває швидкість."),
  p("А швидкість тут критична подвійно: повільний сайт втрачає і гостей, і позиції в Google. Правильна збірка — сучасний стек із CDN, оптимізовані зображення у WebP/AVIF, ліниве завантаження галерей — тримає відкриття сторінки до 2 секунд навіть з мобільного інтернету в горах. Про прийоми, які реально піднімають конверсію сторінок, ми писали окремо: [9 дизайн-прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),

  h2("Багатомовність: як приймати іноземних гостей напряму"),
  p("Іноземний гість, який не знайшов англійську версію сайту, повертається на Booking — там йому зрозуміло все. Тому для готелів у Карпатах, Львові, Одесі чи Києві англійська версія — не «опція», а канал продажів: саме іноземці дають найдовші проживання і найспокійніше ставляться до передоплати."),
  p("Наша студія будує мультимовні сайти як основну спеціалізацію — цей блог ви читаєте на сайті, що працює трьома мовами з коректними hreflang, локалізованими URL і окремими метатегами для кожної мови. Для готелю це означає: українська версія збирає внутрішній туризм, англійська — гостей з Європи, і обидві індексуються в Google незалежно. Додати польську чи німецьку під ваш потік гостей — питання контенту, а не переробки сайту."),

  h2("Локальне SEO: щоб готель знаходили в Google Maps"),
  p("Запити «готель львів центр», «готель буковель з басейном» — це найгарячіші гості: вони вже обрали місто і дати. Щоб забирати їх напряму, сайт і профіль Google Business мають працювати в парі: категорії номерів на окремих сторінках, схема розмітки Hotel з цінами і рейтингом, актуальні фото і відгуки в профілі, однакові назва-адреса-телефон скрізь."),
  p("Ми розібрали цю механіку покроково в статті [як потрапити в топ-3 Google Maps](/blog/lokalne-seo-top-3-google-maps). Якщо робити руками нема кому — [SEO-супровід](/seo) студії коштує від $300/міс і для готелю зазвичай фокусується саме на локальній видачі та сторінках категорій номерів."),

  h2("6 помилок, які зливають прямі бронювання"),
  p("Ми регулярно аудитуємо сайти готелів перед редизайном, і той самий список проблем повторюється з проєкту в проєкт:"),
  num("Ціни «за запитом» — гість не пише, а йде на Booking, де ціна видна одразу"),
  num("Форма замість модуля: заявка без календаря означає добу листування замість миттєвої броні"),
  num("Фото 2018 року на 200 КБ — або, навпаки, необрізані оригінали по 8 МБ, які вантажаться по 10 секунд"),
  num("Немає англійської версії — іноземний гість не ризикує і бронює через агрегатор"),
  num("Календар на сайті живе окремо від Booking — раз на сезон трапляється овербукінг і скандал у відгуках"),
  num("Ніхто не оновлює акції та тарифи, бо admin-панель незручна — сайт «замерзає» і втрачає довіру"),
  p("Кожен пункт цього списку — це конкретна вимога до технічного завдання. Перевірте свій сайт за ним перед тим, як замовляти редизайн."),

  h2("Кейс: Rich Tour — сайт для туристичного бізнесу"),
  p("Для туроператора [Rich Tour](/portfolio/rich-tour) ми будували сайт, де головне — той самий сценарій, що й у готелю: гість обирає напрямок, бачить актуальні ціни і залишає заявку без дзвінка. Швидкі сторінки турів, зрозумілий каталог і мобільний сценарій бронювання — та сама механіка масштабується на готелі, садиби і апарт-комплекси."),
  p("Стартова точка залежить від масштабу: невеликій садибі вистачить [лендінгу](/landing) з галереєю і формою, готелю на 10+ номерів потрібен [корпоративний сайт](/corporate-site) з модулем бронювання. Після запуску сайт супроводжуємо: [підтримка](/support) — $200/міс або $40/год, тож календар, ціни і акції не залишаться без нагляду."),
  cta(
    "Готові приймати броні без комісій?",
    "Покажемо, як виглядатиме модуль бронювання саме для ваших номерів, і назвемо точну ціну — безкоштовно і без зобов'язань.",
    "Обговорити проєкт",
    "/calculator",
  ),
];

// ---------------------------------------------------------------------------
// RU BODY
// ---------------------------------------------------------------------------
const bodyRu = [
  tldr("Коротко: создание сайта отеля с бронированием", [
    "Сайт-визитка отеля — от $800, сайт с модулем бронирования — от $3 500, платформа с channel manager — от $6 000",
    "Booking.com и Airbnb удерживают 15–20% с каждой брони; прямая бронь через свой сайт — 0% комиссии",
    "Минимум модуля бронирования: календарь занятости, онлайн-оплата, автоматические подтверждения",
    "Channel manager синхронизирует сайт с Booking, Airbnb и Expedia — овербукинг исключён",
    "Мультиязычность и локальное SEO приводят иностранных гостей напрямую, мимо агрегаторов",
  ]),
  p("**Создание сайта отеля с онлайн-бронированием стоит от $3 500 и обычно окупается за первый сезон:** каждая прямая бронь экономит 15–20% комиссии, которую забрал бы Booking.com или Airbnb. Отель на 15 номеров со средним чеком $70 за ночь при 60–80 бронях в месяц оставляет себе лишних $700–1 200 — сайт возвращает вложения за 4–6 месяцев активного сезона."),
  p("Разберём, как устроена разработка сайтов для отелей на практике: сколько стоят три уровня решений, что обязано быть внутри модуля бронирования, зачем нужен channel manager и как сделать, чтобы иностранный гость нашёл вас в Google, а не на странице агрегатора. Все цифры — реальные вилки нашей студии, а не «от 100 грн» из рекламы."),

  h2("Сколько стоит сайт отеля в 2026 году"),
  p("Цена определяется не количеством страниц, а глубиной автоматизации: визитка показывает номера, сайт с бронированием продаёт их сам, платформа с channel manager ещё и синхронизирует продажи с агрегаторами. Три рабочие конфигурации:"),
  table(
    ["Уровень", "Что внутри", "Цена", "Срок"],
    [
      ["**Сайт-визитка отеля**", "Страницы номеров, фотогалерея, цены, карта, форма заявки и кнопка звонка", "от $800", "2–3 недели"],
      ["**Сайт с онлайн-бронированием**", "Модуль бронирования, календарь занятости, онлайн-оплата, мультиязычность, админ-панель", "от $3 500", "4–7 недель"],
      ["**Платформа с channel manager**", "Всё из предыдущего + синхронизация с Booking/Airbnb, динамические цены, база гостей, аналитика", "от $6 000", "8–12 недель"],
    ],
  ),
  p("Визитка — стартовый вариант для мини-отеля или усадьбы на 3–5 номеров, где бронями управляет администратор с телефоном: по сути это [лендинг](/ru/landing) с сильной галереей. Отелю от 10 номеров нужен полноценный [корпоративный сайт](/ru/corporate-site) с модулем бронирования — иначе администратор становится бутылочным горлышком, а ночные заявки сгорают до утра."),
  p("Финальную цену двигают интеграции: платёжный шлюз или Google Calendar — типовая интеграция за $200–500, а двусторонняя синхронизация с PMS отеля или кастомный channel manager — сложная, $1 000–3 000. Подробный разбор, из чего складывается смета, — в статье [сколько стоит сайт в 2026 году](/ru/blog/skolko-stoit-sayt-2026), а быструю оценку вашей конфигурации даст [калькулятор](/ru/calculator)."),

  h2("Booking удерживает 15–20% с каждой брони. Считаем"),
  p("Базовая комиссия Booking.com для независимых отелей — 15%, с программами видимости — до 18–20%. Airbnb суммарно с хозяина и гостя берёт около 14–16%. И это не разовая плата за привлечение: агрегатор удерживает процент и со второго, и с десятого приезда того же гостя, потому что его контакты вам не принадлежат."),
  table(
    ["Критерий", "Booking.com / Airbnb", "Свой сайт"],
    [
      ["Комиссия с брони", "15–20%", "0% (только эквайринг 1,5–3%)"],
      ["База гостей", "Принадлежит платформе, email скрыт", "Ваша: email, телефон, история проживаний"],
      ["Повторные брони", "Снова через агрегатор — снова комиссия", "Напрямую, с промокодом на возвращение"],
      ["Цены и правила отмены", "Ограничены правилами платформы", "Полностью под вашим контролем"],
      ["Риск блокировки", "Аккаунт могут заморозить без объяснений", "Сайт и домен ваши навсегда"],
    ],
  ),
  p("Важно: мы не предлагаем удалять аккаунты на агрегаторах. Рабочая стратегия — **ребаланс**: Booking остаётся рекламным каналом для первых заездов, а свой сайт собирает повторные брони, корпоративных клиентов и всех, кто пришёл из Google Maps или Instagram. Отели, с которыми мы работаем, за год доводят долю прямых бронирований до 35–50% — это тысячи долларов комиссий, остающихся в бизнесе."),

  h2("Как создать сайт бронирования отеля: что внутри модуля"),
  p("Сайт бронирования — это не кнопка «Забронировать», открывающая форму письма. Это система, которая сама ведёт календарь, принимает оплату и подтверждает бронь без участия администратора. Минимальный рабочий набор:"),
  h3("Календарь занятости номеров"),
  p("Гость видит только реально свободные даты по каждой категории номеров с ценами на конкретные ночи. Администратор в админ-панели закрывает даты вручную (ремонт, бронь по телефону) — и они мгновенно уходят из продажи."),
  h3("Онлайн-оплата или гарантия картой"),
  p("Предоплата 20–30% через платёжный шлюз отсекает «мёртвые» брони, которые больнее всего бьют в сезон. Подключение шлюза — типовая интеграция в пределах $200–500. Для премиум-сегмента работает мягкий сценарий: гарантия картой без списания."),
  h3("Автоматические письма и напоминания"),
  p("Подтверждение сразу после оплаты, напоминание за 3 дня до заезда, письмо после выезда с просьбой об отзыве и промокодом на следующий приезд. Именно эта цепочка превращает разового гостя с Booking в прямого постоянного клиента."),
  p("Что ещё стоит заложить на старте:"),
  li("Выбор тарифа: с завтраком / без, с отменой / невозвратный — разница в цене мотивирует предоплату"),
  li("Промокоды и сезонные цены: выходные, праздники и «горячие» даты управляются из админ-панели"),
  li("Апселлы на шаге оплаты: трансфер, поздний выезд, сауна, романтический пакет"),
  li("Мобильный сценарий: больше 65% бронирований отелей начинаются со смартфона"),
  cta(
    "Посчитаем ваш модуль бронирования?",
    "Расскажите об отеле — количество номеров, сезонность, каналы продаж. За день пришлём конфигурацию сайта с точной ценой и сроками.",
    "Получить расчёт",
    "/ru/calculator",
  ),

  h2("Channel manager: один календарь для всех площадок"),
  p("Пока отель продаётся одновременно на сайте, Booking и Airbnb, главный страх — овербукинг: два гостя на один номер в одну ночь. Channel manager закрывает проблему: единый календарь занятости автоматически обновляет доступность на всех площадках, как только кто-то бронирует где угодно."),
  p("Отелям до 10–15 номеров обычно выгоднее подключить готовый сервис (Bnovo, WuBook, HotelFriend — $30–100/мес) и интегрировать с ним сайт. Крупным объектам и сетям имеет смысл кастомная логика на собственной платформе — тот самый уровень «от $6 000» из таблицы: без абонплаты за каждый номер и с ценообразованием под ваш бизнес — динамические цены на выходные, скидки на «дыры» между бронями, отдельные тарифы для корпоративных клиентов."),

  h2("Фото, видео и скорость: что на самом деле продаёт номер"),
  p("Гость не может потрогать номер — он покупает фотографию. Поэтому галерея решает больше любого текста: 8–12 профессиональных кадров на категорию номера, завтрак, терраса, вид из окна. Видеотур на 30–60 секунд поднимает конверсию страницы номера — но только если не убивает скорость."),
  p("Скорость здесь критична вдвойне: медленный сайт теряет и гостей, и позиции в Google. Правильная сборка — современный стек с CDN, изображения в WebP/AVIF, ленивая загрузка галерей — держит открытие страницы до 2 секунд даже с мобильного интернета в горах. О приёмах, которые реально поднимают конверсию, мы писали отдельно: [9 дизайн-приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),

  h2("Мультиязычность: как принимать иностранных гостей напрямую"),
  p("Иностранец, не нашедший английскую версию сайта, возвращается на Booking — там ему понятно всё. Поэтому для отелей в Карпатах, Львове, Одессе или Киеве английская версия — не опция, а канал продаж: именно иностранные гости бронируют самые длинные проживания и спокойнее всех относятся к предоплате."),
  p("Мультиязычные сайты — основная специализация нашей студии: этот блог вы читаете на сайте, который работает на трёх языках с корректными hreflang, локализованными URL и отдельными метатегами для каждого языка. Для отеля это значит: украинская версия собирает внутренний туризм, английская — гостей из Европы, и обе независимо индексируются в Google. Добавить польскую или немецкую под ваш поток гостей — вопрос контента, а не переделки сайта."),

  h2("Локальное SEO: чтобы отель находили в Google Maps"),
  p("Запросы «отель львов центр», «отель буковель с бассейном» — самые горячие гости: город и даты уже выбраны. Чтобы забирать их напрямую, сайт и профиль Google Business должны работать в паре: категории номеров на отдельных страницах, разметка Hotel с ценами и рейтингом, свежие фото и отзывы в профиле, одинаковые название-адрес-телефон везде."),
  p("Механику мы разобрали по шагам в статье [как попасть в топ-3 Google Maps](/ru/blog/lokalnoe-seo-top-3-google-maps). Если делать руками некому — [SEO-сопровождение](/ru/seo) студии стоит от $300/мес и для отеля обычно фокусируется именно на локальной выдаче и страницах категорий номеров."),

  h2("6 ошибок, которые сливают прямые брони"),
  p("Мы регулярно проводим аудит сайтов отелей перед редизайном, и один и тот же список проблем повторяется из проекта в проект:"),
  num("Цены «по запросу» — гость не пишет, а уходит на Booking, где цена видна сразу"),
  num("Форма вместо модуля: заявка без календаря — это сутки переписки вместо мгновенной брони"),
  num("Фото 2018 года на 200 КБ — или, наоборот, необрезанные оригиналы по 8 МБ, которые грузятся по 10 секунд"),
  num("Нет английской версии — иностранный гость не рискует и бронирует через агрегатор"),
  num("Календарь на сайте живёт отдельно от Booking — раз в сезон случается овербукинг и скандал в отзывах"),
  num("Никто не обновляет акции и тарифы, потому что админка неудобная — сайт «замерзает» и теряет доверие"),
  p("Каждый пункт этого списка — готовое требование к техническому заданию. Проверьте свой сайт по нему, прежде чем заказывать редизайн."),

  h2("Кейс: Rich Tour — сайт для туристического бизнеса"),
  p("Для туроператора [Rich Tour](/ru/portfolio/rich-tour) мы строили сайт вокруг того же сценария, что и у отеля: гость выбирает направление, видит актуальные цены и оставляет заявку без звонка. Быстрые страницы туров, понятный каталог и мобильный сценарий бронирования — эта же механика масштабируется на отели, усадьбы и апарт-комплексы."),
  p("Стартовая точка зависит от масштаба: небольшой усадьбе хватит [лендинга](/ru/landing) с галереей и формой, отелю на 10+ номеров нужен [корпоративный сайт](/ru/corporate-site) с модулем бронирования. После запуска сайт не остаётся один: [поддержка](/ru/support) — $200/мес или $40/час, так что календарь, цены и акции всегда под присмотром."),
  cta(
    "Готовы принимать брони без комиссий?",
    "Покажем, как будет выглядеть модуль бронирования именно для ваших номеров, и назовём точную цену — бесплатно и без обязательств.",
    "Обсудить проект",
    "/ru/calculator",
  ),
];

// ---------------------------------------------------------------------------
// EN BODY
// ---------------------------------------------------------------------------
const bodyEn = [
  tldr("TL;DR: hotel website with a booking engine", [
    "A hotel brochure site starts at $800, a website with a booking engine at $3,500, a platform with a channel manager at $6,000",
    "Booking.com and Airbnb keep 15–20% of every reservation; direct bookings through your own site cost 0% commission",
    "The engine's minimum spec: an availability calendar, online payments, automatic confirmation emails",
    "A channel manager syncs your site with Booking, Airbnb and Expedia — no more overbooking",
    "A multilingual site plus local SEO brings international guests to you directly, past the OTAs",
  ]),
  p("**A hotel website with a booking engine costs from $3,500 and usually pays for itself within the first season:** every direct booking saves the 15–20% commission you would otherwise hand to Booking.com or Airbnb. For a 15-room hotel with a $70 average nightly rate, 60–80 monthly bookings keep an extra $700–1,200 in the business — the site recoups its cost in 4–6 months of high season."),
  p("This guide covers what professional hotel website design actually involves: what the three tiers of build cost, what belongs inside a booking engine, when you need a channel manager, and how to make sure an international guest finds your site on Google instead of your OTA listing. All figures are our studio's real price brackets — we are a Ukrainian team working with clients across Europe, which in practice means European quality at sensible rates."),

  h2("How much a hotel website costs in 2026"),
  p("Price is driven by depth of automation, not page count: a brochure site shows your rooms, a site with a booking engine sells them on its own, and a platform with a channel manager also keeps OTA inventory in sync. Three working configurations:"),
  table(
    ["Tier", "What's inside", "Price", "Timeline"],
    [
      ["**Hotel brochure site**", "Room pages, photo gallery, rates, map, enquiry form and click-to-call", "from $800", "2–3 weeks"],
      ["**Website with booking engine**", "Booking engine, availability calendar, online payments, multilingual content, admin panel", "from $3,500", "4–7 weeks"],
      ["**Platform with channel manager**", "Everything above + Booking/Airbnb sync, dynamic pricing, guest database, analytics", "from $6,000", "8–12 weeks"],
    ],
  ),
  p("The brochure tier suits a guesthouse or boutique B&B with 3–5 rooms where a manager handles bookings by phone — essentially a polished [landing page](/en/landing) with a strong gallery. From about 10 rooms you need a proper [corporate website](/en/corporate-site) with a booking engine, otherwise the front desk becomes a bottleneck and overnight enquiries burn out before morning."),
  p("Integrations move the final number: a payment gateway or Google Calendar hook-up is a typical $200–500 integration, while two-way sync with your PMS or a custom channel manager is complex work at $1,000–3,000. For a detailed cost anatomy see our guide to [custom website costs in 2026](/en/blog/custom-website-cost-uk-2026), or get an instant estimate for your exact configuration in the [calculator](/en/calculator)."),

  h2("OTAs keep 15–20% of every booking. Let's do the maths"),
  p("Booking.com's base commission for independent hotels is 15%, rising to 18–20% with visibility programmes. Airbnb takes roughly 14–16% combined from host and guest. Crucially, it is not a one-off acquisition fee: the OTA takes its cut on the same guest's second and tenth stay, because the guest's contact details never belong to you."),
  table(
    ["Criterion", "Booking.com / Airbnb", "Your own website"],
    [
      ["Commission per booking", "15–20%", "0% (card processing 1.5–3% only)"],
      ["Guest database", "Owned by the platform, emails masked", "Yours: email, phone, stay history"],
      ["Repeat bookings", "Back through the OTA — commission again", "Direct, with a return-guest promo code"],
      ["Pricing and cancellation rules", "Constrained by platform policy", "Fully under your control"],
      ["Risk of suspension", "Account can be frozen without notice", "Your site and domain, forever"],
    ],
  ),
  p("To be clear: we do not suggest deleting your OTA listings. The working strategy is **rebalancing**: Booking stays on as an advertising channel for first-time stays, while your own site captures repeat guests, corporate clients and everyone arriving from Google Maps or Instagram. Hotels we work with typically push direct bookings to 35–50% of revenue within a year — thousands of dollars in commission staying in the business."),

  h2("Inside the booking engine: the minimum spec"),
  p("A hotel website with a booking engine is not a \"Book now\" button that opens an email form. It is a system that maintains the calendar, takes payment and confirms the reservation with no staff involved. The minimum working set:"),
  h3("Room availability calendar"),
  p("Guests see only genuinely available dates per room category, priced per night. Staff can block dates manually in the admin panel — maintenance, a phone booking — and they disappear from sale instantly."),
  h3("Online payment or card guarantee"),
  p("A 20–30% deposit through a payment gateway filters out the no-shows that hurt most in high season. Connecting a gateway is a typical $200–500 integration. For the premium segment, a softer flow works too: card guarantee without an upfront charge."),
  h3("Automatic emails and reminders"),
  p("Instant confirmation, a reminder 3 days before arrival, and a post-stay email asking for a review with a promo code for the next visit. This exact sequence is what turns a one-off OTA guest into a repeat direct customer."),
  p("Also worth specifying from day one:"),
  li("Rate plans: breakfast included / room only, flexible / non-refundable — the price gap nudges guests toward prepayment"),
  li("Promo codes and seasonal pricing: weekends, holidays and hot dates managed from the admin panel"),
  li("Upsells at checkout: airport transfer, late check-out, sauna, romantic package"),
  li("Mobile-first flow: over 65% of hotel bookings start on a smartphone"),
  cta(
    "Want a quote for your booking engine?",
    "Tell us about your property — room count, seasonality, sales channels. Within a day we'll send a site configuration with an exact price and timeline.",
    "Get an estimate",
    "/en/calculator",
  ),

  h2("Channel manager: one calendar for every platform"),
  p("While a hotel sells simultaneously on its own site, Booking and Airbnb, the nightmare scenario is overbooking — two guests, one room, one night. A channel manager solves it: a single availability calendar automatically updates inventory on every platform the moment anyone books anywhere."),
  p("For properties up to 10–15 rooms it is usually cheaper to plug in an off-the-shelf service (WuBook, Bnovo, HotelFriend — $30–100/month) and integrate the website with it. Larger properties and small chains are better served by custom logic on their own platform — the \"from $6,000\" tier in our table: no per-room monthly fees, and pricing rules built around your business — dynamic weekend rates, discounts for gaps between stays, separate corporate tariffs."),

  h2("Photos, video and speed: what actually sells the room"),
  p("A guest cannot touch the room — they buy the photograph. The gallery therefore outsells any copy: 8–12 professional shots per room category, plus breakfast, terrace and the view from the window. A 30–60 second video tour lifts room-page conversion — as long as it does not wreck load times."),
  p("Speed matters twice over here: a slow site loses both guests and Google rankings. A proper build — a modern stack with a CDN, WebP/AVIF images, lazy-loaded galleries — keeps pages opening under 2 seconds even on patchy mobile signal in the mountains. We covered the design side separately in [9 design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),

  h2("Multilingual by default: winning international guests"),
  p("An international guest who cannot find an English version of your site goes straight back to Booking, where everything is familiar. For hotels in the Carpathians, Lviv, Odesa or Kyiv, an English version is not a nice-to-have but a sales channel: international guests book the longest stays and are the most comfortable with prepayment."),
  p("Multilingual sites are our studio's core specialism — the blog you are reading runs in three languages with correct hreflang, localised URLs and separate meta tags per language. For a hotel that means the Ukrainian version captures domestic tourism, the English one captures European guests, and both index in Google independently. Adding Polish or German for your particular guest mix is a content task, not a rebuild."),

  h2("Local SEO: getting found on Google Maps"),
  p("Searches like \"hotel lviv city centre\" or \"bukovel hotel with pool\" are the hottest guests you can get — city and dates already chosen. To win them directly, the website and your Google Business profile must work as a pair: each room category on its own page, Hotel schema markup with rates and ratings, fresh photos and reviews on the profile, and identical name-address-phone everywhere."),
  p("We walk through the mechanics step by step in [how to reach the Google Maps top 3](/en/blog/local-seo-google-maps-top-3). If nobody on your team has the time, the studio's [SEO service](/en/seo) starts at $300/month and, for hotels, focuses precisely on local rankings and room-category pages."),

  h2("Case study: Rich Tour — a website for the travel business"),
  p("For tour operator [Rich Tour](/en/portfolio/rich-tour) we built a site around the same scenario a hotel needs: the guest picks a destination, sees live prices and books without a phone call. Fast tour pages, a clear catalogue and a mobile-first booking flow — the same mechanics scale to hotels, guesthouses and apart-hotels."),
  p("Where to start depends on scale: a small guesthouse is well served by a [landing page](/en/landing) with a gallery and a form; a 10+ room hotel needs a [corporate website](/en/corporate-site) with a booking engine. After launch we stay involved: [support](/en/support) runs at $200/month or $40/hour, so your calendar, rates and offers are never left unattended."),
  cta(
    "Ready to take commission-free bookings?",
    "We'll show you what a booking engine looks like for your exact rooms and give you a fixed quote — free, no strings attached.",
    "Discuss your project",
    "/en/calculator",
  ),
];

const doc = {
  _id: "ltAug2026-sait-hotelyu-bronyuvannia",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 11,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-hotelyu-z-bronyuvannyam" },
    ru: { _type: "slug", current: "sayt-otelya-s-bronirovaniem" },
    en: { _type: "slug", current: "hotel-website-with-booking" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для готелю з онлайн-бронюванням: як приймати гостей без комісій Booking",
    ru: "Сайт отеля с онлайн-бронированием: как принимать гостей без комиссий Booking",
    en: "A Hotel Website with a Booking Engine: Take Guests Without OTA Commissions",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для готелю з бронюванням: ціни 2026",
    ru: "Создание сайта отеля с бронированием: цены 2026",
    en: "Hotel Website with Booking Engine: Cost 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт готелю з бронюванням від $3 500 ✔️ Календар зайнятості, оплата, channel manager ✔️ Ціни й терміни 2026 ➡ Приймайте гостей без комісій Booking",
    ru: "➤ Создание сайта отеля с бронированием от $3 500 ✔️ Календарь занятости, оплата, channel manager ✔️ Цены и сроки 2026 ➡ Гости без комиссий Booking",
    en: "➤ Hotel website with booking engine from $3,500 ✔️ Availability calendar, payments, channel manager ✔️ Real 2026 prices ➡ Take direct bookings, skip OTA fees",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Готелі та туризм",
    ru: "Отели и туризм",
    en: "Hotels & Travel",
  },
  lede: {
    _type: "localizedString",
    uk: "Скільки коштує сайт готелю з модулем бронювання, як влаштований календар зайнятості та channel manager — і скільки комісій Booking ви припините платити.",
    ru: "Сколько стоит сайт отеля с модулем бронирования, как устроены календарь занятости и channel manager — и сколько комиссий Booking вы перестанете платить.",
    en: "What a hotel website with a booking engine costs, how availability calendars and channel managers work — and how much OTA commission you stop paying.",
  },
  tags: ["готель", "бронювання", "туризм", "channel manager"],
  relatedPostSlugs: ["vartist-rozrobky-saytu-2026", "9-dyzain-pryiomiv-dlia-konversii", "lokalne-seo-top-3-google-maps"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для готелю з онлайн-бронюванням?",
        ru: "Сколько стоит создание сайта отеля с онлайн-бронированием?",
        en: "How much does a hotel website with a booking engine cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Сайт-візитка готелю коштує від $800, сайт з повноцінним модулем бронювання — від $3 500, платформа з channel manager і синхронізацією з Booking/Airbnb — від $6 000. На ціну впливають кількість категорій номерів, платіжні інтеграції та мови сайту.",
        ru: "Сайт-визитка отеля стоит от $800, сайт с полноценным модулем бронирования — от $3 500, платформа с channel manager и синхронизацией с Booking/Airbnb — от $6 000. На цену влияют количество категорий номеров, платёжные интеграции и языки сайта.",
        en: "A hotel brochure site starts at $800, a website with a full booking engine at $3,500, and a platform with a channel manager synced to Booking/Airbnb at $6,000. Room category count, payment integrations and the number of languages drive the final price.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як створити сайт бронювання готелю — з чого почати?",
        ru: "Как создать сайт бронирования отелей — с чего начать?",
        en: "How do I create a hotel booking website — where do I start?",
      },
      answer: {
        _type: "localizedText",
        uk: "Почніть з переліку категорій номерів, тарифів і правил скасування — це основа модуля бронювання. Далі оберіть платіжний шлюз і вирішіть, чи потрібна синхронізація з Booking. З цими вводними студія формує точну смету і запускає сайт за 4–7 тижнів.",
        ru: "Начните со списка категорий номеров, тарифов и правил отмены — это фундамент модуля бронирования. Затем выберите платёжный шлюз и решите, нужна ли синхронизация с Booking. С этими вводными студия формирует точную смету и запускает сайт за 4–7 недель.",
        en: "Start by listing your room categories, rate plans and cancellation rules — that is the foundation of the booking engine. Then pick a payment gateway and decide whether you need OTA sync. With those inputs a studio can give you a fixed quote and launch in 4–7 weeks.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна повністю відмовитися від Booking.com?",
        ru: "Можно ли полностью отказаться от Booking.com?",
        en: "Can I drop Booking.com completely?",
      },
      answer: {
        _type: "localizedText",
        uk: "Можна, але зазвичай невигідно: агрегатор добре приводить перших гостей. Робоча схема — тримати Booking як рекламний канал, а повторні броні, корпоративних клієнтів і трафік з Google переводити на власний сайт. Так частка прямих бронювань виростає до 35–50% без втрати завантаження.",
        ru: "Можно, но обычно невыгодно: агрегатор хорошо приводит первых гостей. Рабочая схема — держать Booking как рекламный канал, а повторные брони, корпоративных клиентов и трафик из Google переводить на свой сайт. Так доля прямых бронирований вырастает до 35–50% без потери загрузки.",
        en: "You can, but it rarely makes sense: OTAs are good at delivering first-time guests. The working model is to keep Booking as an advertising channel while moving repeat guests, corporate clients and Google traffic to your own site — pushing direct bookings to 35–50% without losing occupancy.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що таке channel manager і чи потрібен він малому готелю?",
        ru: "Что такое channel manager и нужен ли он маленькому отелю?",
        en: "What is a channel manager and does a small hotel need one?",
      },
      answer: {
        _type: "localizedText",
        uk: "Channel manager — це єдиний календар зайнятості, який синхронізує ваш сайт з Booking, Airbnb та іншими майданчиками і виключає овербукінг. Готелю до 10–15 номерів вистачить готового сервісу за $30–100/міс, інтегрованого з сайтом; більшим об'єктам вигідніша кастомна логіка на власній платформі.",
        ru: "Channel manager — это единый календарь занятости, который синхронизирует ваш сайт с Booking, Airbnb и другими площадками и исключает овербукинг. Отелю до 10–15 номеров хватит готового сервиса за $30–100/мес, интегрированного с сайтом; крупным объектам выгоднее кастомная логика на своей платформе.",
        en: "A channel manager is a single availability calendar that syncs your website with Booking, Airbnb and other platforms, eliminating overbooking. Up to 10–15 rooms an off-the-shelf service at $30–100/month integrated with your site is enough; larger properties benefit from custom logic on their own platform.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка сайту для готелю?",
        ru: "Сколько времени занимает разработка сайта для отеля?",
        en: "How long does hotel website development take?",
      },
      answer: {
        _type: "localizedText",
        uk: "Сайт-візитка — 2–3 тижні, сайт з модулем бронювання — 4–7 тижнів, платформа з channel manager — 8–12 тижнів. Найбільше часу зазвичай іде не на код, а на контент: фото номерів, тексти трьома мовами і тарифну сітку краще готувати паралельно з розробкою.",
        ru: "Сайт-визитка — 2–3 недели, сайт с модулем бронирования — 4–7 недель, платформа с channel manager — 8–12 недель. Больше всего времени обычно уходит не на код, а на контент: фото номеров, тексты на трёх языках и тарифную сетку лучше готовить параллельно с разработкой.",
        en: "A brochure site takes 2–3 weeks, a site with a booking engine 4–7 weeks, and a platform with a channel manager 8–12 weeks. The slowest part is usually content, not code: room photography, copy in each language and the rate grid are best prepared in parallel with development.",
      } },
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
