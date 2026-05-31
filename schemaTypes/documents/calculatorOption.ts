import {ListIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

const GROUP_OPTIONS = [
  {title: 'CMS upgrade (CMS / контент)', value: 'cms'},
  {title: 'SEO architecture', value: 'seo'},
  {title: 'Feature / integration', value: 'feature'},
  {title: 'Language tier', value: 'language'},
  {title: 'Design tier', value: 'design'},
  {title: 'Timeline / urgency', value: 'timeline'},
  {title: 'Maintenance plan', value: 'maintenance'},
  {title: 'SEO & Growth plan', value: 'seoGrowth'},
  {title: 'Content / copywriting', value: 'content'},
  {title: 'Product complexity (e-comm)', value: 'productComplexity'},
] as const

const FEATURE_GROUP_OPTIONS = [
  {title: 'Lead capture', value: 'leadCapture'},
  {title: 'Conversion & tracking', value: 'conversion'},
  {title: 'Advanced UX', value: 'advancedUx'},
] as const

export const calculatorOption = defineType({
  name: 'calculatorOption',
  title: 'Калькулятор — опція',
  type: 'document',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'groupKey',
      title: 'Група',
      type: 'string',
      options: {list: GROUP_OPTIONS.slice()},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'optionKey',
      title: 'Ключ опції (стабільний id)',
      description: 'Має співпадати з ключами, які знає движок калькулятора (напр. "leadForm", "advancedBuilder", "growth").',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'label',
      title: 'Назва',
      type: 'localizedString',
      validation: (r) => requireLocalizedUk('UK обовʼязкова')(r),
    }),
    defineField({name: 'hint', title: 'Підказка', type: 'localizedText'}),
    defineField({
      name: 'price',
      title: 'Ціна (USD, разово) — для cms/seo/feature/content/productComplexity',
      type: 'number',
      hidden: ({document}) =>
        !['cms', 'seo', 'feature', 'content', 'productComplexity'].includes(
          (document?.groupKey as string) || '',
        ),
    }),
    defineField({
      name: 'monthlyPrice',
      title: 'Місячна ціна (USD) — для maintenance/seoGrowth',
      type: 'number',
      hidden: ({document}) =>
        !['maintenance', 'seoGrowth'].includes((document?.groupKey as string) || ''),
    }),
    defineField({
      name: 'priceLabel',
      title: 'Відображувана ціна (override) — для seoGrowth (напр. "$1,200-$1,500 /mo")',
      type: 'string',
      hidden: ({document}) => (document?.groupKey as string) !== 'seoGrowth',
    }),
    defineField({
      name: 'percent',
      title: 'Множник у відсотках (0–1) — для design/language/timeline',
      type: 'number',
      validation: (r) => r.min(0).max(1),
      hidden: ({document}) =>
        !['design', 'language', 'timeline'].includes((document?.groupKey as string) || ''),
    }),
    defineField({
      name: 'included',
      title: 'Включено за замовчуванням (зафіксований чекбокс)',
      type: 'boolean',
      initialValue: false,
      hidden: ({document}) =>
        !['cms', 'seo', 'feature'].includes((document?.groupKey as string) || ''),
    }),
    defineField({
      name: 'featureGroup',
      title: 'Підгрупа feature (lead capture / conversion / advanced UX)',
      type: 'string',
      options: {list: FEATURE_GROUP_OPTIONS.slice()},
      hidden: ({document}) => (document?.groupKey as string) !== 'feature',
    }),
    defineField({
      name: 'bestFor',
      title: 'Для кого (seoGrowth)',
      type: 'localizedText',
      hidden: ({document}) => (document?.groupKey as string) !== 'seoGrowth',
    }),
    defineField({
      name: 'includes',
      title: 'Що входить (seoGrowth)',
      type: 'array',
      of: [{type: 'localizedString'}],
      hidden: ({document}) => (document?.groupKey as string) !== 'seoGrowth',
    }),
    defineField({
      name: 'badge',
      title: 'Бейдж (seoGrowth) — напр. "Recommended"',
      type: 'localizedString',
      hidden: ({document}) => (document?.groupKey as string) !== 'seoGrowth',
    }),
    defineField({
      name: 'previews',
      title: 'Прев’ю (design)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'src', title: 'Шлях до зображення (наприклад /calculator/design/preview-1.svg)', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'caption', title: 'Підпис', type: 'localizedString'}),
          ],
        },
      ],
      hidden: ({document}) => (document?.groupKey as string) !== 'design',
    }),
    defineField({name: 'order', title: 'Порядок у групі', type: 'number', initialValue: 0}),
  ],
  orderings: [
    {title: 'Group → order', name: 'groupOrder', by: [
      {field: 'groupKey', direction: 'asc'},
      {field: 'order', direction: 'asc'},
    ]},
  ],
  preview: {
    select: {label: 'label', groupKey: 'groupKey', optionKey: 'optionKey', price: 'price', monthly: 'monthlyPrice', pct: 'percent'},
    prepare({label, groupKey, optionKey, price, monthly, pct}) {
      const lbl = pickLocalizedFirst(label) || optionKey
      const detail =
        typeof price === 'number' ? `+$${price}` :
        typeof monthly === 'number' ? `$${monthly}/mo` :
        typeof pct === 'number' ? `+${Math.round(pct * 100)}%` :
        '—'
      return {title: `${lbl}`, subtitle: `${groupKey} · ${optionKey} · ${detail}`}
    },
  },
})
