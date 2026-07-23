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
      title: 'Slug (UK)',
      type: 'slug',
      group: 'basic',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'titleEn',
      title: 'Title (EN)',
      type: 'string',
      group: 'basic',
      description: 'Sprint 2BC: EN translation. Leave empty to hide from /en/blog.',
    }),
    defineField({
      name: 'slugEn',
      title: 'Slug (EN)',
      type: 'slug',
      group: 'basic',
      options: {
        source: 'titleEn',
        maxLength: 96,
      },
      description: 'Separate from the UK slug — different URLs per locale.',
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
      title: 'Eyebrow (UK, під hero)',
      type: 'string',
      group: 'content',
      description: 'Напр. "Бюджет · 9 хвилин читання"',
    }),
    defineField({
      name: 'eyebrowEn',
      title: 'Eyebrow (EN)',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'lede',
      title: 'Lede (UK, 1-2 речення)',
      type: 'text',
      group: 'content',
      rows: 3,
    }),
    defineField({
      name: 'ledeEn',
      title: 'Lede (EN, 1-2 sentences)',
      type: 'text',
      group: 'content',
      rows: 3,
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
      title: 'Текст статті (UK)',
      type: 'blogBody',
      group: 'content',
    }),
    defineField({
      name: 'bodyEn',
      title: 'Body (EN)',
      type: 'blogBody',
      group: 'content',
    }),
    defineField({
      name: 'faqHeading',
      title: 'Заголовок FAQ-секції (UK, опц.)',
      description: 'Порожньо → «Часті питання»',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'faqHeadingEn',
      title: 'FAQ section heading (EN, opt.)',
      description: 'Empty → "FAQ"',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ (UK)',
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
    defineField({
      name: 'faqEn',
      title: 'FAQ (EN)',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'blogFaqItemEn',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
            }),
          ],
          preview: {
            select: {question: 'question'},
            prepare({question}) {
              return {title: question || 'Question'}
            },
          },
        }),
      ],
    }),

    /* ─── SEO ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'metaTitle',
      title: 'Meta title (UK)',
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
      name: 'metaTitleEn',
      title: 'Meta title (EN)',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description (UK)',
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
      name: 'metaDescriptionEn',
      title: 'Meta description (EN)',
      type: 'text',
      group: 'seo',
      rows: 3,
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
