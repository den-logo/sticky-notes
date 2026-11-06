import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { MIN_DRAG_NOTE_SCALE } from '../constants/trash'
import type { Position, Size } from '../types/geometry'
import type { NoteData } from '../types/note'
import type { NoteDragHandlers } from '../types/noteDrag'
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
  grabOffset: Position
  boardOffset: Position
  hasDragged: boolean
}

type InteractionDraft = {
  kind: InteractionKind
  geometry: Geometry
  visualStyle?: CSSProperties
}

type NoteInteractionOptions = {
  note: NoteData
  boardSize: Size
  onMove: (id: string, position: Position) => void
  onResize: (id: string, size: Size) => void
  dragHandlers: NoteDragHandlers
}

const DRAG_ACTIVATION_DISTANCE = 4

const KEYBOARD_DIRECTIONS: Record<string, Position> = {
  ArrowLeft: { x: -10, y: 0 },
  ArrowRight: { x: 10, y: 0 },
  ArrowUp: { x: 0, y: -10 },
  ArrowDown: { x: 0, y: 10 },
}

export function useNoteInteraction({ note, boardSize, onMove, onResize, dragHandlers }: NoteInteractionOptions) {
  const session = useRef<InteractionSession | null>(null)
  const noteRef = useRef<HTMLElement>(null)
  const [draft, setDraft] = useState<InteractionDraft | null>(null)
  const isActive = draft !== null

  const cancelInteraction = useCallback(() => {
    const active = session.current
    if (!active) return

    session.current = null
    setDraft(null)
    if (active.target.hasPointerCapture(active.pointerId)) {
      active.target.releasePointerCapture(active.pointerId)
    }
    if (active.kind === 'move') dragHandlers.onEnd()
  }, [dragHandlers.onEnd])

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

  function getDraft(event: PointerEvent<HTMLButtonElement>, active: InteractionSession, proximity: number): InteractionDraft {
    const geometry = getGeometry(event, active)
    if (active.kind === 'resize') return { kind: active.kind, geometry }

    const scale = 1 - (1 - MIN_DRAG_NOTE_SCALE) * proximity
    const grab = active.grabOffset
    // Fit the scaled bounds around the grab point without changing the stored dimensions.
    const visualPosition = clampNotePosition({
      x: event.clientX - active.boardOffset.x - grab.x * scale,
      y: event.clientY - active.boardOffset.y - grab.y * scale,
    }, { width: geometry.width * scale, height: geometry.height * scale }, boardSize)
    const offset = {
      x: visualPosition.x - geometry.x - (1 - scale) * grab.x,
      y: visualPosition.y - geometry.y - (1 - scale) * grab.y,
    }

    return {
      kind: active.kind,
      geometry,
      visualStyle: {
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: `${grab.x}px ${grab.y}px`,
      },
    }
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, kind: InteractionKind) {
    if (event.button !== 0 || !event.isPrimary || session.current) return
    const bounds = noteRef.current?.getBoundingClientRect()
    if (!bounds) return

    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    session.current = {
      kind,
      pointerId: event.pointerId,
      target: event.currentTarget,
      pointerStart: { x: event.clientX, y: event.clientY },
      geometryStart: { x: note.x, y: note.y, width: note.width, height: note.height },
      grabOffset: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      boardOffset: { x: bounds.left - note.x, y: bounds.top - note.y },
      hasDragged: false,
    }
    const proximity = kind === 'move' ? dragHandlers.onStart({ x: event.clientX, y: event.clientY }) : 0
    setDraft(getDraft(event, session.current, proximity))
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const active = session.current
    if (!active || event.pointerId !== active.pointerId) return
    if ((event.buttons & 1) === 0) {
      cancelInteraction()
      return
    }
    active.hasDragged ||= Math.hypot(
      event.clientX - active.pointerStart.x,
      event.clientY - active.pointerStart.y,
    ) >= DRAG_ACTIVATION_DISTANCE
    const proximity = active.kind === 'move' ? dragHandlers.onMove({ x: event.clientX, y: event.clientY }) : 0
    setDraft(getDraft(event, active, proximity))
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
    if (active.kind === 'move') {
      const hasDragged = active.hasDragged || Math.hypot(
        event.clientX - active.pointerStart.x,
        event.clientY - active.pointerStart.y,
      ) >= DRAG_ACTIVATION_DISTANCE
      const deleted = hasDragged && dragHandlers.onDrop(note.id, { x: event.clientX, y: event.clientY })
      dragHandlers.onEnd()
      if (deleted) return
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
    noteRef,
    visualStyle: draft?.visualStyle,
    geometry: draft?.geometry ?? note,
    isDragging: draft?.kind === 'move',
    isResizing: draft?.kind === 'resize',
    moveHandleProps: getHandleProps('move'),
    resizeHandleProps: getHandleProps('resize'),
  }
}
