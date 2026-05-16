import {ComposeSparklesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

type BlogPostDoc = {
  status?: 'draft' | 'published'
  metaTitle?: string
  metaDescription?: string
  publishedAt?: string
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
      type: 'string',
      group: 'basic',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: {
        source: 'title',
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
      name: 'category',
      title: 'Категорія',
      type: 'string',
      group: 'basic',
      description: 'Напр. Бюджет, Платформи, Юридичне',
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
      type: 'string',
      group: 'content',
      description: 'Напр. "Бюджет · 9 хвилин читання"',
    }),
    defineField({
      name: 'lede',
      title: 'Lede (1-2 речення)',
      type: 'text',
      group: 'content',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Обкладинка',
      type: 'object',
      group: 'content',
      description:
        'Шлях під /public у frontend-репо (напр. /blog/cover-*.webp) + alt. ' +
        'Зберігаємо як рядок, а не Sanity-asset, бо ці обкладинки кладуться в репо.',
      fields: [
        defineField({
          name: 'src',
          title: 'Шлях (напр. /blog/cover-skilky-koshtuye.webp)',
          type: 'string',
        }),
        defineField({
          name: 'alt',
          title: 'Alt-текст',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Текст статті',
      type: 'blogBody',
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
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Відповідь',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {question: 'question'},
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
      title: 'Meta title (SEO)',
      type: 'string',
      group: 'seo',
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const doc = ctx.document as BlogPostDoc | undefined
          if (doc?.status === 'published' && !value) {
            return 'Опубліковані пости мають мати meta title'
          }
          return true
        }),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description (SEO)',
      type: 'text',
      group: 'seo',
      rows: 3,
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const doc = ctx.document as BlogPostDoc | undefined
          if (doc?.status === 'published' && !value) {
            return 'Опубліковані пости мають мати meta description'
          }
          return true
        }),
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
      description: 'До 3 slug-ів. Резолвимо у frontend під час запиту.',
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
    select: {title: 'title', media: 'coverImage', status: 'status', publishedAt: 'publishedAt'},
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
