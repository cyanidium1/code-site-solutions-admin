/**
 * Cleanup: delete the 13 legacy v2 calculator singleton documents, now that the
 * frontend reads the consolidated `calculatorConfig`. Also scrubs the orphaned
 * `previews` data left on calculatorConfig.design rows (the previews feature was
 * removed). Idempotent.
 *
 * A pre-migration backup of the 13 docs lives in
 * backups/calculator-pre-singleton/docs.json (restore with createOrReplace).
 *
 * Dry-run:  npx sanity exec scripts/cleanup-calculator-legacy.ts --with-user-token
 * Apply:    npx sanity exec scripts/cleanup-calculator-legacy.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const c = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const LEGACY_IDS = [
  'calculatorProjectTypes', 'calculatorPresets', 'calculatorCmsOptions', 'calculatorSeoOptions',
  'calculatorFeatureOptions', 'calculatorLanguageOptions', 'calculatorDesignOptions',
  'calculatorTimelineOptions', 'calculatorMaintenanceOptions', 'calculatorSeoGrowthOptions',
  'calculatorContentOptions', 'calculatorProductComplexityOptions', 'calculatorSettings',
]

async function main() {
  const allIds = [...LEGACY_IDS, ...LEGACY_IDS.map((id) => `drafts.${id}`)]
  const existing = await c.fetch<string[]>(`*[_id in $ids]._id`, {ids: allIds})

  // Scrub orphaned previews from the singleton's design rows.
  const cfg = await c.fetch<{design?: {previews?: unknown}[]}>(
    `*[_id=="calculatorConfig"][0]{design}`,
  )
  const designHasPreviews = (cfg?.design ?? []).some((d) => d && 'previews' in d)

  console.log('Legacy docs to delete (%d):', existing.length)
  existing.forEach((id) => console.log('  - ' + id))
  console.log('Scrub previews from calculatorConfig.design:', designHasPreviews)

  if (!APPLY) {
    console.log('\nRe-run with `-- --apply` to write.')
    return
  }

  if (existing.length) {
    const tx = c.transaction()
    for (const id of existing) tx.delete(id)
    await tx.commit()
    console.log('✓ Deleted %d legacy docs.', existing.length)
  } else {
    console.log('→ No legacy docs found (already clean).')
  }

  if (designHasPreviews) {
    const design = (cfg.design ?? []).map((d) => {
      const {previews: _drop, ...rest} = d as Record<string, unknown>
      return rest
    })
    await c.patch('calculatorConfig').set({design}).commit()
    console.log('✓ Scrubbed previews from calculatorConfig.design.')
  }
}

main().catch((e) => {console.error(e); process.exit(1)})
