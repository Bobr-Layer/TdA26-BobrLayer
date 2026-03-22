import Footer from '../../shared/layout/footer/Footer';
import Header from '../../shared/layout/header/Header';
import styles from './info.module.scss';

export default function About({ user, setUser }) {
    return (
        <div className={styles.info_wrapper}>
            <Header user={user} setUser={setUser} />
            <div className={styles.info}>
                <h1>O nás</h1>
                <p>
                    Založení Teachers Digital Academy nebylo dílem náhody, ale ryzí potřeby. Vše začalo před pár lety v malé univerzitní laboratoři,
                    kde se parta nadšenců snažila najít způsob, jak efektivněji sdílet studijní materiály a testovat své znalosti před
                    nekonečnými zkouškami. Tradiční systémy byly nemotorné, pomalé a chyběla jim... nu, duše. A tak jsme se rozhodli
                    vybudovat vlastní platformu. Název "Teachers Digital Academy" vznikl na jedné noční programovací seanci, kdy náš hlavní vývojář
                    prohlásil, že stavíme "vrstvu vědomostí pevnou a důmyslnou jako bobří hráz."
                </p>
                <p>
                    Dnes je Teachers Digital Academy nástrojem pro moderní lecturers a studenty, kteří hledají přehlednost, rychlost a férové prostředí.
                    Lektoři zde mohou snadno publikovat moduly a kvízy, zatímco studenti mají záruku anonymity, díky které se mohou bez
                    obav zapojit a učit se svým vlastním tempem. Věříme, že vzdělávání by mělo probíhat v prostředí, které je bezpečné,
                    anonymní tam, kde na tom záleží, a hlavně efektivní.
                </p>
                <p>
                    Stavíme hráz poznání. Vrstvu po vrstvě. Přidejte se k nám!
                </p>
            </div>
            <Footer user={user} setUser={setUser} />

            <div className={styles.info_ball}></div>
        </div>
    )
}
