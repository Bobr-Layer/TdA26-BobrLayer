import { Link } from 'react-router-dom';
import styles from './course-card.module.scss';
import LectorCard from '../../lectors/lector-card/LectorCard';

const STATUS_LABELS = {
    Draft: 'Koncept',
    Scheduled: 'Plánovaný',
    Live: 'Aktivní',
    Paused: 'Pozastavený',
    Archived: 'Archivovaný',
};

function CourseCard({ course, lector }) {
    return (
        <Link className={`${styles.course_card} ${lector ? styles.lector : ''}`} to={'/courses/' + course.uuid}>
            <div className={styles.course_card_info}>
                <div className={styles.course_card_info_c}>
                    <h3>{course.name}</h3>
                    <p>{course.description}</p>
                </div>
                {lector && <LectorCard lectorName={course.lectorName} lectorMail={course.lectorMail} />}
            </div>
            <div className={styles.course_card_end}>
                {course.status && (
                    <span className={styles.status_badge} data-status={course.status}>
                        {STATUS_LABELS[course.status] ?? course.status}
                        {course.status === 'Scheduled' && course.scheduledAt && (
                            <> · {new Date(course.scheduledAt).toLocaleString('cs-CZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            })}</>
                        )}
                    </span>
                )}
                <svg width="1.75rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.7806 12.5306L14.0306 19.2806C13.8899 19.4213 13.699 19.5004 13.5 19.5004C13.301 19.5004 13.1101 19.4213 12.9694 19.2806C12.8286 19.1399 12.7496 18.949 12.7496 18.75C12.7496 18.551 12.8286 18.3601 12.9694 18.2194L18.4397 12.75H3.75C3.55109 12.75 3.36032 12.671 3.21967 12.5303C3.07902 12.3897 3 12.1989 3 12C3 11.8011 3.07902 11.6103 3.21967 11.4697C3.36032 11.329 3.55109 11.25 3.75 11.25H18.4397L12.9694 5.78061C12.8286 5.63988 12.7496 5.44901 12.7496 5.24999C12.7496 5.05097 12.8286 4.8601 12.9694 4.71936C13.1101 4.57863 13.301 4.49957 13.5 4.49957C13.699 4.49957 13.8899 4.57863 14.0306 4.71936L20.7806 11.4694C20.8504 11.539 20.9057 11.6217 20.9434 11.7128C20.9812 11.8038 21.0006 11.9014 21.0006 12C21.0006 12.0986 20.9812 12.1961 20.9434 12.2872C20.9057 12.3782 20.8504 12.461 20.7806 12.5306Z" fill="rgba(255, 255, 255, 1)" />
                </svg>
            </div>
        </Link>
    )
}

export default CourseCard
