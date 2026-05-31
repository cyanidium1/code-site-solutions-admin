import {ChartUpwardIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const budgetBucketOption = defineType({
  name: 'budgetBucketOption',
  title: 'Budget bucket option',
  type: 'document',
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Назва (UK / EN)',
      description:
        'Відображувана назва бакету бюджету (напр. «До $3k», «$3–7k»). ' +
        'UK — обовʼязкова. EN — використовується на /en сторінках.',
      type: 'localizedString',
      validation: (rule) => requireLocalizedUk('Назва UK обовʼязкова')(rule),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (внутрішнє значення)',
      description:
        'Стабільний ідентифікатор бакету. Використовується як значення в фільтрі URL (?budget=…) і ' +
        'як ключ у dropdown. Генерується з назви UK; не змінюйте після створення.',
      type: 'slug',
      options: {
        source: (doc) => pickLocalizedFirst((doc as {name?: unknown}).name),
        maxLength: 32,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Порядок',
      name: 'order',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {name: 'name', slug: 'slug.current'},
    prepare({name, slug}) {
      return {
        title: pickLocalizedFirst(name) || 'Budget bucket',
        subtitle: slug ? `slug: ${slug}` : '— без slug —',
      }
    },
  },
})
