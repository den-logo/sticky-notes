import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import type { Position, Size } from '../types/geometry'
import type { NoteData } from '../types/note'
import { clampNotePosition } from '../utils/clampNotePosition'
import { clampNoteSize } from '../utils/clampNoteSize'

type InteractionKind = 'move' | 'resize'
type Geometry = Position & Size

type InteractionSession = {
  kind: InteractionKind
  pointerId: number
  target: HTMLButtonElement
  pointerStart: Position
  geometryStart: Geometry
}

type NoteInteractionOptions = {
  note: NoteData
  boardSize: Size
  onMove: (id: string, position: Position) => void
  onResize: (id: string, size: Size) => void
}

const KEYBOARD_DIRECTIONS: Record<string, Position> = {
  ArrowLeft: { x: -10, y: 0 },
  ArrowRight: { x: 10, y: 0 },
  ArrowUp: { x: 0, y: -10 },
  ArrowDown: { x: 0, y: 10 },
}

export function useNoteInteraction({ note, boardSize, onMove, onResize }: NoteInteractionOptions) {
  const session = useRef<InteractionSession | null>(null)
  const [draft, setDraft] = useState<{ kind: InteractionKind; geometry: Geometry } | null>(null)
  const isActive = draft !== null

  const cancelInteraction = useCallback(() => {
    const active = session.current
    if (!active) return

    session.current = null
    setDraft(null)
    if (active.target.hasPointerCapture(active.pointerId)) {
      active.target.releasePointerCapture(active.pointerId)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      cancelInteraction()
    }

    window.addEventListener('keydown', handleEscape)
    window.addEventListener('blur', cancelInteraction)
    return () => {
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('blur', cancelInteraction)
    }
  }, [isActive, cancelInteraction])

  useLayoutEffect(() => {
    cancelInteraction()
  }, [boardSize.width, boardSize.height, cancelInteraction])

  function getGeometry(event: PointerEvent<HTMLButtonElement>, active: InteractionSession): Geometry {
    const delta = {
      x: event.clientX - active.pointerStart.x,
      y: event.clientY - active.pointerStart.y,
    }
    const start = active.geometryStart

    if (active.kind === 'move') {
      return {
        ...start,
        ...clampNotePosition({ x: start.x + delta.x, y: start.y + delta.y }, start, boardSize),
      }
    }

    return {
      ...start,
      ...clampNoteSize({ width: start.width + delta.x, height: start.height + delta.y }, start, boardSize),
    }
  }

  function commit(kind: InteractionKind, geometry: Geometry) {
    if (kind === 'move') onMove(note.id, { x: geometry.x, y: geometry.y })
    else onResize(note.id, { width: geometry.width, height: geometry.height })
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, kind: InteractionKind) {
    if (event.button !== 0 || !event.isPrimary || session.current) return

    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    session.current = {
      kind,
      pointerId: event.pointerId,
      target: event.currentTarget,
      pointerStart: { x: event.clientX, y: event.clientY },
      geometryStart: { x: note.x, y: note.y, width: note.width, height: note.height },
    }
    setDraft({ kind, geometry: session.current.geometryStart })
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const active = session.current
    if (!active || event.pointerId !== active.pointerId) return
    if ((event.buttons & 1) === 0) {
      cancelInteraction()
      return
    }
    setDraft({ kind: active.kind, geometry: getGeometry(event, active) })
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const active = session.current
    if (!active || event.pointerId !== active.pointerId) return

    const geometry = getGeometry(event, active)
    session.current = null
    setDraft(null)
    if (active.target.hasPointerCapture(active.pointerId)) {
      active.target.releasePointerCapture(active.pointerId)
    }
    commit(active.kind, geometry)
  }

  function onPointerCancel(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerId === session.current?.pointerId) cancelInteraction()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, kind: InteractionKind) {
    const direction = KEYBOARD_DIRECTIONS[event.key]
    if (!direction || session.current) return

    event.preventDefault()
    if (kind === 'move') {
      onMove(note.id, clampNotePosition({ x: note.x + direction.x, y: note.y + direction.y }, note, boardSize))
    } else {
      onResize(note.id, clampNoteSize({
        width: note.width + direction.x,
        height: note.height + direction.y,
      }, note, boardSize))
    }
  }

  function onClick(event: MouseEvent<HTMLButtonElement>, kind: InteractionKind) {
    // Pointer gestures commit on release; zero-detail clicks cover keyboard activation.
    if (event.detail !== 0 || session.current) return
    commit(kind, note)
  }

  function getHandleProps(kind: InteractionKind) {
    return {
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => onPointerDown(event, kind),
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel,
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event, kind),
      onClick: (event: MouseEvent<HTMLButtonElement>) => onClick(event, kind),
    }
  }

  return {
    geometry: draft?.geometry ?? note,
    isDragging: draft?.kind === 'move',
    isResizing: draft?.kind === 'resize',
    moveHandleProps: getHandleProps('move'),
    resizeHandleProps: getHandleProps('resize'),
  }
}
