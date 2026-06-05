import {CASE_STUDY_LISTING_PROJECTION} from './fragments'

/**
 * Singleton fetcher. Returns the four curated case-study slot arrays
 * referenced by the homepage Cases section. Each entry dereferences
 * the case-study with the standard listing projection so the frontend
 * can render the same RelatedCard shape across all sets.
 */
export const HOMEPAGE_CASES_QUERY = /* groq */ `
*[_type == "homepageCases" && _id == "homepageCases"][0]{
  "default":     defaultCases[]->${CASE_STUDY_LISTING_PROJECTION},
  "legal":       legalCases[]->${CASE_STUDY_LISTING_PROJECTION},
  "medicine":    medicineCases[]->${CASE_STUDY_LISTING_PROJECTION},
  "realEstate":  realEstateCases[]->${CASE_STUDY_LISTING_PROJECTION}
}
`
