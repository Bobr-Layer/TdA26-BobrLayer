import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import styles from '../dashboard.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseByUuid } from '../../../services/CourseService';
import FeedForm from '../../../shared/form/feed-form/FeedForm';
import FeedCard from '../../../shared/courses/feed-card/FeedCard';

export default function DashboardFeed({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [course, setCourse] = useState();

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

    const actions = [
        {
            text: 'Zpět do kurzu',
            icon: <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.1196 8.49406L11.1195 22.4941C11.0383 22.5754 10.9418 22.64 10.8356 22.684C10.7293 22.728 10.6155 22.7507 10.5005 22.7507C10.3855 22.7507 10.2716 22.728 10.1654 22.684C10.0592 22.64 9.96269 22.5754 9.88142 22.4941L3.75642 16.3691C3.59224 16.2049 3.5 15.9822 3.5 15.75C3.5 15.5178 3.59224 15.2951 3.75642 15.1309C3.92061 14.9667 4.14329 14.8745 4.37549 14.8745C4.60768 14.8745 4.83036 14.9667 4.99455 15.1309L10.5005 20.638L23.8814 7.25594C24.0456 7.09175 24.2683 6.99951 24.5005 6.99951C24.7327 6.99951 24.9554 7.09175 25.1196 7.25594C25.2837 7.42012 25.376 7.6428 25.376 7.875C25.376 8.10719 25.2837 8.32988 25.1196 8.49406Z" fill="white" />
            </svg>,
            onClick: () => navigate(`/dashboard/${uuid}`),
            red: false
        }
    ]

    return (
        <div>
            <Sidenav user={user} setUser={setUser} />
            {course && (
                <section className={styles.dashboard}>
                    <DashboardNav heading={'Feed kurzu ' + course.name} actions={actions} />
                    <article className={styles.feed_list}>
                        <FeedCard feed={{ type: 'system', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'manual', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'system', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'manual', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'system', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'manual', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'system', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'manual', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'system', title: 'nazev', text: 'lorem impsum doler' }} />
                        <FeedCard feed={{ type: 'manual', title: 'nazev', text: 'lorem impsum doler' }} />                        
                        <FeedForm />
                    </article>
                </section>
            )}
        </div>
    )
}
