import type { NoteData } from '../../types/note'

export type NotesApi = {
  loadNotes: () => Promise<NoteData[]>
  saveNotes: (notes: readonly NoteData[]) => Promise<void>
}
