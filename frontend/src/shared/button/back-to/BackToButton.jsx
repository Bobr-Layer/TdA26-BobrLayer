import styles from './back-to-button.module.scss';
import { Link } from 'react-router-dom'

export default function BackToButton({ text, link, cyan }) {
  return (
    <Link to={link} className={`${styles.back_to_button} ${cyan ? styles.cyan : ''}`}>
      {text}
    </Link>
  )
}
