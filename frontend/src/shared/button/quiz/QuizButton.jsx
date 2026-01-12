import { Link } from 'react-router-dom';
import styles from './quiz-button.module.scss';

export default function QuizButton({ text, link, onClick, red }) {
    if (onClick) {
        return (
            <button className={`${styles.quiz_button} ${red ? styles.red : ''}`} onClick={onClick}>
                {text}
            </button>
        )
    }

    return (
        <Link to={link} className={`${styles.quiz_button} ${red ? styles.red : ''}`}>{text}</Link>
    )
}
