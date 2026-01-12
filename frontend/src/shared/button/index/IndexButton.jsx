import styles from './index-button.module.scss';
import { Link } from 'react-router-dom'

function IndexButton({text, link, darker}) {
  return (
    <Link to={link} className={`${styles.index_button} ${darker ? styles.darker : ''}`}>
        {text}
    </Link>
  )
}

export default IndexButton
