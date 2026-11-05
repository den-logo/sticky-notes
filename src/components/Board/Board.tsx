import { t } from '../../libs/i18n'
import Note from '../Note/Note'
import styles from './Board.module.css'

export default function Board() {
  return (
    <section className={styles.board} aria-label={t('board.label')}>
      <Note>
        <h2 className={styles.noteTitle}>{t('board.welcomeTitle')}</h2>
        <p className={styles.noteText}>{t('board.welcomeText')}</p>
      </Note>
    </section>
  )
}
