import { icons } from './icons'
import type { IconName } from './icons'
import styles from './Icon.module.css'

type IconProps = {
  name: IconName
  size?: number
}

export default function Icon({ name, size = 24 }: IconProps) {
  return (
    <span
      className={styles.icon}
      style={{ width: size, height: size, maskImage: `url("${icons[name]}")` }}
      aria-hidden="true"
    />
  )
}
