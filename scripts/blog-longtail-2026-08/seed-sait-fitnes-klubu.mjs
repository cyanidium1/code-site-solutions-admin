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

const bodyUk = [
  tldr("Коротко: сайт для фітнес-клубу", [
    "Три головні функції: актуальний розклад занять, онлайн-запис на тренування й оплата абонементів",
    "Лендінг персонального тренера — від $800, сайт клубу з розкладом і оплатою — від $3 500, платформа для мережі залів — від $6 000",
    "Онлайн-продовження абонемента знімає головний біль адміністратора: клієнт платить сам, без дзвінків і «завтра зайду»",
    "Запити «фітнес-клуб + район» виграє локальне SEO: люди обирають зал за 10 хвилин від дому",
    "Мобільний застосунок — другий крок. Спершу сайт: він працює на нових клієнтів і на пошук",
  ]),
  p("Сайт для фітнес-клубу вирішує три завдання: показує **актуальний розклад занять**, продає та продовжує **абонементи онлайн** і записує людину на перше тренування без дзвінка адміністратору. За цінами студії Code-Site.Art лендінг персонального тренера коштує від **$800**, повноцінний сайт клубу — від **$3 500**, платформа для мережі залів — від **$6 000**."),
  p("У цій статті розберемо, які блоки обов'язкові для сайту спортзалу, скільки коштує кожен формат, чим сайт для тренера відрізняється від сайту клубу і коли справді варто думати про мобільний застосунок. Усі цифри — реальні пакети нашої студії, а не «від 100 грн» з бірж фрілансу."),
  p("Матеріал стане в пригоді власникам тренажерних залів, студій йоги та пілатесу, кросфіт-боксів і персональним тренерам, які будують особистий бренд."),

  h2("Розклад занять і онлайн-запис: серце сайту"),
  p("Перше, що шукає відвідувач сайту спортзалу, — **розклад**. Якщо він захований у PDF, скріншоті з Instagram або взагалі «уточнюйте за телефоном», частина потенційних клієнтів просто закриє вкладку. Робочий розклад — це сітка з фільтрами за напрямом, тренером і днем тижня, яку адміністратор оновлює в адмінці за дві хвилини."),
  h3("Як має працювати запис на тренування"),
  num("Клієнт бачить заняття в розкладі й тисне «Записатися» — без реєстрації на пів сторінки."),
  num("Форма просить лише ім'я та телефон; система показує, скільки місць лишилося у групі."),
  num("Підтвердження приходить у SMS, Viber або Telegram, а нагадування — за кілька годин до тренування."),
  p("Технічно це або готовий сервіс запису, вбудований у сайт (типова інтеграція — **$200–500**), або кастомний модуль під логіку клубу. Ту саму механіку ми детально розбирали у статті про [сайт для салону краси](/blog/sait-dlia-salonu-krasy): запис у б'юті та фітнесі працює за однаковими правилами — менше кліків, миттєве підтвердження, автоматичне нагадування."),
  h3("Пробне тренування як воронка продажів"),
  p("Окремий сценарій — **безкоштовне чи знижкове пробне тренування**. Виносьте його в помітну кнопку на першому екрані: для новачка це найпростіший спосіб наважитися, а для клубу — головне джерело нових абонементів. Форма запису на пробне має бути найкоротшою на сайті: ім'я, телефон, зручний час. Далі підключається адміністратор, а конверсія з пробних у куплені абонементи стає головною метрикою ефективності сайту."),

  h2("Абонементи й онлайн-оплата: як сайт утримує клієнтів"),
  p("Другий блок, що прямо впливає на виручку, — **продаж і продовження абонементів онлайн**. Класична проблема клубу: абонемент закінчився, клієнт «збирається зайти оплатити» — і зникає на місяць. Кнопка «Продовжити» в телефоні закриває це питання за 30 секунд."),
  li("Вітрина абонементів: разове тренування, місяць, 3/6/12 місяців, персональні блоки занять"),
  li("Онлайн-оплата карткою, Apple Pay і Google Pay — без походу на рецепцію"),
  li("Автоматичне нагадування про закінчення абонемента з кнопкою продовження в один клік"),
  li("Особистий кабінет: скільки тренувань лишилося, історія платежів, заморозка"),
  p("Платіжна інтеграція вкладається у типовий діапазон **$200–500**; зв'язка з CRM клубу або обліковою системою — складніша, **$1 000–3 000**. Такий функціонал реалізується в межах [корпоративного сайту](/corporate-site) з кастомною логікою, а не шаблонної візитки."),
  p("Порада з практики: не ховайте ціни абонементів. Сторінка з чесною сіткою тарифів працює як фільтр — до адміністратора доходять люди, які вже готові купувати, а не «просто спитати». А для клубу це ще й менше рутини на рецепції."),

  h2("Скільки коштує сайт для фітнес-клубу у 2026 році"),
  p("Ціна залежить від формату. Ми виділяємо три типові сценарії:"),
  table(
    ["Формат", "Кому підходить", "Що входить", "Ціна від"],
    [
      ["Лендінг тренера", "Персональний тренер, мала студія", "Одна сторінка: метод, ціни, відгуки, форма запису", "**$800**"],
      ["Сайт клубу", "Зал чи студія з груповими заняттями", "Розклад, тренери, абонементи, онлайн-оплата, блог", "**$3 500**"],
      ["Платформа мережі", "Мережа залів у кількох містах чи районах", "Сторінки локацій, єдиний кабінет, CRM-інтеграції", "**$6 000**"],
    ],
  ),
  p("Додаткові витрати: підтримка — **$200/міс** або $40/год, SEO-просування — від **$300/міс**. Детальний розбір, з чого взагалі складається ціна сайту, — у статті про [вартість розробки сайту у 2026](/blog/vartist-rozrobky-saytu-2026)."),
  cta(
    "Порахуйте ціну сайту для вашого залу",
    "Дайте відповідь на кілька запитань — калькулятор покаже вилку ціни й термін розробки для вашого формату.",
    "Відкрити калькулятор",
    "/calculator",
  ),

  h2("Сторінки тренерів і особистий бренд"),
  p("Люди ходять не «в зал», а до тренера. Сторінка кожного тренера з живим фото, спеціалізацією, сертифікатами й посиланням на його заняття в розкладі — це водночас довіра і SEO: такі сторінки збирають запити на кшталт «тренер з йоги + місто»."),
  h3("Сайт для персонального тренера"),
  p("Якщо ви тренер і працюєте на себе, сайт клубу вам не потрібен — достатньо [лендінгу](/landing) від **$800**: ваша історія, метод, результати клієнтів «до/після», пакети тренувань і форма запису. Це той самий принцип особистого бренду спеціаліста, який ми розбирали в гайді про [сайт для психолога](/blog/sait-dlia-psykholoha): людина купує довіру до конкретного фахівця, а не абстрактну послугу."),
  p("Бонус для тренерів, які працюють онлайн: на лендінг легко додати продаж програм тренувань і відеокурсів — і він перетворюється на джерело пасивного доходу."),

  h2("Локальне SEO: «фітнес-клуб + район»"),
  p("Ніхто не їздить у спортзал через усе місто. Тому пошук у фітнесі майже завжди локальний: «спортзал Оболонь», «фітнес-клуб Львів центр», «тренажерний зал біля метро». Саме ці запити приводять людей, які реально дійдуть до вас на тренування."),
  li("Сторінка контактів із картою, адресою та маршрутом від найближчого метро чи зупинки"),
  li("Google Business Profile з реальними фото залу, актуальним графіком і відгуками"),
  li("Розмітка LocalBusiness за schema.org, щоб Google впевнено показував клуб у картах"),
  li("Назва району й міста в заголовках і текстах — природно, без спаму ключами"),
  p("Якщо у клубу кілька філій, кожна локація має отримати окрему сторінку зі своєю адресою, розкладом і командою тренерів — саме так карти й пошук розуміють, що ви фізично присутні в конкретному районі, а не «десь у місті»."),
  p("Як вивести бізнес у топ-3 карт, ми покроково описали в статті про [локальне SEO та Google Maps](/blog/lokalne-seo-top-3-google-maps). Комплексне [SEO-просування](/seo) для клубу в нашій студії коштує від **$300/міс**."),

  h2("Застосунок чи сайт: що потрібно клубу спершу"),
  p("Мобільний застосунок виглядає статусно, але для більшості залів це передчасна витрата: розробка коштує дорожче за сайт, а завантажують його лише вже лояльні клієнти."),
  li("Сайт працює на **нових** клієнтів: його знаходять у Google, на нього ведуть реклама і карти"),
  li("Застосунок працює на **постійних**: розклад у кишені, push-нагадування про тренування"),
  li("Адаптивний сайт з особистим кабінетом закриває 90% сценаріїв застосунку без витрат на дві платформи"),
  p("Розумна послідовність: спершу сайт із записом та оплатою, потім — PWA чи нативний застосунок, коли база переросте кілька сотень активних абонементів."),

  h2("Обов'язкові блоки сайту спортзалу"),
  p("Зведемо в одну таблицю блоки, без яких сайт фітнес-клубу не виконує свою роботу:"),
  table(
    ["Блок", "Що він дає"],
    [
      ["Розклад із фільтрами", "Клієнт знаходить «своє» заняття за 10 секунд; менше дзвінків адміністратору"],
      ["Онлайн-запис", "Запис 24/7 — зокрема ввечері, коли людина й вирішує «почати з понеділка»"],
      ["Абонементи з оплатою", "Продаж і продовження без каси; менше «завтра зайду оплачу»"],
      ["Сторінки тренерів", "Довіра плюс трафік за запитами «тренер + напрям + місто»"],
      ["Фото залу й віртуальний тур", "Знімає страх «а що там усередині» — головне заперечення новачків"],
      ["Відгуки та результати", "Соціальний доказ: історії «до/після» продають краще за знижки"],
      ["Ціни без «зателефонуйте»", "Прозорість відсіює нецільові дзвінки й підвищує конверсію запису"],
    ],
  ),
  h3("Фото залу і віртуальний тур"),
  p("Окремо про фото: стокові картинки з усміхненими моделями вбивають довіру миттєво. Потрібна реальна фотосесія залу, роздягалень і душових — саме це шукають новачки перед першим візитом. Віртуальний 3D-тур — гарний плюс, але друга черга: спершу якісні живі фото."),

  h2("Наш досвід: запис, оплата й особисті бренди"),
  p("Прямих фітнес-кейсів у портфоліо студії поки немає, і ми не вигадуватимемо неіснуючі. Але кожну механіку, з якої складається сайт клубу, ми вже будували в сусідніх нішах:"),
  li("[Boulevard Salon](/portfolio/boulevard-salon) і [E-Fedra Beauty](/portfolio/e-fedra-beauty) — онлайн-запис і вітрина послуг для б'юті-бізнесу: та сама логіка, що й запис на тренування"),
  li("[Oleksandr Sitnikov](/portfolio/oleksandr-sitnikov) та [Glenn Garbo](/portfolio/glenn-garbo) — сайти особистого бренду: підхід, який один в один працює для персонального тренера"),
  p("Тож коли ми говоримо про запис, оплату і сторінки спеціалістів — це перевірені на живих проєктах рішення, а не теорія з чужих статей."),
  cta(
    "Потрібен сайт для клубу чи лендінг тренера?",
    "Розкажіть про ваш зал — покажемо приклади механік запису, підкажемо формат і назвемо точну ціну.",
    "Розрахувати вартість",
    "/calculator",
  ),
];

const bodyRu = [
  tldr("Коротко: создание сайта фитнес-клуба", [
    "Три главные функции: актуальное расписание занятий, онлайн-запись на тренировку и оплата абонементов",
    "Лендинг персонального тренера — от $800, сайт клуба с расписанием и оплатой — от $3 500, платформа для сети залов — от $6 000",
    "Онлайн-продление абонемента снимает головную боль администратора: клиент платит сам, без звонков и «завтра зайду»",
    "Запросы «фитнес-клуб + район» выигрывает локальное SEO: люди выбирают зал в 10 минутах от дома",
    "Мобильное приложение — второй шаг. Сначала сайт: он работает на новых клиентов и на поиск",
  ]),
  p("Создание сайта фитнес-клуба сводится к трём задачам: показать **актуальное расписание занятий**, продавать и продлевать **абонементы онлайн** и записывать человека на первую тренировку без звонка администратору. По ценам студии Code-Site.Art лендинг персонального тренера стоит от **$800**, полноценный сайт клуба или фитнес-центра — от **$3 500**, платформа для сети залов — от **$6 000**."),
  p("В этой статье разберём, какие блоки обязательны при создании сайта фитнес-зала, сколько стоит каждый формат, чем сайт тренера отличается от сайта клуба и когда действительно пора думать о мобильном приложении. Все цифры — реальные пакеты нашей студии, а не «от 100 грн» с бирж фриланса."),
  p("Материал пригодится владельцам тренажёрных залов, студий йоги и пилатеса, кроссфит-боксов и персональным тренерам, которые строят личный бренд."),

  h2("Расписание занятий и онлайн-запись: сердце сайта"),
  p("Первое, что ищет посетитель сайта спортзала, — **расписание**. Если оно спрятано в PDF, скриншоте из Instagram или вовсе «уточняйте по телефону», часть потенциальных клиентов просто закроет вкладку. Рабочее расписание — это сетка с фильтрами по направлению, тренеру и дню недели, которую администратор обновляет в админке за две минуты."),
  h3("Как должна работать запись на тренировку"),
  num("Клиент видит занятие в расписании и жмёт «Записаться» — без регистрации на полстраницы."),
  num("Форма просит только имя и телефон; система показывает, сколько мест осталось в группе."),
  num("Подтверждение приходит в SMS, Viber или Telegram, а напоминание — за несколько часов до тренировки."),
  p("Технически это либо готовый сервис записи, встроенный в сайт (типовая интеграция — **$200–500**), либо кастомный модуль под логику клуба. Ту же механику мы подробно разбирали в статье про [сайт для салона красоты](/ru/blog/sayt-dlya-salona-krasoty): запись в бьюти и фитнесе работает по одним правилам — меньше кликов, мгновенное подтверждение, автоматическое напоминание."),
  h3("Пробная тренировка как воронка продаж"),
  p("Отдельный сценарий — **бесплатная или скидочная пробная тренировка**. Выносите её в заметную кнопку на первом экране: для новичка это самый простой способ решиться, а для клуба — главный источник новых абонементов. Форма записи на пробную должна быть самой короткой на сайте: имя, телефон, удобное время. Дальше подключается администратор, а конверсия из пробных в купленные абонементы становится главной метрикой эффективности сайта."),

  h2("Абонементы и онлайн-оплата: как сайт удерживает клиентов"),
  p("Второй блок, напрямую влияющий на выручку, — **продажа и продление абонементов онлайн**. Классическая проблема клуба: абонемент закончился, клиент «собирается зайти оплатить» — и пропадает на месяц. Кнопка «Продлить» в телефоне закрывает вопрос за 30 секунд."),
  li("Витрина абонементов: разовая тренировка, месяц, 3/6/12 месяцев, персональные блоки занятий"),
  li("Онлайн-оплата картой, Apple Pay и Google Pay — без похода на рецепцию"),
  li("Автоматическое напоминание об окончании абонемента с кнопкой продления в один клик"),
  li("Личный кабинет: сколько тренировок осталось, история платежей, заморозка"),
  p("Платёжная интеграция укладывается в типовой диапазон **$200–500**; связка с CRM клуба или учётной системой — сложнее, **$1 000–3 000**. Такой функционал реализуется в рамках [корпоративного сайта](/ru/corporate-site) с кастомной логикой, а не шаблонной визитки."),
  p("Совет из практики: не прячьте цены абонементов. Страница с честной сеткой тарифов работает как фильтр — до администратора доходят люди, которые уже готовы покупать, а не «просто спросить». А для клуба это ещё и меньше рутины на рецепции."),

  h2("Сколько стоит создание сайта фитнес-центра в 2026 году"),
  p("Цена зависит от формата. Мы выделяем три типовых сценария:"),
  table(
    ["Формат", "Кому подходит", "Что входит", "Цена от"],
    [
      ["Лендинг тренера", "Персональный тренер, небольшая студия", "Одна страница: метод, цены, отзывы, форма записи", "**$800**"],
      ["Сайт клуба", "Зал или студия с групповыми занятиями", "Расписание, тренеры, абонементы, онлайн-оплата, блог", "**$3 500**"],
      ["Платформа сети", "Сеть залов в нескольких городах или районах", "Страницы локаций, единый кабинет, CRM-интеграции", "**$6 000**"],
    ],
  ),
  p("Дополнительные расходы: поддержка — **$200/мес** или $40/час, SEO-продвижение — от **$300/мес**. Подробный разбор, из чего вообще складывается цена сайта, — в статье про [стоимость разработки сайта в 2026](/ru/blog/skolko-stoit-sayt-2026)."),
  cta(
    "Посчитайте цену сайта для вашего зала",
    "Ответьте на несколько вопросов — калькулятор покажет вилку цены и срок разработки для вашего формата.",
    "Открыть калькулятор",
    "/ru/calculator",
  ),

  h2("Страницы тренеров и личный бренд"),
  p("Люди ходят не «в зал», а к тренеру. Страница каждого тренера с живым фото, специализацией, сертификатами и ссылкой на его занятия в расписании — это одновременно доверие и SEO: такие страницы собирают запросы вида «тренер по йоге + город»."),
  h3("Сайт персонального тренера"),
  p("Если вы тренер и работаете на себя, сайт клуба вам не нужен — достаточно [лендинга](/ru/landing) от **$800**: ваша история, метод, результаты клиентов «до/после», пакеты тренировок и форма записи. Это тот же принцип личного бренда специалиста, который мы разбирали в гайде про [сайт для психолога](/ru/blog/sayt-dlya-psihologa): человек покупает доверие к конкретному специалисту, а не абстрактную услугу."),
  p("Бонус для тренеров, работающих онлайн: на лендинг легко добавить продажу программ тренировок и видеокурсов — и он превращается в источник пассивного дохода."),

  h2("Локальное SEO: «фитнес-клуб + район»"),
  p("Никто не ездит в спортзал через весь город. Поэтому поиск в фитнесе почти всегда локальный: «спортзал Оболонь», «фитнес-клуб Львов центр», «тренажёрный зал возле метро». Именно эти запросы приводят людей, которые реально дойдут до вас на тренировку."),
  li("Страница контактов с картой, адресом и маршрутом от ближайшего метро или остановки"),
  li("Google Business Profile с реальными фото зала, актуальным графиком и отзывами"),
  li("Разметка LocalBusiness по schema.org, чтобы Google уверенно показывал клуб в картах"),
  li("Название района и города в заголовках и текстах — естественно, без спама ключами"),
  p("Если у клуба несколько филиалов, каждая локация должна получить отдельную страницу со своим адресом, расписанием и командой тренеров — именно так карты и поиск понимают, что вы физически присутствуете в конкретном районе, а не «где-то в городе»."),
  p("Как вывести бизнес в топ-3 карт, мы пошагово описали в статье про [локальное SEO и Google Maps](/ru/blog/lokalnoe-seo-top-3-google-maps). Комплексное [SEO-продвижение](/ru/seo) для клуба в нашей студии стоит от **$300/мес**."),

  h2("Приложение или сайт: что нужно клубу сначала"),
  p("Мобильное приложение выглядит статусно, но для большинства залов это преждевременная трата: разработка дороже сайта, а скачивают его только уже лояльные клиенты."),
  li("Сайт работает на **новых** клиентов: его находят в Google, на него ведут реклама и карты"),
  li("Приложение работает на **постоянных**: расписание в кармане, push-напоминания о тренировках"),
  li("Адаптивный сайт с личным кабинетом закрывает 90% сценариев приложения без затрат на две платформы"),
  p("Разумная последовательность: сначала сайт с записью и оплатой, затем — PWA или нативное приложение, когда база перерастёт несколько сотен активных абонементов."),

  h2("Обязательные блоки сайта фитнес-зала"),
  p("Сведём в одну таблицу блоки, без которых создание сайта фитнес-зала теряет смысл:"),
  table(
    ["Блок", "Что он даёт"],
    [
      ["Расписание с фильтрами", "Клиент находит «своё» занятие за 10 секунд; меньше звонков администратору"],
      ["Онлайн-запись", "Запись 24/7 — в том числе вечером, когда человек и решает «начать с понедельника»"],
      ["Абонементы с оплатой", "Продажа и продление без кассы; меньше «завтра зайду оплачу»"],
      ["Страницы тренеров", "Доверие плюс трафик по запросам «тренер + направление + город»"],
      ["Фото зала и виртуальный тур", "Снимает страх «а что там внутри» — главное возражение новичков"],
      ["Отзывы и результаты", "Социальное доказательство: истории «до/после» продают лучше скидок"],
      ["Цены без «позвоните нам»", "Прозрачность отсеивает нецелевые звонки и повышает конверсию записи"],
    ],
  ),
  h3("Фото зала и виртуальный тур"),
  p("Отдельно про фото: стоковые картинки с улыбающимися моделями мгновенно убивают доверие. Нужна реальная фотосессия зала, раздевалок и душевых — именно это ищут новички перед первым визитом. Виртуальный 3D-тур — хороший плюс, но вторая очередь: сначала качественные живые фото."),

  h2("Наш опыт: запись, оплата и личные бренды"),
  p("Прямых фитнес-кейсов в портфолио студии пока нет, и выдумывать несуществующие мы не будем. Но каждую механику, из которой собирается сайт клуба, мы уже строили в соседних нишах:"),
  li("[Boulevard Salon](/ru/portfolio/boulevard-salon) и [E-Fedra Beauty](/ru/portfolio/e-fedra-beauty) — онлайн-запись и витрина услуг для бьюти-бизнеса: та же логика, что и запись на тренировку"),
  li("[Oleksandr Sitnikov](/ru/portfolio/oleksandr-sitnikov) и [Glenn Garbo](/ru/portfolio/glenn-garbo) — сайты личного бренда: подход, который один в один работает для персонального тренера"),
  p("Так что когда мы говорим про запись, оплату и страницы специалистов — это решения, проверенные на живых проектах, а не теория из чужих статей."),
  cta(
    "Нужен сайт для клуба или лендинг тренера?",
    "Расскажите о вашем зале — покажем примеры механик записи, подскажем формат и назовём точную цену.",
    "Рассчитать стоимость",
    "/ru/calculator",
  ),
];

const bodyEn = [
  tldr("TL;DR: fitness club website", [
    "Three core jobs: an up-to-date class schedule, online booking, and membership payments",
    "A personal trainer landing page starts at $800, a full club website at $3,500, a multi-location platform at $6,000",
    "Online membership renewal removes the front-desk bottleneck: clients pay in 30 seconds from their phone",
    "Searches like “gym near me” and “fitness club + area” are won with local SEO, not ads alone",
    "A mobile app is step two. A website comes first: it works for new clients and for search",
  ]),
  p("A fitness club website has three jobs: show an **up-to-date class schedule**, sell and renew **memberships online**, and let a visitor book their first session without calling the front desk. At Code-Site.Art, a personal trainer landing page starts at **$800**, a full gym website at **$3,500**, and a multi-location club platform at **$6,000**."),
  p("In this guide we break down what good gym website design actually includes, what each format costs, how a trainer's site differs from a club's site, and when a mobile app genuinely makes sense. Every figure is a real studio package — we are a Ukrainian team working with European clients, so you get European-grade engineering at sensible rates."),
  p("It will be useful for gym owners, yoga and pilates studios, CrossFit boxes, and personal trainers building their own brand."),

  h2("Class schedule and online booking: the heart of the site"),
  p("The first thing a visitor looks for on a gym website is the **schedule**. If it is buried in a PDF, an Instagram screenshot, or hidden behind “call us for details”, a share of potential clients simply closes the tab. A working schedule is a grid with filters by class type, trainer, and day of the week — one the manager can update in the admin panel in two minutes."),
  h3("How booking should work"),
  num("The client sees a class in the schedule and taps “Book” — no half-page registration form."),
  num("The form asks only for a name and phone number; the system shows how many spots are left in the group."),
  num("Confirmation arrives by SMS or messenger, with a reminder a few hours before the session."),
  p("Technically this is either an off-the-shelf booking service embedded in the site (a typical integration runs **$200–500**) or a custom module built around your club's logic. We covered the same mechanics in our guide to a [beauty salon website](/en/blog/beauty-salon-website): booking in beauty and fitness follows identical rules — fewer clicks, instant confirmation, automatic reminders."),
  h3("The trial session as a sales funnel"),
  p("A special case is the **free or discounted trial session**. Put it in a prominent button on the first screen: for a beginner it is the easiest way to commit, and for the club it is the main source of new memberships. The trial booking form should be the shortest one on the site — name, phone, preferred time. From there the front desk takes over, and trial-to-membership conversion becomes the site's key performance metric."),

  h2("Memberships and online payments: how the site retains clients"),
  p("The second block with a direct revenue impact is **selling and renewing memberships online**. The classic club problem: a membership expires, the client “means to drop by and pay” — and disappears for a month. A Renew button on their phone closes the loop in 30 seconds."),
  li("A membership storefront: single session, monthly, 3/6/12 months, personal training packs"),
  li("Card payments with Apple Pay and Google Pay — no trip to the reception desk"),
  li("Automatic expiry reminders with a one-click renewal button"),
  li("A member area: sessions remaining, payment history, membership freeze"),
  p("A payment integration fits the typical **$200–500** range; connecting the site to your club CRM or accounting system is more involved, at **$1,000–3,000**. This is the territory of a [corporate website](/en/corporate-site) with custom logic, not a template brochure page."),

  h2("What a fitness club website costs in 2026"),
  p("The price depends on the format. We see three typical scenarios:"),
  table(
    ["Format", "Best for", "What is included", "Price from"],
    [
      ["Trainer landing page", "Personal trainer, small studio", "One page: method, pricing, reviews, booking form", "**$800**"],
      ["Club website", "A gym or studio with group classes", "Schedule, trainers, memberships, online payments, blog", "**$3,500**"],
      ["Multi-location platform", "A chain of gyms across cities or districts", "Location pages, one member area, CRM integrations", "**$6,000**"],
    ],
  ),
  p("Ongoing costs: support at **$200/month** or $40/hour, SEO from **$300/month**. For a full breakdown of what drives website pricing, see our guide to [custom website costs in 2026](/en/blog/custom-website-cost-uk-2026)."),
  cta(
    "Price up a website for your gym",
    "Answer a few questions — the calculator shows a price range and timeline for your format.",
    "Open the calculator",
    "/en/calculator",
  ),

  h2("Trainer profiles and personal branding"),
  p("People do not join a gym — they join a trainer. A page for every coach with a real photo, specialisation, certifications, and a link to their classes in the schedule builds trust and earns search traffic for queries like “yoga instructor + city”."),
  h3("A website for a personal trainer"),
  p("If you train clients independently, you do not need a club website — a [landing page](/en/landing) from **$800** is enough: your story, your method, client before-and-after results, training packages, and a booking form. It is the same personal-brand playbook we described in our [therapist website guide](/en/blog/therapist-website-guide): people buy trust in a specific specialist, not an abstract service."),
  p("A bonus for online coaches: adding training programmes and video courses to the landing page turns it into a source of recurring income."),

  h2("Local SEO: “gym + neighbourhood”"),
  p("Nobody commutes across the city to work out. Fitness search is almost always local: “gym near me”, “fitness club + district”, “weights gym near the station”. These are the queries that bring people who will actually show up for a session."),
  li("A contact page with a map, address, and directions from the nearest station or stop"),
  li("A Google Business Profile with real gym photos, current opening hours, and reviews"),
  li("LocalBusiness structured data (schema.org) so Google confidently shows the club on Maps"),
  li("Neighbourhood and city names in headings and copy — naturally, without keyword stuffing"),
  p("We laid out a step-by-step route into the Maps top 3 in our article on [local SEO and Google Maps](/en/blog/local-seo-google-maps-top-3). Full [SEO service](/en/seo) for a club starts at **$300/month**."),

  h2("App or website: what a club needs first"),
  p("A mobile app looks impressive, but for most gyms it is a premature expense: it costs more than a website to build, and only already-loyal members download it."),
  li("A website works for **new** clients: Google finds it, ads and Maps point to it"),
  li("An app works for **regulars**: the schedule in their pocket, push reminders before class"),
  li("A responsive site with a member area covers 90% of app scenarios without paying for two platforms"),
  p("The sensible sequence: first a website with booking and payments, then a PWA or native app once your base grows past a few hundred active memberships."),

  h2("Must-have blocks of a gym website"),
  p("Here is every block a fitness club website needs, and what each one earns you:"),
  table(
    ["Block", "What it delivers"],
    [
      ["Schedule with filters", "Clients find “their” class in 10 seconds; fewer calls to the front desk"],
      ["Online booking", "Bookings 24/7 — including at night, when people decide to “start on Monday”"],
      ["Memberships with payments", "Sales and renewals without the till; fewer “I'll pay tomorrow” cases"],
      ["Trainer pages", "Trust plus traffic for “trainer + discipline + city” searches"],
      ["Gym photos and a virtual tour", "Removes the “what is it like inside” fear — the top beginner objection"],
      ["Reviews and results", "Social proof: before-and-after stories sell better than discounts"],
      ["Prices without “call us”", "Transparency filters out non-buyers and lifts booking conversion"],
    ],
  ),
  h3("Photos and the virtual tour"),
  p("A note on photography: stock images of smiling models kill trust instantly. You need a real photo shoot of the gym floor, changing rooms, and showers — exactly what first-timers look for before visiting. A 3D virtual tour is a nice extra, but it comes second: quality real photos come first."),

  h2("Our experience: booking, payments, personal brands"),
  p("We have no fitness projects in the portfolio yet, and we will not invent any. But we have built every mechanic a club website is made of, in neighbouring niches:"),
  li("[Boulevard Salon](/en/portfolio/boulevard-salon) and [E-Fedra Beauty](/en/portfolio/e-fedra-beauty) — online booking and a service storefront for beauty businesses: the same logic as class booking"),
  li("[Oleksandr Sitnikov](/en/portfolio/oleksandr-sitnikov) and [Glenn Garbo](/en/portfolio/glenn-garbo) — personal-brand websites: the exact approach a personal trainer needs"),
  p("So when we talk about booking, payments, and specialist pages, it is production-tested work — not theory borrowed from other people's articles."),
  cta(
    "Need a club website or a trainer landing page?",
    "Tell us about your gym — we will show booking mechanics from real projects, suggest a format, and quote a firm price.",
    "Get a quote",
    "/en/calculator",
  ),
];

const doc = {
  _id: "ltAug2026-sait-fitnes-klubu",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-fitnes-klubu" },
    ru: { _type: "slug", current: "sayt-fitnes-kluba" },
    en: { _type: "slug", current: "fitness-club-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для фітнес-клубу і спортзалу: розклад, абонементи, запис",
    ru: "Создание сайта фитнес-клуба: расписание, абонементы, онлайн-запись",
    en: "Gym and Fitness Club Website: Schedule, Memberships, Booking",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для фітнес-клубу і спортзалу: ціни 2026",
    ru: "Создание сайта фитнес-клуба и фитнес-центра: цены 2026",
    en: "Gym Website Design: Costs, Booking, Memberships 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для фітнес-клубу: розклад, онлайн-запис, оплата абонементів ✔️ Лендінг тренера від $800 ✔️ Сайт клубу від $3 500 ➡ Розрахуйте ціну за 2 хвилини",
    ru: "➤ Создание сайта фитнес-клуба: расписание, онлайн-запись, оплата абонементов ✔️ Лендинг тренера от $800 ✔️ Сайт клуба от $3 500 ➡ Рассчитайте цену онлайн",
    en: "➤ Gym website design: class schedule, online booking, membership payments ✔️ Trainer landing from $800 ✔️ Club website from $3,500 ➡ Get a quote in 2 minutes",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Сайти для ніш",
    ru: "Сайты для ниш",
    en: "Industry guides",
  },
  lede: {
    _type: "localizedString",
    uk: "Розбираємо, з чого складається сайт спортзалу: розклад із записом, абонементи з онлайн-оплатою, сторінки тренерів і локальне SEO — з реальними цінами студії.",
    ru: "Разбираем, из чего состоит сайт спортзала: расписание с записью, абонементы с онлайн-оплатой, страницы тренеров и локальное SEO — с реальными ценами студии.",
    en: "What a gym website is made of: a schedule with booking, memberships with online payments, trainer pages, and local SEO — with real studio pricing.",
  },
  tags: ["fitness", "online-booking"],
  relatedPostSlugs: ["sait-dlia-salonu-krasy", "sait-dlia-psykholoha", "vartist-rozrobky-saytu-2026"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для фітнес-клубу?",
        ru: "Сколько стоит создание сайта фитнес-клуба?",
        en: "How much does a fitness club website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг персонального тренера — від $800, повноцінний сайт клубу з розкладом, абонементами та онлайн-оплатою — від $3 500, платформа для мережі залів — від $6 000. Типова інтеграція запису чи оплати додає $200–500, складна зв'язка з CRM — $1 000–3 000.",
        ru: "Лендинг персонального тренера — от $800, полноценный сайт клуба с расписанием, абонементами и онлайн-оплатой — от $3 500, платформа для сети залов — от $6 000. Типовая интеграция записи или оплаты добавляет $200–500, сложная связка с CRM — $1 000–3 000.",
        en: "A personal trainer landing page starts at $800, a full club website with a schedule, memberships, and online payments at $3,500, and a multi-location platform at $6,000. A typical booking or payment integration adds $200–500; a complex CRM link runs $1,000–3,000.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна приймати оплату абонементів через сайт?",
        ru: "Можно ли принимать оплату абонементов через сайт?",
        en: "Can members pay for their memberships through the website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так. Підключаємо оплату карткою, Apple Pay і Google Pay, а в особистому кабінеті клієнт бачить залишок тренувань і продовжує абонемент в один клік. Платіжна інтеграція зазвичай коштує $200–500.",
        ru: "Да. Подключаем оплату картой, Apple Pay и Google Pay, а в личном кабинете клиент видит остаток тренировок и продлевает абонемент в один клик. Платёжная интеграция обычно стоит $200–500.",
        en: "Yes. We connect card payments with Apple Pay and Google Pay, and the member area shows remaining sessions with one-click renewal. A payment integration typically costs $200–500.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що краще для клубу — мобільний застосунок чи сайт?",
        ru: "Что лучше для клуба — мобильное приложение или сайт?",
        en: "What does a gym need first — a mobile app or a website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Спершу сайт: його знаходять у Google нові клієнти, на нього ведуть реклама і карти. Застосунок завантажують лише постійні відвідувачі, а адаптивний сайт з особистим кабінетом закриває 90% його сценаріїв. Застосунок або PWA має сенс, коли активних абонементів уже кілька сотень.",
        ru: "Сначала сайт: его находят в Google новые клиенты, на него ведут реклама и карты. Приложение скачивают только постоянные посетители, а адаптивный сайт с личным кабинетом закрывает 90% его сценариев. Приложение или PWA имеет смысл, когда активных абонементов уже несколько сотен.",
        en: "The website comes first: new clients find it on Google, and ads and Maps point to it. Only loyal members download an app, while a responsive site with a member area covers 90% of app scenarios. An app or PWA makes sense once you have a few hundred active memberships.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що потрібно персональному тренеру — лендінг чи повний сайт?",
        ru: "Что нужно персональному тренеру — лендинг или полный сайт?",
        en: "Does a personal trainer need a landing page or a full website?",
      },
      answer: {
        _type: "localizedText",
        uk: "У більшості випадків достатньо лендінгу від $800: історія, метод, результати клієнтів, пакети тренувань і форма запису. Повний сайт потрібен, коли з'являється команда, групові заняття і власний розклад — тобто коли тренер фактично стає студією.",
        ru: "В большинстве случаев достаточно лендинга от $800: история, метод, результаты клиентов, пакеты тренировок и форма записи. Полный сайт нужен, когда появляется команда, групповые занятия и собственное расписание — то есть когда тренер фактически становится студией.",
        en: "In most cases a landing page from $800 is enough: your story, method, client results, training packages, and a booking form. A full website makes sense once you have a team, group classes, and your own schedule — when the trainer effectively becomes a studio.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як сайту потрапити в топ за запитом «фітнес-клуб + район»?",
        ru: "Как сайту попасть в топ по запросу «фитнес-клуб + район»?",
        en: "How does a gym rank for “fitness club + neighbourhood” searches?",
      },
      answer: {
        _type: "localizedText",
        uk: "Потрібна зв'язка: заповнений Google Business Profile з фото й відгуками, розмітка LocalBusiness на сайті, сторінка контактів із картою та маршрутом і природне вживання назви району в текстах. Комплексне SEO для клубу коштує від $300/міс і зазвичай дає перші результати за 2–4 місяці.",
        ru: "Нужна связка: заполненный Google Business Profile с фото и отзывами, разметка LocalBusiness на сайте, страница контактов с картой и маршрутом и естественное употребление названия района в текстах. Комплексное SEO для клуба стоит от $300/мес и обычно даёт первые результаты за 2–4 месяца.",
        en: "It takes a combination: a complete Google Business Profile with photos and reviews, LocalBusiness structured data on the site, a contact page with a map and directions, and natural use of the neighbourhood name in your copy. Full SEO for a club starts at $300/month and usually shows first results in 2–4 months.",
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
