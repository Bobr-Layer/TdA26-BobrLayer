import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import styles from '../dashboard.module.scss';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseByUuid, deleteCourse } from '../../../services/CourseService';
import CourseDetail from '../courses/course-detail/CourseDetail';
import StatusSetterSelect from '../../../shared/form/course-select/StatusSetterSelect';

export default function Course({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [course, setCourse] = useState(null);

    const loadCourse = useCallback(async () => {
        try {
            const foundCourse = await getCourseByUuid(uuid);
            setCourse(foundCourse);
        } catch (err) {
            console.error(err);
            navigate('/dashboard', { replace: true });
        }
    }, [uuid, navigate]);

    useEffect(() => {
        loadCourse();
    }, [loadCourse]);

    const handleDelete = async () => {
        if (!course) return;

        try {
            await deleteCourse(course.uuid);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div>
            <Sidenav user={user} setUser={setUser} showMore={true} current={'courseDetail'} uuid={uuid} modules={course?.modules}/>
            {course && (
                <section className={styles.dashboard}>
                    <DashboardNav
                        link={'/dashboard'}
                        textLink={'Vrátit se zpět'}
                        buttonText={'Upravit kurz'}
                        buttonLink={'edit'}
                        buttonIcon={
                            <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24.862 8.02494L19.9752 3.13697C19.8127 2.97443 19.6197 2.84549 19.4074 2.75752C19.195 2.66955 18.9674 2.62427 18.7376 2.62427C18.5077 2.62427 18.2801 2.66955 18.0678 2.75752C17.8555 2.84549 17.6625 2.97443 17.5 3.13697L4.01298 16.6251C3.84977 16.787 3.72037 16.9798 3.63231 17.1921C3.54425 17.4045 3.49927 17.6322 3.50001 17.8621V22.7501C3.50001 23.2142 3.68438 23.6593 4.01257 23.9875C4.34076 24.3157 4.78588 24.5001 5.25001 24.5001H10.138C10.3679 24.5008 10.5956 24.4559 10.808 24.3678C11.0204 24.2797 11.2131 24.1503 11.375 23.9871L24.862 10.5001C25.0246 10.3376 25.1535 10.1447 25.2415 9.93231C25.3295 9.71996 25.3747 9.49237 25.3747 9.26252C25.3747 9.03267 25.3295 8.80508 25.2415 8.59273C25.1535 8.38038 25.0246 8.18745 24.862 8.02494ZM10.138 22.7501H5.25001V17.8621L14.875 8.23713L19.763 13.1251L10.138 22.7501ZM21 11.887L16.112 7.0001L18.737 4.3751L23.625 9.26197L21 11.887Z" fill="#1A1A1A" />
                            </svg>
                        }
                        showButton={course.status === 'Draft'}
                        otherComponent={
                            <StatusSetterSelect
                                course={course}
                                setCourse={setCourse}
                                handleDelete={handleDelete}
                                onRefresh={loadCourse}
                            />
                        } />
                    <CourseDetail course={course} />
                </section>
            )}
        </div>
    )
}
