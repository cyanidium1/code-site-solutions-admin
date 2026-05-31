import {PackageIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorPresets = defineType({
  name: 'calculatorPresets',
  title: 'Калькулятор — Пресети',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'presets',
      title: 'Пресети',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'presetRow',
          fields: [
            defineField({
              name: 'presetKey',
              title: 'Ключ пресета (camelCase id)',
              description:
                'Стабільний ідентифікатор у camelCase, без пробілів. Заблокований після збереження. ' +
                'Додавайте нові пресети за потребою (напр. saasMarketing, agencyPortfolio).',
              type: 'string',
              validation: (r) =>
                r
                  .required()
                  .regex(/^[a-z][a-zA-Z0-9]*$/, {name: 'camelCase'})
                  .max(40),
              readOnly: ({parent}) => Boolean((parent as {presetKey?: string} | undefined)?.presetKey),
            }),
            defineField({
              name: 'title',
              title: 'Назва',
              type: 'localizedString',
              validation: (r) => requireLocalizedUk('UK обовʼязкова')(r),
            }),
            defineField({name: 'badge', title: 'Бейдж', type: 'localizedString'}),
            defineField({name: 'bestFor', title: 'Для кого', type: 'localizedText'}),
            defineField({
              name: 'includes',
              title: 'Що входить',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
              validation: (r) => r.min(1),
            }),
            defineField({
              name: 'estimatedRange',
              title: 'Відображувана ціна (напр. "$1,500 - $2,500")',
              type: 'localizedString',
            }),
            defineField({name: 'compareAnchor', title: 'Порівняння', type: 'localizedText'}),
            defineField({
              name: 'appliedInput',
              title: 'Стан калькулятора при кліку',
              type: 'object',
              fields: [
                defineField({
                  name: 'projectType',
                  description:
                    'Має співпадати з projectKey однієї з записів у документі "Типи проєктів". ' +
                    'Не обмежено фіксованим списком — підтримує кастомні типи.',
                  type: 'string',
                  validation: (r) =>
                    r.required().regex(/^[a-z][a-zA-Z0-9]*$/, {name: 'camelCase'}),
                }),
                defineField({name: 'pages', type: 'number', validation: (r) => r.required().min(1)}),
                defineField({
                  name: 'productComplexity',
                  type: 'string',
                  options: {list: ['simple', 'medium', 'advanced']},
                  initialValue: 'simple',
                }),
                defineField({
                  name: 'designComplexity',
                  type: 'string',
                  options: {list: ['simple', 'custom', 'advanced']},
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: 'languages',
                  type: 'string',
                  options: {list: ['one', 'two', 'three', 'fourPlus']},
                  validation: (r) => r.required(),
                }),
                defineField({name: 'cmsUpgradeIds', type: 'array', of: [{type: 'string'}]}),
                defineField({name: 'seoOptionIds', type: 'array', of: [{type: 'string'}]}),
                defineField({name: 'featureIds', type: 'array', of: [{type: 'string'}]}),
                defineField({
                  name: 'contentOption',
                  type: 'string',
                  options: {list: ['clientProvided', 'lightPolishing', 'fullCopywriting', 'seoCopywriting']},
                  initialValue: 'clientProvided',
                }),
                defineField({
                  name: 'timeline',
                  type: 'string',
                  options: {list: ['standard', 'faster', 'urgent']},
                  initialValue: 'standard',
                }),
                defineField({
                  name: 'maintenancePlan',
                  type: 'string',
                  options: {list: ['none', 'basic', 'growth', 'dedicated']},
                  initialValue: 'none',
                }),
                defineField({
                  name: 'seoGrowthPlan',
                  type: 'string',
                  options: {list: ['none', 'basicSeo', 'growthSeo', 'contentEngine']},
                  initialValue: 'none',
                }),
              ],
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: {title: 'title', presetKey: 'presetKey', range: 'estimatedRange'},
            prepare({title, presetKey, range}) {
              return {
                title: pickLocalizedFirst(title) || presetKey || '—',
                subtitle: pickLocalizedFirst(range) || '—',
              }
            },
          },
        }),
      ],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: {presets: 'presets'},
    prepare({presets}) {
      const count = Array.isArray(presets) ? presets.length : 0
      return {title: 'Пресети', subtitle: `${count} рядків`}
    },
  },
})
