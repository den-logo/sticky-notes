export const LOCAL_STORAGE_KEYS = {
  NOTES_BOARD: 'tempo-sticky-notes:board',
  SETTINGS: 'tempo-sticky-notes:settings',
} as const

export type LocalStorageKey = typeof LOCAL_STORAGE_KEYS[keyof typeof LOCAL_STORAGE_KEYS]
