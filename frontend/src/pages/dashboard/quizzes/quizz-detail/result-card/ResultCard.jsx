import { useState } from 'react';
import styles from './result-card.module.scss';

export default function ResultCard() {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className={styles.result_card}>
            <div className={styles.result_card_header} onClick={() => setShowMore(!showMore)}>
                <p className={styles.result_card_header_heading}>12/20</p>
                <p>attempt.date</p>
                <button className={`${showMore ? styles.show : ''}`}>
                    <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6925 7.94205L10.4425 14.192C10.3845 14.2502 10.3156 14.2963 10.2397 14.3277C10.1638 14.3592 10.0825 14.3754 10.0003 14.3754C9.91821 14.3754 9.83688 14.3592 9.76101 14.3277C9.68514 14.2963 9.61621 14.2502 9.55816 14.192L3.30816 7.94205C3.19088 7.82477 3.125 7.66571 3.125 7.49986C3.125 7.33401 3.19088 7.17495 3.30816 7.05767C3.42544 6.9404 3.5845 6.87451 3.75035 6.87451C3.9162 6.87451 4.07526 6.9404 4.19253 7.05767L10.0003 12.8663L15.8082 7.05767C15.8662 6.9996 15.9352 6.95354 16.011 6.92211C16.0869 6.89069 16.1682 6.87451 16.2503 6.87451C16.3325 6.87451 16.4138 6.89069 16.4897 6.92211C16.5655 6.95354 16.6345 6.9996 16.6925 7.05767C16.7506 7.11574 16.7967 7.18468 16.8281 7.26055C16.8595 7.33642 16.8757 7.41774 16.8757 7.49986C16.8757 7.58198 16.8595 7.6633 16.8281 7.73917C16.7967 7.81504 16.7506 7.88398 16.6925 7.94205Z" fill="black" />
                    </svg>
                </button>
            </div>
            {showMore && (
                <div className={styles.result_card_content}>
                    <p>1</p>
                    <p className={styles.red}>2</p>
                    <p className={styles.none}>3</p>
                    <p>1</p>
                    <p>2</p>
                    <p>3</p>
                    <p>1</p>
                    <p className={styles.red}>2</p>
                    <p>3</p>
                    <p>1</p>
                    <p>2</p>
                    <p>3</p>
                    <p>1</p>
                    <p className={styles.red}>2</p>
                    <p className={styles.none}>3</p>
                    <p>1</p>
                    <p>2</p>
                    <p className={styles.none}>3</p>
                    <p>1</p>
                    <p className={styles.red}>2</p>
                </div>
            )}
        </div>
    )
}
