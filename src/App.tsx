import Board from './components/Board/Board'
import { t } from './libs/i18n'
import styles from './App.module.css'

export default function App() {
  return (
    <main className={styles.app}>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('app.title')}</h1>
        </header>
        <Board />
      </div>
      <section className={styles.viewportNotice} aria-labelledby="viewport-title">
        <h1 id="viewport-title" className={styles.noticeTitle}>
          {t('viewport.title')}
        </h1>
        <p className={styles.noticeText}>{t('viewport.description')}</p>
      </section>
    </main>
  )
}
