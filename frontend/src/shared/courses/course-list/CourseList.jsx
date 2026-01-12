import CourseCard from '../course-card/CourseCard';
import styles from './course-list.module.scss';

function CourseList({ courses }) {
    return (
        <article className={styles.course_list}>
            {courses.map((c) => (
                <CourseCard course={c} key={c.uuid}/>
            ))}
        </article>
    )
}

export default CourseList
