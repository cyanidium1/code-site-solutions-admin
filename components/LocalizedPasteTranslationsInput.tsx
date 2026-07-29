/**
 * Wraps localized object inputs (string / text / block content) with:
 * - Collapsible layout + labeled locale snippets (localizedString / localizedText)
 * - Collapsed: preview + Expand + Paste only; expanded: locale fields + Copy EN + Paste
 * - "Paste translations…" (JSON, ---EN---, EN: — JSON / ---UK--- / UK: formats)
 */

import React, {useCallback, useEffect, useId, useState} from 'react'
import {createPortal} from 'react-dom'
import {Box, Button, Card, Code, Flex, Stack, Text, TextArea, Tooltip} from '@sanity/ui'
import {PatchEvent, set, type ObjectInputProps} from 'sanity'
import {
  parseLocalizedPaste,
  type ParseLocalizedPasteSuccess,
} from '../lib/localizedPaste/parseLocalizedPaste'
import {
  mergeLocalizedBlockContent,
  mergeLocalizedScalar,
} from '../lib/localizedPaste/mergeLocalizedPaste'
import {plainTextToPortableTextBlocks} from '../lib/localizedPaste/plainTextToPtBlocks'
import {PRIMARY_LOCALE_ID, PROJECT_LOCALE_IDS} from '../lib/localizedPaste/projectLocales'

/** localizedSlug excluded: legacy unused type; bulk paste risks invalid URL segments without validation. */
const SUPPORTED_TYPES = new Set(['localizedString', 'localizedText', 'localizedRichText', 'localizedBlogBody'])

const SCALAR_LOCALE_TYPES = new Set(['localizedString', 'localizedText'])

const LOCALE_PREVIEW_LABEL: Record<string, string> = {
  uk: 'UK',
  en: 'EN',
}

/** Max locale lines in collapsed preview before "+N more" */
const MAX_LOCALE_PREVIEW_LINES = 3
const MAX_SNIPPET_CHARS = 56

type Props = ObjectInputProps

/** Locale-labeled lines for collapsed preview; up to MAX_LOCALE_PREVIEW_LINES, then "+N more". */
function buildCollapsedLocalePreview(v: Record<string, unknown> | undefined): string[] {
  const out: string[] = []
  if (!v) {
    out.push('No translations yet')
    return out
  }
  const filledIds = PROJECT_LOCALE_IDS.filter((id) => {
    const s = v[id]
    return typeof s === 'string' && s.trim().length > 0
  })
  const total = filledIds.length
  if (total === 0) {
    out.push('No translations yet')
    return out
  }
  const shownIds = filledIds.slice(0, MAX_LOCALE_PREVIEW_LINES)
  for (const id of shownIds) {
    const raw = String(v[id]).trim().replace(/\s+/g, ' ')
    const snippet =
      raw.length > MAX_SNIPPET_CHARS ? `${raw.slice(0, Math.max(0, MAX_SNIPPET_CHARS - 1))}…` : raw
    const tag = LOCALE_PREVIEW_LABEL[id] ?? id.toUpperCase()
    out.push(`${tag}: ${snippet}`)
  }
  const hidden = total - shownIds.length
  if (hidden > 0) {
    out.push(`+${hidden} more`)
  }
  return out
}

function buildPreviewText(typeName: string, r: ParseLocalizedPasteSuccess): string {
  const parts: string[] = [`Detected format: ${r.format}`]
  const locales = PROJECT_LOCALE_IDS.filter((id) => r.values[id])
  parts.push(`Locales with content: ${locales.join(', ') || '(none)'}`)
  for (const id of locales) {
    const raw = r.values[id] as string
    if (typeName === 'localizedRichText' || typeName === 'localizedBlogBody') {
      const n = plainTextToPortableTextBlocks(raw).length
      parts.push(`  · ${id}: ${n} Portable Text block(s), ${raw.length} chars`)
    } else {
      parts.push(`  · ${id}: ${raw.length} characters`)
    }
  }
  if (r.warnings.length) parts.push(`Warnings: ${r.warnings.join(' | ')}`)
  if (r.unknownJsonKeys.length) parts.push(`Ignored JSON keys: ${r.unknownJsonKeys.join(', ')}`)
  parts.push('Only pasted locales are updated; other languages stay as they are.')
  return parts.join('\n')
}

/** Shown in tooltip */
const FORMAT_EXAMPLES_TOOLTIP = (
  <Box padding={2} style={{maxWidth: 340, maxHeight: 'min(50vh, 260px)', overflowY: 'auto'}}>
    <Stack space={3}>
      <Text size={1} weight="semibold">
        Separator
      </Text>
      <Code size={1} language="text">{`---UK---
Абзац.

---EN---
Paragraph.`}</Code>
      <Text size={1} weight="semibold">
        Labels
      </Text>
      <Code size={1} language="text">{`UK:
Текст

EN:
Text`}</Code>
      <Text size={1} weight="semibold">
        JSON
      </Text>
      <Code size={1} language="text">{`{"en":"Hello","uk":"Привіт"}`}</Code>
      <Text muted size={1}>
        Locales: uk, en (aliases: UA→uk, ENG→en). CSV not supported.
      </Text>
    </Stack>
  </Box>
)

function PasteModal({
  open,
  onClose,
  title,
  draft,
  setDraft,
  parseError,
  setParseError,
  previewText,
  setPreviewText,
  onPreview,
  onApply,
}: {
  open: boolean
  onClose: () => void
  title: string
  draft: string
  setDraft: (s: string) => void
  parseError: string | null
  setParseError: (s: string | null) => void
  previewText: string | null
  setPreviewText: (s: string | null) => void
  onPreview: () => void
  onApply: () => void
}) {
  const labelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <Box
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Card
        role="dialog"
        aria-modal
        aria-labelledby={labelId}
        padding={4}
        radius={2}
        shadow={3}
        style={{width: 'min(720px, 100%)', maxHeight: '92vh', overflow: 'auto'}}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Stack space={4}>
          <Text id={labelId} size={2} weight="semibold">
            Paste translations — {title}
          </Text>
          <Flex align="center" gap={3} wrap="wrap" justify="space-between">
            <Text muted size={1} style={{flex: '1 1 200px'}}>
              Use <strong>---EN---</strong> blocks, <strong>EN:</strong> labels, or <strong>JSON</strong>. Preview,
              then Apply. CSV / comma-rows are not supported.
            </Text>
            <Tooltip content={FORMAT_EXAMPLES_TOOLTIP} placement="top" portal>
              <Button
                mode="ghost"
                text="Examples"
                fontSize={1}
                padding={2}
                aria-label="Show paste format examples (hover or focus)"
              />
            </Tooltip>
          </Flex>
          <TextArea
            rows={14}
            value={draft}
            onChange={(e) => {
              setDraft(e.currentTarget.value)
              setParseError(null)
              setPreviewText(null)
            }}
            placeholder="Paste JSON, ---EN--- blocks, or EN: labels…"
          />
          {parseError ? (
            <Card padding={3} radius={2} tone="critical">
              <Text size={1}>{parseError}</Text>
            </Card>
          ) : null}
          {previewText ? (
            <Card padding={3} radius={2} tone="transparent" border>
              <Box
                as="pre"
                style={{
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  fontSize: '0.8125rem',
                  fontFamily: 'inherit',
                }}
              >
                {previewText}
              </Box>
            </Card>
          ) : null}
          <Flex gap={2} justify="flex-end" wrap="wrap">
            <Button mode="ghost" text="Cancel" onClick={onClose} />
            <Button mode="ghost" text="Preview" onClick={onPreview} />
            <Button
              tone="primary"
              text="Apply to field"
              onClick={onApply}
              disabled={!previewText}
              title={
                previewText
                  ? 'Merge parsed locales into this field'
                  : 'Use Preview first to confirm the paste is valid'
              }
            />
          </Flex>
        </Stack>
      </Card>
    </Box>,
    document.body,
  )
}

export function LocalizedPasteTranslationsInput(props: Props) {
  const {value = {}, onChange, renderDefault, readOnly, schemaType} = props
  const typeName = schemaType.name
  const supported = SUPPORTED_TYPES.has(typeName)
  const isScalarLocale = SCALAR_LOCALE_TYPES.has(typeName)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(true)

  const doPreview = useCallback(() => {
    const result = parseLocalizedPaste(draft)
    if (!result.ok) {
      setParseError(result.error)
      setPreviewText(null)
      return
    }
    setParseError(null)
    setPreviewText(buildPreviewText(typeName, result))
  }, [draft, typeName])

  const doApply = useCallback(() => {
    const result = parseLocalizedPaste(draft)
    if (!result.ok) {
      setParseError(result.error)
      setPreviewText(null)
      return
    }

    let merged: Record<string, unknown>
    if (typeName === 'localizedRichText' || typeName === 'localizedBlogBody') {
      merged = mergeLocalizedBlockContent(value as Record<string, unknown> | undefined, result.values)
    } else if (typeName === 'localizedText') {
      merged = mergeLocalizedScalar(value as Record<string, unknown> | undefined, result.values, 'text')
    } else {
      merged = mergeLocalizedScalar(value as Record<string, unknown> | undefined, result.values, 'string')
    }

    onChange(PatchEvent.from(set(merged)))
    setOpen(false)
    setDraft('')
    setPreviewText(null)
    setParseError(null)
  }, [draft, onChange, typeName, value])

  const copyPrimaryToAll = useCallback(() => {
    const v = value as Record<string, unknown> | undefined
    const primary = v?.[PRIMARY_LOCALE_ID]
    if (primary === undefined || primary === null) return
    const str = typeof primary === 'string' ? primary : String(primary)
    const next: Record<string, unknown> = {...v}
    for (const id of PROJECT_LOCALE_IDS) next[id] = str
    onChange(PatchEvent.from(set(next)))
  }, [value, onChange])

  const defaultNode = renderDefault(props)

  const primaryHasText =
    typeof (value as Record<string, unknown>)?.[PRIMARY_LOCALE_ID] === 'string' &&
    String((value as Record<string, unknown>)[PRIMARY_LOCALE_ID]).trim().length > 0

  if (!supported || readOnly) {
    return <>{defaultNode}</>
  }

  const pasteButton = (
    <Button mode="ghost" text="Paste translations…" onClick={() => setOpen(true)} fontSize={1} />
  )

  const expandedActions = (
    <Flex gap={2} wrap="wrap" align="center" justify="flex-start">
      <Button mode="ghost" text="Collapse" onClick={() => setCollapsed(true)} fontSize={1} />
      <Button
        mode="default"
        tone="primary"
        text="Copy UK to all"
        onClick={copyPrimaryToAll}
        disabled={!primaryHasText}
        title={primaryHasText ? 'Copy Ukrainian value into every locale' : 'Add Ukrainian text first'}
        fontSize={1}
      />
      {pasteButton}
    </Flex>
  )

  if (isScalarLocale) {
    const previewLines = buildCollapsedLocalePreview(value as Record<string, unknown>)

    return (
      <Stack space={3}>
        {collapsed ? (
          <Card padding={2} radius={2} tone="transparent" border>
            <Stack space={2}>
              <Stack space={2}>
                {previewLines.map((line, i) => (
                  <Text key={i} muted size={1} style={{lineHeight: 1.5, wordBreak: 'break-word'}}>
                    {line}
                  </Text>
                ))}
              </Stack>
              <Flex gap={2} wrap="wrap" align="center" justify="flex-end">
                <Button mode="ghost" text="Expand" onClick={() => setCollapsed(false)} fontSize={1} />
                {pasteButton}
              </Flex>
            </Stack>
          </Card>
        ) : null}
        {!collapsed ? (
          <Stack space={3}>
            {expandedActions}
            {defaultNode}
          </Stack>
        ) : null}
        <PasteModal
          open={open}
          onClose={() => {
            setOpen(false)
            setDraft('')
            setParseError(null)
            setPreviewText(null)
          }}
          title={schemaType.title || typeName}
          draft={draft}
          setDraft={setDraft}
          parseError={parseError}
          setParseError={setParseError}
          previewText={previewText}
          setPreviewText={setPreviewText}
          onPreview={doPreview}
          onApply={doApply}
        />
      </Stack>
    )
  }

  return (
    <Stack space={3}>
      {defaultNode}
      <Flex>{pasteButton}</Flex>
      <PasteModal
        open={open}
        onClose={() => {
          setOpen(false)
          setDraft('')
          setParseError(null)
          setPreviewText(null)
        }}
        title={schemaType.title || typeName}
        draft={draft}
        setDraft={setDraft}
        parseError={parseError}
        setParseError={setParseError}
        previewText={previewText}
        setPreviewText={setPreviewText}
        onPreview={doPreview}
        onApply={doApply}
      />
    </Stack>
  )
}
