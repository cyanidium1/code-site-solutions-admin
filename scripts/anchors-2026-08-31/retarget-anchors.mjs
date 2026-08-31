/**
 * Перенос анкоров внутренних ссылок на формулировки, которые реально
 * спрашивают в поиске.
 *
 * GSC за 3 месяца показал, что на /pricing ведут 20 внутренних ссылок из
 * блога, и двенадцать из них имеют анкор «цін» или «сторінці цін». Это
 * выброшенная релевантность: ни одна ссылка не использует формулировки, на
 * которых сайт получает показы, — «створити сайт ціна» (156 показов),
 * «зробити сайт ціна» (134), «вартість створення сайту» (64), «скільки
 * коштує зробити сайт» (36). Украинский /pricing при этом за три месяца
 * получил НОЛЬ показов, а весь ценовой кластер Google отдал /calculator,
 * куда идёт 146 внутренних ссылок против 22.
 *
 * Та же история у медицины: донор `rozrobka-saitu-medychnoho-tsentru-pid-kliuch`
 * стоит на позиции 11,3 и отдаёт вес анкором «сторінці медицини», а
 * `prosuvannia-saitu-tsina-2026` стоит 16,5 и отдаёт «рішень для медицини».
 * Целевой запрос «створення сайту для клініки» — 58 показов на позиции 16,8.
 *
 * Принцип правки: не добавлять ссылки, а переносить анкор на слова, которые
 * в предложении уже есть или появляются от минимальной перефразировки. Две
 * правки из семи вообще не меняют текст — только границу ссылки. Это не
 * keyword stuffing: в каждом предложении анкор один, формулировки разные,
 * и ни одно предложение не переписано ради ключа.
 *
 * Запуск: node scripts/anchors-2026-08-31/retarget-anchors.mjs [--dry]
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
const key = () => `an${(seq++).toString(36)}${Date.now().toString(36).slice(-3)}`;

/**
 * Каждая правка: в каком документе, какой блок, каким должен стать текст
 * (null — оставить как есть) и какая подстрока несёт какую ссылку.
 * Блок ищется по началу текущего текста, а не по индексу, — индексы
 * сдвигаются при любой правке тела.
 */
const EDITS = [
  {
    slug: "rozrobka-saitu-medychnoho-tsentru-pid-kliuch",
    find: "Базовий сайт клініки — від $3,500 за 4 тижні",
    text:
      "Базовий сайт клініки — від $3,500 за 4 тижні: до 8 сторінок, онлайн-запис, " +
      "каталог лікарів, прайс. Розширений із блогом і медичною CRM — від $6,500. " +
      "Мережа клінік — від $12,000. Повний кошторис постатейно ми розібрали в " +
      "окремій статті про ціни, а все про створення сайту клініки — на окремій сторінці.",
    anchors: {
      "/blog/skilky-koshtuye-sait-dlia-kliniky-2026": "окремій статті про ціни",
      "/sites-for/medicine": "створення сайту клініки",
    },
  },
  {
    slug: "prosuvannia-saitu-tsina-2026",
    find: "Для клінік просування має свою специфіку",
    text:
      "Для клінік просування має свою специфіку: локальний пошук «стоматолог + район», " +
      "Schema.org MedicalOrganization, сторінки під кожну послугу і юридично коректний " +
      "контент. Тому медицина і коштує дорожче за базову кампанію. Як ми будуємо сайти " +
      "для клінік — на сторінці про створення сайту для клініки.",
    anchors: { "/sites-for/medicine": "створення сайту для клініки" },
  },
  {
    slug: "rozrobka-saitu-kyiv",
    find: "У нас ціна не залежить від міста",
    text:
      "У нас ціна не залежить від міста: лендінг — від $800, багатосторінковий сайт — " +
      "від $2 500, складна розробка з інтеграціями — від $6 000. Розбивка по роботах " +
      "показує, скільки коштує зробити сайт у кожному форматі, а приблизна вилка під " +
      "ваш обсяг — у калькуляторі.",
    anchors: {
      "/pricing": "скільки коштує зробити сайт",
      "/calculator": "калькуляторі",
    },
  },
  {
    slug: "rozrobka-saitu-lviv",
    find: "Наш прайс від міста не залежить",
    text:
      "Наш прайс від міста не залежить — ми не беремо надбавку за столицю і не робимо " +
      "знижку за область. Лендінг — від $800, багатосторінковий сайт — від $2 500, " +
      "складна розробка з інтеграціями — від $6 000. Що саме входить у ці цифри, " +
      "показує ціна створення сайту по кожному пакету, а прикинути свою конфігурацію " +
      "можна в калькуляторі.",
    anchors: {
      "/pricing": "ціна створення сайту",
      "/calculator": "калькуляторі",
    },
  },
  {
    slug: "rozrobka-saitu-vinnytsia",
    find: "У нас прайс не залежить від міста",
    text:
      "У нас прайс не залежить від міста: лендінг — від $800, багатосторінковий сайт — " +
      "від $2 500, складна розробка з інтеграціями — від $6 000. Що входить у кожен " +
      "тариф, показує вартість створення сайту по пакетах, прикинути свою конфігурацію " +
      "можна в калькуляторі, а розбір того, з чого взагалі складається сума, — " +
      "в окремій статті.",
    anchors: {
      "/pricing": "вартість створення сайту",
      "/calculator": "калькуляторі",
      "/blog/vartist-rozrobky-saytu-2026": "в окремій статті",
    },
  },
  {
    // текст не меняется — только граница ссылки
    slug: "shcho-take-hosting",
    find: "Якщо адмініструвати самому не хочеться",
    text: null,
    anchors: {
      "/support": "підтримкою",
      "/pricing": "скільки коштують пакети",
    },
  },
  {
    // текст не меняется — анкор «Code-Site.Art» не передаёт ничего
    slug: "sait-dlia-ahentsii-nerukhomosti",
    find: "Перше рішення — не дизайн і не CMS, а формат",
    text: null,
    anchors: { "/sites-for/real-estate": "проєкти нерухомості" },
  },
];

/** Пересобирает children/markDefs так, чтобы каждая ссылка легла на свою подстроку. */
function relink(block, newText, anchors) {
  const text = newText ?? (block.children || []).map((c) => c.text).join("");

  const spans = [];
  for (const [href, anchor] of Object.entries(anchors)) {
    const at = text.indexOf(anchor);
    if (at < 0) throw new Error(`анкор «${anchor}» не найден для ${href}`);
    if (text.indexOf(anchor, at + 1) >= 0) {
      throw new Error(`анкор «${anchor}» встречается дважды — неоднозначно`);
    }
    spans.push({ at, end: at + anchor.length, href, anchor });
  }
  spans.sort((a, b) => a.at - b.at);
  for (let i = 1; i < spans.length; i++) {
    if (spans[i].at < spans[i - 1].end) throw new Error("анкоры перекрываются");
  }

  const children = [];
  const markDefs = [];
  let cursor = 0;
  const push = (t, marks) => {
    if (t) children.push({ _key: key(), _type: "span", marks, text: t });
  };

  for (const s of spans) {
    push(text.slice(cursor, s.at), []);
    const mk = key();
    markDefs.push({ _key: mk, _type: "link", href: s.href, newTab: false });
    push(s.anchor, [mk]);
    cursor = s.end;
  }
  push(text.slice(cursor), []);

  return { ...block, children, markDefs };
}

async function run() {
  for (const edit of EDITS) {
    const doc = await client.fetch(
      '*[_type == "blogPost" && slugs.uk.current == $s][0]{_id, "body": body.uk}',
      { s: edit.slug },
    );
    if (!doc) {
      console.error(`  ✗ ${edit.slug}: документ не найден`);
      continue;
    }
    const body = doc.body || [];
    const at = body.findIndex(
      (b) =>
        b._type === "block" &&
        (b.children || []).map((c) => c.text).join("").startsWith(edit.find),
    );
    if (at < 0) {
      console.error(`  ✗ ${edit.slug}: блок «${edit.find.slice(0, 40)}…» не найден`);
      continue;
    }

    const block = body[at];
    // не трогаем блоки, где есть форматирование помимо ссылок — пересборка его потеряет
    const linkKeys = new Set((block.markDefs || []).map((m) => m._key));
    const foreign = (block.children || []).some((c) =>
      (c.marks || []).some((m) => !linkKeys.has(m)),
    );
    if (foreign) {
      console.error(`  ✗ ${edit.slug}: в блоке есть strong/em — пропускаю`);
      continue;
    }

    const before = (block.markDefs || [])
      .map((m) => {
        const a = (block.children || [])
          .filter((c) => (c.marks || []).includes(m._key))
          .map((c) => c.text)
          .join("");
        return `${m.href} «${a}»`;
      })
      .join("; ");

    const next = [...body];
    next[at] = relink(block, edit.text, edit.anchors);

    const after = Object.entries(edit.anchors)
      .map(([h, a]) => `${h} «${a}»`)
      .join("; ");
    console.log(`  ${edit.slug} [блок ${at}]${edit.text ? "" : "  (текст не менялся)"}`);
    console.log(`    было:  ${before}`);
    console.log(`    стало: ${after}`);

    if (DRY) continue;
    await client.patch(doc._id).set({ "body.uk": next }).commit();
    console.log(`    ✓ записано`);
  }
}

console.log(DRY ? "СУХОЙ ПРОГОН\n" : "ЗАПИСЬ В SANITY\n");
run().then(
  () => console.log("\nготово"),
  (e) => {
    console.error("ОШИБКА", e.message);
    process.exit(1);
  },
);
