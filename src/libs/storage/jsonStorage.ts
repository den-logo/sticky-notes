import type { LocalStorageKey } from './constants'

type StorageProvider = () => Pick<Storage, 'getItem' | 'setItem'>

export function createJsonStorage(getStorage: StorageProvider = () => window.localStorage) {
  return {
    read(key: LocalStorageKey): unknown {
      const raw = getStorage().getItem(key)
      if (raw === null) return undefined
      const value: unknown = JSON.parse(raw)
      return value
    },
    write(key: LocalStorageKey, value: unknown): void {
      const serialized = JSON.stringify(value)
      if (serialized === undefined) throw new TypeError('Value is not JSON serializable')
      getStorage().setItem(key, serialized)
    },
  }
}

export type JsonStorage = ReturnType<typeof createJsonStorage>
