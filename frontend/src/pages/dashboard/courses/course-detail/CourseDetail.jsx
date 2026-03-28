import { useState, useEffect } from 'react';
import SearchInput from '../../../../shared/form/search-input/SearchInput';
import styles from './course-detail.module.scss';
import DashboardButton from '../../../../shared/button/dashboard/DashboardButton';
import ModuleDashboardCard from '../../../../shared/courses/module-dashboard-card/ModuleDashboardCard';
import ModuleSelect from '../../../../shared/form/course-select/ModuleSelect';
import { activateNextModule, deactivatePreviousModule, getCourseStudents, removeStudentFromCourse } from '../../../../services/CourseService';
import { getModules, reorderModules } from '../../../../services/ModuleService';

export default function CourseDetail({ course, onRefresh }) {
    const modules = course.modules;
    const [moduleData, setModuleData] = useState(modules);
    const [actionToast, setActionToast] = useState(null);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const showsStudents = course.status === 'Live' || course.status === 'Paused' || course.status === 'Archived';

    useEffect(() => {
        if (!showsStudents) return;
        setStudentsLoading(true);
        getCourseStudents(course.uuid)
            .then(setStudents)
            .catch(() => {})
            .finally(() => setStudentsLoading(false));
    }, [course.uuid, showsStudents]);

    const canActivate = moduleData?.some(m => !m.activated);
    const canDeactivate = moduleData?.some(m => m.activated);

    const showToast = (msg) => {
        setActionToast(msg);
        setTimeout(() => setActionToast(null), 3000);
    };

    const handleActivate = async () => {
        if (!window.confirm('Aktivovat další modul?')) return;
        try {
            await activateNextModule(course.uuid);
            const updated = await getModules(course.uuid);
            setModuleData(updated);
            if (onRefresh) onRefresh();
            showToast('Modul byl aktivován.');
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleRemoveStudent = async (studentUuid) => {
        if (!window.confirm('Odebrat studenta z kurzu?')) return;
        try {
            await removeStudentFromCourse(course.uuid, studentUuid);
            setStudents(prev => prev.filter(s => s.uuid !== studentUuid));
            showToast('Student byl odebrán z kurzu.');
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm('Deaktivovat modul?')) return;
        try {
            await deactivatePreviousModule(course.uuid);
            const updated = await getModules(course.uuid);
            setModuleData(updated);
            if (onRefresh) onRefresh();
            showToast('Modul byl deaktivován.');
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleMove = async (fromIndex, toIndex) => {
        const newData = [...moduleData];
        const [moved] = newData.splice(fromIndex, 1);
        newData.splice(toIndex, 0, moved);
        setModuleData(newData);

        try {
            await reorderModules(course.uuid, newData.map(m => m.uuid));
        } catch (err) {
            console.error(err);
            setModuleData(moduleData);
            alert(err.message);
        }
    };

    return (
        <article className={styles.course_detail}>
            {actionToast && <div className={styles.action_toast}>{actionToast}</div>}
            <div className={styles.course_detail_header}>
                <p>
                    {course.status}
                    {course.status === 'Scheduled' && course.scheduledAt && (
                        <span>
                            : {new Date(course.scheduledAt).toLocaleString('cs-CZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    )}
                </p>
                <h2>{course.name}</h2>
            </div>
            <p className={styles.course_detail_about}>{course.description}</p>
            <div className={styles.course_detail_modules}>
                <div className={styles.course_detail_modules_top}>
                    <h3>Moduly</h3>
                    <div className={styles.course_detail_modules_actions}>
                        {(course.status === 'Live' || course.status === 'Scheduled') && canActivate && (
                            <button className={styles.activate_btn} onClick={handleActivate}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Aktivovat další
                            </button>
                        )}
                        {(course.status === 'Live' || course.status === 'Scheduled') && canDeactivate && (
                            <button className={styles.deactivate_btn} onClick={handleDeactivate}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                                Deaktivovat
                            </button>
                        )}
                        {course.status === 'Draft' && (
                            <DashboardButton
                                text={'Nový modul'}
                                icon={<svg width="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96452 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM12 20.25C10.3683 20.25 8.77326 19.7661 7.41655 18.8596C6.05984 17.9531 5.00242 16.6646 4.378 15.1571C3.75358 13.6496 3.5902 11.9908 3.90853 10.3905C4.22685 8.79016 5.01259 7.32015 6.16637 6.16637C7.32016 5.01259 8.79017 4.22685 10.3905 3.90852C11.9909 3.59019 13.6497 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41655C19.7662 8.77325 20.25 10.3683 20.25 12C20.2475 14.1873 19.3775 16.2843 17.8309 17.8309C16.2843 19.3775 14.1873 20.2475 12 20.25ZM16.5 12C16.5 12.1989 16.421 12.3897 16.2803 12.5303C16.1397 12.671 15.9489 12.75 15.75 12.75H12.75V15.75C12.75 15.9489 12.671 16.1397 12.5303 16.2803C12.3897 16.421 12.1989 16.5 12 16.5C11.8011 16.5 11.6103 16.421 11.4697 16.2803C11.329 16.1397 11.25 15.9489 11.25 15.75V12.75H8.25C8.05109 12.75 7.86033 12.671 7.71967 12.5303C7.57902 12.3897 7.5 12.1989 7.5 12C7.5 11.8011 7.57902 11.6103 7.71967 11.4697C7.86033 11.329 8.05109 11.25 8.25 11.25H11.25V8.25C11.25 8.05109 11.329 7.86032 11.4697 7.71967C11.6103 7.57902 11.8011 7.5 12 7.5C12.1989 7.5 12.3897 7.57902 12.5303 7.71967C12.671 7.86032 12.75 8.05109 12.75 8.25V11.25H15.75C15.9489 11.25 16.1397 11.329 16.2803 11.4697C16.421 11.6103 16.5 11.8011 16.5 12Z" fill="#1A1A1A" /></svg>}
                                link={'modules/new'}
                            />
                        )}
                    </div>
                </div>
                <div className={styles.course_detail_modules_filter}>
                    <SearchInput text={'Hledejte modul podle názvu'} data={moduleData} setData={setModuleData} />
                    <ModuleSelect setModuleData={setModuleData} moduleData={modules} />
                </div>
                <div className={styles.course_detail_modules_list}>
                    {moduleData?.map((m, index) => (
                        <ModuleDashboardCard
                            key={m.uuid}
                            module={m}
                            num={index + 1}
                            isDraft={course.status === 'Draft'}
                            isFirst={index === 0}
                            isLast={index === moduleData.length - 1}
                            onMoveUp={() => handleMove(index, index - 1)}
                            onMoveDown={() => handleMove(index, index + 1)}
                            courseStatus={course.status}
                        />
                    ))}
                </div>
            </div>
            {showsStudents && (
                <div className={styles.course_detail_students}>
                    <div className={styles.course_detail_students_header}>
                        <h3>Studenti</h3>
                        <span className={styles.students_count}>{students.length}</span>
                    </div>
                    {studentsLoading ? (
                        <p className={styles.students_empty}>Načítání...</p>
                    ) : students.length === 0 ? (
                        <p className={styles.students_empty}>Zatím žádní zapsaní studenti</p>
                    ) : (
                        <div className={styles.students_list}>
                            {students.map(s => (
                                <div key={s.uuid} className={styles.student_row}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    <span>{s.username}</span>
                                    <button
                                        className={styles.student_remove_btn}
                                        onClick={() => handleRemoveStudent(s.uuid)}
                                        title="Odebrat studenta"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </article>
    )
}