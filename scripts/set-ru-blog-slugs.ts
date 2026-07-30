/**
 * One-shot: sets slugs.ru for the blog posts (distinct RU URLs per locale).
 * Run: npx sanity exec scripts/set-ru-blog-slugs.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

const SLUGS: Record<string, string> = {
  // uk slug -> ru slug
  'yak-pratsyuye-admin-panel-saytu': 'kak-rabotaet-admin-panel-sayta',
  // /ru prefix already separates the URL space — identical slug is fine
  // when the RU transliteration matches the UA one.
  'tilda-vs-kastomnyy-sayt-2026': 'tilda-vs-kastomnyy-sayt-2026',
  'vartist-rozrobky-saytu-2026': 'skolko-stoit-sayt-2026',
  'nextjs-proty-wordpress-ta-konstruktoriv': 'nextjs-protiv-wordpress-i-konstruktorov',
}

async function main() {
  const posts = await client.fetch<Array<{_id: string; uk: string; ru?: string}>>(
    `*[_type == "blogPost"]{_id, "uk": slugs.uk.current, "ru": slugs.ru.current}`,
  )
  const tx = client.transaction()
  let n = 0
  for (const p of posts) {
    if (p.ru) continue
    const ru = SLUGS[p.uk]
    if (!ru) {
      console.warn(`no ru slug mapped for ${p.uk}`)
      continue
    }
    console.log(`${p._id}: slugs.ru = ${ru}`)
    tx.patch(p._id, (x) => x.setIfMissing({'slugs.ru': {_type: 'slug', current: ru}}))
    n++
  }
  if (!n) return console.log('nothing to set')
  await tx.commit()
  console.log(`set ${n} ru slugs`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
