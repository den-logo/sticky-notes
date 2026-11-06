import { useLayoutEffect } from 'react'
import { useStore } from 'zustand'
import { useElementSize } from '../../hooks/useElementSize'
import { t } from '../../libs/i18n'
import { notesStore } from '../../store/notes'
import Note from '../Note/Note'
import Toolbar from '../Toolbar/Toolbar'
import styles from './Board.module.css'

export default function Board() {
  const { ref, size } = useElementSize<HTMLElement>()
  const notes = useStore(notesStore, (state) => state.notes)
  const createNote = useStore(notesStore, (state) => state.createNote)
  const moveNote = useStore(notesStore, (state) => state.moveNote)
  const resizeNote = useStore(notesStore, (state) => state.resizeNote)
  const constrainNotes = useStore(notesStore, (state) => state.constrainNotes)

  useLayoutEffect(() => {
    if (size && size.width > 0 && size.height > 0) constrainNotes(size)
  }, [size, constrainNotes])

  function handleCreateNote() {
    const board = ref.current

    if (!board) return

    createNote(board.clientWidth, board.clientHeight)
  }

  return (
    <section ref={ref} className={styles.board} aria-label={t('board.label')}>
      <Toolbar
        onCreateNote={handleCreateNote}
        disabled={!size || size.width === 0 || size.height === 0}
      />
      {notes.length === 0 && <p className={styles.emptyState}>{t('board.emptyState')}</p>}
      <div className={styles.notesLayer}>
        {size && notes.map((note) => (
          <Note
            key={note.id}
            note={note}
            boardSize={size}
            onMove={moveNote}
            onResize={resizeNote}
          />
        ))}
      </div>
    </section>
  )
}
