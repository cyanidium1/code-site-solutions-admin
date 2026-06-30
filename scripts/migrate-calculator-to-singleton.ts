/**
 * Fold the 13 legacy calculator singletons into one `calculatorConfig` doc.
 *
 * Drops presets, maintenance, and seoGrowth (recurring plans moved off the
 * calculator). Timeline `percent` -> flat `price` via TIMELINE_PRICE below.
 * Preserves each row's `_key` and `optionKey`. Idempotent (createOrReplace
 * on fixed _id "calculatorConfig").
 *
 * Dry-run:  npx sanity exec scripts/migrate-calculator-to-singleton.ts --with-user-token
 * Apply:    npx sanity exec scripts/migrate-calculator-to-singleton.ts --with-user-token -- --apply
 *   (or: npm run migrate:calculator-singleton  /  npm run migrate:calculator-singleton -- --apply)
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

// Locked timeline percent -> flat USD price (REVIEW before --apply).
// Standard stays free; faster/urgent become additive surcharges.
const TIMELINE_PRICE: Record<string, number> = {standard: 0, faster: 600, urgent: 1200}

type Row = Record<string, unknown> & {optionKey?: string; _key?: string}

async function main() {
  const src = await client.fetch<{
    projectTypes?: Row[]
    productComplexity?: Row[]
    design?: Row[]
    languages?: Row[]
    timeline?: Row[]
    contentOptions?: Row[]
    cmsUpgrades?: Row[]
    seoOptions?: Row[]
    features?: Row[]
    settings?: {defaultProjectType?: string; roundStep?: number}
  }>(`{
    "projectTypes": *[_id == "calculatorProjectTypes"][0].types,
    "productComplexity": *[_id == "calculatorProductComplexityOptions"][0].options,
    "design": *[_id == "calculatorDesignOptions"][0].options,
    "languages": *[_id == "calculatorLanguageOptions"][0].options,
    "timeline": *[_id == "calculatorTimelineOptions"][0].options,
    "contentOptions": *[_id == "calculatorContentOptions"][0].options,
    "cmsUpgrades": *[_id == "calculatorCmsOptions"][0].options,
    "seoOptions": *[_id == "calculatorSeoOptions"][0].options,
    "features": *[_id == "calculatorFeatureOptions"][0].options,
    "settings": *[_id == "calculatorSettings"][0]{defaultProjectType, roundStep}
  }`)

  const timeline = (src.timeline ?? []).map((o) => {
    const {percent: _drop, ...rest} = o as Row & {percent?: number}
    return {...rest, price: TIMELINE_PRICE[o.optionKey ?? ''] ?? 0}
  })

  const doc = {
    _id: 'calculatorConfig',
    _type: 'calculatorConfig',
    defaultProjectType: src.settings?.defaultProjectType ?? 'multiPage',
    roundStep: src.settings?.roundStep ?? 50,
    projectTypes: src.projectTypes ?? [],
    productComplexity: src.productComplexity ?? [],
    design: src.design ?? [],
    languages: src.languages ?? [],
    timeline,
    contentOptions: src.contentOptions ?? [],
    cmsUpgrades: src.cmsUpgrades ?? [],
    seoOptions: src.seoOptions ?? [],
    features: src.features ?? [],
  }

  const counts = Object.fromEntries(
    (['projectTypes', 'productComplexity', 'design', 'languages', 'timeline', 'contentOptions', 'cmsUpgrades', 'seoOptions', 'features'] as const)
      .map((k) => [k, (doc[k] as unknown[]).length]),
  )

  if (!APPLY) {
    console.log('DRY RUN — composed calculatorConfig')
    console.log('settings:', {defaultProjectType: doc.defaultProjectType, roundStep: doc.roundStep})
    console.log('counts:', counts)
    console.log('timeline (percent -> price):', timeline.map((t) => ({key: (t as Row).optionKey, price: (t as {price: number}).price})))
    const empties = Object.entries(counts).filter(([, n]) => n === 0).map(([k]) => k)
    if (empties.length) console.warn('! EMPTY arrays (check source docs exist):', empties.join(', '))
    console.log('\nRe-run with `-- --apply` to write.')
  } else {
    await client.createOrReplace(doc)
    console.log('✓ Applied: calculatorConfig written with counts', counts)
  }
}

main().catch((e) => {console.error(e); process.exit(1)})
