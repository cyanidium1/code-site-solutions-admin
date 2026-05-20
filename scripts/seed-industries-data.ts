/**
 * Industry-page seed content for 8 industries (Sprint 3).
 * Mirrors docs/industries/*.md in the frontend repo. Bilingual UA + EN.
 */

import {L, type Industry} from './seed-industries-lib'

/* ─── shared ─────────────────────────────────────────────────────────────── */

const AUDIT_INPUT_DEFAULTS = undefined

const CTA_PRIMARY = L('Обговорити мій проєкт', 'Discuss my project')
const FAQ_HEADING = L('Часті питання', 'FAQ')

/* ──────────────────────────────────────────────────────────────────────────
 * 1. MEDICINE  (Efedra Clinic)
 * ──────────────────────────────────────────────────────────────────────── */

const medicine: Industry = {
  slug: 'medicine',
  order: 1,
  title: L('Сайти для медичних клінік', 'Websites for medical clinics'),
  seo: {
    title: L(
      'Сайти для медичних клінік — Code-Site.Art',
      'Websites for medical clinics — Code-Site.Art',
    ),
    description: L(
      'Сайти для приватних клінік, стоматологій і діагностичних центрів. Online-запис, інтеграції з МІС, локальне SEO. Кейс: клініка «Ефедра» Одеса.',
      'Websites for private clinics, dental practices, and diagnostic centers. Online booking, MIS integrations, local SEO. Case study: Efedra Clinic, Odesa.',
    ),
  },
  hero: {
    eyebrow: L('САЙТИ ДЛЯ МЕДИЧНОЇ ГАЛУЗІ · від $3 500', 'WEBSITES FOR HEALTHCARE · from $3,500'),
    heading: L(
      'Клініка, до якої\n*записуються*',
      'A practice patients\n*book online*',
    ),
    h1Num: '50+',
    h1NumLabel: L('пацієнтів\nна місяць', 'patients\nper month'),
    lede: L(
      'Ви отримуєте сайт клініки що починає приймати онлайн-записи з першого дня. Без вашої участі більше ніж *5 годин*: ми пишемо тексти, ставимо інтеграції з Helsi/Medesk, налаштовуємо локальне SEO. Запуск за 4–6 тижнів.',
      'You get a clinic website that starts taking online bookings from day one. No more than *5 hours* of your time: we write the copy, wire up integrations with Helsi/Medesk, set up local SEO. Live in 4–6 weeks.',
    ),
    features: [
      L('Онлайн-запис | за 2 кліки', 'Online booking | 2 clicks'),
      L('Локальне SEO | під район', 'Local SEO | by district'),
      L('Інтеграція CRM | Bitrix · AmoCRM', 'CRM integration | Bitrix · AmoCRM'),
      L('Юр. коректно | за вимогами МОЗ', 'Compliant | per Ministry of Health'),
    ],
    ctaPrimary: CTA_PRIMARY,
    ctaSecondary: L('Подивитися кейси клінік', 'See clinic case studies'),
    stats: [
      {value: '47', label: L('клінік\nзапущено', 'clinics\nlaunched')},
      {value: '4.9/5', label: L('середня\nоцінка', 'client\nrating')},
      {value: '×3.2', label: L('більше\nзаписів', 'more\nbookings')},
    ],
    tickerItems: [
      L('Стоматології', 'Dental practices'),
      L('Багатопрофільні клініки', 'Multi-specialty clinics'),
      L('Діагностичні центри', 'Diagnostic centers'),
      L('Косметологія', 'Aesthetic medicine'),
      L('Реабілітація', 'Rehabilitation'),
      L('Лабораторії', 'Labs'),
    ],
    deviceTags: [
      {primary: L('Онлайн-запис', 'Online booking')},
      {mini: '100/100', primary: L('Адаптив', 'Responsive')},
      {kind: 'good', mini: '98', primary: L('Lighthouse', 'Lighthouse')},
    ],
  },
  reasons: {
    eyebrow: L('ДІАГНОСТИКА · 3 ПУНКТИ', 'DIAGNOSIS · 3 POINTS'),
    heading: L(
      '3 причини, чому пацієнти\n*не записуються* з вашого сайту',
      '3 reasons patients\n*don’t book* on your site',
    ),
    metaRow: L('аналіз 47 клінік · 2024–25', 'audit of 47 clinics · 2024–25'),
    reasons: [
      {
        number: '01',
        tag: L('UX · CONVERSION', 'UX · CONVERSION'),
        title: L('Немає онлайн-запису', 'No online booking'),
        uk: 'Пацієнт мусить телефонувати в робочий час. *60% записів* втрачається ввечері і у вихідні. Молода аудиторія взагалі не телефонує — вона пише в Instagram конкурентам, у яких *онлайн-запис працює*.',
        en: 'Patients must call during business hours. *60% of bookings* are lost in the evenings and on weekends. Younger patients don’t call at all — they DM competitors on Instagram who have *online booking that just works*.',
        stat: {
          value: '60%',
          label: L(
            'дзвінків поза робочим часом залишаються без відповіді',
            'of calls after hours go unanswered',
          ),
        },
      },
      {
        number: '02',
        tag: L('TRUST · CONTENT', 'TRUST · CONTENT'),
        title: L('Немає цін і фото лікарів', 'No prices, no doctor profiles'),
        uk: 'Пацієнт не розуміє, до кого потрапить і скільки заплатить. Закриває ваш сайт, йде на сайт клініки, де це є. У 2026 році *непрозорість — це втрачені пацієнти*.',
        en: 'The patient can’t tell who they’ll see or what they’ll pay. They close your site and go to a competitor who shows both. In 2026, *opacity equals lost patients*.',
        stat: {
          value: '×2.4',
          label: L(
            'вища конверсія у клінік з прозорим прайсом і командою',
            'higher conversion at clinics with transparent pricing and team profiles',
          ),
        },
      },
      {
        number: '03',
        tag: L('SEO · LOCAL', 'SEO · LOCAL'),
        title: L('Вас не видно в Google', 'You’re invisible in Google'),
        uk: 'Конкуренти у вашому районі вищі в пошуку за запитом «стоматолог + район» або «клініка + місто». *80% пацієнтів* не йдуть далі першої сторінки результатів.',
        en: 'Competitors in your neighborhood rank above you for "dentist + district" or "clinic + city" searches. *80% of patients* don’t go past page one.',
        stat: {
          value: '80%',
          label: L(
            'кліків забирають перші 5 результатів локального пошуку',
            'of clicks go to the top 5 local search results',
          ),
        },
      },
    ],
    footText: L(
      'Виправляємо *всі три* на запуску — без вашої участі.',
      'We fix *all three* at launch — without your involvement.',
    ),
    footCtaLabel: L('Перевірити мій сайт', 'Audit my site'),
  },
  case: {
    eyebrow: L('РЕАЛЬНИЙ КЕЙС', 'REAL CASE'),
    eyebrowEm: L('КЛІНІКА «ЕФЕДРА», ОДЕСА', 'EFEDRA CLINIC, ODESA'),
    heading: L(
      'До / Після на прикладі реального клієнта',
      'Before / After — a real client case',
    ),
    lede: L(
      'До нас звернулася клініка «Ефедра» з Одеси — із застарілим сайтом, який не приносив заявок. Завдання було не просте: переробити структуру, дизайн і логіку під два напрямки бізнесу клініки — стоматологію і студію краси.',
      'Efedra Clinic from Odesa came to us with an outdated site that didn’t bring leads. The task wasn’t simple: rebuild structure, design, and logic for two business lines under one brand — dental services and aesthetic medicine.',
    ),
    meta: [
      {strong: L('4 тижні', '4 weeks'), text: L('від брифу до релізу', 'brief to launch')},
      {
        strong: L('2 напрямки', '2 service lines'),
        text: L('стоматологія + естетика', 'dental + aesthetic'),
      },
      {strong: L('UA + RU', 'UA + RU'), text: L('локалізація під SEO', 'localized SEO')},
    ],
    before: {
      num: 'EFEDRA · v1 · 2022',
      url: 'efedraclinic.com.ua',
      heading: L('× Сайт, що не продає', '× A site that didn’t sell'),
      bullets: [
        L(
          'заплутана структура сайту, користувачі не розуміли куди натискати',
          'confusing site structure — users didn’t know where to click',
        ),
        L(
          'застарілий дизайн, який не викликав довіри',
          'outdated design that didn’t build trust',
        ),
        L('низька швидкість завантаження', 'slow loading'),
        L(
          'некоректна мультимовність (російська/українська)',
          'broken multi-language (Russian / Ukrainian)',
        ),
        L(
          'незручна адмінка — будь-які зміни через розробника за гроші',
          'admin that needed a developer for every edit — paid',
        ),
        L('сайт періодично падав', 'the site went down regularly'),
        L('не було нормальної системи запису/бронювання', 'no proper booking system'),
      ],
      foot: L(
        'Примітка: російську мову залишено як основну для SEO, оскільки в Одесі значна частина пошукових запитів все ще російською мовою.',
        'Note: Russian was kept as the primary language for SEO — in Odesa a significant share of search queries is still in Russian.',
      ),
    },
    after: {
      num: 'EFEDRA · v2 · 2025',
      url: 'efedra.com.ua',
      heading: L('✓ Сайт, що приводить пацієнтів', '✓ A site that brings patients'),
      bullets: [
        L('зрозуміла структура сайту під користувача', 'user-first site structure'),
        L('сучасний дизайн, що підвищує довіру', 'modern design that builds trust'),
        L('швидке завантаження <1.5 c', 'load time under 1.5s'),
        L('коректна мультимовність (RU/UA)', 'proper multi-language (RU/UA)'),
        L('зручна адмінка без розробника', 'admin that works without a developer'),
        L('стабільна робота без падінь', 'stable uptime'),
        L('онлайн-запис та форми заявок', 'online booking and lead forms'),
      ],
      foot: L(
        'Бонус: два розділи (стоматологія і естетика) під одним брендом — без втрати фокусу і з окремими лід-формами під кожен напрямок.',
        'Bonus: two service lines (dental + aesthetic) under one brand — without losing focus, each with its own lead form.',
      ),
    },
    results: [
      {
        value: '×3.2',
        tag: L('CONVERSION', 'CONVERSION'),
        label: L('більше заявок з сайту', 'more leads from the site'),
      },
      {
        value: '<1.5c',
        tag: L('PERFORMANCE', 'PERFORMANCE'),
        label: L('час завантаження сторінки', 'page load time'),
      },
      {
        value: '98',
        tag: L('CORE WEB VITALS', 'CORE WEB VITALS'),
        label: L('Lighthouse · Performance', 'Lighthouse Performance'),
      },
      {
        value: '×4',
        tag: L('SEO · 6 МІС.', 'SEO · 6 MO.'),
        label: L('органічного трафіку Google', 'organic traffic from Google'),
      },
    ],
  },
  outcome: {
    recapText: L(
      'Ваш сайт має приводити пацієнтів, поки ви робите свою роботу.',
      'Your site should bring patients while you do your work.',
    ),
    directionsTitle: L(
      'Як ми вирішили задачу з двома напрямками',
      'How we solved the dual-service-line problem',
    ),
    directionsLede: L(
      'У клієнта було два напрямки: стоматологія і студія краси. Ми не стали робити два окремі сайти — це здешевило б проєкт, але роздробило б SEO і вдвічі підвищило б вартість підтримки.',
      'The client had two service lines: dental and aesthetic. We didn’t build two separate sites — that would have been cheaper for the project but would have split the SEO and doubled long-term maintenance cost.',
    ),
    audienceCards: [
      {
        title: L('Замість цього', 'Instead'),
        bullets: [
          L('одна головна сторінка для клініки в цілому', 'one homepage for the clinic as a whole'),
          L(
            'дві окремі підголовні: стоматологія і студія краси',
            'two service-line landing pages: dental + aesthetic',
          ),
          L(
            'послуги, лікарі і контент розділені за напрямками',
            'services, doctors, and content split by line',
          ),
        ],
      },
      {
        title: L('Це дозволило', 'This let us'),
        bullets: [
          L('не дробити SEO між двома доменами', 'keep SEO consolidated under one domain'),
          L('не втрачати трафік на 301-редиректах', 'avoid 301-redirect traffic loss'),
          L('чітко розділити напрямки для пацієнта', 'clearly separate the two service lines for the patient'),
        ],
      },
    ],
    benefitsHeading: L('Як це працює на сайті', 'How it shows up on the site'),
    benefitRows: [
      {
        feature: 'FEATURE · 01 / 03',
        heading: L(
          'Зрозуміла структура під реальні послуги',
          'Clear structure mapped to real services',
        ),
        bullets: [
          L('розділення на стоматологію і студію краси', 'split between dental and aesthetic'),
          L('окремі сторінки під кожну послугу', 'separate pages per service'),
          L('логічна навігація без перевантаження', 'logical navigation without overload'),
          L('швидкий доступ до запису', 'quick access to booking'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Стоматологія', 'Dental'),
          L('Естетика', 'Aesthetic'),
          L('Лікарі', 'Doctors'),
        ],
      },
      {
        feature: 'FEATURE · 02 / 03',
        heading: L(
          'Система запису, яка реально працює',
          'A booking system that actually works',
        ),
        bullets: [
          L('запис у 2 кліки', 'booking in 2 clicks'),
          L('вибір послуги і спеціаліста', 'choose service and specialist'),
          L('форми заявок і зворотного звʼязку', 'lead forms and callback requests'),
          L('інтеграція з CRM / сповіщення', 'CRM integration + notifications'),
        ],
        mockType: 'booking',
      },
      {
        feature: 'FEATURE · 03 / 03',
        heading: L('Ви керуєте сайтом самі', 'You run the site yourself'),
        bullets: [
          L('зміна цін з телефона', 'update prices from your phone'),
          L('додавання послуг і лікарів', 'add services and doctors'),
          L('публікація акцій і новин', 'publish promotions and news'),
          L('без постійної оплати розробнику', 'no recurring developer fees'),
        ],
        mockType: 'admin',
      },
    ],
  },
  testimonial: {
    quote: L(
      'Після запуску сайту ми почали отримувати в 3–4 рази більше заявок. Особливо виріс потік з Google. І найголовніше — ми тепер самі можемо змінювати все на сайті без розробників.',
      'After the new site launched, we started getting 3-4× more leads. Google traffic grew the most. And the biggest thing — we can now change everything on the site ourselves, without a developer.',
    ),
    authorName: 'Анна П. / Anna P.',
    authorInitials: 'АП',
    authorRole: L('Засновниця клініки в Одесі', 'Clinic founder, Odesa'),
  },
  services: {
    heading: L('Що ми робимо для медичних клінік', 'What we build for medical clinics'),
    sub: L(
      'Не «ще один шаблонний медичний сайт». Кожен проєкт — під конкретну клініку, її спеціалізацію і регуляторні вимоги.',
      'Not "another template medical site." Every project is built around your clinic, its specialty, and your regulatory environment.',
    ),
    features: [
      {
        title: L('Онлайн-запис 24/7', 'Online booking 24/7'),
        bullets: [
          L(
            'Запис у 2 кліки. SMS-підтвердження пацієнту, Telegram-сповіщення лікарю',
            '2-click booking. SMS confirmation to patient, Telegram alert to doctor',
          ),
          L(
            'Інтеграція з Dental4Windows, Medesk, MedAI, Helsi, KeyCRM',
            'Integrates with Dental4Windows, Medesk, MedAI, Helsi, KeyCRM',
          ),
          L(
            'Автоматичні нагадування за день до прийому',
            'Auto reminders 24 hours before the appointment',
          ),
        ],
      },
      {
        title: L('Каталог лікарів', 'Doctor catalog'),
        bullets: [
          L(
            'Фото, регалії, освіта, спеціалізація, реальні відгуки пацієнтів',
            'Photo, credentials, education, specialty, real patient reviews',
          ),
          L('Розклад кожного лікаря в реальному часі', 'Each doctor’s live schedule'),
          L(
            'Запис безпосередньо до обраного спеціаліста',
            'Book directly with the chosen specialist',
          ),
        ],
      },
      {
        title: L('Прозорий прайс', 'Transparent pricing'),
        bullets: [
          L(
            'Структурований прайс-лист, маркетолог оновлює ціни за 2 хвилини',
            'Structured price list; the marketing team updates prices in 2 minutes',
          ),
          L(
            'Юридично коректне оформлення (стоп-таблиця для пацієнтів)',
            'Legally compliant formatting (notice block for patients)',
          ),
          L(
            'Можливість приховати окремі позиції від індексації',
            'Option to hide specific items from indexing',
          ),
        ],
      },
      {
        title: L('Каталог послуг', 'Service catalog'),
        bullets: [
          L(
            'Детальний опис процедур з фото «до/після» (з дозволу пацієнтів)',
            'Procedure details with before/after photos (with patient consent)',
          ),
          L(
            'Повʼязані послуги і пакетні пропозиції',
            'Related services and bundled offers',
          ),
          L('Відеоматеріали від лікарів', 'Video content from doctors'),
        ],
      },
      {
        title: L('Інтеграція зі страховими', 'Insurance integration'),
        bullets: [
          L(
            'Список ДМС-програм з онлайн-розрахунком покриття',
            'List of private insurance programs with online coverage calculator',
          ),
          L(
            'Інтеграція з Helsi для держстраховок (НСЗУ)',
            'Helsi integration for state insurance (NHSU)',
          ),
          L('Запис із зазначенням страховки', 'Booking with insurance selection'),
        ],
      },
      {
        title: L('Локальне SEO та аналітика', 'Local SEO and analytics'),
        bullets: [
          L(
            'Schema.org розмітка MedicalOrganization, оптимізація під «стоматолог + район»',
            'Schema.org MedicalOrganization markup, optimization for "dentist + neighborhood"',
          ),
          L(
            'Налаштування Google Business Profile, карта проїзду з парковкою',
            'Google Business Profile setup, map with parking info',
          ),
          L(
            'Аналітика трафіку і воронки від перегляду до запису',
            'Traffic and funnel analytics from view to booking',
          ),
        ],
      },
    ],
    integrationsHeading: L('Підключаємо всі профільні системи', 'We connect every healthcare system'),
    integrationsSub: L(
      'Заявка з сайту потрапляє одразу у вашу CRM. Адміністратор бачить запис у момент кліку. Лікар отримує сповіщення в Telegram. Пацієнт — SMS-підтвердження. Жодних втрачених лідів через листи у спамі або дзвінки в неробочий час.',
      'Leads from the site land directly in your CRM. The admin sees the booking the moment it happens. The doctor gets a Telegram alert. The patient gets an SMS confirmation. Zero leads lost to spam folders or after-hours phone calls.',
    ),
    integrations: [
      'Dental4Windows',
      'Medesk',
      'MedAI',
      'Helsi',
      'KeyCRM',
      'AmoCRM',
      'Bitrix24',
      'Telegram',
      'Stripe',
      'WayForPay',
      'Google Calendar',
      'Calendly',
    ],
    bottomCallouts: [
      L(
        'Mobile-friendly адмінка · оновлюєте з телефону',
        'Mobile-friendly admin · update from your phone',
      ),
      L(
        'Окремі лендинги під кожну спеціалізацію',
        'Dedicated landings per specialty',
      ),
      L(
        'Виходимо в топ Google по «клініка + район»',
        'Rank top of Google for "clinic + neighborhood"',
      ),
    ],
  },
  comparison: {
    heading: L(
      'Чим кодовий сайт кращий за шаблонну медицину на WordPress або Wix',
      'Why a custom-coded clinic site beats a WordPress or Wix template',
    ),
    columns: {
      param: L('Параметр', 'Parameter'),
      wp: L('WordPress', 'WordPress'),
      wix: L('Wix', 'Wix'),
      custom: L('Кодовий', 'Custom code'),
    },
    rows: [
      {
        param: L('Швидкість завантаження', 'Page load speed'),
        wp: L('5–8 сек', '5-8 sec'),
        wix: L('3–6 сек', '3-6 sec'),
        custom: L('0,8–1,5 сек', '0.8-1.5 sec'),
      },
      {
        param: L('Онлайн-запис', 'Online booking'),
        wp: L('плагін (баги)', 'plugin (buggy)'),
        wix: L('через Apps', 'via Apps'),
        custom: L('кастомна', 'custom'),
      },
      {
        param: L('Інтеграція з мед. CRM', 'Medical CRM integration'),
        wp: L('обмежена', 'limited'),
        wix: L('немає (Zapier)', 'no (Zapier only)'),
        custom: L('будь-яка', 'any'),
      },
      {
        param: L('Локальне SEO', 'Local SEO'),
        wp: L('плагін Yoast', 'Yoast plugin'),
        wix: L('базове', 'basic'),
        custom: L('закладено', 'built-in'),
      },
      {
        param: L('Безпека даних пацієнтів', 'Patient data security'),
        wp: L('низька', 'low'),
        wix: L('середня', 'medium'),
        custom: L('висока (GDPR)', 'high (GDPR)'),
      },
      {
        param: L('Юр. коректність МОЗ', 'Healthcare regulator compliance'),
        wp: L('залежить від теми', 'theme-dependent'),
        wix: L('обмежено', 'limited'),
        custom: L('перевіряємо юристом', 'lawyer-reviewed'),
      },
      {
        param: L('Власність на код', 'Code ownership'),
        wp: L('плагіни WP-екосистема', 'WP plugin ecosystem'),
        wix: L('vendor lock', 'vendor lock'),
        custom: L('у вашому GitHub', 'in your GitHub'),
      },
      {
        param: L('TCO за 3 роки', '3-year TCO'),
        wp: L('$4–6k', '$4-6k'),
        wix: L('$3,5–5k', '$3.5-5k'),
        custom: L('$5–7k', '$5-7k'),
      },
    ],
    pricingHeading: L('Скільки коштує сайт для клініки', 'Pricing for a clinic website'),
    bottomCta: L(
      'Повний прайс і деталі — на /pricing',
      'Full pricing and details — on /en/pricing',
    ),
  },
  faq: {
    heading: FAQ_HEADING,
    items: [
      {
        q: L(
          'Скільки часу займає запуск сайту клініки?',
          'How long does a clinic website launch take?',
        ),
        a: {
          uk: 'Базовий сайт — 4 тижні від брифу до релізу. Розширений з 2-3 інтеграціями — 6 тижнів. Преміум для мережі — 8-10 тижнів. Всі терміни фіксуються в договорі з неустойкою 30% за зрив з нашої вини.',
          en: 'A baseline site — 4 weeks from brief to launch. An extended build with 2-3 integrations — 6 weeks. Premium for a clinic network — 8-10 weeks. All deadlines are fixed in the contract with a 30% rebate if we miss the date through our fault.',
        },
      },
      {
        q: L('Що робити зі старим сайтом?', 'What about the old site?'),
        a: {
          uk: 'Виконуємо повну міграцію без втрати SEO: 301-редиректи з усіх старих URL, перенесення контенту, налаштування Search Console. У 12 з 14 мігрованих сайтів трафік за 3 місяці перевищив попередній рівень.',
          en: 'Full migration without losing SEO: 301 redirects from every old URL, content transfer, Search Console setup. In 12 of 14 migrated sites, traffic surpassed the previous level within 3 months.',
        },
      },
      {
        q: L('Хто наповнюватиме сайт контентом?', 'Who writes the content?'),
        a: {
          uk: 'Базові тексти (про клініку, головна, контакти) — пишемо ми. Опис послуг і лікарів — спільно: ви даєте довідкову інформацію, ми обробляємо під SEO. Якщо контенту немає взагалі — окремий пакет копірайтингу $200/сторінка.',
          en: 'Base content (about, homepage, contact) — we write it. Service descriptions and doctor bios — joint work: you provide raw info, we SEO-edit it. If you have no content at all — separate copywriting package at $200/page.',
        },
      },
      {
        q: L(
          'Які інтеграції з медичними CRM можливі?',
          'What medical CRM integrations are possible?',
        ),
        a: {
          uk: 'Працюємо з Dental4Windows, Medesk, MedAI, Helsi, KeyCRM, AmoCRM, Bitrix24. Якщо у вас своя система — підключаємо через API ($500-1200 залежно від складності).',
          en: 'We work with Dental4Windows, Medesk, MedAI, Helsi, KeyCRM, AmoCRM, Bitrix24. If you use a different system — we connect via API ($500-1200 depending on complexity).',
        },
      },
      {
        q: L('Як захищені дані пацієнтів?', 'How is patient data protected?'),
        a: {
          uk: 'Сайт відповідає GDPR і вимогам Закону про захист персональних даних України. Дані передаються лише в зашифрованих каналах. SSL обовʼязковий. На запит готуємо політику обробки даних під ваші специфічні потреби.',
          en: 'The site is GDPR-compliant and meets Ukraine’s Personal Data Protection Law. Data is only transmitted via encrypted channels. SSL is required. On request, we prepare a data processing policy tailored to your specific needs.',
        },
      },
      {
        q: L('Чи можна розмістити відгуки пацієнтів?', 'Can we publish patient reviews?'),
        a: {
          uk: 'Так, з письмової згоди пацієнта (інакше — порушення тайни). Допомагаємо скласти шаблон згоди. Інтегруємо з Google Reviews і Doctor.ua. Відгуки з фото проходять модерацію перед публікацією.',
          en: 'Yes, with the patient’s written consent (otherwise it’s a confidentiality breach). We help draft the consent template. We integrate with Google Reviews and Doctor.ua. Reviews with photos pass moderation before publishing.',
        },
      },
      {
        q: L(
          'Чи можна за законом розміщувати ціни на медичні послуги?',
          'Is it legal to publish medical service prices?',
        ),
        a: {
          uk: 'Так. Більш того — це обовʼязок медичної організації за наказом МОЗ. Допомагаємо оформити прайс юридично коректно (з примітками про діагностику, можливі додаткові послуги, графік діє з дати).',
          en: 'Yes. In fact, it’s required by Ukraine’s Ministry of Health. We help format the price list legally (with notes about diagnostics, possible additional services, and effective dates).',
        },
      },
      {
        q: L(
          'Чи можна запустити рекламу медичних послуг у Google і Facebook?',
          'Can we run paid ads for medical services on Google and Facebook?',
        ),
        a: {
          uk: 'Так, але з обмеженнями: не можна рекламувати рецептурні препарати, операції, послуги «гарантованого результату». Допомагаємо підготувати сайт так, щоб модерація Google Ads / Meta пройшла без блокувань. Реклама не входить в наш пакет — рекомендуємо перевірених перформанс-маркетологів.',
          en: 'Yes, with restrictions: no ads for prescription drugs, surgeries, or "guaranteed result" services. We prepare the site so Google Ads / Meta moderation passes without bans. Advertising is not part of our package — we recommend vetted performance marketers.',
        },
      },
    ],
  },
  audit: {
    heading: L(
      'Отримайте безкоштовний розбір сайту вашої клініки',
      'Get a free audit of your clinic’s website',
    ),
    sub: L(
      'Залиште посилання на ваш поточний сайт. Протягом 24 годин надішлемо розбір.',
      'Drop a link to your current site. We’ll come back with an audit within 24 hours.',
    ),
    deliverables: [
      L(
        'Список з 7–12 помилок, через які клініка втрачає пацієнтів',
        'A list of 7-12 errors costing the clinic patients',
      ),
      L(
        'Технічний звіт зі швидкості та SEO (PageSpeed + Schema)',
        'Technical report on speed and SEO (PageSpeed + Schema)',
      ),
      L('План покращень з пріоритетами', 'Prioritized improvement plan'),
      L('Орієнтовну вартість переробки або нового сайту', 'Ballpark cost of a rebuild or new site'),
      L('2–3 кейси клінік з нашого портфоліо', '2-3 case studies from our clinic portfolio'),
    ],
    submit: L('Отримати розбір за 24 години', 'Get my audit within 24 hours'),
    disclaim: L(
      'Жодних зобов’язань. Корисно, навіть якщо вирішите працювати з іншим підрядником.',
      'No obligation. Useful even if you choose a different vendor.',
    ),
  },
}

/* ──────────────────────────────────────────────────────────────────────────
 * 2. RENOVATION  (NBYG · København)
 * ──────────────────────────────────────────────────────────────────────── */

const renovation: Industry = {
  slug: 'renovation',
  order: 2,
  title: L(
    'Сайти для ремонтних і будівельних компаній',
    'Websites for renovation & construction companies',
  ),
  seo: {
    title: L(
      'Сайти для ремонтних і будівельних компаній — Code-Site.Art',
      'Websites for renovation & construction companies — Code-Site.Art',
    ),
    description: L(
      'Кастомні сайти для ремонтних і будівельних компаній: калькулятор ціни, галерея «до/після», локальне SEO. Запуск 4–6 тижнів, гарантія 1 рік.',
      'Custom sites for renovation and construction companies: pricing calculator, before/after gallery, local SEO. Live in 4-6 weeks, 1-year warranty.',
    ),
  },
  hero: {
    eyebrow: L(
      'САЙТИ ДЛЯ РЕМОНТНИХ І БУДІВЕЛЬНИХ КОМПАНІЙ · від $3 500',
      'WEBSITES FOR RENOVATION & CONSTRUCTION · from $3,500',
    ),
    heading: L(
      'Ремонтна компанія, до якої *записуються*',
      'A renovation company that *gets bookings*',
    ),
    h1Num: '30+',
    h1NumLabel: L('клієнтів\nна місяць', 'clients\nper month'),
    lede: L(
      'Ви отримуєте сайт ремонтної компанії з працюючим *калькулятором ціни* і галереєю «до/після». Без вашої участі більше ніж 5 годин: контент пишемо ми, фото додасте з телефону потім. Запуск за 4–6 тижнів — і клієнти починають записуватися самі.',
      'You get a renovation site with a working *price calculator* and a before/after gallery. No more than 5 hours of your time: we write the copy, you add photos from your phone later. Live in 4-6 weeks — and clients start booking themselves.',
    ),
    features: [
      L('Калькулятор ціни | за 60 секунд', 'Price calculator | 60 seconds'),
      L('Галерея «до/після» | реальні обʼєкти', 'Before/after gallery | real projects'),
      L('Локальне SEO | під район і місто', 'Local SEO | by neighborhood and city'),
      L('CRM-інтеграція | Bitrix24 · AmoCRM', 'CRM integration | Bitrix24 · AmoCRM'),
    ],
    ctaPrimary: CTA_PRIMARY,
    ctaSecondary: L('Подивитися кейси ремонтів', 'See renovation case studies'),
    stats: [
      {value: '47', label: L('будівельних\nсайтів', 'construction\nsites built')},
      {value: '4.8/5', label: L('середня\nоцінка', 'client\nrating')},
      {value: '×2.4', label: L('більше\nзаявок', 'more\nleads')},
    ],
    tickerItems: [
      L('Косметичний ремонт', 'Cosmetic renovation'),
      L('Капітальний ремонт', 'Major renovation'),
      L('Дизайнерський ремонт', 'Designer renovation'),
      L('Реставрація', 'Restoration'),
      L('Покрівельні роботи', 'Roofing'),
      L('Фасадні роботи', 'Façade'),
      L('Сантехніка', 'Plumbing'),
      L('Електромонтаж', 'Electrical'),
      L('Комерційний ремонт', 'Commercial renovation'),
      L('Ремонт офісів', 'Office fit-out'),
      L('Ремонт ванної', 'Bathroom renovation'),
    ],
    deviceTags: [
      {primary: L('Калькулятор', 'Calculator')},
      {primary: L('До / Після', 'Before / After')},
      {kind: 'good', mini: 'Top-1', primary: L('Google Local', 'Google Local')},
    ],
  },
  reasons: {
    eyebrow: L('ДІАГНОСТИКА · 3 ПРИЧИНИ', 'DIAGNOSIS · 3 REASONS'),
    heading: L(
      '3 причини, чому клієнти\n*не записуються* через ваш сайт',
      '3 reasons clients *don’t book* through your site',
    ),
    metaRow: L(
      'аналіз 47 будівельних сайтів · 2024–25',
      'audit of 47 construction sites · 2024–25',
    ),
    reasons: [
      {
        number: '01',
        tag: L('TRANSPARENCY', 'TRANSPARENCY'),
        title: L(
          'Немає прозорого прайсу і калькулятора',
          'No transparent pricing, no calculator',
        ),
        uk: 'Клієнт не може зрозуміти, чи влізе ремонт у його бюджет — тому йде до конкурента, який показує ціну/м². *70% потенційних клієнтів* зливаються на етапі «зателефонуйте дізнатися ціну».',
        en: 'The client can’t tell if the renovation fits their budget — so they go to a competitor who shows the price per square meter. *70% of potential clients* drop off at the "call to find out the price" stage.',
        stat: {
          value: '70%',
          label: L(
            'клієнтів зливаються на «зателефонуйте дізнатися ціну»',
            'of clients drop off at "call us for a quote"',
          ),
        },
      },
      {
        number: '02',
        tag: L('TRUST', 'TRUST'),
        title: L(
          'Шаблонні фото і відсутність кейсів «до/після»',
          'Stock photos and no before/after cases',
        ),
        uk: 'Сторінка послуг з картинками з фотобанку. Жодного реального обʼєкта з адресою. Клієнт думає: «А ви взагалі робите ремонти, чи лише посередник?». *Без живих кейсів немає довіри*.',
        en: 'A services page with stock images. Not a single real project with an address. The client thinks: "Do you actually do renovations, or are you just a middleman?" *Without real cases there’s no trust*.',
        stat: {
          value: '0',
          label: L(
            'реальних обʼєктів у портфоліо більшості сайтів',
            'real projects in most sites’ portfolios',
          ),
        },
      },
      {
        number: '03',
        tag: L('VISIBILITY', 'VISIBILITY'),
        title: L(
          'Сайт не виходить у Google по «ремонт + район»',
          'The site doesn’t rank for "renovation + neighborhood" in Google',
        ),
        uk: 'Загальна сторінка про «всі види ремонту», без розбивки по районах і типах. *Конкуренти з лендингами* «ремонт квартир Печерськ» забирають весь локальний трафік.',
        en: 'A single page about "all renovation types" with no breakdown by neighborhood and category. *Competitors with landings* like "apartment renovation, Pechersk district" capture all the local traffic.',
        stat: {
          value: 'top-50',
          label: L(
            'позиція більшості будівельних сайтів у локальному пошуку',
            'average position of construction sites in local search',
          ),
        },
      },
    ],
    footText: L(
      'Це 3 найпоширеніші. На ваш конкретний сайт — 5–7. Безкоштовний аудит покаже свої.',
      'These are the 3 most common. On your specific site there are 5-7. A free audit shows yours.',
    ),
    footCtaLabel: L('Перевірити мій сайт', 'Audit my site'),
  },
  case: {
    eyebrow: L('РЕАЛЬНИЙ КЕЙС', 'REAL CASE'),
    eyebrowEm: L('NBYG · КОПЕНГАГЕН, ДАНІЯ', 'NBYG · COPENHAGEN, DENMARK'),
    heading: L(
      'До / Після на прикладі реального клієнта',
      'Before / After — a real client case',
    ),
    lede: L(
      'Будівельна компанія NBYG з Копенгагена звернулася з типовою проблемою: сайт-візитка на старій CMS, який не приносить заявок і не індексується по локальним запитам. Завдання — переробити структуру під послуги, додати калькулятор і вийти в топ Google по «nyt tag København».',
      'NBYG, a construction company from Copenhagen, came to us with a typical problem: a brochure site on an old CMS that didn’t bring leads and didn’t rank for local queries. The task: rebuild around services, add a calculator, and get to the top of Google for "nyt tag København".',
    ),
    meta: [
      {strong: L('6 тижнів', '6 weeks'), text: L('від брифу до релізу', 'brief to launch')},
      {
        strong: L('Покрівля + фасад', 'Roofing + façade'),
        text: L('два пріоритетні напрямки', 'two priority lines'),
      },
      {strong: L('DA + EN', 'DA + EN'), text: L('локалізація під SEO', 'localized SEO')},
    ],
    before: {
      num: 'NBYG · v1 · 2022',
      url: 'legacy site',
      heading: L(
        '× Сайт-візитка без посадочних',
        '× A brochure site with no landing pages',
      ),
      bullets: [
        L(
          'Загальний сайт без окремих лендингів під послуги',
          'Generic site without dedicated service landings',
        ),
        L(
          'Не ранжувався в Google по «nyt tag København»',
          'Didn’t rank in Google for "nyt tag København"',
        ),
        L('Не було калькулятора ціни даху', 'No roof price calculator'),
        L('Замовлення тільки через дзвінок або email', 'Bookings only via phone or email'),
        L(
          'Адмінка через старий CMS — будь-яка зміна = розробник',
          'Admin on an old CMS — any change required a developer',
        ),
        L('Жодного локального SEO під район', 'No local SEO by neighborhood'),
      ],
      foot: L(
        'Результат: заявки 3–5 на місяць, з тих що дзвонять.',
        'Result: 3-5 leads per month, only from people who called.',
      ),
    },
    after: {
      num: 'NBYG · v2 · 2024',
      url: 'nbygkbenhavn.dk/byggeydelser/tag',
      heading: L(
        '✓ Лендинг під послугу «новий дах»',
        '✓ A landing page for "new roof"',
      ),
      bullets: [
        L(
          'Окремі лендинги під кожну послугу (новий дах, фасад, утеплення)',
          'Dedicated landings per service (new roof, façade, insulation)',
        ),
        L(
          'Online-калькулятор з 4 типами дахів і ціною/м²',
          'Online calculator with 4 roof types and price per m²',
        ),
        L(
          'Локальне SEO: топ-1 у Google по «nyt tag København»',
          'Local SEO: top-1 in Google for "nyt tag København"',
        ),
        L(
          'Онлайн-форма безкоштовного огляду + Calendly',
          'Free inspection form + Calendly',
        ),
        L(
          'Sanity CMS для самостійних правок без розробника',
          'Sanity CMS for self-serve edits — no developer',
        ),
        L(
          'Schema.org LocalBusiness + Google Business Profile',
          'Schema.org LocalBusiness + Google Business Profile',
        ),
      ],
      foot: L(
        'Результат: заявки 24+ на місяць, ×6 органічного трафіку.',
        'Result: 24+ leads per month, 6× organic traffic.',
      ),
    },
    results: [
      {
        value: '×6',
        tag: L('SEO · 6 МІС.', 'SEO · 6 MO.'),
        label: L('органічного трафіку Google', 'organic Google traffic'),
      },
      {
        value: '0.8c',
        tag: L('PERFORMANCE', 'PERFORMANCE'),
        label: L('LCP головної сторінки', 'homepage LCP'),
      },
      {
        value: 'Top-1',
        tag: L('LOCAL SEO', 'LOCAL SEO'),
        label: L('по «nyt tag København»', 'for "nyt tag København"'),
      },
      {
        value: '×4.8',
        tag: L('CONVERSION', 'CONVERSION'),
        label: L('більше заявок з сайту', 'more leads from the site'),
      },
    ],
  },
  outcome: {
    recapText: L(
      'Ваш сайт має продавати ремонти, поки ви на обʼєкті.',
      'Your site should sell renovations while you’re on a job site.',
    ),
    directionsTitle: L(
      'Працюємо з компаніями будь-якого розміру',
      'We work with renovation companies of every size',
    ),
    directionsLede: L(
      'Підхід відрізняється для соло-майстра і компанії з кількома послугами. Тарифи нижче — під обидва сценарії.',
      'The approach differs for a solo specialist and a company with multiple services. The pricing tiers below cover both scenarios.',
    ),
    audienceCards: [
      {
        title: L('Соло-майстер · 1 спеціалізація', 'Solo specialist · 1 service line'),
        bullets: [
          L(
            'Покрівельник, плиточник, електрик або штукатур',
            'Roofer, tiler, electrician, or plasterer',
          ),
          L(
            '1 послуга, локальне SEO, прості заявки з форми',
            '1 service, local SEO, simple form leads',
          ),
          L('Базовий пакет — Industry Pro', 'Industry Pro tier fits'),
        ],
      },
      {
        title: L('Ремонтна компанія · 3-7 послуг', 'Renovation company · 3-7 services'),
        bullets: [
          L('Косметичний, капітальний, дизайнерський + супутні', 'Cosmetic, major, designer + adjacent'),
          L('Окремий лендинг під кожен тип ремонту', 'A dedicated landing for each renovation type'),
          L('Розширений пакет — Pro Plus', 'Pro Plus tier fits'),
        ],
      },
    ],
    benefitsHeading: L('Як це працює на сайті', 'How it shows up on the site'),
    benefitRows: [
      {
        feature: 'FEATURE · 01 / 03',
        heading: L(
          'Заявки приходять у вихідні і вечорами',
          'Leads come in on weekends and evenings',
        ),
        bullets: [
          L(
            'Клієнт залишає номер о 22:00 — ви передзвонюєте зранку',
            'The client leaves their number at 10 pm — you call back in the morning',
          ),
          L(
            'Не втрачаєте людей, які пишуть, коли ви на обʼєкті',
            'You stop losing people who reach out while you’re on site',
          ),
          L(
            'SMS / Telegram / WhatsApp — кожна заявка фіксується в CRM',
            'SMS / Telegram / WhatsApp — every lead lands in CRM',
          ),
        ],
        mockType: 'booking',
      },
      {
        feature: 'FEATURE · 02 / 03',
        heading: L(
          'Прайс на сайті = менше дзвінків з питанням «скільки»',
          'Pricing on the site = fewer "how much" calls',
        ),
        bullets: [
          L(
            'Клієнт сам розраховує орієнтовну ціну в калькуляторі',
            'Clients self-estimate the ballpark via the calculator',
          ),
          L(
            'Хто не вписується в бюджет — відсіюється сам, не висить на телефоні',
            'Out-of-budget visitors filter themselves out — they don’t hang on your phone',
          ),
          L(
            'Хто вписується — приходить уже готовий обговорювати деталі',
            'In-budget visitors arrive ready to discuss details',
          ),
        ],
        mockType: 'pages',
        mockTags: [
          L('Калькулятор', 'Calculator'),
          L('PDF-розрахунок', 'PDF estimate'),
        ],
      },
      {
        feature: 'FEATURE · 03 / 03',
        heading: L(
          'Реальні кейси замість шаблонних фото з фотобанку',
          'Real projects instead of stock photos',
        ),
        bullets: [
          L(
            'Адреса, метраж, бюджет, термін — конкретно по кожному обʼєкту',
            'Address, square meters, budget, timeline — specific per project',
          ),
          L(
            'Фото «до/після» переконують краще за будь-які тексти',
            'Before/after photos convince better than any copy',
          ),
          L(
            'Додаєте новий кейс з телефону прямо з обʼєкта (без розробника)',
            'You add new projects from your phone, right from the job site (no developer)',
          ),
        ],
        mockType: 'admin',
      },
    ],
  },
  testimonial: {
    quote: L(
      'Перший лід прийшов на наступний день після запуску. Через 3 місяці заявок було стільки, що ми перестали брати маленькі обʼєкти.',
      'Our first lead came the day after launch. Three months in, we had so many leads we stopped taking small jobs.',
    ),
    authorName: 'Søren Hansen',
    authorInitials: 'SH',
    authorRole: L('Owner, NBYG København Aps', 'Owner, NBYG København Aps'),
  },
  services: {
    heading: L('Що отримуєте з сайтом від нас', 'What you get with a site from us'),
    sub: L(
      'Не tech-демо. Конкретні штуки, які приводять клієнтів і економлять ваш час.',
      'Not a tech demo. Concrete things that bring clients and save your time.',
    ),
    features: [
      {
        title: L('Онлайн-запис на безкоштовний замір', 'Online booking for a free estimate'),
        bullets: [
          L('Клієнт бачить вільні слоти майстра і обирає сам', 'The client sees available slots and picks one'),
          L('SMS-нагадування за 24 години і за 1 годину', 'SMS reminders 24 hours and 1 hour before'),
          L('Геолокація вибудовує оптимальний маршрут на день', 'Geolocation builds the optimal route for the day'),
          L('Замовник не дзвонить «Чи на 14:00 ще вільно?»', 'No more "is 2 pm still open?" calls'),
        ],
      },
      {
        title: L('Галерея «до/після» з адресами', 'Before/after gallery with addresses'),
        bullets: [
          L('Кожен обʼєкт — окрема сторінка з фото, метражем, бюджетом', 'Every project — its own page with photos, square meters, budget'),
          L('Фільтр за типом і стилем (косметичний / лофт / класика)', 'Filter by type and style (cosmetic / loft / classic)'),
          L('Кейси індексуються в Google — додатковий трафік', 'Cases indexed in Google — extra traffic'),
          L('Адмінка щоб додавати з телефону прямо з обʼєкта', 'Admin lets you add projects from your phone on site'),
        ],
      },
      {
        title: L('Калькулятор ціни ремонту', 'Renovation price calculator'),
        bullets: [
          L('Клієнт обирає тип ремонту, метраж, район', 'Client picks renovation type, square meters, neighborhood'),
          L('Бачить вилку «від — до» з привʼязкою до району', 'Sees a "from–to" range tied to the neighborhood'),
          L('Залишає email — приходить детальний прайс у PDF', 'Leaves email — gets a detailed PDF estimate'),
          L('Ви отримуєте лід уже з відомим бюджетом', 'You receive a lead already with a known budget'),
        ],
      },
      {
        title: L('Проста адмінка (без розробника)', 'Simple admin (no developer needed)'),
        bullets: [
          L('Додаєте новий кейс — заходите з телефону, заливаєте 5 фото', 'Add a new project from your phone, upload 5 photos'),
          L('Редагуєте описи послуг, новини, акції', 'Edit service descriptions, news, promotions'),
          L('Без помісячної оплати розробнику', 'No monthly developer fees'),
          L('Навчання на годинному Zoom-дзвінку', 'Training on a 1-hour Zoom call'),
        ],
      },
      {
        title: L('Окремі лендинги під типи ремонту', 'Dedicated landings per renovation type'),
        bullets: [
          L('Косметичний / капітальний / дизайнерський — окремі сторінки', 'Cosmetic / major / designer — separate pages'),
          L('Кожна сторінка під свій SEO-запит', 'Each page tuned to its own SEO query'),
          L('Окрема лід-форма під кожен тип', 'Separate lead form per type'),
          L('Окремі кейси під кожен тип', 'Separate cases per type'),
        ],
      },
      {
        title: L('Локальне SEO + Google Maps', 'Local SEO + Google Maps'),
        bullets: [
          L(
            'Сайт виходить у Google по «ремонт + район» (Поділ, Печерськ і т.д.)',
            'Rank in Google for "renovation + neighborhood" (Podil, Pechersk, etc.)',
          ),
          L('Schema.org LocalBusiness — повна розмітка', 'Full Schema.org LocalBusiness markup'),
          L('Google Business Profile налаштовуємо', 'Google Business Profile setup'),
          L('Сторінки під 5+ районів/міст', 'Landings for 5+ neighborhoods/cities'),
        ],
      },
    ],
    integrationsHeading: L(
      'Підключаємо всі профільні системи',
      'We connect every renovation industry tool',
    ),
    integrationsSub: L(
      'Заявка з калькулятора або форми попадає одразу у вашу CRM. Прораб отримує сповіщення в Telegram. Клієнт — SMS-підтвердження візиту замірника. Жодних втрачених лідів через листи у спамі.',
      'Leads from the calculator or form go straight to your CRM. The foreman gets a Telegram alert. The client gets an SMS confirmation for the inspection visit. Zero leads lost to spam folders.',
    ),
    integrations: [
      'Bitrix24',
      'AmoCRM',
      'KeyCRM',
      'Calendly',
      'Google Maps',
      'Google Business Profile',
      'Planoplan',
      'SweetHome3D',
      'WayForPay',
      'LiqPay',
      'Telegram',
    ],
    bottomCallouts: [
      L(
        'Mobile-friendly адмінка · додаєте кейси з телефону прямо з обʼєкта',
        'Mobile-friendly admin · add cases from your phone on site',
      ),
      L(
        'Окремі лендинги під косметичний/капітальний/дизайнерський',
        'Separate landings for cosmetic/major/designer renovations',
      ),
      L(
        'Виходимо в топ Google по «ремонт + район»',
        'Rank top of Google for "renovation + neighborhood"',
      ),
    ],
  },
  comparison: {
    heading: L(
      'Чим кодовий сайт кращий за шаблонну ремонтну компанію на WordPress або Wix',
      'Why a custom-coded renovation site beats a WordPress or Wix template',
    ),
    rows: [
      {
        param: L('Калькулятор ціни', 'Price calculator'),
        wp: L('плагін (баги)', 'plugin (buggy)'),
        wix: L('через Apps', 'via Apps'),
        custom: L('кастомний', 'custom'),
      },
      {
        param: L('Галерея «до/після»', 'Before/after gallery'),
        wp: L('статичні фото', 'static photos'),
        wix: L('базова галерея', 'basic gallery'),
        custom: L('з фільтрами', 'with filters'),
      },
      {
        param: L('Локальне SEO', 'Local SEO'),
        wp: L('плагін Yoast', 'Yoast plugin'),
        wix: L('базове', 'basic'),
        custom: L('закладено', 'built-in'),
      },
      {
        param: L('Інтеграція з CRM', 'CRM integration'),
        wp: L('обмежена', 'limited'),
        wix: L('через Zapier', 'via Zapier'),
        custom: L('будь-яка', 'any'),
      },
      {
        param: L('Окремі лендинги під послуги', 'Service-specific landings'),
        wp: L('одна сторінка', 'single page'),
        wix: L('одна сторінка', 'single page'),
        custom: L('під кожен тип', 'one per type'),
      },
      {
        param: L('Швидкість завантаження', 'Loading speed'),
        wp: L('3–5 сек', '3-5 sec'),
        wix: L('2–4 сек', '2-4 sec'),
        custom: L('< 1 сек', '< 1 sec'),
      },
      {
        param: L('Власність на код', 'Code ownership'),
        wp: L('vendor lock', 'vendor lock'),
        wix: L('vendor lock', 'vendor lock'),
        custom: L('ваш GitHub', 'your GitHub'),
      },
      {
        param: L('Гарантія', 'Warranty'),
        wp: L('немає', 'none'),
        wix: L('немає', 'none'),
        custom: L('1 рік + неустойка 30%', '1 year + 30% rebate'),
      },
    ],
    pricingHeading: L(
      'Скільки коштує сайт ремонтної компанії',
      'Pricing for a renovation company website',
    ),
    bottomCta: L(
      'Повний прайс і деталі — на /pricing',
      'Full pricing and details — on /en/pricing',
    ),
  },
  faq: {
    heading: FAQ_HEADING,
    items: [
      {
        q: L(
          'За скільки заявок цей сайт окупиться?',
          'How many leads does this site need to pay back?',
        ),
        a: {
          uk: 'Залежно від середнього чеку. Якщо середній обʼєкт — $3,000, то 2-3 заявки покривають базовий пакет Industry Pro ($3,500). За даними по 47 проєктам, окупність — 2-4 місяці після запуску.',
          en: 'Depends on average ticket size. If your average project is $3,000 then 2-3 leads cover the Industry Pro tier ($3,500). Based on 47 projects, payback is 2-4 months after launch.',
        },
      },
      {
        q: L(
          'Я вже один раз втратив гроші на сайт — як зрозуміти, що цей запрацює?',
          'I already lost money on a website once — how do I know this one will work?',
        ),
        a: {
          uk: 'Фіксована сума в договорі + неустойка 30% за зрив термінів. Перші 3 кейси наповнюємо ми — щоб запустити SEO відразу. Гарантія 1 рік на бaги. Якщо за 3 місяці після запуску не приходить мінімум 10 заявок з Google — повертаємо 30% від ціни.',
          en: 'Fixed sum in the contract + 30% rebate for missed deadlines. We populate the first 3 cases ourselves — to launch SEO immediately. 1-year bug warranty. If you get fewer than 10 leads from Google in the 3 months after launch, we refund 30% of the price.',
        },
      },
      {
        q: L('Скільки часу від мене потрібно?', 'How much of my time is required?'),
        a: {
          uk: '5 годин загалом, розкидано на 4-6 тижнів. 30 хв на бриф, 2 раунди правок дизайну по 1 годині кожен, фінальне затвердження. Контент пишемо ми на основі ваших матеріалів.',
          en: '5 hours total, spread across 4-6 weeks. 30 min on the brief, 2 rounds of design revisions at 1 hour each, final approval. We write the content based on your input.',
        },
      },
      {
        q: L(
          'Я не маю гарних фото з обʼєктів — це проблема?',
          'I don’t have good photos of my projects — is that a problem?',
        ),
        a: {
          uk: 'На запуску — ні. Працюємо з тим, що є, plus фото з фотобанку (з підписом). Через 2-3 місяці у вас вже будуть нові обʼєкти — додаєте з телефону через адмінку. Якщо потрібна професійна зйомка одразу — рекомендуємо перевіреного фотографа.',
          en: 'At launch — no. We work with what you have, plus stock photos (with captions). Within 2-3 months you’ll have new projects — add them from your phone via the admin. If you want professional shoots at launch — we recommend a trusted photographer.',
        },
      },
      {
        q: L(
          'Чи можу я редагувати сайт сам після запуску?',
          'Can I edit the site myself after launch?',
        ),
        a: {
          uk: 'Так. Sanity CMS — інтерфейс на рівні Tilda за простотою. Годинне навчання на Zoom-дзвінку при handover. Можна додавати кейси, послуги, новини, акції, лікарів/майстрів — все з телефону.',
          en: 'Yes. Sanity CMS — Tilda-level simplicity. 1-hour Zoom training at handover. You can add cases, services, news, promotions, and specialists — all from your phone.',
        },
      },
    ],
  },
  audit: {
    heading: L(
      'Безкоштовний аудит сайту вашої ремонтної компанії',
      'Free audit of your renovation company website',
    ),
    sub: L(
      'Залиште посилання на ваш поточний сайт. Протягом 3 робочих днів надішлемо звіт у PDF.',
      'Drop a link to your current site. We’ll send a PDF report within 3 business days.',
    ),
    deliverables: [
      L(
        'SEO-аудит: топ-50 ключових запитів вашого регіону',
        'SEO audit: top 50 keywords for your region',
      ),
      L(
        'CRO-перевірка: 12 точок втрати конверсії',
        'CRO check: 12 conversion-loss points',
      ),
      L(
        'Технічний аудит: швидкість, mobile, schema.org',
        'Technical audit: speed, mobile, schema.org',
      ),
      L('План покращень з пріоритетами', 'Prioritized improvement plan'),
      L(
        'Орієнтовну вартість переробки або нового сайту',
        'Ballpark cost of a rebuild or new site',
      ),
    ],
    submit: L('Отримати безкоштовний аудит', 'Get my free audit'),
    disclaim: L(
      'Без зобовʼязань. Не навʼязуємо послуги. Корисно, навіть якщо вирішите працювати з іншим підрядником.',
      'No obligation. We don’t pitch. Useful even if you choose a different vendor.',
    ),
  },
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3. LEGAL  (Sytnykov)
 * ──────────────────────────────────────────────────────────────────────── */

const legal: Industry = {
  slug: 'legal',
  order: 3,
  title: L(
    'Сайти для юридичних фірм і адвокатів',
    'Websites for law firms & attorneys',
  ),
  seo: {
    title: L(
      'Сайти для юридичних фірм і адвокатів — Code-Site.Art',
      'Websites for law firms & attorneys — Code-Site.Art',
    ),
    description: L(
      'Кастомні сайти для юридичних фірм, адвокатських бюро і приватних юристів. Структурований контент, онлайн-консультації, локальне SEO. Кейс: Sytnykov.',
      'Custom sites for law firms, attorney offices, and solo practitioners. Structured content, online consults, local SEO. Case: Sytnykov.',
    ),
  },
  hero: {
    eyebrow: L(
      'САЙТИ ДЛЯ ЮРИДИЧНОЇ ГАЛУЗІ · від $3 500',
      'WEBSITES FOR LEGAL · from $3,500',
    ),
    heading: L(
      'Юридична фірма, до якої *звертаються*',
      'A law firm that *gets inquiries*',
    ),
    h1Num: '20+',
    h1NumLabel: L('клієнтів\nна місяць', 'clients\nper month'),
    lede: L(
      'Сайт юр-фірми, де структуру і контент будували навколо клієнта, а не юриста. Без вашої участі більше ніж 5 годин: тексти пишемо ми, юридичну редактуру робите за 1 годину. Запуск за 4–8 тижнів — і клієнти знаходять вас через Google по *конкретних запитах*.',
      'A law firm site built around the client, not the lawyer. No more than 5 hours of your time: we write the copy, you legal-review it in 1 hour. Live in 4-8 weeks — and clients find you via Google for *specific queries*.',
    ),
    features: [
      L('Структурований контент | під кожну практику', 'Structured content | per practice area'),
      L('Онлайн-консультації | Calendly · Zoom', 'Online consults | Calendly · Zoom'),
      L('E-signature | Diia.Sign · DocuSign', 'E-signature | Diia.Sign · DocuSign'),
      L('Локальне SEO | під місто і галузь', 'Local SEO | by city and area'),
    ],
    ctaPrimary: CTA_PRIMARY,
    ctaSecondary: L('Подивитися юр-кейси', 'See legal case studies'),
    stats: [
      {value: '47', label: L('юр-\nпроєктів', 'legal\nprojects')},
      {value: '4.9/5', label: L('оцінка\nклієнтів', 'client\nrating')},
      {value: '×3.2', label: L('більше\nконсультацій', 'more\nconsultations')},
    ],
    tickerItems: [
      L('Корпоративне право', 'Corporate law'),
      L('Сімейне право', 'Family law'),
      L('Кримінальне право', 'Criminal law'),
      L('Податкове право', 'Tax law'),
      L('Нерухомість', 'Real estate'),
      L('Інтелектуальна власність', 'IP'),
      L('Імміграційне', 'Immigration'),
      L('Трудове', 'Labor'),
      L('Споживчий захист', 'Consumer protection'),
      L('Адвокатські бюро', 'Attorney offices'),
      L('Приватні юристи', 'Solo lawyers'),
    ],
    deviceTags: [
      {primary: L('Calendly · Zoom', 'Calendly · Zoom')},
      {primary: L('Diia.Sign', 'Diia.Sign')},
      {kind: 'good', mini: 'Top-3', primary: L('Google · UA', 'Google · UA')},
    ],
  },
  reasons: {
    eyebrow: L('ДІАГНОСТИКА · 3 ПРИЧИНИ', 'DIAGNOSIS · 3 REASONS'),
    heading: L(
      '3 причини, чому клієнти\n*не звертаються* через ваш сайт',
      '3 reasons clients *don’t reach out* through your site',
    ),
    metaRow: L(
      'аналіз 30+ юридичних сайтів · 2024–25',
      'audit of 30+ legal sites · 2024–25',
    ),
    reasons: [
      {
        number: '01',
        tag: L('STRUCTURE', 'STRUCTURE'),
        title: L(
          'Сайт побудований навколо юриста, а не клієнта',
          'Built around the lawyer, not the client',
        ),
        uk: 'Головна сторінка — «Про мене, мій досвід, мої регалії». Клієнт прийшов з проблемою «спір з податковою» — і не може знайти, чи ви беретеся за податкові спори. *Закриває сайт за 8 секунд*.',
        en: 'The homepage is "About me, my experience, my credentials." The client arrived with a "tax dispute" problem — and can’t tell if you handle tax disputes. *Closes the site in 8 seconds*.',
        stat: {
          value: '8s',
          label: L(
            'середній час на юридичному сайті без структурованих практик',
            'average time on a legal site without structured practice pages',
          ),
        },
      },
      {
        number: '02',
        tag: L('CREDIBILITY', 'CREDIBILITY'),
        title: L(
          'Текст «адвокат з 20 років досвіду» — порожні слова',
          '"Lawyer with 20 years of experience" — empty words',
        ),
        uk: 'На сайті — фото в костюмі, цитата про «індивідуальний підхід», диплом КНУ. Жодного конкретного кейсу: який спір вирішили, на якій сумі, в якій інстанції. *Без цього клієнт вибирає не вас*.',
        en: 'The site has a suit-and-tie photo, a quote about "individual approach," a university diploma. Not a single concrete case: what dispute, what amount, what court level. *Without those, the client doesn’t pick you*.',
        stat: {
          value: '×4',
          label: L(
            'вища конверсія у юр-сайтів з реальними кейсами і сумами',
            'higher conversion on legal sites with real cases and amounts',
          ),
        },
      },
      {
        number: '03',
        tag: L('VISIBILITY', 'VISIBILITY'),
        title: L(
          'Сайт не індексується по запиту «адвокат + спеціалізація + місто»',
          'Site doesn’t rank for "lawyer + specialty + city"',
        ),
        uk: 'Одна загальна сторінка «послуги» з переліком 15 практик. Кожна практика — 2-3 рядки тексту. *Конкурент з 30 окремими сторінками-лендингами* по конкретних запитах забирає весь трафік.',
        en: 'A single "services" page listing 15 practice areas. Each area gets 2-3 lines of text. *A competitor with 30 dedicated landings* per specific query takes all the traffic.',
        stat: {
          value: 'top-50',
          label: L(
            'позиція в Google для більшості юр-сайтів',
            'average Google position for most legal sites',
          ),
        },
      },
    ],
    footText: L(
      'Виправляємо *всі три* за 4-8 тижнів.',
      'We fix *all three* in 4-8 weeks.',
    ),
    footCtaLabel: L('Перевірити мій сайт', 'Audit my site'),
  },
  case: {
    eyebrow: L('РЕАЛЬНИЙ КЕЙС', 'REAL CASE'),
    eyebrowEm: L('SYTNYKOV', 'SYTNYKOV'),
    heading: L(
      'До / Після на прикладі реального клієнта',
      'Before / After — a real client case',
    ),
    lede: L(
      'До нас звернувся відставний суддя Верховного Суду України Ситников Олександр. Завдання було складне: структурувати багатоплановий контент — судову практику, наукові публікації, авторські курси з кримінально-процесуального права — і вивести все це в Google по конкретних запитах двома мовами.',
      'Oleksandr Sytnykov, a retired justice of the Supreme Court of Ukraine, came to us with a complex task: structure multi-layered content — his judicial practice, academic publications, and signature courses on criminal procedure — and rank for specific queries in two languages on Google.',
    ),
    meta: [
      {strong: L('8 тижнів', '8 weeks'), text: L('від брифу до релізу', 'brief to launch')},
      {
        strong: L('3 розділи', '3 sections'),
        text: L('практика + публікації + курси', 'practice + publications + courses'),
      },
      {strong: L('UA + EN', 'UA + EN'), text: L('bilingual SEO', 'bilingual SEO')},
    ],
    before: {
      num: 'SYTNYKOV · v1 · 2023',
      url: 'legacy WordPress',
      heading: L(
        '× Хаотичний WordPress з 15-ма категоріями',
        '× Chaotic WordPress with 15 categories',
      ),
      bullets: [
        L(
          'Біографія, регалії, нагороди — на 6 окремих сторінках без зв’язків',
          'Bio, credentials, awards spread across 6 disconnected pages',
        ),
        L(
          'Наукові публікації звалені в одну категорію по 80+ статей',
          '80+ academic articles dumped into a single category',
        ),
        L(
          'Курси не виходили в пошук — ховалися за фільтром «навчання»',
          'Courses didn’t surface in search — hidden behind a "training" filter',
        ),
        L(
          'Багатомовність через плагін, який періодично ламався',
          'Multi-language via a plugin that broke regularly',
        ),
        L(
          'Не було fragment-навігації, не було table of contents у довгих статтях',
          'No fragment navigation, no table of contents in long articles',
        ),
        L(
          'SEO нуль: одна meta description на весь сайт',
          'Zero SEO: one meta description for the entire site',
        ),
      ],
      foot: L(
        'Результат: 1-2 запиту на місяць, переважно через прямі рекомендації.',
        'Result: 1-2 inquiries per month, mostly via direct referrals.',
      ),
    },
    after: {
      num: 'SYTNYKOV · v2 · 2024',
      url: 'sitnikov.com.ua',
      heading: L(
        '✓ Структура під 3 типи відвідувачів',
        '✓ Structure for 3 visitor types',
      ),
      bullets: [
        L(
          'Окремий розділ для клієнтів (юр-консультації, кейси)',
          'Dedicated section for clients (consultations, cases)',
        ),
        L(
          'Окремий — для академічної спільноти (публікації з тегами, цитованість)',
          'Dedicated section for academia (publications with tags, citation counts)',
        ),
        L(
          'Окремий — для студентів і фахівців (курси з програмою, відгуками, оплатою)',
          'Dedicated section for students and specialists (courses with syllabus, reviews, payments)',
        ),
        L(
          'Bilingual з власною URL-структурою для кожної мови',
          'Bilingual with separate URL structure per language',
        ),
        L('Table of contents автоматичний у довгих текстах', 'Automatic table of contents in long texts'),
        L(
          'Schema.org Person + ProfessionalService + Course',
          'Schema.org Person + ProfessionalService + Course',
        ),
        L(
          'Локальне SEO: топ-3 по «адвокат кримінально-процесуальне право Київ»',
          'Local SEO: top-3 for "criminal procedure attorney Kyiv"',
        ),
      ],
      foot: L(
        'Результат: 20+ консультацій на місяць, окрема воронка під курси (стабільно 12-18 продажів/місяць).',
        'Result: 20+ consultations per month, separate course funnel (steady 12-18 sales/month).',
      ),
    },
    results: [
      {value: '×10', tag: L('INQUIRIES', 'INQUIRIES'), label: L('зростання запитів через сайт', 'inquiry growth via the site')},
      {value: '×8', tag: L('SEO · 12 МІС', 'SEO · 12 MO'), label: L('органічного трафіку', 'organic traffic')},
      {value: '$25k+', tag: L('COURSES', 'COURSES'), label: L('річний дохід з онлайн-курсів', 'annual online course revenue')},
      {value: 'UA + EN', tag: L('BILINGUAL', 'BILINGUAL'), label: L('пошук в обох мовах', 'search in both languages')},
    ],
  },
  outcome: {
    recapText: L(
      'Ваш сайт має продавати ваш досвід, а не описувати його.',
      'Your site should sell your expertise, not describe it.',
    ),
    directionsTitle: L(
      'Працюємо з юр-фірмами будь-якого формату',
      'We work with law firms of every format',
    ),
    directionsLede: L(
      'Підхід відрізняється для соло-адвоката і фірми з кількома партнерами. Тарифи нижче — під обидва сценарії.',
      'The approach differs for a solo attorney and a multi-partner firm. The pricing tiers below cover both scenarios.',
    ),
    audienceCards: [
      {
        title: L('Приватний юрист / адвокат', 'Solo attorney / private lawyer'),
        bullets: [
          L('1-3 практики, особистий бренд', '1-3 practice areas, personal brand'),
          L('Лендинги під ключові практики + блог', 'Landings per key practice + blog'),
          L('Calendly для онлайн-консультацій', 'Calendly for online consults'),
          L('Базовий пакет — Industry Pro', 'Industry Pro tier fits'),
        ],
      },
      {
        title: L('Юр-фірма / адвокатське бюро', 'Law firm / attorney office'),
        bullets: [
          L('5-15 практик, кілька юристів, кейс-стаді', '5-15 practice areas, multiple attorneys, case studies'),
          L('Окремі каталоги юристів, кейсів, статей, новин', 'Separate catalogs for attorneys, cases, articles, news'),
          L('Розширені інтеграції (Clio, MyCase, KeyCRM)', 'Extended integrations (Clio, MyCase, KeyCRM)'),
          L('Розширений пакет — Pro Plus', 'Pro Plus tier fits'),
        ],
      },
    ],
    benefitsHeading: L('Як це працює на сайті', 'How it shows up on the site'),
    benefitRows: [
      {
        feature: 'FEATURE · 01 / 03',
        heading: L('Окремі лендинги під кожну практику', 'Dedicated landings per practice area'),
        bullets: [
          L('"Захист бізнесу від рейдерства" — окрема сторінка', '"Protecting business from raider attacks" — its own page'),
          L('"Спадщина за кордоном" — окрема сторінка', '"Inheritance abroad" — its own page'),
          L('Кожна сторінка під свій ключовий запит', 'Each page tuned to its own keyword'),
          L('Окрема форма консультації під кожен напрямок', 'Separate consultation form per practice'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Корпоративне', 'Corporate'),
          L('Сімейне', 'Family'),
          L('Податкове', 'Tax'),
        ],
      },
      {
        feature: 'FEATURE · 02 / 03',
        heading: L('Реальні кейси з сумами і інстанціями', 'Real cases with amounts and court levels'),
        bullets: [
          L('Тип спору, сума, тривалість, результат', 'Dispute type, amount, duration, outcome'),
          L('Анонімізація клієнта (інакше — порушення тайни)', 'Client anonymization (otherwise — confidentiality breach)'),
          L('Фільтр за галуззю + інстанцією', 'Filter by area + court level'),
          L('Лід-форма "схожий кейс?" внизу', '"Similar case?" lead form at the bottom'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Кейс', 'Case'),
          L('Сума', 'Amount'),
          L('Результат', 'Outcome'),
        ],
      },
      {
        feature: 'FEATURE · 03 / 03',
        heading: L('Онлайн-консультації через Calendly', 'Online consults via Calendly'),
        bullets: [
          L('Клієнт обирає тип консультації, час, формат', 'Client picks consultation type, time, format'),
          L('Оплата на сайті (Stripe / LiqPay / WayForPay)', 'Payment on the site (Stripe / LiqPay / WayForPay)'),
          L('Договір про конфіденційність через Diia.Sign', 'NDA via Diia.Sign or DocuSign'),
          L('Zoom-лінк автоматично', 'Zoom link sent automatically'),
        ],
        mockType: 'booking',
      },
    ],
  },
  testimonial: {
    quote: L(
      'За 6 місяців після запуску сайту я отримав більше клієнтів, ніж за попередні 2 роки. Окрема воронка під курси стала окремим бізнесом.',
      'Six months after launch I got more clients than in the previous two years combined. The separate course funnel became a business of its own.',
    ),
    authorName: 'Олександр Ситников / Oleksandr Sytnykov',
    authorInitials: 'ОС',
    authorRole: L(
      'Відставний суддя Верховного Суду України',
      'Retired Justice, Supreme Court of Ukraine',
    ),
  },
  services: {
    heading: L('Що ми будуємо для юр-фірм', 'What we build for law firms'),
    sub: L(
      'Не шаблонний «сайт-візитка адвоката». Кожен проєкт — під конкретну фірму, практики і клієнтську базу.',
      'Not a template "attorney brochure site." Every project is built around your firm, your practice areas, and your client base.',
    ),
    features: [
      {
        title: L('Каталог практик', 'Practice area catalog'),
        bullets: [
          L('Кожна практика — окрема сторінка з SEO', 'Each practice — its own SEO-tuned page'),
          L('Опис, типові кейси, ціна за консультацію', 'Description, typical cases, consultation pricing'),
          L('Прив’язка до конкретних юристів фірми', 'Linked to specific attorneys'),
          L('Фільтр для клієнта "знайти свою задачу"', 'Client filter "find my issue"'),
        ],
      },
      {
        title: L('Профілі юристів', 'Attorney profiles'),
        bullets: [
          L('Фото, освіта, регалії, спеціалізація', 'Photo, education, credentials, specialty'),
          L('Список реальних кейсів за участю юриста', 'List of real cases the attorney handled'),
          L('Публікації, виступи, цитованість', 'Publications, talks, citation counts'),
          L('Calendly для бронювання консультації', 'Calendly for booking a consultation'),
        ],
      },
      {
        title: L('Каталог кейсів', 'Case study catalog'),
        bullets: [
          L('Анонімізовані кейси з сумами і інстанціями', 'Anonymized cases with amounts and court levels'),
          L('Фільтр за галуззю + типом спору', 'Filter by area + dispute type'),
          L('Schema.org LegalService розмітка', 'Schema.org LegalService markup'),
          L('Cross-link на відповідну практику', 'Cross-linked to the relevant practice'),
        ],
      },
      {
        title: L('Онлайн-консультації', 'Online consultations'),
        bullets: [
          L('Calendly або власна форма бронювання', 'Calendly or custom booking form'),
          L('Оплата консультації на сайті (Stripe / LiqPay)', 'On-site payment for consults (Stripe / LiqPay)'),
          L('NDA через Diia.Sign або DocuSign', 'NDA via Diia.Sign or DocuSign'),
          L('Інтеграція з Zoom / Google Meet', 'Zoom / Google Meet integration'),
        ],
      },
      {
        title: L('Блог і публікації', 'Blog and publications'),
        bullets: [
          L('SEO-статті під ключові запити аудиторії', 'SEO articles targeting client queries'),
          L('Розділ "юридичні новини" з автоматичним RSS', '"Legal news" section with auto RSS'),
          L('Академічні публікації з тегами + цитованість', 'Academic publications with tags + citation counts'),
          L('Експорт у PDF (на запит)', 'PDF export (on demand)'),
        ],
      },
      {
        title: L('Локальне SEO', 'Local SEO'),
        bullets: [
          L(
            'Сайт виходить у топ Google по «адвокат + практика + місто»',
            'Top of Google for "attorney + practice + city"',
          ),
          L('Schema.org LegalService + Attorney розмітка', 'Schema.org LegalService + Attorney markup'),
          L('Google Business Profile налаштовуємо', 'Google Business Profile setup'),
          L('5+ сторінок-лендингів під міста / районі', '5+ city / district landings'),
        ],
      },
    ],
    integrationsHeading: L(
      'Підключаємо всі профільні системи',
      'We connect every legal industry tool',
    ),
    integrationsSub: L(
      'Заявка з форми консультації приходить у вашу CRM. Договір клієнту — через Diia.Sign або DocuSign. Календар і Zoom-лінк — автоматично. Жодних втрачених лідів через email-спам.',
      'Consultation requests land in your CRM. Client contracts go through Diia.Sign or DocuSign. Calendar and Zoom links — automatic. Zero leads lost to email spam.',
    ),
    integrations: [
      'Clio',
      'MyCase',
      'LawPay',
      'KeyCRM',
      'AmoCRM',
      'Bitrix24',
      'Diia.Sign',
      'DocuSign',
      'Calendly',
      'Zoom',
      'Stripe',
      'LiqPay',
    ],
    bottomCallouts: [
      L(
        'Sanity CMS · публікація статей з телефону за 2 хв',
        'Sanity CMS · publish articles from your phone in 2 min',
      ),
      L(
        'Окремі лендинги під кожну практику + інстанцію',
        'Separate landings per practice + court level',
      ),
      L('E-signature ready · Diia.Sign · DocuSign', 'E-signature ready · Diia.Sign · DocuSign'),
    ],
  },
  comparison: {
    heading: L(
      'Чим кодовий сайт кращий за шаблонну юр-фірму на WordPress або Wix',
      'Why a custom-coded legal site beats a WordPress or Wix template',
    ),
    rows: [
      {
        param: L('Лендинги під практики', 'Practice landings'),
        wp: L('загальна сторінка', 'single page'),
        wix: L('загальна сторінка', 'single page'),
        custom: L('окрема під кожну', 'one per practice'),
      },
      {
        param: L('Каталог кейсів', 'Case catalog'),
        wp: L('плагін', 'plugin'),
        wix: L('базова галерея', 'basic gallery'),
        custom: L('з фільтрами + Schema.org', 'with filters + Schema.org'),
      },
      {
        param: L('Онлайн-консультації', 'Online consults'),
        wp: L('Calendly embed', 'Calendly embed'),
        wix: L('Calendly embed', 'Calendly embed'),
        custom: L('вбудовано + оплата', 'built-in + payment'),
      },
      {
        param: L('E-signature', 'E-signature'),
        wp: L('через інтеграцію', 'via integration'),
        wix: L('через інтеграцію', 'via integration'),
        custom: L('Diia.Sign · DocuSign', 'Diia.Sign · DocuSign'),
      },
      {
        param: L('Bilingual SEO', 'Bilingual SEO'),
        wp: L('плагін WPML', 'WPML plugin'),
        wix: L('вбудовано базово', 'basic built-in'),
        custom: L('повна структура', 'full structure'),
      },
      {
        param: L('Швидкість завантаження', 'Load speed'),
        wp: L('4-7 сек', '4-7 sec'),
        wix: L('3-5 сек', '3-5 sec'),
        custom: L('< 1 сек', '< 1 sec'),
      },
      {
        param: L('Захист даних клієнтів', 'Client data security'),
        wp: L('низький', 'low'),
        wix: L('середній', 'medium'),
        custom: L('високий (GDPR)', 'high (GDPR)'),
      },
      {
        param: L('Власність на код', 'Code ownership'),
        wp: L('плагіни WP', 'WP plugins'),
        wix: L('vendor lock', 'vendor lock'),
        custom: L('ваш GitHub', 'your GitHub'),
      },
    ],
    pricingHeading: L('Скільки коштує сайт юр-фірми', 'Pricing for a law firm website'),
    bottomCta: L(
      'Повний прайс і деталі — на /pricing',
      'Full pricing and details — on /en/pricing',
    ),
  },
  faq: {
    heading: FAQ_HEADING,
    items: [
      {
        q: L(
          'Як показати реальні кейси, не порушуючи адвокатську тайну?',
          'How to publish real cases without breaching attorney-client confidentiality?',
        ),
        a: {
          uk: 'Анонімізація: тип клієнта (без імені), сума спору, інстанція, результат. Жодних персональних даних. Перед публікацією — письмова згода клієнта на анонімізований кейс. Допомагаємо скласти шаблон згоди.',
          en: 'Anonymization: client type (no name), dispute amount, court level, outcome. Zero personal data. Before publishing — written client consent for the anonymized case. We help draft the consent template.',
        },
      },
      {
        q: L(
          'Чи можна за законом оплату юр-послуг приймати онлайн?',
          'Is it legal to accept payment for legal services online?',
        ),
        a: {
          uk: 'Так. Адвокат / юр-фірма виставляє рахунок на консультацію або послугу — клієнт оплачує карткою (Stripe / LiqPay / WayForPay) або через банк. Документ — публічний договір з адвокатом + договір про надання правової допомоги. Все відповідає вимогам.',
          en: 'Yes. The attorney/firm issues an invoice for consultation or service — the client pays by card (Stripe / LiqPay / WayForPay) or via bank. The documentation: public attorney contract + legal aid agreement. All compliant.',
        },
      },
      {
        q: L('Хто пише контент під практики?', 'Who writes the practice area content?'),
        a: {
          uk: 'Базові структури і SEO-тексти пишемо ми. Юридичну редактуру робите ви — годину часу за весь проєкт. Якщо потрібен повний копірайтинг від нас — окремий пакет $300/сторінка (бо потребує юридичного консультанта).',
          en: 'Base structure and SEO copy — we write. Legal review is on you — about 1 hour for the whole project. If you want full copy from us — separate package at $300/page (requires a legal consultant).',
        },
      },
      {
        q: L('Які CRM для юр-фірм підтримуєте?', 'Which legal CRMs do you support?'),
        a: {
          uk: 'Clio (міжнародний стандарт), MyCase (для адвокатських бюро), KeyCRM, AmoCRM, Bitrix24 (для УА-фірм). Якщо у вас своя система — підключаємо через API ($500-1200 залежно від складності).',
          en: 'Clio (international standard), MyCase (for attorney offices), KeyCRM, AmoCRM, Bitrix24 (for Ukrainian firms). If you use a different system — we connect via API ($500-1200 depending on complexity).',
        },
      },
      {
        q: L('Як захищені дані клієнтів?', 'How is client data protected?'),
        a: {
          uk: 'GDPR-compliant архітектура. SSL обовʼязковий. Дані в зашифрованих базах. Доступ — лише через 2FA. Готуємо політику обробки даних під специфіку юр-фірми. Договір про конфіденційність із замовником — стандарт перед запуском.',
          en: 'GDPR-compliant architecture. SSL required. Data in encrypted databases. Access — 2FA only. We prepare a data processing policy tailored to legal practice. Confidentiality agreement with the client — standard before launch.',
        },
      },
      {
        q: L(
          'Чи можу я продавати курси з сайту юр-фірми?',
          'Can I sell courses from my law firm site?',
        ),
        a: {
          uk: 'Так — як кейс Sytnykov. Окремий розділ "Курси" з програмою, ціною, оплатою, відгуками. Інтеграція з Teachable / Thinkific або кастомна. Окрема воронка лідогенерації.',
          en: 'Yes — see the Sytnykov case. A separate "Courses" section with syllabus, pricing, payment, reviews. Integration with Teachable / Thinkific or custom-built. A separate lead-gen funnel.',
        },
      },
    ],
  },
  audit: {
    heading: L(
      'Безкоштовний аудит сайту вашої юр-фірми',
      'Free audit of your law firm website',
    ),
    sub: L(
      'Залиште посилання на ваш поточний сайт. Протягом 3 робочих днів — детальний звіт у PDF.',
      'Drop a link to your current site. Detailed PDF report within 3 business days.',
    ),
    deliverables: [
      L(
        'SEO-аудит: топ-50 запитів вашої практики + регіону',
        'SEO audit: top 50 queries for your practice + region',
      ),
      L(
        'Структурний аудит: чи знайде клієнт свою практику за 5 секунд',
        'Structural audit: can the client find their practice in 5 seconds',
      ),
      L(
        'Аналіз кейсів: чи переконують вашого ідеального клієнта',
        'Case analysis: do they convince your ideal client',
      ),
      L(
        'Перевірка на GDPR-compliance і безпеку даних',
        'GDPR compliance and data security check',
      ),
      L(
        'План покращень з пріоритетами + орієнтовний бюджет',
        'Prioritized improvement plan + budget estimate',
      ),
    ],
    submit: L('Отримати безкоштовний аудит', 'Get my free audit'),
    disclaim: L(
      'Без зобовʼязань. Корисно, навіть якщо вирішите працювати з іншим підрядником.',
      'No obligation. Useful even if you choose a different vendor.',
    ),
  },
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4. FINANCE  (FinLiga)
 * ──────────────────────────────────────────────────────────────────────── */

const finance: Industry = {
  slug: 'finance',
  order: 4,
  title: L(
    'Сайти для фінансових і бухгалтерських фірм',
    'Websites for finance & accounting firms',
  ),
  seo: {
    title: L(
      'Сайти для фінансових і бухгалтерських фірм — Code-Site.Art',
      'Websites for finance & accounting firms — Code-Site.Art',
    ),
    description: L(
      'Кастомні сайти для бухгалтерських фірм, фінансових консультантів, трейдинг-сервісів. Калькулятори, особисті кабінети, інтеграції з обліковими системами. Кейс: FinLiga.',
      'Custom sites for accounting firms, financial advisors, trading services. Calculators, client portals, accounting system integrations. Case: FinLiga.',
    ),
  },
  hero: {
    eyebrow: L(
      'САЙТИ ДЛЯ ФІНАНСОВОЇ ГАЛУЗІ · від $3 500',
      'WEBSITES FOR FINANCE & ACCOUNTING · from $3,500',
    ),
    heading: L(
      'Фінансова фірма, яка *конвертить* дорогий трафік',
      'A finance firm that *converts* expensive traffic',
    ),
    h1Num: '40+',
    h1NumLabel: L('клієнтів\nна місяць', 'clients\nper month'),
    lede: L(
      'Сайт для фінансової або бухгалтерської фірми, де довіра будується через прозорість і конкретні цифри. Без вашої участі більше ніж 5 годин: ми пишемо тексти і ставимо калькулятори. Запуск за 4–8 тижнів — клієнти приходять уже з *відомим бюджетом і запитом*.',
      'A finance or accounting firm site where trust is built through transparency and concrete numbers. No more than 5 hours of your time: we write the copy and build the calculators. Live in 4-8 weeks — clients arrive with *budget and intent already defined*.',
    ),
    features: [
      L('Калькулятори | вартості послуг', 'Calculators | service pricing'),
      L('Особистий кабінет | клієнт бачить статус', 'Client portal | status in real time'),
      L('Інтеграція з обліковими | MEDoc · 1С/BAS · Xero', 'Accounting integrations | MEDoc · 1C/BAS · Xero'),
      L('Compliance | ЗУ та GDPR', 'Compliance | UA law & GDPR'),
    ],
    ctaPrimary: CTA_PRIMARY,
    ctaSecondary: L('Подивитися фін-кейси', 'See finance case studies'),
    stats: [
      {value: '47', label: L('фінансових\nсайтів', 'finance\nsites built')},
      {value: '4.8/5', label: L('оцінка\nклієнтів', 'client\nrating')},
      {value: '×4.2', label: L('приріст\nконверсії', 'conversion\nuplift')},
    ],
    tickerItems: [
      L('Бухгалтерські фірми', 'Accounting firms'),
      L('Податкові консультанти', 'Tax consultants'),
      L('Фінансові радники', 'Financial advisors'),
      L('Трейдинг-сервіси', 'Trading services'),
      L('Інвестиційні брокери', 'Investment brokers'),
      L('Financial leagues', 'Financial leagues'),
      L('Аудит', 'Audit'),
      L('Фін-аналітика', 'Financial analytics'),
      L('Фін-моніторинг', 'Compliance monitoring'),
      L('Insurance', 'Insurance'),
      L('Fintech-стартапи', 'Fintech startups'),
    ],
    deviceTags: [
      {primary: L('Калькулятор', 'Calculator')},
      {primary: L('Cabinet', 'Cabinet')},
      {kind: 'good', mini: '96', primary: L('Lighthouse', 'Lighthouse')},
    ],
  },
  reasons: {
    eyebrow: L('ДІАГНОСТИКА · 3 ПРИЧИНИ', 'DIAGNOSIS · 3 REASONS'),
    heading: L(
      '3 причини, чому сайт фін-фірми\n*не конвертить*',
      '3 reasons your finance site\n*doesn’t convert*',
    ),
    metaRow: L('аналіз 40+ фін-сайтів · 2024–25', 'audit of 40+ finance sites · 2024–25'),
    reasons: [
      {
        number: '01',
        tag: L('TRUST', 'TRUST'),
        title: L(
          'Сайт виглядає як шаблон Tilda за $50',
          'The site looks like a $50 Tilda template',
        ),
        uk: 'У фінансовій галузі дизайн = довіра. Клієнт довіряє вам грошима — і бачить шаблонний WordPress-сайт 2018 року з stock-фото "людей у костюмах потискують руки". *Йде до конкурента*, який виглядає як справжній бізнес.',
        en: 'In finance, design equals trust. The client is going to trust you with money — and they see a 2018 WordPress template with stock photos of "people in suits shaking hands." *They go to a competitor* who looks like a real business.',
        stat: {
          value: '×3',
          label: L(
            'вища конверсія у сайтів з кастомним дизайном проти шаблонів',
            'higher conversion on custom-design sites vs templates',
          ),
        },
      },
      {
        number: '02',
        tag: L('TRANSPARENCY', 'TRANSPARENCY'),
        title: L(
          'Ціни «під запит» — клієнти відсіюються',
          'Pricing "on request" — clients drop off',
        ),
        uk: 'Бухгалтерія "від 3000 грн" або "залежить від обсягу" — і клієнт іде до конкурента з калькулятором, який показує точну ціну за 60 секунд. *Прозорість продає*.',
        en: 'Bookkeeping "from $100" or "depends on volume" — and the client goes to a competitor with a calculator that shows the exact price in 60 seconds. *Transparency sells*.',
        stat: {
          value: '×2.4',
          label: L(
            'вища конверсія з прозорим прайсом + калькулятором',
            'higher conversion with transparent pricing + calculator',
          ),
        },
      },
      {
        number: '03',
        tag: L('CREDIBILITY', 'CREDIBILITY'),
        title: L(
          'Жодних реальних кейсів і цифр результатів',
          'No real cases, no result numbers',
        ),
        uk: 'Сторінка "наші клієнти" з логотипами 5 ТОВ. Жодної конкретики: яку оптимізацію зробили, скільки грошей зекономили, на якому обороті. *Без цифр — слова*.',
        en: 'A "clients" page with logos of 5 LLCs. Zero specifics: what optimization, how much money saved, at what revenue level. *Without numbers — empty words*.',
        stat: {
          value: '0',
          label: L(
            'конкретних кейсів з сумами на більшості фін-сайтів',
            'concrete cases with amounts on most finance sites',
          ),
        },
      },
    ],
    footText: L(
      'Виправляємо *всі три* за 4-8 тижнів.',
      'We fix *all three* in 4-8 weeks.',
    ),
    footCtaLabel: L('Перевірити мій сайт', 'Audit my site'),
  },
  case: {
    eyebrow: L('РЕАЛЬНИЙ КЕЙС', 'REAL CASE'),
    eyebrowEm: L('FINLIGA', 'FINLIGA'),
    heading: L(
      'До / Після на прикладі реального клієнта',
      'Before / After — a real client case',
    ),
    lede: L(
      'До нас звернувся рекламщик, який вів трафік на сайт FinLiga — фінансову лігу з освітніми продуктами для початківців-інвесторів. Сайт був на WordPress, дорогий трафік приходив, але конверсія була в підвалі. Завдання — переробити сайт з нуля на Next.js, зберегти SEO, підняти конверсію.',
      'A marketer running ads to FinLiga — a financial league with educational products for beginner investors — came to us. The site was on WordPress, paid traffic was arriving, but conversion was in the basement. The task: rebuild from scratch on Next.js, preserve SEO, lift conversion.',
    ),
    meta: [
      {strong: L('6 тижнів', '6 weeks'), text: L('від брифу до релізу', 'brief to launch')},
      {strong: L('WP → Next.js', 'WP → Next.js'), text: L('повна міграція', 'full migration')},
      {strong: L('×4.2', '×4.2'), text: L('приріст конверсії', 'conversion uplift')},
    ],
    before: {
      num: 'FINLIGA · v1 · WordPress 2023',
      url: 'previous WP site',
      heading: L(
        '× WordPress, який не конвертив дорогий трафік',
        '× WordPress that didn’t convert expensive traffic',
      ),
      bullets: [
        L('Lighthouse Performance 38, LCP 4.7 секунди', 'Lighthouse Performance 38, LCP 4.7 seconds'),
        L('Рекламний трафік прилітав і йшов через 6 секунд', 'Paid traffic arrived and left within 6 seconds'),
        L('18 платних плагінів, з яких 3 регулярно ламали сайт', '18 paid plugins, 3 of which regularly broke the site'),
        L(
          'Лід-форма через стандартний Contact Form 7, дані в email-спам',
          'Lead form via stock Contact Form 7, data buried in email spam',
        ),
        L(
          'Жодних UTM-трекінгу для розуміння, звідки конкретно конвертять',
          'Zero UTM tracking to understand what actually converts',
        ),
        L('Адмінка перевантажена, маркетолог боявся щось змінювати', 'Overloaded admin, the marketer was scared to change anything'),
        L(
          'Mobile UX — катастрофа: 67% користувачів закривали сайт за 8 секунд',
          'Mobile UX a disaster: 67% of users closed the site in 8 seconds',
        ),
      ],
      foot: L(
        'Результат: CPL $32, конверсія 1.1%, ROAS не виходив у плюс.',
        'Result: CPL $32, conversion 1.1%, ROAS underwater.',
      ),
    },
    after: {
      num: 'FINLIGA · v2 · Next.js 2024',
      url: 'finliga.com.ua',
      heading: L(
        '✓ Конверсія ×4.2 на тому ж трафіку',
        '✓ ×4.2 conversion on the same traffic',
      ),
      bullets: [
        L('Lighthouse Performance 96, LCP 0.9 секунди', 'Lighthouse Performance 96, LCP 0.9 seconds'),
        L(
          'Mobile-first дизайн, спроектований під холодний трафік з реклами',
          'Mobile-first design built for cold paid traffic',
        ),
        L(
          'Окремі лендинги під кожен рекламний кампейн + UTM-сегментація',
          'Dedicated landings per ad campaign + UTM segmentation',
        ),
        L(
          'Лід-форма прогресивна (3 кроки, не лякає клієнта обсягом)',
          'Progressive lead form (3 steps, doesn’t scare with length)',
        ),
        L(
          'Інтеграція з CRM (KeyCRM) + Telegram-сповіщення менеджеру',
          'CRM integration (KeyCRM) + Telegram alerts to the manager',
        ),
        L('UTM-параметри + Google Tag Manager + Meta Pixel правильно', 'UTM params + Google Tag Manager + Meta Pixel done right'),
        L(
          'Sanity CMS — маркетолог змінює тексти і UTM за 30 секунд',
          'Sanity CMS — marketer changes copy and UTMs in 30 seconds',
        ),
      ],
      foot: L(
        'Результат: CPL $7.50 (×4.2 покращення), конверсія 4.6%, ROAS перейшов у плюс на другий місяць.',
        'Result: CPL $7.50 (×4.2 improvement), conversion 4.6%, ROAS turned positive in month two.',
      ),
    },
    results: [
      {value: '×4.2', tag: L('CONVERSION', 'CONVERSION'), label: L('приріст конверсії на тому ж трафіку', 'conversion uplift on same traffic')},
      {value: '0.9s', tag: L('PERFORMANCE', 'PERFORMANCE'), label: L('LCP (було 4.7s)', 'LCP (was 4.7s)')},
      {value: '$7.50', tag: L('CPL', 'CPL'), label: L('вартість заявки (було $32)', 'CPL (was $32)')},
      {value: '96', tag: L('LIGHTHOUSE', 'LIGHTHOUSE'), label: L('Performance (було 38)', 'Performance score (was 38)')},
    ],
  },
  outcome: {
    recapText: L(
      'Ваш сайт має конвертити дорогий трафік, а не зливати його.',
      'Your site should convert expensive traffic, not waste it.',
    ),
    directionsTitle: L(
      'Працюємо з фін-фірмами будь-якого формату',
      'We work with finance firms of every format',
    ),
    directionsLede: L(
      'Підхід відрізняється для бухгалтерського аутсорсу і трейдинг-сервісу з освітніми продуктами. Тарифи нижче — під обидва сценарії.',
      'The approach differs for an accounting outsourcer and a trading service with educational products. The pricing tiers below cover both scenarios.',
    ),
    audienceCards: [
      {
        title: L('Бухгалтерія / податкові консультанти', 'Bookkeeping / tax consultants'),
        bullets: [
          L('5-15 послуг, постійні клієнти, прозорий прайс', '5-15 services, recurring clients, transparent pricing'),
          L('Калькулятор вартості послуг', 'Service pricing calculator'),
          L('Особистий кабінет з документообігом', 'Client portal with document workflow'),
          L('Базовий пакет — Industry Pro', 'Industry Pro tier fits'),
        ],
      },
      {
        title: L('Трейдинг / fintech / financial league', 'Trading / fintech / financial league'),
        bullets: [
          L(
            'Холодний трафік з реклами, освітні продукти, передплати',
            'Cold paid traffic, educational products, subscriptions',
          ),
          L(
            'Окремі лендинги під кампанії + UTM-сегментація',
            'Dedicated landings per campaign + UTM segmentation',
          ),
          L('Платежі (Stripe / LiqPay) + recurring subscriptions', 'Payments (Stripe / LiqPay) + recurring subscriptions'),
          L('Розширений пакет — Pro Plus', 'Pro Plus tier fits'),
        ],
      },
    ],
    benefitsHeading: L('Як це працює на сайті', 'How it shows up on the site'),
    benefitRows: [
      {
        feature: 'FEATURE · 01 / 03',
        heading: L('Калькулятор вартості послуг', 'Service pricing calculator'),
        bullets: [
          L('Клієнт обирає тип бізнесу, оборот, кількість працівників', 'Client picks business type, revenue, headcount'),
          L('Бачить точну вартість обслуговування на місяць', 'Sees exact monthly service cost'),
          L('Залишає email — приходить детальний прайс у PDF', 'Leaves email — gets detailed pricing PDF'),
          L('Ви отримуєте лід уже з відомим бюджетом', 'You receive a lead with budget already known'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Калькулятор', 'Calculator'),
          L('PDF-прайс', 'PDF pricing'),
        ],
      },
      {
        feature: 'FEATURE · 02 / 03',
        heading: L('Особистий кабінет клієнта', 'Client portal'),
        bullets: [
          L('Клієнт завантажує первинку (інвойси, чеки) через інтерфейс', 'Client uploads source docs (invoices, receipts) via the UI'),
          L('Бачить статус: «отримано», «у роботі», «готово»', 'Sees status: "received", "in progress", "done"'),
          L('Документи в одному місці, не в email-переписці', 'All documents in one place, not buried in email'),
          L('Інтеграція з MEDoc / 1С/BAS / Xero', 'MEDoc / 1C/BAS / Xero integration'),
        ],
        mockType: 'admin',
      },
      {
        feature: 'FEATURE · 03 / 03',
        heading: L('Окремі лендинги під рекламні кампанії', 'Dedicated landings per ad campaign'),
        bullets: [
          L('3-5 лендингів під різні аудиторії і офери', '3-5 landings per audience and offer'),
          L('UTM-параметри передаються в CRM', 'UTM params passed to CRM'),
          L('A/B-тестування заголовків через Vercel Edge', 'A/B testing of headlines via Vercel Edge'),
          L('Маркетолог змінює UTM і копі без розробника', 'Marketer changes UTMs and copy without a developer'),
        ],
        mockType: 'pages',
        mockTags: [
          L('UTM-сегментація', 'UTM segmentation'),
          L('A/B-тест', 'A/B test'),
        ],
      },
    ],
  },
  testimonial: {
    quote: L(
      'Замовляли переробку сайту в рамках кампанії, не очікували що CPL впаде в 4 рази. ROAS перейшов у плюс на другий місяць після запуску — раніше ми його не бачили рік.',
      'We ordered the rebuild as part of a campaign — didn’t expect CPL to drop 4×. ROAS turned positive in month two after launch — we hadn’t seen it positive for a year.',
    ),
    authorName: 'Marketer of FinLiga',
    authorInitials: 'MF',
    authorRole: L('Performance marketer', 'Performance marketer'),
  },
  services: {
    heading: L('Що ми будуємо для фін-фірм', 'What we build for finance firms'),
    sub: L(
      'Не «корпоративний сайт з блогом». Інструменти, які приводять платоспроможних клієнтів і конвертять дорогий трафік.',
      'Not "a corporate site with a blog." Tools that bring paying clients and convert expensive traffic.',
    ),
    features: [
      {
        title: L('Калькулятор вартості послуг', 'Service pricing calculator'),
        bullets: [
          L('Прозорий прайс — без «під запит»', 'Transparent pricing — no "on request"'),
          L(
            '3-5 параметрів (оборот, тип бізнесу, кількість працівників)',
            '3-5 parameters (revenue, business type, headcount)',
          ),
          L('Експорт у PDF', 'PDF export'),
          L('Інтеграція з CRM', 'CRM integration'),
        ],
      },
      {
        title: L('Особистий кабінет клієнта', 'Client portal'),
        bullets: [
          L('Авторизація через email або SMS', 'Email or SMS login'),
          L('Завантаження документів (інвойси, чеки)', 'Document upload (invoices, receipts)'),
          L('Статус роботи в реальному часі', 'Real-time work status'),
          L('Архів договорів і звітів', 'Contract and report archive'),
        ],
      },
      {
        title: L('Каталог кейсів', 'Case studies'),
        bullets: [
          L('Конкретні цифри: оптимізація, зекономлено, оборот', 'Concrete numbers: optimization, savings, revenue'),
          L('Анонімізація клієнта (NDA-friendly)', 'Client anonymization (NDA-friendly)'),
          L('Фільтр за галуззю + типом послуги', 'Filter by industry + service type'),
          L(
            'SEO-оптимізація під «бухгалтер для [галузь]»',
            'SEO-tuned for "accountant for [industry]"',
          ),
        ],
      },
      {
        title: L('Оплата і підписки', 'Payments and subscriptions'),
        bullets: [
          L('Stripe / LiqPay / WayForPay', 'Stripe / LiqPay / WayForPay'),
          L('Recurring billing для абонентського обслуговування', 'Recurring billing for monthly retainers'),
          L('Інвойси автоматично через MEDoc', 'Auto-invoicing via MEDoc'),
          L('Reminders 24 години до списання', '24-hour pre-charge reminders'),
        ],
      },
      {
        title: L('Лід-форми + CRM', 'Lead forms + CRM'),
        bullets: [
          L('Progressive формa (3 кроки, не лякає обʼємом)', 'Progressive form (3 steps, doesn’t intimidate)'),
          L('UTM-параметри передаються в CRM', 'UTM params passed to CRM'),
          L('Telegram-сповіщення менеджеру', 'Telegram alerts to manager'),
          L('Розподіл лідів за типом запиту', 'Lead routing by request type'),
        ],
      },
      {
        title: L('Compliance і безпека даних', 'Compliance and data security'),
        bullets: [
          L('SSL обовʼязковий, дані в зашифрованих базах', 'SSL required, encrypted databases'),
          L('GDPR-ready: cookie consent, data processing policy', 'GDPR-ready: cookie consent, data processing policy'),
          L('2FA для адмінки і клієнтських кабінетів', '2FA on admin and client portals'),
          L('Регулярні security audits', 'Regular security audits'),
        ],
      },
    ],
    integrationsHeading: L(
      'Підключаємо облікові і платіжні системи',
      'We connect accounting and payment systems',
    ),
    integrationsSub: L(
      'Лід з калькулятора одразу йде у вашу CRM з UTM-розміткою. Платіж з підписки — у Stripe → автоматичний інвойс через MEDoc → запис у вашу облікову систему. Менеджер отримує сповіщення в Telegram. Жодних втрачених лідів через email-спам.',
      'Leads from the calculator land in your CRM with full UTM tagging. Subscription payments flow Stripe → auto-invoice via MEDoc → entry in your accounting system. The manager gets a Telegram alert. Zero leads lost to email spam.',
    ),
    integrations: [
      'MEDoc',
      '1C / BAS',
      'Xero',
      'QuickBooks',
      'KeyCRM',
      'AmoCRM',
      'Bitrix24',
      'HubSpot',
      'Stripe',
      'LiqPay',
      'WayForPay',
      'Telegram',
    ],
    bottomCallouts: [
      L(
        'UTM-сегментація · кожен рекламний кампейн → окремий лендинг → окрема воронка в CRM',
        'UTM segmentation · every ad campaign → dedicated landing → separate CRM funnel',
      ),
      L(
        'Інтеграція з МЕDoc · 1С · BAS · Xero · QuickBooks',
        'Integration with MEDoc · 1C · BAS · Xero · QuickBooks',
      ),
      L(
        'Mobile-first · 67% фін-трафіку йде з мобільних',
        'Mobile-first · 67% of finance traffic comes from mobile',
      ),
    ],
  },
  comparison: {
    heading: L(
      'Чим кодовий сайт кращий за фін-фірму на WordPress або Wix',
      'Why a custom-coded finance site beats a WordPress or Wix template',
    ),
    rows: [
      {param: L('Швидкість на mobile', 'Mobile speed'), wp: L('3-5 сек', '3-5 sec'), wix: L('2-4 сек', '2-4 sec'), custom: L('< 1 сек', '< 1 sec')},
      {param: L('Калькулятор вартості', 'Pricing calculator'), wp: L('плагін (баги)', 'plugin (buggy)'), wix: L('Apps add-on', 'Apps add-on'), custom: L('кастомний', 'custom')},
      {param: L('Особистий кабінет', 'Client portal'), wp: L('плагін WooCommerce', 'WooCommerce plugin'), wix: L('базовий', 'basic'), custom: L('повний', 'full')},
      {param: L('Інтеграція з MEDoc / 1С', 'MEDoc / 1C integration'), wp: L('вручну CSV', 'manual CSV'), wix: L('немає', 'none'), custom: L('через API', 'via API')},
      {param: L('UTM-сегментація', 'UTM segmentation'), wp: L('плагін', 'plugin'), wix: L('базова', 'basic'), custom: L('вбудовано', 'built-in')},
      {param: L('Recurring billing', 'Recurring billing'), wp: L('WooCommerce + Stripe', 'WC + Stripe'), wix: L('через інтеграцію', 'via integration'), custom: L('Stripe / LiqPay', 'Stripe / LiqPay')},
      {param: L('Захист даних', 'Data security'), wp: L('низький', 'low'), wix: L('середній', 'medium'), custom: L('високий (GDPR + 2FA)', 'high (GDPR + 2FA)')},
      {param: L('TCO за 3 роки', '3-year TCO'), wp: L('$4-7k', '$4-7k'), wix: L('$3-5k', '$3-5k'), custom: L('$5-8k', '$5-8k')},
    ],
    pricingHeading: L('Скільки коштує сайт фін-фірми', 'Pricing for a finance firm website'),
    bottomCta: L(
      'Повний прайс і деталі — на /pricing',
      'Full pricing and details — on /en/pricing',
    ),
  },
  faq: {
    heading: FAQ_HEADING,
    items: [
      {
        q: L(
          'Чи можу я приймати оплату підписок (recurring billing)?',
          'Can I accept subscription (recurring) payments?',
        ),
        a: {
          uk: 'Так. Stripe для міжнародних клієнтів, LiqPay або WayForPay для українських. Recurring billing працює "з коробки": клієнт оплачує раз — далі автоматично щомісяця. Reminders за 24 години до списання, можливість призупинити підписку без техпідтримки.',
          en: 'Yes. Stripe for international clients, LiqPay or WayForPay for Ukrainian ones. Recurring billing works out of the box: client pays once, then auto-monthly. 24-hour pre-charge reminders, self-serve pause.',
        },
      },
      {
        q: L('Які облікові системи підтримуєте?', 'Which accounting systems do you support?'),
        a: {
          uk: 'MEDoc, 1С/BAS, ifin (для українських клієнтів). Xero, QuickBooks, FreshBooks (для міжнародних). Інтеграція через API: $500-1200 залежно від складності. Якщо у вас своя система — підключаємо.',
          en: 'MEDoc, 1C/BAS, ifin (Ukrainian clients). Xero, QuickBooks, FreshBooks (international). API integration: $500-1200 depending on complexity. If you use a different system — we connect.',
        },
      },
      {
        q: L('Як захищені фінансові дані клієнтів?', 'How is client financial data protected?'),
        a: {
          uk: 'GDPR-compliant архітектура. SSL обовʼязковий. Дані в зашифрованих базах (AES-256). Доступ через 2FA. Регулярні security audits. PCI DSS для роботи з картковими даними — використовуємо Stripe / LiqPay (не зберігаємо номери карт у нас).',
          en: 'GDPR-compliant architecture. SSL required. AES-256 encrypted databases. 2FA access. Regular security audits. PCI DSS for card data — we use Stripe / LiqPay (no card numbers stored locally).',
        },
      },
      {
        q: L(
          'Як налаштувати UTM-сегментацію для реклами?',
          'How is UTM segmentation set up for ad campaigns?',
        ),
        a: {
          uk: 'UTM-параметри з реклами автоматично потрапляють у CRM з кожним лідом. У звіті ви бачите: яка кампанія, оголошення, аудиторія дала лід. Маркетолог змінює UTM на лендингах за 30 секунд через Sanity. Інтеграція з GA4 + Meta Pixel + GTM.',
          en: 'UTM params from ads land in CRM with every lead. The report shows: which campaign, ad, audience produced the lead. The marketer updates UTMs on landings in 30 seconds via Sanity. GA4 + Meta Pixel + GTM integration.',
        },
      },
      {
        q: L(
          'Чи можна виставляти інвойси з сайту автоматично?',
          'Can invoices be issued from the site automatically?',
        ),
        a: {
          uk: 'Так. Інтеграція з MEDoc (для українських ФОП / ТОВ) або Stripe Invoicing (міжнародних) генерує інвойси після оплати. PDF з вашою юр-адресою, реквізитами, ЄДРПОУ. Клієнт отримує на email + має доступ через особистий кабінет.',
          en: 'Yes. MEDoc integration (for Ukrainian sole proprietors/LLCs) or Stripe Invoicing (international) generates invoices after payment. PDF with your legal name, address, tax ID. The client gets it by email + via the client portal.',
        },
      },
      {
        q: L(
          'Я не хочу публікувати реальні кейси клієнтів — порушу NDA. Що тоді?',
          'I can’t publish real client cases — it would breach NDA. What then?',
        ),
        a: {
          uk: 'Анонімізація: тип бізнесу (без імені), оборот (діапазон), що оптимізували, скільки зекономили. Жодних персональних даних. Перед публікацією — письмова згода клієнта на анонімізований кейс. Шаблон згоди допомагаємо скласти.',
          en: 'Anonymization: business type (no name), revenue (range), what was optimized, how much was saved. Zero personal data. Before publishing — written client consent for the anonymized case. We help draft the consent template.',
        },
      },
    ],
  },
  audit: {
    heading: L(
      'Безкоштовний аудит сайту вашої фін-фірми',
      'Free audit of your finance firm website',
    ),
    sub: L(
      'Залиште посилання на ваш поточний сайт. Протягом 3 робочих днів — детальний звіт у PDF.',
      'Drop a link to your current site. Detailed PDF report within 3 business days.',
    ),
    deliverables: [
      L(
        'Аналіз конверсії: 10-15 точок втрати клієнтів',
        'Conversion analysis: 10-15 client drop-off points',
      ),
      L(
        'SEO-аудит під фін-запити вашого регіону',
        'SEO audit targeting finance queries in your region',
      ),
      L(
        'Mobile UX-аудит (67% фін-трафіку — mobile)',
        'Mobile UX audit (67% of finance traffic is mobile)',
      ),
      L(
        'Аудит compliance: GDPR + захист фін-даних',
        'Compliance audit: GDPR + financial data protection',
      ),
      L(
        'План покращень з пріоритетами + орієнтовний бюджет',
        'Prioritized improvement plan + budget estimate',
      ),
    ],
    submit: L('Отримати безкоштовний аудит', 'Get my free audit'),
    disclaim: L(
      'Без зобовʼязань. Корисно, навіть якщо вирішите працювати з іншим підрядником.',
      'No obligation. Useful even if you choose a different vendor.',
    ),
  },
}

/* ──────────────────────────────────────────────────────────────────────────
 * 5. ECOMMERCE  (Glimmer)
 * ──────────────────────────────────────────────────────────────────────── */

const ecommerce: Industry = {
  slug: 'ecommerce',
  order: 5,
  title: L('Сайти для інтернет-магазинів', 'E-commerce websites'),
  seo: {
    title: L(
      'Сайти для інтернет-магазинів — Code-Site.Art',
      'E-commerce websites — Code-Site.Art',
    ),
    description: L(
      'Кастомні інтернет-магазини на Next.js з простою адмінкою. Інтеграції з KeyCRM, Новою Поштою, LiqPay, Stripe. Кейс: видавництво Glimmer.',
      'Custom Next.js e-commerce sites with a simple admin. KeyCRM, Nova Poshta, LiqPay, Stripe integrations. Case: Glimmer publishing house.',
    ),
  },
  hero: {
    eyebrow: L('САЙТИ ДЛЯ E-COMMERCE · від $5 000', 'E-COMMERCE WEBSITES · from $5,000'),
    heading: L(
      'Інтернет-магазин, який *продає* щодня',
      'An online store that *sells* every day',
    ),
    h1Num: '100+',
    h1NumLabel: L('замовлень\nна місяць', 'orders\nper month'),
    lede: L(
      'Не Tilda-конструктор з шаблонним каталогом і не Shopify за $300/міс на 3 роки. Кастомний інтернет-магазин на Next.js з простою адмінкою, де ви *додаєте товари з телефону*. Запуск за 6–10 тижнів — і клієнти оформлюють замовлення за 2 кліки.',
      'Not a Tilda template with a generic catalog, not Shopify at $300/mo for 3 years. A custom Next.js store with a simple admin where you *add products from your phone*. Live in 6-10 weeks — and clients check out in 2 clicks.',
    ),
    features: [
      L('Зручна адмінка | додаєте товари з телефону', 'Mobile admin | add products from your phone'),
      L('Оплата | Stripe · LiqPay · WayForPay', 'Payments | Stripe · LiqPay · WayForPay'),
      L('Інтеграція | Нова Пошта · Укрпошта · DHL', 'Shipping | Nova Poshta · Ukrposhta · DHL'),
      L('CRM | KeyCRM · AmoCRM · Bitrix24', 'CRM | KeyCRM · AmoCRM · Bitrix24'),
    ],
    ctaPrimary: CTA_PRIMARY,
    ctaSecondary: L('Подивитися e-com кейси', 'See e-com case studies'),
    stats: [
      {value: '47', label: L('e-com\nсайтів', 'e-com\nsites built')},
      {value: '4.8/5', label: L('оцінка\nклієнтів', 'client\nrating')},
      {value: '×3.4', label: L('приріст\nконверсії', 'conversion\nuplift')},
    ],
    tickerItems: [
      L('Книжкові магазини', 'Bookshops'),
      L('Видавництва', 'Publishers'),
      L('Магазини одягу', 'Fashion'),
      L('Магазини косметики', 'Cosmetics'),
      L('Магазини взуття', 'Footwear'),
      L('Електроніка', 'Electronics'),
      L('Дитячі товари', 'Kids'),
      L('Спортивні товари', 'Sports'),
      L('Подарунки', 'Gifts'),
      L('Хендмейд', 'Handmade'),
      L('Аксесуари', 'Accessories'),
      L('Дім і сад', 'Home & garden'),
    ],
    deviceTags: [
      {primary: L('2-step cart', '2-step cart')},
      {primary: L('Mobile admin', 'Mobile admin')},
      {kind: 'good', mini: 'Top', primary: L('Google Shopping', 'Google Shopping')},
    ],
  },
  reasons: {
    eyebrow: L('ДІАГНОСТИКА · 3 ПРИЧИНИ', 'DIAGNOSIS · 3 REASONS'),
    heading: L(
      '3 причини, чому ваш магазин\n*не продає*',
      '3 reasons your store\n*doesn’t sell*',
    ),
    metaRow: L('аналіз 47 e-com сайтів · 2024–25', 'audit of 47 e-com sites · 2024–25'),
    reasons: [
      {
        number: '01',
        tag: L('CHECKOUT', 'CHECKOUT'),
        title: L('Чекаут на 5 кроків — клієнт зливається', '5-step checkout — clients drop off'),
        uk: 'Реєстрація → email-підтвердження → форма доставки → форма оплати → підтвердження → оплата. *Половина клієнтів закриває вкладку до 3-го кроку*. Чекаут має бути на 2 кроки максимум.',
        en: 'Register → verify email → shipping form → payment form → confirmation → pay. *Half the clients close the tab by step 3*. Checkout should be 2 steps max.',
        stat: {
          value: '68%',
          label: L(
            'клієнтів зливаються на стандартному 5-крокового чекауті',
            'of clients abandon a standard 5-step checkout',
          ),
        },
      },
      {
        number: '02',
        tag: L('MOBILE', 'MOBILE'),
        title: L(
          'Сайт не відкривається на mobile нормально',
          'The site doesn’t open properly on mobile',
        ),
        uk: 'Каталог — 4 колонки, на mobile стискається в нечитабельну сітку. Кнопка "купити" — десь у футері карточки. Корзина — модальне вікно з горизонтальним скролом. *70% e-com трафіку — mobile*. Мобільний UX = виживання.',
        en: 'Catalog at 4 columns squashes into an unreadable grid on mobile. The buy button is buried in the card footer. Cart opens as a modal with horizontal scroll. *70% of e-com traffic is mobile*. Mobile UX is survival.',
        stat: {
          value: '70%',
          label: L(
            'e-com трафіку приходить з mobile, але дизайн оптимізований під desktop',
            'of e-com traffic is mobile, but the design is desktop-first',
          ),
        },
      },
      {
        number: '03',
        tag: L('SHIPPING', 'SHIPPING'),
        title: L(
          'Інтеграція з доставкою не працює, або працює погано',
          'Shipping integration is broken or broken-ish',
        ),
        uk: 'Клієнт обирає Нову Пошту → вводить місто → випадає 400 відділень без сортування → шукає своє через Ctrl+F. На Tilda або WooCommerce це нормально. *На кастомному сайті — пошук, фільтр, рекомендоване відділення поруч*.',
        en: 'Client picks Nova Poshta → enters city → 400 unsorted branches drop down → they Ctrl+F to find theirs. On Tilda or WooCommerce that’s normal. *On a custom site — search, filter, and the nearest branch suggested*.',
        stat: {
          value: '42%',
          label: L(
            'замовлень зриваються на етапі вибору відділення',
            'of orders fail at branch selection',
          ),
        },
      },
    ],
    footText: L(
      'Виправляємо *всі три* за 6-10 тижнів.',
      'We fix *all three* in 6-10 weeks.',
    ),
    footCtaLabel: L('Перевірити мій сайт', 'Audit my site'),
  },
  case: {
    eyebrow: L('РЕАЛЬНИЙ КЕЙС', 'REAL CASE'),
    eyebrowEm: L('GLIMMER', 'GLIMMER'),
    heading: L(
      'До / Після на прикладі реального клієнта',
      'Before / After — a real client case',
    ),
    lede: L(
      'До нас звернулося українське літературне видавництво Glimmer. Завдання — кастомний магазин з мобільною адмінкою (бо керівник додає книги з телефону), стильним мінімалістичним дизайном, корзиною з 2-крокового чекауту, інтеграцією з KeyCRM і Новою Поштою.',
      'Ukrainian literary publisher Glimmer came to us. The task: a custom store with mobile admin (the founder adds books from her phone), a stylish minimalist design, a 2-step checkout cart, and integrations with KeyCRM and Nova Poshta.',
    ),
    meta: [
      {strong: L('8 тижнів', '8 weeks'), text: L('від брифу до релізу', 'brief to launch')},
      {strong: L('200+ SKU', '200+ SKUs'), text: L('категорії + автори + теги', 'categories + authors + tags')},
      {strong: L('2-крокова корзина', '2-step checkout'), text: L('mobile-first', 'mobile-first')},
    ],
    before: {
      num: 'GLIMMER · v1 · WooCommerce 2023',
      url: 'previous WooCommerce site',
      heading: L(
        '× WooCommerce, який падав під трафіком запуску нової книги',
        '× WooCommerce that crashed under traffic of a new book launch',
      ),
      bullets: [
        L('23 плагіни, з яких 3 регулярно ламали checkout', '23 plugins, 3 of which regularly broke checkout'),
        L('Адмінка WooCommerce — складна для нетехнічного керівника', 'WooCommerce admin too complex for a non-technical founder'),
        L(
          'Додавання нової книги забирало 30 хвилин (фото, опис, теги)',
          'Adding a new book took 30 minutes (photo, description, tags)',
        ),
        L('На mobile checkout — 5 кроків, конверсія 0.7%', 'Mobile checkout — 5 steps, 0.7% conversion'),
        L('Інтеграція з Новою Поштою через плагін, який зависав', 'Nova Poshta integration via a plugin that hung'),
        L(
          'Сайт падав під спайками трафіку при анонсі нової книги',
          'Site went down during new-book launch traffic spikes',
        ),
        L('SEO — базовий через Yoast, без структурованих категорій', 'SEO basic via Yoast, no structured categories'),
      ],
      foot: L(
        'Результат: ~30 замовлень/місяць, постійні падіння при анонсах.',
        'Result: ~30 orders/month, constant outages on announcements.',
      ),
    },
    after: {
      num: 'GLIMMER · v2 · Next.js 2024',
      url: 'glimmer.com.ua',
      heading: L(
        '✓ Custom-сайт з 2-кроковим mobile checkout',
        '✓ Custom site with 2-step mobile checkout',
      ),
      bullets: [
        L('Стильний мінімалістичний дизайн (під естетику видавництва)', 'Stylish minimalist design (matches the publisher’s aesthetic)'),
        L('Sanity CMS — додавання книги з телефону за 3 хвилини', 'Sanity CMS — add a book from your phone in 3 minutes'),
        L('2-крокова корзина: вибір доставки → оплата', '2-step cart: shipping → payment'),
        L('Інтеграція з KeyCRM (замовлення одразу в CRM)', 'KeyCRM integration (orders land in CRM directly)'),
        L('Нова Пошта: пошук відділення з геолокацією', 'Nova Poshta: branch search with geolocation'),
        L('LiqPay + WayForPay для оплати карткою', 'LiqPay + WayForPay for card payments'),
        L('Структурований каталог: автори / категорії / теги / новинки', 'Structured catalog: authors / categories / tags / new releases'),
        L('Schema.org Book + Product повна розмітка', 'Full Schema.org Book + Product markup'),
        L('Виходить у топ Google по "[автор] купити книгу"', 'Ranks top of Google for "[author] buy book"'),
      ],
      foot: L(
        'Результат: 100+ замовлень/місяць, нуль падінь, конверсія 3.4%.',
        'Result: 100+ orders/month, zero outages, 3.4% conversion.',
      ),
    },
    results: [
      {value: '×3.4', tag: L('ORDERS', 'ORDERS'), label: L('замовлень на місяць', 'orders per month')},
      {value: '3.4%', tag: L('CONVERSION', 'CONVERSION'), label: L('проти 0.7% на WooCommerce', 'vs 0.7% on WooCommerce')},
      {value: '100%', tag: L('UPTIME', 'UPTIME'), label: L('під спайками трафіку', 'under traffic spikes')},
      {value: '3 хв', tag: L('ADMIN', 'ADMIN'), label: L('додавання нової книги (було 30 хв)', 'adding a new book (was 30 min)')},
    ],
  },
  outcome: {
    recapText: L(
      'Ваш магазин має продавати, а не падати під трафіком.',
      'Your store should sell — not crash under traffic.',
    ),
    directionsTitle: L(
      'Працюємо з магазинами будь-якого розміру',
      'We work with stores of every size',
    ),
    directionsLede: L(
      'Підхід відрізняється для нішевого магазину з 50-200 SKU і ширшого e-com з 1000+ SKU. Тарифи нижче — під обидва сценарії.',
      'The approach differs for a niche store with 50-200 SKUs and a wider e-com with 1000+ SKUs. The pricing tiers below cover both scenarios.',
    ),
    audienceCards: [
      {
        title: L('Нішевий магазин · 50-300 SKU', 'Niche store · 50-300 SKUs'),
        bullets: [
          L('Книги, прикраси, хендмейд, нішева косметика', 'Books, jewelry, handmade, niche cosmetics'),
          L('Простий каталог, мінімалістичний дизайн', 'Simple catalog, minimalist design'),
          L('Mobile admin для оновлень з телефону', 'Mobile admin for phone updates'),
          L('Розширений пакет — Pro Plus', 'Pro Plus tier fits'),
        ],
      },
      {
        title: L('Магазин · 500-5000 SKU', 'Larger store · 500-5000 SKUs'),
        bullets: [
          L('Одяг, електроніка, дитячі товари, спорттовари', 'Fashion, electronics, kids, sports'),
          L('Розширений каталог: фільтри, варіанти, розміри', 'Extended catalog: filters, variants, sizes'),
          L('Інтеграція з 1С/BAS для синхронізації залишків', '1C/BAS integration for stock sync'),
          L('Custom пакет — від $14,000', 'Custom tier — from $14,000'),
        ],
      },
    ],
    benefitsHeading: L('Як це працює на сайті', 'How it shows up on the site'),
    benefitRows: [
      {
        feature: 'FEATURE · 01 / 03',
        heading: L('2-крокова корзина (не 5)', '2-step cart (not 5)'),
        bullets: [
          L('Крок 1: контакти + доставка (Нова Пошта/Укрпошта/курʼєр)', 'Step 1: contact + shipping (Nova Poshta / Ukrposhta / courier)'),
          L('Крок 2: оплата (Stripe / LiqPay / WayForPay) або накладений', 'Step 2: payment (Stripe / LiqPay / WayForPay) or COD'),
          L('Гостьовий чекаут (без обовʼязкової реєстрації)', 'Guest checkout (no forced registration)'),
          L('Збереження прогресу — клієнт повертається і завершує', 'Progress saved — client returns and finishes'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Доставка', 'Shipping'),
          L('Оплата', 'Payment'),
        ],
      },
      {
        feature: 'FEATURE · 02 / 03',
        heading: L('Зручна адмінка з мобільного', 'Mobile-first admin'),
        bullets: [
          L('Додаєте новий товар із телефону за 3 хв', 'Add a new product from your phone in 3 min'),
          L('Заливаєте фото з галереї телефона', 'Upload photos from your phone’s gallery'),
          L('Оновлюєте ціни і залишки на льоту', 'Update prices and stock on the fly'),
          L('Без техпідтримки і помісячних оплат', 'No tech support, no monthly fees'),
        ],
        mockType: 'admin',
      },
      {
        feature: 'FEATURE · 03 / 03',
        heading: L('Розумний каталог з фільтрами', 'Smart catalog with filters'),
        bullets: [
          L('Фільтри за категоріями, цінами, тегами, авторами', 'Filters by category, price, tag, author'),
          L('Швидкий пошук з підказками', 'Quick search with suggestions'),
          L('Рекомендації "схожі товари" автоматично', 'Auto "related products" recommendations'),
          L('Schema.org Product повна розмітка', 'Full Schema.org Product markup'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Фільтри', 'Filters'),
          L('Категорії', 'Categories'),
        ],
      },
    ],
  },
  testimonial: {
    quote: L(
      'Замовляли просто переробку дизайну. Отримали магазин, який витримує спайки трафіку, не падає під анонсом нової книги і дає мені керувати ним з телефону. Конверсія виросла в 4 рази без зміни трафіку.',
      'We just wanted a design refresh. We got a store that survives traffic spikes, doesn’t crash on a new book launch, and lets me run it from my phone. Conversion grew 4× without changing traffic.',
    ),
    authorName: 'Glimmer Founder',
    authorInitials: 'GL',
    authorRole: L('Засновниця видавництва', 'Publishing house founder'),
  },
  services: {
    heading: L('Що ми будуємо для інтернет-магазинів', 'What we build for online stores'),
    sub: L(
      'Не "ще один шаблон з WooCommerce". Магазин під вашу нішу, вашу логіку доставки і ваш темп оновлень.',
      'Not "another WooCommerce template." A store built for your niche, your shipping logic, and your update cadence.',
    ),
    features: [
      {
        title: L('Кастомний каталог', 'Custom catalog'),
        bullets: [
          L('Категорії, підкатегорії, теги, автори (якщо книги)', 'Categories, subcategories, tags, authors (for books)'),
          L('Варіанти (розмір, колір, обʼєм) з різними цінами', 'Variants (size, color, volume) with separate prices'),
          L('Фільтри і пошук з підказками', 'Filters and search with suggestions'),
          L('Schema.org Product + Offer розмітка', 'Schema.org Product + Offer markup'),
        ],
      },
      {
        title: L('Корзина і чекаут', 'Cart and checkout'),
        bullets: [
          L('2-крокова корзина, без обовʼязкової реєстрації', '2-step cart, no forced registration'),
          L('Гостьовий чекаут + memo для повторних покупців', 'Guest checkout + memo for repeat buyers'),
          L('Промокоди, знижки за обсягом, пакетні пропозиції', 'Promo codes, volume discounts, bundles'),
          L('Збереження стану корзини між сесіями', 'Cart persists between sessions'),
        ],
      },
      {
        title: L('Платіжні системи', 'Payments'),
        bullets: [
          L('LiqPay, WayForPay, Mono для українських клієнтів', 'LiqPay, WayForPay, Mono for Ukrainian clients'),
          L('Stripe для міжнародних', 'Stripe for international clients'),
          L('Накладений платіж через Нову Пошту', 'Cash on delivery via Nova Poshta'),
          L('Recurring billing для підписочних товарів', 'Recurring billing for subscription products'),
        ],
      },
      {
        title: L('Доставка', 'Shipping'),
        bullets: [
          L('Нова Пошта: пошук відділення з геолокацією', 'Nova Poshta: branch search with geolocation'),
          L('Укрпошта, Justin, MeestExpress, DHL, Glovo', 'Ukrposhta, Justin, Meest, DHL, Glovo'),
          L('Розрахунок вартості автоматично', 'Auto shipping cost calculation'),
          L('Трекінг замовлення на сайті', 'Order tracking on the site'),
        ],
      },
      {
        title: L('Sanity CMS adminка', 'Sanity CMS admin'),
        bullets: [
          L('Додаєте товар з телефону за 3 хв', 'Add a product from your phone in 3 min'),
          L('Фото з галереї, опис, ціна, варіанти, теги', 'Photo from gallery, description, price, variants, tags'),
          L('Bulk-update (наприклад, знижка на категорію)', 'Bulk update (e.g., category-wide discount)'),
          L('Експорт замовлень в CSV', 'Order export to CSV'),
        ],
      },
      {
        title: L('CRM і аналітика', 'CRM and analytics'),
        bullets: [
          L('Замовлення одразу в KeyCRM / AmoCRM / Bitrix24', 'Orders flow into KeyCRM / AmoCRM / Bitrix24'),
          L('Telegram-сповіщення менеджеру про нове замовлення', 'Telegram alerts to manager on each order'),
          L('GA4 + Meta Pixel + GTM', 'GA4 + Meta Pixel + GTM'),
          L(
            'Воронка продажів з показниками сторінок виходу',
            'Sales funnel with drop-off page metrics',
          ),
        ],
      },
    ],
    integrationsHeading: L('Підключаємо всі e-com системи', 'We connect every e-com system'),
    integrationsSub: L(
      'Замовлення з сайту одразу у вашій CRM. Платіж — у Stripe / LiqPay. Накладна Нової Пошти автоматично. Клієнт отримує SMS з ТТН. Менеджер — сповіщення в Telegram. Жодних втрачених замовлень через email-спам.',
      'Orders flow from site to your CRM. Payments via Stripe / LiqPay. Nova Poshta waybill auto-generated. Client gets an SMS with tracking number. Manager gets a Telegram alert. Zero orders lost to email spam.',
    ),
    integrations: [
      'KeyCRM',
      'AmoCRM',
      'Bitrix24',
      'LiqPay',
      'WayForPay',
      'Stripe',
      'Mono Pay',
      'Nova Poshta',
      'Ukrposhta',
      'Telegram',
      'GA4',
      'Meta Pixel',
    ],
    bottomCallouts: [
      L('Mobile-first · 70% e-com трафіку приходить з mobile', 'Mobile-first · 70% of e-com traffic is mobile'),
      L('Гостьовий чекаут · клієнт купує без реєстрації', 'Guest checkout · clients buy without registering'),
      L('Schema.org Product · виходимо в Google Shopping', 'Schema.org Product · visible in Google Shopping'),
    ],
  },
  comparison: {
    heading: L(
      'Чим кодовий магазин кращий за Tilda, Shopify або WooCommerce',
      'Why a custom store beats Tilda, Shopify, or WooCommerce',
    ),
    columns: {
      param: L('Параметр', 'Parameter'),
      wp: L('WooCommerce', 'WooCommerce'),
      wix: L('Shopify', 'Shopify'),
      custom: L('Кодовий', 'Custom'),
    },
    rows: [
      {param: L('Швидкість на mobile', 'Mobile speed'), wp: L('3-6 сек', '3-6 sec'), wix: L('2-4 сек', '2-4 sec'), custom: L('< 1 сек', '< 1 sec')},
      {param: L('Чекаут', 'Checkout'), wp: L('4-5 кроків', '4-5 steps'), wix: L('3 кроки', '3 steps'), custom: L('2 кроки', '2 steps')},
      {param: L('Адмінка з mobile', 'Mobile admin'), wp: L('важко', 'hard'), wix: L('OK', 'OK'), custom: L('повноцінна', 'full-featured')},
      {param: L('Інтеграція з Новою Поштою', 'Nova Poshta'), wp: L('плагін (баги)', 'plugin (buggy)'), wix: L('через додаток', 'via app'), custom: L('нативно', 'native')},
      {param: L('Місячна оплата', 'Monthly fee'), wp: L('$0-30 hosting', '$0-30 hosting'), wix: L('$30-300/міс', '$30-300/mo'), custom: L('$0 (Vercel free tier)', '$0 (Vercel free tier)')},
      {param: L('Кастомізація', 'Customization'), wp: L('через плагіни', 'via plugins'), wix: L('обмежена', 'limited'), custom: L('повна', 'full')},
      {param: L('Власність на код', 'Code ownership'), wp: L('WooCommerce ecosystem', 'WooCommerce ecosystem'), wix: L('Shopify lock', 'Shopify lock'), custom: L('ваш GitHub', 'your GitHub')},
      {param: L('TCO за 3 роки', '3-year TCO'), wp: L('$5-9k', '$5-9k'), wix: L('$4-12k', '$4-12k'), custom: L('$6-10k', '$6-10k')},
    ],
    pricingHeading: L('Скільки коштує інтернет-магазин', 'Pricing for an online store'),
    bottomCta: L(
      'Повний прайс і деталі — на /pricing',
      'Full pricing and details — on /en/pricing',
    ),
  },
  faq: {
    heading: FAQ_HEADING,
    items: [
      {
        q: L(
          'Чому не Shopify, якщо він "з коробки"?',
          'Why not Shopify, since it’s "out of the box"?',
        ),
        a: {
          uk: 'Shopify це підписка $30-300/міс на 3 роки = $1,080-10,800. Custom-магазин — $5,000-10,000 один раз. За 3 роки виходить як Shopify, але код ваш. Плюс кастомізація без обмежень: 2-крокова корзина, інтеграція з Новою Поштою, specific UA-payment-методи — все це на Shopify нативно слабке.',
          en: 'Shopify is a $30-300/mo subscription = $1,080-10,800 over 3 years. A custom store costs $5,000-10,000 once. Over 3 years it’s roughly the same — but the code is yours. Plus full customization: 2-step cart, Nova Poshta integration, Ukrainian-specific payment methods — all weak on Shopify.',
        },
      },
      {
        q: L(
          'Як працює інтеграція з 1С/BAS для синхронізації залишків?',
          'How does 1C/BAS sync work for inventory?',
        ),
        a: {
          uk: '2 варіанти: (1) ручний експорт-імпорт CSV 1 раз на день, (2) повна автоматична синхронізація через API 1С/BAS — залишки оновлюються кожні 15 хвилин. Варіант 2 — окрема інтеграція $1,200-2,500. Якщо у вас велике число SKU з частими змінами — варіант 2.',
          en: 'Two options: (1) manual CSV export-import once a day, (2) full auto-sync via 1C/BAS API — stock updates every 15 min. Option 2 is a separate integration at $1,200-2,500. If you have many SKUs with frequent changes — option 2.',
        },
      },
      {
        q: L(
          'Скільки трафіку витримує сайт без падінь?',
          'How much traffic can the site handle without crashing?',
        ),
        a: {
          uk: 'Next.js на Vercel auto-scaling = десятки тисяч одночасних користувачів без додаткової оплати. Спайк трафіку при анонсі нової колекції / Чорній Пʼятниці — без проблем. На Tilda або WooCommerce подібний спайк часто кладе сайт.',
          en: 'Next.js on Vercel auto-scaling = tens of thousands of concurrent users without extra cost. A traffic spike for a new collection / Black Friday — no problem. On Tilda or WooCommerce a similar spike often takes the site down.',
        },
      },
      {
        q: L('Чи можна додати багатомовність?', 'Can we add multilingual support?'),
        a: {
          uk: 'Так. UA + EN — стандарт у Pro Plus тирі. Кожна мова має власну URL-структуру і hreflang. Каталог товарів локалізується через Sanity (для кожного товару — поля title_uk, title_en, description_uk, description_en). Додавання 3-ї мови (наприклад, RU або PL) — $1,500-2,500.',
          en: 'Yes. UA + EN — standard in the Pro Plus tier. Each language has its own URL structure and hreflang. Product catalog is localized via Sanity (each product gets title_uk, title_en, description_uk, description_en). Adding a 3rd language (RU or PL) — $1,500-2,500.',
        },
      },
      {
        q: L(
          'Як приймати оплату міжнародних клієнтів?',
          'How to accept international payments?',
        ),
        a: {
          uk: 'Stripe — стандарт. Підтримує всі основні валюти, картки Visa/Mastercard/American Express, Apple Pay, Google Pay. Якщо у вас український ФОП — приймаєте оплату в USD/EUR, конвертація в UAH у банку. Або відкриваємо англійський рахунок у Wise / Revolut Business для прямого прийому в валютах.',
          en: 'Stripe is the standard. Supports all major currencies, Visa / Mastercard / Amex, Apple Pay, Google Pay. If you’re a Ukrainian sole proprietor — receive in USD/EUR, convert to UAH at the bank. Or open an EN account at Wise / Revolut Business to receive in the original currency.',
        },
      },
      {
        q: L(
          'Що з SEO? Як ми будемо в Google Shopping?',
          'What about SEO? How do we appear in Google Shopping?',
        ),
        a: {
          uk: 'Schema.org Product з повною розміткою (price, availability, brand, reviews, image, rating). Google Merchant Center feed автоматично з Sanity. Sitemap з усіма товарами. Open Graph для соцмереж. У результаті — товари виходять в Google Shopping і Google Search без додаткової реклами.',
          en: 'Schema.org Product with full markup (price, availability, brand, reviews, image, rating). Google Merchant Center feed auto-generated from Sanity. Sitemap with every product. Open Graph for social. Result: products appear in Google Shopping and Google Search without paid ads.',
        },
      },
      {
        q: L(
          'Як налаштувати знижки і промокоди?',
          'How are discounts and promo codes set up?',
        ),
        a: {
          uk: 'Через Sanity-адмінку. Створюєте промокод, обираєте умови (мінімальна сума, конкретні товари, дата дії). Видаєте клієнтам у email-розсилці / соцмережах. На сайті клієнт вводить код у корзині — знижка застосовується. Звіт по використаним кодам — в адмінці.',
          en: 'Via the Sanity admin. Create a promo code, set conditions (min amount, specific products, validity). Distribute to clients via email / social. The client enters the code in the cart — discount applies. Usage report in the admin.',
        },
      },
    ],
  },
  audit: {
    heading: L('Безкоштовний аудит вашого магазину', 'Free audit of your store'),
    sub: L(
      'Залиште посилання на ваш поточний сайт. Протягом 3 робочих днів — детальний звіт у PDF.',
      'Drop a link to your current site. Detailed PDF report within 3 business days.',
    ),
    deliverables: [
      L('Аудит чекауту: 10-15 точок втрати клієнтів', 'Checkout audit: 10-15 client drop-off points'),
      L('Mobile UX-аудит (70% e-com трафіку — mobile)', 'Mobile UX audit (70% of e-com traffic is mobile)'),
      L(
        'SEO-аудит: чи виходите ви в Google Shopping',
        'SEO audit: are you visible in Google Shopping',
      ),
      L('Швидкість завантаження + Core Web Vitals', 'Load speed + Core Web Vitals'),
      L(
        'План покращень з пріоритетами + орієнтовний бюджет',
        'Prioritized improvement plan + budget estimate',
      ),
    ],
    submit: L('Отримати безкоштовний аудит', 'Get my free audit'),
    disclaim: L(
      'Без зобовʼязань. Корисно, навіть якщо вирішите працювати з іншим підрядником.',
      'No obligation. Useful even if you choose a different vendor.',
    ),
  },
}

/* ──────────────────────────────────────────────────────────────────────────
 * 6. AUTO  (Raul Avto)
 * ──────────────────────────────────────────────────────────────────────── */

const auto: Industry = {
  slug: 'auto',
  order: 6,
  title: L('Сайти для авто-індустрії', 'Websites for the auto industry'),
  seo: {
    title: L(
      'Сайти для авто-індустрії — Code-Site.Art',
      'Websites for the auto industry — Code-Site.Art',
    ),
    description: L(
      'Кастомні сайти для автодилерів, імпорту авто, СТО і авто-послуг. Калькулятори, PDF-інвойси, мультимовність. Кейс: Raul Avto (доставка авто з США).',
      'Custom sites for auto dealers, car importers, repair shops, and auto services. Calculators, PDF invoices, multi-language. Case: Raul Avto (US car delivery).',
    ),
  },
  hero: {
    eyebrow: L(
      'САЙТИ ДЛЯ АВТО-ІНДУСТРІЇ · від $5 000',
      'WEBSITES FOR THE AUTO INDUSTRY · from $5,000',
    ),
    heading: L(
      'Авто-сайт, на якому клієнт сам *рахує ціну*',
      'An auto site where the client *calculates the price*',
    ),
    h1Num: '60',
    h1NumLabel: L('секунд\nдо PDF-інвойса', 'seconds\nto PDF invoice'),
    lede: L(
      'Калькулятор, який рахує доставку авто з усіма зборами і генерує PDF-інвойс — клієнт отримує точну цифру до дзвінка. Без вашої участі більше ніж 5 годин: ми пишемо тексти, ставимо логіку калькулятора. Запуск за 6–10 тижнів — і клієнти приходять уже з *підписаним інтересом*.',
      'A calculator that quotes car delivery with every fee and generates a PDF invoice — the client gets an exact number before the call. No more than 5 hours of your time: we write the copy and build the calculator logic. Live in 6-10 weeks — and clients arrive *already locked in*.',
    ),
    features: [
      L(
        'Калькулятор з PDF-інвойсами | точна ціна за 60 сек',
        'Calculator with PDF invoices | exact price in 60 sec',
      ),
      L('Мультимовність | UA · RU · EN · PL', 'Multi-language | UA · RU · EN · PL'),
      L(
        'Інтеграції | аукціони · логістика · CRM',
        'Integrations | auctions · logistics · CRM',
      ),
      L('Каталог авто | з фільтрами і пошуком', 'Car catalog | with filters and search'),
    ],
    ctaPrimary: CTA_PRIMARY,
    ctaSecondary: L('Подивитися авто-кейси', 'See auto case studies'),
    stats: [
      {value: '47', label: L('сайтів\nу бізнесі', 'sites\nin business')},
      {value: '4.9/5', label: L('оцінка\nклієнтів', 'client\nrating')},
      {value: '×3', label: L('конверсія\nкалькулятора', 'calculator\nconversion')},
    ],
    tickerItems: [
      L('Доставка авто з США', 'US car delivery'),
      L('Доставка авто з ЄС', 'EU car delivery'),
      L('Автодилери', 'Auto dealerships'),
      L('Імпорт авто', 'Car import'),
      L('СТО', 'Repair shops'),
      L('Кузовний ремонт', 'Body shops'),
      L('Шиномонтаж', 'Tire service'),
      L('Авто-страхування', 'Auto insurance'),
      L('Прокат авто', 'Car rental'),
      L('Car sharing', 'Car sharing'),
      L('Авто-логістика', 'Auto logistics'),
      L('Розмитнення', 'Customs clearance'),
    ],
    deviceTags: [
      {primary: L('Калькулятор', 'Calculator')},
      {primary: L('PDF-інвойс', 'PDF invoice')},
      {kind: 'good', mini: '94', primary: L('Lighthouse', 'Lighthouse')},
    ],
  },
  reasons: {
    eyebrow: L('ДІАГНОСТИКА · 3 ПРИЧИНИ', 'DIAGNOSIS · 3 REASONS'),
    heading: L(
      '3 причини, чому ваш авто-сайт\n*не продає*',
      '3 reasons your auto site\n*doesn’t sell*',
    ),
    metaRow: L('аналіз 35+ авто-сайтів · 2024–25', 'audit of 35+ auto sites · 2024–25'),
    reasons: [
      {
        number: '01',
        tag: L('PRICE OPACITY', 'PRICE OPACITY'),
        title: L(
          'Немає калькулятора — клієнт іде до конкурента',
          'No calculator — the client goes to a competitor',
        ),
        uk: '«Зателефонуйте, розрахуємо» — і *80% клієнтів не дзвонять*. Авто-доставка з США / ЄС має 12+ статей витрат (аукціон, логістика, страхування, розмитнення, акциз, ПДВ, винагорода брокера). Без калькулятора клієнт не може зрозуміти бюджет — іде до того, хто показує цифри.',
        en: '"Call us for a quote" — and *80% of clients don’t call*. Car delivery from the US/EU has 12+ cost lines (auction fee, logistics, insurance, customs, excise, VAT, broker commission). Without a calculator, the client can’t gauge the budget — they go to whoever shows numbers.',
        stat: {
          value: '80%',
          label: L('клієнтів не дзвонять "уточнити ціну"', 'of clients don’t call "to clarify the price"'),
        },
      },
      {
        number: '02',
        tag: L('CATALOG UX', 'CATALOG UX'),
        title: L('Каталог авто без нормальних фільтрів', 'Car catalog without proper filters'),
        uk: '300 авто в одній стрічці без фільтрів за маркою, моделлю, бюджетом, роком, паливом. Клієнт відкриває карточку, вертається, відкриває іншу, забуває яка краща. *Конкурент з фільтрами + порівнянням до 4 авто забирає всю аудиторію*.',
        en: '300 cars in one feed with no filters by make, model, budget, year, fuel. The client opens a card, goes back, opens another, forgets which was better. *A competitor with filters and 4-car comparison takes the whole audience*.',
        stat: {
          value: '×2.8',
          label: L(
            'вища конверсія у сайтів з фільтрами + порівнянням',
            'higher conversion on sites with filters + comparison',
          ),
        },
      },
      {
        number: '03',
        tag: L('TRUST', 'TRUST'),
        title: L(
          'Жодних реальних кейсів доставлених авто',
          'No real cases of delivered cars',
        ),
        uk: 'Сторінка "наші доставки" з 3 фото 2019 року. Клієнт ризикує сумою $15-50k — і не бачить жодного підтвердження, що ви реально доставляєте, а не зникнете з передоплатою. *Без галереї "ось ці 200 авто ми привезли" клієнт обирає більшого гравця*.',
        en: 'A "deliveries" page with 3 photos from 2019. The client risks $15-50k — and sees zero proof that you actually deliver and won’t disappear with the deposit. *Without a "here are the 200 cars we brought" gallery, the client picks the bigger player*.',
        stat: {
          value: '47%',
          label: L(
            'клієнтів зливаються через відсутність trust-сигналів',
            'of clients drop off due to missing trust signals',
          ),
        },
      },
    ],
    footText: L(
      'Виправляємо *всі три* за 6-10 тижнів.',
      'We fix *all three* in 6-10 weeks.',
    ),
    footCtaLabel: L('Перевірити мій сайт', 'Audit my site'),
  },
  case: {
    eyebrow: L('РЕАЛЬНИЙ КЕЙС', 'REAL CASE'),
    eyebrowEm: L('RAUL AVTO', 'RAUL AVTO'),
    heading: L(
      'До / Після на прикладі реального клієнта',
      'Before / After — a real client case',
    ),
    lede: L(
      'Raul Avto — компанія з доставки авто з США в Україну. Завдання: багатосторінковий сайт з функціональним калькулятором (рахує усі 12 статей витрат і генерує PDF-інвойс клієнту), стильним дизайном що продає, на трьох мовах (UA / RU / EN), з SEO під ключові запити "авто з США + модель + бюджет".',
      'Raul Avto — a US-to-Ukraine car delivery company. The task: a multi-page site with a working calculator (calculates all 12 cost lines and generates a PDF invoice for the client), a stylish converting design, in three languages (UA / RU / EN), with SEO targeting "US car + model + budget" queries.',
    ),
    meta: [
      {strong: L('10 тижнів', '10 weeks'), text: L('від брифу до релізу', 'brief to launch')},
      {strong: L('3 мови', '3 languages'), text: L('UA · RU · EN', 'UA · RU · EN')},
      {strong: L('12 параметрів', '12 parameters'), text: L('у калькуляторі доставки', 'in the delivery calculator')},
    ],
    before: {
      num: 'RAUL AVTO · v1 · WordPress 2022',
      url: 'previous WP site',
      heading: L(
        '× Сайт-каталог без калькулятора і нормального UX',
        '× A catalog site without a calculator or proper UX',
      ),
      bullets: [
        L(
          'Каталог авто в одній стрічці, без фільтрів за маркою/моделлю/бюджетом',
          'Catalog in a single feed, no filters by make / model / budget',
        ),
        L(
          '"Розрахуйте з менеджером" — без жодного орієнтиру ціни',
          '"Calculate with the manager" — zero pricing reference',
        ),
        L(
          'Сайт тільки на українській — втрачали клієнтів з російсько- і англомовних запитів',
          'Ukrainian only — losing clients from Russian and English queries',
        ),
        L('Lighthouse Performance 42, mobile UX — катастрофа', 'Lighthouse Performance 42, mobile UX a disaster'),
        L('SEO нуль: одна сторінка під весь сайт, без структурування', 'Zero SEO: one page for the whole site, no structure'),
        L('Заявки через email-форму без CRM-інтеграції', 'Leads via email form with no CRM integration'),
        L(
          'Жодних доказів реальних доставок — лише generic stock-фото',
          'No proof of real deliveries — generic stock photos only',
        ),
      ],
      foot: L(
        'Результат: 5-8 заявок/місяць, переважно з прямих рекомендацій.',
        'Result: 5-8 leads/month, mostly from direct referrals.',
      ),
    },
    after: {
      num: 'RAUL AVTO · v2 · Next.js 2024',
      url: 'raul-avto.com',
      heading: L(
        '✓ Багатосторінковий сайт з калькулятором і PDF-інвойсами',
        '✓ Multi-page site with calculator and PDF invoices',
      ),
      bullets: [
        L(
          'Кастомний калькулятор з 12 статтями витрат (аукціон, логістика, страхування, розмитнення, акциз, ПДВ, винагорода)',
          'Custom calculator with 12 cost lines (auction, logistics, insurance, customs, excise, VAT, commission)',
        ),
        L(
          'PDF-інвойс генерується на сайті за 60 секунд, без участі менеджера',
          'PDF invoice generated on the site in 60 seconds, no manager involvement',
        ),
        L(
          'Каталог авто з фільтрами: марка, модель, рік, бюджет, паливо, привід',
          'Car catalog with filters: make, model, year, budget, fuel, drivetrain',
        ),
        L('Порівняння до 4 авто side-by-side', 'Side-by-side comparison up to 4 cars'),
        L(
          '3 мови: UA / RU / EN з власною URL-структурою',
          '3 languages: UA / RU / EN with separate URL structure',
        ),
        L('Lighthouse Performance 94, mobile-first дизайн', 'Lighthouse Performance 94, mobile-first design'),
        L(
          'Галерея "наших доставок" з фото клієнта на новому авто (200+ кейсів)',
          '"Our deliveries" gallery with photos of clients with their new cars (200+ cases)',
        ),
        L(
          'SEO: лендинги під "BMW з США", "Tesla з США", "купити авто [бюджет]"',
          'SEO: landings for "BMW from USA", "Tesla from USA", "buy car [budget]"',
        ),
        L('Заявки одразу в KeyCRM з UTM-розміткою', 'Leads flow into KeyCRM with full UTM tagging'),
      ],
      foot: L(
        'Результат: 60-80 заявок/місяць, конверсія калькулятор → дзвінок 24%.',
        'Result: 60-80 leads/month, calculator-to-call conversion 24%.',
      ),
    },
    results: [
      {value: '×10', tag: L('LEADS', 'LEADS'), label: L('заявок на місяць', 'leads per month')},
      {value: '24%', tag: L('CALC CONVERSION', 'CALC CONVERSION'), label: L('калькулятор → дзвінок', 'calculator → call')},
      {value: 'UA+RU+EN', tag: L('LANGUAGES', 'LANGUAGES'), label: L('trilingual SEO', 'trilingual SEO')},
      {value: '94', tag: L('LIGHTHOUSE', 'LIGHTHOUSE'), label: L('Performance (було 42)', 'Performance score (was 42)')},
    ],
  },
  outcome: {
    recapText: L(
      'Ваш авто-сайт має рахувати, не "уточнювати з менеджером".',
      'Your auto site should calculate — not "clarify with the manager".',
    ),
    directionsTitle: L(
      'Працюємо з авто-бізнесом будь-якого формату',
      'We work with auto businesses of every format',
    ),
    directionsLede: L(
      'Підхід відрізняється для імпорту авто з калькулятором і автодилера з фізичним салоном. Тарифи нижче — під обидва сценарії.',
      'The approach differs for car importers with calculators and dealerships with physical showrooms. The pricing tiers below cover both scenarios.',
    ),
    audienceCards: [
      {
        title: L('Імпорт авто з-за кордону', 'Car import services'),
        bullets: [
          L('США / ЄС / Дубай / Японія', 'USA / EU / Dubai / Japan'),
          L('Калькулятор з 10-15 статтями витрат', 'Calculator with 10-15 cost lines'),
          L('PDF-інвойс автоматично', 'Auto PDF invoice'),
          L('Розширений пакет — Pro Plus', 'Pro Plus tier fits'),
        ],
      },
      {
        title: L('Автодилер / СТО / послуги', 'Dealership / repair shop / services'),
        bullets: [
          L('Каталог авто або послуг з фільтрами', 'Car or service catalog with filters'),
          L('Онлайн-запис на тест-драйв або сервіс', 'Online booking for test drive or service'),
          L('Інтеграція з 1С/BAS для синхронізації залишків', '1C/BAS integration for stock sync'),
          L('Custom — від $14,000', 'Custom tier — from $14,000'),
        ],
      },
    ],
    benefitsHeading: L('Як це працює на сайті', 'How it shows up on the site'),
    benefitRows: [
      {
        feature: 'FEATURE · 01 / 03',
        heading: L('Калькулятор з PDF-інвойсами', 'Calculator with PDF invoices'),
        bullets: [
          L('10-15 параметрів (марка, модель, рік, тип палива, регіон)', '10-15 parameters (make, model, year, fuel, region)'),
          L('Розрахунок усіх 12 статей витрат', 'Calculation of all 12 cost lines'),
          L('PDF-інвойс на email клієнта за 60 секунд', 'PDF invoice to client’s email in 60 seconds'),
          L('Лід зберігається в CRM з повним розрахунком', 'Lead saved in CRM with the full breakdown'),
        ],
        mockType: 'pages',
        mockTags: [
          L('12 параметрів', '12 parameters'),
          L('PDF-інвойс', 'PDF invoice'),
        ],
      },
      {
        feature: 'FEATURE · 02 / 03',
        heading: L('Каталог з фільтрами + порівнянням', 'Catalog with filters + comparison'),
        bullets: [
          L('Фільтри: марка, модель, бюджет, рік, паливо, привід, кузов', 'Filters: make, model, budget, year, fuel, drivetrain, body type'),
          L('Порівняння до 4 авто side-by-side', 'Side-by-side comparison up to 4 cars'),
          L('Збереження "обраного" між сесіями', '"Favorites" persist between sessions'),
          L('Кожне авто — окрема SEO-сторінка', 'Each car — its own SEO page'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Фільтри', 'Filters'),
          L('Compare', 'Compare'),
        ],
      },
      {
        feature: 'FEATURE · 03 / 03',
        heading: L('Багатомовний SEO', 'Multi-language SEO'),
        bullets: [
          L(
            'UA + RU + EN, кожна з власним URL-доменом або підпапкою',
            'UA + RU + EN, each on its own domain or path',
          ),
          L('hreflang для Google розуміння мов', 'hreflang so Google understands the languages'),
          L('Окремі мета-теги під регіон і запит', 'Region- and query-specific meta tags'),
          L(
            'Лендинги під "BMW з США", "Tesla EU", "купити авто Київ"',
            'Landings for "BMW from USA", "Tesla EU", "buy car Kyiv"',
          ),
        ],
        mockType: 'pages',
        mockTags: [
          L('UA · RU · EN', 'UA · RU · EN'),
          L('hreflang', 'hreflang'),
        ],
      },
    ],
  },
  testimonial: {
    quote: L(
      'Замовляли просто гарний сайт. Отримали машину для генерації заявок — клієнти приходять уже з PDF-інвойсом і питанням "коли можемо підписати договір".',
      'We just wanted a nice site. We got a lead machine — clients arrive with a PDF invoice already, asking "when can we sign the contract".',
    ),
    authorName: 'Raul Avto Founder',
    authorInitials: 'RA',
    authorRole: L('Засновник Raul Avto', 'Founder, Raul Avto'),
  },
  services: {
    heading: L('Що ми будуємо для авто-бізнесу', 'What we build for auto businesses'),
    sub: L(
      'Не "сайт-візитка з контактами". Інструмент, який рахує, продає і генерує заявки 24/7.',
      'Not a "brochure site with contacts." A tool that calculates, sells, and generates leads 24/7.',
    ),
    features: [
      {
        title: L('Калькулятор доставки / послуги', 'Delivery / service calculator'),
        bullets: [
          L('10-15 параметрів вводу', '10-15 input parameters'),
          L('Розрахунок 12+ статей витрат', 'Calculation of 12+ cost lines'),
          L('PDF-інвойс на email', 'PDF invoice to email'),
          L('Лід в CRM з повним breakdown', 'Lead in CRM with full breakdown'),
        ],
      },
      {
        title: L('Каталог авто', 'Car catalog'),
        bullets: [
          L('Фільтри + порівняння до 4 авто', 'Filters + comparison up to 4 cars'),
          L('Кожне авто — SEO-сторінка', 'Each car — its own SEO page'),
          L('Збереження обраного', 'Persistent favorites'),
          L('Schema.org Vehicle розмітка', 'Schema.org Vehicle markup'),
        ],
      },
      {
        title: L('Мультимовність', 'Multi-language'),
        bullets: [
          L('UA / RU / EN / PL — окрема URL-структура', 'UA / RU / EN / PL — separate URL structure'),
          L('hreflang + Schema.org', 'hreflang + Schema.org'),
          L('Локалізація цін у валютах', 'Pricing localized by currency'),
          L('Окремі лендинги під ринок', 'Market-specific landings'),
        ],
      },
      {
        title: L('Інтеграції з аукціонами', 'Auction integrations'),
        bullets: [
          L('Copart, IAA, Manheim — імпорт лотів', 'Copart, IAA, Manheim — lot import'),
          L('Автоматичний переклад описів', 'Auto-translation of descriptions'),
          L('Розрахунок ціни лотів через калькулятор', 'Lot pricing via the calculator'),
          L('Bid-tracking для клієнта', 'Bid tracking for the client'),
        ],
      },
      {
        title: L('Онлайн-запис на тест-драйв / сервіс', 'Online test drive / service booking'),
        bullets: [
          L('Calendly або власна форма', 'Calendly or custom form'),
          L('SMS-нагадування', 'SMS reminders'),
          L('Інтеграція з CRM менеджера', 'CRM integration for the manager'),
          L('Auto-розподіл за салонами', 'Auto-routing by location'),
        ],
      },
      {
        title: L('Галерея доставок + Local SEO', 'Delivery gallery + local SEO'),
        bullets: [
          L('200+ кейсів реальних доставок', '200+ real delivery cases'),
          L('Фото клієнта з авто (з його дозволу)', 'Photos of clients with their cars (consent-based)'),
          L('Кожен кейс — SEO-сторінка "BMW з США 2024"', 'Each case — its own SEO page "BMW from USA 2024"'),
          L('Google Maps інтеграція для locations', 'Google Maps integration for locations'),
        ],
      },
    ],
    integrationsHeading: L(
      'Підключаємо всі авто-системи',
      'We connect every auto-industry system',
    ),
    integrationsSub: L(
      'Заявка з калькулятора одразу в CRM з повним розрахунком. Лот з аукціону Copart — імпорт через API. Менеджер отримує сповіщення в Telegram. Клієнт — PDF-інвойс на email і трек-номер доставки після оформлення. Жодних втрачених лідів.',
      'Calculator leads land in CRM with the full breakdown. Copart auction lots — imported via API. Manager gets a Telegram alert. Client gets a PDF invoice by email and a tracking number after the order. Zero leads lost.',
    ),
    integrations: [
      'Copart',
      'IAA',
      'Manheim',
      'KeyCRM',
      'AmoCRM',
      'Bitrix24',
      'Stripe',
      'LiqPay',
      'WayForPay',
      'Nova Poshta',
      'Google Maps',
      'Telegram',
    ],
    bottomCallouts: [
      L(
        'Калькулятор з PDF-інвойсом · клієнт приходить уже з підписаним інтересом',
        'Calculator with PDF invoice · the client arrives already locked in',
      ),
      L(
        'Trilingual SEO · UA + RU + EN з власною URL-структурою',
        'Trilingual SEO · UA + RU + EN with separate URL structure',
      ),
      L(
        'Schema.org Vehicle · виходимо в Google Search і Google Cars',
        'Schema.org Vehicle · visible in Google Search and Google Cars',
      ),
    ],
  },
  comparison: {
    heading: L(
      'Чим кодовий авто-сайт кращий за шаблонний',
      'Why a custom auto site beats a template',
    ),
    rows: [
      {param: L('Калькулятор з 12 статтями', 'Calculator with 12 lines'), wp: L('плагін (баги)', 'plugin (buggy)'), wix: L('через Apps', 'via Apps'), custom: L('кастомний', 'custom')},
      {param: L('PDF-інвойси', 'PDF invoices'), wp: L('плагін', 'plugin'), wix: L('немає', 'no'), custom: L('вбудовано', 'built-in')},
      {param: L('Каталог з фільтрами', 'Catalog with filters'), wp: L('плагін', 'plugin'), wix: L('базовий', 'basic'), custom: L('повний', 'full')},
      {param: L('Порівняння авто', 'Car comparison'), wp: L('немає', 'none'), wix: L('немає', 'none'), custom: L('до 4 авто', 'up to 4 cars')},
      {param: L('Мультимовність', 'Multi-language'), wp: L('WPML plugin', 'WPML plugin'), wix: L('базова', 'basic'), custom: L('повна структура', 'full structure')},
      {param: L('Інтеграція з аукціонами', 'Auction integration'), wp: L('немає', 'none'), wix: L('немає', 'none'), custom: L('Copart · IAA · Manheim', 'Copart · IAA · Manheim')},
      {param: L('Швидкість на mobile', 'Mobile speed'), wp: L('3-5 сек', '3-5 sec'), wix: L('2-4 сек', '2-4 sec'), custom: L('< 1 сек', '< 1 sec')},
      {param: L('Власність на код', 'Code ownership'), wp: L('плагіни WP', 'WP plugins'), wix: L('vendor lock', 'vendor lock'), custom: L('ваш GitHub', 'your GitHub')},
    ],
    pricingHeading: L('Скільки коштує сайт авто-бізнесу', 'Pricing for an auto business website'),
    bottomCta: L(
      'Повний прайс і деталі — на /pricing',
      'Full pricing and details — on /en/pricing',
    ),
  },
  faq: {
    heading: FAQ_HEADING,
    items: [
      {
        q: L(
          'Скільки коштує калькулятор з PDF-інвойсами?',
          'How much does the calculator with PDF invoices cost?',
        ),
        a: {
          uk: 'Калькулятор сам по собі: $1,500-3,000 залежно від кількості параметрів. PDF-генерація — додатково $500. У стандартному пакеті Pro Plus калькулятор з 10 параметрами + PDF вже включено. Якщо потрібно 15+ параметрів і складна логіка (як у Raul Avto) — це Custom тир від $14,000.',
          en: 'Calculator alone: $1,500-3,000 depending on parameter count. PDF generation — extra $500. The standard Pro Plus tier includes a 10-parameter calculator + PDF. For 15+ parameters and complex logic (like Raul Avto), it’s Custom tier from $14,000.',
        },
      },
      {
        q: L(
          'Як інтегруватися з аукціонами Copart / IAA / Manheim?',
          'How to integrate with Copart / IAA / Manheim auctions?',
        ),
        a: {
          uk: 'У Copart і IAA є офіційні API для партнерських аккаунтів. Підключаємо парсинг лотів автоматично, перекладаємо описи, рахуємо ціни через калькулятор. Інтеграція з кожним аукціоном — $1,200-2,500. Manheim має закритий API — інтеграція через scraping (юридично сіра зона, обговорюємо окремо).',
          en: 'Copart and IAA have official APIs for partner accounts. We auto-import lots, translate descriptions, price them via the calculator. Each auction integration — $1,200-2,500. Manheim has a closed API — integration via scraping (legal gray area, discussed separately).',
        },
      },
      {
        q: L(
          'Скільки мов реально треба для авто-бізнесу?',
          'How many languages does an auto business really need?',
        ),
        a: {
          uk: 'Залежить від ринку. Для імпорту в Україну — UA / RU обовʼязково (Одеса, Харків, Дніпро досі шукають російською). EN — корисно для русинів-емігрантів і EU-маркету. PL — окремо для роботи з польським маркетом. Кожна мова +15-25% до бюджету.',
          en: 'Depends on the market. For import to Ukraine — UA / RU is mandatory (Odesa, Kharkiv, Dnipro still search in Russian). EN — useful for diaspora and EU market. PL — separately for the Polish market. Each language adds 15-25% to the budget.',
        },
      },
      {
        q: L(
          'Чи можна продавати авто через сайт з оплатою онлайн?',
          'Can we sell cars through the site with online payments?',
        ),
        a: {
          uk: 'Технічно так, але юридично складно. Передоплата $1,000-3,000 через Stripe / LiqPay як підтвердження інтересу — стандартно. Повна оплата авто ($15-50k) — переказом на банківський рахунок (за договором). Гра з повною онлайн-оплатою авто не варта свічок: банки блокують такі транзакції як підозрілі.',
          en: 'Technically yes, but legally tricky. Deposits of $1,000-3,000 via Stripe / LiqPay as intent confirmation — standard. Full payment ($15-50k) — bank transfer (per contract). Pushing full online car payment isn’t worth it: banks flag such transactions as suspicious.',
        },
      },
      {
        q: L(
          'Як виходити в Google по конкретних запитах (BMW з США, Tesla з ЄС)?',
          'How to rank for specific queries (BMW from USA, Tesla from EU)?',
        ),
        a: {
          uk: 'Програмні landing pages: автоматично генеруємо сторінки під 200-500 запитів (марка × модель × регіон). Кожна сторінка з унікальними текстами, цінами, кейсами. Schema.org Vehicle. Через 3-6 місяців виходимо в топ-10 по long-tail запитам. Реклама стає дешевшою на 40-60% бо органіки достатньо.',
          en: 'Programmatic landings: we auto-generate 200-500 pages (make × model × region). Each page with unique copy, prices, cases. Schema.org Vehicle. Within 3-6 months we rank top-10 for long-tail queries. Ads get 40-60% cheaper because organic carries the load.',
        },
      },
      {
        q: L(
          'Як показати реальні кейси доставок з фото клієнтів?',
          'How to publish real delivery cases with client photos?',
        ),
        a: {
          uk: 'Письмова згода клієнта на публікацію (стандартний пункт у договорі доставки). Шаблон ми надаємо. Кейс: фото клієнта з авто, марка/модель/рік, регіон доставки, термін, орієнтовна вартість. Кожен кейс — окрема SEO-сторінка. 200+ кейсів через 12 місяців — потужний trust-сигнал.',
          en: 'Written client consent for publication (standard clause in the delivery contract). We provide the template. The case: client photo with car, make / model / year, delivery region, timeline, ballpark cost. Each case — its own SEO page. 200+ cases after 12 months — a powerful trust signal.',
        },
      },
    ],
  },
  audit: {
    heading: L(
      'Безкоштовний аудит вашого авто-сайту',
      'Free audit of your auto site',
    ),
    sub: L(
      'Залиште посилання на ваш поточний сайт. Протягом 3 робочих днів — детальний звіт у PDF.',
      'Drop a link to your current site. Detailed PDF report within 3 business days.',
    ),
    deliverables: [
      L(
        'Аналіз калькулятора: чи генерує лідів з підписаним інтересом',
        'Calculator analysis: are leads arriving "locked in"',
      ),
      L(
        'SEO-аудит під авто-запити вашого регіону',
        'SEO audit targeting auto queries in your region',
      ),
      L(
        'Mobile UX-аудит (60% авто-трафіку — mobile)',
        'Mobile UX audit (60% of auto traffic is mobile)',
      ),
      L(
        'Аналіз каталогу і фільтрів: чи знаходить клієнт своє авто',
        'Catalog and filters: can the client find their car',
      ),
      L(
        'План покращень з пріоритетами + орієнтовний бюджет',
        'Prioritized improvement plan + budget estimate',
      ),
    ],
    submit: L('Отримати безкоштовний аудит', 'Get my free audit'),
    disclaim: L(
      'Без зобовʼязань. Корисно, навіть якщо вирішите працювати з іншим підрядником.',
      'No obligation. Useful even if you choose a different vendor.',
    ),
  },
}

/* ──────────────────────────────────────────────────────────────────────────
 * 7. REAL ESTATE  (Your House Albania)
 * ──────────────────────────────────────────────────────────────────────── */

const realEstate: Industry = {
  slug: 'real-estate',
  order: 7,
  title: L('Сайти для нерухомості', 'Websites for real estate'),
  seo: {
    title: L(
      'Сайти для нерухомості — Code-Site.Art',
      'Websites for real estate — Code-Site.Art',
    ),
    description: L(
      'Кастомні сайти для агенцій нерухомості, забудовників і private listings. Мультимовність, мультивалютність, лендинги, mortgage-калькулятори. Кейс: Your House Albania.',
      'Custom sites for real estate agencies, developers, and private listings. Multi-language, multi-currency, landings, mortgage calculators. Case: Your House Albania.',
    ),
  },
  hero: {
    eyebrow: L('САЙТИ ДЛЯ НЕРУХОМОСТІ · від $5 000', 'WEBSITES FOR REAL ESTATE · from $5,000'),
    heading: L(
      'Сайт нерухомості, який працює в *4 валютах і 5 мовах*',
      'A real estate site running in *4 currencies and 5 languages*',
    ),
    h1Num: '4',
    h1NumLabel: L('валюти\nрядом з 5 мовами', 'currencies\nwith 5 languages'),
    lede: L(
      'Готове рішення для нерухомості: мультимовні лендинги, мультивалютний прайс, повноцінний каталог обʼєктів з фільтрами і Google Maps інтеграцією, mortgage-калькулятор. Без вашої участі більше ніж 5 годин. Запуск за 6–10 тижнів — і ви приймаєте заявки з *5 ринків одночасно*.',
      'A turnkey real estate solution: multi-language landings, multi-currency pricing, full property catalog with filters and Google Maps, mortgage calculator. No more than 5 hours of your time. Live in 6-10 weeks — and you take leads from *5 markets at once*.',
    ),
    features: [
      L('Мультимовність | UA · EN · DE · PL · IT', 'Multi-language | UA · EN · DE · PL · IT'),
      L('Мультивалютність | EUR · USD · GBP · UAH', 'Multi-currency | EUR · USD · GBP · UAH'),
      L(
        'Mortgage калькулятор | з привʼязкою до регіону',
        'Mortgage calculator | region-aware',
      ),
      L('Лендинги | під ринок і тип нерухомості', 'Landings | per market and property type'),
    ],
    ctaPrimary: CTA_PRIMARY,
    ctaSecondary: L('Подивитися real estate кейси', 'See real estate case studies'),
    stats: [
      {value: '47', label: L('сайтів\nнерухомості', 'real estate\nsites built')},
      {value: '4.9/5', label: L('оцінка\nклієнтів', 'client\nrating')},
      {value: '5 ринків', label: L('одночасно', 'simultaneous')},
    ],
    tickerItems: [
      L('Агенції нерухомості', 'Real estate agencies'),
      L('Забудовники', 'Developers'),
      L('Приватні листинги', 'Private listings'),
      L('Інвестиційна нерухомість', 'Investment property'),
      L('Курортна нерухомість', 'Resort property'),
      L('Комерційна нерухомість', 'Commercial'),
      L('Оренда', 'Long-term rentals'),
      L('Короткострокова оренда', 'Short-term rentals'),
      L('Iноземна нерухомість', 'Foreign property'),
      L('Premium-сегмент', 'Premium segment'),
      L('New-build', 'New-build'),
      L('Реселл', 'Resale'),
    ],
    deviceTags: [
      {primary: L('5 мов · 4 валюти', '5 lang · 4 curr')},
      {primary: L('Google Maps', 'Google Maps')},
      {kind: 'good', mini: 'EU', primary: L('Geo-routing', 'Geo-routing')},
    ],
  },
  reasons: {
    eyebrow: L('ДІАГНОСТИКА · 3 ПРИЧИНИ', 'DIAGNOSIS · 3 REASONS'),
    heading: L(
      '3 причини, чому ваш сайт нерухомості\n*не приводить клієнтів*',
      '3 reasons your real estate site\n*doesn’t bring clients*',
    ),
    metaRow: L(
      'аналіз 50+ real estate сайтів · 2024–25',
      'audit of 50+ real estate sites · 2024–25',
    ),
    reasons: [
      {
        number: '01',
        tag: L('CATALOG UX', 'CATALOG UX'),
        title: L(
          'Каталог обʼєктів без нормальних фільтрів і карти',
          'Property catalog without proper filters or a map',
        ),
        uk: 'Клієнт шукає квартиру 2-3 кімнати в бюджеті 150-200k євро в Бараньон у Барселоні з парковкою. У вас — 200 обʼєктів у стрічці без фільтрів за районом, метражем, бюджетом. *Йде на сайт конкурента з картою + фільтрами*.',
        en: 'The client is looking for a 2-3 bedroom apartment in the €150-200k range in the Born district of Barcelona with parking. On your site — 200 listings in a feed without filters by area, m², budget. *They go to a competitor with a map + filters*.',
        stat: {
          value: '78%',
          label: L(
            'клієнтів зливаються через невдалий фільтр обʼєктів',
            'of clients drop off due to weak property filters',
          ),
        },
      },
      {
        number: '02',
        tag: L('TRUST', 'TRUST'),
        title: L(
          'Шаблонні рендери замість справжніх фото',
          'Stock renders instead of real photos',
        ),
        uk: 'Лістинг обʼєкту: 5 фото від забудовника зі студії, без реальних кадрів вікон, краєвидів, інтерʼєрів. Клієнт планує інвестицію $100-500k і не отримує жодного "відчуття" обʼєкту. *Без 360°-туру або відео обʼєкт сприймається як ризик*.',
        en: 'A listing with 5 developer renders from the studio, zero real shots of windows, views, interiors. The client is planning a $100-500k investment and gets no "feel" for the property. *Without a 360° tour or video, the property feels risky*.',
        stat: {
          value: '×3.6',
          label: L(
            'вища конверсія у листингів з 360°-турами або відео-оглядами',
            'higher conversion on listings with 360° tours or video walkthroughs',
          ),
        },
      },
      {
        number: '03',
        tag: L('LANGUAGE', 'LANGUAGE'),
        title: L(
          'Сайт тільки на одній мові — втрачаєте іноземних клієнтів',
          'Single-language site — losing foreign clients',
        ),
        uk: 'Українська нерухомість — UA для українських клієнтів, але EN / RU для діаспори, PL для польських інвесторів, DE для німецьких. Іспанська курортна — EN / DE / FR / RU обовʼязково. *Один сайт на одній мові = 1/5 потенційної аудиторії*.',
        en: 'Ukrainian real estate — UA for locals, but EN / RU for diaspora, PL for Polish investors, DE for German. Spanish resort property — EN / DE / FR / RU mandatory. *A single-language site = 1/5 of the potential audience*.',
        stat: {
          value: '×5',
          label: L(
            'розширення ринку через мультимовність',
            'market expansion via multi-language',
          ),
        },
      },
    ],
    footText: L(
      'Виправляємо *всі три* за 6-10 тижнів.',
      'We fix *all three* in 6-10 weeks.',
    ),
    footCtaLabel: L('Перевірити мій сайт', 'Audit my site'),
  },
  case: {
    eyebrow: L('РЕАЛЬНИЙ КЕЙС', 'REAL CASE'),
    eyebrowEm: L('YOUR HOUSE ALBANIA', 'YOUR HOUSE ALBANIA'),
    heading: L(
      'Готове рішення для нерухомості з 5 ринками одночасно',
      'A turnkey real estate solution serving 5 markets at once',
    ),
    lede: L(
      'Your House Albania — агенція курортної нерухомості в Албанії, що працює з покупцями з Європи, США та постсоветського простору. Завдання — побудувати готове рішення: мультимовний (5 мов) мультивалютний (4 валюти) каталог з фільтрами, mortgage-калькулятор, окремі лендинги під ринок і тип обʼєкту. Це наш референс-сайт для нерухомості.',
      'Your House Albania — a resort real estate agency in Albania working with buyers from Europe, the US, and post-Soviet markets. The task — build a turnkey solution: a 5-language, 4-currency catalog with filters, mortgage calculator, dedicated landings per market and property type. This is our flagship real estate reference site.',
    ),
    meta: [
      {strong: L('10 тижнів', '10 weeks'), text: L('від брифу до релізу', 'brief to launch')},
      {
        strong: L('5 мов · 4 валюти', '5 languages · 4 currencies'),
        text: L('UA · EN · DE · IT · PL', 'UA · EN · DE · IT · PL'),
      },
      {
        strong: L('Готове рішення', 'Turnkey solution'),
        text: L('для всієї real estate ніші', 'for the whole real estate niche'),
      },
    ],
    before: {
      num: 'RE INDUSTRY · TYPICAL · 2023',
      url: 'industry-typical state',
      heading: L('× Типовий сайт агенції нерухомості', '× A typical real estate agency site'),
      bullets: [
        L(
          'Каталог 50-200 обʼєктів без фільтрів за бюджетом / районом',
          '50-200 listings without filters by budget / area',
        ),
        L('Одна мова (зазвичай локальна), один валютний прайс', 'One language (usually local), one-currency pricing'),
        L('Без mortgage-калькулятора', 'No mortgage calculator'),
        L(
          'Без Google Maps інтеграції — клієнт не знає де обʼєкт',
          'No Google Maps integration — the client doesn’t know where the property is',
        ),
        L('Без відео-турів / 360°', 'No video tours / 360°'),
        L('Лід-форма "Зателефонуйте нам" без жодних деталей', '"Call us" lead form with zero detail'),
        L('Без структурованих лендингів під типи обʼєктів', 'No structured landings per property type'),
        L('SEO нуль: одна сторінка про "купити квартиру"', 'Zero SEO: one page about "buying an apartment"'),
      ],
      foot: L(
        'Результат: 5-10 лідов/місяць, переважно місцевих, foreign-клієнти проходять повз.',
        'Result: 5-10 leads/month, mostly local, foreign clients walk past.',
      ),
    },
    after: {
      num: 'YOUR HOUSE · NEXT.JS · 2024',
      url: 'your-house-albania.vercel.app',
      heading: L(
        '✓ Готове рішення для нерухомості: 5 мов · 4 валюти · карта · калькулятор',
        '✓ Turnkey real estate solution: 5 languages · 4 currencies · map · calculator',
      ),
      bullets: [
        L(
          'Мультимовний (UA / EN / DE / IT / PL) і мультивалютний (EUR / USD / GBP / UAH) каталог',
          'Multi-language (UA / EN / DE / IT / PL) and multi-currency (EUR / USD / GBP / UAH) catalog',
        ),
        L('Mortgage-калькулятор з привʼязкою до місцевих ставок', 'Mortgage calculator tied to local rates'),
        L(
          'Каталог обʼєктів з 12-параметровими фільтрами + Google Maps + 360° тури',
          'Catalog with 12-parameter filters + Google Maps + 360° tours',
        ),
        L('Окремі лендинги під ринок (Albania · Italy · Montenegro)', 'Dedicated landings per market (Albania · Italy · Montenegro)'),
        L(
          'Окремі лендинги під тип обʼєкту (apartment · villa · investment)',
          'Dedicated landings per property type (apartment · villa · investment)',
        ),
        L('Sanity CMS — додавання обʼєкту з телефону за 5 хв', 'Sanity CMS — add a property from your phone in 5 min'),
        L('Schema.org RealEstateListing повна розмітка', 'Full Schema.org RealEstateListing markup'),
        L('Інтеграція з CRM (HubSpot) для регіональних менеджерів', 'HubSpot CRM integration for regional managers'),
        L(
          'Geo-routing: користувач з Italy бачить сайт італійською з EUR',
          'Geo-routing: a visitor from Italy sees the Italian site in EUR',
        ),
      ],
      foot: L(
        'Результат: продаючий референс-шаблон для будь-якої real estate агенції. Розгортаємо клієнтам за 4 тижні з кастомізацією під ринок.',
        'Result: a sales-ready reference template for any real estate agency. We deploy to clients in 4 weeks with market-specific customization.',
      ),
    },
    results: [
      {value: '5', tag: L('MARKETS', 'MARKETS'), label: L('одночасно з одного сайту', 'simultaneous from one site')},
      {value: '4', tag: L('CURRENCIES', 'CURRENCIES'), label: L('EUR · USD · GBP · UAH', 'EUR · USD · GBP · UAH')},
      {value: '4 тижні', tag: L('DEPLOY TIME', 'DEPLOY TIME'), label: L('для нової агенції', 'for a new agency')},
      {value: 'full', tag: L('MULTI-LANG SEO', 'MULTI-LANG SEO'), label: L('hreflang + Schema.org', 'hreflang + Schema.org')},
    ],
  },
  outcome: {
    recapText: L(
      'Готове рішення для будь-якої real estate агенції з кастомізацією під ваш ринок.',
      'A turnkey solution for any real estate agency, customized for your market.',
    ),
    directionsTitle: L(
      'Працюємо з real estate бізнесом будь-якого формату',
      'We work with real estate businesses of every format',
    ),
    directionsLede: L(
      'Підхід відрізняється для локальної агенції з 50-200 обʼєктами і міжнародної з 1000+. Тарифи нижче — під обидва сценарії.',
      'The approach differs for a local agency with 50-200 listings and an international one with 1000+. The pricing tiers below cover both scenarios.',
    ),
    audienceCards: [
      {
        title: L('Локальна агенція / приватний листинг', 'Local agency / private listing'),
        bullets: [
          L('50-300 обʼєктів, 1-2 мови, локальний ринок', '50-300 listings, 1-2 languages, local market'),
          L('Каталог з фільтрами + Google Maps', 'Catalog with filters + Google Maps'),
          L('Mortgage калькулятор під локальні ставки', 'Mortgage calculator with local rates'),
          L('Розширений пакет — Pro Plus', 'Pro Plus tier fits'),
        ],
      },
      {
        title: L('Міжнародний / мульти-ринок', 'International / multi-market'),
        bullets: [
          L('500+ обʼєктів, 3-5 мов, 3-4 валюти', '500+ listings, 3-5 languages, 3-4 currencies'),
          L('Geo-routing + лендинги під кожен ринок', 'Geo-routing + landings per market'),
          L('HubSpot / Salesforce CRM integration', 'HubSpot / Salesforce CRM integration'),
          L('Custom — від $14,000', 'Custom tier — from $14,000'),
        ],
      },
    ],
    benefitsHeading: L('Як це працює на сайті', 'How it shows up on the site'),
    benefitRows: [
      {
        feature: 'FEATURE · 01 / 03',
        heading: L(
          'Каталог з 12-параметровими фільтрами і картою',
          'Catalog with 12-parameter filters and a map',
        ),
        bullets: [
          L('Фільтри: район, тип, ціна, метраж, кімнати, ремонт, балкон, парковка', 'Filters: area, type, price, m², rooms, condition, balcony, parking'),
          L('Google Maps з усіма обʼєктами одночасно', 'Google Maps with all listings at once'),
          L('Heatmap цін за районами', 'Price heatmap by area'),
          L('Збереження обраного між сесіями', 'Favorites persist between sessions'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Карта', 'Map'),
          L('Фільтри', 'Filters'),
        ],
      },
      {
        feature: 'FEATURE · 02 / 03',
        heading: L('Mortgage-калькулятор', 'Mortgage calculator'),
        bullets: [
          L('Ставки привʼязані до регіону (UA / Albania / Italy)', 'Rates tied to region (UA / Albania / Italy)'),
          L('Розрахунок з depositом, терміном, типом ставки', 'Calculation with deposit, term, rate type'),
          L('PDF-розрахунок на email клієнту', 'PDF calculation to client’s email'),
          L('Зберігається в CRM з повним breakdown', 'Saved in CRM with full breakdown'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Калькулятор', 'Calculator'),
          L('Ставки', 'Rates'),
        ],
      },
      {
        feature: 'FEATURE · 03 / 03',
        heading: L('Лендинги під ринок і тип нерухомості', 'Landings per market and property type'),
        bullets: [
          L(
            '"Квартири в Барселоні" / "Вілли в Албанії" / "Інвестиційна нерухомість"',
            '"Apartments in Barcelona" / "Villas in Albania" / "Investment property"',
          ),
          L('Кожен лендинг — свій SEO, своя мова, своя валюта', 'Each landing — its own SEO, language, currency'),
          L(
            'Geo-routing: клієнт з Italy одразу бачить італійський сайт',
            'Geo-routing: a visitor from Italy lands on the Italian site',
          ),
          L('50+ лендингів програмно генеруються', '50+ landings generated programmatically'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Barcelona', 'Barcelona'),
          L('Albania', 'Albania'),
          L('Investment', 'Investment'),
        ],
      },
    ],
  },
  testimonial: {
    quote: L(
      'Шукали готове рішення для нашої агенції — щоб не будувати з нуля. Code-Site.Art дав референс-сайт Your House Albania як основу, кастомізували під наш ринок за 4 тижні. Запустилися з трьома мовами і двома валютами на старті.',
      'We were looking for a turnkey solution for our agency — not to build from scratch. Code-Site.Art used Your House Albania as the reference, customized it to our market in 4 weeks. We launched with three languages and two currencies on day one.',
    ),
    authorName: 'Real Estate Agency Founder',
    authorInitials: 'RE',
    authorRole: L(
      'Засновник міжнародної real estate агенції',
      'Founder, international real estate agency',
    ),
  },
  services: {
    heading: L(
      'Що ми будуємо для real estate бізнесу',
      'What we build for real estate businesses',
    ),
    sub: L(
      'Готова основа під вашу нішу — кастомізуємо за 4 тижні. Або повний custom під унікальний бізнес-процес.',
      'A ready foundation for your niche — customized in 4 weeks. Or a full custom build for a unique business process.',
    ),
    features: [
      {
        title: L('Каталог обʼєктів', 'Property catalog'),
        bullets: [
          L('12-параметрові фільтри + Google Maps', '12-parameter filters + Google Maps'),
          L('360° тури і відео-walkthroughs', '360° tours and video walkthroughs'),
          L('Порівняння до 4 обʼєктів side-by-side', 'Side-by-side comparison up to 4 properties'),
          L('Schema.org RealEstateListing повна розмітка', 'Full Schema.org RealEstateListing markup'),
        ],
      },
      {
        title: L('Mortgage калькулятор', 'Mortgage calculator'),
        bullets: [
          L('Ставки за регіоном', 'Region-based rates'),
          L('Депозит, термін, тип ставки', 'Deposit, term, rate type'),
          L('PDF-розрахунок клієнту', 'PDF report to the client'),
          L('Лід в CRM з повним breakdown', 'Lead in CRM with full breakdown'),
        ],
      },
      {
        title: L('Мультимовність + мультивалютність', 'Multi-language + multi-currency'),
        bullets: [
          L('До 5 мов з власною URL-структурою', 'Up to 5 languages with own URL structure'),
          L('До 4 валют з геолокацією', 'Up to 4 currencies with geo-routing'),
          L('hreflang + Schema.org', 'hreflang + Schema.org'),
          L('Geo-routing у відповідну мову', 'Geo-routing to appropriate language'),
        ],
      },
      {
        title: L('Лендинги під ринок і тип', 'Landings per market and type'),
        bullets: [
          L('"Квартири у [місті]" — окрема SEO-сторінка', '"Apartments in [city]" — own SEO page'),
          L('"Інвестиційна нерухомість" — окремий лендинг', '"Investment property" — separate landing'),
          L('50-200 програмних landing pages', '50-200 programmatic landing pages'),
          L('Кожен з власним SEO, мовою, валютою', 'Each with its own SEO, language, currency'),
        ],
      },
      {
        title: L(
          'Розподіл лідов по регіональних менеджерах',
          'Lead routing by regional managers',
        ),
        bullets: [
          L('Лід з Italy → ​італійський менеджер', 'Lead from Italy → Italian manager'),
          L('Лід з Germany → німецький менеджер', 'Lead from Germany → German manager'),
          L('Лід з UA → український менеджер', 'Lead from UA → Ukrainian manager'),
          L('HubSpot / Salesforce / KeyCRM', 'HubSpot / Salesforce / KeyCRM'),
        ],
      },
      {
        title: L('Sanity CMS adminка', 'Sanity CMS admin'),
        bullets: [
          L('Додавання обʼєкту з телефону за 5 хв', 'Add a property from your phone in 5 min'),
          L('12 фото з галереї, заливаються паралельно', '12 photos uploaded from gallery in parallel'),
          L('Локалізація на 5 мов в одному документі', 'Localize to 5 languages in one document'),
          L('Bulk-update (наприклад, знижка на район)', 'Bulk update (e.g., discount by area)'),
        ],
      },
    ],
    integrationsHeading: L(
      'Підключаємо всі real estate системи',
      'We connect every real estate system',
    ),
    integrationsSub: L(
      'Заявка з калькулятора йде до регіонального менеджера через CRM-routing. Обʼєкт з MLS-фіду — автоматичний імпорт. Календар показу — Calendly. Платіж за резервацію — Stripe. Менеджер отримує сповіщення у Telegram або Slack. Жодних втрачених лідов через email-спам.',
      'Calculator leads route to the regional manager via CRM routing. Properties from MLS feeds — auto-import. Viewing calendar — Calendly. Reservation payment — Stripe. Manager gets Telegram or Slack alerts. Zero leads lost to email spam.',
    ),
    integrations: [
      'Google Maps',
      'HubSpot',
      'Salesforce',
      'KeyCRM',
      'AmoCRM',
      'Bitrix24',
      'Calendly',
      'Zoom',
      'Stripe',
      'LiqPay',
      'DocuSign',
      'Telegram',
    ],
    bottomCallouts: [
      L(
        'Geo-routing · клієнт з Italy одразу на італійському сайті в EUR',
        'Geo-routing · a client from Italy lands on the Italian site in EUR',
      ),
      L(
        'Готове рішення · кастомізуємо під ваш ринок за 4 тижні',
        'Turnkey solution · customized for your market in 4 weeks',
      ),
      L(
        'Schema.org RealEstateListing · виходимо в Google Maps + Google Search',
        'Schema.org RealEstateListing · visible in Google Maps + Google Search',
      ),
    ],
  },
  comparison: {
    heading: L(
      'Чим кодовий сайт нерухомості кращий за шаблон',
      'Why a custom real estate site beats a template',
    ),
    rows: [
      {param: L('Каталог з фільтрами', 'Filtered catalog'), wp: L('плагін', 'plugin'), wix: L('базовий', 'basic'), custom: L('12-параметрові', '12-parameter')},
      {param: L('Google Maps інтеграція', 'Google Maps'), wp: L('плагін', 'plugin'), wix: L('базова', 'basic'), custom: L('повна', 'full')},
      {param: L('Mortgage калькулятор', 'Mortgage calculator'), wp: L('плагін (баги)', 'plugin (buggy)'), wix: L('через Apps', 'via Apps'), custom: L('кастомний з PDF', 'custom with PDF')},
      {param: L('Мультимовність', 'Multi-language'), wp: L('WPML plugin', 'WPML plugin'), wix: L('базова', 'basic'), custom: L('повна структура', 'full structure')},
      {param: L('Мультивалютність', 'Multi-currency'), wp: L('через плагіни', 'via plugins'), wix: L('немає', 'none'), custom: L('вбудовано', 'built-in')},
      {param: L('Geo-routing', 'Geo-routing'), wp: L('через плагіни', 'via plugins'), wix: L('немає', 'none'), custom: L('автоматичний', 'automatic')},
      {param: L('360° тури', '360° tours'), wp: L('плагін', 'plugin'), wix: L('через embed', 'via embed'), custom: L('нативно', 'native')},
      {param: L('TCO за 3 роки', '3-year TCO'), wp: L('$5-8k', '$5-8k'), wix: L('$4-7k', '$4-7k'), custom: L('$5-10k', '$5-10k')},
    ],
    pricingHeading: L(
      'Скільки коштує сайт real estate бізнесу',
      'Pricing for a real estate website',
    ),
    bottomCta: L(
      'Повний прайс і деталі — на /pricing',
      'Full pricing and details — on /en/pricing',
    ),
  },
  faq: {
    heading: FAQ_HEADING,
    items: [
      {
        q: L(
          'Чи можна використати Your House Albania як референс і кастомізувати?',
          'Can we use Your House Albania as a reference and customize?',
        ),
        a: {
          uk: 'Так. Це наш референс-шаблон для real estate. Кастомізація під ваш ринок (мови, валюти, регіональні особливості, типи нерухомості, локальні CRM) — 4-8 тижнів залежно від обʼєму. Базова кастомізація — Pro Plus тир. Складна (нові інтеграції, унікальна бізнес-логіка) — Custom.',
          en: 'Yes. It’s our real estate reference template. Customization for your market (languages, currencies, regional specifics, property types, local CRMs) — 4-8 weeks depending on scope. Basic customization — Pro Plus tier. Complex (new integrations, unique business logic) — Custom.',
        },
      },
      {
        q: L(
          'Як підключити MLS-фід (Multiple Listing Service) для автоімпорту?',
          'How to connect an MLS feed for auto-import?',
        ),
        a: {
          uk: 'Залежить від країни. У США/Канаді — стандарт RETS / RESO Web API, підключаємо через офіційні AOR-аккаунти. Європа — фрагментовано (Idealista, Rightmove, ImmoScout24 — у кожного власний API). Кожна інтеграція — $1,200-2,500. Якщо у вас немає MLS — додавання обʼєктів вручну через Sanity (5 хв на обʼєкт).',
          en: 'Depends on the country. US/Canada — RETS / RESO Web API standard, connected via official AOR accounts. Europe — fragmented (Idealista, Rightmove, ImmoScout24 — each with its own API). Each integration — $1,200-2,500. If you have no MLS — manual entries via Sanity (5 min per property).',
        },
      },
      {
        q: L(
          'Як налаштувати mortgage-калькулятор під різні країни?',
          'How to set up the mortgage calculator for different countries?',
        ),
        a: {
          uk: 'Ставки локальних банків зберігаються в Sanity і оновлюються через API центральних банків (UA: НБУ, EU: ECB, US: Fed). Калькулятор обирає ставки за geo-locации користувача або вибраному регіону. Можна окремо налаштувати "наші ставки" якщо ви маєте партнерство з конкретними банками.',
          en: 'Local bank rates are stored in Sanity and updated via central bank APIs (UA: NBU, EU: ECB, US: Fed). The calculator picks rates by user geo-location or selected region. You can optionally configure "our rates" if you have partnerships with specific banks.',
        },
      },
      {
        q: L(
          'Чи можна продавати нерухомість онлайн з повним циклом?',
          'Can we sell real estate online end-to-end?',
        ),
        a: {
          uk: 'Технічно так, але legally складно. Резервація через депозит ($1,000-5,000 через Stripe / LiqPay) як підтвердження інтересу — стандарт. Повна транзакція — через notary або escrow service, не через сайт. DocuSign для попередніх угод. Якщо ви онлайн-агенція без офісу — підключаємо повну воронку.',
          en: 'Technically yes, but legally complex. Reservation via deposit ($1,000-5,000 via Stripe / LiqPay) as intent confirmation — standard. Full transaction — through notary or escrow service, not the site. DocuSign for preliminary contracts. If you’re an online-only agency — we wire the full funnel.',
        },
      },
      {
        q: L(
          'Чи підтримуєте 360° тури і відео-walkthroughs?',
          'Do you support 360° tours and video walkthroughs?',
        ),
        a: {
          uk: 'Так. Інтеграція з Matterport, Kuula, RoundMe — стандарт. Відео через YouTube / Vimeo embed або власний player. Дрон-фото — окремий розділ галереї. Якщо у вас немає 360° обладнання — рекомендуємо локальних партнерів ($150-300 за обʼєкт).',
          en: 'Yes. Matterport, Kuula, RoundMe integrations — standard. Video via YouTube / Vimeo embed or custom player. Drone shots — separate gallery section. If you don’t have 360° equipment — we recommend local partners ($150-300 per property).',
        },
      },
      {
        q: L(
          'Як працює geo-routing? Що бачить клієнт з Италии?',
          'How does geo-routing work? What does an Italian client see?',
        ),
        a: {
          uk: 'Перший раз заходить на your-house.com → IP визначає Italy → редирект на /it/ з ціною в EUR. Запам’ятовуємо в cookie — наступного разу одразу. Користувач може переключити мову / валюту вручну (зберігається в cookie). SEO нормально працює: hreflang каже Google що /it/ для Italy, /en/ для світу.',
          en: 'First visit to your-house.com → IP identifies Italy → redirect to /it/ with EUR pricing. Saved in cookie — next visit goes directly. The user can switch language / currency manually (saved in cookie). SEO works correctly: hreflang tells Google /it/ is for Italy, /en/ is global.',
        },
      },
    ],
  },
  audit: {
    heading: L(
      'Безкоштовний аудит вашого real estate сайту',
      'Free audit of your real estate site',
    ),
    sub: L(
      'Залиште посилання на ваш поточний сайт. Протягом 3 робочих днів — детальний звіт у PDF.',
      'Drop a link to your current site. Detailed PDF report within 3 business days.',
    ),
    deliverables: [
      L(
        'Аналіз каталогу: чи знаходить клієнт свій обʼєкт за 30 секунд',
        'Catalog analysis: can the client find their property in 30 seconds',
      ),
      L(
        'SEO-аудит: чи виходите в Google Maps + Google Search',
        'SEO audit: are you visible in Google Maps + Google Search',
      ),
      L(
        'Mobile UX-аудит (65% real estate трафіку — mobile)',
        'Mobile UX audit (65% of real estate traffic is mobile)',
      ),
      L(
        'Аналіз мультимовності і geo-routing (якщо є)',
        'Multi-language and geo-routing analysis (if present)',
      ),
      L(
        'План покращень з пріоритетами + орієнтовний бюджет',
        'Prioritized improvement plan + budget estimate',
      ),
    ],
    submit: L('Отримати безкоштовний аудит', 'Get my free audit'),
    disclaim: L(
      'Без зобовʼязань. Корисно, навіть якщо вирішите працювати з іншим підрядником.',
      'No obligation. Useful even if you choose a different vendor.',
    ),
  },
}

/* ──────────────────────────────────────────────────────────────────────────
 * 8. COURSES  (Aleko Course)
 * ──────────────────────────────────────────────────────────────────────── */

const courses: Industry = {
  slug: 'courses',
  order: 8,
  title: L(
    'Сайти для онлайн-курсів і блогерів',
    'Websites for online courses & creators',
  ),
  seo: {
    title: L(
      'Сайти для онлайн-курсів і блогерів — Code-Site.Art',
      'Websites for online courses & creators — Code-Site.Art',
    ),
    description: L(
      'Кастомні лендинги для онлайн-курсів, інфо-продуктів і блогерських воронок. Stripe чекаут, A/B тестинг, інтеграція з Teachable / Thinkific. Кейс: Aleko Course.',
      'Custom landings for online courses, info-products, and creator funnels. Stripe checkout, A/B testing, Teachable / Thinkific integrations. Case: Aleko Course.',
    ),
  },
  hero: {
    eyebrow: L(
      'САЙТИ ДЛЯ КУРСІВ І ЛЕНДИНГІВ · від $3 500',
      'WEBSITES FOR COURSES & LANDINGS · from $3,500',
    ),
    heading: L(
      'Курс-лендинг, який конвертить холодний трафік у *4-7%*',
      'A course landing that converts cold traffic at *4-7%*',
    ),
    h1Num: '4-7%',
    h1NumLabel: L('конверсія\nз холодного трафіку', 'cold-traffic\nconversion'),
    lede: L(
      'Не «сайт-візитка з посиланнями на курси». Кастомний продаючий лендинг, оптимізований під холодний трафік з реклами і прогрітий — з підписки. Без вашої участі більше ніж 5 годин. Запуск за 4–8 тижнів — і ви знімаєтеся з рекламних воронок, на яких *втрачали гроші*.',
      'Not "a brochure site with course links." A custom selling landing optimized for both cold paid traffic and warm email traffic. No more than 5 hours of your time. Live in 4-8 weeks — and you stop *losing money* in ad funnels.',
    ),
    features: [
      L('Чекаут | Stripe · LiqPay · WayForPay', 'Checkout | Stripe · LiqPay · WayForPay'),
      L('Інтеграція | Teachable · Thinkific · Kajabi', 'Integration | Teachable · Thinkific · Kajabi'),
      L('A/B тестинг | через Vercel Edge', 'A/B testing | via Vercel Edge'),
      L(
        'Email-воронка | Mailchimp · Brevo · GetResponse',
        'Email funnel | Mailchimp · Brevo · GetResponse',
      ),
    ],
    ctaPrimary: CTA_PRIMARY,
    ctaSecondary: L('Подивитися курс-кейси', 'See course case studies'),
    stats: [
      {value: '47', label: L('курс-\nлендингів', 'course\nlandings built')},
      {value: '4.8/5', label: L('оцінка\nклієнтів', 'client\nrating')},
      {value: '4-7%', label: L('конверсія\nхолодного трафіку', 'cold-traffic\nconversion')},
    ],
    tickerItems: [
      L('Онлайн-курси', 'Online courses'),
      L('Інфо-продукти', 'Info-products'),
      L('Блогери', 'Bloggers'),
      L('Коучі', 'Coaches'),
      L('Психологи', 'Psychologists'),
      L('Фітнес-тренери', 'Fitness trainers'),
      L('Менторські програми', 'Mentorship programs'),
      L('Майстер-класи', 'Master classes'),
      L('Вебінари', 'Webinars'),
      L('Воркшопи', 'Workshops'),
      L('Лідерські програми', 'Leadership programs'),
      L('Підписочні моделі', 'Subscription models'),
    ],
    deviceTags: [
      {primary: L('1-step checkout', '1-step checkout')},
      {primary: L('A/B Vercel Edge', 'A/B Vercel Edge')},
      {kind: 'good', mini: '96', primary: L('Lighthouse', 'Lighthouse')},
    ],
  },
  reasons: {
    eyebrow: L('ДІАГНОСТИКА · 3 ПРИЧИНИ', 'DIAGNOSIS · 3 REASONS'),
    heading: L(
      '3 причини, чому ваш курс-лендинг\n*не продає*',
      '3 reasons your course landing\n*doesn’t sell*',
    ),
    metaRow: L('аналіз 40+ курс-лендингів · 2024–25', 'audit of 40+ course landings · 2024–25'),
    reasons: [
      {
        number: '01',
        tag: L('STRUCTURE', 'STRUCTURE'),
        title: L(
          'Лендинг написаний для тих, хто вже хоче купити',
          'The landing is written for people already ready to buy',
        ),
        uk: 'Холодний трафік з реклами зайшов уперше — а у вас зразу "купити курс за $497". Без проблеми, без обіцянки результату, без перевірки чи людина в цільовій аудиторії. *92% залишають сторінку за 8 секунд*. Лендинг має продавати, а не презентувати.',
        en: 'Cold paid traffic arrives for the first time — and you immediately show "buy the course for $497." No pain, no outcome promise, no qualification. *92% leave in 8 seconds*. The landing should sell, not present.',
        stat: {
          value: '92%',
          label: L(
            'холодного трафіку зливається на лендингу без правильної структури',
            'of cold traffic drops off on a landing without the right structure',
          ),
        },
      },
      {
        number: '02',
        tag: L('TRUST', 'TRUST'),
        title: L('Жодних доказів результатів учнів', 'No proof of student results'),
        uk: 'На лендингу — фото викладача в студії, сторіс інстаграму, обіцянка "змініть життя за 30 днів". Жодного кейсу: який учень / що отримав / у які терміни. *Без specificity результатів — це слова*. Конверсія 0.3-0.8%.',
        en: 'The landing has a teacher photo in the studio, Instagram stories, the promise "change your life in 30 days." Zero cases: which student / what they got / over what timeline. *Without specific results — empty words*. Conversion 0.3-0.8%.',
        stat: {
          value: '×8',
          label: L(
            'вища конверсія у лендингів з конкретними кейсами учнів',
            'higher conversion on landings with concrete student cases',
          ),
        },
      },
      {
        number: '03',
        tag: L('CHECKOUT', 'CHECKOUT'),
        title: L(
          'Чекаут на 4 кроки з обовʼязковою реєстрацією',
          '4-step checkout with forced registration',
        ),
        uk: 'Клієнт прогрівся, дійшов до "купити" — і має зареєструватися в Teachable, підтвердити email, налаштувати пароль, після чого ввести картку. *Половина зливається*. Чекаут має бути на 1 крок: ввів картку → оплатив → отримав доступ.',
        en: 'The client warmed up, hit "buy" — and now has to register in Teachable, verify email, set a password, then enter the card. *Half drop off*. Checkout should be one step: enter card → pay → get access.',
        stat: {
          value: '55%',
          label: L(
            'клієнтів зливаються на checkout з реєстрацією',
            'of clients abandon checkout with forced registration',
          ),
        },
      },
    ],
    footText: L(
      'Виправляємо *всі три* за 4-8 тижнів.',
      'We fix *all three* in 4-8 weeks.',
    ),
    footCtaLabel: L('Перевірити мій лендинг', 'Audit my landing'),
  },
  case: {
    eyebrow: L('РЕАЛЬНИЙ КЕЙС', 'REAL CASE'),
    eyebrowEm: L('ALEKO COURSE', 'ALEKO COURSE'),
    heading: L(
      'До / Після на прикладі реального клієнта',
      'Before / After — a real client case',
    ),
    lede: L(
      'До нас звернувся Алеко — український блогер-мільйонник з аудиторією 1M+. Завдання: побудувати продаючий лендинг для його курсу, оптимізований під холодний трафік з рекламних воронок і теплий — з email-розсилки. Окремо — інтеграція з Teachable для доставки контенту учням після купівлі.',
      'Aleko — a Ukrainian million-follower blogger — came to us. The task: build a selling landing for his course, optimized for cold paid traffic and warm email traffic. Plus Teachable integration for content delivery after purchase.',
    ),
    meta: [
      {strong: L('6 тижнів', '6 weeks'), text: L('від брифу до релізу', 'brief to launch')},
      {
        strong: L('1 курс · 3 тарифи', '1 course · 3 tiers'),
        text: L('landing + чекаут + Teachable', 'landing + checkout + Teachable'),
      },
      {strong: L('Cold + Warm', 'Cold + Warm'), text: L('A/B оптимізація під аудиторії', 'A/B optimization')},
    ],
    before: {
      num: 'ALEKO · v1 · Teachable 2023',
      url: 'previous Teachable landing',
      heading: L(
        '× Стандартний Teachable-лендинг без кастомізації',
        '× Standard Teachable landing without customization',
      ),
      bullets: [
        L(
          'Лендинг — шаблонний з Teachable, як у тисяч інших курсів',
          'Landing — a Teachable template like thousands of other courses',
        ),
        L(
          'Чекаут на 4 кроки через Teachable-аккаунт + підтвердження email',
          '4-step checkout via Teachable account + email verification',
        ),
        L(
          'Жодних A/B-тестів — рекламний трафік йшов один варіант лендингу',
          'Zero A/B tests — paid traffic ran one landing variant',
        ),
        L('Конверсія холодного трафіку 0.7%, дорогі заявки', 'Cold traffic conversion 0.7%, expensive leads'),
        L(
          'Email-воронка через Mailchimp, але без чіткої сегментації',
          'Email funnel via Mailchimp but without clear segmentation',
        ),
        L('Lighthouse Performance 51 (Teachable шаблон важкий)', 'Lighthouse Performance 51 (the Teachable template is heavy)'),
        L(
          'Жодного UTM-трекінгу для розуміння, яка реклама конвертить',
          'Zero UTM tracking to understand which ads convert',
        ),
      ],
      foot: L(
        'Результат: CPL $24, ROAS не виходив у плюс на холодному трафіку.',
        'Result: CPL $24, ROAS underwater on cold traffic.',
      ),
    },
    after: {
      num: 'ALEKO · v2 · Next.js 2024',
      url: 'alekocourse.com',
      heading: L(
        '✓ Кастомний лендинг + 1-step checkout + Teachable integration',
        '✓ Custom landing + 1-step checkout + Teachable integration',
      ),
      bullets: [
        L(
          'Кастомний лендинг під cold + warm трафік (A/B варіанти)',
          'Custom landing for cold + warm traffic (A/B variants)',
        ),
        L(
          '1-step checkout: ввів картку → оплатив → одразу доступ в Teachable',
          '1-step checkout: enter card → pay → instant Teachable access',
        ),
        L('Stripe + LiqPay для UA-клієнтів', 'Stripe + LiqPay for Ukrainian clients'),
        L(
          '3 тарифи (basic / standard / premium) з upsell-логікою',
          '3 tiers (basic / standard / premium) with upsell logic',
        ),
        L(
          'Email-воронка: 5-step sequence через Brevo з сегментацією',
          'Email funnel: 5-step sequence via Brevo with segmentation',
        ),
        L(
          'A/B тестинг через Vercel Edge: 4 варіанти заголовків одночасно',
          'A/B testing via Vercel Edge: 4 headline variants simultaneously',
        ),
        L('UTM-параметри + GA4 + Meta Pixel правильно', 'UTM params + GA4 + Meta Pixel done right'),
        L('Lighthouse Performance 96, LCP 0.7c', 'Lighthouse Performance 96, LCP 0.7s'),
        L('Кейс-стаді учнів з конкретними результатами і фото', 'Student case studies with concrete results and photos'),
        L('Mobile-first дизайн (78% трафіку з блогу — mobile)', 'Mobile-first design (78% of blog traffic is mobile)'),
      ],
      foot: L(
        'Результат: CPL $4.20 (×5.7 покращення), ROAS перейшов у плюс на 5-й день після запуску.',
        'Result: CPL $4.20 (×5.7 improvement), ROAS turned positive 5 days after launch.',
      ),
    },
    results: [
      {value: '×5.7', tag: L('CPL', 'CPL'), label: L('покращення вартості заявки', 'CPL improvement')},
      {value: '4.8%', tag: L('CONVERSION', 'CONVERSION'), label: L('холодного трафіку (було 0.7%)', 'cold traffic (was 0.7%)')},
      {value: '96', tag: L('LIGHTHOUSE', 'LIGHTHOUSE'), label: L('Performance (було 51)', 'Performance score (was 51)')},
      {value: '1 крок', tag: L('CHECKOUT', 'CHECKOUT'), label: L('замість 4-х через Teachable', '1 step vs 4 via Teachable')},
    ],
  },
  outcome: {
    recapText: L(
      'Ваш лендинг має продавати курс, а не презентувати викладача.',
      'Your landing should sell the course, not present the teacher.',
    ),
    directionsTitle: L(
      'Працюємо з курс-творцями будь-якого формату',
      'We work with course creators of every format',
    ),
    directionsLede: L(
      'Підхід відрізняється для соло-блогера з 1 курсом і освітнього бренду з 10+ продуктами. Тарифи нижче — під обидва сценарії.',
      'The approach differs for a solo blogger with 1 course and an education brand with 10+ products. The pricing tiers below cover both scenarios.',
    ),
    audienceCards: [
      {
        title: L('Блогер / коуч / соло-творець', 'Blogger / coach / solo creator'),
        bullets: [
          L('1-3 курси, особистий бренд, аудиторія в соцмережах', '1-3 courses, personal brand, social-media audience'),
          L('Лендинг + чекаут + інтеграція з Teachable / Thinkific', 'Landing + checkout + Teachable / Thinkific integration'),
          L('A/B тестинг для оптимізації холодного трафіку', 'A/B testing to optimize cold traffic'),
          L('Базовий пакет — Industry Pro', 'Industry Pro tier fits'),
        ],
      },
      {
        title: L('Освітній бренд · 10+ продуктів', 'Education brand · 10+ products'),
        bullets: [
          L('Каталог курсів з фільтрами', 'Course catalog with filters'),
          L(
            'Власна платформа доставки контенту або глибока інтеграція з Teachable',
            'Custom content delivery platform or deep Teachable integration',
          ),
          L('Підписочна модель + upsell + cross-sell', 'Subscription model + upsell + cross-sell'),
          L('Розширений пакет — Pro Plus', 'Pro Plus tier fits'),
        ],
      },
    ],
    benefitsHeading: L('Як це працює на сайті', 'How it shows up on the site'),
    benefitRows: [
      {
        feature: 'FEATURE · 01 / 03',
        heading: L(
          'Структура лендингу під cold + warm трафік',
          'Landing structure for cold + warm traffic',
        ),
        bullets: [
          L(
            'Hook (проблема цільової аудиторії) → Agitate (наслідки) → Solve (як курс вирішує)',
            'Hook (target audience pain) → Agitate (consequences) → Solve (how the course fixes it)',
          ),
          L('3-5 кейсів учнів з конкретними результатами + фото', '3-5 student cases with concrete results + photos'),
          L('3 тарифи з upsell-логікою (Order Bump)', '3 tiers with upsell logic (Order Bump)'),
          L('5-7 FAQ під типові заперечення', '5-7 FAQ targeting typical objections'),
        ],
        mockType: 'pages',
        mockTags: [
          L('Hook', 'Hook'),
          L('Agitate', 'Agitate'),
          L('Solve', 'Solve'),
        ],
      },
      {
        feature: 'FEATURE · 02 / 03',
        heading: L('1-крокова оплата без реєстрації', '1-step payment without registration'),
        bullets: [
          L('Ввів картку → оплатив → одразу доступ', 'Enter card → pay → instant access'),
          L('Stripe / LiqPay / WayForPay / Mono', 'Stripe / LiqPay / WayForPay / Mono'),
          L(
            'Гостьовий чекаут (Teachable аккаунт створюється автоматично)',
            'Guest checkout (Teachable account created automatically)',
          ),
          L('Збереження стану корзини між сесіями', 'Cart state persists between sessions'),
        ],
        mockType: 'pages',
        mockTags: [
          L('1-step', '1-step'),
          L('Guest', 'Guest'),
        ],
      },
      {
        feature: 'FEATURE · 03 / 03',
        heading: L('A/B тестинг через Vercel Edge', 'A/B testing via Vercel Edge'),
        bullets: [
          L('4 варіанти заголовків + CTA одночасно', '4 headline + CTA variants simultaneously'),
          L('Розподіл трафіку 25/25/25/25 (або кастомно)', 'Traffic split 25/25/25/25 (or custom)'),
          L('Аналітика в GA4 + конверсія per варіант', 'Analytics in GA4 + conversion per variant'),
          L('Маркетолог змінює тести через Sanity без розробника', 'The marketer changes tests via Sanity, no developer'),
        ],
        mockType: 'pages',
        mockTags: [
          L('A/B', 'A/B'),
          L('Vercel Edge', 'Vercel Edge'),
        ],
      },
    ],
  },
  testimonial: {
    quote: L(
      'Замовляли лендинг — отримали машину для генерації заявок. CPL впав в 5 разів, окупність реклами вийшла в плюс на 5-й день. Раніше ми боролись з цим 2 роки на стандартному Teachable-шаблоні.',
      'We ordered a landing — we got a lead-gen machine. CPL dropped 5×, ad ROAS turned positive on day 5. We struggled with this for 2 years on the standard Teachable template.',
    ),
    authorName: 'Алеко / Aleko',
    authorInitials: 'АЛ',
    authorRole: L(
      'Блогер-мільйонник, засновник Aleko Course',
      'Million-follower blogger, founder of Aleko Course',
    ),
  },
  services: {
    heading: L('Що ми будуємо для курс-творців', 'What we build for course creators'),
    sub: L(
      'Не "сайт-візитка про викладача". Лендинг-машина, що конвертує трафік у клієнтів і повертає кожен долар реклами в плюс.',
      'Not "a brochure site about the teacher." A landing machine that converts traffic into clients and brings every ad dollar back into the green.',
    ),
    features: [
      {
        title: L('Кастомний продаючий лендинг', 'Custom selling landing'),
        bullets: [
          L('Структура: Hook → Agitate → Solve → Proof → Offer', 'Structure: Hook → Agitate → Solve → Proof → Offer'),
          L('3-5 кейсів учнів з фото і результатами', '3-5 student cases with photos and results'),
          L('3 тарифи з порівнянням', '3 tiers with comparison'),
          L('5-7 FAQ під типові заперечення', '5-7 FAQ targeting common objections'),
        ],
      },
      {
        title: L('1-крокова оплата', '1-step checkout'),
        bullets: [
          L('Stripe / LiqPay / WayForPay / Mono', 'Stripe / LiqPay / WayForPay / Mono'),
          L('Гостьовий чекаут без реєстрації', 'Guest checkout, no registration'),
          L('Order Bump (додатковий продукт на чекауті)', 'Order Bump (extra product at checkout)'),
          L('Apple Pay / Google Pay', 'Apple Pay / Google Pay'),
        ],
      },
      {
        title: L('Інтеграції з платформами доставки', 'Course platform integrations'),
        bullets: [
          L('Teachable, Thinkific, Kajabi, Podia', 'Teachable, Thinkific, Kajabi, Podia'),
          L('Автоматичне створення аккаунту після оплати', 'Auto account creation after payment'),
          L('SSO між лендингом і платформою', 'SSO between landing and platform'),
          L('Webhook про статус курсу (почав / завершив)', 'Webhook for course status (started / finished)'),
        ],
      },
      {
        title: L('A/B тестинг через Vercel Edge', 'A/B testing via Vercel Edge'),
        bullets: [
          L('4 варіанти заголовків одночасно', '4 headline variants simultaneously'),
          L('Розподіл трафіку через middleware', 'Traffic split via middleware'),
          L('Аналітика в GA4 + конверсія', 'Analytics in GA4 + conversion'),
          L('Зміна варіантів через Sanity', 'Variant edits via Sanity'),
        ],
      },
      {
        title: L('Email-воронка з сегментацією', 'Email funnel with segmentation'),
        bullets: [
          L('5-step welcome sequence', '5-step welcome sequence'),
          L('Сегментація за UTM, поведінкою, інтересами', 'Segmentation by UTM, behavior, interests'),
          L('Brevo / Mailchimp / GetResponse / SendPulse', 'Brevo / Mailchimp / GetResponse / SendPulse'),
          L('Re-engagement якщо не купив за 30 днів', 'Re-engagement if no purchase in 30 days'),
        ],
      },
      {
        title: L('Аналітика + UTM-трекінг', 'Analytics + UTM tracking'),
        bullets: [
          L('GA4 + Meta Pixel + GTM', 'GA4 + Meta Pixel + GTM'),
          L('UTM-параметри передаються в CRM і Teachable', 'UTM params passed to CRM and Teachable'),
          L('Звіт по варіантах реклами в реальному часі', 'Real-time ad variant report'),
          L('Funnel-аналіз: де клієнт зливається', 'Funnel analysis: where the client drops off'),
        ],
      },
    ],
    integrationsHeading: L(
      'Підключаємо всі course-системи',
      'We connect every course system',
    ),
    integrationsSub: L(
      'Оплата через Stripe / LiqPay → автоматичне створення Teachable-аккаунту → доступ до контенту → запис в email-воронку → лід в CRM. Менеджер отримує сповіщення в Telegram. Жодних втрачених покупок через technical issues.',
      'Payment via Stripe / LiqPay → auto Teachable account creation → access to content → enrolled in email funnel → lead in CRM. Manager gets Telegram alert. Zero purchases lost to technical issues.',
    ),
    integrations: [
      'Teachable',
      'Thinkific',
      'Kajabi',
      'Podia',
      'Stripe',
      'LiqPay',
      'WayForPay',
      'Mailchimp',
      'Brevo',
      'GetResponse',
      'GA4',
      'Meta Pixel',
    ],
    bottomCallouts: [
      L(
        'Cold + Warm трафік · оптимізовано окремо для реклами і email-розсилки',
        'Cold + Warm traffic · optimized separately for ads and email',
      ),
      L(
        '1-step checkout · конверсія в 3-5 разів вища за стандартний Teachable',
        '1-step checkout · conversion 3-5× higher than the default Teachable flow',
      ),
      L(
        'Order Bump · додатковий продукт прямо на чекауті',
        'Order Bump · extra product right at checkout',
      ),
    ],
  },
  comparison: {
    heading: L(
      'Чим кастомний лендинг кращий за шаблон Teachable, Tilda або WP',
      'Why a custom landing beats a Teachable, Tilda, or WP template',
    ),
    columns: {
      param: L('Параметр', 'Parameter'),
      wp: L('Teachable', 'Teachable'),
      wix: L('Tilda', 'Tilda'),
      custom: L('Кодовий', 'Custom'),
    },
    rows: [
      {param: L('Кастомізація лендингу', 'Landing customization'), wp: L('обмежена', 'limited'), wix: L('средня', 'medium'), custom: L('повна', 'full')},
      {param: L('Чекаут', 'Checkout'), wp: L('4 кроки', '4 steps'), wix: L('3 кроки', '3 steps'), custom: L('1 крок', '1 step')},
      {param: L('A/B тестинг', 'A/B testing'), wp: L('базовий', 'basic'), wix: L('через плагіни', 'via plugins'), custom: L('вбудовано Vercel Edge', 'built-in via Vercel Edge')},
      {param: L('Швидкість на mobile', 'Mobile speed'), wp: L('3-5 сек', '3-5 sec'), wix: L('2-4 сек', '2-4 sec'), custom: L('< 1 сек', '< 1 sec')},
      {param: L('UTM-трекінг', 'UTM tracking'), wp: L('базовий', 'basic'), wix: L('через GTM', 'via GTM'), custom: L('повний', 'full')},
      {param: L('Order Bump', 'Order Bump'), wp: L('немає', 'none'), wix: L('через Apps', 'via Apps'), custom: L('вбудовано', 'built-in')},
      {param: L('Місячна оплата', 'Monthly fee'), wp: L('$39-119/міс', '$39-119/mo'), wix: L('$20-200/міс', '$20-200/mo'), custom: L('$0 hosting', '$0 hosting')},
      {param: L('TCO за 3 роки', '3-year TCO'), wp: L('$1,400-4,300', '$1,400-4,300'), wix: L('$720-7,200', '$720-7,200'), custom: L('$4-6k (одноразово)', '$4-6k (once)')},
    ],
    pricingHeading: L('Скільки коштує курс-лендинг', 'Pricing for a course landing'),
    bottomCta: L(
      'Повний прайс і деталі — на /pricing',
      'Full pricing and details — on /en/pricing',
    ),
  },
  faq: {
    heading: FAQ_HEADING,
    items: [
      {
        q: L(
          'Я вже на Teachable з шаблонним лендингом — чи варто переходити?',
          'I’m on Teachable with a template landing — should I switch?',
        ),
        a: {
          uk: 'Залежно від обʼєму реклами. Якщо ви витрачаєте <$500/міс на рекламу — Teachable достатньо. Якщо $2,000+ на місяць на холодний трафік — кастомний лендинг окупиться за 2-3 місяці через падіння CPL у 3-5 разів. Aleko Course кейс: CPL впав з $24 до $4.20, окупність на 5-й день після запуску.',
          en: 'Depends on ad spend. If you spend <$500/mo on ads — Teachable is enough. If $2,000+/mo on cold traffic — a custom landing pays back in 2-3 months via 3-5× CPL drop. Aleko Course case: CPL dropped from $24 to $4.20, ROAS positive on day 5.',
        },
      },
      {
        q: L(
          'Як працює інтеграція з Teachable після оплати?',
          'How does the Teachable integration work after payment?',
        ),
        a: {
          uk: 'Клієнт оплачує через Stripe → webhook викликає Teachable API → автоматично створюється аккаунт з email клієнта → надається доступ до курсу → клієнт отримує лист з паролем (або SSO-лінк). Все за 5-10 секунд. Якщо щось не спрацювало — менеджер отримує Telegram-сповіщення для ручної обробки.',
          en: 'Client pays via Stripe → webhook hits Teachable API → account auto-created with the client’s email → course access granted → client gets an email with the password (or SSO link). All in 5-10 seconds. If something fails — manager gets a Telegram alert for manual handling.',
        },
      },
      {
        q: L(
          'Чи можу я зробити Order Bump (додатковий продукт на чекауті)?',
          'Can I add an Order Bump (extra product at checkout)?',
        ),
        a: {
          uk: 'Так. Класична схема: основний курс + чекбокс "Додати майстер-клас за $30". 25-35% клієнтів галочкою додають. Це збільшує середній чек на 15-20% без додаткової реклами. Можна 1-3 Order Bump\'и на чекауті.',
          en: 'Yes. Classic setup: main course + checkbox "Add a master class for $30." 25-35% of clients tick the box. That lifts average order value by 15-20% with no extra ad spend. Up to 1-3 Order Bumps at checkout.',
        },
      },
      {
        q: L(
          'Як налаштувати email-воронку після покупки?',
          'How is the post-purchase email funnel set up?',
        ),
        a: {
          uk: 'Інтеграція з Brevo / Mailchimp / GetResponse. Після оплати клієнт автоматично потрапляє в welcome sequence: 5-7 листів за тиждень з онбордингом курсу, мотивацією, кейсами. Через 30 днів — upsell на наступний продукт. Re-engagement через 60 днів якщо клієнт не дотиснув курс.',
          en: 'Brevo / Mailchimp / GetResponse integration. After payment the client lands in a welcome sequence: 5-7 emails over a week with course onboarding, motivation, cases. After 30 days — upsell to the next product. Re-engagement after 60 days if the client hasn’t finished the course.',
        },
      },
      {
        q: L(
          'Чи можна A/B тестити різні офери одночасно?',
          'Can we A/B test different offers simultaneously?',
        ),
        a: {
          uk: 'Так. Vercel Edge Middleware дозволяє розподіляти трафік між 2-4 варіантами лендингу. Кожен варіант може мати різний headline, ціну, тариф, кейс-стаді. Аналітика в GA4 показує конверсію per варіант. Маркетолог змінює варіанти через Sanity без розробника.',
          en: 'Yes. Vercel Edge Middleware splits traffic between 2-4 landing variants. Each variant can have a different headline, price, tier, case. GA4 shows conversion per variant. The marketer edits variants via Sanity, no developer.',
        },
      },
      {
        q: L(
          'Чи можу я приймати оплату в рублях / гривнях / євро одночасно?',
          'Can I accept payment in rubles / hryvnia / euros simultaneously?',
        ),
        a: {
          uk: 'Так. Multi-currency через Stripe (USD/EUR/GBP) і LiqPay/WayForPay (UAH). Клієнт обирає валюту або визначається автоматично за geo-location. Інвойси в правильній валюті. Конвертація через банк за курсом дня. Рублі не приймаємо — Stripe заблокував RUB для українських акаунтів.',
          en: 'Yes. Multi-currency via Stripe (USD/EUR/GBP) and LiqPay/WayForPay (UAH). The client picks the currency or gets auto-detected by geo-location. Invoices in the correct currency. Conversion via the bank at the daily rate. We don’t accept RUB — Stripe has blocked RUB for Ukrainian accounts.',
        },
      },
    ],
  },
  audit: {
    heading: L(
      'Безкоштовний аудит вашого курс-лендингу',
      'Free audit of your course landing',
    ),
    sub: L(
      'Залиште посилання на ваш поточний лендинг. Протягом 3 робочих днів — детальний звіт у PDF.',
      'Drop a link to your current landing. Detailed PDF report within 3 business days.',
    ),
    deliverables: [
      L(
        'Аналіз структури лендингу: чи продає холодному трафіку',
        'Landing structure analysis: does it sell to cold traffic',
      ),
      L(
        'Аналіз чекауту: 10-15 точок втрати клієнтів',
        'Checkout analysis: 10-15 client drop-off points',
      ),
      L(
        'SEO-аудит + швидкість завантаження (Core Web Vitals)',
        'SEO audit + load speed (Core Web Vitals)',
      ),
      L(
        'Аналіз інтеграції з Teachable / Thinkific',
        'Teachable / Thinkific integration analysis',
      ),
      L(
        'План покращень з пріоритетами + орієнтовний бюджет',
        'Prioritized improvement plan + budget estimate',
      ),
    ],
    submit: L('Отримати безкоштовний аудит', 'Get my free audit'),
    disclaim: L(
      'Без зобовʼязань. Корисно, навіть якщо вирішите працювати з іншим підрядником.',
      'No obligation. Useful even if you choose a different vendor.',
    ),
  },
}

export const INDUSTRIES: Industry[] = [
  medicine,
  renovation,
  legal,
  finance,
  ecommerce,
  auto,
  realEstate,
  courses,
]
