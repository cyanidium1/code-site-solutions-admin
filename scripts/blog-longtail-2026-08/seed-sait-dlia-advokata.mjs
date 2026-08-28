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

const BODY_UK = [
  tldr("Коротко: сайт для адвоката за 60 секунд", [
    "Сайт для адвоката — це насамперед інструмент довіри: Google відносить юридичні сайти до YMYL і оцінює їх суворіше, ніж звичайні.",
    "Обов'язкова структура: кожна практика — окремою сторінкою, профіль адвоката з номером свідоцтва, кейси з результатами, запис на консультацію.",
    "Візитка приватного адвоката коштує від $800 і 2–3 тижні; сайт юридичної фірми — від $3 500 і 4–8 тижнів.",
    "Кейси публікуємо тільки знеособлено і за згодою клієнта — адвокатська таємниця і Правила адвокатської етики жорсткіші, ніж здається.",
    "Найшвидший канал клієнтів — локальний пошук «адвокат + місто»: сторінки практик плюс Google Business Profile.",
  ]),
  p("Сайт для адвоката — це не портфоліо і не «візитка для солідності», а інструмент довіри, який конвертує пошуковий трафік у консультації. Якщо коротко про гроші: **сайт-візитка приватного адвоката коштує від $800** і запускається за 2–3 тижні, **сайт юридичної фірми з окремими сторінками практик — від $3 500** і 4–8 тижнів роботи."),
  p("Юридичні послуги Google зараховує до категорії YMYL (Your Money or Your Life): помилка у виборі адвоката коштує людині грошей, майна або свободи. Тому і алгоритми пошуку, і самі клієнти оцінюють юридичний сайт прискіпливіше, ніж сайт кав'ярні: хто ви, яке у вас свідоцтво, які результати і чому вам можна довіряти."),
  p("Ми в Code-Site.Art робимо [сайти для юридичної ніші](/sites-for/legal) і в цій статті зібрали конкретику без води: яка структура працює, що можна і не можна публікувати про виграні справи, скільки це коштує і як вийти в топ за запитом «адвокат + ваше місто»."),

  h2("Чому довіра — головна валюта юридичного сайту"),
  p("Людина, яка шукає адвоката, майже завжди у стресі: кримінальне провадження, розлучення, спір за майно, податкова перевірка. Вона відкриває 3–5 сайтів з видачі та за 20–30 секунд вирішує, кому написати. Виграє не найкрасивіший сайт, а той, що швидше зняв сумніви."),
  p("Google формалізує це через E-E-A-T: досвід, експертність, авторитетність, надійність. Для YMYL-тематик ці сигнали впливають на ранжування напряму. На практиці довіру створюють цілком конкретні елементи:"),
  li("Реальні фото адвокатів замість стокових «людей у костюмах» — стокові фото у юридичній ніші вбивають конверсію."),
  li("Номер свідоцтва про право на заняття адвокатською діяльністю та рік його видачі."),
  li("Фізична адреса офісу, карта, реквізити адвокатського об'єднання."),
  li("Кейси з категоріями справ і результатами (як їх оформити законно — окремий розділ нижче)."),
  li("Відгуки клієнтів і згадки у ЗМІ або професійних виданнях."),
  li("Прозорість цін: хоча б вилка вартості консультації — сторінка з цінами знімає бар'єр першого звернення."),
  p("Кожен блок сайту має відповідати на одне внутрішнє питання клієнта: «чи можна цій людині довірити мою проблему?» Якщо блок на це питання не працює — він зайвий. Це головна відмінність юридичного сайту від «іміджевого»: тут не буває нейтральних елементів, кожен або додає довіри, або забирає її."),

  h2("Структура: кожна практика — окрема сторінка"),
  p("Головна помилка 80% юридичних сайтів — одна сторінка «Послуги» зі списком із двадцяти напрямів. Так сайт не ранжується за жодним запитом і не переконує жодного клієнта."),
  h3("Чому одна сторінка «Послуги» не працює"),
  p("Людина не шукає «юридичні послуги» — вона шукає «адвокат у кримінальних справах», «адвокат з розлучень», «оскарження податкових повідомлень-рішень». Під кожен такий запит потрібна окрема сторінка: зі своїм заголовком, описом процесу, цінами, кейсами саме цієї категорії та формою запису. Це водночас SEO-сторінка і посадкова для реклами."),
  h3("Мінімальна структура сайту юридичної фірми"),
  num("Головна: позиціонування, ключові практики, цифри досвіду, шлях до консультації."),
  num("5–8 сторінок практик: кримінальні, сімейні, господарські спори, податкові, військове право — залежно від спеціалізації."),
  num("Команда: окремий профіль кожного адвоката (розділ нижче)."),
  num("Кейси: знеособлені результати за категоріями справ."),
  num("Блог: відповіді на типові питання клієнтів — джерело пошукового трафіку."),
  num("Контакти: адреса, карта, графік, месенджери, форма запису на консультацію."),
  p("Для приватного адвоката з однією спеціалізацією стартовим варіантом може бути [односторінковий лендінг](/landing): профіль, 3–4 послуги, кейси, запис. Для фірми з кількома практиками потрібен повноцінний [корпоративний сайт](/corporate-site) — з архітектурою під розширення, коли додаються нові напрями."),

  cta(
    "Не знаєте, яка структура потрібна саме вашій практиці?",
    "Розкажіть про свої напрями роботи — за день запропонуємо структуру сайту, план сторінок і точну ціну.",
    "Розрахувати вартість",
    "/calculator"
  ),

  h2("Профіль адвоката: сторінка, яка продає консультацію"),
  p("Клієнт наймає не фірму, а людину. Сторінка адвоката — друга за відвідуваністю після сторінок практик, і саме з неї найчастіше пишуть у месенджер. Що на ній має бути:"),
  li("Професійне фото і людське, а не «канцелярське» представлення."),
  li("Номер свідоцтва, рік початку практики, членство в НААУ, адвокатське об'єднання."),
  li("Спеціалізація: 2–3 напрями замість «усі види юридичних послуг»."),
  li("Досвід у цифрах: років практики, справ у категорії, показові результати."),
  li("Освіта, науковий ступінь, публікації, коментарі для ЗМІ, виступи."),
  li("Мови і формати роботи: онлайн-консультації, виїзд, представництво в судах яких інстанцій."),
  p("Для адвокатів, які будують персональний бренд, сторінка-профіль поступово переростає в окремий особистий сайт — так само, як це працює у експертів з інших ніш у нашому портфоліо."),

  h2("Кейси і результати: що можна публікувати, а що — ні"),
  p("Найсильніший блок юридичного сайту — і найнебезпечніший. Адвокатська таємниця (ст. 22 Закону України «Про адвокатуру та адвокатську діяльність») і Правила адвокатської етики обмежують і зміст, і форму: реклама адвокатської діяльності має бути достовірною, без обіцянок результату і без порівнянь з іншими адвокатами."),
  p("**Можна публікувати:** знеособлені кейси за письмовою згодою клієнта, категорію справи, суть проблеми, обсяг роботи і результат («суд першої інстанції закрив провадження», «стягнуто заборгованість»), правові позиції з посиланням на відкриті реєстри судових рішень."),
  p("**Не можна:** імена та деталі, що ідентифікують клієнта без його згоди, гарантії на кшталт «виграємо 100% справ», формулювання «найкращий адвокат міста», чужі результати як свої."),
  p("Робочий формат кейсу — три абзаци: ситуація → що зробив адвокат → результат. Десять таких кейсів за категоріями справ переконують краще за будь-який рекламний текст і дають сторінкам практик унікальний контент, якого немає в конкурентів."),

  h2("Скільки коштує сайт для адвоката та юридичної фірми"),
  p("Пряма відповідь: **сайт-візитка приватного адвоката — від $800**, **сайт юридичної фірми під ключ — від $3 500**, кастомна платформа з особистим кабінетом клієнта — від $6 000. Далі — що саме входить у кожен варіант."),
  table(
    ["Параметр", "Візитка приватного адвоката", "Сайт юридичної фірми"],
    [
      ["Кому підходить", "Адвокат з 1–2 спеціалізаціями", "Фірма або об'єднання з кількома практиками"],
      ["Обсяг", "1 сторінка-лендінг: профіль, послуги, кейси, запис", "10–20+ сторінок: практики, команда, кейси, блог"],
      ["Що входить", "Дизайн, тексти-каркас, форма запису, базове SEO", "Архітектура під SEO, сторінки практик, профілі, кейси, блог, адмінка"],
      ["Ціна", "від **$800**", "від **$3 500**"],
      ["Строки", "2–3 тижні", "4–8 тижнів"],
    ]
  ),
  p("На підсумкову цифру впливають кількість сторінок практик, дво- чи тримовність, інтеграції (онлайн-запис, CRM, оплата консультацій — типова інтеграція $200–500), а також обсяг контенту, який ми готуємо разом з вами. Підтримка після запуску — **$200/міс** або $40/год разово. Повний розбір ціноутворення — у статті про [вартість розробки сайту у 2026](/blog/vartist-rozrobky-saytu-2026) і в деталях про те, [що входить у вартість](/blog/shcho-vkhodyt-u-vartist-rozrobky-saitu)."),

  h2("Обов'язкові блоки юридичного сайту і що вони дають"),
  p("Зведемо все в одну таблицю — це водночас чекліст для аудиту наявного сайту:"),
  table(
    ["Блок", "Що він дає"],
    [
      ["Сторінки практик (окремо кожна)", "Пошуковий трафік за запитами «адвокат + категорія справи»"],
      ["Профіль адвоката з № свідоцтва", "Довіра, сигнали E-E-A-T для YMYL-ніші"],
      ["Кейси з результатами", "Докази компетентності — головний аргумент на користь дзвінка"],
      ["Відгуки клієнтів", "Соціальний доказ; знеособлені — етично безпечні"],
      ["Запис на консультацію 24/7", "Конверсія трафіку в заявки поза робочими годинами"],
      ["Блог з відповідями на питання", "Трафік за інформаційними запитами, прогрів клієнта"],
      ["Контакти з картою та реквізитами", "Локальне SEO і формальна довіра"],
    ]
  ),

  h2("Як адвокату отримувати клієнтів з пошуку"),
  p("Юридична ніша — одна з найдорожчих у платній рекламі, тому органічний пошук тут окупається швидко. Стратегія з трьох рівнів:"),
  li("**Локальний пошук:** запити «адвокат + місто» мають комерційний інтент і найкоротший шлях до заявки. Потрібні Google Business Profile, відгуки та сторінки практик з топонімами — як це працює, ми розбирали у гайді про [топ-3 Google Maps](/blog/lokalne-seo-top-3-google-maps)."),
  li("**Сторінки практик:** середньочастотні запити «адвокат у кримінальних справах», «розірвання шлюбу адвокат» — по одній сторінці на запит."),
  li("**Блог:** інформаційні запити «що робити, якщо вручили підозру», «як подати на аліменти» — прогрівають і приводять за місяці до звернення."),
  p("Просування юридичного сайту — це системна робота: [SEO-супровід від $300/міс](/seo) включає контент-план, технічну оптимізацію і роботу з локальною видачею. Той самий підхід працює і для суміжних довірчих ніш — наприклад, [сайтів фінансових і бухгалтерських компаній](/sites-for/finance)."),

  h2("Приклади: як виглядає сайт, якому довіряють"),
  p("Принципи довірчого дизайну однакові для всіх експертних ніш: перша секція відповідає «хто ви і чим допоможете», далі — докази. Подивіться, як це реалізовано у наших роботах: персональний сайт експерта [Олександра Сітнікова](/portfolio/oleksandr-sitnikov), сайт-бренд [Glenn Garbo](/portfolio/glenn-garbo) і YMYL-проєкт [клініки E-Fedra](/portfolio/efedra-clinic), де довіра так само критична, як у юридичній ніші."),
  p("Кожен з цих сайтів побудований за логікою, описаною вище: чітке позиціонування, реальні обличчя, структуровані докази компетентності й помітний шлях до звернення."),

  cta(
    "Потрібен сайт для адвоката чи юридичної фірми?",
    "Візитка від $800, сайт фірми від $3 500. Структура під ваші практики, тексти, кейси і SEO-база — під ключ.",
    "Отримати розрахунок",
    "/calculator"
  ),
];

const BODY_RU = [
  tldr("Коротко: сайт адвоката за 60 секунд", [
    "Создать сайт адвоката — значит прежде всего построить доверие: юридическая тематика относится к YMYL, и Google оценивает такие сайты строже.",
    "Рабочая структура: каждая практика — отдельной страницей, профиль адвоката с номером свидетельства, обезличенные кейсы, запись на консультацию.",
    "Сайт-визитка юриста стоит от $800 и делается 2–3 недели; сайт юридической фирмы под ключ — от $3 500 и 4–8 недель.",
    "Кейсы публикуются только обезличенно и с согласия клиента — адвокатская тайна и этика рекламы юруслуг это жёстко ограничивают.",
    "Самый быстрый канал клиентов — локальный поиск «адвокат + город» и Google Business Profile.",
  ]),
  p("Как создать сайт адвоката, который приводит клиентов, а не просто «существует»? Начнём с цифр: **сайт-визитка юриста стоит от $800** и запускается за 2–3 недели, **сайт юридической фирмы под ключ — от $3 500** и 4–8 недель. Разница не в «красивости», а в структуре: у фирмы каждая практика получает отдельную страницу под свой поисковый запрос."),
  p("Юридические услуги Google относит к категории YMYL (Your Money or Your Life): ошибка в выборе адвоката стоит человеку денег, имущества или свободы. Поэтому и поисковик, и сам клиент оценивают юридический сайт придирчивее любого другого: кто вы, какое у вас свидетельство, какие результаты и почему вам можно доверять."),
  p("Мы в Code-Site.Art делаем [сайты для юридической ниши](/ru/sites-for/legal), и в этой статье собрали конкретику: структура, которая работает, правила публикации выигранных дел, вилки цен и путь в топ по запросу «адвокат + ваш город»."),

  h2("Доверие — главная валюта юридического сайта"),
  p("Человек, который ищет адвоката, почти всегда в стрессе: уголовное производство, развод, спор о имуществе, налоговая проверка. Он открывает 3–5 сайтов из выдачи и за 20–30 секунд решает, кому написать. Выигрывает не самый красивый сайт, а тот, который быстрее снял сомнения."),
  p("Google формализует это через E-E-A-T: опыт, экспертность, авторитетность, надёжность. Для YMYL-тематик эти сигналы напрямую влияют на ранжирование. На практике доверие создают конкретные элементы:"),
  li("Настоящие фото адвокатов вместо стоковых «людей в костюмах» — сток в юридической нише убивает конверсию."),
  li("Номер свидетельства о праве на занятие адвокатской деятельностью и год его выдачи."),
  li("Физический адрес офиса, карта, реквизиты адвокатского объединения."),
  li("Кейсы с категориями дел и результатами — как оформить их законно, разберём ниже."),
  li("Отзывы клиентов и упоминания в СМИ или профессиональных изданиях."),

  h2("Как создать сайт адвоката: структура решает"),
  p("Главная ошибка большинства юридических сайтов — одна страница «Услуги» со списком из двадцати направлений. Такой сайт не ранжируется ни по одному запросу и не убеждает ни одного клиента."),
  h3("Почему одной страницы «Услуги» недостаточно"),
  p("Клиент не ищет «юридические услуги» — он ищет «адвокат по уголовным делам», «адвокат по разводам», «обжалование налоговых решений». Под каждый такой запрос нужна отдельная страница: со своим заголовком, описанием процесса, ценами, кейсами именно этой категории и формой записи. Это одновременно SEO-страница и посадочная для рекламы."),
  h3("Минимальная структура сайта юридической фирмы"),
  num("Главная: позиционирование, ключевые практики, цифры опыта, путь к консультации."),
  num("5–8 страниц практик — по специализациям фирмы."),
  num("Команда: отдельный профиль каждого адвоката."),
  num("Кейсы: обезличенные результаты по категориям дел."),
  num("Блог: ответы на типовые вопросы клиентов — источник поискового трафика."),
  num("Контакты: адрес, карта, график, мессенджеры, форма записи."),
  p("Частному юристу с одной специализацией на старте достаточно [одностраничного лендинга](/ru/landing) — это и есть сайт-визитка юриста в современном виде: профиль, услуги, кейсы, запись. Фирме с несколькими практиками нужен полноценный [корпоративный сайт](/ru/corporate-site) с архитектурой под расширение."),

  cta(
    "Не знаете, какая структура нужна вашей практике?",
    "Расскажите о своих направлениях — за день предложим структуру сайта, план страниц и точную цену.",
    "Рассчитать стоимость",
    "/ru/calculator"
  ),

  h2("Профиль адвоката: страница, которая продаёт консультацию"),
  p("Клиент нанимает не фирму, а человека. Страница адвоката — вторая по посещаемости после страниц практик, и именно с неё чаще всего пишут в мессенджер. Что на ней должно быть:"),
  li("Профессиональное фото и человеческое, а не «канцелярское» представление."),
  li("Номер свидетельства, год начала практики, адвокатское объединение."),
  li("Специализация: 2–3 направления вместо «все виды юридических услуг»."),
  li("Опыт в цифрах: лет практики, дел в категории, показательные результаты."),
  li("Образование, публикации, комментарии для СМИ, выступления."),
  li("Языки и форматы работы: онлайн-консультации, представительство в судах."),

  h2("Кейсы и результаты: что можно публиковать, а что нельзя"),
  p("Самый сильный блок юридического сайта — и самый рискованный. Адвокатская тайна (ст. 22 закона Украины «Об адвокатуре и адвокатской деятельности») и Правила адвокатской этики ограничивают и содержание, и форму: реклама должна быть достоверной, без обещаний результата и сравнений с другими адвокатами."),
  p("**Можно:** обезличенные кейсы с письменного согласия клиента, категория дела, суть проблемы, объём работы и результат («производство закрыто в первой инстанции», «задолженность взыскана»), правовые позиции со ссылками на открытые реестры судебных решений."),
  p("**Нельзя:** имена и детали, идентифицирующие клиента без его согласия, гарантии вроде «выигрываем 100% дел», формулировки «лучший адвокат города», чужие результаты как свои."),
  p("Рабочий формат кейса — три абзаца: ситуация → что сделал адвокат → результат. Десять таких кейсов по категориям дел убеждают лучше любого рекламного текста и дают страницам практик уникальный контент."),

  h2("Создание сайта для адвоката: цены и сроки"),
  p("Прямой ответ на вопрос «сколько стоит»: **сайт-визитка юриста — от $800**, **сайт юридической фирмы под ключ — от $3 500**, кастомная платформа с личным кабинетом клиента — от $6 000."),
  table(
    ["Параметр", "Сайт-визитка юриста", "Сайт юридической фирмы"],
    [
      ["Кому подходит", "Частный адвокат с 1–2 специализациями", "Фирма или объединение с несколькими практиками"],
      ["Объём", "1 страница-лендинг: профиль, услуги, кейсы, запись", "10–20+ страниц: практики, команда, кейсы, блог"],
      ["Что входит", "Дизайн, каркас текстов, форма записи, базовое SEO", "SEO-архитектура, страницы практик, профили, кейсы, блог, админка"],
      ["Цена", "от **$800**", "от **$3 500**"],
      ["Сроки", "2–3 недели", "4–8 недель"],
    ]
  ),
  p("Итоговая цифра зависит от количества страниц практик, числа языков и интеграций: онлайн-запись, CRM, оплата консультаций — типовая интеграция $200–500. Поддержка после запуска — **$200/мес** или $40/час разово. Подробный разбор ценообразования — в статье о [стоимости разработки сайта в 2026](/ru/blog/skolko-stoit-sayt-2026)."),

  h2("Обязательные блоки юридического сайта"),
  p("Сводная таблица — она же чеклист для аудита существующего сайта:"),
  table(
    ["Блок", "Что даёт"],
    [
      ["Страницы практик (каждая отдельно)", "Поисковый трафик по запросам «адвокат + категория дела»"],
      ["Профиль адвоката с № свидетельства", "Доверие, сигналы E-E-A-T для YMYL-ниши"],
      ["Кейсы с результатами", "Доказательства компетентности — главный аргумент в пользу звонка"],
      ["Отзывы клиентов", "Социальное доказательство; обезличенные — этически безопасны"],
      ["Запись на консультацию 24/7", "Конверсия трафика в заявки вне рабочих часов"],
      ["Блог с ответами на вопросы", "Трафик по информационным запросам, прогрев клиента"],
      ["Контакты с картой и реквизитами", "Локальное SEO и формальное доверие"],
    ]
  ),

  h2("Как адвокату получать клиентов из поиска"),
  p("Юридическая ниша — одна из самых дорогих в платной рекламе, поэтому органический поиск здесь окупается быстро. Стратегия из трёх уровней:"),
  li("**Локальный поиск:** запросы «адвокат + город» имеют коммерческий интент и кратчайший путь к заявке. Нужны Google Business Profile, отзывы и страницы практик — механику мы разбирали в гайде про [топ-3 Google Maps](/ru/blog/lokalnoe-seo-top-3-google-maps)."),
  li("**Страницы практик:** среднечастотные запросы «адвокат по уголовным делам», «расторжение брака адвокат» — по странице на запрос."),
  li("**Блог:** информационные запросы «что делать, если вручили подозрение» прогревают клиента за месяцы до обращения."),
  p("Продвижение юридического сайта — системная работа: [SEO-сопровождение от $300/мес](/ru/seo) включает контент-план, техническую оптимизацию и локальную выдачу. Тот же подход работает для смежных доверительных ниш — например, [сайтов финансовых компаний](/ru/sites-for/finance)."),

  h2("Примеры: как выглядит сайт, которому доверяют"),
  p("Принципы доверительного дизайна одинаковы для всех экспертных ниш: первая секция отвечает «кто вы и чем поможете», дальше — доказательства. Посмотрите, как это реализовано в наших работах: персональный сайт эксперта [Александра Ситникова](/ru/portfolio/oleksandr-sitnikov), сайт-бренд [Glenn Garbo](/ru/portfolio/glenn-garbo) и YMYL-проект [клиники E-Fedra](/ru/portfolio/efedra-clinic), где доверие так же критично, как в юридической нише."),
  p("Каждый из этих сайтов построен по описанной выше логике: чёткое позиционирование, настоящие лица, структурированные доказательства компетентности и заметный путь к обращению."),

  cta(
    "Нужен сайт под ключ для адвоката или юрфирмы?",
    "Визитка от $800, сайт фирмы от $3 500. Структура под ваши практики, тексты, кейсы и SEO-база — под ключ.",
    "Получить расчёт",
    "/ru/calculator"
  ),
];

const BODY_EN = [
  tldr("Attorney website essentials in 60 seconds", [
    "Legal services are a YMYL niche: Google and clients alike judge attorney websites harder than almost any other kind of site.",
    "Non-negotiables: a separate page per practice area, an attorney profile with bar credentials, anonymised case results, and 24/7 consultation booking.",
    "A solo attorney site starts at $800 and takes 2–3 weeks; a full law firm website starts at $3,500 and takes 4–8 weeks.",
    "Case results must respect confidentiality and advertising ethics: anonymised, with client consent, and never framed as a guarantee.",
    "The fastest client channel is local search — “attorney + city” queries plus a well-maintained Google Business Profile.",
  ]),
  p("What does an attorney website actually need — and what does it cost? The short answer on budget: **a solo attorney website starts at $800** and launches in 2–3 weeks, while **a law firm website with dedicated practice-area pages starts at $3,500** and takes 4–8 weeks. The rest of this guide covers what those numbers buy and which blocks your site cannot do without."),
  p("Legal services sit squarely in Google's YMYL (Your Money or Your Life) category: choosing the wrong lawyer costs people money, property or freedom. That is why both the algorithm and the client scrutinise a legal website harder than any restaurant or shop page — who you are, what your credentials say, what results you have and why you deserve trust."),
  p("At Code-Site.Art we build [websites for the legal industry](/en/sites-for/legal) — a Ukraine-based studio delivering European quality at sensible rates. Below is the practical checklist: structure, ethics-safe case studies, price brackets and the way to rank for “attorney + your city”."),

  h2("Trust is the currency of a legal website"),
  p("Someone searching for an attorney is almost always under stress: criminal charges, divorce, a property dispute, a tax investigation. They open three to five sites from the results page and decide within 20–30 seconds whom to contact. The winner is not the prettiest site — it is the one that removes doubt fastest."),
  p("Google formalises this through E-E-A-T: experience, expertise, authoritativeness, trustworthiness. For YMYL topics these signals directly affect rankings. In practice, trust is built by very specific elements:"),
  li("Real photos of your attorneys instead of stock “people in suits” — stock imagery kills conversion in legal."),
  li("Bar admission details: licence number, year admitted, jurisdictions covered."),
  li("A physical office address, a map and full firm details."),
  li("Case results grouped by practice area — with the ethics rules covered below."),
  li("Client reviews and mentions in the press or professional publications."),
  p("Every block on the site must answer one silent question: “can I trust this person with my problem?” If a block does not serve that question, it is dead weight."),

  h2("Structure: one page per practice area"),
  p("The most common failure on law firm websites is a single “Services” page listing twenty practice areas. Such a page ranks for nothing and convinces no one."),
  h3("Why a single Services page fails"),
  p("Nobody searches for “legal services”. People search for “criminal defence attorney”, “divorce lawyer”, “tax dispute appeal”. Each of those queries deserves its own page: its own headline, process description, fees, case results from that exact category and a booking form. One page serves double duty — an SEO landing page and a destination for paid ads."),
  h3("Minimum structure for a law firm website"),
  num("Home: positioning, key practice areas, experience in numbers, a clear path to a consultation."),
  num("5–8 practice-area pages, matching the firm's actual specialisations."),
  num("Team: an individual profile page for every attorney."),
  num("Case results: anonymised outcomes grouped by category."),
  num("Blog: answers to the questions clients actually type into Google."),
  num("Contact: address, map, hours, messengers and a consultation booking form."),
  p("A solo attorney with one specialisation can start with a [single-page site](/en/landing): profile, services, results, booking. A firm with several practice areas needs a full [corporate website](/en/corporate-site) with an architecture that scales as new practice areas are added."),

  cta(
    "Not sure what structure fits your practice?",
    "Tell us about your practice areas — within a day you get a page plan and an exact quote.",
    "Get a quote",
    "/en/calculator"
  ),

  h2("The attorney profile: the page that sells the consultation"),
  p("Clients hire a person, not a logo. The attorney profile is typically the second most-visited page after practice areas, and it is where most enquiries start. It should include:"),
  li("A professional photo and a human introduction — not a wall of legalese."),
  li("Bar credentials: licence number, year admitted, professional memberships."),
  li("Specialisation: two or three focus areas rather than “all kinds of legal services”."),
  li("Experience in numbers: years in practice, cases handled in the category, representative outcomes."),
  li("Education, publications, media commentary, speaking engagements."),
  li("Languages and formats: online consultations, court representation, cross-border work."),

  h2("Case results: what you may publish — and what you may not"),
  p("Case results are the strongest block on a legal website and the riskiest one. Attorney-client privilege and bar advertising rules — which vary by jurisdiction but share the same core — restrict both content and framing: advertising must be truthful, must not promise outcomes and must not compare you to other lawyers."),
  p("**Safe to publish:** anonymised case studies with the client's written consent, the case category, the essence of the problem, the scope of work and the outcome (“proceedings closed at first instance”, “debt recovered in full”), and legal positions referencing public court registries."),
  p("**Not safe:** names or details that identify a client without consent, guarantees like “we win 100% of cases”, superlatives like “the best attorney in town”, or someone else's results presented as your own."),
  p("The format that works is three paragraphs: situation → what the attorney did → outcome. Ten such case studies, grouped by category, persuade better than any sales copy and give your practice-area pages unique content competitors cannot copy."),

  h2("What an attorney website costs"),
  p("The direct answer: **a solo attorney website starts at $800**, **a law firm website starts at $3,500**, and a custom platform with a client portal starts at $6,000. Here is what each option includes:"),
  table(
    ["Parameter", "Solo attorney site", "Law firm website"],
    [
      ["Best for", "A private attorney with 1–2 specialisations", "A firm with several practice areas"],
      ["Scope", "One landing page: profile, services, results, booking", "10–20+ pages: practice areas, team, results, blog"],
      ["Included", "Design, copy framework, booking form, baseline SEO", "SEO architecture, practice pages, profiles, case results, blog, admin panel"],
      ["Price", "from **$800**", "from **$3,500**"],
      ["Timeline", "2–3 weeks", "4–8 weeks"],
    ]
  ),
  p("The final figure depends on the number of practice-area pages, languages, and integrations — online booking, CRM, consultation payments run $200–500 for a typical integration. Post-launch support is **$200/month** or $40/hour ad hoc. For a full breakdown of what drives the numbers, see our guide to [custom website costs in 2026](/en/blog/custom-website-cost-uk-2026)."),

  h2("Must-have blocks and what each one earns you"),
  p("The summary table below doubles as an audit checklist for an existing site:"),
  table(
    ["Block", "What it delivers"],
    [
      ["A page per practice area", "Search traffic for “attorney + case category” queries"],
      ["Attorney profile with bar credentials", "Trust and E-E-A-T signals for a YMYL niche"],
      ["Anonymised case results", "Proof of competence — the main argument for making the call"],
      ["Client reviews", "Social proof; anonymised reviews stay ethics-safe"],
      ["24/7 consultation booking", "Converts traffic into enquiries outside office hours"],
      ["A blog answering client questions", "Informational traffic that warms up future clients"],
      ["Contact page with map and firm details", "Local SEO plus formal credibility"],
    ]
  ),

  h2("Getting clients from search"),
  p("Legal is one of the most expensive niches in paid advertising, which is exactly why organic search pays back quickly here. The strategy has three layers:"),
  li("**Local search:** “attorney + city” queries carry commercial intent and the shortest path to an enquiry. You need a Google Business Profile, reviews and localised practice pages — we broke down the mechanics in our [Google Maps top-3 guide](/en/blog/local-seo-google-maps-top-3)."),
  li("**Practice-area pages:** mid-volume queries like “criminal defence attorney” — one dedicated page per query."),
  li("**Blog:** informational queries such as “what to do if you are charged” warm clients up months before they hire."),
  p("Ranking a legal website is systematic work: our [SEO retainer from $300/month](/en/seo) covers the content plan, technical optimisation and local visibility. The same playbook applies to neighbouring trust-driven niches — for instance, [websites for finance and accounting firms](/en/sites-for/finance)."),

  h2("Examples: what a trustworthy site looks like"),
  p("The principles of trust-driven design are the same across expert niches: the first screen answers “who you are and how you help”, everything after that is proof. See how it plays out in our work: the personal expert site of [Oleksandr Sitnikov](/en/portfolio/oleksandr-sitnikov), the personal brand site [Glenn Garbo](/en/portfolio/glenn-garbo), and the YMYL project for the [E-Fedra clinic](/en/portfolio/efedra-clinic), where trust is as critical as it is in legal."),
  p("Each of these sites follows the logic above: sharp positioning, real faces, structured proof of competence and an unmissable path to getting in touch."),

  cta(
    "Need an attorney or law firm website?",
    "Solo site from $800, firm website from $3,500. Structure built around your practice areas, copy, case studies and an SEO baseline — delivered turnkey.",
    "Get a quote",
    "/en/calculator"
  ),
];

const doc = {
  _id: "ltAug2026-sait-dlia-advokata",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 11,
  category: { _type: "reference", _ref: "28b8d6fe-07b6-4ee6-8f40-87bf838df79b" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-advokata" },
    ru: { _type: "slug", current: "sayt-dlya-advokata" },
    en: { _type: "slug", current: "attorney-website-essentials" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для адвоката та юридичної фірми: довіра, кейси, клієнти з пошуку",
    ru: "Как создать сайт адвоката: от визитки юриста до сайта фирмы под ключ",
    en: "Attorney Website Essentials: What to Include and What It Costs",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для адвоката: структура, ціни, SEO | Code-Site.Art",
    ru: "Сайт адвоката: как создать, структура и цены 2026",
    en: "Attorney Website Essentials: Structure & Cost 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для адвоката, якому довіряють. ✔️ Структура та обов'язкові блоки ✔️ Візитка від $800, сайт фірми від $3 500 ➡ Кейси, етика, SEO-поради.",
    ru: "➤ Как создать сайт адвоката с нуля. ✔️ Сайт-визитка юриста от $800 ✔️ Сайт фирмы под ключ от $3 500 ➡ Структура, этика кейсов, SEO.",
    en: "➤ Attorney website essentials in one guide. ✔️ Must-have pages and trust blocks ✔️ Solo site from $800, firm site from $3,500 ➡ Real examples inside.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Юридична ніша",
    ru: "Юридическая ниша",
    en: "Legal industry",
  },
  lede: {
    _type: "localizedString",
    uk: "Повний розбір сайту для адвоката і юрфірми: структура зі сторінками практик, профіль з номером свідоцтва, законна публікація кейсів і вилка цін — від візитки за $800 до сайту фірми від $3 500.",
    ru: "Полный разбор сайта адвоката и юрфирмы: структура со страницами практик, профиль со свидетельством, законная публикация кейсов и вилка цен — от визитки за $800 до сайта фирмы от $3 500.",
    en: "The full anatomy of an attorney website: practice-area pages, a credentialed profile, ethics-safe case results and honest pricing — from an $800 solo site to a $3,500+ firm website.",
  },
  tags: ["сайт для адвоката", "юридична фірма", "legal", "YMYL"],
  relatedPostSlugs: ["vartist-rozrobky-saytu-2026", "shcho-vkhodyt-u-vartist-rozrobky-saitu", "lokalne-seo-top-3-google-maps"],
  body: { uk: BODY_UK, ru: BODY_RU, en: BODY_EN },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для юриста?",
        ru: "Сколько стоит сайт для юриста?",
        en: "How much does an attorney website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Сайт-візитка приватного адвоката коштує від $800 і робиться за 2–3 тижні. Сайт юридичної фірми з окремими сторінками практик — від $3 500 і 4–8 тижнів. Кастомна платформа з особистим кабінетом клієнта — від $6 000. На ціну найбільше впливають кількість сторінок практик, мовні версії та інтеграції.",
        ru: "Сайт-визитка юриста стоит от $800 и делается за 2–3 недели. Сайт юридической фирмы с отдельными страницами практик — от $3 500 и 4–8 недель. Кастомная платформа с личным кабинетом клиента — от $6 000. Больше всего на цену влияют количество страниц практик, языковые версии и интеграции.",
        en: "A solo attorney website starts at $800 and takes 2–3 weeks. A law firm website with dedicated practice-area pages starts at $3,500 and takes 4–8 weeks. A custom platform with a client portal starts at $6,000. The main cost drivers are the number of practice-area pages, language versions and integrations.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен сайт приватному адвокату, якщо клієнти приходять за рекомендацією?",
        ru: "Нужен ли сайт частному адвокату, если клиенты приходят по рекомендации?",
        en: "Does a solo attorney need a website if clients come by referral?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, бо рекомендацію теж перевіряють: 7 з 10 людей гуглять адвоката, перш ніж написати йому. Якщо пошук не знаходить нічого або знаходить лише сторінку в соцмережі, частина рекомендованих клієнтів відпадає. Візитки з профілем, кейсами і формою запису для цього достатньо.",
        ru: "Да, потому что рекомендацию тоже проверяют: 7 из 10 людей гуглят адвоката, прежде чем написать ему. Если поиск ничего не находит или находит только страницу в соцсети, часть рекомендованных клиентов отпадает. Визитки с профилем, кейсами и формой записи для этого достаточно.",
        en: "Yes — referrals get verified: most people google an attorney before contacting them. If search returns nothing, or only a social media page, a share of referred clients drops off. A one-page site with a profile, case results and a booking form is enough to close that gap.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка сайту для юридичної фірми?",
        ru: "Сколько времени занимает создание сайта для адвоката?",
        en: "How long does it take to build a law firm website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Візитка приватного адвоката — 2–3 тижні. Сайт юридичної фірми з 5–8 сторінками практик, профілями команди і кейсами — 4–8 тижнів. Найдовший етап зазвичай не дизайн, а контент: збір інформації про практики і погодження кейсів з клієнтами.",
        ru: "Визитка частного адвоката — 2–3 недели. Сайт юридической фирмы с 5–8 страницами практик, профилями команды и кейсами — 4–8 недель. Самый долгий этап обычно не дизайн, а контент: сбор информации о практиках и согласование кейсов с клиентами.",
        en: "A solo attorney site takes 2–3 weeks. A law firm website with 5–8 practice-area pages, team profiles and case results takes 4–8 weeks. The longest stage is usually not design but content: gathering practice details and getting client consent for case studies.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як потрапити в топ Google за запитом «адвокат + місто»?",
        ru: "Как попасть в топ Google по запросу «адвокат + город»?",
        en: "How do you rank for “attorney + city” searches?",
      },
      answer: {
        _type: "localizedText",
        uk: "Три складові: заповнений Google Business Profile з відгуками і правильною категорією, сторінки практик з топонімом у заголовках і текстах, та узгоджені контакти (назва, адреса, телефон) на сайті й у каталогах. Перші результати в локальній видачі зазвичай видно за 2–4 місяці системної роботи.",
        ru: "Три составляющие: заполненный Google Business Profile с отзывами и правильной категорией, страницы практик с топонимом в заголовках и текстах, и согласованные контакты (название, адрес, телефон) на сайте и в каталогах. Первые результаты в локальной выдаче обычно видны через 2–4 месяца системной работы.",
        en: "Three components: a complete Google Business Profile with reviews and the right category, practice-area pages that mention the city in headings and copy, and consistent contact details (name, address, phone) across your site and directories. First local-pack results typically show within 2–4 months of systematic work.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна публікувати виграні справи на сайті адвоката?",
        ru: "Можно ли публиковать выигранные дела на сайте адвоката?",
        en: "Can an attorney publish won cases on their website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Можна, але лише знеособлено і за згодою клієнта: категорія справи, суть проблеми, обсяг роботи і результат — без імен та деталей, що ідентифікують особу. Заборонені гарантії результату («виграємо 100% справ») і порівняння з іншими адвокатами — це вимоги Правил адвокатської етики.",
        ru: "Можно, но только обезличенно и с согласия клиента: категория дела, суть проблемы, объём работы и результат — без имён и деталей, идентифицирующих человека. Запрещены гарантии результата («выигрываем 100% дел») и сравнения с другими адвокатами — это требования Правил адвокатской этики.",
        en: "Yes, but only anonymised and with the client's consent: the case category, the essence of the problem, the scope of work and the outcome — no names or identifying details. Outcome guarantees (“we win 100% of cases”) and comparisons with other lawyers are prohibited by bar advertising rules.",
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
