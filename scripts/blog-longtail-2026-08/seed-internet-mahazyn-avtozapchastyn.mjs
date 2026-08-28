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
  tldr("Коротко", [
    "Інтернет-магазин автозапчастин під ключ коштує від $3 500 (каталог на корпоративній платформі) до $6 000+ (кастомна платформа з VIN-підбором і фідами постачальників).",
    "Головна складність — не дизайн, а каталог: десятки тисяч SKU, крос-номери, аналоги та сумісність із конкретними авто.",
    "Підбір за VIN або маркою-моделлю-роком — must have: покупець боїться замовити «не ту» деталь, і саме підбір знімає цей страх.",
    "Залишки та ціни мають синхронізуватися з прайсами постачальників автоматично (TecDoc, XML/Excel-фіди, API) — інакше менеджери потонуть у ручній роботі.",
    "Строк запуску — 6–12 тижнів залежно від кількості постачальників та інтеграцій.",
  ]),
  p("Створення інтернет-магазину автозапчастин коштує **від $3 500** на базі готової e-commerce-платформи і **від $6 000** за кастомну розробку з VIN-підбором, синхронізацією залишків і фідами постачальників; типовий строк — **6–12 тижнів**. Ціну визначають три речі: розмір каталогу, кількість постачальників і глибина автоматизації."),
  p("У цій статті розкладаємо по поличках, чим сайт запчастин відрізняється від звичайного магазину, які функції справді впливають на продажі, скільки коштує кожен етап і коли достатньо готової платформи, а коли потрібна кастомна розробка. Цифри — з реальних проєктів нашої студії для автобізнесу."),
  h2("Чим магазин запчастин складніший за звичайний e-commerce"),
  p("Типовий інтернет-магазин продає сотні товарів, які покупець обирає очима: фото, ціна, відгуки. Запчастини працюють інакше. Покупець шукає не «гарний амортизатор», а деталь, яка **точно стане на його авто**. Помилка коштує повернення, негативного відгуку і втраченого клієнта."),
  li("**Обсяг каталогу.** Навіть нішевий магазин тримає 10 000–50 000 SKU, універсальний — сотні тисяч позицій із десятків прайсів."),
  li("**Крос-номери й аналоги.** Одна деталь має OEM-номер і 5–20 номерів замінників від різних брендів. Пошук має знаходити всі."),
  li("**Сумісність.** Кожна позиція прив'язана до списку авто: марка, модель, покоління, двигун. Без цього конверсія падає, а повернення зростають."),
  li("**Ціни й залишки постачальників.** Прайси оновлюються щодня, часом кілька разів на день. Продати те, чого немає на складі, — найшвидший спосіб зіпсувати репутацію."),
  p("Саме тому шаблонний магазин «за тиждень на конструкторі» для запчастин майже ніколи не працює: конструктори не вміють ані крос-номери, ані підбір за авто, ані масовий імпорт прайсів. Докладніше про межі конструкторів ми писали в порівнянні [Next.js проти WordPress і конструкторів](/blog/nextjs-proty-wordpress-ta-konstruktoriv)."),
  h2("Підбір за VIN та маркою-моделлю: серце магазину"),
  p("Продає не каталог, а впевненість покупця, що деталь підійде. Цю впевненість дають три інструменти пошуку, і в сильному магазині вони працюють разом."),
  h3("Підбір за VIN-кодом"),
  p("Покупець вводить 17 символів VIN — система визначає комплектацію авто і показує лише сумісні деталі. Це найточніший спосіб підбору і головний аргумент довіри: людина бачить, що магазин «знає» її машину. Реалізується через бази даних на кшталт TecDoc або API постачальників; для запитів, які база не покриває, додають форму «підбір менеджером за VIN» — вона ж стає генератором лідів."),
  h3("Підбір за маркою — моделлю — роком"),
  p("Класичний ланцюжок селекторів: марка, модель, покоління, двигун. Обраний автомобіль зберігається в «гаражі» користувача, і весь каталог автоматично фільтрується під нього. Повторні покупці заходять — і бачать одразу «свої» деталі."),
  h3("Пошук за номером деталі та крос-номерами"),
  p("Професійні покупці (СТО, перекупи) шукають одразу за артикулом. Пошук має розуміти OEM-номери, номери аналогів, написання з дефісами і без. Це окрема пошукова логіка, яку ми будуємо на власному індексі — саме вона відрізняє робочий магазин запчастин від каталогу з фільтрами."),
  h2("Каталог, фіди постачальників і синхронізація залишків"),
  p("Другий кит магазину запчастин — автоматичний обмін даними з постачальниками. Ручне оновлення прайсів на 30 000 позицій — це повна ставка окремого співробітника і гарантовані помилки."),
  li("**Імпорт прайсів.** Постачальники віддають XML, Excel/CSV або API. Система за розкладом забирає файли, мапить колонки, оновлює ціни й залишки."),
  li("**TecDoc та товарні бази.** Дають описи, фото, характеристики й таблиці сумісності — не треба заповнювати картки вручну."),
  li("**Правила націнки.** Гнучкі формули: своя націнка на бренд, групу товарів чи ціновий діапазон, окремі ціни для оптовиків."),
  li("**Пріоритет постачальників.** Якщо деталь є в трьох прайсах, система показує оптимальну комбінацію ціни та строку поставки."),
  p("Технічно це виглядає так: типова інтеграція (один фід, стандартний формат) коштує **$200–500**, складні сценарії — синхронізація з 1С, власним складом, кількома API одночасно — **$1 000–3 000**. Ці цифри варто закладати в бюджет одразу, а не «потім докрутимо»."),
  cta(
    "Порахуйте свій магазин запчастин за 2 хвилини",
    "Відповідте на кілька запитань у калькуляторі — і отримайте вилку бюджету під ваш каталог та інтеграції ще до дзвінка.",
    "Відкрити калькулятор",
    "/calculator"
  ),
  h2("Оплата, доставка і кабінет покупця"),
  p("В Україні покупець запчастин очікує звичний сценарій: **Нова Пошта** з накладеним платежем, оплата карткою онлайн або частинами. Мінімальний набір для запуску:"),
  li("Інтеграція з API Нової Пошти: автоматичний розрахунок вартості, вибір відділення на мапі, генерація ТТН із кабінету менеджера."),
  li("Онлайн-оплата (LiqPay, monobank, WayForPay) плюс накладений платіж — у запчастинах на нього досі припадає велика частка замовлень."),
  li("Статуси замовлення: «підтверджено — відправлено — у відділенні». Кожен статус — SMS або повідомлення у Viber/Telegram."),
  li("Кабінет покупця з «гаражем» авто та історією замовлень — повторні продажі в запчастинах роблять до половини виторгу."),
  p("Для B2B-сегмента (СТО, магазини-партнери) додають окремі оптові ціни, відстрочку платежу і швидке замовлення списком артикулів — це вже функції кастомної платформи, як у проєктах для [автобізнесу](/sites-for/auto)."),
  h2("Скільки коштує інтернет-магазин автозапчастин і скільки це триває"),
  p("Розробка [інтернет-магазину](/online-store) у нашій студії стартує від $3 500 — це каталог на базі корпоративної платформи з ручним підбором і одним фідом. Повноцінна кастомна платформа з VIN-підбором — від $6 000. Ось як бюджет розкладається на етапи:"),
  table(
    ["Етап", "Строк", "Ціна"],
    [
      ["Аналітика, структура каталогу, прототип", "1–2 тижні", "входить у пакет"],
      ["Дизайн і верстка (головна, каталог, картка, кошик)", "2–3 тижні", "входить у пакет"],
      ["Базовий магазин: каталог, кошик, оплата, Нова Пошта", "разом 6–8 тижнів", "**від $3 500**"],
      ["Кастомна платформа: VIN-підбір, крос-номери, гараж", "разом 8–12 тижнів", "**від $6 000**"],
      ["Інтеграція фіда постачальника (за один фід)", "3–7 днів", "$200–500"],
      ["Складні інтеграції: 1С, склад, кілька API", "2–4 тижні", "$1 000–3 000"],
      ["Підтримка після запуску", "щомісяця", "$200/міс або $40/год"],
      ["SEO-просування каталогу", "від 3 міс", "від $300/міс"],
    ]
  ),
  p("Що входить у кожен пакет і з чого складається ціна сайту взагалі — ми детально розбирали у статті про [вартість розробки сайту у 2026](/blog/vartist-rozrobky-saytu-2026). Головне правило бюджету запчастин: закладайте гроші не лише на запуск, а й на [підтримку](/support) — фіди постачальників змінюють формати, і хтось має тримати синхронізацію живою."),
  h2("Конструктор, OpenCart/WordPress чи кастом: що обрати для запчастин"),
  p("Це найчастіше питання на першій консультації. Коротка відповідь: конструктор для запчастин не варіант, OpenCart чи WooCommerce — компроміс для старту з малим каталогом, кастом — коли підбір і фіди мають працювати без милиць."),
  table(
    ["Критерій", "Конструктор", "OpenCart / WordPress", "Кастомна платформа"],
    [
      ["Каталог 30 000+ SKU", "ні, гальмує вже на тисячах", "так, але повільніє без оптимізації", "так, розрахована на сотні тисяч"],
      ["VIN-підбір і крос-номери", "ні", "частково, через платні модулі", "так, під ваші бази"],
      ["Фіди постачальників", "вручну", "модулі + доробки", "автоматично, будь-які формати"],
      ["Швидкість і SEO", "посередньо", "залежить від збірки", "високі Core Web Vitals з коробки"],
      ["Стартовий бюджет", "$20–50/міс", "$1 500–3 000", "**від $6 000**"],
      ["Кому підходить", "нікому в цій ніші", "старт до 5 000 SKU, один фід", "зростаючий магазин, B2B, кілька постачальників"],
    ]
  ),
  p("Чесна порада: якщо каталог до кількох тисяч позицій і один постачальник — стартуйте простіше і перевірте попит. Але якщо у планах кілька фідів, СТО-клієнти й реклама на каталог — дешевше одразу будувати платформу, ніж через рік переносити магазин разом із SEO-позиціями."),
  h2("SEO для магазину запчастин: безкоштовний трафік з каталогу"),
  p("Каталог запчастин — це тисячі потенційних посадкових сторінок. Людина гуглить не «магазин запчастин», а конкретне: «фільтр салону октавія а5», «гальмівні колодки спрінтер ціна». Якщо структура каталогу зроблена правильно, кожна категорія, бренд і навіть зв'язка «деталь + модель авто» стає окремою сторінкою, яка збирає свій пошуковий трафік без жодної гривні на рекламу."),
  li("**Сторінки категорій і брендів** з унікальними текстами й мета-тегами — базовий рівень, який закриває середньочастотні запити."),
  li("**Програмні сторінки сумісності** «деталь для конкретної моделі» генеруються автоматично з даних каталогу і закривають тисячі низькочастотних запитів."),
  li("**Швидкість.** Каталог на кастомній платформі тримає високі Core Web Vitals навіть на сторінках із сотнями позицій — а швидкість напряму впливає і на позиції, і на конверсію."),
  p("Важливо: SEO-структуру треба закладати на етапі проєктування, а не «після запуску». Перенести магазин на нову структуру через рік — значить втратити частину позицій на місяці. Системне [просування каталогу](/seo) ми ведемо від $300/міс, і воно окупається саме на довгому хвості запитів."),
  h2("Кейси: як це виглядає в реальних проєктах"),
  p("Ми робимо сайти для автобізнесу не в теорії. Два приклади з портфоліо студії:"),
  li("[Raul Avto](/portfolio/raul-avto) — сайт автобізнесу з каталогом і швидкими фільтрами: підбір авто за параметрами, оптимізація під мобільний трафік, звідки приходить більшість покупців."),
  li("[Right Cars](/portfolio/right-cars) — платформа для автомобільної компанії з великим каталогом: структура під SEO, швидкі сторінки позицій, зручна адмінка для менеджерів."),
  p("Обидва проєкти будувалися за тим самим принципом, що й магазин запчастин: швидкий каталог, зрозумілий підбір, мінімум кліків до заявки. Більше робіт для [e-commerce](/sites-for/ecommerce) — у портфоліо."),
  h2("З чого почати: план на перший тиждень"),
  num("Порахуйте каталог: скільки SKU, скільки постачальників, у яких форматах вони віддають прайси."),
  num("Вирішіть щодо підбору: чи потрібен VIN одразу, чи достатньо марки-моделі на старті."),
  num("Зберіть вимоги до оплати й доставки: Нова Пошта, накладений платіж, оплата частинами, B2B-ціни."),
  num("Визначте бюджет за таблицею вище і додайте 15–20% резерву на інтеграції."),
  num("Отримайте оцінку: покажіть нам прайси постачальників — і ми скажемо точну ціну та строк."),
  cta(
    "Потрібен магазин запчастин, який продає?",
    "Покажемо, як виглядатиме ваш каталог із VIN-підбором, і назвемо точну ціну після короткого брифу. Безкоштовно.",
    "Обговорити проєкт",
    "/calculator"
  ),
];

const bodyRu = [
  tldr("Коротко", [
    "Создание интернет-магазина автозапчастей под ключ стоит от $3 500 (каталог на готовой платформе) до $6 000+ (кастомная платформа с VIN-подбором и фидами поставщиков).",
    "Сложность не в дизайне, а в каталоге: десятки тысяч SKU, кросс-номера, аналоги и привязка к конкретным авто.",
    "Подбор по VIN и марке-модели — обязателен: покупатель боится заказать «не ту» деталь, и именно подбор снимает этот страх.",
    "Цены и остатки должны обновляться из прайсов поставщиков автоматически (TecDoc, XML/Excel, API) — вручную такой каталог не удержать.",
    "Срок запуска — 6–12 недель в зависимости от количества интеграций.",
  ]),
  p("Создание интернет-магазина автозапчастей обойдётся **от $3 500** на базе готовой e-commerce-платформы и **от $6 000** за кастомную разработку с VIN-подбором и синхронизацией остатков; типичный срок — **6–12 недель**. Итоговая цена сайта интернет-магазина автозапчастей под ключ зависит от трёх факторов: размера каталога, числа поставщиков и глубины автоматизации."),
  p("Разберём по шагам, чем создание сайта по продаже автозапчастей отличается от обычного магазина, какие функции реально приносят заказы, из чего складывается смета и когда хватит готовой платформы, а когда нужна кастомная разработка. Все цифры — из реальных проектов нашей студии для автобизнеса."),
  h2("Почему магазин запчастей сложнее обычного e-commerce"),
  p("Обычный магазин продаёт товары, которые выбирают глазами: фото, цена, отзывы. С запчастями так не работает. Покупателю нужна не «хорошая тормозная колодка», а деталь, которая **гарантированно встанет на его машину**. Ошибка — это возврат, негативный отзыв и потерянный клиент."),
  li("**Объём каталога.** Нишевый магазин — это 10 000–50 000 SKU, универсальный — сотни тысяч позиций из десятков прайсов."),
  li("**Кросс-номера и аналоги.** У одной детали есть OEM-номер и 5–20 номеров заменителей. Поиск обязан находить все варианты."),
  li("**Применимость.** Каждая позиция привязана к списку автомобилей: марка, модель, поколение, двигатель. Без этого растут возвраты и падает конверсия."),
  li("**Живые прайсы.** Поставщики обновляют цены и остатки ежедневно. Продать деталь, которой нет на складе, — быстрый способ убить репутацию."),
  p("Поэтому создание сайта автозапчастей на конструкторе «за неделю» почти никогда не срабатывает: конструкторы не умеют ни кросс-номера, ни подбор по авто, ни массовый импорт прайсов. О границах конструкторов мы подробно писали в сравнении [Next.js против WordPress и конструкторов](/ru/blog/nextjs-protiv-wordpress-i-konstruktorov)."),
  h2("Подбор по VIN и марке-модели: главный продавец"),
  p("Продаёт не каталог, а уверенность покупателя в совместимости. Её дают три инструмента поиска, и в сильном магазине они работают одновременно."),
  h3("Подбор по VIN-коду"),
  p("Покупатель вводит 17 символов VIN — система определяет комплектацию и показывает только совместимые детали. Это самый точный способ подбора и главный сигнал доверия: магазин «знает» именно эту машину. Реализуется через базы типа TecDoc или API поставщиков; для редких случаев добавляют форму «подбор менеджером по VIN» — она же отлично собирает лиды."),
  h3("Подбор по марке — модели — году"),
  p("Классическая цепочка селекторов: марка, модель, поколение, двигатель. Выбранный автомобиль сохраняется в «гараже» пользователя, и каталог фильтруется под него автоматически. Постоянные клиенты сразу видят «свои» детали — это прямой рост повторных продаж."),
  h3("Поиск по артикулу и кросс-номерам"),
  p("Профессионалы — СТО и перекупщики — ищут сразу по номеру детали. Поиск должен понимать OEM-номера, номера аналогов, написание с дефисами и без. Это отдельная поисковая логика на собственном индексе, и именно она отличает рабочий магазин запчастей от «каталога с фильтрами»."),
  h2("Каталог, фиды поставщиков и синхронизация остатков"),
  p("Второй столп проекта — автоматический обмен данными с поставщиками. Ручное обновление прайса на 30 000 позиций — это полная ставка отдельного сотрудника и неизбежные ошибки в ценах."),
  li("**Импорт прайсов.** Поставщики отдают XML, Excel/CSV или API. Система по расписанию забирает файлы, сопоставляет колонки, обновляет цены и остатки."),
  li("**TecDoc и товарные базы.** Дают описания, фото, характеристики и таблицы применимости — карточки не приходится заполнять вручную."),
  li("**Правила наценки.** Своя наценка на бренд, группу товаров или ценовой диапазон; отдельные цены для оптовиков."),
  li("**Приоритет поставщиков.** Если деталь есть в трёх прайсах, система предлагает лучшую комбинацию цены и срока поставки."),
  p("В деньгах это выглядит так: типовая интеграция (один фид, стандартный формат) — **$200–500**, сложные сценарии — синхронизация с 1С, собственным складом, несколькими API — **$1 000–3 000**. Закладывайте эти суммы в бюджет сразу, а не «докрутим потом»."),
  cta(
    "Посчитайте свой магазин запчастей за 2 минуты",
    "Ответьте на несколько вопросов в калькуляторе — и получите вилку бюджета под ваш каталог и интеграции ещё до созвона.",
    "Открыть калькулятор",
    "/ru/calculator"
  ),
  h2("Оплата, доставка и кабинет покупателя"),
  p("Покупатель запчастей в Украине ожидает привычный сценарий: **Новая Почта** с наложенным платежом, оплата картой онлайн или частями. Минимальный набор для запуска:"),
  li("Интеграция с API Новой Почты: расчёт стоимости, выбор отделения на карте, генерация ТТН из кабинета менеджера."),
  li("Онлайн-оплата (LiqPay, monobank, WayForPay) плюс наложенный платёж — в запчастях на него до сих пор приходится заметная доля заказов."),
  li("Статусы заказа «подтверждён — отправлен — в отделении» с уведомлениями по SMS, в Viber или Telegram."),
  li("Личный кабинет с «гаражом» автомобилей и историей заказов — повторные продажи в запчастях делают до половины выручки."),
  p("Для B2B-сегмента (СТО, магазины-партнёры) добавляют оптовые цены, отсрочку платежа и быстрый заказ списком артикулов — это уже уровень кастомной платформы, как в наших проектах для [автобизнеса](/ru/sites-for/auto)."),
  h2("Создание интернет-магазина автозапчастей: цена и сроки"),
  p("Разработка [интернет-магазина](/ru/online-store) в нашей студии начинается от $3 500 — каталог на базе корпоративной платформы с ручным подбором и одним фидом. Создание интернет-магазина автозапчастей под ключ с VIN-подбором — от $6 000. Вот как смета раскладывается по этапам:"),
  table(
    ["Этап", "Срок", "Цена"],
    [
      ["Аналитика, структура каталога, прототип", "1–2 недели", "входит в пакет"],
      ["Дизайн и вёрстка (главная, каталог, карточка, корзина)", "2–3 недели", "входит в пакет"],
      ["Базовый магазин: каталог, корзина, оплата, Новая Почта", "итого 6–8 недель", "**от $3 500**"],
      ["Кастомная платформа: VIN-подбор, кросс-номера, гараж", "итого 8–12 недель", "**от $6 000**"],
      ["Интеграция фида поставщика (за один фид)", "3–7 дней", "$200–500"],
      ["Сложные интеграции: 1С, склад, несколько API", "2–4 недели", "$1 000–3 000"],
      ["Поддержка после запуска", "ежемесячно", "$200/мес или $40/час"],
      ["SEO-продвижение каталога", "от 3 мес", "от $300/мес"],
    ]
  ),
  p("Из чего вообще складывается цена сайта и что входит в каждый пакет — разбирали в статье [сколько стоит сайт в 2026 году](/ru/blog/skolko-stoit-sayt-2026). Главное правило бюджета на запчасти: считайте не только запуск, но и [поддержку](/ru/support) — поставщики меняют форматы прайсов, и кто-то должен держать синхронизацию живой."),
  h2("Конструктор, OpenCart/WordPress или кастом: что выбрать под запчасти"),
  p("Самый частый вопрос на первой консультации. Короткий ответ: конструктор для запчастей не вариант в принципе, OpenCart или WooCommerce — компромисс для старта с небольшим каталогом, кастом — когда подбор и фиды должны работать без костылей."),
  table(
    ["Критерий", "Конструктор", "OpenCart / WordPress", "Кастомная платформа"],
    [
      ["Каталог 30 000+ SKU", "нет, тормозит уже на тысячах", "да, но замедляется без оптимизации", "да, рассчитана на сотни тысяч"],
      ["VIN-подбор и кросс-номера", "нет", "частично, платными модулями", "да, под ваши базы"],
      ["Фиды поставщиков", "вручную", "модули + доработки", "автоматически, любые форматы"],
      ["Скорость и SEO", "средне", "зависит от сборки", "высокие Core Web Vitals из коробки"],
      ["Стартовый бюджет", "$20–50/мес", "$1 500–3 000", "**от $6 000**"],
      ["Кому подходит", "никому в этой нише", "старт до 5 000 SKU, один фид", "растущий магазин, B2B, несколько поставщиков"],
    ]
  ),
  p("Честный совет: если каталог до нескольких тысяч позиций и поставщик один — стартуйте проще и проверьте спрос. Но если в планах несколько фидов, клиенты-СТО и реклама на каталог, дешевле сразу строить платформу, чем через год переезжать вместе с SEO-позициями и терять трафик."),
  h2("SEO для магазина запчастей: бесплатный трафик из каталога"),
  p("Каталог запчастей — это тысячи потенциальных посадочных страниц. Человек гуглит не «магазин запчастей», а конкретное: «фильтр салона октавия а5», «тормозные колодки спринтер цена». При правильной структуре каталога каждая категория, бренд и даже связка «деталь + модель авто» превращается в отдельную страницу, которая собирает свой поисковый трафик без единой копейки на рекламу."),
  li("**Страницы категорий и брендов** с уникальными текстами и мета-тегами — базовый уровень, закрывающий среднечастотные запросы."),
  li("**Программные страницы применимости** «деталь для конкретной модели» генерируются автоматически из данных каталога и закрывают тысячи низкочастотных запросов."),
  li("**Скорость.** Каталог на кастомной платформе держит высокие Core Web Vitals даже на страницах с сотнями позиций — а скорость напрямую влияет и на позиции, и на конверсию."),
  p("Важно: SEO-структуру нужно закладывать на этапе проектирования, а не «после запуска». Переезд магазина на новую структуру через год — это потеря части позиций на месяцы. Системное [продвижение каталога](/ru/seo) мы ведём от $300/мес, и окупается оно именно на длинном хвосте запросов."),
  h2("Кейсы: как это выглядит в реальных проектах"),
  p("Сайты для автобизнеса мы делаем не в теории. Два примера из портфолио студии:"),
  li("[Raul Avto](/ru/portfolio/raul-avto) — сайт автобизнеса с каталогом и быстрыми фильтрами: подбор по параметрам, упор на мобильный трафик, откуда приходит большинство покупателей."),
  li("[Right Cars](/ru/portfolio/right-cars) — платформа автомобильной компании с большим каталогом: SEO-структура, быстрые страницы позиций, удобная админка для менеджеров."),
  p("Оба проекта построены на тех же принципах, что и магазин запчастей: быстрый каталог, понятный подбор, минимум кликов до заявки. Больше работ для [e-commerce](/ru/sites-for/ecommerce) — в портфолио."),
  h2("С чего начать: план на первую неделю"),
  num("Посчитайте каталог: сколько SKU, сколько поставщиков, в каких форматах они отдают прайсы."),
  num("Решите вопрос подбора: нужен ли VIN сразу или на старте хватит марки-модели."),
  num("Соберите требования к оплате и доставке: Новая Почта, наложенный платёж, оплата частями, B2B-цены."),
  num("Определите бюджет по таблице выше и добавьте 15–20% резерва на интеграции."),
  num("Получите оценку: пришлите нам прайсы поставщиков — назовём точную цену и срок."),
  cta(
    "Нужен магазин запчастей, который продаёт?",
    "Покажем, как будет выглядеть ваш каталог с VIN-подбором, и назовём точную цену после короткого брифа. Бесплатно.",
    "Обсудить проект",
    "/ru/calculator"
  ),
];

const bodyEn = [
  tldr("TL;DR", [
    "An auto parts online store costs from $3,500 (catalogue on a ready-made platform) to $6,000+ (custom platform with VIN lookup and supplier feeds).",
    "The hard part is not design but the catalogue: tens of thousands of SKUs, cross-references, analogues and per-vehicle fitment data.",
    "VIN and make-model-year lookup is non-negotiable: buyers fear ordering the wrong part, and fitment search removes that fear.",
    "Prices and stock must sync automatically from supplier feeds (TecDoc, XML/Excel, API) — a catalogue this size cannot be maintained by hand.",
    "Typical launch timeline is 6–12 weeks depending on the number of integrations.",
  ]),
  p("Building an auto parts online store costs **from $3,500** on a ready-made e-commerce base and **from $6,000** for a custom auto parts ecommerce website with VIN lookup and stock synchronisation; the typical timeline is **6–12 weeks**. Three factors drive the price: catalogue size, number of suppliers and how much of the workflow you automate."),
  p("This guide breaks down what makes a parts store harder than regular e-commerce, which features actually generate orders, what each stage costs, and when an off-the-shelf platform is enough versus when custom development pays off. The numbers come from real automotive projects delivered by our studio — a Ukrainian team shipping European-quality builds at sensible rates."),
  h2("Why a parts store is harder than regular e-commerce"),
  p("A typical online shop sells products people choose visually: photo, price, reviews. Auto parts work differently. The buyer does not want «a nice brake pad» — they want the part that is **guaranteed to fit their exact car**. A mistake means a return, a bad review and a lost customer."),
  li("**Catalogue size.** Even a niche store carries 10,000–50,000 SKUs; a general one holds hundreds of thousands of items from dozens of price lists."),
  li("**Cross-references and analogues.** One part has an OEM number plus 5–20 substitute numbers from different brands. Search has to find them all."),
  li("**Fitment data.** Every item maps to a list of vehicles: make, model, generation, engine. Without it, returns climb and conversion drops."),
  li("**Live supplier pricing.** Price lists change daily, sometimes several times a day. Selling a part that is out of stock is the fastest way to wreck your reputation."),
  p("That is why a template store «built in a week» on a site builder almost never works for parts: builders cannot handle cross-references, per-vehicle filtering or bulk price imports. We covered the limits of builders in detail in [Next.js vs WordPress and site builders](/en/blog/nextjs-vs-wordpress-for-business-2026)."),
  h2("VIN and make-model lookup: the real salesperson"),
  p("It is not the catalogue that sells — it is the buyer's confidence that the part will fit. Three search tools create that confidence, and a strong store runs all three together."),
  h3("VIN lookup"),
  p("The buyer enters the 17-character VIN, the system resolves the exact vehicle configuration and shows only compatible parts. It is the most precise selection method and the strongest trust signal: the store «knows» this specific car. It is built on databases such as TecDoc or supplier APIs; for edge cases you add a «manager will match by VIN» form, which doubles as a lead generator."),
  h3("Make — model — year selector"),
  p("The classic chain of dropdowns: make, model, generation, engine. The chosen vehicle is saved to the user's «garage», and the whole catalogue filters itself around it. Returning customers land on the site and immediately see parts for their car — a direct boost to repeat sales."),
  h3("Part number and cross-reference search"),
  p("Trade buyers — garages and resellers — search by part number straight away. Search must understand OEM numbers, analogue numbers, and spellings with or without dashes. That is a dedicated search index, and it is exactly what separates a working parts store from «a catalogue with filters»."),
  h2("Catalogue, supplier feeds and stock synchronisation"),
  p("The second pillar is automated data exchange with suppliers. Manually updating a 30,000-line price list is a full-time job for a dedicated employee — with guaranteed pricing errors."),
  li("**Price list imports.** Suppliers deliver XML, Excel/CSV or an API. The system fetches files on a schedule, maps the columns, and updates prices and stock."),
  li("**TecDoc and product databases.** They provide descriptions, photos, specs and fitment tables — so product cards do not have to be filled in by hand."),
  li("**Margin rules.** Flexible mark-ups per brand, product group or price band, with separate trade pricing for wholesale customers."),
  li("**Supplier priority.** When a part appears in three price lists, the system picks the best combination of price and delivery time."),
  p("In money terms: a typical integration (one feed, standard format) costs **$200–500**; complex scenarios — ERP sync, your own warehouse, several APIs at once — run **$1,000–3,000**. Budget for this from day one rather than «adding it later»."),
  cta(
    "Price your parts store in 2 minutes",
    "Answer a few questions in the calculator and get a budget range for your catalogue and integrations before the first call.",
    "Open the calculator",
    "/en/calculator"
  ),
  h2("Payments, delivery and the customer account"),
  p("A parts buyer expects a frictionless checkout: card payment online, cash on delivery where it is customary, and clear shipping options with live tracking. The minimum launch set:"),
  li("Carrier API integration: delivery cost calculation, pick-up point selection on a map, and shipping label generation from the manager's dashboard."),
  li("Online card payments plus cash on delivery — in the parts niche it still accounts for a noticeable share of orders."),
  li("Order statuses «confirmed — dispatched — ready for pick-up» with SMS or messenger notifications at every step."),
  li("A customer account with a vehicle «garage» and order history — repeat purchases drive up to half of parts revenue."),
  p("For the B2B segment (garages, partner shops) you add trade pricing, deferred payment and quick ordering by part-number list — that is custom-platform territory, as in our projects for the [automotive industry](/en/sites-for/auto)."),
  h2("Auto parts online store cost and timeline"),
  p("[Online store development](/en/online-store) at our studio starts from $3,500 — a catalogue on our corporate platform base with manual part matching and one supplier feed. A full custom auto parts platform with VIN lookup starts from $6,000. Here is how the budget breaks down by stage:"),
  table(
    ["Stage", "Timeline", "Price"],
    [
      ["Discovery, catalogue structure, prototype", "1–2 weeks", "included in package"],
      ["Design and build (home, catalogue, product page, cart)", "2–3 weeks", "included in package"],
      ["Core store: catalogue, cart, payments, delivery", "6–8 weeks total", "**from $3,500**"],
      ["Custom platform: VIN lookup, cross-references, garage", "8–12 weeks total", "**from $6,000**"],
      ["Supplier feed integration (per feed)", "3–7 days", "$200–500"],
      ["Complex integrations: ERP, warehouse, multiple APIs", "2–4 weeks", "$1,000–3,000"],
      ["Post-launch support", "monthly", "$200/mo or $40/hr"],
      ["Catalogue SEO", "from 3 months", "from $300/mo"],
    ]
  ),
  p("For a wider look at what goes into website pricing, see our guide to [custom website costs in 2026](/en/blog/custom-website-cost-uk-2026). The golden rule of a parts budget: plan for the launch **and** for ongoing support — suppliers change feed formats, and someone has to keep the synchronisation alive."),
  h2("Site builder, OpenCart/WordPress or custom: what fits a parts business"),
  p("The most common question on a first call. The short answer: a site builder is not an option for parts at all, OpenCart or WooCommerce is a compromise for a small-catalogue start, and custom wins when fitment search and feeds must work without workarounds."),
  table(
    ["Criterion", "Site builder", "OpenCart / WordPress", "Custom platform"],
    [
      ["Catalogue of 30,000+ SKUs", "no, slows down at thousands", "yes, but degrades without tuning", "yes, built for hundreds of thousands"],
      ["VIN lookup and cross-references", "no", "partially, via paid plugins", "yes, tailored to your data"],
      ["Supplier feeds", "manual only", "plugins + custom work", "automatic, any format"],
      ["Speed and SEO", "mediocre", "depends on the build", "strong Core Web Vitals out of the box"],
      ["Starting budget", "$20–50/mo", "$1,500–3,000", "**from $6,000**"],
      ["Best for", "nobody in this niche", "up to 5,000 SKUs, one feed", "growing store, B2B, multiple suppliers"],
    ]
  ),
  p("Honest advice: with a few thousand SKUs and a single supplier, start simple and validate demand. But if the plan includes several feeds, trade customers and paid traffic to the catalogue, it is cheaper to build the platform once than to migrate a year later and risk your SEO rankings."),
  h2("Case studies: what this looks like in practice"),
  p("We build automotive websites in production, not in theory. Two examples from the studio portfolio:"),
  li("[Raul Avto](/en/portfolio/raul-avto) — an automotive business site with a fast, filterable catalogue: parameter-based vehicle search and a mobile-first build, since most buyers arrive on phones."),
  li("[Right Cars](/en/portfolio/right-cars) — a platform for an automotive company with a large catalogue: SEO-friendly structure, fast listing pages and a manager-friendly admin panel."),
  p("Both projects follow the same principles as a parts store: a fast catalogue, obvious fitment search, and the minimum number of clicks to an order. More [e-commerce work](/en/sites-for/ecommerce) is in the portfolio."),
  h2("Where to start: a one-week plan"),
  num("Measure the catalogue: how many SKUs, how many suppliers, and which formats their price lists come in."),
  num("Decide on fitment search: do you need VIN lookup at launch, or is make-model enough to start?"),
  num("List payment and delivery requirements: card payments, cash on delivery, instalments, trade pricing."),
  num("Set the budget using the table above and add a 15–20% reserve for integrations."),
  num("Get an estimate: send us your supplier price lists and we will quote an exact price and timeline."),
  cta(
    "Need a parts store that actually sells?",
    "We will show you what your catalogue with VIN lookup will look like and quote an exact price after a short brief. Free of charge.",
    "Discuss the project",
    "/en/calculator"
  ),
];

const doc = {
  _id: "ltAug2026-internet-mahazyn-avtozapchastyn",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 11,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "internet-mahazyn-avtozapchastyn" },
    ru: { _type: "slug", current: "internet-magazin-avtozapchastey" },
    en: { _type: "slug", current: "auto-parts-online-store" },
  },
  title: {
    _type: "localizedString",
    uk: "Інтернет-магазин автозапчастин: як створити сайт, який продає",
    ru: "Создание интернет-магазина автозапчастей: сайт, который продаёт",
    en: "Auto Parts Online Store: How to Build a Site That Sells",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Інтернет-магазин автозапчастин під ключ — ціна 2026",
    ru: "Создание интернет-магазина автозапчастей — цена 2026",
    en: "Auto Parts Online Store: Cost & Features 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Інтернет-магазин автозапчастин під ключ від $3 500 ✔️ VIN-підбір, фіди TecDoc, синхронізація залишків ✔️ Строки 6–12 тижнів ➡ Реальні ціни студії",
    ru: "➤ Создание интернет-магазина автозапчастей под ключ от $3 500 ✔️ VIN-подбор, фиды TecDoc, синхронизация остатков ✔️ Сроки 6–12 недель ➡ Цены студии",
    en: "➤ Auto parts online store from $3,500 ✔️ VIN lookup, TecDoc feeds, stock sync ✔️ Launch in 6–12 weeks ➡ Real studio pricing and a stage-by-stage breakdown",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "E-commerce для автобізнесу",
    ru: "E-commerce для автобизнеса",
    en: "Automotive e-commerce",
  },
  lede: {
    _type: "localizedString",
    uk: "VIN-підбір, крос-номери, фіди постачальників і синхронізація залишків: розбираємо, скільки коштує інтернет-магазин автозапчастин під ключ, з яких етапів складається розробка і коли потрібна кастомна платформа замість шаблону.",
    ru: "VIN-подбор, кросс-номера, фиды поставщиков и синхронизация остатков: разбираем, сколько стоит создание интернет-магазина автозапчастей под ключ, из каких этапов состоит разработка и когда нужна кастомная платформа вместо шаблона.",
    en: "VIN lookup, cross-references, supplier feeds and stock sync: what an auto parts ecommerce website really costs, how the build breaks down into stages, and when a custom platform beats an off-the-shelf template.",
  },
  tags: ["інтернет-магазин", "автозапчастини", "e-commerce", "автобізнес"],
  relatedPostSlugs: ["vartist-rozrobky-saytu-2026", "nextjs-proty-wordpress-ta-konstruktoriv", "yak-pratsyuye-admin-panel-saytu"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує інтернет-магазин автозапчастин?",
        ru: "Сколько стоит интернет-магазин автозапчастей?",
        en: "How much does an auto parts online store cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Від $3 500 за магазин на базі корпоративної платформи з одним фідом постачальника і від $6 000 за кастомну платформу з VIN-підбором, крос-номерами та автоматичною синхронізацією залишків. Додатково закладайте $200–500 за кожну типову інтеграцію і $1 000–3 000 за складні (1С, склад, кілька API).",
        ru: "От $3 500 за магазин на базе корпоративной платформы с одним фидом поставщика и от $6 000 за кастомную платформу с VIN-подбором, кросс-номерами и автоматической синхронизацией остатков. Дополнительно закладывайте $200–500 за каждую типовую интеграцию и $1 000–3 000 за сложные (1С, склад, несколько API).",
        en: "From $3,500 for a store on a corporate platform base with one supplier feed, and from $6,000 for a custom platform with VIN lookup, cross-references and automatic stock sync. Budget an extra $200–500 per standard integration and $1,000–3,000 for complex ones (ERP, warehouse, multiple APIs).",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає створення магазину запчастин?",
        ru: "Сколько делается интернет-магазин автозапчастей?",
        en: "How long does it take to build a parts store?",
      },
      answer: {
        _type: "localizedText",
        uk: "Базовий магазин із каталогом, кошиком, оплатою і Новою Поштою — 6–8 тижнів. Кастомна платформа з VIN-підбором і кількома фідами постачальників — 8–12 тижнів. Найбільше на строк впливає кількість інтеграцій і готовність ваших прайсів.",
        ru: "Базовый магазин с каталогом, корзиной, оплатой и доставкой — 6–8 недель. Кастомная платформа с VIN-подбором и несколькими фидами поставщиков — 8–12 недель. Сильнее всего на срок влияют количество интеграций и готовность ваших прайсов.",
        en: "A core store with a catalogue, cart, payments and delivery takes 6–8 weeks. A custom platform with VIN lookup and several supplier feeds takes 8–12 weeks. The biggest timeline factors are the number of integrations and how ready your price lists are.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна підключити мій склад або 1С?",
        ru: "Можно ли подключить мой склад или 1С?",
        en: "Can you connect my warehouse or ERP system?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так. Магазин синхронізується з обліковою системою: залишки й ціни підтягуються автоматично, замовлення з сайту падають у ваш облік. Типова інтеграція коштує $200–500, складна двостороння синхронізація з 1С чи власним складом — $1 000–3 000.",
        ru: "Да. Магазин синхронизируется с учётной системой: остатки и цены подтягиваются автоматически, заказы с сайта попадают в ваш учёт. Типовая интеграция стоит $200–500, сложная двусторонняя синхронизация с 1С или собственным складом — $1 000–3 000.",
        en: "Yes. The store syncs with your inventory system: stock and prices update automatically, and website orders flow into your back office. A standard integration costs $200–500; complex two-way sync with an ERP or your own warehouse runs $1,000–3,000.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи обов'язковий підбір за VIN на старті?",
        ru: "Обязателен ли VIN-подбор на старте?",
        en: "Is VIN lookup mandatory at launch?",
      },
      answer: {
        _type: "localizedText",
        uk: "Ні, але бажаний. На старті можна обійтися підбором за маркою-моделлю-роком і пошуком за артикулом, а VIN додати другим етапом. Якщо ж ваша аудиторія — роздрібні покупці, які не знають артикулів, VIN-підбір напряму підвищує конверсію і зменшує повернення.",
        ru: "Нет, но желателен. На старте можно обойтись подбором по марке-модели-году и поиском по артикулу, а VIN добавить вторым этапом. Если же ваша аудитория — розничные покупатели, не знающие артикулов, VIN-подбор напрямую повышает конверсию и сокращает возвраты.",
        en: "No, but it is recommended. You can launch with make-model-year selection and part-number search, then add VIN lookup in phase two. If your audience is retail buyers who do not know part numbers, VIN lookup directly lifts conversion and cuts returns.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки постачальників можна підключити до магазину?",
        ru: "Сколько поставщиков можно подключить к магазину?",
        en: "How many suppliers can the store handle?",
      },
      answer: {
        _type: "localizedText",
        uk: "Обмежень немає: кастомна платформа працює з будь-якою кількістю фідів у форматах XML, Excel/CSV чи API. Для кожного постачальника налаштовуються власні правила націнки та пріоритету, а система сама обирає оптимальну комбінацію ціни й строку поставки.",
        ru: "Ограничений нет: кастомная платформа работает с любым количеством фидов в форматах XML, Excel/CSV или API. Для каждого поставщика настраиваются свои правила наценки и приоритета, а система сама выбирает оптимальную комбинацию цены и срока поставки.",
        en: "There is no limit: a custom platform works with any number of feeds in XML, Excel/CSV or API formats. Each supplier gets its own margin and priority rules, and the system automatically picks the best combination of price and delivery time.",
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
