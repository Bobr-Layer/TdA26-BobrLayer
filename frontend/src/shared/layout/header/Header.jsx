import { Link } from 'react-router-dom';
import styles from './header.module.scss';
import { logout } from '../../../services/AuthService';
import { useState, useRef, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';

function Header({ green, transparent, user, setUser, onlyMobile }) {
    const [showSidenav, setShowSidenav] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(() => window.scrollY > 10);
    const dropdownRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = showSidenav ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showSidenav]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error('Odhlášení selhalo:', error);
            alert('Nepodařilo se odhlásit');
        }
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isStudent = user && user.role === 'STUDENT';
    const isLektor = user && (user.role === 'LEKTOR' || user.role === 'ADMIN');

    return (
        <>
            <div className={`${styles.grad} ${scrolled ? styles.scrolled : ''} ${green ? styles.green : ''} ${transparent ? styles.transparent : ''} ${onlyMobile ? styles.only_mobile : ''}`}></div>
            <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${green ? styles.green : ''} ${transparent ? styles.transparent : ''} ${onlyMobile ? styles.only_mobile : ''}`}>
                <Link to={"/"}>
                    <img src="/img/logo_horizontal_white.svg" alt="Think different Academy" />
                </Link>
                <nav>
                    <Link to={"/"}>Domov</Link>
                    <Link to={"/courses"}>Seznam kurzů</Link>
                    <Link to={"/about"}>O nás</Link>
                    {!user ? (
                        <Link to={"/login"}>Přihlásit se</Link>
                    ) : (
                        <>
                            {isStudent && <Link to={"/my-courses"}>Moje kurzy</Link>}
                            {isLektor && <Link to={"/dashboard"}>Dashboard</Link>}
                            <div className={styles.user_menu} ref={dropdownRef}>
                                <button
                                    className={styles.user_button}
                                    onClick={() => setShowDropdown(prev => !prev)}
                                    aria-label="Uživatelské menu"
                                >
                                    <User size={24} color="white" />
                                </button>
                                {showDropdown && (
                                    <div className={styles.dropdown}>
                                        <Link to={"/profile"} onClick={() => setShowDropdown(false)}>
                                            <User size={20} color="white" />
                                            Profil
                                        </Link>
                                        <button onClick={handleLogout} className={styles.logout_button}>
                                            <LogOut size={20} color="#e53e3e" />
                                            <span>Odhlásit se</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </nav>
                <button className={styles.sidenav_button} onClick={() => setShowSidenav(!showSidenav)}>
                    <svg width="4rem" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 10C5 9.66848 5.1317 9.35054 5.36612 9.11612C5.60054 8.8817 5.91848 8.75 6.25 8.75H33.75C34.0815 8.75 34.3995 8.8817 34.6339 9.11612C34.8683 9.35054 35 9.66848 35 10C35 10.3315 34.8683 10.6495 34.6339 10.8839C34.3995 11.1183 34.0815 11.25 33.75 11.25H6.25C5.91848 11.25 5.60054 11.1183 5.36612 10.8839C5.1317 10.6495 5 10.3315 5 10ZM33.75 15H13.75C13.4185 15 13.1005 15.1317 12.8661 15.3661C12.6317 15.6005 12.5 15.9185 12.5 16.25C12.5 16.5815 12.6317 16.8995 12.8661 17.1339C13.1005 17.3683 13.4185 17.5 13.75 17.5H33.75C34.0815 17.5 34.3995 17.3683 34.6339 17.1339C34.8683 16.8995 35 16.5815 35 16.25C35 15.9185 34.8683 15.6005 34.6339 15.3661C34.3995 15.1317 34.0815 15 33.75 15ZM33.75 21.25H6.25C5.91848 21.25 5.60054 21.3817 5.36612 21.6161C5.1317 21.8505 5 22.1685 5 22.5C5 22.8315 5.1317 23.1495 5.36612 23.3839C5.60054 23.6183 5.91848 23.75 6.25 23.75H33.75C34.0815 23.75 34.3995 23.6183 34.6339 23.3839C34.8683 23.1495 35 22.8315 35 22.5C35 22.1685 34.8683 21.8505 34.6339 21.6161C34.3995 21.3817 34.0815 21.25 33.75 21.25ZM33.75 27.5H13.75C13.4185 27.5 13.1005 27.6317 12.8661 27.8661C12.6317 28.1005 12.5 28.4185 12.5 28.75C12.5 29.0815 12.6317 29.3995 12.8661 29.6339C13.1005 29.8683 13.4185 30 13.75 30H33.75C34.0815 30 34.3995 29.8683 34.6339 29.6339C34.8683 29.3995 35 29.0815 35 28.75C35 28.4185 34.8683 28.1005 34.6339 27.8661C34.3995 27.6317 34.0815 27.5 33.75 27.5Z" fill="white" />
                    </svg>
                </button>
            </header>

            {showSidenav && (
                <div className={styles.sidenav}>
                    <div className={styles.sidenav_header}>
                        <img src="/img/symbol-w.png" alt="Bile logo Think different academy" />
                        <button onClick={() => setShowSidenav(!showSidenav)}>
                            <svg width="4rem" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 10C5 9.66848 5.1317 9.35054 5.36612 9.11612C5.60054 8.8817 5.91848 8.75 6.25 8.75H33.75C34.0815 8.75 34.3995 8.8817 34.6339 9.11612C34.8683 9.35054 35 9.66848 35 10C35 10.3315 34.8683 10.6495 34.6339 10.8839C34.3995 11.1183 34.0815 11.25 33.75 11.25H6.25C5.91848 11.25 5.60054 11.1183 5.36612 10.8839C5.1317 10.6495 5 10.3315 5 10ZM33.75 15H13.75C13.4185 15 13.1005 15.1317 12.8661 15.3661C12.6317 15.6005 12.5 15.9185 12.5 16.25C12.5 16.5815 12.6317 16.8995 12.8661 17.1339C13.1005 17.3683 13.4185 17.5 13.75 17.5H33.75C34.0815 17.5 34.3995 17.3683 34.6339 17.1339C34.8683 16.8995 35 16.5815 35 16.25C35 15.9185 34.8683 15.6005 34.6339 15.3661C34.3995 15.1317 34.0815 15 33.75 15ZM33.75 21.25H6.25C5.91848 21.25 5.60054 21.3817 5.36612 21.6161C5.1317 21.8505 5 22.1685 5 22.5C5 22.8315 5.1317 23.1495 5.36612 23.3839C5.60054 23.6183 5.91848 23.75 6.25 23.75H33.75C34.0815 23.75 34.3995 23.6183 34.6339 23.3839C34.8683 23.1495 35 22.8315 35 22.5C35 22.1685 34.8683 21.8505 34.6339 21.6161C34.3995 21.3817 34.0815 21.25 33.75 21.25ZM33.75 27.5H13.75C13.4185 27.5 13.1005 27.6317 12.8661 27.8661C12.6317 28.1005 12.5 28.4185 12.5 28.75C12.5 29.0815 12.6317 29.3995 12.8661 29.6339C13.1005 29.8683 13.4185 30 13.75 30H33.75C34.0815 30 34.3995 29.8683 34.6339 29.6339C34.8683 29.3995 35 29.0815 35 28.75C35 28.4185 34.8683 28.1005 34.6339 27.8661C34.3995 27.6317 34.0815 27.5 33.75 27.5Z" fill="white" />
                            </svg>
                        </button>
                    </div>
                    <div className={styles.sidenav_content}>
                        <nav>
                            <Link to={"/"}>Domov</Link>
                            <Link to={"/courses"}>Seznam kurzů</Link>
                            <Link to={"/about"}>O nás</Link>
                            <Link to={"/contact"}>Kontakt</Link>
                            <Link to={"/gdpr"}>GDPR</Link>
                            <Link to={"/vop"}>VOP</Link>
                        </nav>
                        <nav>
                            {!user ? (
                                <>
                                    <Link to={"/login"}>Přihlásit se</Link>
                                </>
                            ) : (
                                <>
                                    {isStudent && <Link to={"/my-courses"}>Moje kurzy</Link>}
                                    {isLektor && <Link to={"/dashboard"}>Dashboard</Link>}
                                    <Link to={"/profile"}>Profil</Link>
                                    <button onClick={handleLogout}>Odhlásit se</button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </>
    )
}

export default Header
