import {ImagesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {sectionHeaderFields} from '../lib/sectionHeader'
import {pairedCta} from '../lib/validators'

export const imageTextBlock = defineType({
  name: 'imageTextBlock',
  title: 'Зображення + текст',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'variant',
      title: 'Варіант',
      type: 'string',
      options: {
        list: [
          {title: 'Side (текст збоку)', value: 'side'},
          {title: 'Side з bullet-списком', value: 'side-with-list'},
          {title: 'Centered', value: 'centered'},
        ],
        layout: 'radio',
      },
      initialValue: 'side',
    }),
    defineField({
      name: 'imageVariant',
      title: 'Позиція зображення',
      type: 'string',
      options: {
        list: [
          {title: 'Зліва', value: 'imageLeft'},
          {title: 'Справа', value: 'imageRight'},
        ],
        layout: 'radio',
      },
      initialValue: 'imageRight',
    }),
    defineField({
      name: 'imageFit',
      title: 'Відображення зображення',
      description:
        '"Cover" — кадрує зображення у фіксовану рамку 4:3. "Natural" — показує зображення повністю у власних пропорціях (для широких скріншотів, напр. Google Search Console).',
      type: 'string',
      options: {
        list: [
          {title: 'Cover (кадрування 4:3)', value: 'cover'},
          {title: 'Natural (без кадрування)', value: 'natural'},
        ],
        layout: 'radio',
      },
      initialValue: 'cover',
      hidden: ({parent}) => parent?.variant === 'centered',
    }),
    ...sectionHeaderFields(),
    defineField({name: 'body', title: 'Опис (UK)', type: 'richTextSimple'}),
    defineField({name: 'bodyEn', title: 'Description (EN)', type: 'richTextSimple'}),
    defineField({
      name: 'bulletList',
      title: 'Bullet-список (для варіанта side-with-list)',
      type: 'array',
      of: [defineArrayMember({type: 'localizedString'})],
    }),
    defineField({
      name: 'bulletIcon',
      title: 'Іконка bullet-списку',
      description: 'Стиль маркера перед кожним пунктом списку.',
      type: 'string',
      options: {
        list: [
          {title: 'Галочка (✓)', value: 'check'},
          {title: 'Хрестик (✕)', value: 'cross'},
          {title: 'Крапка (•)', value: 'dot'},
        ],
        layout: 'radio',
      },
      initialValue: 'check',
      hidden: ({parent}) => !(parent?.bulletList && parent.bulletList.length > 0),
    }),
    defineField({name: 'image', title: 'Зображення', type: 'imageWithLocalizedAlt'}),
    defineField({
      name: 'image2',
      title: 'Друге зображення (centered + horizontal)',
      description:
        'Використовується лише коли варіант = "Centered" і Centered layout = "Horizontal". Рендериться справа від тексту, перше зображення (`image`) — зліва.',
      type: 'imageWithLocalizedAlt',
      hidden: ({parent}) => parent?.variant !== 'centered',
    }),
    defineField({
      name: 'centeredLayout',
      title: 'Centered layout',
      type: 'string',
      options: {
        list: [
          {title: 'Vertical (зображення зверху над текстом)', value: 'vertical'},
          {title: 'Horizontal (текст по центру, два зображення з боків)', value: 'horizontal'},
        ],
        layout: 'radio',
      },
      initialValue: 'vertical',
      hidden: ({parent}) => parent?.variant !== 'centered',
    }),
    defineField({
      name: 'cta',
      title: 'CTA (опційно)',
      type: 'ctaAction',
      validation: (rule) => pairedCta()(rule),
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      media: 'image.image',
      variant: 'variant',
    },
    prepare({heading, media, variant}) {
      return {
        title: pickLocalizedFirst(heading) || 'Image + Text',
        subtitle: ['Image+Text', variant].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
