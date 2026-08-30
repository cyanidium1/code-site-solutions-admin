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

/* ------------------------------------------------------------------ UK */

const bodyUk = [
  tldr("Коротко", [
    "CMS — система керування контентом: ви самі додаєте тексти, товари, ціни й фото, не чіпаючи код.",
    "Три класи систем: коробкові (WordPress, OpenCart), headless (Sanity, Strapi), конструктори (Tilda, Wix).",
    "Коробкові дешеві на старті й дорогі в підтримці: плагіни, оновлення, безпека.",
    "Ми працюємо на headless Sanity: контент окремо від коду, редактор не може зламати вьорстку, сайт лишається швидким.",
    "Лендінгу CMS часто не потрібна. У проєктах від $2 500 вона входить у пакет.",
  ]),

  p("CMS — це система керування контентом сайту: програма, у якій ви самостійно додаєте й редагуєте тексти, товари, ціни та зображення, не відкриваючи код і не викликаючи розробника. Абревіатура розшифровується як Content Management System. Простими словами: без CMS кожна правка на сайті — це задача програмісту, з CMS — п'ять хвилин у зрозумілому інтерфейсі."),
  p("Нижче — чим CMS відрізняється від конструктора, які три типи існують, у чому реальна різниця між коробковим WordPress і headless-системою, і коли CMS вашому сайту взагалі не потрібна."),
  p("Якщо вас цікавить не сама ідея, а конкретний інтерфейс — як виглядає адмінка зсередини, які там кнопки й що можна натиснути помилково, — про це є окрема стаття: [як працює адмін-панель сайту](/blog/yak-pratsyuye-admin-panel-saytu). Тут ми говоримо про CMS як клас систем і про вибір між ними."),

  h2("Що таке CMS простими словами"),
  p("Сайт без CMS — це меню, надруковане в типографії. Змінилася ціна на каву — треба заново верстати макет, друкувати й везти. Сайт із CMS — та сама вивіска, але з полем, куди адміністратор вписує нову ціну за десять секунд."),
  p("Технічно CMS робить одну річ: відділяє **контент** від **оформлення**. Тексти, фото й ціни лежать у базі даних, а шаблон знає, як їх показати відвідувачу. Ви міняєте дані — сторінка перемальовується сама. Саме тому в нормально налаштованій системі редактор не може «випадково зламати дизайн»: у нього немає доступу до того, що малює сторінку."),

  h2("З чого складається будь-яка CMS"),
  li("**Сховище контенту** — база, де лежать статті, послуги, товари, переклади."),
  li("**Редактор** — інтерфейс із полями й кнопкою «Опублікувати». Те, що зазвичай називають адмінкою."),
  li("**Шар видачі** — частина, яка збирає зі сховища готову сторінку для відвідувача."),
  p("У коробкових системах усі три частини — один моноліт: база, редактор і сайт живуть в одному застосунку. У headless третя частина винесена окремо, і контент передається на сайт через [API](/blog/shcho-take-api). Звідси беруться і всі плюси, і всі мінуси підходу."),

  h2("Три типи CMS: коробкові, headless, конструктори"),
  p("Вибір CMS — це насправді вибір із трьох різних моделей, а не з тридцяти назв. Ось як вони виглядають з точки зору власника бізнесу, а не розробника."),
  table(
    ["Тип", "Кому підходить", "Плюси", "Ризики"],
    [
      [
        "Коробкові: WordPress, OpenCart",
        "Блог, невеликий магазин, бюджет до $1 000",
        "Дешевий старт, тисячі шаблонів і плагінів, легко знайти виконавця",
        "Плагіни конфліктують між собою, оновлення ніхто не ставить, швидкість падає з роками, найчастіша ціль зламів",
      ],
      [
        "Headless: Sanity, Strapi",
        "Бізнес, що росте: кілька мов, каталог, інтеграції, застосунок",
        "Контент окремо від коду, один контент на сайт і застосунок, сайт лишається швидким, редактор не ламає вьорстку",
        "Потрібен розробник на старті, немає сценарію «встановив плагін за п'ять хвилин»",
      ],
      [
        "Конструктори: Tilda, Wix",
        "Перевірка ідеї, лендінг, подія, портфоліо",
        "Запуск за вихідні, нічого не треба адмініструвати, передбачувана абонплата",
        "Ви орендар: підписка назавжди, ліміти на SEO і швидкість, переїзд означає переписати сайт з нуля",
      ],
    ],
  ),
  p("Ціна помилки тут не в грошах на старті, а у вартості виходу. Сайт із конструктора не переносять — його роблять заново. Те саме з WordPress, обвішаним тридцятьма плагінами. Розгорнуте порівняння підходів ми зібрали окремо: [Next.js проти WordPress і конструкторів](/vs-wordpress)."),

  h2("Чому ми працюємо на headless Sanity"),
  p("Це не питання моди: у headless-моделі зникає більшість причин, через які клієнти повертаються до нас із чужими сайтами."),
  li("**Контент окремо від коду.** Редактор працює з полями «Заголовок», «Ціна», «Фото», а не з блоками вьорстки. Зламати сітку сторінки через адмінку фізично неможливо — таких кнопок там немає."),
  li("**Один контент — кілька каналів.** Той самий опис послуги йде на сайт, у мобільний застосунок і в розсилку. Не треба правити в трьох місцях і не буває розбіжностей."),
  li("**Сайт лишається швидким.** Сторінки збираються заздалегідь і віддаються як статика, тому CMS не бере участі в завантаженні сторінки для відвідувача — на відміну від WordPress, який будує сторінку в момент запиту."),
  li("**Двомовність не розсинхронізується.** Українська й англійська версії лежать полями одного документа, тож не буває ситуації «ціну оновили українською, а англійською забули»."),
  p("Мінус теж є, і ми його називаємо чесно: headless потребує розробника на етапі запуску. Ви не встановите таку систему самі за вечір. Тому вона й входить у проєкти, які ми ведемо, а не продається окремою коробкою."),

  h2("Чи потрібна CMS взагалі"),
  p("Чесна відповідь: не завжди. Лендінгу з однією офертою CMS частіше шкодить, ніж допомагає — текст там міняють раз на квартал, а система додає ще один рухомий елемент, який треба оновлювати й адмініструвати. Лендінг від $800 ми зазвичай віддаємо без адмінки: точкові правки виходять дешевшими."),
  p("CMS потрібна там, де контент живий: новини, блог, каталог, ціни, вакансії, кілька мов, кілька людей із доступом. У наших проєктах від $2 500 вона входить у пакет — зокрема в [корпоративний сайт](/corporate-site) від $2 500. Окремої статті «налаштування адмінки» в рахунку не буває."),

  h2("Чотири помилки, які дорого коштують"),
  num("**Плагін на кожну задачу.** Тридцять плагінів — це тридцять чужих кодових баз усередині вашого сайту. Кожна може зламатися, сповільнити сторінку або відкрити діру. Половину з них зазвичай ставили «щоб подивитися» і забули."),
  num("**Оновлення ніхто не ставить.** Сайт запустили, підрядник пішов, версія системи лишилася торішньою. Через рік це вже не сайт, а відкриті двері: зламані WordPress-сайти в 2026-му — це майже завжди старе ядро або старий плагін."),
  num("**Доступи тільки у підрядника.** Класика: домен, хостинг і адмінка оформлені на агентство. Поки все добре — зручно. Коли розходитесь — виявляється, що сайт вам не належить. Адміністративний доступ має бути на вашій пошті з першого дня."),
  num("**Редактор із правами адміністратора.** Контент-менеджеру не потрібні права ставити плагіни й міняти шаблон. Ролі розділяються за п'ять хвилин при запуску й економлять один аварійний вечір на рік."),

  cta(
    "Не впевнені, яка CMS потрібна вашому сайту?",
    "Опишіть задачу — скажемо, чи потрібна вам адмінка взагалі, і скільки коштуватиме проєкт із нею.",
    "Розрахувати вартість",
    "/calculator",
  ),

  p("Коротко про головне: CMS — це не сайт і не дизайн, а спосіб керувати вмістом. Питання не «яка CMS найкраща», а «скільки контенту у вас реально змінюється і хто цим займатиметься». Відповідь на нього одразу відсікає два варіанти з трьох."),
];

/* ------------------------------------------------------------------ RU */

const bodyRu = [
  tldr("Коротко", [
    "CMS — система управления контентом: вы сами добавляете тексты, товары, цены и фото, не трогая код.",
    "Три класса систем: коробочные (WordPress, OpenCart), headless (Sanity, Strapi), конструкторы (Tilda, Wix).",
    "Коробочные дёшевы на старте и дороги в поддержке: плагины, обновления, безопасность.",
    "Мы работаем на headless Sanity: контент отдельно от кода, редактор не сломает вёрстку, сайт остаётся быстрым.",
    "Лендингу CMS часто не нужна. В проектах от $2 500 она входит в пакет.",
  ]),

  p("CMS — это система управления контентом сайта: программа, в которой вы сами добавляете и редактируете тексты, товары, цены и изображения, не открывая код и не вызывая разработчика. Аббревиатура расшифровывается как Content Management System. Простыми словами: без CMS каждая правка на сайте — задача программисту, с CMS — пять минут в понятном интерфейсе."),
  p("Ниже — чем CMS отличается от конструктора, какие три типа существуют, в чём реальная разница между коробочным WordPress и headless-системой, и когда CMS вашему сайту вообще не нужна."),
  p("Если вам интересна не сама идея, а конкретный интерфейс — как выглядит админка изнутри, какие там кнопки и что можно нажать по ошибке, — об этом есть отдельная статья: [как работает админ-панель сайта](/ru/blog/kak-rabotaet-admin-panel-sayta). Здесь мы говорим о CMS как о классе систем и о выборе между ними."),

  h2("Что такое CMS простыми словами"),
  p("Сайт без CMS — это меню, отпечатанное в типографии. Поменялась цена на кофе — нужно заново верстать макет, печатать и везти. Сайт с CMS — та же вывеска, но с полем, куда администратор вписывает новую цену за десять секунд."),
  p("Технически CMS делает одну вещь: отделяет **контент** от **оформления**. Тексты, фото и цены лежат в базе данных, а шаблон знает, как показать их посетителю. Вы меняете данные — страница перерисовывается сама. Именно поэтому в нормально настроенной системе редактор не может «случайно сломать дизайн»: у него нет доступа к тому, что рисует страницу."),

  h2("Из чего состоит любая CMS"),
  li("**Хранилище контента** — база, где лежат статьи, услуги, товары, переводы."),
  li("**Редактор** — интерфейс с полями и кнопкой «Опубликовать». То, что обычно называют админкой."),
  li("**Слой выдачи** — часть, которая собирает из хранилища готовую страницу для посетителя."),
  p("В коробочных системах все три части — один монолит: база, редактор и сайт живут в одном приложении. В headless третья часть вынесена отдельно, а контент передаётся на сайт через [API](/ru/blog/chto-takoe-api). Отсюда берутся и все плюсы, и все минусы подхода."),

  h2("Три типа CMS: коробочные, headless, конструкторы"),
  p("Выбор CMS — это на самом деле выбор из трёх моделей, а не из тридцати названий. Вот как они выглядят с точки зрения владельца бизнеса, а не разработчика."),
  table(
    ["Тип", "Кому подходит", "Плюсы", "Риски"],
    [
      [
        "Коробочные: WordPress, OpenCart",
        "Блог, небольшой магазин, бюджет до $1 000",
        "Дешёвый старт, тысячи шаблонов и плагинов, легко найти исполнителя",
        "Плагины конфликтуют друг с другом, обновления никто не ставит, скорость падает с годами, самая частая цель взломов",
      ],
      [
        "Headless: Sanity, Strapi",
        "Растущий бизнес: несколько языков, каталог, интеграции, приложение",
        "Контент отдельно от кода, один контент на сайт и приложение, сайт остаётся быстрым, редактор не ломает вёрстку",
        "Нужен разработчик на старте, нет сценария «поставил плагин за пять минут»",
      ],
      [
        "Конструкторы: Tilda, Wix",
        "Проверка идеи, лендинг, мероприятие, портфолио",
        "Запуск за выходные, ничего не нужно администрировать, предсказуемая абонплата",
        "Вы арендатор: подписка навсегда, лимиты по SEO и скорости, переезд означает переписать сайт с нуля",
      ],
    ],
  ),
  p("Цена ошибки здесь не в деньгах на старте, а в стоимости выхода. Сайт из конструктора не переносят — его делают заново. То же с WordPress, обвешанным тридцатью плагинами. Развёрнутое сравнение подходов мы собрали отдельно: [Next.js против WordPress и конструкторов](/ru/vs-wordpress)."),

  h2("Почему мы работаем на headless Sanity"),
  p("Это не вопрос моды: в headless-модели исчезает большинство причин, по которым клиенты приходят к нам с чужими сайтами на переделку."),
  li("**Контент отдельно от кода.** Редактор работает с полями «Заголовок», «Цена», «Фото», а не с блоками вёрстки. Сломать сетку страницы через админку физически невозможно — таких кнопок там нет."),
  li("**Один контент — несколько каналов.** То же описание услуги идёт на сайт, в мобильное приложение и в рассылку. Не нужно править в трёх местах, и не бывает расхождений."),
  li("**Сайт остаётся быстрым.** Страницы собираются заранее и отдаются как статика, поэтому CMS не участвует в загрузке страницы для посетителя — в отличие от WordPress, который собирает страницу в момент запроса."),
  li("**Двуязычность не рассинхронизируется.** Русская и английская версии лежат полями одного документа, так что не бывает ситуации «цену обновили на одном языке, на втором забыли»."),
  p("Минус тоже есть, и мы называем его честно: headless требует разработчика на этапе запуска. Такую систему вы не поставите сами за вечер. Поэтому она и входит в проекты, которые мы ведём, а не продаётся отдельной коробкой."),

  h2("Нужна ли CMS вообще"),
  p("Честный ответ: не всегда. Лендингу с одной оффертой CMS чаще вредит, чем помогает — текст там меняют раз в квартал, а система добавляет ещё один движущийся элемент, который нужно обновлять и администрировать. Лендинг от $800 мы обычно отдаём без админки: точечные правки выходят дешевле."),
  p("CMS нужна там, где контент живой: новости, блог, каталог, цены, вакансии, несколько языков, несколько человек с доступом. В наших проектах от $2 500 она входит в пакет — в том числе в [корпоративный сайт](/ru/corporate-site) от $2 500. Отдельной строки «настройка админки» в счёте не бывает."),

  h2("Четыре ошибки, которые дорого стоят"),
  num("**Плагин на каждую задачу.** Тридцать плагинов — это тридцать чужих кодовых баз внутри вашего сайта. Каждая может сломаться, замедлить страницу или открыть дыру. Половину обычно ставили «посмотреть» и забыли."),
  num("**Обновления никто не ставит.** Сайт запустили, подрядчик ушёл, версия системы осталась прошлогодней. Через год это уже не сайт, а открытая дверь: взломанные WordPress-сайты в 2026-м — почти всегда старое ядро или старый плагин."),
  num("**Доступы только у подрядчика.** Классика: домен, хостинг и админка оформлены на агентство. Пока всё хорошо — удобно. Когда расходитесь — выясняется, что сайт вам не принадлежит. Административный доступ должен быть на вашей почте с первого дня."),
  num("**Редактор с правами администратора.** Контент-менеджеру не нужны права ставить плагины и менять шаблон. Роли разделяются за пять минут при запуске и экономят один аварийный вечер в год."),

  cta(
    "Не уверены, какая CMS нужна вашему сайту?",
    "Опишите задачу — скажем, нужна ли вам админка вообще и сколько будет стоить проект с ней.",
    "Рассчитать стоимость",
    "/ru/calculator",
  ),

  p("Коротко о главном: CMS — это не сайт и не дизайн, а способ управлять содержимым. Вопрос не «какая CMS лучше», а «сколько контента у вас реально меняется и кто будет этим заниматься». Ответ на него сразу отсекает два варианта из трёх."),
];

/* ------------------------------------------------------------------ EN */

const bodyEn = [
  tldr("In short", [
    "A CMS is a content management system: you edit text, products, prices and images yourself, without touching code.",
    "Three classes: boxed (WordPress, OpenCart), headless (Sanity, Strapi), builders (Tilda, Wix).",
    "Boxed systems are cheap to start and expensive to maintain: plugins, updates, security.",
    "We build on headless Sanity: content sits apart from code, editors cannot break the layout, the site stays fast.",
    "A landing page often needs no CMS at all. On projects from $2,500 it is included.",
  ]),

  p("A CMS is a content management system — software that lets you add and edit your website's text, products, prices and images yourself, without opening the code or booking a developer. Without one, every edit is a ticket for a programmer; with one, it is five minutes in a form."),
  p("Below: the three types that exist, the real difference between boxed WordPress and a headless system, and when your site does not need a CMS at all. If you are after the interface rather than the concept — what the admin area looks like and what you can click by mistake — we cover that in [how a website admin panel works](/en/blog/how-website-admin-panel-works)."),

  h2("What a CMS is, in plain words"),
  p("A site without a CMS is a menu printed at a print shop: the price of coffee changes and you redo the layout, print it and deliver it. A site with a CMS is the same sign with a field where a manager types the new price."),
  p("Technically a CMS does one thing: it separates **content** from **presentation**. Text, photos and prices live in a database; the template knows how to display them. That is why, in a properly set up system, an editor cannot accidentally break the design — they have no access to the part that draws the page."),

  h2("What every CMS is made of"),
  li("**Content store** — the database holding articles, services, products and translations."),
  li("**Editor** — fields and a Publish button. What people usually call the admin panel."),
  li("**Delivery layer** — the part that turns stored content into a finished page for the visitor."),
  p("In boxed systems all three live inside one application. In headless systems the delivery layer is separate and content reaches the site through an [API](/en/blog/what-is-an-api). Every advantage and drawback of the approach follows from that."),

  h2("Three types of CMS: boxed, headless, builders"),
  p("Choosing a CMS is really choosing between three models, not thirty brand names. Here is how they look to a business owner rather than a developer."),
  table(
    ["Type", "Who it suits", "Strengths", "Risks"],
    [
      [
        "Boxed: WordPress, OpenCart",
        "A blog, a small shop, a budget under $1,000",
        "Cheap to start, thousands of themes and plugins, easy to find someone to work on it",
        "Plugins conflict, updates go unapplied, speed decays over the years, the most common target for hacks",
      ],
      [
        "Headless: Sanity, Strapi",
        "A growing business: several languages, a catalogue, integrations, an app",
        "Content separate from code, one content set for site and app, stays fast, editors cannot break the layout",
        "Needs a developer at launch, no five-minute plugin route",
      ],
      [
        "Builders: Tilda, Wix",
        "Testing an idea, a landing page, an event, a portfolio",
        "Live in a weekend, nothing to administer, predictable monthly fee",
        "You are a tenant: the subscription never ends, SEO and speed are capped, moving out means a rebuild",
      ],
    ],
  ),
  p("The cost of getting this wrong is not the launch budget — it is the cost of leaving. A builder site is not migrated, it is rebuilt, and the same goes for a WordPress install carrying thirty plugins. We compare the approaches in [Next.js versus WordPress and website builders](/en/vs-wordpress)."),

  h2("Why we build on headless Sanity"),
  p("Not a fashion choice: the headless model removes most of the reasons clients bring us someone else's website to rescue."),
  li("**Content sits apart from code.** Editors work with fields named Title, Price and Photo, not layout blocks. Breaking the page grid from the admin area is impossible — the buttons for it do not exist."),
  li("**One content set, several channels.** The same service description feeds the website, the app and the newsletter. Nothing to update in three places, nothing to drift out of sync."),
  li("**The site stays fast.** Pages are built ahead of time and served as static files, so the CMS plays no part in a visitor's page load — unlike WordPress, which assembles the page on every request."),
  li("**Multilingual content stays aligned.** Ukrainian and English are fields on the same document, so you cannot update a price in one language and forget the other."),
  p("There is a trade-off, and we state it plainly: headless needs a developer at launch — you will not set it up yourself in an evening. That is why it comes with the projects we build rather than being sold as a box."),

  h2("Does your site need a CMS at all?"),
  p("Honestly, not always. For a single-offer landing page a CMS usually costs more than it saves — the copy changes once a quarter, and the system adds one more moving part to keep updated. A landing page from $800 normally ships without an admin area."),
  p("You need a CMS when content is alive: news, a blog, a catalogue, prices, vacancies, several languages, several people with access. On our projects from $2,500 it is part of the package, including a [corporate website](/en/corporate-site) from $3,500 — never a separate line item."),

  h2("Four mistakes that get expensive"),
  num("**A plugin for every task.** Thirty plugins means thirty other people's codebases inside your website. Any of them can break, slow the site down or open a hole — and half were installed to try something and never removed."),
  num("**Nobody applies updates.** The site launches, the contractor moves on, the version stays where it was. A year later it is an open door: hacked WordPress sites in 2026 are almost always an outdated core or plugin."),
  num("**Only the agency holds the access.** Domain, hosting and admin login all registered to the contractor. Fine while the relationship lasts; when it ends you discover the site is not yours. Administrative access belongs in your inbox from day one."),
  num("**Editors with admin rights.** A content manager does not need permission to install plugins or edit templates. Splitting the roles takes five minutes at launch and saves one emergency evening a year."),

  cta(
    "Not sure which CMS your site needs?",
    "Tell us what the site has to do — we will say whether you need an admin area at all, and what the build costs.",
    "Estimate my project",
    "/en/calculator",
  ),

  p("The short version: a CMS is not the website and not the design — it is how you manage what is on it. The useful question is not which CMS is best, but how much of your content actually changes and who will be changing it."),
];

/* ------------------------------------------------------------------ doc */

const doc = {
  _id: "glos2026-shcho-take-cms",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 5,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-cms" },
    ru: { _type: "slug", current: "chto-takoe-cms" },
    en: { _type: "slug", current: "what-is-a-cms" },
  },
  title: {
    _type: "localizedString",
    uk: "CMS — що це таке і навіщо вона сайту",
    ru: "CMS — что это такое и зачем она сайту",
    en: "What is a CMS and does your website need one?",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "CMS — що це і навіщо вона сайту",
    ru: "CMS — что это и зачем она сайту",
    en: "What Is a CMS and Does Your Site Need One?",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ CMS — це система керування контентом сайту. ✔️ Типи: коробкові, headless, конструктори ✔️ Плюси й ризики кожного ➡ що обрати бізнесу.",
    ru: "➤ CMS — это система управления контентом сайта. ✔️ Типы: коробочные, headless, конструкторы ✔️ Плюсы и риски каждого ➡ что выбрать бизнесу.",
    en: "➤ A CMS is the system that stores and edits your website content. ✔️ Boxed, headless and builders compared ✔️ Pros and risks ➡ what to pick.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Словник",
    ru: "Словарь",
    en: "Glossary",
  },
  lede: {
    _type: "localizedString",
    uk: "Коротке визначення без Вікіпедії: що таке CMS, які бувають типи, чому ми будуємо сайти на headless Sanity і коли адмінка вам не потрібна.",
    ru: "Короткое определение без Википедии: что такое CMS, какие бывают типы, почему мы строим сайты на headless Sanity и когда админка вам не нужна.",
    en: "A short, honest definition: what a CMS is, the three types that exist, why we build on headless Sanity, and when you do not need an admin area at all.",
  },
  tags: ["CMS", "headless", "Sanity"],
  relatedPostSlugs: ["yak-pratsyuye-admin-panel-saytu", "shcho-take-api", "nextjs-proty-wordpress-ta-konstruktoriv"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чим CMS відрізняється від конструктора сайтів?",
        ru: "Чем CMS отличается от конструктора сайтов?",
        en: "How is a CMS different from a website builder?",
      },
      answer: {
        _type: "localizedText",
        uk: "Конструктор — це теж CMS, але разом із хостингом, шаблонами й обмеженнями в одному пакеті, який ви орендуєте. Повноцінна CMS керує контентом сайту, який належить вам: код, дані й домен можна забрати й перенести. Головна різниця не в інтерфейсі, а у вартості виходу.",
        ru: "Конструктор — это тоже CMS, но вместе с хостингом, шаблонами и ограничениями в одном арендуемом пакете. Полноценная CMS управляет контентом сайта, который принадлежит вам: код, данные и домен можно забрать и перенести. Главная разница не в интерфейсе, а в стоимости выхода.",
        en: "A builder is also a CMS, but bundled with hosting, templates and limits into one package you rent. A standalone CMS manages content on a site you own: the code, the data and the domain can all be taken elsewhere. The real difference is not the interface, it is the cost of leaving.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Яка CMS найкраща у 2026 році?",
        ru: "Какая CMS лучшая в 2026 году?",
        en: "Which CMS is best in 2026?",
      },
      answer: {
        _type: "localizedText",
        uk: "Універсальної відповіді немає — є відповідність задачі. Для блогу з невеликим бюджетом WordPress досі робочий варіант. Для бізнесу з каталогом, кількома мовами та інтеграціями ми беремо headless Sanity: сайт лишається швидким, а контент не залежить від шаблону. Для перевірки ідеї найдешевше — конструктор.",
        ru: "Универсального ответа нет — есть соответствие задаче. Для блога с небольшим бюджетом WordPress до сих пор рабочий вариант. Для бизнеса с каталогом, несколькими языками и интеграциями мы берём headless Sanity: сайт остаётся быстрым, а контент не зависит от шаблона. Для проверки идеи дешевле всего конструктор.",
        en: "There is no universal answer, only a fit for the job. For a small-budget blog WordPress still works. For a business with a catalogue, several languages and integrations we use headless Sanity: the site stays fast and the content does not depend on the template. For testing an idea, a builder is the cheapest route.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує CMS?",
        ru: "Сколько стоит CMS?",
        en: "How much does a CMS cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Самі системи здебільшого безкоштовні — платять за налаштування під ваш контент і за підтримку. У нас CMS входить у проєкти від $2 500, зокрема в корпоративний сайт від $2 500, окремо ми її не рахуємо. Конструктори працюють інакше: підписка $10–50 на місяць, і платити доводиться весь час, поки сайт живий.",
        ru: "Сами системы в большинстве бесплатны — платят за настройку под ваш контент и за поддержку. У нас CMS входит в пакеты от $2 500 — это корпоративный сайт, отдельно мы её не считаем. Конструкторы работают иначе: подписка $10–50 в месяц, и платить приходится всё время, пока сайт жив.",
        en: "Most systems are free in themselves — you pay for setting them up around your content and for support. With us a CMS is included on projects from $2,500, a corporate website from $3,500 among them, never as a separate line. Builders work differently: $10–50 a month, for as long as the site exists.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна перенести сайт з WordPress на headless CMS?",
        ru: "Можно ли перенести сайт с WordPress на headless CMS?",
        en: "Can a WordPress site be moved to a headless CMS?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, і це звична для нас задача. Контент — статті, товари, зображення — переноситься автоматично, а от дизайн і функціонал доводиться робити наново: шаблони WordPress не сумісні з headless. На практиці це той самий обсяг робіт, що й новий сайт, тому переїзд зазвичай суміщають із редизайном.",
        ru: "Да, и это привычная для нас задача. Контент — статьи, товары, изображения — переносится автоматически, а вот дизайн и функционал приходится делать заново: шаблоны WordPress несовместимы с headless. На практике это тот же объём работ, что и новый сайт, поэтому переезд обычно совмещают с редизайном.",
        en: "Yes, and it is routine work for us. The content — articles, products, images — migrates automatically, but the design and functionality have to be rebuilt, because WordPress themes are not compatible with headless. In practice that is the same scope as a new site, so the move is usually combined with a redesign.",
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
