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
    "Юзабіліті — це зручність користування сайтом: наскільки легко відвідувач знаходить потрібне і доходить до заявки.",
    "Дизайн — про те, як сайт виглядає. Юзабіліті — про те, як ним користуватися. UX — про враження від усього досвіду, включно з тим, як швидко ви передзвонили.",
    "П'ять ознак поганого юзабіліті видно неозброєним оком: незрозумілий перший екран, довгий шлях до заявки, роздута форма, відсутність цін, поламана мобільна версія.",
    "Перевірити можна без інструментів: правило п'яти секунд і тест на родичі, який не в темі.",
    "В аналітиці дивіться відмови, глибину перегляду і шлях до заявки — саме там видно, на якому кроці людина здається.",
  ]),

  p("**Юзабіліті — це зручність користування сайтом:** наскільки швидко й без зусиль відвідувач розуміє, куди він потрапив, знаходить потрібну інформацію і доходить до цільової дії — заявки, дзвінка чи покупки. Якщо людина відкрила сторінку, за п'ять секунд зрозуміла, чим ви займаєтесь, і за два-три кроки залишила контакт — з юзабіліті все гаразд. Якщо вона шукає ціну, не знаходить і закриває вкладку — юзабіліті погане, і неважливо, скільки коштував дизайн."),

  p("У стандарті ISO 9241 юзабіліті визначають через три речі: результативність, ефективність і задоволеність. Для власника бізнесу це перекладається просто: скільки з тих, хто зайшов, дійшли до заявки і скільки зійшли з дистанції дорогою."),

  h2("Юзабіліті простими словами"),
  p("Уявіть офлайн-магазин. Вітрина — це дизайн: вона формує враження про рівень. Юзабіліті — це те, як усередині розставлені полиці, чи є цінники і чи видно касу. Красива вітрина з хаосом усередині продає гірше за скромну вітрину з логічною викладкою."),
  p("Сайт працює так само. Людина його не читає, а сканує: чіпляється за заголовки, кнопки і цифри. Хороше юзабіліті — коли на кожному екрані очевидно, що робити далі."),

  h2("Чим юзабіліті відрізняється від дизайну та UX"),
  p("Це три різні речі, які постійно плутають, і плутанина коштує грошей — бо замовляють одне, а проблема в іншому."),
  p("**Дизайн** — це візуальний бік: типографіка, кольори, сітка, ілюстрації. Він відповідає за перше враження і довіру: сайт виглядає як бізнес, з яким не страшно мати справу."),
  p("**Юзабіліті** — це зручність взаємодії. Чи зрозуміла навігація, чи видно кнопку, чи не просить форма зайвого, чи працює все пальцем на телефоні. Юзабіліті вимірюється: відсотком тих, хто дійшов до мети, і кількістю кроків на цьому шляху."),
  p("**UX (user experience)** — ширше поняття: увесь досвід контакту з компанією. Сюди входить і швидкість завантаження, і лист-підтвердження після заявки, і те, чи передзвонив менеджер за обіцяні п'ятнадцять хвилин. Можна мати ідеальне юзабіліті сайту і жахливий UX, якщо заявки обробляють через день."),
  p("Практичний висновок: якщо сайт красивий, але заявок мало — проблема майже завжди в юзабіліті, а не в дизайні. Про конкретні прийоми ми писали в матеріалі [9 дизайн-прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),

  h2("П'ять ознак поганого юзабіліті"),
  p("П'ять проблем, які ми бачимо на кожному другому сайті. Кожну можна перевірити за хвилину — без інструментів і без розробника."),
  table(
    ["Ознака", "Чим це шкодить", "Як перевірити за хвилину"],
    [
      ["Незрозуміло з першого екрана, чим займається компанія", "Людина не розуміє, чи туди потрапила, і повертається у видачу", "Відкрийте головну і прочитайте лише заголовок. Якщо з нього незрозуміло, що ви продаєте і кому, — це проблема"],
      ["Більше трьох кроків до заявки", "На кожному зайвому кроці відсіюється частина людей", "Порахуйте кліки від головної до відправленої форми. Більше трьох — шлях довгий"],
      ["Форма просить зайве", "Кожне зайве поле знижує кількість відправок", "Порахуйте поля. Для першого контакту достатньо імені й телефону; ІПН, адреса та «звідки про нас дізнались» — це втрачені заявки"],
      ["Немає цін або хоча б вилки", "Відвідувач іде до конкурента, у якого ціна є, і там і залишається", "Пошукайте на сайті будь-яку цифру в гривнях або доларах. Якщо її немає — ви віддаєте трафік"],
      ["На мобільному все ламається", "Понад половина трафіку — телефон; там і втрачається більшість заявок", "Відкрийте сайт на своєму телефоні й спробуйте залишити заявку однією рукою, не масштабуючи сторінку"],
    ],
  ),

  h2("Як перевірити юзабіліті самому, без інструментів"),
  p("Почніть із двох тестів, які не коштують нічого."),
  h3("Правило п'яти секунд"),
  p("Відкрийте головну сторінку, порахуйте до п'яти й закрийте її. Тепер дайте відповідь: чим займається компанія, для кого вона і що ви маєте зробити далі. Якщо на будь-яке з трьох питань відповіді немає — перший екран не працює. Той самий тест зробіть із посадковими сторінками послуг: до них люди приходять із пошуку, часто не бачивши головної взагалі."),
  h3("Тест на родичі"),
  p("Візьміть людину, яка не має стосунку ні до вашого бізнесу, ні до маркетингу, дайте телефон і сформулюйте завдання: «дізнайся, скільки коштує послуга X, і запишись». Далі мовчіть і дивіться: де зупиняється, куди тицяє не туди, в який момент питає «а де тут?». Трьох таких людей достатньо, щоб знайти майже всі критичні проблеми. Записуйте дії, а не думки: «краще синю кнопку» — не дані, «двічі промахнувся повз пункт меню» — дані."),

  h2("Що дивитись в аналітиці"),
  p("Тести показують, де людині незручно. Аналітика показує, скільки таких людей і скільки це коштує. Мінімальний набір метрик:"),
  li("**Відсоток відмов на посадкових сторінках.** Різкий стрибок на одній сторінці порівняно з рештою — сигнал, що там або не той контент, або незрозумілий наступний крок."),
  li("**Глибина перегляду.** Якщо люди дивляться одну сторінку й ідуть, значить, з неї нікуди не хочеться йти: немає ані переходів на послуги, ані посилань на кейси."),
  li("**Шлях до заявки.** Побудуйте послідовність «сторінка послуги → форма → подяка» і подивіться, на якому кроці обсипається найбільше. Найчастіше це саме форма."),
  li("**Мобільний окремо від десктопа.** Конверсія на телефоні вдвічі нижча за десктопну — це майже завжди технічна або верстальна проблема, а не поведінка аудиторії."),
  li("**Час на сторінці з цінами.** Довго й без переходу далі — прайс незрозумілий. Швидко й геть із сайту — ціна злякала, і краще пояснити, з чого вона складається."),

  h2("Типові помилки"),
  li("Кнопка, яка нічого не обіцяє. «Дізнатися більше» програє «Розрахувати вартість» — про це докладніше в статті [що таке CTA](/blog/shcho-take-cta)."),
  li("Меню на дванадцять пунктів. Чим більше варіантів, тим довше вибір і тим частіше людина не обирає нічого."),
  li("Текст суцільним полотном без підзаголовків. Його не читають — його прогортують до кінця й закривають."),
  li("Форма зворотного дзвінка, яка спливає на третій секунді. Людина ще не зрозуміла, куди потрапила, а її вже про щось просять."),
  li("Редизайн заради краси, після якого падає й конверсія, і трафік. Як цього уникнути — у матеріалі про [редизайн без втрати SEO](/blog/redyzain-bez-vtraty-seo)."),

  h2("Скільки це дає на практиці"),
  p("Юзабіліті — рідкісний випадок, коли результат видно швидко: трафік той самий, а заявок більше. Для клініки «Ефедра» ми переробили структуру сторінок і шлях до запису — прибрали зайві кроки, винесли ціни й запис на видне місце. Результат — [зростання кількості заявок у 3,2 раза](/portfolio/efedra-clinic) на тому самому обсязі трафіку."),

  cta(
    "Безкоштовний розбір вашого сайту",
    "Подивимось перший екран, шлях до заявки, форму й мобільну версію — і скажемо, що виправити першим. Без зобов'язань.",
    "Отримати розбір",
    "/contacts",
  ),
];

/* ─────────────────────────── RU ─────────────────────────── */

const bodyRu = [
  tldr("Коротко", [
    "Юзабилити — это удобство пользования сайтом: насколько легко посетитель находит нужное и доходит до заявки.",
    "Дизайн — про то, как сайт выглядит. Юзабилити — про то, как им пользоваться. UX — про впечатление от всего опыта, включая скорость вашего звонка.",
    "Пять признаков плохого юзабилити видно невооружённым глазом: непонятный первый экран, длинный путь до заявки, раздутая форма, отсутствие цен, сломанная мобильная версия.",
    "Проверить можно без инструментов: правило пяти секунд и тест на родственнике, который не в теме.",
    "В аналитике смотрите отказы, глубину просмотра и путь до заявки — там видно, на каком шаге человек сдаётся.",
  ]),

  p("**Юзабилити — это удобство пользования сайтом:** насколько быстро и без усилий посетитель понимает, куда он попал, находит нужную информацию и доходит до целевого действия — заявки, звонка или покупки. Если человек открыл страницу, за пять секунд понял, чем вы занимаетесь, и в два-три шага оставил контакт — с юзабилити всё в порядке. Если он ищет цену, не находит и закрывает вкладку — юзабилити плохое, и неважно, сколько стоил дизайн."),

  p("В стандарте ISO 9241 юзабилити определяют через три вещи: результативность, эффективность и удовлетворённость. Для владельца бизнеса это переводится просто: сколько из зашедших дошли до заявки и сколько сошли с дистанции по пути."),

  h2("Юзабилити простыми словами"),
  p("Представьте офлайн-магазин. Витрина — это дизайн: она формирует впечатление об уровне. Юзабилити — это то, как внутри расставлены полки, есть ли ценники и видно ли кассу. Красивая витрина с хаосом внутри продаёт хуже скромной витрины с логичной выкладкой."),
  p("Сайт работает так же. Человек его не читает, а сканирует: цепляется за заголовки, кнопки и цифры. Хорошее юзабилити — когда на каждом экране очевидно, что делать дальше."),

  h2("Чем юзабилити отличается от дизайна и UX"),
  p("Это три разные вещи, которые постоянно путают, и путаница стоит денег — потому что заказывают одно, а проблема в другом."),
  p("**Дизайн** — это визуальная сторона: типографика, цвета, сетка, иллюстрации. Он отвечает за первое впечатление и доверие: сайт выглядит как бизнес, с которым не страшно иметь дело."),
  p("**Юзабилити** — это удобство взаимодействия. Понятна ли навигация, видно ли кнопку, не просит ли форма лишнего, работает ли всё пальцем на телефоне. Юзабилити измеряется: процентом дошедших до цели и количеством шагов на этом пути."),
  p("**UX (user experience)** — понятие шире: весь опыт контакта с компанией. Сюда входит и скорость загрузки, и письмо-подтверждение после заявки, и то, перезвонил ли менеджер за обещанные пятнадцать минут. Можно иметь идеальное юзабилити сайта и ужасный UX, если заявки обрабатывают через день."),
  p("Практический вывод: если сайт красивый, а заявок мало — проблема почти всегда в юзабилити, а не в дизайне. О конкретных приёмах мы писали в материале [9 дизайн-приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),

  h2("Пять признаков плохого юзабилити"),
  p("Пять проблем, которые мы видим на каждом втором сайте. Каждую можно проверить за минуту — без инструментов и без разработчика."),
  table(
    ["Признак", "Чем это вредит", "Как проверить за минуту"],
    [
      ["Непонятно с первого экрана, чем занимается компания", "Человек не понимает, туда ли попал, и возвращается в выдачу", "Откройте главную и прочитайте только заголовок. Если из него неясно, что вы продаёте и кому, — это проблема"],
      ["Больше трёх шагов до заявки", "На каждом лишнем шаге отсеивается часть людей", "Посчитайте клики от главной до отправленной формы. Больше трёх — путь длинный"],
      ["Форма просит лишнее", "Каждое лишнее поле снижает число отправок", "Посчитайте поля. Для первого контакта хватит имени и телефона; ИНН, адрес и «откуда о нас узнали» — это потерянные заявки"],
      ["Нет цен или хотя бы вилки", "Посетитель уходит к конкуренту, у которого цена есть, и там и остаётся", "Найдите на сайте любую цифру в деньгах. Если её нет — вы отдаёте трафик"],
      ["На мобильном всё ломается", "Больше половины трафика — телефон; там и теряется большинство заявок", "Откройте сайт на своём телефоне и попробуйте оставить заявку одной рукой, не масштабируя страницу"],
    ],
  ),

  h2("Как проверить юзабилити самому, без инструментов"),
  p("Начните с двух тестов, которые не стоят ничего."),
  h3("Правило пяти секунд"),
  p("Откройте главную страницу, досчитайте до пяти и закройте её. Теперь ответьте: чем занимается компания, для кого она и что вам нужно сделать дальше. Если хотя бы на один вопрос ответа нет — первый экран не работает. Тот же тест проделайте с посадочными страницами услуг: на них люди приходят из поиска, часто не видев главную вообще."),
  h3("Тест на родственнике"),
  p("Возьмите человека, не имеющего отношения ни к вашему бизнесу, ни к маркетингу, дайте телефон и сформулируйте задачу: «узнай, сколько стоит услуга X, и запишись». Дальше молчите и смотрите: где останавливается, куда тыкает не туда, в какой момент спрашивает «а где тут?». Трёх таких людей достаточно, чтобы найти почти все критичные проблемы. Записывайте действия, а не мнения: «лучше синюю кнопку» — не данные, «дважды промахнулся мимо пункта меню» — данные."),

  h2("Что смотреть в аналитике"),
  p("Тесты показывают, где человеку неудобно. Аналитика показывает, сколько таких людей и сколько это стоит. Минимальный набор метрик:"),
  li("**Процент отказов на посадочных страницах.** Резкий скачок на одной странице по сравнению с остальными — сигнал, что там либо не тот контент, либо непонятный следующий шаг."),
  li("**Глубина просмотра.** Если люди смотрят одну страницу и уходят, значит, с неё некуда хотеть идти: нет ни переходов на услуги, ни ссылок на кейсы."),
  li("**Путь до заявки.** Постройте последовательность «страница услуги → форма → спасибо» и посмотрите, на каком шаге осыпается больше всего. Чаще всего это как раз форма."),
  li("**Мобильный отдельно от десктопа.** Конверсия на телефоне вдвое ниже десктопной — это почти всегда техническая или вёрсточная проблема, а не поведение аудитории."),
  li("**Время на странице с ценами.** Долго и без перехода дальше — прайс непонятен. Быстро и прочь с сайта — цена напугала, и стоит объяснить, из чего она складывается."),

  h2("Типичные ошибки"),
  li("Кнопка, которая ничего не обещает. «Узнать больше» проигрывает «Рассчитать стоимость» — подробнее в статье [что такое CTA](/ru/blog/chto-takoe-cta)."),
  li("Меню на двенадцать пунктов. Чем больше вариантов, тем дольше выбор и тем чаще человек не выбирает ничего."),
  li("Текст сплошным полотном без подзаголовков. Его не читают — его пролистывают до конца и закрывают."),
  li("Форма обратного звонка, всплывающая на третьей секунде. Человек ещё не понял, куда попал, а его уже о чём-то просят."),
  li("Редизайн ради красоты, после которого падает и конверсия, и трафик. Как этого избежать — в материале про [редизайн без потери SEO](/ru/blog/redizayn-bez-poteri-seo)."),

  h2("Сколько это даёт на практике"),
  p("Юзабилити — редкий случай, когда результат виден быстро: трафик тот же, а заявок больше. Для клиники «Эфедра» мы переработали структуру страниц и путь до записи — убрали лишние шаги, вынесли цены и запись на видное место. Результат — [рост числа заявок в 3,2 раза](/ru/portfolio/efedra-clinic) на том же объёме трафика."),

  cta(
    "Бесплатный разбор вашего сайта",
    "Посмотрим первый экран, путь до заявки, форму и мобильную версию — и скажем, что исправить первым. Без обязательств.",
    "Получить разбор",
    "/ru/contacts",
  ),
];

/* ─────────────────────────── EN ─────────────────────────── */

const bodyEn = [
  tldr("In short", [
    "Usability is how easy a site is to use: how fast a visitor finds what they came for and reaches the enquiry form.",
    "Design is how a site looks; usability is how it works to use; UX is the whole experience, including your callback.",
    "Five signs need no tools to spot: an unclear first screen, a long path to enquiry, a bloated form, no prices, a broken mobile view.",
    "Test it yourself with the five-second rule and a relative who knows nothing about your business.",
    "In analytics, watch bounce rate, pages per session and the path to enquiry.",
  ]),

  p("**Usability is how easy a website is to use:** how quickly a visitor works out where they have landed, finds what they need and completes the action that matters — an enquiry, a call or a purchase. If someone understands what you do within five seconds and leaves their contact details in two or three steps, usability is fine. If they look for a price, cannot find one and close the tab, usability is poor — no matter what the design cost."),

  p("ISO 9241 defines usability through three things: effectiveness, efficiency and satisfaction. For a business owner that translates simply: how many visitors reach the enquiry form, and where the rest drop out."),

  h2("Usability in plain words"),
  p("Think of a shop. The window display is design: it sets expectations. Usability is how the shelves are arranged inside, whether there are price tags and whether the till is visible. A beautiful window with chaos behind it sells less than a modest one with a sensible layout. A website is the same: people scan rather than read, and good usability means the next step is obvious on every screen."),

  h2("Usability vs design vs UX"),
  p("**Design** is the visual layer: typography, colour, grid, illustration. It carries the first impression and credibility."),
  p("**Usability** is the ease of interaction: clear navigation, a visible button, a form that asks only what it needs, everything working with a thumb on a phone. It is measurable — the share of visitors who reach the goal, and the steps it takes."),
  p("**UX (user experience)** is broader — the whole experience of dealing with the company: load speed, the confirmation email, whether anyone called back on time. A site can have perfect usability and terrible UX if enquiries sit unanswered for a day."),
  p("The practical takeaway: if a site looks good but generates few enquiries, the problem is almost always usability rather than design. We covered the specific fixes in [9 design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),

  h2("Five signs of poor usability"),
  p("Five problems we find on every second site we review. Each takes a minute to check — no tools, no developer."),
  table(
    ["Sign", "Why it hurts", "How to check it in a minute"],
    [
      ["The first screen does not say what the company does", "Visitors cannot tell whether they are in the right place and go back to the results", "Read the headline only. If it does not say what you sell and to whom, that is the problem"],
      ["More than three steps to an enquiry", "Every extra step loses people who were ready to act", "Count the clicks from the homepage to a submitted form. More than three is a long path"],
      ["The form asks for more than it needs", "Every extra field reduces submissions", "Count the fields. A first contact needs a name and a phone number; anything more is a lost enquiry"],
      ["No prices, not even a range", "The visitor goes to a competitor who shows one, and stays there", "Look for any figure in money on the site. If there is none, you are handing over your traffic"],
      ["The mobile version breaks", "Over half of traffic is mobile, and that is where enquiries are lost", "Submit an enquiry on your own phone, one-handed, without zooming"],
    ],
  ),

  h2("How to test usability yourself, without tools"),
  p("Heatmaps and paid tools are worth it once the basics are in order. Start with two tests that cost nothing."),
  h3("The five-second rule"),
  p("Open the homepage, count to five, close it. Now answer: what does the company do, who for, and what should you do next? A missing answer means the first screen is not working. Run the same test on service landing pages — people arrive there from search and never see the homepage."),
  h3("The relative test"),
  p("Hand a phone to someone with no connection to your business or to marketing and set a task: «find out what service X costs and book it». Stay quiet and watch where they stop, what they mis-tap and when they ask «where is it?». Three people surface almost every critical problem. Record actions, not opinions: «the button should be blue» is not data, «missed the menu item twice» is."),

  h2("What to watch in analytics"),
  p("Testing shows where people struggle; analytics shows how many of them there are. The minimum set:"),
  li("**Bounce rate on landing pages.** A spike on one page means either the wrong content or an unclear next step."),
  li("**Pages per session.** One page and out means there is nowhere to go: no links to services, no case studies."),
  li("**The path to enquiry.** Build the sequence service page → form → thank-you page and see which step loses the most people. Usually the form."),
  li("**Mobile separately from desktop.** Half the desktop conversion rate is nearly always a technical problem, not audience behaviour."),
  li("**Time on the pricing page.** Long with no onward click means confusing pricing; short then an exit means the number needs explaining."),

  h2("Common mistakes"),
  li("A button that promises nothing: «Learn more» loses to «Calculate the cost» — see [what a CTA is](/en/blog/what-is-cta)."),
  li("A menu with twelve items: more options, slower decisions, and often no decision at all."),
  li("A wall of text with no subheadings — nobody reads it."),
  li("A callback popup after three seconds, before the visitor knows where they are."),
  li("A redesign for looks that drops conversion and traffic: [redesign without losing SEO](/en/blog/redesign-without-losing-seo)."),

  h2("What it is worth in practice"),
  p("Usability is one of the rare areas where results show up fast: same traffic, more enquiries. For the Efedra clinic we reworked the page structure and the booking path, removing extra steps and moving prices and booking into plain sight. The result: [3.2× more enquiries](/en/portfolio/efedra-clinic) on the same traffic."),

  cta(
    "A free review of your website",
    "We check your first screen, path to enquiry, form and mobile version, and tell you what to fix first. No strings attached.",
    "Get the review",
    "/en/contacts",
  ),
];

const doc = {
  _id: "glos2026-shcho-take-yuzabiliti",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 5,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-yuzabiliti" },
    ru: { _type: "slug", current: "chto-takoe-yuzabiliti" },
    en: { _type: "slug", current: "what-is-usability" },
  },
  title: {
    _type: "localizedString",
    uk: "Юзабіліті — що це і як його перевірити",
    ru: "Юзабилити — что это и как его проверить",
    en: "Usability: what it is and how to test it",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Юзабіліті це: що таке і як перевірити сайт",
    ru: "Юзабилити это: что такое и как проверить сайт",
    en: "What Is Usability and How to Test Your Site",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Юзабіліті це зручність користування сайтом ✔️ 5 ознак поганого юзабіліті ✔️ як перевірити самому без інструментів ➡ безкоштовний розбір сайту",
    ru: "➤ Юзабилити это удобство пользования сайтом ✔️ 5 признаков плохого юзабилити ✔️ как проверить самому без инструментов ➡ бесплатный разбор сайта",
    en: "➤ Usability is how easy a site is to use ✔️ 5 signs of poor usability ✔️ how to test it yourself with no tools ➡ free website review",
  },
  eyebrow: { _type: "localizedString", uk: "Словник", ru: "Словарь", en: "Glossary" },
  lede: {
    _type: "localizedString",
    uk: "Що таке юзабіліті, чим воно відрізняється від дизайну та UX, п'ять ознак того, що з ним проблеми, і два тести, які можна зробити за п'ять хвилин без інструментів.",
    ru: "Что такое юзабилити, чем оно отличается от дизайна и UX, пять признаков того, что с ним проблемы, и два теста, которые можно сделать за пять минут без инструментов.",
    en: "What usability means, how it differs from design and UX, five signs that something is wrong, and two tests you can run in five minutes with no tools.",
  },
  tags: ["юзабіліті", "UX", "конверсія", "словник"],
  relatedPostSlugs: ["9-dyzain-pryiomiv-dlia-konversii", "shcho-take-cta", "redyzain-bez-vtraty-seo"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Юзабіліті і UX — це одне й те саме?",
        ru: "Юзабилити и UX — это одно и то же?",
        en: "Are usability and UX the same thing?",
      },
      answer: {
        _type: "localizedText",
        uk: "Ні. Юзабіліті — це зручність користування конкретним інтерфейсом: чи легко знайти потрібне і дійти до дії. UX ширше: це весь досвід взаємодії з компанією, включно зі швидкістю сайту, листом після заявки і тим, коли передзвонив менеджер. Юзабіліті — частина UX, і саме та частина, яку найпростіше виміряти й виправити.",
        ru: "Нет. Юзабилити — это удобство пользования конкретным интерфейсом: легко ли найти нужное и дойти до действия. UX шире: это весь опыт взаимодействия с компанией, включая скорость сайта, письмо после заявки и то, когда перезвонил менеджер. Юзабилити — часть UX, и как раз та часть, которую проще всего измерить и исправить.",
        en: "No. Usability is how easy a specific interface is to use: whether people find what they need and reach the action. UX is broader — the whole experience of dealing with the company, including site speed, the confirmation email and when someone calls back. Usability is the part of UX that is easiest to measure and to fix.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки людей потрібно для тесту юзабіліті?",
        ru: "Сколько людей нужно для теста юзабилити?",
        en: "How many people do I need for a usability test?",
      },
      answer: {
        _type: "localizedText",
        uk: "Для базової перевірки достатньо трьох-п'яти людей, які не пов'язані з вашим бізнесом. Класичне дослідження Нільсена показує, що п'ять учасників знаходять близько 85% проблем інтерфейсу. Далі починаються повтори: шостий і сьомий скаржаться на те саме, що й перші п'ять.",
        ru: "Для базовой проверки достаточно трёх-пяти человек, не связанных с вашим бизнесом. Классическое исследование Нильсена показывает, что пять участников находят около 85% проблем интерфейса. Дальше начинаются повторы: шестой и седьмой жалуются на то же, что и первые пять.",
        en: "Three to five people with no connection to your business are enough for a basic check. Nielsen's classic research found that five participants surface roughly 85% of interface problems. After that you get repeats: the sixth and seventh complain about the same things as the first five.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна покращити юзабіліті без повного редизайну?",
        ru: "Можно ли улучшить юзабилити без полного редизайна?",
        en: "Can usability be improved without a full redesign?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, і найчастіше саме так і варто починати. Скорочення форми, переписаний перший екран, винесені на видне місце ціни й нормальна мобільна версія дають більшу частину приросту заявок і не вимагають переробки всього сайту. Повний редизайн має сенс, коли проблема системна — застаріла структура, повільний рушій, неможливість швидко правити контент.",
        ru: "Да, и чаще всего именно с этого стоит начинать. Сокращённая форма, переписанный первый экран, вынесенные на видное место цены и нормальная мобильная версия дают большую часть прироста заявок и не требуют переделки всего сайта. Полный редизайн имеет смысл, когда проблема системная — устаревшая структура, медленный движок, невозможность быстро править контент.",
        en: "Yes, and that is usually the place to start. A shorter form, a rewritten first screen, prices moved into plain sight and a working mobile view deliver most of the uplift without rebuilding the site. A full redesign makes sense when the problem is structural — an outdated architecture, a slow engine, or content you cannot edit quickly.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як юзабіліті впливає на позиції в Google?",
        ru: "Как юзабилити влияет на позиции в Google?",
        en: "Does usability affect Google rankings?",
      },
      answer: {
        _type: "localizedText",
        uk: "Прямого фактора «юзабіліті» в Google немає, але є Core Web Vitals і поведінкові сигнали. Якщо людина відкриває сторінку й одразу повертається у видачу, це сигнал, що результат не відповів на запит. Плюс зручність напряму пов'язана зі швидкістю та адаптивністю, а вони вже є частиною оцінки сторінки.",
        ru: "Прямого фактора «юзабилити» у Google нет, но есть Core Web Vitals и поведенческие сигналы. Если человек открывает страницу и сразу возвращается в выдачу, это сигнал, что результат не ответил на запрос. Плюс удобство напрямую связано со скоростью и адаптивностью, а они уже входят в оценку страницы.",
        en: "Google has no direct «usability» factor, but it does have Core Web Vitals and behavioural signals. If someone opens a page and immediately returns to the results, that suggests the page did not answer the query. Ease of use is also tied to speed and responsive layout, and those are already part of how a page is assessed.",
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
