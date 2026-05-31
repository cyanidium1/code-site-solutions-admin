import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

const HEX_COLOR_RX = /^#([0-9A-Fa-f]{6})$/

export const blogCategoryOption = defineType({
  name: 'blogCategoryOption',
  title: 'Категорія блогу',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Назва категорії (UK / EN)',
      description:
        'Відображувана назва категорії — те, що читач бачить на пілюлі-фільтрі. ' +
        'UK — обовʼязкова. EN використовується на /en/blog. ' +
        'Приклади: «Бюджет», «Платформи», «Медицина», «Юридичне».',
      type: 'localizedString',
      validation: (rule) => requireLocalizedUk('Назва UK обовʼязкова')(rule),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (внутрішнє значення)',
      description:
        'Стабільний ідентифікатор категорії. Це значення підставляється в URL фільтра: ' +
        '/blog?category=<slug>. Генерується з назви UK; після створення не змінюйте — ' +
        'інакше зовнішні посилання та закладки зламаються.',
      type: 'slug',
      options: {
        source: (doc) => pickLocalizedFirst((doc as {name?: unknown}).name),
        maxLength: 32,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'color',
      title: 'Колір (hex, напр. #0EA5E9)',
      description:
        'Колір акценту для пілюлі-фільтра. Формат — рівно 6 hex-символів із решіткою: #RRGGBB. ' +
        'Залиште порожнім, якщо хочете нейтральну сіру пілюлю.',
      type: 'string',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          if (HEX_COLOR_RX.test(String(value))) return true
          return 'Колір має бути у форматі #RRGGBB (6 hex-символів)'
        }),
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      description:
        'Чим менше число, тим лівіше пілюля у фільтрі. Однакові значення впорядковуються за датою створення.',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Порядок',
      name: 'order',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {name: 'name', slug: 'slug.current', color: 'color'},
    prepare({name, slug, color}) {
      const sub = [slug ? `slug: ${slug}` : '— без slug —', color]
        .filter(Boolean)
        .join(' · ')
      return {
        title: pickLocalizedFirst(name) || 'Категорія блогу',
        subtitle: sub,
      }
    },
  },
})
