import { useState } from 'react';
import SearchInput from '../../../../shared/form/search-input/SearchInput';
import styles from './course-detail.module.scss';
import DashboardButton from '../../../../shared/button/dashboard/DashboardButton';
import ModuleDashboardCard from '../../../../shared/courses/module-dashboard-card/ModuleDashboardCard';
import ModuleSelect from '../../../../shared/form/course-select/ModuleSelect';
import { activateNextModule, deactivatePreviousModule } from '../../../../services/CourseService';
import { getModules, reorderModules } from '../../../../services/ModuleService';

export default function CourseDetail({ course, onRefresh }) {
    const modules = course.modules;
    const [moduleData, setModuleData] = useState(modules);

    const canActivate = moduleData?.some(m => !m.activated);
    const canDeactivate = moduleData?.some(m => m.activated);

    const handleActivate = async () => {
        try {
            await activateNextModule(course.uuid);
            const updated = await getModules(course.uuid);
            setModuleData(updated);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleDeactivate = async () => {
        try {
            await deactivatePreviousModule(course.uuid);
            const updated = await getModules(course.uuid);
            setModuleData(updated);
            if (onRefresh) onRefresh();
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
                <h3>Moduly</h3>
                <div className={styles.course_detail_modules_header}>
                    <SearchInput text={'Hledejte modul podle názvu'} data={moduleData} setData={setModuleData} />
                    <ModuleSelect setModuleData={setModuleData} moduleData={modules} />
                    {course.status === 'Live' && (
                        <div className={styles.course_detail_modules_actions}>
                            {canActivate && (
                                <button
                                    className={styles.activate_btn}
                                    onClick={handleActivate}
                                >
                                    <svg width="1.25rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 4.5C7.30608 4.5 3.20771 7.61029 1.18164 12C3.20771 16.3897 7.30608 19.5 12 19.5C16.6939 19.5 20.7923 16.3897 22.8184 12C20.7923 7.61029 16.6939 4.5 12 4.5ZM12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17ZM12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" fill="white" />
                                    </svg>
                                    Aktivovat další
                                </button>
                            )}
                            {canDeactivate && (
                                <button
                                    className={styles.deactivate_btn}
                                    onClick={handleDeactivate}
                                >
                                    <svg width="1.25rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.53033 2.46967C3.23744 2.17678 2.76256 2.17678 2.46967 2.46967C2.17678 2.76256 2.17678 3.23744 2.46967 3.53033L20.4697 21.5303C20.7626 21.8232 21.2374 21.8232 21.5303 21.5303C21.8232 21.2374 21.8232 20.7626 21.5303 20.4697L3.53033 2.46967Z" fill="white" />
                                        <path d="M22.8184 12C21.7586 9.74646 20.0923 7.84498 18.0152 6.49528L15.8517 8.65883C16.5614 9.55014 17 10.7235 17 12C17 14.7614 14.7614 17 12 17C10.7235 17 9.55014 16.5614 8.65883 15.8517L6.49528 18.0152C8.07988 19.139 9.96019 19.7904 12 19.5C16.6939 19.5 20.7923 16.3897 22.8184 12Z" fill="white" />
                                        <path d="M1.18164 12C2.24143 14.2535 3.90771 16.155 5.98477 17.5047L8.14832 15.3412C7.43857 14.4499 7 13.2765 7 12C7 9.23858 9.23858 7 12 7C13.2765 7 14.4499 7.43857 15.3412 8.14832L17.5047 5.98477C15.9201 4.86102 14.0398 4.20964 12 4.5C7.30608 4.5 3.20771 7.61029 1.18164 12Z" fill="white" />
                                    </svg>
                                    Deaktivovat další
                                </button>
                            )}
                        </div>
                    )}
                    {course.status === 'Draft' && (
                        <DashboardButton
                            text={'Nový modul'}
                            icon={
                                <svg width="1.75rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96452 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM12 20.25C10.3683 20.25 8.77326 19.7661 7.41655 18.8596C6.05984 17.9531 5.00242 16.6646 4.378 15.1571C3.75358 13.6496 3.5902 11.9908 3.90853 10.3905C4.22685 8.79016 5.01259 7.32015 6.16637 6.16637C7.32016 5.01259 8.79017 4.22685 10.3905 3.90852C11.9909 3.59019 13.6497 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41655C19.7662 8.77325 20.25 10.3683 20.25 12C20.2475 14.1873 19.3775 16.2843 17.8309 17.8309C16.2843 19.3775 14.1873 20.2475 12 20.25ZM16.5 12C16.5 12.1989 16.421 12.3897 16.2803 12.5303C16.1397 12.671 15.9489 12.75 15.75 12.75H12.75V15.75C12.75 15.9489 12.671 16.1397 12.5303 16.2803C12.3897 16.421 12.1989 16.5 12 16.5C11.8011 16.5 11.6103 16.421 11.4697 16.2803C11.329 16.1397 11.25 15.9489 11.25 15.75V12.75H8.25C8.05109 12.75 7.86033 12.671 7.71967 12.5303C7.57902 12.3897 7.5 12.1989 7.5 12C7.5 11.8011 7.57902 11.6103 7.71967 11.4697C7.86033 11.329 8.05109 11.25 8.25 11.25H11.25V8.25C11.25 8.05109 11.329 7.86032 11.4697 7.71967C11.6103 7.57902 11.8011 7.5 12 7.5C12.1989 7.5 12.3897 7.57902 12.5303 7.71967C12.671 7.86032 12.75 8.05109 12.75 8.25V11.25H15.75C15.9489 11.25 16.1397 11.329 16.2803 11.4697C16.421 11.6103 16.5 11.8011 16.5 12Z" fill="#1A1A1A" />
                                </svg>
                            }
                            longer={true}
                            link={'modules/new'}
                        />
                    )}
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
        </article>
    )
}