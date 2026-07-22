/**
 * Publish the CMS-explainer article created by blog-cms-article-2026.ts:
 * promotes drafts.<uuid> to the published document, sets status:'published'
 * + publishedAt, and deletes the draft — one transaction.
 *
 * The blogVideo block stays with an empty youtubeId (hidden on the site)
 * until the screencast is ready; fill it in Studio and republish then.
 *
 * Dry-run:  npx sanity exec scripts/blog-cms-article-publish-2026.ts --with-user-token
 * Apply:    npx sanity exec scripts/blog-cms-article-publish-2026.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const UUID = 'b5728991-81b4-4240-8729-8c8798481123'
const DRAFT_ID = `drafts.${UUID}`

function main() {
  return client.getDocument(DRAFT_ID).then((draft) => {
    if (!draft) {
      throw new Error(`${DRAFT_ID} not found — already published? Check *[_id == "${UUID}"].`)
    }
    const now = new Date().toISOString()
    const doc: Record<string, unknown> = {
      ...draft,
      _id: UUID,
      status: 'published',
      publishedAt: now,
    }
    delete doc._rev
    delete doc._createdAt
    delete doc._updatedAt

    console.log(`Draft:   ${DRAFT_ID}`)
    console.log(`Publish: ${UUID} (status: published, publishedAt: ${now})`)
    if (!APPLY) {
      console.log('\nDry-run only. Re-run with `-- --apply` to publish.')
      return Promise.resolve()
    }
    return client
      .transaction()
      .createOrReplace(doc as {_id: string; _type: string})
      .delete(DRAFT_ID)
      .commit()
      .then((res) => {
        console.log(`\nPublished. Transaction: ${res.transactionId}`)
      })
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
