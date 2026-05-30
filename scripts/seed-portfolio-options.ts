/**
 * Seed countryOption + budgetBucketOption docs, then migrate existing
 * caseStudy docs from `country: "UA"` / `budgetBucket: "3-7k"` (legacy strings)
 * to references at `country->`, `budgetBucket->`.
 *
 * Idempotent — re-running is safe (uses createOrReplace + targeted patches).
 *
 *   npx sanity@latest exec scripts/seed-portfolio-options.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})

type LocalizedName = {uk: string; en: string}

type OptionDoc = {
  _id: string
  _type: 'countryOption' | 'budgetBucketOption'
  name: LocalizedName
  slug: {_type: 'slug'; current: string}
  order: number
}

const COUNTRIES: Array<{slug: string; name: LocalizedName; order: number}> = [
  {slug: 'UA', name: {uk: 'Україна', en: 'Ukraine'}, order: 10},
  {slug: 'DK', name: {uk: 'Данія', en: 'Denmark'}, order: 20},
  {slug: 'US', name: {uk: 'США', en: 'USA'}, order: 30},
  {slug: 'PL', name: {uk: 'Польща', en: 'Poland'}, order: 40},
  {slug: 'DE', name: {uk: 'Німеччина', en: 'Germany'}, order: 50},
  {slug: 'UK', name: {uk: 'Велика Британія', en: 'United Kingdom'}, order: 60},
  {slug: 'EU', name: {uk: 'Інше / ЄС', en: 'Other / EU'}, order: 70},
]

const BUDGETS: Array<{slug: string; name: LocalizedName; order: number}> = [
  {slug: 'lt3k', name: {uk: 'До $3k', en: 'Under $3k'}, order: 10},
  {slug: '3-7k', name: {uk: '$3–7k', en: '$3–7k'}, order: 20},
  {slug: '7-15k', name: {uk: '$7–15k', en: '$7–15k'}, order: 30},
  {slug: 'gt15k', name: {uk: '$15k+', en: '$15k+'}, order: 40},
]

function docId(prefix: string, slug: string): string {
  // `.` separator matches the existing convention (caseStudy.efedra-clinic etc.)
  return `${prefix}.${slug}`
}

function buildCountryDoc(o: (typeof COUNTRIES)[number]): OptionDoc {
  return {
    _id: docId('countryOption', o.slug),
    _type: 'countryOption',
    name: o.name,
    slug: {_type: 'slug', current: o.slug},
    order: o.order,
  }
}

function buildBudgetDoc(o: (typeof BUDGETS)[number]): OptionDoc {
  return {
    _id: docId('budgetBucketOption', o.slug),
    _type: 'budgetBucketOption',
    name: o.name,
    slug: {_type: 'slug', current: o.slug},
    order: o.order,
  }
}

async function seedOptions() {
  console.log('— Seeding country options —')
  for (const c of COUNTRIES) {
    const doc = buildCountryDoc(c)
    await client.createOrReplace(doc)
    console.log(`  ✓ ${doc._id}`)
  }
  console.log('— Seeding budget bucket options —')
  for (const b of BUDGETS) {
    const doc = buildBudgetDoc(b)
    await client.createOrReplace(doc)
    console.log(`  ✓ ${doc._id}`)
  }
}

type CaseProbe = {
  _id: string
  country?: unknown
  budgetBucket?: unknown
}

function isLegacyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0
}

async function migrateCases() {
  console.log('— Migrating cases (string → reference) —')
  const cases = await client.fetch<CaseProbe[]>(
    `*[_type == "caseStudy"]{_id, country, budgetBucket}`,
  )
  for (const c of cases) {
    const patches: Record<string, unknown> = {}
    if (isLegacyString(c.country)) {
      patches.country = {
        _type: 'reference',
        _ref: docId('countryOption', c.country),
      }
    }
    if (isLegacyString(c.budgetBucket)) {
      patches.budgetBucket = {
        _type: 'reference',
        _ref: docId('budgetBucketOption', c.budgetBucket),
      }
    }
    if (Object.keys(patches).length === 0) {
      console.log(`  · ${c._id} — already migrated or empty, skipping`)
      continue
    }
    await client.patch(c._id).set(patches).commit()
    console.log(`  ✓ ${c._id} — set ${Object.keys(patches).join(' + ')}`)
  }
}

async function main() {
  await seedOptions()
  await migrateCases()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
