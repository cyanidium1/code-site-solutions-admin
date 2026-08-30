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
  tldr("Коротко про CTA", [
    "CTA (call to action) — це заклик до дії: кнопка, посилання або форма, які ведуть відвідувача до наступного кроку.",
    "Сильний CTA називає результат для людини («Отримати розрахунок»), слабкий описує роботу системи («Відправити»).",
    "Мінімум три місця на сторінці: перший екран, одразу після блоку доказів і в самому кінці.",
    "Один основний заклик на сторінку. Вторинний допустимий, п'ять різних — це вже параліч вибору.",
    "Мікрокопія під кнопкою знімає страх: «без зобов'язань», «відповідаємо за 4 години».",
  ]),

  p("**CTA — це call to action, заклик до дії**: кнопка, посилання або форма, які пропонують відвідувачу зробити конкретний наступний крок. На сайті це «Отримати розрахунок», «Замовити дзвінок», «Подивитися ціни» — усе, що перетворює читача сторінки на заявку у вашій пошті."),

  p("Технічно CTA — звичайний елемент інтерфейсу: прямокутник з текстом. Практично це місце, де сторінка або заробляє, або мовчить. Ви можете вкласти гроші в дизайн, тексти і рекламу, привести на сайт тисячу людей — і втратити їх усіх на кнопці «Відправити», яка нічого не обіцяє і нікуди явно не веде."),

  p("Нижче — як формулювати заклик, де його ставити, скільки їх має бути на одній сторінці і які помилки ми найчастіше бачимо, коли до нас приходять із проханням «підняти конверсію»."),

  h2("Простими словами"),
  p("Уявіть продавця у магазині. Поганий продавець мовчки стоїть біля каси і чекає, поки ви самі здогадаєтесь, що робити далі. Хороший каже: «Давайте я порахую вартість — це дві хвилини, нічого підписувати не треба». CTA — це та сама фраза, тільки на сайті."),
  p("Тому заклик до дії — це не просто кнопка. Це три речі разом: **обіцянка результату** в тексті кнопки, **візуальний контраст**, щоб її було видно за півсекунди, і **зняття ризику** поруч, щоб натиснути було не страшно. Прибираєте будь-яку з трьох — конверсія падає."),

  h2("Слабкі формулювання проти сильних"),
  p("Найшвидший спосіб покращити сторінку — переписати текст кнопок. Це нічого не коштує і не вимагає розробника. Ось типові заміни, які ми робимо на клієнтських проєктах."),
  table(
    ["Слабке формулювання", "Сильне формулювання", "Чому це працює"],
    [
      ["Відправити", "Отримати розрахунок", "Людина бачить, що отримає вона, а не що зробить система"],
      ["Дізнатися більше", "Подивитися ціни", "Конкретика замість туману: зрозуміло, яка саме сторінка відкриється"],
      ["Залишити заявку", "Порахувати вартість сайту", "Кнопка обіцяє відповідь на те питання, з яким людина прийшла"],
      ["Зв'язатися з нами", "Отримати відповідь за 4 години", "З'являється строк — зникає страх «мене засипле дзвінками»"],
      ["Підписатися", "Забрати чек-лист із 20 пунктів", "Обмін конкретної цінності на email замість абстрактної підписки"],
    ]
  ),
  p("Правило просте: у тексті кнопки має бути дієслово того, що отримує **клієнт**, а не того, що робить сайт. «Відправити» — робота форми. «Отримати розрахунок» — вигода людини."),

  h2("Де розміщувати CTA на сторінці"),
  h3("Перший екран"),
  p("Частина відвідувачів готова діяти одразу — вони вже порівняли варіанти і прийшли по виконавця. Якщо на першому екрані немає кнопки, ці люди змушені шукати її самі, а частина просто закриє вкладку. Перший CTA має бути видно без жодного скролу."),
  h3("Після блоку доказів"),
  p("Другий заклик ставимо там, де сумнів щойно знято: після кейсів, відгуків, гарантій або таблиці з цінами. Це найтепліша точка сторінки — людина щойно побачила підтвердження і саме зараз готова натиснути."),
  h3("У кінці сторінки"),
  p("Той, хто дочитав до низу, — найтепліший контакт з усіх. Залишати його наодинці з футером без жодної кнопки — найдорожча помилка з усіх дешевих. Фінальний CTA має бути великим і однозначним."),

  h2("Скільки CTA має бути на сторінці"),
  p("**Один основний заклик — і скільки завгодно його повторів.** Кнопка «Отримати розрахунок» може стояти на сторінці п'ять разів: це не п'ять CTA, це один, повторений у зручних точках. А от «Замовити дзвінок», «Написати в Telegram», «Підписатися на розсилку», «Завантажити прайс» і «Записатися на консультацію» на одній сторінці — це п'ять різних рішень, які людина мусить прийняти замість одного."),
  p("Вторинний заклик допустимий і навіть корисний — але він має бути візуально тихішим: не залита кольором кнопка, а посилання або контурна кнопка. Наприклад, основний — «Отримати розрахунок», вторинний — «Подивитися портфоліо». Ієрархія має читатися з першого погляду; про інші прийоми такої ієрархії ми писали в матеріалі про [дизайн-прийоми для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),

  h2("Мікрокопія: два рядки, які знімають страх"),
  p("Люди не натискають не тому, що не хочуть, а тому що не знають, що станеться далі. Короткий рядок під кнопкою прибирає цю невідомість краще за будь-який дизайн:"),
  li("«Без зобов'язань» — знімає страх, що заявка = договір."),
  li("«Відповідаємо за 4 години в робочі дні» — задає очікування щодо строку."),
  li("«Не телефонуємо без попередження, пишемо в месенджер» — рятує інтровертів, а їх більше, ніж здається."),
  li("«Достатньо імені та телефона» — показує, що форма коротка."),
  p("Мікрокопія працює тільки тоді, коли вона правдива. Обіцяли відповідь за 4 години — відповідайте за 4 години, інакше перша ж прострочка коштує дорожче за всю конверсію."),

  h2("Три помилки, які трапляються найчастіше"),
  num("**П'ять різних закликів на одній сторінці.** Кожен додатковий варіант забирає увагу в основного. Виберіть головну дію і зробіть решту тихішими."),
  num("**Кнопка «Відправити».** Це найдорожче слово на сайті: воно описує роботу форми і не дає людині жодної причини натискати."),
  num("**Порожній перший екран.** Гарний банер, слоган — і жодної кнопки. Найгарячіші відвідувачі йдуть, не долиставши до контактів."),
  p("Окремим пунктом — кнопка, яка веде в нікуди: форма без підтвердження, після якої незрозуміло, чи заявка відправилась. Це вбиває довіру швидше за будь-яке формулювання."),

  h2("Чому це важливо для бізнесу"),
  p("CTA — найдешевший важіль конверсії з усіх, що є. Переписати п'ять кнопок можна за годину, і це не вимагає ні редизайну, ні нового бюджету на рекламу. При тому самому трафіку сторінка починає віддавати більше заявок — просто тому, що людям нарешті зрозуміло, що робити далі."),
  p("Особливо це критично для [лендінгу](/blog/shcho-take-lending), де вся сторінка веде до однієї дії: там слабкий заклик знецінює весь бюджет. Якщо ви плануєте [односторінковий сайт під рекламу](/landing) — від $800 у нас, — формулювання кнопок варто узгодити ще до дизайну, а не після запуску."),

  cta(
    "Порахуємо, скільки заявок втрачають ваші кнопки",
    "Відкрийте калькулятор і зберіть орієнтовний бюджет сайту за дві хвилини — або напишіть нам, і ми безкоштовно подивимося на CTA вашої сторінки.",
    "Порахувати вартість",
    "/calculator"
  ),
];

/* ─────────────────────────── RU ─────────────────────────── */

const bodyRu = [
  tldr("Коротко о CTA", [
    "CTA (call to action) — это призыв к действию: кнопка, ссылка или форма, ведущие посетителя к следующему шагу.",
    "Сильный CTA называет результат для человека («Получить расчёт»), слабый описывает работу системы («Отправить»).",
    "Минимум три места на странице: первый экран, сразу после блока доказательств и в самом конце.",
    "Один основной призыв на страницу. Вторичный допустим, пять разных — это паралич выбора.",
    "Микрокопия под кнопкой снимает страх: «без обязательств», «отвечаем за 4 часа».",
  ]),

  p("**CTA — это call to action, призыв к действию**: кнопка, ссылка или форма, которые предлагают посетителю сделать конкретный следующий шаг. На сайте это «Получить расчёт», «Заказать звонок», «Посмотреть цены» — всё, что превращает читателя страницы в заявку у вас в почте."),

  p("Технически CTA — обычный элемент интерфейса: прямоугольник с текстом. Практически это место, где страница либо зарабатывает, либо молчит. Можно вложиться в дизайн, тексты и рекламу, привести тысячу человек — и потерять их всех на кнопке «Отправить», которая ничего не обещает и непонятно куда ведёт."),

  p("Дальше — как формулировать призыв, где его ставить, сколько их должно быть на одной странице и какие ошибки мы чаще всего видим, когда к нам приходят с просьбой «поднять конверсию»."),

  h2("Простыми словами"),
  p("Представьте продавца в магазине. Плохой молча стоит у кассы и ждёт, пока вы сами догадаетесь, что делать. Хороший говорит: «Давайте посчитаю стоимость — это две минуты, подписывать ничего не нужно». CTA — та же самая фраза, только на сайте."),
  p("Поэтому призыв к действию — это не просто кнопка. Это три вещи сразу: **обещание результата** в тексте кнопки, **визуальный контраст**, чтобы её было видно за полсекунды, и **снятие риска** рядом, чтобы нажать было не страшно. Убираете любую из трёх — конверсия падает."),

  h2("Слабые формулировки против сильных"),
  p("Самый быстрый способ улучшить страницу — переписать тексты кнопок. Это ничего не стоит и не требует разработчика. Вот типовые замены, которые мы делаем на клиентских проектах."),
  table(
    ["Слабая формулировка", "Сильная формулировка", "Почему работает"],
    [
      ["Отправить", "Получить расчёт", "Человек видит, что получит он, а не что сделает система"],
      ["Узнать больше", "Посмотреть цены", "Конкретика вместо тумана: понятно, какая именно страница откроется"],
      ["Оставить заявку", "Посчитать стоимость сайта", "Кнопка обещает ответ на тот вопрос, с которым человек пришёл"],
      ["Связаться с нами", "Получить ответ за 4 часа", "Появляется срок — исчезает страх «меня засыплют звонками»"],
      ["Подписаться", "Забрать чек-лист из 20 пунктов", "Обмен конкретной ценности на email вместо абстрактной подписки"],
    ]
  ),
  p("Правило простое: в тексте кнопки должен стоять глагол того, что получает **клиент**, а не того, что делает сайт. «Отправить» — работа формы. «Получить расчёт» — выгода человека."),

  h2("Где размещать CTA на странице"),
  h3("Первый экран"),
  p("Часть посетителей готова действовать сразу — они уже сравнили варианты и пришли за исполнителем. Если на первом экране нет кнопки, эти люди вынуждены искать её сами, а часть просто закроет вкладку. Первый CTA должен быть виден без единого скролла."),
  h3("После блока доказательств"),
  p("Второй призыв ставим там, где сомнение только что снято: после кейсов, отзывов, гарантий или таблицы с ценами. Это самая тёплая точка страницы — человек увидел подтверждение и именно сейчас готов нажать."),
  h3("В конце страницы"),
  p("Тот, кто дочитал до низа, — самый тёплый контакт из всех. Оставлять его наедине с футером без единой кнопки — самая дорогая из дешёвых ошибок. Финальный CTA должен быть крупным и однозначным."),

  h2("Сколько CTA должно быть на странице"),
  p("**Один основной призыв — и сколько угодно его повторов.** Кнопка «Получить расчёт» может стоять на странице пять раз: это не пять CTA, это один, повторённый в удобных точках. А вот «Заказать звонок», «Написать в Telegram», «Подписаться на рассылку», «Скачать прайс» и «Записаться на консультацию» на одной странице — пять разных решений, которые человек должен принять вместо одного."),
  p("Вторичный призыв допустим и даже полезен — но он должен быть визуально тише: не залитая цветом кнопка, а ссылка или контурная кнопка. Например, основной — «Получить расчёт», вторичный — «Посмотреть портфолио». Иерархия должна читаться с первого взгляда; о других приёмах такой иерархии мы писали в материале про [дизайн-приёмы для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),

  h2("Микрокопия: две строки, которые снимают страх"),
  p("Люди не нажимают не потому, что не хотят, а потому что не знают, что будет дальше. Короткая строка под кнопкой убирает эту неизвестность лучше любого дизайна:"),
  li("«Без обязательств» — снимает страх, что заявка равна договору."),
  li("«Отвечаем за 4 часа в рабочие дни» — задаёт ожидание по сроку."),
  li("«Не звоним без предупреждения, пишем в мессенджер» — спасает интровертов, а их больше, чем кажется."),
  li("«Достаточно имени и телефона» — показывает, что форма короткая."),
  p("Микрокопия работает только тогда, когда она правдива. Обещали ответ за 4 часа — отвечайте за 4 часа, иначе первая же просрочка обойдётся дороже всей конверсии."),

  h2("Три ошибки, которые встречаются чаще всего"),
  num("**Пять разных призывов на одной странице.** Каждый лишний вариант забирает внимание у основного. Выберите главное действие и сделайте остальные тише."),
  num("**Кнопка «Отправить».** Самое дорогое слово на сайте: оно описывает работу формы и не даёт человеку ни одной причины нажимать."),
  num("**Пустой первый экран.** Красивый баннер, слоган — и ни одной кнопки. Самые горячие посетители уходят, не долистав до контактов."),
  p("Отдельным пунктом — кнопка, ведущая в никуда: форма без подтверждения, после которой непонятно, ушла ли заявка. Это убивает доверие быстрее любой формулировки."),

  h2("Почему это важно для бизнеса"),
  p("CTA — самый дешёвый рычаг конверсии из существующих. Переписать пять кнопок можно за час, и это не требует ни редизайна, ни нового рекламного бюджета. При том же трафике страница начинает отдавать больше заявок — просто потому, что людям наконец понятно, что делать дальше."),
  p("Особенно это критично для [лендинга](/ru/blog/chto-takoe-lending), где вся страница ведёт к одному действию: там слабый призыв обесценивает весь бюджет. Если планируете [одностраничный сайт под рекламу](/ru/landing) — у нас от $800, — формулировки кнопок стоит согласовать ещё до дизайна, а не после запуска."),

  cta(
    "Посчитаем, сколько заявок теряют ваши кнопки",
    "Откройте калькулятор и соберите ориентировочный бюджет сайта за две минуты — или напишите нам, и мы бесплатно посмотрим на CTA вашей страницы.",
    "Посчитать стоимость",
    "/ru/calculator"
  ),
];

/* ─────────────────────────── EN ─────────────────────────── */

const bodyEn = [
  tldr("CTA in short", [
    "A CTA (call to action) is the button, link or form that moves a visitor to the next step.",
    "Strong CTAs name the reader's outcome («Get my quote»); weak ones describe the system's job («Submit»).",
    "Place at least three: above the fold, right after your proof section, and at the very bottom.",
    "One primary action per page. A quieter secondary link is fine; five competing buttons are not.",
    "Microcopy under the button removes the fear: «No obligation», «We reply within 4 hours».",
  ]),

  p("**A CTA is a call to action** — the button, link or form that asks a visitor to take one specific next step. On a website that means «Get my quote», «Book a call», «See pricing»: anything that turns a reader into an enquiry in your inbox."),

  p("Technically it is an ordinary interface element, a rectangle with a label. In practice it is where a page either earns or stays silent: you can spend real money on design, copy and ads, then lose every visitor on a button marked «Submit»."),

  p("Below: how to word a call to action, where to place it, how many belong on one page, and the mistakes we see most often."),

  h2("In plain words"),
  p("Think of a shop assistant. The bad one stands by the till and waits for you to work out what happens next. The good one says: «Let me price it up — two minutes, nothing to sign». A CTA is that same sentence, on a web page."),
  p("So a call to action is more than a button. It is three things at once: a **promise of an outcome** in the label, **visual contrast** so it is spotted in half a second, and **risk removal** next to it so clicking feels safe. Drop any one of the three and the conversion rate drops with it."),

  h2("Weak wording versus strong wording"),
  p("Rewriting button labels is the fastest improvement available on any page. It costs nothing and needs no developer. These are the swaps we make on client projects."),
  table(
    ["Weak label", "Strong label", "Why it works"],
    [
      ["Submit", "Get my quote", "The reader sees what they receive, not what the system does"],
      ["Learn more", "See pricing", "Specific instead of vague: it is clear which page opens next"],
      ["Send request", "Calculate my website cost", "The button answers the question the visitor arrived with"],
      ["Contact us", "Get a reply within 4 hours", "Adding a timeframe removes the fear of being chased by calls"],
      ["Subscribe", "Get the 20-point checklist", "Trades something concrete for an email instead of a vague sign-up"],
    ]
  ),
  p("The rule is simple: the verb in the label should belong to the **customer**, not to the website. «Submit» is what the form does. «Get my quote» is what the person gets."),

  h2("Where to place a CTA"),
  h3("Above the fold"),
  p("Some visitors are ready immediately — they have already compared options and arrived looking for a supplier. With no button in the first screen they have to hunt for one, and a share of them simply close the tab. The first CTA should be visible without a single scroll."),
  h3("Straight after your proof"),
  p("Put the second one where doubt has just been answered: after case studies, testimonials, guarantees or a pricing table. That is the warmest point on the page — the reader has just seen evidence and is ready to act on it."),
  h3("At the bottom of the page"),
  p("Anyone who reads to the end is the warmest contact you have. Leaving them alone with a footer and no button is the most expensive of the cheap mistakes."),

  h2("How many CTAs belong on one page"),
  p("**One primary action, repeated as often as it helps.** A «Get my quote» button can appear five times on a long page: that is not five CTAs, it is one placed at five convenient moments. But «Book a call», «Message us on Telegram», «Join the newsletter», «Download the price list» and «Reserve a consultation» together are five separate decisions asked of one reader."),
  p("A secondary action is fine and often useful, as long as it is visually quieter — an outline button or a plain link rather than a second filled block. Primary «Get my quote», secondary «See our work». The hierarchy has to be readable at a glance; we covered more of these hierarchy techniques in our piece on [design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),

  h2("Microcopy: the two lines that remove fear"),
  p("People hesitate not because they do not want the thing, but because they do not know what happens after the click. One short line under the button solves that better than any styling:"),
  li("«No obligation» — a request is not a contract."),
  li("«We reply within 4 hours on working days» — sets the expectation on timing."),
  li("«We message first, we never cold-call» — saves the introverts, and there are more of them than you think."),
  li("«Name and email are enough» — signals that the form is short."),
  p("Microcopy only works while it is true. If you promise a reply within four hours, reply within four hours: the first missed promise costs more than the conversion it won."),

  h2("Three mistakes we see most often"),
  num("**Five competing calls to action.** Every extra option steals attention from the main one. Pick the primary action and turn the volume down on the rest."),
  num("**A button that says «Submit».** The most expensive word on a website: it describes the form's job and gives the reader no reason to press it."),
  num("**An empty first screen.** A handsome hero image, a slogan, and no button at all. The hottest visitors leave before they reach your contact details."),
  p("One quieter failure: a form with no confirmation, so nobody knows whether the enquiry was sent. That destroys trust faster than any wording."),

  h2("Why this matters commercially"),
  p("A CTA is the cheapest conversion lever available. Rewriting five labels takes an hour, needs no redesign and no extra ad budget. On the same traffic the page starts producing more enquiries, simply because it is finally clear what to do next."),
  p("It matters most on a [landing page](/en/blog/what-is-a-landing-page), where the whole page drives one action and a weak call to action wastes the entire campaign budget. If you are planning a [single-page site for paid traffic](/en/landing) — ours start from $800 — agree the button wording before design starts, not after launch."),

  cta(
    "Find out what your buttons are costing you",
    "Open the calculator and build a rough website budget in two minutes — or send us your page and we will review its calls to action for free.",
    "Calculate the cost",
    "/en/calculator"
  ),
];

const doc = {
  _id: "glos2026-shcho-take-cta",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 5,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-cta" },
    ru: { _type: "slug", current: "chto-takoe-cta" },
    en: { _type: "slug", current: "what-is-a-cta" },
  },
  title: {
    _type: "localizedString",
    uk: "CTA — що це і як він приносить заявки",
    ru: "CTA — это что: как призыв к действию приносит заявки",
    en: "What is a CTA and how it brings you enquiries",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "CTA це: що таке заклик до дії на сайті",
    ru: "CTA это: что такое призыв к действию",
    en: "What Is a CTA? Call to Action Explained",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ CTA це заклик до дії ✔️ слабкі та сильні формулювання кнопок ✔️ де розміщувати і скільки їх треба ➡ приклади, мікрокопія та типові помилки",
    ru: "➤ CTA это призыв к действию ✔️ слабые и сильные формулировки кнопок ✔️ где размещать и сколько нужно ➡ примеры, микрокопия и типичные ошибки",
    en: "➤ A CTA is a call to action ✔️ weak versus strong button wording ✔️ where to place them and how many ➡ examples, microcopy and common mistakes",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Словник термінів",
    ru: "Словарь терминов",
    en: "Glossary",
  },
  lede: {
    _type: "localizedString",
    uk: "CTA — це call to action, заклик до дії: кнопка або посилання, які ведуть відвідувача до наступного кроку. Розбираємо формулювання, розміщення і помилки, що коштують заявок.",
    ru: "CTA — это call to action, призыв к действию: кнопка или ссылка, ведущие посетителя к следующему шагу. Разбираем формулировки, размещение и ошибки, которые стоят заявок.",
    en: "A CTA is a call to action: the button or link that moves a visitor to the next step. Wording, placement and the mistakes that quietly cost you enquiries.",
  },
  tags: ["CTA", "конверсія", "UX"],
  relatedPostSlugs: ["9-dyzain-pryiomiv-dlia-konversii", "shcho-take-lending", "shcho-take-yuzabiliti"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що таке CTA простими словами?",
        ru: "Что такое CTA простыми словами?",
        en: "What is a CTA in simple terms?",
      },
      answer: {
        _type: "localizedText",
        uk: "CTA (call to action) — це заклик до дії: кнопка, посилання або форма, які пропонують відвідувачу зробити конкретний наступний крок. Наприклад, «Отримати розрахунок» або «Подивитися ціни». Без нього людина дочитує сторінку і йде, бо не розуміє, що робити далі.",
        ru: "CTA (call to action) — это призыв к действию: кнопка, ссылка или форма, предлагающие посетителю сделать конкретный следующий шаг. Например, «Получить расчёт» или «Посмотреть цены». Без него человек дочитывает страницу и уходит, потому что не понимает, что делать дальше.",
        en: "A CTA (call to action) is the button, link or form that asks a visitor to take one specific next step — «Get my quote» or «See pricing», for example. Without one, people finish reading and leave, because nothing tells them what to do next.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки CTA має бути на одній сторінці?",
        ru: "Сколько CTA должно быть на одной странице?",
        en: "How many CTAs should one page have?",
      },
      answer: {
        _type: "localizedText",
        uk: "Один основний заклик, повторений у кількох точках: на першому екрані, після блоку доказів і в кінці сторінки. Вторинна дія допустима, але вона має бути візуально тихішою — посилання або контурна кнопка. П'ять різних закликів змушують людину обирати замість того, щоб діяти.",
        ru: "Один основной призыв, повторённый в нескольких точках: на первом экране, после блока доказательств и в конце страницы. Вторичное действие допустимо, но должно быть визуально тише — ссылка или контурная кнопка. Пять разных призывов заставляют человека выбирать вместо того, чтобы действовать.",
        en: "One primary action, repeated at a few natural points: above the fold, after your proof section and at the bottom. A secondary action is fine if it is visually quieter — an outline button or a link. Five competing buttons make people choose instead of act.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чим замінити кнопку «Відправити»?",
        ru: "Чем заменить кнопку «Отправить»?",
        en: "What should replace a «Submit» button?",
      },
      answer: {
        _type: "localizedText",
        uk: "Формулюванням результату, який отримує людина: «Отримати розрахунок», «Порахувати вартість сайту», «Отримати відповідь за 4 години». «Відправити» описує роботу форми і не дає жодної причини натискати. Заміна тексту кнопки — найдешевша зміна з усіх, що впливають на конверсію.",
        ru: "Формулировкой результата, который получает человек: «Получить расчёт», «Посчитать стоимость сайта», «Получить ответ за 4 часа». «Отправить» описывает работу формы и не даёт ни одной причины нажимать. Замена текста кнопки — самое дешёвое изменение из всех, что влияют на конверсию.",
        en: "Name the outcome the reader gets: «Get my quote», «Calculate my website cost», «Get a reply within 4 hours». «Submit» describes the form's job and gives nobody a reason to press it. Rewriting labels is the cheapest change that moves conversion at all.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що писати під кнопкою, щоб на неї частіше натискали?",
        ru: "Что писать под кнопкой, чтобы на неё чаще нажимали?",
        en: "What microcopy should go under the button?",
      },
      answer: {
        _type: "localizedText",
        uk: "Короткий рядок, який знімає ризик: «без зобов'язань», «відповідаємо за 4 години», «достатньо імені та телефона», «не телефонуємо без попередження». Головна умова — обіцянка має бути правдивою: прострочена відповідь коштує дорожче за приріст конверсії.",
        ru: "Короткую строку, снимающую риск: «без обязательств», «отвечаем за 4 часа», «достаточно имени и телефона», «не звоним без предупреждения». Главное условие — обещание должно быть правдивым: просроченный ответ обойдётся дороже прироста конверсии.",
        en: "One short line that removes risk: «No obligation», «We reply within 4 hours», «Name and email are enough», «We message first, we never cold-call». The one condition is that it must be true — a missed promise costs more than the extra clicks were worth.",
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
