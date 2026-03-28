import { Link } from 'react-router-dom';
import DashboardButton from '../../button/dashboard/DashboardButton';
import styles from './dashboard-nav.module.scss';

export default function DashboardNav({ link, textLink, otherComponent, buttonText, onClick, buttonLink, buttonIcon, buttonSubmit, showButton}) {
    return (
        <article className={styles.dashboard_nav}>
            <Link to={link} className={styles.dashboard_nav_back}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                {textLink}
            </Link>
            <div className={styles.dashboard_nav_actions}>
                {otherComponent}
                {showButton && <DashboardButton text={buttonText} onClick={onClick} link={buttonLink} icon={buttonIcon} submit={buttonSubmit}/>}
            </div>
        </article>
    )
}
