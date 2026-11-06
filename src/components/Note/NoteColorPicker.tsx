import { useId, useLayoutEffect, useRef, useState } from 'react'
import { t } from '../../libs/i18n'
import { Icon } from '../../libs/icons'
import type { NoteColor } from '../../types/note'
import ColorPicker from '../ColorPicker/ColorPicker'
import styles from './NoteColorPicker.module.css'

type NoteColorPickerProps = {
  color: NoteColor
  onSelect: (color: NoteColor) => void
}

export default function NoteColorPicker({ color, onSelect }: NoteColorPickerProps) {
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useLayoutEffect(() => {
    const button = buttonRef.current
    const popover = popoverRef.current
    if (!isOpen || !button || !popover) return

    const anchor = button.getBoundingClientRect()
    const gap = Number.parseFloat(getComputedStyle(popover).paddingTop)
    const { width, height } = popover.getBoundingClientRect()
    const left = Math.max(gap, Math.min(anchor.right - width, window.innerWidth - width - gap))
    const below = anchor.bottom + gap
    const top = below + height <= window.innerHeight - gap ? below : Math.max(gap, anchor.top - height - gap)
    popover.style.left = `${left}px`
    popover.style.top = `${top}px`
    popover.querySelector<HTMLInputElement>('input:checked')?.focus()

    const close = () => popover.hidePopover()
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [isOpen])

  return (
    <div
      className={styles.control}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) popoverRef.current?.hidePopover()
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        popoverTarget={id}
        aria-label={t('note.changeColor')}
        title={t('note.changeColor')}
      >
        <Icon name="palette" size={18} />
      </button>
      <div
        ref={popoverRef}
        id={id}
        popover="auto"
        className={styles.popover}
        data-positioned={isOpen || undefined}
        onBeforeToggle={(event) => {
          if (event.newState === 'closed') setIsOpen(false)
        }}
        onToggle={(event) => setIsOpen(event.newState === 'open')}
      >
        <ColorPicker
          compact
          label={t('note.color')}
          value={color}
          onSelect={(nextColor) => {
            onSelect(nextColor)
            popoverRef.current?.hidePopover()
            buttonRef.current?.focus()
          }}
        />
      </div>
    </div>
  )
}
