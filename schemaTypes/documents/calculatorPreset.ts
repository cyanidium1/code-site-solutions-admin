import {PackageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorPreset = defineType({
  name: 'calculatorPreset',
  title: 'Калькулятор — пресет',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'presetKey',
      title: 'Ключ (starterLanding / growthWebsite / ecommerceStarter)',
      type: 'string',
      options: {
        list: [
          {title: 'Starter Landing', value: 'starterLanding'},
          {title: 'Growth Website', value: 'growthWebsite'},
          {title: 'E-commerce Starter', value: 'ecommerceStarter'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({name: 'title', title: 'Назва', type: 'localizedString', validation: (r) => requireLocalizedUk()(r)}),
    defineField({name: 'badge', title: 'Бейдж', type: 'localizedString'}),
    defineField({name: 'bestFor', title: 'Для кого', type: 'localizedText'}),
    defineField({
      name: 'includes',
      title: 'Що входить',
      type: 'array',
      of: [{type: 'localizedString'}],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'estimatedRange',
      title: 'Відображувана ціна (напр. "$1,500 - $2,500")',
      type: 'localizedString',
    }),
    defineField({name: 'compareAnchor', title: 'Порівняння (рядок під цінoю)', type: 'localizedText'}),
    defineField({
      name: 'appliedInput',
      title: 'Стан калькулятора при кліку',
      type: 'object',
      fields: [
        defineField({
          name: 'projectType',
          type: 'string',
          options: {list: ['landing', 'multiPage', 'ecommerce']},
          validation: (r) => r.required(),
        }),
        defineField({name: 'pages', type: 'number', validation: (r) => r.required()}),
        defineField({
          name: 'productComplexity',
          type: 'string',
          options: {list: ['simple', 'medium', 'advanced']},
          initialValue: 'simple',
        }),
        defineField({
          name: 'designComplexity',
          type: 'string',
          options: {list: ['simple', 'custom', 'advanced']},
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'languages',
          type: 'string',
          options: {list: ['one', 'two', 'three', 'fourPlus']},
          validation: (r) => r.required(),
        }),
        defineField({name: 'cmsUpgradeIds', type: 'array', of: [{type: 'string'}]}),
        defineField({name: 'seoOptionIds', type: 'array', of: [{type: 'string'}]}),
        defineField({name: 'featureIds', type: 'array', of: [{type: 'string'}]}),
        defineField({
          name: 'contentOption',
          type: 'string',
          options: {list: ['clientProvided', 'lightPolishing', 'fullCopywriting', 'seoCopywriting']},
          initialValue: 'clientProvided',
        }),
        defineField({
          name: 'timeline',
          type: 'string',
          options: {list: ['standard', 'faster', 'urgent']},
          initialValue: 'standard',
        }),
        defineField({
          name: 'maintenancePlan',
          type: 'string',
          options: {list: ['none', 'basic', 'growth', 'dedicated']},
          initialValue: 'none',
        }),
        defineField({
          name: 'seoGrowthPlan',
          type: 'string',
          options: {list: ['none', 'basicSeo', 'growthSeo', 'contentEngine']},
          initialValue: 'none',
        }),
      ],
    }),
    defineField({name: 'order', title: 'Порядок', type: 'number', initialValue: 0}),
  ],
  orderings: [
    {title: 'Порядок', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', presetKey: 'presetKey', range: 'estimatedRange'},
    prepare({title, presetKey, range}) {
      return {
        title: pickLocalizedFirst(title) || presetKey,
        subtitle: pickLocalizedFirst(range) || '—',
      }
    },
  },
})
