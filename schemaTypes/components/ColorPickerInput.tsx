import {useCallback} from 'react'
import {set, unset, type StringInputProps} from 'sanity'

/**
 * Color-picker input for the `blogCategoryOption.color` field.
 *
 * Keeps the underlying data as a 6-char hex string (`#RRGGBB`) so the
 * existing schema validation and the frontend's `category.color` projection
 * keep working unchanged. Renders the browser's native color picker next
 * to the default text input — editors can either click the swatch or paste
 * a hex value, and the two stay in sync via standard `set`/`unset` patches.
 *
 * Empty string is treated as "no color" (the field is optional). When the
 * picker is touched it always emits a hex, so to clear the value editors
 * use the existing text input (clear + commit) — typical Sanity pattern.
 */
export function ColorPickerInput(props: StringInputProps) {
  const {value, onChange, renderDefault} = props

  // Normalise to a valid value for the native picker (which requires a hex).
  const pickerValue = /^#[0-9A-Fa-f]{6}$/.test(value ?? '') ? (value as string) : '#000000'

  const onPick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value.toUpperCase()
      onChange(next ? set(next) : unset())
    },
    [onChange],
  )

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <input
        type="color"
        value={pickerValue}
        onChange={onPick}
        aria-label="Колір (палітра)"
        style={{
          width: 40,
          height: 36,
          padding: 0,
          border: '1px solid var(--card-border-color, #ddd)',
          borderRadius: 4,
          background: 'transparent',
          cursor: 'pointer',
        }}
      />
      <div style={{flex: 1}}>{renderDefault(props)}</div>
    </div>
  )
}
