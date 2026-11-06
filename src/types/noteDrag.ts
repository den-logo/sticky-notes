import type { Position } from './geometry'

export type NoteDragHandlers = {
  // Start/move return proximity in [0, 1] for local visual feedback.
  onStart: (pointer: Position) => number
  onMove: (pointer: Position) => number
  onEnd: () => void
  onDrop: (id: string, pointer: Position) => boolean
}
