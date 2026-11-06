import { createJsonStorage, LOCAL_STORAGE_KEYS } from '../../libs/storage'
import type { JsonStorage } from '../../libs/storage'
import type { NotesApi } from './notesApi'
import { createNotesSnapshot, parseNotesSnapshot } from './notesSnapshot'

export function createLocalNotesApi(storage: JsonStorage = createJsonStorage()): NotesApi {
  return {
    async loadNotes() {
      const value = storage.read(LOCAL_STORAGE_KEYS.NOTES_BOARD)
      return value === undefined ? [] : parseNotesSnapshot(value)
    },
    async saveNotes(notes) {
      storage.write(LOCAL_STORAGE_KEYS.NOTES_BOARD, createNotesSnapshot(notes))
    },
  }
}
