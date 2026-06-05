// ─── Reusable objects ─────────────────────────────────────────────────
import {blogAuthor} from './objects/blogAuthor'
import {blogBody} from './objects/blogBody'
import {ctaAction} from './objects/ctaAction'
import {imageWithLocalizedAlt} from './objects/imageWithLocalizedAlt'
import {localizedString} from './objects/localizedString'
import {localizedText} from './objects/localizedText'
import {mediaGalleryImageItem} from './objects/mediaGalleryImageItem'
import {metric} from './objects/metric'
import {outcomeResultItem} from './objects/outcomeResultItem'
import {richTextSimple} from './objects/richTextSimple'
import {seoFields} from './objects/seoFields'

// ─── Embedded blocks (used inside document.sections[] or blogBody) ────
import {auditBlock} from './blocks/auditBlock'
import {beforeAfterBlock} from './blocks/beforeAfterBlock'
import {blogImage} from './blocks/blogImage'
import {blogTable} from './blocks/blogTable'
import {caseBlock} from './blocks/caseBlock'
import {comparisonBlock} from './blocks/comparisonBlock'
import {ctaBlock} from './blocks/ctaBlock'
import {ctaCallout} from './blocks/ctaCallout'
import {faqBlock} from './blocks/faqBlock'
import {imageTextBlock} from './blocks/imageTextBlock'
import {mediaGalleryBlock} from './blocks/mediaGalleryBlock'
import {outcomeBlock} from './blocks/outcomeBlock'
import {pricingBlock} from './blocks/pricingBlock'
import {quoteBlock} from './blocks/quoteBlock'
import {reasonsBlock} from './blocks/reasonsBlock'
import {richTextBlock} from './blocks/richTextBlock'
import {servicesBlock} from './blocks/servicesBlock'
import {statsBlock} from './blocks/statsBlock'
import {testimonialBlock} from './blocks/testimonialBlock'
import {tldrBox} from './blocks/tldrBox'

// ─── Top-level documents ──────────────────────────────────────────────
import {blogCategoryOption} from './documents/blogCategoryOption'
import {blogPost} from './documents/blogPost'
import {budgetBucketOption} from './documents/budgetBucketOption'
import {calculatorCmsOptions} from './documents/calculatorCmsOptions'
import {calculatorContentOptions} from './documents/calculatorContentOptions'
import {calculatorDesignOptions} from './documents/calculatorDesignOptions'
import {calculatorFeatureOptions} from './documents/calculatorFeatureOptions'
import {calculatorLanguageOptions} from './documents/calculatorLanguageOptions'
import {calculatorMaintenanceOptions} from './documents/calculatorMaintenanceOptions'
import {calculatorPresets} from './documents/calculatorPresets'
import {calculatorProductComplexityOptions} from './documents/calculatorProductComplexityOptions'
import {calculatorProjectTypes} from './documents/calculatorProjectTypes'
import {calculatorSeoGrowthOptions} from './documents/calculatorSeoGrowthOptions'
import {calculatorSeoOptions} from './documents/calculatorSeoOptions'
import {calculatorSettings} from './documents/calculatorSettings'
import {calculatorTimelineOptions} from './documents/calculatorTimelineOptions'
import {caseStudy} from './documents/caseStudy'
import {countryOption} from './documents/countryOption'
import {homepageCases} from './documents/homepageCases'
import {industryPage} from './documents/industryPage'
import {pricingPlan} from './documents/pricingPlan'
import {testimonial} from './documents/testimonial'

export const schemaTypes = [
  // Reusable objects (registered first — referenced by blocks/documents)
  localizedString,
  localizedText,
  imageWithLocalizedAlt,
  ctaAction,
  metric,
  seoFields,
  richTextSimple,
  mediaGalleryImageItem,
  outcomeResultItem,
  blogAuthor,
  // Blog body PT type — must register AFTER blog blocks since it references them
  // (order doesn't strictly matter at runtime, but keeps the dep graph readable).
  tldrBox,
  ctaCallout,
  blogTable,
  blogImage,
  blogBody,

  // Embedded blocks (industry/case sections)
  imageTextBlock,
  statsBlock,
  faqBlock,
  pricingBlock,
  comparisonBlock,
  reasonsBlock,
  servicesBlock,
  outcomeBlock,
  quoteBlock,
  richTextBlock,
  mediaGalleryBlock,
  beforeAfterBlock,
  testimonialBlock,
  caseBlock,
  auditBlock,
  ctaBlock,

  // Top-level documents
  blogPost,
  industryPage,
  pricingPlan,
  caseStudy,
  testimonial,
  countryOption,
  budgetBucketOption,
  blogCategoryOption,
  calculatorSettings,
  homepageCases,

  // v2 calculator singletons (consolidate v1 docs)
  calculatorProjectTypes,
  calculatorPresets,
  calculatorCmsOptions,
  calculatorSeoOptions,
  calculatorFeatureOptions,
  calculatorLanguageOptions,
  calculatorDesignOptions,
  calculatorTimelineOptions,
  calculatorMaintenanceOptions,
  calculatorSeoGrowthOptions,
  calculatorContentOptions,
  calculatorProductComplexityOptions,
]
