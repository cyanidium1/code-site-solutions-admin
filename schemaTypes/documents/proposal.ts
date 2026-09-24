import {DocumentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

type ProposalDoc = {
  status?: 'draft' | 'published'
  slug?: {current?: string}
}

/**
 * Комерційна пропозиція (КП) — технічна сторінка сайту на /offer/<slug>.
 *
 * Три речі, якими цей тип свідомо відрізняється від решти схеми:
 *
 * 1. БЕЗ localizedString. Решта документів мультимовні, бо одну сторінку
 *    читають три аудиторії. КП пишеться одному клієнту однією мовою —
 *    мова фіксується полем `language` і задає <html lang> та підписи
 *    інтерфейсу. Робити тут uk/ru/en означало б утричі більше полів, з
 *    яких заповнюють одне.
 *
 * 2. Сторінка не індексується: фронт віддає `noindex, nofollow` і
 *    X-Robots-Tag, у sitemap тип не потрапляє, у навігації посилань немає.
 *    Єдиний вхід — пряме посилання, яке ми надсилаємо клієнту.
 *
 * 3. Dataset публічний і читається без токена (див. CLAUDE.md, «Dot rule»).
 *    Тому `_id` документа має бути звичайним UUID без крапки, інакше
 *    сторінка віддасть 404 на проді. І тому ж у КП не можна класти те,
 *    що не можна показати сторонньому: секрети клієнта, доступи, ПІБ
 *    третіх осіб. Ціна й обсяг робіт — можна.
 */
export const proposal = defineType({
  name: 'proposal',
  title: 'Комерційні пропозиції',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'basic', title: 'Основне', default: true},
    {name: 'client', title: 'Клієнт'},
    {name: 'hero', title: 'Шапка'},
    {name: 'sections', title: 'Секції'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Назва (внутрішня, у списку)',
      type: 'string',
      group: 'basic',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug — адреса /offer/<slug>',
      type: 'slug',
      group: 'basic',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Статус',
      type: 'string',
      group: 'basic',
      description: 'Чернетку фронт не віддає — посилання поверне 404.',
      options: {
        list: [
          {title: 'Чернетка', value: 'draft'},
          {title: 'Опубліковано', value: 'published'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Мова КП',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          {title: 'Українська', value: 'uk'},
          {title: 'Русский', value: 'ru'},
          {title: 'English', value: 'en'},
        ],
        layout: 'radio',
      },
      initialValue: 'uk',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'client',
      title: 'Клієнт',
      type: 'object',
      group: 'client',
      options: {collapsible: true},
      fields: [
        defineField({name: 'name', title: 'Компанія / проєкт', type: 'string'}),
        defineField({name: 'contact', title: 'Кому адресовано (імʼя)', type: 'string'}),
        defineField({name: 'site', title: 'Сайт клієнта', type: 'url'}),
      ],
    }),
    defineField({
      name: 'meta',
      title: 'Реквізити пропозиції',
      type: 'object',
      group: 'client',
      options: {collapsible: true},
      fields: [
        defineField({name: 'preparedBy', title: 'Хто підготував', type: 'string'}),
        defineField({name: 'preparedByRole', title: 'Роль', type: 'string'}),
        defineField({name: 'email', title: 'E-mail', type: 'string'}),
        defineField({name: 'telegram', title: 'Telegram (@handle)', type: 'string'}),
        defineField({name: 'issuedOn', title: 'Дата (як показувати)', type: 'string'}),
        defineField({name: 'validUntil', title: 'Дійсна до (як показувати)', type: 'string'}),
        defineField({name: 'currencyNote', title: 'Примітка про валюту', type: 'string'}),
      ],
    }),

    defineField({
      name: 'hero',
      title: 'Шапка',
      type: 'object',
      group: 'hero',
      options: {collapsible: true},
      fields: [
        defineField({name: 'eyebrow', title: 'Надзаголовок', type: 'string'}),
        defineField({
          name: 'heading',
          title: 'H1',
          type: 'text',
          rows: 2,
          validation: (rule) => rule.required(),
        }),
        defineField({name: 'lede', title: 'Підзаголовок', type: 'text', rows: 4}),
        defineField({
          name: 'highlights',
          title: 'Ключові цифри (3–4)',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'proposalHighlight',
              fields: [
                defineField({name: 'value', title: 'Значення', type: 'string'}),
                defineField({name: 'label', title: 'Підпис', type: 'string'}),
              ],
              preview: {
                select: {value: 'value', label: 'label'},
                prepare({value, label}) {
                  return {title: value || 'Цифра', subtitle: label || ''}
                },
              },
            }),
          ],
          validation: (rule) => rule.max(4),
        }),
      ],
    }),

    defineField({
      name: 'sections',
      title: 'Секції',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({type: 'proposalRichBlock'}),
        defineArrayMember({type: 'proposalTableBlock'}),
        defineArrayMember({type: 'proposalOptionsBlock'}),
        defineArrayMember({type: 'proposalAddonsBlock'}),
        defineArrayMember({type: 'proposalListBlock'}),
        defineArrayMember({type: 'proposalCtaBlock'}),
      ],
      options: {insertMenu: {views: [{name: 'list'}, {name: 'grid'}]}},
    }),
    defineField({
      name: 'footerNote',
      title: 'Дрібний текст у підвалі',
      type: 'text',
      rows: 3,
      group: 'sections',
    }),
  ],
  validation: (rule) =>
    rule
      .custom((doc) => {
        const p = doc as ProposalDoc | undefined
        if (p?.status !== 'published') return true
        const slug = (p.slug?.current ?? '').trim()
        // Коротку адресу легко вгадати перебором, а сторінка — з цінами.
        if (slug.length < 12) {
          return 'Для опублікованого КП візьміть довший slug — адреса і є єдиним захистом'
        }
        return true
      })
      .warning(),
  orderings: [
    {title: 'Найновіші', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      status: 'status',
      language: 'language',
      client: 'client.name',
    },
    prepare({title, slug, status, language, client}) {
      return {
        title: title || 'КП',
        subtitle: [client, slug ? `/offer/${slug}` : null, language, status]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
