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
// UK body
// ---------------------------------------------------------------------------
const bodyUk = [
  tldr("Коротко", [
    "Створити сайт для школи можна безкоштовно (Google Sites), на конструкторі ($100–300/рік) або під ключ — від $800 за лендінг і від $3 500 за повноцінний сайт.",
    "Державній школі сайт потрібен для прозорості: документи, новини, структура, контакти — усе, що вимагає закон про освіту.",
    "Приватній школі сайт продає навчання батькам: ціни, ліцензія, викладачі, результати учнів, форма запису на екскурсію.",
    "Оновлювати сайт з адмінкою може вчитель інформатики або секретар — новина додається за 10–15 хвилин без програміста.",
    "Онлайн-школі та продажу курсів потрібен окремий тип сайту — з оплатою, доступом до уроків і кабінетом учня.",
  ]),
  p("Створити сайт для школи можна трьома шляхами: безкоштовно на Google Sites за один вечір, на конструкторі за $100–300 на рік або замовити під ключ — від **$800** за лендінг і від **$3 500** за повноцінний сайт з адмінкою та новинами. Який варіант правильний — залежить не так від бюджету, як від задачі: державній школі потрібна прозорість і документи, приватній — інструмент, що продає навчання батькам."),
  p("У 2026 році сайт школи — це перше, що бачать батьки. Перед тим як прийти на день відкритих дверей, вони гуглять назву школи, дивляться фото, читають новини й перевіряють, чи жива сторінка взагалі. Сайт, який востаннє оновлювали два роки тому, працює проти школи сильніше, ніж його відсутність."),
  p("У цьому гіді чесно розберемо всі варіанти: коли школі справді достатньо безкоштовного сайту, коли потрібен повноцінний, які розділи обовʼязкові, хто оновлюватиме контент і скільки все це коштує."),

  h2("Безкоштовний сайт для школи: чесний розбір"),
  p("Почнемо з головного: так, створити сайт безкоштовно для школи — реально, і для частини шкіл це нормальне рішення. Не будемо вдавати, що безкоштовні інструменти — це «несерйозно»: у них є свої чесні сценарії."),
  h3("Google Sites"),
  p("Google Sites — найпростіший спосіб. Вчитель інформатики збирає сайт за вечір: сторінки, фото, вбудовані Google Docs із документами, форми для звернень. Хостинг безкоштовний, зламувати нічого, підтримувати майже нічого."),
  li("**Плюси:** $0, простота, інтеграція з Google Workspace for Education, який і так є в багатьох школах."),
  li("**Мінуси:** шаблонний вигляд, адреса виду sites.google.com/view/school (свій домен підключити можна, але це вже налаштування), слабке SEO — у пошуку за запитом «школа + місто» такі сайти майже не ранжуються."),
  h3("Конструктори (Wix, Tilda, WordPress.com)"),
  p("Конструктор — це $100–300 на рік за тариф зі своїм доменом. Виглядає охайніше за Google Sites, є шаблони для освіти. Але хтось у школі має цей конструктор освоїти, а через рік-два сайт типово «розповзається»: кожен, хто додає сторінку, робить це по-своєму."),
  p("**Коли безкоштовного варіанта достатньо:** маленька школа чи гурток, якому потрібна візитка з контактами; тимчасове рішення на перший рік; проєкт без бюджету взагалі. Якщо це про вас — беріть Google Sites і не витрачайте гроші. Повертайтеся до цієї статті, коли сайт стане вузьким місцем."),

  h2("Коли школі потрібен повноцінний сайт"),
  p("Як створити сайт для школи, який працює, а не просто існує? Спочатку визначте, яку задачу він розвʼязує. У державної і приватної школи задачі принципово різні."),
  h3("Державна школа: прозорість і документи"),
  p("Для державної школи сайт — це насамперед вимога прозорості. Закон про освіту зобовʼязує оприлюднювати статут, ліцензії, кошторис і фінансові звіти, правила прийому, структуру закладу. Плюс новини, розклад, оголошення для батьків. Тут критичні не дизайнерські ефекти, а порядок: документи легко знайти, новини легко додати, сайт відкривається зі смартфона."),
  li("Розділ «Прозорість» з усіма обовʼязковими документами в одному місці."),
  li("Новини, які реально оновлюються — це головний сигнал «школа жива»."),
  li("Зрозуміла структура: батько за два кліки знаходить розклад або контакт класного керівника."),
  h3("Приватна школа: сайт, що продає навчання"),
  p("Приватна школа конкурує за учнів, і її сайт — це продавець. Батьки порівнюють 3–5 шкіл, і рішення на $2 000–10 000 за рік навчання не приймають за шаблонним сайтом на конструкторі. Тут працюють інші правила: сильна головна сторінка, ціни без «зателефонуйте, щоб дізнатися», ліцензія і документи на видноті, живі фото замість стокових, результати випускників, відгуки батьків і помітна форма запису на екскурсію школою."),
  p("За структурою це класичний [корпоративний сайт](/corporate-site): 10–20 сторінок, адмінка, блог або новини, форми. Для окремих задач — набір у перший клас, літній табір, підготовчі курси — добре працює окремий [лендінг](/landing) з рекламою на нього."),

  cta(
    "Порахуйте вартість сайту для вашої школи",
    "Відповідіть на кілька запитань у калькуляторі — і отримаєте вилку бюджету без дзвінків і листування.",
    "Відкрити калькулятор",
    "/calculator"
  ),

  h2("Обовʼязкові розділи сайту школи"),
  p("Незалежно від того, робите ви сайт безкоштовно чи під ключ, структура має закривати ті самі питання батьків. Ось мінімальний набір розділів:"),
  table(
    ["Розділ", "Що містить", "Для кого критично"],
    [
      ["**Головна**", "Хто ви, чим відрізняєтесь, головні новини, контакти", "Усім"],
      ["**Про школу**", "Історія, команда, ліцензія, фото простору", "Приватним — вирішальний"],
      ["**Новини**", "Події, оголошення, досягнення учнів", "Усім — сигнал «школа жива»"],
      ["**Документи / Прозорість**", "Статут, ліцензія, кошторис, звіти, правила прийому", "Державним — вимога закону"],
      ["**Вступ / Прийом**", "Умови, ціни, етапи, форма заявки чи запису на екскурсію", "Приватним — сторінка-продавець"],
      ["**Для батьків**", "Розклад, харчування, гуртки, контакти вчителів", "Усім"],
      ["**Контакти**", "Адреса, мапа, телефони, месенджери, форма звернення", "Усім"],
    ]
  ),
  p("Типова помилка — робити сайт «про адміністрацію»: накази, звіти, привітання директора на пів сторінки. Батьки шукають інше: розклад, ціни, як записатися, що діти їдять і хто їх вчить. Структуруйте сайт від питань батьків, а не від оргструктури закладу."),

  h2("Хто оновлюватиме сайт: адмінка без програміста"),
  p("Найчастіше страх шкіл не про гроші, а про підтримку: «зробимо сайт, а потім нікому оновлювати». Це розвʼязується правильною адмінкою. У сучасному сайті під ключ контент редагується через панель керування: додати новину — як написати пост у соцмережі. Текст, фото, кнопка «Опублікувати» — 10–15 хвилин."),
  p("З таким інструментом справляється вчитель інформатики, секретар або завуч — без жодного коду. Ми детально показували, як це виглядає зсередини, у статті [як працює адмін-панель сайту](/blog/yak-pratsyuye-admin-panel-saytu)."),
  li("Новини й оголошення — додає будь-хто з правами редактора."),
  li("Документи — завантажуються файлом у відповідний розділ."),
  li("Технічні речі (оновлення, безпека, бекапи) — закриває підтримка студії від **$200/міс** або разово від $40/год."),

  h2("Сайт онлайн-школи та продаж курсів"),
  p("Окрема історія — коли школа чи викладач хоче створити сайт для онлайн-курсів або продажу навчання через інтернет. Це вже не сайт-візитка, а платформа: сторінки курсів, онлайн-оплата, доступ до уроків після покупки, кабінет учня, інтеграція з CRM і email-розсилками."),
  p("Такі проєкти ми виносимо в окремий напрям — [сайти для курсів та онлайн-шкіл](/sites-for/courses). Типовий бюджет: продаючий лендінг курсу від **$800**, сайт онлайн-школи з каталогом курсів і оплатою — від **$3 500**, повноцінна платформа з кабінетами і власною логікою — від **$6 000**."),
  p("Приклад із практики — [сайт курсу Aleko](/portfolio/aleko-course): сторінка, яка продає навчальну програму, з чіткою структурою «для кого, що всередині, скільки коштує» і формою запису. Саме так виглядає мінімальний робочий інструмент продажу курсу."),

  h2("Скільки коштує сайт для школи у 2026"),
  p("Зведемо все в одну таблицю. Вилка ринку ширша, але тут — реальні цифри, з якими працює наша студія:"),
  table(
    ["Критерій", "Безкоштовно (Google Sites)", "Конструктор", "Під ключ"],
    [
      ["Вартість", "$0", "$100–300/рік", "лендінг від **$800**, сайт школи від **$3 500**"],
      ["Дизайн", "Шаблон, упізнаваний одразу", "Шаблон з налаштуванням", "Індивідуальний, під школу"],
      ["Свій домен", "Окреме налаштування", "У платному тарифі", "Так, входить у проєкт"],
      ["SEO і швидкість", "Слабкі", "Середні", "Повний контроль, швидкий сайт"],
      ["Хто оновлює", "Той, хто зібрав", "Той, хто освоїв конструктор", "Будь-хто через адмінку"],
      ["Кому підходить", "Гурток, візитка, старт без бюджету", "Мала школа з активним адміном", "Державна школа з вимогами, приватна школа, онлайн-школа"],
    ]
  ),
  p("Що впливає на ціну під ключ: кількість сторінок, двомовність, інтеграції (онлайн-оплата, CRM, розклад) — типова інтеграція коштує $200–500, складні — $1 000–3 000. Строк: лендінг — 2–3 тижні, сайт школи — 4–8 тижнів. Якщо потрібно, щоб школу знаходили в Google за запитами на кшталт «приватна школа + місто», закладайте [SEO-просування](/seo) від **$300/міс**."),

  h2("7 типових помилок на сайтах шкіл"),
  p("Ми переглянули десятки сайтів українських шкіл, перш ніж писати цей гід. Одні й ті самі проблеми повторюються незалежно від того, зроблений сайт безкоштовно чи за гроші:"),
  num("**Мертва стрічка новин.** Остання новина — торішня лінійка. Для батьків це сигнал, що школі байдуже; краще прибрати розділ, ніж показувати порожнечу."),
  num("**Документи скановані боком і без назв.** Файл «scan0034.pdf» замість «Статут школи» — батько не буде вгадувати."),
  num("**Немає цін у приватної школи.** «Вартість уточнюйте за телефоном» відсікає більшість батьків ще до дзвінка."),
  num("**Стокові фото замість живих.** Усміхнені діти з фотобанку впізнаються миттєво і вбивають довіру."),
  num("**Сайт не відкривається з телефона.** Понад 70% батьків заходять зі смартфона — перевірте свій сайт прямо зараз."),
  num("**Немає форми звернення.** Тільки телефон, який ніхто не бере після 16:00."),
  num("**Ніхто не відповідає за сайт.** Найпоширеніша причина смерті шкільних сайтів — не технології, а відсутність відповідального."),

  h2("З чого почати: план на один тиждень"),
  num("Визначте задачу: прозорість для держшколи, продаж навчання для приватної, продаж курсів для онлайн-школи."),
  num("Випишіть розділи з таблиці вище і зберіть контент: тексти, документи, живі фото."),
  num("Якщо бюджету немає — зберіть Google Sites уже цього тижня: поганий живий сайт кращий за ідеальний неіснуючий."),
  num("Якщо сайт має приводити учнів — порахуйте бюджет у [калькулятори](/calculator) і подивіться, як ми робимо [корпоративні сайти](/corporate-site)."),
  num("Призначте відповідального за новини — без цього будь-який сайт помре за пів року."),

  cta(
    "Потрібен сайт для школи чи освітнього проєкту?",
    "Покажемо приклади, порадимо чесно — де вистачить безкоштовного варіанта, а де потрібен повноцінний сайт. Оцінка бюджету за 1 день.",
    "Обговорити проєкт",
    "/calculator"
  ),
];

// ---------------------------------------------------------------------------
// RU body
// ---------------------------------------------------------------------------
const bodyRu = [
  tldr("Коротко", [
    "Сайт для школы можно сделать бесплатно (Google Sites), на конструкторе ($100–300/год) или под ключ — от $800 за лендинг и от $3 500 за полноценный сайт.",
    "Государственной школе сайт нужен для прозрачности: документы, новости, структура — всё, что требует закон об образовании.",
    "Частной школе сайт продаёт обучение родителям: цены, лицензия, преподаватели, результаты учеников, запись на экскурсию.",
    "Обновлять сайт с админкой может учитель информатики или секретарь — новость добавляется за 10–15 минут без программиста.",
    "Онлайн-школе и продаже курсов нужен отдельный тип сайта — с оплатой, доступом к урокам и кабинетом ученика.",
  ]),
  p("Сайт для школы можно сделать тремя способами: бесплатно на Google Sites за один вечер, на конструкторе за $100–300 в год или заказать под ключ — от **$800** за лендинг и от **$3 500** за полноценный сайт с админкой и новостями. Правильный вариант зависит не столько от бюджета, сколько от задачи: государственной школе нужна прозрачность и документы, частной — инструмент, который продаёт обучение родителям."),
  p("В 2026 году сайт — первое, что видят родители. Прежде чем прийти на день открытых дверей, они гуглят школу, смотрят фото, читают новости и проверяют, живая ли страница вообще. Сайт, который последний раз обновляли два года назад, работает против школы сильнее, чем его отсутствие."),
  p("В этом гиде честно разберём, как создать сайт школы: когда достаточно бесплатного варианта, когда нужен полноценный, какие разделы обязательны, кто будет обновлять контент и сколько это стоит."),

  h2("Бесплатный сайт для школы: честный разбор"),
  p("Начнём с главного: да, бесплатный сайт для школы — это реально, и для части школ это нормальное решение. Не будем делать вид, что бесплатные инструменты «несерьёзны»: у них есть свои честные сценарии."),
  h3("Google Sites"),
  p("Google Sites — самый простой путь. Учитель информатики собирает сайт за вечер: страницы, фото, встроенные Google Docs с документами, формы для обращений. Хостинг бесплатный, ломать нечего, поддерживать почти нечего."),
  li("**Плюсы:** $0, простота, интеграция с Google Workspace for Education, который и так есть во многих школах."),
  li("**Минусы:** шаблонный вид, адрес вида sites.google.com/view/school (свой домен подключить можно, но это уже настройка), слабое SEO — по запросу «школа + город» такие сайты почти не ранжируются."),
  h3("Конструкторы (Wix, Tilda, WordPress.com)"),
  p("Конструктор — это $100–300 в год за тариф со своим доменом. Выглядит аккуратнее Google Sites, есть шаблоны для образования. Но кто-то в школе должен конструктор освоить, а через год-два сайт обычно «расползается»: каждый, кто добавляет страницу, делает это по-своему."),
  p("**Когда бесплатного варианта достаточно:** маленькая школа или кружок, которому нужна визитка с контактами; временное решение на первый год; проект вообще без бюджета. Если это про вас — берите Google Sites и не тратьте деньги. Вернётесь к этой статье, когда сайт станет узким местом."),

  h2("Когда школе нужен полноценный сайт"),
  p("Как создать сайт школы, который работает, а не просто существует? Сначала определите задачу. У государственной и частной школы задачи принципиально разные."),
  h3("Государственная школа: прозрачность и документы"),
  p("Для государственной школы сайт — прежде всего требование прозрачности. Закон об образовании обязывает публиковать устав, лицензии, смету и финансовые отчёты, правила приёма, структуру учреждения. Плюс новости, расписание, объявления для родителей. Здесь критичны не дизайнерские эффекты, а порядок: документы легко найти, новости легко добавить, сайт открывается со смартфона."),
  li("Раздел «Прозрачность» со всеми обязательными документами в одном месте."),
  li("Новости, которые реально обновляются, — главный сигнал «школа живая»."),
  li("Понятная структура: родитель за два клика находит расписание или контакт классного руководителя."),
  h3("Частная школа: сайт, который продаёт обучение"),
  p("Частная школа конкурирует за учеников, и её сайт — это продавец. Родители сравнивают 3–5 школ, и решение на $2 000–10 000 за год обучения не принимают по шаблонному сайту на конструкторе. Здесь работают другие правила: сильная главная, цены без «позвоните, чтобы узнать», лицензия и документы на виду, живые фото вместо стоковых, результаты выпускников, отзывы родителей и заметная форма записи на экскурсию по школе."),
  p("По структуре это классический [корпоративный сайт](/ru/corporate-site): 10–20 страниц, админка, новости, формы. Под отдельные задачи — набор в первый класс, летний лагерь, подготовительные курсы — хорошо работает отдельный [лендинг](/ru/landing) с рекламой на него."),

  cta(
    "Посчитайте стоимость сайта для вашей школы",
    "Ответьте на несколько вопросов в калькуляторе — и получите вилку бюджета без звонков и переписки.",
    "Открыть калькулятор",
    "/ru/calculator"
  ),

  h2("Обязательные разделы сайта школы"),
  p("Независимо от того, делаете вы сайт бесплатно или под ключ, структура должна закрывать одни и те же вопросы родителей. Минимальный набор разделов:"),
  table(
    ["Раздел", "Что содержит", "Для кого критичен"],
    [
      ["**Главная**", "Кто вы, чем отличаетесь, главные новости, контакты", "Всем"],
      ["**О школе**", "История, команда, лицензия, фото пространства", "Частным — решающий"],
      ["**Новости**", "События, объявления, достижения учеников", "Всем — сигнал «школа живая»"],
      ["**Документы / Прозрачность**", "Устав, лицензия, смета, отчёты, правила приёма", "Государственным — требование закона"],
      ["**Поступление / Приём**", "Условия, цены, этапы, форма заявки или записи на экскурсию", "Частным — страница-продавец"],
      ["**Родителям**", "Расписание, питание, кружки, контакты учителей", "Всем"],
      ["**Контакты**", "Адрес, карта, телефоны, мессенджеры, форма обращения", "Всем"],
    ]
  ),
  p("Типичная ошибка — делать сайт «про администрацию»: приказы, отчёты, приветствие директора на полстраницы. Родители ищут другое: расписание, цены, как записаться, что дети едят и кто их учит. Стройте сайт от вопросов родителей, а не от оргструктуры учреждения."),

  h2("Кто будет обновлять сайт: админка без программиста"),
  p("Чаще всего школы боятся не цены, а поддержки: «сделаем сайт, а потом некому обновлять». Это решается правильной админкой. В современном сайте под ключ контент редактируется через панель управления: добавить новость — как написать пост в соцсети. Текст, фото, кнопка «Опубликовать» — 10–15 минут."),
  p("С таким инструментом справляется учитель информатики, секретарь или завуч — без единой строки кода. Мы подробно показывали, как это выглядит изнутри, в статье [как работает админ-панель сайта](/ru/blog/kak-rabotaet-admin-panel-sayta)."),
  li("Новости и объявления — добавляет любой сотрудник с правами редактора."),
  li("Документы — загружаются файлом в нужный раздел."),
  li("Техническую часть (обновления, безопасность, бэкапы) закрывает поддержка студии от **$200/мес** или разово от $40/час."),

  h2("Сайт онлайн-школы и продажа курсов"),
  p("Отдельная история — когда школа или преподаватель хочет создать сайт для онлайн-курсов или для продажи курсов через интернет. Это уже не визитка, а платформа: страницы курсов, онлайн-оплата, доступ к урокам после покупки, кабинет ученика, интеграция с CRM и email-рассылками."),
  p("Такие проекты мы выносим в отдельное направление — [сайты для курсов и онлайн-школ](/ru/sites-for/courses). Типовой бюджет: продающий лендинг курса от **$800**, сайт онлайн-школы с каталогом курсов и оплатой — от **$3 500**, полноценная платформа с кабинетами и своей логикой — от **$6 000**."),
  p("Пример из практики — [сайт курса Aleko](/ru/portfolio/aleko-course): страница, которая продаёт учебную программу, с чёткой структурой «для кого, что внутри, сколько стоит» и формой записи. Так выглядит минимальный рабочий инструмент продажи курса."),

  h2("Сколько стоит сайт для школы в 2026"),
  p("Сведём всё в одну таблицу. Рыночная вилка шире, но здесь — реальные цифры, с которыми работает наша студия:"),
  table(
    ["Критерий", "Бесплатно (Google Sites)", "Конструктор", "Под ключ"],
    [
      ["Стоимость", "$0", "$100–300/год", "лендинг от **$800**, сайт школы от **$3 500**"],
      ["Дизайн", "Шаблон, узнаваемый сразу", "Шаблон с настройкой", "Индивидуальный, под школу"],
      ["Свой домен", "Отдельная настройка", "В платном тарифе", "Да, входит в проект"],
      ["SEO и скорость", "Слабые", "Средние", "Полный контроль, быстрый сайт"],
      ["Кто обновляет", "Тот, кто собрал", "Тот, кто освоил конструктор", "Любой сотрудник через админку"],
      ["Кому подходит", "Кружок, визитка, старт без бюджета", "Малая школа с активным админом", "Госшкола с требованиями, частная школа, онлайн-школа"],
    ]
  ),
  p("Что влияет на цену под ключ: количество страниц, двуязычность, интеграции (онлайн-оплата, CRM, расписание) — типовая интеграция стоит $200–500, сложные — $1 000–3 000. Сроки: лендинг — 2–3 недели, сайт школы — 4–8 недель. Если школу должны находить в Google по запросам вроде «частная школа + город», закладывайте [SEO-продвижение](/ru/seo) от **$300/мес**."),

  h2("7 типичных ошибок на сайтах школ"),
  p("Перед тем как писать этот гид, мы просмотрели десятки школьных сайтов. Одни и те же проблемы повторяются независимо от того, сделан сайт бесплатно или за деньги:"),
  num("**Мёртвая лента новостей.** Последняя новость — прошлогодняя линейка. Для родителей это сигнал, что школе всё равно; лучше убрать раздел, чем показывать пустоту."),
  num("**Документы отсканированы боком и без названий.** Файл «scan0034.pdf» вместо «Устав школы» — родитель гадать не будет."),
  num("**Нет цен у частной школы.** «Стоимость уточняйте по телефону» отсеивает большинство родителей ещё до звонка."),
  num("**Стоковые фото вместо живых.** Улыбающиеся дети из фотобанка узнаются мгновенно и убивают доверие."),
  num("**Сайт не открывается с телефона.** Больше 70% родителей заходят со смартфона — проверьте свой сайт прямо сейчас."),
  num("**Нет формы обращения.** Только телефон, который никто не берёт после 16:00."),
  num("**Никто не отвечает за сайт.** Самая частая причина смерти школьных сайтов — не технологии, а отсутствие ответственного."),

  h2("С чего начать: план на одну неделю"),
  num("Определите задачу: прозрачность для госшколы, продажа обучения для частной, продажа курсов для онлайн-школы."),
  num("Выпишите разделы из таблицы выше и соберите контент: тексты, документы, живые фото."),
  num("Если бюджета нет — соберите Google Sites уже на этой неделе: плохой живой сайт лучше идеального несуществующего."),
  num("Если сайт должен приводить учеников — посчитайте бюджет в [калькуляторе](/ru/calculator) и посмотрите, как мы делаем [корпоративные сайты](/ru/corporate-site)."),
  num("Назначьте ответственного за новости — без этого любой сайт умрёт за полгода."),

  cta(
    "Нужен сайт для школы или образовательного проекта?",
    "Покажем примеры и честно посоветуем, где хватит бесплатного варианта, а где нужен полноценный сайт. Оценка бюджета за 1 день.",
    "Обсудить проект",
    "/ru/calculator"
  ),
];

// ---------------------------------------------------------------------------
// EN body
// ---------------------------------------------------------------------------
const bodyEn = [
  tldr("Key takeaways", [
    "A school website can be free (Google Sites), built on a website builder ($100–300/year), or custom-built — from $800 for a landing page and from $3 500 for a full site.",
    "State schools need a website for transparency: policies, documents, news and clear contacts in one place.",
    "Private schools need a website that sells: fees, accreditation, teachers, pupil outcomes and a visible open-day booking form.",
    "With a proper admin panel, a teacher or school secretary updates the site in 10–15 minutes — no developer required.",
    "Online schools and course creators need a different kind of site — with payments, gated lessons and student accounts.",
  ]),
  p("There are three realistic ways to get a school website: build it free on Google Sites in an evening, use a website builder for $100–300 a year, or commission a custom site — from **$800** for a landing page and from **$3 500** for a full website with a CMS and a news section. The right choice depends less on budget than on the job: a state school needs transparency and documents, a private school needs a site that convinces parents to enrol."),
  p("In 2026, the website is the first thing parents see. Before attending an open day, they google the school, look at photos, read the news feed and check whether the page is even alive. A site last updated two years ago hurts the school more than having none at all."),
  p("This guide is an honest breakdown: when a free site is genuinely enough, when a school needs a proper one, which sections are non-negotiable, who will keep the content fresh, and what it all costs."),

  h2("Free school websites: the honest version"),
  p("Let's start with the truth: yes, a free school website is a real option, and for some schools it is the right one. Free tools are not automatically «unprofessional» — they have legitimate use cases."),
  h3("Google Sites"),
  p("Google Sites is the simplest route. An IT teacher can assemble a site in one evening: pages, photos, embedded Google Docs for policies, contact forms. Hosting is free, there is nothing to hack and almost nothing to maintain."),
  li("**Pros:** $0, simplicity, and native integration with Google Workspace for Education, which many schools already use."),
  li("**Cons:** a template look, an address like sites.google.com/view/school (a custom domain is possible but needs setup), and weak SEO — these sites rarely rank for «school + town» searches."),
  h3("Website builders (Wix, Squarespace, WordPress.com)"),
  p("A builder costs $100–300 a year for a plan with a custom domain. It looks tidier than Google Sites and offers education templates. But someone at the school has to master the tool, and after a year or two these sites tend to sprawl: everyone who adds a page does it their own way."),
  p("**When free is enough:** a small school or club that needs a contact card online; a temporary first-year solution; a project with no budget at all. If that is you — use Google Sites and save the money. Come back to this article when the website becomes the bottleneck."),

  h2("When a school needs a proper website"),
  p("How do you create a school website that works rather than merely exists? Start by naming the job it does. State and private schools have fundamentally different jobs."),
  h3("State schools: transparency and documents"),
  p("For a state school, the website is first of all a transparency requirement. Regulations oblige schools to publish their statutes, licences, budgets and financial reports, admission rules and governance structure — plus news, timetables and announcements for parents. What matters here is not design flair but order: documents are easy to find, news is easy to add, and the site works on a phone."),
  li("A single «Transparency» section holding every mandatory document."),
  li("A news feed that is actually updated — the main signal that the school is alive."),
  li("Clear structure: a parent finds the timetable or a teacher's contact in two clicks."),
  h3("Private schools: a website that sells enrolment"),
  p("A private school competes for pupils, and its website is a salesperson. Parents compare 3–5 schools, and nobody commits $2 000–10 000 a year based on a generic builder template. Different rules apply: a strong homepage, fees published without «call us to find out», accreditation in plain sight, real photos instead of stock, alumni results, parent testimonials and a prominent open-day booking form."),
  p("Structurally this is a classic [corporate website](/en/corporate-site): 10–20 pages, a CMS, news, forms. For focused campaigns — Year 1 admissions, a summer camp, preparatory courses — a dedicated [landing page](/en/landing) with ads pointed at it works best. We are a Ukrainian studio working with clients across Europe — European quality at sensible rates."),

  cta(
    "Price up your school website",
    "Answer a few questions in the calculator and get a budget range — no calls, no email ping-pong.",
    "Open the calculator",
    "/en/calculator"
  ),

  h2("Essential sections of a school website"),
  p("Whether you build free or go custom, the structure must answer the same parent questions. The minimum set of sections:"),
  table(
    ["Section", "What it contains", "Critical for"],
    [
      ["**Homepage**", "Who you are, what makes you different, top news, contacts", "Everyone"],
      ["**About the school**", "History, team, accreditation, photos of the campus", "Private — decisive"],
      ["**News**", "Events, announcements, pupil achievements", "Everyone — proof of life"],
      ["**Documents / Transparency**", "Statutes, licences, budgets, reports, admission rules", "State schools — legal requirement"],
      ["**Admissions**", "Terms, fees, steps, application or open-day booking form", "Private — the sales page"],
      ["**For parents**", "Timetable, meals, clubs, teacher contacts", "Everyone"],
      ["**Contacts**", "Address, map, phones, messengers, enquiry form", "Everyone"],
    ]
  ),
  p("The classic mistake is building the site «about the administration»: orders, reports, a half-page welcome letter from the head. Parents look for something else: the timetable, the fees, how to apply, what the children eat and who teaches them. Structure the site around parents' questions, not the org chart."),

  h2("Who updates the site: a CMS instead of a developer"),
  p("What schools fear most is not the price but the upkeep: «we'll build a site and then nobody will maintain it». A proper admin panel solves this. In a modern custom site, content is edited through a dashboard: adding a news item feels like posting on social media. Text, photos, a Publish button — 10–15 minutes."),
  p("An IT teacher, a secretary or a deputy head can handle it without writing a line of code. We showed exactly what this looks like in [how a website admin panel works](/en/blog/how-website-admin-panel-works)."),
  li("News and announcements — added by any staff member with editor access."),
  li("Documents — uploaded as files into the right section."),
  li("The technical side (updates, security, backups) is covered by studio support from **$200/month** or ad hoc from $40/hour."),

  h2("Online schools and selling courses"),
  p("A separate case: a school or a teacher wants a website for online courses — selling education over the internet. That is no longer a brochure site but a platform: course pages, online payments, gated access to lessons after purchase, student accounts, CRM and email integrations."),
  p("We treat these as their own category — [websites for courses and online schools](/en/sites-for/courses). Typical budgets: a course sales landing page from **$800**, an online-school website with a course catalogue and payments from **$3 500**, a full platform with student accounts and custom logic from **$6 000**."),
  p("A live example is the [Aleko course website](/en/portfolio/aleko-course): a page that sells a training programme with a clear «who it's for, what's inside, what it costs» structure and an enrolment form. That is what a minimum viable course-selling tool looks like."),

  h2("What a school website costs in 2026"),
  p("Here is everything in one table. Market ranges are wider, but these are the real figures our studio works with:"),
  table(
    ["Criterion", "Free (Google Sites)", "Website builder", "Custom-built"],
    [
      ["Cost", "$0", "$100–300/year", "landing from **$800**, school site from **$3 500**"],
      ["Design", "Template, instantly recognisable", "Template with tweaks", "Bespoke, built for the school"],
      ["Custom domain", "Extra setup", "On paid plans", "Yes, included"],
      ["SEO and speed", "Weak", "Average", "Full control, fast site"],
      ["Who updates it", "Whoever built it", "Whoever learned the builder", "Any staff member via the CMS"],
      ["Best for", "Clubs, a contact card, zero budget", "Small school with a hands-on admin", "State school with legal requirements, private school, online school"],
    ]
  ),
  p("What moves the custom price: page count, multilingual content, integrations (online payments, CRM, timetables) — a typical integration costs $200–500, complex ones $1 000–3 000. Timelines: a landing page takes 2–3 weeks, a school website 4–8 weeks. If the school needs to be found on Google for searches like «private school + town», budget for [SEO](/en/seo) from **$300/month**."),

  h2("Where to start: a one-week plan"),
  num("Name the job: transparency for a state school, selling enrolment for a private one, selling courses for an online school."),
  num("List the sections from the table above and gather the content: texts, documents, real photos."),
  num("No budget? Build a Google Site this week — a live imperfect site beats a perfect imaginary one."),
  num("If the site must bring in pupils — price it in the [calculator](/en/calculator) and see how we build [corporate websites](/en/corporate-site)."),
  num("Assign someone to own the news feed — without that, any website dies within six months."),

  cta(
    "Need a website for a school or an education project?",
    "We'll show examples and give honest advice on where a free option is enough and where a proper site pays off. Budget estimate within 1 day.",
    "Discuss your project",
    "/en/calculator"
  ),
];

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------
const doc = {
  _id: "ltAug2026-sait-dlia-shkoly",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-shkoly" },
    ru: { _type: "slug", current: "sayt-dlya-shkoly" },
    en: { _type: "slug", current: "school-website-guide" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для школи та освітнього проєкту: від безкоштовного до під ключ",
    ru: "Сайт для школы и образовательного проекта: от бесплатного до под ключ",
    en: "School website guide: from free to custom-built",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для школи: безкоштовно, конструктор чи під ключ",
    ru: "Сайт для школы: бесплатно, конструктор или под ключ",
    en: "School Website: Free, Builder or Custom — 2026 Guide",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Як створити сайт для школи: безкоштовні варіанти, конструктори, розробка під ключ. ✔️ Обовʼязкові розділи ✔️ Реальні ціни від $800 ➡ Чесний гід 2026.",
    ru: "➤ Как создать сайт школы: бесплатные варианты, конструкторы, разработка под ключ. ✔️ Обязательные разделы ✔️ Реальные цены от $800 ➡ Честный гид 2026.",
    en: "➤ How to create a school website: free options, builders, custom development. ✔️ Essential sections ✔️ Real prices from $800 ➡ An honest 2026 guide.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Освіта",
    ru: "Образование",
    en: "Education",
  },
  lede: {
    _type: "localizedString",
    uk: "Google Sites, конструктор чи сайт під ключ? Чесно розбираємо, коли школі достатньо безкоштовного сайту, коли потрібен повноцінний, які розділи обовʼязкові й хто все це оновлюватиме.",
    ru: "Google Sites, конструктор или сайт под ключ? Честно разбираем, когда школе хватит бесплатного сайта, когда нужен полноценный, какие разделы обязательны и кто всё это будет обновлять.",
    en: "Google Sites, a website builder or a custom build? An honest look at when a free school website is enough, when it isn't, which sections are essential and who will keep it updated.",
  },
  tags: ["сайт для школи", "освіта", "онлайн-школа", "ціни"],
  relatedPostSlugs: ["yak-pratsyuye-admin-panel-saytu", "vartist-rozrobky-saytu-2026", "ai-poshuk-yak-potrapyty-u-vidpovidi"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна школі зробити сайт безкоштовно?",
        ru: "Можно ли школе сделать сайт бесплатно?",
        en: "Can a school get a website for free?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так. Google Sites дозволяє зібрати сайт за один вечір без витрат — цього достатньо для гуртка, маленької школи чи як тимчасове рішення. Обмеження: шаблонний вигляд, адреса на домені Google і слабке SEO — за запитом «школа + місто» такий сайт майже не знайдуть.",
        ru: "Да. Google Sites позволяет собрать сайт за один вечер без затрат — этого достаточно для кружка, маленькой школы или как временное решение. Ограничения: шаблонный вид, адрес на домене Google и слабое SEO — по запросу «школа + город» такой сайт почти не найдут.",
        en: "Yes. Google Sites lets you assemble a site in one evening at no cost — enough for a club, a small school or a temporary solution. The limits: a template look, a Google-domain address and weak SEO — the site will rarely be found for «school + town» searches.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт школи під ключ?",
        ru: "Сколько стоит сайт школы под ключ?",
        en: "How much does a custom school website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг для окремої задачі (набір, табір, курси) — від $800. Повноцінний сайт школи з адмінкою, новинами й розділом документів — від $3 500. Сайт онлайн-школи з оплатою та кабінетами — від $3 500 до $6 000+. Інтеграції додають $200–500 за типову й $1 000–3 000 за складну.",
        ru: "Лендинг под отдельную задачу (набор, лагерь, курсы) — от $800. Полноценный сайт школы с админкой, новостями и разделом документов — от $3 500. Сайт онлайн-школы с оплатой и кабинетами — от $3 500 до $6 000+. Интеграции добавляют $200–500 за типовую и $1 000–3 000 за сложную.",
        en: "A landing page for a single campaign (admissions, camp, courses) starts at $800. A full school website with a CMS, news and a documents section starts at $3 500. An online-school site with payments and student accounts runs from $3 500 to $6 000+. Integrations add $200–500 for typical ones and $1 000–3 000 for complex ones.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Хто оновлюватиме сайт школи після запуску?",
        ru: "Кто будет обновлять сайт школы после запуска?",
        en: "Who will update the school website after launch?",
      },
      answer: {
        _type: "localizedText",
        uk: "Будь-хто зі співробітників через адмін-панель: вчитель інформатики, секретар або завуч. Додати новину — 10–15 хвилин, як пост у соцмережі, без коду. Технічну частину (оновлення, безпеку, бекапи) закриває підтримка студії від $200/міс або від $40/год разово.",
        ru: "Любой сотрудник через админ-панель: учитель информатики, секретарь или завуч. Добавить новость — 10–15 минут, как пост в соцсети, без кода. Техническую часть (обновления, безопасность, бэкапы) закрывает поддержка студии от $200/мес или от $40/час разово.",
        en: "Any staff member, through the admin panel: an IT teacher, a secretary or a deputy head. Adding a news item takes 10–15 minutes, like a social media post, with no code. The technical side (updates, security, backups) is covered by studio support from $200/month or $40/hour ad hoc.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка сайту для школи?",
        ru: "Сколько времени занимает разработка сайта для школы?",
        en: "How long does it take to build a school website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг — 2–3 тижні. Повноцінний сайт школи з адмінкою — 4–8 тижнів залежно від кількості сторінок, мов та інтеграцій. Найдовший етап зазвичай не розробка, а збір контенту зі школи: тексти, документи, фото — почніть із цього.",
        ru: "Лендинг — 2–3 недели. Полноценный сайт школы с админкой — 4–8 недель в зависимости от количества страниц, языков и интеграций. Самый долгий этап обычно не разработка, а сбор контента со школы: тексты, документы, фото — начните с этого.",
        en: "A landing page takes 2–3 weeks. A full school website with a CMS takes 4–8 weeks, depending on page count, languages and integrations. The longest stage is usually not development but collecting content from the school — texts, documents, photos — so start there.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен окремий сайт для онлайн-курсів школи?",
        ru: "Нужен ли отдельный сайт для онлайн-курсов школы?",
        en: "Does an online course need a separate website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Якщо ви продаєте курси через інтернет — так. Сайту-візитці бракує оплати, закритого доступу до уроків і кабінету учня. Мінімальний варіант — продаючий лендінг курсу від $800 із формою оплати; повноцінна онлайн-школа з каталогом і кабінетами — від $3 500.",
        ru: "Если вы продаёте курсы через интернет — да. Сайту-визитке не хватает оплаты, закрытого доступа к урокам и кабинета ученика. Минимальный вариант — продающий лендинг курса от $800 с формой оплаты; полноценная онлайн-школа с каталогом и кабинетами — от $3 500.",
        en: "If you sell courses online — yes. A brochure site lacks payments, gated lesson access and student accounts. The minimum option is a course sales landing page from $800 with a payment form; a full online school with a catalogue and accounts starts at $3 500.",
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
