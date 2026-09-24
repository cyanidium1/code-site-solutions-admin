import {CreditCardIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Варіанти пакета, з яких клієнт обирає один.
 *
 * На фронті це не просто картки: вибір запамʼятовується на сторінці і
 * підставляється у фінальний CTA (тема листа / текст у Telegram), щоб
 * відповідь «Варіант 2» не треба було формулювати вручну. Тому `key` —
 * обовʼязковий і стабільний: саме він летить у посилання, а не назва,
 * яку редактор може переписати.
 */
export const proposalOptionsBlock = defineType({
  name: 'proposalOptionsBlock',
  title: 'КП · Варіанти на вибір',
  type: 'object',
  icon: CreditCardIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Надзаголовок', type: 'string'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'string'}),
    defineField({name: 'lede', title: 'Вступний абзац', type: 'text', rows: 3}),
    defineField({
      name: 'options',
      title: 'Варіанти',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalOption',
          fields: [
            defineField({
              name: 'key',
              title: 'Ключ (латиницею, напр. «option-1»)',
              type: 'string',
              validation: (rule) =>
                rule
                  .required()
                  .regex(/^[a-z0-9-]+$/, {name: 'lowercase-slug'})
                  .error('Лише малі латинські літери, цифри й дефіс'),
            }),
            defineField({
              name: 'name',
              title: 'Назва',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'price', title: 'Ціна (як показувати)', type: 'string'}),
            defineField({name: 'priceNote', title: 'Примітка до ціни', type: 'string'}),
            defineField({name: 'summary', title: 'Кому підходить', type: 'text', rows: 2}),
            defineField({
              name: 'bullets',
              title: 'Що входить (формат «Заголовок | Опис» або просто текст)',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
            }),
            defineField({name: 'badge', title: 'Плашка (напр. «Рекомендуємо»)', type: 'string'}),
            defineField({
              name: 'recommended',
              title: 'Обраний за замовчуванням',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({name: 'details', title: 'Під катом', type: 'proposalDetails'}),
          ],
          preview: {
            select: {name: 'name', price: 'price', key: 'key'},
            prepare({name, price, key}) {
              return {title: name || key || 'Варіант', subtitle: price || ''}
            },
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((options) => {
          const list = Array.isArray(options) ? (options as Array<{key?: string}>) : []
          const keys = list.map((o) => (o?.key ?? '').trim()).filter(Boolean)
          if (new Set(keys).size !== keys.length) return 'Ключі варіантів мають бути унікальні'
          return true
        }),
    }),
    defineField({name: 'note', title: 'Примітка під варіантами', type: 'text', rows: 2}),
  ],
  preview: {
    select: {heading: 'heading', options: 'options'},
    prepare({heading, options}) {
      const n = Array.isArray(options) ? options.length : 0
      return {title: heading || 'Варіанти', subtitle: `Варіанти на вибір · ${n}`}
    },
  },
})
