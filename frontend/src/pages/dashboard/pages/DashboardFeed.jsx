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
                <section className={styles.dashboard}>
                    <div className={styles.feed_header}>
                        <Link to={'/dashboard/' + uuid} className={styles.feed_header_back}>
                            <svg width="2.5rem" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M35 20C35 20.3315 34.8683 20.6494 34.6339 20.8838C34.3995 21.1183 34.0815 21.25 33.75 21.25H9.26719L18.3844 30.3656C18.5005 30.4817 18.5926 30.6196 18.6555 30.7713C18.7184 30.9231 18.7507 31.0857 18.7507 31.25C18.7507 31.4142 18.7184 31.5768 18.6555 31.7286C18.5926 31.8803 18.5005 32.0182 18.3844 32.1343C18.2682 32.2505 18.1304 32.3426 17.9786 32.4055C17.8269 32.4683 17.6643 32.5007 17.5 32.5007C17.3358 32.5007 17.1731 32.4683 17.0214 32.4055C16.8696 32.3426 16.7318 32.2505 16.6156 32.1343L5.36563 20.8843C5.24941 20.7682 5.15721 20.6304 5.09431 20.4786C5.0314 20.3269 4.99902 20.1642 4.99902 20C4.99902 19.8357 5.0314 19.673 5.09431 19.5213C5.15721 19.3695 5.24941 19.2317 5.36563 19.1156L16.6156 7.86559C16.8502 7.63104 17.1683 7.49927 17.5 7.49927C17.8317 7.49927 18.1498 7.63104 18.3844 7.86559C18.6189 8.10014 18.7507 8.41826 18.7507 8.74996C18.7507 9.08167 18.6189 9.39979 18.3844 9.63434L9.26719 18.75H33.75C34.0815 18.75 34.3995 18.8817 34.6339 19.1161C34.8683 19.3505 35 19.6684 35 20Z" fill="white" />
                            </svg>
                            Vrátit se zpět na kurz
                        </Link>
                        <h1>Feed kurzu</h1>
                    </div>
                    <article className={styles.feed_list}>
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
                        <FeedForm courseId={uuid} />
                        <div ref={feedEndRef} />
                    </article>
                </section>
            )}
        </div>
    );
}