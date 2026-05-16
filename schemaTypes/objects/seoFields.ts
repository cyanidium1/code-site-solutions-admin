import {defineField, defineType} from 'sanity'

import {recommendLocalizedUk} from '../lib/validators'

export const seoFields = defineType({
  name: 'seoFields',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'SEO title',
      type: 'localizedString',
      validation: (rule) => recommendLocalizedUk('Рекомендуємо заповнити SEO title (UK)')(rule),
    }),
    defineField({
      name: 'description',
      title: 'SEO description',
      type: 'localizedText',
      validation: (rule) =>
        recommendLocalizedUk('Рекомендуємо заповнити SEO description (UK)')(rule),
    }),
    defineField({
      name: 'ogImage',
      title: 'OG image (1200×630)',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  options: {collapsible: true, collapsed: true},
})
