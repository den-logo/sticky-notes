import { MIN_NOTE_SIZE } from '../../constants/notes'
import type { NoteData } from '../../types/note'

const SNAPSHOT_VERSION = 1

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown, minimum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum
}

function isNote(value: unknown): value is NoteData {
  return isRecord(value) &&
    typeof value.id === 'string' && value.id.trim().length > 0 &&
    typeof value.text === 'string' &&
    isFiniteNumber(value.x, 0) && isFiniteNumber(value.y, 0) &&
    isFiniteNumber(value.width, MIN_NOTE_SIZE.width) &&
    isFiniteNumber(value.height, MIN_NOTE_SIZE.height)
}

export function parseNotesSnapshot(value: unknown): NoteData[] {
  if (!isRecord(value) || value.version !== SNAPSHOT_VERSION || !Array.isArray(value.notes)) {
    throw new Error('Saved notes do not match the supported format')
  }

  const ids = new Set<string>()
  return value.notes.map((item: unknown) => {
    if (!isNote(item) || ids.has(item.id)) throw new Error('Saved notes contain an invalid or duplicate note')
    ids.add(item.id)
    return {
      id: item.id, x: item.x, y: item.y,
      width: item.width, height: item.height, text: item.text,
    }
  })
}

export function createNotesSnapshot(notes: readonly NoteData[]) {
  return { version: SNAPSHOT_VERSION, notes }
}
