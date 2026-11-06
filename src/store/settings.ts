import { createStore } from 'zustand/vanilla'
import { DEFAULT_NOTE_COLOR } from '../constants/noteColors'
import { createJsonStorage, LOCAL_STORAGE_KEYS } from '../libs/storage'
import type { JsonStorage } from '../libs/storage'
import type { NoteColor } from '../types/note'
import { isNoteColor } from '../utils/isNoteColor'

type SettingsStore = {
  defaultNoteColor: NoteColor
  hasStorageError: boolean
  setDefaultNoteColor: (color: NoteColor) => void
}

export function createSettingsStore(storage: JsonStorage = createJsonStorage()) {
  let defaultNoteColor: NoteColor = DEFAULT_NOTE_COLOR
  let hasStorageError = false

  try {
    const saved = storage.read(LOCAL_STORAGE_KEYS.SETTINGS)
    if (saved !== undefined) {
      if (typeof saved !== 'object' || saved === null ||
        !('defaultNoteColor' in saved) || !isNoteColor(saved.defaultNoteColor)) {
        throw new Error('Saved settings contain an invalid note color')
      }
      defaultNoteColor = saved.defaultNoteColor
    }
  } catch {
    hasStorageError = true
  }

  return createStore<SettingsStore>()((set, get) => ({
    defaultNoteColor,
    hasStorageError,
    setDefaultNoteColor: (color) => {
      if (get().defaultNoteColor === color && !get().hasStorageError) return
      let failed = false
      try {
        storage.write(LOCAL_STORAGE_KEYS.SETTINGS, { defaultNoteColor: color })
      } catch {
        failed = true
      }
      set({ defaultNoteColor: color, hasStorageError: failed })
    },
  }))
}

export const settingsStore = createSettingsStore()
