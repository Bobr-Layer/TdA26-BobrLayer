import { Link } from 'react-router-dom';
import LogOutButton from '../../button/logout/LogOutButton';
import styles from './sidenav.module.scss';

function Sidenav({ user, setUser }) {
    return (
        <div className={styles.sidenav}>
            <div className={styles.sidenav_top}>
                <img src="/img/symbol-w.png" alt="Bile logo Think different academy" />
                <div className={styles.sidenav_top_lector}>
                    <img src='/img/duck-white.png' className={styles.img} alt=''/>
                    <div>
                        <p className={styles.sidenav_top_lector_name}>{user.username}</p>
                    </div>
                </div>
                <div className={styles.sidenav_top_line}></div>
                <div className={styles.sidenav_top_links}>
                    <Link to={'/dashboard'}>Dashboard</Link>
                    <Link to={'/dashboard'}>Správa kurzů</Link>
                </div>
                <div className={styles.sidenav_top_links}>
                    <Link to={'/dashboard'}>Nastavení</Link>
                </div>
                <div className={styles.sidenav_top_line}></div>
            </div>
            <LogOutButton setUser={setUser} />
        </div>
    )
}

export default Sidenav
