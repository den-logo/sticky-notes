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
      {notes.map((note) => <Note key={note.id} note={note} />)}
    </section>
  )
}
