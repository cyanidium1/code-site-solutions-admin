import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

import {createClient} from '@sanity/client'

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename)
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

type LocaleString = {uk?: string; en?: string}
type CaseInput = {
  id: string
  slug: string
  title: string
  client: string
  heading: string
  subheading: string
  metrics: Array<{value: string; label: string}>
  challengeBody: string
  challengeBullets: string[]
  solutionBody: string
  solutionBullets: string[]
  cmsHeading: string
  cmsBody: string
  cmsBullets: string[]
  outcomeBody: string
}

function uk(text: string): LocaleString {
  return {uk: text}
}

let keyCounter = 0
function k(prefix = 'k'): string {
  keyCounter += 1
  return `${prefix}${keyCounter.toString(36)}`
}

type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type PortableBlock = {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: never[]
  children: Span[]
}

function richPara(text: string): PortableBlock[] {
  return [
    {
      _type: 'block',
      _key: k('b'),
      style: 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: k('s'), text, marks: []}],
    },
  ]
}

function makeCaseDoc(input: CaseInput, order: number) {
  return {
    _id: input.id,
    _type: 'caseStudy',
    status: 'draft',
    order,
    featured: false,
    slug: {_type: 'slug', current: input.slug},
    title: uk(input.title),
    client: input.client,
    region: uk('Україна'),
    year: 2026,
    duration: uk('6 тижнів'),
    stack: ['Next.js', 'Sanity'],
    metricsLine: uk(input.metrics.map((m) => `${m.value} ${m.label}`).join(' · ')),
    seo: {
      title: uk(`${input.title} — кейс | Code-Site.Art`),
      description: uk(input.subheading),
    },
    hero: {
      eyebrow: uk('/ CASE STUDY'),
      heading: uk(input.heading),
      subheading: uk(input.subheading),
      metrics: input.metrics.map((m, i) => ({
        _key: `hm${i + 1}`,
        value: m.value,
        label: uk(m.label),
      })),
    },
    sections: [
      {
        _type: 'imageTextBlock',
        _key: 'sec6',
        variant: 'side-with-list',
        imageVariant: 'imageRight',
        bulletIcon: 'cross',
        eyebrow: uk('/ CHALLENGE'),
        heading: uk('Що *було*'),
        body: richPara(input.challengeBody),
        bulletList: input.challengeBullets.map((b) => uk(b)),
      },
      {
        _type: 'imageTextBlock',
        _key: 'sec9',
        variant: 'side-with-list',
        imageVariant: 'imageLeft',
        bulletIcon: 'check',
        eyebrow: uk('/ SOLUTION'),
        heading: uk('Що ми *зробили*'),
        body: richPara(input.solutionBody),
        bulletList: input.solutionBullets.map((b) => uk(b)),
      },
      {
        _type: 'imageTextBlock',
        _key: 'fd187ec9f59b',
        variant: 'side-with-list',
        imageVariant: 'imageRight',
        bulletIcon: 'check',
        eyebrow: uk('/ CMS'),
        heading: uk(input.cmsHeading),
        body: richPara(input.cmsBody),
        bulletList: input.cmsBullets.map((b) => uk(b)),
      },
      {
        _type: 'imageTextBlock',
        _key: 'sech',
        variant: 'centered',
        centeredLayout: 'horizontal',
        eyebrow: uk('/ OUTCOME'),
        heading: uk('Результат'),
        body: richPara(input.outcomeBody),
      },
    ],
  }
}

const CASES: CaseInput[] = [
  {
    id: 'caseStudy.webbond',
    slug: 'webbond',
    title: 'WebBond',
    client: 'WebBond',
    heading: 'WebBond — сайт для digital-агенції, яка створює *сайти для залучення клієнтів*',
    subheading:
      'WebBond — digital-агенція, яка допомагає бізнесу розвивати онлайн-присутність через сайти, SEO, рекламу та брендинг.',
    metrics: [
      {value: '4', label: 'напрями послуг'},
      {value: '1', label: 'корпоративний сайт'},
      {value: '5+', label: 'ключових розділів'},
      {value: '1', label: 'структура генерації заявок'},
    ],
    challengeBody:
      'Для digital-агенції недостатньо просто показати перелік послуг. Потенційний клієнт хоче зрозуміти підхід до роботи, оцінити експертність команди та побачити, як саме агенція допомагає бізнесу отримувати клієнтів через digital-канали.',
    challengeBullets: [
      'Підкреслити експертність і підхід до роботи',
      'Структурувати кілька напрямів послуг в єдину систему',
      'Показати бізнес-цінність послуг зрозумілою мовою',
      'Побудувати логічний шлях від знайомства до заявки',
    ],
    solutionBody:
      'Розробили корпоративний сайт для digital-агенції з фокусом на експертність, послуги та генерацію заявок.',
    solutionBullets: [
      'Головна сторінка як презентація послуг і підходу',
      'Структуровані напрями: сайти, SEO, реклама, брендинг',
      'Кілька CTA для консультації та співпраці',
      'Адаптивна версія і CMS для оновлення контенту',
    ],
    cmsHeading: 'Адмін-панель для керування *послугами та контентом*',
    cmsBody:
      'Команда WebBond може самостійно оновлювати сторінки послуг, структуру контенту та інформацію про компанію без розробника.',
    cmsBullets: ['Редагування послуг і сервісних блоків', 'Оновлення текстів і CTA', 'Керування ключовими розділами сайту'],
    outcomeBody:
      'WebBond отримала digital-інструмент для залучення нових клієнтів: користувач швидко розуміє спеціалізацію агенції, ознайомлюється з послугами та переходить до консультації.',
  },
  {
    id: 'caseStudy.urmodels',
    slug: 'urmodels',
    title: 'URmodels',
    client: 'URmodels',
    heading: 'URmodels — платформа для модельного *скаутингу та презентації талантів*',
    subheading:
      "URmodels — boutique model agency, яка розвиває нові таланти і презентує моделей для міжнародного fashion-ринку.",
    metrics: [
      {value: '2', label: 'аудиторії: моделі та клієнти'},
      {value: '1', label: 'онлайн-заявка для талантів'},
      {value: '2', label: 'напрями: You Are Model + Your Models'},
      {value: '1', label: 'структура росту модельної бази'},
    ],
    challengeBody:
      'Для модельної агенції недостатньо просто показати портфоліо. Потрібно одночасно залучати нові обличчя та презентувати моделей брендам і партнерам.',
    challengeBullets: [
      'Побудувати сценарій для нових кандидатів',
      'Розділити навігацію для двох аудиторій',
      'Запустити зручний процес первинного відбору',
      'Показати модельну базу клієнтам агенції',
    ],
    solutionBody:
      'Створили платформу, де сайт працює і як канал скаутингу, і як презентація моделей для брендів.',
    solutionBullets: [
      'Окремі напрями You Are Model та Your Models',
      'Онлайн-форма подачі заявки новими талантами',
      'Навігація для моделей і клієнтів агенції',
      'CMS для оновлення інформації про діяльність',
    ],
    cmsHeading: 'Адмін-панель для керування *моделями та заявками*',
    cmsBody:
      'Команда URmodels отримала можливість оновлювати дані платформи, контент сторінок і керувати інформацією для обох аудиторій.',
    cmsBullets: ['Оновлення контенту і профілів', 'Керування формами та заявками', 'Редагування структури розділів'],
    outcomeBody:
      'URmodels отримала платформу, що обʼєднує скаутинг нових талантів, презентацію модельної бази й комунікацію з партнерами в єдиній системі.',
  },
  {
    id: 'caseStudy.tatarka-franchise',
    slug: 'tatarka-franchise',
    title: 'Tatarka Franchise',
    client: 'Tatarka Franchise',
    heading: 'Tatarka Franchise — сайт для *продажу франшизи* ресторанного бренду',
    subheading:
      'Сайт для залучення нових франчайзі та розвитку ресторанної мережі через партнерську модель.',
    metrics: [
      {value: '1', label: 'продаюча структура франшизи'},
      {value: '5+', label: 'ключових блоків'},
      {value: '1', label: 'форма для партнерських заявок'},
      {value: '1', label: 'сайт масштабування мережі'},
    ],
    challengeBody:
      'Потенційний франчайзі хоче швидко зрозуміти модель бізнесу, переваги співпраці, умови запуску та підтримку після старту.',
    challengeBullets: [
      'Пояснити франшизу простою бізнес-мовою',
      'Структурувати умови запуску і підтримки',
      'Побудувати шлях від інтересу до заявки',
      'Презентувати франшизу, а не просто ресторан',
    ],
    solutionBody:
      'Розробили landing page з фокусом на бізнес-модель, вигоди партнерства і генерацію заявок.',
    solutionBullets: [
      'Презентація концепції франшизи та її переваг',
      'Блоки довіри для підсилення рішення',
      'Кілька CTA для консультації',
      'CMS для оновлення інформації про франшизу',
    ],
    cmsHeading: 'Адмін-панель для оновлення *франшизної пропозиції*',
    cmsBody:
      'Контент про умови співпраці, блоки довіри та заявки можна оновлювати самостійно без втрати структури сторінки.',
    cmsBullets: ['Редагування умов і переваг', 'Оновлення текстів та CTA', 'Керування заявками партнерів'],
    outcomeBody:
      'Tatarka Franchise отримала інструмент залучення франчайзі: сайт підсилює довіру до бренду й переводить зацікавлених партнерів у заявки на співпрацю.',
  },
  {
    id: 'caseStudy.glenn-garbo',
    slug: 'glenn-garbo',
    title: 'Glenn Garbo',
    client: 'Glenn Garbo',
    heading: 'Glenn Garbo — сайт музичного проєкту та *продажу авторської продукції*',
    subheading:
      'Платформа персонального бренду, що обʼєднує музику, новини та магазин для прямого продажу продукції.',
    metrics: [
      {value: '1', label: 'e-commerce модуль'},
      {value: '1', label: 'CMS для контенту'},
      {value: '3+', label: 'напрями: музика, блог, магазин'},
      {value: '1', label: 'інтеграція онлайн-оплати'},
    ],
    challengeBody:
      'Для творчого проєкту важливо обʼєднати контент і продажі в одній системі, щоб користувач переходив від знайомства з брендом до покупки без тертя.',
    challengeBullets: [
      'Поєднати персональний бренд і магазин',
      'Зібрати творчий контент в одному місці',
      'Реалізувати простий процес оплати',
      'Підтримати регулярні публікації через CMS',
    ],
    solutionBody:
      'Зробили односторінковий сайт із інтегрованим магазином, новинами та зручною навігацією між контентом і покупкою.',
    solutionBullets: [
      'Сучасний one-page під персональний бренд',
      'Окремий магазин і онлайн-оплата',
      'Розділ новин і публікацій',
      'CMS для керування контентом і товарами',
    ],
    cmsHeading: 'Адмін-панель для керування *контентом і товарами*',
    cmsBody: 'Автор може самостійно оновлювати матеріали, асортимент і комунікацію з аудиторією в одному інтерфейсі.',
    cmsBullets: ['Додавання новин і матеріалів', 'Оновлення товарів та цін', 'Керування ключовими CTA магазину'],
    outcomeBody:
      'Glenn Garbo отримав єдину платформу для розвитку бренду й продажів: сайт обʼєднує контент, комунікацію та e-commerce без залежності від сторонніх сервісів.',
  },
  {
    id: 'caseStudy.e-fedra-beauty',
    slug: 'e-fedra-beauty',
    title: 'E-Fedra Beauty',
    client: 'E-Fedra Beauty',
    heading: 'E-Fedra Beauty — сайт для клініки *естетичної медицини та косметології*',
    subheading:
      'Сайт, що допомагає клієнту знайти процедуру, переглянути прайс, отримати відповіді і швидко записатися на консультацію.',
    metrics: [
      {value: '3', label: 'напрями: косметологія, естетика, догляд'},
      {value: '1', label: 'структурований прайс-лист'},
      {value: '5+', label: 'ключових розділів'},
      {value: '1', label: 'SEO-блог'},
    ],
    challengeBody:
      'Для клініки краси важливо не лише показати перелік процедур, а допомогти клієнту прийняти рішення до запису через довіру і зрозумілу структуру.',
    challengeBullets: [
      'Структурувати великий перелік послуг і цін',
      'Побудувати шлях від процедури до запису',
      'Підсилити експертність бренду',
      'Запустити блог для SEO і освітнього контенту',
    ],
    solutionBody:
      'Розробили сайт з окремими сторінками процедур, прайсом, блогом і кількома точками входу до консультації.',
    solutionBullets: [
      'Головна сторінка як структура довіри',
      'Категорії послуг і детальні описи процедур',
      'Окремий прайс-лист',
      'Блог для контенту та органічного трафіку',
    ],
    cmsHeading: 'Адмін-панель для оновлення *послуг, цін і блогу*',
    cmsBody:
      'Команда E-Fedra Beauty отримала систему для самостійного оновлення процедур, вартості послуг і статей без технічної підтримки.',
    cmsBullets: ['Оновлення послуг і прайсу', 'Публікація SEO-матеріалів', 'Керування формами запису'],
    outcomeBody:
      'E-Fedra Beauty отримала digital-інструмент залучення клієнтів: сайт підсилює довіру, структурує послуги та спрощує запис на процедури.',
  },
  {
    id: 'caseStudy.co2lab',
    slug: 'co2lab',
    title: 'CO2LAB',
    client: 'CO2LAB',
    heading: 'CO2LAB — сайт для компанії з *промислових CO₂-рішень*',
    subheading:
      'Корпоративний B2B-сайт, що пояснює складні інженерні процеси простою мовою і веде потенційних партнерів до консультації.',
    metrics: [
      {value: '4', label: 'напрями діяльності'},
      {value: '1', label: 'B2B корпоративний сайт'},
      {value: '5+', label: 'ключових сторінок'},
      {value: '1', label: 'структура залучення партнерів'},
    ],
    challengeBody:
      'Інженерні CO₂-рішення складно продавати через типову презентацію. Клієнту потрібні зрозумілі сценарії застосування, експертність і бізнес-цінність.',
    challengeBullets: [
      'Пояснити складні рішення просто',
      'Структурувати напрями в одну систему',
      'Показати сфери застосування технологій',
      'Підсилити довіру B2B-аудиторії',
    ],
    solutionBody:
      'Побудували корпоративний сайт з чіткою подачею рішень, обладнання та виробничих можливостей компанії.',
    solutionBullets: [
      'Презентація ключових напрямів діяльності',
      'Окремі сторінки для обладнання і систем',
      'Розділи для галузевих сценаріїв застосування',
      'Контактні форми для консультацій і запитів',
    ],
    cmsHeading: 'Адмін-панель для керування *B2B-контентом*',
    cmsBody:
      'Команда CO2LAB може самостійно оновлювати сервісні матеріали, сторінки рішень та інформацію для партнерів.',
    cmsBullets: ['Оновлення технічних сторінок', 'Редагування описів рішень', 'Керування заявками на консультацію'],
    outcomeBody:
      'CO2LAB отримала платформу для презентації технологій і залучення партнерів: сайт перетворює складні інженерні процеси на зрозумілу комерційну пропозицію.',
  },
  {
    id: 'caseStudy.clarion-solutions',
    slug: 'clarion-solutions',
    title: 'Clarion Solutions',
    client: 'Clarion Solutions',
    heading: 'Clarion Solutions — сайт агенції *AI-автоматизації та Local SEO*',
    subheading:
      'Сайт пояснює складні AI-рішення зрозумілою мовою, демонструє автоматизацію через демо-блок і веде бізнес до консультації.',
    metrics: [
      {value: '4', label: 'пакети послуг'},
      {value: '1', label: 'інтерактивна AI-демонстрація'},
      {value: '5+', label: 'напрямів: SEO, AI, CRM, web, media'},
      {value: '1', label: 'структура генерації заявок'},
    ],
    challengeBody:
      'Для AI-агенції замало переліку послуг: клієнту потрібні прикладні сценарії, зрозуміла вигода і чіткий шлях до впровадження.',
    challengeBullets: [
      'Пояснити AI-автоматизацію і Local SEO просто',
      'Показати реальні бізнес-сценарії',
      'Структурувати сервіси в єдину систему',
      'Побудувати шлях до аудиту та консультації',
    ],
    solutionBody:
      'Розробили корпоративний сайт з фокусом на сервіси, AI-демо, пакети співпраці та генерацію звернень від бізнесу.',
    solutionBullets: [
      'Структуровані сервіси: SEO, AI, CRM, web, media',
      'Інтерактивний демо-блок автоматизації',
      'Презентація пакетів і процесу роботи',
      'Блог про SEO, AI і локальний бізнес',
    ],
    cmsHeading: 'Адмін-панель для оновлення *сервісів і демо-контенту*',
    cmsBody:
      'Команда Clarion Solutions може керувати сервісними сторінками, контентом блогу та комерційними блоками без розробника.',
    cmsBullets: ['Оновлення пакетів послуг', 'Публікація матеріалів блогу', 'Керування CTA та лід-формами'],
    outcomeBody:
      'Clarion Solutions отримала інструмент залучення клієнтів для AI та SEO-послуг: сайт підсилює експертність і переводить відвідувача від інтересу до звернення.',
  },
  {
    id: 'caseStudy.boulevard-salon',
    slug: 'boulevard-salon',
    title: 'Boulevard Salon',
    client: 'Boulevard Salon',
    heading: 'Boulevard Salon — сайт салону краси з *онлайн-записом* на процедури',
    subheading:
      'Сайт допомагає швидко обрати напрям послуг і перейти до бронювання процедури через зрозумілу структуру.',
    metrics: [
      {value: '10+', label: 'категорій beauty-послуг'},
      {value: '1', label: 'онлайн-запис на процедури'},
      {value: '5+', label: 'ключових розділів'},
      {value: '1', label: 'структура залучення клієнтів'},
    ],
    challengeBody:
      'Для салону краси важливо структурувати великий перелік процедур так, щоб користувач легко знаходив потрібну послугу і бронював без зайвих кроків.',
    challengeBullets: [
      'Структурувати beauty-послуги по категоріях',
      'Побудувати зручну навігацію і запис',
      'Підсилити довіру через сучасну подачу',
      'Скоротити шлях від інтересу до бронювання',
    ],
    solutionBody:
      'Створили сайт з акцентом на категорії послуг, інтеграцію бронювання та швидкий перехід до онлайн-запису.',
    solutionBullets: [
      'Головна сторінка як презентація напрямів послуг',
      'Інтеграція системи бронювання процедур',
      'Кілька CTA до швидкого запису',
      'CMS для оновлення послуг і контенту салону',
    ],
    cmsHeading: 'Адмін-панель для керування *послугами салону*',
    cmsBody: 'Команда салону може самостійно оновлювати послуги, тексти й ключові блоки для онлайн-запису.',
    cmsBullets: ['Оновлення категорій і описів процедур', 'Керування контентом розділів', 'Підтримка актуальних CTA запису'],
    outcomeBody:
      'Boulevard Salon отримав digital-інструмент для залучення клієнтів: сайт перетворює великий перелік послуг на зрозумілу систему й веде відвідувача до бронювання.',
  },
  {
    id: 'caseStudy.aleko-course',
    slug: 'aleko-course',
    title: 'Aleko Course',
    client: 'Aleko Course',
    heading: 'Aleko Course — сайт для продажу онлайн-курсу зі *створення вірусного контенту*',
    subheading:
      'Продаючий landing page, який презентує курс через бренд автора, програму навчання, відгуки та тарифи.',
    metrics: [
      {value: '12', label: 'навчальних модулів'},
      {value: '48', label: 'відеоуроків у розширеному тарифі'},
      {value: '3', label: 'тарифні пакети'},
      {value: '1', label: 'продаюча структура онлайн-продукту'},
    ],
    challengeBody:
      'Для освітнього продукту потрібно показати не лише програму, а й цінність, довіру до автора і чітку причину купити зараз.',
    challengeBullets: [
      'Продати курс через бренд автора і результати',
      'Структуровано показати програму без перевантаження',
      'Підсилити соціальний доказ через відгуки',
      'Реалізувати кілька тарифів з різним наповненням',
    ],
    solutionBody:
      'Розробили landing page, який веде користувача від знайомства з автором до вибору тарифу і покупки.',
    solutionBullets: [
      'Перший екран з головною цінністю і CTA',
      'Структура курсу з 12 модулями',
      'Блок результатів автора і відгуки',
      'Тарифні пакети з чітким порівнянням',
    ],
    cmsHeading: 'Адмін-панель для оновлення *програми і тарифів*',
    cmsBody:
      'Команда курсу може самостійно оновлювати модулі, умови тарифів і промо-блоки без зміни логіки продажної сторінки.',
    cmsBullets: ['Оновлення програми навчання', 'Керування тарифами і оферами', 'Редагування відгуків і CTA'],
    outcomeBody:
      'Aleko Course отримав повноцінний інструмент продажу освітнього продукту: сайт конвертує інтерес аудиторії у покупки та нових учасників курсу.',
  },
]

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId) {
    console.error('✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
    process.exit(1)
  }
  if (!token) {
    console.error('✗ Missing SANITY_API_TOKEN')
    process.exit(1)
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })

  console.log(`→ Seeding ${CASES.length} PDF-based case studies as drafts`)
  for (const [index, item] of CASES.entries()) {
    const doc = makeCaseDoc(item, 20 + index)
    const res = await client.createOrReplace(doc)
    console.log(`  ✓ ${res._id} (${item.slug})`)
  }
  console.log('✓ Done. All cases created as draft.')
}

main().catch((err) => {
  console.error('✗ Seed failed:', err)
  process.exit(1)
})
