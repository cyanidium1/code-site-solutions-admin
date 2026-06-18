import {RocketIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * In-article CTA callout. Used both mid-article and at the end.
 * Visually mirrors the homepage CtaBanner condensed for inline body
 * use. Secondary CTA is optional (typically a Telegram link).
 */
export const ctaCallout = defineType({
  name: 'ctaCallout',
  title: 'CTA-блок (всередині статті)',
  type: 'object',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow (mono uppercase)',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Заголовок',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sub',
      title: 'Підзаголовок',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Текст основної кнопки',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ctaHref',
      title: 'URL основної кнопки',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ctaSecondaryLabel',
      title: 'Текст вторинної кнопки (опц.)',
      type: 'string',
    }),
    defineField({
      name: 'ctaSecondaryHref',
      title: 'URL вторинної кнопки (опц.)',
      type: 'string',
      // Вторинна кнопка має бути або повною (текст + URL), або порожньою:
      // текст без URL рендериться як мертве посилання.
      validation: (rule) =>
        rule.custom((href, context) => {
          const label = (context.parent as {ctaSecondaryLabel?: string})?.ctaSecondaryLabel
          if (Boolean(label?.trim()) !== Boolean(href?.trim())) {
            return 'Заповніть і текст, і URL вторинної кнопки — або залиште обидва порожніми'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      return {
        title: heading || 'CTA',
        subtitle: 'CTA callout',
      }
    },
  },
})
