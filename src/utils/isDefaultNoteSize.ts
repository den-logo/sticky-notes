import { MAX_DEFAULT_NOTE_HEIGHT, MIN_NOTE_SIZE } from '../constants/notes'
import type { Size } from '../types/geometry'

export function isDefaultNoteSize(value: unknown): value is Size {
  return typeof value === 'object' && value !== null &&
    'width' in value && typeof value.width === 'number' &&
    Number.isSafeInteger(value.width) && value.width >= MIN_NOTE_SIZE.width &&
    'height' in value && typeof value.height === 'number' &&
    Number.isSafeInteger(value.height) && value.height >= MIN_NOTE_SIZE.height &&
    value.height <= MAX_DEFAULT_NOTE_HEIGHT
}
