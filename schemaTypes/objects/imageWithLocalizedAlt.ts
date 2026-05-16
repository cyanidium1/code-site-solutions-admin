import {defineField, defineType} from 'sanity'

import type {LocalizedStringValue} from '../lib/localized'

/**
 * Перевіряє, що alt.uk заповнено ТІЛЬКИ якщо завантажено зображення.
 * Поки що — warning (не error), щоб існуючі документи без alt не блокували публікацію.
 * План: підвищити до error після ручного аудиту даних. Див. docs/SANITY_CLEANUP_PLAN.md.
 */
export const imageWithLocalizedAlt = defineType({
  name: 'imageWithLocalizedAlt',
  title: 'Зображення з alt (мультимовне)',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Зображення',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'alt',
      title: 'Alt-текст',
      type: 'localizedString',
      validation: (rule) =>
        rule
          .custom((alt: LocalizedStringValue | undefined, ctx) => {
            const parent = ctx.parent as {image?: {asset?: unknown}} | undefined
            const hasImage = Boolean(parent?.image?.asset)
            if (!hasImage) return true
            const uk = (alt?.uk ?? '').trim()
            return Boolean(uk) || 'Заповніть alt UK для accessibility / SEO'
          })
          .warning(),
    }),
  ],
  preview: {
    select: {media: 'image'},
    prepare({media}) {
      return {title: 'Зображення', media}
    },
  },
})
