import {ImagesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const imageTextBlock = defineType({
  name: 'imageTextBlock',
  title: 'Зображення + текст',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'variant',
      title: 'Варіант',
      type: 'string',
      options: {
        list: [
          {title: 'Side (текст збоку)', value: 'side'},
          {title: 'Side з bullet-списком', value: 'side-with-list'},
          {title: 'Centered', value: 'centered'},
        ],
        layout: 'radio',
      },
      initialValue: 'side',
    }),
    defineField({
      name: 'imageVariant',
      title: 'Позиція зображення',
      type: 'string',
      options: {
        list: [
          {title: 'Зліва', value: 'imageLeft'},
          {title: 'Справа', value: 'imageRight'},
        ],
        layout: 'radio',
      },
      initialValue: 'imageRight',
    }),
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'localizedText'}),
    defineField({name: 'body', title: 'Опис (UK)', type: 'richTextSimple'}),
    defineField({name: 'bodyEn', title: 'Description (EN)', type: 'richTextSimple'}),
    defineField({
      name: 'bulletList',
      title: 'Bullet-список (для варіанта side-with-list)',
      type: 'array',
      of: [defineArrayMember({type: 'localizedString'})],
    }),
    defineField({name: 'image', title: 'Зображення', type: 'imageWithLocalizedAlt'}),
    defineField({name: 'cta', title: 'CTA (опційно)', type: 'ctaAction'}),
  ],
  preview: {
    select: {
      heading: 'heading',
      media: 'image.image',
      variant: 'variant',
    },
    prepare({heading, media, variant}) {
      return {
        title: pickLocalizedFirst(heading) || 'Image + Text',
        subtitle: ['Image+Text', variant].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
