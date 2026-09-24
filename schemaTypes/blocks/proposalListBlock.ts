import {CheckmarkCircleIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Перелік: що входить, що не входить, умови, гарантія.
 *
 * `details` є і в пункта, і в блока — це два різні рівні. Блоковий кат
 * пояснює секцію цілком («як ми це заміряли»), пунктовий — одну тезу
 * («чому сайт зараз повільний»). Саме пунктовий і робить головну роботу:
 * у головному тексті лишається «сайт відкривається повільно», а гігабайти,
 * запити й мілісекунди їдуть під кат для тих, кому вони цікаві.
 */
export const proposalListBlock = defineType({
  name: 'proposalListBlock',
  title: 'КП · Перелік',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Надзаголовок', type: 'string'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'string'}),
    defineField({name: 'lede', title: 'Вступний абзац', type: 'text', rows: 3}),
    defineField({
      name: 'tone',
      title: 'Тон',
      type: 'string',
      options: {
        list: [
          {title: 'Входить (галочки)', value: 'included'},
          {title: 'Не входить (прочерки)', value: 'excluded'},
          {title: 'Нейтрально (нумерація)', value: 'neutral'},
        ],
        layout: 'radio',
      },
      initialValue: 'included',
    }),
    defineField({
      name: 'items',
      title: 'Пункти',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalListItem',
          fields: [
            defineField({name: 'title', title: 'Назва пункту', type: 'string'}),
            defineField({name: 'text', title: 'Пояснення', type: 'text', rows: 3}),
            defineField({
              name: 'details',
              title: 'Під катом («Подробиці» саме для цього пункту)',
              type: 'proposalDetails',
            }),
          ],
          preview: {
            select: {title: 'title', text: 'text'},
            prepare({title, text}) {
              return {title: title || text || 'Пункт', subtitle: title ? text : ''}
            },
          },
        }),
      ],
    }),
    defineField({name: 'details', title: 'Під катом', type: 'proposalDetails'}),
  ],
  preview: {
    select: {heading: 'heading', items: 'items', tone: 'tone'},
    prepare({heading, items, tone}) {
      const n = Array.isArray(items) ? items.length : 0
      return {title: heading || 'Перелік', subtitle: `Перелік · ${tone || 'included'} · ${n}`}
    },
  },
})
