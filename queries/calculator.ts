/**
 * Calculator config query — single multi-projection that returns
 * all 13 calculator singletons in one round trip.
 *
 * Mirrors `CALCULATOR_CONFIG_QUERY` in the frontend repo
 * (`src/lib/server/sanity-queries.ts`). Keep the two copies in sync.
 */
import {LOCALIZED_STRING, LOCALIZED_TEXT} from './fragments'

const PROJECT_TYPES_PROJECTION = /* groq */ `
*[_id == "calculatorProjectTypes"][0]{
  "types": types[]{
    _key,
    projectKey,
    label ${LOCALIZED_STRING},
    hint ${LOCALIZED_TEXT},
    basePrice,
    hasProductComplexity,
    pages
  }
}.types
`

const PRESETS_PROJECTION = /* groq */ `
*[_id == "calculatorPresets"][0]{
  "presets": presets[]{
    _key,
    presetKey,
    title ${LOCALIZED_STRING},
    badge ${LOCALIZED_STRING},
    bestFor ${LOCALIZED_TEXT},
    "includes": includes[] ${LOCALIZED_STRING},
    estimatedRange ${LOCALIZED_STRING},
    compareAnchor ${LOCALIZED_TEXT},
    appliedInput
  }
}.presets
`

const CMS_PROJECTION = /* groq */ `
*[_id == "calculatorCmsOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    hint ${LOCALIZED_TEXT},
    price, included
  }
}.options
`

const SEO_PROJECTION = /* groq */ `
*[_id == "calculatorSeoOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    hint ${LOCALIZED_TEXT},
    price, included
  }
}.options
`

const FEATURE_PROJECTION = /* groq */ `
*[_id == "calculatorFeatureOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    hint ${LOCALIZED_TEXT},
    price, included, featureGroup
  }
}.options
`

const LANGUAGE_PROJECTION = /* groq */ `
*[_id == "calculatorLanguageOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    percent
  }
}.options
`

const DESIGN_PROJECTION = /* groq */ `
*[_id == "calculatorDesignOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    hint ${LOCALIZED_TEXT},
    percent,
    "previews": previews[]{
      _key,
      src,
      caption ${LOCALIZED_STRING}
    }
  }
}.options
`

const TIMELINE_PROJECTION = /* groq */ `
*[_id == "calculatorTimelineOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    hint ${LOCALIZED_TEXT},
    percent
  }
}.options
`

const MAINTENANCE_PROJECTION = /* groq */ `
*[_id == "calculatorMaintenanceOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    monthlyPrice
  }
}.options
`

const SEO_GROWTH_PROJECTION = /* groq */ `
*[_id == "calculatorSeoGrowthOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    bestFor ${LOCALIZED_TEXT},
    "includes": includes[] ${LOCALIZED_STRING},
    badge ${LOCALIZED_STRING},
    monthlyPrice,
    priceLabel
  }
}.options
`

const CONTENT_PROJECTION = /* groq */ `
*[_id == "calculatorContentOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    price
  }
}.options
`

const PRODUCT_COMPLEXITY_PROJECTION = /* groq */ `
*[_id == "calculatorProductComplexityOptions"][0]{
  "options": options[]{
    _key, optionKey,
    label ${LOCALIZED_STRING},
    hint ${LOCALIZED_TEXT},
    price
  }
}.options
`

const SETTINGS_PROJECTION = /* groq */ `
*[_id == "calculatorSettings"][0]{
  defaultProjectType,
  roundStep,
  highEstimateFactor
}
`

export const CALCULATOR_CONFIG_QUERY = /* groq */ `{
  "projectTypes":         ${PROJECT_TYPES_PROJECTION},
  "presets":              ${PRESETS_PROJECTION},
  "cmsOptions":           ${CMS_PROJECTION},
  "seoOptions":           ${SEO_PROJECTION},
  "featureOptions":       ${FEATURE_PROJECTION},
  "languageOptions":      ${LANGUAGE_PROJECTION},
  "designOptions":        ${DESIGN_PROJECTION},
  "timelineOptions":      ${TIMELINE_PROJECTION},
  "maintenanceOptions":   ${MAINTENANCE_PROJECTION},
  "seoGrowthOptions":     ${SEO_GROWTH_PROJECTION},
  "contentOptions":       ${CONTENT_PROJECTION},
  "productComplexityOptions": ${PRODUCT_COMPLEXITY_PROJECTION},
  "settings":             ${SETTINGS_PROJECTION}
}`
