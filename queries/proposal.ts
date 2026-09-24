/**
 * Комерційні пропозиції (/offer/<slug>).
 *
 * На відміну від решти запитів тут немає проєкцій localizedString: КП
 * одномовне, мова лежить у полі `language` (див. schemaTypes/documents/proposal).
 *
 * Списку «всі КП» свідомо немає. Сторінки не індексуються і ніде не
 * лінкуються, тому фронту не потрібен ані sitemap-запит, ані
 * generateStaticParams — інакше перелік адрес усіх чинних пропозицій
 * потрапив би у збірку.
 */

const PROPOSAL_DETAILS = /* groq */ `{
  label,
  body[]
}`

/**
 * Повна КП за slug. Параметр: $slug.
 * Повертає null, якщо slug не веде до опублікованого документа.
 */
export const PROPOSAL_BY_SLUG_QUERY = /* groq */ `
*[_type == "proposal" && status == "published" && slug.current == $slug][0]{
  _id,
  "slug": slug.current,
  title,
  language,
  client{ name, contact, site },
  meta{
    preparedBy,
    preparedByRole,
    email,
    telegram,
    issuedOn,
    validUntil,
    currencyNote
  },
  hero{
    eyebrow,
    heading,
    lede,
    highlights[]{ _key, value, label }
  },
  sections[]{
    _type,
    _key,
    eyebrow,
    heading,
    lede,
    note,
    caption,
    variant,
    tone,
    body[],
    details ${PROPOSAL_DETAILS},
    columns,
    rows[]{ _key, cells, emphasis },
    items[]{ _key, title, text, details ${PROPOSAL_DETAILS} },
    options[]{
      _key,
      key,
      name,
      price,
      priceNote,
      summary,
      bullets,
      badge,
      recommended,
      details ${PROPOSAL_DETAILS}
    },
    addons[]{
      _key,
      key,
      name,
      price,
      summary,
      details ${PROPOSAL_DETAILS}
    },
    primaryLabel,
    primaryHref,
    secondaryLabel,
    secondaryHref,
    images[]{
      _key,
      caption,
      alt,
      "asset": image.asset->{ _id, url, metadata { lqip, dimensions, isOpaque } },
      "hotspot": image.hotspot,
      "crop": image.crop
    }
  },
  footerNote
}
`
