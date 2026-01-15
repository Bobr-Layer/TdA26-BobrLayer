import DashboardButton from '../../button/dashboard/DashboardButton';
import styles from './dashboard-nav.module.scss';

export default function DashboardNav({ heading, desc, actions }) {
    return (
        <article className={styles.dashboard_nav}>
            <div className={styles.dashboard_nav_heading}>
                <h1>{heading}</h1>
                {desc && (
                    <p>{desc}</p>
                )}
            </div>
            {actions && (
                <div className={styles.dashboard_nav_actions}>
                    {actions.map((a, index) => (
                        <DashboardButton text={a.text} icon={a.icon} onClick={a.onClick} red={a.red} key={index}/>
                    ))}
                </div>
            )}
        </article>
    )
}
