import styles from './result-card.module.scss';

export default function ResultCard({number, correct}) {
  return (
    <p className={`${styles.result_card} ${!correct ? styles.incorrect : ''}`}>
      {number}
    </p>
  )
}
