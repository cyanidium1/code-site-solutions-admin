/**
 * Job #36 probe: option docs + related links for the new Domlivo case.
 *
 * Run:
 *   npx sanity exec scripts/probe-options-job36.ts --with-user-token
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})

async function main() {
  const countries = await client.fetch(
    '*[_type == "countryOption"]{_id, "slug": slug.current, title} | order(slug asc)',
  )
  const buckets = await client.fetch(
    '*[_type == "budgetBucketOption"]{_id, "slug": slug.current, title} | order(slug asc)',
  )
  const reRelated = await client.fetch(
    '*[_type == "industryPage" && slug.current == "real-estate"][0]{relatedCases, relatedPosts}',
  )
  const homepage = await client.fetch('*[_type == "homepageCases"][0]{_id, "count": count(cases)}')
  const caseMeta = await client.fetch(
    '*[_type == "caseStudy" && slug.current in ["webbond", "nbyg-kobenhavn", "right-cars"]]{_id, "slug": slug.current, year, order, metricsLine, budget, budgetBucket, country, industry, duration}',
  )
  console.log(JSON.stringify({countries, buckets, reRelated, homepage, caseMeta}, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
