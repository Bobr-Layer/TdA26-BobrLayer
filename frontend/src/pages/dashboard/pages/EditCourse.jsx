import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import styles from '../dashboard.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateCourse, getCourseByUuid } from '../../../services/CourseService';
import { getUrlMaterials, getFileMaterials, createUrlMaterial, updateUrlMaterial, createFileMaterial, updateFileMaterial, deleteMaterial } from '../../../services/MaterialService';
import CourseForm from '../courses/course-form/CourseForm';

export default function EditCourse({ user, setUser }) {
    const [course, setCourse] = useState();
    const { uuid } = useParams();
    const navigate = useNavigate();

    const [courseData, setCourseData] = useState({
        name: '',
        description: '',
    });

    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const foundCourse = await getCourseByUuid(uuid);
                setCourse(foundCourse);
                setCourseData({
                    name: foundCourse.name,
                    description: foundCourse.description
                });

            } catch (err) {
                console.error(err);
                navigate('/dashboard', { replace: true });
            }
        };

        loadCourse();
    }, [uuid, navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateCourse(course?.uuid, courseData);

            navigate(`/dashboard/${course.uuid}`, { replace: true });
        } catch (err) {
            console.error('Chyba při ukládání:', err);
            alert('Nepodařilo se uložit změny. Zkuste to prosím znovu.');
        }
    };

    return (
        <div>
            <Sidenav user={user} setUser={setUser} current={'courseDetail'} uuid={uuid} showMore={true} modules={course?.modules}/>
            <form className={styles.dashboard} onSubmit={onSubmit}>
                <DashboardNav
                    link={'/dashboard/' + uuid}
                    textLink={'Vrátit se zpět a zahodit změny'}
                    buttonText={'Uložit změny'}
                    buttonSubmit={true}
                    buttonIcon={
                        <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.1196 8.49406L11.1195 22.4941C11.0383 22.5754 10.9418 22.64 10.8356 22.684C10.7293 22.728 10.6155 22.7507 10.5005 22.7507C10.3855 22.7507 10.2716 22.728 10.1654 22.684C10.0592 22.64 9.96269 22.5754 9.88142 22.4941L3.75642 16.3691C3.59224 16.2049 3.5 15.9822 3.5 15.75C3.5 15.5178 3.59224 15.2951 3.75642 15.1309C3.92061 14.9667 4.14329 14.8745 4.37549 14.8745C4.60768 14.8745 4.83036 14.9667 4.99455 15.1309L10.5005 20.638L23.8814 7.25594C24.0456 7.09175 24.2683 6.99951 24.5005 6.99951C24.7327 6.99951 24.9554 7.09175 25.1196 7.25594C25.2837 7.42012 25.376 7.6428 25.376 7.875C25.376 8.10719 25.2837 8.32988 25.1196 8.49406Z" fill="#1A1A1A" />
                        </svg>
                    }
                    showButton={true}
                />
                <CourseForm
                    courseData={courseData}
                    handleCourseChange={handleCourseChange}
                />
            </form>
        </div>
    );
}