import Header from '../../shared/layout/header/Header';
import styles from './courses.module.scss';
import SearchInput from '../../shared/form/search-input/SearchInput';
import CourseList from '../../shared/courses/course-list/CourseList';
import { useState, useEffect, useRef } from 'react';
import { getCourses } from '../../services/CourseService';
import Footer from '../../shared/layout/footer/Footer'
import CourseSelect from '../../shared/form/course-select/CourseSelect'
import { usePageTitle } from '../../hooks/usePageTitle';
import SectionHeading from '../../shared/ui/section-heading/SectionHeading';

function Courses({ user, setUser }) {
  usePageTitle('Kurzy');
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

  useEffect(() => {
    const els = document.querySelectorAll(`.${styles.reveal}`);
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(styles.revealed);
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.05 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div>
        <Header user={user} setUser={setUser} />
        <section className={styles.courses}>
          <div className={styles.reveal} style={{ '--delay': '0s' }}>
            <SectionHeading label="SEZNAM KURZŮ" heading="Dostupné kurzy" as="h1" />
          </div>
          <div className={`${styles.courses_nav} ${styles.reveal}`} style={{ '--delay': '0.1s' }}>
            <SearchInput text={'Hledejte kurz'} data={coursesData} setData={setCoursesData} />
            <CourseSelect courseData={courses} setCourseData={setCoursesData}/>
          </div>
          <div className={styles.reveal} style={{ '--delay': '0.2s' }}>
            <CourseList courses={coursesData} lector={true} />
          </div>
        </section>
      </div>

      <Footer user={user} setUser={setUser} />
      <div className={styles.courses_ball}></div>
    </div>
  )
}

export default Courses
