import {CreditCardIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {optionalHref, requireLocalizedUk} from '../lib/validators'

export const pricingPlan = defineType({
  name: 'pricingPlan',
  title: 'Pricing plan (тариф)',
  type: 'document',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'planKey',
      title: 'Ключ плану (для лінка ?tier= та сортування)',
      type: 'string',
      options: {
        list: [
          {title: 'Landing', value: 'landing'},
          {title: 'Corporate', value: 'corporate'},
          {title: 'Custom', value: 'custom'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Назва',
      type: 'localizedString',
      validation: (rule) => requireLocalizedUk('Назва UK обовʼязкова')(rule),
    }),
    defineField({
      name: 'priceFrom',
      title: 'Ціна від',
      type: 'number',
      validation: (rule) => rule.required().min(0),
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
      name: 'weeks',
      title: 'Терміни (display, напр. «4-8 тижнів»)',
      type: 'localizedString',
    }),
    defineField({
      name: 'includesHeading',
      title: 'Заголовок «Що входить» (напр. «Все з Лендінгу +»)',
      type: 'localizedString',
    }),
    defineField({
      name: 'includes',
      title: 'Що входить',
      type: 'array',
      of: [defineArrayMember({type: 'localizedString'})],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'excludesHeading',
      title: 'Заголовок «Не входить»',
      type: 'localizedString',
    }),
    defineField({
      name: 'excludes',
      title: 'Що НЕ входить',
      type: 'array',
      of: [defineArrayMember({type: 'localizedString'})],
    }),
    defineField({name: 'ctaLabel', title: 'Текст кнопки', type: 'localizedString'}),
    defineField({
      name: 'ctaHref',
      title: 'Лінк кнопки (порожньо = /contacts?tier=<ключ>)',
      type: 'string',
      validation: (rule) => optionalHref(rule),
    }),
    defineField({name: 'ctaGhost', title: 'Кнопка «ghost» (прозора)', type: 'boolean', initialValue: false}),
    defineField({
      name: 'discountLine',
      title: 'Рядок зі знижкою (на майбутнє)',
      type: 'localizedString',
    }),
    defineField({name: 'isPopular', title: 'Популярний (featured)', type: 'boolean', initialValue: false}),
    defineField({name: 'popularLabel', title: 'Лейбл «популярний»', type: 'localizedString'}),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {title: 'Порядок', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {name: 'name', priceFrom: 'priceFrom', currency: 'currency', isPopular: 'isPopular'},
    prepare({name, priceFrom, currency, isPopular}) {
      const t = pickLocalizedFirst(name) || 'Тариф'
      const price = typeof priceFrom === 'number' ? `від ${priceFrom} ${currency || 'USD'}` : '—'
      return {
        title: t,
        subtitle: [price, isPopular ? '★ popular' : null].filter(Boolean).join(' · '),
      }
    },
  },
})
