export const LOCAL_STORAGE_KEYS = {
  NOTES_BOARD: 'tempo-sticky-notes:board',
} as const

export type LocalStorageKey = typeof LOCAL_STORAGE_KEYS[keyof typeof LOCAL_STORAGE_KEYS]
