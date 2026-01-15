import styles from './dashboard-button.module.scss';

export default function DashboardButton({ text, icon, onClick, red, submit }) {
  return (
    <button onClick={onClick} className={`${styles.dashboard_button} ${red ? styles.red : ''}`} type={submit ? 'submit' : 'button'}>
      {icon}
      <span>{text}</span>
    </button>
  )
}
