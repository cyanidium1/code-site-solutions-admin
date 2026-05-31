import {ImagesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const mediaGalleryBlock = defineType({
  name: 'mediaGalleryBlock',
  title: 'Галерея / скріншоти',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'title', title: 'Заголовок', type: 'localizedString'}),
    defineField({name: 'description', title: 'Опис', type: 'localizedText'}),
    defineField({
      name: 'images',
      title: 'Зображення',
      type: 'array',
      of: [defineArrayMember({type: 'mediaGalleryImageItem'})],
    }),
    defineField({
      name: 'enableLightbox',
      title: 'Увімкнути lightbox',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0.image',
    },
    prepare({title, media}) {
      const line = pickLocalizedFirst(title)
      return {
        title: line || 'Галерея',
        subtitle: `Галерея · ${line}` ,
        media,
      }
    },
  },
})
