/**
 * Job #82 (2026-07-19): roll Google Search Console proof images out to cases.
 *
 * Per client (nbyg, kondor, mono-pools, efedra-clinic, boulevard-salon):
 *  - upload gsc-<case>-6mo-compare + gsc-<case>-3mo from the workspace docs folder
 *  - nbyg: swap the existing "grow on Google" block image (0eb227ff2f05) to the
 *    new compare screenshot + imageFit=natural; same swap on the renovation
 *    industry page (389496107e89) which reuses the asset
 *  - other cases: insert a new imageTextBlock (heading only — body copy comes
 *    in a later job) before the case gallery, imageFit=natural
 *  - all cases: append both screenshots to the mediaGalleryBlock with
 *    fit=contain and bilingual alts
 *
 * Dry-run by default. Run:
 *   npx sanity exec scripts/gsc-images-2026-07.ts --with-user-token -- --apply
 */
import {createReadStream, existsSync, mkdirSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const IMG_DIR = 'C:/GitHub23/code-site-workspace/docs/google console images'
const BACKUP_DIR = join(process.cwd(), 'backups', 'gsc-images-2026-07-19')

const BLOCK_KEY = 'gscgrowth'
const GALLERY_COMPARE_KEY = 'gsccompare'
const GALLERY_3MO_KEY = 'gsc3mo'

type ClientDef = {
  slug: string
  docId: string
  /** Display name used inside alt strings. */
  name: string
  compareFile: string
  threeMoFile: string
  galleryKey: string
  /** nbyg only: swap this existing block instead of inserting a new one. */
  existingBlockKey?: string
  /** Gallery items get captions only where the gallery already uses them. */
  withCaptions?: boolean
}

const CLIENTS: ClientDef[] = [
  {
    slug: 'nbyg-kobenhavn',
    docId: 'lOTgaDd8FU4wgJ8F4K9wE8',
    name: 'NBYG',
    compareFile: 'gsc-nbyg-6mo-compare.png',
    threeMoFile: 'gsc-nbyg-3mo.png',
    galleryKey: '27444650b95d',
    existingBlockKey: '0eb227ff2f05',
  },
  {
    slug: 'kondor-device',
    docId: 'a5311634-9a57-4de9-ab72-ec42fcfcc270',
    name: 'Kondor',
    compareFile: 'gsc-kondor-6mo-compare.png',
    threeMoFile: 'gsc-kondor-3mo.png',
    galleryKey: '837b6d2c22df',
  },
  {
    slug: 'mono-pools',
    docId: 'a2b52844-f284-4114-8a4d-61204b18b498',
    name: 'Mono Pools',
    compareFile: 'gsc-mono-pools-6mo-compare.png',
    threeMoFile: 'gsc-mono-pools-3mo.png',
    galleryKey: '967d53e4346c',
  },
  {
    slug: 'efedra-clinic',
    docId: 'lOTgaDd8FU4wgJ8F4K9w0O',
    name: 'Efedra',
    compareFile: 'gsc-efedra-clinic-6mo-compare.jpg',
    threeMoFile: 'gsc-efedra-clinic-3mo.png',
    galleryKey: 'secc',
    withCaptions: true,
  },
  {
    slug: 'boulevard-salon',
    docId: '6tWqPRZWZzG4Lv3HK7J6Xx',
    name: 'Boulevard Salon',
    compareFile: 'gsc-boulevard-salon-6mo-compare.png',
    threeMoFile: 'gsc-boulevard-salon-3mo.jpg',
    galleryKey: '98cba349abf6',
  },
]

const RENOVATION_PAGE_ID = 'lOTgaDd8FU4wgJ8F4KCHn9'
const RENOVATION_BLOCK_KEY = '389496107e89'

function compareAlt(name: string) {
  return {
    _type: 'localizedString',
    uk: `Звіт Google Search Console для сайту ${name}: порівняння продуктивності за два піврічні періоди`,
    en: `Google Search Console report for the ${name} website: six-month performance comparison`,
  }
}

function threeMoAlt(name: string) {
  return {
    _type: 'localizedString',
    uk: `Продуктивність сайту ${name} у Google Search Console за останні 3 місяці`,
    en: `Google Search Console performance for the ${name} website over the last 3 months`,
  }
}

function galleryItem(
  key: string,
  assetId: string,
  alt: ReturnType<typeof compareAlt>,
  withCaption: boolean,
) {
  return {
    _key: key,
    _type: 'mediaGalleryImageItem',
    image: {_type: 'image', asset: {_type: 'reference', _ref: assetId}},
    alt,
    fit: 'contain',
    displayMode: 'general',
    objectPosition: 'center',
    ...(withCaption
      ? {caption: {_type: 'localizedString', uk: 'Google Search Console', en: 'Google Search Console'}}
      : {}),
  }
}

async function uploadOrReuse(filename: string): Promise<string> {
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $f][0]._id`,
    {f: filename},
  )
  if (existing) {
    console.log(`  asset exists, reusing: ${filename} → ${existing}`)
    return existing
  }
  if (!APPLY) {
    console.log(`  [dry-run] would upload ${filename}`)
    return `dryrun-${filename}`
  }
  const asset = await client.assets.upload('image', createReadStream(join(IMG_DIR, filename)), {
    filename,
  })
  console.log(`  uploaded ${filename} → ${asset._id}`)
  return asset._id
}

async function main() {
  for (const c of CLIENTS) {
    if (!existsSync(join(IMG_DIR, c.compareFile)) || !existsSync(join(IMG_DIR, c.threeMoFile))) {
      throw new Error(`missing source image(s) for ${c.slug}`)
    }
  }

  // ── backups ────────────────────────────────────────────────────────────
  mkdirSync(BACKUP_DIR, {recursive: true})
  const backupIds = [...CLIENTS.map((c) => c.docId), RENOVATION_PAGE_ID]
  for (const id of backupIds) {
    const doc = await client.getDocument(id)
    if (!doc) throw new Error(`backup fetch failed for ${id}`)
    writeFileSync(join(BACKUP_DIR, `${id}.json`), JSON.stringify(doc, null, 2))
  }
  console.log(`backed up ${backupIds.length} docs → ${BACKUP_DIR}\n`)

  for (const c of CLIENTS) {
    console.log(`── ${c.slug} ──`)
    const compareId = await uploadOrReuse(c.compareFile)
    const threeMoId = await uploadOrReuse(c.threeMoFile)

    const doc = await client.getDocument<{sections?: {_key: string; _type: string}[]}>(c.docId)
    if (!doc?.sections) throw new Error(`doc ${c.docId} has no sections`)
    const keys = doc.sections.map((s) => s._key)

    // NOTE: a Sanity patch carries at most ONE `insert` operation (later
    // insert() calls overwrite earlier ones), so the block insert and the
    // gallery-items insert are committed as separate patches.
    const blockPatch = client.patch(c.docId)
    let blockOps = 0

    // main block image
    if (c.existingBlockKey) {
      const base = `sections[_key=="${c.existingBlockKey}"]`
      blockPatch.set({
        [`${base}.image.image.asset._ref`]: compareId,
        [`${base}.imageFit`]: 'natural',
      })
      blockOps++
      console.log(`  swap block ${c.existingBlockKey} image → ${c.compareFile}, imageFit=natural`)
    } else if (!keys.includes(BLOCK_KEY)) {
      const block = {
        _key: BLOCK_KEY,
        _type: 'imageTextBlock',
        variant: 'side',
        imageVariant: 'imageLeft',
        imageFit: 'natural',
        bulletIcon: 'check',
        heading: {
          _type: 'localizedText',
          uk: 'Як сайт почав *рости в Google*',
          en: 'How the site began to *grow on Google*',
        },
        image: {
          _type: 'imageWithLocalizedAlt',
          alt: compareAlt(c.name),
          image: {_type: 'image', asset: {_type: 'reference', _ref: compareId}},
        },
      }
      blockPatch.insert('before', `sections[_key=="${c.galleryKey}"]`, [block])
      blockOps++
      console.log(`  insert "${BLOCK_KEY}" block before gallery ${c.galleryKey} (${c.compareFile})`)
    } else {
      console.log(`  block "${BLOCK_KEY}" already present — skipping insert`)
    }

    if (APPLY && blockOps) {
      await blockPatch.commit()
      console.log(`  committed block patch`)
    }

    // gallery items
    const gallery = doc.sections.find((s) => s._key === c.galleryKey) as
      | {images?: {_key: string}[]}
      | undefined
    if (!gallery) throw new Error(`gallery ${c.galleryKey} not found in ${c.slug}`)
    const itemKeys = (gallery.images ?? []).map((i) => i._key)
    const newItems = [
      !itemKeys.includes(GALLERY_COMPARE_KEY)
        ? galleryItem(GALLERY_COMPARE_KEY, compareId, compareAlt(c.name), Boolean(c.withCaptions))
        : null,
      !itemKeys.includes(GALLERY_3MO_KEY)
        ? galleryItem(GALLERY_3MO_KEY, threeMoId, threeMoAlt(c.name), Boolean(c.withCaptions))
        : null,
    ].filter(Boolean)
    if (newItems.length) {
      if (APPLY) {
        await client
          .patch(c.docId)
          .insert('after', `sections[_key=="${c.galleryKey}"].images[-1]`, newItems as object[])
          .commit()
        console.log(`  appended ${newItems.length} gallery item(s) — committed`)
      } else {
        console.log(`  [dry-run] would append ${newItems.length} gallery item(s)`)
      }
    } else {
      console.log(`  gallery items already present — skipping`)
    }

    if (!APPLY && blockOps) {
      console.log(`  [dry-run] block patch (${blockOps} op(s)) NOT committed`)
    }
    console.log('')
  }

  // ── renovation industry page: swap the shared nbyg GSC asset ──────────
  console.log(`── industryPage renovation ──`)
  const nbygCompareId = await uploadOrReuse(CLIENTS[0].compareFile)
  const base = `sections[_key=="${RENOVATION_BLOCK_KEY}"]`
  if (!APPLY) {
    console.log(`  [dry-run] would swap ${RENOVATION_BLOCK_KEY} image → ${CLIENTS[0].compareFile}, imageFit=natural`)
  } else {
    await client
      .patch(RENOVATION_PAGE_ID)
      .set({
        [`${base}.image.image.asset._ref`]: nbygCompareId,
        [`${base}.imageFit`]: 'natural',
      })
      .commit()
    console.log(`  swapped ${RENOVATION_BLOCK_KEY} image → ${CLIENTS[0].compareFile}, imageFit=natural`)
  }

  console.log(`\n${APPLY ? 'DONE' : 'DRY RUN complete — rerun with `-- --apply` to write'}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
