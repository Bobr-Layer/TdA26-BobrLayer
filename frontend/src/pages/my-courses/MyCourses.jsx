import Header from '../../shared/layout/header/Header';
import Footer from '../../shared/layout/footer/Footer';
import CourseList from '../../shared/courses/course-list/CourseList';
import styles from './mycourses.module.scss';
import { useState, useEffect } from 'react';
import { getMyEnrolledCourses } from '../../services/AuthService';
import { usePageTitle } from '../../hooks/usePageTitle';

function MyCourses({ user, setUser }) {
    usePageTitle('Moje kurzy');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCourses() {
            try {
                const data = await getMyEnrolledCourses();
                setCourses(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadCourses();
    }, []);

    return (
        <div className={styles.wrapper}>
            <div>
                <Header user={user} setUser={setUser} />
                <section className={styles.mycourses}>
                    <h1>Moje kurzy</h1>
                    {loading ? (
                        <p className={styles.loading}>Načítání...</p>
                    ) : courses.length === 0 ? (
                        <p className={styles.empty}>Nejste přihlášeni na žádný kurz. Přihlaste se na kurz v <a href="/courses">seznamu kurzů</a>.</p>
                    ) : (
                        <CourseList courses={courses} lector={true} />
                    )}
                </section>
            </div>

            <Footer user={user} setUser={setUser} />

            <div className={styles.mycourses_ball}></div>
        </div>
    );
}

export default MyCourses;
