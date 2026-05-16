import {ComposeSparklesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import type {LocalizedStringValue} from '../lib/localized'
import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

type BlogPostDoc = {
  status?: 'draft' | 'published'
  seo?: {
    title?: LocalizedStringValue
    description?: LocalizedStringValue
  }
}

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog post',
  type: 'document',
  icon: ComposeSparklesIcon,
  groups: [
    {name: 'basic', title: 'Основне', default: true},
    {name: 'content', title: 'Контент'},
    {name: 'seo', title: 'SEO'},
    {name: 'related', title: 'Звʼязки'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'localizedString',
      group: 'basic',
      validation: (rule) => requireLocalizedUk('Заголовок UK обовʼязковий')(rule),
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
      name: 'publishedAt',
      title: 'Дата публікації',
      type: 'datetime',
      group: 'basic',
    }),
    defineField({
      name: 'coverImage',
      title: 'Обкладинка',
      type: 'imageWithLocalizedAlt',
      group: 'basic',
    }),
    defineField({
      name: 'excerpt',
      title: 'Короткий опис',
      type: 'localizedText',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Текст статті',
      type: 'richTextSimple',
      group: 'content',
    }),

    defineField({name: 'seo', title: 'SEO', type: 'seoFields', group: 'seo'}),

    defineField({
      name: 'relatedCases',
      title: 'Повʼязані кейси',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'caseStudy'}]})],
    }),
    defineField({
      name: 'relatedIndustries',
      title: 'Повʼязані галузі',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'industryPage'}]})],
    }),
  ],
  validation: (rule) =>
    rule.custom((doc) => {
      const post = doc as BlogPostDoc | undefined
      if (post?.status !== 'published') return true
      const t = (post.seo?.title?.uk ?? '').trim()
      const d = (post.seo?.description?.uk ?? '').trim()
      if (!t || !d) {
        return 'Опубліковані пости мають мати SEO title.uk і description.uk'
      }
      return true
    }).warning(),
  orderings: [
    {
      title: 'Дата публікації (нові)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', media: 'coverImage.image', status: 'status', publishedAt: 'publishedAt'},
    prepare({title, media, status, publishedAt}) {
      const date = publishedAt ? String(publishedAt).slice(0, 10) : null
      return {
        title: pickLocalizedFirst(title) || 'Blog post',
        subtitle: [date, status === 'published' ? 'Опубліковано' : 'Чернетка'].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
