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
*[_type == "blogPost" && status == "published" && defined(slugs.uk.current)]
${BLOG_POST_REF}
| order(publishedAt desc, _createdAt desc)
`

/**
 * Full blog post payload. Parameter: $slug.
 * Flattens the localized objects to per-locale keys.
 */
export const BLOG_POST_BY_SLUG_QUERY = /* groq */ `
*[_type == "blogPost" && status == "published" && slugs.uk.current == $slug][0]{
  _id,
  "slug": slugs.uk.current,
  "slugEn": slugs.en.current,
  "title": title.uk,
  "titleEn": title.en,
  publishedAt,
  "lede": lede.uk,
  "ledeEn": lede.en,
  "cover": cover{
    "asset": image.asset->{ _id, url, metadata { lqip, dimensions, isOpaque } },
    "crop": image.crop,
    "hotspot": image.hotspot,
    alt ${LOCALIZED_STRING}
  },
  coverImage{ src, alt, altEn },
  "body": body.uk,
  "bodyEn": body.en,
  "faqHeading": faqHeading.uk,
  "faqHeadingEn": faqHeading.en,
  "faq": faq[]{
    _key,
    "question": question.uk,
    "answer": answer.uk
  },
  "faqEn": faq[defined(question.en)]{ _key, "question": question.en, "answer": answer.en },
  "metaTitle": metaTitle.uk,
  "metaTitleEn": metaTitle.en,
  "metaDescription": metaDescription.uk,
  "metaDescriptionEn": metaDescription.en,
  "relatedCases": relatedCases[]->${CASE_STUDY_REF},
  "relatedIndustries": relatedIndustries[]->${INDUSTRY_PAGE_REF},
  relatedPostSlugs
}
`
