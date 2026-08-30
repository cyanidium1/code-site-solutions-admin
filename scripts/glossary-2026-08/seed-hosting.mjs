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
const table = (headers, rows) => ({
  _key: key(), _type: "blogTable", headers,
  rows: rows.map((cells) => ({ _key: key(), _type: "blogTableRow", cells })),
});
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
    "Хостинг — це оренда місця на сервері, де лежать файли сайту і звідки їх віддають відвідувачам.",
    "Домен — це адреса, хостинг — саме приміщення. Дві різні послуги і часто два різні рахунки.",
    "Типи: shared ($2–10/міс), VPS ($10–60), виділений сервер ($80–300), хмарний / serverless ($0–40).",
    "Хостинг напряму впливає на швидкість, аптайм і Core Web Vitals — а отже на позиції та заявки.",
    "Ми деплоїмо на Vercel і Cloudflare; перший рік входить у пакет, далі акаунти передаємо клієнту.",
    "Найдорожчі помилки — дешевий shared під інтернет-магазин і хостинг, оформлений на підрядника.",
  ]),

  p("Хостинг — це послуга оренди місця на сервері, де зберігаються файли вашого сайту: код, зображення, база даних. Коли людина вводить адресу в браузері, запит іде саме на цей сервер, і він у відповідь віддає сторінку. Немає хостингу — немає сайту: домен веде в порожнечу."),
  p("Хостинг завжди платний і завжди чиясь відповідальність. Це може бути класичний провайдер із панеллю керування, а може бути хмарна платформа на кшталт Vercel чи Cloudflare, де сервера ви взагалі не бачите — тільки деплой і підключений домен. Різниця між цими варіантами вимірюється не лише ціною, а й швидкістю сайту та тим, хто прокидається, коли він ліг."),
  p("Нижче — з чого складається хостинг, чим він відрізняється від домену, які бувають типи, скільки це коштує і як не потрапити у дві найдорожчі пастки."),

  h2("Простими словами: домен — адреса, хостинг — приміщення"),
  p("Уявіть, що сайт — це магазин. **Домен** — це адреса на вивісці: вулиця Хрещатик, 1. **Хостинг** — саме приміщення: стіни, світло, полиці, площа. Адресу можна купити й тримати без приміщення — тоді люди прийдуть і побачать пустир. Приміщення можна орендувати без адреси — але клієнти не знатимуть, як вас знайти."),
  p("Аналогія працює далі, ніж здається. Кутик у коворкінгу — це shared-хостинг: дешево, але сусіди шумлять, а кухня одна на всіх. Окреме приміщення в бізнес-центрі — VPS. Власна будівля — виділений сервер. Хмарний хостинг — це коли ви орендуєте рівно стільки площі, скільки зайняли сьогодні, і платите за фактичне навантаження."),
  p("Детальніше про адресну частину — в окремій статті про те, [що таке домен](/blog/shcho-take-domen)."),

  h2("З чого складається хостинг"),
  li("**Дисковий простір** — місце під файли, зображення й базу даних."),
  li("**Процесор і оперативна пам'ять** — від них залежить, скільки одночасних відвідувачів сайт витримає без гальм."),
  li("**Трафік** — обсяг даних, який сервер віддає за місяць. У дешевих тарифах його часто ріжуть, а перевищення тарифікують окремо."),
  li("**SSL-сертифікат** — шифрування і замочок у браузері. Зараз він безкоштовний майже скрізь: платити за нього окремо не треба."),
  li("**Бекапи** — щоденні копії сайту. Це те, за що варто доплатити, і рівно те, чого немає в найдешевших тарифах."),
  li("**Підтримка** — жива людина, яка відповість, коли сайт ліг о 23:00 у п'ятницю."),
  p("Окремо стоїть **аптайм** — відсоток часу, коли сайт доступний. Нормальна цифра — 99,9% і вище: це до 44 хвилин простою на місяць. 99% звучить схоже, але це вже близько семи годин щомісяця, і всі вони припадуть на найгірший момент."),

  h2("Типи хостингу: для чого підходять і скільки коштують"),
  table(
    ["Тип", "Для чого підходить", "Приблизна ціна/міс", "Коли переростете"],
    [
      ["**Shared** (спільний)", "Візитівка, блог, невеликий сайт послуг з відвідуваністю до кількох тисяч на місяць", "$2–10", "Щойно з'явиться каталог, кошик або 10 000+ візитів — сайт почне гальмувати через сусідів по серверу"],
      ["**VPS**", "Інтернет-магазин, сайт із важкою базою, кастомна CMS — коли потрібен контроль над сервером", "$10–60", "Коли пікові навантаження почнуть класти сервер, а адмініструвати його стане нікому"],
      ["**Виділений сервер**", "Великі портали, високі вимоги до безпеки або зберігання даних у конкретній країні", "$80–300", "Переростають рідко — частіше свідомо йдуть у хмару заради гнучкості й економії"],
      ["**Хмарний / serverless** (Vercel, Cloudflare, Netlify)", "Сучасні сайти на Next.js: лендінги, корпоративні сайти, магазини із зовнішнім бекендом", "$0–40, стартові тарифи безкоштовні", "Практично не переростають: масштабування автоматичне, рахунок росте разом із трафіком"],
    ],
  ),
  p("Окрема категорія — конструктори (Wix, Tilda, Shopify): там хостинг вшитий у підписку й окремо не купується. Плата за зручність — ви не можете просто забрати сайт і перенести його кудись ще. Ми розібрали цей компроміс у [порівнянні з конструкторами](/vs-constructors)."),

  h2("Чим домен відрізняється від хостингу"),
  p("Це дві окремі послуги, які можна купувати в різних місцях і в різних компаній. Домен ви орендуєте у реєстратора на рік: зона .ua коштує приблизно $10–20 на рік, .com — близько $12. Хостинг оплачуєте окремо, помісячно або річним пакетом. Пов'язує їх DNS: у налаштуваннях домену ви вказуєте, на який сервер спрямовувати відвідувачів."),
  p("Практичний висновок простий. Домен можна залишити у себе й перенести сайт на інший хостинг за вечір — відвідувачі нічого не помітять. І навпаки: втратити домен через несплату означає втратити адресу, навіть якщо сайт живий і всі файли на місці. Тому нагадування про продовження домену має приходити власнику бізнесу, а не менеджеру, який звільнився два роки тому."),

  h2("На що реально впливає хостинг"),
  p("Хостинг — це не той рядок витрат, який варто оптимізувати до нуля. Він впливає на три речі, які видно в грошах."),
  h3("Швидкість"),
  p("Час відповіді сервера (TTFB) — це фора або гандикап, який отримує кожна сторінка ще до того, як браузер почне щось малювати. Дешевий shared у сусідній країні легко дає 600–900 мс. Хмарна платформа з CDN, що віддає сторінку з найближчого до відвідувача вузла, — 50–150 мс. Цю різницю не компенсуєш ані стисненням картинок, ані чистим кодом."),
  h3("Аптайм"),
  p("Кожна година простою магазину — це втрачені замовлення, а для клініки ще й дзвінки, які пішли конкуренту. Google теж помічає: якщо робот приходить кілька разів поспіль і бачить помилку сервера, сторінка може випасти з індексу, а повертатися вона буде тижнями."),
  h3("Core Web Vitals"),
  p("Google вимірює швидкість на реальних відвідувачах, а не в лабораторії. LCP — час появи найбільшого елемента на екрані — напряму залежить від того, як швидко сервер віддав HTML. Що це за метрики і де їх дивитися, ми розписали у статті про те, [що таке Core Web Vitals](/blog/shcho-take-core-web-vitals). А як прискорення вплинуло на кількість заявок — у розборі [швидкості медичного сайту](/blog/shvydkist-medychnoho-saitu)."),

  h2("Де хостимо ми і на кого оформлюємо акаунти"),
  p("Ми деплоїмо проєкти на Vercel і Cloudflare. Причина прагматична: сайти на Next.js там віддаються з глобальної мережі, статика кешується на краю, а сплеск трафіку не потребує від власника жодних дій — платформа сама додає ресурси й сама їх знімає, коли пік минув."),
  p("Хостинг першого року входить у пакет розробки: ми беремо на себе оплату, налаштування домену, SSL і моніторинг, поки сайт розганяється. Далі акаунти передаються клієнту — Vercel або Cloudflare і реєстратор домену оформлюються на вашу пошту, ви бачите рахунки й можете в будь-який момент піти до іншого підрядника. Це чесніше і, відверто, невигідніше для нас: втрачається зручний важіль утримання. Але сайт, до якого у вас немає доступу, — це не ваш актив."),
  p("Якщо адмініструвати самому не хочеться, це закривається [підтримкою](/support) — $200/міс або $40/год: оновлення, бекапи, моніторинг аптайму, вчасне продовження домену. Що входить у розробку і скільки коштують пакети — на [сторінці цін](/pricing)."),

  cta(
    "Не знаєте, де живе ваш сайт?",
    "Перевіримо, на чому він хоститься зараз, який у нього TTFB і чи оформлені домен та хостинг на вас. Один робочий день, без оплати.",
    "Замовити перевірку",
    "/support",
  ),

  h2("Три помилки, які коштують дорого"),
  num("**Дешевий shared під інтернет-магазин.** Каталог на 2 000 товарів на тарифі за $3 працює рівно доти, доки на нього не пустили рекламу. Сайт лягає в чорну п'ятницю — тобто рівно тоді, коли він потрібен найбільше. Різниця між shared і VPS тут — $30 на місяць проти денної виручки."),
  num("**Хостинг і домен оформлені на підрядника.** Класика: сайт зробили п'ять років тому, розробник зник, доступів немає, а домен от-от закінчиться. Відновлення такого доступу коштує тижнів переписки, а іноді закінчується повною перезбіркою сайту на новому домені. Перевірте це сьогодні, а не тоді, коли знадобиться."),
  num("**Економія на бекапах і моніторингу.** Хостинг за $3 не має ані щоденних копій, ані сповіщення про падіння. Про те, що сайт лежить другу добу, ви дізнаєтесь від клієнта — і це в кращому випадку."),
  p("Хостинг — нудна інфраструктура, і саме тому про нього згадують в останню чергу. Але це фундамент: на повільному й ненадійному сервері не працює ані SEO, ані реклама, ані дизайн, за який ви заплатили."),
];

/* ─────────────────────────── RU ─────────────────────────── */

const bodyRu = [
  tldr("Коротко", [
    "Хостинг — это аренда места на сервере, где лежат файлы сайта и откуда их отдают посетителям.",
    "Домен — адрес, хостинг — само помещение. Две разные услуги и часто два разных счёта.",
    "Типы: shared ($2–10/мес), VPS ($10–60), выделенный сервер ($80–300), облачный / serverless ($0–40).",
    "Хостинг напрямую влияет на скорость, аптайм и Core Web Vitals — а значит, на позиции и заявки.",
    "Мы деплоим на Vercel и Cloudflare; первый год входит в пакет, дальше аккаунты передаём клиенту.",
    "Самые дорогие ошибки — дешёвый shared под интернет-магазин и хостинг, оформленный на подрядчика.",
  ]),

  p("Хостинг — это услуга аренды места на сервере, где хранятся файлы вашего сайта: код, изображения, база данных. Когда человек вводит адрес в браузере, запрос уходит именно на этот сервер, и он в ответ отдаёт страницу. Нет хостинга — нет сайта: домен ведёт в пустоту."),
  p("Хостинг всегда платный и всегда чья-то зона ответственности. Это может быть классический провайдер с панелью управления, а может быть облачная платформа вроде Vercel или Cloudflare, где сервера вы вообще не видите — только деплой и подключённый домен. Разница между вариантами измеряется не только ценой, но и скоростью сайта и тем, кто просыпается, когда он упал."),
  p("Ниже — из чего состоит хостинг, чем он отличается от домена, какие бывают типы, сколько это стоит и как не попасть в две самые дорогие ловушки."),

  h2("Простыми словами: домен — адрес, хостинг — помещение"),
  p("Представьте, что сайт — это магазин. **Домен** — адрес на вывеске: улица Крещатик, 1. **Хостинг** — само помещение: стены, свет, полки, площадь. Адрес можно купить и держать без помещения — тогда люди придут и увидят пустырь. Помещение можно арендовать без адреса — но клиенты не узнают, как вас найти."),
  p("Аналогия работает дальше, чем кажется. Уголок в коворкинге — это shared-хостинг: дёшево, но соседи шумят, а кухня одна на всех. Отдельное помещение в бизнес-центре — VPS. Собственное здание — выделенный сервер. Облачный хостинг — это когда вы арендуете ровно столько площади, сколько заняли сегодня, и платите по факту нагрузки."),
  p("Подробнее об адресной части — в отдельной статье о том, [что такое домен](/ru/blog/chto-takoe-domen)."),

  h2("Из чего состоит хостинг"),
  li("**Дисковое пространство** — место под файлы, изображения и базу данных."),
  li("**Процессор и оперативная память** — от них зависит, сколько одновременных посетителей сайт выдержит без тормозов."),
  li("**Трафик** — объём данных, который сервер отдаёт за месяц. В дешёвых тарифах его часто режут, а превышение тарифицируют отдельно."),
  li("**SSL-сертификат** — шифрование и замочек в браузере. Сейчас он бесплатный почти везде: платить за него отдельно не нужно."),
  li("**Бэкапы** — ежедневные копии сайта. Это то, за что стоит доплатить, и ровно то, чего нет в самых дешёвых тарифах."),
  li("**Поддержка** — живой человек, который ответит, когда сайт упал в 23:00 в пятницу."),
  p("Отдельно стоит **аптайм** — процент времени, когда сайт доступен. Нормальная цифра — 99,9% и выше: это до 44 минут простоя в месяц. 99% звучит похоже, но это уже около семи часов ежемесячно, и все они придутся на худший момент."),

  h2("Типы хостинга: кому подходят и сколько стоят"),
  table(
    ["Тип", "Для чего подходит", "Примерная цена/мес", "Когда перерастёте"],
    [
      ["**Shared** (общий)", "Визитка, блог, небольшой сайт услуг с посещаемостью до нескольких тысяч в месяц", "$2–10", "Как только появится каталог, корзина или 10 000+ визитов — сайт начнёт тормозить из-за соседей по серверу"],
      ["**VPS**", "Интернет-магазин, сайт с тяжёлой базой, кастомная CMS — когда нужен контроль над сервером", "$10–60", "Когда пиковые нагрузки начнут класть сервер, а администрировать его станет некому"],
      ["**Выделенный сервер**", "Крупные порталы, высокие требования к безопасности или хранение данных в конкретной стране", "$80–300", "Перерастают редко — чаще осознанно уходят в облако ради гибкости и экономии"],
      ["**Облачный / serverless** (Vercel, Cloudflare, Netlify)", "Современные сайты на Next.js: лендинги, корпоративные сайты, магазины с внешним бэкендом", "$0–40, стартовые тарифы бесплатны", "Практически не перерастают: масштабирование автоматическое, счёт растёт вместе с трафиком"],
    ],
  ),
  p("Отдельная категория — конструкторы (Wix, Tilda, Shopify): там хостинг вшит в подписку и отдельно не покупается. Плата за удобство — вы не можете просто забрать сайт и перенести его куда-то ещё. Этот компромисс мы разобрали в [сравнении с конструкторами](/ru/vs-constructors)."),

  h2("Чем домен отличается от хостинга"),
  p("Это две отдельные услуги, которые можно покупать в разных местах и у разных компаний. Домен вы арендуете у регистратора на год: зона .ua стоит примерно $10–20 в год, .com — около $12. Хостинг оплачиваете отдельно, помесячно или годовым пакетом. Связывает их DNS: в настройках домена вы указываете, на какой сервер отправлять посетителей."),
  p("Практический вывод простой. Домен можно оставить у себя и перенести сайт на другой хостинг за вечер — посетители ничего не заметят. И наоборот: потерять домен из-за неоплаты значит потерять адрес, даже если сайт жив и все файлы на месте. Поэтому напоминание о продлении домена должно приходить владельцу бизнеса, а не менеджеру, который уволился два года назад."),

  h2("На что реально влияет хостинг"),
  p("Хостинг — не та строка расходов, которую стоит оптимизировать до нуля. Он влияет на три вещи, которые видно в деньгах."),
  h3("Скорость"),
  p("Время ответа сервера (TTFB) — это фора или гандикап, который получает каждая страница ещё до того, как браузер начнёт что-то рисовать. Дешёвый shared в соседней стране легко даёт 600–900 мс. Облачная платформа с CDN, отдающая страницу с ближайшего к посетителю узла, — 50–150 мс. Эту разницу не компенсировать ни сжатием картинок, ни чистым кодом."),
  h3("Аптайм"),
  p("Каждый час простоя магазина — это потерянные заказы, а для клиники ещё и звонки, ушедшие конкуренту. Google тоже замечает: если робот приходит несколько раз подряд и видит ошибку сервера, страница может выпасть из индекса, а возвращаться будет неделями."),
  h3("Core Web Vitals"),
  p("Google измеряет скорость на реальных посетителях, а не в лаборатории. LCP — время появления самого крупного элемента на экране — напрямую зависит от того, как быстро сервер отдал HTML. Что это за метрики и где их смотреть, мы расписали в статье о том, [что такое Core Web Vitals](/ru/blog/chto-takoe-core-web-vitals). А как ускорение повлияло на количество заявок — в разборе [скорости медицинского сайта](/ru/blog/skorost-medicinskogo-sayta)."),

  h2("Где хостим мы и на кого оформляем аккаунты"),
  p("Мы деплоим проекты на Vercel и Cloudflare. Причина прагматичная: сайты на Next.js там отдаются из глобальной сети, статика кешируется на краю, а всплеск трафика не требует от владельца никаких действий — платформа сама добавляет ресурсы и сама их снимает, когда пик прошёл."),
  p("Хостинг первого года входит в пакет разработки: мы берём на себя оплату, настройку домена, SSL и мониторинг, пока сайт разгоняется. Дальше аккаунты передаются клиенту — Vercel или Cloudflare и регистратор домена оформляются на вашу почту, вы видите счета и можете в любой момент уйти к другому подрядчику. Это честнее и, откровенно говоря, невыгоднее для нас: теряется удобный рычаг удержания. Но сайт, к которому у вас нет доступа, — это не ваш актив."),
  p("Если администрировать самому не хочется, это закрывается [поддержкой](/ru/support) — $200/мес или $40/час: обновления, бэкапы, мониторинг аптайма, своевременное продление домена. Что входит в разработку и сколько стоят пакеты — на [странице цен](/ru/pricing)."),

  cta(
    "Не знаете, где живёт ваш сайт?",
    "Проверим, на чём он хостится сейчас, какой у него TTFB и оформлены ли домен и хостинг на вас. Один рабочий день, без оплаты.",
    "Заказать проверку",
    "/ru/support",
  ),

  h2("Три ошибки, которые стоят дорого"),
  num("**Дешёвый shared под интернет-магазин.** Каталог на 2 000 товаров на тарифе за $3 работает ровно до того момента, пока на него не пустили рекламу. Сайт ложится в чёрную пятницу — то есть именно тогда, когда нужен больше всего. Разница между shared и VPS здесь — $30 в месяц против дневной выручки."),
  num("**Хостинг и домен оформлены на подрядчика.** Классика: сайт сделали пять лет назад, разработчик пропал, доступов нет, а домен вот-вот истечёт. Восстановление такого доступа стоит недель переписки, а иногда заканчивается полной пересборкой сайта на новом домене. Проверьте это сегодня, а не тогда, когда понадобится."),
  num("**Экономия на бэкапах и мониторинге.** Хостинг за $3 не имеет ни ежедневных копий, ни уведомления о падении. О том, что сайт лежит вторые сутки, вы узнаете от клиента — и это в лучшем случае."),
  p("Хостинг — скучная инфраструктура, и именно поэтому о нём вспоминают в последнюю очередь. Но это фундамент: на медленном и ненадёжном сервере не работает ни SEO, ни реклама, ни дизайн, за который вы заплатили."),
];

/* ─────────────────────────── EN ─────────────────────────── */

const bodyEn = [
  tldr("In short", [
    "Hosting is rented space on a server where your website files live and from which they are served to visitors.",
    "A domain is the address; hosting is the premises. Two separate services, usually two separate bills.",
    "Types: shared ($2–10/mo), VPS ($10–60), dedicated server ($80–300), cloud / serverless ($0–40).",
    "Hosting directly affects speed, uptime and Core Web Vitals — and therefore rankings and enquiries.",
    "We deploy to Vercel and Cloudflare; the first year is included, after that the accounts are handed to the client.",
    "The costly mistakes: cheap shared hosting under an online store, and hosting registered to the agency.",
  ]),

  p("Hosting is a service that rents you space on a server where your website files are stored: the code, the images, the database. When someone types your address into a browser, the request goes to that server and it sends the page back. No hosting, no website — the domain simply points at nothing."),
  p("Hosting is always paid for and always someone's responsibility. It can be a traditional provider with a control panel, or a cloud platform such as Vercel or Cloudflare where you never see a server at all — only a deployment and a connected domain. The difference between those options is measured not just in price, but in how fast the site is and who gets woken up when it goes down."),
  p("Below: what hosting actually includes, how it differs from a domain, which types exist, what they cost, and how to avoid the two most expensive traps."),

  h2("In plain words: the domain is the address, hosting is the premises"),
  p("Think of a website as a shop. The **domain** is the address on the sign: 1 High Street. **Hosting** is the premises themselves — walls, lights, shelves, floor space. You can own the address without renting premises, and visitors arrive at an empty plot. You can rent premises without an address, and nobody knows how to find you."),
  p("The analogy holds further than you would expect. A desk in a co-working space is shared hosting: cheap, but the neighbours are noisy. A private office is a VPS. Your own building is a dedicated server. Cloud hosting is renting exactly as much floor space as you used today."),
  p("The address side of this is covered separately in [what is a domain](/en/blog/what-is-a-domain)."),

  h2("What hosting actually includes"),
  li("**Disk space** — room for files, images and the database."),
  li("**CPU and RAM** — these decide how many simultaneous visitors the site handles before it starts crawling."),
  li("**Bandwidth** — how much data the server may send per month. Cheap plans cap it and bill the overage separately."),
  li("**An SSL certificate** — encryption and the padlock in the browser. It is free almost everywhere now; you should not be paying extra for it."),
  li("**Backups** — daily copies of the site. Worth paying for, and precisely what the cheapest plans leave out."),
  li("**Support** — an actual human who replies when the site goes down at 11pm on a Friday."),
  p("Then there is **uptime** — the share of time the site is reachable. A sensible figure is 99.9% or better, which is up to 44 minutes of downtime a month. 99% sounds almost identical but works out at roughly seven hours a month, and they will land at the worst possible moment."),

  h2("Types of hosting, and what they cost"),
  table(
    ["Type", "Best for", "Typical price/mo", "When you outgrow it"],
    [
      ["**Shared**", "A brochure site, a blog, a small services site with up to a few thousand visits a month", "$2–10", "As soon as you add a catalogue, a basket or pass 10,000 visits — the site slows down because of its server neighbours"],
      ["**VPS**", "Online stores, database-heavy sites, custom CMS builds — anywhere you need control of the server", "$10–60", "When traffic peaks start taking the server down and nobody is left to administer it"],
      ["**Dedicated server**", "Large portals, strict security requirements, or data that must sit in a specific country", "$80–300", "Rarely outgrown — more often deliberately traded for cloud, for flexibility and cost"],
      ["**Cloud / serverless** (Vercel, Cloudflare, Netlify)", "Modern Next.js sites: landing pages, corporate sites, stores with an external backend", "$0–40, entry tiers are free", "Effectively never: scaling is automatic and the bill grows with traffic"],
    ],
  ),
  p("Site builders (Wix, Squarespace, Shopify) are a category of their own: hosting is baked into the subscription and cannot be bought separately. The price of that convenience is that you cannot simply pick the site up and move it elsewhere. We covered that trade-off in our [comparison with site builders](/en/vs-constructors)."),

  h2("Domain versus hosting"),
  p("They are two separate services and can be bought from two different companies. A domain is rented from a registrar by the year — a .com runs about $12 a year, country domains $10–20. Hosting is paid separately, monthly or annually. DNS connects the two: in the domain's settings you point visitors at a particular server."),
  p("The practical consequence: keep the domain in your own name and you can move the site to another host in an evening, with visitors none the wiser. Lose it to an unpaid renewal invoice and you lose the address, even though every file is intact. Renewal reminders should reach the business owner, not an account manager who left two years ago."),

  h2("What hosting really affects"),
  p("Hosting is not the line item to optimise down to zero. It moves three things you can see in the numbers."),
  h3("Speed"),
  p("Time to first byte is the head start — or handicap — every page gets before the browser draws anything at all. Cheap shared hosting in another country easily returns 600–900 ms. A cloud platform with a CDN serving the page from the node nearest the visitor returns 50–150 ms. No amount of image compression or clean code makes up that gap."),
  h3("Uptime"),
  p("An hour of downtime for a store is lost orders; for a clinic it is calls that went to a competitor. Google notices too: if its crawler hits server errors several times in a row, the page can drop out of the index, and getting it back takes weeks."),
  h3("Core Web Vitals"),
  p("Google measures speed on real visitors, not in a lab. LCP — how long the largest element takes to appear — depends directly on how quickly the server returned the HTML. What the metrics are and where to read them is covered in [what are Core Web Vitals](/en/blog/what-is-core-web-vitals), and the effect of a speed fix on actual enquiries is in our write-up on [medical website speed](/en/blog/medical-website-speed)."),

  h2("Where we host, and whose name the accounts are in"),
  p("We deploy to Vercel and Cloudflare. The reasoning is practical: Next.js sites are served from a global network, static assets are cached at the edge, and a traffic spike requires nothing from the owner."),
  p("The first year of hosting is included in the build package: we cover the cost, the domain setup, SSL and monitoring while the site finds its footing. After that the accounts are handed over — Vercel or Cloudflare and the domain registrar are put in your name and your email, you see the invoices, and you can move to another agency whenever you like. It is the honest arrangement and, frankly, the less profitable one for us: it gives up a convenient lever. But a website you cannot log into is not an asset you own."),
  p("If you would rather not administer any of it, that is what [support](/en/support) is for — $200/month or $40/hour: updates, backups, uptime monitoring, domain renewals handled on time. What a build includes and what the packages cost is on the [pricing page](/en/pricing)."),

  cta(
    "Not sure where your site actually lives?",
    "We will check what it is hosted on, what its TTFB looks like, and whether the domain and hosting are in your name. One working day, no charge.",
    "Request a check",
    "/en/support",
  ),

  h2("Three mistakes that get expensive"),
  num("**Cheap shared hosting under an online store.** A 2,000-product catalogue on a $3 plan works right up until you point advertising at it. The site falls over on Black Friday — exactly when you need it. The gap between shared and a VPS is about $30 a month, against a day of revenue."),
  num("**Hosting and domain registered to the agency.** The classic: the site was built five years ago, the developer has vanished, nobody has the logins, and the domain expires next month. Recovering access costs weeks of correspondence and sometimes ends in rebuilding the site on a new domain. Check this today, not on the day you need it."),
  num("**Skipping backups and monitoring.** A $3 plan has neither daily copies nor an alert when the site goes down. You find out the site has been offline for two days from a customer — and that is the good outcome."),
  p("Hosting is boring infrastructure, which is why it gets thought about last. It is also the foundation: on a slow, unreliable server, neither the SEO nor the ads nor the design you paid for does its job."),
];

const doc = {
  _id: "glos2026-shcho-take-hosting",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 6,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-hosting" },
    ru: { _type: "slug", current: "chto-takoe-hosting" },
    en: { _type: "slug", current: "what-is-hosting" },
  },
  title: {
    _type: "localizedString",
    uk: "Хостинг — що це і який потрібен вашому сайту",
    ru: "Хостинг — что это и какой нужен вашему сайту",
    en: "Hosting: what it is and which type your site needs",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Хостинг це: що таке і який обрати",
    ru: "Хостинг это: что такое и какой выбрать",
    en: "What Is Hosting and Which Type You Need",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Хостинг — це оренда місця на сервері, де лежать файли сайту. ✔️ Типи й ціни: shared, VPS, хмарний ✔️ Чим відрізняється від домену ➡ Пояснюємо просто.",
    ru: "➤ Хостинг — это аренда места на сервере, где лежат файлы сайта. ✔️ Типы и цены: shared, VPS, облачный ✔️ Чем отличается от домена ➡ Объясняем просто.",
    en: "➤ Hosting is rented server space where your site files live. ✔️ Types and prices: shared, VPS, cloud ✔️ How it differs from a domain ➡ Explained plainly.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Словник термінів",
    ru: "Словарь терминов",
    en: "Glossary",
  },
  lede: {
    _type: "localizedString",
    uk: "Що таке хостинг простими словами, чим він відрізняється від домену, які бувають типи й скільки коштують — і чому ми віддаємо акаунти клієнту.",
    ru: "Что такое хостинг простыми словами, чем он отличается от домена, какие бывают типы и сколько стоят — и почему мы отдаём аккаунты клиенту.",
    en: "What hosting is in plain words, how it differs from a domain, which types exist and what they cost — and why we hand the accounts to the client.",
  },
  tags: ["хостинг", "домен", "інфраструктура", "глосарій"],
  relatedPostSlugs: ["shcho-take-domen", "shcho-take-core-web-vitals", "shvydkist-medychnoho-saitu"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує хостинг для сайту?",
        ru: "Сколько стоит хостинг для сайта?",
        en: "How much does website hosting cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Для візитівки чи блогу вистачить shared-хостингу за $2–10 на місяць. Інтернет-магазину потрібен VPS — $10–60. Хмарні платформи на кшталт Vercel і Cloudflare мають безкоштовні стартові тарифи, а типовий рахунок бізнес-сайту там — $0–40 на місяць. Домен оплачується окремо: $10–20 на рік.",
        ru: "Для визитки или блога хватит shared-хостинга за $2–10 в месяц. Интернет-магазину нужен VPS — $10–60. У облачных платформ вроде Vercel и Cloudflare есть бесплатные стартовые тарифы, а типичный счёт бизнес-сайта там — $0–40 в месяц. Домен оплачивается отдельно: $10–20 в год.",
        en: "A brochure site or blog is fine on shared hosting at $2–10 a month. An online store needs a VPS at $10–60. Cloud platforms such as Vercel and Cloudflare have free entry tiers, and a typical business site there costs $0–40 a month. The domain is billed separately at $10–20 a year.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Хостинг і домен — це одне й те саме?",
        ru: "Хостинг и домен — это одно и то же?",
        en: "Are hosting and a domain the same thing?",
      },
      answer: {
        _type: "localizedText",
        uk: "Ні. Домен — це адреса сайту, яку ви орендуєте у реєстратора. Хостинг — місце на сервері, де фізично лежать файли. Це різні послуги з різними рахунками, і купувати їх можна в різних компаній. Пов'язує їх DNS: у налаштуваннях домену вказується сервер, куди спрямовувати відвідувачів.",
        ru: "Нет. Домен — это адрес сайта, который вы арендуете у регистратора. Хостинг — место на сервере, где физически лежат файлы. Это разные услуги с разными счетами, и покупать их можно у разных компаний. Связывает их DNS: в настройках домена указывается сервер, куда отправлять посетителей.",
        en: "No. The domain is the address you rent from a registrar. Hosting is the server space where the files physically sit. They are separate services with separate bills and can be bought from different companies. DNS links them: the domain's settings point visitors at a particular server.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна перенести сайт на інший хостинг?",
        ru: "Можно ли перенести сайт на другой хостинг?",
        en: "Can I move my site to a different host?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, і зазвичай це питання одного вечора: копіюються файли й база, потім у налаштуваннях домену міняється запис DNS. Відвідувачі нічого не помічають. Складно буває лише в двох випадках: якщо сайт зроблений на конструкторі, звідки його не експортувати, або якщо доступи до хостингу залишилися у старого підрядника.",
        ru: "Да, и обычно это вопрос одного вечера: копируются файлы и база, затем в настройках домена меняется DNS-запись. Посетители ничего не замечают. Сложно бывает только в двух случаях: если сайт сделан на конструкторе, откуда его не экспортировать, или если доступы к хостингу остались у старого подрядчика.",
        en: "Yes, and it is usually an evening's work: copy the files and database, then change the DNS record in the domain settings. Visitors notice nothing. It only gets hard in two cases — the site was built on a platform you cannot export from, or the previous agency still holds the logins.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "На кого має бути оформлений хостинг — на мене чи на розробника?",
        ru: "На кого должен быть оформлен хостинг — на меня или на разработчика?",
        en: "Should hosting be registered to me or to my developer?",
      },
      answer: {
        _type: "localizedText",
        uk: "На вас. Домен і хостинг — це активи бізнесу, і вони мають бути оформлені на вашу пошту та вашу картку. Підряднику достатньо доступу як команді проєкту. Ми хостимо перший рік за свій рахунок у межах пакета, а далі передаємо акаунти Vercel або Cloudflare і реєстратора клієнту.",
        ru: "На вас. Домен и хостинг — это активы бизнеса, и они должны быть оформлены на вашу почту и вашу карту. Подрядчику достаточно доступа как участнику команды проекта. Мы хостим первый год за свой счёт в рамках пакета, а дальше передаём аккаунты Vercel или Cloudflare и регистратора клиенту.",
        en: "To you. The domain and hosting are business assets and belong on your email and your card. An agency only needs team-level access to the project. We cover the first year as part of the build package, then hand the Vercel or Cloudflare account and the registrar over to the client.",
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
