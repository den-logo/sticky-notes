import { MIN_NOTE_SIZE } from '../../constants/notes'
import { useNoteInteraction } from '../../hooks/useNoteInteraction'
import { t } from '../../libs/i18n'
import { Icon } from '../../libs/icons'
import type { Position, Size } from '../../types/geometry'
import type { NoteData } from '../../types/note'
import styles from './Note.module.css'

type NoteProps = {
  note: NoteData
  boardSize: Size
  onMove: (id: string, position: Position) => void
  onResize: (id: string, size: Size) => void
}

export default function Note({ note, boardSize, onMove, onResize }: NoteProps) {
  const { geometry, isDragging, isResizing, moveHandleProps, resizeHandleProps } =
    useNoteInteraction({ note, boardSize, onMove, onResize })
  const canResize = boardSize.width - note.x >= MIN_NOTE_SIZE.width &&
    boardSize.height - note.y >= MIN_NOTE_SIZE.height

  return (
    <article
      className={styles.note}
      data-dragging={isDragging || undefined}
      data-resizing={isResizing || undefined}
      style={{
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        height: geometry.height,
      }}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={t('note.move')}
        title={t('note.moveHint')}
        {...moveHandleProps}
      >
        <span className={styles.grip} aria-hidden="true" />
      </button>
      <p className={styles.text}>{note.text}</p>
      <button
        type="button"
        className={styles.resizeHandle}
        aria-label={t('note.resize')}
        title={t('note.resizeHint')}
        disabled={!canResize}
        {...resizeHandleProps}
      >
        <Icon name="resize" size={18} />
      </button>
    </article>
  )
}
