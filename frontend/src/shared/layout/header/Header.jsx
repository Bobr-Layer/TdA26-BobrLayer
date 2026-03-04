import { Link } from 'react-router-dom';
import styles from './header.module.scss';
import { logout } from '../../../services/AuthService';

function Header({ green, transparent, user, setUser }) {
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
        <>
            <div className={styles.grad}></div>
            <header className={`${styles.header} ${green ? styles.green : ''} ${transparent ? styles.transparent : ''}`}>
                <Link to={"/"}>
                    <img src="/img/symbol-w.png" alt="Bile logo Think different academy" />
                </Link>
                <nav>
                    <Link to={"/"}>Domov</Link>
                    <Link to={"/courses"}>Seznam kurzů</Link>
                    <Link to={"/about"}>O nás</Link>
                    {!user ? (
                        <Link to={"/login"}>Přihlásit se</Link>
                    ) : (
                        <>
                            <Link to={"/dashboard"}>Dashboard</Link>
                            <button onClick={handleLogout}>Odhlásit se</button>
                        </>
                    )}
                </nav>
            </header>
        </>
    )
}

export default Header
