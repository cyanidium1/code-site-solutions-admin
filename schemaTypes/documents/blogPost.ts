import {ComposeSparklesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import type {LocalizedStringValue} from '../lib/localized'

type BlogPostDoc = {
  status?: 'draft' | 'published'
  publishedAt?: string
}

/** Published-only requirement on the UK member of a localized field. */
function requiredUkWhenPublished(message: string) {
  return (rule: import('sanity').Rule) =>
    rule.custom((value: LocalizedStringValue | undefined, ctx) => {
      const doc = ctx.document as BlogPostDoc | undefined
      if (doc?.status === 'published' && !(value?.uk ?? '').trim()) {
        return message
      }
      return true
    })
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
    /* ─── Basic ────────────────────────────────────────────────────────── */
    defineField({
      name: 'title',
      title: 'Заголовок (H1)',
      type: 'localizedString',
      group: 'basic',
      description: 'EN порожній → стаття не зʼявляється на /en/blog.',
      validation: (rule) =>
        rule.custom((value: LocalizedStringValue | undefined) =>
          (value?.uk ?? '').trim() ? true : 'Заповніть заголовок UK',
        ),
    }),
    defineField({
      name: 'slugs',
      title: 'Slug (UK / EN)',
      type: 'localizedSlug',
      group: 'basic',
      description: 'Окремі slug-и на локаль — різні URL (/blog/<uk> та /en/blog/<en>).',
      validation: (rule) =>
        rule.custom((value?: {uk?: {current?: string}}) =>
          (value?.uk?.current ?? '').trim() ? true : 'Заповніть slug UK',
        ),
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
      name: 'category',
      title: 'Категорія',
      description:
        'Посилання на категорію блогу (Налаштування фільтрів → Фільтри блогу → Категорії статей). ' +
        'Slug категорії підставляється в URL фільтра: /blog?category=<slug>. ' +
        'Залишити порожнім — стаття зʼявиться в загальній стрічці без пілюлі.',
      type: 'reference',
      to: [{type: 'blogCategoryOption'}],
      group: 'basic',
    }),
    defineField({
      name: 'tags',
      title: 'Теги',
      type: 'array',
      group: 'basic',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'publishedAt',
      title: 'Дата публікації',
      type: 'datetime',
      group: 'basic',
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const doc = ctx.document as BlogPostDoc | undefined
          if (doc?.status === 'published' && !value) {
            return 'Опубліковані пости мають мати дату публікації'
          }
          return true
        }),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Дата оновлення',
      type: 'datetime',
      group: 'basic',
    }),
    defineField({
      name: 'readingTimeMinutes',
      title: 'Час читання (хвилини)',
      type: 'number',
      group: 'basic',
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: 'author',
      title: 'Автор',
      type: 'blogAuthor',
      group: 'basic',
    }),

    /* ─── Content ──────────────────────────────────────────────────────── */
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow (під hero)',
      type: 'localizedString',
      group: 'content',
      description: 'Напр. "Бюджет · 9 хвилин читання"',
    }),
    defineField({
      name: 'lede',
      title: 'Lede (1-2 речення)',
      type: 'localizedText',
      group: 'content',
    }),
    defineField({
      name: 'cover',
      title: 'Обкладинка',
      type: 'imageWithLocalizedAlt',
      group: 'content',
      description:
        'Основна обкладинка — зображення зберігається в Sanity (завантажуйте прямо сюди). ' +
        'Показується у hero статті, картках блогу та og:image (якщо не задано окремий OG image).',
    }),
    defineField({
      name: 'coverImage',
      title: 'Обкладинка (legacy — шлях у репо)',
      type: 'object',
      group: 'content',
      description:
        'Застаріле: шлях під /public у frontend-репо (напр. /blog/cover-*.webp) + alt. ' +
        'Використовується лише якщо поле «Обкладинка» вище порожнє. Для нових статей — завантажуйте зображення в «Обкладинка».',
      fields: [
        defineField({
          name: 'src',
          title: 'Шлях (напр. /blog/cover-skilky-koshtuye.webp)',
          type: 'string',
        }),
        defineField({
          name: 'alt',
          title: 'Alt-текст (UK)',
          type: 'string',
        }),
        defineField({
          name: 'altEn',
          title: 'Alt text (EN)',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Текст статті',
      type: 'localizedBlogBody',
      group: 'content',
    }),
    defineField({
      name: 'faqHeading',
      title: 'Заголовок FAQ-секції (опц.)',
      description: 'Порожньо → «Часті питання» / "FAQ"',
      type: 'localizedString',
      group: 'content',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'blogFaqItem',
          fields: [
            defineField({
              name: 'question',
              title: 'Питання',
              type: 'localizedString',
              validation: (rule) =>
                rule.custom((value: LocalizedStringValue | undefined) =>
                  (value?.uk ?? '').trim() ? true : 'Заповніть питання UK',
                ),
            }),
            defineField({
              name: 'answer',
              title: 'Відповідь',
              type: 'localizedText',
              validation: (rule) =>
                rule.custom((value: LocalizedStringValue | undefined) =>
                  (value?.uk ?? '').trim() ? true : 'Заповніть відповідь UK',
                ),
            }),
          ],
          preview: {
            select: {question: 'question.uk'},
            prepare({question}) {
              return {title: question || 'Питання'}
            },
          },
        }),
      ],
    }),

    /* ─── SEO ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'localizedString',
      group: 'seo',
      validation: requiredUkWhenPublished('Опубліковані пости мають мати meta title UK'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'localizedText',
      group: 'seo',
      validation: requiredUkWhenPublished('Опубліковані пости мають мати meta description UK'),
    }),
    defineField({
      name: 'ogImage',
      title: 'OG image (1200×630, опц.)',
      type: 'image',
      group: 'seo',
      options: {hotspot: true},
    }),

    /* ─── Related ──────────────────────────────────────────────────────── */
    defineField({
      name: 'relatedPostSlugs',
      title: 'Повʼязані статті (по slug)',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(3),
      description: 'До 3 UK-slug-ів. Резолвимо у frontend під час запиту.',
    }),
  ],
  orderings: [
    {
      title: 'Дата публікації (нові)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title.uk', media: 'coverImage', status: 'status', publishedAt: 'publishedAt'},
    prepare({title, media, status, publishedAt}) {
      const date = publishedAt ? String(publishedAt).slice(0, 10) : null
      return {
        title: title || 'Blog post',
        subtitle: [date, status === 'published' ? 'Опубліковано' : 'Чернетка']
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
