import { useEffect, useId, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { NOTE_COLORS } from '../../constants/noteColors'
import { NOTES_LOAD_STATUS } from '../../constants/notesPersistence'
import { t } from '../../libs/i18n'
import { Icon } from '../../libs/icons'
import { notesStore } from '../../store/notes'
import { settingsStore } from '../../store/settings'
import styles from './Settings.module.css'

export default function Settings() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const colorGroupName = useId()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const canDelete = useStore(notesStore, (state) =>
    state.loadStatus === NOTES_LOAD_STATUS.READY && state.notes.length > 0)
  const deleteAllNotes = useStore(notesStore, (state) => state.deleteAllNotes)
  const defaultNoteColor = useStore(settingsStore, (state) => state.defaultNoteColor)
  const setDefaultNoteColor = useStore(settingsStore, (state) => state.setDefaultNoteColor)
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
        <fieldset className={styles.colors}>
          <legend className={styles.label}>{t('settings.defaultNoteColor')}</legend>
          <div className={styles.swatches}>
            {NOTE_COLORS.map((color) => (
              <input
                key={color}
                type="radio"
                name={colorGroupName}
                className={styles.swatch}
                aria-label={t(`colors.${color}`)}
                title={t(`colors.${color}`)}
                value={color}
                checked={color === defaultNoteColor}
                style={{ backgroundColor: `var(--color-note-${color})` }}
                onChange={() => setDefaultNoteColor(color)}
                onClick={() => {
                  if (color === defaultNoteColor && hasStorageError) setDefaultNoteColor(color)
                }}
              />
            ))}
          </div>
          <p className={styles.hint}>{t('settings.defaultNoteColorHint')}</p>
        </fieldset>
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
