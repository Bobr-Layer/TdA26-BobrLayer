import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import styles from '../dashboard.module.scss';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ModuleDetail from '../modules/module-detail/ModuleDetail';
import { getModuleByUuid } from '../../../services/ModuleService';
import { activateNextModule, deactivatePreviousModule, getCourseByUuid } from '../../../services/CourseService';
import Header from '../../../shared/layout/header/Header';
import NotFound from '../../not-found/NotFound';
import { usePageTitle } from '../../../hooks/usePageTitle';

export default function DashboardModule({ user, setUser }) {
    const { uuid, moduleUuid } = useParams();

    const [course, setCourse] = useState();
    const [module, setModule] = useState(null);
    usePageTitle(module?.name);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activating, setActivating] = useState(false);

    useEffect(() => {
        const fetchModule = async () => {
            try {
                const data = await getModuleByUuid(uuid, moduleUuid);
                setModule(data);

                const courseData = await getCourseByUuid(uuid);
                setCourse(courseData);

                console.log(data);
            } catch (err) {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchModule();
    }, [uuid, moduleUuid]);

    const handleActivateNext = async () => {
        try {
            setActivating(true);

            const currentIndex = course.modules.findIndex(m => m.uuid === moduleUuid);
            const nextModule = course.modules[currentIndex + 1];

            if (!nextModule) {
                setError('Žádný další modul neexistuje.');
                return;
            }

            await deactivatePreviousModule(uuid, moduleUuid);
            await activateNextModule(uuid, nextModule.uuid);

            const [moduleData, courseData] = await Promise.all([
                getModuleByUuid(uuid, moduleUuid),
                getCourseByUuid(uuid),
            ]);
            setModule(moduleData);
            setCourse(courseData);
        } catch (err) {
            setError(err.message);
        } finally {
            setActivating(false);
        }
    };

    if (notFound) return <NotFound />;

    if (loading) {
        return <div>Načítám modul...</div>;
    }

    if (error) {
        return <div>Chyba: {error}</div>;
    }

    const activatedModules = course?.modules?.filter(m => m.activated) ?? [];
    const isLastModule = activatedModules.length > 0 &&
        activatedModules[activatedModules.length - 1].uuid === moduleUuid;

    return (
        <div>
            <Header user={user} setUser={setUser} onlyMobile={true} />
            <Sidenav
                user={user}
                setUser={setUser}
                current={`courseModule_${moduleUuid}`}
                showMore={true}
                uuid={uuid}
                modules={course?.modules}
            />
            <section className={styles.dashboard}>
                <DashboardNav
                    link={`/dashboard/${uuid}`}
                    textLink={'Vrátit se zpět do kurzu'}
                    buttonText={'Upravit modul'}
                    buttonLink={'edit'}
                    buttonIcon={
                        <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.862 8.02494L19.9752 3.13697C19.8127 2.97443 19.6197 2.84549 19.4074 2.75752C19.195 2.66955 18.9674 2.62427 18.7376 2.62427C18.5077 2.62427 18.2801 2.66955 18.0678 2.75752C17.8555 2.84549 17.6625 2.97443 17.5 3.13697L4.01298 16.6251C3.84977 16.787 3.72037 16.9798 3.63231 17.1921C3.54425 17.4045 3.49927 17.6322 3.50001 17.8621V22.7501C3.50001 23.2142 3.68438 23.6593 4.01257 23.9875C4.34076 24.3157 4.78588 24.5001 5.25001 24.5001H10.138C10.3679 24.5008 10.5956 24.4559 10.808 24.3678C11.0204 24.2797 11.2131 24.1503 11.375 23.9871L24.862 10.5001C25.0246 10.3376 25.1535 10.1447 25.2415 9.93231C25.3295 9.71996 25.3747 9.49237 25.3747 9.26252C25.3747 9.03267 25.3295 8.80508 25.2415 8.59273C25.1535 8.38038 25.0246 8.18745 24.862 8.02494ZM10.138 22.7501H5.25001V17.8621L14.875 8.23713L19.763 13.1251L10.138 22.7501ZM21 11.887L16.112 7.0001L18.737 4.3751L23.625 9.26197L21 11.887Z" fill="#1A1A1A" />
                        </svg>
                    }
                    showButton={course.status === 'Draft'}
                    otherComponent={
                        course.status === 'Live' && (
                            <button
                                onClick={!module.activated || isLastModule ? undefined : handleActivateNext}
                                className={`${styles.module_button} ${!module.activated ? styles.module_button_inactive : ''}`}
                                disabled={!module.activated || isLastModule || activating}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <span className={styles.module_button_text}>
                                    {activating
                                        ? 'Aktivuji...'
                                        : isLastModule
                                            ? 'Poslední modul'
                                            : module.activated
                                                ? 'Nastavit další modul jako aktivní'
                                                : 'Modul není aktivní'}
                                </span>
                            </button>
                        )
                    }
                />
                <ModuleDetail module={module} uuid={uuid} course={course} />
            </section>
        </div>
    );
}