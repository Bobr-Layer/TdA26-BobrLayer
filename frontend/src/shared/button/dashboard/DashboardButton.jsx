import { Link } from 'react-router-dom';
import styles from './dashboard-button.module.scss';

export default function DashboardButton({ text, icon, onClick, longer, submit, link }) {
  if (link) {
    return (
      <Link to={link} className={`${styles.dashboard_button} ${longer ? styles.longer : ''}`}>
        {icon}
        <span>{text}</span>
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={`${styles.dashboard_button} ${longer ? styles.longer : ''}`} type={submit ? 'submit' : 'button'}>
      {icon}
      <span>{text}</span>
    </button>
  )
}
