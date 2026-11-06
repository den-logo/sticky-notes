import { useId, useState } from 'react'
import { MAX_DEFAULT_NOTE_HEIGHT, MIN_NOTE_SIZE } from '../../constants/notes'
import { t } from '../../libs/i18n'
import type { Size } from '../../types/geometry'
import { isDefaultNoteSize } from '../../utils/isDefaultNoteSize'
import styles from './NoteSizeSettings.module.css'

type NoteSizeSettingsProps = {
  size: Size
  onCommit: (size: Size) => void
}

export default function NoteSizeSettings({ size, onCommit }: NoteSizeSettingsProps) {
  const id = useId()
  const [draft, setDraft] = useState<{ width: string; height: string } | null>(null)
  const [hasError, setHasError] = useState(false)
  const values = draft ?? { width: String(size.width), height: String(size.height) }
  const formatLimits = (text: string) => text
    .replace('{width}', String(MIN_NOTE_SIZE.width))
    .replace('{height}', String(MIN_NOTE_SIZE.height))
    .replace('{maxHeight}', String(MAX_DEFAULT_NOTE_HEIGHT))

  function commitSize() {
    const next = { width: Number(values.width), height: Number(values.height) }
    if (!isDefaultNoteSize(next)) {
      setHasError(true)
      return
    }
    onCommit(next)
    setDraft(null)
    setHasError(false)
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{t('settings.defaultNoteSize')}</legend>
      <div className={styles.fields}>
        {(['width', 'height'] as const).map((dimension) => (
          <label key={dimension} className={styles.label}>
            {t(`settings.${dimension}`)}
            <input
              type="number"
              className={styles.input}
              min={MIN_NOTE_SIZE[dimension]}
              max={dimension === 'height' ? MAX_DEFAULT_NOTE_HEIGHT : undefined}
              step={1}
              value={values[dimension]}
              aria-invalid={hasError || undefined}
              aria-describedby={`${id}-hint${hasError ? ` ${id}-error` : ''}`}
              onChange={(event) => setDraft({ ...values, [dimension]: event.currentTarget.value })}
              onBlur={commitSize}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitSize()
                }
              }}
            />
          </label>
        ))}
      </div>
      <p id={`${id}-hint`} className={styles.hint}>{formatLimits(t('settings.sizeHint'))}</p>
      {hasError && <p id={`${id}-error`} className={styles.error} role="alert">{formatLimits(t('settings.sizeInvalid'))}</p>}
    </fieldset>
  )
}
