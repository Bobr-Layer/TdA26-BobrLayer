import { Link } from 'react-router-dom';
import styles from './sidenav.module.scss';
import { useState, useEffect } from 'react';
import { logout } from '../../../services/AuthService';

function Sidenav({ user, setUser, current, showMore, uuid, modules = [], feedNotification = false }) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        document.body.style.overflow = showMobileMenu ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showMobileMenu]);

    const handleMobileLogout = async () => {
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error('Odhlášení selhalo:', error);
        }
    };

    const close = () => setShowMobileMenu(false);

    return (
        <>
        <div className={styles.sidenav}>
            <div className={styles.sidenav_top}>
                <Link to="/"><img src="/img/symbol-w.png" alt="Bile logo Think different academy" /></Link>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <SidenavLink active={current === 'branches'} text={'Pobočky'} link={'/dashboard/branches'} svg={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>} />
                )}
                {user?.role === 'SUPER_ADMIN' && (
                    <SidenavLink active={current === 'users'} text={'Uživatelé'} link={'/dashboard/users'} svg={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
                )}
                {user?.role === 'LEKTOR' && (
                <>
                <SidenavLink active={current === 'courses'} text={'Kurzy'} link={'/dashboard'} svg={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>} />
                {showMore && (
                    <>
                        <div className={styles.sidenav_top_line}></div>
                        <div className={styles.sidenav_top_links}>
                            <SidenavLink link={'/dashboard/' + uuid} active={current === 'courseDetail'} text={'Detail kurzu'} svg={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>} />
                            <SidenavLink link={'/dashboard/' + uuid + '/feed'} active={current === 'courseFeed'} text={'Feed kurzu'} badge={feedNotification} svg={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
                            {modules.map((m) => (
                                <SidenavLink
                                    link={'/dashboard/' + uuid + '/modules/' + m.uuid}
                                    active={current === 'courseModule_' + m.uuid}
                                    key={m.uuid}
                                    text={m.name}
                                    svg={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>}
                                />
                            ))}
                        </div>
                    </>
                )}
                </>
                )}
            </div>
            <UserMenu user={user} setUser={setUser} />
        </div>

        {/* Mobile top bar */}
        <header className={styles.sidenav_mobile_header}>
            <Link to="/"><img src="/img/symbol-w.png" alt="Bile logo Think different academy" /></Link>
            <button className={styles.sidenav_mobile_burger} onClick={() => setShowMobileMenu(true)}>
                <svg width="4rem" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 10C5 9.66848 5.1317 9.35054 5.36612 9.11612C5.60054 8.8817 5.91848 8.75 6.25 8.75H33.75C34.0815 8.75 34.3995 8.8817 34.6339 9.11612C34.8683 9.35054 35 9.66848 35 10C35 10.3315 34.8683 10.6495 34.6339 10.8839C34.3995 11.1183 34.0815 11.25 33.75 11.25H6.25C5.91848 11.25 5.60054 11.1183 5.36612 10.8839C5.1317 10.6495 5 10.3315 5 10ZM33.75 15H13.75C13.4185 15 13.1005 15.1317 12.8661 15.3661C12.6317 15.6005 12.5 15.9185 12.5 16.25C12.5 16.5815 12.6317 16.8995 12.8661 17.1339C13.1005 17.3683 13.4185 17.5 13.75 17.5H33.75C34.0815 17.5 34.3995 17.3683 34.6339 17.1339C34.8683 16.8995 35 16.5815 35 16.25C35 15.9185 34.8683 15.6005 34.6339 15.3661C34.3995 15.1317 34.0815 15 33.75 15ZM33.75 21.25H6.25C5.91848 21.25 5.60054 21.3817 5.36612 21.6161C5.1317 21.8505 5 22.1685 5 22.5C5 22.8315 5.1317 23.1495 5.36612 23.3839C5.60054 23.6183 5.91848 23.75 6.25 23.75H33.75C34.0815 23.75 34.3995 23.6183 34.6339 23.3839C34.8683 23.1495 35 22.8315 35 22.5C35 22.1685 34.8683 21.8505 34.6339 21.6161C34.3995 21.3817 34.0815 21.25 33.75 21.25ZM33.75 27.5H13.75C13.4185 27.5 13.1005 27.6317 12.8661 27.8661C12.6317 28.1005 12.5 28.4185 12.5 28.75C12.5 29.0815 12.6317 29.3995 12.8661 29.6339C13.1005 29.8683 13.4185 30 13.75 30H33.75C34.0815 30 34.3995 29.8683 34.6339 29.6339C34.8683 29.3995 35 29.0815 35 28.75C35 28.4185 34.8683 28.1005 34.6339 27.8661C34.3995 27.6317 34.0815 27.5 33.75 27.5Z" fill="white" />
                </svg>
            </button>
        </header>

        {/* Mobile overlay */}
        {showMobileMenu && (
            <div className={styles.sidenav_mobile_overlay}>
                <div className={styles.sidenav_mobile_overlay_top}>
                    <Link to="/" onClick={close}><img src="/img/symbol-w.png" alt="Bile logo Think different academy" /></Link>
                    <button onClick={close}>
                        <svg width="3rem" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32.0612 30.9387C32.2007 31.078 32.3113 31.2435 32.3868 31.4256C32.4623 31.6077 32.5012 31.8029 32.5012 32C32.5012 32.1971 32.4623 32.3923 32.3868 32.5744C32.3113 32.7565 32.2007 32.9219 32.0612 33.0612C31.9219 33.2007 31.7565 33.3113 31.5744 33.3868C31.3923 33.4623 31.1971 33.5012 31 33.5012C30.8029 33.5012 30.6077 33.4623 30.4256 33.3868C30.2435 33.3113 30.078 33.2007 29.9387 33.0612L20 23.1194L10.0612 33.0612C9.7798 33.3427 9.39806 33.5008 9 33.5008C8.60195 33.5008 8.22021 33.3427 7.93875 33.0612C7.6573 32.7798 7.49917 32.398 7.49917 32C7.49917 31.602 7.6573 31.2202 7.93875 30.9387L17.8806 21L7.93875 11.0612C7.6573 10.7798 7.49917 10.398 7.49917 10C7.49917 9.60195 7.6573 9.2202 7.93875 8.93875C8.22021 8.6573 8.60195 8.49917 9 8.49917C9.39806 8.49917 9.7798 8.6573 10.0612 8.93875L20 18.8806L29.9387 8.93875C30.2202 8.6573 30.6019 8.49917 31 8.49917C31.3981 8.49917 31.7798 8.6573 32.0612 8.93875C32.3427 9.2202 32.5008 9.60195 32.5008 10C32.5008 10.398 32.3427 10.7798 32.0612 11.0612L22.1194 21L32.0612 30.9387Z" fill="white"/>
                        </svg>
                    </button>
                </div>
                <div className={styles.sidenav_mobile_overlay_content}>
                    <nav className={styles.sidenav_mobile_nav}>
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                            <Link to="/dashboard/branches" className={`${styles.sidenav_mobile_link} ${current === 'branches' ? styles.active : ''}`} onClick={close}>Pobočky</Link>
                        )}
                        {user?.role === 'SUPER_ADMIN' && (
                            <Link to="/dashboard/users" className={`${styles.sidenav_mobile_link} ${current === 'users' ? styles.active : ''}`} onClick={close}>Uživatelé</Link>
                        )}
                        {user?.role === 'LEKTOR' && (
                            <Link to="/dashboard" className={`${styles.sidenav_mobile_link} ${current === 'courses' ? styles.active : ''}`} onClick={close}>Kurzy</Link>
                        )}
                        {user?.role === 'LEKTOR' && showMore && (
                            <>
                                <Link to={'/dashboard/' + uuid} className={`${styles.sidenav_mobile_link} ${current === 'courseDetail' ? styles.active : ''}`} onClick={close}>Detail kurzu</Link>
                                <Link to={'/dashboard/' + uuid + '/feed'} className={`${styles.sidenav_mobile_link} ${current === 'courseFeed' ? styles.active : ''}`} onClick={close}>Feed kurzu</Link>
                            </>
                        )}
                    </nav>
                    <nav className={styles.sidenav_mobile_nav}>
                        <Link to="/profile" className={styles.sidenav_mobile_link} onClick={close}>Profil</Link>
                        <button className={styles.sidenav_mobile_link} onClick={() => { handleMobileLogout(); close(); }}>Odhlásit se</button>
                    </nav>
                </div>
            </div>
        )}
        </>
    )
}

export default Sidenav

function SidenavLink({ active, svg, text, link, badge = false }) {
    return (
        <Link to={link} className={`${styles.sidenav_link} ${active ? styles.active : ''}`}>
            <span className={styles.sidenav_link_icon}>
                {svg}
                {badge && <span className={styles.feed_badge}>!</span>}
            </span>
            {text}
        </Link>
    )
}

function UserMenu({ user, setUser }) {
    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error('Odhlášení selhalo:', error);
            alert('Nepodařilo se odhlásit');
        }
    }

    const [showMore, setShowMore] = useState(false);

    return (
        <div className={styles.user_menu}>
            {showMore && (
                <>
                    <Link to="/profile" className={styles.user_menu_profile}>
                        <svg width="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
                        </svg>
                        Profil
                    </Link>
                    <button className={styles.user_menu_logout} onClick={handleLogout}>
                        <svg width="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.25 20.25C11.25 20.4489 11.171 20.6397 11.0303 20.7803C10.8897 20.921 10.6989 21 10.5 21H4.5C4.30109 21 4.11032 20.921 3.96967 20.7803C3.82902 20.6397 3.75 20.4489 3.75 20.25V3.75C3.75 3.55109 3.82902 3.36032 3.96967 3.21967C4.11032 3.07902 4.30109 3 4.5 3H10.5C10.6989 3 10.8897 3.07902 11.0303 3.21967C11.171 3.36032 11.25 3.55109 11.25 3.75C11.25 3.94891 11.171 4.13968 11.0303 4.28033C10.8897 4.42098 10.6989 4.5 10.5 4.5H5.25V19.5H10.5C10.6989 19.5 10.8897 19.579 11.0303 19.7197C11.171 19.8603 11.25 20.0511 11.25 20.25ZM21.5306 11.4694L17.7806 7.71937C17.6399 7.57864 17.449 7.49958 17.25 7.49958C17.051 7.49958 16.8601 7.57864 16.7194 7.71937C16.5786 7.86011 16.4996 8.05098 16.4996 8.25C16.4996 8.44902 16.5786 8.63989 16.7194 8.78063L19.1897 11.25H10.5C10.3011 11.25 10.1103 11.329 9.96967 11.4697C9.82902 11.6103 9.75 11.8011 9.75 12C9.75 12.1989 9.82902 12.3897 9.96967 12.5303C10.1103 12.671 10.3011 12.75 10.5 12.75H19.1897L16.7194 15.2194C16.5786 15.3601 16.4996 15.551 16.4996 15.75C16.4996 15.949 16.5786 16.1399 16.7194 16.2806C16.8601 16.4214 17.051 16.5004 17.25 16.5004C17.449 16.5004 17.6399 16.4214 17.7806 16.2806L21.5306 12.5306C21.6004 12.461 21.6557 12.3783 21.6934 12.2872C21.7312 12.1962 21.7506 12.0986 21.7506 12C21.7506 11.9014 21.7312 11.8038 21.6934 11.7128C21.6557 11.6217 21.6004 11.539 21.5306 11.4694Z" fill="white" />
                        </svg>
                        Odhlásit se
                    </button>
                </>
            )}
            <div className={`${styles.user_menu_content} ${showMore ? styles.more : ''}`} onClick={() => setShowMore(!showMore)} role="button">
                <div>
                    <div className={styles.img_container} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <p>{user.username}</p>
                </div>
                <span className={styles.chevron}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                </span>
            </div>
        </div>
    )
}