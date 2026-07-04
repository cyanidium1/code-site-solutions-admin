/**
 * Job #36 probe: dump the real-estate industry page + a reference case study.
 *
 * Run:
 *   npx sanity exec scripts/probe-realestate-job36.ts --with-user-token
 */

import {writeFileSync} from 'node:fs'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})

const OUT = process.env.PROBE_OUT || 'probe-realestate-job36.out.json'

async function main() {
  const industries = await client.fetch(
    '*[_type == "industryPage"]{_id, "slug": slug.current, status, title}',
  )

  const realEstate = await client.fetch(
    `*[_type == "industryPage" && (slug.current match "*estate*" || slug.current match "*nerukhom*" || title.uk match "*нерухом*")][0]{
      ...,
    }`,
  )

  const cases = await client.fetch(
    '*[_type == "caseStudy"] | order(_updatedAt desc) {_id, "slug": slug.current, status, client, title, _updatedAt}',
  )

  // full reference case: most recently updated published one
  const refCase = await client.fetch(
    '*[_type == "caseStudy" && status == "published"] | order(_updatedAt desc) [0]{...}',
  )

  writeFileSync(OUT, JSON.stringify({industries, realEstate, cases, refCase}, null, 2), 'utf8')
  console.log('industries:', industries.length, '| cases:', cases.length)
  console.log('realEstate doc:', realEstate?._id, realEstate?.slug?.current ?? '')
  console.log('refCase:', refCase?._id, refCase?.slug?.current ?? '')
  console.log('wrote', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
