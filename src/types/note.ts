import type { NOTE_COLORS } from '../constants/noteColors'
import type { NOTE_PLACEMENTS } from '../constants/notePlacements'
import type { Size } from './geometry'

export type NoteColor = typeof NOTE_COLORS[number]
export type NotePlacement = typeof NOTE_PLACEMENTS[number]

export type NoteCreationOptions = {
  color?: NoteColor
  size?: Size
  placement?: NotePlacement
}

export type NoteData = {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
  color: NoteColor
}
