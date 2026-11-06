import { useEffect, useLayoutEffect } from 'react'
import { useStore } from 'zustand'
import { NOTES_LOAD_STATUS } from '../../constants/notesPersistence'
import { useElementSize } from '../../hooks/useElementSize'
import { useTrashZone } from '../../hooks/useTrashZone'
import { t } from '../../libs/i18n'
import { notesStore } from '../../store/notes'
import { settingsStore } from '../../store/settings'
import Note from '../Note/Note'
import PersistenceStatus from '../PersistenceStatus/PersistenceStatus'
import Toolbar from '../Toolbar/Toolbar'
import TrashZone from '../TrashZone/TrashZone'
import styles from './Board.module.css'

export default function Board() {
  const { ref, size } = useElementSize<HTMLElement>()
  const notes = useStore(notesStore, (state) => state.notes)
  const loadStatus = useStore(notesStore, (state) => state.loadStatus)
  const loadNotes = useStore(notesStore, (state) => state.loadNotes)
  const createNote = useStore(notesStore, (state) => state.createNote)
  const defaultNoteColor = useStore(settingsStore, (state) => state.defaultNoteColor)
  const moveNote = useStore(notesStore, (state) => state.moveNote)
  const resizeNote = useStore(notesStore, (state) => state.resizeNote)
  const updateNoteText = useStore(notesStore, (state) => state.updateNoteText)
  const updateNoteColor = useStore(notesStore, (state) => state.updateNoteColor)
  const deleteNote = useStore(notesStore, (state) => state.deleteNote)
  const constrainNotes = useStore(notesStore, (state) => state.constrainNotes)
  const trash = useTrashZone(deleteNote)

  useEffect(() => { void loadNotes() }, [loadNotes])

  useLayoutEffect(() => {
    if (loadStatus === NOTES_LOAD_STATUS.READY && size && size.width > 0 && size.height > 0) constrainNotes(size)
  }, [size, loadStatus, constrainNotes])

  function handleCreateNote() {
    const board = ref.current

    if (!board) return

    createNote(board.clientWidth, board.clientHeight, defaultNoteColor)
  }

  return (
    <section
      ref={ref}
      className={styles.board}
      aria-label={t('board.label')}
      aria-busy={loadStatus === NOTES_LOAD_STATUS.LOADING}
    >
      <Toolbar
        onCreateNote={handleCreateNote}
        disabled={loadStatus !== NOTES_LOAD_STATUS.READY || !size || size.width === 0 || size.height === 0}
      />
      {loadStatus === NOTES_LOAD_STATUS.READY && notes.length === 0 && (
        <p className={styles.emptyState}>{t('board.emptyState')}</p>
      )}
      <div className={styles.notesLayer}>
        {size && notes.map((note) => (
          <Note
            key={note.id}
            note={note}
            boardSize={size}
            onMove={moveNote}
            onResize={resizeNote}
            onTextCommit={updateNoteText}
            onColorCommit={updateNoteColor}
            dragHandlers={trash.dragHandlers}
          />
        ))}
      </div>
      <TrashZone ref={trash.ref} isVisible={trash.isVisible} isOver={trash.isOver} />
      <PersistenceStatus />
    </section>
  )
}
