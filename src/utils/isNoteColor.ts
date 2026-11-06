import { NOTE_COLORS } from '../constants/noteColors'
import type { NoteColor } from '../types/note'

export function isNoteColor(value: unknown): value is NoteColor {
  return NOTE_COLORS.some((color) => color === value)
}
