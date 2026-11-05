import { t } from './libs/i18n'
import styles from './App.module.css'

export default function App() {
  return (
    <main className={styles.app}>
      <h1>{t('app.title')}</h1>
    </main>
  )
}
