/**
 * Builds scripts/alt-worklist.json: one entry per CMS image with a CDN URL
 * (so the writer can view it), current alt, patch path, and block context.
 * Excludes author avatars (name-as-alt convention).
 *
 * READ-ONLY: queries the dataset and writes the local JSON only — mutates nothing in Sanity.
 * Note: patchPaths fall back to numeric indices when array items lack `_key` (safe today —
 * all our arrays have keys — but reorder-sensitive).
 *
 * Run: npx sanity exec scripts/generate-alt-worklist.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'
import {writeFileSync} from 'node:fs'

const client = getCliClient({apiVersion: '2024-10-01'})
const {projectId, dataset} = client.config()

type Entry = {
  docId: string
  docType: string
  slug: string
  patchPath: string // JSONMatch path of the localizedString alt to set
  imageUrl: string | null
  status: 'missing' | 'partial' | 'review'
  current: {uk?: string; en?: string}
  context: Record<string, string>
  proposed: {uk: string; en: string}
}

function cdnUrl(ref: string): string | null {
  const m = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/)
  return m ? `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}?w=800` : null
}

function isImg(v: any): boolean {
  return Boolean(v && typeof v === 'object' && v.asset?._ref?.startsWith?.('image-'))
}

function uk(v: any): string {
  return typeof v === 'string' ? v : (v?.uk ?? '')
}

function walk(node: any, path: string, ctx: Record<string, string>, out: Omit<Entry, 'docId' | 'docType' | 'slug'>[]) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      const seg = item?._key ? `[_key=="${item._key}"]` : `[${i}]`
      walk(item, `${path}${seg}`, ctx, out)
    })
    return
  }
  const here = {...ctx}
  if (node._type) here.block = node._type
  for (const k of ['heading', 'title', 'feature', 'tagline', 'num', 'mockType', 'name', 'displayMode']) {
    const v = uk(node[k])
    if (v) here[k] = String(v)
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === '_type' || k === '_key') continue
    const p = path ? `${path}.${k}` : k
    if (isImg(v)) {
      if (k === 'authorAvatar' || /authorAvatar/.test(p)) continue // name-as-alt convention
      // wrapper alt sits beside the image field on THIS node
      const alt = node.alt && typeof node.alt === 'object' ? node.alt : {}
      const cur = {uk: (alt.uk ?? '').trim(), en: (alt.en ?? '').trim()}
      const status: Entry['status'] = cur.uk && cur.en ? 'review' : cur.uk || cur.en ? 'partial' : 'missing'
      out.push({
        patchPath: path ? `${path}.alt` : 'alt',
        imageUrl: cdnUrl((v as any).asset._ref),
        status,
        current: cur,
        context: here,
        proposed: {uk: '', en: ''},
      })
      continue
    }
    if (k !== 'alt') walk(v, p, here, out)
  }
}

function main() {
  return client
    .fetch<any[]>(
      `*[_type in ["caseStudy", "industryPage", "testimonial"]]{..., "slugStr": slug.current}`,
    )
    .then((docs) => {
      const entries: Entry[] = []
      for (const doc of docs) {
        const local: Omit<Entry, 'docId' | 'docType' | 'slug'>[] = []
        walk(doc, '', {doc: doc.slugStr ?? doc._id}, local)
        for (const e of local) entries.push({docId: doc._id, docType: doc._type, slug: doc.slugStr ?? '-', ...e})
      }
      entries.sort((a, b) => a.docType.localeCompare(b.docType) || a.slug.localeCompare(b.slug))
      const counts: Record<string, number> = {}
      for (const e of entries) counts[e.status] = (counts[e.status] ?? 0) + 1
      writeFileSync('scripts/alt-worklist.json', JSON.stringify({counts, entries}, null, 2))
      console.log(JSON.stringify({total: entries.length, counts}, null, 2))
    })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
