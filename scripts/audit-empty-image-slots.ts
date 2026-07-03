/**
 * Audit: list image slots that exist in the schema but are EMPTY in data —
 * so future image uploads can be alt-texted under the same rules without
 * re-auditing (see docs/image-alt-audit.md).
 *
 * Run: npx sanity exec scripts/audit-empty-image-slots.ts --with-user-token
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})

type Row = Record<string, any>

function has(img: any): boolean {
  return Boolean(img?.image?.asset?._ref || img?.asset?._ref)
}

function main() {
  const q = `{
    "industry": *[_type == "industryPage"]{_id, "slug": slug.current, hero, sections},
    "cases": *[_type == "caseStudy"]{_id, "slug": slug.current, coverImage, hero, sections},
    "testimonials": *[_type == "testimonial"]{_id, "author": coalesce(authorName.uk, authorName), mockupLeft, mockupRight},
    "blog": *[_type == "blogPost"]{_id, "slug": slug.current, coverImage, ogImage}
  }`
  return client.fetch<Row>(q).then((r) => {
    const out: string[] = []
    for (const d of r.industry) {
      const empty: string[] = []
      if (!has(d.hero?.deviceMockup)) empty.push('hero.deviceMockup')
      for (const s of d.sections ?? []) {
        const at = `sections[${s._type}]`
        if (s._type === 'beforeAfterBlock' || s.before || s.after) {
          if (s.before && !has(s.before.image)) empty.push(`${at}.before.image`)
          if (s.after && !has(s.after.image)) empty.push(`${at}.after.image`)
        }
        if (s._type === 'imageTextBlock') {
          if (!has(s.image)) empty.push(`${at}.image`)
          if (s.image2 !== undefined && !has(s.image2)) empty.push(`${at}.image2`)
        }
        for (const [i, row] of (s.benefitRows ?? []).entries()) {
          if (!has(row.image)) empty.push(`${at}.benefitRows[${i}]("${row.mockType ?? 'pages'}" mock used)`)
        }
        for (const [i, f] of (s.features ?? []).entries()) {
          if (!has(f.image)) empty.push(`${at}.features[${i}]`)
        }
        if (s.testimonial) {
          if (!has(s.testimonial.visual)) empty.push(`${at}.testimonial.visual`)
          if (!has(s.testimonial.authorAvatar)) empty.push(`${at}.testimonial.authorAvatar`)
        }
        if (s.authorAvatar !== undefined && !has(s.authorAvatar)) empty.push(`${at}.authorAvatar`)
      }
      if (empty.length) out.push(`industryPage ${d.slug} (${d._id}):\n  - ${empty.join('\n  - ')}`)
    }
    for (const d of r.cases) {
      const empty: string[] = []
      if (!has(d.coverImage)) empty.push('coverImage')
      if (d.hero && !has(d.hero.heroImage)) empty.push('hero.heroImage')
      if (empty.length) out.push(`caseStudy ${d.slug} (${d._id}):\n  - ${empty.join('\n  - ')}`)
    }
    for (const d of r.testimonials) {
      const empty: string[] = []
      if (!has(d.mockupLeft)) empty.push('mockupLeft')
      if (!has(d.mockupRight)) empty.push('mockupRight')
      if (empty.length) out.push(`testimonial ${d.author ?? d._id} (${d._id}):\n  - ${empty.join('\n  - ')}`)
    }
    for (const d of r.blog) {
      const empty: string[] = []
      if (!d.coverImage?.src) empty.push('coverImage (src+alt+altEn)')
      if (!d.ogImage?.asset) empty.push('ogImage')
      if (empty.length) out.push(`blogPost ${d.slug} (${d._id}):\n  - ${empty.join('\n  - ')}`)
    }
    console.log(out.join('\n'))
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
