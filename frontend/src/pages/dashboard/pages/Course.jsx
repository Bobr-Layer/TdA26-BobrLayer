import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import styles from '../dashboard.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseByUuid, deleteCourse } from '../../../services/CourseService';
import CourseDetail from '../courses/course-detail/CourseDetail';

export default function Course({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const foundCourse = await getCourseByUuid(uuid);
                setCourse(foundCourse);
            } catch (err) {
                console.error(err);
                navigate('/dashboard', { replace: true });
            }
        };

        loadCourse();
    }, [uuid, navigate]);


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

    const actions = [
        {
            text: 'Upravit',
            icon: <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.862 8.0247L19.9752 3.13673C19.8127 2.97418 19.6197 2.84524 19.4074 2.75727C19.195 2.6693 18.9674 2.62402 18.7376 2.62402C18.5077 2.62402 18.2801 2.6693 18.0678 2.75727C17.8555 2.84524 17.6625 2.97418 17.5 3.13673L4.01298 16.6249C3.84977 16.7868 3.72037 16.9795 3.63231 17.1919C3.54425 17.4042 3.49927 17.632 3.50001 17.8619V22.7499C3.50001 23.214 3.68438 23.6591 4.01257 23.9873C4.34076 24.3155 4.78588 24.4999 5.25001 24.4999H10.138C10.3679 24.5006 10.5956 24.4556 10.808 24.3676C11.0204 24.2795 11.2131 24.1501 11.375 23.9869L24.862 10.4999C25.0246 10.3373 25.1535 10.1444 25.2415 9.93206C25.3295 9.71972 25.3747 9.49212 25.3747 9.26227C25.3747 9.03243 25.3295 8.80483 25.2415 8.59249C25.1535 8.38014 25.0246 8.1872 24.862 8.0247ZM10.138 22.7499H5.25001V17.8619L14.875 8.23688L19.763 13.1249L10.138 22.7499ZM21 11.8867L16.112 6.99985L18.737 4.37485L23.625 9.26173L21 11.8867Z" fill="white" />
            </svg>,
            onClick: () => course && navigate(`/dashboard/${course.uuid}/edit`),
            red: false
        },
        {
            text: 'Smazat kurz',
            icon: <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.625 5.25H19.25V4.375C19.25 3.67881 18.9734 3.01113 18.4812 2.51884C17.9889 2.02656 17.3212 1.75 16.625 1.75H11.375C10.6788 1.75 10.0111 2.02656 9.51884 2.51884C9.02656 3.01113 8.75 3.67881 8.75 4.375V5.25H4.375C4.14294 5.25 3.92038 5.34219 3.75628 5.50628C3.59219 5.67038 3.5 5.89294 3.5 6.125C3.5 6.35706 3.59219 6.57962 3.75628 6.74372C3.92038 6.90781 4.14294 7 4.375 7H5.25V22.75C5.25 23.2141 5.43437 23.6592 5.76256 23.9874C6.09075 24.3156 6.53587 24.5 7 24.5H21C21.4641 24.5 21.9092 24.3156 22.2374 23.9874C22.5656 23.6592 22.75 23.2141 22.75 22.75V7H23.625C23.8571 7 24.0796 6.90781 24.2437 6.74372C24.4078 6.57962 24.5 6.35706 24.5 6.125C24.5 5.89294 24.4078 5.67038 24.2437 5.50628C24.0796 5.34219 23.8571 5.25 23.625 5.25ZM10.5 4.375C10.5 4.14294 10.5922 3.92038 10.7563 3.75628C10.9204 3.59219 11.1429 3.5 11.375 3.5H16.625C16.8571 3.5 17.0796 3.59219 17.2437 3.75628C17.4078 3.92038 17.5 4.14294 17.5 4.375V5.25H10.5V4.375ZM21 22.75H7V7H21V22.75ZM12.25 11.375V18.375C12.25 18.6071 12.1578 18.8296 11.9937 18.9937C11.8296 19.1578 11.6071 19.25 11.375 19.25C11.1429 19.25 10.9204 19.1578 10.7563 18.9937C10.5922 18.8296 10.5 18.6071 10.5 18.375V11.375C10.5 11.1429 10.5922 10.9204 10.7563 10.7563C10.9204 10.5922 11.1429 10.5 11.375 10.5C11.6071 10.5 11.8296 10.5922 11.9937 10.7563C12.1578 10.9204 12.25 11.1429 12.25 11.375ZM17.5 11.375V18.375C17.5 18.6071 17.4078 18.8296 17.2437 18.9937C17.0796 19.1578 16.8571 19.25 16.625 19.25C16.3929 19.25 16.1704 19.1578 16.0063 18.9937C15.8422 18.8296 15.75 18.6071 15.75 18.375V11.375C15.75 11.1429 15.8422 10.9204 16.0063 10.7563C16.1704 10.5922 16.3929 10.5 16.625 10.5C16.8571 10.5 17.0796 10.5922 17.2437 10.7563C17.4078 10.9204 17.5 11.1429 17.5 11.375Z" fill="white" />
            </svg>,
            onClick: () => handleDelete(),
            red: true
        }
    ]

    return (
        <div>
            <Sidenav user={user} setUser={setUser} />
            {course && (
                <section className={styles.dashboard}>
                    <DashboardNav heading={'Detail kurzu'} actions={actions} />
                    <CourseDetail course={course} />
                </section>
            )}
        </div>
    )
}
