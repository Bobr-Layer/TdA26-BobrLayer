import Footer from '../../shared/layout/footer/Footer';
import Header from '../../shared/layout/header/Header';
import styles from './info.module.scss';

export default function Contact({ user, setUser }) {
    return (
        <div className={styles.info_wrapper}>
            <Header user={user} setUser={setUser} />
            <div className={styles.info}>
                <h1>Kontakt</h1>
                <a href="mailto:email@email.email">email@email.email</a>
                <a href="tel:++420123456789">+420 123 456 789</a>
            </div>
            <Footer user={user} setUser={setUser}/>

            <div className={styles.info_ball}></div>
        </div>
    )
}
