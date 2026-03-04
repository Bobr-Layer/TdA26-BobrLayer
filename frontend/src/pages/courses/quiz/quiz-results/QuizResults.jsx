import styles from './quiz-results.module.scss';
import ResultCard from './result-card/ResultCard';

export default function QuizResults({ name, result, setShowResults }) {
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

    return (
        <section className={styles.quiz_results}>
            <article className={styles.quiz_results_header}>
                <img src="/img/quiz.png" alt="" />
                <h1>{name}</h1>
            </article>
            <article className={styles.quiz_results_content}>
                <div className={styles.quiz_results_content_list} onClick={() => setShowResults(true)}>
                    {result.correctPerQuestion.map((isCorrect, index) => (
                        <ResultCard 
                            key={index}
                            number={index + 1} 
                            correct={isCorrect} 
                        />
                    ))}
                </div>
            </article>
        </section>
    )
}
