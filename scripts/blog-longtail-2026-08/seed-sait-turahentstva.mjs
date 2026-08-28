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

// ---------------------------------------------------------------- UK BODY

const bodyUk = [
  tldr("Коротко", [
    "Сайт для турагентства — це каталог турів із фільтрами (країна, бюджет, дати), блок гарячих пропозицій і проста форма заявки.",
    "Ціни: лендінг агентства — від $800, сайт із каталогом турів — від $3 500, портал туроператора — від $6 000.",
    "Для більшості агентств заявка з дзвінком менеджера працює краще, ніж повне онлайн-бронювання з оплатою.",
    "Довіру продають відгуки туристів, фотозвіти з турів і живий Telegram/Viber-канал — а не стокові пальми.",
    "Сторінки напрямків («тури до Єгипту», «тури до Туреччини») — головне джерело безкоштовного трафіку з Google.",
  ]),
  p("Сайт для турагентства — це вітрина турів і канал заявок одночасно: каталог із фільтрами за країною, бюджетом і датами, блок гарячих пропозицій, форми заявки в один крок і соціальні докази — відгуки та фотозвіти туристів. Лендінг агентства коштує **від $800**, сайт із каталогом турів — **від $3 500**, портал туроператора з інтеграціями — **від $6 000**."),
  p("Туризм — ніша, де клієнт платить сотні або тисячі доларів наперед за послугу, яку не можна помацати. Тому сайт агентства виконує дві роботи: показує актуальні тури так, щоб їх було легко знайти, і знімає страх «а раптом кинуть». Якщо сайт робить лише одну з цих двох речей — заявки підуть конкурентам."),
  p("У цій статті розберемо, з чого складається робочий сайт турагентства і туроператора: каталог, інтеграції, заявки проти онлайн-оплати, воронка в месенджерах, SEO за напрямками — і скільки все це коштує на реальних цінах студії."),

  h2("Які завдання вирішує сайт турагентства"),
  p("Перед тим як малювати дизайн, варто чесно відповісти: звідки приходять клієнти і що вони мають зробити на сайті. Для агентства типовий шлях такий: людина бачить рекламу чи пост у соцмережах → відкриває сайт → дивиться тури і ціни → лишає заявку або пише в месенджер. Сайт у цій схемі відповідає за три речі:"),
  li("**Показати асортимент.** Каталог напрямків і турів з актуальними цінами — щоб людина зрозуміла, що ви реально працюєте і у вас є з чого обрати."),
  li("**Зловити заявку.** Форма з мінімумом полів, кнопки Telegram/Viber, телефон клікабельний з мобільного. 80–90% трафіку в туризмі — смартфони."),
  li("**Зняти недовіру.** Відгуки з іменами й фото, фотозвіти з турів, документи туроператора, роки на ринку — усе, що відрізняє вас від шахрайської сторінки в Instagram."),
  p("Невеликому агентству з 2–3 менеджерами для цього часто вистачає [лендінгу](/landing) з добіркою гарячих турів. Агентству з потоком і кількома напрямками потрібен повноцінний [корпоративний сайт](/corporate-site) із каталогом і сторінками напрямків."),

  h2("Каталог турів: фільтри за країною, бюджетом і датами"),
  p("Каталог — серце сайту. Турист майже ніколи не шукає «будь-який тур»: він шукає «Єгипет у жовтні до $900 на двох». Якщо каталог не вміє відповісти на такий запит за три кліки — людина повертається в Google."),
  h3("Мінімальний набір фільтрів"),
  li("**Країна / напрямок** — основний фільтр, з нього починають майже всі."),
  li("**Бюджет** — діапазон «до $700 / $700–1200 / понад $1200» працює краще, ніж поле для вводу."),
  li("**Дати або місяць виїзду** — у туризмі сезон вирішує все."),
  li("Додатково: тип відпочинку (пляжний, екскурсійний, гірськолижний), харчування, кількість зірок готелю."),
  h3("Картка туру"),
  p("У картці туру мають бути ціна «від» з датою актуальності, готель і кількість зірок, харчування, виліт (місто й дата), і головне — помітна кнопка «Дізнатися ціну» чи «Залишити заявку». Фото — реальні з готелю, а не стокові: турист усе одно перевірить готель на booking-сайтах, і розбіжність вб'є довіру."),
  h3("Гарячі тури й актуальність цін"),
  p("Блок «гарячі тури» на головній — найклікабельніша зона сайту агентства. Але він працює, лише поки ціни живі: пропозиція двотижневої давнини з неактуальною ціною шкодить більше, ніж порожній блок. Тому ще на етапі проєктування вирішіть, хто і як оновлює ціни: менеджер через адмінку (ми даємо просту панель, де тур додається за 2–3 хвилини) або автоматичне підтягування з систем туроператорів."),

  h2("Інтеграції з туроператорами й пошуком турів"),
  p("Агентства працюють поверх баз туроператорів, тому логічне питання: чи можна показувати їхні тури на своєму сайті автоматично? Можна, є три рівні:"),
  num("**Ручне наповнення через адмінку.** Менеджер додає 20–40 актуальних турів на тиждень. Безкоштовно в підтримці, повний контроль над подачею — для старту цього достатньо."),
  num("**Віджет пошуку турів.** Готовий модуль підбору від агрегатора вбудовується на сайт. Швидко й дешево (типова інтеграція — **$200–500**), але дизайн віджета чужий і турист іде в чужу воронку."),
  num("**API-інтеграція з операторськими системами.** Тури, ціни й наявність підтягуються у ваш власний каталог у вашому дизайні. Це рівень порталу: складні інтеграції коштують **$1 000–3 000** і мають сенс, коли заявок уже десятки на тиждень."),
  p("Практична порада: не починайте з API. Спочатку ручний каталог і заявки, потім віджет, і лише коли впираєтеся в обсяг — повна інтеграція. Так ви не платите за складність, яка ще не окупається."),

  cta(
    "Скільки коштуватиме сайт для вашого агентства?",
    "Відповідайте на 8 простих питань — калькулятор порахує вилку ціни під ваші задачі: лендінг, каталог турів чи портал з інтеграціями.",
    "Порахувати вартість",
    "/calculator"
  ),

  h2("Заявка чи онлайн-бронювання з оплатою"),
  p("Найчастіша дилема власника: робити повне онлайн-бронювання з оплатою карткою чи обмежитися заявкою, яку обробляє менеджер. Для 90% агентств правильна відповідь — заявка. Ціни на тури змінюються щодня, наявність місць треба підтверджувати в оператора, а середній чек $800–2000 люди не готові платити без розмови з живою людиною."),
  table(
    ["Критерій", "Заявка + менеджер", "Онлайн-бронювання з оплатою"],
    [
      ["Вартість реалізації", "Входить у базовий сайт", "+$1 000–3 000 (оплата, статуси, синхронізація цін)"],
      ["Актуальність цін", "Менеджер підтверджує голосом", "Потрібна жива інтеграція з оператором"],
      ["Конверсія на чеку $800+", "Вища: людям треба поговорити", "Нижча: страх платити наперед незнайомцям"],
      ["Навантаження на менеджерів", "Кожна заявка — дзвінок", "Менше рутини, більше автоматики"],
      ["Кому підходить", "Агентствам, 90% випадків", "Туроператорам і порталам з потоком"],
    ]
  ),
  p("Гібрид, який ми найчастіше рекомендуємо: заявка як основний сценарій плюс онлайн-передоплата за посиланням, яке менеджер надсилає після підтвердження туру. Так ви фіксуєте клієнта грошима, не будуючи дорогу систему бронювання."),

  h2("Довіра: відгуки, фотозвіти й воронка в месенджерах"),
  p("У туризмі недовіра — головне заперечення. Знімають його не слова «надійність і якість», а докази:"),
  li("**Відгуки туристів** з іменем, фото і напрямком туру. Скріншоти переписок із подякою працюють краще за анонімний текст."),
  li("**Фотозвіти з турів** — альбоми реальних груп. Це контент, якого немає в конкурентів, бо його не можна скопіювати."),
  li("**Документи:** договір, дані про туроператорів-партнерів, реквізити ФОП/ТОВ у футері."),
  li("**Живі соцмережі:** якщо останній пост — торік, для туриста агентство «мертве»."),
  h3("Telegram і Viber як продовження сайту"),
  p("Значна частина угод у туризмі закривається в месенджерах. Тому сайт має вести туди свідомо: кнопка «Написати в Telegram» поруч із кожним туром, канал з гарячими пропозиціями, куди людина підписується «на майбутнє», навіть якщо зараз не готова купити. Заявка з сайту теж має падати менеджеру в месенджер миттєво — швидкість першої відповіді в гарячий сезон вирішує, у кого купить турист."),

  h2("SEO для турагентства: сезонність і сторінки напрямків"),
  p("Реклама в туризмі дорога й вигорає щосезону, тому сайт має приносити безкоштовний трафік із пошуку. Основний інструмент — окремі сторінки під напрямки: «тури до Єгипту», «тури до Туреччини», «гірськолижні тури». Кожна така сторінка відповідає на конкретний запит, має власний заголовок, добірку турів, ціни «від» і FAQ про напрямок."),
  p("Сезонність — ваша перевага, якщо готуватися заздалегідь: сторінка «гарячі тури на літо» має бути готова й проіндексована у березні, а не в червні, коли всі вже купили. Плюс базова технічна гігієна: швидкість на мобільному, теґи, мікророзмітка турів. Детальніше про підхід — на сторінці [SEO-просування](/seo): для турагентств ми ведемо його від **$300/міс** з фокусом на сторінки напрямків."),
  p("До речі, та сама логіка «сторінка під запит» працює і в суміжних нішах — як ми розбирали в статті про [сайт для готелю з бронюванням](/blog/sait-dlia-hotelyu-z-bronyuvannyam)."),

  h2("Скільки коштує сайт для турагентства у 2026"),
  p("Вилка залежить від того, що будуємо: посадкову сторінку під рекламу, сайт із каталогом чи портал з інтеграціями. Ціни студії Code-Site.Art:"),
  table(
    ["Формат", "Що входить", "Ціна", "Термін"],
    [
      ["Лендінг агентства", "Гарячі тури, форма заявки, відгуки, месенджери, під рекламу", "від $800", "2–3 тижні"],
      ["Сайт із каталогом турів", "Каталог із фільтрами, сторінки напрямків, адмінка, блог, SEO-база", "від $3 500", "4–7 тижнів"],
      ["Портал туроператора", "API-інтеграції, кабінет, онлайн-оплата, автооновлення цін", "від $6 000", "від 8 тижнів"],
    ]
  ),
  p("Після запуску сайт треба підтримувати: оновлення, дрібні правки, моніторинг. У нас це **$200/міс** або **$40/год** разово. Типова інтеграція (CRM, платіжка, віджет) — **$200–500**."),

  h2("Кейс: Rich Tour — сайт туристичної компанії"),
  p("Приклад із нашого портфоліо — [Rich Tour](/portfolio/rich-tour), сайт туристичної компанії. Завдання було типове для ніші: показати напрямки й тури так, щоб людина з реклами за один екран розуміла, куди потрапила, і легко лишала заявку з телефона."),
  p("Що ми зробили і чому:"),
  li("**Головна від гарячих пропозицій.** Перший екран — не абстрактний слоган, а актуальні тури з цінами: людина одразу бачить товар."),
  li("**Структура за напрямками.** Кожен напрямок — окрема сторінка зі своєю добіркою і текстом під пошукові запити, а не один нескінченний список."),
  li("**Заявка в один крок.** Ім'я і телефон — усе. Кожне додаткове поле у формі — мінус частина заявок."),
  li("**Месенджери поруч із турами.** Кнопка написати менеджеру там, де виникає питання, а не лише у футері."),
  li("**Швидкість на мобільному.** Легкі зображення й швидкий рендер: туристи гортають тури з телефона ввечері, повільний сайт закривають."),
  p("Головний висновок із кейсу: сайт агентства продає не «красою», а актуальністю і зручністю заявки. Дизайн лише допомагає не заважати."),

  cta(
    "Хочете сайт, який приносить заявки на тури?",
    "Розкажіть про своє агентство — покажемо релевантні кейси, порадимо формат (лендінг чи каталог) і назвемо чесну ціну з термінами.",
    "Обговорити проєкт",
    "/calculator"
  ),
];

// ---------------------------------------------------------------- RU BODY

const bodyRu = [
  tldr("Коротко", [
    "Создание сайта турагентства — это каталог туров с фильтрами (страна, бюджет, даты), блок горящих предложений и простая форма заявки.",
    "Цены: лендинг агентства — от $800, сайт с каталогом туров — от $3 500, портал туроператора — от $6 000.",
    "Большинству агентств заявка со звонком менеджера даёт больше продаж, чем полное онлайн-бронирование с оплатой.",
    "Доверие продают отзывы туристов, фотоотчёты из туров и живой Telegram/Viber-канал, а не стоковые пальмы.",
    "Страницы направлений («туры в Египет», «туры в Турцию») — главный источник бесплатного трафика из Google.",
  ]),
  p("Разработка сайтов для туристических агентств сводится к одной формуле: витрина туров плюс канал заявок. На практике это каталог с фильтрами по стране, бюджету и датам, блок горящих туров, форма заявки в один шаг и социальные доказательства — отзывы и фотоотчёты туристов. Лендинг агентства стоит **от $800**, сайт с каталогом туров — **от $3 500**, портал туроператора с интеграциями — **от $6 000**."),
  p("Туризм — ниша, где клиент платит сотни или тысячи долларов вперёд за то, что нельзя потрогать. Поэтому сайт делает две работы сразу: показывает актуальные туры так, чтобы их было легко найти, и снимает страх «а вдруг обманут». Сайт, который делает только одно из двух, отдаёт заявки конкурентам."),
  p("Разберём, из чего состоит рабочий сайт турагентства и туроператора: каталог, интеграции с операторскими системами, заявка против онлайн-оплаты, воронка в мессенджерах, SEO по направлениям — и сколько стоит создание туристического сайта на реальных ценах студии."),

  h2("Какие задачи решает сайт турагентства"),
  p("Прежде чем рисовать дизайн, честно ответьте: откуда приходят клиенты и что они должны сделать на сайте. Типичный путь туриста: увидел рекламу или пост в соцсетях → открыл сайт → посмотрел туры и цены → оставил заявку или написал в мессенджер. Сайт в этой цепочке отвечает за три вещи:"),
  li("**Показать ассортимент.** Каталог направлений и туров с живыми ценами — чтобы человек понял, что вы реально работаете и есть из чего выбрать."),
  li("**Поймать заявку.** Форма с минимумом полей, кнопки Telegram/Viber, кликабельный телефон. 80–90% трафика в туризме — смартфоны."),
  li("**Снять недоверие.** Отзывы с именами и фото, фотоотчёты из туров, документы, годы на рынке — всё, что отличает вас от мошеннической страницы в Instagram."),
  p("Небольшой турфирме с двумя-тремя менеджерами часто хватает [лендинга](/ru/landing) с подборкой горящих туров. Агентству с потоком и несколькими направлениями нужен полноценный [корпоративный сайт](/ru/corporate-site) с каталогом и страницами направлений — это и есть создание сайта туристической компании в полном смысле."),

  h2("Каталог туров: фильтры по стране, бюджету и датам"),
  p("Каталог — сердце сайта. Турист почти никогда не ищет «какой-нибудь тур»: он ищет «Египет в октябре до $900 на двоих». Если каталог не отвечает на такой запрос за три клика — человек возвращается в Google."),
  h3("Минимальный набор фильтров"),
  li("**Страна / направление** — основной фильтр, с него начинают почти все."),
  li("**Бюджет** — диапазоны «до $700 / $700–1200 / больше $1200» работают лучше, чем поле для ввода."),
  li("**Даты или месяц вылета** — в туризме сезон решает всё."),
  li("Дополнительно: тип отдыха (пляжный, экскурсионный, горнолыжный), питание, звёздность отеля."),
  h3("Карточка тура"),
  p("В карточке тура должны быть цена «от» с датой актуальности, отель и звёздность, питание, вылет (город и дата) и заметная кнопка «Узнать цену» или «Оставить заявку». Фото — реальные из отеля, не стоковые: турист всё равно проверит отель на сайтах бронирования, и расхождение убьёт доверие."),
  h3("Горящие туры и актуальность цен"),
  p("Блок «горящие туры» на главной — самая кликабельная зона сайта агентства. Но он работает, только пока цены живые: предложение двухнедельной давности с неактуальной ценой вредит сильнее, чем пустой блок. Поэтому ещё на этапе проектирования решите, кто и как обновляет цены: менеджер через админку (мы делаем панель, где тур добавляется за 2–3 минуты) или автоматическая подгрузка из операторских систем."),

  h2("Интеграции с туроператорами и поиском туров"),
  p("Агентства работают поверх баз туроператоров, поэтому логичный вопрос: можно ли показывать их туры на своём сайте автоматически? Можно, есть три уровня:"),
  num("**Ручное наполнение через админку.** Менеджер добавляет 20–40 актуальных туров в неделю. Бесплатно в поддержке, полный контроль над подачей — для старта достаточно."),
  num("**Виджет поиска туров.** Готовый модуль подбора от агрегатора встраивается на сайт. Быстро и недорого (типовая интеграция — **$200–500**), но дизайн виджета чужой, и турист уходит в чужую воронку."),
  num("**API-интеграция с операторскими системами.** Туры, цены и наличие подтягиваются в ваш собственный каталог в вашем дизайне. Это уровень портала: сложные интеграции стоят **$1 000–3 000** и имеют смысл, когда заявок уже десятки в неделю."),
  p("Практический совет: не начинайте с API. Сначала ручной каталог и заявки, потом виджет, и только упёршись в объём — полная интеграция. Так вы не платите за сложность, которая ещё не окупается."),

  cta(
    "Сколько будет стоить сайт для вашего агентства?",
    "Ответьте на 8 простых вопросов — калькулятор посчитает вилку цены под ваши задачи: лендинг, каталог туров или портал с интеграциями.",
    "Посчитать стоимость",
    "/ru/calculator"
  ),

  h2("Заявка или онлайн-бронирование с оплатой"),
  p("Самая частая дилемма владельца, который хочет заказать сайт для турагентства: делать полное онлайн-бронирование с оплатой картой или ограничиться заявкой, которую обрабатывает менеджер. Для 90% агентств правильный ответ — заявка. Цены на туры меняются ежедневно, наличие мест нужно подтверждать у оператора, а средний чек $800–2000 люди не готовы платить без разговора с живым человеком."),
  table(
    ["Критерий", "Заявка + менеджер", "Онлайн-бронирование с оплатой"],
    [
      ["Стоимость реализации", "Входит в базовый сайт", "+$1 000–3 000 (оплата, статусы, синхронизация цен)"],
      ["Актуальность цен", "Менеджер подтверждает голосом", "Нужна живая интеграция с оператором"],
      ["Конверсия на чеке $800+", "Выше: людям нужно поговорить", "Ниже: страх платить вперёд незнакомцам"],
      ["Нагрузка на менеджеров", "Каждая заявка — звонок", "Меньше рутины, больше автоматики"],
      ["Кому подходит", "Агентствам, 90% случаев", "Туроператорам и порталам с потоком"],
    ]
  ),
  p("Гибрид, который мы чаще всего рекомендуем: заявка как основной сценарий плюс онлайн-предоплата по ссылке, которую менеджер отправляет после подтверждения тура. Так вы фиксируете клиента деньгами, не строя дорогую систему бронирования."),

  h2("Доверие: отзывы, фотоотчёты и воронка в мессенджерах"),
  p("В туризме недоверие — главное возражение. Снимают его не слова «надёжность и качество», а доказательства:"),
  li("**Отзывы туристов** с именем, фото и направлением тура. Скриншоты переписок с благодарностью работают лучше анонимного текста."),
  li("**Фотоотчёты из туров** — альбомы реальных групп. Это контент, которого нет у конкурентов, потому что его нельзя скопировать."),
  li("**Документы:** договор, данные туроператоров-партнёров, реквизиты компании в футере."),
  li("**Живые соцсети:** если последний пост — в прошлом году, для туриста агентство «мёртвое»."),
  h3("Telegram и Viber как продолжение сайта"),
  p("Заметная часть сделок в туризме закрывается в мессенджерах. Поэтому сайт должен вести туда осознанно: кнопка «Написать в Telegram» рядом с каждым туром, канал с горящими предложениями, на который человек подписывается «на будущее», даже если сейчас не готов купить. Заявка с сайта тоже должна мгновенно падать менеджеру в мессенджер — скорость первого ответа в горячий сезон решает, у кого купит турист."),

  h2("SEO для турагентства: сезонность и страницы направлений"),
  p("Реклама в туризме дорогая и выгорает каждый сезон, поэтому сайт должен приносить бесплатный трафик из поиска. Главный инструмент — отдельные страницы под направления: «туры в Египет», «туры в Турцию», «горнолыжные туры». Каждая такая страница отвечает на конкретный запрос: свой заголовок, подборка туров, цены «от» и FAQ по направлению. Именно так создание сайта для туристической фирмы окупается без рекламного бюджета."),
  p("Сезонность — ваше преимущество, если готовиться заранее: страница «горящие туры на лето» должна быть готова и проиндексирована в марте, а не в июне, когда все уже купили. Плюс базовая техническая гигиена: скорость на мобильном, теги, микроразметка туров. Подробнее о подходе — на странице [SEO-продвижения](/ru/seo): для турагентств мы ведём его от **$300/мес** с фокусом на страницы направлений."),
  p("Та же логика «страница под запрос» работает и в смежных нишах — мы разбирали её в статье про [сайт отеля с бронированием](/ru/blog/sayt-otelya-s-bronirovaniem)."),

  h2("Сколько стоит сайт для турагентства в 2026"),
  p("Вилка зависит от того, что строим: посадочную страницу под рекламу, сайт с каталогом или портал с интеграциями. Создание сайта турагентства в студии Code-Site.Art стоит так:"),
  table(
    ["Формат", "Что входит", "Цена", "Срок"],
    [
      ["Лендинг агентства", "Горящие туры, форма заявки, отзывы, мессенджеры, под рекламу", "от $800", "2–3 недели"],
      ["Сайт с каталогом туров", "Каталог с фильтрами, страницы направлений, админка, блог, SEO-база", "от $3 500", "4–7 недель"],
      ["Портал туроператора", "API-интеграции, кабинет, онлайн-оплата, автообновление цен", "от $6 000", "от 8 недель"],
    ]
  ),
  p("После запуска сайт нужно поддерживать: обновления, мелкие правки, мониторинг. У нас это **$200/мес** или **$40/час** разово. Типовая интеграция (CRM, платёжка, виджет) — **$200–500**."),

  h2("Кейс: Rich Tour — сайт туристической компании"),
  p("Пример из нашего портфолио — [Rich Tour](/ru/portfolio/rich-tour), сайт туристической компании. Задача была типовой для ниши: показать направления и туры так, чтобы человек с рекламы за один экран понимал, куда попал, и легко оставлял заявку с телефона."),
  p("Что мы сделали и почему:"),
  li("**Главная начинается с горящих предложений.** Первый экран — не абстрактный слоган, а актуальные туры с ценами: человек сразу видит товар."),
  li("**Структура по направлениям.** Каждое направление — отдельная страница со своей подборкой и текстом под поисковые запросы, а не один бесконечный список."),
  li("**Заявка в один шаг.** Имя и телефон — всё. Каждое лишнее поле в форме — минус часть заявок."),
  li("**Мессенджеры рядом с турами.** Кнопка «написать менеджеру» там, где возникает вопрос, а не только в футере."),
  li("**Скорость на мобильном.** Лёгкие изображения и быстрый рендер: туристы листают туры с телефона вечером, медленный сайт закрывают."),
  p("Главный вывод из кейса: сайт агентства продаёт не «красотой», а актуальностью и удобством заявки. Дизайн лишь помогает не мешать."),

  cta(
    "Хотите сайт, который приносит заявки на туры?",
    "Расскажите о своём агентстве — покажем релевантные кейсы, посоветуем формат (лендинг или каталог) и назовём честную цену со сроками.",
    "Обсудить проект",
    "/ru/calculator"
  ),
];

// ---------------------------------------------------------------- EN BODY

const bodyEn = [
  tldr("TL;DR", [
    "A travel agency website is a tour catalogue with filters (destination, budget, dates), a hot-deals block, and a one-step enquiry form.",
    "Pricing: agency landing page from $800, website with a tour catalogue from $3,500, tour operator portal from $6,000.",
    "For most agencies an enquiry handled by a manager converts better than full online booking with upfront payment.",
    "Trust is built by named traveller reviews, photo reports from real trips, and a live Telegram/WhatsApp channel — not stock palm trees.",
    "Destination pages (“tours to Egypt”, “ski holidays”) are the main source of free organic traffic.",
  ]),
  p("Travel agency website design comes down to one formula: a tour shop window plus an enquiry channel. In practice that means a catalogue with filters by destination, budget and dates, a hot-deals block, a one-step enquiry form, and social proof — traveller reviews and trip photo reports. An agency landing page costs **from $800**, a website with a tour catalogue **from $3,500**, and a tour operator website with live integrations **from $6,000**."),
  p("Travel is a niche where customers pay hundreds or thousands of dollars upfront for something they cannot touch. So the website has two jobs at once: show current tours in a way that makes them easy to find, and remove the fear of being scammed. A site that does only one of the two hands its enquiries to competitors."),
  p("Below we break down what a working travel agency or tour operator website consists of — catalogue, operator integrations, enquiry versus online payment, messenger funnel, destination SEO — and what it costs, using our studio's real price list. We are a web studio from Ukraine working with international clients: European quality, sensible rates."),

  h2("What a travel agency website actually has to do"),
  p("Before any design work, answer honestly: where do clients come from and what should they do on the site? The typical journey: a person sees an ad or a social post → opens the website → checks tours and prices → leaves an enquiry or messages the agency. In that chain the website is responsible for three things:"),
  li("**Show the range.** A catalogue of destinations and tours with live prices — proof that you are a real, active business with options to choose from."),
  li("**Capture the enquiry.** A form with minimal fields, messenger buttons, a tap-to-call phone number. 80–90% of travel traffic is mobile."),
  li("**Remove distrust.** Reviews with names and photos, trip photo albums, company details and licences — everything that separates you from a scam page on Instagram."),
  p("A small agency with two or three consultants often only needs a [landing page](/en/landing) with a curated set of hot deals. An agency with steady volume and several destinations needs a full [corporate website](/en/corporate-site) with a catalogue and destination pages."),

  h2("The tour catalogue: filters by destination, budget and dates"),
  p("The catalogue is the heart of the site. A traveller almost never looks for “any holiday” — they look for “Egypt in October under $900 for two”. If the catalogue cannot answer that query in three clicks, the visitor goes back to Google."),
  h3("The minimum filter set"),
  li("**Destination / country** — the primary filter; nearly everyone starts here."),
  li("**Budget** — ranges like “under $700 / $700–1,200 / over $1,200” outperform a free-input field."),
  li("**Dates or departure month** — in travel, seasonality decides everything."),
  li("Optional: holiday type (beach, city break, ski), board basis, hotel star rating."),
  h3("The tour card"),
  p("Each tour card needs a “from” price with a validity date, hotel name and star rating, board basis, departure details, and a prominent “Get a quote” button. Use real hotel photos, not stock: travellers will cross-check the hotel on booking sites anyway, and a mismatch kills trust instantly."),
  h3("Hot deals and price freshness"),
  p("The hot-deals block on the homepage is the most clicked zone of any agency site. But it only works while prices are alive: a two-week-old offer with a stale price does more damage than an empty block. Decide at the design stage who updates prices and how — a manager via the admin panel (ours lets you add a tour in 2–3 minutes) or automatic feeds from operator systems."),

  h2("Integrations with tour operators and search engines"),
  p("Agencies sell on top of tour operators' inventories, so the natural question is: can their tours appear on your site automatically? Yes — at three levels:"),
  num("**Manual content via the admin panel.** A manager adds 20–40 current tours a week. Free to run, full control over presentation — enough for a launch."),
  num("**A tour search widget.** A ready-made module from an aggregator embedded into your site. Fast and cheap (a typical integration is **$200–500**), but the widget's design is not yours and the traveller leaves into someone else's funnel."),
  num("**API integration with operator systems.** Tours, prices and availability flow into your own catalogue in your own design. That is portal territory: complex integrations cost **$1,000–3,000** and pay off once you handle dozens of enquiries weekly."),
  p("Practical advice: do not start with the API. Manual catalogue and enquiries first, then a widget, and only when volume demands it — full integration. That way you never pay for complexity that is not yet earning."),

  cta(
    "How much would a website cost for your agency?",
    "Answer 8 simple questions — the calculator estimates a price range for your case: landing page, tour catalogue or a portal with integrations.",
    "Get an estimate",
    "/en/calculator"
  ),

  h2("Enquiry form vs online booking with payment"),
  p("The most common dilemma: build full online booking with card payment, or keep a simple enquiry handled by a manager? For 90% of agencies the right answer is the enquiry. Tour prices change daily, availability has to be confirmed with the operator, and travellers rarely pay an $800–2,000 bill without talking to a human first."),
  table(
    ["Criterion", "Enquiry + manager", "Online booking with payment"],
    [
      ["Build cost", "Included in the base website", "+$1,000–3,000 (payments, statuses, price sync)"],
      ["Price freshness", "Manager confirms by phone", "Requires a live operator integration"],
      ["Conversion at $800+ tickets", "Higher: people want to talk", "Lower: fear of paying strangers upfront"],
      ["Manager workload", "Every enquiry is a call", "Less routine, more automation"],
      ["Best for", "Agencies — 90% of cases", "Tour operators and high-volume portals"],
    ]
  ),
  p("The hybrid we recommend most often: enquiry as the main flow, plus an online deposit link the manager sends once the tour is confirmed. You lock the client in with money without building an expensive booking engine."),

  h2("Trust: reviews, photo reports and the messenger funnel"),
  p("In travel, distrust is objection number one. It is removed by evidence, not by the words “reliable and professional”:"),
  li("**Traveller reviews** with a name, photo and destination. Screenshots of thank-you messages beat anonymous text."),
  li("**Trip photo reports** — albums of real groups. Content competitors cannot copy."),
  li("**Documents:** contract template, partner operators, full company details in the footer."),
  li("**Live social accounts:** if the last post is from last year, the agency looks dead to a traveller."),
  h3("Telegram and WhatsApp as an extension of the site"),
  p("A large share of travel deals closes in messengers. The site should feed them deliberately: a “Message us” button next to every tour, and a hot-deals channel people subscribe to “for later” even when they are not ready to buy today. Enquiries from the site should land in the manager's messenger instantly — in high season, first-response speed decides who gets the sale."),

  h2("SEO for travel agencies: seasonality and destination pages"),
  p("Paid ads in travel are expensive and burn out every season, so the site must earn free search traffic. The main tool is dedicated destination pages: “tours to Egypt”, “Turkey holidays”, “ski packages”. Each page answers one specific query with its own headline, tour selection, “from” prices and a destination FAQ."),
  p("Seasonality is your advantage if you prepare early: the “summer hot deals” page must be live and indexed in March, not in June when everyone has already booked. Add the technical basics — mobile speed, meta tags, structured data for tours. We cover this on our [SEO service page](/en/seo): for travel agencies we run it from **$300/month**, focused on destination pages."),
  p("The same page-per-query logic works in neighbouring niches too — we covered it in our guide to a [hotel website with booking](/en/blog/hotel-website-with-booking)."),

  h2("What a travel agency website costs in 2026"),
  p("The range depends on what we build: an ad landing page, a catalogue website, or a portal with integrations. Code-Site.Art studio pricing:"),
  table(
    ["Format", "What's included", "Price", "Timeline"],
    [
      ["Agency landing page", "Hot deals, enquiry form, reviews, messengers — built for ads", "from $800", "2–3 weeks"],
      ["Website with tour catalogue", "Filterable catalogue, destination pages, admin panel, blog, SEO base", "from $3,500", "4–7 weeks"],
      ["Tour operator portal", "API integrations, client area, online payment, auto price updates", "from $6,000", "8+ weeks"],
    ]
  ),
  p("After launch the site needs maintenance: updates, small changes, monitoring. With us that is **$200/month** or **$40/hour** ad hoc. A typical integration (CRM, payments, widget) is **$200–500**."),

  h2("Case study: Rich Tour — a travel company website"),
  p("An example from our portfolio — [Rich Tour](/en/portfolio/rich-tour), a website for a travel company. The brief was typical for the niche: present destinations and tours so that a visitor from an ad understands the offer within one screen and can leave an enquiry from a phone in seconds."),
  p("What we did and why:"),
  li("**Homepage opens with hot deals.** The first screen is not an abstract slogan but current tours with prices — the visitor sees the product immediately."),
  li("**Structure by destination.** Every destination is its own page with its own tour selection and search-targeted copy, instead of one endless list."),
  li("**One-step enquiry.** Name and phone — that's it. Every extra form field costs a share of enquiries."),
  li("**Messengers next to the tours.** The contact button sits where the question arises, not only in the footer."),
  li("**Mobile speed.** Lightweight images and fast rendering: travellers browse tours on their phones in the evening and close slow sites."),
  p("The takeaway: an agency website sells through freshness and enquiry convenience, not decoration. Design's job is to stay out of the way."),

  cta(
    "Want a website that brings tour enquiries?",
    "Tell us about your agency — we'll show relevant cases, recommend the right format (landing page or catalogue) and quote an honest price with timelines.",
    "Discuss your project",
    "/en/calculator"
  ),
];

// ---------------------------------------------------------------- DOC

const doc = {
  _id: "ltAug2026-sait-turahentstva",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 11,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-turahentstva" },
    ru: { _type: "slug", current: "sayt-turagentstva" },
    en: { _type: "slug", current: "travel-agency-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для турагентства і туроператора: тури, заявки, довіра",
    ru: "Сайт для турагентства и туроператора: туры, заявки, доверие",
    en: "Travel Agency & Tour Operator Website: Tours, Enquiries, Trust",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для турагентства: каталог турів, заявки, ціни 2026",
    ru: "Создание сайта турагентства: каталог туров, цены 2026",
    en: "Travel Agency Website Design: Tours, Bookings, Prices 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Сайт для турагентства під ключ: каталог турів із фільтрами, гарячі пропозиції, заявки. ✔️ Лендінг від $800 ✔️ Каталог від $3 500 ➡ Ціни й кейс усередині.",
    ru: "➤ Разработка сайтов для туристических агентств: каталог туров, фильтры, заявки. ✔️ Лендинг от $800 ✔️ Каталог от $3 500 ➡ Цены и реальный кейс внутри.",
    en: "➤ Travel agency website design: tour catalogue, filters, hot deals, enquiry flow. ✔️ Landing from $800 ✔️ Catalogue from $3,500 ➡ Prices & case study inside.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Туризм",
    ru: "Туризм",
    en: "Travel",
  },
  lede: {
    _type: "localizedString",
    uk: "Каталог турів із фільтрами, гарячі пропозиції, заявка проти онлайн-оплати й довіра туристів: розбираємо, яким має бути сайт турагентства і скільки він коштує у 2026.",
    ru: "Каталог туров с фильтрами, горящие предложения, заявка против онлайн-оплаты и доверие туристов: разбираем, каким должен быть сайт турагентства и сколько он стоит в 2026.",
    en: "Filterable tour catalogue, hot deals, enquiry vs online payment, and traveller trust: what a travel agency website should look like and what it costs in 2026.",
  },
  tags: ["туризм", "турагентство", "розробка сайтів", "каталог турів"],
  relatedPostSlugs: ["sait-dlia-hotelyu-z-bronyuvannyam", "vartist-rozrobky-saytu-2026", "9-dyzain-pryiomiv-dlia-konversii"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для турагентства?",
        ru: "Сколько стоит создание сайта для турагентства?",
        en: "How much does a travel agency website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг агентства з гарячими турами і формою заявки — від $800, сайт із каталогом турів, фільтрами й адмінкою — від $3 500, портал туроператора з API-інтеграціями та онлайн-оплатою — від $6 000. Підтримка після запуску — $200/міс або $40/год.",
        ru: "Лендинг агентства с горящими турами и формой заявки — от $800, сайт с каталогом туров, фильтрами и админкой — от $3 500, портал туроператора с API-интеграциями и онлайн-оплатой — от $6 000. Поддержка после запуска — $200/мес или $40/час.",
        en: "An agency landing page with hot deals and an enquiry form starts at $800, a website with a filterable tour catalogue and admin panel at $3,500, and a tour operator portal with API integrations and online payment at $6,000. Post-launch maintenance is $200/month or $40/hour.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібне турагентству онлайн-бронювання з оплатою?",
        ru: "Нужно ли турагентству онлайн-бронирование с оплатой?",
        en: "Does a travel agency need online booking with payment?",
      },
      answer: {
        _type: "localizedText",
        uk: "У 90% випадків — ні. Ціни на тури змінюються щодня, місця треба підтверджувати в оператора, а чек $800–2000 люди не платять без розмови з менеджером. Робочий гібрид: заявка з сайту плюс посилання на онлайн-передоплату після підтвердження туру.",
        ru: "В 90% случаев — нет. Цены на туры меняются ежедневно, места нужно подтверждать у оператора, а чек $800–2000 люди не платят без разговора с менеджером. Рабочий гибрид: заявка с сайта плюс ссылка на онлайн-предоплату после подтверждения тура.",
        en: "In 90% of cases — no. Tour prices change daily, availability must be confirmed with the operator, and travellers rarely pay $800–2,000 without speaking to a manager. The working hybrid: an enquiry from the site plus an online deposit link sent after the tour is confirmed.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як показувати тури туроператорів на своєму сайті?",
        ru: "Как показывать туры туроператоров на своём сайте?",
        en: "How can I show tour operators' tours on my website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Три рівні: ручне наповнення через адмінку (менеджер додає тури за 2–3 хвилини), віджет пошуку турів від агрегатора (інтеграція $200–500) або API-інтеграція з операторськими системами у вашому дизайні ($1 000–3 000). Починати варто з ручного каталогу.",
        ru: "Три уровня: ручное наполнение через админку (менеджер добавляет тур за 2–3 минуты), виджет поиска туров от агрегатора (интеграция $200–500) или API-интеграция с операторскими системами в вашем дизайне ($1 000–3 000). Начинать стоит с ручного каталога.",
        en: "Three levels: manual content via the admin panel (a tour takes 2–3 minutes to add), an embedded tour search widget from an aggregator ($200–500 to integrate), or a full API integration with operator systems in your own design ($1,000–3,000). Start with the manual catalogue.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Які фільтри потрібні в каталозі турів?",
        ru: "Какие фильтры нужны в каталоге туров?",
        en: "Which filters does a tour catalogue need?",
      },
      answer: {
        _type: "localizedText",
        uk: "Мінімум три: країна/напрямок, бюджет (діапазонами) і дати або місяць виїзду. Додатково — тип відпочинку, харчування і зірковість готелю. Турист має знайти «Єгипет у жовтні до $900» за три кліки, інакше він повернеться в Google.",
        ru: "Минимум три: страна/направление, бюджет (диапазонами) и даты или месяц вылета. Дополнительно — тип отдыха, питание и звёздность отеля. Турист должен найти «Египет в октябре до $900» за три клика, иначе он вернётся в Google.",
        en: "Three at minimum: destination, budget (as ranges) and dates or departure month. Optionally add holiday type, board basis and hotel star rating. A traveller should find “Egypt in October under $900” within three clicks — otherwise they go back to Google.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як турагентству отримувати клієнтів із Google без реклами?",
        ru: "Как турагентству получать клиентов из Google без рекламы?",
        en: "How can a travel agency get clients from Google without ads?",
      },
      answer: {
        _type: "localizedText",
        uk: "Через сторінки напрямків: окремі сторінки під запити «тури до Єгипту», «тури до Туреччини» з добіркою турів, цінами «від» і FAQ. Готуйте сезонні сторінки заздалегідь — «літо» має бути в індексі вже в березні. SEO-супровід для турагентств — від $300/міс.",
        ru: "Через страницы направлений: отдельные страницы под запросы «туры в Египет», «туры в Турцию» с подборкой туров, ценами «от» и FAQ. Готовьте сезонные страницы заранее — «лето» должно быть в индексе уже в марте. SEO-сопровождение для турагентств — от $300/мес.",
        en: "Through destination pages: dedicated pages for queries like “tours to Egypt” or “ski packages” with a tour selection, “from” prices and an FAQ. Prepare seasonal pages early — the summer page should be indexed by March. Our SEO retainer for travel agencies starts at $300/month.",
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
