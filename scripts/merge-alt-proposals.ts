/**
 * Merges reviewed proposals from scripts/alt-proposals/batch-*.json into
 * scripts/alt-worklist.json (fills the empty `proposed` fields).
 * Plain node script — run with: node --import tsx scripts/merge-alt-proposals.ts
 * (or npx tsx scripts/merge-alt-proposals.ts)
 */
import {readFileSync, writeFileSync, readdirSync} from 'node:fs'

const wl = JSON.parse(readFileSync('scripts/alt-worklist.json', 'utf8'))
const byKey = new Map<string, any>(wl.entries.map((e: any) => [`${e.docId}|${e.patchPath}`, e]))
let merged = 0
const files = readdirSync('scripts/alt-proposals').filter((f) => /^batch-\d+\.json$/.test(f))
for (const f of files) {
  for (const p of JSON.parse(readFileSync(`scripts/alt-proposals/${f}`, 'utf8'))) {
    const e = byKey.get(`${p.docId}|${p.patchPath}`)
    if (!e) throw new Error(`orphan proposal ${f}: ${p.patchPath}`)
    e.proposed = {uk: p.proposed.uk, en: p.proposed.en}
    merged++
  }
}
writeFileSync('scripts/alt-worklist.json', JSON.stringify(wl, null, 2))
console.log(`merged ${merged} proposals from ${files.length} files`)
