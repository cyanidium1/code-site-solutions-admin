import {CreditCardIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {optionalHref, requireLocalizedUk} from '../lib/validators'

export const pricingBlock = defineType({
  name: 'pricingBlock',
  title: 'Прайс — секція з тарифами',
  type: 'object',
  icon: CreditCardIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'localizedText'}),
    defineField({
      name: 'tiers',
      title: 'Тарифи',
      type: 'array',
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pricingTier',
          title: 'Тариф',
          fields: [
            defineField({
              name: 'title',
              title: 'Назва',
              type: 'localizedString',
              validation: (rule) => requireLocalizedUk('Назва UK обовʼязкова')(rule),
            }),
            defineField({
              name: 'priceFrom',
              title: 'Ціна від',
              type: 'number',
              validation: (rule) => rule.min(0),
            }),
            defineField({
              name: 'currency',
              title: 'Валюта',
              type: 'string',
              options: {
                list: [
                  {title: 'USD', value: 'USD'},
                  {title: 'EUR', value: 'EUR'},
                  {title: 'UAH', value: 'UAH'},
                ],
                layout: 'radio',
              },
              initialValue: 'USD',
            }),
            defineField({
              name: 'timeline',
              title: 'Терміни (display, напр. «4 тижні»)',
              type: 'localizedString',
            }),
            defineField({name: 'isPopular', title: 'Популярний', type: 'boolean', initialValue: false}),
            defineField({name: 'popularLabel', title: 'Лейбл «популярний»', type: 'localizedString'}),
            defineField({
              name: 'includes',
              title: 'Що входить',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
            }),
            defineField({
              name: 'excludes',
              title: 'Що НЕ входить',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
            }),
            defineField({name: 'ctaLabel', title: 'Текст CTA', type: 'localizedString'}),
            defineField({
              name: 'ctaHref',
              title: 'CTA посилання',
              type: 'string',
              validation: (rule) => optionalHref(rule),
            }),
          ],
          preview: {
            select: {title: 'title', priceFrom: 'priceFrom', currency: 'currency', isPopular: 'isPopular'},
            prepare({title, priceFrom, currency, isPopular}) {
              const t = pickLocalizedFirst(title) || 'Тариф'
              const price = typeof priceFrom === 'number' ? `від ${priceFrom} ${currency || 'USD'}` : '—'
              return {
                title: t,
                subtitle: [price, isPopular ? '★ popular' : null].filter(Boolean).join(' · '),
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {tiers: 'tiers'},
    prepare({tiers}) {
      const count = Array.isArray(tiers) ? tiers.length : 0
      return {
        title: 'Pricing',
        subtitle: `Pricing · ${count} tier(s)`,
      }
    },
  },
})
