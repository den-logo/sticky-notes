import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import type { Position, Size } from '../types/geometry'
import type { NoteData } from '../types/note'
import { clampNotePosition } from '../utils/clampNotePosition'

type DragSession = {
  pointerId: number
  target: HTMLButtonElement
  pointerStart: Position
  noteStart: Position
}

type NoteDragOptions = {
  note: NoteData
  boardSize: Size
  onMove: (id: string, position: Position) => void
}

const KEYBOARD_DIRECTIONS: Record<string, Position> = {
  ArrowLeft: { x: -10, y: 0 },
  ArrowRight: { x: 10, y: 0 },
  ArrowUp: { x: 0, y: -10 },
  ArrowDown: { x: 0, y: 10 },
}

export function useNoteDrag({ note, boardSize, onMove }: NoteDragOptions) {
  const session = useRef<DragSession | null>(null)
  const [draft, setDraft] = useState<Position | null>(null)
  const isDragging = draft !== null

  const cancelDrag = useCallback(() => {
    const active = session.current
    if (!active) return

    session.current = null
    setDraft(null)
    if (active.target.hasPointerCapture(active.pointerId)) {
      active.target.releasePointerCapture(active.pointerId)
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      cancelDrag()
    }

    window.addEventListener('keydown', handleEscape)
    window.addEventListener('blur', cancelDrag)
    return () => {
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('blur', cancelDrag)
    }
  }, [isDragging, cancelDrag])

  useEffect(() => {
    cancelDrag()
  }, [boardSize.width, boardSize.height, cancelDrag])

  function getPosition(event: PointerEvent<HTMLButtonElement>, active: DragSession): Position {
    return clampNotePosition({
      x: active.noteStart.x + event.clientX - active.pointerStart.x,
      y: active.noteStart.y + event.clientY - active.pointerStart.y,
    }, note, boardSize)
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || !event.isPrimary || session.current) return

    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    session.current = {
      pointerId: event.pointerId,
      target: event.currentTarget,
      pointerStart: { x: event.clientX, y: event.clientY },
      noteStart: { x: note.x, y: note.y },
    }
    setDraft({ x: note.x, y: note.y })
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const active = session.current
    if (!active || event.pointerId !== active.pointerId) return
    if ((event.buttons & 1) === 0) {
      cancelDrag()
      return
    }
    setDraft(getPosition(event, active))
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const active = session.current
    if (!active || event.pointerId !== active.pointerId) return

    const position = getPosition(event, active)
    session.current = null
    setDraft(null)
    if (active.target.hasPointerCapture(active.pointerId)) {
      active.target.releasePointerCapture(active.pointerId)
    }
    onMove(note.id, position)
  }

  function onPointerCancel(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerId === session.current?.pointerId) cancelDrag()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const direction = KEYBOARD_DIRECTIONS[event.key]
    if (!direction || session.current) return

    event.preventDefault()
    onMove(note.id, clampNotePosition({
      x: note.x + direction.x,
      y: note.y + direction.y,
    }, note, boardSize))
  }

  return {
    position: draft ?? { x: note.x, y: note.y },
    isDragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel,
      onKeyDown,
    },
  }
}
