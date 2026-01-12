import QuizDashboardCard from '../../../../shared/courses/quiz-dashboard-card/QuizDashboardCard';
import styles from './course-detail.module.scss';
import FeedButton from '../../../../shared/button/feed/FeedButton';
import NewButton from '../../../../shared/button/new/NewButton';
import MaterialDashboardCard from '../../../../shared/courses/material-dashboard-card/MaterialDashboardCard';

export default function CourseDetail({ course }) {
    return (
        <article className={styles.course_detail}>
            <div className={styles.course_detail_about}>
                <div className={styles.course_detail_about_header}>
                    <h2>{course.name}</h2>
                    <p>{course.description}</p>
                </div>
                <div className={styles.course_detail_content}>
                    <h3>Kvízy</h3>
                    <div className={styles.course_detail_content_quiz}>
                        <QuizDashboardCard quiz={{ name: 'nazev kvizu', description: 'popisek kvizu' }} uuid={course.uuid} />
                        <QuizDashboardCard quiz={{ name: 'nazev kvizu', description: 'popisek kvizu' }} uuid={course.uuid} />
                        <NewButton link={'/dashboard/' + course.uuid + '/quizzes/new'} bigger={true} />
                    </div>
                </div>
            </div>
            <div className={styles.course_detail_materials}>
                <FeedButton longer={true} />
                <div className={styles.course_detail_content}>
                    <div className={styles.course_detail_content_header}>
                        <h3>Soubory</h3>
                        <p>3 soubory</p>
                    </div>
                    <div className={styles.course_detail_content_material}>
                        <MaterialDashboardCard file={true} />
                        <MaterialDashboardCard file={true} />
                        <MaterialDashboardCard file={true} />
                    </div>
                </div>
                <div className={styles.course_detail_content}>
                    <div className={styles.course_detail_content_header}>
                        <h3>Odkazy</h3>
                        <p>2 odkazy</p>
                    </div>
                    <div className={styles.course_detail_content_material}>
                        <MaterialDashboardCard />
                        <MaterialDashboardCard />
                    </div>
                </div>
            </div>
        </article>
    )
}
