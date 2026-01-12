import styles from './quizz-detail.module.scss';
import ResultCard from './result-card/ResultCard';

export default function QuizzDetail() {
  return (
    <article className={styles.quizz_detail}>
      <div className={styles.quizz_detail_info}>
        <div className={styles.quizz_detail_info_header}>
          <h2>quiz.name</h2>
          <p>quiz.description</p>
        </div>
        <div className={styles.quizz_detail_content}>
          <h3>Otázky</h3>
          <div className={styles.quizz_detail_content_question}>
            <p>Question 1</p>
            <p>Question 2</p>
            <p>Question 3</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </div>
      </div>
      <div className={styles.quizz_detail_results}>
        <div className={styles.quizz_detail_content}>
          <h3>Přehled výsledků</h3>
          <div className={styles.quizz_detail_content_result}>
            <ResultCard />
            <ResultCard />
          </div>
        </div>
      </div>
    </article>
  )
}
