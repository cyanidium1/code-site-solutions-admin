import {ThListIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Універсальна таблиця КП. Один тип покриває три сценарії, які відрізняються
 * лише подачею, а не структурою даних:
 *   findings — знахідки аудиту (проблема / доказ / наслідок);
 *   compare  — «як зараз» проти «як буде», друга колонка підсвічена;
 *   plain    — будь-яка інша таблиця (вартість володіння, строки).
 *
 * Рядки — обʼєкти з масивом `cells`, бо GROQ/Sanity не мають масиву масивів.
 * Кількість комірок має збігатися з кількістю колонок; фронт добиває
 * порожніми, щоб крива таблиця не ламала верстку в клієнта на очах.
 */
export const proposalTableBlock = defineType({
  name: 'proposalTableBlock',
  title: 'КП · Таблиця',
  type: 'object',
  icon: ThListIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Надзаголовок', type: 'string'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'string'}),
    defineField({name: 'lede', title: 'Вступний абзац', type: 'text', rows: 3}),
    defineField({
      name: 'variant',
      title: 'Подача',
      type: 'string',
      options: {
        list: [
          {title: 'Знахідки аудиту', value: 'findings'},
          {title: 'Порівняння (друга колонка — наша)', value: 'compare'},
          {title: 'Звичайна', value: 'plain'},
        ],
        layout: 'radio',
      },
      initialValue: 'plain',
    }),
    defineField({
      name: 'columns',
      title: 'Шапка таблиці',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(2).error('Мінімум дві колонки'),
    }),
    defineField({
      name: 'rows',
      title: 'Рядки',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proposalTableRow',
          fields: [
            defineField({
              name: 'cells',
              title: 'Комірки (у порядку колонок)',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
            }),
            defineField({
              name: 'emphasis',
              title: 'Підсумковий рядок (жирний)',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {cells: 'cells', emphasis: 'emphasis'},
            prepare({cells, emphasis}) {
              const list = Array.isArray(cells) ? (cells as string[]) : []
              return {
                title: list[0] || 'Рядок',
                subtitle: [list.slice(1).join(' · '), emphasis ? 'підсумок' : null]
                  .filter(Boolean)
                  .join(' — '),
              }
            },
          },
        }),
      ],
    }),
    defineField({name: 'caption', title: 'Підпис під таблицею', type: 'text', rows: 2}),
    defineField({name: 'details', title: 'Під катом', type: 'proposalDetails'}),
  ],
  preview: {
    select: {heading: 'heading', rows: 'rows', variant: 'variant'},
    prepare({heading, rows, variant}) {
      const n = Array.isArray(rows) ? rows.length : 0
      return {title: heading || 'Таблиця', subtitle: `Таблиця · ${variant || 'plain'} · ${n} рядків`}
    },
  },
})
