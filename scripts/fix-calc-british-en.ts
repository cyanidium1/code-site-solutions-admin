/**
 * British-EN fix for calculatorConfig: "catalog" -> "catalogue" in en hints.
 * Dry-run:  npx sanity exec scripts/fix-calc-british-en.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-calc-british-en.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const c = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Row = {hint?: {en?: string; uk?: string; ru?: string}} & Record<string, unknown>

function fixEn(rows: Row[] | undefined): {rows: Row[]; changed: string[]} {
  const changed: string[] = []
  const out = (rows ?? []).map((r) => {
    const en = r.hint?.en
    if (en && /catalog(?!ue)/.test(en)) {
      changed.push(((r.optionKey as string) || (r.projectKey as string)) + ': ' + en)
      return {...r, hint: {...r.hint, en: en.replace(/catalog(?!ue)/g, 'catalogue')}}
    }
    return r
  })
  return {rows: out, changed}
}

async function main() {
  const doc = await c.fetch<{projectTypes?: Row[]; productComplexity?: Row[]}>(
    `*[_id=="calculatorConfig"][0]{projectTypes, productComplexity}`,
  )
  const pt = fixEn(doc.projectTypes)
  const pc = fixEn(doc.productComplexity)
  const all = [...pt.changed, ...pc.changed]
  console.log('Will fix %d en hint(s):', all.length)
  all.forEach((s) => console.log('  - ' + s))
  if (!APPLY) {
    console.log('\nRe-run with `-- --apply` to write.')
    return
  }
  await c
    .patch('calculatorConfig')
    .set({projectTypes: pt.rows, productComplexity: pc.rows})
    .commit()
  console.log('✓ Applied.')
}
main().catch((e) => {console.error(e); process.exit(1)})
