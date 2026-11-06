import { createStore } from 'zustand/vanilla'
import { DEFAULT_NOTE_SIZE } from '../constants/notes'
import type { NoteData } from '../types/note'
import type { Position, Size } from '../types/geometry'
import { clampNotePosition } from '../utils/clampNotePosition'

type NotesStore = {
  notes: NoteData[]
  createNote: (boardWidth: number, boardHeight: number) => void
  moveNote: (id: string, position: Position) => void
  constrainNotes: (boardSize: Size) => void
}

export function createNotesStore() {
  return createStore<NotesStore>()((set) => ({
    notes: [],
    createNote: (boardWidth, boardHeight) => {
      const note: NoteData = {
        id: crypto.randomUUID(),
        x: Math.max(0, (boardWidth - DEFAULT_NOTE_SIZE.width) / 2),
        y: Math.max(0, (boardHeight - DEFAULT_NOTE_SIZE.height) / 2),
        ...DEFAULT_NOTE_SIZE,
        text: '',
      }

      set((state) => ({ notes: [...state.notes, note] }))
    },
    moveNote: (id, position) => set((state) => {
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
    constrainNotes: (boardSize) => set((state) => {
      let changed = false
      const notes = state.notes.map((note) => {
        const position = clampNotePosition(note, note, boardSize)
        if (note.x === position.x && note.y === position.y) return note
        changed = true
        return { ...note, ...position }
      })
      return changed ? { notes } : state
    }),
  }))
}

export const notesStore = createNotesStore()
