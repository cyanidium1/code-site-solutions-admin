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

/* ------------------------------------------------------------------ UK --- */

const bodyUk = [
  tldr("Коротко про фавікон", [
    "Фавікон — іконка сайту у вкладці, закладках, історії та в мобільній видачі Google.",
    "Набір: favicon.ico 16 і 32, apple-touch-icon 180×180, PNG 192 і 512 у маніфесті, SVG за бажанням.",
    "У мобільному пошуку іконка стоїть поруч із заголовком сніпета — це працює на CTR.",
    "Логотип не можна просто зменшити: тонкі лінії на 16 пікселях перетворюються на кашу.",
    "Часті помилки: тільки 16×16, прозорий фон на темній темі, забутий apple-touch-icon.",
    "У нас фавікон входить у будь-який пакет — окремо за нього не платять.",
  ]),

  p("Фавікон — це маленька квадратна іконка сайту, яку браузер показує у вкладці, у списку закладок, в історії та в мобільній видачі Google поруч із заголовком. Технічно це зображення розміром від 16×16 до 512×512 пікселів у форматі ICO, PNG або SVG, яке лежить у корені сайту й підключається в секції head тегом link rel=icon."),
  p("Назва походить від favorite icon: у 1999 році Internet Explorer 5 почав показувати іконку сайту в списку «Обране». Сьогодні це єдиний елемент бренду, який видно навіть тоді, коли вкладка стиснута до двадцяти пікселів і від заголовка лишилися дві літери."),

  h2("Простими словами"),
  p("Уявіть полицю з двадцятьма однаковими білими коробками. Фавікон — це наліпка, за якою людина знаходить свою коробку, не читаючи підписів. У браузері з двома десятками вкладок текст обрізається до кількох літер, і впізнаваною лишається тільки іконка. Тому головна вимога до фавікона — не «красиво», а «впізнавано при розмірі нігтя»: тут виграє не деталізація, а контраст і одна проста форма."),

  h2("Де користувач бачить фавікон"),
  li("**Вкладка браузера** — основне місце. Чим більше вкладок відкрито, тим важливіша іконка для повернення на ваш сайт."),
  li("**Закладки та історія** — у списках із десятків рядків око знаходить іконку швидше, ніж читає заголовок."),
  li("**Мобільна видача Google** — пошуковик показує фавікон ліворуч від заголовка результату на смартфонах. Сніпет із чіткою іконкою виглядає солідніше за сніпет із порожнім кружком, і це впливає на клікабельність."),
  li("**Домашній екран смартфона** — якщо сайт додали «на робочий стіл», іконкою стає apple-touch-icon на iOS або зображення з веб-маніфесту на Android."),
  li("**Месенджери й сервіси** — Telegram, Slack, RSS-читалки й закладкові сервіси тягнуть фавікон для превʼю посилання."),
  p("Мобільна видача — найнедооціненіший пункт списку. Ви платите за просування, доводите сторінку до топ-5, а поруч із вашим заголовком стоїть сірий глобус, тоді як у конкурента — впізнаваний знак."),

  h2("Які розміри і формати потрібні"),
  p("Один файл «на всі випадки» не працює: iOS ігнорує ICO, Android бере іконку з маніфесту, а Google вимагає, щоб сторона зображення була кратна 48 пікселям. Робочий набір виглядає так:"),
  table(
    ["Розмір", "Формат", "Де використовується", "Обовʼязково"],
    [
      ["16×16", "ICO або PNG", "Вкладка браузера, історія, закладки", "Так"],
      ["32×32", "ICO або PNG", "Вкладка на екранах Retina, панель завдань Windows", "Так"],
      ["48×48 і кратні", "PNG або ICO в корені", "Мобільна видача Google", "Так"],
      ["180×180", "PNG, apple-touch-icon", "Домашній екран iPhone та iPad", "Так"],
      ["192×192", "PNG у веб-маніфесті", "Домашній екран Android, PWA", "Так"],
      ["512×512", "PNG у веб-маніфесті", "Сплеш-екран PWA, встановлення застосунку", "Так"],
      ["Векторний", "SVG", "Сучасні браузери, автоперемикання під темну тему", "Бажано"],
    ],
  ),
  p("Мінімальний комплект на 2026 рік: favicon.ico з розмірами 16 і 32 всередині одного файлу, apple-touch-icon.png на 180 пікселів, icon-192.png та icon-512.png у маніфесті. SVG — бонус, а не заміна растру."),

  h2("Як зробити фавікон із логотипа"),
  p("Найпоширеніша помилка — узяти готовий логотип і механічно зменшити його до 32 пікселів. Лок-ап із назвою, слоганом і тонкими лініями перетворюється на сіру пляму. Тренди приходять і йдуть — ми розбирали їх у матеріалі про [тренди веб-дизайну 2026](/blog/trendy-veb-dyzainu-2026) — а вимога впізнаваності на 16 пікселях не змінюється з 1999 року."),
  num("**Візьміть один елемент.** Монограму, першу літеру назви або знак із логотипа. Не весь блок із текстом."),
  num("**Приберіть деталі.** Тонкі обведення, градієнти й тіні на малому розмірі зникають або бруднять зображення. Залишайте суцільні форми й високий контраст."),
  num("**Перевірте в реальному масштабі.** Не в макеті на 400%, а у вкладці браузера поруч з іншими сайтами. Якщо не впізнаєте свій сайт за півсекунди — спрощуйте далі."),
  num("**Додайте фон.** Іконка з непрозорим фоном фірмового кольору поводиться передбачувано і в світлій, і в темній темі."),
  p("Якщо логотипа ще немає, підійде літера у фірмовому кольорі на суцільній плашці — це помітно краще за дефолтний глобус."),

  h2("Темна і світла тема браузера"),
  p("Браузер малює вкладки на світлому або темному тлі залежно від теми системи. Чорна монограма з прозорим фоном ідеально виглядає у світлій темі й повністю зникає в темній. Робочих рішень два: непрозора плашка фірмового кольору, яка тримається на будь-якому тлі, або SVG-фавікон із медіазапитом prefers-color-scheme усередині файлу — тоді іконка перемикає колір сама. Логіка та сама, що й у виборі теми для всього сайту: ми розбирали її в статті [темна чи світла тема сайту](/blog/temna-chy-svitla-tema-saitu)."),

  h2("Як підключити фавікон"),
  p("Файли кладуть у корінь сайту, а посилання на них — у head кожної сторінки. Мінімальний набір тегів:"),
  li("link rel=icon href=/favicon.ico sizes=any — базова іконка для всіх браузерів;"),
  li("link rel=icon type=image/svg+xml href=/icon.svg — векторна версія для сучасних браузерів;"),
  li("link rel=apple-touch-icon href=/apple-touch-icon.png — іконка 180×180 для iOS;"),
  li("link rel=manifest href=/site.webmanifest — маніфест, у якому перелічені icons 192 і 512 для Android та PWA."),
  p("Файл favicon.ico має лежати саме в корені: браузери й краулер Google звертаються за адресою /favicon.ico напряму, навіть якщо тега в коді немає. Після заміни іконки не поспішайте з висновками — фавікони кешуються агресивно, і стара картинка може висіти тижнями. Перевіряйте в режимі інкогніто."),

  h2("Типові помилки"),
  li("**Тільки 16×16.** Іконка розмивається на екранах з високою щільністю пікселів і не проходить у видачу Google, якій потрібен розмір, кратний 48."),
  li("**Прозорий фон при темному знаку.** У темній темі браузера іконка зникає повністю."),
  li("**Забутий apple-touch-icon.** Коли користувач додає сайт на домашній екран iPhone, iOS підставляє зменшений скріншот сторінки замість іконки."),
  li("**Зменшений логотип цілком.** Текст і тонкі елементи зливаються в нерозбірливу пляму."),
  li("**Іконка недоступна краулеру.** Файл на піддомені, закритий у robots.txt або віддається з помилкою — Google просто не покаже нічого."),
  li("**Редизайн без оновлення іконки.** Сайт уже новий, а в корені лежить фавікон із логотипом п'ятирічної давності."),

  h2("Скільки це коштує"),
  p("Окремої ціни на фавікон у нас немає: він входить у будь-який пакет — і в [лендінг](/landing), і в корпоративний сайт, і в магазин. Дизайнер готує набір іконок під час роботи над макетом, розробник підключає файли й маніфест при складанні. Це частина нормальної здачі проєкту — так само, як [адаптивна верстка](/blog/shcho-take-adaptyvna-verstka). Що ще входить у пакети, видно на сторінці [цін](/pricing)."),
  p("Якщо сайт уже працює й питання тільки в іконці — це півгодини в межах [підтримки](/support)."),

  cta(
    "Зробимо сайт, у якому не забувають про дрібниці",
    "Фавікон, маніфест, іконки для iOS та Android — усе це входить у розробку. Розкажіть про проєкт, і ми порахуємо вартість.",
    "Порахувати вартість",
    "/pricing",
  ),
];

/* ------------------------------------------------------------------ RU --- */

const bodyRu = [
  tldr("Коротко о фавиконе", [
    "Фавикон — иконка сайта во вкладке, закладках, истории и в мобильной выдаче Google.",
    "Набор: favicon.ico 16 и 32, apple-touch-icon 180×180, PNG 192 и 512 в манифесте, SVG по желанию.",
    "В мобильном поиске иконка стоит рядом с заголовком сниппета — это работает на CTR.",
    "Логотип нельзя просто уменьшить: тонкие линии в 16 пикселях превращаются в кашу.",
    "Частые ошибки: только 16×16, прозрачный фон в тёмной теме, забытый apple-touch-icon.",
    "У нас фавикон входит в любой пакет — отдельно за него не платят.",
  ]),

  p("Фавикон — это маленькая квадратная иконка сайта, которую браузер показывает во вкладке, в закладках, в истории и в мобильной выдаче Google рядом с заголовком. Технически это изображение от 16×16 до 512×512 пикселей в формате ICO, PNG или SVG, которое лежит в корне сайта и подключается в секции head тегом link rel=icon."),
  p("Название пришло от favorite icon: в 1999 году Internet Explorer 5 начал показывать иконку сайта в списке «Избранное». Сегодня это единственный элемент бренда, который виден даже тогда, когда вкладка сжата до двадцати пикселей и от заголовка остались две буквы."),

  h2("Простыми словами"),
  p("Представьте полку с двумя десятками одинаковых белых коробок. Фавикон — это наклейка, по которой человек находит свою коробку, не читая подписи. В браузере с двадцатью вкладками текст обрезается до пары букв, и узнаваемой остаётся только иконка. Поэтому главное требование к фавикону — не «красиво», а «узнаётся в размер ногтя»: здесь выигрывает не детализация, а контраст и одна простая форма."),

  h2("Где пользователь видит фавикон"),
  li("**Вкладка браузера** — основное место. Чем больше вкладок открыто, тем важнее иконка для возврата на ваш сайт."),
  li("**Закладки и история** — в списках из десятков строк глаз находит иконку быстрее, чем читает заголовок."),
  li("**Мобильная выдача Google** — поисковик показывает фавикон слева от заголовка результата на смартфонах. Сниппет с чёткой иконкой выглядит солиднее сниппета с пустым кружком, и это влияет на кликабельность."),
  li("**Домашний экран смартфона** — если сайт добавили «на рабочий стол», иконкой становится apple-touch-icon на iOS или изображение из веб-манифеста на Android."),
  li("**Мессенджеры и сервисы** — Telegram, Slack, RSS-читалки и закладочные сервисы тянут фавикон для превью ссылки."),
  p("Мобильная выдача — самый недооценённый пункт списка. Вы платите за продвижение, выводите страницу в топ-5, а рядом с вашим заголовком стоит серый глобус, тогда как у конкурента — узнаваемый знак."),

  h2("Какие размеры и форматы нужны"),
  p("Один файл «на все случаи» не работает: iOS игнорирует ICO, Android берёт иконку из манифеста, а Google требует, чтобы сторона изображения была кратна 48 пикселям. Рабочий набор выглядит так:"),
  table(
    ["Размер", "Формат", "Где используется", "Обязательно"],
    [
      ["16×16", "ICO или PNG", "Вкладка браузера, история, закладки", "Да"],
      ["32×32", "ICO или PNG", "Вкладка на Retina-экранах, панель задач Windows", "Да"],
      ["48×48 и кратные", "PNG или ICO в корне", "Мобильная выдача Google", "Да"],
      ["180×180", "PNG, apple-touch-icon", "Домашний экран iPhone и iPad", "Да"],
      ["192×192", "PNG в веб-манифесте", "Домашний экран Android, PWA", "Да"],
      ["512×512", "PNG в веб-манифесте", "Сплеш-экран PWA, установка приложения", "Да"],
      ["Векторный", "SVG", "Современные браузеры, автопереключение под тёмную тему", "Желательно"],
    ],
  ),
  p("Минимальный комплект на 2026 год: favicon.ico с размерами 16 и 32 внутри одного файла, apple-touch-icon.png на 180 пикселей, icon-192.png и icon-512.png в манифесте. SVG — бонус, а не замена растру."),

  h2("Как сделать фавикон из логотипа"),
  p("Самая частая ошибка — взять готовый логотип и механически уменьшить его до 32 пикселей. Лок-ап с названием, слоганом и тонкими линиями превращается в серое пятно. Тренды приходят и уходят — мы разбирали их в материале про [тренды веб-дизайна 2026](/ru/blog/trendy-veb-dizayna-2026) — а требование узнаваемости в 16 пикселях не менялось с 1999 года."),
  num("**Возьмите один элемент.** Монограмму, первую букву названия или знак из логотипа. Не весь блок с текстом."),
  num("**Уберите детали.** Тонкие обводки, градиенты и тени на малом размере исчезают или пачкают изображение. Оставляйте сплошные формы и высокий контраст."),
  num("**Проверьте в реальном масштабе.** Не в макете на 400%, а во вкладке браузера рядом с другими сайтами. Если не узнаёте свой сайт за полсекунды — упрощайте дальше."),
  num("**Добавьте фон.** Иконка с непрозрачным фоном фирменного цвета ведёт себя предсказуемо и в светлой, и в тёмной теме."),
  p("Если логотипа ещё нет, подойдёт буква фирменного цвета на сплошной плашке — это заметно лучше глобуса по умолчанию."),

  h2("Тёмная и светлая тема браузера"),
  p("Браузер рисует вкладки на светлом или тёмном фоне в зависимости от темы системы. Чёрная монограмма с прозрачным фоном отлично выглядит в светлой теме и полностью исчезает в тёмной. Рабочих решений два: непрозрачная плашка фирменного цвета, которая держится на любом фоне, или SVG-фавикон с медиазапросом prefers-color-scheme внутри файла — тогда иконка переключает цвет сама. Логика та же, что и при выборе темы для всего сайта: мы разбирали её в статье [тёмная или светлая тема сайта](/ru/blog/tyomnaya-ili-svetlaya-tema-sayta)."),

  h2("Как подключить фавикон"),
  p("Файлы кладут в корень сайта, а ссылки на них — в head каждой страницы. Минимальный набор тегов:"),
  li("link rel=icon href=/favicon.ico sizes=any — базовая иконка для всех браузеров;"),
  li("link rel=icon type=image/svg+xml href=/icon.svg — векторная версия для современных браузеров;"),
  li("link rel=apple-touch-icon href=/apple-touch-icon.png — иконка 180×180 для iOS;"),
  li("link rel=manifest href=/site.webmanifest — манифест, в котором перечислены icons 192 и 512 для Android и PWA."),
  p("Файл favicon.ico должен лежать именно в корне: браузеры и краулер Google обращаются по адресу /favicon.ico напрямую, даже если тега в коде нет. После замены иконки не спешите с выводами — фавиконы кешируются агрессивно, и старая картинка может висеть неделями. Проверяйте в режиме инкогнито."),

  h2("Типичные ошибки"),
  li("**Только 16×16.** Иконка размывается на экранах с высокой плотностью пикселей и не проходит в выдачу Google, которой нужен размер, кратный 48."),
  li("**Прозрачный фон при тёмном знаке.** В тёмной теме браузера иконка исчезает полностью."),
  li("**Забытый apple-touch-icon.** Когда пользователь добавляет сайт на домашний экран iPhone, iOS подставляет уменьшенный скриншот страницы вместо иконки."),
  li("**Уменьшенный логотип целиком.** Текст и тонкие элементы сливаются в неразборчивое пятно."),
  li("**Иконка недоступна краулеру.** Файл на поддомене, закрытый в robots.txt или отдающийся с ошибкой — Google просто не покажет ничего."),
  li("**Редизайн без обновления иконки.** Сайт уже новый, а в корне лежит фавикон с логотипом пятилетней давности."),

  h2("Сколько это стоит"),
  p("Отдельной цены на фавикон у нас нет: он входит в любой пакет — и в [лендинг](/ru/landing), и в корпоративный сайт, и в магазин. Дизайнер готовит набор иконок ещё на этапе макета, разработчик подключает файлы и манифест при сборке. Это часть нормальной сдачи проекта — ровно как и адаптивная вёрстка. Что ещё входит в пакеты, видно на странице [цен](/ru/pricing)."),
  p("Если сайт уже работает и вопрос только в иконке — это полчаса в рамках [поддержки](/ru/support)."),

  cta(
    "Сделаем сайт, в котором не забывают про мелочи",
    "Фавикон, манифест, иконки для iOS и Android — всё это входит в разработку. Расскажите о проекте, и мы посчитаем стоимость.",
    "Посчитать стоимость",
    "/ru/pricing",
  ),
];

/* ------------------------------------------------------------------ EN --- */

const bodyEn = [
  tldr("Favicon in short", [
    "A favicon is the site icon shown in browser tabs, bookmarks, history and Google mobile results.",
    "The set: favicon.ico with 16 and 32 px, a 180×180 apple-touch-icon, 192 and 512 px PNGs in the manifest, SVG optional.",
    "On mobile search the icon sits next to your snippet title, so it works on click-through rate.",
    "You cannot simply shrink a logo: thin lines turn to mush at 16 pixels.",
    "Common mistakes: 16×16 only, a transparent background on dark theme, a missing apple-touch-icon.",
    "Every package we build includes the icon set — it is not billed separately.",
  ]),

  p("A favicon is the small square site icon a browser shows in the tab, in bookmarks, in history, and next to your title in Google mobile search results. Technically it is an image between 16×16 and 512×512 pixels in ICO, PNG or SVG format, placed in the site root and referenced from the head section with a link rel=icon tag."),
  p("The name comes from favorite icon: in 1999 Internet Explorer 5 started showing a site icon in the Favourites list. It is now the only piece of branding that survives when a tab is squeezed to twenty pixels."),

  h2("In plain terms"),
  p("Picture a shelf of twenty identical white boxes. The favicon is the sticker that lets someone find their box without reading a label. In a browser with twenty tabs open the title is cut to a couple of characters, and the icon is the only recognisable thing left. So the requirement is not that it looks beautiful, but that it reads at thumbnail size."),

  h2("Where people actually see it"),
  li("**Browser tabs** — the main place, and the more tabs someone keeps open, the more work the icon does."),
  li("**Bookmarks and history** — in a list of dozens of rows the eye finds an icon faster than it reads a title."),
  li("**Google mobile results** — Google shows the favicon to the left of the result title on phones. A snippet with a crisp icon reads as more solid than one with an empty circle."),
  li("**Phone home screens** — the icon comes from apple-touch-icon on iOS or from the web manifest on Android."),
  li("**Messengers and readers** — Telegram, Slack and RSS readers pull the favicon for link previews."),
  p("Search results are the most underrated item on that list. You pay for SEO, push a page into the top five, and then sit beside a competitor whose branded mark is showing while yours is a grey globe."),

  h2("Sizes and formats you need"),
  p("One file for every case does not work: iOS ignores ICO, Android reads the icon from the manifest, and Google requires a side that is a multiple of 48 pixels:"),
  table(
    ["Size", "Format", "Where it is used", "Required"],
    [
      ["16×16", "ICO or PNG", "Browser tab, history, bookmarks", "Yes"],
      ["32×32", "ICO or PNG", "Tabs on retina screens, Windows taskbar", "Yes"],
      ["48×48 or a multiple", "PNG or ICO in the root", "Google mobile search results", "Yes"],
      ["180×180", "PNG, apple-touch-icon", "iPhone and iPad home screen", "Yes"],
      ["192×192", "PNG in the web manifest", "Android home screen, PWA", "Yes"],
      ["512×512", "PNG in the web manifest", "PWA splash screen, install prompt", "Yes"],
      ["Vector", "SVG", "Modern browsers, automatic dark-theme switching", "Recommended"],
    ],
  ),
  p("The minimum viable kit in 2026: one favicon.ico holding both 16 and 32 px, apple-touch-icon.png at 180 px, and icon-192.png plus icon-512.png in the manifest. SVG is a bonus, not a replacement."),

  h2("Making one from your logo"),
  p("The most common mistake is to take the finished logo and scale it to 32 pixels. A lockup with a company name, a strapline and hairline strokes becomes a grey smudge. Trends come and go — we covered a few in [web design trends for 2026](/en/blog/web-design-trends-2026-to-ignore) — but the requirement to stay legible at 16 pixels has not moved since 1999."),
  num("**Take one element.** A monogram, the first letter of the name, or the mark from the logo — not the whole lockup with type."),
  num("**Strip the detail.** Hairlines, gradients and shadows disappear or muddy the image at small sizes."),
  num("**Check it at real size.** Not in a mockup at 400 percent, but in a browser tab next to other sites."),
  num("**Give it a background.** An opaque brand-colour tile behaves predictably in both themes."),

  h2("Dark and light browser themes"),
  p("Browsers draw tabs on a light or dark background depending on the system theme. A black monogram on a transparent background looks perfect in light mode and vanishes in dark mode. Two solutions work: an opaque tile in your brand colour, or an SVG favicon with a prefers-color-scheme media query inside the file, so the icon switches colour by itself. The reasoning mirrors the wider theme decision we covered in [dark vs light website theme](/en/blog/dark-vs-light-website-theme)."),

  h2("How to wire it up"),
  p("The files sit in the site root and are referenced from the head of every page:"),
  li("link rel=icon href=/favicon.ico sizes=any — the base icon for all browsers;"),
  li("link rel=icon type=image/svg+xml href=/icon.svg — the vector version for modern browsers;"),
  li("link rel=apple-touch-icon href=/apple-touch-icon.png — the 180×180 icon for iOS;"),
  li("link rel=manifest href=/site.webmanifest — the manifest listing the 192 and 512 px icons for Android and PWA installs."),
  p("Keep favicon.ico in the root itself: browsers and Google's crawler request /favicon.ico directly even when no tag is present. After swapping an icon, do not assume it failed — favicons are cached aggressively and the old image can linger for weeks. Check in a private window."),

  h2("Common mistakes"),
  li("**16×16 only.** The icon blurs on high-density screens and fails Google's requirement for a size that is a multiple of 48."),
  li("**A transparent background under a dark mark.** In a dark browser theme the icon disappears entirely."),
  li("**No apple-touch-icon.** When someone adds the site to an iPhone home screen, iOS substitutes a shrunken screenshot of the page."),
  li("**The whole logo scaled down.** Type and fine detail merge into an unreadable blob."),
  li("**An icon the crawler cannot reach.** A file on a subdomain, blocked in robots.txt or returning an error means Google shows nothing."),
  li("**A redesign that skipped the icon.** The site is new, but the root still holds a favicon from a five-year-old brand."),

  h2("What it costs"),
  p("We do not price favicons separately — the icon set is part of every build, whether that is a [landing page](/en/landing), a corporate site or an online store. The designer prepares the icons while the layout is still being drawn, and the developer wires up the files and the manifest. It is part of shipping a site properly, not a line item. You can see what each package covers on our [pricing page](/en/pricing)."),
  p("If your site is already live and only the icon is missing, it is half an hour under a [support](/en/support) plan."),

  cta(
    "A site built by people who sweat the small stuff",
    "Favicon, manifest, iOS and Android icons — all included in the build. Tell us about your project and we will quote it. European quality, sensible rates.",
    "Get a quote",
    "/en/pricing",
  ),
];

/* ---------------------------------------------------------------- DOC ---- */

const doc = {
  _id: "glos2026-shcho-take-favicon",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 5,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-favicon" },
    ru: { _type: "slug", current: "chto-takoe-favicon" },
    en: { _type: "slug", current: "what-is-a-favicon" },
  },
  title: {
    _type: "localizedString",
    uk: "Фавікон — що це і як зробити правильно",
    ru: "Фавикон — что это и как сделать правильно",
    en: "What Is a Favicon and How to Do It Right",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Фавікон: що це, розміри і як зробити",
    ru: "Фавикон: что это, размеры и как сделать",
    en: "What Is a Favicon: Sizes, Formats, Setup",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Фавікон — іконка сайту у вкладці та в мобільній видачі Google. ✔️ Розміри 16–512 px ✔️ apple-touch-icon і маніфест ➡ як зробити правильно",
    ru: "➤ Фавикон — иконка сайта во вкладке и в мобильной выдаче Google. ✔️ Размеры 16–512 px ✔️ apple-touch-icon и манифест ➡ как сделать правильно",
    en: "➤ A favicon is your site icon in browser tabs and Google mobile results. ✔️ Sizes 16–512 px ✔️ apple-touch-icon and manifest ➡ how to do it right",
  },
  eyebrow: { _type: "localizedString", uk: "Словник", ru: "Словарь", en: "Glossary" },
  lede: {
    _type: "localizedString",
    uk: "Що таке фавікон, які розміри і формати потрібні у 2026 році, як зробити іконку з логотипа і чому вона впливає на клікабельність у мобільній видачі Google.",
    ru: "Что такое фавикон, какие размеры и форматы нужны в 2026 году, как сделать иконку из логотипа и почему она влияет на кликабельность в мобильной выдаче Google.",
    en: "What a favicon is, which sizes and formats you need in 2026, how to build one from your logo, and why it affects click-through rate in Google mobile results.",
  },
  tags: ["фавікон", "favicon", "веб-дизайн", "словник"],
  relatedPostSlugs: ["trendy-veb-dyzainu-2026", "shcho-take-domen", "temna-chy-svitla-tema-saitu"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи впливає фавікон на SEO?",
        ru: "Влияет ли фавикон на SEO?",
        en: "Does a favicon affect SEO?",
      },
      answer: {
        _type: "localizedText",
        uk: "Фавікон не є фактором ранжування — сторінка не підніметься у видачі через гарну іконку. Але в мобільному пошуку Google показує його поруч із заголовком, тому він впливає на клікабельність сніпета. А CTR уже опосередковано працює на позиції.",
        ru: "Фавикон не фактор ранжирования — страница не поднимется в выдаче из-за красивой иконки. Но в мобильном поиске Google показывает её рядом с заголовком, поэтому она влияет на кликабельность сниппета. А CTR уже косвенно работает на позиции.",
        en: "A favicon is not a ranking factor — no page moves up because of a nice icon. But Google shows it beside your title in mobile results, so it affects snippet click-through rate, and CTR feeds back into performance indirectly.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Який розмір фавікона потрібен для Google?",
        ru: "Какой размер фавикона нужен для Google?",
        en: "What favicon size does Google need?",
      },
      answer: {
        _type: "localizedText",
        uk: "Google вимагає квадратну іконку зі стороною, кратною 48 пікселям: 48×48, 96×96, 144×144 і більше. Файл має бути доступний за постійною адресою в корені сайту й не закритий у robots.txt. Практичний варіант — тримати в корені favicon.ico разом із PNG на 192 пікселі.",
        ru: "Google требует квадратную иконку со стороной, кратной 48 пикселям: 48×48, 96×96, 144×144 и больше. Файл должен быть доступен по постоянному адресу в корне сайта и не закрыт в robots.txt. Практичный вариант — держать в корне favicon.ico вместе с PNG на 192 пикселя.",
        en: "Google asks for a square icon whose side is a multiple of 48 pixels: 48×48, 96×96, 144×144 and up. The file must sit at a stable URL in the site root and must not be blocked in robots.txt. In practice, keep favicon.ico in the root alongside a 192 px PNG.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чому фавікон не оновлюється після заміни?",
        ru: "Почему фавикон не обновляется после замены?",
        en: "Why does my favicon not update after I replace it?",
      },
      answer: {
        _type: "localizedText",
        uk: "Браузери кешують фавікони агресивніше за будь-які інші зображення — стара іконка може висіти тижнями. Перевіряйте в режимі інкогніто або з очищеним кешем. У видачі Google оновлення зʼявляється після наступного обходу сторінки краулером, це від кількох днів до кількох тижнів.",
        ru: "Браузеры кешируют фавиконы агрессивнее любых других изображений — старая иконка может висеть неделями. Проверяйте в режиме инкогнито или с очищенным кешем. В выдаче Google обновление появляется после следующего обхода страницы краулером: от нескольких дней до нескольких недель.",
        en: "Browsers cache favicons harder than any other image, so the old one can linger for weeks. Check in a private window or with the cache cleared. In Google results the change appears after the crawler revisits the page — anywhere from a few days to a few weeks.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен фавікон, якщо у мене односторінковий лендінг?",
        ru: "Нужен ли фавикон, если у меня одностраничный лендинг?",
        en: "Do I need a favicon for a one-page landing site?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, і навіть більше: у лендінга зазвичай один шанс на візит, а сірий глобус у вкладці читається як «сайт зроблений абияк». Набір іконок для односторінковика займає стільки ж часу, скільки для великого сайту, і входить у вартість розробки.",
        ru: "Да, и даже в большей степени: у лендинга обычно один шанс на визит, а серый глобус во вкладке читается как «сайт сделан наспех». Набор иконок для одностраничника занимает столько же времени, сколько для большого сайта, и входит в стоимость разработки.",
        en: "Yes, arguably more so: a landing page usually gets one shot per visit, and a default grey globe in the tab reads as a site put together in a hurry. The icon set takes the same amount of work as for a large site and is included in the build.",
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
