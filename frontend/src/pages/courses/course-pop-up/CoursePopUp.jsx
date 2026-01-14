import FeedButton from '../../../shared/button/feed/FeedButton';
import MaterialCard from '../../../shared/courses/material-card/MaterialCard';
import QuizCard from '../../../shared/courses/quiz-card/QuizCard';
import LectorCard from '../../../shared/lectors/lector-card/LectorCard';
import styles from './course-pop-up.module.scss';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getQuizzes } from '../../../services/QuizzService';
import { getMaterials } from '../../../services/MaterialService';

export default function CoursePopUp({ course }) {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!course?.uuid) return;

        const loadData = async () => {
            try {
                const [quizzesData, materialsData] = await Promise.all([
                    getQuizzes(course.uuid),
                    getMaterials(course.uuid)
                ]);
                setQuizzes(quizzesData);
                setMaterials(materialsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [course.uuid]);

    return (
        <div className={styles.pop_up_wrapper} onClick={() => navigate('/courses', { replace: true })}>
            <div className={styles.course_pop_up} onClick={(e) => e.stopPropagation()}>
                <h2>{course.name}</h2>
                <div className={styles.course_pop_up_about}>
                    <LectorCard lectorName={course.lectorName} lectorMail={course.lectorMail} />
                    <FeedButton course={course} />
                </div>
                <p className={styles.course_pop_up_text}>{course.description}</p>
                <div className={styles.course_pop_up_content}>
                    <h3>Přílohy</h3>
                    <div className={styles.course_pop_up_content_list}>
                        {loading ? (
                            <p>Načítání...</p>
                        ) : materials.length > 0 ? (
                            materials.map((material) => (
                                <MaterialCard 
                                    key={material.uuid}
                                    material={material}
                                    file={material.type === 'file'}
                                />
                            ))
                        ) : (
                            <p>Žádné přílohy</p>
                        )}
                    </div>
                </div>
                <div className={styles.course_pop_up_content}>
                    <h3>Kvízy</h3>
                    {loading ? (
                        <p>Načítání...</p>
                    ) : quizzes.length > 0 ? (
                        quizzes.map((quiz) => (
                            <QuizCard quiz={quiz} key={quiz.uuid}/>
                        ))
                    ) : (
                        <p>Žádné kvízy</p>
                    )}
                </div>
            </div>
        </div>
    )
}