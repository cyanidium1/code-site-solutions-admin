import {EarthGlobeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const countryOption = defineType({
  name: 'countryOption',
  title: 'Country option',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Назва (UK / EN)',
      description: 'Відображувана назва країни. UK — обовʼязкова. EN — використовується на /en сторінках.',
      type: 'localizedString',
      validation: (rule) => requireLocalizedUk('Назва UK обовʼязкова')(rule),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (внутрішнє значення)',
      description:
        'Стабільний ідентифікатор. Використовується як значення в фільтрі URL (?country=…) і як ключ у dropdown. ' +
        'Генерується з назви UK; не змінюйте після створення — інакше старі посилання зламаються.',
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
        title: pickLocalizedFirst(name) || 'Country',
        subtitle: slug ? `slug: ${slug}` : '— без slug —',
      }
    },
  },
})
