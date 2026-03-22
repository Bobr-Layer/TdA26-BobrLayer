import styles from './detail.module.scss';
import Header from '../../../shared/layout/header/Header';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LectorCard from '../../../shared/lectors/lector-card/LectorCard';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseByUuid, enrollCourse, unenrollCourse, isEnrolled } from '../../../services/CourseService'
import { useRef, useCallback } from 'react';
import { getCourseFeed } from '../../../services/FeedService'
import ModuleCard from '../../../shared/courses/module-card/ModuleCard';
import Api from '../../../services/Api';
import { User } from 'lucide-react';

export default function Detail({ user, setUser }) {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const feedListRef = useRef(null);

    const [course, setCourse] = useState();
    const [feeds, setFeeds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);

    const isStudent = user && user.role === 'STUDENT';

    useEffect(() => {
        if (!uuid) return;

        const loadData = async () => {
            try {
                const courseData = await getCourseByUuid(uuid);
                setCourse(courseData);
            } catch (err) {
                console.error('Chyba při načítání dat:', err);
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // Check enrollment status for students
        if (isStudent) {
            isEnrolled(uuid).then(setEnrolled).catch(console.error);
        }
    }, [uuid, isStudent]);

    const loadFeeds = useCallback(async (courseUuid) => {
        try {
            const courseFeeds = await getCourseFeed(courseUuid);
            setFeeds(prevFeeds => {
                const newFeedIds = new Set(courseFeeds.map(f => f.uuid));
                const currentFeedIds = new Set(prevFeeds.map(f => f.uuid));

                if (
                    newFeedIds.size === currentFeedIds.size &&
                    courseFeeds.every(f => currentFeedIds.has(f.uuid))
                ) {
                    return prevFeeds;
                }

                return courseFeeds;
            });
        } catch (error) {
            console.error('Error loading feeds:', error);
        }
    }, []);

    useEffect(() => {
        if (!course) return;

        loadFeeds(course.uuid);

        // SSE: listen for module activation/deactivation and feed events
        const eventSource = new EventSource(`${Api}/courses/${course.uuid}/stream`);

        eventSource.addEventListener('MODULE_ACTIVATED', () => {
            // Refetch course to update visible modules
            getCourseByUuid(uuid).then(setCourse).catch(console.error);
        });

        eventSource.addEventListener('MODULE_DEACTIVATED', () => {
            getCourseByUuid(uuid).then(setCourse).catch(console.error);
        });

        eventSource.addEventListener('FEED_CREATED', (event) => {
            try {
                const data = JSON.parse(event.data);
                const payload = data.payload;
                if (!payload || !payload.uuid) return;
                setFeeds(prev => {
                    if (prev.some(f => f.uuid === payload.uuid)) return prev;
                    return [...prev, payload];
                });
            } catch (err) {
                console.error('Error parsing SSE feed:', err);
            }
        });

        eventSource.onerror = () => {
            // SSE will auto-reconnect
        };

        return () => {
            eventSource.close();
        };
    }, [course, loadFeeds]);

    if (!course) {
        return null;
    }

    return (
        <div className={styles.wrapper}>
            <Header user={user} setUser={setUser} />
            <section className={styles.detail}>
                <article className={styles.detail_header}>
                    <Link to={'/courses'}>
                        <svg width="2.5rem" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M35 20C35 20.3315 34.8683 20.6494 34.6339 20.8838C34.3995 21.1183 34.0815 21.25 33.75 21.25H9.26719L18.3844 30.3656C18.5005 30.4817 18.5926 30.6196 18.6555 30.7713C18.7184 30.9231 18.7507 31.0857 18.7507 31.25C18.7507 31.4142 18.7184 31.5768 18.6555 31.7286C18.5926 31.8803 18.5005 32.0182 18.3844 32.1343C18.2682 32.2505 18.1304 32.3426 17.9786 32.4055C17.8269 32.4683 17.6643 32.5007 17.5 32.5007C17.3358 32.5007 17.1731 32.4683 17.0214 32.4055C16.8696 32.3426 16.7318 32.2505 16.6156 32.1343L5.36563 20.8843C5.24941 20.7682 5.15721 20.6304 5.09431 20.4786C5.0314 20.3269 4.99902 20.1642 4.99902 20C4.99902 19.8357 5.0314 19.673 5.09431 19.5213C5.15721 19.3695 5.24941 19.2317 5.36563 19.1156L16.6156 7.86559C16.8502 7.63104 17.1683 7.49927 17.5 7.49927C17.8317 7.49927 18.1498 7.63104 18.3844 7.86559C18.6189 8.10014 18.7507 8.41826 18.7507 8.74996C18.7507 9.08167 18.6189 9.39979 18.3844 9.63434L9.26719 18.75H33.75C34.0815 18.75 34.3995 18.8817 34.6339 19.1161C34.8683 19.3505 35 19.6684 35 20Z" fill="white" />
                        </svg>
                    </Link>
                    <h1>{course.name}</h1>
                </article>
                <article className={styles.detail_content}>
                    <div className={styles.detail_content_about}>
                        <LectorCard lectorName={course.lectorName} lectorMail={course.lectorMail} />
                        <p className={styles.detail_content_about_p}>{course.description}</p>
                        {isStudent && (
                            <button
                                className={`${styles.enroll_button} ${enrolled ? styles.enrolled : ''}`}
                                onClick={async () => {
                                    setEnrollLoading(true);
                                    try {
                                        if (enrolled) {
                                            await unenrollCourse(uuid);
                                            setEnrolled(false);
                                        } else {
                                            await enrollCourse(uuid);
                                            setEnrolled(true);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert(err.message);
                                    } finally {
                                        setEnrollLoading(false);
                                    }
                                }}
                                disabled={enrollLoading}
                            >
                                {enrollLoading
                                    ? 'Zpracování...'
                                    : enrolled
                                        ? 'Odhlásit se z kurzu'
                                        : 'Přihlásit se na kurz'}
                            </button>
                        )}
                        <div className={styles.detail_content_about_list}>
                            <h3>Moduly</h3>
                            {course.modules?.filter(m => m.activated).map((m) => (
                                <ModuleCard module={m} key={m.uuid} />
                            ))}
                        </div>
                    </div>
                    <div className={styles.detail_content_feed}>
                        <h3>Feed kurzu</h3>
                        <FeedList posts={feeds} feedListRef={feedListRef} />
                    </div>
                </article>
            </section>

            <div className={styles.detail_ball}></div>
        </div>
    )
}

function FeedList({ posts, feedListRef }) {
    useEffect(() => {
        if (!feedListRef.current) return;

        feedListRef.current.scrollTop =
            feedListRef.current.scrollHeight;
    }, [posts]);

    if (posts.length === 0) {
        return <p className={styles.no}>Žádné dostupné příspěvky</p>;
    }

    return (
        <div ref={feedListRef} className={styles.feed_list}>
            {posts.map(p => (
                <FeedCard key={p.uuid} feed={p} />
            ))}
        </div>
    );
}

function FeedCard({ feed }) {
    function formatDate(dateString) {
        return new Date(dateString).toLocaleString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div className={styles.feed_card}>
            <div className={styles.feed_card_header}>
                <div>
                    {feed.type === 'system' ? (
                        <>
                            <img src="/img/symbol-w.png" alt="" />
                            <p>Systémová zpráva</p>
                        </>
                    ) : (
                        <>
                            <div className={styles.img_container} style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <User size={20} color="white" />
                            </div>
                            <p>lecturer</p>
                        </>
                    )}
                </div>
                <p>{formatDate(feed.createdAt)}</p>
            </div>
            <p className={styles.feed_card_content}>{feed.message}</p>
        </div>
    )
}