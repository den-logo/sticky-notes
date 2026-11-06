import { useEffect, useId, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { NOTES_LOAD_STATUS } from '../../constants/notesPersistence'
import { t } from '../../libs/i18n'
import { Icon } from '../../libs/icons'
import { notesStore } from '../../store/notes'
import { settingsStore } from '../../store/settings'
import ColorPicker from '../ColorPicker/ColorPicker'
import NotePlacementPicker from './NotePlacementPicker'
import NoteSizeSettings from './NoteSizeSettings'
import styles from './Settings.module.css'

export default function Settings() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const canDelete = useStore(notesStore, (state) =>
    state.loadStatus === NOTES_LOAD_STATUS.READY && state.notes.length > 0)
  const deleteAllNotes = useStore(notesStore, (state) => state.deleteAllNotes)
  const defaultNoteColor = useStore(settingsStore, (state) => state.defaultNoteColor)
  const setDefaultNoteColor = useStore(settingsStore, (state) => state.setDefaultNoteColor)
  const defaultNoteSize = useStore(settingsStore, (state) => state.defaultNoteSize)
  const setDefaultNoteSize = useStore(settingsStore, (state) => state.setDefaultNoteSize)
  const defaultNotePlacement = useStore(settingsStore, (state) => state.defaultNotePlacement)
  const setDefaultNotePlacement = useStore(settingsStore, (state) => state.setDefaultNotePlacement)
  const hasStorageError = useStore(settingsStore, (state) => state.hasStorageError)

  useEffect(() => {
    if (!isConfirmingDelete && dialogRef.current?.open) deleteButtonRef.current?.focus()
  }, [isConfirmingDelete])

  function closeSettings() {
    setIsConfirmingDelete(false)
    dialogRef.current?.close()
  }

  return (
    <>
      <button
        type="button"
        className={styles.settingsButton}
        aria-label={t('settings.title')}
        aria-haspopup="dialog"
        title={t('settings.title')}
        onClick={() => dialogRef.current?.showModal()}
      >
        <Icon name="settings" size={22} />
      </button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onCancel={() => setIsConfirmingDelete(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const rect = event.currentTarget.getBoundingClientRect()
          if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) {
            closeSettings()
          }
        }}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>{t('settings.title')}</h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label={t('settings.close')}
            onClick={closeSettings}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <ColorPicker
          label={t('settings.defaultNoteColor')}
          description={t('settings.defaultNoteColorHint')}
          value={defaultNoteColor}
          onSelect={setDefaultNoteColor}
        />
        <NoteSizeSettings size={defaultNoteSize} onCommit={setDefaultNoteSize} />
        <NotePlacementPicker value={defaultNotePlacement} onSelect={setDefaultNotePlacement} />
        {hasStorageError && <p className={styles.error} role="alert">{t('settings.storageFailed')}</p>}
        <div className={styles.deletion}>
          {isConfirmingDelete ? (
            <>
              <p>{t('settings.deleteAllHint')}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  autoFocus
                  onClick={() => setIsConfirmingDelete(false)}
                >
                  {t('settings.cancel')}
                </button>
                <button
                  type="button"
                  className={styles.confirmButton}
                  disabled={!canDelete}
                  onClick={() => {
                    deleteAllNotes()
                    closeSettings()
                  }}
                >
                  {t('settings.deleteAll')}
                </button>
              </div>
            </>
          ) : (
            <button
              ref={deleteButtonRef}
              type="button"
              className={styles.deleteButton}
              disabled={!canDelete}
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Icon name="trash" size={18} />
              {t('settings.deleteAll')}
            </button>
          )}
        </div>
      </dialog>
    </>
  )
}
