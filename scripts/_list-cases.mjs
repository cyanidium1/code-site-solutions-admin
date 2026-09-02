// Throwaway read-only lister: prints every caseStudy with key state so we can
// reconcile crawler slugs with Sanity. No mutations. Delete after use.
import {createClient} from '@sanity/client'
import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

function loadEnv(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (process.env[k] === undefined) process.env[k] = v
  }
}
loadEnv(join(process.cwd(), '.env.local'))
loadEnv(join(process.cwd(), '..', 'code-site-solutions', '.env.local'))

const client = createClient({
  projectId: '4lk0x7o9',
  dataset: 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_TOKEN, // optional for reads
  useCdn: false,
})

const rows = await client.fetch(`*[_type=="caseStudy"]{
  "slug": slug.current,
  "title": coalesce(title.uk, title.en),
  status,
  "hasCover": defined(coverImage.image.asset),
  "seoOk": defined(seo.title.uk) && defined(seo.description.uk),
  "sectionTypes": sections[].\_type,
  "galleryCount": count(sections[_type=="mediaGalleryBlock"][0].images)
} | order(slug)`)

console.log(`TOTAL caseStudy docs: ${rows.length}\n`)
for (const r of rows) {
  console.log(
    `slug=${String(r.slug).padEnd(20)} status=${String(r.status).padEnd(9)} cover=${r.hasCover ? 'Y' : 'n'} seo=${r.seoOk ? 'Y' : 'n'} gallery=${r.galleryCount ?? 0} | ${r.title ?? ''}`,
  )
  console.log(`    sections: ${(r.sectionTypes ?? []).join(', ') || '—'}`)
}
