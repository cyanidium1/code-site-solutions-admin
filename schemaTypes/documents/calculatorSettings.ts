import {ControlsIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const calculatorSettings = defineType({
  name: 'calculatorSettings',
  title: 'Калькулятор — налаштування',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'defaultProjectType',
      title: 'Тип проєкту за замовчуванням',
      type: 'string',
      options: {list: ['landing', 'multiPage', 'ecommerce']},
      initialValue: 'multiPage',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'roundStep',
      title: 'Крок округлення підсумкової ціни (USD)',
      type: 'number',
      initialValue: 50,
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'highEstimateFactor',
      title: 'Коефіцієнт верхньої межі (1.25 = +25%)',
      type: 'number',
      initialValue: 1.25,
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Калькулятор — налаштування'}
    },
  },
})
