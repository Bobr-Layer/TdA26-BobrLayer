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
                                className={styles.module_button}
                                disabled={!module.activated || isLastModule || activating}
                            >
                                <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M27.0495 13.6456C27.0112 13.5592 26.0848 11.5041 24.0253 9.44453C21.2811 6.70031 17.815 5.25 14 5.25C10.185 5.25 6.7189 6.70031 3.97468 9.44453C1.91515 11.5041 0.984365 13.5625 0.950458 13.6456C0.900707 13.7575 0.875 13.8786 0.875 14.0011C0.875 14.1236 0.900707 14.2447 0.950458 14.3566C0.98874 14.443 1.91515 16.497 3.97468 18.5566C6.7189 21.2997 10.185 22.75 14 22.75C17.815 22.75 21.2811 21.2997 24.0253 18.5566C26.0848 16.497 27.0112 14.443 27.0495 14.3566C27.0993 14.2447 27.125 14.1236 27.125 14.0011C27.125 13.8786 27.0993 13.7575 27.0495 13.6456ZM14 21C10.6334 21 7.69233 19.7761 5.25765 17.3633C4.2587 16.3698 3.4088 15.237 2.73436 14C3.40854 12.7629 4.25847 11.63 5.25765 10.6367C7.69233 8.22391 10.6334 7 14 7C17.3666 7 20.3076 8.22391 22.7423 10.6367C23.7432 11.6298 24.595 12.7627 25.2711 14C24.4825 15.4722 21.047 21 14 21ZM14 8.75C12.9616 8.75 11.9466 9.05791 11.0832 9.63478C10.2199 10.2117 9.54698 11.0316 9.14962 11.9909C8.75226 12.9502 8.64829 14.0058 8.85087 15.0242C9.05344 16.0426 9.55345 16.9781 10.2877 17.7123C11.0219 18.4465 11.9574 18.9466 12.9758 19.1491C13.9942 19.3517 15.0498 19.2477 16.0091 18.8504C16.9684 18.453 17.7883 17.7801 18.3652 16.9167C18.9421 16.0534 19.25 15.0384 19.25 14C19.2485 12.6081 18.695 11.2735 17.7107 10.2893C16.7265 9.30504 15.3919 8.75145 14 8.75ZM14 17.5C13.3078 17.5 12.6311 17.2947 12.0555 16.9101C11.4799 16.5256 11.0313 15.9789 10.7664 15.3394C10.5015 14.6999 10.4322 13.9961 10.5672 13.3172C10.7023 12.6383 11.0356 12.0146 11.5251 11.5251C12.0146 11.0356 12.6382 10.7023 13.3172 10.5673C13.9961 10.4322 14.6998 10.5015 15.3394 10.7664C15.9789 11.0313 16.5255 11.4799 16.9101 12.0555C17.2947 12.6311 17.5 13.3078 17.5 14C17.5 14.9283 17.1312 15.8185 16.4749 16.4749C15.8185 17.1313 14.9282 17.5 14 17.5Z" fill="white" />
                                </svg>
                                {activating
                                    ? 'Aktivuji...'
                                    : isLastModule
                                        ? 'Poslední modul'
                                        : module.activated
                                            ? 'Nastavit další modul jako aktivní'
                                            : 'Modul není aktivní'}
                            </button>
                        )
                    }
                />
                <ModuleDetail module={module} uuid={uuid} course={course} />
            </section>
        </div>
    );
}