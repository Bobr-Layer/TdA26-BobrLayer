import Header from '../../shared/layout/header/Header';
import styles from './courses.module.scss';
import SearchInput from '../../shared/form/search-input/SearchInput';
import CourseList from '../../shared/courses/course-list/CourseList';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourses } from '../../services/CourseService';
import CoursePopUp from './course-pop-up/CoursePopUp';

function Courses() {
  const navigate = useNavigate();
  const { uuid } = useParams();

  const [courses, setCourses] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
        setCoursesData(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (!uuid || courses.length === 0) {
      setCourse(null);
      return;
    }

    const foundCourse = courses.find(c => c.uuid === uuid);

    if (!foundCourse) {
      navigate('/courses', { replace: true });
      return;
    }

    setCourse(foundCourse);
  }, [uuid, courses, navigate]);

  return (
    <div>
      <Header />
      <section className={styles.courses}>
        <article className={styles.courses_nav}>
          <div className={styles.courses_nav_heading}>
            <h1>Dostupné kurzy</h1>
          </div>
          <SearchInput text={'Najít kurz…'} data={coursesData} setData={setCoursesData} />
        </article>
        <CourseList courses={coursesData} />
      </section>
      {course && (
        <CoursePopUp course={course} />
      )}
    </div>
  )
}

export default Courses
