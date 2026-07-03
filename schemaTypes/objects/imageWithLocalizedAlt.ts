import {defineField, defineType} from 'sanity'

import type {LocalizedStringValue} from '../lib/localized'

/**
 * alt.uk — error (блокує публікацію; дані бекфілнуто 2026-07),
 * alt.en — warning. Правила копірайтингу: docs/image-alt-styleguide.md
 * (workspace docs). Порожні слоти без зображень: docs/missing-images.md.
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
      validation: (rule) => [
        rule
          .custom((alt: LocalizedStringValue | undefined, ctx) => {
            const parent = ctx.parent as {image?: {asset?: unknown}} | undefined
            if (!parent?.image?.asset) return true
            return Boolean((alt?.uk ?? '').trim()) || 'Заповніть alt UK — обовʼязково для accessibility / SEO'
          })
          .error(),
        rule
          .custom((alt: LocalizedStringValue | undefined, ctx) => {
            const parent = ctx.parent as {image?: {asset?: unknown}} | undefined
            if (!parent?.image?.asset) return true
            return Boolean((alt?.en ?? '').trim()) || 'Заповніть alt EN — потрібен для /en сторінок'
          })
          .warning(),
      ],
    }),
  ],
  preview: {
    select: {media: 'image'},
    prepare({media}) {
      return {title: 'Зображення', media}
    },
  },
})
