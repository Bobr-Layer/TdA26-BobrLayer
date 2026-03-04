import styles from './result-card.module.scss';

export default function ResultCard({number, correct, info, onClick, active}) {
  return (
    <p className={`${styles.result_card} ${!correct ? styles.incorrect : ''} ${info ? styles.info : ''} ${active ? styles.active : ''}`} onClick={onClick}>
      {number}
    </p>
  )
}
