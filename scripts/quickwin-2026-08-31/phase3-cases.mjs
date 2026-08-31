/**
 * Реальные кейсы со скриншотами в оставшиеся четыре нишевые статьи.
 *
 * Продолжение правки от 31.08: из 17 нишевых статей скриншот был в двух,
 * потом стало семь. Эти четыре — те, где за спиной есть кейс, который
 * действительно ложится на нишу, а не притянут:
 *
 *   sait-dlia-advokata            → Олександр Ситников: бывший судья высокой
 *                                   инстанции и практикующий адвокат. Самый
 *                                   точный кейс во всём портфолио для этой
 *                                   статьи, а лежал в общем перечислении из
 *                                   трёх ссылок одним предложением.
 *   sait-dlia-psykholoha          → он же: сайт личного бренда, где эксперт и
 *                                   есть продукт.
 *   sait-dlia-fotohrafa           → URmodels: галерея, работающая сразу на две
 *                                   аудитории.
 *   sait-dlia-bukhhalterskykh     → Solide Renovation: 13+ направлений услуг
 *                                   отдельными страницами плюс калькулятор
 *                                   предварительной оценки — ровно та
 *                                   механика, которую статья и советует.
 *
 * Все числа — из statsBlock / metricsLine / duration самих кейсов в Sanity.
 * Скриншоты переиспользуют обложки кейсов: поддерживать нечего, а Sanity с
 * auto-format отдаёт их браузерам как WebP.
 *
 * Запуск: node scripts/quickwin-2026-08-31/phase3-cases.mjs [--dry]
 */
import "dotenv/config";
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

let seq = 0;
const key = () => `c3${(seq++).toString(36)}${Date.now().toString(36).slice(-3)}`;

function para(parts) {
  const markDefs = [];
  const children = parts.map((p) => {
    if (typeof p === "string") return { _key: key(), _type: "span", marks: [], text: p };
    const [text, href] = p;
    const mk = key();
    markDefs.push({ _key: mk, _type: "link", href, newTab: false });
    return { _key: key(), _type: "span", marks: [mk], text };
  });
  return { _key: key(), _type: "block", style: "normal", children, markDefs };
}

const img = (ref, alt, caption) => ({
  _key: key(),
  _type: "blogImage",
  alt,
  asset: { _ref: ref, _type: "reference" },
  caption,
});

const COVER = {
  sitnikov: "image-1ea24e7640c87dee715c19883b94e4cf5e2f7918-3162x2372-png",
  urmodels: "image-3e6f21ce3e508c1ec9f88a3e8b6b5ae0a9efb56a-3000x2250-png",
  solide: "image-4bea0bc1595e0432ad7388c1583207de933d87ff-3000x2250-png",
};

/** `after` — начало блока, ПОСЛЕ которого вставляем. */
const EDITS = [
  {
    slug: "sait-dlia-advokata",
    after: "Принципи довірчого дизайну однакові для всіх експертних ніш",
    blocks: () => [
      para([
        "Найближчий до вашої ситуації — сайт Олександра Ситникова. Він колишній суддя " +
          "високої інстанції, практикуючий адвокат і викладач, який веде навчальні програми " +
          "для юристів та адвокатів. За 8 тижнів ми зібрали структуру, де регалії працюють " +
          "доказом, а не декором: дві мовні версії, п'ять розділів і три окремі напрями — " +
          "курси, послуги, публікації. Плюс адмін-панель, у якій він сам додає публікації, " +
          "не звертаючись до розробника. Повний розбір — ",
        ["у кейсі Олександра Ситникова", "/portfolio/oleksandr-sitnikov"],
        ".",
      ]),
      img(
        COVER.sitnikov,
        "Сайт адвоката Олександра Ситникова — головна сторінка з напрямами та публікаціями",
        "Регалії, курси і послуги розведені в окремі напрями, а не звалені в один розділ",
      ),
    ],
  },
  {
    slug: "sait-dlia-psykholoha",
    after: "Ми робили сайти особистих брендів, де це відчуття — головний продукт",
    blocks: () => [
      para([
        "Конкретика по тому сайту: 8 тижнів, дві мовні версії, адмін-панель, у якій власник " +
          "сам публікує матеріали, і три напрями замість одного списку послуг. Психологу ця " +
          "структура лягає майже один в один — терапія, супервізія, навчання живуть окремо, " +
          "бо їх шукають різними запитами і читають різні люди.",
      ]),
      img(
        COVER.sitnikov,
        "Сайт особистого бренду експерта — структура з напрямами, публікаціями і формою звернення",
        "Сайт особистого бренду: експертиза, напрями і публікації розведені, а не в одну сторінку",
      ),
    ],
  },
  {
    slug: "sait-dlia-fotohrafa",
    after: "Кожен із цих проєктів починався з того самого питання",
    blocks: () => [
      para([
        "Найближчий до фотографа — ",
        ["кейс URmodels", "/portfolio/urmodels"],
        ". Це boutique-агенція, чий сайт мусить продавати одразу двом аудиторіям: моделям, " +
          "які подають заявку, і клієнтам, які шукають типаж. За 6 тижнів ми розвели два " +
          "напрями — You Are Model і Your Models — і зробили онлайн-заявку для талантів. " +
          "У фотографа задача та сама: одна галерея працює на замовника зйомки, інша — на " +
          "тих, хто хоче зніматися, і змішувати їх в одну стрічку не можна.",
      ]),
      img(
        COVER.urmodels,
        "Сайт модельної агенції URmodels — галерея моделей і форма заявки для талантів",
        "URmodels: одна галерея, дві аудиторії — моделі подають заявку, клієнти шукають типаж",
      ),
    ],
  },
  {
    slug: "sait-dlia-bukhhalterskykh-posluh",
    after: "Solide Renovation — сервісний бізнес із пакетними пропозиціями",
    blocks: () => [
      para([
        "Розписуючи цей приклад: у ",
        ["Solide Renovation", "/portfolio/solide-renovation"],
        " тринадцять із лишком напрямів послуг розведені в окремі сторінки, є калькулятор " +
          "попередньої оцінки і SEO-структура під локальний пошук, а сайт працює трьома " +
          "мовами. Для аутсорсингу обліку це один в один той самий набір: послуга на " +
          "сторінку, прикидка вартості до дзвінка і пошук за «бухгалтер + місто».",
      ]),
      img(
        COVER.solide,
        "Сайт ремонтної компанії Solide Renovation — напрями послуг і калькулятор оцінки",
        "Solide Renovation: 13+ напрямів послуг окремими сторінками і калькулятор оцінки",
      ),
    ],
  },
];

async function run() {
  for (const e of EDITS) {
    const doc = await client.fetch(
      '*[_type == "blogPost" && slugs.uk.current == $s][0]{_id, "body": body.uk}',
      { s: e.slug },
    );
    if (!doc) {
      console.error(`  ✗ ${e.slug}: не найден`);
      continue;
    }
    const body = [...(doc.body || [])];

    if (body.some((b) => b._type === "blogImage")) {
      console.log(`  ${e.slug}: скриншот уже есть — пропускаю`);
      continue;
    }

    const at = body.findIndex(
      (b) =>
        b._type === "block" &&
        (b.children || []).map((c) => c.text).join("").startsWith(e.after),
    );
    if (at < 0) {
      console.error(`  ✗ ${e.slug}: якорь «${e.after.slice(0, 42)}…» не найден`);
      continue;
    }

    const add = e.blocks();
    body.splice(at + 1, 0, ...add);
    console.log(
      `  ${e.slug}: после блока ${at}, +${add.length} (1 скриншот), тело ${doc.body.length} → ${body.length}`,
    );

    if (DRY) continue;
    await client.patch(doc._id).set({ "body.uk": body }).commit();
    console.log("    ✓ записано");
  }
}

console.log(DRY ? "СУХОЙ ПРОГОН\n" : "ЗАПИСЬ В SANITY\n");
run().then(
  () => console.log("\nготово"),
  (err) => {
    console.error("ОШИБКА", err.message);
    process.exit(1);
  },
);
