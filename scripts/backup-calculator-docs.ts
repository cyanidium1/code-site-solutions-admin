/**
 * Back up the 13 live calculator singleton documents to local JSON
 * before consolidating them into the `calculatorConfig` singleton.
 *
 * Local-only (backups/ is gitignored). Uses the Sanity CLI user session
 * (no API token needed).
 *
 * Run:  npx sanity exec scripts/backup-calculator-docs.ts --with-user-token
 */
import {writeFileSync, mkdirSync} from 'node:fs'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})

const IDS = [
  'calculatorProjectTypes', 'calculatorPresets', 'calculatorCmsOptions', 'calculatorSeoOptions',
  'calculatorFeatureOptions', 'calculatorLanguageOptions', 'calculatorDesignOptions',
  'calculatorTimelineOptions', 'calculatorMaintenanceOptions', 'calculatorSeoGrowthOptions',
  'calculatorContentOptions', 'calculatorProductComplexityOptions', 'calculatorSettings',
]

async function main() {
  const docs = await client.fetch<{_id: string}[]>(`*[_id in $ids]`, {ids: IDS})
  mkdirSync('backups/calculator-pre-singleton', {recursive: true})
  const out = 'backups/calculator-pre-singleton/docs.json'
  writeFileSync(out, JSON.stringify(docs, null, 2))
  console.log(`→ Backed up ${docs.length}/${IDS.length} calculator docs to ${out}`)
  const found = new Set(docs.map((d) => d._id))
  const missing = IDS.filter((id) => !found.has(id))
  if (missing.length) console.warn(`! Not found (ok if never seeded): ${missing.join(', ')}`)
}

main().catch((e) => {console.error(e); process.exit(1)})
