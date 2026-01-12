import CourseDashboardCard from '../course-dashboard-card/CourseDashboardCard';
import styles from './course-dashboard-list.module.scss';

function CourseDashboardList({ courses }) {
    return (
        <article className={styles.course_dashboard_list}>
            {courses.map((c) => (
                <CourseDashboardCard course={c} key={c.uuid}/>
            ))}
        </article>
    )
}

export default CourseDashboardList
