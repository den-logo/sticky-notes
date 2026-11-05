import type { ReactNode } from 'react'
import styles from './Note.module.css'

type NoteProps = {
  children: ReactNode
}

export default function Note({ children }: NoteProps) {
  return <article className={styles.note}>{children}</article>
}
