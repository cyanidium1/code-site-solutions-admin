import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import type {LocalizedStringValue} from '../lib/localized'

export const mediaGalleryImageItem = defineType({
  name: 'mediaGalleryImageItem',
  title: 'Елемент галереї',
  type: 'object',
  fields: [
    defineField({name: 'image', title: 'Зображення', type: 'image', options: {hotspot: true}}),
    defineField({name: 'caption', title: 'Підпис', type: 'localizedString'}),
    defineField({
      name: 'alt',
      title: 'Alt',
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
    defineField({
      name: 'displayMode',
      title: 'Режим показу',
      type: 'string',
      options: {
        list: [
          {title: 'Desktop / скріншот', value: 'desktopScreenshot'},
          {title: 'Mobile', value: 'mobileScreenshot'},
          {title: 'Адмінпанель', value: 'adminPanel'},
          {title: 'Загальне', value: 'general'},
        ],
        layout: 'radio',
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'objectPosition',
      title: 'Позиція об’єкта',
      type: 'string',
      options: {
        list: [
          {title: 'Верх', value: 'top'},
          {title: 'Центр', value: 'center'},
          {title: 'Низ', value: 'bottom'},
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    }),
  ],
  preview: {
    select: {media: 'image', caption: 'caption'},
    prepare({media, caption}) {
      return {
        title: pickLocalizedFirst(caption) || 'Зображення',
        subtitle: 'Галерея',
        media,
      }
    },
  },
})
