/**
 * Calculator config query — reads the single consolidated `calculatorConfig`
 * document in one round trip.
 *
 * Mirrors `CALCULATOR_CONFIG_QUERY` in the frontend repo
 * (`src/lib/server/sanity-queries.ts`). Keep the two copies in sync.
 */
import {LOCALIZED_STRING, LOCALIZED_TEXT} from './fragments'

export const CALCULATOR_CONFIG_QUERY = /* groq */ `*[_id == "calculatorConfig"][0]{
  "settings": { defaultProjectType, roundStep },
  "projectTypes": projectTypes[]{
    _key, projectKey,
    label ${LOCALIZED_STRING},
    hint ${LOCALIZED_TEXT},
    basePrice, hasProductComplexity, pages
  },
  "productComplexityOptions": productComplexity[]{ _key, optionKey, label ${LOCALIZED_STRING}, hint ${LOCALIZED_TEXT}, price },
  "designOptions": design[]{ _key, optionKey, label ${LOCALIZED_STRING}, hint ${LOCALIZED_TEXT}, percent },
  "languageOptions": languages[]{ _key, optionKey, label ${LOCALIZED_STRING}, percent },
  "timelineOptions": timeline[]{ _key, optionKey, label ${LOCALIZED_STRING}, hint ${LOCALIZED_TEXT}, price },
  "contentOptions": contentOptions[]{ _key, optionKey, label ${LOCALIZED_STRING}, price },
  "cmsOptions": cmsUpgrades[]{ _key, optionKey, label ${LOCALIZED_STRING}, hint ${LOCALIZED_TEXT}, price, included },
  "seoOptions": seoOptions[]{ _key, optionKey, label ${LOCALIZED_STRING}, hint ${LOCALIZED_TEXT}, price, included },
  "featureOptions": features[]{ _key, optionKey, label ${LOCALIZED_STRING}, hint ${LOCALIZED_TEXT}, price, included, featureGroup }
}`
