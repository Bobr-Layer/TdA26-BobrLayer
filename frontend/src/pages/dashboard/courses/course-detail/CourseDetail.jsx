import QuizDashboardCard from '../../../../shared/courses/quiz-dashboard-card/QuizDashboardCard';
import styles from './course-detail.module.scss';
import FeedButton from '../../../../shared/button/feed/FeedButton';
import NewButton from '../../../../shared/button/new/NewButton';
import MaterialDashboardCard from '../../../../shared/courses/material-dashboard-card/MaterialDashboardCard';
import { useEffect, useState } from 'react';
import { getQuizzes } from '../../../../services/QuizzService';
import { getUrlMaterials, getFileMaterials, deleteMaterial } from '../../../../services/MaterialService';

export default function CourseDetail({ course }) {
    const [quizzes, setQuizzes] = useState([]);
    const [urlMaterials, setUrlMaterials] = useState([]);
    const [fileMaterials, setFileMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleQuizDeleted = (deletedUuid) => {
        setQuizzes((prev) =>
            prev.filter((quiz) => quiz.uuid !== deletedUuid)
        );
    };

    const handleMaterialDeleted = async (materialUuid, isFile) => {
        try {
            await deleteMaterial(course.uuid, materialUuid);

            if (isFile) {
                setFileMaterials((prev) => prev.filter((m) => m.uuid !== materialUuid));
            } else {
                setUrlMaterials((prev) => prev.filter((m) => m.uuid !== materialUuid));
            }
        } catch (err) {
            console.error('Chyba při mazání materiálu:', err);
            alert('Nepodařilo se smazat materiál. Zkuste to prosím znovu.');
        }
    };

    useEffect(() => {
        if (!course?.uuid) return;

        const loadData = async () => {
            try {
                const quizzesData = await getQuizzes(course.uuid);
                setQuizzes(quizzesData);

                const urlsData = await getUrlMaterials(course.uuid);
                setUrlMaterials(urlsData);

                const filesData = await getFileMaterials(course.uuid);
                setFileMaterials(filesData);
            } catch (err) {
                console.error('Chyba při načítání dat:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [course.uuid]);

    return (
        <article className={styles.course_detail}>
            <div className={styles.course_detail_about}>
                <div className={styles.course_detail_about_header}>
                    <h2>{course.name}</h2>
                    <p>{course.description}</p>
                </div>
                <div className={styles.course_detail_content}>
                    <h3>Kvízy</h3>
                    <div className={styles.course_detail_content_quiz}>
                        {loading ? (
                            <p>Načítání...</p>
                        ) : (
                            quizzes.map((quiz) => (
                                <QuizDashboardCard
                                    key={quiz.uuid}
                                    quiz={{
                                        name: quiz.title,
                                        description: `${quiz.questions.length} otázek`,
                                    }}
                                    uuid={course.uuid}
                                    quizUuid={quiz.uuid}
                                    onDelete={handleQuizDeleted}
                                />
                            ))
                        )
                        }
                        <NewButton link={'/dashboard/' + course.uuid + '/quizzes/new'} bigger={true} />
                    </div>
                </div>
            </div>
            <div className={styles.course_detail_materials}>
                <FeedButton longer={true} />

                <div className={styles.course_detail_content}>
                    <div className={styles.course_detail_content_header}>
                        <h3>Soubory</h3>
                        <p>{fileMaterials.length} {fileMaterials.length === 1 ? 'soubor' : fileMaterials.length < 5 ? 'soubory' : 'souborů'}</p>
                    </div>
                    <div className={styles.course_detail_content_material}>
                        {loading ? (
                            <p>Načítání...</p>
                        ) : fileMaterials.length > 0 ? (
                            fileMaterials.map((material) => (
                                <MaterialDashboardCard
                                    key={material.uuid}
                                    file={true}
                                    material={material}
                                    onDelete={() => handleMaterialDeleted(material.uuid, true)}
                                />
                            ))
                        ) : (
                            <p>Žádné soubory</p>
                        )}
                    </div>
                </div>

                <div className={styles.course_detail_content}>
                    <div className={styles.course_detail_content_header}>
                        <h3>Odkazy</h3>
                        <p>{urlMaterials.length} {urlMaterials.length === 1 ? 'odkaz' : urlMaterials.length < 5 ? 'odkazy' : 'odkazů'}</p>
                    </div>
                    <div className={styles.course_detail_content_material}>
                        {loading ? (
                            <p>Načítání...</p>
                        ) : urlMaterials.length > 0 ? (
                            urlMaterials.map((material) => (
                                <MaterialDashboardCard
                                    key={material.uuid}
                                    file={false}
                                    material={material}
                                    onDelete={() => handleMaterialDeleted(material.uuid, false)}
                                />
                            ))
                        ) : (
                            <p>Žádné odkazy</p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    )
}