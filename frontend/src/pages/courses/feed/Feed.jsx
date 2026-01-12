import Header from '../../../shared/layout/header/Header';
import LectorCard from '../../../shared/lectors/lector-card/LectorCard';
import styles from './feed.module.scss';
import BackToButton from '../../../shared/button/back-to/BackToButton';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseByUuid } from '../../../services/CourseService';
import FeedCard from '../../../shared/courses/feed-card/FeedCard';

export default function Feed() {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [course, setCourse] = useState(null);
    const feedListRef = useRef(null);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const foundCourse = await getCourseByUuid(uuid);
                setCourse(foundCourse);
            } catch (err) {
                console.error(err);
                navigate('/courses', { replace: true });
            }
        };

        loadCourse();
    }, [uuid, navigate]);

    useEffect(() => {
        if (course && feedListRef.current) {
            feedListRef.current.scrollTop = feedListRef.current.scrollHeight;
        }
    }, [course]);

    return (
        <div>
            <Header />
            {course && (
                <section className={styles.feed}>
                    <article className={styles.feed_list} ref={feedListRef}>
                        <div className={styles.feed_list_header}>
                            <h1>Feed kurzu</h1>
                            <div></div>
                        </div>
                        <div className={styles.feed_list_content}>
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
                        </div>
                    </article>
                    <article className={styles.feed_course}>
                        <div className={styles.feed_course_content}>
                            <h2>{course.name}</h2>
                            <LectorCard lectorMail={course.lectorMail} lectorName={course.lectorName} />
                            <p className={styles.feed_course_content_text}>{course.description}</p>
                        </div>
                        <BackToButton text={'Vrátit se na detail kurzu'} link={'/courses/' + course.uuid} />
                    </article>
                </section>
            )}
        </div>
    )
}