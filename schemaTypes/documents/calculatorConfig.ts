import {ControlsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {requireLocalizedUk} from '../lib/validators'

/**
 * Single source of truth for the website-cost calculator (v3).
 *
 * Consolidates the 13 v2 calculator singletons into one document, pinned to
 * the fixed `_id` "calculatorConfig" via structure/index.ts. Dropped vs v2:
 * presets, maintenance, and seoGrowth (recurring plans moved off the
 * calculator). Timeline is now a flat additive USD fee (`price`), not a
 * percentage multiplier — only languages + design keep `percent`.
 */

const checkboxOptionFields = () => [
  defineField({name: 'optionKey', title: 'Ключ опції (стабільний id)', type: 'string', validation: (r) => r.required()}),
  defineField({name: 'label', title: 'Назва', type: 'localizedString', validation: (r) => requireLocalizedUk('UK обовʼязкова')(r)}),
  defineField({name: 'hint', title: 'Підказка (тултіп)', type: 'localizedText'}),
  defineField({name: 'price', title: 'Ціна (USD, разово)', type: 'number', initialValue: 0, validation: (r) => r.min(0)}),
  defineField({name: 'included', title: 'Включено за замовчуванням', type: 'boolean', initialValue: false}),
]

export const calculatorConfig = defineType({
  name: 'calculatorConfig',
  title: 'Калькулятор — конфігурація',
  type: 'document',
  icon: ControlsIcon,
  groups: [
    {name: 'core', title: 'Основне'},
    {name: 'modifiers', title: 'Модифікатори'},
    {name: 'addons', title: 'Додатки'},
    {name: 'settings', title: 'Налаштування'},
  ],
  fields: [
    // ---- settings (flat) ----
    defineField({
      name: 'defaultProjectType',
      title: 'Тип проєкту за замовчуванням',
      type: 'string',
      group: 'settings',
      options: {list: ['landing', 'multiPage', 'ecommerce']},
      initialValue: 'multiPage',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'roundStep',
      title: 'Крок округлення підсумку (USD)',
      type: 'number',
      group: 'settings',
      initialValue: 50,
      validation: (r) => r.required().min(1),
    }),

    // ---- projectTypes ----
    defineField({
      name: 'projectTypes',
      title: 'Типи проєктів',
      type: 'array',
      group: 'core',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'projectTypeRow',
          fields: [
            defineField({
              name: 'projectKey',
              title: 'Ключ (camelCase, напр. landing / multiPage / ecommerce)',
              type: 'string',
              validation: (r) => r.required().regex(/^[a-z][a-zA-Z0-9]*$/, {name: 'camelCase'}).max(40),
            }),
            defineField({name: 'label', title: 'Назва', type: 'localizedString', validation: (r) => requireLocalizedUk('UK обовʼязкова')(r)}),
            defineField({name: 'hint', title: 'Підказка (тултіп)', type: 'localizedText'}),
            defineField({name: 'basePrice', title: 'Базова ціна (USD)', type: 'number', validation: (r) => r.required().min(0)}),
            defineField({name: 'hasProductComplexity', title: 'Показувати складність товарів', type: 'boolean', initialValue: false}),
            defineField({
              name: 'pages',
              title: 'Діапазон сторінок',
              type: 'object',
              fields: [
                defineField({name: 'min', title: 'Мінімум', type: 'number', validation: (r) => r.required().min(1)}),
                defineField({name: 'max', title: 'Максимум', type: 'number', validation: (r) => r.required().min(1)}),
                defineField({name: 'defaultValue', title: 'За замовчуванням', type: 'number', validation: (r) => r.required()}),
                defineField({name: 'included', title: 'Вже у базі', type: 'number', validation: (r) => r.required().min(0)}),
                defineField({name: 'extraPrice', title: 'Ціна за додаткову сторінку', type: 'number', validation: (r) => r.required().min(0)}),
              ],
            }),
          ],
        }),
      ],
    }),

    // ---- productComplexity ----
    defineField({
      name: 'productComplexity',
      title: 'Складність товарів (для e-commerce)',
      type: 'array',
      group: 'core',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'productComplexityOption',
          fields: [
            defineField({name: 'optionKey', title: 'Ключ', type: 'string', options: {list: ['simple', 'medium', 'advanced']}, validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Назва', type: 'localizedString', validation: (r) => requireLocalizedUk('UK обовʼязкова')(r)}),
            defineField({name: 'hint', title: 'Підказка (тултіп)', type: 'localizedText'}),
            defineField({name: 'price', title: 'Ціна (USD)', type: 'number', initialValue: 0, validation: (r) => r.min(0)}),
          ],
        }),
      ],
    }),

    // ---- design (keeps percent multiplier) ----
    defineField({
      name: 'design',
      title: 'Дизайн (множник)',
      type: 'array',
      group: 'modifiers',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'designOption',
          fields: [
            defineField({name: 'optionKey', title: 'Ключ', type: 'string', options: {list: ['simple', 'custom', 'advanced']}, validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Назва', type: 'localizedString', validation: (r) => requireLocalizedUk('UK обовʼязкова')(r)}),
            defineField({name: 'hint', title: 'Підказка (тултіп)', type: 'localizedText'}),
            defineField({name: 'percent', title: 'Множник (0–1)', type: 'number', validation: (r) => r.required().min(0).max(1)}),
          ],
        }),
      ],
    }),

    // ---- languages (keeps percent multiplier) ----
    defineField({
      name: 'languages',
      title: 'Мови (множник)',
      type: 'array',
      group: 'modifiers',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'languageOption',
          fields: [
            defineField({name: 'optionKey', title: 'Ключ', type: 'string', options: {list: ['one', 'two', 'three', 'fourPlus']}, validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Назва', type: 'localizedString', validation: (r) => requireLocalizedUk('UK обовʼязкова')(r)}),
            defineField({name: 'percent', title: 'Множник (0–1)', type: 'number', validation: (r) => r.required().min(0).max(1)}),
          ],
        }),
      ],
    }),

    // ---- timeline (NOW flat additive price, not percent) ----
    defineField({
      name: 'timeline',
      title: 'Терміни (доплата, USD)',
      type: 'array',
      group: 'modifiers',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'timelineOption',
          fields: [
            defineField({name: 'optionKey', title: 'Ключ', type: 'string', options: {list: ['standard', 'faster', 'urgent']}, validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Назва', type: 'localizedString', validation: (r) => requireLocalizedUk('UK обовʼязкова')(r)}),
            defineField({name: 'hint', title: 'Підказка (тултіп)', type: 'localizedText'}),
            defineField({name: 'price', title: 'Доплата (USD)', type: 'number', initialValue: 0, validation: (r) => r.required().min(0)}),
          ],
        }),
      ],
    }),

    // ---- contentOptions ----
    defineField({
      name: 'contentOptions',
      title: 'Контент',
      type: 'array',
      group: 'addons',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'contentOption',
          fields: [
            defineField({name: 'optionKey', title: 'Ключ', type: 'string', options: {list: ['clientProvided', 'lightPolishing', 'fullCopywriting', 'seoCopywriting']}, validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Назва', type: 'localizedString', validation: (r) => requireLocalizedUk('UK обовʼязкова')(r)}),
            defineField({name: 'price', title: 'Ціна (USD)', type: 'number', initialValue: 0, validation: (r) => r.min(0)}),
          ],
        }),
      ],
    }),

    // ---- cmsUpgrades ----
    defineField({
      name: 'cmsUpgrades',
      title: 'CMS',
      type: 'array',
      group: 'addons',
      of: [defineArrayMember({type: 'object', name: 'cmsOption', fields: checkboxOptionFields()})],
    }),

    // ---- seoOptions ----
    defineField({
      name: 'seoOptions',
      title: 'SEO',
      type: 'array',
      group: 'addons',
      of: [defineArrayMember({type: 'object', name: 'seoOption', fields: checkboxOptionFields()})],
    }),

    // ---- features (has featureGroup) ----
    defineField({
      name: 'features',
      title: 'Функціонал',
      type: 'array',
      group: 'addons',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'featureOption',
          fields: [
            ...checkboxOptionFields(),
            defineField({
              name: 'featureGroup',
              title: 'Підгрупа',
              type: 'string',
              options: {
                list: [
                  {title: 'Lead capture', value: 'leadCapture'},
                  {title: 'Conversion & tracking', value: 'conversion'},
                  {title: 'Advanced UX', value: 'advancedUx'},
                ],
              },
              validation: (r) => r.required(),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Калькулятор — конфігурація'})},
})
