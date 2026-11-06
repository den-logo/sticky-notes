import { useNoteDrag } from '../../hooks/useNoteDrag'
import { t } from '../../libs/i18n'
import type { Position, Size } from '../../types/geometry'
import type { NoteData } from '../../types/note'
import styles from './Note.module.css'

type NoteProps = {
  note: NoteData
  boardSize: Size
  onMove: (id: string, position: Position) => void
}

export default function Note({ note, boardSize, onMove }: NoteProps) {
  const { position, isDragging, handleProps } = useNoteDrag({ note, boardSize, onMove })

  return (
    <article
      className={styles.note}
      data-dragging={isDragging || undefined}
      style={{
        left: position.x,
        top: position.y,
        width: note.width,
        height: note.height,
      }}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={t('note.move')}
        title={t('note.moveHint')}
        {...handleProps}
      >
        <span className={styles.grip} aria-hidden="true" />
      </button>
      <p className={styles.text}>{note.text}</p>
    </article>
  )
}
