import type { Ref } from 'react'
import { t } from '../../libs/i18n'
import { Icon } from '../../libs/icons'
import styles from './TrashZone.module.css'

type TrashZoneProps = {
  ref: Ref<HTMLDivElement>
  isVisible: boolean
  isOver: boolean
}

export default function TrashZone({ ref, isVisible, isOver }: TrashZoneProps) {
  return (
    <div
      ref={ref}
      className={styles.target}
      data-visible={isVisible || undefined}
      data-over={isOver || undefined}
      role="status"
      aria-hidden={!isVisible}
    >
      <div className={styles.zone}>
        <Icon name="trash" size={22} />
        <span className={styles.label}>
          <span className={styles.labelText} data-active={!isOver || undefined} aria-hidden={isOver}>
            {t('trash.dragToDelete')}
          </span>
          <span className={styles.labelText} data-active={isOver || undefined} aria-hidden={!isOver}>
            {t('trash.releaseToDelete')}
          </span>
        </span>
      </div>
    </div>
  )
}
