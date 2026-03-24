import Footer from '../../shared/layout/footer/Footer';
import Header from '../../shared/layout/header/Header';
import styles from './info.module.scss';
import { usePageTitle } from '../../hooks/usePageTitle';

function TeamPlaceholder({ name, role, color }) {
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

export default function About({ user, setUser }) {
    usePageTitle('O nás');
    return (
        <div className={styles.about_wrapper}>
            <Header user={user} setUser={setUser} />

            <section className={styles.about_hero}>
                <div className={styles.about_hero_content}>
                    <h1>O nás</h1>
                    <p>
                        Stavíme digitální vrstvu vzdělávání —<br />
                        <span>pevnou a důmyslnou jako bobří hráz.</span>
                    </p>
                </div>
                <div className={styles.about_hero_img}>
                    <div className={styles.placeholder_img}>
                        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="400" height="300" rx="8" fill="rgba(255,255,255,0.04)" />
                            <rect x="16" y="16" width="368" height="268" rx="4" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="6 4" />
                            <circle cx="200" cy="120" r="40" fill="rgba(0,112,187,0.15)" />
                            <circle cx="200" cy="120" r="25" fill="rgba(0,112,187,0.25)" />
                            <path d="M185 120 L200 105 L215 120 L210 120 L210 135 L190 135 L190 120 Z" fill="rgba(0,112,187,0.6)" />
                            <text x="200" y="200" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="13" fontFamily="Dosis, sans-serif">Foto týmu</text>
                        </svg>
                    </div>
                </div>
                <div className={styles.about_hero_ball}></div>
            </section>

            <section className={styles.about_story}>
                <div className={styles.about_story_label}>Náš příběh</div>
                <div className={styles.about_story_content}>
                    <h2>Jak to všechno začalo</h2>
                    <div className={styles.about_story_text}>
                        <p>
                            Založení Teachers Digital Academy nebylo dílem náhody, ale ryzí potřeby. Vše začalo v malé univerzitní laboratoři,
                            kde se parta nadšenců snažila najít způsob, jak efektivněji sdílet studijní materiály a testovat znalosti před
                            nekonečnými zkouškami. Tradiční systémy byly nemotorné, pomalé a chyběla jim duše.
                        </p>
                        <p>
                            A tak jsme se rozhodli vybudovat vlastní platformu. Název "Teachers Digital Academy" vznikl na jedné noční programovací
                            seanci — stavíme <em>vrstvu vědomostí pevnou a důmyslnou jako bobří hráz.</em>
                        </p>
                        <p>
                            Dnes je TdA nástrojem pro moderní lektory a studenty, kteří hledají přehlednost, rychlost a férové prostředí.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.about_values}>
                <div className={styles.about_values_label}>Co nás pohání</div>
                <h2>Naše hodnoty</h2>
                <div className={styles.about_values_grid}>
                    <div className={styles.value_card}>
                        <div className={styles.value_icon} style={{ background: 'linear-gradient(135deg, #0070BB22, #0070BB44)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0070BB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>Přístupnost</h3>
                        <p>Vzdělávání by mělo být dostupné každému — bez ohledu na zázemí nebo zkušenosti.</p>
                    </div>
                    <div className={styles.value_card}>
                        <div className={styles.value_icon} style={{ background: 'linear-gradient(135deg, #49B3B422, #49B3B444)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M9 11l3 3L22 4" stroke="#49B3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#49B3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>Efektivita</h3>
                        <p>Kvízy, materiály a strukturované moduly — vše navrženo tak, abyste se skutečně naučili.</p>
                    </div>
                    <div className={styles.value_card}>
                        <div className={styles.value_icon} style={{ background: 'linear-gradient(135deg, #91F5AD22, #91F5AD44)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#91F5AD" strokeWidth="2" />
                                <path d="M12 8v4l3 3" stroke="#91F5AD" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3>Flexibilita</h3>
                        <p>Učte se svým tempem. Vaše vzdělávání, vaše podmínky, váš plán.</p>
                    </div>
                    <div className={styles.value_card}>
                        <div className={styles.value_icon} style={{ background: 'linear-gradient(135deg, #0257A522, #0257A544)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#0257A5" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="9" cy="7" r="4" stroke="#0257A5" strokeWidth="2" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#0257A5" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3>Komunita</h3>
                        <p>Věříme v sílu sdílení znalostí mezi lektory a studenty.</p>
                    </div>
                </div>
            </section>

            <section className={styles.about_team}>
                <div className={styles.about_team_label}>Tým</div>
                <h2>Kdo za tím stojí</h2>
                <p className={styles.about_team_desc}>
                    Jsme tým studentů SPŠE Pardubice, kteří se rozhodli vytvořit platformu,<br />
                    která by jim samotným pomáhala se učit.
                </p>
                <div className={styles.team_grid}>
                    <TeamPlaceholder
                        name="Richard Hývl"
                        role="Backend developer"
                        color="linear-gradient(135deg, #0070BB, #0257A5)"
                    />
                    <TeamPlaceholder
                        name="Petr Machovec"
                        role="Frontend developer"
                        color="linear-gradient(135deg, #49B3B4, #0070BB)"
                    />
                    <TeamPlaceholder
                        name="Nicolas Weiser"
                        role="UI/UX designer"
                        color="linear-gradient(135deg, #6DD4B1, #49B3B4)"
                    />
                </div>
            </section>

            <section className={styles.about_stats}>
                <div className={styles.stat}>
                    <span className={styles.stat_num}>3</span>
                    <span className={styles.stat_label}>členové týmu</span>
                </div>
                <div className={styles.stat_divider}></div>
                <div className={styles.stat}>
                    <span className={styles.stat_num}>2026</span>
                    <span className={styles.stat_label}>rok vzniku</span>
                </div>
                <div className={styles.stat_divider}></div>
                <div className={styles.stat}>
                    <span className={styles.stat_num}>∞</span>
                    <span className={styles.stat_label}>vrstev vědomostí</span>
                </div>
            </section>

            <Footer user={user} setUser={setUser} />
        </div>
    );
}
