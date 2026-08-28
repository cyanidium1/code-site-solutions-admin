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
  tldr("Коротко: сайт для СТО, який приводить машини", [
    "Клієнти шукають автосервіс локально й терміново: «СТО поблизу», «ремонт ходової + місто». Сайт має бити саме в ці запити.",
    "Мінімальний набір для запису з сайту: форма онлайн-запису, прайс по послугах, карта проїзду і клікабельний телефон у шапці.",
    "Лендінг для СТО — від $800 і 1–2 тижні. Корпоративний сайт мережі чи сервісу з багатьма напрямками — від $3 500.",
    "Відгуки з маркою авто та фото робіт «до/після» переконують краще за будь-який рекламний банер.",
    "Сайт СТО — не магазин запчастин: тут продається запис на сервіс, а не товар у кошику. Це різні структури і різні запити.",
    "Онлайн-запис через календар із вільними слотами знімає 30–50% дзвінків «а коли можна приїхати?».",
  ]),
  p("Сайт для автосервісу має відповідати на три питання за перші десять секунд: **що ви ремонтуєте, скільки це коштує і як записатися**. На практиці це означає форму онлайн-запису на ремонт, прайс по послугах, карту проїзду, живі відгуки та фото реальних робіт. Лендінг із таким набором коштує від $800, корпоративний сайт для сервісу з кількома напрямками — від $3 500."),
  p("Специфіка ніші в тому, що клієнт СТО майже завжди шукає з телефона і майже завжди терміново: машина стукає, гальма скриплять, кондиціонер не холодить. Він відкриває 2–3 сайти з видачі чи карт, і телефонує туди, де за пів хвилини зрозумів адресу, орієнтовну ціну та що з його проблемою тут працюють. Якщо на сайті лише «індивідуальний підхід і найкращі майстри» — дзвінок піде конкуренту."),
  p("У цій статті розберемо, з чого складається сайт для СТО: які типи сайтів бувають і скільки коштують, які блоки обовʼязкові, як влаштувати онлайн-запис, чому локальне SEO для автосервісу важливіше за банерну рекламу — і покажемо живі кейси зі сфери авто. Розгорнутий опис ніші є на сторінці [сайти для автобізнесу](/sites-for/auto)."),

  h2("Навіщо СТО сайт, якщо є Instagram і Google Maps"),
  p("Картка в Google Maps і профіль в Instagram — потрібні, але це не заміна сайту, а його підсилення. Картка на картах без сайту програє в ранжуванні: Google явно враховує наявність і якість привʼязаного сайту при формуванні локальної видачі. Instagram взагалі не ранжується за запитами типу «ремонт двигуна» — людина з поламаною машиною не гортає стрічку, вона гуглить."),
  li("**Пошуковий трафік.** Сайт збирає запити «СТО + район», «ремонт ходової + місто», «діагностика перед покупкою авто» — сторінки під кожну послугу працюють роками без бюджету на рекламу."),
  li("**Конверсія з карт.** Людина знаходить вас на картах, переходить на сайт перевірити ціни й відгуки — і вже там записується. Без сайту цей ланцюжок обривається."),
  li("**Довіра.** Фото боксів, команди і реальних робіт на власному домені виглядають переконливіше, ніж акаунт із трьома постами за рік."),
  li("**Незалежність.** Алгоритми соцмереж змінюються, акаунти блокуються. Сайт — ваш актив, який нікуди не зникне."),
  p("Тому правильна звʼязка для автосервісу: сайт як центр, Google Business Profile як джерело локального трафіку, соцмережі як вітрина процесу. Як вивести картку в топ-3 карт, ми детально розібрали в статті про [локальне SEO і Google Maps](/blog/lokalne-seo-top-3-google-maps)."),

  h2("Типи сайтів для СТО і скільки вони коштують"),
  p("Автосервісу не потрібен «сайт взагалі» — потрібен формат під розмір бізнесу. Невеликому СТО з однією локацією і десятком послуг вистачить лендінга. Мережі чи сервісу з кузовним цехом, детейлінгом і шиномонтажем — корпоративний сайт зі сторінками під кожен напрямок. А якщо хочеться особистий кабінет клієнта з історією обслуговування — це вже кастомна платформа."),
  table(
    ["Тип сайту", "Кому підходить", "Ціна", "Строк"],
    [
      ["**Лендінг**", "СТО з 1 локацією, 5–15 послуг, головна мета — дзвінки і запис", "від $800", "1–2 тижні"],
      ["**Корпоративний сайт**", "Сервіс із кількома напрямками або мережа: сторінка під кожну послугу і філію", "від $3 500", "3–6 тижнів"],
      ["**Кастомна платформа**", "Кабінет клієнта, історія обслуговування, інтеграція з CRM і складом", "від $6 000", "від 6 тижнів"],
    ]
  ),
  p("Це ціни нашої студії; на ринку вилка ширша — від $300 за шаблон на конструкторі до $15 000+ за платформу з ERP-інтеграцією. Але шаблон за $300 зазвичай не має ні нормального прайса, ні форми запису, ні швидкості — тобто не робить головного. Що саме входить у вартість [лендінга](/landing) і [корпоративного сайту](/corporate-site), розписано на сторінках послуг, а загальну математику цін ми розібрали в статті про [вартість розробки сайту у 2026](/blog/vartist-rozrobky-saytu-2026)."),
  p("Окремий рядок бюджету — інтеграції: підключення форми запису до вашої CRM чи календаря зазвичай коштує $200–500, складні звʼязки з обліковими системами і складом — $1 000–3 000."),

  cta(
    "Порахуйте сайт для свого СТО за 2 хвилини",
    "Онлайн-калькулятор: оберіть тип сайту, кількість послуг та інтеграції — і одразу побачите вилку бюджету без дзвінків менеджера.",
    "Відкрити калькулятор",
    "/calculator"
  ),

  h2("Must-have блоки: що обовʼязково має бути на сайті автосервісу"),
  p("Нижче — перевірений на практиці мінімум. Кожен блок або знімає заперечення, або скорочує шлях до запису. Якщо чогось із цього списку немає — сайт втрачає заявки щодня."),
  table(
    ["Блок", "Навіщо він"],
    [
      ["**Форма онлайн-запису**", "Половина клієнтів шукає сервіс увечері, коли ви не берете слухавку. Форма ловить заявку о 23:00."],
      ["**Прайс по послугах**", "«Ціну скажемо на місці» — головна причина закрити вкладку. Навіть вилка «від–до» втримує клієнта."],
      ["**Карта і проїзд**", "СТО обирають за близькістю. Карта, орієнтири, фото вʼїзду — менше дзвінків «як вас знайти?»."],
      ["**Клікабельний телефон у шапці**", "З телефона дзвонять в один тап. Якщо номер — картинка, ви втрачаєте найгарячіших клієнтів."],
      ["**Відгуки з маркою авто**", "«Мінявся зчеплення на Octavia A5» переконує сильніше за десять анонімних пʼятірок."],
      ["**Фото робіт до/після**", "Кузовний ремонт і детейлінг продаються очима. Реальні фото з вашого боксу, не сток."],
    ]
  ),
  p("Додатково добре працюють: блок «наші майстри» з іменами і стажем, гарантія на роботи з конкретним строком, список марок, з якими працюєте, і секція «як ми працюємо» на 4–5 кроків — від заявки до видачі авто. Ці дизайн-рішення підвищують конверсію незалежно від ніші, ми зібрали їх у добірці [9 дизайн-прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),

  h2("Онлайн-запис на ремонт: проста форма чи календар"),
  h3("Варіант 1: проста форма заявки"),
  p("Поля: імʼя, телефон, марка авто, опис проблеми, бажана дата. Заявка падає адміністратору в Telegram чи на пошту, він передзвонює і підтверджує час. Це базовий рівень — дешево, надійно, входить у вартість лендінга. Для СТО з одним постом прийому цього достатньо."),
  h3("Варіант 2: календар із вільними слотами"),
  p("Клієнт сам бачить вільний час по підйомниках чи майстрах і бронює слот — як запис до лікаря. Такий календар знімає 30–50% вхідних дзвінків «а коли можна приїхати?» і працює вночі та у вихідні. Реалізація — від готових сервісів запису до інтеграції з вашою CRM: типове підключення коштує $200–500, глибока звʼязка з обліком запчастин і завантаженням цеху — $1 000–3 000."),
  p("Порада з практики: починайте з простої форми плюс кнопки в месенджери (Viber, Telegram). Календар додавайте тоді, коли адміністратор перестає встигати обробляти дзвінки — це ознака, що автоматизація окупиться."),

  h2("Локальне SEO: як автосервіс потрапляє в «поруч зі мною»"),
  p("Для СТО локальний пошук — головний канал. Запити «СТО поблизу», «шиномонтаж + район», «автоелектрик + місто» мають шалену комерційну цінність: людина вже сидить у машині й обирає, куди їхати. Щоб забирати цей трафік, сайт і картка на картах мають працювати в парі."),
  num("Заповніть Google Business Profile на 100%: категорії, послуги, години роботи, фото боксів, і привʼяжіть сайт."),
  num("Зробіть на сайті окремі сторінки під ключові послуги: «ремонт ходової», «діагностика двигуна», «кузовний ремонт» — кожна сторінка ловить свій запит."),
  num("Пропишіть адресу, район і орієнтири текстом на сайті, додайте розмітку LocalBusiness / AutoRepair."),
  num("Збирайте відгуки в Google системно: QR-код на стійці видачі авто працює краще за будь-які прохання."),
  num("Слідкуйте за швидкістю мобільної версії: клієнт із телефона на парковці не чекатиме 8 секунд завантаження."),
  p("Це той обсяг робіт, який реально зробити один раз при створенні сайту, а далі підтримувати. Якщо потрібен системний ріст позицій — у студії є окрема послуга [SEO-просування](/seo) від $300/міс."),

  h2("Сайт СТО чи магазин запчастин: не плутати задачі"),
  p("Поширена помилка — намагатися зробити «сайт сервісу і заодно інтернет-магазин запчастин». Це різні продукти. Сайт СТО продає **запис на послугу**: його ядро — форма запису, прайс і довіра. Магазин запчастин продає **товар**: там потрібні каталог із тисячами позицій, підбір за VIN, кошик, оплата і доставка — це окремий проєкт із власною логікою і бюджетом, і про нього варто говорити окремо."),
  p("Якщо сервіс продає запчастини лише «в роботу» (клієнт платить за деталь у рамках ремонту) — окремий магазин не потрібен, достатньо згадати це в описі послуг. Гібрид «сервіс + магазин» має сенс тільки коли продаж запчастин — самостійна бізнес-лінія з власним складом і менеджером."),

  h2("Кейси: сайти для автобізнесу, які вже працюють"),
  p("[Raul Avto](/portfolio/raul-avto) — сайт для автобізнесу з упором на швидкість і мобільну версію: чітка структура послуг, помітні кнопки звʼязку, адаптація під клієнта, який заходить з телефона. Результат — сайт, що працює як цілодобовий приймальник заявок."),
  p("[Right Cars](/portfolio/right-cars) — проєкт для компанії з автомобільної сфери: каталожна структура, фільтри, акцент на фото і швидкий шлях до контакту. Кейс показує, як виглядає авто-тематика, коли на першому місці — конкретика замість загальних слів."),
  p("Обидва проєкти зроблені на кастомному коді без конструкторів: швидкість завантаження і чистота верстки — це те, що Google враховує, а клієнт відчуває."),

  h2("Строки: скільки робиться сайт для автосервісу"),
  p("Лендінг для СТО ми робимо за 1–2 тижні, корпоративний сайт — за 3–6 тижнів. Процес виглядає так:"),
  num("Бриф і структура: розбираємо послуги, конкурентів у вашому місті, збираємо семантику запитів — 2–3 дні."),
  num("Дизайн: прототип і дизайн-макет під вашу специфіку, а не шаблон «під усіх» — 3–7 днів."),
  num("Розробка і наповнення: верстка, форми, карта, прайс, тексти під пошукові запити — 5–15 днів."),
  num("Запуск: домен, аналітика, базове SEO-налаштування, привʼязка до Google Business Profile — 1–2 дні."),
  p("Після запуску сайт можна віддати на [підтримку](/support) ($200/міс або $40/год) — оновлення прайса, додавання акцій і нових послуг без вашої участі."),

  cta(
    "Потрібен сайт, з якого приїжджають машини?",
    "Розкажіть про своє СТО — порадимо формат, покажемо приклади з авто-ніші й назвемо точну ціну та строк.",
    "Обговорити проєкт",
    "/calculator"
  ),
];

// ---------------------------------------------------------------------------
// RU BODY
// ---------------------------------------------------------------------------
const bodyRu = [
  tldr("Коротко: каким должен быть сайт автосервиса", [
    "Клиент ищет автосервис локально и срочно: «СТО рядом», «ремонт ходовой + город». Создание сайта для автосервиса начинается с этих запросов.",
    "Минимум для записи с сайта: форма онлайн-записи, прайс по услугам, карта проезда и кликабельный телефон в шапке.",
    "Лендинг для автосервиса — от $800 и 1–2 недели. Корпоративный сайт сети или многопрофильного сервиса — от $3 500.",
    "Отзывы с маркой машины и фото работ «до/после» продают лучше любого баннера.",
    "Сайт для ремонта авто — не магазин запчастей: здесь продают запись на сервис, а не товар в корзине.",
    "Календарь со свободными слотами снимает 30–50% звонков «а когда можно приехать?».",
  ]),
  p("Сайт для автосервиса должен за десять секунд отвечать на три вопроса: **что вы ремонтируете, сколько это стоит и как записаться**. На практике это значит: форма онлайн-записи на ремонт, прайс по услугам, карта проезда, живые отзывы и фото реальных работ. Лендинг с таким набором стоит от $800, корпоративный сайт для сервиса с несколькими направлениями — от $3 500."),
  p("Ниша специфична: клиент почти всегда ищет с телефона и почти всегда срочно — машина стучит, тормоза скрипят, кондиционер не холодит. Он открывает два-три сайта из выдачи или с карт и звонит туда, где за полминуты понял адрес, ориентир по цене и что с его проблемой здесь работают. Если на сайте только «индивидуальный подход и лучшие мастера» — звонок уйдёт конкуренту."),
  p("Разберём, из чего состоит создание сайта автосервиса: какие форматы бывают и сколько стоят, какие блоки обязательны, как устроить онлайн-запись, почему локальное SEO для СТО важнее баннерной рекламы — и покажем живые кейсы из авто-ниши. Подробное описание ниши есть на странице [сайты для автобизнеса](/ru/sites-for/auto)."),

  h2("Зачем автосервису сайт, если есть Instagram и карты"),
  p("Карточка в Google Maps и профиль в Instagram нужны, но это не замена сайту, а его усиление. Карточка без привязанного сайта проигрывает в ранжировании: Google учитывает наличие и качество сайта при формировании локальной выдачи. Instagram вообще не ранжируется по запросам вроде «ремонт двигателя» — человек со сломанной машиной не листает ленту, он гуглит."),
  li("**Поисковый трафик.** Сайт собирает запросы «СТО + район», «ремонт ходовой + город», «диагностика перед покупкой авто» — страницы под каждую услугу работают годами без рекламного бюджета."),
  li("**Конверсия с карт.** Человек находит вас на картах, переходит на сайт проверить цены и отзывы — и там записывается. Без сайта цепочка обрывается."),
  li("**Доверие.** Фото боксов, команды и реальных работ на собственном домене убеждают сильнее, чем аккаунт с тремя постами за год."),
  li("**Независимость.** Алгоритмы соцсетей меняются, аккаунты блокируются. Сайт — ваш актив, который никуда не денется."),
  p("Рабочая связка для автосервиса: сайт как центр, Google Business Profile как источник локального трафика, соцсети как витрина процесса. Как вывести карточку в топ-3 карт — разобрали в статье про [локальное SEO и Google Maps](/ru/blog/lokalnoe-seo-top-3-google-maps)."),

  h2("Форматы сайтов для автосервиса и цены"),
  p("Автосервису не нужен «сайт вообще» — нужен формат под размер бизнеса. Небольшому СТО с одной локацией хватит лендинга. Сети или сервису с кузовным цехом, детейлингом и шиномонтажом — корпоративный сайт со страницами под каждое направление. Личный кабинет клиента с историей обслуживания — это уже кастомная платформа."),
  table(
    ["Формат", "Кому подходит", "Цена", "Срок"],
    [
      ["**Лендинг**", "СТО с одной локацией, 5–15 услуг, главная цель — звонки и запись", "от $800", "1–2 недели"],
      ["**Корпоративный сайт**", "Сервис с несколькими направлениями или сеть: страница под каждую услугу и филиал", "от $3 500", "3–6 недель"],
      ["**Кастомная платформа**", "Кабинет клиента, история обслуживания, интеграция с CRM и складом", "от $6 000", "от 6 недель"],
    ]
  ),
  p("Это цены нашей студии; рыночная вилка шире — от $300 за шаблон на конструкторе до $15 000+ за платформу с ERP-интеграцией. Но шаблон за $300 обычно не имеет ни внятного прайса, ни формы записи, ни скорости — то есть не делает главного. Что входит в стоимость [лендинга](/ru/landing) и [корпоративного сайта](/ru/corporate-site) — расписано на страницах услуг, а общую математику цен мы разобрали в статье [сколько стоит сайт в 2026](/ru/blog/skolko-stoit-sayt-2026)."),
  p("Отдельная строка бюджета — интеграции: подключение формы записи к CRM или календарю обычно стоит $200–500, сложные связки с учётными системами и складом — $1 000–3 000."),

  cta(
    "Посчитайте сайт для своего автосервиса за 2 минуты",
    "Онлайн-калькулятор: выберите формат, количество услуг и интеграции — и сразу увидите вилку бюджета без звонка менеджеру.",
    "Открыть калькулятор",
    "/ru/calculator"
  ),

  h2("Must-have блоки сайта автосервиса"),
  p("Ниже — проверенный практикой минимум. Каждый блок либо снимает возражение, либо сокращает путь до записи. Если чего-то из списка нет — сайт теряет заявки ежедневно."),
  table(
    ["Блок", "Зачем он"],
    [
      ["**Форма онлайн-записи**", "Половина клиентов ищет сервис вечером, когда трубку никто не берёт. Форма ловит заявку и в 23:00."],
      ["**Прайс по услугам**", "«Цену скажем на месте» — главная причина закрыть вкладку. Даже вилка «от–до» удерживает клиента."],
      ["**Карта и проезд**", "Автосервис выбирают по близости. Карта, ориентиры, фото въезда — меньше звонков «как вас найти?»."],
      ["**Кликабельный телефон в шапке**", "С телефона звонят в один тап. Если номер — картинка, вы теряете самых горячих клиентов."],
      ["**Отзывы с маркой машины**", "«Менял сцепление на Octavia A5» убеждает сильнее десяти анонимных пятёрок."],
      ["**Фото работ до/после**", "Кузовной ремонт и детейлинг продаются глазами. Реальные фото из вашего бокса, не сток."],
    ]
  ),
  p("Дополнительно хорошо работают: блок «наши мастера» с именами и стажем, гарантия на работы с конкретным сроком, список марок, с которыми работаете, и секция «как мы работаем» на 4–5 шагов — от заявки до выдачи машины. Эти приёмы поднимают конверсию в любой нише — мы собрали их в подборке [9 дизайн-приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),

  h2("Онлайн-запись на ремонт: простая форма или календарь"),
  h3("Вариант 1: простая форма заявки"),
  p("Поля: имя, телефон, марка машины, описание проблемы, желаемая дата. Заявка падает администратору в Telegram или на почту, он перезванивает и подтверждает время. Базовый уровень: дёшево, надёжно, входит в стоимость лендинга. Для СТО с одним постом приёмки этого достаточно."),
  h3("Вариант 2: календарь со свободными слотами"),
  p("Клиент сам видит свободное время по подъёмникам или мастерам и бронирует слот — как запись к врачу. Такой календарь снимает 30–50% входящих звонков «а когда можно приехать?» и работает ночью и в выходные. Реализация — от готовых сервисов записи до интеграции с вашей CRM: типовое подключение стоит $200–500, глубокая связка с учётом запчастей и загрузкой цеха — $1 000–3 000."),
  p("Совет из практики: начинайте с простой формы плюс кнопки в мессенджеры. Календарь добавляйте, когда администратор перестаёт успевать обрабатывать звонки — это признак, что автоматизация окупится."),

  h2("Локальное SEO: как сервис попадает в «рядом со мной»"),
  p("Для сайта, продающего ремонт авто, локальный поиск — главный канал. Запросы «СТО рядом», «шиномонтаж + район», «автоэлектрик + город» имеют огромную коммерческую ценность: человек уже сидит в машине и выбирает, куда ехать. Чтобы забирать этот трафик, сайт и карточка на картах должны работать в паре."),
  num("Заполните Google Business Profile на 100%: категории, услуги, часы работы, фото боксов — и привяжите сайт."),
  num("Сделайте отдельные страницы под ключевые услуги: «ремонт ходовой», «диагностика двигателя», «кузовной ремонт» — каждая страница ловит свой запрос."),
  num("Пропишите адрес, район и ориентиры текстом, добавьте разметку LocalBusiness / AutoRepair."),
  num("Собирайте отзывы в Google системно: QR-код на стойке выдачи машины работает лучше любых просьб."),
  num("Следите за скоростью мобильной версии: клиент с телефона на парковке не будет ждать 8 секунд загрузки."),
  p("Этот объём работ реально сделать один раз при создании сайта, а дальше поддерживать. Если нужен системный рост позиций — в студии есть услуга [SEO-продвижения](/ru/seo) от $300/мес."),

  h2("Сайт автосервиса или магазин запчастей: не путать задачи"),
  p("Частая ошибка — попытка сделать «сайт сервиса и заодно интернет-магазин запчастей». Это разные продукты. Сайт СТО продаёт **запись на услугу**: его ядро — форма записи, прайс и доверие. Магазин запчастей продаёт **товар**: там нужны каталог на тысячи позиций, подбор по VIN, корзина, оплата и доставка — отдельный проект со своей логикой и бюджетом, о нём стоит говорить отдельно."),
  p("Если сервис продаёт запчасти только «в работу» (клиент платит за деталь в рамках ремонта) — отдельный магазин не нужен, достаточно упомянуть это в описании услуг. Гибрид «сервис + магазин» имеет смысл, только когда продажа запчастей — самостоятельная бизнес-линия со своим складом и менеджером."),

  h2("Кейсы: сайты для автобизнеса, которые уже работают"),
  p("[Raul Avto](/ru/portfolio/raul-avto) — сайт для автобизнеса с упором на скорость и мобильную версию: чёткая структура услуг, заметные кнопки связи, адаптация под клиента, который заходит с телефона. Результат — сайт, работающий как круглосуточный приёмщик заявок."),
  p("[Right Cars](/ru/portfolio/right-cars) — проект для компании из автомобильной сферы: каталожная структура, фильтры, акцент на фото и быстрый путь к контакту. Кейс показывает, как выглядит авто-тематика, когда на первом месте конкретика, а не общие слова."),
  p("Оба проекта сделаны на кастомном коде без конструкторов: скорость загрузки и чистота вёрстки — то, что Google учитывает, а клиент чувствует."),

  h2("Сроки: сколько делается сайт для автосервиса"),
  p("Лендинг мы делаем за 1–2 недели, корпоративный сайт — за 3–6 недель. Процесс выглядит так:"),
  num("Бриф и структура: разбираем услуги, конкурентов в вашем городе, собираем семантику запросов — 2–3 дня."),
  num("Дизайн: прототип и макет под вашу специфику, а не шаблон «для всех» — 3–7 дней."),
  num("Разработка и наполнение: вёрстка, формы, карта, прайс, тексты под поисковые запросы — 5–15 дней."),
  num("Запуск: домен, аналитика, базовая SEO-настройка, привязка к Google Business Profile — 1–2 дня."),
  p("После запуска сайт можно отдать на [поддержку](/ru/support) ($200/мес или $40/час) — обновление прайса, добавление акций и новых услуг без вашего участия."),

  cta(
    "Нужен сайт, с которого приезжают машины?",
    "Расскажите о своём автосервисе — посоветуем формат, покажем примеры из авто-ниши и назовём точную цену и срок.",
    "Обсудить проект",
    "/ru/calculator"
  ),
];

// ---------------------------------------------------------------------------
// EN BODY
// ---------------------------------------------------------------------------
const bodyEn = [
  tldr("TL;DR: an auto repair website that fills your bays", [
    "Drivers search locally and urgently: “auto repair near me”, “brake repair + city”. Your website has to rank for exactly those queries.",
    "The minimum that converts: an online booking form, a per-service price list, a map with directions, and a tap-to-call phone number in the header.",
    "A landing page for a repair shop starts at $800 and takes 1–2 weeks; a multi-service corporate site starts at $3,500.",
    "Reviews that name the car model plus before/after photos of real jobs outsell any banner.",
    "A repair shop website is not a parts store: it sells a booked appointment, not a product in a cart.",
    "A booking calendar with open slots kills 30–50% of “when can I come in?” phone calls.",
  ]),
  p("Good auto repair shop website design answers three questions within ten seconds: **what you fix, what it costs, and how to book**. In practice that means an online booking form, a price list broken down by service, a map with directions, genuine reviews, and photos of real jobs. A landing page with that set starts at $800; a corporate site for a shop with several service lines starts at $3,500."),
  p("The niche has one defining trait: the customer almost always searches from a phone and almost always urgently — the engine knocks, the brakes squeal, the AC has died. They open two or three sites from search or maps and call the one where, within thirty seconds, they understood the address, a ballpark price, and that this shop handles their problem. If your site only says “individual approach and top mechanics”, the call goes to a competitor."),
  p("This guide covers what goes into an auto repair website: the site formats and what they cost, the must-have blocks, how online booking should work, why local SEO matters more than display ads for a repair shop — plus live automotive case studies. There is also a dedicated page on [websites for the auto business](/en/sites-for/auto)."),

  h2("Why a repair shop needs a website when it has Instagram and Google Maps"),
  p("A Google Maps listing and an Instagram profile are useful, but they amplify a website rather than replace it. A Maps card without a linked site loses ranking power: Google weighs the presence and quality of the website when building the local pack. And Instagram simply does not rank for queries like “engine diagnostics near me” — a driver with a broken car is not scrolling a feed, they are googling."),
  li("**Search traffic.** A website captures “auto repair + area”, “suspension repair + city”, “pre-purchase inspection” — a page per service keeps working for years with zero ad spend."),
  li("**Conversion from Maps.** People find you on Maps, click through to check prices and reviews, and book on the site. Without a site, that chain breaks."),
  li("**Trust.** Photos of your bays, your team, and real jobs on your own domain beat an account with three posts a year."),
  li("**Independence.** Social algorithms change and accounts get blocked. A website is an asset nobody can take away."),
  p("The working setup for a repair shop: the website as the hub, Google Business Profile as the local traffic source, social media as a behind-the-scenes showcase. How to push your listing into the Maps top 3 is covered in our guide to [local SEO and Google Maps](/en/blog/local-seo-google-maps-top-3)."),

  h2("Website formats for a repair shop, and what they cost"),
  p("A repair shop does not need “a website” in the abstract — it needs a format that fits the size of the business. A single-location shop with a dozen services is well served by a landing page. A chain, or a shop running bodywork, detailing, and tyre service under one roof, needs a corporate site with a page per service line. A customer portal with service history is custom-platform territory."),
  table(
    ["Format", "Best for", "Price", "Timeline"],
    [
      ["**Landing page**", "One location, 5–15 services, primary goal is calls and bookings", "from $800", "1–2 weeks"],
      ["**Corporate site**", "Multi-line shop or a chain: a page per service and per branch", "from $3,500", "3–6 weeks"],
      ["**Custom platform**", "Customer portal, service history, CRM and inventory integration", "from $6,000", "6+ weeks"],
    ]
  ),
  p("Those are our studio's rates — we are a Ukrainian team working with clients across Europe, so you get European quality at sensible rates. The wider market ranges from $300 for a site-builder template to $15,000+ for an ERP-integrated platform; the trouble is that the $300 template usually ships without a real price list, a booking form, or decent speed — it skips the parts that matter. What goes into a [landing page](/en/landing) and a [corporate site](/en/corporate-site) is itemised on the service pages, and the general cost maths is in our article on [custom website cost in 2026](/en/blog/custom-website-cost-uk-2026)."),
  p("Budget a separate line for integrations: wiring the booking form into your CRM or calendar typically costs $200–500; deep integrations with inventory and workshop-management systems run $1,000–3,000."),

  cta(
    "Price your repair shop website in 2 minutes",
    "Use the online calculator: pick the format, number of services and integrations — and see the budget range instantly, no sales call required.",
    "Open the calculator",
    "/en/calculator"
  ),

  h2("Must-have blocks for an auto repair website"),
  p("Below is the field-tested minimum. Every block either removes an objection or shortens the path to a booking. If any of these are missing, the site leaks enquiries daily."),
  table(
    ["Block", "Why it matters"],
    [
      ["**Online booking form**", "Half your customers search in the evening when nobody answers the phone. The form catches the lead at 11pm."],
      ["**Per-service price list**", "“We'll quote on site” is the top reason to close the tab. Even a from–to range keeps the visitor."],
      ["**Map and directions**", "Repair shops are chosen by proximity. A map, landmarks and a photo of the entrance cut the “how do I find you?” calls."],
      ["**Tap-to-call number in the header**", "Mobile visitors call in one tap. If the number is an image, you lose your hottest leads."],
      ["**Reviews naming the car**", "“Clutch replaced on my Octavia” persuades more than ten anonymous five-star ratings."],
      ["**Before/after job photos**", "Bodywork and detailing sell visually. Real photos from your bays — never stock."],
    ]
  ),
  p("Also worth adding: a “meet the mechanics” block with names and years of experience, a warranty with a concrete term, the list of makes you service, and a 4–5 step “how it works” section from enquiry to handover. These are conversion patterns that work in any niche — we collected them in [9 design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),

  h2("Online booking: a simple form or a live calendar"),
  h3("Option 1: a simple request form"),
  p("Fields: name, phone, car make, problem description, preferred date. The request lands in the manager's Telegram or inbox; they call back to confirm the slot. This is the baseline — cheap, reliable, and included in the landing page price. For a shop with one service advisor it is enough."),
  h3("Option 2: a calendar with open slots"),
  p("The customer sees available times per lift or per mechanic and books a slot themselves — like booking a doctor. A live calendar removes 30–50% of incoming “when can I come in?” calls and keeps working at night and on weekends. Implementation ranges from off-the-shelf booking tools to a full CRM integration: a typical hookup costs $200–500, a deep link with parts inventory and workshop load runs $1,000–3,000."),
  p("Practical advice: start with the simple form plus messenger buttons. Add the calendar once your front desk stops keeping up with the phone — that is the signal automation will pay for itself."),

  h2("Local SEO: how a repair shop wins “near me”"),
  p("For an auto repair website, local search is the primary channel. Queries like “auto repair near me”, “tyre shop + area”, “auto electrician + city” carry enormous commercial intent: the person is already sitting in the car deciding where to drive. To capture that traffic, the website and the Maps listing have to work as a pair."),
  num("Complete your Google Business Profile to 100%: categories, services, opening hours, photos of the bays — and link the website."),
  num("Create a separate page per key service: suspension repair, engine diagnostics, bodywork — each page targets its own query."),
  num("Spell out the address, the area and landmarks in text, and add LocalBusiness / AutoRepair structured data."),
  num("Collect Google reviews systematically: a QR code at the handover desk beats any verbal ask."),
  num("Watch mobile speed: a customer on a car park forecourt will not wait 8 seconds for your page."),
  p("All of this is realistic to set up once at build time and then maintain. If you want systematic ranking growth, the studio offers [SEO as a service](/en/seo) from $300/month."),

  h2("Repair shop site vs parts store: don't mix the jobs"),
  p("A common mistake is trying to build “the shop's website and a parts e-commerce store in one”. They are different products. A repair shop site sells a **booked appointment**: its core is the booking form, the price list and trust. A parts store sells a **product**: it needs a catalogue with thousands of SKUs, VIN-based lookup, a cart, payments and delivery — a separate project with its own logic and budget, worth discussing on its own."),
  p("If the shop only sells parts as part of a repair job, a separate store is unnecessary — mention it in the service descriptions. A hybrid “shop + store” makes sense only when parts retail is a standalone business line with its own stock and manager."),

  h2("Case studies: automotive websites already doing the job"),
  p("[Raul Avto](/en/portfolio/raul-avto) — an automotive business site built around speed and the mobile experience: a clear service structure, prominent contact buttons, and a layout tuned for the customer arriving from a phone. The result works as a round-the-clock service advisor."),
  p("[Right Cars](/en/portfolio/right-cars) — a project for an automotive company: catalogue structure, filters, photo-first presentation and a short path to contact. It shows what the auto niche looks like when specifics come before generic claims."),
  p("Both projects are custom-coded, no site builders: load speed and clean markup are what Google measures and the customer feels."),

  h2("Timeline: how long an auto repair website takes"),
  p("We deliver a landing page in 1–2 weeks and a corporate site in 3–6 weeks. The process:"),
  num("Brief and structure: we map your services, your local competitors and the search demand — 2–3 days."),
  num("Design: a prototype and a bespoke layout for your shop, not a one-size template — 3–7 days."),
  num("Build and content: markup, forms, map, price list, copy written for real search queries — 5–15 days."),
  num("Launch: domain, analytics, baseline SEO setup, linking the Google Business Profile — 1–2 days."),
  p("After launch you can hand the site over to [support](/en/support) ($200/month or $40/hour) — price list updates, promotions and new services added without your involvement."),

  cta(
    "Want a website that fills your bays?",
    "Tell us about your shop — we'll recommend a format, show automotive examples, and quote an exact price and timeline.",
    "Discuss the project",
    "/en/calculator"
  ),
];

// ---------------------------------------------------------------------------
// DOCUMENT
// ---------------------------------------------------------------------------
const doc = {
  _id: "ltAug2026-sait-dlia-avtoservisu",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-avtoservisu" },
    ru: { _type: "slug", current: "sayt-dlya-avtoservisa" },
    en: { _type: "slug", current: "auto-repair-shop-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для автосервісу (СТО): що має бути, щоб машини приїжджали з сайту",
    ru: "Создание сайта для автосервиса: что должно быть, чтобы машины приезжали с сайта",
    en: "Auto Repair Shop Website Design: What It Takes to Fill Your Bays",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для автосервісу (СТО): блоки, ціни, строки 2026",
    ru: "Создание сайта для автосервиса: блоки и цены 2026",
    en: "Auto Repair Shop Website Design: Cost & Guide 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для СТО, з якого записуються на ремонт ✔️ Онлайн-запис, прайс, локальне SEO ✔️ Лендінг від $800 ➡ Таблиці цін і кейси",
    ru: "➤ Сайт для автосервиса, с которого записываются на ремонт ✔️ Онлайн-запись, прайс, карта ✔️ Лендинг от $800 ➡ Цены и кейсы внутри",
    en: "➤ Auto repair website that books cars in ✔️ Online booking, price list, local SEO ✔️ Landing page from $800 ➡ Price tables & real cases",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Сайти для автобізнесу",
    ru: "Сайты для автобизнеса",
    en: "Automotive websites",
  },
  lede: {
    _type: "localizedString",
    uk: "Онлайн-запис, прайс по послугах, карта і відгуки з маркою авто: розбираємо, з чого складається сайт СТО, який реально приводить машини, скільки він коштує і за який строк робиться.",
    ru: "Онлайн-запись, прайс по услугам, карта и отзывы с маркой машины: разбираем, из чего состоит сайт автосервиса, который реально приводит машины, сколько он стоит и за какой срок делается.",
    en: "Online booking, a per-service price list, a map and reviews that name the car: what goes into an auto repair website that actually books cars in, what it costs, and how long it takes.",
  },
  tags: ["сайт для СТО", "автосервіс", "локальний бізнес"],
  relatedPostSlugs: ["vartist-rozrobky-saytu-2026", "lokalne-seo-top-3-google-maps", "9-dyzain-pryiomiv-dlia-konversii"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для автосервісу?",
        ru: "Сколько стоит сайт для автосервиса?",
        en: "How much does an auto repair shop website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг для СТО з формою запису, прайсом і картою коштує від $800 і робиться за 1–2 тижні. Корпоративний сайт для сервісу з кількома напрямками чи мережі — від $3 500. Інтеграція запису з CRM або календарем додає зазвичай $200–500.",
        ru: "Лендинг для СТО с формой записи, прайсом и картой стоит от $800 и делается за 1–2 недели. Корпоративный сайт для многопрофильного сервиса или сети — от $3 500. Интеграция записи с CRM или календарём обычно добавляет $200–500.",
        en: "A landing page with a booking form, price list and map starts at $800 and takes 1–2 weeks. A corporate site for a multi-line shop or a chain starts at $3,500. Wiring the booking into a CRM or calendar typically adds $200–500.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен сайт, якщо у СТО вже є картка в Google Maps?",
        ru: "Нужен ли сайт, если у автосервиса уже есть карточка в Google Maps?",
        en: "Do I need a website if my shop already has a Google Maps listing?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так: картка без привʼязаного сайту програє в локальному ранжуванні, а клієнти з карт переходять на сайт перевірити ціни й відгуки перед дзвінком. Сайт і Google Business Profile працюють у парі — разом вони дають більше запису, ніж кожен окремо.",
        ru: "Да: карточка без привязанного сайта проигрывает в локальном ранжировании, а клиенты с карт переходят на сайт проверить цены и отзывы перед звонком. Сайт и Google Business Profile работают в паре — вместе они дают больше записей, чем каждый по отдельности.",
        en: "Yes. A Maps listing without a linked website loses local ranking power, and drivers click through from Maps to check prices and reviews before calling. The site and the Google Business Profile work as a pair — together they book more cars than either alone.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна підключити онлайн-запис до нашої CRM?",
        ru: "Можно ли подключить онлайн-запись к нашей CRM?",
        en: "Can online booking connect to our CRM?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так. Типова інтеграція форми запису з CRM чи календарем коштує $200–500. Складніші звʼязки — з обліком запчастин, завантаженням підйомників і нагадуваннями клієнтам — обходяться в $1 000–3 000 залежно від системи.",
        ru: "Да. Типовая интеграция формы записи с CRM или календарём стоит $200–500. Более сложные связки — с учётом запчастей, загрузкой подъёмников и напоминаниями клиентам — обходятся в $1 000–3 000 в зависимости от системы.",
        en: "Yes. A typical integration of the booking form with a CRM or calendar costs $200–500. Deeper links — parts inventory, lift scheduling, customer reminders — run $1,000–3,000 depending on the system.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка сайту для СТО?",
        ru: "Сколько времени занимает разработка сайта для автосервиса?",
        en: "How long does it take to build an auto repair website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг — 1–2 тижні: бриф і структура, дизайн, розробка, запуск із базовим SEO. Корпоративний сайт із окремими сторінками під кожну послугу — 3–6 тижнів. Строк найбільше залежить від швидкості погодження матеріалів із вашого боку.",
        ru: "Лендинг — 1–2 недели: бриф и структура, дизайн, разработка, запуск с базовым SEO. Корпоративный сайт с отдельными страницами под каждую услугу — 3–6 недель. Срок больше всего зависит от скорости согласования материалов с вашей стороны.",
        en: "A landing page takes 1–2 weeks: brief and structure, design, build, launch with baseline SEO. A corporate site with a page per service takes 3–6 weeks. The biggest timeline factor is how fast content gets approved on your side.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи варто робити на сайті СТО ще й магазин запчастин?",
        ru: "Стоит ли делать на сайте СТО ещё и магазин запчастей?",
        en: "Should a repair shop website also sell parts online?",
      },
      answer: {
        _type: "localizedText",
        uk: "Тільки якщо продаж запчастин — окрема бізнес-лінія з власним складом і менеджером. Сайт СТО продає запис на послугу, магазин — товар: різні структури, різні запити, різні бюджети. Якщо деталі йдуть лише «в роботу», окремий магазин не потрібен.",
        ru: "Только если продажа запчастей — отдельная бизнес-линия со своим складом и менеджером. Сайт СТО продаёт запись на услугу, магазин — товар: разные структуры, разные запросы, разные бюджеты. Если детали идут только «в работу», отдельный магазин не нужен.",
        en: "Only if parts retail is a standalone business line with its own stock and manager. A repair shop site sells appointments; a store sells products — different structures, different queries, different budgets. If parts are only fitted during repairs, skip the store.",
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
