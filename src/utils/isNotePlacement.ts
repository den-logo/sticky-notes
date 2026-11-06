import { NOTE_PLACEMENTS } from '../constants/notePlacements'
import type { NotePlacement } from '../types/note'

export function isNotePlacement(value: unknown): value is NotePlacement {
  return NOTE_PLACEMENTS.some((placement) => placement === value)
}
