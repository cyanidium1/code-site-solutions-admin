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

/* ─────────────────────────── UK ─────────────────────────── */

const bodyUk = [
  tldr("Коротко", [
    "API — це набір правил, за якими одна програма запитує дані або дію в іншої.",
    "Простими словами: офіціант між вами і кухнею. Ви не йдете готувати самі — ви робите замовлення тому, хто знає правила.",
    "Сайту API потрібне для онлайн-оплати, доставки, CRM, карт і сповіщень у месенджери.",
    "Типова інтеграція коштує $200–500, складна — $1 000–3 000.",
    "Дві найдорожчі помилки: ключі у відкритому коді та відсутність обробки помилок.",
  ]),

  p("**API (Application Programming Interface)** — це набір правил, за якими одна програма звертається до іншої і отримує від неї дані або дію. Ваш сайт не «заходить усередину» банку чи Нової Пошти: він надсилає запит у тому форматі, який та система очікує, і отримує назад відповідь. Саме API робить можливими оплату карткою, розрахунок доставки та автоматичне створення заявки в CRM."),
  p("Для власника бізнесу API — це не технічна дрібниця, а межа між «сайт-візитівка» і «сайт, який працює замість менеджера». Поки інтеграцій немає, хтось руками переносить замовлення в таблицю, дзвонить у службу доставки і звіряє оплати. Кожна інтеграція забирає одну таку рутину."),
  p("Нижче — пояснення на пальцях, схема запит-відповідь, перелік API, які в Україні підключають найчастіше, реальні вилки цін і помилки, через які інтеграції ламаються."),

  h2("API простими словами: офіціант у ресторані"),
  p("Уявіть ресторан. Ви сидите за столиком і хочете пасту. Ви не йдете на кухню, не берете сковорідку і не питаєте кухаря, де сіль. Ви кличете офіціанта, називаєте страву зі списку — і за кілька хвилин отримуєте тарілку."),
  p("Офіціант тут і є API. Кухня (чужа система — банк, перевізник, CRM) не пускає вас всередину і не мусить. Меню — це документація: перелік того, що взагалі можна замовити, і в яких формулюваннях. Офіціант знає правила: як передати замовлення, що робити, якщо страва закінчилася, і як принести вам відповідь."),
  p("З цієї аналогії відразу випливають три речі. Замовити можна тільки те, що є в меню — якщо у платіжного сервісу немає потрібної функції, її не «допише» жоден розробник. Формулювати треба точно, інакше принесуть не те. І кухня може відповісти «немає» — ваш сайт має вміти це коректно показати клієнту."),

  h2("Як працює запит і відповідь"),
  p("Технічно обмін виглядає простіше, ніж здається. Це чотири кроки:"),
  num("Ваш сайт формує **запит**: адреса методу, ключ доступу і дані — наприклад, сума платежу та номер замовлення."),
  num("Запит іде на сервер сервісу, який перевіряє ключ і права."),
  num("Сервіс виконує дію і повертає **відповідь** — зазвичай у форматі JSON: статус, ідентифікатор, повідомлення про помилку."),
  num("Сайт розбирає відповідь і показує результат людині: «Оплату прийнято», «Відділення №12», «Спробуйте ще раз»."),
  p("Ключ доступу (API-ключ або токен) — це ваш перепустка. Він доводить сервісу, що запит справді від вашого сайту. Тому ключ — така сама цінність, як пароль від адмінки: про це ще буде окремо."),
  p("Важливо, що відповідь приходить не миттєво і не завжди успішна. Сервіс може бути на технічних роботах, ліміт запитів вичерпано, дані невалідні. Нормально зроблена інтеграція завжди передбачає, що станеться в такому випадку."),

  h2("Які API найчастіше підключають сайтам в Україні"),
  p("Це не теоретичний список, а те, що реально просять клієнти студії. Терміни вказані для випадку, коли сайт уже є і документація сервісу в порядку."),
  table(
    ["API", "Що дає бізнесу", "Скільки займає підключення"],
    [
      ["LiqPay / WayForPay", "Оплата карткою прямо на сайті, без переказу «на картку менеджера»", "2–5 днів"],
      ["Stripe", "Прийом оплат від закордонних клієнтів у валюті", "3–7 днів"],
      ["Нова Пошта", "Вибір відділення у формі, розрахунок вартості, автоматична ТТН", "3–6 днів"],
      ["KeyCRM / Bitrix24", "Заявки падають у CRM з джерелом і менеджером, нічого не губиться", "2–5 днів"],
      ["Google Maps", "Карта проїзду і філії на сторінці контактів", "0,5–1 день"],
      ["Telegram", "Сповіщення про нову заявку в чат за кілька секунд", "0,5–1 день"],
    ],
  ),
  p("Для [інтернет-магазину](/online-store) базовий набір — оплата плюс доставка плюс CRM: без них магазин просто перекладає роботу на менеджера. Для [корпоративного сайту](/corporate-site) зазвичай достатньо CRM, карт і Telegram-сповіщень."),

  h2("Чому інтеграції коштують грошей"),
  p("Найчастіше питання звучить так: «У сервісу ж є готове API, чому це не година роботи?». Тому що підключення — це не тільки виклик методу. Це облікові записи і ключі, тестове середовище, узгодження полів (у вас «Ім'я клієнта», у CRM — `contact_name`), обробка помилок, повторні спроби, логи і перевірка на реальних замовленнях."),
  p("Наші реальні вилки: **типова інтеграція — $200–500** (оплата, Нова Пошта, CRM зі стандартними полями, месенджер). **Складна — $1 000–3 000**: нестандартна логіка, синхронізація залишків в обидва боки, стара облікова система без нормальної документації, кілька сервісів, які мають узгоджуватися між собою."),
  p("Приклад із практики — [магазин автозапчастин Raul Avto](/portfolio/raul-avto): там підбір деталей і калькулятор працюють на інтеграціях, і саме вони, а не дизайн, визначили строк проєкту."),

  cta(
    "Потрібно підключити оплату, доставку чи CRM?",
    "Скажіть, які сервіси вже використовуєте — назвемо строк і вилку по вашому випадку, без загальних слів.",
    "Обговорити інтеграцію",
    "/contacts",
  ),

  h2("Типові помилки при роботі з API"),
  h3("Ключі у відкритому коді"),
  p("Найдорожча помилка. API-ключ, залишений у файлах фронтенду або залитий у публічний репозиторій, знаходять автоматичні сканери за години. Далі — чужі запити від вашого імені, вичерпаний ліміт, у гіршому випадку списання коштів. Ключі мають зберігатися тільки на сервері, у змінних оточення, і мінятися при зміні підрядника."),
  h3("Немає обробки помилок"),
  p("Сервіс недоступний — і клієнт бачить білий екран або вічний спінер. Замовлення втрачено, а власник дізнається про це через тиждень. Правильно: зрозуміле повідомлення людині, повторна спроба, запис у лог і сповіщення адміністратору."),
  h3("Ніхто не дивиться логи"),
  p("Інтеграція мовчки перестала працювати після оновлення на боці сервісу — таке буває регулярно. Без логів і моніторингу це виявляють за падінням продажів, а не за помилкою."),
  h3("Все підключають одразу"),
  p("Спокуса зробити «всі інтеграції на старті» затягує запуск на місяці. Робочий підхід — оплата і заявки спершу, решта після перших реальних замовлень."),

  h2("Що почитати далі"),
  p("Щоб зібрати повну картину, подивіться, [що таке CMS](/blog/shcho-take-cms) — саме через неї ви керуєте контентом, поки API керує обміном даними. І окремо — [як працює адмін-панель сайту](/blog/yak-pratsyuye-admin-panel-saytu), де видно, куди саме приходять дані з інтеграцій."),
];

/* ─────────────────────────── RU ─────────────────────────── */

const bodyRu = [
  tldr("Коротко", [
    "API — это набор правил, по которым одна программа запрашивает данные или действие у другой.",
    "Простыми словами: официант между вами и кухней. Вы не идёте готовить сами — вы делаете заказ тому, кто знает правила.",
    "Сайту API нужно для онлайн-оплаты, доставки, CRM, карт и уведомлений в мессенджеры.",
    "Типовая интеграция стоит $200–500, сложная — $1 000–3 000.",
    "Две самые дорогие ошибки: ключи в открытом коде и отсутствие обработки ошибок.",
  ]),

  p("**API (Application Programming Interface)** — это набор правил, по которым одна программа обращается к другой и получает от неё данные или действие. Ваш сайт не «заходит внутрь» банка или Новой Почты: он отправляет запрос в том формате, который та система ожидает, и получает обратно ответ. Именно API делает возможными оплату картой, расчёт доставки и автоматическое создание заявки в CRM."),
  p("Для владельца бизнеса API — не техническая мелочь, а граница между «сайтом-визиткой» и «сайтом, который работает вместо менеджера». Пока интеграций нет, кто-то руками переносит заказы в таблицу, звонит в службу доставки и сверяет оплаты. Каждая интеграция убирает одну такую рутину."),
  p("Ниже — объяснение на пальцах, схема запрос-ответ, список API, которые в Украине подключают чаще всего, реальные вилки цен и ошибки, из-за которых интеграции ломаются."),

  h2("API простыми словами: официант в ресторане"),
  p("Представьте ресторан. Вы сидите за столиком и хотите пасту. Вы не идёте на кухню, не берёте сковородку и не спрашиваете повара, где соль. Вы зовёте официанта, называете блюдо из списка — и через несколько минут получаете тарелку."),
  p("Официант здесь и есть API. Кухня (чужая система — банк, перевозчик, CRM) не пускает вас внутрь и не обязана. Меню — это документация: перечень того, что вообще можно заказать, и в каких формулировках. Официант знает правила: как передать заказ, что делать, если блюдо закончилось, и как принести вам ответ."),
  p("Из этой аналогии сразу следуют три вещи. Заказать можно только то, что есть в меню — если у платёжного сервиса нет нужной функции, её не «допишет» ни один разработчик. Формулировать нужно точно, иначе принесут не то. И кухня может ответить «нет» — ваш сайт должен уметь корректно показать это клиенту."),

  h2("Как работает запрос и ответ"),
  p("Технически обмен выглядит проще, чем кажется. Это четыре шага:"),
  num("Ваш сайт формирует **запрос**: адрес метода, ключ доступа и данные — например, сумма платежа и номер заказа."),
  num("Запрос уходит на сервер сервиса, который проверяет ключ и права."),
  num("Сервис выполняет действие и возвращает **ответ** — обычно в формате JSON: статус, идентификатор, сообщение об ошибке."),
  num("Сайт разбирает ответ и показывает результат человеку: «Оплата принята», «Отделение №12», «Попробуйте ещё раз»."),
  p("Ключ доступа (API-ключ или токен) — это ваш пропуск. Он доказывает сервису, что запрос действительно от вашего сайта. Поэтому ключ — такая же ценность, как пароль от админки: об этом ещё будет отдельно."),
  p("Важно, что ответ приходит не мгновенно и не всегда успешный. Сервис может быть на технических работах, лимит запросов исчерпан, данные невалидны. Нормально сделанная интеграция всегда предусматривает, что произойдёт в таком случае."),

  h2("Какие API чаще всего подключают сайтам в Украине"),
  p("Это не теоретический список, а то, что реально просят клиенты студии. Сроки указаны для случая, когда сайт уже есть и документация сервиса в порядке."),
  table(
    ["API", "Что даёт бизнесу", "Сколько занимает подключение"],
    [
      ["LiqPay / WayForPay", "Оплата картой прямо на сайте, без перевода «на карту менеджера»", "2–5 дней"],
      ["Stripe", "Приём оплат от зарубежных клиентов в валюте", "3–7 дней"],
      ["Новая Почта", "Выбор отделения в форме, расчёт стоимости, автоматическая ТТН", "3–6 дней"],
      ["KeyCRM / Bitrix24", "Заявки падают в CRM с источником и менеджером, ничего не теряется", "2–5 дней"],
      ["Google Maps", "Карта проезда и филиалы на странице контактов", "0,5–1 день"],
      ["Telegram", "Уведомление о новой заявке в чат за несколько секунд", "0,5–1 день"],
    ],
  ),
  p("Для [интернет-магазина](/ru/online-store) базовый набор — оплата плюс доставка плюс CRM: без них магазин просто перекладывает работу на менеджера. Для [корпоративного сайта](/ru/corporate-site) обычно достаточно CRM, карт и Telegram-уведомлений."),

  h2("Почему интеграции стоят денег"),
  p("Чаще всего вопрос звучит так: «У сервиса же есть готовое API, почему это не час работы?». Потому что подключение — это не только вызов метода. Это учётные записи и ключи, тестовая среда, согласование полей (у вас «Имя клиента», в CRM — `contact_name`), обработка ошибок, повторные попытки, логи и проверка на реальных заказах."),
  p("Наши реальные вилки: **типовая интеграция — $200–500** (оплата, Новая Почта, CRM со стандартными полями, мессенджер). **Сложная — $1 000–3 000**: нестандартная логика, синхронизация остатков в обе стороны, старая учётная система без нормальной документации, несколько сервисов, которые должны согласовываться между собой."),
  p("Пример из практики — [магазин автозапчастей Raul Avto](/ru/portfolio/raul-avto): там подбор деталей и калькулятор работают на интеграциях, и именно они, а не дизайн, определили срок проекта."),

  cta(
    "Нужно подключить оплату, доставку или CRM?",
    "Скажите, какие сервисы уже используете — назовём срок и вилку по вашему случаю, без общих слов.",
    "Обсудить интеграцию",
    "/ru/contacts",
  ),

  h2("Типичные ошибки при работе с API"),
  h3("Ключи в открытом коде"),
  p("Самая дорогая ошибка. API-ключ, оставленный в файлах фронтенда или залитый в публичный репозиторий, находят автоматические сканеры за часы. Дальше — чужие запросы от вашего имени, исчерпанный лимит, в худшем случае списание средств. Ключи должны храниться только на сервере, в переменных окружения, и меняться при смене подрядчика."),
  h3("Нет обработки ошибок"),
  p("Сервис недоступен — и клиент видит белый экран или вечный спиннер. Заказ потерян, а владелец узнаёт об этом через неделю. Правильно: понятное сообщение человеку, повторная попытка, запись в лог и уведомление администратору."),
  h3("Никто не смотрит логи"),
  p("Интеграция молча перестала работать после обновления на стороне сервиса — такое бывает регулярно. Без логов и мониторинга это обнаруживают по падению продаж, а не по ошибке."),
  h3("Всё подключают сразу"),
  p("Соблазн сделать «все интеграции на старте» затягивает запуск на месяцы. Рабочий подход — оплата и заявки сначала, остальное после первых реальных заказов."),

  h2("Что почитать дальше"),
  p("Чтобы собрать полную картину, посмотрите, [что такое CMS](/ru/blog/chto-takoe-cms) — именно через неё вы управляете контентом, пока API управляет обменом данными. И отдельно — [как работает админ-панель сайта](/ru/blog/kak-rabotaet-admin-panel-sayta), где видно, куда именно приходят данные из интеграций."),
];

/* ─────────────────────────── EN ─────────────────────────── */

const bodyEn = [
  tldr("In short", [
    "An API is a set of rules by which one program requests data or an action from another.",
    "In plain words: a waiter between you and the kitchen. You don't cook yourself — you order through someone who knows the rules.",
    "A website needs APIs for payments, delivery, CRM, maps and messenger notifications.",
    "A typical integration costs $200–500; a complex one runs $1,000–3,000.",
    "The two most expensive mistakes: keys left in public code, and no error handling.",
  ]),

  p("An **API (Application Programming Interface)** is a set of rules by which one program asks another for data or an action. Your website never goes \"inside\" a bank or a courier company: it sends a request in the format that system expects, and gets a response back. That is what makes card payments, delivery cost calculation and automatic CRM lead creation possible."),
  p("For a business owner an API is not a technical detail. It is the line between a brochure site and a site that does the work of a manager. Without integrations, somebody copies orders into a spreadsheet by hand, calls the courier and reconciles payments. Every integration removes one of those routines."),
  h2("What is an API in plain words: the waiter analogy"),
  p("Picture a restaurant. You are at a table and you want pasta. You do not walk into the kitchen, pick up a pan and ask the chef where the salt is. You call a waiter, name a dish from the list, and a few minutes later a plate arrives."),
  p("The waiter is the API. The kitchen — someone else's system, a bank, a courier, a CRM — does not let you in, and does not have to. The menu is the documentation: what can be ordered at all, and in what wording. The waiter knows the rules: how to pass the order on, what to do if a dish has run out, and how to bring the answer back."),
  p("Three things follow immediately. You can only order what is on the menu — if a payment provider has no such function, no developer can add it. You have to be precise, or the wrong thing arrives. And the kitchen can say no — your site must handle that answer gracefully."),

  h2("How a request and a response work"),
  p("The exchange is simpler than it sounds. Four steps:"),
  num("Your site builds a **request**: the endpoint, an access key, and the data — the payment amount and the order number, for instance."),
  num("The request goes to the provider's server, which checks the key and the permissions."),
  num("The provider performs the action and returns a **response**, usually as JSON: a status, an identifier, an error message."),
  num("Your site reads the response and shows the result to a human: \"Payment accepted\", \"Branch No. 12\", \"Please try again\"."),
  p("The access key, or token, is your pass. It proves to the provider that the request really came from your site. That makes a key as valuable as an admin password — more on that below."),
  p("Responses are neither instant nor always successful. The provider may be under maintenance, the rate limit may be exhausted, the data may be invalid. A properly built integration always defines what happens then."),

  h2("The APIs we connect most often"),
  p("This is not a theoretical list — it is what clients actually ask for. Timings assume the site already exists and the provider's documentation is sane."),
  table(
    ["API", "What it gives the business", "Time to connect"],
    [
      ["LiqPay / WayForPay", "Card payments on the site itself, no manual bank transfers", "2–5 days"],
      ["Stripe", "Payments from international customers in their currency", "3–7 days"],
      ["Nova Poshta", "Branch picker in the form, shipping cost, automatic waybill", "3–6 days"],
      ["KeyCRM / Bitrix24", "Leads land in the CRM with source and owner, nothing gets lost", "2–5 days"],
      ["Google Maps", "Directions and branch locations on the contact page", "0.5–1 day"],
      ["Telegram", "New-lead notification in a chat within seconds", "0.5–1 day"],
    ],
  ),
  p("For an [online store](/en/online-store) the baseline is payments plus delivery plus CRM — without them the shop simply moves the work onto a manager. For a [corporate website](/en/corporate-site), CRM, maps and Telegram alerts are usually enough."),

  h2("Why integrations cost money"),
  p("The usual question: the provider already has an API, so why is this not an hour of work? Because connecting is more than calling an endpoint. It is accounts and keys, a sandbox, field mapping (your \"Customer name\" against the CRM's `contact_name`), error handling, retries, logging, and testing against real orders."),
  p("Our real ranges: a **typical integration is $200–500** — payments, a courier, a CRM with standard fields, a messenger. A **complex one is $1,000–3,000**: non-standard logic, two-way stock sync, a legacy accounting system with no usable documentation, or several services that must stay consistent with each other."),
  p("A practical example is the [Raul Avto auto-parts store](/en/portfolio/raul-avto): its part finder and calculator run on integrations, and those, not the design, set the project timeline."),

  cta(
    "Need payments, delivery or a CRM connected?",
    "Tell us which services you already use and we will give you a timeline and a price range for your case — European quality at sensible rates.",
    "Discuss an integration",
    "/en/contacts",
  ),

  h2("Common API mistakes"),
  h3("Keys in public code"),
  p("The most expensive one. An API key left in front-end files or pushed to a public repository is found by automated scanners within hours. What follows is requests made in your name, an exhausted quota and, at worst, real charges. Keys belong on the server only, in environment variables, and should be rotated when you change contractors."),
  h3("No error handling"),
  p("The provider goes down and the customer sees a blank screen or an endless spinner. The order is lost, and the owner finds out a week later. The right behaviour: a clear message, a retry, a log entry and an alert to the administrator."),
  h3("Nobody reads the logs"),
  p("An integration quietly stops working after a provider-side update — this happens regularly. Without logs and monitoring you discover it through falling sales rather than through an error."),
  h3("Connecting everything at once"),
  p("The urge to ship \"all the integrations\" at launch pushes the launch back by months. What works: payments and leads first, the rest after the first real orders."),

  h2("Read next"),
  p("For the full picture, see [what a CMS is](/en/blog/what-is-a-cms) — that is how you manage content, while the API manages data exchange. And separately, [how a website admin panel works](/en/blog/how-website-admin-panel-works), which shows where integration data actually lands."),
];

const doc = {
  _id: "glos2026-shcho-take-api",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 5,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-api" },
    ru: { _type: "slug", current: "chto-takoe-api" },
    en: { _type: "slug", current: "what-is-an-api" },
  },
  title: {
    _type: "localizedString",
    uk: "API — що це простими словами і навіщо воно сайту",
    ru: "API — что это простыми словами и зачем оно сайту",
    en: "What Is an API? A Plain-English Explanation for Business Owners",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "API — що це простими словами і як працює",
    ru: "API — что это простыми словами и как работает",
    en: "What Is an API? Plain-English Explanation",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ API — це правила, за якими сайт спілкується з іншими сервісами ✔️ Пояснення на аналогії з офіціантом ✔️ Оплата, Нова Пошта, CRM ➡ Ціни інтеграцій",
    ru: "➤ API — это правила, по которым сайт общается с другими сервисами ✔️ Объяснение на аналогии с официантом ✔️ Оплата, Новая Почта, CRM ➡ Цены интеграций",
    en: "➤ An API is how your site talks to other services ✔️ Explained with the waiter analogy ✔️ Payments, delivery, CRM ➡ Real integration price ranges",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Словник термінів",
    ru: "Словарь терминов",
    en: "Glossary",
  },
  lede: {
    _type: "localizedString",
    uk: "Що таке API, як влаштований запит-відповідь, які інтеграції найчастіше потрібні українському сайту і скільки вони реально коштують.",
    ru: "Что такое API, как устроен запрос-ответ, какие интеграции чаще всего нужны украинскому сайту и сколько они реально стоят.",
    en: "What an API is, how request and response work, which integrations a website usually needs, and what they really cost.",
  },
  tags: ["API", "інтеграції", "словник"],
  relatedPostSlugs: ["shcho-take-cms", "yak-pratsyuye-admin-panel-saytu", "internet-mahazyn-avtozapchastyn"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "API це що простими словами?",
        ru: "API это что простыми словами?",
        en: "What is an API in simple terms?",
      },
      answer: {
        _type: "localizedText",
        uk: "API — це посередник, через якого одна програма просить іншу щось зробити або дати дані. Як офіціант у ресторані: ви не йдете на кухню, а робите замовлення тому, хто знає правила. Для сайту це спосіб приймати оплату, рахувати доставку і передавати заявки в CRM без ручної роботи.",
        ru: "API — это посредник, через которого одна программа просит другую что-то сделать или дать данные. Как официант в ресторане: вы не идёте на кухню, а делаете заказ тому, кто знает правила. Для сайта это способ принимать оплату, считать доставку и передавать заявки в CRM без ручной работы.",
        en: "An API is an intermediary through which one program asks another to do something or to hand over data. Like a waiter in a restaurant: you don't go into the kitchen, you order through someone who knows the rules. For a website it means taking payments, calculating delivery and pushing leads into a CRM without manual work.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує підключити API до сайту?",
        ru: "Сколько стоит подключить API к сайту?",
        en: "How much does it cost to connect an API?",
      },
      answer: {
        _type: "localizedText",
        uk: "Типова інтеграція — $200–500: оплата, Нова Пошта, CRM зі стандартними полями, сповіщення в Telegram. Складні випадки — $1 000–3 000: двостороння синхронізація залишків, стара облікова система, нестандартна логіка. Точна цифра залежить від якості документації сервісу, а не від бажання підрядника.",
        ru: "Типовая интеграция — $200–500: оплата, Новая Почта, CRM со стандартными полями, уведомления в Telegram. Сложные случаи — $1 000–3 000: двусторонняя синхронизация остатков, старая учётная система, нестандартная логика. Точная цифра зависит от качества документации сервиса, а не от желания подрядчика.",
        en: "A typical integration is $200–500: payments, a courier, a CRM with standard fields, Telegram alerts. Complex cases run $1,000–3,000: two-way stock sync, a legacy accounting system, non-standard logic. The exact number depends on the quality of the provider's documentation more than on anything else.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи безпечно віддавати API-ключі розробнику?",
        ru: "Безопасно ли отдавать API-ключи разработчику?",
        en: "Is it safe to give API keys to a developer?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, якщо ключі створює власник акаунта і передає їх у захищений спосіб, а не в месенджері відкритим текстом. Ключі мають зберігатися на сервері у змінних оточення, ніколи не потрапляти в код фронтенду і оновлюватися після завершення співпраці з підрядником.",
        ru: "Да, если ключи создаёт владелец аккаунта и передаёт их защищённым способом, а не в мессенджере открытым текстом. Ключи должны храниться на сервере в переменных окружения, никогда не попадать в код фронтенда и обновляться после завершения работы с подрядчиком.",
        en: "Yes, provided the account owner creates the keys and shares them securely rather than pasting them into a chat. Keys must live on the server in environment variables, never reach front-end code, and be rotated once a contractor's work is finished.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чим API відрізняється від CMS?",
        ru: "Чем API отличается от CMS?",
        en: "What is the difference between an API and a CMS?",
      },
      answer: {
        _type: "localizedText",
        uk: "CMS — це система, у якій ви самі редагуєте тексти, товари і сторінки сайту. API — це канал обміну даними між вашим сайтом та іншими сервісами. CMS відповідає за контент, API — за автоматизацію: вони не замінюють одне одного, а працюють разом.",
        ru: "CMS — это система, в которой вы сами редактируете тексты, товары и страницы сайта. API — это канал обмена данными между вашим сайтом и другими сервисами. CMS отвечает за контент, API — за автоматизацию: они не заменяют друг друга, а работают вместе.",
        en: "A CMS is where you edit your own text, products and pages. An API is the channel through which your site exchanges data with other services. The CMS handles content, the API handles automation — they complement each other rather than compete.",
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
