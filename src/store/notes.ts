import { createStore } from 'zustand/vanilla'
import { createLocalNotesApi } from '../api/notes/localNotesApi'
import type { NotesApi } from '../api/notes/notesApi'
import { DEFAULT_NOTE_COLOR } from '../constants/noteColors'
import { DEFAULT_NOTE_SIZE } from '../constants/notes'
import { NOTES_LOAD_STATUS } from '../constants/notesPersistence'
import type { NoteColor, NoteData } from '../types/note'
import type { Position, Size } from '../types/geometry'
import type { LoadStatus } from '../types/notesPersistence'
import { clampNotePosition } from '../utils/clampNotePosition'
import { clampNoteSize } from '../utils/clampNoteSize'
import { getNewNotePosition } from '../utils/getNewNotePosition'
import { createNotesSaveQueue } from './createNotesSaveQueue'

type NotesStore = {
  notes: NoteData[]
  loadStatus: LoadStatus
  hasSaveError: boolean
  loadNotes: () => Promise<void>
  startNewBoard: () => void
  retrySave: () => void
  createNote: (boardWidth: number, boardHeight: number, color?: NoteColor) => void
  moveNote: (id: string, position: Position) => void
  resizeNote: (id: string, size: Size) => void
  updateNoteText: (id: string, text: string) => void
  deleteNote: (id: string) => void
  deleteAllNotes: () => void
  constrainNotes: (boardSize: Size) => void
}

export function createNotesStore(api: NotesApi) {
  let loading: Promise<void> | null = null
  return createStore<NotesStore>()((set, get) => {
    const enqueueSave = createNotesSaveQueue(api, (hasSaveError) => {
      set((state) => state.hasSaveError === hasSaveError ? state : { hasSaveError })
    })

    function commit(update: (state: NotesStore) => NotesStore | { notes: NoteData[] }) {
      const previous = get()
      if (previous.loadStatus !== NOTES_LOAD_STATUS.READY) return
      const next = update(previous)
      if (next.notes === previous.notes) return
      set({ notes: next.notes, hasSaveError: false })
      enqueueSave(next.notes)
    }

    return {
      notes: [],
      loadStatus: NOTES_LOAD_STATUS.LOADING,
      hasSaveError: false,
      loadNotes: () => {
        if (get().loadStatus === NOTES_LOAD_STATUS.READY) return Promise.resolve()
        if (loading) return loading
        set({ loadStatus: NOTES_LOAD_STATUS.LOADING })
        loading = Promise.resolve()
          .then(() => api.loadNotes())
          .then((notes) => set({ notes, loadStatus: NOTES_LOAD_STATUS.READY }))
          .catch(() => set({ loadStatus: NOTES_LOAD_STATUS.ERROR }))
          .finally(() => { loading = null })
        return loading
      },
      retrySave: () => {
        if (get().loadStatus === NOTES_LOAD_STATUS.READY && get().hasSaveError) {
          enqueueSave(get().notes)
        }
      },
      startNewBoard: () => {
        if (get().loadStatus !== NOTES_LOAD_STATUS.ERROR) return
        const notes: NoteData[] = []
        set({ notes, loadStatus: NOTES_LOAD_STATUS.READY, hasSaveError: false })
        enqueueSave(notes)
      },
      createNote: (boardWidth, boardHeight, color = DEFAULT_NOTE_COLOR) => commit((state) => {
        const position = getNewNotePosition(state.notes, DEFAULT_NOTE_SIZE, {
          width: boardWidth, height: boardHeight,
        })
        const note: NoteData = {
          id: crypto.randomUUID(),
          ...position,
          ...DEFAULT_NOTE_SIZE,
          text: '',
          color,
        }

        return { notes: [...state.notes, note] }
      }),
      moveNote: (id, position) => commit((state) => {
        const note = state.notes.find((item) => item.id === id)
        if (!note) return state

        const hasMoved = note.x !== position.x || note.y !== position.y
        if (!hasMoved && state.notes.at(-1) === note) return state

        return {
          notes: [
            ...state.notes.filter((item) => item.id !== id),
            hasMoved ? { ...note, ...position } : note,
          ],
        }
      }),
      resizeNote: (id, size) => commit((state) => {
        const note = state.notes.find((item) => item.id === id)
        if (!note) return state

        const hasResized = note.width !== size.width || note.height !== size.height
        if (!hasResized && state.notes.at(-1) === note) return state

        return {
          notes: [
            ...state.notes.filter((item) => item.id !== id),
            hasResized ? { ...note, ...size } : note,
          ],
        }
      }),
      updateNoteText: (id, text) => commit((state) => {
        const note = state.notes.find((item) => item.id === id)
        if (!note || note.text === text) return state

        return {
          notes: state.notes.map((item) => item.id === id ? { ...item, text } : item),
        }
      }),
      deleteNote: (id) => commit((state) => {
        const notes = state.notes.filter((note) => note.id !== id)
        return notes.length === state.notes.length ? state : { notes }
      }),
      deleteAllNotes: () => commit((state) => state.notes.length === 0 ? state : { notes: [] }),
      constrainNotes: (boardSize) => commit((state) => {
        let changed = false
        const notes = state.notes.map((note) => {
          const size = clampNoteSize(note, { x: 0, y: 0 }, boardSize)
          const position = clampNotePosition(note, size, boardSize)
          const isUnchanged = note.x === position.x && note.y === position.y &&
            note.width === size.width && note.height === size.height
          if (isUnchanged) return note
          changed = true
          return { ...note, ...position, ...size }
        })
        return changed ? { notes } : state
      }),
    }
  })
}

export const notesStore = createNotesStore(createLocalNotesApi())
