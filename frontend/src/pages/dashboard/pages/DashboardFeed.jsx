import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import styles from '../dashboard.module.scss';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseByUuid } from '../../../services/CourseService';
import FeedForm from '../../../shared/form/feed-form/FeedForm';
import FeedCard from '../../../shared/courses/feed-card/FeedCard';
import { getCourseFeed } from '../../../services/FeedService';
import { Link } from 'react-router-dom';
import Header from '../../../shared/layout/header/Header';
import NotFound from '../../not-found/NotFound';
import { usePageTitle } from '../../../hooks/usePageTitle';

export default function DashboardFeed({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [course, setCourse] = useState();
    usePageTitle(course ? `Feed – ${course.name}` : 'Feed');
    const [feed, setFeed] = useState([]);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const feedEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    const loadFeed = useCallback(async (courseUuid) => {
        if (!courseUuid) return;

        try {
            const feedData = await getCourseFeed(courseUuid);
            const sortedFeed = [...feedData].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );

            setFeed(prevFeed => {
                if (prevFeed.length === sortedFeed.length &&
                    prevFeed.length > 0 &&
                    prevFeed[prevFeed.length - 1].uuid === sortedFeed[sortedFeed.length - 1].uuid) {
                    return prevFeed;
                }
                return sortedFeed;
            });
        } catch (err) {
            console.error('Chyba při načítání feedu:', err);
        } finally {
            setIsLoadingFeed(false);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(`feedSeen_${uuid}`, Date.now().toString());
    }, [uuid]);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const foundCourse = await getCourseByUuid(uuid);
                setCourse(foundCourse);
                await loadFeed(foundCourse.uuid);
            } catch (err) {
                console.error(err);
                setNotFound(true);
            }
        };
        loadCourse();
    }, [uuid, navigate, loadFeed]);

    useEffect(() => {
        if (!uuid) return;

        const startPolling = () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

            pollingIntervalRef.current = setInterval(() => {
                loadFeed(uuid);
            }, 3000);
        };

        startPolling();

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [uuid, loadFeed]);

    useEffect(() => {
        if (!isLoadingFeed && feed.length > 0) {
            feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isLoadingFeed, feed]);

    if (notFound) return <NotFound />;

    return (
        <div>
            <Header user={user} setUser={setUser} onlyMobile={true}/>
            <Sidenav user={user} setUser={setUser} showMore={true} current={'courseFeed'} uuid={uuid} modules={course?.modules}/>
            {course && (
                <section className={styles.feed_page}>
                    <div className={styles.feed_page_header}>
                        <Link to={'/dashboard/' + uuid} className={styles.feed_header_back}>
                            <svg width="1rem" viewBox="0 0 20 20" fill="none">
                                <path d="M17.5 10C17.5 10.1658 17.4342 10.3247 17.317 10.4419C17.1997 10.5592 17.0408 10.625 16.875 10.625H4.63359L9.19219 15.1828C9.30951 15.3001 9.37539 15.4592 9.37539 15.625C9.37539 15.7908 9.30951 15.9499 9.19219 16.0672C9.07487 16.1845 8.91581 16.2504 8.74997 16.2504C8.58412 16.2504 8.42506 16.1845 8.30774 16.0672L2.68274 10.4422C2.62466 10.3842 2.57855 10.3153 2.54711 10.2394C2.51567 10.1635 2.49951 10.0822 2.49951 10C2.49951 9.9178 2.51567 9.83649 2.54711 9.76062C2.57855 9.68474 2.62466 9.61581 2.68274 9.55782L8.30774 3.93282C8.42506 3.8155 8.58412 3.74963 8.74997 3.74963C8.91581 3.74963 9.07487 3.8155 9.19219 3.93282C9.30951 4.05014 9.37539 4.2092 9.37539 4.37504C9.37539 4.54089 9.30951 4.69994 9.19219 4.81727L4.63359 9.375H16.875C17.0408 9.375 17.1997 9.44085 17.317 9.55807C17.4342 9.6753 17.5 9.83424 17.5 10Z" fill="white"/>
                            </svg>
                            Zpět na kurz
                        </Link>
                        <h1>Feed kurzu</h1>
                    </div>
                    <div className={styles.feed_page_messages}>
                        {isLoadingFeed ? (
                            <p>Načítání feedu...</p>
                        ) : feed.length > 0 ? (
                            feed.map((feedItem) => (
                                <FeedCard
                                    key={feedItem.uuid}
                                    feed={feedItem}
                                    admin={true}
                                    courseId={uuid}
                                />
                            ))
                        ) : (
                            <p>Zatím nejsou žádné příspěvky</p>
                        )}
                        <div ref={feedEndRef} />
                    </div>
                    <div className={styles.feed_page_footer}>
                        <FeedForm courseId={uuid} />
                    </div>
                </section>
            )}
        </div>
    );
}