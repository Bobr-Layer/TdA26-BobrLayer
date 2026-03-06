import { useState } from 'react';
import styles from './course-select.module.scss';
import {
    startCourse,
    pauseCourse,
    archiveCourse,
    backToDraft,
    scheduleCourse,
} from '../../../services/CourseService';

export default function StatusSetterSelect({ course, setCourse, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [scheduledAt, setScheduledAt] = useState("");

    const allowedTransitions = {
        Draft: ["Scheduled", "Live"],
        Scheduled: ["Draft", "Live"],
        Live: ["Paused", "Archived"],
        Paused: ["Live"],
        Archived: [],
    };

    const optionLabels = {
        Draft: "Draft",
        Live: "Aktivní",
        Scheduled: "Naplánovat na",
        Paused: "Pozastavené",
        Archived: "Archivované",
        Delete: "Smazat",
    };

    const allowed = allowedTransitions[course?.status] ?? [];

    const handleChange = async (e) => {
        const value = e.target.value;
        if (!value) return;

        if (value === "Scheduled") {
            setShowScheduler(true);
            return;
        }

        if (value === course.status) return;

        try {
            setLoading(true);

            let updatedCourse;

            switch (value) {
                case 'Draft':
                    updatedCourse = await backToDraft(course.uuid);
                    break;
                case 'Live':
                    updatedCourse = await startCourse(course.uuid);
                    setCourse(updatedCourse);
                    await onRefresh();
                    break;
                case 'Paused':
                    updatedCourse = await pauseCourse(course.uuid);
                    break;
                case 'Archived':
                    updatedCourse = await archiveCourse(course.uuid);
                    break;
                default:
                    return;
            }

            setCourse(updatedCourse);

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleChange = async (e) => {
        const value = e.target.value;
        setScheduledAt(value);

        if (!value) return;

        try {
            setLoading(true);

            const formattedDate = new Date(value).toISOString();

            const updatedCourse = await scheduleCourse(
                course.uuid,
                formattedDate
            );

            setCourse(updatedCourse);
            setShowScheduler(false);
            setScheduledAt("");

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={styles.wrapper}>
            <select
                className={styles.course_select}
                onChange={handleChange}
                value=""
                disabled={loading || allowed.length === 0}
            >
                <option value="">Nastavit stav kurzu</option>
                {allowed.map((key) => (
                    <option key={key} value={key}>
                        {optionLabels[key]}
                    </option>
                ))}
            </select>

            <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6925 7.94229L10.4425 14.1923C10.3845 14.2504 10.3156 14.2965 10.2397 14.328C10.1638 14.3594 10.0825 14.3756 10.0003 14.3756C9.91821 14.3756 9.83688 14.3594 9.76101 14.328C9.68514 14.2965 9.61621 14.2504 9.55816 14.1923L3.30816 7.94229C3.19088 7.82502 3.125 7.66596 3.125 7.5001C3.125 7.33425 3.19088 7.17519 3.30816 7.05792C3.42544 6.94064 3.5845 6.87476 3.75035 6.87476C3.9162 6.87476 4.07526 6.94064 4.19253 7.05792L10.0003 12.8665L15.8082 7.05792C15.8662 6.99985 15.9352 6.95378 16.011 6.92236C16.0869 6.89093 16.1682 6.87476 16.2503 6.87476C16.3325 6.87476 16.4138 6.89093 16.4897 6.92236C16.5655 6.95378 16.6345 6.99985 16.6925 7.05792C16.7506 7.11598 16.7967 7.18492 16.8281 7.26079C16.8595 7.33666 16.8757 7.41798 16.8757 7.5001C16.8757 7.58223 16.8595 7.66354 16.8281 7.73941C16.7967 7.81528 16.7506 7.88422 16.6925 7.94229Z" fill="white" />
            </svg>

            {showScheduler && (
                <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={handleScheduleChange}
                    min={new Date().toISOString().slice(0, 16)}
                />
            )}
        </div>
    );
}