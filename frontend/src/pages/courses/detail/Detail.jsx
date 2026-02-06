import styles from './detail.module.scss';
import Header from '../../../shared/layout/header/Header';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LectorCard from '../../../shared/lectors/lector-card/LectorCard';
import SearchInput from '../../../shared/form/search-input/SearchInput'
import MaterialCard from '../../../shared/courses/material-card/MaterialCard';
import QuizCard from '../../../shared/courses/quiz-card/QuizCard';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseByUuid } from '../../../services/CourseService'
import { getQuizzes } from '../../../services/QuizzService';
import { getMaterials } from '../../../services/MaterialService'
import { useRef, useCallback } from 'react';
import { getCourseFeed } from '../../../services/FeedService'

export default function Detail({ user, setUser }) {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const pollingIntervalRef = useRef(null);
    const feedListRef = useRef(null);

    const [course, setCourse] = useState();
    const [materials, setMaterials] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [feeds, setFeeds] = useState([]);
    const [loadFeed, setLoadFeed] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!uuid) return;

        const loadData = async () => {
            try {
                const courseData = await getCourseByUuid(uuid);
                setCourse(courseData);

                const quizzesData = await getQuizzes(uuid);
                setQuizzes(quizzesData);

                const materialData = await getMaterials(uuid);
                setMaterials(materialData);
            } catch (err) {
                console.error('Chyba při načítání dat:', err);
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [uuid]);

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
        if (!course || !loadFeed) return;

        loadFeeds(course.uuid);

        pollingIntervalRef.current = setInterval(() => {
            loadFeeds(course.uuid);
        }, 3000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [course, loadFeed, loadFeeds]);

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
                        <div className={styles.detail_content_about_list}>
                            <h3>Přílohy</h3>
                            <SearchInput text={'Hledejte přílohu'} data={materials} setData={setMaterials} />
                            <MaterialList materials={materials} />
                        </div>
                        <div className={styles.detail_content_about_list}>
                            <h3>Kvízy</h3>
                            <QuizList quizzes={quizzes} />
                        </div>
                    </div>
                    <div className={styles.detail_content_feed}>
                        <h3>Feed kurzu</h3>
                        {loadFeed ? (
                            <FeedList posts={feeds} feedListRef={feedListRef} />
                        ) : (
                            <button
                                onClick={() => setLoadFeed(true)}
                                className={styles.detail_content_feed_button}
                            >
                                Načíst feed
                            </button>
                        )}
                    </div>
                </article>
            </section>

            <div className={styles.detail_ball}></div>
        </div>
    )
}

function MaterialList({ materials }) {
    const [showMore, setShowMore] = useState(false);

    const visibleMaterials = showMore
        ? materials
        : materials.slice(0, 6);

    if (materials.length === 0) {
        return (
            <p className={styles.no}>Žádné dostupné přílohy</p>
        )
    }

    return (
        <>
            <div className={styles.material_list}>
                {visibleMaterials.map((m) => (
                    <MaterialCard key={m.uuid} material={m} file={m.type === 'file' ? true : false} />
                ))}
            </div>

            {materials.length > 2 && (
                <ShowMoreButton
                    showMore={showMore}
                    setShowMore={setShowMore}
                />
            )}
        </>
    )
}

function QuizList({ quizzes }) {
    const [showMore, setShowMore] = useState(false);

    const visibleQuizzes = showMore
        ? quizzes
        : quizzes.slice(0, 2);

    if (quizzes.length === 0) {
        return (
            <p className={styles.no}>Žádné dostupné kvízy</p>
        )
    }

    return (
        <>
            <div className={styles.quiz_list}>
                {visibleQuizzes.map((q) => (
                    <QuizCard key={q.uuid} quiz={q} />
                ))}
            </div>

            {quizzes.length > 2 && (
                <ShowMoreButton
                    showMore={showMore}
                    setShowMore={setShowMore}
                />
            )}
        </>
    );
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
                            <img src="" alt="" />
                            <p>Lektor</p>
                        </>
                    )}
                </div>
                <p>{formatDate(feed.createdAt)}</p>
            </div>
            <p className={styles.feed_card_content}>{feed.message}</p>
        </div>
    )
}

function ShowMoreButton({ showMore, setShowMore }) {
    return (
        <button onClick={() => setShowMore(!showMore)} className={`${styles.show_more_button} ${showMore ? styles.true : ''}`}>
            <p>{showMore ? 'Sbalit' : 'Rozbalit'}</p>
            <svg width="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.0306 9.53055L12.5306 17.0306C12.4609 17.1003 12.3782 17.1556 12.2871 17.1933C12.1961 17.2311 12.0985 17.2505 11.9999 17.2505C11.9014 17.2505 11.8038 17.2311 11.7127 17.1933C11.6217 17.1556 11.539 17.1003 11.4693 17.0306L3.9693 9.53055C3.82857 9.38982 3.74951 9.19895 3.74951 8.99993C3.74951 8.80091 3.82857 8.61003 3.9693 8.4693C4.11003 8.32857 4.30091 8.24951 4.49993 8.24951C4.69895 8.24951 4.88982 8.32857 5.03055 8.4693L11.9999 15.4396L18.9693 8.4693C19.039 8.39962 19.1217 8.34435 19.2128 8.30663C19.3038 8.26892 19.4014 8.24951 19.4999 8.24951C19.5985 8.24951 19.6961 8.26892 19.7871 8.30663C19.8781 8.34435 19.9609 8.39962 20.0306 8.4693C20.1002 8.53899 20.1555 8.62171 20.1932 8.71276C20.2309 8.8038 20.2503 8.90138 20.2503 8.99993C20.2503 9.09847 20.2309 9.19606 20.1932 9.2871C20.1555 9.37815 20.1002 9.46087 20.0306 9.53055Z" fill="#838383" />
            </svg>
        </button>
    )
}