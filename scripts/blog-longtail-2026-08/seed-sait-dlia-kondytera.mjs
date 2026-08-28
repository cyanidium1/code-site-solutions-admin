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
  tldr("Коротко: сайт для кондитера і пекарні", [
    "Instagram обмежує вас сарафаном і алгоритмом. Сайт виводить на людей, які прямо зараз шукають «торт на замовлення + місто» в Google.",
    "Мінімум, який працює: лендінг з галереєю тортів і формою замовлення — від $800.",
    "Сайт з каталогом за категоріями і калькулятором торта (вага, яруси, декор, дата) — від $3 500.",
    "Калькулятор замовлення — найсильніший лід-магніт кондитера: клієнт сам «збирає» торт і залишає заявку.",
    "Календар зайнятості дат прибирає нескінченне «а на цю суботу можете?» з діректу.",
    "Біржі та агрегатори беруть 15–30% комісії і залишають клієнтську базу собі. Свій сайт — 0% з кожного замовлення.",
  ]),
  p("Сайт для кондитера — це галерея тортів за категоріями, калькулятор замовлення (вага, яруси, декор, дата) і календар вільних дат, зібрані так, щоб клієнт оформив передзамовлення без листування в дірект. Такий сайт коштує **від $800** за лендінг і **від $3 500** за каталог з калькулятором — і, на відміну від бірж та агрегаторів, не забирає 15–30% з кожного торта."),
  p("Ця стаття — для кондитерів, які працюють з Instagram і сарафану, і для пекарень, які хочуть приймати передзамовлення на ранок онлайн. Розберемо, з чого складається сайт, що з функцій реально приносить замовлення, скільки це коштує і коли біржі все ж мають сенс."),

  h2("Чому Instagram-кондитеру потрібен сайт"),
  p("Instagram — чудова вітрина, але в нього є стеля. Ваш профіль бачать підписники і їхні друзі — тобто сарафан. Людина, яка вводить у Google «торт на замовлення Львів», ваш профіль не знайде: Instagram майже не індексується пошуком, а якщо і випадає — то без цін, категорій і форми замовлення."),
  p("Друга проблема — алгоритм. Охоплення постів стрибає, reels то «залітають», то ні, і потік заявок залежить від стрічки, яку ви не контролюєте. Третя — операційка: пів дня йде на однакові відповіді в дірект: «скільки коштує на 2 кг?», «а на 14 число вільно?», «які начинки?»."),
  li("**Пошук.** Сайт індексується Google і ловить запити «торт на замовлення + місто», «бенто-торт замовити», «весільний торт ціна»."),
  li("**Портфоліо.** Галерея з категоріями і фільтрами замість нескінченної стрічки, в якій губляться роботи дворічної давнини."),
  li("**Автоматизація.** Калькулятор і календар відповідають на 80% питань з діректу без вашої участі."),
  li("**Незалежність.** Бан, злам чи чергова зміна алгоритму не обнуляють канал продажів."),
  p("Сайт не замінює Instagram — він його підсилює: у шапці профілю з'являється посилання не на таплінк, а на повноцінну вітрину з формою замовлення."),

  h2("Галерея тортів, яка продає, а не просто показує"),
  p("Головна помилка — звалити всі фото в одну купу «Наші роботи». Клієнт шукає конкретне: мама — дитячий торт на рочок, наречена — весільний на 60 гостей, офіс-менеджер — корпоративний з логотипом. Галерея має вести кожного своїм маршрутом."),
  h3("Категорії, з яких реально шукають"),
  li("**Весільні торти** — з фільтром за кількістю порцій і стилем (класика, мінімалізм, квіти)."),
  li("**Дитячі торти** — за віком і темою: єдинороги, супергерої, перший рочок."),
  li("**Бенто-торти** — окрема категорія: це найчастіший «вхідний» запит молодої аудиторії."),
  li("**Капкейки, макарони, десерт-бокси** — дрібний чек, але часті повторні замовлення."),
  p("Біля кожної роботи — вага, кількість порцій і ціна «від». Прихована ціна не інтригує, а зливає клієнта: без орієнтира людина йде туди, де цифри є. Плюс технічна база: швидкі фото у WebP, alt-тексти з назвою категорії, розмітка Product — це вже [SEO](/seo), яке працює на вас."),

  h2("Калькулятор замовлення торта — ваш лід-магніт"),
  p("Найсильніший інструмент кондитерського сайту — калькулятор, у якому клієнт сам збирає свій торт: вага чи кількість порцій → кількість ярусів → начинка → декор (мастика, крем, живі квіти, топер) → напис → дата. На виході — орієнтовна ціна і кнопка «Залишити заявку»."),
  p("Чому це працює: людина вже «попрацювала» над своїм тортом, побачила чесну вилку ціни і залишає контакт значно охочіше, ніж через холодну форму «Напишіть нам». А ви отримуєте заявку, в якій уже є вага, декор і дата — замість двадцяти повідомлень у дірект. Такий калькулятор — це типова інтеграція вартістю **$200–500** поверх сайту, а не космічна розробка."),
  num("Клієнт обирає параметри — бачить ціну «від» одразу, без очікування менеджера."),
  num("Форма підтягує вільні дати з календаря — неможливо замовити на зайнятий день."),
  num("Заявка падає вам у Telegram чи CRM з усіма параметрами торта."),
  cta(
    "Хочете калькулятор замовлень на своєму сайті?",
    "Порахуйте вартість сайту для кондитерської за 2 хвилини — безкоштовно і без дзвінків.",
    "Розрахувати вартість сайту",
    "/calculator"
  ),

  h2("Передзамовлення, календар дат і доставка"),
  p("Торт — це завжди передзамовлення на конкретну дату, і саме тут Instagram програє найбільше. На сайті це вирішується календарем зайнятості: ви позначаєте, скільки замовлень берете на день, і клієнт бачить лише реально вільні дати."),
  h3("Календар зайнятості дат"),
  p("У сезон (випускні, вересневі весілля, новорічні корпоративи) календар працює ще й як тригер: «на грудень вільно 4 дати» мотивує бронювати заздалегідь і дозволяє брати передоплату онлайн."),
  h3("Самовивіз чи доставка"),
  p("Дайте обидві опції явно: самовивіз з адресою і слотами часу — або доставка із зонами і тарифами. Для тортів критично прописати умови перевезення (температура, кріплення ярусів) — це знімає страх «а довезеться?» і зменшує кількість питань перед оплатою."),

  h2("Сайт для пекарні: передзамовлення на ранок"),
  p("У пекарні логіка інша, ніж у кондитера: не одне велике замовлення на дату, а щоденний потік дрібних. Тут працює каталог з передзамовленням: клієнт до 20:00 збирає кошик — хліб, круасани, сирники — а вранці забирає його без черги або отримує з доставкою."),
  li("**Каталог з залишками:** позиції на завтра, стоп-лист на те, що не печете."),
  li("**Слоти видачі:** клієнт обирає час — ви рівномірно розвантажуєте ранковий пік."),
  li("**Підписка на хліб:** щотижневе замовлення зі знижкою — стабільна каса наперед."),
  li("**B2B-передзамовлення:** кав'ярні та ресторани замовляють випічку гуртом на ранок — окремий прайс під логіном."),
  p("Технічно це вже [інтернет-магазин](/online-store) з кошиком і оплатою, а не лендінг — звідси й інша вилка цін, про неї нижче."),

  h2("SEO: як вас знаходять за «торт на замовлення + місто»"),
  p("Кондитерські запити — локальні. Людина шукає «торт на замовлення Київ», «бенто-торт Позняки», «весільний торт Львів ціна» — і Google показує тих, у кого під ці запити є сторінки. Instagram-профіль такої сторінки не має, сайт — має."),
  num("Окремі сторінки під категорії: «Весільні торти у Львові», «Бенто-торти на замовлення» — кожна ловить свій запит."),
  num("Google Business Profile з відгуками і фото, прив'язаний до сайту, — щоб з'являтися в картах поруч із «поруч зі мною»."),
  num("Ціни «від» на сторінках: сторінки з цінами стабільно обходять «ціну уточнюйте в дірект»."),
  p("Перші позиції за низькочастотними запитами на кшталт «бенто-торт + район» реально отримати за 2–4 місяці: конкуренція там — біржі із шаблонними сторінками, які програють живому сайту з фото ваших робіт."),

  h2("Скільки коштує сайт для кондитера і пекарні"),
  p("Вилка залежить від того, що сайт має робити: показувати і збирати заявки — чи приймати замовлення з оплатою. Ціни студії:"),
  table(
    ["Формат", "Що всередині", "Ціна", "Термін"],
    [
      ["**Лендінг кондитера**", "Галерея за категоріями, форма замовлення, Instagram-стрічка, карта самовивозу", "від $800", "2–3 тижні"],
      ["**Сайт з каталогом і калькулятором**", "Категорії тортів, калькулятор (вага/яруси/декор/дата), календар дат, передоплата", "від $3 500", "4–6 тижнів"],
      ["**Пекарня з передзамовленням**", "Каталог із залишками, кошик, слоти видачі, підписки, B2B-кабінет", "від $6 000", "6–10 тижнів"],
    ]
  ),
  p("Старт більшості кондитерів — [лендінг](/landing) від $800: галерея, форма, самовивіз. Калькулятор і календар докручуються потім як інтеграції ($200–500 типова, $1 000–3 000 — складні на кшталт синхронізації з CRM). Підтримка — **$200/міс** або $40/год, просування — **від $300/міс**. Що входить у ціну і з чого вона складається — розібрали в статті про [вартість розробки сайту у 2026](/blog/vartist-rozrobky-saytu-2026)."),

  h2("Біржі та агрегатори проти власного сайту"),
  p("Біржі тортів і агрегатори доставки дають швидкий старт: трафік уже є, сторінку заводиш за вечір. Але економіка й контроль — не на вашому боці:"),
  table(
    ["Критерій", "Біржі та агрегатори", "Власний сайт"],
    [
      ["Комісія із замовлення", "15–30%", "0%"],
      ["Клієнтська база", "У платформи: контакти вам не належать", "Ваша: телефони, e-mail, історія замовлень"],
      ["Конкуренція", "Ваш торт поруч із 50 дешевшими", "Клієнт бачить лише ваші роботи"],
      ["Ціноутворення", "Демпінг сусідів тисне на ціну", "Ціну диктуєте ви"],
      ["Бренд і повторні продажі", "Клієнт запам'ятовує платформу", "Клієнт запам'ятовує вас"],
      ["Правила гри", "Платформа може змінити комісію чи забанити", "Актив, який належить вам"],
    ]
  ),
  p("Розумна стратегія — не «або/або»: біржі можна лишити як додатковий канал на старті, але повторні замовлення і сезонні піки має збирати ваш сайт, де маржа не тане на комісії."),

  h2("Приклад з практики: їжа без агрегаторів"),
  p("Механіку «замовлення напряму, без комісій платформ» ми вже будували для харчового бізнесу. Для мережі [Tatarka Franchise](/portfolio/tatarka-franchise) студія зробила сайт, де меню і замовлення працюють напряму: бренд не ділиться маржею з агрегатором і збирає власну базу клієнтів. Той самий принцип — каталог, кошик, передзамовлення — детально розібраний у статті про [сайт для ресторану й доставки їжі](/blog/sait-dlia-restoranu-kafe-dostavky), для кондитера і пекарні він працює ідентично."),
  p("Для кондитера це виглядає так: галерея з вашими роботами, калькулятор, який вночі збирає заявки, і календар, що сам каже клієнтам, коли ви вільні. Через пів року у вас — база клієнтів з датами їхніх свят: розсилка «до дня народження сина — знижка на торт» продає краще за будь-яку рекламу."),
  cta(
    "Готові приймати замовлення без комісій?",
    "Обговоримо ваш проєкт: покажемо релевантні роботи і назвемо точну ціну — лендінг від $800, сайт з калькулятором від $3 500.",
    "Порахувати мій сайт",
    "/calculator"
  ),
];

const bodyRu = [
  tldr("Коротко: сайт для кондитеров и пекарни", [
    "Instagram упирается в потолок сарафана. Сайт приводит людей, которые ищут «торт на заказ + город» в Google прямо сейчас.",
    "Рабочий минимум — лендинг с галереей тортов и формой заказа от $800.",
    "Сайт с каталогом по категориям и калькулятором торта (вес, ярусы, декор, дата) — от $3 500.",
    "Калькулятор заказа — главный лид-магнит кондитера: клиент сам «собирает» торт и оставляет заявку.",
    "Календарь занятости дат убирает бесконечное «а на эту субботу свободно?» из директа.",
    "Биржи и агрегаторы забирают 15–30% комиссии и держат базу клиентов у себя. Свой сайт — 0% с заказа.",
  ]),
  p("Сайт для кондитеров — это галерея тортов по категориям, калькулятор заказа (вес, ярусы, декор, дата) и календарь свободных дат, собранные так, чтобы клиент оформил предзаказ без переписки в директе. Стоит такой сайт **от $800** за лендинг и **от $3 500** за каталог с калькулятором — и, в отличие от бирж, не съедает 15–30% с каждого торта."),
  p("Разберём, каким должен быть лучший сайт для кондитеров и пекарен на практике: какие функции реально приносят заказы, сколько это стоит, чем сайт для кондитерской отличается от сайта пекарни и когда биржи всё-таки полезны."),

  h2("Почему Instagram-кондитеру нужен сайт"),
  p("Instagram — отличная витрина, но у неё есть потолок. Профиль видят подписчики и их друзья — то есть сарафан. Человек, который вбивает в Google «торт на заказ + город», ваш профиль не найдёт: Instagram почти не индексируется поиском, а если и всплывает — то без цен, категорий и формы заказа."),
  p("Вторая проблема — алгоритм: охваты скачут, reels то «залетают», то нет, и поток заявок зависит от ленты, которую вы не контролируете. Третья — операционка: полдня уходит на одинаковые ответы в директе про цену за килограмм, свободные даты и начинки."),
  li("**Поиск.** Сайт индексируется Google и ловит запросы «торт на заказ + город», «бенто-торт заказать», «свадебный торт цена»."),
  li("**Портфолио.** Галерея с категориями и фильтрами вместо бесконечной ленты, где работы двухлетней давности никто не найдёт."),
  li("**Автоматизация.** Калькулятор и календарь закрывают 80% вопросов из директа без вашего участия."),
  li("**Независимость.** Бан, взлом или очередная смена алгоритма не обнуляют канал продаж."),
  p("Сайт не заменяет Instagram, а усиливает его: в шапке профиля вместо таплинка появляется ссылка на полноценную витрину с формой заказа."),

  h2("Галерея тортов, которая продаёт"),
  p("Главная ошибка — свалить все фото в одну кучу «Наши работы». Клиент ищет конкретное: мама — детский торт на годик, невеста — свадебный на 60 гостей, офис-менеджер — корпоративный с логотипом. Галерея должна вести каждого своим маршрутом."),
  h3("Категории, из которых реально ищут"),
  li("**Свадебные торты** — с фильтром по количеству порций и стилю: классика, минимализм, живые цветы."),
  li("**Детские торты** — по возрасту и теме: единороги, супергерои, первый годик."),
  li("**Бенто-торты** — отдельная категория: самый частый «входной» запрос молодой аудитории."),
  li("**Капкейки, макаронс, десерт-боксы** — мелкий чек, но частые повторные заказы."),
  p("У каждой работы — вес, количество порций и цена «от». Скрытая цена не интригует, а сливает клиента: без ориентира человек уходит туда, где цифры есть. Плюс техническая база: быстрые фото в WebP, alt-тексты, разметка Product — это уже SEO, работающее на вас."),

  h2("Калькулятор заказа торта — ваш лид-магнит"),
  p("Самый сильный инструмент кондитерского сайта — калькулятор, в котором клиент сам собирает торт: вес или количество порций → ярусы → начинка → декор (мастика, крем, живые цветы, топпер) → надпись → дата. На выходе — ориентировочная цена и кнопка «Оставить заявку»."),
  p("Почему это работает: человек уже «поработал» над своим тортом, увидел честную вилку цены и оставляет контакт куда охотнее, чем через холодную форму «Напишите нам». А вы получаете заявку, в которой уже есть вес, декор и дата — вместо двадцати сообщений в директе. Технически это типовая интеграция за **$200–500** поверх сайта, а не космическая разработка."),
  num("Клиент выбирает параметры и сразу видит цену «от» — без ожидания менеджера."),
  num("Форма подтягивает свободные даты из календаря — заказать на занятый день невозможно."),
  num("Заявка падает вам в Telegram или CRM со всеми параметрами торта."),
  cta(
    "Хотите калькулятор заказов на своём сайте?",
    "Посчитайте стоимость сайта для кондитерской за 2 минуты — бесплатно и без звонков.",
    "Рассчитать стоимость сайта",
    "/ru/calculator"
  ),

  h2("Предзаказ, календарь дат и доставка"),
  p("Торт — это всегда предзаказ на конкретную дату, и именно здесь Instagram проигрывает сильнее всего. На сайте это решает календарь занятости: вы отмечаете, сколько заказов берёте в день, и клиент видит только реально свободные даты."),
  h3("Календарь занятости дат"),
  p("В сезон — выпускные, сентябрьские свадьбы, новогодние корпоративы — календарь работает ещё и как триггер: «на декабрь свободно 4 даты» мотивирует бронировать заранее и позволяет брать предоплату онлайн."),
  h3("Самовывоз или доставка"),
  p("Дайте обе опции явно: самовывоз с адресом и слотами времени — или доставка с зонами и тарифами. Для тортов критично прописать условия перевозки: температура, крепление ярусов. Это снимает страх «а доедет?» и сокращает вопросы перед оплатой."),

  h2("Сайт для пекарни: предзаказ на утро"),
  p("У пекарни логика другая: не один большой заказ на дату, а ежедневный поток мелких. Здесь работает каталог с предзаказом: клиент до 20:00 собирает корзину — хлеб, круассаны, сырники — а утром забирает её без очереди или получает с доставкой."),
  li("**Каталог с остатками:** позиции на завтра, стоп-лист на то, что не печёте."),
  li("**Слоты выдачи:** клиент выбирает время — вы разгружаете утренний пик."),
  li("**Подписка на хлеб:** еженедельный заказ со скидкой — стабильная касса наперёд."),
  li("**B2B-предзаказ:** кофейни и рестораны заказывают выпечку оптом на утро — отдельный прайс под логином."),
  p("Технически это уже [интернет-магазин](/ru/online-store) с корзиной и оплатой, а не лендинг — отсюда и другая вилка цен, о ней ниже."),

  h2("SEO: как вас находят по «торт на заказ + город»"),
  p("Кондитерские запросы локальны: «торт на заказ + город», «бенто-торт заказать», «свадебный торт цена». Google показывает тех, у кого под эти запросы есть страницы. У Instagram-профиля таких страниц нет, у сайта — есть."),
  num("Отдельные страницы под категории: «Свадебные торты», «Бенто-торты на заказ» — каждая ловит свой запрос."),
  num("Google Business Profile с отзывами и фото, привязанный к сайту, — чтобы появляться в картах рядом с «рядом со мной»."),
  num("Цены «от» на страницах: страницы с ценами стабильно обходят «цену уточняйте в директ»."),
  p("Первые позиции по низкочастотным запросам вроде «бенто-торт + район» реально получить за 2–4 месяца: конкуренты там — биржи с шаблонными страницами, которые проигрывают живому сайту с фото ваших работ."),

  h2("Сколько стоит сайт для кондитерской и пекарни"),
  p("Вилка зависит от того, что сайт должен делать: показывать и собирать заявки — или принимать заказы с оплатой. Цены студии:"),
  table(
    ["Формат", "Что внутри", "Цена", "Срок"],
    [
      ["**Лендинг кондитера**", "Галерея по категориям, форма заказа, Instagram-лента, карта самовывоза", "от $800", "2–3 недели"],
      ["**Сайт с каталогом и калькулятором**", "Категории тортов, калькулятор (вес/ярусы/декор/дата), календарь дат, предоплата", "от $3 500", "4–6 недель"],
      ["**Пекарня с предзаказом**", "Каталог с остатками, корзина, слоты выдачи, подписки, B2B-кабинет", "от $6 000", "6–10 недель"],
    ]
  ),
  p("Старт большинства кондитеров — [лендинг](/ru/landing) от $800: галерея, форма, самовывоз. Калькулятор и календарь докручиваются потом как интеграции ($200–500 типовая, $1 000–3 000 — сложные вроде синхронизации с CRM). Поддержка — **$200/мес** или $40/час, продвижение — **от $300/мес**. Из чего складывается цена — разобрали в статье о [стоимости разработки сайта в 2026](/ru/blog/skolko-stoit-sayt-2026)."),

  h2("Биржи и агрегаторы против своего сайта"),
  p("Биржи тортов и агрегаторы доставки дают быстрый старт: трафик уже есть, страница заводится за вечер. Но экономика и контроль — не на вашей стороне:"),
  table(
    ["Критерий", "Биржи и агрегаторы", "Свой сайт"],
    [
      ["Комиссия с заказа", "15–30%", "0%"],
      ["База клиентов", "У платформы: контакты вам не принадлежат", "Ваша: телефоны, e-mail, история заказов"],
      ["Конкуренция", "Ваш торт рядом с 50 более дешёвыми", "Клиент видит только ваши работы"],
      ["Ценообразование", "Демпинг соседей давит на цену", "Цену диктуете вы"],
      ["Бренд и повторные продажи", "Клиент запоминает платформу", "Клиент запоминает вас"],
      ["Правила игры", "Платформа может поднять комиссию или забанить", "Актив, который принадлежит вам"],
    ]
  ),
  p("Разумная стратегия — не «или/или»: биржи можно оставить как дополнительный канал на старте, но повторные заказы и сезонные пики должен собирать ваш сайт, где маржа не тает на комиссии."),

  h2("Пример из практики: еда без агрегаторов"),
  p("Механику «заказ напрямую, без комиссий платформ» мы уже строили для пищевого бизнеса. Для сети [Tatarka Franchise](/ru/portfolio/tatarka-franchise) студия сделала сайт, где меню и заказ работают напрямую: бренд не делится маржой с агрегатором и собирает собственную базу клиентов. Тот же принцип — каталог, корзина, предзаказ — подробно разобран в статье про [сайт для ресторана и доставки еды](/ru/blog/sayt-dlya-restorana-i-dostavki-edy); для кондитера и пекарни он работает один в один."),
  p("Для кондитера это выглядит так: галерея с вашими работами, калькулятор, который ночью собирает заявки, и календарь, который сам говорит клиентам, когда вы свободны. Через полгода у вас — база клиентов с датами их праздников: рассылка «ко дню рождения сына — скидка на торт» продаёт лучше любой рекламы."),
  cta(
    "Готовы принимать заказы без комиссий?",
    "Обсудим ваш проект: покажем релевантные работы и назовём точную цену — лендинг от $800, сайт с калькулятором от $3 500.",
    "Посчитать мой сайт",
    "/ru/calculator"
  ),
];

const bodyEn = [
  tldr("TL;DR: bakery and cake shop websites", [
    "Instagram caps you at word-of-mouth. A website catches people searching Google for \"custom cakes near me\" right now.",
    "The working minimum: a landing page with a cake gallery and an order form — from $800.",
    "A site with a categorised catalogue and a cake order calculator (weight, tiers, decor, date) — from $3,500.",
    "The calculator is a baker's best lead magnet: the customer builds their own cake and submits an enquiry.",
    "An availability calendar kills the endless \"are you free this Saturday?\" DMs.",
    "Marketplaces and delivery aggregators take 15–30% commission and keep the customer base. Your own site takes 0%.",
  ]),
  p("A bakery website is a categorised cake gallery, an order calculator (weight, tiers, decor, date) and an availability calendar, arranged so a customer can place a pre-order without a single DM. It costs **from $800** for a landing page and **from $3,500** for a catalogue with a calculator — and unlike marketplaces, it never skims 15–30% off each cake."),
  p("This guide covers bakery website design for two audiences: cake makers who live off Instagram and word-of-mouth, and bakeries that want morning pre-orders online. We build these sites at Code-Site.Art — a Ukrainian studio working with clients across Europe: European quality, sensible rates. Here is what actually brings orders, what it costs, and when marketplaces still make sense."),

  h2("Why an Instagram-only cake business hits a ceiling"),
  p("Instagram is a great shop window with a hard limit. Your profile reaches followers and their friends — word-of-mouth, in other words. Someone typing \"wedding cake to order\" into Google will never see it: Instagram barely gets indexed, and when it does surface, it shows no prices, no categories, no order form."),
  p("Then there is the algorithm — reach swings week to week, and your pipeline depends on a feed you do not control. And the admin: half a day goes on identical DM replies about price per kilo, free dates and fillings."),
  li("**Search.** A cake ordering website ranks for \"custom cake + your city\", \"bento cake order\", \"wedding cake prices\"."),
  li("**Portfolio.** A filtered gallery instead of an endless feed where two-year-old showpieces are buried."),
  li("**Automation.** A calculator and a calendar answer 80% of DM questions without you."),
  li("**Independence.** A ban, a hack or another algorithm change no longer wipes out your sales channel."),
  p("The site does not replace Instagram — it upgrades it: the link in your bio points to a real storefront with an order form instead of a linktree."),

  h2("A cake gallery that sells, not just shows"),
  p("The classic mistake is one big \"Our work\" dump. Customers search for something specific: a mum wants a first-birthday cake, a bride wants a wedding cake for 60 guests, an office manager wants a corporate one with a logo. The gallery should route each of them separately."),
  h3("Categories people actually search for"),
  li("**Wedding cakes** — filtered by servings and style: classic, minimal, fresh flowers."),
  li("**Kids' birthday cakes** — by age and theme: unicorns, superheroes, first birthday."),
  li("**Bento cakes** — their own category: the most common entry query from younger customers."),
  li("**Cupcakes, macarons, dessert boxes** — small tickets, frequent repeat orders."),
  p("Every item needs weight, servings and a \"from\" price. Hiding prices does not create intrigue — it loses the customer to whoever shows numbers. Add the technical layer — fast WebP images, alt texts, Product schema — and the gallery starts earning search traffic on its own."),

  h2("The cake order calculator — your lead magnet"),
  p("The strongest tool on a bakery website is a calculator where the customer assembles their cake: weight or servings → tiers → filling → decor (fondant, cream, fresh flowers, topper) → inscription → date. The output: an estimated price and a \"Send enquiry\" button."),
  p("Why it works: the customer has already invested effort, seen an honest price range, and leaves contact details far more willingly than through a cold \"Contact us\" form. You receive an enquiry that already contains weight, decor and date — instead of twenty DMs. Technically it is a typical **$200–500** integration on top of the site, not rocket science."),
  num("The customer picks options and sees a \"from\" price instantly — no waiting for a manager."),
  num("The form pulls free dates from your calendar — booking an occupied day is impossible."),
  num("The enquiry lands in your Telegram or CRM with every cake parameter attached."),
  cta(
    "Want an order calculator on your own site?",
    "Price up a website for your bakery in 2 minutes — free, no sales calls.",
    "Get my website estimate",
    "/en/calculator"
  ),

  h2("Pre-orders, an availability calendar, pickup and delivery"),
  p("A cake is always a pre-order for a specific date — exactly where Instagram fails hardest. On a website an availability calendar solves it: you set how many orders you take per day, and customers only see genuinely free dates."),
  h3("The availability calendar"),
  p("In peak season — graduations, September weddings, Christmas parties — the calendar doubles as urgency: \"4 dates left in December\" nudges people to book early and lets you take deposits online."),
  h3("Pickup or delivery"),
  p("Offer both explicitly: pickup with an address and time slots, or delivery with zones and rates. For cakes, spell out transport conditions — temperature, tier support. It answers the \"will it survive the trip?\" worry before it becomes a lost sale."),

  h2("Bakery websites: morning pre-orders"),
  p("A bakery runs on different logic to a cake maker: not one big dated order, but a daily stream of small ones. What works is a catalogue with pre-ordering: customers build a basket by 8 pm — bread, croissants, pastries — and collect it in the morning without queueing, or get it delivered."),
  li("**Catalogue with stock:** tomorrow's items, a stop list for whatever you are not baking."),
  li("**Collection slots:** customers pick a time — your morning rush flattens out."),
  li("**Bread subscriptions:** a weekly standing order at a discount — predictable revenue in advance."),
  li("**B2B pre-orders:** cafés and restaurants order pastries wholesale for the morning — separate price list behind a login."),
  p("Technically this is an [online store](/en/online-store) with a basket and payments rather than a landing page — which is why the price bracket differs, as shown below."),

  h2("SEO: how customers find you"),
  p("Bakery queries are local: \"custom cake + city\", \"bento cake order\", \"wedding cake prices\". Google shows whoever has pages built for those queries. An Instagram profile has none; a website does."),
  num("Separate pages per category — \"Wedding cakes in your city\", \"Bento cakes to order\" — each catching its own query."),
  num("A Google Business Profile with reviews and photos, linked to the site, so you appear in Maps for \"near me\" searches."),
  num("Visible \"from\" prices: pages with numbers consistently outrank \"DM for price\"."),
  p("First positions for long-tail queries like \"bento cake + district\" are realistic within 2–4 months: your competition there is marketplace template pages, which lose to a live site with photos of your actual work."),

  h2("What a bakery website costs"),
  p("The bracket depends on what the site must do: display and collect enquiries, or take paid orders. Our studio's pricing:"),
  table(
    ["Format", "What's inside", "Price", "Timeline"],
    [
      ["**Cake maker landing page**", "Categorised gallery, order form, Instagram feed, pickup map", "from $800", "2–3 weeks"],
      ["**Catalogue + order calculator**", "Cake categories, calculator (weight/tiers/decor/date), availability calendar, deposits", "from $3,500", "4–6 weeks"],
      ["**Bakery with pre-orders**", "Stock-aware catalogue, basket, collection slots, subscriptions, B2B accounts", "from $6,000", "6–10 weeks"],
    ]
  ),
  p("Most cake makers start with a [landing page](/en/landing) from $800: gallery, form, pickup details. The calculator and calendar come later as integrations ($200–500 typical; $1,000–3,000 for complex ones such as CRM sync). Support is **$200/month** or $40/hour, SEO **from $300/month**. For a full cost breakdown, see our guide to [custom website costs in 2026](/en/blog/custom-website-cost-uk-2026)."),

  h2("Marketplaces vs your own website"),
  p("Cake marketplaces and delivery aggregators offer a quick start: traffic already exists, a listing takes an evening. But the economics and the control are not on your side:"),
  table(
    ["Criterion", "Marketplaces & aggregators", "Your own website"],
    [
      ["Commission per order", "15–30%", "0%"],
      ["Customer base", "The platform's — you never own the contacts", "Yours: phones, emails, order history"],
      ["Competition", "Your cake sits next to 50 cheaper ones", "Customers see only your work"],
      ["Pricing", "Neighbours' undercutting drags prices down", "You set the price"],
      ["Brand and repeat sales", "Customers remember the platform", "Customers remember you"],
      ["Rules of the game", "Commission hikes and bans at the platform's whim", "An asset you own outright"],
    ]
  ),
  p("The smart strategy is not either/or: keep marketplaces as a secondary channel at the start, but let your own site capture repeat orders and seasonal peaks, where margin no longer evaporates into commission."),

  h2("A real example: food orders without aggregators"),
  p("We have already built the \"order direct, zero platform commission\" mechanic for food businesses. For the [Tatarka Franchise](/en/portfolio/tatarka-franchise) chain, our studio delivered a site where the menu and ordering run direct: the brand shares no margin with aggregators and owns its customer base. The same principle — catalogue, basket, pre-order — is unpacked in our guide to [restaurant websites with delivery](/en/blog/restaurant-website-with-delivery); for a cake business or bakery it works identically."),
  p("For a cake maker it looks like this: a gallery of your work, a calculator collecting enquiries overnight, and a calendar that tells customers when you are free. Six months in, you own a customer base with their celebration dates — a \"birthday coming up — cake discount\" email outsells any ad campaign."),
  cta(
    "Ready to take orders without commissions?",
    "Let's discuss your project: relevant work examples and an exact quote — landing pages from $800, calculator-equipped sites from $3,500.",
    "Get my estimate",
    "/en/calculator"
  ),
];

const doc = {
  _id: "ltAug2026-sait-dlia-kondytera",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-kondytera" },
    ru: { _type: "slug", current: "sayt-dlya-konditera" },
    en: { _type: "slug", current: "bakery-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для кондитера і пекарні: торти на замовлення без бірж і комісій",
    ru: "Сайт для кондитера и пекарни: торты на заказ без бирж и комиссий",
    en: "Bakery & Cake Shop Website: Take Orders Without Marketplaces",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для кондитера і пекарні: ціна 2026 | Code-Site.Art",
    ru: "Сайт для кондитеров и пекарни: цена 2026 | Code-Site.Art",
    en: "Bakery Website Design & Cake Ordering: 2026 Costs",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для кондитера і пекарні: галерея тортів, калькулятор замовлення, календар дат ✔️ Лендінг від $800 ✔️ Без комісій бірж ➡ Ціни та приклади",
    ru: "➤ Сайт для кондитеров и пекарни: галерея тортов, калькулятор заказа, календарь дат ✔️ Лендинг от $800 ✔️ Без комиссий бирж ➡ Цены и примеры",
    en: "➤ Bakery website design: cake gallery, order calculator, availability calendar ✔️ Landing from $800 ✔️ 0% marketplace fees ➡ Prices & examples",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Сайти для ніш",
    ru: "Сайты для ниш",
    en: "Industry websites",
  },
  lede: {
    _type: "localizedString",
    uk: "Instagram упирається в стелю сарафану, а біржі забирають до 30% з кожного торта. Розбираємо, як сайт з галереєю, калькулятором замовлення і календарем дат перетворює кондитерську на бізнес з прогнозованим потоком замовлень.",
    ru: "Instagram упирается в потолок сарафана, а биржи забирают до 30% с каждого торта. Разбираем, как сайт с галереей, калькулятором заказа и календарём дат превращает кондитерскую в бизнес с прогнозируемым потоком заказов.",
    en: "Instagram caps you at word-of-mouth, and marketplaces take up to 30% of every cake. Here is how a website with a gallery, an order calculator and an availability calendar turns a cake business into a predictable order pipeline.",
  },
  tags: ["кондитер", "пекарня", "торти на замовлення", "сайт для кондитера"],
  relatedPostSlugs: ["sait-dlia-restoranu-kafe-dostavky", "internet-mahazyn-odiahu", "vartist-rozrobky-saytu-2026"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для кондитера?",
        ru: "Сколько стоит сайт для кондитера?",
        en: "How much does a bakery website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг з галереєю тортів і формою замовлення — від $800, термін 2–3 тижні. Сайт з каталогом за категоріями і калькулятором замовлення — від $3 500. Пекарня з передзамовленням, кошиком і слотами видачі — від $6 000. Підтримка після запуску — $200/міс.",
        ru: "Лендинг с галереей тортов и формой заказа — от $800, срок 2–3 недели. Сайт с каталогом по категориям и калькулятором заказа — от $3 500. Пекарня с предзаказом, корзиной и слотами выдачи — от $6 000. Поддержка после запуска — $200/мес.",
        en: "A landing page with a cake gallery and an order form starts at $800 and takes 2–3 weeks. A site with a categorised catalogue and an order calculator starts at $3,500. A bakery with pre-orders, a basket and collection slots starts at $6,000. Post-launch support is $200/month.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи замінить сайт мій Instagram?",
        ru: "Заменит ли сайт мой Instagram?",
        en: "Will a website replace my Instagram?",
      },
      answer: {
        _type: "localizedText",
        uk: "Ні, вони працюють у парі. Instagram лишається каналом контенту і сарафану, а сайт ловить пошуковий трафік з Google, структурує портфоліо за категоріями і приймає замовлення через калькулятор — навіть уночі. Посилання на сайт у шапці профілю замінює таплінк.",
        ru: "Нет, они работают в паре. Instagram остаётся каналом контента и сарафана, а сайт ловит поисковый трафик из Google, структурирует портфолио по категориям и принимает заказы через калькулятор — даже ночью. Ссылка на сайт в шапке профиля заменяет таплинк.",
        en: "No — they work as a pair. Instagram stays your content and word-of-mouth channel, while the website captures Google search traffic, organises your portfolio by category and takes orders through the calculator, even overnight. The site link replaces the linktree in your bio.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як працює калькулятор замовлення торта?",
        ru: "Как работает калькулятор заказа торта?",
        en: "How does a cake order calculator work?",
      },
      answer: {
        _type: "localizedText",
        uk: "Клієнт обирає вагу або кількість порцій, яруси, начинку, декор і дату — калькулятор одразу показує орієнтовну ціну «від» і пропонує залишити заявку. Вільні дати підтягуються з вашого календаря зайнятості. Заявка з усіма параметрами приходить у Telegram або CRM. Це типова інтеграція вартістю $200–500.",
        ru: "Клиент выбирает вес или количество порций, ярусы, начинку, декор и дату — калькулятор сразу показывает ориентировочную цену «от» и предлагает оставить заявку. Свободные даты подтягиваются из вашего календаря занятости. Заявка со всеми параметрами приходит в Telegram или CRM. Это типовая интеграция за $200–500.",
        en: "The customer picks weight or servings, tiers, filling, decor and a date — the calculator instantly shows an estimated \"from\" price and offers to send an enquiry. Free dates are pulled from your availability calendar, and the enquiry lands in your Telegram or CRM with every parameter. It is a typical $200–500 integration.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен пекарні повноцінний інтернет-магазин?",
        ru: "Нужен ли пекарне полноценный интернет-магазин?",
        en: "Does a bakery need a full online store?",
      },
      answer: {
        _type: "localizedText",
        uk: "Якщо ви хочете приймати передзамовлення на ранок — так: потрібні каталог із залишками, кошик, оплата і слоти видачі, а це вже логіка інтернет-магазину (від $6 000 з кастомними функціями). Якщо завдання — просто показати асортимент і зібрати контакти, достатньо лендінгу від $800.",
        ru: "Если вы хотите принимать предзаказы на утро — да: нужны каталог с остатками, корзина, оплата и слоты выдачи, а это уже логика интернет-магазина (от $6 000 с кастомными функциями). Если задача — просто показать ассортимент и собрать контакты, достаточно лендинга от $800.",
        en: "If you want morning pre-orders — yes: you need a stock-aware catalogue, a basket, payments and collection slots, which is online-store logic (from $6,000 with custom features). If the goal is simply to show your range and collect enquiries, a landing page from $800 is enough.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Коли сайт почне приводити замовлення з Google?",
        ru: "Когда сайт начнёт приводить заказы из Google?",
        en: "How soon will the site bring orders from Google?",
      },
      answer: {
        _type: "localizedText",
        uk: "За низькочастотними локальними запитами на кшталт «бенто-торт + район» перші позиції реальні за 2–4 місяці: конкуренція там — шаблонні сторінки бірж. Висококонкурентні запити типу «торт на замовлення + велике місто» потребують 6–12 місяців системного SEO (від $300/міс). Заявки з реклами і з посилання в Instagram сайт приймає з першого дня.",
        ru: "По низкочастотным локальным запросам вроде «бенто-торт + район» первые позиции реальны за 2–4 месяца: конкуренция там — шаблонные страницы бирж. Высококонкурентные запросы типа «торт на заказ + крупный город» требуют 6–12 месяцев системного SEO (от $300/мес). Заявки с рекламы и по ссылке из Instagram сайт принимает с первого дня.",
        en: "For long-tail local queries like \"bento cake + district\", first positions are realistic within 2–4 months — the competition is marketplace template pages. Competitive queries like \"custom cakes + big city\" take 6–12 months of consistent SEO (from $300/month). Orders from ads and your Instagram bio link start on day one.",
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
