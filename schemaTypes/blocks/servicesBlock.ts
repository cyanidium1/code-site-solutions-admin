import {ComposeSparklesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {sectionHeaderFields} from '../lib/sectionHeader'

export const servicesBlock = defineType({
  name: 'servicesBlock',
  title: 'Послуги / фічі',
  type: 'object',
  icon: ComposeSparklesIcon,
  fields: [
    ...sectionHeaderFields({
      headingTitle: 'Заголовок (services)',
      sub: true,
      subTitle: 'Підзаголовок (services)',
    }),

    defineField({
      name: 'testimonialEyebrow',
      title: 'Testimonial — Eyebrow (напр. «ВІДГУК КЛІЄНТА»)',
      type: 'localizedString',
    }),
    defineField({
      name: 'testimonial',
      title: 'Тестимоніал секції (опціонально)',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({name: 'quote', title: 'Цитата', type: 'localizedText'}),
        defineField({
          name: 'visual',
          title: 'Зображення секції (велике, поряд із цитатою)',
          description: 'Якщо завантажено — показується велике зображення зліва від відгуку.',
          type: 'imageWithLocalizedAlt',
        }),
        defineField({name: 'authorName', title: "Ім'я автора", type: 'string'}),
        defineField({name: 'authorInitials', title: 'Ініціали (для аватара)', type: 'string'}),
        defineField({name: 'authorRole', title: 'Роль', type: 'localizedString'}),
        defineField({
          name: 'authorAvatar',
          title: 'Аватар',
          type: 'image',
          options: {hotspot: true},
          description: 'Alt-текст не потрібен: фронтенд підставляє імʼя автора як alt.',
        }),
        defineField({
          name: 'rating',
          title: 'Оцінка (1–5)',
          type: 'number',
          description: 'schema.org Review.reviewRating. Без значення — Review не публікується.',
          validation: (rule) => rule.integer().min(1).max(5),
        }),
        defineField({
          name: 'reviewDate',
          title: 'Дата відгуку',
          type: 'date',
          description: 'schema.org Review.datePublished.',
        }),
        defineField({
          name: 'reviewHeadline',
          title: 'Заголовок відгуку',
          type: 'localizedString',
          description: 'Опціональний короткий підсумок — Review.name у JSON-LD.',
        }),
      ],
    }),
    defineField({
      name: 'features',
      title: 'Фічі',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceFeature',
          title: 'Фіча',
          fields: [
            defineField({name: 'title', title: 'Заголовок', type: 'localizedString'}),
            defineField({
              name: 'image',
              title: 'Фонове зображення / іконка',
              type: 'imageWithLocalizedAlt',
            }),
            defineField({
              name: 'items',
              title: 'Пункти',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
            }),
          ],
          preview: {
            select: {title: 'title', media: 'image.image'},
            prepare({title, media}) {
              return {
                title: pickLocalizedFirst(title) || 'Фіча',
                subtitle: 'service feature',
                media,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'integrationsHeading',
      title: 'Заголовок інтеграцій',
      type: 'localizedText',
    }),
    defineField({
      name: 'integrationsSub',
      title: 'Підзаголовок інтеграцій',
      type: 'localizedText',
    }),
    defineField({
      name: 'integrations',
      title: 'Інтеграції (логотипи / назви)',
      type: 'array',
      of: [defineArrayMember({type: 'localizedString'})],
    }),
  ],
  preview: {
    select: {features: 'features'},
    prepare({features}) {
      const count = Array.isArray(features) ? features.length : 0
      return {
        title: 'Services',
        subtitle: `Services · ${count} feature(s)`,
      }
    },
  },
})
