/**
 * Upload local image files to the Sanity media library, preserving which
 * project each image belongs to via a filename prefix.
 *
 * Layout: drop images into per-project subfolders under assets/, e.g.
 *
 *   assets/
 *     co2/MacBook Air (2022).png
 *     urmodel/iPhone 15.png
 *     loose-file.png            ← files directly in assets/ are allowed too
 *
 * Each image is uploaded with its filename prefixed by the subfolder name
 * (e.g. "co2 — MacBook Air (2022).png") so it stays findable in
 * Studio → Media. Files directly under assets/ keep their bare name.
 *
 * Dry run by default — prints what WOULD upload. Pass --apply to upload for
 * real, write a manifest to backups/, and delete the local source files.
 *
 *   # preview
 *   npx sanity exec scripts/upload-assets-to-sanity.ts --with-user-token
 *   # upload + delete sources
 *   npx sanity exec scripts/upload-assets-to-sanity.ts --with-user-token -- --apply
 */

import {createReadStream, readdirSync, statSync, unlinkSync, writeFileSync} from 'node:fs'
import {basename, join, relative} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const ASSETS_DIR = join(process.cwd(), 'assets')
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i
const APPLY = process.argv.includes('--apply')

type Pending = {
  /** Absolute path on disk. */
  path: string
  /** Subfolder name (project), or '' for files directly under assets/. */
  project: string
  /** Original on-disk filename. */
  filename: string
  /** Filename used for the upload (prefixed with project). */
  uploadName: string
}

type UploadResult = Pending & {
  assetId: string
  url: string
}

/** Recursively collect image files under assets/, one level of subfolder = project. */
function collect(dir: string): Pending[] {
  const out: Pending[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...collect(full))
      continue
    }
    if (!IMAGE_EXT.test(entry)) continue
    const rel = relative(ASSETS_DIR, full)
    const parts = rel.split(/[\\/]/)
    const project = parts.length > 1 ? parts[0] : ''
    const filename = basename(full)
    const uploadName = project ? `${project} — ${filename}` : filename
    out.push({path: full, project, filename, uploadName})
  }
  return out
}

async function main() {
  const pending = collect(ASSETS_DIR).sort((a, b) => a.uploadName.localeCompare(b.uploadName))

  if (pending.length === 0) {
    console.log('✓ No image files found under assets/')
    return
  }

  console.log(
    `${APPLY ? '→ Uploading' : '→ [dry run] Would upload'} ${pending.length} file(s) to Sanity media library\n`,
  )

  if (!APPLY) {
    for (const p of pending) {
      console.log(`  • ${p.uploadName}`)
    }
    console.log('\nRe-run with -- --apply to upload and delete the local sources.')
    return
  }

  const results: UploadResult[] = []

  for (const p of pending) {
    const asset = await client.assets.upload('image', createReadStream(p.path), {
      filename: p.uploadName,
    })
    results.push({...p, assetId: asset._id, url: asset.url})
    console.log(`  ✓ ${p.uploadName}`)
    console.log(`    ${asset._id}`)
    console.log(`    ${asset.url}\n`)
  }

  const manifestPath = join(
    process.cwd(),
    'backups',
    `uploaded-assets-${new Date().toISOString().slice(0, 10)}.json`,
  )
  writeFileSync(
    manifestPath,
    JSON.stringify(
      results.map(({project, filename, uploadName, assetId, url}) => ({
        project,
        filename,
        uploadName,
        assetId,
        url,
      })),
      null,
      2,
    ) + '\n',
    'utf8',
  )
  console.log(`→ Manifest: ${manifestPath}\n`)

  for (const {path, uploadName} of results) {
    unlinkSync(path)
    console.log(`  ✓ deleted ${relative(process.cwd(), path)} (${uploadName})`)
  }

  console.log('\n✓ Upload complete. Files are in Sanity Studio → Media.')
}

main().catch((err) => {
  console.error('✗ Failed:', err)
  process.exit(1)
})
