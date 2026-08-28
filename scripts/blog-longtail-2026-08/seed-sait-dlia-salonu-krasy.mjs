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
  tldr("Коротко: сайт для салону краси", [
    "Сайт для салону краси вирішує три задачі, які Instagram не закриває: запис уночі, пошук у Google і прайс, який не треба питати в директі.",
    "Онлайн-запис до конкретного майстра — головна функція: інтеграція altegio чи DIKIDI коштує $200–500, своя форма входить у розробку.",
    "Лендінг для майстра — від $800, сайт салону — $1 500–3 000, сайт мережі салонів — від $3 500.",
    "Локальне SEO «салон + район» приводить клієнток, які шукають манікюр за 10 хвилин від дому, а не десь у місті.",
    "Зв'язка «створення + просування» працює краще за сайт-візитку: SEO від $300/міс окупається вже з 2–3 нових клієнток на тиждень.",
  ]),
  p("Сайт для салону краси — це сторінка з онлайн-записом до конкретного майстра, актуальним прайсом, портфоліо робіт і відгуками, яку знаходять у Google за запитом «манікюр + ваш район». Instagram лишається вітриною, але записує клієнток, відповідає на «скільки коштує?» і працює о другій ночі саме сайт."),
  p("Ми в Code-Site.Art зробили сайти для кількох б'юті-бізнесів — від салону в спальному районі до бренду догляду — і бачимо однакову картину: власниці роками ведуть Instagram, а потім дивуються, що конкурентка з простим сайтом забирає всіх клієнток із пошуку. У цій статті — що саме має бути на сайті салону, скільки це коштує і як зробити, щоб він приводив записи, а не просто «був»."),
  h2("Чому Instagram більше не достатньо"),
  p("Instagram — чудовий канал для салону: там живуть фото робіт, сторіз і «до/після». Але як єдина платформа він має три системні проблеми."),
  li("**Алгоритми вирішують за вас.** Охоплення постів падає роками: контент бачать 5–10% підписниць. Ви не контролюєте, кому Instagram покаже ваш прайс, а сайт у видачі Google бачать усі, хто шукає."),
  li("**Вас не знаходять нові клієнтки.** Запит «манікюр Оболонь» чи «сайт для перукарні поруч» людина вводить у Google, а не в пошук Instagram. Немає сайту — немає вас у видачі й на картах."),
  li("**Запис залежить від адміністратора.** Директ о 23:40 прочитають вранці — а клієнтка вже записалась туди, де форма запису працювала одразу. За даними сервісів бронювання, 30–40% онлайн-записів припадає на неробочі години салону."),
  p("Висновок не «покинути Instagram», а перестати вимагати від нього те, для чого він не створений. Соцмережа гріє аудиторію, сайт — конвертує її в записи."),
  h2("Онлайн-запис: інтеграція altegio / DIKIDI чи своя форма"),
  p("Онлайн-запис — функція номер один. Клієнтка має обрати послугу, майстра, вільний час і отримати підтвердження без жодного дзвінка. Реалізувати це можна двома шляхами."),
  h3("Інтеграція з CRM для салонів"),
  p("Якщо салон уже веде запис в altegio (колишній YCLIENTS), DIKIDI чи подібній системі, найлогічніше вбудувати її віджет або підключитись через API. Розклад майстрів, послуги й нагадування клієнткам залишаються в одній системі, а сайт стає ще одним входом у той самий журнал. Типова інтеграція коштує **$200–500** до ціни сайту; складніші сценарії — наприклад, власний кабінет клієнтки поверх API — це вже $1 000–3 000."),
  h3("Своя форма запису"),
  p("Малому салону чи майстру-одиночці часто досить простої форми: послуга, бажана дата, телефон — заявка падає в Telegram адміністратору. Це дешевше (входить у вартість лендінгу), але підтвердження часу лишається ручним. Розумний компроміс на старті: своя форма з першого дня, інтеграція з CRM — коли записів стане більше, ніж адміністратор встигає обробляти."),
  cta(
    "Порахуйте вартість сайту для вашого салону",
    "Відповідайте на 5 питань — калькулятор покаже вилку ціни з онлайн-записом, прайсом і галереєю робіт.",
    "Відкрити калькулятор",
    "/calculator"
  ),
  h2("Прайс і портфоліо майстрів: що конвертує в запис"),
  p("Друге, що шукає клієнтка після «чи можна записатись», — «скільки коштує» і «хто робитиме». Сторінки, які мають бути на сайті салону обов'язково:"),
  li("**Прайс із цінами, а не «від».** Таблиця послуг з реальними цінами знімає бар'єр «соромно спитати в директі». Якщо ціна залежить від довжини чи складності — покажіть вилку і поясніть, від чого вона залежить."),
  li("**Сторінки майстрів.** Фото, спеціалізація, сертифікати, роботи саме цього майстра і кнопка «Записатись до Олени». Клієнтки ходять «до людини», а не «в заклад» — дайте їм обрати."),
  li("**Портфоліо робіт за категоріями.** Манікюр окремо, брови окремо, зачіски окремо. Одна нескінченна стрічка «всього підряд» працює гірше, ніж 12 найкращих робіт у кожній категорії."),
  li("**Сторінки послуг.** Окрема сторінка «Ламінування вій» з описом, тривалістю, протипоказаннями й ціною — це ще й посадкова для пошуку, куди Google приведе людей за цим запитом."),
  h2("Фотогалерея і швидкість: головний конфлікт б'юті-сайтів"),
  p("Сайт салону живе фотографіями — і саме вони найчастіше його вбивають. Галерея з 200 фото по 3 МБ вантажиться 15 секунд на мобільному, а 80% трафіку салонів — це смартфони. Клієнтка не чекає: закрила вкладку — пішла до конкурентки."),
  p("Що ми робимо, щоб галерея літала: сучасні формати WebP/AVIF замість важких JPEG, ліниве завантаження (фото підвантажуються під час скролу), CDN і адаптивні розміри — телефон отримує маленьку версію, а не 4000-піксельний оригінал. Про те, як дизайн впливає на конверсію, ми докладно писали в статті [9 дизайн-прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),
  h2("Відгуки: соціальний доказ, який працює на запис"),
  p("Відгуки на сайті — не декорація. Блок із реальними відгуками (ім'я, фото, послуга) поруч із кнопкою запису знімає останній сумнів. Практичні правила:"),
  num("Підтягуйте оцінку з Google Maps — «4,9 із 127 відгуків» переконливіше за три анонімні цитати."),
  num("Прив'язуйте відгук до послуги і майстра: відгук про манікюр — на сторінці манікюру."),
  num("Просіть відгук одразу після візиту — SMS чи повідомлення з посиланням дає в рази більше відповідей, ніж табличка на ресепшені."),
  h2("Локальне SEO: «манікюр + район» — ваші найгарячіші запити"),
  p("Салон краси — локальний бізнес: ніхто не їде через усе місто на корекцію брів. Тому найцінніші запити — не «салон краси Київ» (там висока конкуренція і половина шукачів не з вашого району), а «манікюр Позняки», «перукарня Франківський район», «брови біля метро Лівобережна»."),
  p("Що для цього потрібно: сторінка контактів із картою і маршрутом, адреса й графік у розмітці Schema.org, зв'язаний профіль Google Business, локальні ключі в заголовках сторінок послуг. Як салону потрапити в топ-3 карт Google, ми розібрали окремо: [локальне SEO і топ-3 Google Maps](/blog/lokalne-seo-top-3-google-maps)."),
  h2("Створення і просування: чому це одна задача, а не дві"),
  p("Запит «сайт для салону краси створення і просування» — насправді правильна постановка задачі. Сайт без просування — це вітрина в підвалі: гарна, але ніхто не заходить. Схема, яка працює в б'юті-ніші:"),
  li("**Місяць 1:** сайт з онлайн-записом, прайсом, майстрами й базовою SEO-структурою — від $800 за лендінг."),
  li("**Місяці 2–6:** [SEO-просування](/seo) від **$300/міс** — локальні сторінки послуг, робота з Google Business, відгуки, контент. Перші стабільні записи з пошуку зазвичай на 3–4 місяць."),
  li("**Постійно:** Instagram веде на сайт (посилання в шапці профілю, сторіз «записатись»), сайт збирає запис і в робочі, і в неробочі години."),
  p("Математика проста: середній чек салону $20–40, постійна клієнтка ходить щомісяця. Дві-три нові клієнтки на тиждень із пошуку окуповують $300/міс уже в перший рік — а далі вони приходять повторно вже без реклами."),
  h2("Що підготувати перед стартом розробки"),
  p("Розробка сайту для салону краси йде швидше, коли контент готовий до першого макета. Ось чеклист, який ми даємо власницям на старті:"),
  num("**Прайс у таблиці:** послуги, ціни, тривалість. Якщо ціни «плавають» — зафіксуйте вилки і правила («довжина 3 — плюс 100 грн»)."),
  num("**Фото робіт:** 10–15 найкращих на кожну категорію послуг, горизонтальні й вертикальні, без чужих водяних знаків."),
  num("**Дані майстрів:** фото, спеціалізація, сертифікати, стаж — по 3–4 речення на людину."),
  num("**Доступи:** акаунт CRM (altegio/DIKIDI), профіль Google Business, домен, якщо він уже є."),
  num("**5–7 реальних відгуків** із дозволом на публікацію імені та фото."),
  p("З готовим контентом лендінг виходить за 1–2 тижні; без нього строки ростуть удвічі — саме збирання фото і прайсу зазвичай і є вузьким місцем."),
  h2("Скільки коштує сайт для салону краси у 2026"),
  p("Вилка залежить від масштабу: майстру-одиночці не потрібен функціонал мережі. Наші пакети з реальними цінами:"),
  table(
    ["Формат", "Що всередині", "Ціна", "Строки"],
    [
      ["**Лендінг майстра**", "Одна сторінка: послуги, прайс, роботи, форма запису, відгуки", "від $800", "1–2 тижні"],
      ["**Сайт салону**", "5–10 сторінок: послуги, майстри, галерея, онлайн-запис (інтеграція $200–500)", "$1 500–3 000", "3–5 тижнів"],
      ["**Сайт мережі салонів**", "Сторінки філій, спільний бренд, запис у кожній локації, кабінети адміністраторів", "від $3 500", "6–10 тижнів"],
    ]
  ),
  p("Якщо хочете зрозуміти, з чого складається ціна і на чому можна заощадити без шкоди, — читайте розбір [скільки коштує розробка сайту у 2026](/blog/vartist-rozrobky-saytu-2026). А формат [лендінгу](/landing) — найшвидший спосіб перевірити, як сайт працює саме для вашого салону."),
  h2("Свій сайт чи тільки Instagram: чесне порівняння"),
  table(
    ["Критерій", "Тільки Instagram", "Сайт + Instagram"],
    [
      ["Запис 24/7", "Директ чекає адміністратора", "Форма чи CRM-віджет — запис за 30 секунд"],
      ["Нові клієнтки з Google", "Немає — профіль майже не ранжується", "Пошук «послуга + район» і Google Maps"],
      ["Прайс", "«Ціну написали в директ»", "Відкрита таблиця цін — бар'єр знято"],
      ["Контроль охоплення", "Алгоритм показує 5–10% підписниць", "Ваш майданчик — ваші правила"],
      ["Довіра", "Соцдоказ через фото", "Відгуки, майстри, бренд, домен"],
      ["Ризик блокування", "Акаунт можуть заблокувати за день", "Сайт належить вам"],
    ]
  ),
  h2("Приклади: б'юті-сайти, які ми зробили"),
  p("Подивіться живі роботи студії в б'юті-ніші — це корисніше за будь-які обіцянки:"),
  li("[Boulevard Salon](/portfolio/boulevard-salon) — сайт салону краси: послуги, майстри, запис, акуратний преміальний стиль без «рожевого шаблону»."),
  li("[E-Fedra Beauty](/portfolio/e-fedra-beauty) — б'юті-напрям бренду E-Fedra: структура послуг і візуальна мова, що тримає впізнаваність."),
  li("[Glimmer](/portfolio/glimmer) — проєкт із б'юті-сегмента: швидка галерея і чіткий шлях до заявки."),
  p("У кожному з цих проєктів головна метрика була одна — скільки відвідувачок доходить до кнопки запису. Дизайн, тексти і швидкість підпорядковані саме їй."),
  cta(
    "Готові зробити сайт, який записує клієнток?",
    "Покажемо структуру під ваш салон, порахуємо точну ціну і строки. Безкоштовна консультація — без зобов'язань.",
    "Обговорити проєкт",
    "/calculator"
  ),
];

// ---------------------------------------------------------------------------
// RU body
// ---------------------------------------------------------------------------
const bodyRu = [
  tldr("Коротко: создание сайта салона красоты", [
    "Создание сайта салона красоты закрывает то, что не может Instagram: запись ночью, поиск в Google и прайс без «цену написали в директ».",
    "Онлайн-запись к конкретному мастеру — функция номер один: интеграция altegio или DIKIDI стоит $200–500, своя форма входит в разработку.",
    "Лендинг мастера — от $800, сайт салона — $1 500–3 000, сайт сети салонов — от $3 500.",
    "Локальное SEO «услуга + район» приводит клиенток, которые ищут маникюр в 10 минутах от дома.",
    "Связка «создание и продвижение» окупается с 2–3 новых клиенток в неделю: SEO — от $300/мес.",
  ]),
  p("Сайт для салона красоты — это страница с онлайн-записью к конкретному мастеру, открытым прайсом, портфолио работ и отзывами, которую находят в Google по запросу «маникюр + ваш район». Instagram остаётся витриной, но записывает клиенток, отвечает на «сколько стоит?» и работает в два часа ночи именно сайт."),
  p("Мы в Code-Site.Art сделали несколько проектов в бьюти-нише и видим одну и ту же историю: владелица годами вкладывается в Instagram, а потом обнаруживает, что конкурентка с простым сайтом забирает весь поисковый трафик района. Разберём, что должно быть на сайте салона, во сколько обойдётся разработка сайта для салона красоты и почему создание без продвижения — деньги на ветер."),
  h2("Почему одного Instagram уже мало"),
  p("Instagram отлично греет аудиторию: фото работ, сторис, «до/после». Но как единственная платформа он подводит в трёх местах."),
  li("**Алгоритмы решают за вас.** Посты видят 5–10% подписчиц, и вы не управляете тем, кому лента покажет ваш прайс. Сайт в выдаче Google видят все, кто ищет."),
  li("**Новые клиентки вас не находят.** Запрос «маникюр Оболонь» или «парикмахерская рядом» вводят в Google, а не в поиск Instagram. Нет сайта — нет вас ни в выдаче, ни на картах."),
  li("**Запись зависит от администратора.** Директ в 23:40 прочитают утром — а клиентка уже записалась туда, где форма сработала сразу. По данным сервисов бронирования, 30–40% онлайн-записей приходится на нерабочие часы салона."),
  p("Вывод — не «бросить Instagram», а перестать требовать от него того, для чего он не создан. Соцсеть привлекает и удерживает внимание, сайт превращает его в записи."),
  h2("Онлайн-запись: altegio / DIKIDI или своя форма"),
  p("Клиентка должна выбрать услугу, мастера и свободное время без единого звонка. Есть два пути."),
  h3("Интеграция с CRM для салонов"),
  p("Если салон уже ведёт журнал в altegio (бывший YCLIENTS), DIKIDI или похожей системе, логично встроить её виджет или подключиться по API: расписание мастеров, услуги и напоминания остаются в одной системе, а сайт становится ещё одним входом в тот же журнал. Типовая интеграция — **$200–500** к цене сайта; сложные сценарии вроде личного кабинета клиентки поверх API — уже $1 000–3 000."),
  h3("Своя форма записи"),
  p("Небольшому салону или мастеру-одиночке на старте хватает простой формы: услуга, желаемая дата, телефон — заявка падает администратору в Telegram. Это дешевле (входит в стоимость лендинга), но подтверждение времени остаётся ручным. Рабочий компромисс: своя форма с первого дня, CRM-интеграция — когда записей станет больше, чем администратор успевает обрабатывать."),
  cta(
    "Посчитайте стоимость сайта для вашего салона",
    "Ответьте на 5 вопросов — калькулятор покажет вилку цены с онлайн-записью, прайсом и галереей работ.",
    "Открыть калькулятор",
    "/ru/calculator"
  ),
  h2("Прайс и портфолио мастеров: что конвертирует в запись"),
  p("После «можно ли записаться» клиентка ищет «сколько стоит» и «кто будет делать». Обязательные разделы:"),
  li("**Прайс с ценами, а не «от».** Открытая таблица снимает барьер «неудобно спрашивать в директе». Если цена зависит от длины или сложности — покажите вилку и объясните, от чего она зависит."),
  li("**Страницы мастеров.** Фото, специализация, сертификаты, работы конкретного мастера и кнопка «Записаться к Елене». Клиентки ходят «к человеку», а не «в заведение»."),
  li("**Портфолио по категориям.** Маникюр отдельно, брови отдельно, причёски отдельно: 12 лучших работ в категории продают лучше бесконечной ленты «всего подряд»."),
  li("**Страницы услуг.** Отдельная страница «Ламинирование ресниц» с описанием, длительностью и ценой — это ещё и посадочная, на которую Google приводит людей по этому запросу."),
  h2("Фотогалерея и скорость: главный конфликт бьюти-сайтов"),
  p("Сайт салона живёт фотографиями — и они же чаще всего его убивают. Галерея из 200 фото по 3 МБ грузится 15 секунд на смартфоне, а мобильный трафик у салонов — около 80%. Клиентка не ждёт: закрыла вкладку — записалась к конкурентке."),
  p("Чтобы галерея летала, мы используем форматы WebP/AVIF, ленивую подгрузку при скролле, CDN и адаптивные размеры: телефон получает лёгкую версию, а не 4000-пиксельный оригинал. О том, как дизайн влияет на конверсию, — в разборе [9 дизайн-приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),
  h2("Отзывы: социальное доказательство, которое записывает"),
  p("Блок с настоящими отзывами (имя, фото, услуга) рядом с кнопкой записи снимает последнее сомнение. Три практических правила:"),
  num("Подтягивайте рейтинг из Google Maps — «4,9 из 127 отзывов» убедительнее трёх анонимных цитат."),
  num("Привязывайте отзыв к услуге и мастеру: отзыв о маникюре — на странице маникюра."),
  num("Просите отзыв сразу после визита: сообщение со ссылкой даёт в разы больше ответов, чем табличка на ресепшене."),
  h2("Локальное SEO: «услуга + район» — самые горячие запросы"),
  p("Салон — локальный бизнес: никто не едет через весь город на коррекцию бровей. Поэтому самые ценные запросы — не «салон красоты Киев» с огромной конкуренцией, а «маникюр Позняки», «парикмахерская у метро Левобережная». Именно здесь создание сайта для салона красоты и даёт максимальную отдачу: страница услуги с районом в заголовке плюс профиль Google Business выводят салон в карты."),
  p("Минимальный набор: страница контактов с картой и маршрутом, адрес и график в разметке Schema.org, связанный профиль Google Business, локальные ключи в заголовках страниц услуг. Как попасть в топ-3 карт, разобрали отдельно: [локальное SEO и топ-3 Google Maps](/ru/blog/lokalnoe-seo-top-3-google-maps)."),
  h2("Сайт для салона красоты: создание и продвижение — одна задача"),
  p("Запрос «сайт для салона красоты создание и продвижение» — правильная постановка. Сайт без продвижения — витрина в подвале: красивая, но никто не заходит. Схема, которая работает в бьюти-нише:"),
  li("**Месяц 1:** сайт с онлайн-записью, прайсом и мастерами, базовая SEO-структура — от $800 за лендинг."),
  li("**Месяцы 2–6:** [SEO-продвижение](/ru/seo) от **$300/мес** — локальные страницы услуг, Google Business, отзывы, контент. Первые стабильные записи из поиска — обычно на 3–4 месяц."),
  li("**Постоянно:** Instagram ведёт на сайт (ссылка в шапке профиля, сторис «записаться»), сайт собирает записи круглосуточно."),
  p("Математика: средний чек салона $20–40, постоянная клиентка приходит ежемесячно. Две-три новые клиентки в неделю из поиска окупают $300/мес уже в первый год — дальше они возвращаются без всякой рекламы. Для сравнения: таргет в Instagram приводит клиентку разово и дорожает каждый сезон, а позиция в локальной выдаче работает годами и достаётся тому, кто занял её первым в своём районе."),
  h2("Что подготовить перед стартом разработки"),
  p("Разработка сайтов для салонов красоты идёт заметно быстрее, когда контент готов к первому макету. Чеклист, который мы отдаём владелицам на старте проекта:"),
  num("**Прайс в таблице:** услуги, цены, длительность. Если цены «плавают» — зафиксируйте вилки и правила («длина 3 — плюс 100 грн»)."),
  num("**Фото работ:** 10–15 лучших на каждую категорию услуг, горизонтальные и вертикальные, без чужих водяных знаков."),
  num("**Данные мастеров:** фото, специализация, сертификаты, стаж — по 3–4 предложения на человека."),
  num("**Доступы:** аккаунт CRM (altegio/DIKIDI), профиль Google Business, домен, если он уже куплен."),
  num("**5–7 настоящих отзывов** с разрешением публиковать имя и фото."),
  p("С готовым контентом лендинг выходит за 1–2 недели; без него сроки удваиваются — именно сбор фото и прайса обычно и оказывается узким местом проекта, а не дизайн или код."),
  h2("Сколько стоит разработка сайтов для салонов красоты в 2026"),
  p("Вилка зависит от масштаба: мастеру-одиночке не нужен функционал сети. Наши пакеты с реальными ценами:"),
  table(
    ["Формат", "Что внутри", "Цена", "Сроки"],
    [
      ["**Лендинг мастера**", "Одна страница: услуги, прайс, работы, форма записи, отзывы", "от $800", "1–2 недели"],
      ["**Сайт салона**", "5–10 страниц: услуги, мастера, галерея, онлайн-запись (интеграция $200–500)", "$1 500–3 000", "3–5 недель"],
      ["**Сайт сети салонов**", "Страницы филиалов, общий бренд, запись в каждой локации, кабинеты администраторов", "от $3 500", "6–10 недель"],
    ]
  ),
  p("Из чего складывается цена и где можно сэкономить без потери качества — в разборе [сколько стоит сайт в 2026](/ru/blog/skolko-stoit-sayt-2026). А формат [лендинга](/ru/landing) — самый быстрый способ проверить, как сайт работает именно для вашего салона."),
  h2("Свой сайт или только Instagram: честное сравнение"),
  table(
    ["Критерий", "Только Instagram", "Сайт + Instagram"],
    [
      ["Запись 24/7", "Директ ждёт администратора", "Форма или CRM-виджет — запись за 30 секунд"],
      ["Новые клиентки из Google", "Нет — профиль почти не ранжируется", "Поиск «услуга + район» и Google Maps"],
      ["Прайс", "«Цену написали в директ»", "Открытая таблица цен — барьер снят"],
      ["Контроль охвата", "Алгоритм показывает 5–10% подписчиц", "Ваша площадка — ваши правила"],
      ["Доверие", "Соцдоказательство через фото", "Отзывы, мастера, бренд, домен"],
      ["Риск блокировки", "Аккаунт могут заблокировать за день", "Сайт принадлежит вам"],
    ]
  ),
  h2("Примеры: бьюти-сайты, которые мы сделали"),
  p("Живые работы студии в бьюти-нише скажут больше любых обещаний:"),
  li("[Boulevard Salon](/ru/portfolio/boulevard-salon) — сайт салона красоты: услуги, мастера, запись, премиальный стиль без «розового шаблона»."),
  li("[E-Fedra Beauty](/ru/portfolio/e-fedra-beauty) — бьюти-направление бренда E-Fedra: структура услуг и визуальный язык, который держит узнаваемость."),
  li("[Glimmer](/ru/portfolio/glimmer) — проект из бьюти-сегмента: быстрая галерея и короткий путь до заявки."),
  p("Во всех трёх проектах метрика одна: сколько посетительниц доходит до кнопки записи. Дизайн, тексты и скорость подчинены именно ей."),
  cta(
    "Готовы к сайту, который записывает клиенток?",
    "Покажем структуру под ваш салон, посчитаем точную цену и сроки. Бесплатная консультация — без обязательств.",
    "Обсудить проект",
    "/ru/calculator"
  ),
];

// ---------------------------------------------------------------------------
// EN body
// ---------------------------------------------------------------------------
const bodyEn = [
  tldr("In short: a beauty salon website", [
    "A beauty salon website does three things Instagram cannot: takes bookings at 2 a.m., gets found on Google, and shows prices without a DM.",
    "Online booking with a specific stylist is feature number one: an altegio or DIKIDI integration costs $200–500, a custom form is included in the build.",
    "A single-stylist landing page starts at $800, a salon website runs $1,500–3,000, a multi-location chain site starts at $3,500.",
    "Local SEO for 'service + neighbourhood' brings clients who search for a manicure ten minutes from home.",
    "Design plus promotion beats a pretty brochure site: SEO from $300/month pays for itself with 2–3 new clients a week.",
  ]),
  p("A beauty salon website is a page where a client can book a specific stylist online, see an up-to-date price list, browse a portfolio of real work and read reviews — and which Google surfaces for 'manicure + your neighbourhood'. Instagram stays your shop window, but it is the website that takes bookings, answers 'how much?' and works at two in the morning."),
  p("At Code-Site.Art we have built several sites for beauty businesses, and the pattern is always the same: an owner invests years into Instagram, then discovers a competitor with a simple website is quietly collecting every search-driven client in the area. Here is what belongs on a salon website, what good beauty salon website design costs, and why a build without promotion is money down the drain. We are a studio based in Ukraine — European quality at sensible rates."),
  h2("Why Instagram alone is no longer enough"),
  p("Instagram is a great warm-up channel for a salon: photos, stories, before-and-afters. As your only platform, though, it fails in three places."),
  li("**The algorithm decides for you.** Posts reach 5–10% of your followers, and you cannot control who sees your price list. A website in Google results is seen by everyone who searches."),
  li("**New clients cannot find you.** People type 'balayage near me' or 'nail salon Shoreditch' into Google, not into Instagram search. No website means no presence in results or on the map pack."),
  li("**Bookings depend on a receptionist.** A DM sent at 11:40 p.m. gets read in the morning — by which time the client has booked wherever the form worked instantly. Booking platforms report 30–40% of online appointments are made outside salon hours."),
  p("The takeaway is not 'quit Instagram' — it is to stop asking it to do a job it was never built for. Social media warms the audience; a salon website with online booking converts it into appointments."),
  h2("Online booking: altegio / DIKIDI integration or a custom form"),
  p("A client should be able to pick a service, a stylist and a free slot without a single phone call. There are two ways to get there."),
  h3("Integrating a salon CRM"),
  p("If your salon already runs its diary in altegio (formerly YCLIENTS), DIKIDI, Fresha or similar, the sensible move is to embed its widget or connect via API: stylist schedules, services and client reminders stay in one system, and the website becomes another door into the same diary. A typical integration adds **$200–500** to the build; heavier scenarios — say, a client account built on top of the API — run $1,000–3,000."),
  h3("A custom booking form"),
  p("A small salon or independent stylist often needs no more than a clean form: service, preferred date, phone number — the request lands in the admin's Telegram. It is cheaper (included in the landing page price), but confirming the exact slot stays manual. A sensible compromise: launch with a custom form, add the CRM integration once bookings outgrow what one person can juggle."),
  cta(
    "Price up a website for your salon",
    "Answer 5 questions and the calculator shows a realistic price range with online booking, a price list and a gallery.",
    "Open the calculator",
    "/en/calculator"
  ),
  h2("Price list and stylist portfolios: what converts into bookings"),
  p("Right after 'can I book?' a client asks 'how much?' and 'who will do it?'. The non-negotiable sections:"),
  li("**A price list with real numbers, not 'from'.** An open table removes the 'awkward to ask in DMs' barrier. If price depends on length or complexity, show the range and explain what moves it."),
  li("**Stylist pages.** Photo, specialisation, certificates, that stylist's own work and a 'Book with Helen' button. Clients follow a person, not a venue — let them choose one."),
  li("**A portfolio sorted by category.** Nails, brows and hair separately: twelve best works per category sell better than one endless mixed feed."),
  li("**Service pages.** A dedicated 'Lash lamination' page with description, duration and price doubles as the landing page Google sends searchers to."),
  h2("Photo gallery vs speed: the classic beauty-site conflict"),
  p("A salon site lives on photography — and photography is what usually kills it. A gallery of two hundred 3 MB photos takes 15 seconds to load on a phone, and roughly 80% of salon traffic is mobile. Nobody waits: tab closed, competitor booked."),
  p("To keep the gallery fast we use WebP/AVIF formats, lazy loading on scroll, a CDN and responsive sizes, so a phone gets a light version rather than the 4000-pixel original. For how design choices move conversion, see [9 design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),
  h2("Reviews: social proof that books appointments"),
  p("A block of genuine reviews — name, photo, service — placed next to the booking button removes the last doubt. Three practical rules:"),
  num("Pull your Google Maps rating in: '4.9 from 127 reviews' beats three anonymous quotes."),
  num("Tie each review to a service and a stylist: manicure reviews belong on the manicure page."),
  num("Ask for the review right after the visit — a message with a link gets far more responses than a sign at reception."),
  h2("Local SEO: 'service + neighbourhood' are your hottest searches"),
  p("A salon is a local business: nobody crosses the city for a brow touch-up. So the most valuable searches are not 'beauty salon London' with brutal competition, but 'manicure Camden' or 'hairdresser near Angel station'. This is where a salon website earns its keep: a service page with the neighbourhood in the heading plus a Google Business profile puts you in the map pack."),
  p("The minimum kit: a contact page with a map and directions, address and opening hours in Schema.org markup, a linked Google Business profile, and local keywords in service-page headings. We covered how to reach the Google Maps top three separately: [local SEO for the map pack](/en/blog/local-seo-google-maps-top-3)."),
  h2("Build and promote: one job, not two"),
  p("A website nobody promotes is a shop window in a basement: lovely, and empty. The scheme that works in the beauty niche:"),
  li("**Month 1:** a website with online booking, prices and stylists, built on a sound SEO structure — from $800 for a landing page."),
  li("**Months 2–6:** [SEO promotion](/en/seo) from **$300/month** — local service pages, Google Business work, reviews, content. Steady bookings from search usually start in month 3–4."),
  li("**Ongoing:** Instagram sends people to the site (link in bio, 'book now' stories), and the site takes bookings around the clock."),
  p("The maths is friendly: an average salon ticket is $20–40 and a regular client returns monthly. Two or three new clients a week from search cover $300/month within the first year — and after that they come back without any ad spend."),
  h2("What a beauty salon website costs in 2026"),
  p("The range depends on scale — an independent stylist does not need chain-level features. Our packages, with real prices:"),
  table(
    ["Format", "What's inside", "Price", "Timeline"],
    [
      ["**Stylist landing page**", "One page: services, prices, portfolio, booking form, reviews", "from $800", "1–2 weeks"],
      ["**Salon website**", "5–10 pages: services, stylists, gallery, online booking (integration $200–500)", "$1,500–3,000", "3–5 weeks"],
      ["**Salon chain website**", "Location pages, shared brand, booking per location, admin accounts", "from $3,500", "6–10 weeks"],
    ]
  ),
  p("For a full breakdown of where the money goes and where you can safely save, read [what a custom website costs in 2026](/en/blog/custom-website-cost-uk-2026). And a [landing page](/en/landing) is the fastest way to test how a website performs for your particular salon."),
  h2("Own website vs Instagram only: an honest comparison"),
  table(
    ["Criterion", "Instagram only", "Website + Instagram"],
    [
      ["24/7 booking", "DMs wait for the receptionist", "Form or CRM widget — booked in 30 seconds"],
      ["New clients from Google", "None — profiles barely rank", "'Service + area' search and Google Maps"],
      ["Prices", "'We DM'd you the price'", "Open price table — barrier removed"],
      ["Reach control", "Algorithm shows 5–10% of followers", "Your platform, your rules"],
      ["Trust", "Social proof via photos", "Reviews, stylists, brand, own domain"],
      ["Ban risk", "Account can vanish overnight", "The website is yours"],
    ]
  ),
  h2("Examples: beauty websites we have built"),
  p("Live studio work in the beauty niche says more than any promise:"),
  li("[Boulevard Salon](/en/portfolio/boulevard-salon) — a beauty salon website: services, stylists, booking, a premium look with none of the pink-template clichés."),
  li("[E-Fedra Beauty](/en/portfolio/e-fedra-beauty) — the beauty line of the E-Fedra brand: a clear service structure and a visual language that keeps the brand recognisable."),
  li("[Glimmer](/en/portfolio/glimmer) — a beauty-segment project: a fast gallery and a short path to the enquiry."),
  p("In every one of these projects the metric was the same: how many visitors reach the booking button. Design, copy and speed all answer to it."),
  cta(
    "Ready for a website that books clients?",
    "We'll sketch a structure for your salon and quote an exact price and timeline. Free consultation, no strings attached.",
    "Discuss your project",
    "/en/calculator"
  ),
];

const doc = {
  _id: "ltAug2026-sait-dlia-salonu-krasy",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-salonu-krasy" },
    ru: { _type: "slug", current: "sayt-dlya-salona-krasoty" },
    en: { _type: "slug", current: "beauty-salon-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для салону краси: онлайн-запис, прайс і бренд, який тримає клієнток",
    ru: "Сайт для салона красоты: онлайн-запись, прайс и бренд, который удерживает клиенток",
    en: "Beauty Salon Website: Online Booking, Prices and a Brand That Keeps Clients",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для салону краси 2026: запис, прайс, ціни",
    ru: "Создание сайта салона красоты 2026: цены, запись",
    en: "Beauty Salon Website Design 2026: Booking, Prices",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для салону краси з онлайн-записом ✔️ Лендінг від $800, мережа від $3 500 ✔️ Прайс, майстри, локальне SEO ➡ Порахуйте ціну за 2 хвилини",
    ru: "➤ Создание сайта салона красоты с онлайн-записью ✔️ Лендинг от $800, сеть от $3 500 ✔️ Прайс, мастера, продвижение ➡ Рассчитайте цену за 2 минуты",
    en: "➤ Beauty salon website with online booking ✔️ Landing page from $800, chain site from $3,500 ✔️ Price list, stylists, local SEO ➡ Get a quote in 2 minutes",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Сайти для бізнесу",
    ru: "Сайты для бизнеса",
    en: "Websites for business",
  },
  lede: {
    _type: "localizedString",
    uk: "Instagram гріє аудиторію, але записує клієнток сайт: онлайн-запис до майстра, відкритий прайс, швидка галерея і локальне SEO. Розбираємо, що має бути на сайті салону і скільки це коштує у 2026.",
    ru: "Instagram греет аудиторию, но записывает клиенток сайт: онлайн-запись к мастеру, открытый прайс, быстрая галерея и локальное SEO. Разбираем, что должно быть на сайте салона и сколько стоит его создание и продвижение в 2026.",
    en: "Instagram warms the audience, but it is the website that books clients: online booking per stylist, an open price list, a fast gallery and local SEO. Here is what a salon website needs and what it costs in 2026.",
  },
  tags: ["сайт для салону краси", "beauty", "онлайн-запис", "локальне SEO"],
  relatedPostSlugs: ["9-dyzain-pryiomiv-dlia-konversii", "lokalne-seo-top-3-google-maps", "vartist-rozrobky-saytu-2026"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для салону краси?",
        ru: "Сколько стоит создание сайта салона красоты?",
        en: "How much does a beauty salon website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг для майстра — від $800, повноцінний сайт салону з онлайн-записом — $1 500–3 000, сайт мережі салонів — від $3 500. Інтеграція з altegio чи DIKIDI додає $200–500. Точна ціна залежить від кількості сторінок, галереї та інтеграцій.",
        ru: "Лендинг мастера — от $800, полноценный сайт салона с онлайн-записью — $1 500–3 000, сайт сети салонов — от $3 500. Интеграция с altegio или DIKIDI добавляет $200–500. Точная цена зависит от количества страниц, галереи и интеграций.",
        en: "A single-stylist landing page starts at $800, a full salon website with online booking runs $1,500–3,000, and a multi-location chain site starts at $3,500. An altegio or DIKIDI integration adds $200–500. The exact price depends on page count, gallery and integrations.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен салону сайт, якщо є Instagram із записом у директ?",
        ru: "Нужен ли салону сайт, если есть Instagram с записью в директ?",
        en: "Does a salon need a website if it already takes bookings via Instagram DMs?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, якщо ви хочете клієнток із Google. Instagram майже не ранжується в пошуку, охоплення постів падає, а директ уночі ніхто не читає. Сайт закриває запис 24/7, відкритий прайс і локальний пошук «послуга + район» — Instagram при цьому лишається каналом прогріву.",
        ru: "Да, если нужны клиентки из Google. Instagram почти не ранжируется в поиске, охват постов падает, а директ ночью никто не читает. Сайт закрывает запись 24/7, открытый прайс и локальный поиск «услуга + район» — Instagram при этом остаётся каналом прогрева.",
        en: "Yes, if you want clients from Google. Instagram barely ranks in search, post reach keeps falling, and nobody reads DMs at night. A website covers 24/7 booking, an open price list and 'service + area' local search, while Instagram stays your warm-up channel.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що краще для запису: інтеграція altegio / DIKIDI чи своя форма?",
        ru: "Что лучше для записи: интеграция altegio / DIKIDI или своя форма?",
        en: "What is better for booking: an altegio / DIKIDI integration or a custom form?",
      },
      answer: {
        _type: "localizedText",
        uk: "Якщо салон уже веде журнал у CRM — інтегруйте її: розклад майстрів і нагадування лишаться в одній системі, а це $200–500 до ціни сайту. Майстру-одиночці на старті вистачить своєї форми із заявкою в Telegram — вона входить у вартість лендінгу.",
        ru: "Если салон уже ведёт журнал в CRM — интегрируйте её: расписание мастеров и напоминания остаются в одной системе, это $200–500 к цене сайта. Мастеру-одиночке на старте хватит своей формы с заявкой в Telegram — она входит в стоимость лендинга.",
        en: "If the salon already runs its diary in a CRM, integrate it: stylist schedules and reminders stay in one system for $200–500 on top of the build. An independent stylist starting out is fine with a custom form that sends requests to Telegram — it is included in the landing page price.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка сайту для салону краси?",
        ru: "Сколько времени занимает разработка сайта для салона красоты?",
        en: "How long does it take to build a beauty salon website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг — 1–2 тижні, сайт салону з онлайн-записом і галереєю — 3–5 тижнів, сайт мережі з філіями — 6–10 тижнів. Найдовше зазвичай збирають контент: фото робіт, прайс і описи послуг варто готувати паралельно з дизайном.",
        ru: "Лендинг — 1–2 недели, сайт салона с онлайн-записью и галереей — 3–5 недель, сайт сети с филиалами — 6–10 недель. Дольше всего обычно собирают контент: фото работ, прайс и описания услуг стоит готовить параллельно с дизайном.",
        en: "A landing page takes 1–2 weeks, a salon website with online booking and a gallery 3–5 weeks, a chain site with location pages 6–10 weeks. Content gathering is usually the slowest part: prepare photos, prices and service descriptions in parallel with the design.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як просувати сайт салону, щоб він приводив клієнток?",
        ru: "Как продвигать сайт салона красоты, чтобы он приводил клиенток?",
        en: "How do you promote a salon website so it actually brings clients?",
      },
      answer: {
        _type: "localizedText",
        uk: "Ставка на локальне SEO: сторінки послуг із районом у заголовках, профіль Google Business, відгуки й швидкий мобільний сайт. Просування коштує від $300/міс, перші стабільні записи з пошуку — на 3–4 місяць. Instagram паралельно веде трафік на сайт через посилання в профілі.",
        ru: "Ставка на локальное SEO: страницы услуг с районом в заголовках, профиль Google Business, отзывы и быстрый мобильный сайт. Продвижение стоит от $300/мес, первые стабильные записи из поиска — на 3–4 месяц. Instagram параллельно ведёт трафик на сайт через ссылку в профиле.",
        en: "Bet on local SEO: service pages with the neighbourhood in the headings, a Google Business profile, reviews and a fast mobile site. Promotion starts at $300/month, with steady bookings from search typically arriving in month 3–4. Meanwhile Instagram funnels traffic to the site via the link in bio.",
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
