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
// UK body
// ---------------------------------------------------------------------------
const bodyUk = [
  tldr("Коротко", [
    "Сайт для вантажоперевезень окупається тоді, коли замінює холодні дзвінки вхідними заявками: форма розрахунку вартості конвертує 3–7% відвідувачів у ліди.",
    "B2B-логістика та B2C-переїзди — це два різні сайти: перевізнику фур потрібні географія, автопарк і документи, квартирним переїздам — калькулятор і зворотний дзвінок за хвилини.",
    "Калькулятор вартості перевезення — головний лід-магніт: він збирає контакт клієнта до того, як той подзвонить конкуренту.",
    "Трекінг вантажу «де моя фура» реалізується від простого статусу в SMS до інтеграції з GPS-моніторингом — різниця в бюджеті у рази.",
    "Ціни студії: сайт-візитка перевізника від $800, корпоративний сайт з калькулятором від $3 500, платформа з кабінетами клієнтів від $6 000.",
  ]),
  p("Сайт для вантажоперевезень — це не «візитка, бо в усіх є», а канал вхідних заявок: сторінки під маршрути, калькулятор вартості, блоки довіри з автопарком і документами та форма, яка приводить клієнта раніше, ніж він додзвониться до конкурента. Такий сайт коштує від $800 за візитку перевізника і від $3 500 за корпоративний сайт з калькулятором."),
  p("Логістика — одна з небагатьох ніш, де більшість компаній досі живе з холодних дзвінків, бірж на кшталт Lardi-Trans і сарафанного радіо. Це працює, але має стелю: менеджер робить 60–80 дзвінків на день, конверсія — одиниці відсотків, а клієнт, якого «продзвонили», не лояльний. Вхідна заявка з сайту — протилежність: людина сама шукала «вантажні перевезення Київ Варшава», сама порахувала ціну і сама залишила номер."),
  p("У цій статті розберемо, чим сайт для логістичної компанії відрізняється від сайту для квартирних переїздів, які блоки реально приводять заявки, що робити з трекінгом вантажу і скільки все це коштує — з конкретними вилками цін."),

  h2("B2B-логістика і B2C-переїзди — це два різні сайти"),
  p("Перша помилка перевізників — робити «сайт про все»: міжнародні фури, збірні вантажі й квартирні переїзди на одній сторінці. Аудиторії не перетинаються: логіст виробничої компанії шукає підрядника з CMR-страхуванням і власним автопарком, а сім'я, що переїжджає, — вантажників і ціну «за все» сьогодні ввечері."),
  h3("Що шукає B2B-клієнт"),
  li("**Географію і маршрути:** якими напрямками возите, чи є регулярні рейси, які терміни доставки."),
  li("**Автопарк:** скільки машин, тоннаж, типи кузовів — тент, рефрижератор, зерновоз. З фото, не зі стоку."),
  li("**Документи:** ліцензія, CMR-страхування, договір, робота з ПДВ. B2B-клієнт підписує договір, а не «домовляється»."),
  li("**Швидку відповідь на запит:** форма «прорахувати перевезення» з полями маршруту, ваги й типу вантажу."),
  h3("Що шукає B2C-клієнт"),
  li("**Ціну одразу:** калькулятор або хоча б вилку «переїзд 2-кімнатної — від N грн»."),
  li("**Швидкість реакції:** кнопка зворотного дзвінка, месенджери, обіцянка «передзвонимо за 5 хвилин»."),
  li("**Простоту:** мінімум полів, зрозумілі пакети «квартира / офіс / міжмісто»."),
  table(
    ["Блок сайту", "B2B-логістика", "B2C-переїзди"],
    [
      ["Головний екран", "Маршрути, тоннаж, «прорахунок за 30 хв»", "Калькулятор і телефон у першому екрані"],
      ["Довіра", "Автопарк, CMR, ЄДРПОУ, договір", "Відгуки, фото бригад, «не беремо передоплату»"],
      ["Форма заявки", "Маршрут, вага, тип вантажу, компанія", "2–3 поля + зворотний дзвінок"],
      ["Контент", "Сторінки під напрямки й типи вантажів", "Пакети послуг з фіксованими цінами"],
      ["Циклічність", "Довгі договори, тендери", "Разові замовлення «на сьогодні»"],
    ]
  ),
  p("Якщо компанія працює в обох сегментах, правильне рішення — розділити їх на рівні структури: окремі посадкові сторінки, окремі форми, окрема реклама. Це дешевше, ніж здається: на одному [корпоративному сайті](/corporate-site) обидва напрями живуть як окремі розділи зі своїми воронками."),

  h2("Калькулятор вартості — головний лід-магніт перевізника"),
  p("У логістиці клієнт завжди порівнює 3–5 підрядників, і виграє той, хто першим назвав адекватну ціну. Калькулятор на сайті робить це автоматично: людина обирає маршрут, тип авто й вагу — і бачить орієнтовну вартість або залишає контакт для точного прорахунку."),
  p("Важливий нюанс: калькулятор не зобов'язаний рахувати ідеально точно. Його завдання — **зібрати контакт в обмін на цифру**. Робочі схеми:"),
  num("**Миттєва вилка:** формула «км × тариф за тип авто» показує діапазон одразу, а точну ціну менеджер підтверджує дзвінком."),
  num("**Ціна за контакт:** форма рахує в фоні, але результат надсилається на телефон або email — так ви отримуєте лід навіть від тих, хто «просто цікавився»."),
  num("**Заявка на прорахунок:** для складних вантажів чесніше поле «опишіть вантаж» і обіцянка прорахунку за 30 хвилин у робочий час."),
  p("За нашим досвідом форми з проміжним результатом конвертують у 2–3 рази краще за просту «залиште заявку». Подивитися, як це відчувається з боку клієнта, можна на нашому власному [калькуляторі вартості сайту](/calculator) — механіка та сама: питання, проміжна цифра, контакт."),
  cta(
    "Хочете калькулятор перевезень на своєму сайті?",
    "Порахуйте орієнтовну вартість сайту з калькулятором за 2 хвилини — без дзвінків і менеджерів.",
    "Розрахувати вартість",
    "/calculator"
  ),

  h2("Трекінг вантажу: що реально, а що коштує як платформа"),
  p("«Хочемо, щоб клієнт бачив, де його вантаж» — найчастіше побажання логістів. Тут важливо розділяти рівні: вони відрізняються за бюджетом у десятки разів."),
  li("**Статуси вручну (входить у корпоративний сайт):** менеджер змінює статус замовлення — «прийнято, в дорозі, на митниці, доставлено», клієнт бачить його за номером замовлення або отримує SMS/email. Просто, надійно, закриває 80% питань «де фура?»."),
  li("**Інтеграція з GPS-моніторингом ($1 000–3 000):** якщо автопарк вже під Wialon чи подібною системою, сайт може показувати позицію машини на карті в кабінеті клієнта. Красиво і статусно, але потребує API-доступу й обробки винятків."),
  li("**Повноцінна TMS-платформа (від $6 000):** кабінети клієнтів і водіїв, документообіг, історія перевезень, інтеграція з 1С/BAS. Це вже не сайт, а внутрішній продукт — і починати з нього не варто, поки немає потоку заявок."),
  p("Порада: на старті достатньо ручних статусів. Реальні заявки приводить не трекінг, а швидкий прорахунок і довіра. Трекінг — аргумент для утримання B2B-клієнтів на договорі, і його можна докрутити другим етапом."),

  h2("Блоки довіри: автопарк, страхування, реквізити"),
  p("Вантаж — це гроші клієнта, які їдуть у чужій машині за сотні кілометрів. Тому сайт перевізника продає не «послугу», а впевненість, що вантаж доїде. Що має бути на сайті обов'язково:"),
  li("**Автопарк з реальними фото:** номерні знаки можна заблюрити, але стокові фури американських траків видно одразу — і вони вбивають довіру."),
  li("**Страхування і документи:** CMR-страховка, ліцензія, свідоцтво платника ПДВ. Не сканами на пів сторінки, а окремим блоком «працюємо офіційно» з переліком."),
  li("**Реквізити компанії:** ЄДРПОУ, юридична назва, фактична адреса. Це перевіряють у YouControl перед першим договором — дайте знайти себе за 10 секунд."),
  li("**Цифри:** років на ринку, машин у парку, рейсів на місяць, напрямків. Конкретика замість «динамічна компанія з індивідуальним підходом»."),
  li("**Відгуки з прив'язкою:** назва компанії клієнта або посилання на Google-профіль. Анонімні «Дякую, все сподобалось! Олена» не працюють у B2B."),

  h2("SEO за маршрутами: як збирати запити «вантажні перевезення + місто»"),
  p("Найцінніший органічний трафік у ніші — маршрутні й локальні запити: «вантажні перевезення Львів», «перевезення Київ Варшава», «доставка збірних вантажів Одеса». Конкуренція за них нижча, ніж за загальне «вантажоперевезення», а намір — гарячіший."),
  p("Робоча схема — окрема посадкова сторінка під кожен важливий маршрут чи місто: свій заголовок, терміни, тариф, типи авто на напрямку, форма прорахунку. 10–20 таких сторінок закривають семантику, до якої біржі й агрегатори не дотягуються локально. Як не перетворити це на дорвеї і зробити сторінки корисними — розбирали в статті про [локальне SEO і топ-3 Google Maps](/blog/lokalne-seo-top-3-google-maps)."),
  p("Другий шар — Google Business Profile з категорією «Вантажні перевезення», зібраними відгуками і фото парку: для запитів «перевезення + місто» карта показується вище за органіку. Систематичне [SEO-просування](/seo) для перевізника коштує від $300/міс і на горизонті 4–6 місяців дає заявки дешевші за будь-яку рекламу — детальніше про механіку й терміни ми писали в [гайді з цін на просування](/blog/prosuvannia-saitu-tsina-2026)."),

  h2("Скільки коштує сайт для вантажоперевезень"),
  p("Вилки нижче — реальні ціни нашої студії, а не «від $100 на фрилансі». Що входить у кожен формат:"),
  table(
    ["Формат", "Ціна", "Що входить", "Кому підходить"],
    [
      ["Сайт-візитка перевізника", "від $800", "1–3 екрани: послуги, автопарк, документи, форма заявки, месенджери", "Приватний перевізник, 1–5 машин, заявки з реклами"],
      ["Корпоративний сайт", "від $3 500", "Сторінки під маршрути й послуги, калькулятор, статуси замовлень, SEO-структура, адмінка", "Компанія 5–30 машин, B2B і B2C, план рости в органіці"],
      ["Платформа з кабінетами", "від $6 000", "Кабінети клієнтів, трекінг, документообіг, інтеграції з CRM/1С/GPS", "Оператор логістики зі сталим потоком замовлень"],
    ]
  ),
  p("До цього варто закласти: типова інтеграція (CRM, SMS-шлюз, платіжка) — $200–500, складні інтеграції на кшталт GPS-моніторингу чи обміну з 1С — $1 000–3 000, підтримка — $200/міс або $40/год. Із чого складається ціна і на чому можна заощадити без шкоди — розбирали в статті [скільки коштує сайт у 2026](/blog/vartist-rozrobky-saytu-2026)."),
  p("Якщо бюджет обмежений, правильна послідовність така: спочатку [лендінг](/landing) з калькулятором під один сегмент — він починає приводити заявки вже з реклами. Потім, коли економіка зійшлася, — корпоративний сайт із маршрутними сторінками під SEO. Платформа з кабінетами — третій крок, коли є кого в ці кабінети пускати."),

  h2("Приклади з практики"),
  p("Чесно: кейсу саме логістичної компанії в нашому портфоліо поки немає, і вигадувати його ми не будемо. Але механіки, на яких тримається сайт перевізника, ми збирали неодноразово в суміжних нішах:"),
  li("[Raul Avto](/portfolio/raul-avto) — автомобільна тематика: каталог зі складними фільтрами і структура під комерційні запити. Той самий підхід працює для сторінок маршрутів і типів вантажів."),
  li("[Right Cars](/portfolio/right-cars) — прокат авто: форми бронювання з розрахунком вартості за параметрами. Це один в один логіка калькулятора перевезення."),
  li("[Rich Tour](/portfolio/rich-tour) — тури й напрямки: багато посадкових сторінок під різні маршрути з єдиною формою заявки — схема, яку ми описали в розділі про SEO."),
  p("Схожа механіка «сегмент — сторінка — форма» детально розібрана і в нашій статті про [сайт для автосервісу](/blog/sait-dlia-avtoservisu): ніша інша, а логіка вхідних заявок та сама."),
  cta(
    "Обговорити сайт для вашої логістики?",
    "Розкажіть про напрямки й автопарк — запропонуємо структуру, формат і точну ціну. Безкоштовно і без зобов'язань.",
    "Отримати прорахунок",
    "/calculator"
  ),
];

// ---------------------------------------------------------------------------
// RU body
// ---------------------------------------------------------------------------
const bodyRu = [
  tldr("Коротко", [
    "Создание сайта грузоперевозок окупается, когда он заменяет холодные звонки входящими заявками: форма расчёта стоимости конвертирует 3–7% посетителей в лиды.",
    "B2B-логистика и B2C-переезды — два разных сайта: перевозчику фур нужны география, автопарк и документы, квартирным переездам — калькулятор и обратный звонок за минуты.",
    "Калькулятор стоимости перевозки — главный лид-магнит: он собирает контакт клиента до того, как тот дозвонится конкуренту.",
    "Трекинг груза бывает от ручных статусов в SMS до интеграции с GPS-мониторингом — разница в бюджете в десятки раз.",
    "Цены студии: грузоперевозки сайт-визитка от $800, корпоративный сайт с калькулятором от $3 500, платформа с кабинетами от $6 000.",
  ]),
  p("Создание сайта грузоперевозок — это не «визитка для галочки», а канал входящих заявок: страницы под маршруты, калькулятор стоимости, блоки доверия с автопарком и документами и форма, которая приводит клиента раньше, чем он дозвонится до конкурента. Стоит такой сайт от $800 за визитку перевозчика и от $3 500 за корпоративный сайт с калькулятором."),
  p("Логистика — одна из немногих ниш, где большинство компаний до сих пор живёт на холодных звонках, биржах и сарафане. Это работает, но упирается в потолок: менеджер делает 60–80 звонков в день при конверсии в единицы процентов, и клиент, которого «прозвонили», не лоялен. Входящая заявка с сайта устроена наоборот: человек сам искал перевозчика, сам посчитал цену и сам оставил номер."),
  p("Разберём, чем создание сайта для грузоперевозки B2B-формата отличается от сайта квартирных переездов, какие блоки реально приносят заявки, что делать с трекингом груза и сколько всё это стоит — с конкретными вилками цен."),

  h2("B2B-логистика и B2C-переезды — два разных сайта"),
  p("Первая ошибка перевозчиков — делать «сайт обо всём»: международные фуры, сборные грузы и квартирные переезды на одной странице. Аудитории не пересекаются: логист производственной компании ищет подрядчика с CMR-страховкой и собственным автопарком, а семья при переезде — грузчиков и цену «за всё» сегодня вечером."),
  h3("Что ищет B2B-клиент"),
  li("**Географию и маршруты:** какими направлениями возите, есть ли регулярные рейсы, какие сроки."),
  li("**Автопарк:** сколько машин, тоннаж, типы кузовов — тент, рефрижератор, зерновоз. С фото, не со стока."),
  li("**Документы:** лицензия, CMR-страхование, договор, работа с НДС. B2B подписывает договор, а не «договаривается на словах»."),
  li("**Быстрый ответ на запрос:** форма «просчитать перевозку» с полями маршрута, веса и типа груза."),
  h3("Что ищет B2C-клиент"),
  li("**Цену сразу:** калькулятор или хотя бы вилка «переезд двухкомнатной — от N»."),
  li("**Скорость реакции:** кнопка обратного звонка, мессенджеры, обещание «перезвоним за 5 минут»."),
  li("**Простоту:** минимум полей, понятные пакеты «квартира / офис / межгород»."),
  table(
    ["Блок сайта", "B2B-логистика", "B2C-переезды"],
    [
      ["Главный экран", "Маршруты, тоннаж, «просчёт за 30 мин»", "Калькулятор и телефон на первом экране"],
      ["Доверие", "Автопарк, CMR, ЕДРПОУ, договор", "Отзывы, фото бригад, «без предоплаты»"],
      ["Форма заявки", "Маршрут, вес, тип груза, компания", "2–3 поля + обратный звонок"],
      ["Контент", "Страницы под направления и типы грузов", "Пакеты услуг с фиксированными ценами"],
      ["Цикл сделки", "Долгие договоры, тендеры", "Разовые заказы «на сегодня»"],
    ]
  ),
  p("Если компания работает в обоих сегментах, правильное решение — развести их на уровне структуры: отдельные посадочные, отдельные формы, отдельная реклама. На одном [корпоративном сайте](/ru/corporate-site) оба направления живут как самостоятельные разделы со своими воронками — это дешевле, чем два сайта."),

  h2("Калькулятор стоимости — главный лид-магнит перевозчика"),
  p("В логистике клиент всегда сравнивает 3–5 подрядчиков, и выигрывает тот, кто первым назвал адекватную цену. Калькулятор на сайте делает это автоматически: человек выбирает маршрут, тип машины и вес — и видит ориентировочную стоимость или оставляет контакт для точного просчёта."),
  p("Важный нюанс: калькулятор не обязан считать идеально точно. Его задача — **собрать контакт в обмен на цифру**. Рабочие схемы:"),
  num("**Мгновенная вилка:** формула «км × тариф за тип машины» показывает диапазон сразу, а точную цену менеджер подтверждает звонком."),
  num("**Цена за контакт:** форма считает в фоне, но результат уходит на телефон или email — так вы получаете лид даже от тех, кто «просто прицениваются»."),
  num("**Заявка на просчёт:** для сложных грузов честнее поле «опишите груз» и обещание просчёта за 30 минут в рабочее время."),
  p("По нашему опыту формы с промежуточным результатом конвертируют в 2–3 раза лучше простого «оставьте заявку». Почувствовать механику со стороны клиента можно на нашем собственном [калькуляторе стоимости сайта](/ru/calculator): вопросы, промежуточная цифра, контакт."),
  cta(
    "Хотите калькулятор перевозок на своём сайте?",
    "Посчитайте ориентировочную стоимость сайта с калькулятором за 2 минуты — без звонков и менеджеров.",
    "Рассчитать стоимость",
    "/ru/calculator"
  ),

  h2("Трекинг груза: что реально, а что стоит как платформа"),
  p("«Хотим, чтобы клиент видел, где его груз» — самое частое пожелание логистов. Здесь важно разделять уровни: по бюджету они отличаются в десятки раз."),
  li("**Статусы вручную (входит в корпоративный сайт):** менеджер меняет статус заказа — «принят, в пути, на таможне, доставлен», клиент видит его по номеру заказа или получает SMS/email. Просто, надёжно, закрывает 80% вопросов «где фура?»."),
  li("**Интеграция с GPS-мониторингом ($1 000–3 000):** если автопарк уже под Wialon или похожей системой, сайт может показывать позицию машины на карте в кабинете клиента. Статусно, но требует API-доступа и обработки исключений."),
  li("**Полноценная TMS-платформа (от $6 000):** кабинеты клиентов и водителей, документооборот, история перевозок, интеграции с учётной системой. Это уже внутренний продукт, и начинать с него не стоит, пока нет потока заявок."),
  p("Совет: на старте достаточно ручных статусов. Заявки приносит не трекинг, а быстрый просчёт и доверие. Трекинг — аргумент удержания B2B-клиентов на договоре, его можно докрутить вторым этапом."),

  h2("Блоки доверия: автопарк, страховка, реквизиты"),
  p("Груз — это деньги клиента, которые едут в чужой машине за сотни километров. Поэтому сайт перевозчика продаёт не «услугу», а уверенность, что груз доедет. Что должно быть обязательно:"),
  li("**Автопарк с реальными фото:** номера можно заблюрить, но стоковые американские траки видно сразу — и они убивают доверие."),
  li("**Страховка и документы:** CMR-страхование, лицензия, свидетельство плательщика НДС — отдельным блоком «работаем официально», а не сканами в подвале."),
  li("**Реквизиты компании:** код ЕДРПОУ, юрлицо, фактический адрес. Перед первым договором вас проверят в реестрах — дайте найти себя за 10 секунд."),
  li("**Цифры:** лет на рынке, машин в парке, рейсов в месяц, направлений. Конкретика вместо «динамично развивающейся компании»."),
  li("**Отзывы с привязкой:** название компании клиента или ссылка на Google-профиль. Анонимные «Спасибо, всё понравилось!» в B2B не работают."),

  h2("SEO по маршрутам: как собирать запросы «грузоперевозки + город»"),
  p("Самый ценный органический трафик в нише — маршрутные и локальные запросы: «грузоперевозки Киев», «перевозка Киев Варшава», «доставка сборных грузов Одесса». Конкуренция по ним ниже, чем по общему «грузоперевозки», а намерение — горячее."),
  p("Рабочая схема — отдельная посадочная страница под каждый важный маршрут или город: свой заголовок, сроки, тариф, типы машин на направлении, форма просчёта. 10–20 таких страниц закрывают семантику, до которой биржи и агрегаторы локально не дотягиваются. Как не превратить это в дорвеи — разбирали в статье про [локальное SEO и топ-3 Google Maps](/ru/blog/lokalnoe-seo-top-3-google-maps)."),
  p("Второй слой — Google Business Profile с категорией «Грузоперевозки», отзывами и фото парка: по запросам «перевозки + город» карта показывается выше органики. Системное [SEO-продвижение](/ru/seo) для перевозчика стоит от $300/мес и на горизонте 4–6 месяцев даёт заявки дешевле любой рекламы — о механике и сроках писали в [гайде по ценам на продвижение](/ru/blog/prodvizhenie-sayta-cena-2026)."),

  h2("Сколько стоит создание сайта грузоперевозок"),
  p("Вилки ниже — реальные цены нашей студии, а не «от $100 на фрилансе». Что входит в каждый формат:"),
  table(
    ["Формат", "Цена", "Что входит", "Кому подходит"],
    [
      ["Сайт-визитка перевозчика", "от $800", "1–3 экрана: услуги, автопарк, документы, форма заявки, мессенджеры", "Частный перевозчик, 1–5 машин, заявки с рекламы"],
      ["Корпоративный сайт", "от $3 500", "Страницы под маршруты и услуги, калькулятор, статусы заказов, SEO-структура, админка", "Компания 5–30 машин, B2B и B2C, планы расти в органике"],
      ["Платформа с кабинетами", "от $6 000", "Кабинеты клиентов, трекинг, документооборот, интеграции с CRM/учётом/GPS", "Логистический оператор с постоянным потоком заказов"],
    ]
  ),
  p("Сверху стоит заложить: типовая интеграция (CRM, SMS-шлюз, платёжка) — $200–500, сложные интеграции вроде GPS-мониторинга или обмена с учётной системой — $1 000–3 000, поддержка — $200/мес или $40/час. Из чего складывается цена и где можно сэкономить без вреда — в статье [сколько стоит сайт в 2026](/ru/blog/skolko-stoit-sayt-2026)."),
  p("Если бюджет ограничен, правильная последовательность такая: сначала [лендинг](/ru/landing) с калькулятором под один сегмент — он приводит заявки уже с рекламы. Потом, когда экономика сошлась, — корпоративный сайт с маршрутными страницами под SEO. Платформа с кабинетами — третий шаг, когда есть кого в эти кабинеты пускать."),

  h2("Примеры из практики"),
  p("Честно: кейса именно логистической компании в нашем портфолио пока нет, и придумывать его мы не будем. Но механики, на которых держится сайт перевозчика, мы собирали не раз в смежных нишах:"),
  li("[Raul Avto](/ru/portfolio/raul-avto) — автомобильная тематика: каталог со сложными фильтрами и структура под коммерческие запросы. Тот же подход работает для страниц маршрутов и типов грузов."),
  li("[Right Cars](/ru/portfolio/right-cars) — прокат авто: формы бронирования с расчётом стоимости по параметрам. Это один в один логика калькулятора перевозки."),
  li("[Rich Tour](/ru/portfolio/rich-tour) — туры и направления: много посадочных под разные маршруты с единой формой заявки — схема из раздела про SEO."),
  p("Похожая механика «сегмент — страница — форма» подробно разобрана и в статье про [сайт для автосервиса](/ru/blog/sayt-dlya-avtoservisa): ниша другая, а логика входящих заявок та же."),
  cta(
    "Обсудить сайт для вашей логистики?",
    "Расскажите про направления и автопарк — предложим структуру, формат и точную цену. Бесплатно и без обязательств.",
    "Получить просчёт",
    "/ru/calculator"
  ),
];

// ---------------------------------------------------------------------------
// EN body
// ---------------------------------------------------------------------------
const bodyEn = [
  tldr("Key takeaways", [
    "A logistics website pays for itself when it replaces cold calling with inbound enquiries: a quote-request form converts 3–7% of visitors into leads.",
    "B2B freight and B2C removals are two different websites: hauliers need routes, fleet and paperwork on show; removals customers need an instant price and a call-back within minutes.",
    "A cost calculator is the strongest lead magnet in the niche — it captures the enquiry before the customer rings your competitor.",
    "Shipment tracking ranges from manual status updates by SMS to full GPS integration — the budgets differ by an order of magnitude.",
    "Studio pricing: a haulier's one-page site from $800, a corporate freight company website with a calculator from $3,500, a client-portal platform from $6,000.",
  ]),
  p("Logistics website design done right is not a brochure — it is an inbound lead channel: route landing pages, a cost calculator, trust blocks showing your fleet and insurance, and a form that captures the customer before they phone a competitor. A haulier's one-pager starts at $800; a corporate freight company website with a calculator starts at $3,500."),
  p("Logistics is one of the few industries still run on cold calls, load boards and word of mouth. That works — up to a ceiling: a salesperson makes 60–80 calls a day at single-digit conversion, and a customer who was cold-called owes you no loyalty. An inbound enquiry is the opposite: the customer searched for the route themselves, priced the job themselves and left their number themselves."),
  p("Below we break down how a B2B freight site differs from a moving company website, which blocks actually generate enquiries, what shipment tracking realistically costs, and what the budget looks like. We are a Ukrainian studio working with clients across Europe — European quality at sensible rates, which matters in a margin-driven industry like freight."),

  h2("B2B freight and B2C removals are two different websites"),
  p("The most common mistake is an everything-site: international haulage, groupage and house removals on one page. The audiences never overlap: a manufacturer's logistics manager is vetting a contractor with CMR insurance and its own fleet, while a family moving house wants two loaders and an all-in price for tonight."),
  h3("What a B2B client looks for"),
  li("**Routes and geography:** which corridors you run, whether departures are regular, typical transit times."),
  li("**The fleet:** how many vehicles, tonnage, body types — curtainsider, reefer, tipper. With real photos, not stock."),
  li("**Paperwork:** operator licence, CMR insurance, contracts, VAT invoicing. B2B clients sign contracts, they do not take your word for it."),
  li("**A fast quote:** a request form with route, weight and cargo type fields — and a promised response time."),
  h3("What a B2C client looks for"),
  li("**A price up front:** a calculator, or at least a range — “two-bedroom move from $X”."),
  li("**Speed of response:** a call-back button, messengers, a “we ring back in 5 minutes” promise."),
  li("**Simplicity:** two or three fields and clear packages — flat, office, long-distance."),
  table(
    ["Website block", "B2B freight", "B2C removals"],
    [
      ["Hero section", "Routes, tonnage, “quote in 30 min”", "Calculator and phone number above the fold"],
      ["Trust", "Fleet, CMR insurance, company registration", "Reviews, crew photos, “no prepayment”"],
      ["Enquiry form", "Route, weight, cargo type, company", "2–3 fields plus a call-back"],
      ["Content", "Pages per route and cargo type", "Fixed-price service packages"],
      ["Deal cycle", "Long contracts and tenders", "One-off jobs, often same-day"],
    ]
  ),
  p("If you serve both segments, split them at the structure level — separate landing pages, separate forms, separate ad campaigns. On a single [corporate website](/en/corporate-site) the two lines live as independent sections with their own funnels, which is far cheaper than running two sites."),

  h2("The cost calculator is your strongest lead magnet"),
  p("A freight customer always compares three to five contractors, and the one who names a sane price first usually wins. A calculator does that automatically: the visitor picks a route, vehicle type and weight — and either sees an estimate or leaves a contact for an exact quote."),
  p("The nuance: the calculator does not have to be perfectly accurate. Its job is to **trade a number for a contact**. Three patterns that work:"),
  num("**Instant range:** a distance-times-rate formula shows a bracket immediately; a manager confirms the exact price by phone."),
  num("**Price for a contact:** the form calculates in the background, but the result is sent by SMS or email — you capture even the window-shoppers."),
  num("**Quote request:** for awkward cargo it is more honest to offer a “describe your load” field with a 30-minute response promise in working hours."),
  p("In our experience, forms with an intermediate result convert two to three times better than a bare “leave a request”. You can feel the mechanic from the customer's side on our own [website cost calculator](/en/calculator) — same idea: questions, an interim figure, a contact."),
  cta(
    "Want a freight calculator on your website?",
    "Get a ballpark price for a website with a calculator in 2 minutes — no calls, no sales managers.",
    "Calculate the cost",
    "/en/calculator"
  ),

  h2("Shipment tracking: what is realistic and what costs like a platform"),
  p("“We want clients to see where their cargo is” is the most common request we hear from logistics owners. The key is to separate the tiers — their budgets differ by an order of magnitude."),
  li("**Manual statuses (included in a corporate site):** a manager updates the order status — accepted, in transit, at customs, delivered — and the client sees it by order number or gets an SMS/email. Simple, reliable, and answers 80% of “where is my truck?” calls."),
  li("**GPS integration ($1,000–3,000):** if your fleet already runs on a telematics system, the site can show the vehicle on a map inside a client account. Impressive, but it needs API access and proper handling of edge cases."),
  li("**A full TMS-style platform (from $6,000):** client and driver accounts, document flow, shipment history, accounting integrations. That is an internal product, not a website — and the wrong place to start before you have a steady flow of enquiries."),
  p("Our advice: start with manual statuses. Enquiries come from fast quoting and trust, not from tracking. Tracking is a retention argument for contracted B2B clients — add it as phase two."),

  h2("Trust blocks: fleet, insurance, company details"),
  p("Cargo is the client's money travelling in someone else's vehicle hundreds of miles away. So a freight company website sells confidence, not a service. The non-negotiables:"),
  li("**Fleet with real photos:** blur the plates if you must, but stock photos of American trucks are spotted instantly — and they kill trust."),
  li("**Insurance and paperwork:** CMR cover, operator licence, VAT registration — as a dedicated “fully compliant” block, not scans buried in the footer."),
  li("**Company details:** registration number, legal name, physical address. B2B clients check the registers before the first contract — let them find you in ten seconds."),
  li("**Numbers:** years in business, vehicles in the fleet, loads per month, corridors served. Specifics instead of “a dynamic company with an individual approach”."),
  li("**Attributed reviews:** the client company's name or a link to a Google profile. Anonymous praise does nothing in B2B."),

  h2("Route SEO: ranking for “freight + city” searches"),
  p("The most valuable organic traffic in the niche comes from route and local queries: “freight company Manchester”, “removals London to Leeds”, “groupage to Poland”. Competition is lower than for the head term, and the intent is hotter."),
  p("The working pattern is a dedicated landing page per key route or city: its own headline, transit times, rates, vehicle types on the corridor and a quote form. Ten to twenty such pages cover semantics that load boards and aggregators cannot touch locally. How to keep those pages useful rather than doorway spam — see our guide to [local SEO and the Google Maps top 3](/en/blog/local-seo-google-maps-top-3)."),
  p("The second layer is a Google Business Profile in the right category with reviews and fleet photos: for “moving company + city” searches the map pack sits above organic results. Ongoing [SEO](/en/seo) for a logistics company starts at $300/month and, over a 4–6 month horizon, brings enquiries cheaper than any paid channel — we covered the mechanics and timelines in our [SEO pricing guide](/en/blog/seo-pricing-uk-2026)."),

  h2("What a logistics website costs"),
  p("The brackets below are our studio's real prices, not a freelance-marketplace race to the bottom. What each format includes:"),
  table(
    ["Format", "Price", "What is included", "Best for"],
    [
      ["Haulier's one-page site", "from $800", "1–3 screens: services, fleet, paperwork, enquiry form, messengers", "Owner-operator, 1–5 vehicles, leads from ads"],
      ["Corporate website", "from $3,500", "Route and service pages, calculator, order statuses, SEO structure, admin panel", "5–30 vehicles, both B2B and B2C, plans to grow organically"],
      ["Client-portal platform", "from $6,000", "Client accounts, tracking, document flow, CRM/accounting/GPS integrations", "A logistics operator with a steady order flow"],
    ]
  ),
  p("Budget on top: a typical integration (CRM, SMS gateway, payments) runs $200–500; complex ones such as GPS telematics or accounting sync run $1,000–3,000; support is $200/month or $40/hour. For a full breakdown of what drives the price, see [what a custom website costs in 2026](/en/blog/custom-website-cost-uk-2026)."),
  p("On a tight budget, the sensible sequence is: first a [landing page](/en/landing) with a calculator for one segment — it starts producing leads from ads straight away. Then, once the economics work, a corporate site with route pages for SEO. The client-portal platform is step three, once there is someone to put in those portals."),

  h2("Examples from our practice"),
  p("Honestly: we do not yet have a logistics case study in the portfolio, and we are not going to invent one. But the mechanics a freight site relies on are ones we have shipped repeatedly in adjacent niches:"),
  li("[Raul Avto](/en/portfolio/raul-avto) — automotive: a catalogue with complex filters and a structure built for commercial queries. The same approach powers route and cargo-type pages."),
  li("[Right Cars](/en/portfolio/right-cars) — car rental: booking forms that price the job from its parameters. That is exactly the freight-calculator logic."),
  li("[Rich Tour](/en/portfolio/rich-tour) — tours and destinations: many landing pages for different routes feeding one enquiry form — the pattern from the SEO section above."),
  p("The same segment-page-form mechanic is dissected in our piece on [auto repair shop websites](/en/blog/auto-repair-shop-website): different niche, identical inbound-lead logic."),
  cta(
    "Ready to discuss your logistics website?",
    "Tell us about your routes and fleet — we will propose a structure, format and exact price. Free, no strings attached.",
    "Get an estimate",
    "/en/calculator"
  ),
];

// ---------------------------------------------------------------------------

const doc = {
  _id: "ltAug2026-sait-vantazhoperevezennia",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-vantazhoperevezen" },
    ru: { _type: "slug", current: "sayt-gruzoperevozok" },
    en: { _type: "slug", current: "logistics-company-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для вантажоперевезень і логістики: заявки замість холодних дзвінків",
    ru: "Создание сайта грузоперевозок: заявки вместо холодных звонков",
    en: "Logistics Website Design: Inbound Leads Instead of Cold Calls",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для вантажоперевезень: ціни та функції 2026",
    ru: "Создание сайта грузоперевозок: цены 2026",
    en: "Logistics Website Design: Costs & Features 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для вантажоперевезень від $800 ✔️ Калькулятор вартості ✔️ B2B і B2C структура ✔️ SEO за маршрутами ➡ Реальні ціни та чеклист блоків",
    ru: "➤ Создание сайта грузоперевозок от $800 ✔️ Калькулятор стоимости ✔️ B2B и B2C структура ✔️ SEO по маршрутам ➡ Реальные цены и чеклист",
    en: "➤ Logistics website design from $800 ✔️ Freight cost calculator ✔️ B2B vs B2C structure ✔️ Route SEO ➡ Real prices and a block-by-block checklist",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Логістика",
    ru: "Логистика",
    en: "Logistics",
  },
  lede: {
    _type: "localizedString",
    uk: "Чим сайт B2B-логістики відрізняється від сайту квартирних переїздів, чому калькулятор вартості — головний лід-магніт, що реально з трекінгом вантажу і скільки коштує кожен формат — з реальними цінами студії.",
    ru: "Чем сайт B2B-логистики отличается от сайта квартирных переездов, почему калькулятор стоимости — главный лид-магнит, что реально с трекингом груза и сколько стоит каждый формат — с реальными ценами студии.",
    en: "How a B2B freight site differs from a moving company website, why a cost calculator is the strongest lead magnet, what shipment tracking realistically costs, and real studio pricing for every format.",
  },
  tags: ["логістика", "вантажоперевезення", "b2b", "калькулятор"],
  relatedPostSlugs: ["sait-dlia-avtoservisu", "vartist-rozrobky-saytu-2026", "lokalne-seo-top-3-google-maps"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для вантажоперевезень?",
        ru: "Сколько стоит создание сайта грузоперевозок?",
        en: "How much does a logistics company website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Сайт-візитка перевізника — від $800, корпоративний сайт з калькулятором і маршрутними сторінками — від $3 500, платформа з кабінетами клієнтів і трекінгом — від $6 000. Інтеграції рахуються окремо: типові $200–500, складні на кшталт GPS-моніторингу — $1 000–3 000.",
        ru: "Сайт-визитка перевозчика — от $800, корпоративный сайт с калькулятором и маршрутными страницами — от $3 500, платформа с кабинетами клиентов и трекингом — от $6 000. Интеграции считаются отдельно: типовые $200–500, сложные вроде GPS-мониторинга — $1 000–3 000.",
        en: "A haulier's one-page site starts at $800, a corporate website with a calculator and route pages at $3,500, and a client-portal platform with tracking at $6,000. Integrations are priced separately: $200–500 for typical ones, $1,000–3,000 for complex ones such as GPS telematics.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен трекінг вантажу на сайті з першого дня?",
        ru: "Нужен ли трекинг груза на сайте с первого дня?",
        en: "Do I need shipment tracking on the website from day one?",
      },
      answer: {
        _type: "localizedText",
        uk: "Ні. Заявки приводить швидкий прорахунок і блоки довіри, а не трекінг. На старті достатньо ручних статусів замовлення з SMS/email-сповіщеннями — це входить у корпоративний сайт. Інтеграцію з GPS-моніторингом варто докручувати другим етапом, коли є постійні B2B-клієнти на договорі.",
        ru: "Нет. Заявки приносит быстрый просчёт и блоки доверия, а не трекинг. На старте достаточно ручных статусов заказа с SMS/email-уведомлениями — это входит в корпоративный сайт. Интеграцию с GPS-мониторингом стоит докручивать вторым этапом, когда появились постоянные B2B-клиенты на договоре.",
        en: "No. Enquiries come from fast quoting and trust blocks, not tracking. Manual order statuses with SMS/email notifications are enough at launch — they are included in a corporate website. GPS integration is worth adding as phase two, once you have contracted B2B clients to retain.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Навіщо сайт, якщо є біржі перевезень на кшталт Lardi-Trans?",
        ru: "Зачем сайт, если есть биржи перевозок вроде Lardi-Trans?",
        en: "Why build a website if load boards already bring us work?",
      },
      answer: {
        _type: "localizedText",
        uk: "Біржа — це цінова війна: клієнт бачить десятки перевізників і обирає найдешевшого. Сайт працює навпаки: клієнт з пошуку приходить саме до вас, бачить автопарк і документи й порівнює не тільки ціну. Біржі варто лишити як додатковий канал, а не єдиний.",
        ru: "Биржа — это ценовая война: клиент видит десятки перевозчиков и выбирает самого дешёвого. Сайт работает наоборот: клиент из поиска приходит именно к вам, видит автопарк и документы и сравнивает не только цену. Биржи стоит оставить как дополнительный канал, а не единственный.",
        en: "A load board is a price war: the client sees dozens of carriers and picks the cheapest. A website works the other way round — the client finds you specifically, sees your fleet and paperwork, and compares more than just the rate. Keep the boards as an extra channel, not the only one.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як швидко сайт почне приводити заявки?",
        ru: "Как быстро сайт начнёт приносить заявки?",
        en: "How soon will the website start bringing enquiries?",
      },
      answer: {
        _type: "localizedText",
        uk: "З реклами — з першого тижня: лендінг з калькулятором приймає трафік одразу після запуску. З SEO — за 4–6 місяців: маршрутні сторінки й Google Business Profile поступово виходять у топ за запитами «перевезення + місто». Найшвидша зв'язка — реклама на старті плюс SEO на дистанції.",
        ru: "С рекламы — с первой недели: лендинг с калькулятором принимает трафик сразу после запуска. С SEO — за 4–6 месяцев: маршрутные страницы и Google Business Profile постепенно выходят в топ по запросам «перевозки + город». Самая быстрая связка — реклама на старте плюс SEO на дистанции.",
        en: "From ads — within the first week: a landing page with a calculator takes traffic as soon as it goes live. From SEO — in 4–6 months, as route pages and your Google Business Profile climb for “freight + city” queries. The fastest combination is ads at launch plus SEO for the long game.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Який сайт потрібен для квартирних переїздів?",
        ru: "Какой сайт нужен для квартирных переездов — хватит ли визитки?",
        en: "What does a moving company website need — is a one-pager enough?",
      },
      answer: {
        _type: "localizedText",
        uk: "Для переїздів найчастіше достатньо лендінгу від $800: калькулятор або пакети з цінами, кнопка зворотного дзвінка, фото бригад і відгуки. Головні метрики — швидкість відповіді й ціна на першому екрані. Корпоративний сайт потрібен, коли додаються B2B-послуги чи кілька міст.",
        ru: "Для переездов чаще всего достаточно лендинга от $800: калькулятор или пакеты с ценами, кнопка обратного звонка, фото бригад и отзывы. Главные метрики — скорость ответа и цена на первом экране. Корпоративный сайт нужен, когда добавляются B2B-услуги или несколько городов.",
        en: "For removals, a landing page from $800 is usually enough: a calculator or fixed-price packages, a call-back button, crew photos and reviews. The metrics that matter are response speed and a price above the fold. A corporate site becomes relevant once you add B2B services or several cities.",
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
