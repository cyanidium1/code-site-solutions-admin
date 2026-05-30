/**
 * Translate script — adds English translations to the existing
 * `industryPage.medicine` document in Sanity. Non-destructive: uses
 * `client.patch().set()` so Ukrainian content and Studio edits remain intact.
 *
 * - For every `localizedString` / `localizedText` field, sets the matching
 *   `.en` key based on a UK→EN translation table.
 * - For rich-text bodies (reasonsBlock reasons, faqBlock items), writes the
 *   EN copy into shadow fields (`textEn`, `answerEn`) added to the admin
 *   schema in this PR.
 *
 * Required env (loaded from .env.local automatically):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET (defaults to "production")
 *   - SANITY_API_TOKEN          (write-access token, only needed for --apply)
 *
 * Run:
 *   npx tsx scripts/translate-medicine-en.ts            # dry-run (default)
 *   npx tsx scripts/translate-medicine-en.ts --apply    # commit to Sanity
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@sanity/client";

/* ──────────────────────────── env loader ──────────────────────────────── */

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

/* ──────────────────────────── translation map ─────────────────────────── */

const DOC_ID = "industryPage.medicine";

/** Top-level title + seo */
const TOP_LEVEL: Record<string, string> = {
  "title.en": "Medical practice websites",
  "seo.title.en":
    "Medical Website Development — Code-Site.Art | Sites for Clinics & Practices",
  "seo.description.en":
    "Custom-coded medical websites that book appointments 24/7. From $3,500, live in 4–10 weeks. HIPAA-aware (US), GDPR (EU). Efedra Clinic case study.",
};

/**
 * UK string → EN string. Keys are exact UK content from the seeded doc;
 * values follow the tone-of-voice rules: direct American English,
 * "you / your practice" voice, US number format ($3,500), en-dash for
 * ranges (4–10 weeks), no hype words. Healthcare terminology: physician /
 * clinic / practice / appointment booking.
 */
const STRINGS: Record<string, string> = {
  /* hero */
  "САЙТИ ДЛЯ МЕДИЧНОЇ ГАЛУЗІ / від $3 500": "MEDICAL WEBSITES / FROM $3,500",
  "Клініка, до якої\n*записуються*": "A practice patients\n*book online*",
  "пацієнтів\nна місяць": "patients\nper month",
  "Ви отримуєте сайт клініки що починає приймати онлайн-записи з першого дня. Без вашої участі більше ніж *5 годин*: ми пишемо тексти, ставимо інтеграції з Helsi/Medesk, налаштовуємо локальне SEO. Запуск за 4–6 тижнів.":
    "You get a clinic website that starts taking online appointments from day one. Your time investment: *5 hours total*. We write the copy, wire up Helsi/Medesk integrations, and set up local SEO. Live in 4–6 weeks.",
  // Drift: UK lede was edited after script was written; new version
  // adds the warranty sentence. EN mirrors the structure.
  "Кастомні сайти для стоматологій, багатопрофільних клінік і діагностичних центрів. Запуск за *4–6 тижнів*, гарантія 1 рік.":
    "Custom websites for dental practices, multi-specialty clinics, and diagnostic centers. Live in *4–6 weeks*, 1-year warranty.",
  "Онлайн-запис | за 2 кліки": "Online booking | in 2 clicks",
  "Локальне SEO | під район": "Local SEO | by neighborhood",
  "Інтеграція CRM | Bitrix · AmoCRM": "CRM integration | Bitrix · AmoCRM",
  "Юр. коректно | за вимогами МОЗ": "Compliant | HIPAA-aware (US), GDPR (EU)",
  "Обговорити мій проєкт": "Discuss my project",
  "Подивитися кейси клінік": "See clinic case studies",
  "клінік\nзапущено": "clinics\nlaunched",
  "середня\nоцінка": "average\nrating",
  "більше\nзаписів": "more\nbookings",
  "Стоматології": "Dental practices",
  "Багатопрофільні клініки": "Multi-specialty clinics",
  "Діагностичні центри": "Diagnostic centers",
  "Косметологія": "Aesthetic medicine",
  "Реабілітація": "Rehabilitation",
  "Лабораторії": "Labs",
  "Онлайн-запис": "Online booking",
  "Адаптив": "Responsive",
  "Lighthouse": "Lighthouse",
  "Сайт клініки на ноутбуці та телефоні":
    "Clinic website shown on laptop and phone",

  /* reasonsBlock */
  "ДІАГНОСТИКА": "DIAGNOSIS",
  "/ 03 ПУНКТИ": "/ 03 ITEMS",
  "3 причини, чому пацієнти\n*не записуються* з вашого сайту":
    "3 reasons patients\n*don't book* on your site",
  "аналіз 47 клінік · 2024–25": "audit of 47 clinics · 2024–25",
  "розділ 02 / 06": "section 02 / 06",
  "UX · CONVERSION": "UX · CONVERSION",
  "Немає *онлайн-запису*": "No *online booking*",
  "дзвінків поза робочим часом залишаються без відповіді":
    "of after-hours calls go unanswered",
  "GLOBAL DATA · 2024": "GLOBAL DATA · 2024",
  "TRUST · CONTENT": "TRUST · CONTENT",
  "Немає *цін* і *фото лікарів*":
    "No *pricing* or *physician photos*",
  "вища конверсія у клінік з прозорим прайсом і командою":
    "higher conversion at practices with transparent pricing and team pages",
  "BENCHMARK · 2025": "BENCHMARK · 2025",
  "SEO · LOCAL": "SEO · LOCAL",
  "Вас не видно в *Google*": "You're invisible on *Google*",
  "кліків забирають перші 5 результатів локального пошуку":
    "of clicks go to the top 5 local search results",
  "GOOGLE · 2025": "GOOGLE · 2025",
  "Виправляємо *всі три* на запуску — без вашої участі.":
    "We fix *all three* at launch — without taking your time.",
  "Перевірити мій сайт": "Audit my site",

  /* caseBlock */
  "РЕАЛЬНИЙ КЕЙС": "REAL CASE",
  "КЛІНІКА «ЕФЕДРА», ОДЕСА": "EFEDRA CLINIC, ODESA",
  "До / Після на прикладі\n*реального* клієнта":
    "Before / after from a\n*real* client",
  "До нас звернулася клініка *«Ефедра»* з Одеси — із застарілим сайтом, який не приносив заявок. Завдання було не просте: переробити структуру, дизайн і логіку під *два напрямки* бізнесу клініки — стоматологію і студію краси.":
    "*Efedra Clinic* in Odesa came to us with an outdated site that wasn't generating inquiries. The brief was tricky: rebuild the structure, design, and logic for *two business lines* under one brand — a dental practice and an aesthetic-medicine studio.",
  "4 тижні": "4 weeks",
  "від брифу до релізу": "brief to launch",
  "2 напрямки": "2 business lines",
  "стоматологія + естетика": "dental + aesthetic",
  "UA + RU": "UA + RU",
  "локалізація під SEO": "SEO localization",
  "Старий сайт клініки Ефедра": "Efedra Clinic — old site",
  "Сайт, що не продає": "A site that doesn't convert",
  "заплутана структура сайту, користувачі не розуміли куди натискати":
    "confusing structure — users didn't know where to click",
  "застарілий дизайн, який не викликав *довіри*":
    "dated design that didn't earn *trust*",
  "низька швидкість завантаження": "slow page load",
  "некоректна мультимовність (російська/українська)":
    "broken multilingual setup (Russian / Ukrainian)",
  "незручна адмінка — будь-які зміни через розробника *за гроші*":
    "clunky admin — every change required a *paid developer*",
  "сайт періодично падав": "intermittent downtime",
  "не було нормальної системи запису/бронювання":
    "no real booking system",
  "**Примітка:** російську мову залишено як основну для SEO, оскільки в Одесі значна частина пошукових запитів все ще російською мовою.":
    "**Note:** Russian was kept as the primary language for SEO — in Odesa a meaningful share of search queries are still in Russian.",
  "Новий сайт клініки Ефедра": "Efedra Clinic — new site",
  "Сайт, що приводить пацієнтів": "A site that brings in patients",
  "зрозуміла структура сайту *під користувача*":
    "clear structure built *around the user*",
  "сучасний дизайн, що підвищує довіру":
    "modern design that builds trust",
  "швидке завантаження *<1.5 c*": "fast loads *<1.5s*",
  "коректна мультимовність (RU/UA)":
    "proper multilingual setup (RU/UA)",
  "зручна адмінка *без розробника*":
    "easy admin *without a developer*",
  "стабільна робота без падінь": "stable, no downtime",
  "онлайн-запис та форми заявок":
    "online booking and inquiry forms",
  "**Бонус:** два розділи (стоматологія і естетика) під одним брендом — без втрати фокусу і з окремими лід-формами під кожен напрямок.":
    "**Bonus:** two sections (dental and aesthetic) under one brand — focus preserved, with separate lead forms for each line.",
  "більше заявок з сайту": "more inquiries from the site",
  "CONVERSION": "CONVERSION",
  "час завантаження сторінки": "page load time",
  "PERFORMANCE": "PERFORMANCE",
  "Lighthouse · Performance": "Lighthouse · Performance",
  "CORE WEB VITALS": "CORE WEB VITALS",
  "органічного трафіку Google": "more organic traffic from Google",
  "SEO · 6 МІС.": "SEO · 6 MO",
  "Хочете **такий самий результат**? Подивіться, як ми це робимо.":
    "Want **the same kind of result**? See how we do it.",

  /* outcomeBlock */
  "РЕЗУЛЬТАТ ЧЕРЕЗ 6 МІСЯЦІВ": "RESULTS AFTER 6 MONTHS",
  "За **6 місяців** після запуску клініка *«Ефедра»* отримала вимірний приріст заявок з Google і повний контроль над контентом сайту. Це типовий результат переробки сайту клініки — перетворення з «візитки без заявок» на *інструмент*, який реально приводить пацієнтів.":
    "**Six months** after launch, *Efedra Clinic* saw a measurable lift in Google inquiries and full control over site content. That's a typical outcome of a clinic website rebuild — going from a 'business card that doesn't book anyone' to an actual *tool* that brings in patients.",
  "SOLUTION · ARCHITECTURE": "SOLUTION · ARCHITECTURE",
  "Як ми вирішили задачу\nз *двома напрямками*":
    "How we handled\n*two business lines*",
  "У клієнта було два напрямки: *стоматологія* і *студія краси*. Ми не стали робити два окремі сайти — це здешевило б проєкт, але роздробило б SEO і вдвічі підвищило б вартість підтримки.":
    "The client had two lines: a *dental practice* and an *aesthetic studio*. We didn't split them into two sites — that would've been cheaper upfront, but it would've fragmented SEO and doubled long-term support cost.",
  "Замість цього": "Instead",
  "одна головна сторінка для клініки *в цілому*":
    "one homepage for the practice *as a whole*",
  "дві окремі підголовні: стоматологія і студія краси":
    "two sub-homes: dental and aesthetic",
  "послуги, лікарі і контент розділені *за напрямками*":
    "services, physicians, and content split *by line*",
  "Це дозволило": "Which let us",
  "не дробити *SEO* між двома доменами":
    "avoid splitting *SEO* across two domains",
  "не втрачати трафік на *301-редиректах*":
    "skip the traffic loss from *301 redirects*",
  "чітко розділити напрямки *для пацієнта*":
    "keep the two lines clearly separate *for the patient*",
  "Що ви отримаєте\nна прикладі *реального* проєкту":
    "What you get,\nshown on a *real* project",
  "Не просто «*красивий сайт*». Інструменти, що реально впливають на потік пацієнтів — структура під SEO, онлайн-запис, керована редактором адмінка.":
    "Not just a '*pretty site*.' Tools that actually move the patient pipeline — SEO-ready structure, online booking, an admin your team can run without us.",
  "зростання потоку заявок після редизайну":
    "lift in inquiry volume after the redesign",
  "— за словами власниці клініки «Ефедра»":
    "— per the owner of Efedra Clinic",
  "зручний дизайн без перевантаження":
    "clean design, nothing overloaded",
  "працює на будь-яких пристроях і браузерах":
    "works on any device or browser",
  "Зрозуміла структура під *реальні послуги*":
    "Clear structure mapped to *real services*",
  "Стомат.": "Dental",
  "Естетика": "Aesthetic",
  "Інше": "Other",
  "розділення на *стоматологію* і *студію краси*":
    "split into *dental* and *aesthetic studio*",
  "окремі сторінки під **кожну послугу**":
    "a dedicated page for **each service**",
  "логічна навігація без перевантаження":
    "logical navigation, nothing crowded",
  "швидкий доступ до запису": "booking always one click away",
  "Система запису, яка *реально* працює":
    "Booking that *actually* works",
  "запис у **2 кліки**": "booking in **2 clicks**",
  "вибір послуги і спеціаліста":
    "pick a service and a physician",
  "форми заявок і зворотного звʼязку":
    "inquiry and contact forms",
  "інтеграція з *CRM* / сповіщення":
    "*CRM* integration with notifications",
  "Ви керуєте сайтом *самі*": "You run the site *yourself*",
  "зміна *цін* з телефона": "edit *prices* from your phone",
  "додавання послуг і лікарів": "add services and physicians",
  "публікація акцій і новин": "publish promotions and news",
  "без **постійної оплати** розробнику":
    "no **monthly retainer** to a developer",

  /* servicesBlock */
  "ВІДГУК КЛІЄНТА": "CLIENT TESTIMONIAL",
  "Після запуску сайту ми почали отримувати в *3–4 рази* більше заявок. Особливо виріс потік з Google. І найголовніше — ми тепер *самі* можемо змінювати все на сайті без розробників.":
    "After launch we started getting *3–4×* more inquiries — Google traffic in particular. And the best part: we can *update everything ourselves* now, no developer needed.",
  "Засновниця клініки в Одесі": "Founder, clinic in Odesa",
  "Що ми робимо для\n*медичних* клінік":
    "What we build for\n*medical* practices",
  "Не «*ще один шаблонний медичний сайт*». Кожен проєкт — під конкретну клініку, її спеціалізацію і регуляторні вимоги.":
    "Not '*another cookie-cutter medical site*.' Every project is built for a specific practice, its specialty, and the rules it has to live by.",
  "Онлайн-запис 24/7": "Online booking 24/7",
  "Запис у *2 кліки*. SMS-підтвердження пацієнту, Telegram-сповіщення лікарю":
    "Booking in *2 clicks*. SMS confirmation to the patient, Telegram alert to the physician",
  "Інтеграція з *Dental4Windows*, Medesk, MedAI, Helsi, KeyCRM":
    "Integrates with *Dental4Windows*, Medesk, MedAI, Helsi, KeyCRM",
  "Автоматичні нагадування за день до прийому":
    "Automated day-before reminders",
  "Каталог лікарів": "Physician directory",
  "Фото, регалії, освіта, спеціалізація, реальні відгуки пацієнтів":
    "Photo, credentials, education, specialty, real patient reviews",
  "Розклад кожного лікаря в реальному часі":
    "Each physician's schedule in real time",
  "Запис безпосередньо до обраного спеціаліста":
    "Book directly with the physician you pick",
  "Прозорий прайс": "Transparent pricing",
  "Структурований прайс-лист, маркетолог оновлює ціни *за 2 хвилини*":
    "Structured price list — your marketing team updates prices in *2 minutes*",
  "Юридично коректне оформлення (стоп-таблиця для пацієнтів)":
    "Legally vetted formatting with the disclaimers patients need",
  "Можливість приховати окремі позиції від індексації":
    "Hide individual line items from search indexing",
  "Каталог послуг": "Service catalog",
  "Детальний опис процедур з фото *«до/після»* (з дозволу пацієнтів)":
    "Detailed procedure pages with *before/after* photos (with patient consent)",
  "Повʼязані послуги і пакетні пропозиції":
    "Related services and bundled offerings",
  "Відеоматеріали від лікарів":
    "Video content from your physicians",
  "Інтеграція зі страховими": "Insurance integration",
  "Список *ДМС-програм* з онлайн-розрахунком покриття":
    "List of *private insurance plans* with an online coverage calculator",
  "Інтеграція з *Helsi* для держстраховок (НСЗУ)":
    "*Helsi* integration for Ukraine's NHSU (state insurance)",
  "Запис із зазначенням страховки":
    "Booking with insurance details captured upfront",
  "Локальне SEO та аналітика": "Local SEO and analytics",
  "*Schema.org* розмітка MedicalOrganization, оптимізація під «стоматолог + район»":
    '*Schema.org* MedicalOrganization markup, optimized for queries like "dentist + neighborhood"',
  "Налаштування Google Business Profile, карта проїзду з парковкою":
    "Google Business Profile setup, directions map with parking",
  "Аналітика трафіку і воронки від перегляду до запису":
    "Traffic and funnel analytics from view to booking",
  "Підключаємо всі\n*профільні* системи":
    "We connect every\n*industry-specific* system",
  "Заявка з сайту потрапляє одразу у вашу *CRM*. Адміністратор бачить запис у момент кліку. Лікар отримує сповіщення в Telegram. Пацієнт — SMS-підтвердження. Жодних втрачених лідів через листи у спамі або дзвінки в неробочий час.":
    "Inquiries land in your *CRM* the moment they're submitted. Your front desk sees the booking the second a patient clicks. The physician gets a Telegram alert. The patient gets an SMS confirmation. No leads lost to spam folders or after-hours calls.",
  "Dental4Windows": "Dental4Windows",
  "Medesk": "Medesk",
  "MedAI": "MedAI",
  "Helsi": "Helsi",
  "KeyCRM": "KeyCRM",
  "AmoCRM": "AmoCRM",
  "Bitrix24": "Bitrix24",
  "Telegram": "Telegram",

  /* comparisonBlock */
  "Чим кодовий сайт\nкращий за шаблонну\nмедицину на WordPress або Wix":
    "Why custom code\nbeats template medical sites\non WordPress or Wix",
  "Параметр": "Parameter",
  "Шаблон WP": "WP template",
  "Wix": "Wix",
  "Кодовий сайт": "Custom code",
  "Швидкість завантаження": "Page load speed",
  "5–8 сек": "5–8s",
  "3–6 сек": "3–6s",
  "0,8–1,5 сек": "0.8–1.5s",
  "плагін (баги)": "plugin (buggy)",
  "через Apps": "via Apps",
  "кастомна": "custom-built",
  "Інтеграція з мед. CRM": "Medical CRM integration",
  "Локальне SEO": "Local SEO",
  "обмежена": "limited",
  "немає (Zapier)": "none (Zapier)",
  "будь-яка": "any system",
  "плагін Yoast": "Yoast plugin",
  "базове": "basic",
  "закладено": "built-in",
  "Безпека даних пацієнтів": "Patient data security",
  "низька": "low",
  "середня": "medium",
  "висока (GDPR)": "high (HIPAA-aware, GDPR)",
  "Юр. коректність МОЗ": "Compliance (HIPAA / GDPR)",
  "залежить від теми": "depends on theme",
  "обмежено": "limited",
  "перевіряємо юристом": "lawyer-reviewed",
  "TCO за 3 роки": "3-year TCO",
  "$4–6k": "$4,000–6,000",
  "$3,5–5k": "$3,500–5,000",
  "$5–7k": "$5,000–7,000",
  "Детальне порівняння конструкторів": "Detailed builder comparison",
  "Порівняння з WordPress": "Compare against WordPress",
  "Обговорити проєкт": "Discuss your project",
  "Розкажіть коротко про вашу клініку — відповімо в Telegram протягом 1–2 годин у робочий час.":
    "Tell us briefly about your practice — we reply on Telegram within 1–2 hours during business hours.",
  "Як до вас звертатися": "Your name",
  "Telegram, телефон або email": "Telegram, phone, or email",
  "Яка клініка, який сайт потрібен, що зараз не працює":
    "Tell us about your practice, what site you need, and what's broken now",
  "Надіслати — відповімо за 1–2 години":
    "Send — reply in 1–2 hours",
  "Або одразу пишіть у Telegram — @fedirdev":
    "Or message us directly on Telegram — @fedirdev",
  "Скільки коштує сайт для клініки":
    "How much a clinic website costs",
  "Базовий сайт\nклініки": "Starter\nclinic site",
  "$3 500": "$3,500",
  "Що входить": "Includes",
  "До 8 сторінок": "Up to 8 pages",
  "Каталог лікарів і послуг": "Physician and service directory",
  "Відгуки пацієнтів": "Patient reviews",
  "Базове *SEO*": "Basic *SEO*",
  "Мобільна адаптація": "Mobile-responsive",
  "Не входить": "Not included",
  "Створення контенту (тексти послуг, описи лікарів)":
    "Content creation (service copy, physician bios)",
  "Професійна фотозйомка": "Professional photography",
  "ДМС-інтеграція": "Private insurance integration",
  "Блог": "Blog",
  "Замовити базовий": "Choose Starter",
  "Популярно": "Most popular",
  "Розширений": "Pro",
  "$6 500": "$6,500",
  "6 тижнів": "6 weeks",
  "Все з базового +": "Everything in Starter, plus",
  "Блог і SEO-сторінки": "Blog and SEO pages",
  "*ДМС-інтеграція*": "*Private insurance integration*",
  "Фото-кейси до/після": "Before/after photo cases",
  "Історія відвідувань і нагадування": "Visit history and reminders",
  "Онлайн-консультація": "Online consultations",
  "Інтеграція з медичною *CRM*": "Medical *CRM* integration",
  "Фотозйомка (можемо організувати окремо)":
    "Photo shoot (we can arrange separately)",
  "Контент для блогу (можемо запропонувати копірайтера)":
    "Blog content (we can recommend a copywriter)",
  "Багатомовність": "Multilingual",
  "Замовити розширений": "Choose Pro",
  "Преміум / мережа\nклінік": "Enterprise /\npractice network",
  "$12 000": "$12,000",
  "8–10 тижнів": "8–10 weeks",
  "Все з розширеного +": "Everything in Pro, plus",
  "Багатофіліальна структура": "Multi-location structure",
  "Повна *CRM*-інтеграція": "Full *CRM* integration",
  "Кастомні модулі під вашу спеціалізацію":
    "Custom modules for your specialty",
  "Підтримка по *SLA*": "*SLA*-backed support",
  "Створення фото/відео контенту": "Photo/video content creation",
  "Юридичний консалтинг (тільки технічна юр-коректність)":
    "Legal consulting (we cover technical compliance only)",
  "Обговорити мережу": "Talk to us",

  /* faqBlock — questions only; answers are rich text handled below */
  "Часті питання": "Frequently asked questions",
  "Скільки часу займає запуск сайту клініки?":
    "How long does it take to launch a clinic website?",
  "Що робити зі старим сайтом?": "What happens to my old site?",
  "Хто наповнюватиме сайт контентом?": "Who writes the content?",
  "Які інтеграції з медичними CRM можливі?":
    "Which medical CRM integrations are supported?",
  "Як захищені дані пацієнтів?": "How is patient data protected?",
  "Чи можна розмістити відгуки пацієнтів?":
    "Can we publish patient reviews on the site?",
  // EN replaces this question entirely — different audience, different legal
  // landscape. UA stays focused on pricing-disclosure rules; EN reframes
  // around healthcare advertising + patient-data law without naming any
  // specific statute (we're not lawyers).
  "Чи можна за законом розміщувати ціни на медичні послуги?":
    "What about healthcare advertising rules and patient-data law?",
  "Чи можна запустити рекламу медичних послуг у Google і Facebook?":
    "Can we run ads for medical services on Google and Facebook?",

  /* auditBlock */
  "Отримайте безкоштовний розбір сайту вашої клініки":
    "Get a free audit of your clinic website",
  "Залиште посилання на ваш поточний сайт. Протягом *24 годин* надішлемо розбір.":
    "Send us your current site URL. We'll deliver an audit within *24 hours*.",
  "Список з *7–12 помилок*, через які клініка втрачає пацієнтів":
    "A list of *7–12 issues* costing your practice patients",
  "Технічний звіт зі швидкості та *SEO* (PageSpeed + Schema)":
    "Technical report on speed and *SEO* (PageSpeed + Schema)",
  "План покращень з пріоритетами": "Prioritized improvement plan",
  "Орієнтовну вартість переробки або нового сайту":
    "Ballpark cost for a rebuild or a new site",
  "2–3 кейси клінік з нашого портфоліо":
    "2–3 clinic cases from our portfolio",
  "Жодних зобов'язань. Корисно, навіть якщо вирішите працювати з іншим підрядником.":
    "No strings attached. Useful even if you end up working with someone else.",
  "Імейл або нік у Telegram": "Email or Telegram handle",
  "+380 (__) ___-__-__": "+1 (___) ___-____",
  "https://...": "https://...",
  "Отримати розбір за 24 години": "Get my audit in 24 hours",
  "Не надсилаємо нічого, окрім розбору і одного листа з прикладами наших робіт. Без спаму.":
    "We send the audit and one follow-up with examples of our work. No spam.",
};

/* ──────────────────────────── rich text translations ──────────────────── */

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  markDefs: never[];
  children: Span[];
};

let keyCounter = 0;
function k(prefix = "k"): string {
  keyCounter += 1;
  return `${prefix}${keyCounter.toString(36)}en`;
}

function block(parts: Array<string | { em: string }>): Block {
  return {
    _type: "block",
    _key: k("b"),
    style: "normal",
    markDefs: [],
    children: parts.map<Span>((p) =>
      typeof p === "string"
        ? { _type: "span", _key: k("s"), text: p, marks: [] }
        : { _type: "span", _key: k("s"), text: p.em, marks: ["em"] },
    ),
  };
}

/** Reason number → EN rich text */
const REASON_EN: Record<string, Block[]> = {
  "01": [
    block([
      "Patients have to call during business hours. ",
      { em: "60% of bookings" },
      " get lost evenings and weekends. Younger patients don't call at all — they DM your competitors on Instagram, where ",
      { em: "online booking actually works" },
      ".",
    ]),
  ],
  "02": [
    block([
      "Patients don't know who they'll see or what it'll cost. They close your site and head to a competitor that shows it. In ",
      { em: "2026" },
      ", opacity equals ",
      { em: "lost patients" },
      ".",
    ]),
  ],
  "03": [
    block([
      'Competitors in your neighborhood outrank you on queries like "',
      { em: "dentist + neighborhood" },
      '" or "',
      { em: "clinic + city" },
      '". ',
      { em: "80% of patients" },
      " never click past the first page of results.",
    ]),
  ],
};

/** FAQ — keyed by exact UK question text */
const FAQ_EN: Record<string, Block[]> = {
  "Скільки часу займає запуск сайту клініки?": [
    block([
      "Starter — ",
      { em: "4 weeks" },
      ", Pro — 6 weeks, Enterprise for a practice network — 8–10 weeks. Deadlines are written into the contract. Every week you get a report with screenshots and the latest build.",
    ]),
  ],
  "Що робити зі старим сайтом?": [
    block([
      "Your old site stays up until the new one launches — no traffic gap. We set up ",
      { em: "301 redirects" },
      " from old URLs to new ones, migrate meta tags and Schema markup, and hand over the domain. Google rankings typically hold.",
    ]),
  ],
  "Хто наповнюватиме сайт контентом?": [
    block([
      "We can write everything — we have a copywriter with medical experience and a photographer (priced separately). Or you supply copy and photos and we lay them out. Or hybrid — you give us service descriptions, we rewrite for ",
      { em: "SEO" },
      " and the rules medical content has to follow (HIPAA-aware for US clients, GDPR for the EU, Ministry of Health (Ukraine) guidance for UA practices).",
    ]),
  ],
  "Які інтеграції з медичними CRM можливі?": [
    block([
      "We've worked with ",
      { em: "Dental4Windows" },
      ", Medesk, MedAI, Helsi (Ukraine's NHSU), KeyCRM, AmoCRM, and Bitrix24. If your CRM isn't on the list, we wire it up via API or webhooks. Bookings hit your CRM instantly, and the physician gets a Telegram notification.",
    ]),
  ],
  "Як захищені дані пацієнтів?": [
    block([
      "We're ",
      { em: "HIPAA-aware" },
      " for US clients and ",
      { em: "GDPR-compliant" },
      " for the EU (we also follow Ministry of Health Ukraine guidance for UA practices): encryption in transit (HTTPS) and at rest, IP allowlisting on the admin, audit logs, regular backups. Servers in the EU. Your contract includes a DPA.",
    ]),
  ],
  "Чи можна розмістити відгуки пацієнтів?": [
    block([
      "Yes, but ",
      { em: "only with the patient's written consent" },
      " and without disclosing diagnoses. We'll draft a consent template with a lawyer. Alternative — integrate Google Reviews or Doc.ua, where the platform moderates.",
    ]),
  ],
  "Чи можна за законом розміщувати ціни на медичні послуги?": [
    block([
      "Different in every market — HIPAA plus FTC rules in the US, GDPR plus your national medical board in the EU (Sundhedsdatastyrelsen in Denmark, MDR in Germany). We handle the technical side: privacy notices, consent banners, secure intake forms, transparent pricing displays where they're required. We're not lawyers — for advertising restrictions, licensing, or telehealth specifics, we'll connect you with a healthcare attorney during the brief. That's their lane.",
    ]),
  ],
  "Чи можна запустити рекламу медичних послуг у Google і Facebook?": [
    block([
      "Yes, with caveats. You can't promise \"guaranteed cures,\" use before/after photos in ad creative, or advertise prescription drugs. We build landing pages that pass Google Ads moderation on the first review. Ad setup itself is a separate scope, but we can refer vetted partners.",
    ]),
  ],
};

/* ──────────────────────────── walker ──────────────────────────────────── */

type Json = unknown;

function isLocalizedShape(node: Json): node is Record<string, unknown> {
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  const obj = node as Record<string, unknown>;
  // Lenient: any object that has at least one of uk/ru/en counts. The
  // strict "all keys must be uk/ru/en" check missed array-item shapes
  // like `{ _key, uk }` (e.g. hero.features[], hero.tickerItems[]),
  // leaving their .en undefined after patch.
  return "uk" in obj || "ru" in obj || "en" in obj;
}

function walk(
  node: Json,
  path: string,
  set: Record<string, unknown>,
  unmatched: string[],
) {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      const seg =
        item && typeof item === "object" && "_key" in item && item._key
          ? `[_key=="${(item as { _key: string })._key}"]`
          : `[${i}]`;
      walk(item, `${path}${seg}`, set, unmatched);
    });
    return;
  }

  if (isLocalizedShape(node)) {
    const ukVal = node.uk;
    if (typeof ukVal === "string" && ukVal.length > 0) {
      const enPath = `${path}.en`;
      // Skip if this path was set explicitly (e.g. top-level title/seo).
      if (enPath in set) return;
      const en = STRINGS[ukVal];
      if (en !== undefined) {
        set[enPath] = en;
      } else {
        unmatched.push(`${path}: "${ukVal.slice(0, 80)}"`);
      }
    }
    return;
  }

  for (const kk of Object.keys(node as Record<string, unknown>)) {
    if (kk.startsWith("_")) continue;
    const next = (node as Record<string, unknown>)[kk];
    walk(next, path ? `${path}.${kk}` : kk, set, unmatched);
  }
}

/* ──────────────────────────── runner ──────────────────────────────────── */

type SectionLite = {
  _type: string;
  _key: string;
  reasons?: Array<{ _key: string; number?: string }>;
  items?: Array<{ _key: string; question?: { uk?: string } }>;
};

async function main() {
  const apply = process.argv.includes("--apply");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
    process.exit(1);
  }
  if (apply && !token) {
    console.error("✗ --apply requires SANITY_API_TOKEN");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  console.log(`→ Fetching ${DOC_ID} from ${projectId}/${dataset}…`);
  const existing = await client.getDocument(DOC_ID);
  if (!existing) {
    console.error(`✗ Document ${DOC_ID} not found. Run seed-medicine first.`);
    process.exit(1);
  }

  const set: Record<string, unknown> = { ...TOP_LEVEL };
  const unmatched: string[] = [];

  walk(existing, "", set, unmatched);

  // Rich text shadow fields ---------------------------------------------------
  const sections = (existing.sections ?? []) as SectionLite[];

  const reasonsSection = sections.find((s) => s._type === "reasonsBlock");
  if (reasonsSection?.reasons) {
    for (const r of reasonsSection.reasons) {
      const en = r.number ? REASON_EN[r.number] : undefined;
      if (en) {
        set[
          `sections[_key=="${reasonsSection._key}"].reasons[_key=="${r._key}"].textEn`
        ] = en;
      } else {
        console.warn(`  ! No EN rich text for reason number ${r.number}`);
      }
    }
  }

  const faqSection = sections.find((s) => s._type === "faqBlock");
  if (faqSection?.items) {
    for (const it of faqSection.items) {
      const ukQ = it.question?.uk ?? "";
      const en = FAQ_EN[ukQ];
      if (en) {
        set[
          `sections[_key=="${faqSection._key}"].items[_key=="${it._key}"].answerEn`
        ] = en;
      } else {
        console.warn(`  ! No EN rich text for FAQ: "${ukQ.slice(0, 60)}"`);
      }
    }
  }

  // Report --------------------------------------------------------------------
  console.log(
    `→ ${apply ? "Applying" : "Would apply"} patch with ${Object.keys(set).length} set ops (${unmatched.length} unmatched UK strings)…`,
  );
  if (unmatched.length) {
    console.log("  Unmatched (will fall back to UK at runtime):");
    for (const u of unmatched) console.log(`    · ${u}`);
  }

  if (!apply) {
    console.log(`→ Dry-run only. Pass --apply to commit.`);
    return;
  }

  const result = await client.patch(DOC_ID).set(set).commit();
  console.log(`✓ Patched ${result._id} (rev ${result._rev})`);
}

main().catch((err) => {
  console.error("✗ Translate failed:", err);
  process.exit(1);
});
