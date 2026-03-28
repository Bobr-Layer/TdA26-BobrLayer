import { useEffect, useRef } from 'react';
import Footer from '../../shared/layout/footer/Footer';
import Header from '../../shared/layout/header/Header';
import styles from './info.module.scss';
import { usePageTitle } from '../../hooks/usePageTitle';

const SECTIONS = [
    {
        heading: 'Kdo je správcem vašich dat?',
        body: 'Správcem osobních údajů je Teachers Digital Academy (TdA), provozovaná týmem Bobr Layer. Zpracováváme pouze údaje nezbytné pro provoz platformy.',
    },
    {
        heading: 'Jaké údaje sbíráme?',
        items: [
            'Přihlašovací jméno (username)',
            'Hashované heslo — nikdy v čitelné podobě',
            'Role uživatele (student / lektor / admin)',
            'Výsledky kvízů a přístupy k materiálům',
        ],
    },
    {
        heading: 'K čemu údaje používáme?',
        body: 'Vaše data slouží výhradně k provozu vzdělávací platformy — přihlašování, sledování postupu studia a zobrazování obsahu, na který máte nárok. Data neprodáváme ani nesdílíme s třetími stranami.',
    },
    {
        heading: 'Jak dlouho data uchováváme?',
        body: 'Osobní údaje uchováváme po dobu trvání vašeho účtu. Po smazání účtu jsou data nevratně odstraněna ze systému.',
    },
    {
        heading: 'Vaše práva',
        items: [
            'Právo na přístup ke svým údajům',
            'Právo na opravu nesprávných údajů',
            'Právo na výmaz (právo být zapomenut)',
            'Právo na omezení zpracování',
        ],
    },
    {
        heading: 'Kontakt',
        body: 'Pro uplatnění práv nebo dotazy ke zpracování osobních údajů nás kontaktujte na email@email.email.',
    },
];

export default function GDPR({ user, setUser }) {
    usePageTitle('GDPR');
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
                    <span className={styles.info_label}>Ochrana osobních údajů</span>
                    <h1>GDPR</h1>
                    <p>Vaše soukromí bereme vážně. Přečtěte si, jak nakládáme s vašimi osobními údaji v souladu s nařízením GDPR.</p>
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
