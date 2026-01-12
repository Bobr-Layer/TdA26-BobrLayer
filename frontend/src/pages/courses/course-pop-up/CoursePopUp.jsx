import FeedButton from '../../../shared/button/feed/FeedButton';
import MaterialCard from '../../../shared/courses/material-card/MaterialCard';
import QuizCard from '../../../shared/courses/quiz-card/QuizCard';
import LectorCard from '../../../shared/lectors/lector-card/LectorCard';
import styles from './course-pop-up.module.scss';
import { useNavigate } from 'react-router-dom';

export default function CoursePopUp({ course }) {
    const navigate = useNavigate();

    return (
        <div className={styles.pop_up_wrapper} onClick={() => navigate('/courses', { replace: true })}>
            <div className={styles.course_pop_up} onClick={(e) => e.stopPropagation()}>
                <h2>{course.name}</h2>
                <div className={styles.course_pop_up_about}>
                    <LectorCard lectorName={course.lectorName} lectorMail={course.lectorMail} />
                    <FeedButton course={course}/>
                </div>
                <p className={styles.course_pop_up_text}>{course.description}</p>
                <div className={styles.course_pop_up_content}>
                    <h3>Přílohy</h3>
                    <div className={styles.course_pop_up_content_list}>
                        <MaterialCard />
                        <MaterialCard file={true} />
                        <MaterialCard />
                    </div>
                </div>
                <div className={styles.course_pop_up_content}>
                    <h3>Kvízy</h3>
                    <QuizCard />
                    <QuizCard none={true} />
                    <QuizCard />
                </div>
            </div>
        </div>
    )
}
