import { t } from '../../libs/i18n'
import { Icon } from '../../libs/icons'
import Settings from '../Settings/Settings'
import styles from './Toolbar.module.css'

type ToolbarProps = {
  onCreateNote: () => void
  disabled: boolean
}

export default function Toolbar({ onCreateNote, disabled }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={styles.createButton}
        onClick={onCreateNote}
        disabled={disabled}
      >
        <Icon name="plus" size={20} />
        <span>{t('toolbar.createNote')}</span>
      </button>
      <Settings />
    </div>
  )
}
