import type { NoteData } from '../../types/note'
import styles from './Note.module.css'

type NoteProps = {
  note: NoteData
}

export default function Note({ note }: NoteProps) {
  return (
    <article
      className={styles.note}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
      }}
    >
      <p className={styles.text}>{note.text}</p>
    </article>
  )
}
