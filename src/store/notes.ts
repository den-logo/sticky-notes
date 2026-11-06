import { createStore } from 'zustand/vanilla'
import { DEFAULT_NOTE_SIZE } from '../constants/notes'
import type { NoteData } from '../types/note'
import type { Position, Size } from '../types/geometry'
import { clampNotePosition } from '../utils/clampNotePosition'
import { clampNoteSize } from '../utils/clampNoteSize'

type NotesStore = {
  notes: NoteData[]
  createNote: (boardWidth: number, boardHeight: number) => void
  moveNote: (id: string, position: Position) => void
  resizeNote: (id: string, size: Size) => void
  updateNoteText: (id: string, text: string) => void
  deleteNote: (id: string) => void
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
    resizeNote: (id, size) => set((state) => {
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
    updateNoteText: (id, text) => set((state) => {
      const note = state.notes.find((item) => item.id === id)
      if (!note || note.text === text) return state

      return {
        notes: state.notes.map((item) => item.id === id ? { ...item, text } : item),
      }
    }),
    deleteNote: (id) => set((state) => {
      const notes = state.notes.filter((note) => note.id !== id)
      return notes.length === state.notes.length ? state : { notes }
    }),
    constrainNotes: (boardSize) => set((state) => {
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
  }))
}

export const notesStore = createNotesStore()
