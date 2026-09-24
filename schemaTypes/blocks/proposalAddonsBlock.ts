import {AddIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Додаткові послуги, які клієнт може докупити до обраного варіанта.
 *
 * Навмисно окремий тип, а не ще один `proposalOptionsBlock`: там вибір один
 * з кількох (радіо), тут — незалежні галочки, і кожна додає свою суму. Якщо
 * зліпити їх в один тип, редактор рано чи пізно покладе пакети й допи в один
 * список, і клієнт не зрозуміє, за що платить.
 *
 * Обране їде у фінальний CTA разом із варіантом — див. `ProposalCtaActions`.
 */
export const proposalAddonsBlock = defineType({
  name: 'proposalAddonsBlock',
  title: 'КП · Додатково (галочки)',
  type: 'object',
  icon: AddIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Надзаголовок', type: 'string'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'string'}),
    defineField({name: 'lede', title: 'Вступний абзац', type: 'text', rows: 3}),
    defineField({
      name: 'addons',
      title: 'Послуги',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalAddon',
          fields: [
            defineField({
              name: 'key',
              title: 'Ключ (латиницею, напр. «design»)',
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
            defineField({name: 'price', title: 'Ціна (напр. «+€450»)', type: 'string'}),
            defineField({name: 'summary', title: 'Що це дає', type: 'text', rows: 3}),
            defineField({name: 'details', title: 'Під катом', type: 'proposalDetails'}),
          ],
          preview: {
            select: {name: 'name', price: 'price', key: 'key'},
            prepare({name, price, key}) {
              return {title: name || key || 'Послуга', subtitle: price || ''}
            },
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((addons) => {
          const list = Array.isArray(addons) ? (addons as Array<{key?: string}>) : []
          const keys = list.map((a) => (a?.key ?? '').trim()).filter(Boolean)
          if (new Set(keys).size !== keys.length) return 'Ключі мають бути унікальні'
          return true
        }),
    }),
    defineField({name: 'note', title: 'Примітка під списком', type: 'text', rows: 2}),
  ],
  preview: {
    select: {heading: 'heading', addons: 'addons'},
    prepare({heading, addons}) {
      const n = Array.isArray(addons) ? addons.length : 0
      return {title: heading || 'Додатково', subtitle: `Додатково · ${n}`}
    },
  },
})
