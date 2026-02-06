import CourseCard from '../course-card/CourseCard';
import styles from './course-list.module.scss';

function CourseList({ courses, lector }) {
    return (
        <article className={styles.course_list}>
            {courses.map((c) => (
                <CourseCard course={c} key={c.uuid} lector={lector}/>
            ))}
        </article>
    )
}

export default CourseList
