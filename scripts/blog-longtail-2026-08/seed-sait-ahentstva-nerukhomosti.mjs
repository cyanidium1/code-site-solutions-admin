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
  tldr("Коротко: сайт для агенції нерухомості", [
    "Рієлтору для особистого бренду вистачить лендінгу від $800; агенції потрібен каталог об'єктів від $3 500; платформа з кабінетами — від $6 000.",
    "Ядро сайту — каталог з фільтрами за районом, ціною, кількістю кімнат і типом угоди. Повільні фільтри вбивають конверсію.",
    "Картка об'єкта продає перегляд: галерея, планування, карта з інфраструктурою, чесна ціна і кнопка «Записатися на перегляд».",
    "Фід на OLX і DOM.RIA заповнюється з сайту автоматично: об'єкт вносите один раз, а не тричі. Типова інтеграція — $200–500.",
    "Заявки мають падати в CRM зі статусами й джерелом ліда, інакше половина звернень губиться у Viber-чатах.",
  ]),
  p("Сайт для агенції нерухомості — це каталог об'єктів з фільтрами за районом, ціною та кількістю кімнат, продумані картки з галереями й картою, автоматичне вивантаження оголошень на OLX і DOM.RIA та CRM, яка ловить кожну заявку. Така вітрина агенції коштує **від $3 500**, платформа з особистими кабінетами рієлторів — **від $6 000**, а лендінг для одного рієлтора — від $800."),
  p("Більшість українських агенцій живе на порталах оголошень. Це працює, але має стелю: у видачі OLX ви — один із сотні однакових рядків, платите за підняття, а клієнт запам'ятовує портал, не вас. Власний сайт перевертає модель: об'єкти працюють на ваш бренд, контакти лишаються у вашій базі, а Google поступово приводить безкоштовний трафік за запитами «купити квартиру + район»."),
  p("У цій статті розберемо, з чого складається робочий сайт нерухомості: формати й ціни, фільтри каталогу, обов'язкові блоки картки об'єкта, фіди на портали, CRM і вибір між особистим брендом рієлтора та сайтом агенції."),

  h2("Три формати: сайт рієлтора, каталог агенції, портал"),
  p("Перше рішення — не дизайн і не CMS, а формат. Від нього залежить бюджет, термін і те, як сайт житиме далі. Ми в [Code-Site.Art](/sites-for/real-estate) розводимо проєкти нерухомості на три типи."),
  table(
    ["Формат", "Що входить", "Ціна", "Термін"],
    [
      ["**Лендінг рієлтора**", "Особистий бренд, 5–10 топ-об'єктів, відгуки, форма заявки, Instagram-інтеграція", "від $800", "2–3 тижні"],
      ["**Каталог агенції**", "50–500 об'єктів, фільтри, картки з галереями, фіди на портали, блог, SEO-структура", "від $3 500", "4–6 тижнів"],
      ["**Платформа / портал**", "Кабінети рієлторів і власників, модерація оголошень, тарифи, платежі, API", "від $6 000", "8–12 тижнів"],
    ],
  ),
  p("Каталог агенції — найчастіший вибір: це по суті [корпоративний сайт](/corporate-site) з базою об'єктів і фідами. Портал має сенс, коли ви агрегуєте чужі об'єкти або будуєте мережу франчайзі — це вже продукт, а не вітрина."),
  p("Швидкий тест, який формат ваш:"),
  num("Продаєте власну базу об'єктів силами команди до 15 рієлторів — беріть каталог агенції."),
  num("Працюєте сам на себе і ведете клієнтів з Instagram та рекомендацій — почніть з лендінгу, каталог додасте пізніше."),
  num("Плануєте заробляти на розміщенні чужих оголошень і тарифах — рахуйте бізнес-модель порталу, а не сайту-вітрини."),

  h2("Каталог об'єктів: фільтри, якими реально користуються"),
  p("Каталог — це 80 % цінності сайту нерухомості. Головна помилка — зробити його «як на порталі», з тридцятьма фільтрами, якими ніхто не користується, і які гальмують сторінку."),
  h3("Базовий набір, без якого каталог не працює"),
  li("Тип угоди: продаж або оренда — це перший клік користувача."),
  li("Тип об'єкта: квартира, будинок, комерція, земля."),
  li("Район, вулиця або станція метро — з підказками під час введення."),
  li("Ціна «від–до» з перемикачем валюти."),
  li("Кількість кімнат і загальна площа."),
  h3("Що додати другим кроком"),
  li("Новобудова чи вторинка, поверх і поверховість, стан ремонту."),
  li("Пошук по карті: користувач малює область — бачить об'єкти в ній."),
  li("Збережені пошуки з e-mail-сповіщенням про нові об'єкти — це повторні візити безкоштовно."),
  p("І два слова про мобільні: фільтри мають розкриватися окремим екраном з кнопкою «Показати 43 об'єкти», а не десктопною бічною панеллю, стиснутою до нечитабельності. Понад дві третини переглядів нерухомості відбувається з телефона — саме мобільний сценарій треба тестувати першим."),
  p("Технічна вимога, про яку забувають: кожна комбінація «тип + район» повинна мати власну індексовану URL-адресу на кшталт /kvartyry/pechersk. Саме такі сторінки збирають пошуковий трафік — як це працює, ми розбираємо в послузі [SEO-просування](/seo)."),

  cta(
    "Порахуйте вартість сайту з каталогом",
    "Відповідте на 8 запитань — калькулятор збере кошторис під вашу кількість об'єктів та інтеграції.",
    "Відкрити калькулятор",
    "/calculator",
  ),

  h2("Картка об'єкта: що має бути обов'язково"),
  p("Рішення про перегляд ухвалюється на картці об'єкта. Якщо там п'ять темних фото і два рядки тексту — жодні фільтри не допоможуть. Ось перевірений мінімум."),
  table(
    ["Блок картки", "Навіщо він"],
    [
      ["**Галерея 10–20 фото**", "Перший фільтр покупця. Горизонтальні, світлі, з підписами кімнат."],
      ["**Планування**", "Друге за клікабельністю зображення після фасаду. Без нього — дзвінок із зайвим запитанням."],
      ["**Карта + інфраструктура**", "Школи, метро, магазини поруч. Знімає головне заперечення «а що навколо?»."],
      ["**Ціна та умови**", "Чесна ціна, комісія, торг. Картки «ціна за запитом» втрачають до половини звернень."],
      ["**Характеристики списком**", "Площа, поверх, опалення, рік будинку — сканується за 10 секунд."],
      ["**Кнопка «Записатися на перегляд»**", "Конкретна дія конвертує краще за абстрактне «Зв'язатися»."],
      ["**Рієлтор з фото і телефоном**", "Людина довіряє людині, а не логотипу. Плюс месенджери в один клік."],
    ],
  ),
  p("Додатковий бал — блок «Схожі об'єкти» внизу картки: він повертає користувача в каталог замість виходу з сайту."),

  h2("Вивантаження на OLX, DOM.RIA та фіди"),
  p("Агенція з 200 об'єктами без автоматизації вносить кожен об'єкт тричі: на сайт, на OLX, на DOM.RIA. Це години ручної роботи щодня і неминучі розбіжності в цінах."),
  p("Рішення — XML-фіди: об'єкт заповнюється один раз в адмінці сайту, а портали забирають дані автоматично. Зняли об'єкт з продажу — він зник усюди. Типова інтеграція фіда коштує **$200–500**; двостороння синхронізація з CRM або обмін із забудовниками — це вже **$1 000–3 000**, залежно від API."),
  p("Окремий бонус: той самий фід підключається до Facebook Catalog — і ваші об'єкти показуються в динамічному ретаргетингу тим, хто вже дивився їх на сайті."),

  h2("Фото, тексти та швидкість: контент, який продає"),
  p("Найкращий каталог не врятує погані фото. Домовтеся про стандарт контенту ще до запуску сайту — це безкоштовно піднімає конверсію кожної картки."),
  li("Фото: горизонтальні, при денному світлі, мінімум 10 на об'єкт. Перше фото — фасад або найкраща кімната, а не санвузол."),
  li("Опис: 500–800 знаків живого тексту без «шикарної квартири вашої мрії». Унікальні описи ще й індексуються Google — скопійовані з OLX ні."),
  li("Відео-огляд або 3D-тур для об'єктів дорожчих за середній чек: він відсіює «туристів» і економить виїзди рієлтора."),
  li("Швидкість: сторінка каталогу має відкриватися до 2 секунд на телефоні, інакше користувач повертається на портал."),
  p("Ці вимоги ми закладаємо в технічне завдання й адмінку: обов'язкові поля, мінімальна кількість фото, автоматичне стискання зображень до сучасних форматів."),

  h2("CRM і обробка лідів: де губляться заявки"),
  p("Типова картина: заявки з сайту падають на пошту, дзвінки — у мобільні рієлторів, повідомлення — в особисті Viber. Через місяць ніхто не скаже, скільки лідів було і скільки з них дійшло до перегляду."),
  num("Кожна форма сайту пише лід у CRM з позначкою об'єкта і джерела трафіку."),
  num("Новий лід автоматично призначається рієлтору — і той отримує сповіщення в месенджер."),
  num("Статуси угоди: новий → дзвінок → перегляд → завдаток → угода. Видно, де вирва протікає."),
  num("Наскрізна аналітика: скільки коштував лід з Google, скільки — з Instagram."),
  p("Ми інтегруємо сайти з KeyCRM, NetHunt, Pipedrive та іншими системами — заявка з картки об'єкта опиняється в CRM за секунди, з UTM-мітками та посиланням на об'єкт."),
  p("Окремий шар — колтрекінг: підмінні номери показують, з якої сторінки і за яким оголошенням подзвонив клієнт. У нерухомості, де 60–70 % звернень — це дзвінки, без колтрекінгу аналітика сліпа на одне око."),

  h2("Особистий бренд рієлтора чи сайт агенції?"),
  p("Питання, яке ставлять постійно. Відповідь залежить від того, хто «володіє» клієнтом. Якщо клієнти приходять на конкретного експерта з Instagram і рекомендацій — працює лендінг рієлтора від $800: обличчя, кейси, відгуки, добірка топ-об'єктів."),
  p("Якщо ж бренд — це агенція з командою і потоком об'єктів, потрібен каталог: клієнт шукає «двокімнатну на Позняках», а не конкретного рієлтора. Найсильніша зв'язка — сайт агенції плюс сторінки-профілі рієлторів усередині нього: агенція отримує SEO-трафік, рієлтори — особисту вітрину для соцмереж."),

  h2("Скільки це коштує і як скласти свій кошторис"),
  p("Орієнтири Code-Site.Art: каталог агенції — **від $3 500**, платформа з кабінетами — **від $6 000**, лендінг рієлтора — від $800. Технічна підтримка після запуску — $200/міс або $40/год, SEO-просування — від $300/міс. Актуальні пакети зібрані на сторінці [цін](/pricing)."),
  p("Фінальна цифра залежить від трьох речей: кількість об'єктів і мов, склад інтеграцій (фіди, CRM, телефонія) та обсяг дизайну. Детальний розбір, з чого складається бюджет, — у статті [скільки коштує розробка сайту у 2026](/blog/vartist-rozrobky-saytu-2026)."),
  p("Щоб не переплатити, зафіксуйте в брифі три цифри ще до старту: скільки об'єктів переносити на запуску, скільки мовних версій потрібно і які системи вже використовує відділ продажів. Саме ці три пункти найчастіше подвоюють кошторис посеред проєкту."),

  h2("Приклади: що ми будували для нерухомості й суміжних ніш"),
  p("Механіка «каталог + картка + заявка» у нас відпрацьована на проєктах будівництва й ремонту. [Solide Renovation](/portfolio/solide-renovation) — сайт ремонтної компанії з калькулятором і портфоліо об'єктів; [NBYG København](/portfolio/nbyg-kobenhavn) — данський будівельний підрядник з каталогом послуг; [Domlivo](/portfolio/domlivo) — виробник модульних будинків із фільтрованим каталогом моделей."),
  p("Для агенції нерухомості ця ж архітектура доповнюється фідами на портали і CRM — що саме входить у нішеве рішення, дивіться на сторінці [сайти для нерухомості](/sites-for/real-estate)."),

  cta(
    "Готові запустити сайт агенції?",
    "Покажемо структуру каталогу під вашу базу об'єктів і зберемо кошторис за 24 години.",
    "Розрахувати проєкт",
    "/calculator",
  ),
];

const bodyRu = [
  tldr("Коротко: создание сайта агентства недвижимости", [
    "Риелтору-одиночке достаточно лендинга от $800; агентству нужен каталог объектов от $3 500; платформа с кабинетами — от $6 000.",
    "Сердце сайта — каталог с фильтрами по району, цене, комнатам и типу сделки. Медленные фильтры убивают конверсию.",
    "Карточка объекта продаёт просмотр: галерея, планировка, карта с инфраструктурой и кнопка «Записаться на просмотр».",
    "Фиды на OLX и DOM.RIA заполняются с сайта автоматически: объект вносится один раз. Типовая интеграция — $200–500.",
    "Заявки должны попадать в CRM со статусами и источником лида — иначе половина обращений теряется в мессенджерах.",
  ]),
  p("Создание сайта агентства недвижимости — это каталог объектов с фильтрами по району, цене и количеству комнат, продающие карточки с галереями и картой, автоматическая выгрузка объявлений на OLX и DOM.RIA и CRM, которая фиксирует каждую заявку. Витрина агентства стоит **от $3 500**, платформа с личными кабинетами риелторов — **от $6 000**, лендинг для одного риелтора — от $800."),
  p("Порталы объявлений дают поток, но у него есть потолок: в выдаче OLX вы — одна из сотни одинаковых строк, платите за поднятия, а клиент запоминает портал, а не вас. Собственный сайт для недвижимости меняет модель: объекты работают на ваш бренд, контакты остаются в вашей базе, а Google постепенно приводит бесплатный трафик по запросам «купить квартиру + район»."),
  p("Разберём по шагам: форматы и цены, фильтры каталога, обязательные блоки карточки объекта, фиды на порталы, CRM и выбор между личным брендом риелтора и сайтом агентства."),

  h2("Три формата: сайт риелтора, каталог агентства, портал"),
  p("Первое решение — не дизайн и не CMS, а формат. От него зависят бюджет, сроки и то, как сайт будет жить дальше. В [Code-Site.Art](/ru/sites-for/real-estate) мы делим проекты недвижимости на три типа."),
  table(
    ["Формат", "Что входит", "Цена", "Срок"],
    [
      ["**Лендинг риелтора**", "Личный бренд, 5–10 топ-объектов, отзывы, форма заявки, интеграция с Instagram", "от $800", "2–3 недели"],
      ["**Каталог агентства**", "50–500 объектов, фильтры, карточки с галереями, фиды на порталы, блог, SEO-структура", "от $3 500", "4–6 недель"],
      ["**Платформа / портал**", "Кабинеты риелторов и собственников, модерация объявлений, тарифы, платежи, API", "от $6 000", "8–12 недель"],
    ],
  ),
  p("Каталог агентства — самый частый выбор: по сути это [корпоративный сайт](/ru/corporate-site) с базой объектов и фидами. Портал имеет смысл, когда вы агрегируете чужие объекты или строите сеть франчайзи — это уже продукт, а не витрина."),
  p("Быстрый тест, какой формат ваш:"),
  num("Продаёте собственную базу объектов командой до 15 риелторов — берите каталог агентства."),
  num("Работаете сами на себя и ведёте клиентов из Instagram и по рекомендациям — начните с лендинга, каталог добавите позже."),
  num("Планируете зарабатывать на размещении чужих объявлений и тарифах — считайте бизнес-модель портала, а не сайта-витрины."),

  h2("Каталог объектов: фильтры, которыми реально пользуются"),
  p("Каталог — это 80 % ценности сайта недвижимости. Главная ошибка — скопировать портал: тридцать фильтров, которыми никто не пользуется и которые тормозят страницу."),
  h3("Базовый набор, без которого каталог не работает"),
  li("Тип сделки: продажа или аренда — это первый клик пользователя."),
  li("Тип объекта: квартира, дом, коммерция, участок."),
  li("Район, улица или станция метро — с подсказками при вводе."),
  li("Цена «от–до» с переключателем валюты."),
  li("Количество комнат и общая площадь."),
  h3("Что добавить вторым шагом"),
  li("Новостройка или вторичка, этаж и этажность, состояние ремонта."),
  li("Поиск по карте: пользователь рисует область — видит объекты внутри неё."),
  li("Сохранённые поиски с e-mail-уведомлением о новых объектах — бесплатные повторные визиты."),
  p("И два слова про мобильные: фильтры должны раскрываться отдельным экраном с кнопкой «Показать 43 объекта», а не десктопной боковой панелью, сжатой до нечитаемости. Больше двух третей просмотров недвижимости происходит с телефона — мобильный сценарий тестируйте первым."),
  p("Техническое требование, о котором забывают: каждая комбинация «тип + район» должна иметь свой индексируемый URL вида /kvartiry/pechersk. Именно такие страницы собирают поисковый трафик — как это устроено, разбираем в услуге [SEO-продвижение](/ru/seo), а для офиса агентства работает ещё и [локальное SEO в Google Maps](/ru/blog/lokalnoe-seo-top-3-google-maps)."),

  cta(
    "Посчитайте стоимость сайта с каталогом",
    "Ответьте на 8 вопросов — калькулятор соберёт смету под ваше количество объектов и интеграции.",
    "Открыть калькулятор",
    "/ru/calculator",
  ),

  h2("Карточка объекта: обязательные блоки"),
  p("Решение о просмотре принимается на карточке. Если там пять тёмных фото и две строки текста — никакие фильтры не спасут. Проверенный минимум выглядит так."),
  table(
    ["Блок карточки", "Зачем он нужен"],
    [
      ["**Галерея 10–20 фото**", "Первый фильтр покупателя. Горизонтальные, светлые, с подписями комнат."],
      ["**Планировка**", "Второе по кликабельности изображение после фасада. Без неё — лишний звонок с вопросом."],
      ["**Карта + инфраструктура**", "Школы, метро, магазины рядом. Снимает главное возражение «а что вокруг?»."],
      ["**Цена и условия**", "Честная цена, комиссия, торг. Карточки «цена по запросу» теряют до половины обращений."],
      ["**Характеристики списком**", "Площадь, этаж, отопление, год дома — сканируется за 10 секунд."],
      ["**Кнопка «Записаться на просмотр»**", "Конкретное действие конвертирует лучше абстрактного «Связаться»."],
      ["**Риелтор с фото и телефоном**", "Человек доверяет человеку, а не логотипу. Плюс мессенджеры в один клик."],
    ],
  ),
  p("Дополнительный балл — блок «Похожие объекты» внизу карточки: он возвращает пользователя в каталог вместо выхода с сайта."),

  h2("Выгрузка на OLX, DOM.RIA и фиды"),
  p("Агентство с 200 объектами без автоматизации вносит каждый объект трижды: на сайт, на OLX, на DOM.RIA. Это часы ручной работы ежедневно и неизбежные расхождения в ценах."),
  p("Решение — XML-фиды: объект заполняется один раз в админке сайта, порталы забирают данные автоматически. Сняли объект с продажи — он исчез везде. Типовая интеграция фида стоит **$200–500**; двусторонняя синхронизация с CRM или обмен с застройщиками — уже **$1 000–3 000**, в зависимости от API."),
  p("Бонус: тот же фид подключается к Facebook Catalog — и объекты догоняют в динамическом ретаргетинге тех, кто уже смотрел их на сайте."),

  h2("Фото, тексты и скорость: контент, который продаёт"),
  p("Лучший каталог не спасёт плохие фото. Договоритесь о стандарте контента ещё до запуска сайта — это бесплатно поднимает конверсию каждой карточки."),
  li("Фото: горизонтальные, при дневном свете, минимум 10 на объект. Первое фото — фасад или лучшая комната, а не санузел."),
  li("Описание: 500–800 знаков живого текста без «шикарной квартиры вашей мечты». Уникальные описания ещё и индексируются Google — скопированные с OLX нет."),
  li("Видеообзор или 3D-тур для объектов дороже среднего чека: он отсеивает «туристов» и экономит выезды риелтора."),
  li("Скорость: страница каталога должна открываться до 2 секунд на телефоне, иначе пользователь возвращается на портал."),
  p("Эти требования мы закладываем в техзадание и админку: обязательные поля, минимальное количество фото, автоматическое сжатие изображений до современных форматов."),

  h2("CRM и обработка лидов: где теряются заявки"),
  p("Типичная картина: заявки с сайта падают на почту, звонки — на мобильные риелторов, сообщения — в личные Viber. Через месяц никто не скажет, сколько лидов было и сколько дошло до просмотра."),
  num("Каждая форма сайта пишет лид в CRM с пометкой объекта и источника трафика."),
  num("Новый лид автоматически назначается риелтору — с уведомлением в мессенджер."),
  num("Статусы сделки: новый → звонок → просмотр → задаток → сделка. Видно, где течёт воронка."),
  num("Сквозная аналитика: сколько стоил лид из Google и сколько — из Instagram."),
  p("Мы интегрируем сайты с KeyCRM, NetHunt, Pipedrive и другими системами — заявка с карточки объекта оказывается в CRM за секунды, с UTM-метками и ссылкой на объект."),
  p("Отдельный слой — коллтрекинг: подменные номера показывают, с какой страницы и по какому объявлению позвонил клиент. В недвижимости, где 60–70 % обращений — звонки, без коллтрекинга аналитика слепа на один глаз."),

  h2("Личный бренд риелтора или сайт агентства?"),
  p("Вопрос, который задают постоянно. Ответ зависит от того, кто «владеет» клиентом. Если клиенты приходят на конкретного эксперта из Instagram и по рекомендациям — работает лендинг риелтора от $800: лицо, кейсы, отзывы, подборка топ-объектов."),
  p("Если бренд — это агентство с командой и потоком объектов, нужен каталог: клиент ищет «двушку на Позняках», а не конкретного риелтора. Самая сильная связка — сайт агентства плюс страницы-профили риелторов внутри него: агентство получает SEO-трафик, риелторы — личную витрину для соцсетей."),

  h2("Сколько стоит и как собрать свою смету"),
  p("Ориентиры Code-Site.Art: каталог агентства — **от $3 500**, платформа с кабинетами — **от $6 000**, лендинг риелтора — от $800. Техподдержка после запуска — $200/мес или $40/час, SEO-продвижение — от $300/мес. Актуальные пакеты — на странице [цен](/ru/pricing)."),
  p("Итоговая цифра зависит от трёх вещей: количество объектов и языков, состав интеграций (фиды, CRM, телефония) и объём дизайна. Подробный разбор бюджета — в статье [сколько стоит сайт в 2026](/ru/blog/skolko-stoit-sayt-2026)."),
  p("Чтобы не переплатить, зафиксируйте в брифе три цифры до старта: сколько объектов переносить на запуске, сколько языковых версий нужно и какие системы уже использует отдел продаж. Именно эти три пункта чаще всего удваивают смету посреди проекта."),

  h2("Примеры: что мы строили для недвижимости и смежных ниш"),
  p("Механика «каталог + карточка + заявка» отработана у нас на проектах стройки и ремонта. [Solide Renovation](/ru/portfolio/solide-renovation) — сайт ремонтной компании с калькулятором и портфолио объектов; [NBYG København](/ru/portfolio/nbyg-kobenhavn) — датский строительный подрядчик с каталогом услуг; [Domlivo](/ru/portfolio/domlivo) — производитель модульных домов с фильтруемым каталогом моделей."),
  p("Для агентства недвижимости та же архитектура дополняется фидами на порталы и CRM — состав нишевого решения смотрите на странице [сайты для недвижимости](/ru/sites-for/real-estate)."),

  cta(
    "Готовы запустить сайт агентства?",
    "Покажем структуру каталога под вашу базу объектов и соберём смету за 24 часа.",
    "Рассчитать проект",
    "/ru/calculator",
  ),
];

const bodyEn = [
  tldr("In short: real estate agency websites", [
    "A solo agent needs a personal landing page from $800; an agency needs a property catalogue site from $3,500; a multi-user platform starts at $6,000.",
    "The core of the site is a listings catalogue with filters by area, price, bedrooms and deal type. Slow filters kill conversion.",
    "A property page sells the viewing: gallery, floor plan, map with local amenities, honest pricing and a “Book a viewing” button.",
    "Portal feeds push your listings to marketplaces automatically — enter a property once, not three times. A typical feed integration is $200–500.",
    "Every enquiry should land in a CRM with a status and traffic source — otherwise half your leads die in inboxes.",
  ]),
  p("Good real estate website design comes down to four things: a listings catalogue with fast filters by area, price and bedrooms, property pages that sell the viewing, automatic feeds to property portals, and a CRM that captures every enquiry. An agency showcase site costs **from $3,500**, a platform with agent accounts starts at **$6,000**, and a personal agent site starts at $800."),
  p("Portals like Rightmove, Zoopla or Zillow bring volume, but you are one of a hundred identical rows there, you pay for visibility, and the buyer remembers the portal — not your agency. Your own real estate agency website flips the model: listings build your brand, contacts stay in your database, and Google gradually sends free traffic for “2-bed flat + area” searches."),
  p("Below we break down what a working real estate site consists of: formats and prices, catalogue filters, the must-have blocks of a property page, portal feeds, CRM, and the personal-brand-vs-agency question. We are a studio based in Ukraine — European quality at sensible rates, working with clients across the UK, EU and Scandinavia."),

  h2("Three formats: agent site, agency catalogue, portal"),
  p("The first decision is not the design or the CMS — it is the format. It defines the budget, the timeline and how the site will live afterwards. At [Code-Site.Art](/en/sites-for/real-estate) we split real estate projects into three types."),
  table(
    ["Format", "What's included", "Price", "Timeline"],
    [
      ["**Agent landing page**", "Personal brand, 5–10 featured listings, testimonials, enquiry form, Instagram feed", "from $800", "2–3 weeks"],
      ["**Agency catalogue**", "50–500 listings, filters, gallery pages, portal feeds, blog, SEO architecture", "from $3,500", "4–6 weeks"],
      ["**Platform / portal**", "Agent and landlord accounts, listing moderation, paid plans, payments, API", "from $6,000", "8–12 weeks"],
    ],
  ),
  p("The agency catalogue is the most common choice: essentially a [corporate website](/en/corporate-site) with a property database and feeds on top. A portal only makes sense when you aggregate third-party listings or run a franchise network — that is a product, not a showcase."),

  h2("The catalogue: filters people actually use"),
  p("The catalogue is 80% of a real estate site's value. The classic mistake is copying a portal: thirty filters nobody touches, each one slowing the page down."),
  h3("The baseline set"),
  li("Deal type: sale or rent — the user's first click."),
  li("Property type: flat, house, commercial, land."),
  li("Area, street or transport link — with autocomplete suggestions."),
  li("Price range with a currency switcher."),
  li("Bedrooms and total floor area."),
  h3("What to add next"),
  li("New build vs resale, floor level, condition."),
  li("Map search: the user draws an area and sees the listings inside it."),
  li("Saved searches with e-mail alerts for new listings — free repeat visits."),
  p("One technical requirement agencies forget: every “type + area” combination should get its own indexable URL, like /flats/kensington. Those pages are what capture search traffic — we cover the mechanics in our [SEO service](/en/seo), and for the agency office itself in [local SEO for Google Maps](/en/blog/local-seo-google-maps-top-3)."),

  cta(
    "Price up a catalogue website",
    "Answer 8 questions — the calculator builds an estimate for your listing volume and integrations.",
    "Open the calculator",
    "/en/calculator",
  ),

  h2("The property page: non-negotiable blocks"),
  p("The decision to book a viewing happens on the property page. Five dark photos and two lines of text will waste everything the filters achieved. Here is the proven minimum."),
  table(
    ["Property page block", "Why it matters"],
    [
      ["**Gallery of 10–20 photos**", "The buyer's first filter. Landscape, well-lit, labelled by room."],
      ["**Floor plan**", "The second most-clicked image after the facade. Without it — an avoidable phone call."],
      ["**Map + amenities**", "Schools, transport, shops nearby. Answers the core objection: “what's around it?”"],
      ["**Price and terms**", "Honest price, fees, negotiability. “Price on request” pages lose up to half their enquiries."],
      ["**Key facts list**", "Area, floor, heating, year built — scannable in 10 seconds."],
      ["**“Book a viewing” button**", "A concrete action converts better than a vague “Contact us”."],
      ["**Agent with photo and phone**", "People trust people, not logos. Plus one-tap messengers."],
    ],
  ),
  p("Bonus points for a “Similar properties” block at the bottom — it sends the user back into the catalogue instead of off the site."),

  h2("Portal feeds and syndication"),
  p("An agency with 200 listings and no automation enters every property three times: on the site, then on each portal. That is hours of manual work daily and inevitable price mismatches."),
  p("The fix is XML feeds: a listing is entered once in the site admin, and portals pull the data automatically. Take a property off the market — it disappears everywhere. A typical feed integration costs **$200–500**; two-way CRM sync or developer data exchange runs **$1,000–3,000** depending on the API."),
  p("The same feed also plugs into Facebook Catalog, so your listings retarget the exact people who viewed them on your site."),

  h2("CRM and lead handling: where enquiries die"),
  p("The usual picture: form submissions go to a shared inbox, calls hit agents' mobiles, messages land in personal WhatsApp. A month later nobody can say how many leads came in or how many reached a viewing."),
  num("Every form writes the lead to a CRM tagged with the property and traffic source."),
  num("New leads are auto-assigned to an agent, with an instant messenger notification."),
  num("Pipeline statuses: new → call → viewing → offer → deal. You can see where the funnel leaks."),
  num("End-to-end analytics: what a lead from Google costs versus one from Instagram."),
  p("We integrate sites with Pipedrive, HubSpot, NetHunt and similar systems — an enquiry from a property page lands in the CRM within seconds, with UTM tags and a link to the listing."),

  h2("Personal agent brand or agency website?"),
  p("If clients come to a specific expert via Instagram and referrals, a personal landing page from $800 does the job: face, track record, testimonials, a curated set of featured listings."),
  p("If the brand is an agency with a team and a listings pipeline, you need the catalogue: buyers search for “2-bed flat in a specific area”, not for a particular agent. The strongest combination is an agency site with agent profile pages inside it — the agency wins the SEO traffic, and each agent gets a personal showcase to link from social media."),

  h2("What it costs and how to budget"),
  p("Code-Site.Art benchmarks: an agency catalogue from **$3,500**, a platform with accounts from **$6,000**, an agent landing page from $800. Post-launch support is $200/month or $40/hour, SEO from $300/month. Current packages are on the [pricing page](/en/pricing)."),
  p("The final figure depends on three things: the number of listings and languages, the integration stack (feeds, CRM, telephony) and the amount of custom design. For a full budget breakdown, see [what a custom website costs in 2026](/en/blog/custom-website-cost-uk-2026)."),

  h2("Examples from our portfolio"),
  p("The “catalogue + detail page + enquiry” mechanics are battle-tested on our construction and property projects. [Solide Renovation](/en/portfolio/solide-renovation) is a renovation company site with a cost calculator and project portfolio; [NBYG København](/en/portfolio/nbyg-kobenhavn) is a Danish building contractor with a service catalogue; [Domlivo](/en/portfolio/domlivo) is a modular home manufacturer with a filterable model catalogue."),
  p("For a real estate agency the same architecture gains portal feeds and CRM — see the full scope on our [real estate websites](/en/sites-for/real-estate) page."),

  cta(
    "Ready to launch your agency website?",
    "We'll map the catalogue structure to your listings database and send an estimate within 24 hours.",
    "Get an estimate",
    "/en/calculator",
  ),
];

const doc = {
  _id: "ltAug2026-sait-ahentstva-nerukhomosti",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-ahentsii-nerukhomosti" },
    ru: { _type: "slug", current: "sayt-agentstva-nedvizhimosti" },
    en: { _type: "slug", current: "real-estate-agency-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для агенції нерухомості: каталог об'єктів, фільтри, ліди",
    ru: "Создание сайта агентства недвижимости: каталог, фильтры, лиды",
    en: "Real Estate Agency Website: Catalogue, Filters and Leads",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для агенції нерухомості: каталог і ціни 2026",
    ru: "Создание сайта агентства недвижимости: цены 2026",
    en: "Real Estate Website Design: Features & Costs 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для агенції нерухомості з каталогом і фільтрами. ✔️ Вивантаження на OLX/DOM.RIA ✔️ CRM і ліди ✔️ Від $3 500. ➡ Розрахуйте вартість!",
    ru: "➤ Создание сайта агентства недвижимости: каталог, фильтры, CRM. ✔️ Выгрузка на OLX/DOM.RIA ✔️ От $3 500 ✔️ Срок 4–6 недель. ➡ Рассчитайте стоимость!",
    en: "➤ Real estate website design: property catalogue, filters, CRM. ✔️ Portal feeds ✔️ Lead capture ✔️ From $3,500. ➡ Get your estimate in 2 minutes!",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Нерухомість",
    ru: "Недвижимость",
    en: "Real Estate",
  },
  lede: {
    _type: "localizedString",
    uk: "Каталог з фільтрами, картки об'єктів, фіди на OLX і DOM.RIA та CRM для лідів: розбираємо, з чого складається сайт агенції нерухомості, скільки він коштує і коли рієлтору вистачить лендінгу.",
    ru: "Каталог с фильтрами, карточки объектов, фиды на OLX и DOM.RIA и CRM для лидов: разбираем, из чего состоит сайт агентства недвижимости, сколько он стоит и когда риелтору хватит лендинга.",
    en: "Listings catalogue with filters, property pages, portal feeds and a CRM for leads: what goes into a real estate agency website, what it costs, and when a solo agent only needs a landing page.",
  },
  tags: ["нерухомість", "каталог об'єктів", "real estate", "CRM"],
  relatedPostSlugs: ["sait-dlia-budivelnoi-kompanii-2026", "vartist-rozrobky-saytu-2026", "lokalne-seo-top-3-google-maps"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для агенції нерухомості?",
        ru: "Сколько стоит сайт агентства недвижимости?",
        en: "How much does a real estate agency website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Каталог агенції з фільтрами й фідами на портали коштує від $3 500, платформа з особистими кабінетами рієлторів — від $6 000. Лендінг для одного рієлтора — від $800. Фінальна ціна залежить від кількості об'єктів, мов та інтеграцій.",
        ru: "Каталог агентства с фильтрами и фидами на порталы стоит от $3 500, платформа с личными кабинетами риелторов — от $6 000. Лендинг для одного риелтора — от $800. Итоговая цена зависит от количества объектов, языков и интеграций.",
        en: "An agency catalogue with filters and portal feeds starts at $3,500; a platform with agent accounts starts at $6,000. A personal agent landing page starts at $800. The final price depends on listing volume, languages and integrations.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен рієлтору окремий сайт, якщо є сайт агенції?",
        ru: "Нужен ли риелтору отдельный сайт, если есть сайт агентства?",
        en: "Does a solo agent need a separate website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Якщо клієнти приходять на особистий бренд з Instagram і рекомендацій — так, лендінг від $800 з кейсами, відгуками й топ-об'єктами окупається. Оптимальна зв'язка — сайт агенції зі сторінками-профілями рієлторів усередині: SEO-трафік отримує агенція, а кожен рієлтор — особисту вітрину.",
        ru: "Если клиенты приходят на личный бренд из Instagram и по рекомендациям — да, лендинг от $800 с кейсами, отзывами и топ-объектами окупается. Оптимальная связка — сайт агентства со страницами-профилями риелторов внутри: SEO-трафик получает агентство, а каждый риелтор — личную витрину.",
        en: "If clients come to a personal brand via Instagram and referrals — yes, a landing page from $800 with a track record, testimonials and featured listings pays off. The optimal setup is an agency site with agent profile pages inside: the agency wins SEO traffic, each agent gets a personal showcase.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як об'єкти потрапляють на сайт і на портали?",
        ru: "Как объекты попадают на сайт и на порталы?",
        en: "How do listings get onto the site and the portals?",
      },
      answer: {
        _type: "localizedText",
        uk: "Об'єкт вносять один раз — в адмінку сайту або одразу в CRM. Далі XML-фід автоматично передає його на OLX, DOM.RIA та у Facebook Catalog. Зняли об'єкт з продажу — він зникає всюди. Типова інтеграція фіда коштує $200–500.",
        ru: "Объект вносится один раз — в админку сайта или сразу в CRM. Дальше XML-фид автоматически передаёт его на OLX, DOM.RIA и в Facebook Catalog. Сняли объект с продажи — он исчезает везде. Типовая интеграция фида стоит $200–500.",
        en: "A listing is entered once — in the site admin or directly in the CRM. An XML feed then pushes it to property portals and Facebook Catalog automatically. Take it off the market and it disappears everywhere. A typical feed integration costs $200–500.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка сайту нерухомості?",
        ru: "Сколько времени занимает разработка сайта недвижимости?",
        en: "How long does a real estate website take to build?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг рієлтора — 2–3 тижні, каталог агенції з фільтрами й фідами — 4–6 тижнів, платформа з кабінетами — 8–12 тижнів. Найбільше на термін впливають інтеграції з CRM і телефонією та кількість мовних версій.",
        ru: "Лендинг риелтора — 2–3 недели, каталог агентства с фильтрами и фидами — 4–6 недель, платформа с кабинетами — 8–12 недель. Сильнее всего на срок влияют интеграции с CRM и телефонией и количество языковых версий.",
        en: "An agent landing page takes 2–3 weeks, an agency catalogue with filters and feeds 4–6 weeks, a platform with accounts 8–12 weeks. CRM and telephony integrations and the number of language versions affect the timeline most.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна вивантажувати об'єкти на OLX і DOM.RIA автоматично?",
        ru: "Можно ли выгружать объекты на OLX и DOM.RIA автоматически?",
        en: "Can listings be syndicated to portals automatically?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, через XML-фіди: портали регулярно забирають дані з сайту самі. Це прибирає ручне дублювання оголошень і розбіжності в цінах. Складніші сценарії — двостороння синхронізація з CRM чи обмін із забудовниками — коштують $1 000–3 000.",
        ru: "Да, через XML-фиды: порталы регулярно забирают данные с сайта сами. Это убирает ручное дублирование объявлений и расхождения в ценах. Более сложные сценарии — двусторонняя синхронизация с CRM или обмен с застройщиками — стоят $1 000–3 000.",
        en: "Yes, via XML feeds: portals pull data from the site on a schedule. This removes manual re-posting and price mismatches. More complex scenarios — two-way CRM sync or developer data exchange — run $1,000–3,000.",
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
