import { useCallback, useMemo, useRef, useState } from 'react'
import { MAX_TRASH_ZONE_SCALE, TRASH_PROXIMITY_RADIUS } from '../constants/trash'
import type { Position } from '../types/geometry'
import type { NoteDragHandlers } from '../types/noteDrag'

const IDLE = { isVisible: false, isOver: false }

export function useTrashZone(onDelete: (id: string) => void) {
  const ref = useRef<HTMLDivElement>(null)
  const [feedback, setFeedback] = useState(IDLE)

  const containsPointer = useCallback((pointer: Position) => {
    const bounds = ref.current?.firstElementChild?.getBoundingClientRect()
    return !!bounds && pointer.x >= bounds.left && pointer.x <= bounds.right &&
      pointer.y >= bounds.top && pointer.y <= bounds.bottom
  }, [])

  const updateProximity = useCallback((pointer: Position) => {
    const target = ref.current
    if (!target) return 0

    // Measure the unscaled anchor so growth cannot amplify its own proximity.
    const bounds = target.getBoundingClientRect()
    const dx = Math.max(bounds.left - pointer.x, 0, pointer.x - bounds.right)
    const dy = Math.max(bounds.top - pointer.y, 0, pointer.y - bounds.bottom)
    const progress = Math.max(0, 1 - Math.hypot(dx, dy) / TRASH_PROXIMITY_RADIUS)
    const proximity = progress * progress * (3 - 2 * progress)
    const scale = 1 + (MAX_TRASH_ZONE_SCALE - 1) * proximity

    // Only the trash surface needs a visual update; keep Board out of this loop.
    target.style.setProperty('--trash-scale', String(scale))
    return proximity
  }, [])

  const onStart = useCallback((pointer: Position) => {
    const proximity = updateProximity(pointer)
    setFeedback({ isVisible: true, isOver: containsPointer(pointer) })
    return proximity
  }, [containsPointer, updateProximity])

  const onMove = useCallback((pointer: Position) => {
    const proximity = updateProximity(pointer)
    const isOver = containsPointer(pointer)
    setFeedback((current) => current.isOver === isOver ? current : { ...current, isOver })
    return proximity
  }, [containsPointer, updateProximity])

  const onEnd = useCallback(() => {
    ref.current?.style.removeProperty('--trash-scale')
    setFeedback(IDLE)
  }, [])

  const onDrop = useCallback((id: string, pointer: Position) => {
    updateProximity(pointer)
    if (!containsPointer(pointer)) return false
    onDelete(id)
    return true
  }, [containsPointer, onDelete, updateProximity])

  const dragHandlers = useMemo<NoteDragHandlers>(() => ({
    onStart, onMove, onEnd, onDrop,
  }), [onStart, onMove, onEnd, onDrop])

  return { ref, ...feedback, dragHandlers }
}
