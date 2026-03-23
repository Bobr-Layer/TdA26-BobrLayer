import Footer from '../../shared/layout/footer/Footer';
import Header from '../../shared/layout/header/Header';
import styles from './info.module.scss';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function GDPR({ user, setUser }) {
    usePageTitle('GDPR');
    return (
        <div className={styles.info_wrapper}>
            <Header user={user} setUser={setUser} />
            <div className={styles.info}>
                <h1>GDPR</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat?</p>
            </div>
            <Footer user={user} setUser={setUser}/>

            <div className={styles.info_ball}></div>
        </div>
    )
}
