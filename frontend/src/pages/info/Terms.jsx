import { useEffect, useRef } from 'react';
import Footer from '../../shared/layout/footer/Footer';
import Header from '../../shared/layout/header/Header';
import styles from './info.module.scss';
import { usePageTitle } from '../../hooks/usePageTitle';

const SECTIONS = [
    {
        heading: 'Obecná ustanovení',
        body: 'Tyto všeobecné obchodní podmínky (VOP) upravují pravidla používání vzdělávací platformy Teachers Digital Academy (TdA). Používáním platformy vyjadřujete souhlas s těmito podmínkami.',
    },
    {
        heading: 'Uživatelský účet',
        items: [
            'Každý uživatel musí mít jedinečné přihlašovací jméno.',
            'Za bezpečnost svého hesla odpovídá uživatel.',
            'Účet lze kdykoli smazat — data jsou nevratně odstraněna.',
            'Zneužití účtu nebo platformy může vést k okamžitému zablokování.',
        ],
    },
    {
        heading: 'Role a oprávnění',
        body: 'Platforma rozlišuje tři role: Student, Lektor a Admin. Student se zapisuje na kurzy a plní obsah. Lektor vytváří kurzy, moduly a materiály. Admin spravuje uživatelské účty na celé platformě.',
    },
    {
        heading: 'Obsah kurzů',
        items: [
            'Obsah kurzů tvoří lektoři na vlastní odpovědnost.',
            'Materiály nesmí porušovat autorská práva třetích stran.',
            'Nahrávané soubory jsou omezeny na 30 MB a povolené formáty.',
            'Platforma si vyhrazuje právo odstranit nevhodný obsah.',
        ],
    },
    {
        heading: 'Omezení odpovědnosti',
        body: 'Platforma TdA je provozována jako školní projekt. Neposkytujeme záruky dostupnosti ani přesnosti obsahu. Veškeré vzdělávací materiály slouží pouze pro informační účely.',
    },
    {
        heading: 'Změny podmínek',
        body: 'Tyto podmínky se mohou měnit. O podstatných změnách budete informováni prostřednictvím platformy. Dalším používáním po oznámení změn vyjadřujete souhlas s aktuálním zněním.',
    },
];

export default function Terms({ user, setUser }) {
    usePageTitle('Podmínky použití');
    const revealRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.revealed)),
            { threshold: 0.12 }
        );
        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.info_wrapper}>
            <Header user={user} setUser={setUser} />

            <section className={styles.info_hero}>
                <div className={styles.info_hero_content}>
                    <span className={styles.info_label}>Podmínky použití</span>
                    <h1>VOP</h1>
                    <p>Pravidla pro používání platformy Teachers Digital Academy. Prosíme, přečtěte si je před zahájením používání.</p>
                </div>
                <div className={styles.info_hero_ball} />
            </section>

            <hr className={styles.info_rule} />

            <section className={styles.info_section}>
                <div className={styles.info_body}>
                    {SECTIONS.map((s, i) => (
                        <div
                            key={i}
                            className={styles.reveal}
                            style={{ '--delay': `${i * 0.07}s` }}
                            ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}
                        >
                            <h3>{s.heading}</h3>
                            {s.body && <p>{s.body}</p>}
                            {s.items && (
                                <ul>
                                    {s.items.map((item, j) => <li key={j}>{item}</li>)}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <Footer user={user} setUser={setUser} />
        </div>
    );
}
