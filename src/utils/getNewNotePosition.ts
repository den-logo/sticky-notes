import { NOTE_CREATION_OFFSET } from '../constants/notes'
import { DEFAULT_NOTE_PLACEMENT, NOTE_CREATION_INSET, NOTE_CREATION_TOP_INSET } from '../constants/notePlacements'
import type { Position, Size } from '../types/geometry'
import type { NotePlacement } from '../types/note'
import { clampNotePosition } from './clampNotePosition'

export function getNewNotePosition(
  notes: readonly Position[], noteSize: Size, boardSize: Size,
  placement: NotePlacement = DEFAULT_NOTE_PLACEMENT,
): Position {
  const maxX = Math.max(0, boardSize.width - noteSize.width)
  const maxY = Math.max(0, boardSize.height - noteSize.height)
  const insetX = Math.min(NOTE_CREATION_INSET, maxX / 2)
  const insetBottom = Math.min(NOTE_CREATION_INSET, maxY / 2)
  const insetTop = Math.min(NOTE_CREATION_TOP_INSET, maxY / 2)
  const origins: Record<NotePlacement, Position> = {
    center: { x: maxX / 2, y: maxY / 2 },
    'top-left': { x: insetX, y: insetTop },
    'top-right': { x: maxX - insetX, y: insetTop },
    'bottom-left': { x: insetX, y: maxY - insetBottom },
    'bottom-right': { x: maxX - insetX, y: maxY - insetBottom },
  }
  const origin = origins[placement]
  const stepX = placement.endsWith('right') ? -NOTE_CREATION_OFFSET : NOTE_CREATION_OFFSET
  const stepY = placement.startsWith('bottom') ? -NOTE_CREATION_OFFSET : NOTE_CREATION_OFFSET
  const occupied = new Set(notes.map((note) => `${note.x}:${note.y}`))
  const isFree = (position: Position) => !occupied.has(`${position.x}:${position.y}`)
  let position = origin

  while (!isFree(position)) {
    const next = clampNotePosition({
      x: position.x + stepX,
      y: position.y + stepY,
    }, noteSize, boardSize)
    if (next.x === position.x && next.y === position.y) break
    position = next
  }
  if (isFree(position)) return position

  // Once the cascade fills up, look for another free slot inside the board.
  for (let y = 0; y <= maxY; y += NOTE_CREATION_OFFSET) {
    for (let x = 0; x <= maxX; x += NOTE_CREATION_OFFSET) {
      if (isFree({ x, y })) return { x, y }
    }
  }
  return origin
}
