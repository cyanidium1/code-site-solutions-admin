/**
 * Attach CMS-hosted covers to the blog posts (new blogPost.cover field,
 * type imageWithLocalizedAlt).
 *
 * Context (2026-07-22): the three cover webp files under the frontend
 * /public/blog were never referenced from Sanity — every post's legacy
 * coverImage.src is empty, so the live site showed no covers at all.
 * Two of the files match current posts and are uploaded + attached here;
 * cover-dohovir-7-punktiv.webp belongs to the deleted contract article
 * and is deliberately NOT attached (that post keeps the generic fallback).
 *
 * Alt texts follow docs/image-alt-styleguide.md (describe the cover scene,
 * ≤125 chars, both locales).
 *
 * Dry-run:  npx sanity exec scripts/migrate-blog-covers-to-cms.ts --with-user-token
 * Apply:    npx sanity exec scripts/migrate-blog-covers-to-cms.ts --with-user-token -- --apply
 */

import {readFileSync} from 'node:fs'
import {basename, join} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const FRONTEND_PUBLIC = join(process.cwd(), '..', 'code-site-solutions', 'public')

const COVERS: Array<{slug: string; file: string; altUk: string; altEn: string}> = [
  {
    slug: 'vartist-rozrobky-saytu-2026',
    file: '/blog/cover-skilky-koshtuye.webp',
    altUk: 'Скільки коштує сайт у 2026 — діаграма цін від $1,000 за лендінг до $14,000+ за custom-платформу',
    altEn: 'How much a website costs in 2026 — price bars from a $1,000 landing to a $14,000+ custom build',
  },
  {
    slug: 'tilda-vs-kastomnyy-sayt-2026',
    file: '/blog/cover-tilda-7200.webp',
    altUk: 'Tilda за $200/міс проти custom-коду — графік кумулятивних витрат $7,200 за 3 роки',
    altEn: 'Tilda at $200/mo vs custom code — cumulative cost chart reaching $7,200 over 3 years',
  },
]

function migrateOne(entry: (typeof COVERS)[number]): Promise<void> {
  return client
    .fetch<{_id: string; hasCover: boolean} | null>(
      `*[_type == "blogPost" && slug.current == $slug][0]{_id, "hasCover": defined(cover.image.asset)}`,
      {slug: entry.slug},
    )
    .then((post) => {
      if (!post) {
        console.log(`  ${entry.slug} — post not found, skipping`)
        return
      }
      if (post.hasCover) {
        console.log(`  ${entry.slug} — already has a CMS cover, skipping`)
        return
      }
      const buffer = readFileSync(join(FRONTEND_PUBLIC, entry.file))
      console.log(`  ${entry.slug} ← ${entry.file} (${(buffer.length / 1024).toFixed(0)} KB)`)
      if (!APPLY) return

      return client.assets
        .upload('image', buffer, {filename: basename(entry.file)})
        .then((asset) =>
          client
            .patch(post._id)
            .set({
              cover: {
                _type: 'imageWithLocalizedAlt',
                image: {
                  _type: 'image',
                  asset: {_type: 'reference', _ref: asset._id},
                },
                alt: {
                  _type: 'localizedString',
                  uk: entry.altUk,
                  en: entry.altEn,
                },
              },
            })
            .commit(),
        )
        .then((res) => {
          console.log(`    → cover set (rev ${res._rev})`)
        })
    })
}

function main() {
  console.log(`Covers to attach: ${COVERS.length}`)
  return COVERS.reduce(
    (chain, entry) => chain.then(() => migrateOne(entry)),
    Promise.resolve(),
  ).then(() => {
    if (!APPLY) console.log('\nDry-run only. Re-run with `-- --apply` to migrate.')
    else console.log('\nDone.')
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
