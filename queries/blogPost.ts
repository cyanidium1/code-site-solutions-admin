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
 * Full blog post payload, any locale. Parameters: $slug + $locale — matches
 * on that locale's slug (slugs[$locale].current). Localized objects pass
 * through whole; renderers pick per locale.
 */
export const BLOG_POST_BY_LOCALE_SLUG_QUERY = /* groq */ `
*[_type == "blogPost" && status == "published" && slugs[$locale].current == $slug][0]{
  _id,
  slugs,
  title,
  publishedAt,
  lede,
  "cover": cover{
    "asset": image.asset->{ _id, url, metadata { lqip, dimensions, isOpaque } },
    "crop": image.crop,
    "hotspot": image.hotspot,
    alt ${LOCALIZED_STRING}
  },
  coverImage{ src, alt, altEn },
  body,
  faqHeading,
  faq[]{ _key, question, answer },
  metaTitle,
  metaDescription,
  "relatedCases": relatedCases[]->${CASE_STUDY_REF},
  "relatedIndustries": relatedIndustries[]->${INDUSTRY_PAGE_REF},
  relatedPostSlugs
}
`
