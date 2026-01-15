import Header from '../../../shared/layout/header/Header';
import LectorCard from '../../../shared/lectors/lector-card/LectorCard';
import styles from './feed.module.scss';
import BackToButton from '../../../shared/button/back-to/BackToButton';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseByUuid } from '../../../services/CourseService';
import FeedCard from '../../../shared/courses/feed-card/FeedCard';
import { getCourseFeed } from '../../../services/FeedService';

export default function Feed() {
    const [feeds, setFeeds] = useState([]);
    const [course, setCourse] = useState(null);
    const navigate = useNavigate();
    const { uuid } = useParams();
    const feedListRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    const loadFeeds = useCallback(async (courseUuid) => {
        try {
            const courseFeeds = await getCourseFeed(courseUuid);
            setFeeds(prevFeeds => {
                const newFeedIds = new Set(courseFeeds.map(f => f.uuid));
                const currentFeedIds = new Set(prevFeeds.map(f => f.uuid));
                
                if (newFeedIds.size === currentFeedIds.size && 
                    courseFeeds.every(f => currentFeedIds.has(f.uuid))) {
                    return prevFeeds;
                }
                
                return courseFeeds;
            });
        } catch (error) {
            console.error('Error loading feeds:', error);
        }
    }, []);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const foundCourse = await getCourseByUuid(uuid);
                setCourse(foundCourse);
                await loadFeeds(foundCourse.uuid);
            } catch (err) {
                console.error(err);
                navigate('/courses', { replace: true });
            }
        };

        loadCourse();
    }, [uuid, navigate, loadFeeds]);

    useEffect(() => {
        if (!course) return;

        const startPolling = () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            
            pollingIntervalRef.current = setInterval(() => {
                loadFeeds(course.uuid);
            }, 3000);
        };

        startPolling();

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [course, loadFeeds]);

    useEffect(() => {
        if (feeds.length && feedListRef.current) {
            feedListRef.current.scrollTop = feedListRef.current.scrollHeight;
        }
    }, [feeds]);

    return (
        <div>
            <Header />
            {course && (
                <section className={styles.feed}>
                    <article className={styles.feed_list} ref={feedListRef}>
                        <div className={styles.feed_list_header}>
                            <h1>Feed kurzu</h1>
                        </div>
                        <div className={styles.feed_list_content}>
                            {feeds.length === 0 && <p>Žádné příspěvky ve feedu</p>}
                            {feeds.map(feed => (
                                <FeedCard key={feed.uuid} feed={feed} />
                            ))}
                        </div>
                    </article>
                    <article className={styles.feed_course}>
                        <div className={styles.feed_course_content}>
                            <h2>{course.name}</h2>
                            <LectorCard
                                lectorMail={course.lectorMail}
                                lectorName={course.lectorName}
                            />
                            <p className={styles.feed_course_content_text}>
                                {course.description}
                            </p>
                        </div>
                        <BackToButton
                            text="Vrátit se na detail kurzu"
                            link={`/courses/${course.uuid}`}
                        />
                    </article>
                </section>
            )}
        </div>
    );
}