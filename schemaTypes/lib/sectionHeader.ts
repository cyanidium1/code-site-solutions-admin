import {defineField} from 'sanity'

/**
 * Shared section-header fields (eyebrow / heading / sub).
 *
 * Spread into a block's `fields` array so every section that shows a header
 * uses the same field names and types — the schema-side equivalent of a shared
 * <SectionHeader> component. Pass flags to include only the parts a given block
 * actually renders (keeps dead fields out of the editor), and override the
 * heading/sub titles where a block needs a more specific label.
 *
 *   fields: [
 *     ...sectionHeaderFields({headingTitle: 'Заголовок таблиці', sub: true}),
 *     // block-specific fields…
 *   ]
 *
 * Field names/types are unchanged from the previous per-block definitions, so
 * the stored document shape stays flat — no content migration required.
 */
export function sectionHeaderFields(
  opts: {
    eyebrow?: boolean
    heading?: boolean
    sub?: boolean
    eyebrowTitle?: string
    headingTitle?: string
    subTitle?: string
  } = {},
) {
  const {
    eyebrow = true,
    heading = true,
    sub = false,
    eyebrowTitle = 'Eyebrow',
    headingTitle = 'Заголовок',
    subTitle = 'Підзаголовок',
  } = opts
  const fields = []
  if (eyebrow) {
    fields.push(defineField({name: 'eyebrow', title: eyebrowTitle, type: 'localizedString'}))
  }
  if (heading) {
    fields.push(defineField({name: 'heading', title: headingTitle, type: 'localizedText'}))
  }
  if (sub) {
    fields.push(defineField({name: 'sub', title: subTitle, type: 'localizedText'}))
  }
  return fields
}
