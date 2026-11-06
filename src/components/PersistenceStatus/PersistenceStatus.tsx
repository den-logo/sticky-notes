import { useStore } from 'zustand'
import { NOTES_LOAD_STATUS } from '../../constants/notesPersistence'
import { t } from '../../libs/i18n'
import { notesStore } from '../../store/notes'
import styles from './PersistenceStatus.module.css'

export default function PersistenceStatus() {
  const loadFailed = useStore(notesStore, (state) => state.loadStatus === NOTES_LOAD_STATUS.ERROR)
  const saveFailed = useStore(notesStore, (state) => state.hasSaveError)
  const retryLoad = useStore(notesStore, (state) => state.loadNotes)
  const retrySave = useStore(notesStore, (state) => state.retrySave)
  const startNewBoard = useStore(notesStore, (state) => state.startNewBoard)

  if (!loadFailed && !saveFailed) return null

  function handleRetry() {
    if (loadFailed) void retryLoad()
    else retrySave()
  }

  return (
    <div className={loadFailed ? styles.loadError : styles.saveError} role="alert">
      <p>{t(loadFailed ? 'persistence.loadFailed' : 'persistence.saveFailed')}</p>
      {loadFailed && <p className={styles.hint}>{t('persistence.startNewBoardHint')}</p>}
      <div className={styles.actions}>
        <button className={styles.retry} type="button" onClick={handleRetry}>
          {t('persistence.retry')}
        </button>
        {loadFailed && (
          <button className={`${styles.retry} ${styles.startNew}`} type="button" onClick={startNewBoard}>
            {t('persistence.startNewBoard')}
          </button>
        )}
      </div>
    </div>
  )
}
