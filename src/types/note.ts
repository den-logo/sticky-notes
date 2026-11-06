import type { NOTE_COLORS } from '../constants/noteColors'

export type NoteColor = typeof NOTE_COLORS[number]

export type NoteData = {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
  color: NoteColor
}
