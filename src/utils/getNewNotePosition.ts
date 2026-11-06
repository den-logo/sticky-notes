import { NOTE_CREATION_OFFSET } from '../constants/notes'
import type { Position, Size } from '../types/geometry'
import { clampNotePosition } from './clampNotePosition'

export function getNewNotePosition(notes: readonly Position[], noteSize: Size, boardSize: Size): Position {
  const center = clampNotePosition({
    x: (boardSize.width - noteSize.width) / 2,
    y: (boardSize.height - noteSize.height) / 2,
  }, noteSize, boardSize)
  const occupied = new Set(notes.map((note) => `${note.x}:${note.y}`))
  const isFree = (position: Position) => !occupied.has(`${position.x}:${position.y}`)
  let position = center

  while (!isFree(position)) {
    const next = clampNotePosition({
      x: position.x + NOTE_CREATION_OFFSET,
      y: position.y + NOTE_CREATION_OFFSET,
    }, noteSize, boardSize)
    if (next.x === position.x && next.y === position.y) break
    position = next
  }
  if (isFree(position)) return position

  // Once the cascade fills up, look for another free slot inside the board.
  const maxX = Math.max(0, boardSize.width - noteSize.width)
  const maxY = Math.max(0, boardSize.height - noteSize.height)
  for (let y = 0; y <= maxY; y += NOTE_CREATION_OFFSET) {
    for (let x = 0; x <= maxX; x += NOTE_CREATION_OFFSET) {
      if (isFree({ x, y })) return { x, y }
    }
  }
  return center
}
