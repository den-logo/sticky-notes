import { createStore } from 'zustand/vanilla'
import { DEFAULT_NOTE_SIZE } from '../constants/notes'
import type { NoteData } from '../types/note'

type NotesStore = {
  notes: NoteData[]
  createNote: (boardWidth: number, boardHeight: number) => void
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
  }))
}

export const notesStore = createNotesStore()
