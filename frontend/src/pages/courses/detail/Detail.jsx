import styles from './detail.module.scss';
import Header from '../../../shared/layout/header/Header';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseByUuid, enrollCourse, unenrollCourse, isEnrolled } from '../../../services/CourseService'
import { useRef, useCallback } from 'react';
import { getCourseFeed } from '../../../services/FeedService'
import ModuleCard from '../../../shared/courses/module-card/ModuleCard';
import Api from '../../../services/Api';
import NotFound from '../../not-found/NotFound';
import Footer from '../../../shared/layout/footer/Footer';
import { QRCodeSVG } from 'qrcode.react';

const STATUS_LABELS = {
    Draft: 'Koncept',
    Scheduled: 'Plánovaný',
    Live: 'Aktivní',
    Paused: 'Pozastavený',
    Archived: 'Archivovaný',
};

export default function Detail({ user, setUser }) {
    const { uuid } = useParams();
    const feedListRef = useRef(null);

    const [course, setCourse] = useState();
    const [feeds, setFeeds] = useState([]);
    const [notFound, setNotFound] = useState(false);
    usePageTitle(course?.name);

    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const courseUrl = `${window.location.origin}/courses/${uuid}`;

    const isStudent = user && user.role === 'STUDENT';

    useEffect(() => {
        if (!uuid) return;

        const loadData = async () => {
            try {
                const courseData = await getCourseByUuid(uuid);
                setCourse(courseData);
            } catch (err) {
                console.error('Chyba při načítání dat:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        loadData();

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

        const eventSource = new EventSource(`${Api}/courses/${course.uuid}/stream`);

        eventSource.addEventListener('MODULE_ACTIVATED', () => {
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

        eventSource.onerror = () => {};

        return () => {
            eventSource.close();
        };
    }, [course, loadFeeds]);

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
    }, [course]);

    if (!course) return null;
    if (notFound) return <NotFound />;

    const activatedModules = course.modules?.filter(m => m.activated) ?? [];

    return (
        <div className={styles.wrapper}>
            <Header user={user} setUser={setUser} />

            <section className={styles.detail}>

                {/* Back link */}
                <Link to="/courses" className={`${styles.back_link} ${styles.reveal}`} style={{ '--delay': '0s' }}>
                    <svg width="1rem" viewBox="0 0 20 20" fill="none">
                        <path d="M17.5 10C17.5 10.1658 17.4342 10.3247 17.317 10.4419C17.1997 10.5592 17.0408 10.625 16.875 10.625H4.63359L9.19219 15.1828C9.30951 15.3001 9.37539 15.4592 9.37539 15.625C9.37539 15.7908 9.30951 15.9499 9.19219 16.0672C9.07487 16.1845 8.91581 16.2504 8.74997 16.2504C8.58412 16.2504 8.42506 16.1845 8.30774 16.0672L2.68274 10.4422C2.62466 10.3842 2.57855 10.3153 2.54711 10.2394C2.51567 10.1635 2.49951 10.0822 2.49951 10C2.49951 9.9178 2.51567 9.83649 2.54711 9.76062C2.57855 9.68474 2.62466 9.61581 2.68274 9.55782L8.30774 3.93282C8.42506 3.8155 8.58412 3.74963 8.74997 3.74963C8.91581 3.74963 9.07487 3.8155 9.19219 3.93282C9.30951 4.05014 9.37539 4.2092 9.37539 4.37504C9.37539 4.54089 9.30951 4.69994 9.19219 4.81727L4.63359 9.375H16.875C17.0408 9.375 17.1997 9.44085 17.317 9.55807C17.4342 9.6753 17.5 9.83424 17.5 10Z" fill="white"/>
                    </svg>
                    Zpět na kurzy
                </Link>

                {/* Hero */}
                <div className={`${styles.detail_hero} ${styles.reveal}`} style={{ '--delay': '0.1s' }}>
                    <div className={styles.hero_meta}>
                        <span className={styles.hero_eyebrow}>KURZ</span>
                        {course.status && (
                            <span
                                className={styles.status_badge}
                                data-status={course.status}
                            >
                                {STATUS_LABELS[course.status] ?? course.status}
                            </span>
                        )}
                    </div>

                    <h1 className={styles.course_title}>{course.name}</h1>

                    <div className={styles.hero_rule} />

                    <div className={styles.hero_bottom_row}>
                        <div className={styles.lector_row}>
                            <div className={styles.lector_avatar}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <span className={styles.lector_label}>Lektor</span>
                            <span className={styles.lector_name}>{course.lectorName || 'lecturer'}</span>
                        </div>
                        <div className={styles.hero_actions}>
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
                            <button className={styles.share_button} onClick={() => setShareOpen(true)} title="Sdílet kurz">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                                Sdílet
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className={styles.body}>

                    {/* Left column */}
                    <div className={`${styles.left_col} ${styles.reveal}`} style={{ '--delay': '0.2s' }}>
                        <p className={styles.description}>{course.description}</p>

                        <div className={styles.modules_section}>
                            <span className={styles.modules_label}>Moduly</span>
                            <div className={styles.modules_list}>
                                {activatedModules.length === 0 ? (
                                    <p className={styles.no_modules}>Žádné aktivované moduly</p>
                                ) : (
                                    activatedModules.map(m => (
                                        <ModuleCard module={m} key={m.uuid} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right column — feed */}
                    <div className={`${styles.right_col} ${styles.reveal}`} style={{ '--delay': '0.3s' }}>
                        <span className={styles.feed_label}>Feed kurzu</span>
                        <FeedList posts={feeds} feedListRef={feedListRef} />
                    </div>

                </div>
            </section>

            <Footer user={user} setUser={setUser} />
            <div className={styles.detail_ball} />

            {shareOpen && (
                <div className={styles.share_overlay} onClick={() => setShareOpen(false)}>
                    <div className={styles.share_modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.share_close} onClick={() => setShareOpen(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                        <span className={styles.share_title}>Sdílet kurz</span>
                        <p className={styles.share_subtitle}>Naskenuj QR kód nebo zkopíruj odkaz</p>
                        <div className={styles.qr_wrapper}>
                            <QRCodeSVG
                                value={courseUrl}
                                size={200}
                                bgColor="transparent"
                                fgColor="#ffffff"
                                level="M"
                            />
                        </div>
                        <div className={styles.share_url_row}>
                            <span className={styles.share_url}>{courseUrl}</span>
                            <button
                                className={styles.copy_button}
                                onClick={() => {
                                    navigator.clipboard.writeText(courseUrl);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                            >
                                {copied
                                    ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                }
                                {copied ? 'Zkopírováno' : 'Kopírovat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FeedList({ posts, feedListRef }) {
    useEffect(() => {
        if (!feedListRef.current) return;
        feedListRef.current.scrollTop = feedListRef.current.scrollHeight;
    }, [posts]);

    if (posts.length === 0) {
        return <p className={styles.no_feed}>Žádné dostupné příspěvky</p>;
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

    const isSystem = feed.type === 'SYSTEM' || feed.type === 'system';

    return (
        <div className={`${styles.feed_card} ${isSystem ? styles.system_card : ''} ${feed.edited ? styles.edited_card : ''}`}>
            <div className={styles.feed_card_header}>
                <div className={styles.feed_author}>
                    {isSystem ? (
                        <>
                            <img src="/img/symbol-w.png" alt="" />
                            <p>Systém</p>
                        </>
                    ) : (
                        <>
                            <div className={styles.author_avatar}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <p>{feed.authorName || 'Lektor'}</p>
                        </>
                    )}
                </div>
                <span className={styles.feed_time}>{formatDate(feed.createdAt)}</span>
            </div>
            <p className={styles.feed_card_content}>{feed.message}</p>
        </div>
    );
}
