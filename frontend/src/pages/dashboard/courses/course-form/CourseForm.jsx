import styles from './course-form.module.scss';
import Input from '../../../../shared/form/input/Input';
import Textarea from '../../../../shared/form/textarea/Textarea';
import MaterialDashboardCard from '../../../../shared/courses/material-dashboard-card/MaterialDashboardCard';
import NewButton from '../../../../shared/button/new/NewButton';

export default function CourseForm({ courseData, handleCourseChange, onSubmit }) {
    return (
        <article className={styles.course_form}>
            <form className={styles.course_form_inputs} onSubmit={onSubmit}>
                <Input
                    name="name"
                    placeholder="Název kurzu"
                    value={courseData.name}
                    onChange={handleCourseChange}
                    title={true}
                />
                <Textarea
                    name="description"
                    placeholder="Krátký popis kurzu"
                    value={courseData.description}
                    onChange={handleCourseChange}
                    bigger={true}
                />
            </form>
            <div className={styles.course_form_materials}>
                <div className={styles.course_form_content}>
                    <div className={styles.course_form_content_header}>
                        <h3>Soubory</h3>
                        <p>3 soubory</p>
                    </div>
                    <div className={styles.course_form_content_material}>
                        <MaterialDashboardCard file={true} />
                        <MaterialDashboardCard file={true} />
                        <MaterialDashboardCard file={true} />
                        <NewButton />
                    </div>
                </div>
                <div className={styles.course_form_content}>
                    <div className={styles.course_form_content_header}>
                        <h3>Odkazy</h3>
                        <p>2 odkazy</p>
                    </div>
                    <div className={styles.course_form_content_material}>
                        <MaterialDashboardCard />
                        <MaterialDashboardCard />
                        <NewButton />
                    </div>
                </div>
            </div>
        </article>
    )
}
