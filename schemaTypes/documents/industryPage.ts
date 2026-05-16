import {RocketIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import type {LocalizedStringValue} from '../lib/localized'
import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

type IndustryPageDoc = {
  status?: 'draft' | 'published'
  seo?: {
    title?: LocalizedStringValue
    description?: LocalizedStringValue
  }
}

export const industryPage = defineType({
  name: 'industryPage',
  title: 'Industry / Sites for',
  type: 'document',
  icon: RocketIcon,
  groups: [
    {name: 'basic', title: 'Основне', default: true},
    {name: 'seo', title: 'SEO'},
    {name: 'hero', title: 'Hero'},
    {name: 'sections', title: 'Секції'},
    {name: 'related', title: 'Звʼязки'},
    {name: 'settings', title: 'Налаштування'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Назва галузі',
      type: 'localizedString',
      group: 'basic',
      validation: (rule) => requireLocalizedUk('Назва UK обовʼязкова')(rule),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (напр. medicine, legal)',
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

    defineField({name: 'seo', title: 'SEO', type: 'seoFields', group: 'seo'}),

    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      options: {collapsible: true},
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow (label / em через « / »)', type: 'localizedString'}),
        defineField({
          name: 'heading',
          title: 'H1 (рядки через \\n, виділення через *…*)',
          type: 'localizedText',
        }),
        defineField({name: 'h1Num', title: 'H1 Number (display, напр. «50+»)', type: 'string'}),
        defineField({
          name: 'h1NumLabel',
          title: 'H1 Number Label (рядки через \\n)',
          type: 'localizedText',
        }),
        defineField({name: 'lede', title: 'Lede / опис (виділення через *…*)', type: 'localizedText'}),
        defineField({
          name: 'features',
          title: 'Features (формат «Заголовок | Підпис»)',
          type: 'array',
          of: [defineArrayMember({type: 'localizedString'})],
        }),
        defineField({name: 'ctaPrimary', title: 'CTA Primary', type: 'localizedString'}),
        defineField({name: 'ctaSecondary', title: 'CTA Secondary', type: 'localizedString'}),
        defineField({
          name: 'stats',
          title: 'Статистики',
          type: 'array',
          of: [defineArrayMember({type: 'metric'})],
        }),
        defineField({
          name: 'tickerItems',
          title: 'Ticker — пункти бігучого рядка',
          type: 'array',
          of: [defineArrayMember({type: 'localizedString'})],
        }),
        defineField({
          name: 'deviceTags',
          title: 'Device tags (наклейки на мокапі)',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'deviceTag',
              fields: [
                defineField({
                  name: 'kind',
                  title: 'Тип',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Default', value: 'default'},
                      {title: 'Good (зелений)', value: 'good'},
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'default',
                }),
                defineField({name: 'primary', title: 'Основний текст', type: 'localizedString'}),
                defineField({name: 'mini', title: 'Mini-значення (напр. «98»)', type: 'string'}),
              ],
              preview: {
                select: {primary: 'primary', mini: 'mini', kind: 'kind'},
                prepare({primary, mini, kind}) {
                  return {
                    title: [pickLocalizedFirst(primary), mini].filter(Boolean).join(' · ') || 'Tag',
                    subtitle: kind === 'good' ? 'good' : 'default',
                  }
                },
              },
            }),
          ],
        }),
        defineField({
          name: 'deviceMockup',
          title: 'Device mockup (зображення)',
          type: 'imageWithLocalizedAlt',
        }),
      ],
    }),

    defineField({
      name: 'sections',
      title: 'Секції сторінки',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({type: 'imageTextBlock'}),
        defineArrayMember({type: 'statsBlock'}),
        defineArrayMember({type: 'faqBlock'}),
        defineArrayMember({type: 'pricingBlock'}),
        defineArrayMember({type: 'comparisonBlock'}),
        defineArrayMember({type: 'reasonsBlock'}),
        defineArrayMember({type: 'servicesBlock'}),
        defineArrayMember({type: 'outcomeBlock'}),
        defineArrayMember({type: 'caseBlock'}),
        defineArrayMember({type: 'auditBlock'}),
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
      name: 'relatedCases',
      title: 'Повʼязані кейси',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'caseStudy'}]})],
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
      title: 'Порядок у меню',
      type: 'number',
      group: 'settings',
      initialValue: 0,
    }),
  ],
  validation: (rule) =>
    rule.custom((doc) => {
      const page = doc as IndustryPageDoc | undefined
      if (page?.status !== 'published') return true
      const t = (page.seo?.title?.uk ?? '').trim()
      const d = (page.seo?.description?.uk ?? '').trim()
      if (!t || !d) {
        return 'Опубліковані сторінки мають мати SEO title.uk і description.uk'
      }
      return true
    }).warning(),
  orderings: [
    {
      title: 'Порядок',
      name: 'order',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', status: 'status'},
    prepare({title, slug, status}) {
      return {
        title: pickLocalizedFirst(title) || 'Industry',
        subtitle: [slug ? `/sites-for/${slug}` : null, status].filter(Boolean).join(' · '),
      }
    },
  },
})
