import styles from './course-dashboard-card.module.scss';
import { Link } from 'react-router-dom';

function CourseDashboardCard({ course }) {
    return (
        <Link className={styles.course_dashboard_card} to={'/dashboard/' + course.uuid}>
            <div className={styles.course_dashboard_card_content}>
                <h3>{course.name}</h3>
                <p>{course.description}</p>
            </div>
            <div className={styles.course_dashboard_card_side}>
                <div className={styles.course_dashboard_card_side_module}>
                    <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.875 6.875H11.875V3.125C11.875 2.79348 11.7433 2.47554 11.5089 2.24112C11.2745 2.0067 10.9565 1.875 10.625 1.875H5.625C5.29348 1.875 4.97554 2.0067 4.74112 2.24112C4.5067 2.47554 4.375 2.79348 4.375 3.125V6.875C4.375 7.20652 4.5067 7.52446 4.74112 7.75888C4.97554 7.9933 5.29348 8.125 5.625 8.125H10.625V11.875H5.625C5.29348 11.875 4.97554 12.0067 4.74112 12.2411C4.5067 12.4755 4.375 12.7935 4.375 13.125V16.875C4.375 17.2065 4.5067 17.5245 4.74112 17.7589C4.97554 17.9933 5.29348 18.125 5.625 18.125H10.625C10.9565 18.125 11.2745 17.9933 11.5089 17.7589C11.7433 17.5245 11.875 17.2065 11.875 16.875V13.125H16.875C17.2065 13.125 17.5245 12.9933 17.7589 12.7589C17.9933 12.5245 18.125 12.2065 18.125 11.875V8.125C18.125 7.79348 17.9933 7.47554 17.7589 7.24112C17.5245 7.0067 17.2065 6.875 16.875 6.875ZM10.625 16.875H5.625V13.125H10.625V16.875ZM10.625 3.125V6.875H5.625V3.125H10.625ZM16.875 11.875H11.875V8.125H16.875V11.875Z" fill="#C1C1C1" />
                    </svg>
                    <p>{course.modules.length} {course.modules.length === 1 ? 'modul' : course.modules.length < 5 ? 'moduly' : 'modulů'}</p>
                </div>
                <div className={styles.course_dashboard_card_side_info}>
                    <span className={styles.status_badge} data-status={course.status}>
                        {{ Draft: 'Koncept', Scheduled: 'Naplánováno', Live: 'Aktivní', Paused: 'Pozastaveno', Archived: 'Archivováno' }[course.status] ?? course.status}
                    </span>
                    <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24.2441 14.6191L16.3691 22.4941C16.2049 22.6582 15.9822 22.7505 15.75 22.7505C15.5178 22.7505 15.2951 22.6582 15.1309 22.4941C14.9668 22.3299 14.8745 22.1072 14.8745 21.875C14.8745 21.6428 14.9668 21.4201 15.1309 21.2559L21.513 14.875H4.375C4.14294 14.875 3.92038 14.7828 3.75628 14.6187C3.59219 14.4546 3.5 14.2321 3.5 14C3.5 13.7679 3.59219 13.5454 3.75628 13.3813C3.92038 13.2172 4.14294 13.125 4.375 13.125H21.513L15.1309 6.74406C14.9668 6.57988 14.8745 6.35719 14.8745 6.125C14.8745 5.8928 14.9668 5.67012 15.1309 5.50594C15.2951 5.34175 15.5178 5.24951 15.75 5.24951C15.9822 5.24951 16.2049 5.34175 16.3691 5.50594L24.2441 13.3809C24.3254 13.4622 24.39 13.5587 24.434 13.6649C24.478 13.7711 24.5007 13.885 24.5007 14C24.5007 14.115 24.478 14.2288 24.434 14.3351C24.39 14.4413 24.3254 14.5378 24.2441 14.6191Z" fill="white" />
                    </svg>
                </div>
            </div>
        </Link>
    )
}

export default CourseDashboardCard
