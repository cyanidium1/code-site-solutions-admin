import {TrendUpwardIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorSeoGrowthOptions = defineType({
  name: 'calculatorSeoGrowthOptions',
  title: 'Калькулятор — SEO & Growth',
  type: 'document',
  icon: TrendUpwardIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'SEO & Growth плани',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'seoGrowthOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ (none / basicSeo / growthSeo / contentEngine)',
              description: 'Заблокований після збереження.',
              type: 'string',
              options: {
                list: [
                  {title: 'None', value: 'none'},
                  {title: 'Basic SEO', value: 'basicSeo'},
                  {title: 'Growth SEO', value: 'growthSeo'},
                  {title: 'Content Engine', value: 'contentEngine'},
                ],
              },
              validation: (r) => r.required(),
              readOnly: ({parent}) => Boolean((parent as {optionKey?: string} | undefined)?.optionKey),
            }),
            defineField({
              name: 'label',
              title: 'Назва',
              type: 'localizedString',
              validation: (r) => requireLocalizedUk('UK обовʼязкова')(r),
            }),
            defineField({name: 'bestFor', title: 'Для кого', type: 'localizedText'}),
            defineField({
              name: 'includes',
              title: 'Що входить',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
            }),
            defineField({
              name: 'badge',
              title: 'Бейдж (напр. "Recommended")',
              type: 'localizedString',
            }),
            defineField({
              name: 'monthlyPrice',
              title: 'Місячна ціна (USD)',
              type: 'number',
              validation: (r) => r.required().min(0),
            }),
            defineField({
              name: 'priceLabel',
              title: 'Відображувана ціна (override, напр. "$1,200-$1,500 /mo")',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              label: 'label',
              optionKey: 'optionKey',
              monthly: 'monthlyPrice',
              priceLabel: 'priceLabel',
            },
            prepare({label, optionKey, monthly, priceLabel}) {
              const lbl = pickLocalizedFirst(label) || optionKey || '—'
              const detail = priceLabel || (typeof monthly === 'number' ? `$${monthly}/mo` : '—')
              return {title: lbl, subtitle: `${optionKey} · ${detail}`}
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {options: 'options'},
    prepare({options}) {
      const count = Array.isArray(options) ? options.length : 0
      return {title: 'SEO & Growth', subtitle: `${count} рядків`}
    },
  },
})
