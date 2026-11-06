import { useId } from 'react'
import { NOTE_PLACEMENTS } from '../../constants/notePlacements'
import { t } from '../../libs/i18n'
import type { NotePlacement } from '../../types/note'
import styles from './NotePlacementPicker.module.css'

type NotePlacementPickerProps = {
  value: NotePlacement
  onSelect: (placement: NotePlacement) => void
}

export default function NotePlacementPicker({ value, onSelect }: NotePlacementPickerProps) {
  const id = useId()

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{t('settings.defaultNotePlacement')}</legend>
      <div className={styles.choices}>
        {NOTE_PLACEMENTS.map((placement) => (
          <label
            key={placement}
            className={styles.choice}
            data-placement={placement}
            title={t(`placements.${placement}`)}
          >
            <input
              type="radio"
              className={styles.radio}
              name={id}
              value={placement}
              aria-label={t(`placements.${placement}`)}
              checked={value === placement}
              onChange={() => onSelect(placement)}
              onClick={() => {
                if (placement === value) onSelect(placement)
              }}
            />
            <span className={styles.preview} aria-hidden="true"><span className={styles.marker} /></span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
