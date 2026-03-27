import { useEffect, useRef } from 'react';
import Footer from '../../shared/layout/footer/Footer';
import Header from '../../shared/layout/header/Header';
import styles from './info.module.scss';
import { usePageTitle } from '../../hooks/usePageTitle';

function TeamCard({ name, role, color }) {
    return (
        <div className={styles.team_card}>
            <div className={styles.team_avatar} style={{ background: color }}>
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="30" r="16" fill="rgba(255,255,255,0.3)" />
                    <ellipse cx="40" cy="68" rx="24" ry="16" fill="rgba(255,255,255,0.2)" />
                </svg>
            </div>
            <div className={styles.team_info}>
                <h3>{name}</h3>
                <p>{role}</p>
            </div>
        </div>
    );
}

const VALUES = [
    {
        label: 'Přístupnost',
        text: 'Vzdělávání by mělo být dostupné každému — bez ohledu na zázemí nebo zkušenosti.',
        color: '#0070BB',
        bg: 'rgba(0,112,187,0.12)',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0070BB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        label: 'Efektivita',
        text: 'Kvízy, materiály a strukturované moduly — vše navrženo tak, abyste se skutečně naučili.',
        color: '#49B3B4',
        bg: 'rgba(73,179,180,0.12)',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="#49B3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#49B3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        label: 'Flexibilita',
        text: 'Učte se svým tempem. Vaše vzdělávání, vaše podmínky, váš plán.',
        color: '#91F5AD',
        bg: 'rgba(145,245,173,0.10)',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#91F5AD" strokeWidth="2" />
                <path d="M12 8v4l3 3" stroke="#91F5AD" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: 'Komunita',
        text: 'Věříme v sílu sdílení znalostí mezi lektory a studenty.',
        color: '#0257A5',
        bg: 'rgba(2,87,165,0.12)',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#0257A5" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" stroke="#0257A5" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#0257A5" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
];

export default function About({ user, setUser }) {
    usePageTitle('O nás');
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
        <div className={styles.about_wrapper}>
            <Header user={user} setUser={setUser} />

            {/* ── Hero ── */}
            <section className={styles.about_hero}>
                <div className={styles.about_hero_content}>
                    <span className={styles.about_label}>Tým Bobr Layer · SPŠE Pardubice</span>
                    <h1>Stavíme digitální<br />vrstvu vzdělávání</h1>
                    <p>Pevnou a důmyslnou jako bobří hráz.</p>
                </div>
                <div className={styles.about_hero_ball} />
            </section>

            <hr className={styles.about_rule} />

            {/* ── Stats ── */}
            <section className={styles.about_stats}>
                {[
                    { num: '3', label: 'členové týmu' },
                    { num: '2026', label: 'rok vzniku' },
                    { num: '∞', label: 'vrstev vědomostí' },
                ].map((s, i) => (
                    <div key={i} {...reveal(i * 0.1)} className={`${styles.reveal} ${styles.stat}`} style={{ '--delay': `${i * 0.1}s` }} ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}>
                        <span className={styles.stat_num}>{s.num}</span>
                        <span className={styles.stat_label}>{s.label}</span>
                    </div>
                ))}
            </section>

            <hr className={styles.about_rule} />

            {/* ── Story ── */}
            <section className={styles.about_story}>
                <div {...reveal(0)} className={`${styles.reveal} ${styles.about_story_label}`} ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}>Náš příběh</div>
                <div className={styles.about_story_content}>
                    <div {...reveal(0.1)} className={`${styles.reveal}`} ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}>
                        <h2>Jak to všechno začalo</h2>
                    </div>
                    <div className={styles.about_story_text}>
                        {[
                            'Založení Teachers Digital Academy nebylo dílem náhody, ale ryzí potřeby. Vše začalo v malé univerzitní laboratoři, kde se parta nadšenců snažila najít způsob, jak efektivněji sdílet studijní materiály a testovat znalosti před nekonečnými zkouškami.',
                            'Tradiční systémy byly nemotorné, pomalé a chyběla jim duše. A tak jsme se rozhodli vybudovat vlastní platformu — stavíme vrstvu vědomostí pevnou a důmyslnou jako bobří hráz.',
                            'Dnes je TdA nástrojem pro moderní lektory a studenty, kteří hledají přehlednost, rychlost a férové prostředí.',
                        ].map((p, i) => (
                            <p key={i} {...reveal(0.1 + i * 0.1)} className={`${styles.reveal}`} ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}>{p}</p>
                        ))}
                    </div>
                </div>
            </section>

            <hr className={styles.about_rule} />

            {/* ── Values ── */}
            <section className={styles.about_values}>
                <span className={styles.about_story_label}>Co nás pohání</span>
                <h2>Naše hodnoty</h2>
                <div className={styles.about_values_grid}>
                    {VALUES.map((v, i) => (
                        <div
                            key={i}
                            className={`${styles.reveal} ${styles.value_card}`}
                            style={{ '--delay': `${i * 0.08}s` }}
                            ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}
                        >
                            <div className={styles.value_icon} style={{ background: v.bg }}>
                                {v.icon}
                            </div>
                            <h3>{v.label}</h3>
                            <p>{v.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <hr className={styles.about_rule} />

            {/* ── Team ── */}
            <section className={styles.about_team}>
                <span className={styles.about_story_label}>Tým</span>
                <h2>Kdo za tím stojí</h2>
                <p className={styles.about_team_desc}>
                    Jsme tým studentů SPŠE Pardubice, kteří se rozhodli vytvořit platformu,
                    která by jim samotným pomáhala se učit.
                </p>
                <div className={styles.team_grid}>
                    {[
                        { name: 'Richard Hývl', role: 'Backend developer', color: 'linear-gradient(135deg, #0070BB, #0257A5)' },
                        { name: 'Petr Machovec', role: 'Frontend developer', color: 'linear-gradient(135deg, #49B3B4, #0070BB)' },
                        { name: 'Nicolas Weiser', role: 'UI/UX designer', color: 'linear-gradient(135deg, #6DD4B1, #49B3B4)' },
                    ].map((m, i) => (
                        <div
                            key={i}
                            className={`${styles.reveal}`}
                            style={{ '--delay': `${i * 0.1}s` }}
                            ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}
                        >
                            <TeamCard {...m} />
                        </div>
                    ))}
                </div>
            </section>

            <Footer user={user} setUser={setUser} />
        </div>
    );
}
