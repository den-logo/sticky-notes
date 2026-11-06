import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { t } from '../../libs/i18n'
import styles from './NoteText.module.css'

type NoteTextProps = {
  text: string
  onCommit: (text: string) => void
}

export default function NoteText({ text, onCommit }: NoteTextProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [visibleLines, setVisibleLines] = useState(1)
  const previewRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isEditing) return

    function flushDraft() {
      const editor = editorRef.current
      if (editor && editor.value !== text) onCommit(editor.value)
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') flushDraft()
    }

    window.addEventListener('pagehide', flushDraft)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', flushDraft)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isEditing, onCommit, text])

  useLayoutEffect(() => {
    const preview = previewRef.current
    if (!preview) return

    const updateVisibleLines = (height: number) => {
      const lineHeight = Number.parseFloat(getComputedStyle(preview).lineHeight)
      setVisibleLines(Math.max(1, Math.floor(height / lineHeight)))
    }

    updateVisibleLines(preview.getBoundingClientRect().height)
    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateVisibleLines(entry.contentRect.height)
    })
    observer.observe(preview)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.content}>
      <div className={styles.preview} aria-hidden="true">
        <div ref={previewRef} className={styles.previewViewport}>
          <p
            className={styles.previewText}
            data-placeholder={!text || undefined}
            style={{ WebkitLineClamp: visibleLines }}
          >
            {text || t('note.textPlaceholder')}
          </p>
        </div>
      </div>
      <textarea
        ref={editorRef}
        className={styles.editor}
        aria-label={t('note.text')}
        placeholder={t('note.textPlaceholder')}
        value={draft ?? text}
        onFocus={() => setIsEditing(true)}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={(event) => {
          const value = event.currentTarget.value
          // The preview starts at the top; align the next edit with that preview.
          event.currentTarget.setSelectionRange(0, 0)
          event.currentTarget.scrollTop = 0
          setIsEditing(false)
          setDraft(null)
          if (value !== text) onCommit(value)
        }}
      />
    </div>
  )
}
