import styles from './quiz-results.module.scss';
import ResultCard from './result-card/ResultCard';

export default function QuizResults({ name, result, onShowReview }) {
    if (!result) {
        return (
            <section className={styles.quiz_results}>
                <article className={styles.quiz_results_header}>
                    <img src="/img/quiz.png" alt="" />
                    <h1>{name}</h1>
                </article>
                <article className={styles.quiz_results_content}>
                    <h3>Načítání výsledků...</h3>
                </article>
            </section>
        );
    }

    const correct = result.correctPerQuestion.filter(Boolean).length;
    const total = result.correctPerQuestion.length;

    return (
        <section className={styles.quiz_results}>
            <article className={styles.quiz_results_header}>
                <img src="/img/quiz.png" alt="" />
                <h1>{name}</h1>
            </article>
            <article className={styles.quiz_results_content}>
                <p className={styles.quiz_results_score}>{correct} / {total}</p>
                <div className={styles.quiz_results_content_list}>
                    {result.correctPerQuestion.map((isCorrect, index) => (
                        <ResultCard
                            key={index}
                            number={index + 1}
                            correct={isCorrect}
                        />
                    ))}
                </div>
                <button className={styles.review_button} onClick={onShowReview}>
                    Zobrazit opravený test
                </button>
            </article>
        </section>
    )
}
