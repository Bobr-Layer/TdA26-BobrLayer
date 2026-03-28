import { useEffect, useRef } from 'react';
import Footer from '../../shared/layout/footer/Footer';
import Header from '../../shared/layout/header/Header';
import styles from './info.module.scss';
import { usePageTitle } from '../../hooks/usePageTitle';
import SupportTicketForm from '../../shared/support-ticket-form/SupportTicketForm';

export default function Contact({ user, setUser }) {
    usePageTitle('Kontakt');
    const revealRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.revealed)),
            { threshold: 0.12 }
        );
        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const reveal = (delay = 0) => ({
        ref: el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); },
        className: styles.reveal,
        style: { '--delay': `${delay}s` },
    });

    return (
        <div className={styles.info_wrapper}>
            <Header user={user} setUser={setUser} />

            <section className={styles.info_hero}>
                <div className={styles.info_hero_content}>
                    <span className={styles.info_label}>Kontakt</span>
                    <h1>Jsme tu pro vás</h1>
                    <p>Máte otázku, návrh nebo potřebujete pomoc? Neváhejte se ozvat — rádi vám odpovíme.</p>
                </div>
                <div className={styles.info_hero_ball} />
            </section>

            <hr className={styles.info_rule} />

            <section className={styles.info_section}>
                <span {...reveal(0)} className={`${styles.reveal} ${styles.info_label}`} ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}>Spojte se s námi</span>
                <h2 {...reveal(0.05)} className={styles.reveal} ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}>Kontaktní údaje</h2>
                <div className={styles.info_contact_grid}>
                    <div
                        className={`${styles.reveal} ${styles.info_contact_card}`}
                        style={{ '--delay': '0.1s' }}
                        ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}
                    >
                        <div className={styles.info_contact_icon} style={{ background: 'rgba(0,112,187,0.15)' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#0070BB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="22,6 12,13 2,6" stroke="#0070BB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className={styles.info_contact_label}>E-mail</span>
                        <span className={styles.info_contact_value}>
                            <a href="mailto:support@tda-hq.com">support@tda-hq.com</a>
                        </span>
                    </div>
                    <div
                        className={`${styles.reveal} ${styles.info_contact_card}`}
                        style={{ '--delay': '0.18s' }}
                        ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}
                    >
                        <div className={styles.info_contact_icon} style={{ background: 'rgba(73,179,180,0.15)' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#49B3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className={styles.info_contact_label}>Telefon</span>
                        <span className={styles.info_contact_value}>
                            <a href="tel:+420123456789">+420 123 456 789</a>
                        </span>
                    </div>
                </div>
            </section>

            <SupportTicketForm />

            <Footer user={user} setUser={setUser} />
        </div>
    );
}
