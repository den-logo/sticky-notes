import { createStore } from 'zustand/vanilla'
import { DEFAULT_NOTE_COLOR } from '../constants/noteColors'
import { DEFAULT_NOTE_PLACEMENT } from '../constants/notePlacements'
import { DEFAULT_NOTE_SIZE, MAX_DEFAULT_NOTE_HEIGHT } from '../constants/notes'
import { createJsonStorage, LOCAL_STORAGE_KEYS } from '../libs/storage'
import type { JsonStorage } from '../libs/storage'
import type { Size } from '../types/geometry'
import type { NoteColor, NotePlacement } from '../types/note'
import { isDefaultNoteSize } from '../utils/isDefaultNoteSize'
import { isNoteColor } from '../utils/isNoteColor'
import { isNotePlacement } from '../utils/isNotePlacement'

type Preferences = {
  defaultNoteColor: NoteColor
  defaultNoteSize: Size
  defaultNotePlacement: NotePlacement
}

type SettingsStore = Preferences & {
  hasStorageError: boolean
  setDefaultNoteColor: (color: NoteColor) => void
  setDefaultNoteSize: (size: Size) => void
  setDefaultNotePlacement: (placement: NotePlacement) => void
}

export function createSettingsStore(storage: JsonStorage = createJsonStorage()) {
  let preferences: Preferences = {
    defaultNoteColor: DEFAULT_NOTE_COLOR,
    defaultNoteSize: DEFAULT_NOTE_SIZE,
    defaultNotePlacement: DEFAULT_NOTE_PLACEMENT,
  }
  let hasStorageError = false

  try {
    const saved = storage.read(LOCAL_STORAGE_KEYS.SETTINGS)
    if (saved !== undefined) {
      if (typeof saved !== 'object' || saved === null ||
        !('defaultNoteColor' in saved) || !isNoteColor(saved.defaultNoteColor)) {
        throw new Error('Saved settings contain an invalid note color')
      }
      let size = 'defaultNoteSize' in saved ? saved.defaultNoteSize : DEFAULT_NOTE_SIZE
      if (typeof size === 'object' && size !== null &&
        'height' in size && typeof size.height === 'number' &&
        Number.isSafeInteger(size.height) && size.height > MAX_DEFAULT_NOTE_HEIGHT) {
        size = { ...size, height: MAX_DEFAULT_NOTE_HEIGHT }
      }
      const placement = 'defaultNotePlacement' in saved ? saved.defaultNotePlacement : DEFAULT_NOTE_PLACEMENT
      if (!isDefaultNoteSize(size) || !isNotePlacement(placement)) {
        throw new Error('Saved settings contain invalid note geometry')
      }
      preferences = { defaultNoteColor: saved.defaultNoteColor, defaultNoteSize: size, defaultNotePlacement: placement }
    }
  } catch {
    hasStorageError = true
  }

  return createStore<SettingsStore>()((set, get) => {
    function updatePreferences(patch: Partial<Preferences>) {
      const current = get()
      const next: Preferences = {
        defaultNoteColor: current.defaultNoteColor,
        defaultNoteSize: current.defaultNoteSize,
        defaultNotePlacement: current.defaultNotePlacement,
        ...patch,
      }
      const unchanged = next.defaultNoteColor === current.defaultNoteColor &&
        next.defaultNotePlacement === current.defaultNotePlacement &&
        next.defaultNoteSize.width === current.defaultNoteSize.width &&
        next.defaultNoteSize.height === current.defaultNoteSize.height
      if (unchanged && !current.hasStorageError) return

      let failed = false
      try {
        storage.write(LOCAL_STORAGE_KEYS.SETTINGS, next)
      } catch {
        failed = true
      }
      set({ ...next, hasStorageError: failed })
    }

    return {
      ...preferences,
      hasStorageError,
      setDefaultNoteColor: (color) => updatePreferences({ defaultNoteColor: color }),
      setDefaultNoteSize: (size) => {
        if (isDefaultNoteSize(size)) updatePreferences({ defaultNoteSize: { ...size } })
      },
      setDefaultNotePlacement: (placement) => updatePreferences({ defaultNotePlacement: placement }),
    }
  })
}

export const settingsStore = createSettingsStore()
