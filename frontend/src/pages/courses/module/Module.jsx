import Header from '../../../shared/layout/header/Header';
import styles from './module.module.scss';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getModuleByUuid } from '../../../services/ModuleService';
import QuizCard from '../../../shared/courses/quiz-card/QuizCard';
import MaterialCard from '../../../shared/courses/material-card/MaterialCard';
import { getMaterials } from '../../../services/MaterialService';
import { getCourseFeed } from '../../../services/FeedService';
import Api from '../../../services/Api';
import { usePageTitle } from '../../../hooks/usePageTitle';
import Footer from '../../../shared/layout/footer/Footer';

export default function Module({ user, setUser }) {
    const { uuid, moduleUuid } = useParams();
    const [module, setModule] = useState();
    const [files, setFiles] = useState([]);
    const [urls, setUrls] = useState([]);
    usePageTitle(module?.name);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feeds, setFeeds] = useState([]);
    const feedListRef = useRef(null);

    const loadFeeds = useCallback(async () => {
        try {
            const feedData = await getCourseFeed(uuid);
            const sorted = [...feedData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setFeeds(sorted);
        } catch (err) {
            console.error('Chyba při načítání feedu:', err);
        }
    }, [uuid]);

    useEffect(() => {
        const fetchModule = async () => {
            try {
                const data = await getModuleByUuid(uuid, moduleUuid);
                setModule(data);

                const materialData = await getMaterials(uuid, moduleUuid);
                setFiles(materialData.filter(m => m.type === 'file'));
                setUrls(materialData.filter(m => m.type === 'url'));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchModule();
        loadFeeds();
    }, [uuid, moduleUuid, loadFeeds]);

    useEffect(() => {
        const eventSource = new EventSource(`${Api}/courses/${uuid}/stream`);

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

        return () => eventSource.close();
    }, [uuid]);

    useEffect(() => {
        if (loading) return;
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
    }, [loading]);

    if (loading) return null;
    if (error) return <div>Chyba: {error}</div>;

    return (
        <div className={styles.wrapper}>
            <Header user={user} setUser={setUser} />

            <section className={styles.module}>

                {/* Back link */}
                <Link to={'/courses/' + uuid} className={`${styles.back_link} ${styles.reveal}`} style={{ '--delay': '0s' }}>
                    <svg width="1rem" viewBox="0 0 20 20" fill="none">
                        <path d="M17.5 10C17.5 10.1658 17.4342 10.3247 17.317 10.4419C17.1997 10.5592 17.0408 10.625 16.875 10.625H4.63359L9.19219 15.1828C9.30951 15.3001 9.37539 15.4592 9.37539 15.625C9.37539 15.7908 9.30951 15.9499 9.19219 16.0672C9.07487 16.1845 8.91581 16.2504 8.74997 16.2504C8.58412 16.2504 8.42506 16.1845 8.30774 16.0672L2.68274 10.4422C2.62466 10.3842 2.57855 10.3153 2.54711 10.2394C2.51567 10.1635 2.49951 10.0822 2.49951 10C2.49951 9.9178 2.51567 9.83649 2.54711 9.76062C2.57855 9.68474 2.62466 9.61581 2.68274 9.55782L8.30774 3.93282C8.42506 3.8155 8.58412 3.74963 8.74997 3.74963C8.91581 3.74963 9.07487 3.8155 9.19219 3.93282C9.30951 4.05014 9.37539 4.2092 9.37539 4.37504C9.37539 4.54089 9.30951 4.69994 9.19219 4.81727L4.63359 9.375H16.875C17.0408 9.375 17.1997 9.44085 17.317 9.55807C17.4342 9.6753 17.5 9.83424 17.5 10Z" fill="white"/>
                    </svg>
                    Zpět na kurz
                </Link>

                {/* Hero */}
                <div className={`${styles.module_hero} ${styles.reveal}`} style={{ '--delay': '0.1s' }}>
                    <span className={styles.hero_eyebrow}>MODUL</span>
                    <h1 className={styles.module_title}>{module.name}</h1>
                    <div className={styles.hero_rule} />
                </div>

                {/* Body */}
                <div className={styles.body}>

                    {/* Left column */}
                    <div className={`${styles.left_col} ${styles.reveal}`} style={{ '--delay': '0.2s' }}>
                        {module.description && (
                            <p className={styles.description}>{module.description}</p>
                        )}

                        <div className={styles.section}>
                            <span className={styles.section_label}>Soubory</span>
                            <MaterialList materials={files} courseUuid={uuid} moduleUuid={moduleUuid} emptyText="Žádné dostupné soubory" />
                        </div>

                        <div className={styles.section}>
                            <span className={styles.section_label}>Odkazy</span>
                            <MaterialList materials={urls} courseUuid={uuid} moduleUuid={moduleUuid} emptyText="Žádné dostupné odkazy" />
                        </div>

                        <div className={styles.section}>
                            <span className={styles.section_label}>Kvízy</span>
                            <QuizList quizzes={module.quizzes} uuid={uuid} moduleUuid={moduleUuid} />
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
            <div className={styles.module_ball} />
        </div>
    );
}

function MaterialList({ materials, courseUuid, moduleUuid, emptyText }) {
    const [showMore, setShowMore] = useState(false);
    const visible = showMore ? materials : materials.slice(0, 5);

    if (materials.length === 0) {
        return <p className={styles.no}>{emptyText}</p>;
    }

    return (
        <>
            <div className={styles.material_list}>
                {visible.map(m => (
                    <MaterialCard key={m.uuid} material={m} file={m.type === 'file'} courseUuid={courseUuid} moduleUuid={moduleUuid} />
                ))}
            </div>
            {materials.length > 5 && (
                <ShowMoreButton showMore={showMore} setShowMore={setShowMore} />
            )}
        </>
    );
}

function QuizList({ quizzes, uuid, moduleUuid }) {
    const [showMore, setShowMore] = useState(false);
    const visible = showMore ? quizzes : quizzes.slice(0, 2);

    if (quizzes.length === 0) {
        return <p className={styles.no}>Žádné dostupné kvízy</p>;
    }

    return (
        <>
            <div className={styles.quiz_list}>
                {visible.map(q => (
                    <QuizCard key={q.uuid} quiz={q} uuid={uuid} moduleUuid={moduleUuid} />
                ))}
            </div>
            {quizzes.length > 2 && (
                <ShowMoreButton showMore={showMore} setShowMore={setShowMore} />
            )}
        </>
    );
}

function FeedList({ posts, feedListRef }) {
    useEffect(() => {
        if (!feedListRef.current) return;
        feedListRef.current.scrollTop = feedListRef.current.scrollHeight;
    }, [posts, feedListRef]);

    if (posts.length === 0) {
        return <p className={styles.no}>Žádné příspěvky</p>;
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
        <div className={`${styles.feed_card} ${isSystem ? styles.system_card : ''}`}>
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

function ShowMoreButton({ showMore, setShowMore }) {
    return (
        <button
            onClick={() => setShowMore(!showMore)}
            className={`${styles.show_more_button} ${showMore ? styles.expanded : ''}`}
        >
            {showMore ? 'Sbalit' : 'Zobrazit více'}
            <svg width="1rem" viewBox="0 0 24 24" fill="none">
                <path d="M20.0306 9.53055L12.5306 17.0306C12.461 17.1003 12.3782 17.1556 12.2872 17.1933C12.1961 17.2311 12.0985 17.2505 12 17.2505C11.9015 17.2505 11.8038 17.2311 11.7128 17.1933C11.6218 17.1556 11.539 17.1003 11.4694 17.0306L3.96936 9.53055C3.82863 9.38982 3.74957 9.19895 3.74957 8.99993C3.74957 8.80091 3.82863 8.61003 3.96936 8.4693C4.11009 8.32857 4.30097 8.24951 4.49999 8.24951C4.69901 8.24951 4.88988 8.32857 5.03061 8.4693L12 15.4396L18.9694 8.4693C19.039 8.39962 19.1218 8.34435 19.2128 8.30663C19.3038 8.26892 19.4015 8.24951 19.5 8.24951C19.5985 8.24951 19.6962 8.26892 19.7872 8.30663C19.8782 8.34435 19.961 8.39962 20.0306 8.4693C20.1003 8.53899 20.1555 8.62171 20.1932 8.71276C20.231 8.8038 20.2504 8.90138 20.2504 8.99993C20.2504 9.09847 20.231 9.19606 20.1932 9.2871C20.1555 9.37815 20.1003 9.46087 20.0306 9.53055Z" fill="rgba(255,255,255,0.5)"/>
            </svg>
        </button>
    );
}
