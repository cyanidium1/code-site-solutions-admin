import {
  BLOG_POST_REF,
  CASE_STUDY_REF,
  IMAGE_WITH_ALT,
  INDUSTRY_PAGE_REF,
  LOCALIZED_STRING,
  LOCALIZED_TEXT,
  SEO_FIELDS,
} from './fragments'

/** Lightweight projection used by /blog listings + sitemap. */
export const BLOG_POSTS_QUERY = /* groq */ `
*[_type == "blogPost" && status == "published" && defined(coalesce(slugs.uk.current, slug.current))]
${BLOG_POST_REF}
| order(publishedAt desc, _createdAt desc)
`

/**
 * Full blog post payload. Parameter: $slug.
 * Coalesce-tolerant: reads both the legacy En-suffix flat fields and the
 * localized objects (2026-07 locale generalization).
 */
export const BLOG_POST_BY_SLUG_QUERY = /* groq */ `
*[_type == "blogPost" && status == "published" && coalesce(slugs.uk.current, slug.current) == $slug][0]{
  _id,
  "slug": coalesce(slugs.uk.current, slug.current),
  "slugEn": coalesce(slugs.en.current, slugEn.current),
  "title": coalesce(title.uk, title),
  "titleEn": coalesce(title.en, titleEn),
  publishedAt,
  "lede": coalesce(lede.uk, lede),
  "ledeEn": coalesce(lede.en, ledeEn),
  "cover": cover{
    "asset": image.asset->{ _id, url, metadata { lqip, dimensions, isOpaque } },
    "crop": image.crop,
    "hotspot": image.hotspot,
    alt ${LOCALIZED_STRING}
  },
  coverImage{ src, alt, altEn },
  "body": coalesce(body.uk, body),
  "bodyEn": coalesce(body.en, bodyEn),
  "faqHeading": coalesce(faqHeading.uk, faqHeading),
  "faqHeadingEn": coalesce(faqHeading.en, faqHeadingEn),
  "faq": faq[]{
    _key,
    "question": coalesce(question.uk, question),
    "answer": coalesce(answer.uk, answer)
  },
  "faqEn": coalesce(
    faqEn[]{ _key, question, answer },
    faq[defined(question.en)]{ _key, "question": question.en, "answer": answer.en }
  ),
  "metaTitle": coalesce(metaTitle.uk, metaTitle),
  "metaTitleEn": coalesce(metaTitle.en, metaTitleEn),
  "metaDescription": coalesce(metaDescription.uk, metaDescription),
  "metaDescriptionEn": coalesce(metaDescription.en, metaDescriptionEn),
  "relatedCases": relatedCases[]->${CASE_STUDY_REF},
  "relatedIndustries": relatedIndustries[]->${INDUSTRY_PAGE_REF},
  relatedPostSlugs
}
`
