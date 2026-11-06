import { MIN_NOTE_SIZE } from '../../constants/notes'
import { useNoteInteraction } from '../../hooks/useNoteInteraction'
import { t } from '../../libs/i18n'
import { Icon } from '../../libs/icons'
import type { Position, Size } from '../../types/geometry'
import type { NoteColor, NoteData } from '../../types/note'
import type { NoteDragHandlers } from '../../types/noteDrag'
import styles from './Note.module.css'
import NoteColorPicker from './NoteColorPicker'
import NoteText from './NoteText'

type NoteProps = {
  note: NoteData
  boardSize: Size
  onMove: (id: string, position: Position) => void
  onResize: (id: string, size: Size) => void
  onTextCommit: (id: string, text: string) => void
  onColorCommit: (id: string, color: NoteColor) => void
  dragHandlers: NoteDragHandlers
}

export default function Note({ note, boardSize, onMove, onResize, onTextCommit, onColorCommit, dragHandlers }: NoteProps) {
  const { noteRef, geometry, visualStyle, isDragging, isResizing, moveHandleProps, resizeHandleProps } =
    useNoteInteraction({ note, boardSize, onMove, onResize, dragHandlers })
  const canResize = boardSize.width - note.x >= MIN_NOTE_SIZE.width &&
    boardSize.height - note.y >= MIN_NOTE_SIZE.height

  return (
    <article
      ref={noteRef}
      className={styles.note}
      data-color={note.color}
      data-dragging={isDragging || undefined}
      data-resizing={isResizing || undefined}
      style={{
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        height: geometry.height,
        ...visualStyle,
      }}
    >
      <div className={styles.header}>
        <button
          type="button"
          className={styles.dragHandle}
          aria-label={t('note.move')}
          title={t('note.moveHint')}
          {...moveHandleProps}
        >
          <span className={styles.grip} aria-hidden="true" />
        </button>
        <NoteColorPicker color={note.color} onSelect={(color) => onColorCommit(note.id, color)} />
      </div>
      <NoteText text={note.text} onCommit={(text) => onTextCommit(note.id, text)} />
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
