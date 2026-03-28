import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import styles from '../dashboard.module.scss';
import versionStyles from './course-versions.module.scss';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import {
    getCourseByUuid, deleteCourse, createCourse,
    getCourseVersions, createCourseVersion, getCourseVersionContent, rollbackCourseVersion
} from '../../../services/CourseService';
import { createModule } from '../../../services/ModuleService';
import { getCourseFeed } from '../../../services/FeedService';
import CourseDetail from '../courses/course-detail/CourseDetail';
import CourseVersionView from '../courses/course-version-view/CourseVersionView';
import StatusSetterSelect from '../../../shared/form/course-select/StatusSetterSelect';
import DashboardButton from '../../../shared/button/dashboard/DashboardButton';
import Header from '../../../shared/layout/header/Header';
import NotFound from '../../not-found/NotFound';
import { usePageTitle } from '../../../hooks/usePageTitle';

export default function Course({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [course, setCourse] = useState(null);
    usePageTitle(course?.name);
    const [duplicating, setDuplicating] = useState(false);
    const { toast, showToast } = useToast();
    const [feedNotification, setFeedNotification] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [versions, setVersions] = useState([]);
    const [viewedVersionId, setViewedVersionId] = useState(null);
    const [viewedVersionContent, setViewedVersionContent] = useState(null);
    const [savingVersion, setSavingVersion] = useState(false);

    const loadCourse = useCallback(async () => {
        try {
            const foundCourse = await getCourseByUuid(uuid);
            setCourse(foundCourse);
        } catch (err) {
            console.error(err);
            setNotFound(true);
        }
    }, [uuid]);

    const loadVersions = useCallback(async () => {
        try {
            const v = await getCourseVersions(uuid);
            setVersions(v);
        } catch {
            // silently ignore
        }
    }, [uuid]);

    useEffect(() => {
        loadCourse();
        loadVersions();
    }, [loadCourse, loadVersions]);

    useEffect(() => {
        if (!uuid) return;
        const checkFeedNotification = async () => {
            try {
                const feedData = await getCourseFeed(uuid);
                if (feedData.length === 0) return;
                const latest = feedData.reduce((a, b) =>
                    new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
                const lastSeen = parseInt(localStorage.getItem(`feedSeen_${uuid}`) || '0', 10);
                if (new Date(latest.createdAt).getTime() > lastSeen) {
                    setFeedNotification(true);
                }
            } catch (err) {
                // ignore
            }
        };
        checkFeedNotification();
    }, [uuid]);

    const handleDelete = async () => {
        if (!course) return;
        if (!window.confirm(`Opravdu chcete smazat kurz "${course.name}"? Tato akce je nevratná.`)) return;

        try {
            const name = course.name;
            await deleteCourse(course.uuid);
            navigate('/dashboard', { replace: true, state: { toast: `Kurz "${name}" byl smazán.` } });
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleDuplicate = async () => {
        const sourceName = viewedVersionContent ? viewedVersionContent.name : course?.name;
        const sourceModules = viewedVersionContent ? viewedVersionContent.modules : course?.modules;

        if (!sourceName || duplicating) return;
        if (!window.confirm(`Opravdu chcete duplikovat kurz "${sourceName}"?`)) return;

        try {
            setDuplicating(true);
            const newCourse = await createCourse({
                name: `${sourceName} (kopie)`,
                description: viewedVersionContent ? viewedVersionContent.description : course?.description,
                status: 'Draft',
            });

            if (sourceModules && sourceModules.length > 0) {
                for (const m of sourceModules) {
                    await createModule(newCourse.uuid, {
                        name: m.name,
                        description: m.description,
                        index: m.index,
                    });
                }
            }

            showToast(`Kurz byl úspěšně duplikován jako "${newCourse.name}".`);
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setDuplicating(false);
        }
    };

    const handleCreateVersion = async () => {
        if (savingVersion) return;
        try {
            setSavingVersion(true);
            await createCourseVersion(uuid);
            await loadVersions();
            showToast('Verze kurzu byla uložena.');
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setSavingVersion(false);
        }
    };

    const handleSelectVersion = async (shortId) => {
        if (!shortId) {
            setViewedVersionId(null);
            setViewedVersionContent(null);
            return;
        }
        try {
            const content = await getCourseVersionContent(uuid, shortId);
            setViewedVersionId(shortId);
            setViewedVersionContent(content);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleRollback = async () => {
        if (!viewedVersionId) return;
        if (!window.confirm('Obnovit kurz do této verze? Aktuální obsah bude přepsán.')) return;
        try {
            const updated = await rollbackCourseVersion(uuid, viewedVersionId);
            setCourse(updated);
            setViewedVersionId(null);
            setViewedVersionContent(null);
            await loadVersions();
            showToast('Kurz byl obnoven do vybrané verze.');
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    if (notFound) return <NotFound />;

    return (
        <div>
            <Header user={user} setUser={setUser} onlyMobile={true} />
            <Sidenav user={user} setUser={setUser} showMore={true} current={'courseDetail'} uuid={uuid} modules={course?.modules} feedNotification={feedNotification} />
            {course && (
                <section className={styles.dashboard}>
                    <DashboardNav
                        link={'/dashboard'}
                        textLink={'Vrátit se zpět'}
                        otherComponent={
                            <>
                                {/* ── Primary group: state management + edit ── */}
                                <div className={styles.action_group_primary}>
                                    <StatusSetterSelect
                                        course={course}
                                        setCourse={setCourse}
                                        onRefresh={loadCourse}
                                    />
                                    {course.status === 'Draft' && !viewedVersionId && (
                                        <DashboardButton
                                            text="Upravit kurz"
                                            link="edit"
                                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>}
                                        />
                                    )}
                                </div>

                                {/* ── Divider ── */}
                                <div className={styles.action_divider} />

                                {/* ── Secondary group: utility actions (icon-only) ── */}
                                <div className={styles.action_group_secondary}>
                                    {course.status === 'Draft' && (
                                        <button
                                            className={`${styles.course_button} ${styles.course_button_icon}`}
                                            onClick={handleCreateVersion}
                                            disabled={savingVersion}
                                            title={savingVersion ? 'Ukládám...' : 'Uložit verzi'}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/></svg>
                                        </button>
                                    )}

                                    {versions.length > 0 && (course.status === 'Draft' || course.status === 'Archived') && (
                                        <select
                                            className={versionStyles.version_select}
                                            value={viewedVersionId ?? ''}
                                            onChange={(e) => handleSelectVersion(e.target.value || null)}
                                        >
                                            <option value="">Aktuální verze</option>
                                            {versions.map((v) => (
                                                <option key={v.shortId} value={v.shortId}>
                                                    {v.shortId} · {new Date(v.createdAt).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {viewedVersionId && course.status === 'Draft' && (
                                        <button
                                            className={`${styles.course_button} ${styles.course_button_icon} ${versionStyles.rollback_button}`}
                                            onClick={handleRollback}
                                            title="Obnovit tuto verzi"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                        </button>
                                    )}

                                    <button
                                        className={`${styles.course_button} ${styles.course_button_icon}`}
                                        onClick={handleDuplicate}
                                        disabled={duplicating}
                                        title={duplicating ? 'Duplikuji...' : 'Duplikovat kurz'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                    </button>

                                    {course.status === 'Draft' && !viewedVersionId && (
                                        <button
                                            className={`${styles.course_button} ${styles.course_button_icon} ${styles.course_button_delete}`}
                                            onClick={handleDelete}
                                            title="Smazat kurz"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        </button>
                                    )}
                                </div>
                            </>
                        } />

                    {viewedVersionId
                        ? <CourseVersionView versionContent={viewedVersionContent} />
                        : <CourseDetail course={course} onRefresh={loadCourse} />
                    }
                </section>
            )}
            {toast && (
                <div className={styles.toast}>{toast}</div>
            )}
        </div>
    )
}
