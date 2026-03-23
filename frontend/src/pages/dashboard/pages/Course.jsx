import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import styles from '../dashboard.module.scss';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseByUuid, deleteCourse, createCourse } from '../../../services/CourseService';
import { createModule } from '../../../services/ModuleService';
import { getCourseFeed } from '../../../services/FeedService';
import CourseDetail from '../courses/course-detail/CourseDetail';
import StatusSetterSelect from '../../../shared/form/course-select/StatusSetterSelect';
import Header from '../../../shared/layout/header/Header';
import NotFound from '../../not-found/NotFound';
import { usePageTitle } from '../../../hooks/usePageTitle';

export default function Course({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [course, setCourse] = useState(null);
    usePageTitle(course?.name);
    const [duplicating, setDuplicating] = useState(false);
    const [duplicateToast, setDuplicateToast] = useState(null);
    const [feedNotification, setFeedNotification] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const loadCourse = useCallback(async () => {
        try {
            const foundCourse = await getCourseByUuid(uuid);
            setCourse(foundCourse);
        } catch (err) {
            console.error(err);
            setNotFound(true);
        }
    }, [uuid]);

    useEffect(() => {
        loadCourse();
    }, [loadCourse]);

    useEffect(() => {
        if (!uuid) return;
        const checkFeedNotification = async () => {
            try {
                const feedData = await getCourseFeed(uuid);
                if (feedData.length === 0) return;
                const latest = feedData.reduce((a, b) =>
                    new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
                const lastSeen = parseInt(localStorage.getItem(`feedSeen_${uuid}`) || '0', 10);
                if (new Date(latest.createdAt).getTime() > lastSeen) {
                    setFeedNotification(true);
                }
            } catch (err) {
                // ignore
            }
        };
        checkFeedNotification();
    }, [uuid]);

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

    const handleDuplicate = async () => {
        if (!course || duplicating) return;

        if (!window.confirm(`Opravdu chcete duplikovat kurz "${course.name}"?`)) return;

        try {
            setDuplicating(true);
            const { uuid: _, ...courseData } = course;
            const newCourse = await createCourse({
                ...courseData,
                name: `${course.name} (kopie)`,
                status: 'Draft',
            });

            // Copy all modules from original course
            if (course.modules && course.modules.length > 0) {
                for (const m of course.modules) {
                    await createModule(newCourse.uuid, {
                        name: m.name,
                        description: m.description,
                        index: m.index,
                    });
                }
            }

            setDuplicateToast(`Kurz byl úspěšně duplikován jako "${newCourse.name}".`);
            setTimeout(() => setDuplicateToast(null), 4000);
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setDuplicating(false);
        }
    };

    if (notFound) return <NotFound />;

    return (
        <div>
            <Header user={user} setUser={setUser} onlyMobile={true} />
            <Sidenav user={user} setUser={setUser} showMore={true} current={'courseDetail'} uuid={uuid} modules={course?.modules} feedNotification={feedNotification} />
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
                            <>
                                <StatusSetterSelect
                                    course={course}
                                    setCourse={setCourse}
                                    onRefresh={loadCourse}
                                />
                                <button
                                    className={styles.course_button}
                                    onClick={handleDuplicate}
                                    disabled={duplicating}
                                >
                                    <svg width="1.75rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.875 2.5H6.875C6.70924 2.5 6.55027 2.56585 6.43306 2.68306C6.31585 2.80027 6.25 2.95924 6.25 3.125V6.25H3.125C2.95924 6.25 2.80027 6.31585 2.68306 6.43306C2.56585 6.55027 2.5 6.70924 2.5 6.875V16.875C2.5 17.0408 2.56585 17.1997 2.68306 17.3169C2.80027 17.4342 2.95924 17.5 3.125 17.5H13.125C13.2908 17.5 13.4497 17.4342 13.5669 17.3169C13.6842 17.1997 13.75 17.0408 13.75 16.875V13.75H16.875C17.0408 13.75 17.1997 13.6842 17.3169 13.5669C17.4342 13.4497 17.5 13.2908 17.5 13.125V3.125C17.5 2.95924 17.4342 2.80027 17.3169 2.68306C17.1997 2.56585 17.0408 2.5 16.875 2.5ZM12.5 16.25H3.75V7.5H12.5V16.25ZM16.25 12.5H13.75V6.875C13.75 6.70924 13.6842 6.55027 13.5669 6.43306C13.4497 6.31585 13.2908 6.25 13.125 6.25H7.5V3.75H16.25V12.5Z" fill="rgba(255, 255, 255, 1)" />
                                    </svg>
                                    {duplicating ? 'Duplikuji...' : 'Duplikovat kurz'}
                                </button>
                                {course.status === 'Draft' && (
                                    <button
                                        className={`${styles.course_button} ${styles.course_button_delete}`}
                                        onClick={handleDelete}
                                    >
                                        <svg width="1.75rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20.25 4.5H16.5V3.75C16.5 3.15326 16.2629 2.58097 15.841 2.15901C15.419 1.73705 14.8467 1.5 14.25 1.5H9.75C9.15326 1.5 8.58097 1.73705 8.15901 2.15901C7.73705 2.58097 7.5 3.15326 7.5 3.75V4.5H3.75C3.55109 4.5 3.36032 4.57902 3.21967 4.71967C3.07902 4.86032 3 5.05109 3 5.25C3 5.44891 3.07902 5.63968 3.21967 5.78033C3.36032 5.92098 3.55109 6 3.75 6H4.5V19.5C4.5 19.8978 4.65804 20.2794 4.93934 20.5607C5.22064 20.842 5.60218 21 6 21H18C18.3978 21 18.7794 20.842 19.0607 20.5607C19.342 20.2794 19.5 19.8978 19.5 19.5V6H20.25C20.4489 6 20.6397 5.92098 20.7803 5.78033C20.921 5.63968 21 5.44891 21 5.25C21 5.05109 20.921 4.86032 20.7803 4.71967C20.6397 4.57902 20.4489 4.5 20.25 4.5ZM9 3.75C9 3.55109 9.07902 3.36032 9.21967 3.21967C9.36032 3.07902 9.55109 3 9.75 3H14.25C14.4489 3 14.6397 3.07902 14.7803 3.21967C14.921 3.36032 15 3.55109 15 3.75V4.5H9V3.75ZM18 19.5H6V6H18V19.5Z" fill="white" />
                                        </svg>
                                        Smazat kurz
                                    </button>
                                )}
                            </>
                        } />
                    <CourseDetail course={course} />
                </section>
            )}
            {duplicateToast && (
                <div className={styles.toast}>{duplicateToast}</div>
            )}
        </div>
    )
}
