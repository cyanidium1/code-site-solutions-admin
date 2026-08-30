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
    "SEO — це роботи над сайтом і навколо нього, які роблять його видимим у безплатній видачі Google.",
    "Складається з трьох частин: технічної, контентної та зовнішньої (згадки й посилання).",
    "Перші рухи в позиціях — 6–12 тижнів, стійкий трафік — 4–6 місяців. Швидше не буває.",
    "Реклама зупиняється разом із бюджетом, SEO працює далі, але й стартує повільніше.",
    "Найдорожчі помилки: закупівля посилань, накрутка поведінкових і очікування топу за місяць.",
  ]),
  p("**SEO (search engine optimization, пошукова оптимізація) — це набір робіт над сайтом і навколо нього, які підвищують його видимість у безплатній видачі Google.** Мета проста: щоб ваші сторінки з'являлися в результатах пошуку за запитами, які вводять клієнти, і приводили трафік, за кожен клік якого ви не платите окремо."),
  p("Ключове слово тут — «безплатній». SEO не купує покази. Воно робить сайт таким, щоб пошуковик сам вирішив показати його вище за конкурентів: технічно доступним, змістовно відповідним запиту і достатньо авторитетним, щоб йому довіряти."),
  p("Друге, що варто зрозуміти одразу: SEO — це не разова дія і не «налаштування». Це процес, у якому результат накопичується місяцями і так само поступово втрачається, якщо роботу зупинити."),

  h2("SEO простими словами"),
  p("Уявіть Google як бібліотекаря, який щодня переглядає мільярди сторінок і на кожне питання відвідувача дістає з полиці десять найкращих. Ваш сайт — одна з книжок. SEO — це робота над тим, щоб бібліотекар узагалі зміг вас знайти, зрозумів, про що ви, і вважав вас достатньо надійним, щоб рекомендувати."),
  p("Звідси три питання, на які відповідає будь-яка SEO-стратегія: чи може пошуковик технічно дістатися до сторінки, чи розуміє він, якому запиту вона відповідає, і чи є причини вважати ваш сайт вартим довіри. Усе інше — деталі цих трьох питань."),

  h2("З чого складається SEO"),
  p("Класично роботу ділять на три напрями. Вони не замінюють один одного: сайт із блискучими текстами, який не індексується, не отримає нічого, як і технічно ідеальний сайт без відповіді на запит користувача."),
  h3("Технічна оптимізація"),
  p("Це фундамент: чи бачить робот сторінки, чи швидко вони відкриваються, чи коректно працює мобільна версія, чи немає дублів і зламаних редиректів. Швидкість і стабільність інтерфейсу Google вимірює окремим набором метрик — ми розібрали їх у статті [що таке Core Web Vitals](/blog/shcho-take-core-web-vitals)."),
  h3("Контент і структура"),
  p("Тут вирішується, за якими саме запитами вас знайдуть. Збирається семантика, запити групуються за наміром користувача, під кожну групу є своя сторінка з нормальним заголовком, структурою і відповіддю на питання. Плюс перелінковка, яка передає вагу між сторінками."),
  h3("Зовнішні сигнали"),
  p("Згадки й посилання з інших сайтів, локальні профілі, каталоги, публікації. Це найповільніша частина і водночас та, де найлегше нашкодити — про це нижче."),
  table(
    ["Складова", "Що входить", "На що впливає"],
    [
      ["**Технічна**", "Індексація, швидкість, мобільна версія, структура URL, robots.txt і sitemap, редиректи, дублі", "Чи потрапить сторінка у видачу взагалі та чи не втрачає вона позиції на технічних дрібницях"],
      ["**Контентна**", "Семантика, групування запитів, структура сторінок, заголовки, метадані, перелінковка", "За якими запитами вас знаходять і чи знайшов користувач відповідь, чи повернувся у пошук"],
      ["**Зовнішня**", "Посилання й згадки з інших сайтів, PR, локальні профілі та каталоги", "Наскільки Google довіряє домену; швидкість просування в конкурентних темах"],
    ],
  ),

  h2("Скільки чекати результату"),
  p("Це питання, на якому найчастіше псуються стосунки з підрядником, тому відповідаємо чесно й без обіцянок."),
  num("**Тижні 1–4.** Технічні виправлення, збір семантики, перші правки сторінок. У видачі майже нічого не змінюється — це нормально."),
  num("**Тижні 6–12.** Перші рухи: сторінки заходять у топ-30, з'являються покази й кліки за низькочастотними запитами."),
  num("**Місяці 4–6.** Трафік зростає стійко, конкурентні запити починають підтягуватись, зростання перестає бути випадковим."),
  p("Терміни зсуваються в обидва боки. Молодий домен, конкурентна ніша або сайт після переїзду ростимуть повільніше; сайт із історією, куди просто давно ніхто не заглядав, іноді дає рух за місяць — за рахунок виправлення технічних помилок."),

  h2("Чим SEO відрізняється від контекстної реклами"),
  p("Це не конкуренти, а два різні інструменти з різною економікою."),
  li("**Швидкість.** Реклама дає трафік у день запуску. SEO — за місяці."),
  li("**Що буває після вимкнення.** Реклама зупиняється разом із бюджетом. Сторінки, які вийшли в топ, продовжують приводити людей і далі, хоча без підтримки поступово просідають."),
  li("**Вартість кліка.** У рекламі вона фіксована й зростає разом із конкуренцією. У SEO вартість залучення падає з часом, бо той самий вкладений ресурс працює на дедалі більший обсяг трафіку."),
  li("**Довіра.** Частина аудиторії свідомо гортає блок реклами й читає органічну видачу."),
  p("Робоча схема для більшості бізнесів — реклама на старті, поки SEO набирає обертів, і поступове перенесення бюджету в органіку. Що входить у роботи й від чого залежить бюджет — дивіться на сторінці [послуги SEO](/seo), а діапазони цін ми розібрали в окремій статті [про ціну просування сайту](/blog/prosuvannia-saitu-tsina-2026)."),

  h2("Три помилки, які коштують дорожче за саме SEO"),
  li("**Закупівля посилань пачками.** Швидкий приріст посилань із бірж — найпростіший спосіб отримати фільтр і потім пів року виходити з нього. Посилання мають з'являтися повільно й із сайтів, які мають до вас стосунок."),
  li("**Накрутка поведінкових факторів.** Ботові кліки у видачі виявляються, а санкції за них знімаються довго. Це купівля проблеми за власні гроші."),
  li("**Очікування топу за місяць.** Підрядник, який обіцяє позиції до конкретної дати, або продає накрутку, або торгує запитами, за якими вас і так знаходять."),
  p("Четверта, найтихіша помилка — робити SEO наосліп, не розуміючи стану сайту. Перед тим як щось замовляти, пройдіться базовим чеклістом: [SEO-аудит своїми руками](/blog/seo-audyt-svoimy-rukamy) займе годину й покаже, з чого починати."),

  cta(
    "Хочете зрозуміти, що заважає саме вашому сайту?",
    "Подивимося технічний стан, семантику й поточну видимість — і скажемо, з чого є сенс починати.",
    "Дізнатися про SEO-послугу",
    "/seo",
  ),
];

/* ─────────────────────────── RU ─────────────────────────── */

const bodyRu = [
  tldr("Коротко", [
    "SEO — это работы над сайтом и вокруг него, которые делают его видимым в бесплатной выдаче Google.",
    "Состоит из трёх частей: технической, контентной и внешней (упоминания и ссылки).",
    "Первые движения в позициях — 6–12 недель, устойчивый трафик — 4–6 месяцев.",
    "Реклама останавливается вместе с бюджетом, SEO продолжает работать, но и стартует медленнее.",
    "Самые дорогие ошибки: закупка ссылок, накрутка поведенческих и ожидание топа за месяц.",
  ]),
  p("**SEO (search engine optimization, поисковая оптимизация) — это набор работ над сайтом и вокруг него, которые повышают его видимость в бесплатной выдаче Google.** Цель простая: чтобы ваши страницы появлялись в результатах поиска по запросам, которые вводят клиенты, и приводили трафик, за каждый клик которого вы не платите отдельно."),
  p("Ключевое слово здесь — «бесплатной». SEO не покупает показы. Оно делает сайт таким, чтобы поисковик сам решил показать его выше конкурентов: технически доступным, содержательно отвечающим запросу и достаточно авторитетным, чтобы ему доверять."),
  p("Второе, что стоит понять сразу: SEO — это не разовое действие и не «настройка». Это процесс, в котором результат накапливается месяцами и так же постепенно теряется, если работу остановить."),

  h2("SEO простыми словами"),
  p("Представьте Google библиотекарем, который каждый день просматривает миллиарды страниц и на каждый вопрос посетителя достаёт с полки десять лучших. Ваш сайт — одна из книг. SEO — это работа над тем, чтобы библиотекарь вообще смог вас найти, понял, о чём вы, и счёл достаточно надёжным, чтобы рекомендовать."),
  p("Отсюда три вопроса, на которые отвечает любая SEO-стратегия: может ли поисковик технически добраться до страницы, понимает ли он, какому запросу она отвечает, и есть ли причины считать ваш сайт заслуживающим доверия. Всё остальное — детали этих трёх вопросов."),

  h2("Из чего состоит SEO"),
  p("Классически работу делят на три направления. Они не заменяют друг друга: сайт с блестящими текстами, который не индексируется, не получит ничего — как и технически идеальный сайт без ответа на запрос пользователя."),
  h3("Техническая оптимизация"),
  p("Это фундамент: видит ли робот страницы, быстро ли они открываются, корректно ли работает мобильная версия, нет ли дублей и сломанных редиректов. Скорость и стабильность интерфейса Google измеряет отдельным набором метрик — мы разобрали их в статье [что такое Core Web Vitals](/ru/blog/chto-takoe-core-web-vitals)."),
  h3("Контент и структура"),
  p("Здесь решается, по каким именно запросам вас найдут. Собирается семантика, запросы группируются по намерению пользователя, под каждую группу есть своя страница с нормальным заголовком, структурой и ответом на вопрос. Плюс перелинковка, которая передаёт вес между страницами."),
  h3("Внешние сигналы"),
  p("Упоминания и ссылки с других сайтов, локальные профили, каталоги, публикации. Это самая медленная часть и одновременно та, где легче всего навредить — об этом ниже."),
  table(
    ["Составляющая", "Что входит", "На что влияет"],
    [
      ["**Техническая**", "Индексация, скорость, мобильная версия, структура URL, robots.txt и sitemap, редиректы, дубли", "Попадёт ли страница в выдачу вообще и не теряет ли она позиции на технических мелочах"],
      ["**Контентная**", "Семантика, группировка запросов, структура страниц, заголовки, метаданные, перелинковка", "По каким запросам вас находят и нашёл ли пользователь ответ или вернулся в поиск"],
      ["**Внешняя**", "Ссылки и упоминания с других сайтов, PR, локальные профили и каталоги", "Насколько Google доверяет домену; скорость роста в конкурентных темах"],
    ],
  ),

  h2("Сколько ждать результата"),
  p("Это вопрос, на котором чаще всего портятся отношения с подрядчиком, поэтому отвечаем честно и без обещаний."),
  num("**Недели 1–4.** Технические исправления, сбор семантики, первые правки страниц. В выдаче почти ничего не меняется — это нормально."),
  num("**Недели 6–12.** Первые движения: страницы заходят в топ-30, появляются показы и клики по низкочастотным запросам."),
  num("**Месяцы 4–6.** Трафик растёт устойчиво, конкурентные запросы начинают подтягиваться, рост перестаёт быть случайным."),
  p("Сроки сдвигаются в обе стороны. Молодой домен, конкурентная ниша или сайт после переезда будут расти медленнее; сайт с историей, в который просто давно никто не заглядывал, иногда даёт движение за месяц — за счёт исправления технических ошибок."),

  h2("Чем SEO отличается от контекстной рекламы"),
  p("Это не конкуренты, а два разных инструмента с разной экономикой."),
  li("**Скорость.** Реклама даёт трафик в день запуска. SEO — через месяцы."),
  li("**Что бывает после отключения.** Реклама останавливается вместе с бюджетом. Страницы, вышедшие в топ, продолжают приводить людей и дальше, хотя без поддержки постепенно проседают."),
  li("**Стоимость клика.** В рекламе она фиксированная и растёт вместе с конкуренцией. В SEO стоимость привлечения падает со временем: тот же вложенный ресурс работает на всё больший объём трафика."),
  li("**Доверие.** Часть аудитории осознанно пролистывает блок рекламы и читает органическую выдачу."),
  p("Рабочая схема для большинства бизнесов — реклама на старте, пока SEO набирает обороты, и постепенный перенос бюджета в органику. Что входит в работы и от чего зависит бюджет — смотрите на странице [услуги SEO](/ru/seo), а диапазоны цен мы разобрали в отдельной статье [о цене продвижения сайта](/ru/blog/prodvizhenie-sayta-cena-2026)."),

  h2("Три ошибки, которые обходятся дороже самого SEO"),
  li("**Закупка ссылок пачками.** Быстрый прирост ссылок с бирж — самый простой способ получить фильтр и потом полгода из него выходить. Ссылки должны появляться медленно и с сайтов, которые имеют к вам отношение."),
  li("**Накрутка поведенческих факторов.** Ботовые клики в выдаче выявляются, а санкции за них снимаются долго. Это покупка проблемы за собственные деньги."),
  li("**Ожидание топа за месяц.** Подрядчик, обещающий позиции к конкретной дате, либо продаёт накрутку, либо торгует запросами, по которым вас и так находят."),
  p("Четвёртая, самая тихая ошибка — делать SEO вслепую, не понимая состояния сайта. Прежде чем что-то заказывать, пройдитесь базовым чеклистом: [SEO-аудит своими руками](/ru/blog/seo-audit-svoimi-rukami) займёт час и покажет, с чего начинать."),

  cta(
    "Хотите понять, что мешает именно вашему сайту?",
    "Посмотрим техническое состояние, семантику и текущую видимость — и скажем, с чего есть смысл начинать.",
    "Узнать об SEO-услуге",
    "/ru/seo",
  ),
];

/* ─────────────────────────── EN ─────────────────────────── */

const bodyEn = [
  tldr("In short", [
    "SEO is the work on and around a website that makes it visible in Google's unpaid search results.",
    "It has three parts: technical, content, and external signals such as links and mentions.",
    "First movement in rankings takes 6–12 weeks; steady traffic takes 4–6 months.",
    "Ads stop the day the budget stops. SEO keeps working, but it also starts far more slowly.",
    "The costly mistakes: bulk link buying, faking user behaviour, and expecting page one in a month.",
  ]),
  p("**SEO — search engine optimisation — is the set of activities on and around a website that increase its visibility in Google's unpaid search results.** The goal is simple: your pages show up for the queries your customers actually type, and bring traffic you are not paying for click by click."),
  p("The important word is «unpaid». SEO does not buy impressions. It makes the site something the search engine chooses to rank above competitors: technically reachable, genuinely relevant to the query, and trustworthy enough to recommend."),
  p("The second thing worth knowing straight away: SEO is not a one-off task or a setting you switch on. It is a process whose results build up over months and fade just as gradually once the work stops."),

  h2("SEO in plain English"),
  p("Picture Google as a librarian who reads billions of pages every day and, for every question, pulls the ten best books off the shelf. Your website is one of those books. SEO is the work of making sure the librarian can find you at all, understands what you are about, and considers you reliable enough to recommend."),
  p("That gives you the three questions every SEO strategy answers: can the crawler technically reach the page, does it understand which query the page answers, and is there any reason to treat the site as trustworthy. Everything else is detail underneath those three."),

  h2("What SEO is made of"),
  p("The work is usually split into three areas, and they do not substitute for one another. A site with brilliant copy that cannot be indexed earns nothing — and so does a technically flawless site that never answers the question behind the query."),
  h3("Technical optimisation"),
  p("The foundation: can the crawler reach your pages, do they load quickly, does the mobile version behave, are there duplicates or broken redirects. Google measures loading speed and interface stability with a specific set of metrics — we covered them in [what Core Web Vitals are](/en/blog/what-is-core-web-vitals)."),
  h3("Content and structure"),
  p("This is where it is decided which queries you are found for. You build the keyword map, group queries by user intent, and give each group its own page with a sensible heading, a clear structure and an actual answer — plus internal links that pass weight between pages."),
  h3("External signals"),
  p("Links and mentions from other websites, local profiles, directories, press coverage. It is the slowest part of the job and also the easiest one to damage yourself with, as the next section explains."),
  table(
    ["Area", "What it covers", "What it affects"],
    [
      ["**Technical**", "Indexing, speed, mobile rendering, URL structure, robots.txt and sitemap, redirects, duplicates", "Whether a page can rank at all, and whether it quietly loses positions to technical debt"],
      ["**Content**", "Keyword research, intent grouping, page structure, headings, metadata, internal linking", "Which queries you are found for, and whether the visitor got an answer or went back to search"],
      ["**External**", "Links and mentions from other sites, PR, local profiles and directories", "How much Google trusts the domain, and how quickly you can move in competitive topics"],
    ],
  ),

  h2("How long results take"),
  p("This is the question that ruins most client relationships, so here is the honest version with no promises attached."),
  num("**Weeks 1–4.** Technical fixes, keyword research, first edits to pages. Almost nothing changes in search results, and that is normal."),
  num("**Weeks 6–12.** First movement: pages enter the top 30, impressions and clicks appear for long-tail queries."),
  num("**Months 4–6.** Traffic grows steadily, competitive queries start to climb, and the growth stops looking accidental."),
  p("Timelines shift both ways. A new domain, a crowded niche or a site that has just been migrated will move more slowly. An older site nobody has looked after for years sometimes moves within a month, purely from fixing technical errors."),

  h2("SEO versus paid search"),
  p("They are not rivals. They are two tools with completely different economics."),
  li("**Speed.** Ads deliver traffic on launch day. SEO delivers in months."),
  li("**What happens when you stop.** Ads stop with the budget. Pages that reached the top keep bringing visitors, although they slide gradually without maintenance."),
  li("**Cost per click.** In ads it is fixed and rises with competition. In SEO the cost of acquisition falls over time, because the same invested work serves a growing volume of traffic."),
  li("**Trust.** A share of the audience deliberately scrolls past the ad block and reads the organic results."),
  p("For most businesses the working pattern is ads at the start, while SEO gains momentum, then a gradual shift of budget into organic. What the work includes and what drives the budget is on our [SEO service page](/en/seo), and we broke the price ranges down separately in [what SEO costs](/en/blog/seo-pricing-uk-2026)."),

  h2("Three mistakes that cost more than the SEO itself"),
  li("**Buying links in bulk.** A sudden spike of marketplace links is the fastest route to a penalty and six months of digging your way out. Links should appear slowly, from sites that have something to do with you."),
  li("**Faking user behaviour.** Bot clicks in search results get detected, and the penalties take a long time to lift. You are paying money to buy yourself a problem."),
  li("**Expecting page one within a month.** An agency promising rankings by a fixed date is either selling manipulation or selling you queries you already rank for."),
  p("The fourth and quietest mistake is doing SEO blind, without knowing the state of the site. Before commissioning anything, run through the basics: a [DIY SEO audit](/en/blog/diy-seo-audit-20-checks) takes an hour and tells you where to start."),

  cta(
    "Want to know what is holding your own site back?",
    "We will look at the technical state, the keyword coverage and your current visibility, then tell you where to start.",
    "See the SEO service",
    "/en/seo",
  ),
];

const doc = {
  _id: "glos2026-shcho-take-seo",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 6,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-seo" },
    ru: { _type: "slug", current: "chto-takoe-seo" },
    en: { _type: "slug", current: "what-is-seo" },
  },
  title: {
    _type: "localizedString",
    uk: "SEO — що це і як воно працює",
    ru: "SEO — что это и как оно работает",
    en: "What is SEO and how it actually works",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "SEO це: що таке SEO простими словами",
    ru: "SEO это: что такое SEO простыми словами",
    en: "What Is SEO: A Plain-English Explanation",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ SEO — це оптимізація сайту під пошук Google. ✔️ Три складові: технічна, контентна, зовнішня ✔️ Чесні строки результату ➡ пояснюємо без води.",
    ru: "➤ SEO — это оптимизация сайта под поиск Google. ✔️ Три составляющие: техника, контент, ссылки ✔️ Честные сроки результата ➡ объясняем без воды.",
    en: "➤ SEO is the work that makes a site visible in Google. ✔️ Technical, content and links ✔️ Honest timelines ➡ a plain-English definition.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Словник",
    ru: "Словарь",
    en: "Glossary",
  },
  lede: {
    _type: "localizedString",
    uk: "Що таке SEO, з чого воно складається, скільки чекати результату і чим воно відрізняється від реклами — коротке чесне пояснення без термінів і без обіцянок.",
    ru: "Что такое SEO, из чего оно состоит, сколько ждать результата и чем оно отличается от рекламы — короткое честное объяснение без терминов и обещаний.",
    en: "What SEO is, what it consists of, how long results take and how it differs from paid ads — a short, honest explanation without jargon or promises.",
  },
  tags: ["SEO", "словник", "просування сайту"],
  relatedPostSlugs: ["prosuvannia-saitu-tsina-2026", "seo-audyt-svoimy-rukamy", "shcho-take-core-web-vitals"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що таке SEO простими словами?",
        ru: "Что такое SEO простыми словами?",
        en: "What is SEO in simple terms?",
      },
      answer: {
        _type: "localizedText",
        uk: "SEO — це роботи, які роблять сайт зрозумілим для Google і корисним для людини, щоб він з'являвся у безплатній видачі за запитами клієнтів. Це не купівля показів: пошуковик сам вирішує показати сайт вище, якщо той технічно доступний, відповідає запиту й викликає довіру.",
        ru: "SEO — это работы, которые делают сайт понятным для Google и полезным для человека, чтобы он появлялся в бесплатной выдаче по запросам клиентов. Это не покупка показов: поисковик сам решает показать сайт выше, если тот технически доступен, отвечает запросу и вызывает доверие.",
        en: "SEO is the work that makes a website understandable to Google and useful to a person, so it appears in unpaid search results for your customers' queries. You are not buying impressions: the search engine decides to rank you higher when the site is reachable, relevant and trustworthy.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу потрібно, щоб SEO дало результат?",
        ru: "Сколько времени нужно, чтобы SEO дало результат?",
        en: "How long does SEO take to work?",
      },
      answer: {
        _type: "localizedText",
        uk: "Перші рухи в позиціях зазвичай видно через 6–12 тижнів, стійке зростання трафіку — через 4–6 місяців. Молодий домен або конкурентна ніша розтягують ці строки. Якщо підрядник обіцяє топ за місяць — це або накрутка, або запити, за якими вас і так знаходять.",
        ru: "Первые движения в позициях обычно видны через 6–12 недель, устойчивый рост трафика — через 4–6 месяцев. Молодой домен или конкурентная ниша растягивают эти сроки. Если подрядчик обещает топ за месяц — это либо накрутка, либо запросы, по которым вас и так находят.",
        en: "First movement in rankings usually shows after 6–12 weeks, and steady traffic growth after 4–6 months. A new domain or a competitive niche stretches that further. Anyone promising page one within a month is selling either manipulation or queries you already rank for.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чим SEO відрізняється від контекстної реклами?",
        ru: "Чем SEO отличается от контекстной рекламы?",
        en: "How is SEO different from paid ads?",
      },
      answer: {
        _type: "localizedText",
        uk: "Реклама дає трафік у день запуску й зупиняється разом із бюджетом. SEO стартує повільно, зате сторінки, які вийшли в топ, продовжують приводити людей і після завершення активних робіт. Для більшості бізнесів робоча схема — реклама на старті, поки органіка набирає обертів.",
        ru: "Реклама даёт трафик в день запуска и останавливается вместе с бюджетом. SEO стартует медленно, зато страницы, вышедшие в топ, продолжают приводить людей и после завершения активных работ. Для большинства бизнесов рабочая схема — реклама на старте, пока органика набирает обороты.",
        en: "Ads bring traffic on launch day and stop the moment the budget does. SEO starts slowly, but pages that reach the top keep bringing visitors after the active work ends. For most businesses the sensible pattern is paid search at the start while organic gains momentum.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Від чого залежить вартість SEO?",
        ru: "От чего зависит стоимость SEO?",
        en: "What does the cost of SEO depend on?",
      },
      answer: {
        _type: "localizedText",
        uk: "Від конкурентності ніші, розміру сайту, його технічного стану й обсягу робіт щомісяця. Одна річ — навести лад на лендінгу, інша — вести інтернет-магазин на тисячі сторінок. Склад робіт описаний на сторінці послуги SEO, а діапазони цін ми розібрали в окремій статті про ціну просування сайту.",
        ru: "От конкурентности ниши, размера сайта, его технического состояния и объёма ежемесячных работ. Одно дело навести порядок на лендинге, другое — вести интернет-магазин на тысячи страниц. Состав работ описан на странице услуги SEO, а диапазоны цен мы разобрали в отдельной статье о цене продвижения сайта.",
        en: "On how competitive the niche is, how large the site is, what technical shape it is in, and how much work runs each month. Tidying up a landing page is one job; running a store with thousands of pages is another. The scope is on our SEO service page, and the price ranges are covered in a separate article.",
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
