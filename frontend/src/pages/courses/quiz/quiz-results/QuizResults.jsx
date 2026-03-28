import styles from './quiz-results.module.scss';
import ResultCard from './result-card/ResultCard';

export default function QuizResults({ name, result, onShowReview }) {
    if (!result) {
        return (
            <section className={styles.quiz_results}>
                <div className={styles.quiz_results_header}>
                    <h1>{name}</h1>
                </div>
                <div className={styles.quiz_results_content}>
                    <h3>Načítání výsledků...</h3>
                </div>
            </section>
        );
    }

    const gradable = result.correctPerQuestion.filter(x => x !== null && x !== undefined);
    const correct = gradable.filter(Boolean).length;
    const total = gradable.length;
    const openCount = result.correctPerQuestion.filter(x => x === null || x === undefined).length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
        <section className={styles.quiz_results}>
            <div className={styles.quiz_results_header}>
                <span className={styles.quiz_results_label}>Výsledky kvízu</span>
                <h1>{name}</h1>
            </div>

            <div className={styles.quiz_results_score_block}>
                <span className={styles.score_number}>{correct}/{total}</span>
                <span className={styles.score_label}>{percentage} % správně</span>
                {openCount > 0 && (
                    <span className={styles.score_open}>{openCount} otevřená {openCount === 1 ? 'otázka' : 'otázky'}</span>
                )}
            </div>

            <hr className={styles.quiz_results_divider} />

            <div className={styles.quiz_results_content}>
                <div className={styles.quiz_results_content_list}>
                    {result.correctPerQuestion.map((isCorrect, index) => (
                        <ResultCard
                            key={index}
                            number={index + 1}
                            correct={isCorrect}
                            open={isCorrect == null}
                        />
                    ))}
                </div>
            </div>

            {openCount > 0 ? (
                <p className={styles.pending_message}>
                    {openCount === 1 ? 'Otevřená otázka' : `${openCount} otevřené otázky`} čeká na ohodnocení lektorem.
                </p>
            ) : (
                <button className={styles.review_button} onClick={onShowReview}>
                    Zobrazit opravený test
                </button>
            )}
        </section>
    );
}
