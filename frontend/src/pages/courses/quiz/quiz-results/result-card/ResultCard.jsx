import styles from './result-card.module.scss';

export default function ResultCard({number, correct, open, info, onClick, active}) {
  const reviewClass = !info
    ? (open ? styles.pending : (!correct ? styles.incorrect : ''))
    : '';
  return (
    <p className={`${styles.result_card} ${reviewClass} ${info ? styles.info : ''} ${active ? styles.active : ''}`} onClick={onClick}>
      {number}
    </p>
  )
}
