import Header from '../../shared/layout/header/Header';
import styles from './courses.module.scss';
import SearchInput from '../../shared/form/search-input/SearchInput';
import CourseList from '../../shared/courses/course-list/CourseList';
import { useState, useEffect } from 'react';
import { getCourses } from '../../services/CourseService';
import Footer from '../../shared/layout/footer/Footer'

function Courses({ user, setUser }) {
  const [courses, setCourses] = useState([]);
  const [coursesData, setCoursesData] = useState([]);

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

  return (
    <div className={styles.wrapper}>
      <div>
        <Header user={user} setUser={setUser} />
        <section className={styles.courses}>
          <h1>Dostupné kurzy</h1>
          <SearchInput text={'Hledejte kurz'} data={coursesData} setData={setCoursesData} />
          <CourseList courses={coursesData} lector={true}/>
        </section>
      </div>

      <Footer user={user} setUser={setUser} />

      <div className={styles.courses_ball}></div>
    </div>
  )
}

export default Courses
