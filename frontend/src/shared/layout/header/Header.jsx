import { Link } from 'react-router-dom';
import styles from './header.module.scss';
import { logout } from '../../../services/AuthService';
import { useState, useRef, useEffect } from 'react';

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
    const isLektor = user && (user.role === 'LEKTOR' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

    return (
        <>
            <div className={`${styles.grad} ${scrolled ? styles.scrolled : ''} ${green ? styles.green : ''} ${transparent ? styles.transparent : ''} ${onlyMobile ? styles.only_mobile : ''}`}></div>
            <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${green ? styles.green : ''} ${transparent ? styles.transparent : ''} ${onlyMobile ? styles.only_mobile : ''}`}>
                <Link to={"/"}>
                    <img src="/img/logo_horizontal_white.svg" alt="Think different Academy" className={styles.logo_desktop} />
                    <img src="/img/logo_erb_white.svg" alt="Think different Academy" className={styles.logo_mobile} />
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </button>
                                {showDropdown && (
                                    <div className={styles.dropdown}>
                                        <Link to={"/profile"} onClick={() => setShowDropdown(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                            Profil
                                        </Link>
                                        <button onClick={handleLogout} className={styles.logout_button}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
                                            <span>Odhlásit se</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </nav>
                <button className={styles.sidenav_button} onClick={() => setShowSidenav(!showSidenav)} aria-label="Otevřít menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
                </button>
            </header>

            <div className={`${styles.sidenav} ${showSidenav ? styles.sidenav_open : ''}`}>
                <div className={styles.sidenav_header}>
                    <img src="/img/symbol-w.png" alt="Bile logo Think different academy" />
                    <button onClick={() => setShowSidenav(false)} aria-label="Zavřít menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
                <div className={styles.sidenav_content}>
                    <nav>
                        <Link to={"/"} onClick={() => setShowSidenav(false)}>Domov</Link>
                        <Link to={"/courses"} onClick={() => setShowSidenav(false)}>Seznam kurzů</Link>
                        <Link to={"/about"} onClick={() => setShowSidenav(false)}>O nás</Link>
                        <Link to={"/contact"} onClick={() => setShowSidenav(false)}>Kontakt</Link>
                        <Link to={"/gdpr"} onClick={() => setShowSidenav(false)}>GDPR</Link>
                        <Link to={"/vop"} onClick={() => setShowSidenav(false)}>VOP</Link>
                    </nav>
                    <nav>
                        {!user ? (
                            <>
                                <Link to={"/login"} onClick={() => setShowSidenav(false)}>Přihlásit se</Link>
                            </>
                        ) : (
                            <>
                                {isStudent && <Link to={"/my-courses"} onClick={() => setShowSidenav(false)}>Moje kurzy</Link>}
                                {isLektor && <Link to={"/dashboard"} onClick={() => setShowSidenav(false)}>Dashboard</Link>}
                                <Link to={"/profile"} onClick={() => setShowSidenav(false)}>Profil</Link>
                                <button onClick={() => { handleLogout(); setShowSidenav(false); }}>Odhlásit se</button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
            <div className={`${styles.sidenav_backdrop} ${showSidenav ? styles.sidenav_open : ''}`} onClick={() => setShowSidenav(false)} />
        </>
    )
}

export default Header
