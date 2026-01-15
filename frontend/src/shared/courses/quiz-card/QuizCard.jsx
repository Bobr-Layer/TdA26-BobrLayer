import { Link } from 'react-router-dom';
import styles from './quiz-card.module.scss';

export default function QuizCard({ quiz }) {
    return (
        <div className={styles.quiz_card}>
            <div className={styles.quiz_card_text}>
                <h4>{quiz.title}</h4>
                <p>{quiz.questions.length} otázek</p>
            </div>
            <div className={styles.quiz_card_actions}>
                <p className={quiz.attemptsCount === 0 ? styles.none : undefined}>
                    {quiz.attemptsCount} lidí splnilo
                </p>
                <div className={styles.quiz_card_actions_list}>
                    <Link to={'quizz/' + quiz.uuid}>
                        <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.1562 8.94443L6.9 2.0585C6.71022 1.94229 6.49287 1.87885 6.27037 1.87473C6.04788 1.87061 5.82832 1.92596 5.63438 2.03506C5.44227 2.14247 5.28225 2.2991 5.17075 2.48886C5.05926 2.67862 5.00032 2.89466 5 3.11475V16.8851C5.00145 17.2152 5.13393 17.5313 5.36833 17.7638C5.60273 17.9962 5.91986 18.1261 6.25 18.1249C6.48043 18.1248 6.70639 18.0613 6.90313 17.9413L18.1562 11.0554C18.3371 10.9451 18.4866 10.7902 18.5904 10.6055C18.6941 10.4208 18.7486 10.2125 18.7486 10.0007C18.7486 9.78885 18.6941 9.58057 18.5904 9.39587C18.4866 9.21117 18.3371 9.05625 18.1562 8.946V8.94443ZM6.25 16.8702V3.1249L17.4867 9.9999L6.25 16.8702Z" fill="black" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
