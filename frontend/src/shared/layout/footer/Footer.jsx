import { Link } from 'react-router-dom';
import styles from './footer.module.scss';
import { logout } from '../../../services/AuthService';

export default function Footer({ user, setUser }) {
    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error('Odhlášení selhalo:', error);
            alert('Nepodařilo se odhlásit');
        }
    }

    return (
        <footer className={styles.footer}>
            <article>
                <img src="/img/logo_erb_white.svg" alt="Logo Think Different Academy" />
                <div className={styles.footer_list}>
                    <div className={styles.footer_list_block}>
                        <h3>Pro veřejnost</h3>
                        <div>
                            <Link to={'/'}>Hlavní stránka</Link>
                            <Link to={'/about'}>O nás</Link>
                            <Link to={'/courses'}>Kurzy</Link>
                        </div>
                    </div>
                    <div className={styles.footer_list_block}>
                        <h3>Pro lecturers</h3>
                        <div>
                            {user ? (
                                <>
                                    <Link to={'/dashboard'}>Dashboard</Link>
                                    <button onClick={handleLogout}>Odhlásit se</button>
                                </>
                            ) : (
                                <Link to={'/login'}>Přihlásit se</Link>
                            )}
                        </div>
                    </div>
                    <div className={styles.footer_list_block}>
                        <h3>Ostatní</h3>
                        <div>
                            <Link to={'/terms'}>Podmínky</Link>
                            <Link to={'/gdpr'}>GDPR</Link>
                            <Link to={'/contact'}>Kontakt</Link>
                        </div>
                    </div>
                </div>
            </article>
            <p>© bobr-layer 2026</p>

            <div className={styles.footer_ball}></div>
        </footer >
    )
}
