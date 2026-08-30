/**
 * CTA в статьях блога начинает вести на форму, а не только на калькулятор.
 *
 * Было: 214 блоков `ctaCallout` в 56 постах, из них 135 вели на /calculator и
 * 43 на /contacts — то есть читателя, дочитавшего статью, уводили со страницы
 * и просили заполнить ещё что-то. Форма в блоге не появлялась ни разу.
 *
 * Стало: у блока включается `ctaMode: "modal"` — рендерер тогда показывает
 * LeadCtaButton, и форма открывается прямо поверх статьи. Механика в коде
 * уже была, ею просто никто не пользовался: `ctaMode` стоял только у 6 блоков
 * из 214.
 *
 *   — вело на /calculator → первичная кнопка открывает форму, вторичной
 *     остаётся прежняя ссылка на калькулятор с прежней подписью;
 *   — вело на /contacts   → первичная кнопка открывает форму, подпись
 *     сохраняется, вторичная не нужна: модалка и есть контакт;
 *   — вело на страницу услуги → не трогаем, там другая работа.
 *
 * Заодно проставляем `leadSource` = `blog-<uk-слаг>`. Вместе с событием
 * `generate_lead`, которое теперь уходит в dataLayer, это даёт ответ на
 * вопрос «из какой статьи пришла заявка» — раньше его получить было неоткуда.
 *
 * Запуск: SANITY_WRITE_TOKEN=… node scripts/blog-cta-2026-08-30/cta-to-form.mjs [--dry]
 */
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

/** Подпись первичной кнопки, когда она начинает открывать форму. */
const FORM_LABEL = {
  uk: "Залишити заявку",
  ru: "Оставить заявку",
  en: "Send an enquiry",
};

const isCalculator = (h) => /^\/(ru\/|en\/)?calculator$/.test(h || "");
const isContacts = (h) => /^\/(ru\/|en\/)?contacts$/.test(h || "");

const posts = await client.fetch(
  '*[_type=="blogPost" && status=="published"]{_id, "slug": slugs.uk.current, body}',
);

let docs = 0;
let toForm = 0;
let withSecondary = 0;

for (const post of posts) {
  if (!post.body) continue;
  const body = structuredClone(post.body);
  let touched = false;

  for (const [locale, blocks] of Object.entries(body)) {
    if (!Array.isArray(blocks)) continue;
    for (const b of blocks) {
      if (b._type !== "ctaCallout") continue;
      const href = b.ctaHref || b.buttonHref;
      if (!isCalculator(href) && !isContacts(href)) continue;

      const originalLabel = b.ctaLabel || b.buttonLabel;
      b.ctaMode = "modal";
      b.leadSource = `blog-${post.slug || post._id}`;

      if (isCalculator(href)) {
        // Калькулятор остаётся доступным — уходит во вторичную кнопку.
        b.ctaSecondaryLabel = originalLabel;
        b.ctaSecondaryHref = href;
        b.ctaLabel = FORM_LABEL[locale] ?? FORM_LABEL.uk;
        b.buttonLabel = b.ctaLabel;
        withSecondary++;
      }
      // Для /contacts подпись оставляем как была: модалка и есть контакт.

      toForm++;
      touched = true;
    }
  }

  if (!touched) continue;
  docs++;
  if (!DRY) await client.patch(post._id).set({ body }).commit();
}

console.log(
  `постов: ${docs}, CTA переведено на форму: ${toForm}, из них с калькулятором во вторичной: ${withSecondary}${DRY ? " (dry run)" : ""}`,
);
