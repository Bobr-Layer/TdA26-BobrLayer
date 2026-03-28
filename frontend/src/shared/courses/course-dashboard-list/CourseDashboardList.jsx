import CourseDashboardCard from '../course-dashboard-card/CourseDashboardCard';
import styles from './course-dashboard-list.module.scss';

function CourseDashboardList({ courses, selectedCourses, onSelect }) {
    return (
        <article className={styles.course_dashboard_list}>
            {courses.map((c) => (
                <CourseDashboardCard
                    course={c}
                    key={c.uuid}
                    selected={selectedCourses?.has(c.uuid)}
                    onSelect={onSelect}
                />
            ))}
        </article>
    )
}

export default CourseDashboardList
