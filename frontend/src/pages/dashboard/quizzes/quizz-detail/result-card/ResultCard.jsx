import { useState } from 'react';
import styles from './result-card.module.scss';

export default function ResultCard({ averageScore, questionsCount, attemptsCount, questions }) {
    const [showMore, setShowMore] = useState(false);

    const correctAnswersAvg = (averageScore / 100) * questionsCount;

    return (
        <div className={styles.result_card}>
            <div className={styles.result_card_header} onClick={() => setShowMore(!showMore)}>
                <div>
                    <p className={styles.result_card_header_heading}>
                        {correctAnswersAvg.toFixed(1)}/{questionsCount}
                    </p>
                    <p>{attemptsCount} pokusů</p>
                </div>
                <button className={`${showMore ? styles.show : ''}`}>
                    <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6925 7.94217L10.4425 14.1922C10.3845 14.2503 10.3156 14.2964 10.2397 14.3278C10.1638 14.3593 10.0825 14.3755 10.0003 14.3755C9.91821 14.3755 9.83688 14.3593 9.76101 14.3278C9.68514 14.2964 9.61621 14.2503 9.55816 14.1922L3.30816 7.94217C3.19088 7.82489 3.125 7.66583 3.125 7.49998C3.125 7.33413 3.19088 7.17507 3.30816 7.05779C3.42544 6.94052 3.5845 6.87463 3.75035 6.87463C3.9162 6.87463 4.07526 6.94052 4.19253 7.05779L10.0003 12.8664L15.8082 7.05779C15.8662 6.99972 15.9352 6.95366 16.011 6.92224C16.0869 6.89081 16.1682 6.87463 16.2503 6.87463C16.3325 6.87463 16.4138 6.89081 16.4897 6.92224C16.5655 6.95366 16.6345 6.99972 16.6925 7.05779C16.7506 7.11586 16.7967 7.1848 16.8281 7.26067C16.8595 7.33654 16.8757 7.41786 16.8757 7.49998C16.8757 7.5821 16.8595 7.66342 16.8281 7.73929C16.7967 7.81516 16.7506 7.8841 16.6925 7.94217Z" fill="white" />
                    </svg>
                </button>
            </div>
            {showMore && (
                <div className={styles.result_card_content}>
                    {questions.map((q, index) => (
                        <p
                            key={q.uuid}
                            className={q.successRate < 50 ? styles.red : ''}
                        >
                            {index + 1}
                        </p>
                    ))}
                </div>
            )}
        </div>
    )
}