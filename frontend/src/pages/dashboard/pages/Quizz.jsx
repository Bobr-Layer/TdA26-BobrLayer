import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import QuizzDetail from '../quizzes/quizz-detail/QuizzDetail';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../dashboard.module.scss';
import { deleteQuiz, getQuizByUuid, getQuizAttempts } from '../../../services/QuizzService';
import { useState, useEffect } from 'react';
import { getModules } from '../../../services/ModuleService';
import { getCourseByUuid } from '../../../services/CourseService';
import Header from '../../../shared/layout/header/Header';
import { usePageTitle } from '../../../hooks/usePageTitle';

export default function Quizz({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid, moduleUuid, quizzUuid } = useParams();
    const [quiz, setQuiz] = useState();
    usePageTitle(quiz?.title);
    const [loading, setLoading] = useState(false);
    const [modules, setModules] = useState();
    const [course, setCourse] = useState();
    const [attempts, setAttempts] = useState([]);
    const [search, setSearch] = useState('');
    const [pendingReview, setPendingReview] = useState(null);

    const loadAttempts = async (s, p) => {
        try {
            const data = await getQuizAttempts(uuid, moduleUuid, quizzUuid, {
                search: s || undefined,
                pendingReview: p ?? undefined,
            });
            setAttempts(data);
        } catch {
            setAttempts([]);
        }
    };

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                const data = await getQuizByUuid(uuid, moduleUuid, quizzUuid);
                setQuiz(data);

                loadAttempts('', null);

                const modulesData = await getModules(uuid);
                setModules(modulesData);

                const courseData = await getCourseByUuid(uuid);
                setCourse(courseData);
            } catch (err) {
                console.error(err);
                navigate('/dashboard/' + uuid + '/modules/' + moduleUuid)
            } finally {
                setLoading(false);
            }
        };

        loadQuiz();
    }, [uuid, quizzUuid, navigate]);

    const handleDelete = async () => {
        if (!quiz) return;

        try {
            await deleteQuiz(uuid, moduleUuid, quizzUuid);
            navigate('/dashboard/' + uuid + '/modules/' + moduleUuid, { replace: true });
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div>
            <Header user={user} setUser={setUser} onlyMobile={true}/>
            <Sidenav user={user} setUser={setUser} showMore={true} current={`courseModule_${moduleUuid}`} modules={modules}/>
            <section className={styles.dashboard}>
                <DashboardNav
                    link={'/dashboard/' + uuid + '/modules/' + moduleUuid}
                    textLink={'Vrátit se zpět do modulu'}
                    buttonText={'Upravit kvíz'}
                    buttonLink={'edit'}
                    buttonIcon={
                        <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.862 8.02482L19.9752 3.13685C19.8127 2.97431 19.6197 2.84537 19.4074 2.75739C19.195 2.66942 18.9674 2.62415 18.7376 2.62415C18.5077 2.62415 18.2801 2.66942 18.0678 2.75739C17.8555 2.84537 17.6625 2.97431 17.5 3.13685L4.01298 16.625C3.84977 16.7869 3.72037 16.9796 3.63231 17.192C3.54425 17.4044 3.49927 17.6321 3.50001 17.862V22.75C3.50001 23.2141 3.68438 23.6592 4.01257 23.9874C4.34076 24.3156 4.78588 24.5 5.25001 24.5H10.138C10.3679 24.5007 10.5956 24.4557 10.808 24.3677C11.0204 24.2796 11.2131 24.1502 11.375 23.987L24.862 10.5C25.0246 10.3375 25.1535 10.1445 25.2415 9.93219C25.3295 9.71984 25.3747 9.49224 25.3747 9.2624C25.3747 9.03255 25.3295 8.80495 25.2415 8.59261C25.1535 8.38026 25.0246 8.18733 24.862 8.02482ZM10.138 22.75H5.25001V17.862L14.875 8.23701L19.763 13.125L10.138 22.75ZM21 11.8869L16.112 6.99998L18.737 4.37497L23.625 9.26185L21 11.8869Z" fill="#1A1A1A" />
                        </svg>
                    }
                    showButton={course?.status === 'Draft'}
                />
                {quiz && (
                    <QuizzDetail
                        quiz={quiz}
                        attempts={attempts}
                        search={search}
                        setSearch={(v) => { setSearch(v); loadAttempts(v, pendingReview); }}
                        pendingReview={pendingReview}
                        setPendingReview={(v) => { setPendingReview(v); loadAttempts(search, v); }}
                        onAttemptUpdated={() => loadAttempts(search, pendingReview)}
                        courseUuid={uuid}
                        moduleUuid={moduleUuid}
                        quizUuid={quizzUuid}
                    />
                )}
            </section>
        </div>
    )
}
