import styles from './quiz-results.module.scss';
import BackToButton from '../../../../shared/button/back-to/BackToButton';
import ResultCard from './result-card/ResultCard';

export default function QuizResults({ name, answers, uuid }) {
    return (
        <section className={styles.quiz_results}>
            <article className={styles.quiz_results_header}>
                <img src="/img/quiz.png" alt="" />
                <h1>{name}</h1>
            </article>
            <article className={styles.quiz_results_content}>
                <h3>Váš výsledek</h3>
                <div className={styles.quiz_results_content_list}>
                    <ResultCard number={1} correct={true} />
                    <ResultCard number={1} correct={true} />
                    <ResultCard number={1} correct={false} />
                    <ResultCard number={1} correct={true} />
                    <ResultCard number={1} correct={false} />
                    <ResultCard number={1} correct={false} />
                    <ResultCard number={1} correct={true} />
                    <ResultCard number={1} correct={true} />
                    <ResultCard number={1} correct={false} />
                    <ResultCard number={1} correct={true} />
                    <ResultCard number={1} correct={false} />
                    <ResultCard number={1} correct={false} />
                    <ResultCard number={1} correct={true} />
                    <ResultCard number={1} correct={true} />
                    <ResultCard number={1} correct={false} />
                    <ResultCard number={1} correct={true} />
                </div>
            </article>
            <BackToButton text={'Vrátit se zpět na detail kurzu'} link={'/courses/' + uuid} cyan={true} />
        </section>
    )
}
