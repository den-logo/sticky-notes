import { useId } from 'react'
import { NOTE_COLORS } from '../../constants/noteColors'
import { t } from '../../libs/i18n'
import type { NoteColor } from '../../types/note'
import styles from './ColorPicker.module.css'

type ColorPickerProps = {
  value: NoteColor
  onSelect: (color: NoteColor) => void
  label: string
  description?: string
  compact?: boolean
}

export default function ColorPicker({ value, onSelect, label, description, compact = false }: ColorPickerProps) {
  const id = useId()

  return (
    <fieldset
      className={styles.picker}
      data-compact={compact || undefined}
      aria-describedby={description ? `${id}-hint` : undefined}
    >
      <legend className={styles.label}>{label}</legend>
      <div className={styles.swatches}>
        {NOTE_COLORS.map((color) => (
          <input
            key={color}
            type="radio"
            name={id}
            className={styles.swatch}
            aria-label={t(`colors.${color}`)}
            title={t(`colors.${color}`)}
            value={color}
            checked={color === value}
            style={{ backgroundColor: `var(--color-note-${color})` }}
            onChange={() => onSelect(color)}
            onClick={() => {
              if (color === value) onSelect(color)
            }}
          />
        ))}
      </div>
      {description && <p id={`${id}-hint`} className={styles.hint}>{description}</p>}
    </fieldset>
  )
}
