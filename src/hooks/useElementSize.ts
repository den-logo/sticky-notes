import { useLayoutEffect, useRef, useState } from 'react'
import type { Size } from '../types/geometry'

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<Size | null>(null)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element) return

    setSize({ width: element.clientWidth, height: element.clientHeight })

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return

      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return { ref, size }
}
