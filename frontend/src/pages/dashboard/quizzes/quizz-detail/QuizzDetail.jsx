import styles from './quizz-detail.module.scss';
import ResultCard from './result-card/ResultCard';

export default function QuizzDetail({ quiz }) {
  const averageScore = quiz.questions.reduce((sum, q) => sum + q.successRate, 0) / quiz.questions.length;
  const questionsCount = quiz.questions.length;
  
  return (
    <article className={styles.quizz_detail}>
      <div className={styles.quizz_detail_info}>
        <div className={styles.quizz_detail_info_header}>
          <h2>{quiz.title}</h2>
        </div>
        <div className={styles.quizz_detail_content}>
          <h3>Otázky</h3>
          <div className={styles.quizz_detail_content_question}>
            {quiz.questions.map((q) => (
              <p key={q.uuid}>{q.question}</p>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.quizz_detail_results}>
        <div className={styles.quizz_detail_content}>
          <h3>Průměrný výsledek</h3>
          <div className={styles.quizz_detail_content_result}>
            <ResultCard 
              averageScore={averageScore}
              questionsCount={questionsCount}
              attemptsCount={quiz.attemptsCount}
              questions={quiz.questions}
            />
          </div>
        </div>
      </div>
    </article>
  )
}