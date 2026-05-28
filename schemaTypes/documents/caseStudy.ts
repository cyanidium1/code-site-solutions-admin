import {DocumentsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import type {LocalizedStringValue} from '../lib/localized'
import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

type CaseStudyDoc = {
  status?: 'draft' | 'published'
  seo?: {
    title?: LocalizedStringValue
    description?: LocalizedStringValue
  }
}

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    {name: 'basic', title: 'Основне', default: true},
    {name: 'meta', title: 'Метадані'},
    {name: 'seo', title: 'SEO'},
    {name: 'hero', title: 'Hero'},
    {name: 'sections', title: 'Секції'},
    {name: 'related', title: 'Звʼязки'},
    {name: 'settings', title: 'Налаштування'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Назва кейсу',
      type: 'localizedString',
      group: 'basic',
      validation: (rule) => requireLocalizedUk('Назва UK обовʼязкова')(rule),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: {
        source: (doc) => pickLocalizedFirst(doc?.title),
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Статус',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          {title: 'Чернетка', value: 'draft'},
          {title: 'Опубліковано', value: 'published'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Обкладинка',
      type: 'imageWithLocalizedAlt',
      group: 'basic',
    }),

    defineField({name: 'client', title: 'Клієнт', type: 'string', group: 'meta'}),
    defineField({
      name: 'industry',
      title: 'Галузь',
      type: 'reference',
      to: [{type: 'industryPage'}],
      group: 'meta',
    }),
    defineField({
      name: 'region',
      title: 'Регіон',
      type: 'localizedString',
      group: 'meta',
    }),
    defineField({
      name: 'year',
      title: 'Рік',
      type: 'number',
      group: 'meta',
      validation: (rule) => rule.integer().min(1990).max(2100).warning('Перевірте рік'),
    }),
    defineField({name: 'date', title: 'Дата', type: 'date', group: 'meta'}),
    defineField({
      name: 'duration',
      title: 'Тривалість',
      type: 'localizedString',
      group: 'meta',
    }),
    defineField({name: 'budget', title: 'Бюджет (display)', type: 'string', group: 'meta'}),
    defineField({
      name: 'stack',
      title: 'Стек',
      type: 'array',
      group: 'meta',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'metricsLine',
      title: 'Рядок метрик (для карток у /portfolio)',
      description: 'Коротка лінія результатів через · — наприклад «×8 inquiries · LCP 0.8s · Top-1 local»',
      type: 'localizedString',
      group: 'meta',
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID (опційно)',
      description:
        'ID відео-walkthrough — рендериться окремою секцією над OUTCOME-блоком (поверх центрованого горизонтального layout-у з двома зображеннями). Залишити порожнім якщо немає.',
      type: 'string',
      group: 'meta',
    }),

    defineField({name: 'seo', title: 'SEO', type: 'seoFields', group: 'seo'}),

    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      options: {collapsible: true},
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
        defineField({name: 'heading', title: 'Заголовок', type: 'localizedText'}),
        defineField({name: 'subheading', title: 'Підзаголовок', type: 'localizedText'}),
        defineField({
          name: 'link',
          title: 'Кнопка — посилання на сайт кейсу',
          description:
            'Опційна кнопка в hero, що веде на живий сайт клієнта. Відкривається в новій вкладці (rel: noopener noreferrer nofollow). Залишити порожнім — кнопка не показується.',
          type: 'ctaAction',
        }),
        defineField({
          name: 'heroImage',
          title: 'Зображення hero (справа від тексту, над stats-bar)',
          description:
            'Окреме зображення для героя. Не плутати з coverImage — той рендериться лише на /portfolio і в related-картках.',
          type: 'imageWithLocalizedAlt',
        }),
        defineField({
          name: 'metrics',
          title: 'Показники',
          type: 'array',
          of: [defineArrayMember({type: 'metric'})],
        }),
      ],
    }),

    defineField({
      name: 'sections',
      title: 'Секції кейсу',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({type: 'imageTextBlock'}),
        defineArrayMember({type: 'statsBlock'}),
        defineArrayMember({type: 'quoteBlock'}),
        defineArrayMember({type: 'mediaGalleryBlock'}),
        defineArrayMember({type: 'beforeAfterBlock'}),
        defineArrayMember({type: 'testimonialBlock'}),
        defineArrayMember({type: 'ctaBlock'}),
        defineArrayMember({type: 'richTextBlock'}),
      ],
      options: {
        insertMenu: {
          views: [{name: 'list'}, {name: 'grid'}],
        },
      },
    }),

    defineField({
      name: 'relatedPosts',
      title: 'Повʼязані пости',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'blogPost'}]})],
    }),

    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      group: 'settings',
      initialValue: 0,
    }),
    defineField({
      name: 'featured',
      title: 'Рекомендований',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
    }),
  ],
  validation: (rule) =>
    rule.custom((doc) => {
      const c = doc as CaseStudyDoc | undefined
      if (c?.status !== 'published') return true
      const t = (c.seo?.title?.uk ?? '').trim()
      const d = (c.seo?.description?.uk ?? '').trim()
      if (!t || !d) {
        return 'Опубліковані кейси мають мати SEO title.uk і description.uk'
      }
      return true
    }).warning(),
  orderings: [
    {
      title: 'Featured, потім порядок',
      name: 'featuredOrder',
      by: [
        {field: 'featured', direction: 'desc'},
        {field: 'order', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', media: 'coverImage.image', status: 'status', client: 'client'},
    prepare({title, media, status, client}) {
      return {
        title: pickLocalizedFirst(title) || 'Case study',
        subtitle: [client, status === 'published' ? 'Опубліковано' : 'Чернетка'].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
