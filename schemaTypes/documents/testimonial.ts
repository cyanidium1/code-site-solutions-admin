import {CommentIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Client testimonial. Rendered by the frontend on the homepage,
 * /rozrobka-saitiv, package pages and the Ads landing (TZ v2 §3.12).
 *
 * `pending: true` marks a placeholder waiting for the client's own words —
 * the frontend never renders it, and Review schema is only emitted for
 * non-pending entries with a rating.
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Відгук клієнта',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'pending',
      title: 'Чекає тексту від клієнта (не показується на сайті)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({name: 'authorName', title: "Ім'я", type: 'string', validation: (r) => r.required()}),
    defineField({name: 'company', title: 'Компанія', type: 'string'}),
    defineField({name: 'authorRole', title: 'Посада / підпис', type: 'localizedString'}),
    defineField({name: 'country', title: 'Країна', type: 'string', description: 'Напр. Україна, Данія'}),
    defineField({name: 'photo', title: 'Фото', type: 'imageWithLocalizedAlt'}),
    defineField({name: 'quote', title: 'Текст відгуку', type: 'localizedText'}),
    defineField({
      name: 'caseRef',
      title: 'Кейс',
      type: 'reference',
      to: [{type: 'caseStudy'}],
    }),
    defineField({name: 'caseLabel', title: 'Підпис посилання на кейс', type: 'localizedString'}),
    defineField({name: 'authorInitials', title: 'Ініціали (якщо немає фото)', type: 'string'}),
    defineField({name: 'linkedinUrl', title: 'LinkedIn', type: 'url'}),
    defineField({name: 'mockupLeft', title: 'Мокап зліва (слайдер)', type: 'imageWithLocalizedAlt'}),
    defineField({name: 'mockupRight', title: 'Мокап справа (слайдер)', type: 'imageWithLocalizedAlt'}),
    defineField({name: 'featured', title: 'Показувати на сайті', type: 'boolean', initialValue: true}),
    defineField({name: 'order', title: 'Порядок', type: 'number'}),
    defineField({
      name: 'rating',
      title: 'Оцінка 1–5 (для Review schema)',
      type: 'number',
      validation: (r) => r.min(1).max(5),
    }),
    defineField({name: 'reviewDate', title: 'Дата відгуку', type: 'date'}),
    defineField({name: 'reviewHeadline', title: 'Заголовок відгуку', type: 'localizedString'}),
  ],
  preview: {
    select: {title: 'authorName', subtitle: 'company', pending: 'pending'},
    prepare: ({title, subtitle, pending}) => ({
      title: `${pending ? '⏳ ' : ''}${title ?? ''}`,
      subtitle,
    }),
  },
})
