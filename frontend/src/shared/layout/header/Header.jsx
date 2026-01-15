import { Link } from 'react-router-dom';
import styles from './header.module.scss';

function Header({ green, transparent }) {
    return (
        <header className={`${styles.header} ${green ? styles.green : ''} ${transparent ? styles.transparent : ''}`}>
            <Link to={"/"}>
                <img src="/img/symbol-w.png" alt="Bile logo Think different academy" />
            </Link>
            <nav>
                <Link to={"/courses"}>Seznam kurzů</Link>
                <Link to={"/login"}>Přihlásit se</Link>
            </nav>
        </header >
    )
}

export default Header
