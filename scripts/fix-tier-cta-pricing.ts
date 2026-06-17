/**
 * Industry pages: drop the "/pricing" mention from comparisonBlock tier CTAs.
 * Replaces any tier ctaLabel whose uk OR en text contains "/pricing" with the
 * plain { uk: "Детальніше", en: "More details" }. Pages that use real labels
 * (e.g. "Choose Starter") are untouched because they don't match "/pricing".
 *
 * Dry-run (prints planned patches, writes nothing):
 *   npx sanity exec scripts/fix-tier-cta-pricing.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/fix-tier-cta-pricing.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const NEW_LABEL = {uk: 'Детальніше', en: 'More details'}

function mentionsPricing(label: any): boolean {
  if (!label) return false
  return ['uk', 'en', 'ru'].some(
    (k) => typeof label[k] === 'string' && label[k].includes('/pricing'),
  )
}

async function main() {
  const pages: Array<{_id: string; slug: string; sections: any[]}> =
    await client.fetch(
      `*[_type == "industryPage" && defined(slug.current)]{
        _id, "slug": slug.current, sections
      }`,
    )

  type Patch = {id: string; slug: string; path: string; before: any}
  const patches: Patch[] = []

  for (const page of pages) {
    const sections = page.sections ?? []
    sections.forEach((section: any, si: number) => {
      if (section?._type !== 'comparisonBlock' || !Array.isArray(section.tiers))
        return
      section.tiers.forEach((tier: any, ti: number) => {
        if (!mentionsPricing(tier?.ctaLabel)) return
        const tierKey = tier?._key
        const sectionKey = section?._key
        // Prefer _key-based paths (stable); fall back to positional indexes.
        const path =
          sectionKey && tierKey
            ? `sections[_key=="${sectionKey}"].tiers[_key=="${tierKey}"].ctaLabel`
            : `sections[${si}].tiers[${ti}].ctaLabel`
        patches.push({id: page._id, slug: page.slug, path, before: tier.ctaLabel})
      })
    })
  }

  for (const p of patches) {
    console.log(
      `${p.slug}  ${p.path}\n  - ${JSON.stringify(p.before)}\n  + ${JSON.stringify(NEW_LABEL)}`,
    )
  }

  if (APPLY) {
    for (const p of patches) {
      await client
        .patch(p.id)
        .set({[p.path]: {_type: 'localizedString', ...NEW_LABEL}})
        .commit()
      console.log(`    ✓ applied ${p.slug} ${p.path}`)
    }
    console.log(`\nApplied ${patches.length} ctaLabel(s).`)
  } else {
    console.log(`\nWould patch ${patches.length} ctaLabel(s).`)
    console.log('Re-run with -- --apply to write.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
