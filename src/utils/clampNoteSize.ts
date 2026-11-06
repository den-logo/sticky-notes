import { MIN_NOTE_SIZE } from '../constants/notes'
import type { Position, Size } from '../types/geometry'

export function clampNoteSize(size: Size, position: Position, boardSize: Size): Size {
  return {
    width: Math.min(
      Math.max(MIN_NOTE_SIZE.width, size.width),
      Math.max(MIN_NOTE_SIZE.width, boardSize.width - position.x),
    ),
    height: Math.min(
      Math.max(MIN_NOTE_SIZE.height, size.height),
      Math.max(MIN_NOTE_SIZE.height, boardSize.height - position.y),
    ),
  }
}
