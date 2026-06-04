import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {createClient} from '@sanity/client'

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile('.env.local')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

type Row = {_id: string; slug?: string; status?: string; title?: {uk?: string; en?: string}}

async function main() {
  const rows = await client.fetch<Row[]>(
    '*[_type == "caseStudy"] | order(slug.current asc) { _id, "slug": slug.current, status, title }',
  )

  const published = rows.filter((d) => d.status === 'published').length
  const draft = rows.filter((d) => d.status === 'draft').length

  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}`)
  console.log(`Total: ${rows.length}`)
  console.log(`Published: ${published}`)
  console.log(`Draft: ${draft}`)
  console.log('')
  for (const d of rows) {
    const title = d.title?.uk || d.title?.en || d._id
    console.log(`${(d.status ?? '?').padEnd(10)} ${(d.slug ?? '-').padEnd(22)} ${title}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
