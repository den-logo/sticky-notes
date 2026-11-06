import type { Position, Size } from '../types/geometry'

export function clampNotePosition(position: Position, noteSize: Size, boardSize: Size): Position {
  return {
    x: Math.min(Math.max(0, position.x), Math.max(0, boardSize.width - noteSize.width)),
    y: Math.min(Math.max(0, position.y), Math.max(0, boardSize.height - noteSize.height)),
  }
}
