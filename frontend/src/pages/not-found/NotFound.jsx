import { Link } from 'react-router-dom';
import styles from './not-found.module.scss';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function NotFound() {
    usePageTitle('Stránka nenalezena');
    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                <div className={styles.number}>404</div>
                <h1 className={styles.title}>Stránka nenalezena</h1>
                <p className={styles.sub}>Tato stránka neexistuje nebo byla přesunuta.</p>
                <Link to="/" className={styles.btn}>Zpět na hlavní stránku</Link>
            </div>
        </div>
    );
}
