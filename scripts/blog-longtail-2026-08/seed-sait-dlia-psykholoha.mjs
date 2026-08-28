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
  tldr("Коротко: що має бути на сайті психолога", [
    "Перший екран за 10 секунд відповідає: з чим працюєте, у якому форматі й де кнопка запису",
    "Блоки довіри: підхід і методи, освіта та сертифікати, супервізія, формати і ціни сесій",
    "Етика: конфіденційність форми запису, жодних обіцянок результату та «зцілення за 5 сесій»",
    "Онлайн-запис у вільні слоти замінює листування і знімає бар'єр «незручно писати першим»",
    "Ціни 2026: лендінг приватної практики — від $800, сайт центру психотерапії — від $3 500",
    "Блог про тривожність і вигорання приводить клієнтів з Google без бюджету на рекламу",
  ]),
  p("Сайт для психолога — це сторінка, яка знімає головний страх клієнта: помилитися з фахівцем. Людина, що шукає психолога, відкриває 3–5 профілів і обирає того, чий підхід, освіта і ціна сесії зрозумілі з першого екрана. Сайт відповідає на ці питання за пів хвилини — і одразу дає записатися на зустріч без листування в месенджерах."),
  p("Instagram цього не робить: у стрічці немає структури, в пошуку Google акаунт не ранжується за запитом «психолог онлайн», а писати в дірект із особистого профілю багатьом клієнтам психологічно важко. Саме тому навіть спеціалісти з розкрученими соцмережами зрештою роблять окремий сайт."),
  p("У цьому гайді розберемо, чому соцмереж недостатньо, з яких блоків складається сайт, що дозволяє і що забороняє професійна етика, як налаштувати онлайн-запис і скільки все це коштує у 2026 році. Вилки цін — реальні, з прайсу нашої студії."),

  h2("Чому психологу недостатньо Instagram"),
  p("Соцмережі добре гріють аудиторію, але погано конвертують «холодну» людину, яка вперше наважилася звернутися по допомогу. Причини конкретні:"),
  li("**Довіра.** У стрічці неможливо швидко перевірити освіту, методи і досвід. На сайті дипломи, сертифікати й опис підходу зібрані в одному місці — клієнт бачить, що перед ним фахівець, а не «коуч з марафонів»."),
  li("**Пошук.** Запити «психолог Київ», «психолог онлайн», «сімейний психолог» люди вводять у Google. Instagram-профіль за ними не ранжується — трафік із пошуку отримує лише сайт."),
  li("**Приватність звернення.** Написати в дірект зі свого акаунта — значить розкрити особистість ще до першої розмови. Форма запису на сайті сприймається як анонімніша і безпечніша, тому конверсія в заявку вища."),
  li("**Алгоритми.** Охоплення в соцмережах падають без постійного контенту. Сайт — актив, який працює роками: сторінка, що вийшла в топ Google, приводить клієнтів щомісяця без вашої участі."),
  p("Висновок простий: Instagram лишається каналом прогріву, а сайт стає точкою, куди ведуть усі дороги — з пошуку, з таргету, з візитівки і з рекомендацій."),

  h2("Структура сайту психолога: блоки, які будують довіру"),
  p("Сайт приватної практики — це зазвичай один змістовний лендінг. Але порядок і наповнення блоків тут важливіші, ніж будь-де: клієнт у вразливому стані, і кожен незрозумілий елемент — привід закрити вкладку."),
  h3("Перший екран"),
  p("Фото, ім'я, одна фраза про те, з чим ви працюєте («Допомагаю впоратися з тривожністю та вигоранням»), формат — онлайн чи офлайн і місто — та кнопка запису. Без абстракцій на кшталт «гармонія з собою»: конкретика знижує тривогу краще за метафори."),
  h3("Підхід і методи"),
  p("КПТ, гештальт, психоаналіз, EMDR — назвіть метод і поясніть людською мовою, як проходить сесія і скільки їх зазвичай потрібно. Клієнт не зобов'язаний знати термінологію; те, що ви пояснюєте просто, — вже сигнал професіоналізму."),
  h3("Освіта, сертифікати, супервізія"),
  p("Диплом, курси підвищення кваліфікації, членство в професійних асоціаціях, регулярна супервізія. Скани чи фото сертифікатів працюють краще за перелік текстом: їх можна роздивитися. Для психолога це аналог ліцензії клініки — головний фільтр від шарлатанів."),
  h3("Формати і ціни сесій"),
  p("Індивідуальна, парна, сімейна терапія; тривалість; ціна за сесію. Відкрита ціна відсіює нецільові звернення і економить години листування. Якщо є пакети чи знижка для студентів — так і напишіть."),
  table(
    ["Блок довіри", "Що бачить клієнт", "Що це дає"],
    [
      ["Підхід і методи", "Зрозуміле пояснення, як проходить робота", "Знімає страх невідомості перед першою сесією"],
      ["Дипломи і сертифікати", "Підтвердження кваліфікації, яку можна перевірити", "Відсікає сумніви «а чи справжній це психолог»"],
      ["Ціни сесій", "Чесна вартість без «ціна за запитом»", "Фільтрує нецільові заявки, прибирає листування"],
      ["Фото і відео-знайомство", "Живу людину, її манеру говорити", "Дає відчути контакт ще до запису"],
      ["Політика конфіденційності", "Що дані та факт звернення захищені", "Прибирає головний бар'єр — страх розголосу"],
    ],
  ),
  cta(
    "Потрібен сайт, якому довіряють з першого екрана?",
    "Порахуйте вартість лендінга для приватної практики за 2 хвилини — без дзвінків і листування.",
    "Розрахувати вартість",
    "/calculator",
  ),

  h2("Етика: що не можна писати на сайті психолога"),
  p("Сайт психолога регулюється не лише здоровим глуздом, а й етичними кодексами професійних асоціацій. Порушення б'ють і по репутації, і по довірі:"),
  li("**Жодних обіцянок результату.** «Позбавлю панічних атак за 5 сесій» — це порушення етики і обман: результат терапії залежить від обох сторін. Пишіть про процес і методи, а не про гарантії."),
  li("**Відгуки — обережно.** Публікувати історії клієнтів із деталями не можна навіть зі згоди. Безпечний варіант — знеособлені відгуки без клінічних подробиць або професійні рекомендації колег."),
  li("**Конфіденційність за замовчуванням.** Форма запису — мінімум полів: ім'я (можна псевдонім), контакт, зручний час. Політика конфіденційності — окремою сторінкою, а не формальною відпискою."),
  li("**Межі допомоги.** Чесно вкажіть, з чим ви не працюєте, і додайте контакти екстрених служб та гарячих ліній для людей у гострій кризі. Це не «злив клієнтів», а ознака зрілої практики."),
  p("Парадокс у тому, що чесні обмеження продають краще за гучні обіцянки: клієнт відчуває, що з ним говорять як з дорослим."),

  h2("Онлайн-запис: як прибрати листування повністю"),
  p("Найбільший «злодій часу» приватної практики — узгодження слотів у месенджерах. Онлайн-запис вирішує це раз і назавжди:"),
  num("Клієнт обирає формат — індивідуальна чи парна сесія, онлайн чи кабінет."),
  num("Бачить календар із вільними слотами, синхронізований із вашим графіком."),
  num("Оплачує сесію або передоплату карткою — неявки падають у рази."),
  num("Отримує автоматичне нагадування за добу і за годину до зустрічі."),
  p("Технічно це інтеграція календаря (Google Calendar, Calendly-подібні рішення) та платіжної системи. Типова інтеграція коштує **$200–500**; складніші сценарії — кабінет клієнта, відеозв'язок, CRM для центру — від **$1 000 до $3 000**. Для психолога, який веде 20+ сесій на тиждень, це окупається за перший місяць звільненого часу."),

  h2("Блог: як тексти про тривожність приводять клієнтів"),
  p("Люди рідко гуглять «записатися до психолога» одразу. Спочатку вони шукають «як впоратися з тривожністю», «симптоми вигорання», «панічна атака що робити». Це тисячі запитів щомісяця — і саме тут блог психолога перетворюється на канал залучення."),
  li("Стаття відповідає на запит → людина читає і бачить, що автор розуміє її стан."),
  li("Наприкінці — м'який місток: «якщо самодопомога не працює, ось як проходить перша сесія»."),
  li("Одна вдала стаття в топі Google приводить звернення роками — без бюджету на рекламу."),
  p("Щоб блог працював, потрібна семантика, структура під пошукові запити й технічно здоровий сайт. Це окрема послуга — [SEO-просування](/seo) від **$300/міс**; про конверсійний бік текстів ми писали в статті про [9 дизайн-прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),

  h2("Особистий бренд: приклади з нашого портфоліо"),
  p("Сайт психолога — це сайт особистого бренду: продає не логотип, а людина. Тон текстів, фото, кольори і навіть [темна чи світла тема](/blog/temna-chy-svitla-tema-saitu) мають працювати на одне відчуття — «мені тут спокійно і безпечно»."),
  p("Ми робили сайти особистих брендів, де це відчуття — головний продукт. [Сайт Олександра Сітнікова](/portfolio/oleksandr-sitnikov) побудований навколо експертності однієї людини: структура веде від знайомства до заявки без жодного зайвого кроку. [Сайт Glenn Garbo](/portfolio/glenn-garbo) — приклад того, як персональна айдентика і стримана типографіка створюють преміальне враження без «кричущого» дизайну. Обидва підходи один в один переносяться на приватну психологічну практику."),

  h2("Скільки коштує сайт для психолога у 2026 році"),
  p("Для приватної практики майже завжди достатньо лендінга — головний продукт у цій ніші. Сайт потрібен більший, лише якщо ви відкриваєте центр із командою фахівців:"),
  table(
    ["Критерій", "Лендінг приватної практики", "Сайт психологічного центру"],
    [
      ["Ціна", "**від $800**", "**від $3 500**"],
      ["Строки", "7–14 днів", "3–6 тижнів"],
      ["Обсяг", "1 сторінка: підхід, освіта, ціни, запис", "10+ сторінок: команда, напрями, блог, кабінети"],
      ["Онлайн-запис", "Календар слотів + оплата", "Запис до конкретного фахівця, розклад команди"],
      ["Кому підходить", "Психолог із приватною практикою", "Центр психотерапії з 3+ спеціалістами"],
    ],
  ),
  p("Підтримка після запуску — **$200/міс** або **$40/год** разово: оновлення цін, нові статті в блог, технічний догляд. Повний розбір, із чого складається ціна, — у статті про [вартість розробки сайту у 2026](/blog/vartist-rozrobky-saytu-2026), а всі пакети — на сторінці [цін](/pricing). Швидше за все порахувати свій варіант — через [калькулятор](/calculator): обираєте блоки, бачите суму одразу."),
  cta(
    "Готові до сайту, який записує клієнтів сам?",
    "Лендінг для приватної практики від $800: структура під довіру, онлайн-запис, етично чисті тексти.",
    "Обговорити проєкт",
    "/calculator",
  ),
];

const bodyRu = [
  tldr("Коротко: каким должен быть сайт психолога", [
    "Первый экран за 10 секунд отвечает: с чем работаете, в каком формате и где кнопка записи",
    "Блоки доверия: подход и методы, образование и сертификаты, супервизия, форматы и цены сессий",
    "Этика: конфиденциальность формы записи, никаких обещаний результата и «исцеления за 5 сессий»",
    "Онлайн-запись в свободные слоты заменяет переписку и снимает барьер «неудобно писать первым»",
    "Цены 2026: лендинг частной практики — от $800, сайт центра психотерапии — от $3 500",
    "Блог о тревожности и выгорании приводит клиентов из Google без бюджета на рекламу",
  ]),
  p("Сайт для психолога — это страница, которая снимает главный страх клиента: ошибиться со специалистом. Человек, который ищет психолога, открывает 3–5 профилей и выбирает того, чьи подход, образование и цена сессии понятны с первого экрана. Сайт отвечает на эти вопросы за полминуты — и сразу даёт записаться на встречу без переписки в мессенджерах."),
  p("Instagram так не умеет: в ленте нет структуры, в поиске Google аккаунт не ранжируется по запросу «психолог онлайн», а писать в директ с личного профиля многим клиентам психологически тяжело. Поэтому даже специалисты с раскрученными соцсетями рано или поздно делают отдельный сайт."),
  p("В этом гайде разберём, почему соцсетей недостаточно, из каких блоков состоит сайт, что разрешает и что запрещает профессиональная этика, как настроить онлайн-запись и сколько всё это стоит в 2026 году. Вилки цен — реальные, из прайса нашей студии."),

  h2("Почему психологу мало Instagram"),
  p("Соцсети хорошо греют аудиторию, но плохо конвертируют «холодного» человека, который впервые решился обратиться за помощью. Причины конкретные:"),
  li("**Доверие.** В ленте невозможно быстро проверить образование, методы и опыт. На сайте дипломы, сертификаты и описание подхода собраны в одном месте — клиент видит, что перед ним специалист, а не «коуч с марафонов»."),
  li("**Поиск.** Запросы «психолог онлайн», «семейный психолог», «психолог + город» люди вводят в Google. Instagram-профиль по ним не ранжируется — трафик из поиска получает только сайт."),
  li("**Приватность обращения.** Написать в директ со своего аккаунта — значит раскрыть личность ещё до первого разговора. Форма записи на сайте воспринимается как более анонимная и безопасная, поэтому конверсия в заявку выше."),
  li("**Алгоритмы.** Охваты в соцсетях падают без постоянного контента. Сайт — актив, который работает годами: страница, вышедшая в топ Google, приводит клиентов каждый месяц без вашего участия."),
  p("Вывод простой: Instagram остаётся каналом прогрева, а сайт становится точкой, куда ведут все дороги — из поиска, из таргета, с визитки и по рекомендации."),

  h2("Структура сайта психолога: блоки, которые строят доверие"),
  p("Сайт частной практики — это, как правило, один содержательный лендинг. Но порядок и наполнение блоков здесь важнее, чем где-либо: клиент находится в уязвимом состоянии, и каждый непонятный элемент — повод закрыть вкладку."),
  h3("Первый экран"),
  p("Фото, имя, одна фраза о том, с чем вы работаете («Помогаю справиться с тревожностью и выгоранием»), формат — онлайн или офлайн и город — и кнопка записи. Без абстракций вроде «гармония с собой»: конкретика снижает тревогу лучше метафор."),
  h3("Подход и методы"),
  p("КПТ, гештальт, психоанализ, EMDR — назовите метод и объясните по-человечески, как проходит сессия и сколько их обычно нужно. Клиент не обязан знать терминологию; то, что вы объясняете просто, — уже сигнал профессионализма."),
  h3("Образование, сертификаты, супервизия"),
  p("Диплом, курсы повышения квалификации, членство в профессиональных ассоциациях, регулярная супервизия. Сканы или фото сертификатов работают лучше списка текстом: их можно рассмотреть. Для психолога это аналог лицензии клиники — главный фильтр от шарлатанов."),
  h3("Форматы и цены сессий"),
  p("Индивидуальная, парная, семейная терапия; длительность; цена за сессию. Открытая цена отсеивает нецелевые обращения и экономит часы переписки. Есть пакеты или скидка для студентов — так и напишите."),
  table(
    ["Блок доверия", "Что видит клиент", "Что это даёт"],
    [
      ["Подход и методы", "Понятное объяснение, как устроена работа", "Снимает страх неизвестности перед первой сессией"],
      ["Дипломы и сертификаты", "Подтверждение квалификации, которое можно проверить", "Отсекает сомнения «а настоящий ли это психолог»"],
      ["Цены сессий", "Честную стоимость без «цена по запросу»", "Фильтрует нецелевые заявки, убирает переписку"],
      ["Фото и видео-знакомство", "Живого человека, его манеру говорить", "Даёт почувствовать контакт ещё до записи"],
      ["Политика конфиденциальности", "Что данные и сам факт обращения защищены", "Убирает главный барьер — страх огласки"],
    ],
  ),
  cta(
    "Нужен сайт, которому доверяют с первого экрана?",
    "Посчитайте стоимость лендинга для частной практики за 2 минуты — без звонков и переписки.",
    "Рассчитать стоимость",
    "/ru/calculator",
  ),

  h2("Этика: чего нельзя писать на сайте психолога"),
  p("Сайт психолога регулируется не только здравым смыслом, но и этическими кодексами профессиональных ассоциаций. Нарушения бьют и по репутации, и по доверию:"),
  li("**Никаких обещаний результата.** «Избавлю от панических атак за 5 сессий» — это нарушение этики и обман: результат терапии зависит от обеих сторон. Пишите о процессе и методах, а не о гарантиях."),
  li("**Отзывы — осторожно.** Публиковать истории клиентов с деталями нельзя даже с согласия. Безопасный вариант — обезличенные отзывы без клинических подробностей или профессиональные рекомендации коллег."),
  li("**Конфиденциальность по умолчанию.** Форма записи — минимум полей: имя (можно псевдоним), контакт, удобное время. Политика конфиденциальности — отдельной страницей, а не формальной отпиской."),
  li("**Границы помощи.** Честно укажите, с чем вы не работаете, и добавьте контакты экстренных служб и горячих линий для людей в остром кризисе. Это не «слив клиентов», а признак зрелой практики."),
  p("Парадокс в том, что честные ограничения продают лучше громких обещаний: клиент чувствует, что с ним говорят как со взрослым."),

  h2("Онлайн-запись: как убрать переписку полностью"),
  p("Главный «вор времени» частной практики — согласование слотов в мессенджерах. Онлайн-запись решает это раз и навсегда:"),
  num("Клиент выбирает формат — индивидуальная или парная сессия, онлайн или кабинет."),
  num("Видит календарь со свободными слотами, синхронизированный с вашим графиком."),
  num("Оплачивает сессию или предоплату картой — неявки падают в разы."),
  num("Получает автоматическое напоминание за сутки и за час до встречи."),
  p("Технически это интеграция календаря (Google Calendar, решения вроде Calendly) и платёжной системы. Типовая интеграция стоит **$200–500**; сценарии посложнее — кабинет клиента, видеосвязь, CRM для центра — от **$1 000 до $3 000**. Психологу с 20+ сессиями в неделю это окупается за первый же месяц освободившегося времени."),

  h2("Блог: как тексты о тревожности приводят клиентов"),
  p("Люди редко гуглят «записаться к психологу» сразу. Сначала они ищут «как справиться с тревожностью», «симптомы выгорания», «паническая атака что делать». Это тысячи запросов каждый месяц — и именно здесь блог психолога превращается в канал привлечения."),
  li("Статья отвечает на запрос → человек читает и видит, что автор понимает его состояние."),
  li("В конце — мягкий мостик: «если самопомощь не работает, вот как проходит первая сессия»."),
  li("Одна удачная статья в топе Google приводит обращения годами — без бюджета на рекламу."),
  p("Чтобы блог работал, нужны семантика, структура под поисковые запросы и технически здоровый сайт. Это отдельная услуга — [SEO-продвижение](/ru/seo) от **$300/мес**; о конверсионной стороне текстов мы писали в статье про [9 дизайн-приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),

  h2("Личный бренд: примеры из нашего портфолио"),
  p("Сайт психолога — это сайт личного бренда: продаёт не логотип, а человек. Тон текстов, фото, цвета и даже [тёмная или светлая тема](/ru/blog/tyomnaya-ili-svetlaya-tema-sayta) должны работать на одно ощущение — «мне здесь спокойно и безопасно»."),
  p("Мы делали сайты личных брендов, где это ощущение — главный продукт. [Сайт Александра Ситникова](/ru/portfolio/oleksandr-sitnikov) построен вокруг экспертности одного человека: структура ведёт от знакомства к заявке без единого лишнего шага. [Сайт Glenn Garbo](/ru/portfolio/glenn-garbo) — пример того, как персональная айдентика и сдержанная типографика создают премиальное впечатление без «кричащего» дизайна. Оба подхода один в один переносятся на частную психологическую практику."),

  h2("Сколько стоит сайт для психолога в 2026 году"),
  p("Для частной практики почти всегда достаточно лендинга — это главный продукт в нише. Сайт побольше нужен, только если вы открываете центр с командой специалистов:"),
  table(
    ["Критерий", "Лендинг частной практики", "Сайт психологического центра"],
    [
      ["Цена", "**от $800**", "**от $3 500**"],
      ["Сроки", "7–14 дней", "3–6 недель"],
      ["Объём", "1 страница: подход, образование, цены, запись", "10+ страниц: команда, направления, блог, кабинеты"],
      ["Онлайн-запись", "Календарь слотов + оплата", "Запись к конкретному специалисту, расписание команды"],
      ["Кому подходит", "Психолог с частной практикой", "Центр психотерапии с 3+ специалистами"],
    ],
  ),
  p("Поддержка после запуска — **$200/мес** или **$40/час** разово: обновление цен, новые статьи в блог, технический уход. Полный разбор, из чего складывается цена, — в статье про [стоимость разработки сайта в 2026](/ru/blog/skolko-stoit-sayt-2026), а все пакеты — на странице [цен](/ru/pricing). Быстрее всего посчитать свой вариант — через [калькулятор](/ru/calculator): выбираете блоки, сразу видите сумму."),
  cta(
    "Готовы к сайту, который записывает клиентов сам?",
    "Лендинг для частной практики от $800: структура под доверие, онлайн-запись, этически чистые тексты.",
    "Обсудить проект",
    "/ru/calculator",
  ),
];

const bodyEn = [
  tldr("In short: what a therapist website needs", [
    "The first screen answers three things in 10 seconds: what you treat, in what format, and where to book",
    "Trust blocks: approach and methods, credentials and training, supervision, session formats and fees",
    "Ethics: a confidential booking form, no outcome promises, no \"healed in 5 sessions\" claims",
    "Online booking into open slots replaces DM back-and-forth and lowers the barrier to reaching out",
    "2026 pricing: a private-practice landing page from $800, a therapy centre website from $3,500",
    "A blog on anxiety and burnout brings clients from Google with zero ad spend",
  ]),
  p("A therapist website is a page that removes the client's biggest fear: choosing the wrong specialist. Someone looking for a therapist opens 3–5 profiles and picks the one whose approach, credentials and session fee are clear from the first screen. A good website answers those questions in thirty seconds — and lets the visitor book a session without a single message exchanged."),
  p("Instagram cannot do that: a feed has no structure, an account does not rank in Google for \"therapist near me\" or \"online therapy\", and sending a DM from a personal profile is a real psychological barrier for many clients. That is why even therapists with strong social followings eventually build a website."),
  p("This guide covers why social media is not enough, which blocks a therapist website needs, what professional ethics allows and forbids, how online booking works, and what it all costs in 2026. The price ranges are real — taken from our studio's rate card. We are a Ukrainian studio working with international clients: European quality, sensible rates."),

  h2("Why Instagram is not enough for a therapist"),
  p("Social media warms up an audience, but converts poorly for a \"cold\" visitor who has just worked up the courage to seek help. The reasons are concrete:"),
  li("**Trust.** In a feed there is no quick way to verify education, methods and experience. On a website, diplomas, certifications and a description of your approach sit in one place — the client sees a professional, not a life coach with a course to sell."),
  li("**Search.** People type \"therapist website\", \"psychologist near me\" and \"online therapy\" into Google. An Instagram profile does not rank for those queries — only a website captures search traffic."),
  li("**Privacy.** Sending a DM from a personal account means revealing your identity before the first conversation. A booking form on a website feels more anonymous and safer, so it converts better."),
  li("**Algorithms.** Reach drops the moment you stop posting. A website is an asset that compounds: one page ranking in Google keeps bringing clients month after month with no effort from you."),
  p("The takeaway: keep Instagram as a warm-up channel, and make the website the destination every road leads to — search, ads, business cards and referrals."),

  h2("Therapist website structure: the blocks that build trust"),
  p("A private-practice site is usually one substantial landing page. But the order and content of its blocks matter more here than in any other niche: the visitor is in a vulnerable state, and every confusing element is a reason to close the tab."),
  h3("The first screen"),
  p("A photo, your name, one sentence about what you work with (\"I help clients manage anxiety and burnout\"), the format — online or in person, and where — and a booking button. No abstractions like \"finding inner harmony\": specificity calms anxiety better than metaphors."),
  h3("Approach and methods"),
  p("CBT, Gestalt, psychodynamic therapy, EMDR — name the method and explain in plain language how a session runs and how many are typically needed. Clients are not required to know the terminology; the fact that you explain simply is itself a signal of competence."),
  h3("Credentials, training, supervision"),
  p("Degree, continuing education, membership in professional bodies, regular supervision. Scans or photos of certificates work better than a text list: they can be examined. For a therapist this is the equivalent of a clinic's licence — the main filter against charlatans."),
  h3("Session formats and fees"),
  p("Individual, couples and family therapy; session length; the fee. A published price filters out mismatched enquiries and saves hours of messaging. If you offer packages or a student rate, say so."),
  table(
    ["Trust block", "What the client sees", "What it does"],
    [
      ["Approach and methods", "A plain-language explanation of how therapy works", "Removes the fear of the unknown before the first session"],
      ["Diplomas and certificates", "Verifiable proof of qualification", "Cuts off the doubt \"is this person a real therapist\""],
      ["Session fees", "An honest price, not \"contact for pricing\"", "Filters enquiries and eliminates back-and-forth"],
      ["Photo and intro video", "A real person and how they speak", "Creates a sense of contact before booking"],
      ["Privacy policy", "That their data and the fact of reaching out are protected", "Removes the biggest barrier — fear of exposure"],
    ],
  ),
  cta(
    "Need a website people trust from the first screen?",
    "Price a private-practice landing page in 2 minutes — no calls, no email chains.",
    "Get an estimate",
    "/en/calculator",
  ),

  h2("Ethics: what a therapist website must not say"),
  p("A therapist website is governed not just by common sense but by the ethics codes of professional associations. Violations damage both reputation and trust:"),
  li("**No outcome promises.** \"Free of panic attacks in 5 sessions\" is both an ethics breach and a lie: therapy outcomes depend on both parties. Describe the process and the methods, not guarantees."),
  li("**Testimonials — carefully.** Publishing client stories with details is off-limits even with consent. The safe options are anonymised feedback without clinical specifics, or professional endorsements from colleagues."),
  li("**Confidentiality by default.** Keep the booking form minimal: a name (a pseudonym is fine), a contact, a preferred time. Publish a real privacy policy as its own page, not a boilerplate footnote."),
  li("**Limits of help.** State honestly what you do not work with, and list crisis lines and emergency contacts for people in acute distress. That is not \"losing clients\" — it is the mark of a mature practice."),
  p("The paradox: honest limits sell better than loud promises, because the client feels they are being spoken to as an adult."),

  h2("Online booking: removing the messaging entirely"),
  p("The biggest time sink in private practice is negotiating time slots over messengers. Online booking solves it for good:"),
  num("The client picks a format — individual or couples session, online or in the office."),
  num("They see a calendar of open slots, synced with your actual schedule."),
  num("They pay for the session or a deposit by card — no-shows drop sharply."),
  num("They get automatic reminders a day and an hour before the appointment."),
  p("Technically this is a calendar integration (Google Calendar, Calendly-style tools) plus a payment provider. A typical integration costs **$200–500**; more complex setups — a client portal, video calls, a CRM for a centre — run **$1,000–3,000**. For a therapist seeing 20+ clients a week, it pays for itself in the first month of reclaimed time."),

  h2("A blog: how articles about anxiety bring clients"),
  p("People rarely search \"book a therapist\" straight away. First they search \"how to deal with anxiety\", \"burnout symptoms\", \"what to do during a panic attack\". Those queries add up to thousands of searches a month — and that is where a therapist's blog becomes an acquisition channel."),
  li("An article answers the query → the reader sees that the author genuinely understands their state."),
  li("At the end, a soft bridge: \"if self-help is not enough, here is what a first session looks like\"."),
  li("One article ranking in Google brings enquiries for years — with zero ad budget."),
  p("For a blog to work you need keyword research, search-shaped structure and a technically healthy site. That is a separate service — [SEO](/en/seo) from **$300/month**; we covered the conversion side of content in [9 design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),

  h2("Personal brand: examples from our portfolio"),
  p("A therapist website is a personal-brand website: it is the person, not a logo, that sells. The tone of the copy, the photography, the colours — even the choice of a [dark or light theme](/en/blog/dark-vs-light-website-theme) — should all serve one feeling: \"I am safe here\"."),
  p("We have built personal-brand sites where that feeling is the core product. [Oleksandr Sitnikov's website](/en/portfolio/oleksandr-sitnikov) is built around one person's expertise: the structure walks the visitor from introduction to enquiry without a single wasted step. [Glenn Garbo's website](/en/portfolio/glenn-garbo) shows how personal identity and restrained typography create a premium impression without loud design. Both approaches translate one-to-one to a private therapy practice."),

  h2("What a therapist website costs in 2026"),
  p("For a private practice, a landing page is almost always enough — it is the core product in this niche. A larger site only makes sense when you are opening a centre with a team of practitioners:"),
  table(
    ["Criterion", "Private-practice landing page", "Therapy centre website"],
    [
      ["Price", "**from $800**", "**from $3,500**"],
      ["Timeline", "7–14 days", "3–6 weeks"],
      ["Scope", "1 page: approach, credentials, fees, booking", "10+ pages: team, specialisms, blog, practitioner profiles"],
      ["Online booking", "Slot calendar + payment", "Booking per practitioner, team schedules"],
      ["Best for", "A therapist in private practice", "A therapy centre with 3+ practitioners"],
    ],
  ),
  p("Post-launch support is **$200/month** or **$40/hour** ad hoc: fee updates, new blog articles, technical upkeep. For a full breakdown of what goes into the price, see our guide to [custom website costs in 2026](/en/blog/custom-website-cost-uk-2026), and all packages are on the [pricing page](/en/pricing). The fastest way to price your own setup is the [calculator](/en/calculator): pick the blocks, see the number instantly."),
  cta(
    "Ready for a website that books clients for you?",
    "A private-practice landing page from $800: trust-first structure, online booking, ethically clean copy. Built in Europe, priced sensibly.",
    "Discuss your project",
    "/en/calculator",
  ),
];

const doc = {
  _id: "ltAug2026-sait-dlia-psykholoha",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-psykholoha" },
    ru: { _type: "slug", current: "sayt-dlya-psihologa" },
    en: { _type: "slug", current: "therapist-website-guide" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для психолога: довіра з першого екрана і запис без листування",
    ru: "Сайт для психолога: доверие с первого экрана и запись без переписки",
    en: "Therapist Website: Trust from the First Screen and Booking Without DMs",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для психолога: структура, довіра, ціни 2026",
    ru: "Сайт для психолога: структура, доверие, цены 2026",
    en: "Therapist Website Design: Structure & Cost 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для психолога: блоки довіри, етика, онлайн-запис ✔️ Лендінг від $800, центр від $3 500 ✔️ Приклади робіт ➡ Повний гайд 2026",
    ru: "➤ Сайт психолога: блоки доверия, этика, онлайн-запись ✔️ Лендинг от $800, центр от $3 500 ✔️ Примеры работ ➡ Полный гайд 2026",
    en: "➤ Therapist website design: trust blocks, ethics, online booking ✔️ Landing page from $800 ✔️ Real examples ➡ Full 2026 guide",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Сайти для спеціалістів",
    ru: "Сайты для специалистов",
    en: "Websites for professionals",
  },
  lede: {
    _type: "localizedString",
    uk: "Клієнт обирає психолога за 30 секунд на першому екрані. Розбираємо структуру, блоки довіри, етичні межі, онлайн-запис і реальні ціни 2026 року.",
    ru: "Клиент выбирает психолога за 30 секунд на первом экране. Разбираем структуру, блоки доверия, этические границы, онлайн-запись и реальные цены 2026 года.",
    en: "A client chooses a therapist in 30 seconds on the first screen. We break down structure, trust blocks, ethical boundaries, online booking and real 2026 pricing.",
  },
  tags: ["сайт для психолога", "особистий бренд", "онлайн-запис", "лендінг"],
  relatedPostSlugs: ["9-dyzain-pryiomiv-dlia-konversii", "temna-chy-svitla-tema-saitu", "vartist-rozrobky-saytu-2026"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для психолога?",
        ru: "Сколько стоит сайт для психолога?",
        en: "How much does a therapist website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг приватної практики з блоками довіри й онлайн-записом — від $800, строк 7–14 днів. Сайт центру психотерапії з командою фахівців — від $3 500. Типова інтеграція календаря чи оплати додає $200–500.",
        ru: "Лендинг частной практики с блоками доверия и онлайн-записью — от $800, срок 7–14 дней. Сайт центра психотерапии с командой специалистов — от $3 500. Типовая интеграция календаря или оплаты добавляет $200–500.",
        en: "A private-practice landing page with trust blocks and online booking starts at $800 and takes 7–14 days. A therapy centre website with a team of practitioners starts at $3,500. A typical calendar or payment integration adds $200–500.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен психологу сайт, якщо є Instagram?",
        ru: "Нужен ли психологу сайт, если есть Instagram?",
        en: "Does a therapist need a website if they have Instagram?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так. Instagram не ранжується в Google за запитами «психолог + місто» чи «психолог онлайн», не дає перевірити освіту в одному місці й вимагає писати в дірект з особистого акаунта — це бар'єр для клієнта. Сайт закриває всі три проблеми, а соцмережі лишаються каналом прогріву.",
        ru: "Да. Instagram не ранжируется в Google по запросам «психолог + город» или «психолог онлайн», не даёт проверить образование в одном месте и требует писать в директ с личного аккаунта — это барьер для клиента. Сайт закрывает все три проблемы, а соцсети остаются каналом прогрева.",
        en: "Yes. An Instagram profile does not rank in Google for \"therapist near me\" or \"online therapy\", does not present your credentials in one verifiable place, and forces clients to DM from a personal account — a real barrier. A website solves all three; social media remains a warm-up channel.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що обов'язково має бути на сайті психолога?",
        ru: "Что обязательно должно быть на сайте психолога?",
        en: "What must a psychologist website include?",
      },
      answer: {
        _type: "localizedText",
        uk: "П'ять блоків: підхід і методи простою мовою, освіта й сертифікати (сканами), формати і ціни сесій, онлайн-запис у вільні слоти та політика конфіденційності. Плюс чесні межі: з чим не працюєте і куди звертатися в гострій кризі.",
        ru: "Пять блоков: подход и методы простым языком, образование и сертификаты (сканами), форматы и цены сессий, онлайн-запись в свободные слоты и политика конфиденциальности. Плюс честные границы: с чем не работаете и куда обращаться в остром кризисе.",
        en: "Five blocks: your approach and methods in plain language, credentials and certificates (as scans), session formats and fees, online booking into open slots, and a privacy policy. Plus honest limits: what you do not work with and where to turn in an acute crisis.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна публікувати відгуки клієнтів на сайті психолога?",
        ru: "Можно ли публиковать отзывы клиентов на сайте психолога?",
        en: "Can a therapist publish client testimonials?",
      },
      answer: {
        _type: "localizedText",
        uk: "З великою обережністю. Історії з клінічними деталями публікувати не можна навіть за згодою клієнта — це порушення етичних кодексів. Безпечні варіанти: знеособлені відгуки без подробиць терапії або професійні рекомендації колег і супервізорів.",
        ru: "С большой осторожностью. Истории с клиническими деталями публиковать нельзя даже с согласия клиента — это нарушение этических кодексов. Безопасные варианты: обезличенные отзывы без подробностей терапии или профессиональные рекомендации коллег и супервизоров.",
        en: "With great care. Stories containing clinical details must not be published even with the client's consent — professional ethics codes forbid it. The safe options are anonymised feedback without therapy specifics, or professional endorsements from colleagues and supervisors.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як психологу отримувати клієнтів із Google?",
        ru: "Как психологу получать клиентов из Google?",
        en: "How does a therapist get clients from Google?",
      },
      answer: {
        _type: "localizedText",
        uk: "Два шляхи: сторінка, оптимізована під «психолог + місто / онлайн», і блог під інформаційні запити — «як впоратися з тривожністю», «симптоми вигорання». Одна стаття в топі приводить звернення роками. SEO-супровід у нашій студії — від $300/міс.",
        ru: "Два пути: страница, оптимизированная под «психолог + город / онлайн», и блог под информационные запросы — «как справиться с тревожностью», «симптомы выгорания». Одна статья в топе приводит обращения годами. SEO-сопровождение в нашей студии — от $300/мес.",
        en: "Two routes: a page optimised for \"therapist + city / online therapy\", and a blog targeting informational queries like \"how to deal with anxiety\" or \"burnout symptoms\". One ranking article brings enquiries for years. SEO support at our studio starts at $300/month.",
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
