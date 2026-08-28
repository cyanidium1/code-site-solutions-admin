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

const bodyUk = [
  tldr("Коротко: сайт для ресторану у 2026", [
    "Лендінг-візитка ресторану чи кафе з меню й картою — від $800, готово за 2–3 тижні",
    "Сайт доставки з кошиком і онлайн-оплатою — від $3 500: це повноцінний e-commerce, а не «сторінка з телефоном»",
    "Агрегатори беруть 20–35% з кожного замовлення; на власному сайті комісії немає",
    "Цифрове меню замість PDF: оновлюється за хвилину, індексується Google і веде прямо в кошик",
    "Фото та швидкість завантаження на телефоні прямо впливають на конверсію",
    "Локальне SEO і Google Maps приводять гостей, які шукають «ресторан поруч» або «доставка піци + місто»",
  ]),
  p("Сайт для ресторану у 2026 році коштує від **$800** за лендінг-візитку з меню, фото й картою — і від **$3 500** за сайт доставки з кошиком та онлайн-оплатою. Строк — від 2–3 тижнів до 2,5 місяця залежно від функціоналу. У цій статті розкладаємо, з чого складається ціна, які інтеграції справді потрібні і коли власний сайт доставки вигідніший за Glovo."),
  p("Розробка сайту для ресторану — це не «ще одна візитка». Заклад живе з потоку гостей і замовлень: сайт або приводить їх щодня, або висить мертвим вантажем у стилі «зробили і забули». Тому перше питання — не «який дизайн обрати», а «яку роботу сайт має виконувати»: показувати меню й адресу, бронювати столики чи продавати доставку."),
  p("Ми в Code-Site.Art робили сайт для франшизи закладів [Tatarka](/portfolio/tatarka-franchise) і для служби доставки їжі [Bravo](/portfolio/bravo), тож цифри та строки нижче — з реальних проєктів, а не з лендінгів конструкторів."),

  h2("Який сайт потрібен закладу: три сценарії"),
  p("Сайт для кафе на 20 посадкових місць і сайт мережі доставки суші — це різні продукти з різницею в бюджеті у 4–5 разів. Перш ніж замовляти розробку сайту для ресторану, чесно дайте відповідь: звідки приходять гроші — із залу, з броні чи з доставки."),
  table(
    ["Тип сайту", "Що всередині", "Ціна", "Строк"],
    [
      ["Лендінг-візитка ресторану чи кафе", "Меню, фото залу, контакти, карта, кнопка дзвінка", "від $800", "2–3 тижні"],
      ["Сайт із бронюванням столиків", "Багатосторінковий сайт + форма броні, повідомлення адміністратору, CRM", "від $3 500", "4–6 тижнів"],
      ["Сайт доставки з онлайн-замовленням", "Каталог страв, кошик, онлайн-оплата, зони доставки, статуси замовлень", "від $3 500", "6–10 тижнів"],
    ]
  ),
  p("Перший сценарій закриває [лендінг](/landing): одна сторінка, яка відповідає на три питання гостя — що у вас смачного, де ви і чи відчинено зараз. Другий і третій — уже багатосторінковий сайт або e-commerce, і економити тут на платформі не варто: переробляти «сайт на конструкторі, що не потягнув кошик» дорожче, ніж зробити правильно одразу."),

  h2("Цифрове меню замість PDF"),
  p("У половини закладів меню на сайті — це PDF на 8 МБ, знятий із друкарського макета. Гість на телефоні чекає завантаження, зумить дрібний шрифт, не знаходить ціну і закриває вкладку. Що втрачає заклад:"),
  li("Google погано ранжує PDF — сторінки страв не збирають запити на кшталт «піца доставка + район»"),
  li("оновити ціни означає передзамовити макет у дизайнера, тому на сайті вони вічно застарілі"),
  li("із PDF неможливо замовити: гість дивиться меню в одному місці, а замовляє телефоном — половина губиться дорогою"),
  p("Цифрове меню — це звичайні сторінки сайту: категорії, страви, фото, ціни, позначки «гостре», «веган», «новинка». Адміністратор змінює ціну чи ховає стоп-лист в адмінці за хвилину — без дизайнера й програміста. Як це влаштовано зсередини, ми показували в статті про [адмін-панель сайту](/blog/yak-pratsyuye-admin-panel-saytu)."),

  h2("Онлайн-замовлення: доставка їжі — це e-commerce"),
  p("Якщо заклад живе з доставки, сайт для ресторану за вимогами перетворюється на [інтернет-магазин](/online-store): каталог, кошик, чекаут, оплата, статуси. Усе, що ми пишемо про [e-commerce-проєкти](/sites-for/ecommerce), стосується і їжі — тільки цикл замовлення коротший, а клієнт голодніший. Мінімальний робочий набір:"),
  num("Кошик, який не губиться між сторінками і пам’ятає замовлення після закриття вкладки"),
  num("Чекаут на один екран: адреса, час, спосіб оплати — без реєстрації та зайвих полів"),
  num("Зони доставки з мінімальною сумою замовлення і вартістю для кожної зони"),
  num("Миттєве повідомлення на кухню: Telegram, принтер чеків або CRM закладу"),
  num("Статуси для клієнта: «готуємо», «кур’єр у дорозі» — це мінус половина дзвінків «де моє замовлення?»"),
  p("Такий проєкт у нас коштує **від $3 500** і займає 6–10 тижнів разом з інтеграціями. Кастомна платформа з кабінетами кур’єрів, кількома закладами й власною логістикою — це вже **від $6 000**."),
  cta(
    "Порахуйте вартість сайту для вашого закладу",
    "5 питань у калькуляторі — і ви отримаєте вилку бюджету та строки без дзвінка менеджера.",
    "Відкрити калькулятор",
    "/calculator"
  ),

  h2("Інтеграції: оплата, доставка, бронювання"),
  h3("Онлайн-оплата"),
  p("Базовий еквайринг — LiqPay, Fondy чи WayForPay з Apple Pay і Google Pay. Типова інтеграція коштує **$200–500**. Складна зв’язка — оплата + фіскалізація (РРО) + синхронізація з обліковою системою закладу — це вже **$1 000–3 000**, і її варто закладати в бюджет одразу, а не «потім докрутимо»."),
  h3("Служби доставки і кур’єри"),
  p("Якщо кур’єри свої — вистачить передачі замовлення в Telegram-групу чи CRM з адресою і телефоном. Якщо логістика зовнішня, замовлення передається через API служби, а клієнт бачить статус на сайті. Друга схема дорожча в інтеграції, але знімає з адміністратора ручне «передзвонювання»."),
  h3("Бронювання столиків"),
  p("Для більшості закладів достатньо форми «дата, час, кількість гостей» із повідомленням адміністратору й підтвердженням гостю. Синхронізація із залом у реальному часі та hostess-планшетом потрібна ресторанам із повною посадкою на вихідних — це окрема інтеграція з тих самих **$200–500** у простому варіанті."),

  h2("Агрегатори чи власний сайт доставки"),
  p("Найчастіше питання від рестораторів: «навіщо мені сайт, якщо є Glovo?» Порівняймо чесно:"),
  table(
    ["Критерій", "Агрегатори (Glovo, Bolt Food)", "Власний сайт доставки"],
    [
      ["Комісія із замовлення", "20–35%", "0% — лише еквайринг ~2%"],
      ["База клієнтів", "Належить агрегатору", "Ваша: телефони, e-mail, історія замовлень"],
      ["Старт продажів", "Кілька днів", "6–10 тижнів на розробку"],
      ["Просування", "Конкуруєте в каталозі із сусідами по вулиці", "SEO, бренд і повторні замовлення працюють на вас"],
      ["Витрати в довгу", "Комісія з кожного чека назавжди", "Одноразова розробка від $3 500 + підтримка"],
    ]
  ),
  p("Правильна відповідь для більшості закладів — «і те, і те, але з різними ролями». Агрегатор — канал знайомства з новими клієнтами. Власний сайт — місце, куди ви переводите постійних: вкладіть у пакет флаєр із промокодом «-10% на сайті» — і замовлення без комісії. При середньому чеку 600 грн і 500 замовленнях на місяць комісія 30% — це **90 000 грн щомісяця**: розробка сайту окупається за перший квартал."),

  h2("Фото, швидкість і локальне SEO"),
  h3("Фото продають, але не повинні гальмувати"),
  p("Їжу продає картинка: сторінка страви без фото конвертує в рази гірше. Але «сирі» фото з камери по 5 МБ убивають швидкість — а гість із телефона в 4G не чекатиме. Технічний мінімум: сучасні формати WebP/AVIF, ліниве завантаження, адаптивні розміри. Сторінка меню має відкриватися за 2–3 секунди на середньому смартфоні."),
  h3("Google Maps і запити «поруч»"),
  p("«Кафе поруч», «доставка суші + місто», «ресторан із терасою» — гість шукає локально, і половина цих пошуків закінчується в картах. Профіль Google Business із меню й свіжими фото, відгуки, локальні сторінки на сайті — усе це працює в звʼязці. Покроковий план ми зібрали в статті про [топ-3 Google Maps](/blog/lokalne-seo-top-3-google-maps), а системне просування закладу — це [SEO-підтримка](/seo) **від $300/міс**."),

  p("Окрема порада для мереж: кожній точці — своя сторінка з адресою, графіком і меню, а не один загальний розділ «Контакти». Так сайт збирає запити «кафе + район» для кожної локації окремо, а картки в Maps отримують підтвердження адреси з сайту — Google це любить."),

  h2("Що підготувати перед стартом розробки"),
  p("Строк проєкту наполовину залежить від готовності матеріалів з боку закладу. Ось що варто зібрати ще до першого дзвінка зі студією — цей чеклист реально скорочує розробку на 2–3 тижні:"),
  num("Актуальне меню в таблиці: назва, опис, ціна, категорія, позначки «гостре» і «веган»"),
  num("Фото страв в одному стилі — хоча б для хітів продажів і сетів"),
  num("Зони доставки на карті з мінімальним чеком і вартістю доставки для кожної зони"),
  num("Реквізити для еквайрингу і рішення щодо фіскалізації чеків"),
  num("Куди мають падати замовлення: Telegram, принтер на кухні чи CRM"),
  num("Графік роботи, адреси й телефони всіх точок — для карток у Google Maps"),
  num("Доступи до домену і профілю Google Business, якщо вони вже існують"),
  p("Якщо частини матеріалів немає — не страшно: фотозйомку і тексти меню можна готувати паралельно з дизайном. Головне — не відкладати еквайринг: підключення платіжного провайдера і договір із банком часом тривають довше, ніж сама розробка. Як виглядає робота зі студією покроково — від брифу до запуску — ми описали на сторінці [процесу](/process)."),

  h2("Приклади: Tatarka і Bravo"),
  p("[Tatarka](/portfolio/tatarka-franchise) — сайт для франшизи закладів вуличної їжі. Тут сайт продає не шаурму, а бізнес-модель: меню й атмосфера показують продукт, окремий блок — цифри та умови для майбутніх франчайзі. Один сайт працює на два різні сегменти аудиторії."),
  p("[Bravo](/portfolio/bravo) — проєкт для служби доставки їжі: каталог страв із категоріями, акценти на фото і швидкий шлях до замовлення з телефона. Саме той випадок, коли сайт будується як e-commerce, а не як візитка."),
  p("Скільки взагалі коштує розробка сайту у 2026 році та з чого складається кошторис — розібрали окремо в [огляді цін](/blog/vartist-rozrobky-saytu-2026). А про дизайн-прийоми, що піднімають конверсію будь-якого сайту, — у статті про [9 прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),
  p("Головне правило: сайт закладу — це не про «красиво», це про потік замовлень. Меню, яке оновлюється за хвилину, кошик, що не губить гостя, і картка в Google Maps, яку знаходять, — ось що відрізняє робочий сайт від чергової візитки."),
  cta(
    "Готові запустити онлайн-замовлення без комісій агрегаторів?",
    "Розкажіть про заклад — порахуємо вилку бюджету і строки під ваш формат: візитка, бронь чи повноцінна доставка.",
    "Порахувати мій проєкт",
    "/calculator"
  ),
];

const bodyRu = [
  tldr("Коротко: сайт для ресторана и доставки еды в 2026", [
    "Лендинг-визитка ресторана или кафе с меню и картой — от $800, срок 2–3 недели",
    "Создание сайта доставки еды с корзиной и онлайн-оплатой — от $3 500: это полноценный e-commerce",
    "Агрегаторы забирают 20–35% с каждого заказа; на своём сайте комиссии нет",
    "Цифровое меню вместо PDF: обновляется за минуту, индексируется Google и ведёт прямо в корзину",
    "Фото и скорость загрузки на телефоне напрямую влияют на конверсию",
    "Локальное SEO и Google Maps приводят гостей по запросам «ресторан рядом» и «доставка + город»",
  ]),
  p("Создание сайта для ресторана в 2026 году стоит от **$800** за лендинг-визитку с меню, фото и картой — и от **$3 500**, если нужен сайт доставки с корзиной и онлайн-оплатой. Срок — от 2–3 недель до 2,5 месяца в зависимости от функционала. Разбираем, из чего складывается цена, какие интеграции действительно нужны и когда свой сайт доставки выгоднее Glovo."),
  p("Создание сайта ресторана — это не «ещё одна визитка». Заведение живёт потоком гостей и заказов: сайт либо приводит их каждый день, либо висит мёртвым грузом в духе «сделали и забыли». Поэтому первый вопрос — не «какой дизайн выбрать», а «какую работу сайт должен выполнять»: показывать меню и адрес, бронировать столики или продавать доставку."),
  p("Мы в Code-Site.Art делали сайт для франшизы заведений [Tatarka](/ru/portfolio/tatarka-franchise) и для службы доставки еды [Bravo](/ru/portfolio/bravo), так что цифры и сроки ниже — из реальных проектов, а не из рекламы конструкторов."),

  h2("Какой сайт нужен заведению: три сценария"),
  p("Создание сайта для кафе на 20 посадочных мест и сайт сети доставки суши — разные продукты с разницей в бюджете в 4–5 раз. Прежде чем заказать сайт доставки еды или визитку, честно ответьте: откуда приходят деньги — из зала, с брони или с доставки."),
  table(
    ["Тип сайта", "Что внутри", "Цена", "Срок"],
    [
      ["Лендинг-визитка ресторана или кафе", "Меню, фото зала, контакты, карта, кнопка звонка", "от $800", "2–3 недели"],
      ["Сайт с бронированием столиков", "Многостраничный сайт + форма брони, уведомления администратору, CRM", "от $3 500", "4–6 недель"],
      ["Сайт доставки с онлайн-заказом", "Каталог блюд, корзина, онлайн-оплата, зоны доставки, статусы заказов", "от $3 500", "6–10 недель"],
    ]
  ),
  p("Первый сценарий закрывает [лендинг](/ru/landing): одна страница, которая отвечает на три вопроса гостя — что у вас вкусного, где вы находитесь и открыто ли сейчас. Второй и третий — уже многостраничный сайт или e-commerce, и экономить на платформе здесь не стоит: переделывать «конструктор, который не потянул корзину» дороже, чем сразу сделать правильно."),

  h2("Цифровое меню вместо PDF"),
  p("У половины заведений меню на сайте — это PDF на 8 МБ, снятый с типографского макета. Гость на телефоне ждёт загрузку, зумит мелкий шрифт, не находит цену и закрывает вкладку. Что теряет заведение:"),
  li("Google плохо ранжирует PDF — страницы блюд не собирают запросы вроде «пицца доставка + район»"),
  li("обновить цены = перезаказать макет у дизайнера, поэтому на сайте они вечно устаревшие"),
  li("из PDF нельзя заказать: гость смотрит меню в одном месте, а заказывает по телефону — половина теряется по дороге"),
  p("Цифровое меню — это обычные страницы сайта: категории, блюда, фото, цены, метки «острое», «веган», «новинка». Администратор меняет цену или скрывает стоп-лист в админке за минуту — без дизайнера и программиста. Как это устроено изнутри — в статье про [админ-панель сайта](/ru/blog/kak-rabotaet-admin-panel-sayta)."),

  h2("Онлайн-заказ: как создать сайт доставки еды правильно"),
  p("Если заведение живёт доставкой, сайт по требованиям превращается в [интернет-магазин](/ru/online-store): каталог, корзина, чекаут, оплата, статусы. Всё, что верно для [e-commerce-проектов](/ru/sites-for/ecommerce), верно и для еды — только цикл заказа короче, а клиент голоднее. Минимальный рабочий набор:"),
  num("Корзина, которая не теряется между страницами и помнит заказ после закрытия вкладки"),
  num("Чекаут на один экран: адрес, время, способ оплаты — без регистрации и лишних полей"),
  num("Зоны доставки с минимальной суммой заказа и стоимостью для каждой зоны"),
  num("Мгновенное уведомление на кухню: Telegram, принтер чеков или CRM заведения"),
  num("Статусы для клиента: «готовим», «курьер в пути» — минус половина звонков «где мой заказ?»"),
  p("Такой проект у нас стоит **от $3 500** и занимает 6–10 недель вместе с интеграциями. Кастомная платформа с кабинетами курьеров, несколькими заведениями и своей логистикой — уже **от $6 000**."),
  cta(
    "Посчитайте стоимость сайта для вашего заведения",
    "5 вопросов в калькуляторе — и вы получите вилку бюджета и сроки без звонка менеджера.",
    "Открыть калькулятор",
    "/ru/calculator"
  ),

  h2("Интеграции: оплата, доставка, бронирование"),
  h3("Онлайн-оплата"),
  p("Базовый эквайринг — LiqPay, Fondy или WayForPay с Apple Pay и Google Pay. Типовая интеграция стоит **$200–500**. Сложная связка — оплата + фискализация + синхронизация с учётной системой заведения — это уже **$1 000–3 000**, и её лучше закладывать в бюджет сразу, а не «потом докрутим»."),
  h3("Службы доставки и курьеры"),
  p("Если курьеры свои — достаточно передачи заказа в Telegram-группу или CRM с адресом и телефоном. Если логистика внешняя, заказ уходит через API службы, а клиент видит статус на сайте. Вторая схема дороже в интеграции, но снимает с администратора ручной «обзвон»."),
  h3("Бронирование столиков"),
  p("Большинству заведений хватает формы «дата, время, количество гостей» с уведомлением администратору и подтверждением гостю. Синхронизация с залом в реальном времени и hostess-планшетом нужна ресторанам с полной посадкой по выходным — это отдельная интеграция из тех же **$200–500** в простом варианте."),

  h2("Агрегаторы или свой сайт доставки"),
  p("Самый частый вопрос от рестораторов: «зачем мне сайт, если есть Glovo?» Сравним честно:"),
  table(
    ["Критерий", "Агрегаторы (Glovo, Bolt Food)", "Свой сайт доставки"],
    [
      ["Комиссия с заказа", "20–35%", "0% — только эквайринг ~2%"],
      ["База клиентов", "Принадлежит агрегатору", "Ваша: телефоны, e-mail, история заказов"],
      ["Старт продаж", "Несколько дней", "6–10 недель на разработку"],
      ["Продвижение", "Конкурируете в каталоге с соседями по улице", "SEO, бренд и повторные заказы работают на вас"],
      ["Расходы вдолгую", "Комиссия с каждого чека навсегда", "Разовая разработка от $3 500 + поддержка"],
    ]
  ),
  p("Правильный ответ для большинства заведений — «и то, и то, но в разных ролях». Агрегатор — канал знакомства с новыми клиентами. Свой сайт — место, куда вы переводите постоянных: вложите в пакет флаер с промокодом «-10% на сайте» — и заказ идёт без комиссии. При среднем чеке 600 грн и 500 заказах в месяц комиссия 30% — это **90 000 грн ежемесячно**: разработка окупается за первый квартал. Поэтому заказать сайт доставки еды выгодно ровно тогда, когда у вас уже есть стабильный поток заказов из агрегаторов."),

  h2("Фото, скорость и локальное SEO"),
  h3("Фото продают, но не должны тормозить"),
  p("Еду продаёт картинка: страница блюда без фото конвертирует в разы хуже. Но «сырые» фото с камеры по 5 МБ убивают скорость — а гость с телефона в 4G ждать не будет. Технический минимум: форматы WebP/AVIF, ленивая загрузка, адаптивные размеры. Страница меню должна открываться за 2–3 секунды на среднем смартфоне."),
  h3("Google Maps и запросы «рядом»"),
  p("«Кафе рядом», «заказать сайт доставки суши» ищут владельцы, а гости ищут «доставка суши + город» — и половина таких поисков заканчивается в картах. Профиль Google Business с меню и свежими фото, отзывы, локальные страницы на сайте — всё это работает в связке. Пошаговый план — в статье про [топ-3 Google Maps](/ru/blog/lokalnoe-seo-top-3-google-maps), а системное продвижение заведения — это [SEO-поддержка](/ru/seo) **от $300/мес**."),

  p("Отдельный совет для сетей: каждой точке — своя страница с адресом, графиком и меню, а не один общий раздел «Контакты». Так сайт собирает запросы «кафе + район» для каждой локации отдельно, а карточки в Maps получают подтверждение адреса с сайта — Google это любит."),

  h2("Что подготовить перед стартом разработки"),
  p("Срок проекта наполовину зависит от готовности материалов со стороны заведения. Вот что стоит собрать ещё до первого звонка в студию — этот чеклист реально сокращает разработку на 2–3 недели:"),
  num("Актуальное меню в таблице: название, описание, цена, категория, метки «острое» и «веган»"),
  num("Фото блюд в одном стиле — хотя бы для хитов продаж и сетов"),
  num("Зоны доставки на карте с минимальным чеком и стоимостью доставки для каждой зоны"),
  num("Реквизиты для эквайринга и решение по фискализации чеков"),
  num("Куда должны падать заказы: Telegram, принтер на кухне или CRM"),
  num("График работы, адреса и телефоны всех точек — для карточек в Google Maps"),
  num("Доступы к домену и профилю Google Business, если они уже существуют"),
  p("Если части материалов нет — не страшно: фотосъёмку и тексты меню можно готовить параллельно с дизайном. Главное — не откладывать эквайринг: подключение платёжного провайдера и договор с банком порой занимают дольше, чем сама разработка. Как выглядит работа со студией по шагам — от брифа до запуска — описали на странице [процесса](/ru/process)."),

  h2("Примеры: Tatarka и Bravo"),
  p("[Tatarka](/ru/portfolio/tatarka-franchise) — сайт для франшизы заведений уличной еды. Здесь сайт продаёт не шаурму, а бизнес-модель: меню и атмосфера показывают продукт, отдельный блок — цифры и условия для будущих франчайзи. Один сайт работает на два разных сегмента аудитории."),
  p("[Bravo](/ru/portfolio/bravo) — проект для службы доставки еды: каталог блюд с категориями, акцент на фото и быстрый путь к заказу с телефона. Тот самый случай, когда сайт строится как e-commerce, а не как визитка."),
  p("Если вы гуглили «как создать сайт для ресторана» или «как создать сайт для кафе» в надежде собрать всё на конструкторе — посчитайте сначала полную стоимость владения: шаблон, платные плагины корзины, комиссии платёжных виджетов. Из чего складывается цена сайта в 2026 году — в нашем [обзоре цен](/ru/blog/skolko-stoit-sayt-2026), а о дизайн-приёмах, которые поднимают конверсию, — в статье про [9 приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),
  p("Главное правило: сайт заведения — не про «красиво», а про поток заказов. Меню, которое обновляется за минуту, корзина, которая не теряет гостя, и карточка в Google Maps, которую находят, — вот что отличает рабочий сайт от очередной визитки."),
  cta(
    "Готовы запустить онлайн-заказ без комиссий агрегаторов?",
    "Расскажите о заведении — посчитаем вилку бюджета и сроки под ваш формат: визитка, бронь или полноценная доставка.",
    "Посчитать мой проект",
    "/ru/calculator"
  ),
];

const bodyEn = [
  tldr("TL;DR: restaurant websites in 2026", [
    "A one-page restaurant site with menu, photos and a map — from $800, live in 2–3 weeks",
    "A restaurant website with online ordering — from $3,500: it is full e-commerce, not a brochure",
    "Delivery marketplaces charge 14–30% per order; your own site charges you nothing",
    "A digital menu beats PDF: updated in a minute, indexed by Google, linked straight to the basket",
    "Food photography and mobile load speed directly drive conversion",
    "Local SEO and Google Maps bring in every \"restaurant near me\" search",
  ]),
  p("Restaurant website design in 2026 costs from **$800** for a one-page site with a menu, photos and a map — and from **$3,500** for a restaurant website with online ordering, a basket and card payments. Timelines run from 2–3 weeks to about 2.5 months depending on scope. This guide breaks down where the money goes, which integrations you actually need, and when your own delivery site beats the marketplaces."),
  p("A restaurant website is not \"just another brochure\". A venue lives on covers and orders: the site either brings them in daily or gathers dust in a \"built it and forgot it\" tab. So the first question is not \"which design do we like\" but \"which job should the site do\": show the menu and address, take table bookings, or sell delivery."),
  p("We are Code-Site.Art, a Ukrainian studio working with clients across Europe — European quality at sensible rates. We built the site for the [Tatarka](/en/portfolio/tatarka-franchise) street-food franchise and for the [Bravo](/en/portfolio/bravo) food delivery service, so the numbers below come from real projects, not from website-builder ads."),

  h2("Which website does your venue need: three scenarios"),
  p("A site for a 20-seat café and a site for a sushi delivery chain are different products with a 4–5x budget gap. Before you brief anyone on restaurant website design, answer honestly: where does the money come from — the dining room, bookings, or delivery?"),
  table(
    ["Site type", "What's inside", "Price", "Timeline"],
    [
      ["One-page restaurant site", "Menu, interior photos, contacts, map, click-to-call", "from $800", "2–3 weeks"],
      ["Site with table bookings", "Multi-page site + booking form, staff notifications, CRM", "from $3,500", "4–6 weeks"],
      ["Restaurant website with online ordering", "Dish catalogue, basket, online payment, delivery zones, order statuses", "from $3,500", "6–10 weeks"],
    ]
  ),
  p("The first scenario is a classic [landing page](/en/landing): one screen answering a guest's three questions — what's good here, where are you, and are you open right now. The second and third are a multi-page site or full e-commerce, and cutting corners on the platform backfires: rebuilding a site-builder page that \"couldn't handle the basket\" costs more than doing it properly once."),

  h2("A digital menu instead of a PDF"),
  p("Half of all venues still publish the menu as an 8 MB print-layout PDF. A guest on a phone waits for the download, pinch-zooms tiny type, can't find the price and closes the tab. What the venue loses:"),
  li("Google ranks PDFs poorly — dish pages never collect searches like \"pizza delivery + area\""),
  li("updating prices means re-ordering the layout from a designer, so the site is permanently out of date"),
  li("you can't order from a PDF: the guest reads the menu in one place and phones the order in — half of them drop off on the way"),
  p("A digital menu is a set of ordinary site pages: categories, dishes, photos, prices, \"spicy\" and \"vegan\" badges. A manager changes a price or hides a sold-out dish in the admin panel in under a minute — no designer, no developer. We showed how that works in our post on [website admin panels](/en/blog/how-website-admin-panel-works)."),

  h2("Online ordering: food delivery is e-commerce"),
  p("If the venue lives on delivery, the site is effectively an [online store](/en/online-store): catalogue, basket, checkout, payments, statuses. Everything that applies to [e-commerce projects](/en/sites-for/ecommerce) applies to food — the order cycle is just shorter and the customer hungrier. The minimum working set:"),
  num("A basket that survives navigation and remembers the order after the tab is closed"),
  num("One-screen checkout: address, time, payment method — no registration, no extra fields"),
  num("Delivery zones with a minimum order value and a fee per zone"),
  num("Instant kitchen notifications: Telegram, a receipt printer, or the venue's CRM"),
  num("Customer-facing statuses: \"cooking\", \"courier on the way\" — that alone halves the \"where's my order?\" calls"),
  p("A project like this starts at **$3,500** and takes 6–10 weeks including integrations. A custom platform with courier accounts, multiple venues and in-house logistics starts at **$6,000**."),
  cta(
    "Price up a website for your venue",
    "Five questions in our calculator — and you get a budget range and timeline without talking to a sales manager.",
    "Open the calculator",
    "/en/calculator"
  ),

  h2("Integrations: payments, delivery, bookings"),
  h3("Online payments"),
  p("The baseline is card acquiring with Apple Pay and Google Pay — Stripe or a local provider, depending on your market. A typical integration costs **$200–500**. A complex chain — payments plus fiscal reporting plus sync with the venue's back office — runs **$1,000–3,000**, and it belongs in the budget from day one, not as a \"we'll bolt it on later\"."),
  h3("Couriers and delivery services"),
  p("With in-house couriers, pushing each order to a Telegram group or CRM with the address and phone number is enough. With third-party logistics, the order goes out via the service's API and the customer tracks the status on your site. The second setup costs more to integrate but frees your staff from manual ring-arounds."),
  h3("Table bookings"),
  p("Most venues only need a \"date, time, party size\" form with a staff notification and a guest confirmation. Real-time floor sync and a hostess tablet matter for restaurants fully booked at weekends — that's a separate integration, from the same **$200–500** in its simple form."),

  h2("Marketplaces vs your own delivery site"),
  p("The question every restaurateur asks: \"why do I need a site when Uber Eats exists?\" A fair comparison:"),
  table(
    ["Criterion", "Marketplaces (Uber Eats, Glovo, Bolt Food)", "Your own delivery site"],
    [
      ["Commission per order", "14–30%", "0% — only card fees ~2%"],
      ["Customer base", "Belongs to the marketplace", "Yours: phone numbers, emails, order history"],
      ["Time to first sale", "A few days", "6–10 weeks of development"],
      ["Marketing", "You compete in a listing with the street next door", "SEO, brand and repeat orders compound for you"],
      ["Long-run cost", "A cut of every receipt, forever", "One-off build from $3,500 + support"],
    ]
  ),
  p("For most venues the right answer is \"both, in different roles\". Marketplaces are an acquisition channel for first-time customers. Your own site is where you move the regulars: drop a flyer with a \"-10% on our website\" promo code into every bag, and the next order arrives commission-free. At a $15 average ticket and 500 orders a month, a 25% commission is **$1,875 a month** — the build pays for itself within the first quarter."),

  h2("Photos, speed and local SEO"),
  h3("Photos sell — but must not slow the site down"),
  p("Food is sold by the picture: a dish page without a photo converts several times worse. But raw 5 MB camera files kill load speed, and a guest on 4G won't wait. The technical minimum: WebP/AVIF formats, lazy loading, responsive sizes. The menu page should open in 2–3 seconds on a mid-range phone."),
  h3("Google Maps and \"near me\" searches"),
  p("\"Restaurant near me\", \"sushi delivery + town\", \"café with a terrace\" — guests search locally, and half of those searches end in the map pack. A Google Business Profile with the menu and fresh photos, reviews, and local pages on the site all work together. The step-by-step plan is in our guide to [the Google Maps top 3](/en/blog/local-seo-google-maps-top-3), and ongoing promotion is our [SEO service](/en/seo) from **$300/month**."),

  p("A tip for multi-site operators: give every location its own page with the address, opening hours and menu, rather than one generic \"Contacts\" section. That way the site collects \"café + area\" searches for each location separately, and your Maps listings get an address confirmation from the site — Google rewards that."),

  h2("What to prepare before the build starts"),
  p("Half of the project timeline depends on how ready the venue's materials are. Gather these before the first call with a studio — this checklist genuinely shaves 2–3 weeks off development:"),
  num("The current menu in a spreadsheet: name, description, price, category, \"spicy\" and \"vegan\" badges"),
  num("Dish photos in one consistent style — at least for bestsellers and sets"),
  num("Delivery zones on a map with a minimum order and a delivery fee per zone"),
  num("Merchant account details and a decision on receipt/fiscal reporting"),
  num("Where orders should land: Telegram, a kitchen printer, or your CRM"),
  num("Opening hours, addresses and phone numbers for every location — for the Google Maps listings"),
  num("Access to the domain and the Google Business Profile, if they already exist"),
  p("Missing some of it? Not a problem: photography and menu copy can run in parallel with design. The one thing not to postpone is payments — onboarding with a payment provider and the bank paperwork sometimes take longer than the build itself. Our step-by-step way of working — from brief to launch — is on the [process page](/en/process)."),

  h2("Case studies: Tatarka and Bravo"),
  p("[Tatarka](/en/portfolio/tatarka-franchise) is a website for a street-food franchise. The site sells the business model, not the shawarma: the menu and atmosphere showcase the product, while a dedicated section gives future franchisees the numbers and terms. One site serving two very different audiences."),
  p("[Bravo](/en/portfolio/bravo) is a build for a food delivery service: a categorised dish catalogue, photography-led pages and the shortest possible path from phone screen to order. Exactly the case where the site is engineered as e-commerce, not as a brochure."),
  p("Wondering what a website costs overall in 2026 and what the line items are? We broke it down in our [pricing overview](/en/blog/custom-website-cost-uk-2026), and covered the design moves that lift conversion in [9 design moves](/en/blog/9-design-moves-that-lift-conversion)."),
  p("The rule of thumb: a venue's website is not about \"looking nice\" — it's about order flow. A menu updated in a minute, a basket that never loses a guest, and a Google Maps listing people actually find: that is what separates a working site from another brochure."),
  cta(
    "Ready to take orders without marketplace commissions?",
    "Tell us about your venue — we'll price a budget range and timeline for your format: brochure, bookings, or full delivery.",
    "Price my project",
    "/en/calculator"
  ),
];

const doc = {
  _id: "ltAug2026-sait-dlia-restoranu",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 11,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-restoranu-kafe-dostavky" },
    ru: { _type: "slug", current: "sayt-dlya-restorana-i-dostavki-edy" },
    en: { _type: "slug", current: "restaurant-website-with-delivery" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для ресторану, кафе і доставки їжі: меню, замовлення, оплата",
    ru: "Сайт для ресторана, кафе и доставки еды: меню, заказ, оплата",
    en: "Restaurant website with online ordering: menu, basket, payments",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для ресторану і кафе з доставкою — ціни 2026",
    ru: "Создание сайта для ресторана и доставки еды: цены 2026",
    en: "Restaurant Website Design with Online Ordering — 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Скільки коштує сайт для ресторану чи кафе ✔️ Онлайн-меню, кошик, оплата — від $800 ✔️ Свій сайт vs Glovo ➡ Порахуйте свій проєкт у калькуляторі",
    ru: "➤ Создание сайта для ресторана, кафе и доставки еды ✔️ Цены от $800, сроки, интеграции оплаты ✔️ Свой сайт vs Glovo ➡ Посчитайте проект в калькуляторе",
    en: "➤ Restaurant website design with online ordering ✔️ Real prices from $800, timelines, payment integrations ✔️ Own site vs marketplaces ➡ Get a quote",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Ресторани і доставка",
    ru: "Рестораны и доставка",
    en: "Restaurants & delivery",
  },
  lede: {
    _type: "localizedString",
    uk: "Лендінг-візитка від $800 чи сайт доставки з кошиком від $3 500? Розбираємо цифрове меню, онлайн-оплату, бронь столиків і чесну математику «свій сайт проти Glovo».",
    ru: "Лендинг-визитка от $800 или сайт доставки с корзиной от $3 500? Разбираем цифровое меню, онлайн-оплату, бронь столиков и честную математику «свой сайт против Glovo».",
    en: "A one-pager from $800 or a delivery site with a basket from $3,500? Digital menus, online payments, table bookings and the honest maths of your own site vs the marketplaces.",
  },
  tags: ["ресторани", "доставка їжі", "e-commerce", "онлайн-замовлення"],
  relatedPostSlugs: ["vartist-rozrobky-saytu-2026", "lokalne-seo-top-3-google-maps", "9-dyzain-pryiomiv-dlia-konversii"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для ресторану чи кафе?",
        ru: "Сколько стоит создание сайта для ресторана или кафе?",
        en: "How much does a restaurant website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг-візитка з меню, фото і картою — від $800, строк 2–3 тижні. Сайт із бронюванням столиків або доставкою з онлайн-оплатою — від $3 500. Кастомна платформа доставки з кабінетами кур'єрів і кількома закладами — від $6 000. Точна цифра залежить від кількості інтеграцій: оплата, CRM, логістика.",
        ru: "Лендинг-визитка с меню, фото и картой — от $800, срок 2–3 недели. Сайт с бронированием столиков или доставкой с онлайн-оплатой — от $3 500. Кастомная платформа доставки с кабинетами курьеров и несколькими заведениями — от $6 000. Точная цифра зависит от количества интеграций: оплата, CRM, логистика.",
        en: "A one-page site with a menu, photos and a map starts at $800 and takes 2–3 weeks. A restaurant website with table bookings or online ordering starts at $3,500. A custom delivery platform with courier accounts and multiple venues starts at $6,000. The exact figure depends on integrations: payments, CRM, logistics.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що вигідніше: власний сайт доставки чи агрегатори на кшталт Glovo?",
        ru: "Что выгоднее: свой сайт доставки или агрегаторы вроде Glovo?",
        en: "Which is better: my own delivery site or marketplaces like Uber Eats?",
      },
      answer: {
        _type: "localizedText",
        uk: "Агрегатори беруть 20–35% з кожного замовлення, зате дають швидкий старт і нових клієнтів. Власний сайт не бере комісії і збирає вашу базу: телефони, e-mail, історію замовлень. Оптимальна схема — використовувати агрегатори для залучення нових гостей і переводити постійних на свій сайт промокодами.",
        ru: "Агрегаторы берут 20–35% с каждого заказа, зато дают быстрый старт и новых клиентов. Свой сайт не берёт комиссии и собирает вашу базу: телефоны, e-mail, историю заказов. Оптимальная схема — использовать агрегаторы для привлечения новых гостей и переводить постоянных на свой сайт промокодами.",
        en: "Marketplaces take 14–30% of every order but offer a fast start and new customers. Your own site charges no commission and builds your database: phone numbers, emails, order history. The optimal setup is using marketplaces for acquisition and moving regulars to your own site with promo codes.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка сайту для ресторану?",
        ru: "Сколько времени занимает разработка сайта для ресторана?",
        en: "How long does it take to build a restaurant website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг-візитка — 2–3 тижні. Сайт із бронюванням столиків — 4–6 тижнів. Сайт доставки з кошиком, онлайн-оплатою і зонами доставки — 6–10 тижнів разом з інтеграціями. Найбільше часу зазвичай іде не на дизайн, а на контент: фото страв, тексти меню, узгодження зон і цін доставки.",
        ru: "Лендинг-визитка — 2–3 недели. Сайт с бронированием столиков — 4–6 недель. Сайт доставки с корзиной, онлайн-оплатой и зонами доставки — 6–10 недель вместе с интеграциями. Больше всего времени обычно уходит не на дизайн, а на контент: фото блюд, тексты меню, согласование зон и цен доставки.",
        en: "A one-pager takes 2–3 weeks. A site with table bookings takes 4–6 weeks. A delivery site with a basket, online payments and delivery zones takes 6–10 weeks including integrations. The biggest time sink is usually content, not design: dish photography, menu copy, agreeing zones and delivery fees.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи зможу я сам оновлювати меню і ціни на сайті?",
        ru: "Смогу ли я сам обновлять меню и цены на сайте?",
        en: "Can I update the menu and prices myself?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так. Ми здаємо сайт з адмін-панеллю: адміністратор закладу змінює ціни, додає страви, ховає стоп-лист і оновлює фото без програміста. Навчання займає близько години. Як влаштована адмінка — детально розібрали в статті /blog/yak-pratsyuye-admin-panel-saytu.",
        ru: "Да. Мы сдаём сайт с админ-панелью: администратор заведения меняет цены, добавляет блюда, скрывает стоп-лист и обновляет фото без программиста. Обучение занимает около часа. Как устроена админка — подробно разобрали в статье /ru/blog/kak-rabotaet-admin-panel-sayta.",
        en: "Yes. Every site ships with an admin panel: your manager changes prices, adds dishes, hides sold-out items and updates photos without a developer. Training takes about an hour. We covered how the admin panel works in detail at /en/blog/how-website-admin-panel-works.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Ви робите сайти для доставки суші, піци, окремих кухонь?",
        ru: "Можно ли заказать сайт доставки суши или пиццы под ключ?",
        en: "Do you build sites for sushi or pizza delivery specifically?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, механіка однакова для будь-якої кухні: каталог страв, кошик, зони доставки, онлайн-оплата, повідомлення на кухню. Різниця — в подачі: для суші критичні фото сетів і конструктор наборів, для піци — вибір розміру й добавок. Ці опції закладаються на етапі проєктування каталогу.",
        ru: "Да, механика одинакова для любой кухни: каталог блюд, корзина, зоны доставки, онлайн-оплата, уведомления на кухню. Заказать сайт доставки суши или пиццы можно под ключ — разница в подаче: для суши критичны фото сетов и конструктор наборов, для пиццы — выбор размера и добавок. Эти опции закладываются на этапе проектирования каталога.",
        en: "Yes — the mechanics are the same for any cuisine: dish catalogue, basket, delivery zones, online payment, kitchen notifications. The difference is in presentation: sushi needs strong set photography and a set builder, pizza needs size and topping options. These are designed into the catalogue from the start.",
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
