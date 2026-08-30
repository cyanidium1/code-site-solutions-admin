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
const NOW = "2026-08-30T10:00:00.000Z";

/* ------------------------------------------------------------------ UK */

const bodyUk = [
  tldr("Коротко", [
    "Core Web Vitals — три метрики Google про реальний досвід відвідувача: LCP (швидкість появи головного блоку), INP (швидкість реакції на клік), CLS (стабільність верстки).",
    "Добре — це LCP до 2,5 с, INP до 200 мс, CLS до 0,1 у 75% реальних візитів.",
    "FID більше не використовується: у березні 2024 його замінив INP.",
    "На позиції впливають, але слабко. На конверсію і відмови — сильно.",
    "Лабораторні бали PageSpeed і польові дані CrUX майже завжди розходяться. Рішення ухвалюють за польовими.",
    "У всіх наших пакетах Lighthouse Performance 90+, у кейсі клініки Efedra LCP — 0,8 с.",
  ]),

  p("**Core Web Vitals** — це три показники Google, які вимірюють, наскільки швидко і стабільно сторінка працює для живої людини: LCP показує, коли намалювався найбільший видимий елемент, INP — скільки браузер думає після кліку, CLS — чи не стрибає контент під час завантаження. Google вважає результат добрим, якщо у 75% реальних візитів LCP не перевищує 2,5 секунди, INP — 200 мілісекунд, а CLS — 0,1."),
  p("Важливо одразу зняти найпоширенішу плутанину: Core Web Vitals — це не «оцінка сайту» і не бал від 0 до 100. Бал у PageSpeed Insights рахує робот на емуляції, а Core Web Vitals збираються з браузерів Chrome ваших справжніх відвідувачів. Тому зелений бал 95 і червоні Core Web Vitals у Search Console спокійно уживаються на одному сайті."),

  h2("Простими словами"),
  p("Уявіть, що сайт — це кав'ярня. **LCP** — час, за який вам винесли каву: поки її немає, ви просто стоїте біля стійки і не розумієте, чи вас узагалі помітили. **INP** — як швидко бариста реагує, коли ви щось питаєте: ви натиснули «Записатися», і далі або відкривається форма, або нічого не відбувається півсекунди, і ви тиснете ще раз. **CLS** — чи не пересувають під вами стіл: ви вже націлилися на кнопку, і в цей момент зверху вантажиться банер, усе з'їжджає вниз, і палець потрапляє не туди."),
  p("Це вимір не «краси коду», а звичайного роздратування: людина, яка двічі тицьнула в кнопку без реакції, рідко доходить до заявки."),

  h2("Три метрики: що вимірюють і що їх ламає"),
  p("Склад Core Web Vitals на 2026 рік — з порогами Google і найчастішими причинами провалу."),
  table(
    ["Метрика", "Що вимірює", "Добре значення", "Що зазвичай ламає"],
    [
      ["**LCP** (Largest Contentful Paint)", "Коли на екрані з'явився найбільший видимий елемент — банер, головне фото або великий заголовок", "до 2,5 с", "Важке необроблене зображення в першому екрані, повільний хостинг, шрифти і сторонні скрипти, що блокують рендер"],
      ["**INP** (Interaction to Next Paint)", "Скільки браузер думає після кліку, тапу або вводу — береться найгірша взаємодія за візит", "до 200 мс", "Десяток сторонніх скриптів, важкі чати й віджети, JavaScript, який починає рахувати саме в момент кліку"],
      ["**CLS** (Cumulative Layout Shift)", "Наскільки сильно контент стрибає під час завантаження сторінки", "до 0,1", "Зображення без заданих розмірів, банери й куки-плашки, що вставляються зверху, шрифти, які підміняються після завантаження"],
    ]
  ),

  h3("Чому в списку немає FID"),
  p("До березня 2024 третьою метрикою був FID — First Input Delay. Він міряв лише затримку до початку обробки першої взаємодії, тому майже всі сайти проходили його «на зеленому», навіть якщо після кліку інтерфейс завмирав на секунду. INP міряє повний шлях: від дотику до моменту, коли браузер намалював відповідь на екрані. Якщо ви читаєте статтю чи чекліст, де досі фігурує FID, — це матеріал старший за два роки, і поради там теж застаріли."),

  h2("Лабораторні дані проти польових"),
  p("У PageSpeed Insights два блоки, і плутають їх постійно. Верхній — польові дані з CrUX: реальні візити користувачів Chrome за останні 28 днів. Нижній — лабораторний прогін Lighthouse: один запуск робота на емульованому середньому мобільному з обмеженою мережею, без вашого кешу і без реальної поведінки людей."),
  p("Числа розходяться майже завжди, і це нормально:"),
  li("Лабораторія — один прогін на одному пристрої. Поле — тисячі візитів, зокрема зі старих Android і поганого мобільного інтернету."),
  li("Лабораторія не клікає. INP у ній фактично не міряється — тільки оцінюється потенційна затримка."),
  li("Поле накопичується 28 днів. Ви виправили LCP учора — у Search Console це проявиться за кілька тижнів."),
  li("Якщо трафіку на сторінці мало, польових даних просто не буде, і Google покаже дані по групі схожих сторінок."),
  p("Висновок простий: лабораторія — щоб знайти причину, поле — щоб оцінити результат."),

  h2("Чи впливають Core Web Vitals на позиції"),
  p("Чесна відповідь: так, але це слабкий фактор. Core Web Vitals входять до сигналів досвіду сторінки і працюють радше як тайбрейкер — коли два матеріали однаково відповідають запиту, швидший має перевагу. Обігнати сильнішого конкурента лише за рахунок зелених метрик не вийде: релевантність і авторитет важать більше."),
  p("Зате на гроші вони впливають напряму. Повільний перший екран — це відмови ще до того, як людина побачила пропозицію. Стрибучий макет — це промахи по кнопках і кинуті форми. Затримка після кліку — це повторні натискання і дублі заявок. Ми бачили це на медичних проєктах: детальний розбір є в статті [швидкість медичного сайту](/blog/shvydkist-medychnoho-saitu)."),

  h2("Як подивитися свої цифри"),
  num("**Google Search Console → Досвід → Основні інтернет-показники.** Головний звіт: польові дані по всьому сайту, окремо для мобільних і десктопу, згруповані за типами сторінок. Якщо ви ще не орієнтуєтесь у панелі, у нас є розбір: [як читати Google Search Console](/blog/yak-chytaty-google-search-console)."),
  num("**PageSpeed Insights.** Перевірка конкретного URL: зверху поле, знизу лабораторія і список конкретних причин."),
  num("**Chrome DevTools, вкладка Performance і панель Lighthouse.** Тут шукають причину: який саме елемент є LCP, який скрипт з'їдає час до відгуку."),
  num("**Розширення Web Vitals для Chrome.** Показує три метрики просто під час звичайного перегляду сайту — зручно для швидкої перевірки конкурентів."),

  h2("Типові помилки"),
  li("**Гонитва за 100 балами.** Сто балів у PageSpeed нічого не додають до позицій і не окупають витрачених годин. Зелена зона — це поріг, а не змагання."),
  li("**Оптимізація лабораторних замість польових.** Класична пастка: бал виріс, а реальні користувачі нічого не помітили, бо їхня проблема була в іншому — у сторонніх скриптах, які робот майже не навантажує."),
  li("**Дивитись одну сторінку.** Метрики збираються по групах схожих URL. Ідеальна головна не рятує, якщо просідають усі картки послуг."),
  li("**Ігнорувати мобільну версію.** Основний трафік мобільний, і саме там LCP і INP зазвичай провалюються."),
  li("**Ставити швидкість останнім пунктом проєкту.** Легкі зображення і мінімум сторонніх скриптів дешевше закласти на етапі верстки, ніж переробляти зданий сайт."),

  h2("Як це виглядає у нас"),
  p("Швидкість у нас не «додаткова опція»: **Lighthouse Performance 90+ входить у кожен пакет** — від лендінгу до кастомної платформи. Це записано в умовах, а не в обіцянках."),
  p("Найпоказовіший приклад — [сайт клініки Efedra](/portfolio/efedra-clinic): **LCP 0,8 секунди** на мобільному, втричі краще за поріг Google. Без магії: сучасні формати зображень, статична генерація, шрифти без блокування рендеру, нуль зайвих скриптів у першому екрані."),
  p("Якщо метрики вже червоні на живому сайті, ми починаємо з технічного аудиту в межах [SEO-супроводу](/seo) — спершу шукаємо, що саме тримає LCP і INP, і лише потім щось чіпаємо."),

  cta(
    "Червоні Core Web Vitals у Search Console?",
    "Подивимось польові дані вашого сайту, знайдемо реальні причини і скажемо, що дасть ефект, а що — просто гарний бал.",
    "Замовити технічний аудит",
    "/seo"
  ),
];

/* ------------------------------------------------------------------ RU */

const bodyRu = [
  tldr("Коротко", [
    "Core Web Vitals — три метрики Google о реальном опыте посетителя: LCP (скорость появления главного блока), INP (скорость реакции на клик), CLS (стабильность вёрстки).",
    "Хорошо — это LCP до 2,5 с, INP до 200 мс, CLS до 0,1 в 75% реальных визитов.",
    "FID больше не используется: в марте 2024 его заменил INP.",
    "На позиции влияют, но слабо. На конверсию и отказы — сильно.",
    "Лабораторные баллы PageSpeed и полевые данные CrUX почти всегда расходятся. Решения принимают по полевым.",
    "Во всех наших пакетах Lighthouse Performance 90+, в кейсе клиники Efedra LCP — 0,8 с.",
  ]),

  p("**Core Web Vitals** — это три показателя Google, которые измеряют, насколько быстро и стабильно страница работает для живого человека: LCP показывает, когда отрисовался самый крупный видимый элемент, INP — сколько браузер думает после клика, CLS — не прыгает ли контент во время загрузки. Google считает результат хорошим, если в 75% реальных визитов LCP не превышает 2,5 секунды, INP — 200 миллисекунд, а CLS — 0,1."),
  p("Сразу снимем главную путаницу: Core Web Vitals — это не «оценка сайта» и не балл от 0 до 100. Балл в PageSpeed Insights считает робот на эмуляции, а Core Web Vitals собираются из браузеров Chrome ваших настоящих посетителей. Поэтому зелёные 95 баллов и красные Core Web Vitals в Search Console спокойно уживаются на одном сайте."),

  h2("Простыми словами"),
  p("Представьте, что сайт — это кофейня. **LCP** — время, за которое вам вынесли кофе: пока его нет, вы просто стоите у стойки и не понимаете, заметили вас вообще или нет. **INP** — как быстро бариста реагирует на вопрос: вы нажали «Записаться», и дальше либо открывается форма, либо полсекунды не происходит ничего, и вы жмёте ещё раз. **CLS** — не двигают ли под вами стол: вы уже прицелились в кнопку, и в этот момент сверху грузится баннер, всё съезжает вниз, и палец попадает не туда."),
  p("Это измерение не «красоты кода», а обычного раздражения: человек, дважды ткнувший в кнопку без реакции, редко доходит до заявки."),

  h2("Три метрики: что измеряют и что их ломает"),
  p("Состав Core Web Vitals на 2026 год — с порогами Google и самыми частыми причинами провала."),
  table(
    ["Метрика", "Что измеряет", "Хорошее значение", "Что обычно ломает"],
    [
      ["**LCP** (Largest Contentful Paint)", "Когда на экране появился самый крупный видимый элемент — баннер, главное фото или большой заголовок", "до 2,5 с", "Тяжёлое необработанное изображение в первом экране, медленный хостинг, шрифты и сторонние скрипты, блокирующие рендер"],
      ["**INP** (Interaction to Next Paint)", "Сколько браузер думает после клика, тапа или ввода — берётся худшее взаимодействие за визит", "до 200 мс", "Десяток сторонних скриптов, тяжёлые чаты и виджеты, JavaScript, который начинает считать прямо в момент клика"],
      ["**CLS** (Cumulative Layout Shift)", "Насколько сильно контент прыгает во время загрузки страницы", "до 0,1", "Изображения без заданных размеров, баннеры и куки-плашки, вставляемые сверху, шрифты, подменяемые после загрузки"],
    ]
  ),

  h3("Почему в списке нет FID"),
  p("До марта 2024 третьей метрикой был FID — First Input Delay. Он мерил только задержку до начала обработки первого взаимодействия, поэтому почти все сайты проходили его «на зелёном», даже если после клика интерфейс замирал на секунду. INP мерит весь путь: от касания до момента, когда браузер отрисовал ответ. Если вы читаете статью или чек-лист, где до сих пор фигурирует FID, — материал старше двух лет, и советы там тоже устарели."),

  h2("Лабораторные данные против полевых"),
  p("В PageSpeed Insights два блока, и их путают постоянно. Верхний — полевые данные из CrUX: реальные визиты пользователей Chrome за последние 28 дней. Нижний — лабораторный прогон Lighthouse: один запуск робота на эмулированном среднем мобильном с урезанной сетью, без вашего кэша и без реального поведения людей."),
  p("Цифры расходятся почти всегда, и это нормально:"),
  li("Лаборатория — один прогон на одном устройстве. Поле — тысячи визитов, в том числе со старых Android и плохого мобильного интернета."),
  li("Лаборатория не кликает. INP в ней фактически не измеряется — только оценивается потенциальная задержка."),
  li("Поле накапливается 28 дней. Вы починили LCP вчера — в Search Console это проявится через несколько недель."),
  li("Если трафика на странице мало, полевых данных просто не будет, и Google покажет данные по группе похожих страниц."),
  p("Вывод простой: лаборатория — чтобы найти причину, поле — чтобы оценить результат."),

  h2("Влияют ли Core Web Vitals на позиции"),
  p("Честный ответ: да, но это слабый фактор. Core Web Vitals входят в сигналы опыта страницы и работают скорее как тайбрейкер — когда два материала одинаково отвечают запросу, более быстрый получает преимущество. Обогнать более сильного конкурента только за счёт зелёных метрик не выйдет: релевантность и авторитет весят больше."),
  p("Зато на деньги они влияют напрямую. Медленный первый экран — это отказы ещё до того, как человек увидел предложение. Прыгающий макет — промахи по кнопкам и брошенные формы. Задержка после клика — повторные нажатия и дубли заявок. Мы видели это на медицинских проектах: подробный разбор есть в статье [скорость медицинского сайта](/ru/blog/skorost-medicinskogo-sayta)."),

  h2("Как посмотреть свои цифры"),
  num("**Google Search Console → Опыт → Основные интернет-показатели.** Главный отчёт: полевые данные по всему сайту, отдельно для мобильных и десктопа, сгруппированные по типам страниц. Если вы ещё не ориентируетесь в панели, у нас есть разбор: [как читать Google Search Console](/ru/blog/kak-chitat-google-search-console)."),
  num("**PageSpeed Insights.** Проверка конкретного URL: сверху поле, снизу лаборатория и список конкретных причин."),
  num("**Chrome DevTools, вкладка Performance и панель Lighthouse.** Здесь ищут причину: какой именно элемент является LCP, какой скрипт съедает время до отклика."),
  num("**Расширение Web Vitals для Chrome.** Показывает три метрики прямо во время обычного просмотра сайта — удобно для быстрой проверки конкурентов."),

  h2("Типичные ошибки"),
  li("**Погоня за 100 баллами.** Сто баллов в PageSpeed ничего не добавляют к позициям и не окупают потраченных часов. Зелёная зона — это порог, а не соревнование."),
  li("**Оптимизация лабораторных вместо полевых.** Классическая ловушка: балл вырос, а реальные пользователи ничего не заметили, потому что их проблема была в другом — в сторонних скриптах, которые робота почти не нагружают."),
  li("**Смотреть одну страницу.** Метрики собираются по группам похожих URL. Идеальная главная не спасает, если проседают все карточки услуг."),
  li("**Игнорировать мобильную версию.** Основной трафик мобильный, и именно там LCP и INP обычно проваливаются."),
  li("**Ставить скорость последним пунктом проекта.** Лёгкие изображения и минимум сторонних скриптов дешевле заложить на этапе вёрстки, чем переделывать сданный сайт."),

  h2("Как это выглядит у нас"),
  p("Скорость у нас не «дополнительная опция»: **Lighthouse Performance 90+ входит в каждый пакет** — от лендинга до кастомной платформы. Это записано в условиях, а не в обещаниях."),
  p("Самый показательный пример — [сайт клиники Efedra](/ru/portfolio/efedra-clinic): **LCP 0,8 секунды** на мобильном, втрое лучше порога Google. Без магии: современные форматы изображений, статическая генерация, шрифты без блокировки рендера, ноль лишних скриптов в первом экране."),
  p("Если метрики уже красные на живом сайте, мы начинаем с технического аудита в рамках [SEO-сопровождения](/ru/seo) — сначала ищем, что именно держит LCP и INP, и только потом что-то трогаем."),

  cta(
    "Красные Core Web Vitals в Search Console?",
    "Посмотрим полевые данные вашего сайта, найдём реальные причины и скажем, что даст эффект, а что — просто красивый балл.",
    "Заказать технический аудит",
    "/ru/seo"
  ),
];

/* ------------------------------------------------------------------ EN */

const bodyEn = [
  tldr("In short", [
    "Three Google metrics from real visits: LCP (main block appears), INP (response to a click), CLS (layout stability).",
    "Good means LCP under 2.5s, INP under 200ms, CLS under 0.1 across 75% of real visits.",
    "FID is gone: INP replaced it in March 2024.",
    "They affect rankings, but weakly. They affect conversion and bounce rate far more.",
    "PageSpeed lab scores and CrUX field data almost always disagree; judge by field data.",
    "Every package ships with Lighthouse Performance 90+; our Efedra clinic case runs an LCP of 0.8s.",
  ]),

  p("**Core Web Vitals** are three Google metrics that measure how fast and how stable a page feels to a real person: LCP marks when the largest visible element is painted, INP measures how long the browser thinks after a click, and CLS tracks whether content jumps around while the page loads. Google calls the result good when 75% of real visits stay under 2.5 seconds for LCP, 200 milliseconds for INP and 0.1 for CLS."),
  p("One confusion worth clearing up: Core Web Vitals are not a site score out of 100. The PageSpeed score comes from a robot on an emulated device; Core Web Vitals come from the Chrome browsers of your actual visitors. A green 95 and red Core Web Vitals in Search Console coexist happily on the same site."),

  h2("In plain English"),
  p("Think of a website as a coffee shop. **LCP** is how long the coffee takes to arrive: until then you stand at the counter, unsure anyone noticed you. **INP** is how fast the barista answers: you tap “Book a call”, and either the form opens or nothing happens and you tap again. **CLS** is whether the table moves while you sit down: you aim at a button, a banner loads above it, your finger lands elsewhere."),
  p("None of this is about elegant code — it measures ordinary irritation. Someone who taps a dead button twice rarely finishes the enquiry form."),

  h2("The three metrics: what they measure and what breaks them"),
  p("The full set as of 2026, with Google's thresholds and the causes we see most often on audits."),
  table(
    ["Metric", "What it measures", "Good value", "What usually breaks it"],
    [
      ["**LCP** (Largest Contentful Paint)", "When the largest visible element is painted — hero image, big heading, main banner", "under 2.5s", "A heavy unprocessed image above the fold, slow hosting, render-blocking fonts and scripts"],
      ["**INP** (Interaction to Next Paint)", "How long the browser takes to answer a click or tap — the worst interaction of the visit counts", "under 200ms", "A dozen third-party scripts, heavy chat and booking widgets, JavaScript that starts calculating on click"],
      ["**CLS** (Cumulative Layout Shift)", "How much the content jumps while the page loads", "under 0.1", "Images without declared dimensions, banners and cookie bars injected at the top, fonts swapped after load"],
    ]
  ),

  h3("Why FID is not on the list"),
  p("Until March 2024 the third metric was FID, First Input Delay. It only measured the delay before the browser began handling the first interaction, so nearly every site passed it even when the interface froze after the click. INP measures the whole round trip: from tap to painted response. A guide that still lists FID is two years out of date."),

  h2("Lab data versus field data"),
  p("PageSpeed Insights shows two blocks and they get mixed up constantly. The top one is field data from CrUX: real Chrome visits over the last 28 days. The bottom one is a Lighthouse lab run on an emulated mid-range phone with a throttled connection."),
  p("The numbers rarely match, and that is expected:"),
  li("Lab is one run on one device. Field is thousands of visits, including old phones on poor connections."),
  li("The lab never clicks anything. INP is not truly measured there — only a potential delay is estimated."),
  li("Field data accumulates over 28 days. You fixed LCP yesterday; Search Console will show it weeks from now."),
  li("With little traffic there is no field data at all, and Google reports a group of similar pages instead."),
  p("The rule: lab data to find the cause, field data to judge the result."),

  h2("Do Core Web Vitals affect rankings?"),
  p("Honestly: yes, but weakly. They sit inside the page experience signals and work like a tiebreaker — when two pages answer the query equally well, the faster one wins. Green metrics alone will not beat a stronger competitor; relevance and authority weigh more."),
  p("Revenue is where they hit directly: bounces before anyone reads the offer, missed taps on a shifting layout, double submissions after a laggy click. More detail for healthcare projects: [medical website speed](/en/blog/medical-website-speed)."),

  h2("How to check your own numbers"),
  num("**Google Search Console → Experience → Core Web Vitals.** Field data for the whole site, split by mobile and desktop, grouped by page type. New to the panel? Start with [Google Search Console for business owners](/en/blog/google-search-console-for-business-owners)."),
  num("**PageSpeed Insights.** One URL: field data on top, the lab run and concrete causes underneath."),
  num("**Chrome DevTools: Performance tab and Lighthouse panel.** Where you find the cause — which element is the LCP, which script eats the response time."),
  num("**The Web Vitals Chrome extension.** Shows all three metrics as you browse — handy for checking competitors."),

  h2("Common mistakes"),
  li("**Chasing a score of 100.** A perfect PageSpeed score adds nothing to rankings. The green band is a threshold, not a competition."),
  li("**Optimising lab instead of field.** The score goes up, real users notice nothing, because their bottleneck was elsewhere — usually third-party scripts the robot barely loads."),
  li("**Looking at a single page.** Metrics are grouped across similar URLs. A perfect homepage does not help if every service page fails."),
  li("**Ignoring mobile.** Most traffic is mobile, and mobile is exactly where LCP and INP tend to fail."),
  li("**Leaving speed until the end.** Light images, sensible fonts and few third-party scripts cost nothing during build and a fortune to retrofit."),

  h2("How we handle it"),
  p("Speed is not an upsell here: **Lighthouse Performance 90+ is part of every package**, from a landing page to a custom platform — written into the terms, not the sales pitch."),
  p("The clearest example is the [Efedra clinic site](/en/portfolio/efedra-clinic): an **LCP of 0.8 seconds** on mobile, three times better than Google's threshold. Nothing clever behind it — modern image formats, static pages, non-blocking fonts, no stray scripts above the fold."),
  p("If your live site is already in the red, we start with a technical audit inside [SEO support](/en/seo) — work out what actually holds LCP and INP before changing anything. European build quality at sensible rates."),

  cta(
    "Core Web Vitals in the red?",
    "We will read your field data, find the real causes and tell you what actually moves the needle.",
    "Request a technical audit",
    "/en/seo"
  ),
];

/* ---------------------------------------------------------------- DOC */

const doc = {
  _id: "glos2026-shcho-take-core-web-vitals",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 6,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-core-web-vitals" },
    ru: { _type: "slug", current: "chto-takoe-core-web-vitals" },
    en: { _type: "slug", current: "what-are-core-web-vitals" },
  },
  title: {
    _type: "localizedString",
    uk: "Core Web Vitals — що це і як їх читати",
    ru: "Core Web Vitals — что это и как их читать",
    en: "What Are Core Web Vitals and How to Read Them",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Core Web Vitals — що це простими словами",
    ru: "Core Web Vitals — что это простыми словами",
    en: "What Are Core Web Vitals: LCP, INP, CLS",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Core Web Vitals простими словами: LCP, INP і CLS. ✔️ Які значення добрі ✔️ Чим поле відрізняється від лабораторії ➡ Як подивитися свої цифри.",
    ru: "➤ Core Web Vitals простыми словами: LCP, INP и CLS. ✔️ Какие значения хорошие ✔️ Чем поле отличается от лаборатории ➡ Как посмотреть свои цифры.",
    en: "➤ Core Web Vitals explained: LCP, INP and CLS. ✔️ What counts as a good value ✔️ Why lab and field data disagree ➡ How to check your own numbers in GSC.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Словник",
    ru: "Словарь",
    en: "Glossary",
  },
  lede: {
    _type: "localizedString",
    uk: "Три метрики Google, три пороги і одна поширена помилка — оптимізувати бал замість реальних користувачів. Розбираємо LCP, INP і CLS без термінології заради термінології.",
    ru: "Три метрики Google, три порога и одна частая ошибка — оптимизировать балл вместо реальных пользователей. Разбираем LCP, INP и CLS без терминологии ради терминологии.",
    en: "Three Google metrics, three thresholds and one common mistake: optimising the score instead of the actual users. LCP, INP and CLS, explained without the jargon.",
  },
  tags: ["core web vitals", "швидкість сайту", "технічне SEO"],
  relatedPostSlugs: ["shvydkist-medychnoho-saitu", "yak-chytaty-google-search-console", "shcho-take-seo"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(),
      _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що таке Core Web Vitals простими словами?",
        ru: "Что такое Core Web Vitals простыми словами?",
        en: "What are Core Web Vitals in simple terms?",
      },
      answer: {
        _type: "localizedText",
        uk: "Це три числа, які Google збирає з браузерів реальних відвідувачів: як швидко з'явився головний блок сторінки (LCP), як швидко сайт відреагував на клік (INP) і наскільки контент стрибав під час завантаження (CLS). По суті це вимір роздратування користувача, а не якості коду.",
        ru: "Это три числа, которые Google собирает из браузеров реальных посетителей: как быстро появился главный блок страницы (LCP), как быстро сайт отреагировал на клик (INP) и насколько контент прыгал при загрузке (CLS). По сути это измерение раздражения пользователя, а не качества кода.",
        en: "They are three numbers Google collects from real visitors' browsers: how fast the main block of the page appeared (LCP), how fast the site responded to a click (INP), and how much the content jumped while loading (CLS). In practice they measure user irritation, not code quality.",
      },
    },
    {
      _key: key(),
      _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Які значення Core Web Vitals вважаються добрими?",
        ru: "Какие значения Core Web Vitals считаются хорошими?",
        en: "What counts as a good Core Web Vitals score?",
      },
      answer: {
        _type: "localizedText",
        uk: "LCP до 2,5 секунди, INP до 200 мілісекунд, CLS до 0,1. Важлива деталь: поріг має витримуватись у 75% реальних візитів, окремо для мобільних і десктопу. Один вдалий тест на швидкому ноутбуці нічого не доводить.",
        ru: "LCP до 2,5 секунды, INP до 200 миллисекунд, CLS до 0,1. Важная деталь: порог должен выдерживаться в 75% реальных визитов, отдельно для мобильных и десктопа. Один удачный тест на быстром ноутбуке ничего не доказывает.",
        en: "LCP under 2.5 seconds, INP under 200 milliseconds, CLS under 0.1. The detail that matters: the threshold has to hold across 75% of real visits, measured separately for mobile and desktop. One good test on a fast laptop proves nothing.",
      },
    },
    {
      _key: key(),
      _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи впливають Core Web Vitals на позиції в Google?",
        ru: "Влияют ли Core Web Vitals на позиции в Google?",
        en: "Do Core Web Vitals affect Google rankings?",
      },
      answer: {
        _type: "localizedText",
        uk: "Впливають, але це слабкий фактор — радше тайбрейкер між сторінками, які однаково відповідають запиту. Релевантність контенту і авторитет домену важать значно більше. Реальна вигода від зелених метрик — менше відмов і більше заявок, а не стрибок у видачі.",
        ru: "Влияют, но это слабый фактор — скорее тайбрейкер между страницами, которые одинаково отвечают запросу. Релевантность контента и авторитет домена весят намного больше. Реальная выгода от зелёных метрик — меньше отказов и больше заявок, а не скачок в выдаче.",
        en: "They do, but weakly — more of a tiebreaker between pages that answer the query equally well. Content relevance and domain authority weigh much more. The real payoff of green metrics is fewer bounces and more enquiries, not a jump in the rankings.",
      },
    },
    {
      _key: key(),
      _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чому PageSpeed показує 95 балів, а Search Console — «потребує покращення»?",
        ru: "Почему PageSpeed показывает 95 баллов, а Search Console — «требует улучшения»?",
        en: "Why does PageSpeed show 95 while Search Console says “needs improvement”?",
      },
      answer: {
        _type: "localizedText",
        uk: "Тому що це різні дані. Бал PageSpeed — лабораторний прогін робота в стерильних умовах, а Search Console показує польові дані реальних користувачів Chrome за 28 днів: старі телефони, поганий інтернет, увімкнені сторонні скрипти. Орієнтуватися треба на польові цифри, лабораторні потрібні лише для пошуку причини.",
        ru: "Потому что это разные данные. Балл PageSpeed — лабораторный прогон робота в стерильных условиях, а Search Console показывает полевые данные реальных пользователей Chrome за 28 дней: старые телефоны, плохой интернет, включённые сторонние скрипты. Ориентироваться нужно на полевые цифры, лабораторные нужны только для поиска причины.",
        en: "Because they are different datasets. The PageSpeed score is a lab run by a robot in sterile conditions, while Search Console reports field data from real Chrome users over 28 days: old phones, poor connections, all the third-party scripts running. Judge by the field numbers; the lab run is only there to help you find the cause.",
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
