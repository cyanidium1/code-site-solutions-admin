/**
 * Cleanup v1: deletes the 59 v1 calculator documents.
 *
 * Safe to run AFTER the FE has cut over to the v2 schemas (L2).
 * Idempotent: re-running after a successful run is a no-op.
 *
 * Run:  npm run cleanup:calculator-v1
 */
import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {createClient} from '@sanity/client'

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename)
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
loadEnvFile('.env.local')
loadEnvFile('.env')

const V1_TYPES = ['calculatorProjectType', 'calculatorOption', 'calculatorPreset'] as const

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01'
  const token = process.env.SANITY_API_TOKEN
  if (!projectId) {console.error('✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1)}
  if (!token) {console.error('✗ Missing SANITY_API_TOKEN'); process.exit(1)}

  const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})

  // Fetch IDs of v1 docs (both published + drafts).
  const ids = await client.fetch<string[]>(
    `*[_type in $types]._id`,
    {types: V1_TYPES.slice()},
  )

  if (!ids.length) {
    console.log('→ Nothing to clean up (no v1 docs found).')
    return
  }

  console.log(`→ Deleting ${ids.length} v1 calculator docs from ${projectId}/${dataset}`)

  const tx = client.transaction()
  for (const id of ids) tx.delete(id)
  try {
    await tx.commit()
    console.log(`  ✓ Deleted ${ids.length} docs`)
  } catch (err) {
    console.error('  ✗ Transaction failed:', err)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('✗ Fatal:', err)
  process.exit(1)
})
